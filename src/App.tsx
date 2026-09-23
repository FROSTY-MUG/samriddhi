import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { VoiceAssistantBar } from './components/VoiceAssistantBar';
import { HeroSection } from './components/HeroSection';
import { RecommenderSection } from './components/RecommenderSection';
import { CalculatorSection } from './components/CalculatorSection';
import { PartnerLocatorSection } from './components/PartnerLocatorSection';
import { ApplicationDossierModal } from './components/ApplicationDossierModal';
import { SchemeDetailsModal } from './components/SchemeDetailsModal';
import { Scheme, ChannelPartner } from './types';
import { TRANSLATIONS, Language } from './utils/translations';
import { SCHEMES_DATABASE } from './data/schemes';
import { CHANNEL_PARTNERS_DATABASE } from './data/partners';
import {
  Landmark,
  HeartHandshake,
  HelpCircle,
  ShieldCheck,
  PhoneCall,
  CheckCircle2,
  Award
} from 'lucide-react';

import { DocumentOcrModal } from './components/DocumentOcrModal';
import { AIConfigModal } from './components/AIConfigModal';
import { getStoredAIConfig } from './utils/aiMultiProviderRAG';
import { speakInstant, speakWithGeminiOptimized, stopAllVoice } from './utils/voiceService';

export function App() {
  const [currentTab, setCurrentTab] = useState<'recommender' | 'calculator' | 'locator' | 'dossier'>('recommender');
  const [lang, setLang] = useState<Language>('en');
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);
  const [voiceStatusText, setVoiceStatusText] = useState<string>('');
  const [isOcrOpen, setIsOcrOpen] = useState<boolean>(false);
  const [isAiSettingsOpen, setIsAiSettingsOpen] = useState<boolean>(false);
  const [applicantName, setApplicantName] = useState<string>('Ravi Shankar Kumar');



  // Cross-component state
  const [activeSchemeForCalc, setActiveSchemeForCalc] = useState<Scheme | null>(null);
  const [calcPrefillParams, setCalcPrefillParams] = useState({
    cost: 500000,
    rate: 6.5,
    tenure: 5,
    moratorium: 6
  });

  const [activeSchemeForLocator, setActiveSchemeForLocator] = useState<Scheme | null>(null);
  const [activePartnerForDossier, setActivePartnerForDossier] = useState<ChannelPartner | null>(CHANNEL_PARTNERS_DATABASE[0]);
  const [selectedSchemeForDocs, setSelectedSchemeForDocs] = useState<Scheme | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState<boolean>(false);

  const t = TRANSLATIONS[lang];

  // Ultra-low latency voice synthesis (< 20ms) with optional Gemini Cloud fallback
  const speakText = async (speechText: string) => {
    if (isVoiceActive) {
      stopAllVoice();
      setIsVoiceActive(false);
      setVoiceStatusText('');
      return;
    }

    setIsVoiceActive(true);
    setVoiceStatusText(speechText);

    const config = getStoredAIConfig();

    const voiceOptions = {
      lang,
      rate: 0.96,
      onStart: () => {
        setIsVoiceActive(true);
        setVoiceStatusText(speechText);
      },
      onEnd: () => {
        setIsVoiceActive(false);
        setVoiceStatusText('');
      },
      onError: () => {
        setIsVoiceActive(false);
        setVoiceStatusText('');
      }
    };

    if (config.voiceEngine === 'gemini' && config.geminiKey?.trim()) {
      await speakWithGeminiOptimized(speechText, config.geminiKey, 'Kore', voiceOptions);
    } else {
      const started = speakInstant(speechText, voiceOptions);
      if (!started) {
        setIsVoiceActive(false);
        setVoiceStatusText('');
        alert('Speech synthesis is not supported on this browser.');
      }
    }
  };

  const toggleVoice = () => {
    if (isVoiceActive) {
      stopAllVoice();
      setIsVoiceActive(false);
      setVoiceStatusText('');
      return;
    }

    const speechText = lang === 'hi'
      ? 'समृद्धि एआई में आपका स्वागत है। अपनी योजना और ऋण की जानकारी प्राप्त करने के लिए अपना व्यवसाय क्षेत्र और लागत चुनें।'
      : lang === 'ta'
      ? 'சம்ரிதி ஏஐக்கு வரவேற்கிறோம். அரசு திட்டங்கள் மற்றும் கடன் விவரங்களை அறிய உங்கள் தொழில் மற்றும் தொகையை தேர்வு செய்யவும்.'
      : lang === 'mr'
      ? 'समृद्धी एआय मध्ये आपले स्वागत आहे. सरकारी योजना आणि कर्ज सहाय्य मिळवण्यासाठी आपला व्यवसाय आणि अंदाजित खर्च निवडा.'
      : 'Welcome to SamriddhiAI. Select your sector and project cost to find government schemes and loan support.';
    void speakText(speechText);
  };

  // Switch to Calculator with selected scheme
  const handleSelectSchemeForCalc = (
    scheme: Scheme,
    cost: number,
    rate: number,
    tenure: number,
    moratorium: number
  ) => {
    setActiveSchemeForCalc(scheme);
    setCalcPrefillParams({ cost, rate, tenure, moratorium });
    setCurrentTab('calculator');
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  // Switch to Locator with selected scheme
  const handleSelectSchemeForLocator = (scheme: Scheme) => {
    setActiveSchemeForLocator(scheme);
    setCurrentTab('locator');
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  // Open Routing Dossier for a Partner
  const handleRouteToPartner = (partner: ChannelPartner) => {
    setActivePartnerForDossier(partner);
    setIsDossierOpen(true);
  };

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        lang={lang}
        setLang={setLang}
        t={t}
        isVoiceActive={isVoiceActive}
        toggleVoice={toggleVoice}
        onOpenAiSettings={() => setIsAiSettingsOpen(true)}
      />

      {/* Voice Assistant Banner */}
      <VoiceAssistantBar
        isVoiceActive={isVoiceActive}
        toggleVoice={toggleVoice}
        statusText={voiceStatusText}
        t={t}
      />

      {/* Hero Section */}
      <HeroSection
        t={t}
        lang={lang}
        onExploreRecommender={() => {
          setCurrentTab('recommender');
          document.getElementById('recommender-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onExploreCalculator={() => {
          setCurrentTab('calculator');
          document.getElementById('calculator-section')?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Main Tab Content */}
      <main>
        {currentTab === 'recommender' && (
          <RecommenderSection
            t={t}
            lang={lang}
            onSelectSchemeForCalc={handleSelectSchemeForCalc}
            onSelectSchemeForLocator={handleSelectSchemeForLocator}
            onViewDocuments={(scheme) => setSelectedSchemeForDocs(scheme)}
            onSpeakText={(text) => {
              void speakText(text);
            }}
            isSpeaking={isVoiceActive}
            onOpenOcr={() => setIsOcrOpen(true)}
            onOpenAiSettings={() => setIsAiSettingsOpen(true)}
          />
        )}

        {currentTab === 'calculator' && (
          <CalculatorSection
            t={t}
            lang={lang}
            prefillScheme={activeSchemeForCalc}
            initialCost={calcPrefillParams.cost}
            initialRate={calcPrefillParams.rate}
            initialTenure={calcPrefillParams.tenure}
            initialMoratorium={calcPrefillParams.moratorium}
            onNavigateToLocator={() => setCurrentTab('locator')}
          />
        )}

        {currentTab === 'locator' && (
          <PartnerLocatorSection
            t={t}
            lang={lang}
            selectedScheme={activeSchemeForLocator}
            onRouteToPartner={handleRouteToPartner}
          />
        )}

        {currentTab === 'dossier' && (
          <div className="app-container" style={{ padding: '60px 0', textAlign: 'center' }}>
            <div className="glass-card" style={{ maxWidth: '640px', margin: '0 auto', padding: '40px' }}>
              <Award size={48} style={{ color: '#38bdf8', margin: '0 auto 16px auto' }} />
              <h3 style={{ fontSize: '1.5rem', color: '#fff', marginBottom: '12px' }}>
                Verified Channel Dispatch Dossier
              </h3>
              <p style={{ fontSize: '0.9rem', color: '#94a3b8', lineHeight: '1.6', marginBottom: '24px' }}>
                Your pre-screening certificate routes your application directly to accredited Channel Partner branches with unutilized fund allocations and safe NPA health.
              </p>
              <button
                className="btn-primary"
                onClick={() => setIsDossierOpen(true)}
              >
                View & Print Current Active Dossier
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Documents Modal */}
      {selectedSchemeForDocs && (
        <SchemeDetailsModal
          scheme={selectedSchemeForDocs}
          onClose={() => setSelectedSchemeForDocs(null)}
        />
      )}

      {/* Application Dossier Modal */}
      <ApplicationDossierModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        partner={activePartnerForDossier}
        scheme={activeSchemeForCalc || SCHEMES_DATABASE[0]}
        projectCost={calcPrefillParams.cost}
        loanAmount={Math.round(calcPrefillParams.cost * 0.9)}
        promoterEquity={Math.round(calcPrefillParams.cost * 0.1)}
        interestRate={calcPrefillParams.rate}
        applicantName={applicantName}
        t={t}
      />

      {/* Document OCR Modal */}
      <DocumentOcrModal
        isOpen={isOcrOpen}
        onClose={() => setIsOcrOpen(false)}
        onAutoFillProfile={(extracted, name) => {
          if (name) setApplicantName(name);
        }}
        lang={lang}
      />

      {/* AI & RAG Configuration Modal */}
      <AIConfigModal
        isOpen={isAiSettingsOpen}
        onClose={() => setIsAiSettingsOpen(false)}
        lang={lang}
        onConfigUpdated={(config) => {
          console.log('AI Config updated:', config);
        }}
      />

      {/* Official Government of India Footer */}
      <footer
        style={{
          borderTop: '3px solid #0284c7',
          background: '#0f172a',
          padding: '48px 0 24px 0',
          marginTop: '60px',
          fontSize: '0.85rem',
          color: '#94a3b8'
        }}
      >
        <div className="app-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '32px', marginBottom: '36px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#fff', fontSize: '1.2rem', fontWeight: 800, marginBottom: '12px' }}>
                <Landmark size={22} style={{ color: '#38bdf8' }} />
                <span>SamriddhiAI</span>
              </div>
              <p style={{ lineHeight: '1.6', color: '#cbd5e1', fontSize: '0.85rem', marginBottom: '14px' }}>
                National AI-driven concessional finance matching and intelligent channel partner router for Scheduled Caste entrepreneurs under the aegis of NSFDC, Ministry of Social Justice & Empowerment, Government of India.
              </p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', padding: '4px 12px', borderRadius: '6px', fontSize: '0.75rem', color: '#38bdf8' }}>
                <span>Digital India Certified Portal</span>
              </div>
            </div>

            <div>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', borderBottom: '1px solid #334155', paddingBottom: '6px' }}>
                Concessional Loan Norms
              </h4>
              <ul style={{ listStyle: 'none', lineHeight: '2.1', fontSize: '0.85rem' }}>
                <li>✓ Annual Family Income: Up to ₹5.00 Lakhs</li>
                <li>✓ Financial Assistance: Up to 90% Unit Cost</li>
                <li>✓ Concessional Interest Rate: 5.0% – 8.0% p.a.</li>
                <li>✓ Moratorium Period: 6 to 12 Months</li>
              </ul>
            </div>

            <div>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', borderBottom: '1px solid #334155', paddingBottom: '6px' }}>
                National Portals
              </h4>
              <ul style={{ listStyle: 'none', lineHeight: '2.1', fontSize: '0.85rem' }}>
                <li><a href="https://india.gov.in" target="_blank" rel="noreferrer" style={{ color: '#94a3b8', textDecoration: 'none' }}>→ National Portal of India (india.gov.in)</a></li>
                <li><a href="https://nsfdc.nic.in" target="_blank" rel="noreferrer" style={{ color: '#94a3b8', textDecoration: 'none' }}>→ NSFDC Official Portal (nsfdc.nic.in)</a></li>
                <li><a href="https://jansamarth.in" target="_blank" rel="noreferrer" style={{ color: '#94a3b8', textDecoration: 'none' }}>→ JanSamarth National Credit Portal</a></li>
                <li><a href="https://mygov.in" target="_blank" rel="noreferrer" style={{ color: '#94a3b8', textDecoration: 'none' }}>→ MyGov Citizen Platform</a></li>
              </ul>
            </div>

            <div>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, marginBottom: '14px', borderBottom: '1px solid #334155', paddingBottom: '6px' }}>
                National Toll-Free Helpdesk
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', marginBottom: '8px', fontWeight: 800, fontSize: '1.05rem' }}>
                <PhoneCall size={18} />
                <span>1800-11-8866</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.5' }}>
                Direct Assistance: 011-22054394 / 22054396<br />
                Email: support@samriddhiai.gov.in<br />
                Working Hours: 9:30 AM – 6:00 PM (Mon – Sat)
              </p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid #1e293b', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '0.75rem' }}>
            <div>
              © 2026 SamriddhiAI. Designed & Maintained in compliance with Guidelines for Indian Government Websites (GIGW).
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <span>Privacy Policy</span>
              <span>Terms of Use</span>
              <span>Accessibility Statement</span>
              <span>Hyperlinking Policy</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
