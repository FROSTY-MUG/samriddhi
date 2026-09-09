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
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/Narendra_Modi_official_portrait%2C_2024.jpg/440px-Narendra_Modi_official_portrait%2C_2024.jpg"
                  alt="Shri Narendra Modi, Prime Minister of India"
                  style={{
                    width: '100px',
                    height: '120px',
                    objectFit: 'cover',
                    borderRadius: '10px',
                    border: '2px solid #e2e8f0',
                    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                    flexShrink: 0
                  }}
                  onError={(e) => {
                    // Fallback to high quality alternate portrait if wikimedia link throttled
                    (e.target as HTMLImageElement).src = 'https://www.pmindia.gov.in/wp-content/uploads/2022/12/PM-Modi-official-photo.jpg';
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
                  <Landmark size={14} color="#0284c7" />
                  <span>Digital India & Jan Dhan Mission</span>
                </div>
                <span style={{ fontWeight: 700, color: '#0284c7' }}>Govt of India Initiative</span>
              </div>
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
