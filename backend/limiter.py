"""
limiter.py — Centralized SlowAPI Limiter Instance
===================================================
Provides distributed rate limiting using Redis when available,
with graceful fallback to in-memory tracking if Redis is unreachable.
Ensures zero runtime crashes during local evaluation or network dips.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address
from config import get_settings

settings = get_settings()


def initialize_limiter() -> Limiter:
    """
    Checks Redis connectivity. If connected, uses Redis as storage backend;
    otherwise gracefully falls back to 'memory://' to prevent 500 errors.
    """
    storage_uri = settings.REDIS_URL
    try:
        import redis
        client = redis.from_url(settings.REDIS_URL, socket_timeout=0.5)
        client.ping()
        print(f"[RateLimiter] Successfully connected to Redis storage: {settings.REDIS_URL}")
    except Exception as exc:
        print(f"[RateLimiter] Redis not reachable ({exc}). Falling back to high-performance in-memory limiter.")
        storage_uri = "memory://"

    return Limiter(
        key_func=get_remote_address,
        storage_uri=storage_uri,
        default_limits=["100/minute"],
    )


# App-wide singleton rate limiter
limiter = initialize_limiter()
