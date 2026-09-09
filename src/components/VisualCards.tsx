import React from 'react';
import { 
  Scissors, 
  Store, 
  Wheat, 
  Factory, 
  Zap, 
  GraduationCap, 
  Plane, 
  Sparkles,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  Users,
  Building2,
  TrendingUp,
  Volume2
} from 'lucide-react';
import { SectorType, GenderType } from '../types';
import { Language } from '../utils/translations';
import { AudioExplainButton } from './AudioExplainButton';

interface VisualCardsProps {
  lang: Language;
  selectedSector: SectorType;
  onSelectSector: (sector: SectorType) => void;
  selectedCost: number;
  onSelectCost: (cost: number) => void;
  selectedIncomeTier: number;
  onSelectIncomeTier: (income: number) => void;
  selectedGender: GenderType;
  onSelectGender: (gender: GenderType) => void;
  onSpeakExplanation: (text: string) => void;
}


interface SectorVisualItem {
  id: SectorType;
  icon: React.ReactNode;
  titleEn: string;
  titleHi: string;
  titleTa: string;
  titleMr: string;
  examplesEn: string;
  examplesHi: string;
  examplesTa: string;
  examplesMr: string;
  badge: string;
  color: string;
}

const SECTOR_CARDS: SectorVisualItem[] = [
  {
    id: 'micro_enterprise',
    icon: <Scissors size={28} />,
    titleEn: 'Tailoring, Craft & Small Shop',
    titleHi: 'सिलाई, दस्तकारी व छोटी दुकान',
    titleTa: 'தையல் & சிறு வணிகம்',
    titleMr: 'टेलरिंग व छोटी दुकाने',
    examplesEn: 'Tailoring unit, tea stall, artisan crafts, mobile repair kiosk',
    examplesHi: 'सिलाई केंद्र, चाय/किराना दुकान, कारीगरी, रिपेयरिंग',
    examplesTa: 'தையல் கடை, சிற்றுண்டி, கைவினைப் பொருட்கள்',
    examplesMr: 'शिलाई केंद्र, किराणा दुकान, हस्तकला, दुरुस्ती कामे',
    badge: 'Up to ₹1.40 Lakh',
    color: '#38bdf8'
  },
  {
    id: 'women_entrepreneurship',
    icon: <Sparkles size={28} />,
    titleEn: 'Women Business & SHG (5% Rate)',
    titleHi: 'महिला उद्यम व स्वयं सहायता समूह (5% ब्याज)',
    titleTa: 'மகளிர் சுயஉதவிக் குழுக்கள் (5% வட்டி)',
    titleMr: 'महिला बचत गट व व्यवसाय (५% व्याज)',
    examplesEn: 'Catering, beauty salon, handicrafts, spices, pickle making',
    examplesHi: 'ब्यूटी पार्लर, टिफिन सर्विस, अचार-पापड़, बुटीक',
    examplesTa: 'கேட்டரிங், அழகு நிலையம், கைவினை தயாரிப்பு',
    examplesMr: 'ब्युटी पार्लर, मेस/डबा सेवा, गृहउद्योग',
    badge: 'Special 5% Rate',
    color: '#fbbf24'
  },
  {
    id: 'agriculture',
    icon: <Wheat size={28} />,
    titleEn: 'Dairy, Cattle & Farming',
    titleHi: 'डेयरी, पशुपालन व कृषि कार्य',
    titleTa: 'பால்பண்ணை & விவசாயம்',
    titleMr: 'दुग्धव्यवसाय व शेतीपूरक',
    examplesEn: 'Milch cows, buffaloes, goat rearing, organic farming, poultry',
    examplesHi: 'गाय-भैंस पालन, बकरी पालन, मुर्गी पालन, जैविक खेती',
    examplesTa: 'கறவை மாடு, ஆடு வளர்ப்பு, கோழி பண்ணை',
    examplesMr: 'गाई-म्हशी पालन, शेळीपालन, कुक्कुटपालन',
    badge: 'Up to ₹2.00 Lakh',
    color: '#34d399'
  },
  {
    id: 'green_business',
    icon: <Zap size={28} />,
    titleEn: 'E-Rickshaw & Solar Energy',
    titleHi: 'ई-रिक्शा, सौर ऊर्जा व पर्यावरण उद्यम',
    titleTa: 'மின்சார ஆட்டோ & சோலார்',
    titleMr: 'ई-रिक्षा व सौर ऊर्जा व्यवसाय',
    examplesEn: 'Battery E-rickshaws, commercial EV loaders, rooftop solar power',
    examplesHi: 'ई-रिक्शा, बैटरी लोडर, छत पर सोलर पैनल',
    examplesTa: 'இ-ரிக்‌ஷா, மின்சார வாகனம், சோலார் மின்சாரம்',
    examplesMr: 'इलेक्ट्रिक रिक्षा, सोलर पॅनेल्स, बॅटरी चार्जिंग',
    badge: 'Up to ₹30.00 Lakh',
    color: '#10b981'
  },
  {
    id: 'term_loan',
    icon: <Factory size={28} />,
    titleEn: 'Manufacturing & Workshop',
    titleHi: 'कारखाना, वर्कशॉप व निर्माण इकाई',
    titleTa: 'தொழிற்சாலை & பட்டறை',
    titleMr: 'कारखाना व वर्कशॉप',
    examplesEn: 'Food processing, garment factory, auto garage, logistics',
    examplesHi: 'आटा/तेल मिल, ऑटो गैरेज, प्रिंटिंग प्रेस, प्लास्टिक मोल्डिंग',
    examplesTa: 'உணவு பதப்படுத்துதல், ஆயத்த ஆடை, பட்டறை',
    examplesMr: 'अन्न प्रक्रिया, फॅब्रिकेशन, गॅरेज, प्रक्रिया उद्योग',
    badge: 'Up to ₹50.00 Lakh',
    color: '#818cf8'
  },
  {
    id: 'education_inland',
    icon: <GraduationCap size={28} />,
    titleEn: 'Higher Education in India',
    titleHi: 'भारत में उच्च शिक्षा (इंजीनियरिंग, मेडिकल)',
    titleTa: 'இந்தியாவில் உயர்கல்வி (இன்ஜினியரிங், மருத்துவம்)',
    titleMr: 'भारतातील उच्च शिक्षण (अभियांत्रिकी, वैद्यकीय)',
    examplesEn: 'B.Tech, MBBS, MBA, Law, Polytechnic - zero repayment during course',
    examplesHi: 'बी.टेक, एमबीबीएस, एमबीए, वकालत (पढ़ाई के दौरान 0 EMI)',
    examplesTa: 'இன்ஜினியரிங், எம்பிபிஎஸ், எம்பிஏ (படிப்பு காலத்தில் தவணை இல்லை)',
    examplesMr: 'बी.टेक, वैद्यकीय, व्यवस्थापन (शिक्षणादरम्यान शून्य हप्ता)',
    badge: 'Up to ₹20.00 Lakh',
    color: '#f43f5e'
  }
];

export const VisualCards: React.FC<VisualCardsProps> = ({
  lang,
  selectedSector,
  onSelectSector,
  selectedCost,
  onSelectCost,
  selectedIncomeTier,
  onSelectIncomeTier,
  selectedGender,
  onSelectGender,
  onSpeakExplanation
}) => {
  return (
    <div style={{ marginBottom: '32px' }}>
      {/* 1. VISUAL WORK CATEGORIES - ONE-TOUCH SELECTION */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: '#38bdf8', color: '#0b1120', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>1</span>
            <h4 style={{ color: '#fff', fontSize: '1.05rem', fontWeight: 700 }}>
              {lang === 'hi' ? 'आप क्या काम शुरू करना चाहते हैं? (चित्र पर क्लिक करें)' : 
               lang === 'ta' ? 'நீங்கள் என்ன தொழில் தொடங்க விரும்புகிறீர்கள்? (படத்தை தேர்ந்தெடுக்கவும்)' : 
               lang === 'mr' ? 'तुम्हाला कोणता व्यवसाय सुरू करायचा आहे? (चित्रावर क्लिक करा)' : 
               'What business do you want to start? (Click your choice)'}
            </h4>
          </div>
          <button
            type="button"
            className="btn-secondary"
            style={{ padding: '4px 10px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
            onClick={() => onSpeakExplanation(
              lang === 'hi' ? 'पहला कदम: अपना कार्यक्षेत्र चुनें। जैसे सिलाई, छोटी दुकान, डेयरी, ई रिक्शा या शिक्षा।' :
              'Step 1: Click the picture representing your trade or business.'
            )}
          >
            <Volume2 size={13} style={{ color: '#38bdf8' }} />
            <span>{lang === 'hi' ? 'सुनें' : 'Listen'}</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          {SECTOR_CARDS.map((card) => {
            const isSelected = selectedSector === card.id;
            const title = lang === 'hi' ? card.titleHi : lang === 'ta' ? card.titleTa : lang === 'mr' ? card.titleMr : card.titleEn;
            const examples = lang === 'hi' ? card.examplesHi : lang === 'ta' ? card.examplesTa : lang === 'mr' ? card.examplesMr : card.examplesEn;

            return (
              <div
                key={card.id}
                onClick={() => onSelectSector(card.id)}
                style={{
                  background: isSelected ? 'rgba(56, 189, 248, 0.18)' : 'rgba(30, 41, 59, 0.65)',
                  border: isSelected ? `2px solid ${card.color}` : '1px solid rgba(148, 163, 184, 0.18)',
                  borderRadius: '14px',
                  padding: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: isSelected ? `0 0 20px ${card.color}40` : undefined,
                  transform: isSelected ? 'translateY(-2px)' : undefined
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <div
                      style={{
                        background: `${card.color}22`,
                        color: card.color,
                        width: '50px',
                        height: '50px',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${card.color}44`
                      }}
                    >
                      {card.icon}
                    </div>
                    {isSelected && (
                      <CheckCircle2 size={18} style={{ color: card.color }} />
                    )}
                  </div>

                  <span
                    style={{
                      fontSize: '0.68rem',
                      background: 'rgba(255, 255, 255, 0.08)',
                      color: card.color,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: 700,
                      display: 'inline-block',
                      marginBottom: '6px'
                    }}
                  >
                    {card.badge}
                  </span>

                  <h5 style={{ fontSize: '0.92rem', color: '#fff', fontWeight: 700, marginBottom: '4px' }}>
                    {title}
                  </h5>

                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: '1.4' }}>
                    {examples}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. VISUAL PROJECT COST CHIPS (PRE-SET AMOUNTS) */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: '#0284c7', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>2</span>
            <h4 style={{ color: '#0f172a', fontSize: '1.05rem', fontWeight: 700 }}>
              {lang === 'hi' ? 'कितना पैसा / ऋण चाहिए? (लागत चुनें)' :
               lang === 'ta' ? 'எவ்வளவு கடன் தேவை? (மதிப்பை தேர்ந்தெடுக்கவும்)' :
               lang === 'mr' ? 'किती कर्ज हवे आहे? (रक्कम निवडा)' :
               'How much money/cost is needed? (Quick Pick)'}
            </h4>
          </div>
          <AudioExplainButton termKey="promoter_equity" lang={lang} label={lang === 'hi' ? 'लागत व हिस्सा समझें' : 'Explain Cost'} />
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {[
            { val: 100000, label: '₹1.00 Lakh', descHi: 'छोटा ठेला / औजार', descEn: 'Small Cart / Tools' },
            { val: 140000, label: '₹1.40 Lakh', descHi: 'सिलाई / माइक्रो क्रेडिट (MFS)', descEn: 'Micro Finance (Max ₹1.4L)' },
            { val: 200000, label: '₹2.00 Lakh', descHi: 'गाय-भैंस / डेयरी (MKY)', descEn: 'Dairy / Cattle (MKY)' },
            { val: 500000, label: '₹5.00 Lakh', descHi: 'दुकान / वर्कशॉप', descEn: 'Retail Store / Small Term' },
            { val: 1500000, label: '₹15.00 Lakh', descHi: 'ई-रिक्शा फ्लीट / सोलर', descEn: 'Green EV Fleet / Solar' },
            { val: 2000000, label: '₹20.00 Lakh', descHi: 'उच्च शिक्षा (इंजीनियरिंग)', descEn: 'Higher Education Inland' },
            { val: 5000000, label: '₹50.00 Lakh', descHi: 'बड़ी फैक्ट्री / उद्योग', descEn: 'Factory / Term Loan' }
          ].map((item, index, arr) => {
            const costs = arr.map(a => a.val);
            const closestCost = costs.reduce((prev, curr) => Math.abs(curr - selectedCost) < Math.abs(prev - selectedCost) ? curr : prev);
            const isSelected = closestCost === item.val;
            
            return (
              <button
                key={item.val}
                type="button"
                onClick={() => onSelectCost(item.val)}
                style={{
                  background: isSelected ? '#e0f2fe' : '#ffffff',
                  border: isSelected ? '2px solid #0284c7' : '1px solid #cbd5e1',
                  color: isSelected ? '#0369a1' : '#334155',
                  borderRadius: '12px',
                  padding: '10px 16px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  minWidth: '130px',
                  transition: 'all 0.15s'
                }}
              >
                <strong style={{ fontSize: '1rem', color: isSelected ? '#0369a1' : '#0f172a' }}>{item.label}</strong>
                <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                  {lang === 'hi' ? item.descHi : item.descEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. VISUAL INCOME CHECK (CRITICAL BENCHMARK: <= ₹5 LAKHS) */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ background: '#0284c7', color: '#fff', width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>3</span>
            <h4 style={{ color: '#0f172a', fontSize: '1.05rem', fontWeight: 700 }}>
              {lang === 'hi' ? 'परिवार की सालाना आय (₹5 लाख तक होने पर 90% सरकारी छूट)' :
               lang === 'ta' ? 'குடும்ப ஆண்டு வருமானம் (₹5 லட்சம் வரை மட்டுமே சலுகை)' :
               lang === 'mr' ? 'कौटुंबिक वार्षिक उत्पन्न (₹५ लाखांपर्यंत ९०% शासकीय सवलत)' :
               'Annual Family Income (Must be up to ₹5.00 Lakhs for Concessions)'}
            </h4>
          </div>
          <AudioExplainButton termKey="income_limit" lang={lang} label={lang === 'hi' ? 'आय सीमा समझें' : 'Explain Income'} />
        </div>


        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {[
            { minVal: 0, maxVal: 150000, val: 150000, label: 'Up to ₹1.5 Lakh', labelHi: '₹1.50 लाख तक (अत्यंत पिछड़ा वर्ग)', status: 'FULL_SUBSIDY' },
            { minVal: 150001, maxVal: 300000, val: 250000, label: '₹1.5 - ₹3.0 Lakh', labelHi: '₹2.50 लाख (औसत आय)', status: 'FULL_SUBSIDY' },
            { minVal: 300001, maxVal: 500000, val: 450000, label: '₹3.0 - ₹5.0 Lakh', labelHi: '₹4.50 लाख (रियायती सीमा के भीतर)', status: 'FULL_SUBSIDY' },
            { minVal: 500001, maxVal: Infinity, val: 650000, label: 'Above ₹5.0 Lakh', labelHi: '₹5 लाख से अधिक (सरकारी सीमा से बाहर)', status: 'OVER_LIMIT' }
          ].map((tier, index) => {
            const isSelected = selectedIncomeTier >= tier.minVal && selectedIncomeTier <= tier.maxVal;
            const isEligible = tier.status === 'FULL_SUBSIDY';

            return (
              <div
                key={tier.val}
                onClick={() => onSelectIncomeTier(tier.val)}
                style={{
                  background: isSelected 
                    ? (isEligible ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)') 
                    : 'rgba(30, 41, 59, 0.6)',
                  border: isSelected 
                    ? (isEligible ? '2px solid #10b981' : '2px solid #f43f5e') 
                    : '1px solid var(--color-border)',
                  borderRadius: '12px',
                  padding: '14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                {isEligible ? (
                  <ShieldCheck size={20} style={{ color: '#10b981', flexShrink: 0 }} />
                ) : (
                  <TrendingUp size={20} style={{ color: '#f43f5e', flexShrink: 0 }} />
                )}
                <div>
                  <strong style={{ fontSize: '0.9rem', color: isEligible ? '#34d399' : '#f43f5e', display: 'block' }}>
                    {tier.label}
                  </strong>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    {lang === 'hi' ? tier.labelHi : isEligible ? '✓ Eligible for 90% Govt Loan' : '⚠ Exceeds ₹5L Limit'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
