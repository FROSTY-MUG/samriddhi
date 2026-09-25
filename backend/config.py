import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """
    Centralized configuration loaded from environment variables.
    Supabase, PostGIS, Redis, JWT, and Meta WhatsApp Cloud API credentials.
    """

    # --- Supabase / PostgreSQL ---
    SUPABASE_URL: str = os.environ.get("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.environ.get("SUPABASE_KEY", "")
    
    # Direct PostgreSQL connection string for SQLAlchemy async sessions
    DATABASE_URL: str = os.environ.get(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres:postgres@localhost:5432/samriddhiai"
    )

    # --- Redis (OTP store + Rate Limiter backend) ---
    REDIS_URL: str = os.environ.get("REDIS_URL", "redis://localhost:6379/0")

    # --- JWT Auth ---
    JWT_SECRET: str = os.environ.get("JWT_SECRET", "samriddhiai-super-secret-key-change-in-prod-sih2026")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_MINUTES: int = 60  # Token valid for 1 hour

    # --- Meta WhatsApp Cloud API (Graph API v17.0+) ---
    META_WA_PHONE_NUMBER_ID: str = os.environ.get("META_WA_PHONE_NUMBER_ID", "100654321098765")
    META_WA_ACCESS_TOKEN: str = os.environ.get("META_WA_ACCESS_TOKEN", "EAAX...MOCK_TOKEN_FOR_DEV")
    META_WA_VERIFY_TOKEN: str = os.environ.get("META_WA_VERIFY_TOKEN", "samriddhi_meta_verify_token_2026")
    META_WA_API_VERSION: str = os.environ.get("META_WA_API_VERSION", "v17.0")

    # --- SMS Gateway (Fast2SMS / Twilio / Mock) ---
    SMS_API_KEY: str = os.environ.get("SMS_API_KEY", "")
    SMS_PROVIDER: str = os.environ.get("SMS_PROVIDER", "mock")

    # --- CORS (Vercel frontend origin) ---
    FRONTEND_URL: str = os.environ.get("FRONTEND_URL", "http://localhost:5173")

    # --- App ---
    APP_ENV: str = os.environ.get("APP_ENV", "development")
    PORT: int = int(os.environ.get("PORT", "8000"))

    class Config:
        env_file = ".env"
        extra = "allow"


@lru_cache()
def get_settings() -> Settings:
    """Cached singleton for app-wide settings access."""
    return Settings()
