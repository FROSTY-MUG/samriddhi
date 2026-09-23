import React, { useState, useRef } from 'react';
import { Volume2, HelpCircle, X, Sparkles, CheckCircle2, Square } from 'lucide-react';
import { LAYMAN_EXPLANATIONS, speakLaymanExplanation, stopAllVoice } from '../utils/laymanVoiceExplanations';
import { Language } from '../utils/translations';

interface AudioExplainButtonProps {
  termKey: string;
  lang: Language;
  label?: string;
  inline?: boolean;
}

export const AudioExplainButton: React.FC<AudioExplainButtonProps> = ({
  termKey,
  lang,
  label,
  inline = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speakingRef = useRef(false);
  const data = LAYMAN_EXPLANATIONS[termKey] || LAYMAN_EXPLANATIONS.concessional_rate;

  const handleListen = () => {
    if (speakingRef.current) {
      stopAllVoice();
      speakingRef.current = false;
      setIsSpeaking(false);
      return;
    }
    speakLaymanExplanation(termKey, lang, () => {
      speakingRef.current = true;
      setIsSpeaking(true);
    }, () => {
      speakingRef.current = false;
      setIsSpeaking(false);
    });
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleListen();
    setIsOpen(!isOpen);
  };

  const title = lang === 'hi' ? data.titleHi : data.titleEn;
  const explanation = lang === 'hi' ? data.simpleExplanationHi : data.simpleExplanationEn;
  const example = lang === 'hi' ? data.practicalExampleHi : data.practicalExampleEn;

  return (
    <div style={{ position: 'relative', display: inline ? 'inline-flex' : 'flex', alignItems: 'center' }}>
      <button
        type="button"
        onClick={handleClick}
        title={lang === 'hi' ? 'सरल भाषा में सुनें (बोलकर समझाएं)' : 'Listen to simple voice explanation'}
        style={{
          background: 'rgba(2, 132, 199, 0.08)',
          border: '1px solid rgba(2, 132, 199, 0.25)',
          color: '#0284c7',
          padding: '2px 7px',
          borderRadius: '16px',
          fontSize: '0.72rem',
          fontWeight: 700,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          marginLeft: '6px',
          transition: 'all 0.15s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#0284c7';
          e.currentTarget.style.color = '#ffffff';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(2, 132, 199, 0.08)';
          e.currentTarget.style.color = '#0284c7';
        }}
      >
        <Volume2 size={13} />
        <span>{label || (lang === 'hi' ? 'बोलकर समझें' : 'Explain Voice')}</span>
      </button>

      {/* Friendly Layman Explanation Popover Modal / Tooltip */}
      {isOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            zIndex: 1000,
            width: '320px',
            maxWidth: '90vw',
            background: '#ffffff',
            border: '2px solid #0284c7',
            borderRadius: '12px',
            padding: '14px',
            boxShadow: '0 12px 30px -4px rgba(15, 23, 42, 0.2), 0 4px 10px rgba(0, 0, 0, 0.08)',
            textAlign: 'left'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a', fontWeight: 800, fontSize: '0.85rem' }}>
              <Volume2 size={16} color="#0284c7" />
              <span>{title}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1rem', padding: '0 4px' }}
            >
              <X size={16} />
            </button>
          </div>

          <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: '1.5', margin: '0 0 8px 0' }}>
            {explanation}
          </p>

          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '8px', fontSize: '0.78rem', color: '#166534', lineHeight: '1.4', marginBottom: '10px' }}>
            <strong>{lang === 'hi' ? 'सीधा उदाहरण:' : 'Simple Example:'}</strong> {example}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleListen();
            }}
            style={{
              width: '100%',
              background: isSpeaking ? '#dc2626' : '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'background 0.15s ease'
            }}
          >
            {isSpeaking ? <Square size={14} /> : <Volume2 size={14} />}
            <span>{isSpeaking ? (lang === 'hi' ? 'आवाज रोकें' : 'Stop Audio') : (lang === 'hi' ? 'दोबारा आवाज में सुनें' : 'Listen Again in Voice')}</span>
          </button>
        </div>
      )}
    </div>
  );
};
