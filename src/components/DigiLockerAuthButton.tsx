/**
 * DigiLockerAuthButton.tsx — API Setu / DigiLocker KYC Button
 * =============================================================
 * Triggers a mock DigiLocker OAuth flow and auto-fills the 
 * applicant's verified profile (Name, Category, Income) into
 * the application state, bypassing manual form entry.
 */
import React, { useState } from 'react';
import { ShieldCheck, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://samriddhi-api.onrender.com';

interface VerifiedProfile {
  verification_id: string;
  full_name: string;
  date_of_birth: string;
  gender: string;
  aadhaar_reference: string;
  pan_reference: string;
  category: string;
  category_certificate_status: string;
  income_band: string;
  income_verified: boolean;
  address_state: string;
  address_district: string;
  kyc_timestamp: string;
}

interface DigiLockerAuthButtonProps {
  mobile: string;
  onVerified: (profile: VerifiedProfile) => void;
}

export const DigiLockerAuthButton: React.FC<DigiLockerAuthButtonProps> = ({
  mobile,
  onVerified,
}) => {
  const [status, setStatus] = useState<'idle' | 'connecting' | 'verifying' | 'verified' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleDigiLockerAuth = async () => {
    if (!mobile || mobile.length !== 10) {
      setError('Please enter a valid mobile number first.');
      return;
    }

    setStatus('connecting');
    setError(null);

    // Simulate the DigiLocker redirect delay
    await new Promise((r) => setTimeout(r, 1500));

    setStatus('verifying');

    try {
      const response = await fetch(`${API_BASE}/api/v1/kyc/digilocker-callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, consent: true }),
      });

      const data = await response.json();

      if (data.status === 'verified' && data.profile) {
        setStatus('verified');
        onVerified(data.profile);
      } else {
        setStatus('error');
        setError('Verification failed. Please try again.');
      }
    } catch (err) {
      setStatus('error');
      setError('Network error. Could not connect to API Setu.');
    }
  };

  return (
    <div style={{ marginBottom: '16px' }}>
      <button
        onClick={handleDigiLockerAuth}
        disabled={status === 'connecting' || status === 'verifying'}
        style={{
          width: '100%',
          padding: '14px 20px',
          background: status === 'verified' ? '#16a34a' : '#0f172a',
          color: '#fff',
          border: status === 'verified' ? '2px solid #16a34a' : '2px solid #334155',
          borderRadius: '10px',
          fontSize: '0.95rem',
          fontWeight: 700,
          cursor: status === 'connecting' || status === 'verifying' ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          transition: 'all 0.2s ease',
        }}
      >
        {status === 'idle' && (
          <>
            <ShieldCheck size={20} />
            <span>Verify via DigiLocker (API Setu)</span>
          </>
        )}
        {status === 'connecting' && (
          <>
            <Loader2 size={20} className="animate-spin" />
            <span>Connecting to API Setu...</span>
          </>
        )}
        {status === 'verifying' && (
          <>
            <Loader2 size={20} className="animate-spin" />
            <span>Fetching DigiLocker documents...</span>
          </>
        )}
        {status === 'verified' && (
          <>
            <CheckCircle2 size={20} />
            <span>✓ Identity Verified via DigiLocker</span>
          </>
        )}
        {status === 'error' && (
          <>
            <AlertTriangle size={20} />
            <span>Retry DigiLocker Verification</span>
          </>
        )}
      </button>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', color: '#dc2626', fontSize: '0.82rem' }}>
          <AlertTriangle size={14} /> {error}
        </div>
      )}

      {status === 'verified' && (
        <div style={{ marginTop: '8px', padding: '8px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', fontSize: '0.78rem', color: '#15803d' }}>
          🔒 Aadhaar: XXXX-XXXX-XXXX (Redacted) • PAN: XXXXX****X • Category Certificate: Verified
        </div>
      )}
    </div>
  );
};

export default DigiLockerAuthButton;
