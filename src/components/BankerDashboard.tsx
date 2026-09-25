/**
 * BankerDashboard.tsx — Nodal Officer / Bank Manager Dashboard
 * ==============================================================
 * A separate view for bank branch managers to:
 *   1. Scan a QR Routing Token from a citizen's printed dossier
 *   2. View the citizen's full pre-verified application
 *   3. Approve the disbursal or flag it for review
 *
 * Styled with GIGW Government of India aesthetics.
 */
import React, { useState } from 'react';
import {
  QrCode, Search, CheckCircle2, AlertTriangle,
  Loader2, Shield, Landmark, User, CreditCard,
  MapPin, FileCheck2, XCircle
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://samriddhi-api.onrender.com';

interface DossierData {
  token_id: string;
  applicant_name: string;
  mobile: string;
  category: string;
  aadhaar_reference: string;
  income_verified: boolean;
  annual_income: number;
  scheme_id: string;
  scheme_name: string;
  loan_amount: number;
  promoter_equity: number;
  interest_rate: number;
  moratorium_months: number;
  nearest_branch: string;
  branch_ifsc: string;
  npa_status: string;
  application_status: string;
  submitted_at: string;
  ai_match_confidence: number;
}

export const BankerDashboard: React.FC = () => {
  const [tokenInput, setTokenInput] = useState('');
  const [dossier, setDossier] = useState<DossierData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<string | null>(null);

  const fetchDossier = async (token: string) => {
    setLoading(true);
    setError(null);
    setDossier(null);
    setActionResult(null);

    try {
      const response = await fetch(`${API_BASE}/api/v1/officer/dossier/${token}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('samriddhi_token') || 'demo-token'}`,
        },
      });

      if (response.status === 404) {
        setError(`No application found for token: ${token}`);
        setLoading(false);
        return;
      }

      const data = await response.json();
      setDossier(data);
    } catch (err) {
      // Fallback mock data for SIH demo
      setDossier({
        token_id: token || 'SAM-2026-SC-7184',
        applicant_name: 'Ravi Shankar Kumar',
        mobile: '98****3210',
        category: 'SC',
        aadhaar_reference: 'XXXX-XXXX-XXXX',
        income_verified: true,
        annual_income: 240000,
        scheme_id: 'NSFDC-MFS',
        scheme_name: 'Micro Finance Scheme',
        loan_amount: 126000,
        promoter_equity: 14000,
        interest_rate: 6.5,
        moratorium_months: 6,
        nearest_branch: 'SBI Janakpuri Branch',
        branch_ifsc: 'SBIN0001234',
        npa_status: 'OPTIMAL (1.8%)',
        application_status: 'pending_review',
        submitted_at: new Date().toISOString(),
        ai_match_confidence: 0.94,
      });
    }
    setLoading(false);
  };

  const handleAction = async (action: 'approve' | 'flag') => {
    if (!dossier) return;
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/v1/officer/dossier/${dossier.token_id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('samriddhi_token') || 'demo-token'}`,
        },
        body: JSON.stringify({ action, officer_name: 'Branch Manager' }),
      });

      const data = await response.json();
      setActionResult(action === 'approve' ? '✅ Disbursal Approved' : '🔍 Flagged for Review');
      if (dossier) {
        setDossier({ ...dossier, application_status: action === 'approve' ? 'approved' : 'flagged_for_review' });
      }
    } catch (err) {
      setActionResult(action === 'approve' ? '✅ Disbursal Approved (Demo)' : '🔍 Flagged for Review (Demo)');
      if (dossier) {
        setDossier({ ...dossier, application_status: action === 'approve' ? 'approved' : 'flagged_for_review' });
      }
    }
    setLoading(false);
  };

  const handleScanQR = () => {
    // Simulate QR scan with a demo token
    const demoToken = 'SAM-2026-SC-7184';
    setTokenInput(demoToken);
    fetchDossier(demoToken);
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px' }}>
      {/* Header */}
      <div style={{ background: '#0f172a', color: '#fff', padding: '20px 24px', borderRadius: '12px 12px 0 0', borderBottom: '4px solid #ff9933' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Landmark size={28} style={{ color: '#38bdf8' }} />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>Nodal Officer Dashboard</h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>
              शाखा प्रबंधक पैनल • Branch Manager Panel — NSFDC Channel Finance
            </p>
          </div>
        </div>
      </div>

      {/* Scanner Section */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '24px', borderRadius: '0 0 12px 12px', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <QrCode size={20} style={{ color: '#0284c7' }} />
          Scan QR Routing Token
        </h3>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <input
            type="text"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="e.g., SAM-2026-SC-7184"
            style={{ flex: 1, padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 600 }}
          />
          <button
            onClick={() => fetchDossier(tokenInput)}
            disabled={!tokenInput || loading}
            style={{ padding: '10px 20px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Search size={16} /> Lookup
          </button>
        </div>

        <button
          onClick={handleScanQR}
          style={{ width: '100%', padding: '14px', background: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '10px', fontSize: '0.9rem', fontWeight: 600, color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <QrCode size={20} style={{ color: '#0284c7' }} />
          📷 Tap to Scan QR Code (Demo: auto-fills SAM-2026-SC-7184)
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px auto', display: 'block' }} />
          Fetching dossier from secure registry...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{ padding: '16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <XCircle size={20} /> {error}
        </div>
      )}

      {/* Dossier Display */}
      {dossier && !loading && (
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
          {/* Status Banner */}
          <div style={{
            padding: '12px 20px',
            background: dossier.application_status === 'approved' ? '#f0fdf4' : dossier.application_status === 'flagged_for_review' ? '#fef3c7' : '#f0f9ff',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}>
            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>
              Token: <span style={{ color: '#0284c7' }}>{dossier.token_id}</span>
            </span>
            <span style={{
              padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800,
              background: dossier.application_status === 'approved' ? '#dcfce7' : dossier.application_status === 'flagged_for_review' ? '#fef9c3' : '#e0f2fe',
              color: dossier.application_status === 'approved' ? '#166534' : dossier.application_status === 'flagged_for_review' ? '#92400e' : '#0369a1',
            }}>
              {dossier.application_status.replace(/_/g, ' ').toUpperCase()}
            </span>
          </div>

          {/* Dossier Details Grid */}
          <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div><span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>APPLICANT</span><div style={{ fontWeight: 800, color: '#0f172a', fontSize: '1.1rem' }}>{dossier.applicant_name}</div></div>
            <div><span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>MOBILE</span><div style={{ fontWeight: 700 }}>{dossier.mobile}</div></div>
            <div><span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>CATEGORY</span><div style={{ fontWeight: 700 }}>{dossier.category}</div></div>
            <div><span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>AADHAAR</span><div style={{ fontWeight: 700 }}>{dossier.aadhaar_reference}</div></div>
            <div><span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>INCOME</span><div style={{ fontWeight: 800, color: dossier.income_verified ? '#16a34a' : '#dc2626' }}>₹{dossier.annual_income.toLocaleString()} {dossier.income_verified ? '✓ Verified' : '✗ Unverified'}</div></div>
            <div><span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 600 }}>AI CONFIDENCE</span><div style={{ fontWeight: 800, color: '#0284c7' }}>{(dossier.ai_match_confidence * 100).toFixed(0)}%</div></div>
          </div>

          {/* Scheme & Financial Details */}
          <div style={{ padding: '0 20px 20px 20px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
              <div><span style={{ fontSize: '0.7rem', color: '#64748b' }}>SCHEME</span><div style={{ fontWeight: 800, color: '#0f172a' }}>{dossier.scheme_name}</div></div>
              <div><span style={{ fontSize: '0.7rem', color: '#64748b' }}>LOAN AMOUNT</span><div style={{ fontWeight: 800, color: '#16a34a' }}>₹{dossier.loan_amount.toLocaleString()}</div></div>
              <div><span style={{ fontSize: '0.7rem', color: '#64748b' }}>INTEREST</span><div style={{ fontWeight: 800 }}>{dossier.interest_rate}% p.a.</div></div>
              <div><span style={{ fontSize: '0.7rem', color: '#64748b' }}>MORATORIUM</span><div style={{ fontWeight: 800 }}>{dossier.moratorium_months} months</div></div>
            </div>
          </div>

          {/* Branch & NPA */}
          <div style={{ padding: '0 20px 20px 20px', display: 'flex', gap: '12px', alignItems: 'center', fontSize: '0.85rem' }}>
            <MapPin size={16} style={{ color: '#0284c7' }} />
            <span><strong>{dossier.nearest_branch}</strong> ({dossier.branch_ifsc}) — NPA: <span style={{ color: '#16a34a', fontWeight: 800 }}>{dossier.npa_status}</span></span>
          </div>

          {/* Action Result */}
          {actionResult && (
            <div style={{ margin: '0 20px 16px 20px', padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', textAlign: 'center', fontWeight: 700, color: '#166534', fontSize: '1rem' }}>
              {actionResult}
            </div>
          )}

          {/* Action Buttons */}
          {dossier.application_status === 'pending_review' && (
            <div style={{ padding: '0 20px 20px 20px', display: 'flex', gap: '12px' }}>
              <button
                onClick={() => handleAction('approve')}
                style={{ flex: 1, padding: '14px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <CheckCircle2 size={20} /> Approve Disbursal
              </button>
              <button
                onClick={() => handleAction('flag')}
                style={{ flex: 1, padding: '14px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <AlertTriangle size={20} /> Flag for Review
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BankerDashboard;
