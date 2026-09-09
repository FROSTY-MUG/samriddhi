import React from 'react';
import { 
  FileCheck2, 
  Printer, 
  Download, 
  CheckCircle2, 
  Building2, 
  Landmark, 
  ShieldCheck, 
  User, 
  Calendar,
  Sparkles,
  QrCode,
  Share2
} from 'lucide-react';
import { ChannelPartner, Scheme } from '../types';
import { formatIndianCurrency } from '../utils/calculator';
import { TranslationStrings } from '../utils/translations';

import { generateDossierPdf } from '../utils/pdfGenerator';

interface ApplicationDossierModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner?: ChannelPartner | null;
  scheme?: Scheme | null;
  projectCost?: number;
  loanAmount?: number;
  promoterEquity?: number;
  interestRate?: number;
  applicantName?: string;
  t: TranslationStrings;
}


export const ApplicationDossierModal: React.FC<ApplicationDossierModalProps> = ({
  isOpen,
  onClose,
  partner,
  scheme,
  projectCost = 500000,
  loanAmount = 450000,
  promoterEquity = 50000,
  interestRate = 6.5,
  applicantName = 'Ravi Shankar Kumar',
  t
}) => {
  if (!isOpen) return null;

  const routingToken = `SAM-2026-SC-${Math.floor(1000 + Math.random() * 9000)}`;
  const currentDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '780px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileCheck2 size={22} style={{ color: '#38bdf8' }} />
            <h3 style={{ fontSize: '1.3rem', color: '#fff' }}>Official Digital Routing Dossier</h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        {/* Printable Paper Document */}
        <div className="dossier-paper" id="printable-dossier">
          {/* Header */}
          <div className="dossier-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <Landmark size={22} color="#0f172a" />
                <strong style={{ fontSize: '1.2rem', color: '#0f172a' }}>SamriddhiAI Concessional Credit Portal</strong>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#475569' }}>
                Under the Aegis of National Scheduled Castes Finance & Development Corporation (NSFDC)
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#0369a1' }}>DIGITAL ROUTING TOKEN</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', letterSpacing: '0.05em' }}>{routingToken}</div>
              <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Date: {currentDate}</div>
            </div>
          </div>

          {/* Status Ribbon */}
          <div
            style={{
              background: '#ecfdf5',
              border: '1px solid #6ee7b7',
              borderRadius: '8px',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '18px',
              fontSize: '0.82rem',
              color: '#065f46'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
              <CheckCircle2 size={16} color="#059669" />
              <span>PRE-QUALIFIED: Concessional Interest Eligibility Verified (Income &lt; ₹5.00 Lakhs)</span>
            </div>
            <span style={{ fontSize: '0.75rem', background: '#059669', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              Direct Channel Route
            </span>
          </div>

          {/* Grid Information */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', fontSize: '0.85rem' }}>
            {/* Scheme Details */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
                1. Matched Concessional Scheme
              </div>
              <div style={{ marginBottom: '4px' }}><strong>Scheme:</strong> {scheme?.name || 'Micro Finance Scheme (MFS)'}</div>
              <div style={{ marginBottom: '4px' }}><strong>Scheme Code:</strong> {scheme?.code || 'NSFDC-MFS'}</div>
              <div style={{ marginBottom: '4px' }}><strong>Concessional Rate:</strong> {interestRate}% p.a.</div>
              <div><strong>Moratorium Period:</strong> {scheme?.maxMoratoriumMonths || 6} Months</div>
            </div>

            {/* Financial Appraisal Summary */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px' }}>
              <div style={{ fontWeight: 800, color: '#0f172a', marginBottom: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '4px' }}>
                2. Financial Assistance Blueprint
              </div>
              <div style={{ marginBottom: '4px' }}><strong>Total Project Cost:</strong> {formatIndianCurrency(projectCost)}</div>
              <div style={{ marginBottom: '4px', color: '#0284c7' }}><strong>Apex Concessional Loan (90%):</strong> {formatIndianCurrency(loanAmount)}</div>
              <div style={{ marginBottom: '4px', color: '#b45309' }}><strong>Beneficiary Equity (10%):</strong> {formatIndianCurrency(promoterEquity)}</div>
              <div><strong>Disbursement Mode:</strong> Direct Channel Bank Transfer</div>
            </div>
          </div>

          {/* Designated Channel Partner Branch Box */}
          <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Building2 size={18} color="#0284c7" />
              <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                Designated Channel Partner Branch: {partner?.name || 'State Channelizing Agency - Lead Branch'}
              </strong>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#475569', marginBottom: '8px' }}>
              {partner?.address || 'Ambedkar Bhawan, Connaught Circus, New Delhi - 110001'}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.78rem', color: '#334155' }}>
              <div><strong>Branch Nodal Officer:</strong> {partner?.nodalOfficer || 'Rajesh Meena (GM Credit)'}</div>
              <div><strong>Helpline:</strong> {partner?.phone || '+91-11-2334-1289'}</div>
              <div><strong>Active Fund Status:</strong> ₹{partner?.unutilizedFundCrores || 13.8} Cr Unutilized (Clean NPA)</div>
            </div>
          </div>

          {/* Instructions & Next Steps */}
          <div style={{ fontSize: '0.78rem', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '12px' }}>
            <strong>Action Steps for Beneficiary:</strong>
            <ol style={{ paddingLeft: '18px', marginTop: '4px' }}>
              <li>Carry this digital routing token with original Caste Certificate and Income Certificate (&le; ₹5.00 Lakhs).</li>
              <li>Present this QR token to the designated Nodal Officer at the Channel Partner branch above.</li>
              <li>Under NSFDC guidelines, this application is routed to pre-funded active credit lines for fast-track processing.</li>
            </ol>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button
            className="btn-primary"
            style={{ background: '#0284c7' }}
            onClick={() => {
              if (scheme) {
                generateDossierPdf({
                  applicantName,
                  scheme,
                  partner,
                  projectCost,
                  loanAmount,
                  promoterEquity,
                  interestRate,
                  routingToken
                });
              }
            }}
          >
            <Download size={16} />
            <span>Download PDF Dossier</span>
          </button>
          <button className="btn-primary" onClick={handlePrint}>
            <Printer size={16} />
            <span>Print</span>
          </button>
        </div>
      </div>
    </div>
  );
};
