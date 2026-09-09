import React, { useMemo, useState } from 'react';
import { CheckCircle2, GitCompare, Star } from 'lucide-react';
import { SchemeRecommendation } from '../types';
import { formatIndianCurrency } from '../utils/calculator';

interface Props { recommendations: SchemeRecommendation[]; }

export const SchemeComparison: React.FC<Props> = ({ recommendations }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(recommendations.slice(0, 3).map(item => item.scheme.id));
  const selected = useMemo(() => recommendations.filter(item => selectedIds.includes(item.scheme.id)).slice(0, 3), [recommendations, selectedIds]);
  const best = selected.length ? {
    emi: selected.reduce((a, b) => a.estimatedMonthlyEmi < b.estimatedMonthlyEmi ? a : b),
    subsidy: selected.reduce((a, b) => a.scheme.maxAssistancePct > b.scheme.maxAssistancePct ? a : b),
    speed: selected.reduce((a, b) => a.scheme.maxMoratoriumMonths < b.scheme.maxMoratoriumMonths ? a : b),
    contribution: selected.reduce((a, b) => a.promoterContribution < b.promoterContribution ? a : b)
  } : null;

  const toggle = (id: string) => setSelectedIds(current => current.includes(id) ? current.filter(value => value !== id) : current.length < 3 ? [...current, id] : current);

  return <div className="glass-card" style={{ padding: '24px', marginTop: '28px' }}>
    <h3 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}><GitCompare size={20} color="#38bdf8" /> Compare schemes</h3>
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
      {recommendations.map(item => <label key={item.scheme.id} style={{ padding: '7px 10px', border: '1px solid #334155', borderRadius: '8px', color: '#cbd5e1', fontSize: '0.8rem' }}><input type="checkbox" checked={selectedIds.includes(item.scheme.id)} onChange={() => toggle(item.scheme.id)} /> {item.scheme.code}</label>)}
    </div>
    {selected.length > 0 && <div style={{ overflowX: 'auto' }}><table style={{ width: '100%', minWidth: '640', borderCollapse: 'collapse', fontSize: '0.82rem' }}><thead><tr><th style={{ textAlign: 'left', padding: '8px', color: '#94a3b8' }}>Feature</th>{selected.map(item => <th key={item.scheme.id} style={{ textAlign: 'right', padding: '8px', color: '#38bdf8' }}>{item.scheme.name}</th>)}</tr></thead><tbody>{[
      ['Maximum loan', (item: SchemeRecommendation) => formatIndianCurrency(item.eligibleLoanAmount)],
      ['Interest', (item: SchemeRecommendation) => `${item.effectiveInterestRate}% p.a.`],
      ['Assistance / subsidy', (item: SchemeRecommendation) => `${item.scheme.maxAssistancePct}%`],
      ['Moratorium', (item: SchemeRecommendation) => `${item.scheme.maxMoratoriumMonths} months`],
      ['Promoter contribution', (item: SchemeRecommendation) => formatIndianCurrency(item.promoterContribution)],
      ['Estimated EMI', (item: SchemeRecommendation) => formatIndianCurrency(item.estimatedMonthlyEmi)]
    ].map(([label, value]) => <tr key={label as string} style={{ borderTop: '1px solid #1e293b' }}><td style={{ padding: '8px', color: '#cbd5e1' }}>{label as string}</td>{selected.map(item => <td key={item.scheme.id} style={{ textAlign: 'right', padding: '8px', color: '#fff' }}>{(value as (item: SchemeRecommendation) => string)(item)}</td>)}</tr>)}</tbody></table></div>}
    {best && <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>{[['Lowest EMI', best.emi], ['Highest assistance', best.subsidy], ['Fastest setup', best.speed], ['Lowest promoter contribution', best.contribution]].map(([label, item]) => <span key={label as string} style={{ padding: '6px 9px', borderRadius: '16px', background: 'rgba(16,185,129,.12)', color: '#a7f3d0', fontSize: '0.75rem' }}><Star size={12} style={{ verticalAlign: 'middle' }} /> {label as string}: {(item as SchemeRecommendation).scheme.code}</span>)}</div>}
    <div style={{ color: '#64748b', fontSize: '0.72rem', marginTop: '12px' }}>Comparison is an estimate. Confirm current terms, subsidy, and application route with the official implementing agency.</div>
  </div>;
};
