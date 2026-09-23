import React, { useState, useEffect } from 'react';
import {
  Bot,
  Key,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Zap,
  Cpu,
  Server,
  Layers,
  X
} from 'lucide-react';
import {
  AIProviderConfig,
  AIProviderType,
  getStoredAIConfig,
  saveAIConfig
} from '../utils/aiMultiProviderRAG';
import { Language } from '../utils/translations';

interface AIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onConfigUpdated: (config: AIProviderConfig) => void;
}

export const AIConfigModal: React.FC<AIConfigModalProps> = ({
  isOpen,
  onClose,
  lang,
  onConfigUpdated
}) => {
  const [config, setConfig] = useState<AIProviderConfig>(getStoredAIConfig());
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setConfig(getStoredAIConfig());
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    saveAIConfig(config);
    onConfigUpdated(config);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '620px', padding: '28px', background: 'rgba(15, 23, 42, 0.96)', backdropFilter: 'blur(20px)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '20px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg, #0284c7, #38bdf8)', padding: '8px', borderRadius: '10px' }}>
              <Cpu size={22} color="#fff" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                {lang === 'hi' ? 'AI इंजन एवं RAG प्रदाता सेटिंग्स' : 'AI & RAG Engine Providers'}
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                Grok (xAI) • Gemini Voice & Reasoning • OpenRouter • Offline Fallback
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.2rem', cursor: 'pointer', padding: '4px' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Provider Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
          {/* Grok */}
          <div
            onClick={() => setConfig({ ...config, provider: 'grok' })}
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: config.provider === 'grok' ? '2px solid #38bdf8' : '1px solid #334155',
              background: config.provider === 'grok' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(30, 41, 59, 0.6)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontWeight: 800, color: '#fff', fontSize: '0.95rem' }}>Grok (xAI)</span>
              <Zap size={16} color="#38bdf8" />
            </div>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>
              {lang === 'hi' ? 'गहन तर्क क्षमता और त्वरित RAG मिलान' : 'Deep reasoning & high-speed RAG analysis'}
            </p>
          </div>

          {/* Gemini */}
          <div
            onClick={() => setConfig({ ...config, provider: 'gemini' })}
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: config.provider === 'gemini' ? '2px solid #38bdf8' : '1px solid #334155',
              background: config.provider === 'gemini' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(30, 41, 59, 0.6)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontWeight: 800, color: '#fff', fontSize: '0.95rem' }}>Gemini 2.5 Flash</span>
              <Sparkles size={16} color="#38bdf8" />
            </div>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>
              {lang === 'hi' ? 'Google वॉयस और बहुभाषी AI' : 'Google Voice, Hinglish & Multi-dialect AI'}
            </p>
          </div>

          {/* OpenRouter */}
          <div
            onClick={() => setConfig({ ...config, provider: 'openrouter' })}
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: config.provider === 'openrouter' ? '2px solid #38bdf8' : '1px solid #334155',
              background: config.provider === 'openrouter' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(30, 41, 59, 0.6)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontWeight: 800, color: '#fff', fontSize: '0.95rem' }}>OpenRouter</span>
              <Layers size={16} color="#38bdf8" />
            </div>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>
              {lang === 'hi' ? 'Llama 3.3, Mistral, DeepSeek रूटिंग' : 'Llama 3.3, Mistral, DeepSeek universal routing'}
            </p>
          </div>

          {/* Offline Fallback */}
          <div
            onClick={() => setConfig({ ...config, provider: 'offline' })}
            style={{
              padding: '14px',
              borderRadius: '12px',
              border: config.provider === 'offline' ? '2px solid #10b981' : '1px solid #334155',
              background: config.provider === 'offline' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(30, 41, 59, 0.6)',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontWeight: 800, color: '#10b981', fontSize: '0.95rem' }}>
                {lang === 'hi' ? 'स्थानीय ऑफ़लाइन RAG' : 'Local Offline RAG'}
              </span>
              <Server size={16} color="#10b981" />
            </div>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>
              {lang === 'hi' ? 'बिना इंटरनेट/कुंजी के 100% निःशुल्क और तुरंत' : 'Zero API keys required • 100% instant & private'}
            </p>
          </div>
        </div>

        {/* API Key Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
          {/* Grok Key */}
          {config.provider === 'grok' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#e2e8f0', marginBottom: '6px', fontWeight: 600 }}>
                xAI Grok API Key:
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="xai-xxxxxxxxxxxxxxxxxxxx"
                value={config.grokKey || ''}
                onChange={(e) => setConfig({ ...config, grokKey: e.target.value })}
              />
              <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: '4px' }}>
                Get from console.x.ai. If not set, system automatically falls back to Offline RAG.
              </span>
            </div>
          )}

          {/* Gemini Key */}
          {config.provider === 'gemini' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#e2e8f0', marginBottom: '6px', fontWeight: 600 }}>
                Google Gemini API Key:
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="AIzaSyxxxxxxxxxxxxxxxxxxxx"
                value={config.geminiKey || ''}
                onChange={(e) => setConfig({ ...config, geminiKey: e.target.value })}
              />
              <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block', marginTop: '4px' }}>
                Get from Google AI Studio (aistudio.google.com). Powers advanced Hindi conversational reasoning.
              </span>
            </div>
          )}

          {/* OpenRouter Key */}
          {config.provider === 'openrouter' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#e2e8f0', marginBottom: '6px', fontWeight: 600 }}>
                OpenRouter API Key:
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="sk-or-v1-xxxxxxxxxxxxxxxxxxxx"
                value={config.openrouterKey || ''}
                onChange={(e) => setConfig({ ...config, openrouterKey: e.target.value })}
              />
              <div style={{ marginTop: '8px' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px' }}>
                  Model ID:
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={config.openrouterModel || 'meta-llama/llama-3.3-70b-instruct'}
                  onChange={(e) => setConfig({ ...config, openrouterModel: e.target.value })}
                />
              </div>
            </div>
          )}

          {config.provider === 'offline' && (
            <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: '10px', padding: '14px', color: '#a7f3d0', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, marginBottom: '4px' }}>
                <ShieldCheck size={16} />
                {lang === 'hi' ? 'सक्रिय ऑफ़लाइन सुरक्षा मोड' : 'Active Offline Privacy Mode'}
              </div>
              {lang === 'hi'
                ? 'सभी योजना मिलान, ब्याज दर और ईएमआई गणना आपके डिवाइस पर ही तुरंत प्रोसेस होती है।'
                : 'All scheme matches, interest computations and investment plans execute directly in-browser.'}
            </div>
          )}

          {/* Voice Engine & Latency Configuration */}
          <div style={{ borderTop: '1px solid #334155', paddingTop: '16px', marginTop: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontSize: '0.82rem', color: '#e2e8f0', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Zap size={14} color="#38bdf8" />
                <span>{lang === 'hi' ? 'वॉयस इंजन गति व प्रतिक्रिया (Voice Latency)' : 'Voice Engine & Latency Preference'}</span>
              </label>
              <span style={{ fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', background: (config.voiceEngine || 'instant') === 'instant' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(56, 189, 248, 0.2)', color: (config.voiceEngine || 'instant') === 'instant' ? '#34d399' : '#38bdf8', fontWeight: 700 }}>
                {(config.voiceEngine || 'instant') === 'instant' ? '⚡ < 20ms Ultra-Low Latency' : '☁️ Neural Cloud TTS'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div
                onClick={() => setConfig({ ...config, voiceEngine: 'instant' })}
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: (config.voiceEngine || 'instant') === 'instant' ? '2px solid #10b981' : '1px solid #334155',
                  background: (config.voiceEngine || 'instant') === 'instant' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(30, 41, 59, 0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#fff', marginBottom: '2px' }}>
                  ⚡ {lang === 'hi' ? 'त्वरित देशी वॉयस (< 20ms)' : 'Instant Native Voice (< 20ms)'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: '1.3' }}>
                  {lang === 'hi' ? 'शून्य विलंबता, स्थानीय डिवाइस सिंथेसिस (अनुशंसित)' : 'Zero latency, immediate playback, no network waiting (Recommended)'}
                </div>
              </div>

              <div
                onClick={() => setConfig({ ...config, voiceEngine: 'gemini' })}
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: config.voiceEngine === 'gemini' ? '2px solid #38bdf8' : '1px solid #334155',
                  background: config.voiceEngine === 'gemini' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(30, 41, 59, 0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: '0.82rem', color: '#fff', marginBottom: '2px' }}>
                  🎙️ {lang === 'hi' ? 'Google जेमिनी न्यूरल वॉयस' : 'Gemini Cloud TTS'}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', lineHeight: '1.3' }}>
                  {lang === 'hi' ? 'उच्च गुणवत्ता, इन-मेमोरी कैशिंग एवं 2.5s सुरक्षित टाइमआउट' : 'High fidelity neural voice with audio caching & 2.5s safe fallback'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn-secondary" onClick={onClose}>
            {lang === 'hi' ? 'रद्द करें' : 'Cancel'}
          </button>
          <button
            className="btn-primary"
            onClick={handleSave}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 size={16} />
                <span>{lang === 'hi' ? 'सुरक्षित सहेजा गया' : 'Saved!'}</span>
              </>
            ) : (
              <span>{lang === 'hi' ? 'सेटिंग्स सहेजें' : 'Save Configuration'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
