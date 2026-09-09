import React, { useMemo, useState } from 'react';
import { calculateAdvancedLoan, CalculatorMode, formatIndianCurrency } from '../utils/calculator';

export const AdvancedCalculatorPreview: React.FC<{ projectCost: number }> = ({ projectCost }) => {
  const [mode, setMode] = useState<CalculatorMode>('reducing_balance');
  const [rate, setRate] = useState(6.5);
  const [assistance, setAssistance] = useState(90);
  const [tenure, setTenure] = useState(5);
  const [subsidy, setSubsidy] = useState(0);
  const [fees, setFees] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [existingEmi, setExistingEmi] = useState(0);
  const result = useMemo(() => calculateAdvancedLoan({ projectCost, annualInterestRate: rate, assistancePct: assistance, tenureYears: tenure, moratoriumMonths: 0, subsidyAmount: subsidy, processingFeePct: fees, monthlyIncome, existingEmi, mode }), [projectCost, rate, assistance, tenure, subsidy, fees, monthlyIncome, existingEmi, mode]);
  const field = (label: string, value: number, setter: (value: number) => void, step = 1) => <label style={{ color: '#cbd5e1', fontSize: '0.78rem' }}>{label}<input className="form-input" type="number" min="0" step={step} value={value} onChange={e => setter(Number(e.target.value))} /></label>;
  return <div style={{ marginTop: '18px' }}><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: '10px' }}>{field('Interest rate %', rate, setRate, 0.1)}{field('Assistance %', assistance, setAssistance)}{field('Tenure years', tenure, setTenure)}{field('Subsidy ₹', subsidy, setSubsidy)}{field('Processing fee %', fees, setFees, 0.1)}{field('Monthly income ₹', monthlyIncome, setMonthlyIncome)}{field('Existing EMI ₹', existingEmi, setExistingEmi)}</div><label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.78rem', marginTop: '10px' }}>Calculation mode<select className="form-select" value={mode} onChange={e => setMode(e.target.value as CalculatorMode)}><option value="reducing_balance">Reducing-balance EMI</option><option value="flat_interest">Flat interest</option><option value="subsidy_adjusted">Subsidy-adjusted loan</option><option value="prepayment">Prepayment scenario</option></select></label><div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '8px', color: '#a7f3d0', fontSize: '0.8rem' }}><span>Financed: {formatIndianCurrency(result.financedAmount)}</span><span>EMI: {formatIndianCurrency(result.monthlyEmi)}</span><span>Interest: {formatIndianCurrency(result.totalInterest)}</span><span>Total cost: {formatIndianCurrency(result.totalCost)}</span><span>Affordability: {result.affordability}</span></div><p style={{ color: '#64748b', fontSize: '0.7rem', marginTop: '10px' }}>Offline estimate only. Actual fees, subsidy crediting, GST, insurance, and bank terms must be confirmed with the official lender.</p></div>;
};
