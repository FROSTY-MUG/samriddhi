"""
app.py — SamriddhiAI Production FastAPI Application
====================================================
This is the main entry point for the backend. It wires together:
  - CORS (locked to the Vercel frontend origin)
  - Global rate limiting via SlowAPI + Redis
  - Authentication router (OTP + JWT)
  - Scheme filtering router
  - Aggregator router
  - Health checks

Run with: uvicorn app:app --host 0.0.0.0 --port 8000 --reload
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from contextlib import asynccontextmanager

from config import get_settings
from routers.auth import router as auth_router
from routers.schemes import router as schemes_router
from services.aggregator import router as aggregator_router

settings = get_settings()


# ========================= Rate Limiter Setup =========================
# Uses async Redis as the backend store for distributed rate limiting
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri=settings.REDIS_URL,
    default_limits=["100/minute"],  # Global default: 100 requests/min per IP
)


# ========================= Application Lifecycle =========================
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown hooks for background services."""
    print("[SamriddhiAI] Backend engine starting...")
    print(f"[SamriddhiAI] Environment: {settings.APP_ENV}")
    print(f"[SamriddhiAI] Frontend CORS Origin: {settings.FRONTEND_URL}")
    yield
    print("[SamriddhiAI] Backend engine shutting down...")


# ========================= FastAPI App Instance =========================
app = FastAPI(
    title="SamriddhiAI Core API",
    description=(
        "Production backend for AI-Driven Scheme Matching & Channel Finance Routing. "
        "Serves the React frontend with OTP authentication, scheme filtering, "
        "PostGIS geo-routing, and secure dossier generation."
    ),
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.APP_ENV == "development" else None,  # Disable Swagger in production
    redoc_url="/redoc" if settings.APP_ENV == "development" else None,
)


# ========================= Middleware =========================

# 1. CORS — Lock down to the Vercel frontend origin only
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",  # Local Vite dev server
        "http://localhost:3000",  # Fallback local dev
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# 2. Rate Limiter — Attach SlowAPI to the FastAPI app
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# ========================= Register Routers =========================

# Auth: OTP send/verify + JWT issuance
app.include_router(auth_router)

# Schemes: Dynamic eligibility filtering against PostgreSQL
app.include_router(schemes_router)

# Aggregator: Background scraping of government portals
app.include_router(aggregator_router)


# ========================= Root & Health Endpoints =========================

@app.get("/", tags=["System"])
async def root():
    """Root endpoint — confirms the API is alive."""
    return {
        "service": "SamriddhiAI Core API",
        "version": "2.0.0",
        "status": "operational",
        "docs": "/docs" if settings.APP_ENV == "development" else "disabled in production",
    }


@app.get("/health", tags=["System"])
async def health_check():
    """
    Health check endpoint for Railway/Render deployment monitoring.
    Returns the status of all connected services.
    """
    import redis.asyncio as aioredis

    health = {
        "api": "healthy",
        "database": "unknown",
        "redis": "unknown",
    }

    # Check Redis connectivity
    try:
        r = aioredis.from_url(settings.REDIS_URL)
        await r.ping()
        health["redis"] = "connected"
        await r.close()
    except Exception:
        health["redis"] = "disconnected"

    # Check PostgreSQL connectivity
    try:
        from database import engine
        async with engine.connect() as conn:
            await conn.execute("SELECT 1")
        health["database"] = "connected (PostGIS active)"
    except Exception:
        health["database"] = "disconnected"

    return health


# ========================= Custom Error Handlers =========================

@app.exception_handler(429)
async def rate_limit_handler(request: Request, exc):
    """Custom response for rate-limited requests."""
    return JSONResponse(
        status_code=429,
        content={
            "error": "rate_limit_exceeded",
            "detail": "Too many requests. Please slow down.",
            "retry_after": "60 seconds",
        },
    )
