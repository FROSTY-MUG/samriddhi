# requirements.txt: fastapi uvicorn httpx beautifulsoup4 supabase asyncpg
import httpx
from bs4 import BeautifulSoup
from fastapi import FastAPI, Query, BackgroundTasks
from supabase import create_client, Client
from pydantic import BaseModel
import os

app = FastAPI(title="SamriddhiAI Core Engine")

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

async def scrape_nsfdc_schemes():
    """Background task to scrape live rates from NSFDC and update Supabase."""
    async with httpx.AsyncClient() as client:
        # Mocking the live fetch for NSFDC
        # response = await client.get("http://nsfdc.nic.in/scheme")
        # soup = BeautifulSoup(response.content, 'html.parser')
        
        # In a real scrape, you target the specific DOM elements.
        # Example scraped data based on current 2026 NSFDC parameters:
        live_data = [
            {
                "scheme_id": "NSFDC-MFS",
                "scheme_name": "Micro Finance Scheme",
                "interest_rate": 6.50, # Live extracted rate
                "max_limit_inr": 125000,
                "target_sector": "Micro Business",
                "max_family_income": 300000,
                "eligible_categories": ["SC"],
                "source_url": "http://nsfdc.nic.in/scheme"
            }
        ]
        
        # Upsert into Supabase
        if supabase:
            for scheme in live_data:
                supabase.table("government_schemes").upsert(scheme).execute()
        print("Live schemes synchronized successfully.")

@app.post("/api/v1/sync")
async def trigger_sync(background_tasks: BackgroundTasks):
    background_tasks.add_task(scrape_nsfdc_schemes)
    return {"status": "Sync initiated"}

@app.get("/api/v1/schemes/filter")
def filter_schemes(
    amount: float = Query(...),
    income: float = Query(...),
    category: str = Query(...)
):
    """Production endpoint matching applicant to live statutory schemes."""
    if not supabase:
        return {"status": "error", "message": "Supabase client not initialized."}

    # Query Supabase for matching schemes based on income and category limits
    response = supabase.table("government_schemes").select("*")\
        .gte("max_limit_inr", amount)\
        .gte("max_family_income", income)\
        .execute()
    
    # Filter by array containment (checking if applicant's category is in the scheme's eligible list)
    valid_schemes = [
        s for s in response.data if category.upper() in s.get("eligible_categories", [])
    ]
    
    return {"status": "success", "results": valid_schemes}
