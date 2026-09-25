"""
dependencies.py — Reusable FastAPI dependencies for authentication & security.
Extracts and validates JWT tokens from either:
  1. Authorization Header ("Bearer <token>")
  2. Secure HTTPOnly Cookie ("access_token")
"""
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
import jwt
from config import get_settings

settings = get_settings()

bearer_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> dict:
    """
    Dependency: Extracts and validates the JWT from Authorization header or HTTPOnly cookie.
    Returns dictionary with {"mobile": str, "payload": dict}.
    """
    token: Optional[str] = None

    # Priority 1: Bearer header
    if credentials is not None:
        token = credentials.credentials

    # Priority 2: HTTPOnly Cookie
    if not token and request.cookies:
        token = request.cookies.get("access_token")

    if not token:
        # For development / SIH demo convenience, check for query param demo token
        demo_header = request.headers.get("X-Demo-User")
        if demo_header:
            return {"mobile": demo_header, "payload": {"sub": demo_header, "role": "officer"}}
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please login with OTP.",
            headers={"WWW-Authenticate": "Bearer"},
        )

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
