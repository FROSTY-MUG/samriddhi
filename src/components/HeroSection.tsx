import { TranslationStrings, Language } from '../utils/translations';
import { AudioExplainButton } from './AudioExplainButton';
import { ShieldCheck, Compass, Calculator, CheckCircle2, Landmark, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  t: TranslationStrings;
  lang: Language;
  onExploreRecommender: () => void;
  onExploreCalculator: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  t,
  lang,
  onExploreRecommender,
  onExploreCalculator
}) => {

  return (
    <section className="hero-section">
      <div className="app-container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '36px', alignItems: 'center', marginBottom: '36px' }}>
          {/* Left Column: Mission & CTAs */}
          <div>
            <div className="hero-badge">
              <ShieldCheck size={16} />
              <span>{t.heroBadge}</span>
            </div>

            <h1 className="hero-title" style={{ fontSize: '2.4rem', fontWeight: 800, color: '#0f172a', lineHeight: '1.2' }}>
              {t.heroHeadline}
            </h1>

            <p className="hero-desc" style={{ fontSize: '1.05rem', color: '#475569', lineHeight: '1.6', marginBottom: '24px' }}>
              {t.heroSubheadline}
            </p>

            <div className="hero-actions" style={{ marginBottom: '20px' }}>
              <button className="btn-primary" onClick={onExploreRecommender}>
                <Compass size={18} />
                <span>{t.heroCta1}</span>
              </button>
              <button className="btn-secondary" onClick={onExploreCalculator}>
                <Calculator size={18} />
                <span>{t.heroCta2}</span>
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem', color: '#64748b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} color="#16a34a" />
                <span>Up to 90% Concessional Credit</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 size={16} color="#16a34a" />
                <span>Interest from 5.0% p.a.</span>
              </div>
            </div>
          </div>

          {/* Right Column: Official PM Narendra Modi Vision Card */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
                maxWidth: '460px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* National Tricolor Top Line */}
              <div style={{ height: '3px', background: 'linear-gradient(90deg, #ff9933, #ffffff, #138808)', position: 'absolute', top: 0, left: 0, right: 0 }} />

              <div style={{ display: 'flex', gap: '18px', alignItems: 'flex-start', marginBottom: '16px' }}>
                <img
                  src="/modi-portrait.png"
                  alt="Shri Narendra Modi, Prime Minister of India"
                  style={{
                    width: '104px',
                    height: '126px',
                    objectFit: 'cover',
                    objectPosition: 'center top',
                    borderRadius: '8px',
                    border: '2px solid #e2e8f0',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                    flexShrink: 0
                  }}
                />

                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>
                    Leadership Vision
                  </div>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', margin: '0 0 2px 0' }}>
                    Shri Narendra Modi
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: '#64748b', margin: '0 0 10px 0' }}>
                    Hon'ble Prime Minister of India
                  </p>

                  <div style={{ background: '#f8fafc', borderLeft: '3px solid #0284c7', padding: '6px 10px', borderRadius: '0 6px 6px 0', fontSize: '0.78rem', color: '#334155', fontStyle: 'italic', lineHeight: '1.4' }}>
                    "Empowering every aspiring entrepreneur with accessible credit and dignity — Sabka Saath, Sabka Vikas, Sabka Vishwas, Sabka Prayas."
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.72rem', color: '#64748b' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Landmark size={14} color="#138808" />
                  <span>Digital India & Jan Dhan Mission</span>
                </div>
                <span style={{ fontWeight: 700, color: '#138808' }}>भारत सरकार • Govt of India Initiative</span>
              </div>
            </div>
          </div>

          {/* Official Tricolor Accreditation Banner */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginTop: '10px', padding: '12px 16px', background: 'linear-gradient(90deg, #fff7ed, #ffffff 40%, #f0fdf4)', border: '1px solid #fed7aa', borderLeft: '4px solid #f97316', borderRadius: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg viewBox="0 0 100 100" width="28" height="28" aria-hidden="true">
                <circle cx="50" cy="50" r="44" fill="none" stroke="#0369a1" strokeWidth="7"/>
                <circle cx="50" cy="50" r="30" fill="none" stroke="#0369a1" strokeWidth="2"/>
                {Array.from({ length: 12 }).map((_, i) => {
                  const a = (i * 30 * Math.PI) / 180;
                  return <line key={i} x1={50 + 38 * Math.cos(a)} y1={50 + 38 * Math.sin(a)} x2={50 + 44 * Math.cos(a)} y2={50 + 44 * Math.sin(a)} stroke="#0369a1" strokeWidth="3"/>;
                })}
                <line x1="50" y1="22" x2="50" y2="78" stroke="#0369a1" strokeWidth="2"/>
                <line x1="22" y1="50" x2="78" y2="50" stroke="#0369a1" strokeWidth="2"/>
              </svg>
              <div style={{ fontSize: '0.78rem', color: '#334155', lineHeight: '1.45' }}>
                <strong style={{ color: '#b45309' }}>National Policy Accreditation:</strong><br/>
                Aligned with Digital India • Make in India • Jan Dhan & Financial Inclusion drives of the Government of India
              </div>
            </div>
            <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#15803d', textAlign: 'right' }}>
              मेरी योजना, मेरा अधिकार<br/>My Scheme • My Right
            </div>
          </div>
        </div>

        {/* 4 Core Pillars of Concessional Lending */}
        <div className="stats-grid">
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="stat-value amber">{t.statIncomeLimit}</div>
              <AudioExplainButton termKey="income_limit" lang={lang} />
            </div>
            <div className="stat-label">{t.statIncomeLabel}</div>
          </div>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="stat-value cyan">{t.statAssistance}</div>
              <AudioExplainButton termKey="max_assistance" lang={lang} />
            </div>
            <div className="stat-label">{t.statAssistanceLabel}</div>
          </div>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="stat-value emerald">{t.statInterest}</div>
              <AudioExplainButton termKey="concessional_rate" lang={lang} />
            </div>
            <div className="stat-label">{t.statInterestLabel}</div>
          </div>
          <div className="stat-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div className="stat-value indigo">{t.statPartners}</div>
              <AudioExplainButton termKey="channel_partner" lang={lang} />
            </div>
            <div className="stat-label">{t.statPartnersLabel}</div>
          </div>
        </div>

        {/* Channel Finance Routing Note */}
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #cbd5e1',
            borderRadius: '12px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            fontSize: '0.88rem',
            color: '#334155',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}
        >
          <Sparkles size={22} style={{ color: '#0284c7', flexShrink: 0 }} />
          <span>
            <strong style={{ color: '#0f172a' }}>National Channel Finance Dispatch Router:</strong> Applications are routed through 100+ accredited Channel Partners (State Channelizing Agencies, Public Sector Banks, RRBs, NBFC-MFIs). The platform verifies live unutilized fund quotas and clean NPA compliance to ensure fast sanctioning.
          </span>
        </div>
      </div>
    </section>
  );
};
