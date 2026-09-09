import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  IndianRupee, 
  Percent, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  BarChart3, 
  Table, 
  ChevronRight,
  Info,
  Sparkles
} from 'lucide-react';
import { calculateConcessionalLoan, formatIndianCurrency } from '../utils/calculator';
import { TranslationStrings, Language } from '../utils/translations';
import { Scheme, AmortizationRow } from '../types';
import { AudioExplainButton } from './AudioExplainButton';


interface CalculatorSectionProps {
  t: TranslationStrings;
  lang?: Language;
  prefillScheme?: Scheme | null;
  initialCost?: number;
  initialRate?: number;
  initialTenure?: number;
  initialMoratorium?: number;
  onNavigateToLocator: () => void;
}

export const CalculatorSection: React.FC<CalculatorSectionProps> = ({
  t,
  lang = 'hi',
  prefillScheme,
  initialCost = 500000,
  initialRate = 6.5,
  initialTenure = 5,
  initialMoratorium = 6,
  onNavigateToLocator
}) => {

  const [projectCost, setProjectCost] = useState<number>(initialCost);
  const [assistancePct, setAssistancePct] = useState<number>(90);
  const [interestRate, setInterestRate] = useState<number>(initialRate);
  const [tenureYears, setTenureYears] = useState<number>(initialTenure);
  const [moratoriumMonths, setMoratoriumMonths] = useState<number>(initialMoratorium);
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);

  // Re-calculate live summary
  const summary = useMemo(() => {
    return calculateConcessionalLoan(
      projectCost,
      assistancePct,
      interestRate,
      tenureYears,
      moratoriumMonths
    );
  }, [projectCost, assistancePct, interestRate, tenureYears, moratoriumMonths]);

  // Proportions for visual stacked bar
  const totalFinancialVolume = summary.loanAmount + summary.totalInterestPayable + summary.promoterContribution;
  const loanPct = Math.round((summary.loanAmount / totalFinancialVolume) * 100);
  const interestPct = Math.round((summary.totalInterestPayable / totalFinancialVolume) * 100);
  const promoterPct = Math.round((summary.promoterContribution / totalFinancialVolume) * 100);

  return (
    <section id="calculator-section" style={{ padding: '36px 0 60px 0' }}>
      <div className="app-container">
        <div className="section-header">
          <div className="section-tag">
            <Calculator size={16} />
            <span>Financial Engine</span>
          </div>
          <h2 className="section-heading">{t.calcHeader}</h2>
          <p className="section-subheading">{t.calcSubheader}</p>
        </div>

        {/* Selected Scheme Notification Banner if passed */}
        {prefillScheme && (
          <div
            style={{
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: '12px',
              padding: '12px 20px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sparkles size={18} style={{ color: '#38bdf8' }} />
              <span style={{ fontSize: '0.9rem', color: '#e0f2fe' }}>
                Simulating active parameters for: <strong>{prefillScheme.name} ({prefillScheme.code})</strong>
              </span>
            </div>
            <span style={{ fontSize: '0.78rem', background: '#38bdf8', color: '#0b1120', padding: '2px 8px', borderRadius: '4px', fontWeight: 700 }}>
              Scheme Preset
            </span>
          </div>
        )}

        <div className="calc-layout">
          {/* Controls Form Card */}
          <div className="glass-card" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={20} style={{ color: '#38bdf8' }} />
              <span>Project & Loan Parameters</span>
            </h3>

            {/* 1. Project Cost */}
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <div className="form-label">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span>{t.lblCostSlider}</span>
                  <AudioExplainButton termKey="promoter_equity" lang={lang} />
                </div>
                <strong style={{ color: '#0284c7', fontSize: '1.15rem' }}>
                  {formatIndianCurrency(projectCost)}
                </strong>
              </div>
              <input
                type="range"
                className="range-slider"
                min={50000}
                max={5000000}
                step={25000}
                value={projectCost}
                onChange={(e) => setProjectCost(Number(e.target.value))}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                {[140000, 500000, 1000000, 2500000, 5000000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    style={{
                      background: projectCost === val ? '#e0f2fe' : '#ffffff',
                      border: projectCost === val ? '2px solid #0284c7' : '1px solid #cbd5e1',
                      color: projectCost === val ? '#0369a1' : '#475569',
                      fontSize: '0.75rem',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setProjectCost(val)}
                  >
                    ₹{(val / 100000).toFixed(val < 1000000 ? 1 : 0)}L
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Assistance Share Percentage (90% standard) */}
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <div className="form-label">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span>{t.lblAssistancePct}</span>
                  <AudioExplainButton termKey="max_assistance" lang={lang} />
                </div>
                <strong style={{ color: '#16a34a', fontSize: '1.05rem' }}>
                  {assistancePct}% Assistance (10% Promoter)
                </strong>
              </div>
              <input
                type="range"
                className="range-slider"
                min={70}
                max={95}
                step={5}
                value={assistancePct}
                onChange={(e) => setAssistancePct(Number(e.target.value))}
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                * Under NSFDC & SCA guidelines, concessional assistance covers up to 90% of total unit cost.
              </span>
            </div>

            {/* 3. Interest Rate */}
            <div className="form-group" style={{ marginBottom: '24px' }}>
              <div className="form-label">
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span>{t.lblRateSlider}</span>
                  <AudioExplainButton termKey="concessional_rate" lang={lang} />
                </div>
                <strong style={{ color: '#ea580c', fontSize: '1.15rem' }}>
                  {interestRate}% p.a.
                </strong>
              </div>
              <input
                type="range"
                className="range-slider"
                min={5.0}
                max={15.0}
                step={0.5}
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                {[5.0, 6.5, 7.5, 9.0, 12.0].map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    style={{
                      background: interestRate === rate ? '#ffedd5' : '#ffffff',
                      border: interestRate === rate ? '2px solid #ea580c' : '1px solid #cbd5e1',
                      color: interestRate === rate ? '#c2410c' : '#475569',
                      fontSize: '0.75rem',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setInterestRate(rate)}
                  >
                    {rate}% {rate <= 6.5 ? '(Concessional)' : rate === 7.5 ? '(Term Loan)' : '(Commercial)'}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Tenure & Moratorium Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <div className="form-label">
                  <span>{t.lblTenureSlider}</span>
                  <strong style={{ color: '#0f172a' }}>{tenureYears} Years</strong>
                </div>
                <input
                  type="range"
                  className="range-slider"
                  min={1}
                  max={10}
                  step={1}
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                />
              </div>

              <div className="form-group">
                <div className="form-label">
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span>{t.lblMoratoriumSlider}</span>
                    <AudioExplainButton termKey="moratorium_period" lang={lang} />
                  </div>
                  <strong style={{ color: '#0284c7' }}>{moratoriumMonths} Months</strong>
                </div>
                <input
                  type="range"
                  className="range-slider"
                  min={0}
                  max={24}
                  step={3}
                  value={moratoriumMonths}
                  onChange={(e) => setMoratoriumMonths(Number(e.target.value))}
                />
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '6px' }}>
              * During the {moratoriumMonths}-month moratorium, only simple interest of approximately {formatIndianCurrency(summary.moratoriumInterestMonthly)}/month is applicable. Full EMI commences in month {moratoriumMonths + 1}.
            </div>
          </div>

          {/* Results Summary Card */}
          <div className="calc-summary-panel">
            <div className="emi-highlight-box" style={{ background: '#f0f9ff', border: '2px solid #0284c7', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div className="emi-subtext" style={{ color: '#0369a1', fontWeight: 700 }}>{t.resMonthlyEmi}</div>
                <AudioExplainButton termKey="monthly_emi" lang={lang} label={lang === 'hi' ? 'किस्त समझें' : 'Explain EMI'} />
              </div>
              <div className="emi-amount" style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a' }}>{formatIndianCurrency(summary.monthlyEmi)}</div>
              <div style={{ fontSize: '0.75rem', color: '#16a34a', marginTop: '4px', fontWeight: 600 }}>
                Effective repayment over {(summary.tenureYears * 12) - summary.moratoriumMonths} active months
              </div>
            </div>

            {/* Visual Ratio Stacked Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>
                <span>Financial Composition</span>
                <span>{loanPct}% Loan | {promoterPct}% Equity | {interestPct}% Interest</span>
              </div>
              <div className="bar-progress-container">
                <div className="bar-segment-loan" style={{ width: `${loanPct}%` }} title={`Loan Principal: ${loanPct}%`} />
                <div className="bar-segment-promoter" style={{ width: `${promoterPct}%` }} title={`Promoter Equity: ${promoterPct}%`} />
                <div className="bar-segment-interest" style={{ width: `${interestPct}%` }} title={`Total Interest: ${interestPct}%`} />
              </div>
            </div>

            {/* Key Row Figures */}
            <div style={{ marginBottom: '24px' }}>
              <div className="calc-breakdown-row">
                <span className="calc-breakdown-label">
                  <ShieldCheck size={16} style={{ color: '#38bdf8' }} />
                  {t.resLoanAmount}
                </span>
                <span className="calc-breakdown-val" style={{ color: '#38bdf8' }}>
                  {formatIndianCurrency(summary.loanAmount)}
                </span>
              </div>

              <div className="calc-breakdown-row">
                <span className="calc-breakdown-label">
                  <IndianRupee size={16} style={{ color: '#fbbf24' }} />
                  {t.resPromoterShare}
                </span>
                <span className="calc-breakdown-val" style={{ color: '#fbbf24' }}>
                  {formatIndianCurrency(summary.promoterContribution)}
                </span>
              </div>

              <div className="calc-breakdown-row">
                <span className="calc-breakdown-label">
                  <Clock size={16} style={{ color: '#a5b4fc' }} />
                  Interest During Moratorium ({summary.moratoriumMonths} mo)
                </span>
                <span className="calc-breakdown-val">
                  {formatIndianCurrency(summary.moratoriumInterestMonthly * summary.moratoriumMonths)}
                </span>
              </div>

              <div className="calc-breakdown-row">
                <span className="calc-breakdown-label">
                  <Percent size={16} style={{ color: '#f43f5e' }} />
                  {t.resTotalInterest}
                </span>
                <span className="calc-breakdown-val" style={{ color: '#f43f5e' }}>
                  {formatIndianCurrency(summary.totalInterestPayable)}
                </span>
              </div>

              <div className="calc-breakdown-row" style={{ paddingTop: '14px', borderTop: '1px solid rgba(56, 189, 248, 0.2)' }}>
                <span className="calc-breakdown-label" style={{ color: '#fff', fontWeight: 700 }}>
                  {t.resTotalRepayable}
                </span>
                <span className="calc-breakdown-val" style={{ fontSize: '1.2rem', color: '#34d399' }}>
                  {formatIndianCurrency(summary.totalAmountPayable)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setShowScheduleModal(true)}
              >
                <Table size={16} />
                <span>{t.btnViewAmortization}</span>
              </button>

              <button
                type="button"
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={onNavigateToLocator}
              >
                <span>Find Eligible Channel Partners for this Loan</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Full Amortization Schedule Modal */}
        {showScheduleModal && (
          <div className="modal-overlay" onClick={() => setShowScheduleModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '820px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '1.4rem', color: '#fff' }}>Detailed Repayment & Amortization Schedule</h3>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                    Project Cost: {formatIndianCurrency(summary.projectCost)} | Loan: {formatIndianCurrency(summary.loanAmount)} | Rate: {summary.interestRate}% p.a.
                  </div>
                </div>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ maxHeight: '420px', overflowY: 'auto', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'right' }}>
                  <thead>
                    <tr style={{ background: '#1e293b', color: '#38bdf8', position: 'sticky', top: 0 }}>
                      <th style={{ padding: '10px 14px', textAlign: 'left' }}>Month</th>
                      <th style={{ padding: '10px 14px' }}>Opening Balance</th>
                      <th style={{ padding: '10px 14px' }}>Principal Paid</th>
                      <th style={{ padding: '10px 14px' }}>Interest Paid</th>
                      <th style={{ padding: '10px 14px' }}>Total EMI</th>
                      <th style={{ padding: '10px 14px' }}>Closing Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.schedule.map((row: any) => (
                      <tr
                        key={row.month}
                        style={{
                          background: row.isMoratorium ? 'rgba(245, 158, 11, 0.06)' : row.month % 2 === 0 ? 'rgba(15, 23, 42, 0.4)' : 'transparent',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                        }}
                      >
                        <td style={{ padding: '8px 14px', textAlign: 'left', color: row.isMoratorium ? '#fbbf24' : '#fff' }}>
                          M{row.month} {row.isMoratorium ? '(Moratorium)' : ''}
                        </td>
                        <td style={{ padding: '8px 14px', color: '#94a3b8' }}>{formatIndianCurrency(row.beginningBalance)}</td>
                        <td style={{ padding: '8px 14px', color: '#34d399' }}>{formatIndianCurrency(row.principalPayment)}</td>
                        <td style={{ padding: '8px 14px', color: '#f43f5e' }}>{formatIndianCurrency(row.interestPayment)}</td>
                        <td style={{ padding: '8px 14px', fontWeight: 700, color: '#38bdf8' }}>{formatIndianCurrency(row.totalPayment)}</td>
                        <td style={{ padding: '8px 14px', color: '#fff' }}>{formatIndianCurrency(row.endingBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <button className="btn-secondary" onClick={() => setShowScheduleModal(false)}>
                  Close Schedule
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
