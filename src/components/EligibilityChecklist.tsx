import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, ClipboardCheck } from 'lucide-react';
import { Scheme, UserInputProfile } from '../types';

interface Props { scheme: Scheme; profile: UserInputProfile; }
const DOCUMENTS = ['Aadhaar', 'PAN', 'Caste certificate', 'Income certificate', 'Address proof', 'Bank passbook', 'Business quotation', 'Education admission letter', 'Land or lease document'];

export const EligibilityChecklist: React.FC<Props> = ({ scheme, profile }) => {
  const [completed, setCompleted] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem(`docs_${scheme.id}`) || '[]'); } catch { return []; } });
  const toggle = (doc: string) => setCompleted(current => { const next = current.includes(doc) ? current.filter(item => item !== doc) : [...current, doc]; localStorage.setItem(`docs_${scheme.id}`, JSON.stringify(next)); return next; });
  const checks = useMemo(() => [
    { label: 'Annual income is within the scheme limit', ok: profile.annualIncome <= scheme.maxAnnualIncome },
    { label: 'Project cost is within the scheme limit', ok: profile.estimatedCost <= scheme.maxProjectCost },
    { label: 'State and district availability must be verified', ok: false, neutral: true },
    { label: 'Project type matches the scheme category', ok: profile.sector === scheme.category },
    { label: 'Caste certificate may be required', ok: false, neutral: true },
    { label: 'Aadhaar-linked bank account may be required', ok: false, neutral: true }
  ], [profile, scheme]);
  return <div className="glass-card" style={{ padding: '24px', marginTop: '24px' }}><h3 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}><ClipboardCheck size={20} color="#34d399" /> Eligibility & document readiness</h3><div style={{ margin: '14px 0', color: '#a7f3d0', fontWeight: 700 }}>Application readiness: {completed.length} / {DOCUMENTS.length} documents</div><div style={{ height: '8px', background: '#1e293b', borderRadius: '5px', marginBottom: '16px' }}><div style={{ height: '100%', width: `${completed.length / DOCUMENTS.length * 100}%`, background: '#10b981', borderRadius: '5px' }} /></div><div style={{ display: 'grid', gap: '8px' }}>{checks.map(check => <div key={check.label} style={{ color: check.neutral ? '#fbbf24' : check.ok ? '#34d399' : '#f87171', fontSize: '0.82rem' }}>{check.neutral ? <AlertTriangle size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} /> : <CheckCircle2 size={14} style={{ verticalAlign: 'middle', marginRight: '6px' }} />}{check.label}</div>)}</div><h4 style={{ color: '#cbd5e1', margin: '18px 0 8px' }}>Mark documents collected</h4><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: '6px' }}>{DOCUMENTS.map(doc => <label key={doc} style={{ color: '#cbd5e1', fontSize: '0.78rem' }}><input type="checkbox" checked={completed.includes(doc)} onChange={() => toggle(doc)} /> {doc}</label>)}</div><p style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '14px' }}>Eligibility is indicative. Confirm requirements with the official channelizing agency before submitting documents.</p></div>;
};
