"""
routers/auth.py — OTP-Based Authentication Router
Implements the complete mobile OTP login flow:
  1. User sends their mobile number → we generate a 6-digit OTP → store in Redis with 5-min TTL → send via SMS
  2. User submits OTP → we verify against Redis → if valid, issue a signed JWT access token

Rate-limited to 3 OTP requests per minute to prevent abuse.
"""
from fastapi import APIRouter, HTTPException, Request, status
from pydantic import BaseModel, Field
from slowapi import Limiter
from slowapi.util import get_remote_address
import jwt
import random
import datetime
import redis.asyncio as aioredis
from config import get_settings

settings = get_settings()
router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# Initialize the rate limiter (shares the same instance with app.py)
limiter = Limiter(key_func=get_remote_address, storage_uri=settings.REDIS_URL)

# Async Redis client for OTP storage
redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)


# ========================= Request / Response Models =========================

class OTPRequest(BaseModel):
    """Payload for requesting an OTP."""
    mobile: str = Field(
        ...,
        pattern=r"^[6-9]\d{9}$",
        description="10-digit Indian mobile number starting with 6-9",
        examples=["9876543210"],
    )

class OTPVerifyRequest(BaseModel):
    """Payload for verifying an OTP and receiving a JWT."""
    mobile: str = Field(..., pattern=r"^[6-9]\d{9}$")
    otp: str = Field(..., min_length=6, max_length=6, description="6-digit OTP")

class TokenResponse(BaseModel):
    """JWT access token returned on successful OTP verification."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int


# ========================= SMS Gateway (Pluggable) =========================

async def send_sms(mobile: str, otp: str):
    """
    Send the OTP via SMS. Supports multiple providers:
    - 'mock': Logs to console (for development and SIH demo)
    - 'fast2sms': Uses Fast2SMS API (Indian SMS gateway)
    - 'twilio': Uses Twilio REST API
    """
    if settings.SMS_PROVIDER == "mock":
        # ========== DEMO MODE: Print OTP to console ==========
        print(f"\n{'='*50}")
        print(f"  [MOCK SMS] OTP for +91-{mobile}: {otp}")
        print(f"{'='*50}\n")
        return True

    elif settings.SMS_PROVIDER == "fast2sms":
        import httpx
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://www.fast2sms.com/dev/bulkV2",
                params={
                    "authorization": settings.SMS_API_KEY,
                    "route": "otp",
                    "variables_values": otp,
                    "numbers": mobile,
                },
            )
            return response.status_code == 200

    elif settings.SMS_PROVIDER == "twilio":
        # Twilio integration placeholder
        print(f"[TWILIO] Would send OTP {otp} to +91{mobile}")
        return True

    return False


# ========================= Endpoints =========================

@router.post("/send-otp", status_code=status.HTTP_200_OK)
@limiter.limit("3/minute")  # Strict rate limit: 3 OTP requests per minute per IP
async def send_otp(request: Request, body: OTPRequest):
    """
    Step 1: Generate a 6-digit OTP, store it in Redis with a 5-minute TTL,
    and dispatch it via the configured SMS gateway.
    """
    mobile = body.mobile

    # Check if an OTP was recently sent (prevent spam within 30 seconds)
    existing_ttl = await redis_client.ttl(f"otp:{mobile}")
    if existing_ttl > 270:  # More than 4.5 minutes remaining = sent within last 30 seconds
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="OTP was sent recently. Please wait 30 seconds before requesting again.",
        )

    # Generate a cryptographically random 6-digit OTP
    otp = str(random.randint(100000, 999999))

    # Store in Redis with a 5-minute (300 second) expiry
    await redis_client.setex(f"otp:{mobile}", 300, otp)

    # Send via SMS gateway
    sms_sent = await send_sms(mobile, otp)

    if not sms_sent:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to send OTP via SMS. Please try again.",
        )

    return {
        "status": "success",
        "message": f"OTP sent to +91-{mobile[:2]}****{mobile[-2:]}",
        "expires_in": 300,
    }


@router.post("/verify-otp", response_model=TokenResponse)
@limiter.limit("5/minute")  # Allow 5 verification attempts per minute
async def verify_otp(request: Request, body: OTPVerifyRequest):
    """
    Step 2: Validate the submitted OTP against Redis.
    If valid → delete the OTP from Redis and return a signed JWT access token.
    If invalid → return 401.
    """
    mobile = body.mobile
    submitted_otp = body.otp

    # Retrieve the stored OTP from Redis
    stored_otp = await redis_client.get(f"otp:{mobile}")

    if stored_otp is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="OTP has expired or was never requested. Please request a new OTP.",
        )

    if stored_otp != submitted_otp:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid OTP. Please check and try again.",
        )

    # OTP is valid — delete it from Redis (one-time use)
    await redis_client.delete(f"otp:{mobile}")

    # Generate a signed JWT access token
    expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=settings.JWT_EXPIRY_MINUTES)
    payload = {
        "sub": mobile,                        # Subject: the user's mobile number
        "iat": datetime.datetime.utcnow(),    # Issued at
        "exp": expiry,                        # Expiry time
        "iss": "samriddhiai",                 # Issuer
    }
    token = jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)

    return TokenResponse(
        access_token=token,
        expires_in=settings.JWT_EXPIRY_MINUTES * 60,  # Return in seconds
    )
