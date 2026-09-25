import React from 'react';
import {
  Compass,
  Calculator,
  MapPin,
  FileCheck2,
  Globe,
  Volume2,
  VolumeX,
  Cpu,
  Sparkles,
  ShieldCheck,
  Landmark
} from 'lucide-react';
import { Language, TranslationStrings } from '../utils/translations';

export type AppTab = 'recommender' | 'calculator' | 'locator' | 'ekyc' | 'banker' | 'dossier';

interface NavbarProps {
  currentTab: AppTab;
  setCurrentTab: (tab: AppTab) => void;
  lang: Language;
  setLang: (lang: Language) => void;
  t: TranslationStrings;
  isVoiceActive: boolean;
  toggleVoice: () => void;
  onOpenAiSettings?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  lang,
  setLang,
  t,
  isVoiceActive,
  toggleVoice,
  onOpenAiSettings
}) => {
  return (
    <>
      {/* Sticky Primary Navigation Header */}
      <header className="navbar">
        <div className="app-container nav-content">
          <div className="brand-wrapper" onClick={() => setCurrentTab('recommender')}>
            {/* National Ashoka Emblem Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '40px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 0 100 120" width="36" height="44" fill="#0f172a">
                  {/* Ashoka Stambh Lion Capital Representation */}
                  <path d="M50 10 C40 10, 35 20, 35 32 C35 44, 42 50, 50 52 C58 50, 65 44, 65 32 C65 20, 60 10, 50 10 Z" fill="#0369a1"/>
                  <circle cx="50" cy="30" r="12" fill="#ffffff"/>
                  <circle cx="50" cy="30" r="6" fill="#0369a1"/>
                  {/* Pillar Base & Abacus */}
                  <rect x="25" y="56" width="50" height="8" rx="2" fill="#0f172a"/>
                  <circle cx="50" cy="60" r="3" fill="#ffffff"/>
                  <rect x="30" y="66" width="40" height="20" rx="3" fill="#0369a1"/>
                  <text x="50" y="80" fontSize="8" fontWeight="bold" fill="#ffffff" textAnchor="middle">सत्यमेव जयते</text>
                  <rect x="20" y="88" width="60" height="6" rx="2" fill="#0f172a"/>
                </svg>
              </div>

              <div>
                <div className="brand-title">
                  <span>SamriddhiAI</span>
                  <span style={{ fontSize: '0.65rem', background: 'linear-gradient(135deg, #f97316, #f43f5e 45%, #138808)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: 800, letterSpacing: '0.03em' }}>
                    GOVT PORTAL
                  </span>
                </div>
                <div className="brand-subtitle">
                  National Scheduled Castes Finance & Development Corporation (NSFDC)
                </div>
              </div>
            </div>
          </div>

          <nav className="nav-links">
            <button
              className={`nav-btn ${currentTab === 'recommender' ? 'active' : ''}`}
              onClick={() => setCurrentTab('recommender')}
            >
              <Compass size={16} />
              {t.navRecommender}
            </button>
            <button
              className={`nav-btn ${currentTab === 'calculator' ? 'active' : ''}`}
              onClick={() => setCurrentTab('calculator')}
            >
              <Calculator size={16} />
              {t.navCalculator}
            </button>
            <button
              className={`nav-btn ${currentTab === 'locator' ? 'active' : ''}`}
              onClick={() => setCurrentTab('locator')}
            >
              <MapPin size={16} />
              {t.navLocator}
            </button>
            <button
              className={`nav-btn ${currentTab === 'ekyc' ? 'active' : ''}`}
              onClick={() => setCurrentTab('ekyc')}
              style={{ borderBottom: currentTab === 'ekyc' ? '2px solid #FF9933' : 'none' }}
            >
              <ShieldCheck size={16} className="text-[#FF9933]" />
              <span>{lang === 'hi' ? 'आधार e-KYC' : 'Offline e-KYC'}</span>
            </button>
            <button
              className={`nav-btn ${currentTab === 'banker' ? 'active' : ''}`}
              onClick={() => setCurrentTab('banker')}
              style={{ borderBottom: currentTab === 'banker' ? '2px solid #38bdf8' : 'none' }}
            >
              <Landmark size={16} className="text-sky-400" />
              <span>{lang === 'hi' ? 'शाखा प्रबंधक (Banker)' : 'Banker Portal'}</span>
            </button>
            <button
              className={`nav-btn ${currentTab === 'dossier' ? 'active' : ''}`}
              onClick={() => setCurrentTab('dossier')}
            >
              <FileCheck2 size={16} />
              {t.navDossier}
            </button>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {onOpenAiSettings && (
              <button
                onClick={onOpenAiSettings}
                className="voice-trigger-btn"
                style={{ borderColor: '#0284c7', color: '#0284c7' }}
                title="Configure Gemini & AI Multi-Provider settings"
              >
                <Cpu size={14} />
                <span>AI इंजन (AI Config)</span>
              </button>
            )}

            {/* Voice Assistant Toggle */}
            <button
              onClick={toggleVoice}
              className={`voice-trigger-btn ${isVoiceActive ? 'speaking' : ''}`}
              title="Citizen Assistance Desk"
            >
              {isVoiceActive ? <VolumeX size={15} /> : <Volume2 size={15} color="#0284c7" />}
              <span>{isVoiceActive ? 'Stop Voice' : 'नागरिक सहायता कक्ष (Citizen Voice)'}</span>
            </button>

            {/* Language Selector */}
            <div className="lang-selector">
              <Globe size={14} style={{ color: '#64748b', marginLeft: '4px' }} />
              <button
                className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
                onClick={() => setLang('en')}
              >
                English
              </button>
              <button
                className={`lang-btn ${lang === 'hi' ? 'active' : ''}`}
                onClick={() => setLang('hi')}
              >
                हिन्दी
              </button>
              <button
                className={`lang-btn ${lang === 'ta' ? 'active' : ''}`}
                onClick={() => setLang('ta')}
              >
                தமிழ்
              </button>
              <button
                className={`lang-btn ${lang === 'mr' ? 'active' : ''}`}
                onClick={() => setLang('mr')}
              >
                मराठी
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
