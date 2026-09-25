"""
routers/kyc.py — API Setu / DigiLocker Mock KYC Integration
============================================================
Simulates the DigiLocker OAuth2 callback flow for SIH demo.
Returns a verified citizen profile after a simulated government 
identity verification.

CRITICAL SECURITY RULE:
  Never generate or store fake 12-digit Aadhaar numbers.
  All national ID fields use explicit redaction placeholders.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional
from dependencies import get_current_user
import datetime
import uuid

router = APIRouter(prefix="/api/v1/kyc", tags=["KYC & DigiLocker"])


# ========================= Models =========================

class DigiLockerRequest(BaseModel):
    """Simulates the initial DigiLocker authorization request."""
    mobile: str = Field(..., pattern=r"^[6-9]\d{9}$")
    consent: bool = Field(..., description="User consent for data sharing")

class VerifiedProfile(BaseModel):
    """Verified citizen profile returned from DigiLocker callback."""
    verification_id: str
    full_name: str
    date_of_birth: str
    gender: str
    aadhaar_reference: str = "XXXX-XXXX-XXXX"  # ALWAYS redacted
    pan_reference: str = "XXXXX****X"           # ALWAYS redacted
    category: str  # SC / ST / OBC / GEN
    category_certificate_status: str  # verified / pending / not_found
    income_band: str  # e.g., "Below ₹3,00,000"
    income_verified: bool
    address_state: str
    address_district: str
    kyc_timestamp: str
    source: str = "API Setu — DigiLocker (Mock)"

class KYCStatusResponse(BaseModel):
    status: str
    message: str
    profile: Optional[VerifiedProfile] = None


# ========================= Mock Profile Database =========================

MOCK_PROFILES = {
    "9876543210": VerifiedProfile(
        verification_id=str(uuid.uuid4()),
        full_name="Ravi Shankar Kumar",
        date_of_birth="1988-03-15",
        gender="M",
        aadhaar_reference="XXXX-XXXX-XXXX",
        pan_reference="ABCPK****R",
        category="SC",
        category_certificate_status="verified",
        income_band="Below ₹3,00,000",
        income_verified=True,
        address_state="Uttar Pradesh",
        address_district="Lucknow",
        kyc_timestamp=datetime.datetime.utcnow().isoformat(),
    ),
    "9123456789": VerifiedProfile(
        verification_id=str(uuid.uuid4()),
        full_name="Sunita Devi",
        date_of_birth="1992-07-22",
        gender="F",
        aadhaar_reference="XXXX-XXXX-XXXX",
        pan_reference="DEFPS****K",
        category="SC",
        category_certificate_status="verified",
        income_band="Below ₹2,00,000",
        income_verified=True,
        address_state="Bihar",
        address_district="Patna",
        kyc_timestamp=datetime.datetime.utcnow().isoformat(),
    ),
}


# ========================= Endpoints =========================

@router.post("/digilocker-initiate", response_model=dict)
async def initiate_digilocker(body: DigiLockerRequest):
    """
    Step 1: Initiate the DigiLocker OAuth flow.
    In production, this would redirect to DigiLocker's authorization URL.
    For SIH demo, we simulate the consent and return a mock auth code.
    """
    if not body.consent:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User consent is required to proceed with DigiLocker verification.",
        )

    return {
        "status": "redirect",
        "message": "Redirecting to DigiLocker for identity verification...",
        "mock_auth_code": f"DL-AUTH-{uuid.uuid4().hex[:8].upper()}",
        "redirect_url": "https://digilocker.gov.in/authorize (Simulated)",
    }


@router.post("/digilocker-callback", response_model=KYCStatusResponse)
async def digilocker_callback(body: DigiLockerRequest):
    """
    Step 2: Simulate the DigiLocker OAuth callback.
    In production, this receives the authorization code from DigiLocker,
    exchanges it for an access token, and fetches the citizen's documents.
    
    For SIH demo, we return a pre-verified mock profile.
    
    SECURITY: All Aadhaar/PAN fields are explicitly redacted.
    """
    mobile = body.mobile

    if mobile in MOCK_PROFILES:
        profile = MOCK_PROFILES[mobile]
        # Update timestamp for fresh verification
        profile.verification_id = str(uuid.uuid4())
        profile.kyc_timestamp = datetime.datetime.utcnow().isoformat()

        return KYCStatusResponse(
            status="verified",
            message="Identity verified successfully via API Setu / DigiLocker.",
            profile=profile,
        )

    # For any unrecognized number, return a generic verified profile
    return KYCStatusResponse(
        status="verified",
        message="Identity verified successfully via API Setu / DigiLocker.",
        profile=VerifiedProfile(
            verification_id=str(uuid.uuid4()),
            full_name="Verified Citizen",
            date_of_birth="1990-01-01",
            gender="M",
            aadhaar_reference="XXXX-XXXX-XXXX",
            pan_reference="XXXXX****X",
            category="SC",
            category_certificate_status="verified",
            income_band="Below ₹5,00,000",
            income_verified=True,
            address_state="Not Specified",
            address_district="Not Specified",
            kyc_timestamp=datetime.datetime.utcnow().isoformat(),
        ),
    )


@router.get("/status/{mobile}", response_model=KYCStatusResponse)
async def check_kyc_status(mobile: str, user=Depends(get_current_user)):
    """Check KYC verification status for an authenticated user."""
    if mobile in MOCK_PROFILES:
        return KYCStatusResponse(
            status="verified",
            message="KYC is complete.",
            profile=MOCK_PROFILES[mobile],
        )
    return KYCStatusResponse(
        status="pending",
        message="KYC verification not yet completed.",
    )
