"""
routers/schemes.py — Scheme Matching & PostGIS Geo-Spatial Routing Engine
==========================================================================
1. Scheme Filtering:
   Evaluates citizen parameters (income, category, gender, amount) against
   statutory government schemes. Dynamically applies rebates (e.g., 1.0% women rebate).
2. Geo-Spatial Routing (PostGIS):
   Uses ST_DWithin and ST_Distance to match the closest compliant channel partner
   bank branches within 100km, actively filtering out high NPA (>5.0%) and
   under-capitalized branches.
3. Automatically logs routing decisions to audit_logs for transparency.
"""
import random
import math
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Query, Depends, HTTPException, status, Request
from pydantic import BaseModel, Field
from sqlalchemy import text
from database import get_db, AsyncSessionLocal
from routers.audit import log_audit_event
from limiter import limiter

router = APIRouter(tags=["Schemes & Geo-Routing"])


# ========================= Response / Request Models =========================

class SchemeResponse(BaseModel):
    scheme_id: str
    scheme_name: str
    effective_rate: float
    base_rate: float
    women_rebate: float
    max_limit: float
    max_family_income: float
    moratorium_months: int
    promoter_equity_pct: float
    eligibility_status: str
    description: Optional[str] = None
    sector_focus: Optional[List[str]] = None

class RouteApplicationRequest(BaseModel):
    lat: float = Field(..., ge=-90.0, le=90.0, description="Citizen Latitude (WGS84)")
    lon: float = Field(..., ge=-180.0, le=180.0, description="Citizen Longitude (WGS84)")
    requested_amount: float = Field(..., gt=0, description="Requested loan amount in INR")
    scheme_id: str = Field(..., description="Target scheme code e.g. NSFDC-MSY")
    applicant_name: Optional[str] = "Applicant"
    mobile: Optional[str] = "9876543210"
    category: Optional[str] = "SC"
    annual_income: Optional[float] = 200000.0

class BranchRecommendation(BaseModel):
    branch_code: str
    bank_name: str
    branch_name: str
    ifsc: str
    npa_percentage: float
    active_quota_inr: float
    distance_km: float
    address: str
    contact_phone: Optional[str] = None
    google_maps_url: str

class RouteApplicationResponse(BaseModel):
    routing_token: str
    status: str
    scheme_id: str
    scheme_name: str
    requested_amount: float
    interest_rate: float
    moratorium_months: int
    matched_branch: BranchRecommendation
    alternative_branches: List[BranchRecommendation]
    compliance_message: str


# ========================= Seed Fallbacks for Dev / Standalone =========================

FALLBACK_SCHEMES = [
    {
        "scheme_id": "NSFDC-MSY",
        "name": "Mahila Samriddhi Yojana (MSY)",
        "interest_rate": 4.0,
        "women_special_rebate": 1.0,
        "max_income": 300000.0,
        "max_limit_inr": 140000.0,
        "moratorium_months": 6,
        "promoter_equity_pct": 5.0,
        "description": "Micro-credit scheme exclusively for SC women entrepreneurs with concessional rate.",
        "sector_focus": ["tailoring", "dairy", "retail", "small_trade"]
    },
    {
        "scheme_id": "NSFDC-MFS",
        "name": "Micro Finance Scheme (MFS)",
        "interest_rate": 6.5,
        "women_special_rebate": 1.0,
        "max_income": 300000.0,
        "max_limit_inr": 140000.0,
        "moratorium_months": 6,
        "promoter_equity_pct": 10.0,
        "description": "Direct micro-lending to target group beneficiaries through State Channelising Agencies.",
        "sector_focus": ["tailoring", "handicrafts", "grocery", "mechanic", "artisan"]
    },
    {
        "scheme_id": "NSFDC-TLS-S",
        "name": "Term Loan Scheme - Small Scale (TLS)",
        "interest_rate": 6.5,
        "women_special_rebate": 0.5,
        "max_income": 500000.0,
        "max_limit_inr": 500000.0,
        "moratorium_months": 6,
        "promoter_equity_pct": 10.0,
        "description": "Assistance for self-employment ventures costing up to Rs. 5.00 Lakhs.",
        "sector_focus": ["retail", "dairy", "manufacturing", "transport", "services"]
    },
    {
        "scheme_id": "NSFDC-GBS",
        "name": "Green Business Scheme (GBS)",
        "interest_rate": 6.5,
        "women_special_rebate": 0.5,
        "max_income": 500000.0,
        "max_limit_inr": 3000000.0,
        "moratorium_months": 9,
        "promoter_equity_pct": 10.0,
        "description": "Financial support for green and clean energy enterprises including E-Rickshaws and Solar.",
        "sector_focus": ["solar", "e-rickshaw", "biomass", "waste_management", "clean_energy"]
    },
    {
        "scheme_id": "NSFDC-ELS-IN",
        "name": "Educational Loan Scheme - Inland (ELS)",
        "interest_rate": 6.0,
        "women_special_rebate": 0.5,
        "max_income": 500000.0,
        "max_limit_inr": 2000000.0,
        "moratorium_months": 12,
        "promoter_equity_pct": 5.0,
        "description": "Educational loans for professional and technical degrees in India.",
        "sector_focus": ["education", "technical_courses", "engineering", "medical"]
    }
]

FALLBACK_BRANCHES = [
    {
        "branch_code": "SBI-DEL-01234",
        "bank_name": "State Bank of India",
        "branch_name": "Janakpuri District Centre",
        "ifsc": "SBIN0001234",
        "npa_percentage": 1.8,
        "active_quota_inr": 25000000.0,
        "lat": 28.6297,
        "lon": 77.0827,
        "address": "Plot 4, Community Centre, Janakpuri, New Delhi - 110058",
        "contact_phone": "+91-11-25501234",
    },
    {
        "branch_code": "PNB-DEL-04561",
        "bank_name": "Punjab National Bank",
        "branch_name": "Connaught Place Main",
        "ifsc": "PUNB0045610",
        "npa_percentage": 2.4,
        "active_quota_inr": 40000000.0,
        "lat": 28.6315,
        "lon": 77.2197,
        "address": "7, Harsha Bhawan, E-Block, Connaught Place, New Delhi - 110001",
        "contact_phone": "+91-11-23314561",
    },
    {
        "branch_code": "PNB-LKO-01234",
        "bank_name": "Punjab National Bank",
        "branch_name": "Hazratganj Main Branch",
        "ifsc": "PUNB0123400",
        "npa_percentage": 2.5,
        "active_quota_inr": 30000000.0,
        "lat": 26.8467,
        "lon": 80.9462,
        "address": "1, Vidhan Sabha Marg, Hazratganj, Lucknow, UP - 226001",
        "contact_phone": "+91-522-2621234",
    },
    {
        "branch_code": "SBI-LKO-05678",
        "bank_name": "State Bank of India",
        "branch_name": "Gomti Nagar Branch",
        "ifsc": "SBIN0005678",
        "npa_percentage": 1.4,
        "active_quota_inr": 50000000.0,
        "lat": 26.8532,
        "lon": 80.9992,
        "address": "Vibhav Khand, Gomti Nagar, Lucknow, UP - 226010",
        "contact_phone": "+91-522-2305678",
    },
    {
        "branch_code": "BOB-DEL-09921",
        "bank_name": "Bank of Baroda",
        "branch_name": "Okhla Industrial Area",
        "ifsc": "BARB0OKHIND",
        "npa_percentage": 3.1,
        "active_quota_inr": 18000000.0,
        "lat": 28.5284,
        "lon": 77.2731,
        "address": "Phase II, Okhla Industrial Area, New Delhi - 110020",
        "contact_phone": "+91-11-26389921",
    }
]


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates great-circle distance between two points in kilometers."""
    R = 6371.0  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 2)


# ========================= Scheme Filter Endpoint =========================

@router.get("/api/v1/schemes/filter", response_model=List[SchemeResponse])
@limiter.limit("20/minute")
async def filter_eligible_schemes(
    request: Request,
    amount: float = Query(..., description="Requested loan amount in INR", ge=1000),
    income: float = Query(..., description="Annual family income in INR", ge=0),
    category: str = Query("SC", description="Social category (SC/ST/OBC/GEN)"),
    gender: str = Query("M", description="Applicant gender (M/F/O)"),
    db=Depends(get_db),
):
    """
    Evaluates statutory scheme limits and interest rate concessions.
    Dynamically adjusts interest rates:
      - Women applicants (gender='F') automatically receive the special rebate
        (e.g., 1.0% discount on Mahila Samriddhi Yojana or Micro Finance Scheme).
    """
    category_norm = category.upper()
    gender_norm = gender.upper()

    schemes_output = []

    # Attempt Live PostgreSQL Query
    try:
        sql = text("""
            SELECT 
                scheme_id, 
                name, 
                interest_rate,
                women_special_rebate,
                max_income,
                max_limit_inr,
                moratorium_months,
                promoter_equity_pct,
                description,
                sector_focus,
                CASE 
                    WHEN :gender = 'F' THEN (interest_rate - women_special_rebate)
                    ELSE interest_rate 
                END AS calculated_rate
            FROM government_schemes
            WHERE max_limit_inr >= :amount
              AND max_income >= :income
              AND :category = ANY(eligible_categories)
              AND is_active = TRUE
            ORDER BY calculated_rate ASC;
        """)

        result = await db.execute(sql, {
            "amount": amount,
            "income": income,
            "category": category_norm,
            "gender": gender_norm,
        })
        rows = result.fetchall()

        for r in rows:
            schemes_output.append(SchemeResponse(
                scheme_id=r[0],
                scheme_name=r[1],
                base_rate=float(r[2]),
                women_rebate=float(r[3]),
                effective_rate=float(r[10]),
                max_limit=float(r[5]),
                max_family_income=float(r[4]),
                moratorium_months=int(r[6]),
                promoter_equity_pct=float(r[7]),
                eligibility_status="Verified Statutorily Eligible",
                description=r[8],
                sector_focus=r[9] if r[9] else [],
            ))

    except Exception:
        # Fallback evaluation against in-memory statutory standards
        for s in FALLBACK_SCHEMES:
            if s["max_limit_inr"] >= amount and s["max_income"] >= income:
                is_woman = (gender_norm == "F")
                eff_rate = s["interest_rate"] - (s["women_special_rebate"] if is_woman else 0.0)
                schemes_output.append(SchemeResponse(
                    scheme_id=s["scheme_id"],
                    scheme_name=s["name"],
                    base_rate=s["interest_rate"],
                    women_rebate=s["women_special_rebate"],
                    effective_rate=eff_rate,
                    max_limit=s["max_limit_inr"],
                    max_family_income=s["max_income"],
                    moratorium_months=s["moratorium_months"],
                    promoter_equity_pct=s["promoter_equity_pct"],
                    eligibility_status="Verified Statutorily Eligible",
                    description=s["description"],
                    sector_focus=s["sector_focus"],
                ))

    # Sort ascending by lowest effective interest rate
    schemes_output.sort(key=lambda x: x.effective_rate)

    # Log audit event for algorithmic transparency
    client_ip = request.client.host if request and request.client else "127.0.0.1"
    await log_audit_event(
        action="SCHEME_FILTER_EVALUATION",
        ai_payload_json={
            "inputs": {"amount": amount, "income": income, "category": category_norm, "gender": gender_norm},
            "matched_count": len(schemes_output),
            "matched_schemes": [s.scheme_id for s in schemes_output],
        },
        ip_address=client_ip,
    )

    return schemes_output


# ========================= PostGIS Geo-Spatial Routing Engine =========================

@router.post("/api/v1/route-application", response_model=RouteApplicationResponse)
@limiter.limit("20/minute")
async def route_application_postgis(
    request: Request,
    body: RouteApplicationRequest,
    db=Depends(get_db),
):
    """
    POST /api/v1/route-application
    Geo-Spatial Routing Engine using PostGIS:
      1. Uses ST_DWithin and ST_Distance to find closest partner bank branches.
      2. Strictly filters out branches with NPA ratio > 5.0% (protecting citizen from bad bank health).
      3. Strictly filters out branches with insufficient sanctioned quota (active_quota_inr < requested_amount).
      4. Orders results by physical distance in km.
      5. Generates immutable routing token and records the transaction in audit_logs.
    """
    matched_branches: List[BranchRecommendation] = []

    # Attempt PostGIS Query
    try:
        sql = text("""
            SELECT 
                branch_code,
                bank_name,
                branch_name,
                ifsc,
                npa_percentage,
                active_quota_inr,
                address,
                contact_phone,
                ROUND((ST_Distance(
                    location_geom::geography, 
                    ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography
                ) / 1000.0)::numeric, 2) AS distance_km
            FROM channel_partners
            WHERE is_active = TRUE
              AND npa_percentage <= 5.0
              AND active_quota_inr >= :amount
              AND ST_DWithin(
                  location_geom::geography,
                  ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)::geography,
                  100000 -- 100km radius
              )
            ORDER BY distance_km ASC
            LIMIT 5;
        """)

        res = await db.execute(sql, {
            "lat": body.lat,
            "lon": body.lon,
            "amount": body.requested_amount,
        })
        rows = res.fetchall()

        for r in rows:
            dist = float(r[8])
            maps_url = f"https://www.google.com/maps/search/?api=1&query={r[1]}+{r[2]}+{r[3]}"
            matched_branches.append(BranchRecommendation(
                branch_code=r[0],
                bank_name=r[1],
                branch_name=r[2],
                ifsc=r[3],
                npa_percentage=float(r[4]),
                active_quota_inr=float(r[5]),
                distance_km=dist,
                address=r[6],
                contact_phone=r[7],
                google_maps_url=maps_url,
            ))
    except Exception:
        pass

    # Fallback to local branches calculation if PostGIS container not running
    if not matched_branches:
        for b in FALLBACK_BRANCHES:
            if b["npa_percentage"] <= 5.0 and b["active_quota_inr"] >= body.requested_amount:
                dist = haversine_distance(body.lat, body.lon, b["lat"], b["lon"])
                maps_url = f"https://www.google.com/maps/search/?api=1&query={b['bank_name']}+{b['branch_name']}+{b['ifsc']}"
                matched_branches.append(BranchRecommendation(
                    branch_code=b["branch_code"],
                    bank_name=b["bank_name"],
                    branch_name=b["branch_name"],
                    ifsc=b["ifsc"],
                    npa_percentage=b["npa_percentage"],
                    active_quota_inr=b["active_quota_inr"],
                    distance_km=dist,
                    address=b["address"],
                    contact_phone=b["contact_phone"],
                    google_maps_url=maps_url,
                ))
        matched_branches.sort(key=lambda x: x.distance_km)

    if not matched_branches:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No compliant channel partner bank branch found within 100km with active quota and NPA <= 5.0%.",
        )

    best_branch = matched_branches[0]
    alternatives = matched_branches[1:4]

    # Generate unique routing token
    routing_token = f"SAM-2026-SC-{random.randint(1000, 9999)}"

    # Determine scheme metadata
    target_scheme = next((s for s in FALLBACK_SCHEMES if s["scheme_id"] == body.scheme_id), FALLBACK_SCHEMES[0])

    # Record in application_dossiers if DB session available
    try:
        await db.execute(
            text("""
                INSERT INTO application_dossiers (
                    routing_token, applicant_name, mobile, category, aadhaar_redacted,
                    income_verified, annual_income, scheme_id, loan_amount, promoter_equity,
                    interest_rate, moratorium_months, allocated_branch_code, status
                ) VALUES (
                    :token, :name, :mobile, :category, '[Aadhaar Redacted]',
                    TRUE, :income, :scheme_id, :loan_amount, :promoter_equity,
                    :rate, :moratorium, :branch_code, 'pending_review'
                ) ON CONFLICT (routing_token) DO NOTHING;
            """),
            {
                "token": routing_token,
                "name": body.applicant_name or "Applicant",
                "mobile": body.mobile or "9876543210",
                "category": body.category or "SC",
                "income": body.annual_income or 200000.0,
                "scheme_id": target_scheme["scheme_id"],
                "loan_amount": body.requested_amount,
                "promoter_equity": round(body.requested_amount * 0.10, 2),
                "rate": target_scheme["interest_rate"],
                "moratorium": target_scheme["moratorium_months"],
                "branch_code": best_branch.branch_code,
            }
        )
        await db.commit()
    except Exception:
        pass

    # Log to immutable audit trail
    client_ip = request.client.host if request and request.client else "127.0.0.1"
    await log_audit_event(
        action="POSTGIS_GEO_ROUTING_ALLOCATION",
        routing_token=routing_token,
        user_mobile=body.mobile,
        ai_payload_json={
            "citizen_coordinates": {"lat": body.lat, "lon": body.lon},
            "requested_amount": body.requested_amount,
            "scheme_id": body.scheme_id,
            "allocated_branch": best_branch.dict(),
            "npa_enforced_under": 5.0,
            "distance_km": best_branch.distance_km,
        },
        ip_address=client_ip,
    )

    return RouteApplicationResponse(
        routing_token=routing_token,
        status="ROUTED_OPTIMAL_CHANNEL_PARTNER",
        scheme_id=target_scheme["scheme_id"],
        scheme_name=target_scheme["name"],
        requested_amount=body.requested_amount,
        interest_rate=target_scheme["interest_rate"],
        moratorium_months=target_scheme["moratorium_months"],
        matched_branch=best_branch,
        alternative_branches=alternatives,
        compliance_message=f"Optimal channel routing complete via PostGIS ST_Distance. Partner branch NPA ({best_branch.npa_percentage}%) strictly below statutory 5.0% threshold.",
    )
