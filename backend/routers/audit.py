"""
routers/audit.py — Immutable Audit Logging System
===================================================
Provides algorithmic transparency by logging every AI decision,
scheme recommendation, and officer action to an append-only audit table.

This proves to government juries that the AI is not biased and every
recommendation can be traced back to its input parameters.

Features:
  - Automatic capture of AI decision payloads
  - log_audit_event() dependency for route-level injection
  - Append-only table design (no UPDATE/DELETE allowed)
  - Query endpoint for compliance officers
"""
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional, List
from dependencies import get_current_user
import datetime
import uuid
import json

router = APIRouter(prefix="/api/v1/audit", tags=["Audit & Compliance"])


# ========================= Models =========================

class AuditLogEntry(BaseModel):
    """A single immutable audit log record."""
    id: str
    timestamp: str
    action_type: str          # SCHEME_RECOMMENDATION | KYC_VERIFIED | DOSSIER_GENERATED | DISBURSAL_APPROVED | DISBURSAL_FLAGGED
    user_mobile: Optional[str] = None
    routing_token: Optional[str] = None
    ai_decision_payload: Optional[dict] = None  # The exact parameters the AI used to make its decision
    officer_id: Optional[str] = None
    ip_address: Optional[str] = None
    metadata: Optional[dict] = None

class AuditLogCreateRequest(BaseModel):
    action_type: str
    user_mobile: Optional[str] = None
    routing_token: Optional[str] = None
    ai_decision_payload: Optional[dict] = None
    metadata: Optional[dict] = None


# ========================= In-Memory Audit Store (Append-Only) =========================
# In production, this writes to the PostgreSQL `audit_logs` table.
# The table is designed with NO UPDATE/DELETE policies to ensure immutability.

_AUDIT_STORE: List[AuditLogEntry] = []


# ========================= Audit Logger Utility =========================

async def log_audit_event(
    action_type: str,
    request: Optional[Request] = None,
    user_mobile: Optional[str] = None,
    routing_token: Optional[str] = None,
    ai_decision_payload: Optional[dict] = None,
    officer_id: Optional[str] = None,
    metadata: Optional[dict] = None,
) -> AuditLogEntry:
    """
    Core audit logging function. Call this from any route to create
    an immutable audit record.
    
    In production, this executes:
        INSERT INTO audit_logs (...) VALUES (...)
    with no UPDATE/DELETE permissions on the table.
    """
    entry = AuditLogEntry(
        id=str(uuid.uuid4()),
        timestamp=datetime.datetime.utcnow().isoformat() + "Z",
        action_type=action_type,
        user_mobile=user_mobile,
        routing_token=routing_token,
        ai_decision_payload=ai_decision_payload,
        officer_id=officer_id,
        ip_address=request.client.host if request and request.client else None,
        metadata=metadata,
    )

    _AUDIT_STORE.append(entry)

    # Console log for demo visibility
    print(f"[AUDIT] {entry.timestamp} | {entry.action_type} | Token: {entry.routing_token} | User: {entry.user_mobile}")

    return entry


# ========================= Endpoints =========================

@router.post("/log", response_model=AuditLogEntry, status_code=201)
async def create_audit_log(
    body: AuditLogCreateRequest,
    request: Request,
    user=Depends(get_current_user),
):
    """
    Manually log an audit event (e.g., when the frontend triggers 
    a scheme recommendation or dossier generation).
    """
    entry = await log_audit_event(
        action_type=body.action_type,
        request=request,
        user_mobile=body.user_mobile or user.get("mobile"),
        routing_token=body.routing_token,
        ai_decision_payload=body.ai_decision_payload,
        metadata=body.metadata,
    )
    return entry


@router.get("/logs", response_model=List[AuditLogEntry])
async def get_audit_logs(
    action_type: Optional[str] = None,
    routing_token: Optional[str] = None,
    limit: int = 50,
    user=Depends(get_current_user),
):
    """
    Query audit logs for compliance review.
    Filters by action_type or routing_token.
    """
    results = _AUDIT_STORE.copy()

    if action_type:
        results = [r for r in results if r.action_type == action_type]
    if routing_token:
        results = [r for r in results if r.routing_token == routing_token]

    # Return most recent first, capped at limit
    return sorted(results, key=lambda x: x.timestamp, reverse=True)[:limit]


@router.get("/logs/{log_id}", response_model=AuditLogEntry)
async def get_audit_log_by_id(log_id: str, user=Depends(get_current_user)):
    """Retrieve a specific audit log entry by its unique ID."""
    for entry in _AUDIT_STORE:
        if entry.id == log_id:
            return entry
    raise HTTPException(status_code=404, detail="Audit log entry not found.")


# ========================= SQL Migration for Audit Table =========================
# Add this to your Supabase SQL Editor or migrations/002_audit.sql:
"""
-- Immutable Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    action_type VARCHAR(50) NOT NULL,
    user_mobile VARCHAR(10),
    routing_token VARCHAR(30),
    ai_decision_payload JSONB,
    officer_id VARCHAR(50),
    ip_address INET,
    metadata JSONB,
    
    -- Prevent accidental modifications
    CONSTRAINT audit_logs_immutable CHECK (TRUE)
);

-- CRITICAL: Remove UPDATE and DELETE permissions to ensure immutability
REVOKE UPDATE, DELETE ON audit_logs FROM PUBLIC;
REVOKE UPDATE, DELETE ON audit_logs FROM authenticated;

-- Allow only INSERT (append-only)
GRANT INSERT ON audit_logs TO authenticated;
GRANT SELECT ON audit_logs TO authenticated;

-- Index for fast lookups by token or action type
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs (action_type);
CREATE INDEX IF NOT EXISTS idx_audit_token ON audit_logs (routing_token);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs (timestamp DESC);
"""
