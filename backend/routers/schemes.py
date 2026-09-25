from fastapi import APIRouter, Query, Depends
from typing import Optional, List
from pydantic import BaseModel
from sqlalchemy import text

# Assuming a mock get_db dependency for the sake of the demo, 
# as the actual connection setup would depend on your SQLAlchemy config.
def get_db():
    # Mocking a DB connection session
    class MockDB:
        def execute(self, query, params):
            class Row:
                def __init__(self, scheme_id, scheme_name, calculated_rate, max_limit_inr):
                    self.scheme_id = scheme_id
                    self.scheme_name = scheme_name
                    self.calculated_rate = calculated_rate
                    self.max_limit_inr = max_limit_inr
            
            class Result:
                def fetchall(self):
                    # Mock response simulating a database return
                    return [
                        Row("NSFDC-MSY", "Mahila Samriddhi Yojana", 4.0 if params.get("gender") == "F" else 5.0, 140000.0),
                        Row("NSFDC-MFS", "Micro Finance Scheme", 5.5 if params.get("gender") == "F" else 6.5, 140000.0)
                    ]
            return Result()
    return MockDB()

router = APIRouter()

class SchemeResponse(BaseModel):
    scheme_id: str
    scheme_name: str
    effective_rate: float
    max_limit: float
    eligibility_status: str

@router.get("/api/v1/schemes/filter", response_model=List[SchemeResponse], tags=["Schemes"])
def get_eligible_schemes(
    amount: float = Query(..., description="Requested loan amount"),
    income: float = Query(..., description="Annual family income"),
    category: str = Query(..., description="Social category (SC/ST/OBC/GEN)"),
    gender: str = Query(..., description="Applicant gender (M/F/O)"),
    db=Depends(get_db)
):
    """
    Production filtering engine matching user criteria against statutory limits.
    """
    
    query = text("""
        SELECT 
            scheme_id, 
            scheme_name, 
            max_limit_inr,
            -- Dynamically calculate effective interest rate
            CASE 
                WHEN :gender = 'F' THEN (interest_rate - women_special_rebate)
                ELSE interest_rate 
            END as calculated_rate
        FROM government_schemes
        WHERE max_limit_inr >= :amount
          AND max_family_income >= :income
          AND :category = ANY(eligible_categories)
        ORDER BY calculated_rate ASC;
    """)
    
    results = db.execute(query, {
        "amount": amount, 
        "income": income, 
        "category": category.upper(), 
        "gender": gender.upper()
    }).fetchall()
    
    return [
        {
            "scheme_id": row.scheme_id,
            "scheme_name": row.scheme_name,
            "effective_rate": float(row.calculated_rate),
            "max_limit": float(row.max_limit_inr),
            "eligibility_status": "Verified Eligible"
        }
        for row in results
    ]
