"""
dependencies.py — Reusable FastAPI dependencies for authentication.
Provides `get_current_user` which verifies the JWT token from the
Authorization header on every protected route.
"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from config import get_settings

settings = get_settings()

# FastAPI security scheme that extracts the Bearer token from the header
bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
) -> dict:
    """
    Dependency: Extracts and validates the JWT from the Authorization header.
    Returns the decoded payload (contains `sub` = mobile number, `exp` = expiry).
    
    Raises HTTP 401 if:
      - No token is provided
      - Token is expired
      - Token signature is invalid
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please login with OTP.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
        mobile: str = payload.get("sub")
        if mobile is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing subject claim.",
            )
        return {"mobile": mobile, "payload": payload}

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please login again.",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token.",
        )
