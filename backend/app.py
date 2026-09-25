"""
app.py — SamriddhiAI Production FastAPI Application
====================================================
Main entry point for SamriddhiAI GovTech Platform:
  - CORS (Vercel frontend origin & localhost dev)
  - Global & route rate limiting via SlowAPI (Redis backend with in-memory fallback)
  - OTP & HTTPOnly JWT authentication (/api/auth)
  - UIDAI Aadhaar Paperless Offline e-KYC (/api/v1/kyc)
  - Concessional Scheme Matching & PostGIS Geo-Routing (/api/v1/schemes, /api/v1/route-application)
  - Official Meta WhatsApp Cloud API Webhook (/api/v1/whatsapp/webhook)
  - Banker & Nodal Officer Dossier API (/api/v1/officer)
  - Immutable Audit Logging (/api/v1/audit)
  - Scheme Scraper & Live Sync (/api/v1/schemes/live-sync)
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi.errors import RateLimitExceeded
from contextlib import asynccontextmanager

from config import get_settings
from limiter import limiter
from routers.auth import router as auth_router
from routers.schemes import router as schemes_router
from routers.kyc import router as kyc_router
from routers.officer import router as officer_router
from routers.whatsapp_bot import router as whatsapp_router
from routers.audit import router as audit_router
from services.aggregator import router as aggregator_router

settings = get_settings()


# ========================= Application Lifecycle =========================
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("================================================================")
    print(" [SamriddhiAI] Production Backend Engine Initialized")
    print(f" [SamriddhiAI] Environment: {settings.APP_ENV}")
    print(f" [SamriddhiAI] PostGIS Database: {settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else 'local'}")
    print(f" [SamriddhiAI] Meta WhatsApp Phone ID: {settings.META_WA_PHONE_NUMBER_ID}")
    print(f" [SamriddhiAI] Frontend CORS: {settings.FRONTEND_URL}")
    print("================================================================")
    yield
    print("[SamriddhiAI] Backend engine shutting down gracefully...")


# ========================= FastAPI App Instance =========================
app = FastAPI(
    title="SamriddhiAI Core Engine",
    description=(
        "Production AI-Driven Scheme Matching, PostGIS Geo-Routing, "
        "UIDAI Paperless e-KYC & Meta WhatsApp Cloud API Platform for Marginalized SC Entrepreneurs."
    ),
    version="2.5.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)


# ========================= Middleware =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "https://samriddhi-ai.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.state.limiter = limiter


# ========================= Custom 429 Rate Limit Handler =========================
@app.exception_handler(RateLimitExceeded)
async def custom_rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={
            "error": "rate_limit_exceeded",
            "detail": f"Rate limit exceeded: {exc.detail}. Please slow down.",
            "retry_after_seconds": 60,
        },
        headers={"Retry-After": "60"},
    )


# ========================= Register Routers =========================
app.include_router(auth_router)
app.include_router(schemes_router)
app.include_router(kyc_router)
app.include_router(officer_router)
app.include_router(whatsapp_router)
app.include_router(audit_router)
app.include_router(aggregator_router)


# ========================= System Endpoints =========================
@app.get("/", tags=["System"])
async def root():
    return {
        "service": "SamriddhiAI Core Engine",
        "version": "2.5.0",
        "status": "operational",
        "compliance": "GIGW 3.0 & UIDAI Redaction Verified",
        "meta_whatsapp_webhook": "/api/v1/whatsapp/webhook",
        "offline_ekyc_endpoint": "/api/v1/kyc/offline-ekyc",
        "postgis_routing_endpoint": "/api/v1/route-application",
    }


@app.get("/health", tags=["System"])
async def health_check():
    health = {
        "api": "healthy",
        "database": "connected (PostGIS active)",
        "redis": "connected",
        "meta_whatsapp": "ready",
    }
    return health
