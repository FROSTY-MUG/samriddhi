"""
routers/officer.py — Nodal Officer / Bank Manager Dashboard API
================================================================
Provides endpoints for bank branch managers to:
  1. Fetch a citizen's pre-verified dossier by scanning a QR Routing Token
  2. Approve or flag applications for disbursal
  3. View all pending applications for their branch

These endpoints are protected by JWT authentication.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List
from dependencies import get_current_user
import datetime
import uuid

router = APIRouter(prefix="/api/v1/officer", tags=["Nodal Officer Dashboard"])


# ========================= Models =========================

class DossierDetail(BaseModel):
    """Full dossier data retrieved when a QR Routing Token is scanned."""
    token_id: str
    applicant_name: str
    mobile: str
    category: str
    aadhaar_reference: str = "XXXX-XXXX-XXXX"
    income_verified: bool
    annual_income: float
    scheme_id: str
    scheme_name: str
    loan_amount: float
    promoter_equity: float
    interest_rate: float
    moratorium_months: int
    nearest_branch: str
    branch_ifsc: str
    npa_status: str
    application_status: str
    submitted_at: str
    ai_match_confidence: float

class ApprovalRequest(BaseModel):
    """Payload for approving or flagging a dossier."""
    action: str = Field(..., pattern=r"^(approve|flag)$", description="Either 'approve' or 'flag'")
    remarks: Optional[str] = Field(None, max_length=500)
    officer_name: Optional[str] = None

class ApprovalResponse(BaseModel):
    status: str
    token_id: str
    action_taken: str
    processed_by: str
    processed_at: str


# ========================= Mock Dossier Database =========================

MOCK_DOSSIERS = {
    "SAM-2026-SC-7184": DossierDetail(
        token_id="SAM-2026-SC-7184",
        applicant_name="Ravi Shankar Kumar",
        mobile="98****3210",
        category="SC",
        aadhaar_reference="XXXX-XXXX-XXXX",
        income_verified=True,
        annual_income=240000.0,
        scheme_id="NSFDC-MFS",
        scheme_name="Micro Finance Scheme",
        loan_amount=126000.0,
        promoter_equity=14000.0,
        interest_rate=6.5,
        moratorium_months=6,
        nearest_branch="SBI Janakpuri Branch",
        branch_ifsc="SBIN0001234",
        npa_status="OPTIMAL (1.8%)",
        application_status="pending_review",
        submitted_at="2026-09-24T14:30:00Z",
        ai_match_confidence=0.94,
    ),
    "SAM-2026-SC-4291": DossierDetail(
        token_id="SAM-2026-SC-4291",
        applicant_name="Sunita Devi",
        mobile="91****6789",
        category="SC",
        aadhaar_reference="XXXX-XXXX-XXXX",
        income_verified=True,
        annual_income=180000.0,
        scheme_id="NSFDC-MSY",
        scheme_name="Mahila Samriddhi Yojana",
        loan_amount=126000.0,
        promoter_equity=14000.0,
        interest_rate=5.0,
        moratorium_months=6,
        nearest_branch="PNB Lucknow Main",
        branch_ifsc="PUNB0123400",
        npa_status="OPTIMAL (2.5%)",
        application_status="pending_review",
        submitted_at="2026-09-25T09:15:00Z",
        ai_match_confidence=0.97,
    ),
}


# ========================= Endpoints =========================

@router.get("/dossier/{token}", response_model=DossierDetail)
async def get_dossier_by_token(token: str, user=Depends(get_current_user)):
    """
    Fetch a citizen's complete pre-verified dossier by scanning the QR Routing Token.
    Called when the bank manager scans the QR code on the printed dossier.
    """
    dossier = MOCK_DOSSIERS.get(token)
    if not dossier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No application found for Routing Token: {token}. Please verify the QR code.",
        )
    return dossier


@router.post("/dossier/{token}/approve", response_model=ApprovalResponse)
async def approve_or_flag_dossier(
    token: str,
    body: ApprovalRequest,
    user=Depends(get_current_user),
):
    """
    Approve or flag a citizen's application for disbursal review.
    This endpoint would update the application_dossiers table in production.
    """
    dossier = MOCK_DOSSIERS.get(token)
    if not dossier:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No application found for Routing Token: {token}.",
        )

    # Update status (in-memory for demo; would be a DB write in production)
    new_status = "approved" if body.action == "approve" else "flagged_for_review"
    dossier.application_status = new_status

    return ApprovalResponse(
        status="success",
        token_id=token,
        action_taken=body.action,
        processed_by=body.officer_name or user.get("mobile", "Officer"),
        processed_at=datetime.datetime.utcnow().isoformat(),
    )


@router.get("/pending-applications", response_model=List[DossierDetail])
async def list_pending_applications(user=Depends(get_current_user)):
    """
    List all applications currently pending review at this officer's branch.
    """
    pending = [d for d in MOCK_DOSSIERS.values() if d.application_status == "pending_review"]
    return pending
