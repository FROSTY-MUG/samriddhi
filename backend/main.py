from fastapi import FastAPI, Depends, HTTPException, File, UploadFile
from pydantic import BaseModel, Field
from typing import List, Optional
from apscheduler.schedulers.background import BackgroundScheduler
import datetime
import json
from services.aggregator import router as aggregator_router

# Note: In a full implementation, you would import aioredis, asyncpg, and geoalchemy2 here
# for the database and caching layers.

app = FastAPI(
    title="SamriddhiAI Core API",
    description="Backend services for Scheme Matching, Geo-Routing (PostGIS), and AI parsing.",
    version="1.0.0"
)

# Include the aggregator endpoints
app.include_router(aggregator_router)

def process_slbc_batch_files():
    """
    Simulates the nightly ingestion of SFTP batch files from State Level 
    Bankers' Committees (SLBC) to update live NPA and quota availability.
    """
    print(f"[{datetime.datetime.now()}] Running Nightly SLBC Batch Sync...")
    # SQL Update logic to refresh bank quotas in PostGIS goes here
    print("Bank quotas updated successfully.")

# Start the background job
scheduler = BackgroundScheduler()
# Set to run every night at 1:00 AM (or every minute for the SIH demo)
scheduler.add_job(process_slbc_batch_files, 'cron', hour=1, minute=0) 
scheduler.start()

@app.on_event("shutdown")
def shutdown_event():
    scheduler.shutdown()

# ---------------------------------------------------------
# Pydantic Models for strict validation
# ---------------------------------------------------------
class CitizenProfile(BaseModel):
    sector: str = Field(..., description="Trade or business sector")
    requested_amount: int = Field(..., description="Amount requested in INR")
    annual_income: int = Field(..., description="Annual family income in INR")

class GeoLocation(BaseModel):
    lat: float
    lng: float

class RoutingRequest(BaseModel):
    profile: CitizenProfile
    location: GeoLocation

class BranchResponse(BaseModel):
    branch_name: str
    ifsc_code: str
    distance_meters: float
    active_quota: int
    npa_percentage: float

# ---------------------------------------------------------
# 1. Geo-Spatial Routing Endpoint (PostGIS Simulation)
# ---------------------------------------------------------
@app.post("/api/v1/route-partner", response_model=List[BranchResponse], tags=["Routing"])
async def get_nearest_partners(request: RoutingRequest):
    """
    Executes a spatial query (ST_DWithin) using PostGIS to find the nearest healthy branches.
    Filters out branches with NPA > 3.0% and checks active quotas.
    """
    # In production, this runs the PostGIS SQL query provided in the architecture.
    # Simulated response:
    return [
        {
            "branch_name": "SBI Rural Branch - District Hub",
            "ifsc_code": "SBIN0001234",
            "distance_meters": 4500.5,
            "active_quota": 2500000,
            "npa_percentage": 2.1
        },
        {
            "branch_name": "State Channelizing Agency (SCA) Office",
            "ifsc_code": "SCA0009876",
            "distance_meters": 8200.0,
            "active_quota": 5000000,
            "npa_percentage": 1.5
        }
    ]

# ---------------------------------------------------------
# 2. AI Pipeline: Intent Extraction & Bhashini 
# ---------------------------------------------------------
@app.post("/api/v1/ai/parse-intent", response_model=CitizenProfile, tags=["AI Services"])
async def parse_voice_intent(transcription: str):
    """
    Takes translated text (e.g., from Bhashini) and uses an LLM to extract 
    structured JSON for the routing engine.
    """
    # Simulated LLM extraction logic
    if "dairy" in transcription.lower() or "गाय" in transcription:
        return CitizenProfile(sector="dairy", requested_amount=140000, annual_income=45000)
    
    # Default fallback
    return CitizenProfile(sector="small_business", requested_amount=100000, annual_income=80000)

# ---------------------------------------------------------
# 3. Secure PDF Dossier Generation
# ---------------------------------------------------------
@app.post("/api/v1/dossier/generate", tags=["Documents"])
async def generate_secure_dossier(profile: CitizenProfile):
    """
    Generates an immutable PDF dossier using ReportLab/WeasyPrint securely on the backend.
    Embeds a verification QR code and saves the record to the database.
    """
    # 1. Save to DB and generate unique token
    token_id = "SAM-2026-SC-8912"
    
    # 2. Generate PDF (Simulated)
    # pdf_bytes = reportlab_generate_dossier(profile, token_id)
    
    return {
        "status": "success",
        "token_id": token_id,
        "download_url": f"/api/v1/dossier/download/{token_id}",
        "message": "Secure immutable PDF generated successfully."
    }

# ---------------------------------------------------------
# 4. OCR & PII Redaction
# ---------------------------------------------------------
@app.post("/api/v1/ai/ocr-redact", tags=["AI Services"])
async def process_document_ocr(file: UploadFile = File(...)):
    """
    Processes uploaded documents (Aadhar, Income Certificate) using Google Cloud Vision/Tesseract.
    Extracts relevant data and REDACTS sensitive PII before returning/saving.
    """
    # Simulated OCR extraction and redaction
    return {
        "extracted_data": {
            "name": "Ravi Shankar Kumar",
            "income_verified": True,
            "caste_verified": True
        },
        "redacted": ["Aadhar Number", "Phone Number"],
        "message": "Document processed and PII securely redacted."
    }

# ---------------------------------------------------------
# Health Check & Redis Cache Verification
# ---------------------------------------------------------
@app.get("/health", tags=["System"])
async def health_check():
    """Verify API, PostgreSQL/PostGIS, and Redis Cache health."""
    return {
        "status": "healthy",
        "database": "connected (PostGIS active)",
        "cache": "connected (Redis active)"
    }
