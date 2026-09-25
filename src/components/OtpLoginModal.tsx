/**
 * OtpLoginModal.tsx — Mobile OTP Authentication Modal
 * ====================================================
 * A production-grade OTP login flow with:
 *   - Indian mobile number validation (10 digits, starts with 6-9)
 *   - Auto-resend countdown timer (30 seconds)
 *   - Rate limit (HTTP 429) and error state handling
 *   - Automatic JWT token storage via AuthContext on success
 *
 * Follows GIGW Government of India styling conventions.
 */
import React, { useState, useEffect, useRef } from 'react';
import { Phone, Shield, Loader2, AlertTriangle, CheckCircle2, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'https://samriddhi-api.onrender.com';

interface OtpLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: () => void;
}

type Step = 'mobile' | 'otp' | 'success';

export const OtpLoginModal: React.FC<OtpLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const { login } = useAuth();

  // ========================= State =========================
  const [step, setStep] = useState<Step>('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  const otpInputRef = useRef<HTMLInputElement>(null);

  // ========================= Countdown Timer =========================
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Auto-focus OTP input when transitioning to OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => otpInputRef.current?.focus(), 100);
    }
  }, [step]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setStep('mobile');
      setMobile('');
      setOtp('');
      setError(null);
      setResendTimer(0);
    }
  }, [isOpen]);

  // ========================= API Calls =========================

  const handleSendOtp = async () => {
    // Validate mobile number (Indian format: 10 digits starting with 6-9)
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      setError('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      });

      if (response.status === 429) {
        setError('Too many OTP requests. Please wait 1 minute and try again.');
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || 'Failed to send OTP. Please try again.');
        setLoading(false);
        return;
      }

      // Success: Move to OTP input step and start countdown
      setStep('otp');
      setResendTimer(30); // 30-second cooldown before allowing resend
    } catch (err) {
      setError('Network error. Please check your connection.');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp }),
      });

      if (response.status === 429) {
        setError('Too many verification attempts. Please wait and try again.');
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || 'Invalid OTP. Please check and try again.');
        setLoading(false);
        return;
      }

      // Success: Store the JWT token via AuthContext
      login(data.access_token, mobile);
      setStep('success');

      // Auto-close after 1.5 seconds
      setTimeout(() => {
        onLoginSuccess?.();
        onClose();
      }, 1500);
    } catch (err) {
      setError('Network error. Please check your connection.');
    }
    setLoading(false);
  };

  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    setOtp('');
    setError(null);
    handleSendOtp();
  };

  // ========================= Render =========================

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '440px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tricolor Top Stripe */}
        <div style={{ height: '4px', background: 'linear-gradient(90deg, #ff9933 33%, #fff 33%, #fff 66%, #138808 66%)', borderRadius: '16px 16px 0 0', margin: '-24px -24px 20px -24px' }} />

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              नागरिक प्रमाणीकरण
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', margin: '2px 0 0 0' }}>
              Citizen Authentication (OTP Login)
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
            <X size={20} />
          </button>
        </div>

        {/* ==================== Step 1: Mobile Number ==================== */}
        {step === 'mobile' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', padding: '10px 14px', background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', fontSize: '0.82rem', color: '#0369a1' }}>
              <Shield size={16} />
              <span>Your mobile number is verified via OTP. We do not store passwords.</span>
            </div>

            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
              Mobile Number (मोबाइल नंबर)
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>
                +91
              </div>
              <input
                type="tel"
                maxLength={10}
                value={mobile}
                onChange={(e) => { setMobile(e.target.value.replace(/\D/g, '')); setError(null); }}
                placeholder="9876543210"
                style={{ flex: 1, padding: '12px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '1.05rem', letterSpacing: '0.1em', fontWeight: 600, outline: 'none' }}
                autoFocus
              />
            </div>

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', color: '#dc2626', fontSize: '0.82rem' }}>
                <AlertTriangle size={14} /> {error}
              </div>
            )}

            <button
              onClick={handleSendOtp}
              disabled={loading || mobile.length !== 10}
              style={{
                width: '100%', marginTop: '20px', padding: '12px', background: mobile.length === 10 ? '#0284c7' : '#94a3b8',
                color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 700,
                cursor: mobile.length === 10 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Phone size={18} />}
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </div>
        )}

        {/* ==================== Step 2: OTP Verification ==================== */}
        {step === 'otp' && (
          <div>
            <p style={{ fontSize: '0.88rem', color: '#475569', marginBottom: '16px' }}>
              A 6-digit OTP has been sent to <strong>+91-{mobile.slice(0, 2)}****{mobile.slice(-2)}</strong>
            </p>

            <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
              Enter OTP (ओ.टी.पी. दर्ज करें)
            </label>
            <input
              ref={otpInputRef}
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setError(null); }}
              placeholder="● ● ● ● ● ●"
              style={{ width: '100%', padding: '14px', border: '2px solid #0284c7', borderRadius: '8px', fontSize: '1.5rem', letterSpacing: '0.5em', textAlign: 'center', fontWeight: 800, outline: 'none' }}
            />

            {error && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px', color: '#dc2626', fontSize: '0.82rem' }}>
                <AlertTriangle size={14} /> {error}
              </div>
            )}

            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.length !== 6}
              style={{
                width: '100%', marginTop: '20px', padding: '12px', background: otp.length === 6 ? '#16a34a' : '#94a3b8',
                color: '#fff', border: 'none', borderRadius: '8px', fontSize: '0.95rem', fontWeight: 700,
                cursor: otp.length === 6 ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Shield size={18} />}
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>

            {/* Resend OTP with countdown */}
            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.82rem', color: '#64748b' }}>
              {resendTimer > 0 ? (
                <span>Resend OTP in <strong style={{ color: '#0284c7' }}>{resendTimer}s</strong></span>
              ) : (
                <button onClick={handleResendOtp} style={{ background: 'none', border: 'none', color: '#0284c7', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>
                  Resend OTP
                </button>
              )}
            </div>
          </div>
        )}

        {/* ==================== Step 3: Success ==================== */}
        {step === 'success' && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <CheckCircle2 size={56} style={{ color: '#16a34a', margin: '0 auto 16px auto' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a' }}>Login Successful!</h3>
            <p style={{ color: '#64748b', marginTop: '6px' }}>Welcome, Citizen +91-{mobile}</p>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid #e2e8f0', fontSize: '0.72rem', color: '#94a3b8', textAlign: 'center' }}>
          Secured by SamriddhiAI • NSFDC Portal • Ministry of Social Justice & Empowerment
        </div>
      </div>
    </div>
  );
};

export default OtpLoginModal;
