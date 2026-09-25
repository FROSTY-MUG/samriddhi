import os
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """
    Centralized configuration loaded from environment variables.
    Supabase, Redis, JWT, and SMS gateway credentials are all injected here.
    """

    # --- Supabase / PostgreSQL ---
    SUPABASE_URL: str = os.environ.get("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.environ.get("SUPABASE_KEY", "")
    # Direct PostgreSQL connection string for SQLAlchemy async sessions
    DATABASE_URL: str = os.environ.get(
        "DATABASE_URL",
        "postgresql+asyncpg://postgres:password@localhost:5432/samriddhiai"
    )

    # --- Redis (OTP store + Rate Limiter backend) ---
    REDIS_URL: str = os.environ.get("REDIS_URL", "redis://localhost:6379/0")

    # --- JWT Auth ---
    JWT_SECRET: str = os.environ.get("JWT_SECRET", "samriddhiai-super-secret-key-change-in-prod")
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRY_MINUTES: int = 60  # Token valid for 1 hour

    # --- SMS Gateway (Fast2SMS / Twilio) ---
    SMS_API_KEY: str = os.environ.get("SMS_API_KEY", "")
    SMS_PROVIDER: str = os.environ.get("SMS_PROVIDER", "mock")  # "fast2sms" | "twilio" | "mock"

    # --- CORS (Vercel frontend origin) ---
    FRONTEND_URL: str = os.environ.get("FRONTEND_URL", "http://localhost:5173")

    # --- App ---
    APP_ENV: str = os.environ.get("APP_ENV", "development")
    PORT: int = int(os.environ.get("PORT", "8000"))

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    """Cached singleton for app-wide settings access."""
    return Settings()
