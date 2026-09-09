import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Calculator,
  MapPin,
  FileText,
  Percent,
  Calendar,
  ArrowRight,
  RefreshCcw,
  IndianRupee,
  Users,
  Volume2,
  Key,
  FileUp,
  Cpu,
  Settings,
  TrendingUp,
  Lightbulb
} from 'lucide-react';
import { UserInputProfile, SchemeRecommendation, SectorType, EducationLevel, GenderType, Scheme } from '../types';
import { recommendSchemes } from '../utils/aiRecommender';
import { formatIndianCurrency } from '../utils/calculator';
import { TranslationStrings, Language } from '../utils/translations';
import {
  executeRAGSchemeMatcher,
  AIRAGResponse
} from '../utils/aiMultiProviderRAG';
import { VisualCards } from './VisualCards';
import { AudioExplainButton } from './AudioExplainButton';
import { SchemeComparison } from './SchemeComparison';
import { EligibilityChecklist } from './EligibilityChecklist';
import { AdvancedCalculatorPreview } from './AdvancedCalculatorPreview';
import { STATES, districtsForState, detectLocationFromCoordinates } from '../utils/locationData';
import { Navigation, MapPinned, GitCompare } from 'lucide-react';


import { VoiceSpeechBar } from './VoiceSpeechBar';
import confetti from 'canvas-confetti';

interface RecommenderSectionProps {
  t: TranslationStrings;
  lang: Language;
  onSelectSchemeForCalc: (scheme: Scheme, cost: number, rate: number, tenure: number, moratorium: number) => void;
  onSelectSchemeForLocator: (scheme: Scheme) => void;
  onViewDocuments: (scheme: Scheme) => void;
  onSpeakText: (text: string) => void;
  isSpeaking: boolean;
  onOpenOcr?: () => void;
  onOpenAiSettings?: () => void;
}

export const RecommenderSection: React.FC<RecommenderSectionProps> = ({
  t,
  lang,
  onSelectSchemeForCalc,
  onSelectSchemeForLocator,
  onViewDocuments,
  onSpeakText,
  isSpeaking,
  onOpenOcr,
  onOpenAiSettings
}) => {
  const [profile, setProfile] = useState<UserInputProfile>({
    sector: 'micro_enterprise',
    estimatedCost: 140000,
    annualIncome: 250000,
    education: 'matriculate',
    gender: 'female',
    isExistingBusiness: false,
    state: 'Delhi',
    district: 'Central Delhi',
    pincode: '110001'
  });

  const [hasSubmitted, setHasSubmitted] = useState<boolean>(true);
  const [userQueryText, setUserQueryText] = useState<string>('');
  const [locationMessage, setLocationMessage] = useState<string>('');
  const [showAdvancedCalculator, setShowAdvancedCalculator] = useState(false);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Location is not supported. Please select your state and district.');
      return;
    }
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const location = detectLocationFromCoordinates(coords.latitude, coords.longitude);
      if (!location) {
        setLocationMessage('GPS found your position, but the local catalog has no mapped district yet.');
        return;
      }
      setProfile(previous => ({ ...previous, state: location.state, district: location.district }));
      setLocationMessage(`Detected ${location.district}, ${location.state}`);
    }, () => setLocationMessage('Location permission was unavailable. Choose your state and district manually.'));
  };
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
  const [ragResult, setRagResult] = useState<AIRAGResponse | null>(null);

  // Handle voice transcribed profile update
  const handleVoiceProfileParsed = (extracted: Partial<UserInputProfile>) => {
    setProfile(prev => ({
      ...prev,
      ...extracted
    }));
    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.5 }
    });
  };

  // Auto-recalculate recommendations whenever inputs change
  const recommendations = useMemo(() => {
    return recommendSchemes(profile);
  }, [profile]);

  const handleRunMatch = () => {
    setHasSubmitted(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const handleReset = () => {
    setProfile({
      sector: 'micro_enterprise',
      estimatedCost: 140000,
      annualIncome: 250000,
      education: 'matriculate',
      gender: 'female',
      isExistingBusiness: false,
      state: 'Delhi',
      district: 'Central Delhi',
      pincode: '110001'
    });
  };

  const isIncomeEligible = profile.annualIncome <= 500000;

  const handleRunAiNlp = async (queryToRun?: string) => {
    const q = queryToRun || userQueryText;
    if (!q.trim()) return;
    setIsAiProcessing(true);
    try {
      const res = await executeRAGSchemeMatcher(q);
      setRagResult(res);
      setProfile(prev => ({ ...prev, ...res.profile }));
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.5 } });
    } catch (e) {
      console.error(e);
    } finally {
      setIsAiProcessing(false);
    }
  };

  return (
    <section id="recommender-section" style={{ padding: '36px 0 60px 0' }}>
      <div className="app-container">
        <div className="section-header">
          <div className="section-tag">
            <Sparkles size={16} />
            <span>AI Natural Language Engine</span>
          </div>
          <h2 className="section-heading">{t.recHeader}</h2>
          <p className="section-subheading">{t.recSubheader}</p>
        </div>

        {/* State, district and implementing-agency context */}
        <div className="glass-card" style={{ padding: '20px', marginBottom: '24px', border: '1px solid rgba(16, 185, 129, 0.35)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: 800, marginBottom: '12px' }}>
            <MapPinned size={18} />
            <span>{lang === 'hi' ? 'राज्य और जिला आधारित योजना खोज' : 'State & district-specific scheme routing'}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '10px' }}>
            <select className="form-select" value={profile.state} onChange={(e) => { const state = e.target.value; setProfile(previous => ({ ...previous, state, district: districtsForState(state)[0] || '' })); }}>
              {STATES.map(state => <option key={state} value={state}>{state}</option>)}
            </select>
            <select className="form-select" value={profile.district} onChange={(e) => setProfile(previous => ({ ...previous, district: e.target.value }))}>
              {districtsForState(profile.state).map(district => <option key={district} value={district}>{district}</option>)}
            </select>
            <button type="button" className="btn-secondary" onClick={handleDetectLocation} style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}><Navigation size={15} /> Use GPS</button>
          </div>
          <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap', color: '#94a3b8', fontSize: '0.76rem' }}>
            <span>Local SCA: {profile.state} Scheduled Caste Finance Corporation</span><span>• District Industries Centre: {profile.district}</span><span>• PSB / RRB / CSC routing</span>
          </div>
          {locationMessage && <div style={{ color: '#a7f3d0', fontSize: '0.75rem', marginTop: '8px' }}>{locationMessage}</div>}
        </div>

        {/* AI Multi-Provider RAG Query & Live Intelligence Box */}
        <div className="glass-card" style={{ padding: '24px', marginBottom: '24px', border: '1px solid rgba(56, 189, 248, 0.35)', background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.9), rgba(11, 17, 32, 0.95))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 800, fontSize: '1rem' }}>
              <Cpu size={20} />
              <span>{lang === 'hi' ? 'स्मार्ट AI RAG योजना खोज (Grok, Gemini, OpenRouter, Offline)' : 'Multi-Provider AI RAG Scheme Intelligence'}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {onOpenAiSettings && (
                <button
                  onClick={onOpenAiSettings}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', borderColor: '#38bdf8' }}
                >
                  <Settings size={14} color="#38bdf8" />
                  <span>{lang === 'hi' ? 'AI प्रदाता बदलें' : 'AI Engine Settings'}</span>
                </button>
              )}
              {onOpenOcr && (
                <button
                  onClick={onOpenOcr}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <FileUp size={14} color="#10b981" />
                  <span>{lang === 'hi' ? 'दस्तावेज़ OCR' : 'Document OCR'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Query Prompt Chips */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.72rem', color: '#64748b', alignSelf: 'center', marginRight: '4px' }}>
              {lang === 'hi' ? 'त्वरित उदाहरण:' : 'Quick Prompts:'}
            </span>
            {[
              { en: 'Women Tailoring & Boutique ₹1.4 Lakh', hi: 'महिला सिलाई बुटीक 1.4 लाख' },
              { en: 'Dairy Farming & Cattle ₹2.0 Lakh', hi: 'डेयरी व पशुपालन 2 लाख' },
              { en: 'E-Rickshaw & Solar Unit ₹3.0 Lakh', hi: 'ई-रिक्शा / सोलर यूनिट 3 लाख' },
              { en: 'Higher Education B.Tech ₹10 Lakh', hi: 'उच्च शिक्षा बीटेक 10 लाख' }
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  const text = lang === 'hi' ? chip.hi : chip.en;
                  setUserQueryText(text);
                  handleRunAiNlp(text);
                }}
                style={{
                  background: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid rgba(56, 189, 248, 0.2)',
                  color: '#cbd5e1',
                  fontSize: '0.72rem',
                  padding: '4px 10px',
                  borderRadius: '20px',
                  cursor: 'pointer'
                }}
              >
                {lang === 'hi' ? chip.hi : chip.en}
              </button>
            ))}
          </div>

          {/* Natural Language Query Bar */}
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input
              type="text"
              className="form-input"
              style={{ flex: 1, fontSize: '0.92rem', padding: '12px 16px' }}
              placeholder={lang === 'hi'
                ? 'मातृभाषा या टूटी-फूटी अंग्रेजी में लिखें: "मैं महिला हूँ, मुझे 1.4 लाख का सिलाई लोन चाहिए"'
                : 'Speak or type naturally: "I am a woman starting a dairy farm with 2 lakh budget in UP"'
              }
              value={userQueryText}
              onChange={(e) => setUserQueryText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleRunAiNlp()}
            />
            <button
              onClick={() => handleRunAiNlp()}
              disabled={isAiProcessing}
              className="btn-primary"
              style={{ whiteSpace: 'nowrap', padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Sparkles size={16} />
              <span>{isAiProcessing ? (lang === 'hi' ? 'RAG विश्लेषण जारी...' : 'RAG Matching...') : (lang === 'hi' ? 'AI खोज' : 'RAG Match')}</span>
            </button>
          </div>

          {/* RAG Results & Insights Display */}
          {ragResult && (
            <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
              {/* Summary Card */}
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid #38bdf8', padding: '14px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase' }}>
                    {lang === 'hi' ? '🎯 योजना मिलान निष्कर्ष' : '🎯 Scheme Match Assessment'}
                  </span>
                  <span style={{ fontSize: '0.68rem', background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '2px 8px', borderRadius: '10px' }}>
                    {ragResult.providerUsed} ({ragResult.latencyMs}ms)
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#e2e8f0', margin: '4px 0 8px 0', lineHeight: '1.4' }}>
                  {lang === 'hi' ? ragResult.hindiSummary : ragResult.naturalLanguageSummary}
                </p>
                <button
                  onClick={() => onSpeakText(lang === 'hi' ? ragResult.hindiSummary : ragResult.naturalLanguageSummary)}
                  className="btn-secondary"
                  style={{ padding: '3px 8px', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Volume2 size={12} />
                  <span>{lang === 'hi' ? 'सुनें' : 'Listen'}</span>
                </button>
              </div>

              {/* Micro-Investment Plan Card */}
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid #10b981', padding: '14px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: '#10b981', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <TrendingUp size={14} />
                  <span>{lang === 'hi' ? '💡 निवेश योजना व पूंजी आवंटन' : '💡 Micro Investment Plan'}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '4px 0 8px 0', lineHeight: '1.4' }}>
                  {lang === 'hi' ? ragResult.hindiInvestmentPlan : ragResult.investmentPlan}
                </p>
                <button
                  onClick={() => onSpeakText(lang === 'hi' ? ragResult.hindiInvestmentPlan : ragResult.investmentPlan)}
                  className="btn-secondary"
                  style={{ padding: '3px 8px', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Volume2 size={12} />
                  <span>{lang === 'hi' ? 'सुनें' : 'Listen'}</span>
                </button>
              </div>

              {/* Loan & Repayment Strategy Card */}
              <div style={{ background: 'rgba(15, 23, 42, 0.8)', border: '1px solid #f59e0b', padding: '14px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px', color: '#f59e0b', fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <Lightbulb size={14} />
                  <span>{lang === 'hi' ? '📋 ऋण व मोरेटोरियम रणनीति' : '📋 Loan & Moratorium Strategy'}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#cbd5e1', margin: '4px 0 8px 0', lineHeight: '1.4' }}>
                  {lang === 'hi' ? ragResult.hindiLoanAdvice : ragResult.loanAdvice}
                </p>
                <button
                  onClick={() => onSpeakText(lang === 'hi' ? ragResult.hindiLoanAdvice : ragResult.loanAdvice)}
                  className="btn-secondary"
                  style={{ padding: '3px 8px', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <Volume2 size={12} />
                  <span>{lang === 'hi' ? 'सुनें' : 'Listen'}</span>
                </button>
              </div>
            </div>
          )}
        </div>



        {/* VOICE-ENABLED REAL-TIME SPEECH BAR */}
        <VoiceSpeechBar
          lang={lang}
          onVoiceProfileParsed={handleVoiceProfileParsed}
          onReadAloud={() => {
            const summarySpeech = lang === 'hi'
              ? `आपके लिए सर्वश्रेष्ठ योजना है: ${recommendations[0]?.scheme?.hindiName || 'सूक्ष्म वित्त योजना'}। इसमें 90 प्रतिशत तक रियायती ऋण सहायता उपलब्ध है।`
              : `The best matching scheme for you is ${recommendations[0]?.scheme?.name || 'Micro Finance Scheme'} with up to 90 percent concessional assistance.`;
            onSpeakText(summarySpeech);
          }}
          isReadingAloud={isSpeaking}
        />

        {/* VISUAL ONE-CLICK CATEGORY SELECTORS FOR RURAL / LOW-LITERACY USERS */}
        <VisualCards
          lang={lang}
          selectedSector={profile.sector}
          onSelectSector={(sector) => setProfile(prev => ({ ...prev, sector }))}
          selectedCost={profile.estimatedCost}
          onSelectCost={(estimatedCost) => setProfile(prev => ({ ...prev, estimatedCost }))}
          selectedIncomeTier={profile.annualIncome}
          onSelectIncomeTier={(annualIncome) => setProfile(prev => ({ ...prev, annualIncome }))}
          selectedGender={profile.gender}
          onSelectGender={(gender) => setProfile(prev => ({ ...prev, gender }))}
          onSpeakExplanation={onSpeakText}
        />

        {/* Detailed Fine-Tuning Slider Controls (Collapsible or Companion) */}
        <div className="glass-card" style={{ padding: '32px', marginBottom: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--color-border)', paddingBottom: '12px' }}>
            <h4 style={{ color: '#38bdf8', fontSize: '1.05rem', fontWeight: 700 }}>
              {lang === 'hi' ? 'विस्तृत विवरण एवं स्लाइडर' : 'Detailed Profile Sliders'}
            </h4>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              {lang === 'hi' ? 'स्लाइडर को खींचकर सटीक राशि तय करें' : 'Drag sliders to customize exact rupee figures'}
            </span>
          </div>
          <div className="form-grid">
            {/* 1. Sector */}
            <div className="form-group">
              <label className="form-label">
                <span>{t.lblSector}</span>
                <span style={{ color: '#38bdf8', fontSize: '0.75rem' }}>Core Category</span>
              </label>
              <select
                className="form-select"
                value={profile.sector}
                onChange={(e) => setProfile({ ...profile, sector: e.target.value as SectorType })}
              >
                <option value="micro_enterprise">Micro Finance / Small Trades & Crafts (up to ₹1.40L - ₹5L)</option>
                <option value="women_entrepreneurship">Women Entrepreneurship & SHGs (Special 5% Rate)</option>
                <option value="agriculture">Agriculture, Dairy, Cattle & Allied Activities</option>
                <option value="term_loan">Term Loan / Manufacturing & Small Scale Units (up to ₹50L)</option>
                <option value="green_business">Green Business (E-Vehicles, Solar, Recycling up to ₹30L)</option>
                <option value="education_inland">Higher Education in India (Engineering, Medical, MBA up to ₹20L)</option>
                <option value="education_abroad">Higher Education Abroad (Masters/Ph.D. up to ₹30L)</option>
              </select>
            </div>

            {/* 2. Estimated Project Cost */}
            <div className="form-group">
              <div className="form-label">
                <span>{t.lblProjectCost}</span>
                <strong style={{ color: '#38bdf8', fontSize: '1.05rem' }}>
                  {formatIndianCurrency(profile.estimatedCost)}
                </strong>
              </div>
              <input
                type="range"
                className="range-slider"
                min={30000}
                max={5000000}
                step={10000}
                value={profile.estimatedCost}
                onChange={(e) => setProfile({ ...profile, estimatedCost: Number(e.target.value) })}
              />
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[100000, 140000, 500000, 1500000, 3000000, 5000000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    style={{
                      background: profile.estimatedCost === val ? 'rgba(56, 189, 248, 0.3)' : 'rgba(15, 23, 42, 0.7)',
                      border: '1px solid var(--color-border)',
                      color: profile.estimatedCost === val ? '#38bdf8' : '#94a3b8',
                      fontSize: '0.72rem',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setProfile({ ...profile, estimatedCost: val })}
                  >
                    ₹{(val / 100000).toFixed(val < 100000 ? 2 : val < 1000000 ? 1 : 0)}L
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Annual Family Income */}
            <div className="form-group">
              <div className="form-label">
                <span>{t.lblIncome}</span>
                <strong style={{ color: isIncomeEligible ? '#34d399' : '#f43f5e', fontSize: '1.05rem' }}>
                  {formatIndianCurrency(profile.annualIncome)}
                </strong>
              </div>
              <input
                type="range"
                className="range-slider"
                min={50000}
                max={900000}
                step={10000}
                value={profile.annualIncome}
                onChange={(e) => setProfile({ ...profile, annualIncome: Number(e.target.value) })}
              />
              {!isIncomeEligible ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f43f5e', fontSize: '0.78rem' }}>
                  <AlertTriangle size={14} />
                  <span>Exceeds statutory ₹5.00 Lakhs ceiling. Move slider below ₹5.00L to unlock full concessions.</span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', fontSize: '0.78rem' }}>
                  <CheckCircle2 size={14} />
                  <span>Eligible! Family income is below the ₹5.00 Lakhs statutory benchmark.</span>
                </div>
              )}
            </div>

            {/* 4. Education Status */}
            <div className="form-group">
              <label className="form-label">
                <span>{t.lblEducation}</span>
              </label>
              <select
                className="form-select"
                value={profile.education}
                onChange={(e) => setProfile({ ...profile, education: e.target.value as EducationLevel })}
              >
                <option value="below_10th">Below 10th / Artisan</option>
                <option value="matriculate">10th / 12th Pass</option>
                <option value="graduate">Graduate (B.A., B.Sc., B.Tech, B.Com)</option>
                <option value="post_graduate_professional">Post Graduate / Professional (Medical, MBA, M.Tech)</option>
              </select>
            </div>

            {/* 5. Gender */}
            <div className="form-group">
              <label className="form-label">
                <span>{t.lblGender}</span>
                <span style={{ color: '#fbbf24', fontSize: '0.75rem' }}>★ Women get 0.5% - 1% Interest Rebate</span>
              </label>
              <select
                className="form-select"
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value as GenderType })}
              >
                <option value="female">Female (Qualifies for Mahila Samriddhi & Concessional Rebates)</option>
                <option value="male">Male</option>
                <option value="transgender">Transgender</option>
              </select>
            </div>

            {/* 6. Enterprise Stage */}
            <div className="form-group">
              <label className="form-label">
                <span>{t.lblExistingBusiness}</span>
              </label>
              <select
                className="form-select"
                value={profile.isExistingBusiness ? 'existing' : 'new'}
                onChange={(e) => setProfile({ ...profile, isExistingBusiness: e.target.value === 'existing' })}
              >
                <option value="new">New Enterprise / Fresh Venture (Start-Up)</option>
                <option value="existing">Existing Business (Expansion / Modernization)</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '10px 18px', fontSize: '0.85rem' }}
              onClick={handleReset}
            >
              <RefreshCcw size={14} />
              {t.btnReset}
            </button>
            <button
              type="button"
              className="btn-primary"
              style={{ padding: '10px 22px', fontSize: '0.9rem' }}
              onClick={handleRunMatch}
            >
              <Sparkles size={16} />
              {t.btnFindSchemes}
            </button>
          </div>
        </div>

        {/* Recommendation Results Grid */}
        {hasSubmitted && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '1.4rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>Recommended Concessional Schemes</span>
                <span style={{ fontSize: '0.8rem', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '3px 10px', borderRadius: '12px', fontWeight: 600 }}>
                  {recommendations.length} Schemes Analyzed
                </span>
              </h3>
            </div>

            <div className="schemes-grid">
              {recommendations.map((rec, index) => {
                const { scheme, matchScore, effectiveInterestRate, eligibleLoanAmount, promoterContribution, estimatedMonthlyEmi, matchingReasons, hindiMatchingReasons } = rec;
                const isTopMatch = index === 0;

                return (
                  <div
                    key={scheme.id}
                    className="scheme-card glass-card"
                    style={{
                      border: isTopMatch ? '2px solid rgba(56, 189, 248, 0.5)' : undefined,
                      boxShadow: isTopMatch ? '0 10px 30px rgba(56, 189, 248, 0.2)' : undefined
                    }}
                  >
                    {/* Top Match Badge */}
                    <div className="scheme-badge-match">
                      <Sparkles size={12} />
                      <span>{matchScore}% Match</span>
                    </div>

                    <div>
                      <span className="scheme-badge-code">{scheme.code}</span>
                      <h4 className="scheme-name">{lang === 'hi' ? scheme.hindiName : scheme.name}</h4>
                      <div className="scheme-hindi-name">
                        {lang === 'hi' ? scheme.name : scheme.hindiName}
                      </div>

                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>
                        {lang === 'hi' ? scheme.hindiDescription : scheme.description}
                      </p>

                      {/* Key Financial Snapshot */}
                      <div className="scheme-stats-row">
                        <div className="stat-item">
                          <div className="stat-item-val" style={{ color: '#0284c7' }}>
                            {effectiveInterestRate}%
                          </div>
                          <div className="stat-item-lbl" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span>{t.effectiveRate}</span>
                            <AudioExplainButton termKey="concessional_rate" lang={lang} />
                          </div>
                        </div>

                        <div className="stat-item">
                          <div className="stat-item-val" style={{ color: '#16a34a' }}>
                            {scheme.maxAssistancePct}%
                          </div>
                          <div className="stat-item-lbl" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span>{t.maxAssistance}</span>
                            <AudioExplainButton termKey="max_assistance" lang={lang} />
                          </div>
                        </div>

                        <div className="stat-item">
                          <div className="stat-item-val" style={{ color: '#ea580c' }}>
                            {formatIndianCurrency(estimatedMonthlyEmi)}
                          </div>
                          <div className="stat-item-lbl" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <span>{t.estEmi}</span>
                            <AudioExplainButton termKey="monthly_emi" lang={lang} />
                          </div>
                        </div>
                      </div>

                      {/* Assistance vs Margin Breakdown */}
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', fontSize: '0.8rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ color: '#64748b' }}>Eligible Concessional Loan (90%):</span>
                          <strong style={{ color: '#0284c7' }}>{formatIndianCurrency(eligibleLoanAmount)}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ color: '#64748b' }}>Beneficiary Margin (10% Promoter):</span>
                            <AudioExplainButton termKey="promoter_equity" lang={lang} />
                          </div>
                          <strong style={{ color: '#ea580c' }}>{formatIndianCurrency(promoterContribution)}</strong>
                        </div>
                      </div>

                      {/* Moratorium & Tenure Tag */}
                      <div style={{ display: 'flex', gap: '10px', fontSize: '0.78rem', color: '#475569', marginBottom: '16px', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '4px 8px', borderRadius: '6px' }}>
                          <Calendar size={13} style={{ color: '#0284c7' }} />
                          Moratorium: {scheme.maxMoratoriumMonths} Months
                        </span>
                        <AudioExplainButton termKey="moratorium_period" lang={lang} />
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '4px 8px', borderRadius: '6px' }}>
                          <Calendar size={13} style={{ color: '#16a34a' }} />
                          Tenure: Up to {scheme.maxTenureYears} Yrs
                        </span>
                      </div>

                      {/* AI Matching Reasons Box */}
                      <div className="reasons-box">
                        <div className="reasons-title">{t.whyFitsYou}</div>
                        <ul className="reasons-list">
                          {(lang === 'hi' ? hindiMatchingReasons : matchingReasons).slice(0, 3).map((reason, rIdx) => (
                            <li key={rIdx}>
                              <CheckCircle2 size={13} style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }} />
                              <span>{reason}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Actions on this scheme */}
                    <div className="scheme-actions">
                      <button
                        className="btn-card-primary"
                        onClick={() => onSelectSchemeForCalc(scheme, profile.estimatedCost, effectiveInterestRate, scheme.maxTenureYears, scheme.maxMoratoriumMonths)}
                        title="Open interactive calculator with this scheme data"
                      >
                        <Calculator size={15} />
                        <span>{t.calcEmiBtn}</span>
                      </button>

                      <button
                        className="btn-card-secondary"
                        onClick={() => onSelectSchemeForLocator(scheme)}
                        title="Locate channel partners capable of processing this scheme"
                      >
                        <MapPin size={15} />
                        <span>{t.locateBranchBtn}</span>
                      </button>

                      <button
                        style={{
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: '#fff',
                          border: 'none',
                          padding: '10px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onClick={() => onViewDocuments(scheme)}
                        title="View list of required certificates"
                      >
                        <FileText size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <SchemeComparison recommendations={recommendations} />
            {recommendations[0] && <EligibilityChecklist scheme={recommendations[0].scheme} profile={profile} />}
          </div>
        )}

        <div className="glass-card" style={{ padding: '20px', marginTop: '24px' }}>
          <button type="button" className="btn-secondary" onClick={() => setShowAdvancedCalculator(value => !value)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GitCompare size={16} /> {showAdvancedCalculator ? 'Hide advanced offline calculator' : 'Open advanced offline calculator'}
          </button>
          {showAdvancedCalculator && <AdvancedCalculatorPreview projectCost={profile.estimatedCost} />}
        </div>
      </div>
    </section>
  );
};
