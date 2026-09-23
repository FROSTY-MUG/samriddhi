import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, AlertCircle, CheckCircle, Languages, Radio } from 'lucide-react';
import { Language } from '../utils/translations';
import { UserInputProfile, SectorType, EducationLevel, GenderType } from '../types';

interface VoiceSpeechBarProps {
  lang: Language;
  onVoiceProfileParsed: (extractedProfile: Partial<UserInputProfile>, rawTranscript: string) => void;
  onReadAloud: (customText?: string) => void;
  isReadingAloud: boolean;
}

// Multi-lingual speech recognition language mapping
const BCP47_LANG_CODES: Record<Language, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  mr: 'mr-IN'
};

const LANG_PROMPTS: Record<Language, { prompt: string; listening: string; recognized: string; speakHint: string }> = {
  en: {
    prompt: 'Tap mic & speak in your language (e.g. "I want to start a tailoring business with 1 lakh cost and 2 lakh income")',
    listening: 'Listening... Please speak clearly about your business, income or loan amount.',
    recognized: 'Recognized Voice Input:',
    speakHint: 'Voice-to-Form AI Engine Active'
  },
  hi: {
    prompt: 'माइक दबाकर बोलें (उदा: "मुझे सिलाई का काम शुरू करना है, 1 लाख रुपये चाहिए, पारिवारिक आय 2 लाख है")',
    listening: 'सुन रहे हैं... कृपया अपने व्यवसाय, लागत या आय के बारे में बोलें।',
    recognized: 'आपकी आवाज से प्राप्त विवरण:',
    speakHint: 'बोलकर फॉर्म भरें (AI वॉइस इनपुट)'
  },
  ta: {
    prompt: 'மைக்கை அழுத்தி பேசவும் (எ.கா: "தையல் தொழில் தொடங்க 1 லட்சம் கடன் தேவை, ஆண்டு வருமானம் 2 லட்சம்")',
    listening: 'கேட்கிறது... உங்கள் தொழில், கடன் தேவை அல்லது வருமானம் பற்றி பேசவும்.',
    recognized: 'குரல் மூலம் பெறப்பட்ட தகவல்:',
    speakHint: 'குரல் வழி விண்ணப்பம்'
  },
  mr: {
    prompt: 'माइक दाबून बोला (उदा: "मला टेलरिंगचे दुकान सुरू करायचे आहे, १ लाख खर्च आणि २ लाख उत्पन्न आहे")',
    listening: 'ऐकत आहोत... कृपया तुमच्या व्यवसायाबद्दल, खर्चाबद्दल किंवा उत्पन्नाबद्दल बोला.',
    recognized: 'आवाजाद्वारे मिळालेली माहिती:',
    speakHint: 'बोलून फॉर्म भरा (व्हॉइस इनपुट)'
  }
};

export const VoiceSpeechBar: React.FC<VoiceSpeechBarProps> = ({
  lang,
  onVoiceProfileParsed,
  onReadAloud,
  isReadingAloud
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [recognitionError, setRecognitionError] = useState<string>('');
  const [extractedSummary, setExtractedSummary] = useState<string>('');

  const recognitionRef = useRef<any>(null);
  const debounceTimerRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const finalTranscriptRef = useRef<string>('');

  const currentStrings = LANG_PROMPTS[lang] || LANG_PROMPTS.en;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Ignore
        }
        recognitionRef.current = null;
      }
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    };
  }, []);

  // Low-latency Real-time Speech Recognition
  const handleToggleRecord = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setRecognitionError('Speech recognition is not supported in this browser. Please use Chrome/Edge or modern mobile browser.');
      return;
    }

    // If currently recording, stop cleanly and immediately release mic
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // Ignore
        }
        recognitionRef.current = null;
      }
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = BCP47_LANG_CODES[lang] || 'hi-IN';
      // Enable streaming interim results for sub-50ms visual response
      recognition.interimResults = true;
      recognition.continuous = true;
      recognition.maxAlternatives = 1;

      finalTranscriptRef.current = '';

      recognition.onstart = () => {
        setIsRecording(true);
        setRecognitionError('');
        setTranscript('');
        setExtractedSummary('');
      };

      recognition.onresult = (event: any) => {
        let interimText = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          const text = item[0].transcript;
          if (item.isFinal) {
            finalTranscriptRef.current += text + ' ';
          } else {
            interimText += text;
          }
        }

        const fullCurrentTranscript = (finalTranscriptRef.current + interimText).trim();
        if (fullCurrentTranscript) {
          setTranscript(fullCurrentTranscript);

          // Real-time debounce parsing (120ms): allows user to see recommendation changes live as they speak!
          if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = setTimeout(() => {
            parseVoiceInput(fullCurrentTranscript);
          }, 120);

          // Reset smart silence timer: auto-finalizes if user stops speaking for 2.2 seconds
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            if (recognitionRef.current) {
              try {
                recognitionRef.current.stop();
              } catch {
                // Ignore
              }
              recognitionRef.current = null;
            }
            setIsRecording(false);
          }, 2200);
        }
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          // Non-fatal warning on quiet room
          setRecognitionError('No speech detected. Please speak into your microphone.');
        } else if (event.error === 'aborted') {
          // User intentionally stopped
        } else {
          setRecognitionError(`Mic notice: ${event.error}`);
          setIsRecording(false);
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
        recognitionRef.current = null;
        if (finalTranscriptRef.current.trim()) {
          parseVoiceInput(finalTranscriptRef.current.trim());
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      setIsRecording(false);
      recognitionRef.current = null;
      setRecognitionError('Could not initialize microphone access.');
    }
  };

  // Rule-based NLP parser to extract Project Type, Cost, and Income from speech in Hindi/English/Tamil/Marathi
  const parseVoiceInput = (text: string) => {
    const lower = text.toLowerCase();
    const extracted: Partial<UserInputProfile> = {};
    const parsedNotes: string[] = [];

    // 1. Detect Sector / Project Type
    if (
      lower.includes('tailor') || lower.includes('सिलाई') || lower.includes('दर्जी') ||
      lower.includes('shop') || lower.includes('दुकान') || lower.includes('vending') ||
      lower.includes('ठेला') || lower.includes('small') || lower.includes('छोटा') || lower.includes('தையல்')
    ) {
      extracted.sector = 'micro_enterprise';
      parsedNotes.push('Sector: Micro Enterprise / Trade');
    } else if (
      lower.includes('women') || lower.includes('mahila') || lower.includes('महिला') ||
      lower.includes('shg') || lower.includes('समूह') || lower.includes('பெண்கள்') || lower.includes('बचत गट')
    ) {
      extracted.sector = 'women_entrepreneurship';
      extracted.gender = 'female';
      parsedNotes.push('Sector: Women Entrepreneurship (MSY)');
    } else if (
      lower.includes('kisan') || lower.includes('agriculture') || lower.includes('farm') ||
      lower.includes('dairy') || lower.includes('दूध') || lower.includes('गाय') ||
      lower.includes('भैंस') || lower.includes('बकरी') || lower.includes('कृषि') || lower.includes('விவசாயம்')
    ) {
      extracted.sector = 'agriculture';
      parsedNotes.push('Sector: Agriculture / Dairy');
    } else if (
      lower.includes('electric') || lower.includes('rickshaw') || lower.includes('रिक्शा') ||
      lower.includes('solar') || lower.includes('सोलर') || lower.includes('green') || lower.includes('पर्यावरण')
    ) {
      extracted.sector = 'green_business';
      parsedNotes.push('Sector: Green Business / E-Mobility');
    } else if (
      lower.includes('education') || lower.includes('study') || lower.includes('पढ़ाई') ||
      lower.includes('college') || lower.includes('engineering') || lower.includes('medical') ||
      lower.includes('கல்வி') || lower.includes('शिक्षण')
    ) {
      if (lower.includes('abroad') || lower.includes('foreign') || lower.includes('विदेश')) {
        extracted.sector = 'education_abroad';
        parsedNotes.push('Sector: Education Abroad');
      } else {
        extracted.sector = 'education_inland';
        parsedNotes.push('Sector: Inland Higher Education');
      }
    } else if (
      lower.includes('factory') || lower.includes('उद्योग') || lower.includes('कारखाना') ||
      lower.includes('manufacturing') || lower.includes('plant') || lower.includes('बड़ा कर्ज')
    ) {
      extracted.sector = 'term_loan';
      parsedNotes.push('Sector: Term Loan / Industry');
    }

    // 2. Extract Numbers for Cost & Income
    // Patterns like: "1 lakh", "2 लाख", "50000", "50 हजार", "1.4 lakh", "80k"
    const lakhMatches = lower.match(/(\d+(\.\d+)?)\s*(lakh|lakhs|lac|लाख|லட்சம்|लाखा)/g);
    const thousandMatches = lower.match(/(\d+(\.\d+)?)\s*(thousand|हजार|हज़ार|k|ஆயிரம்)/g);
    const croreMatches = lower.match(/(\d+(\.\d+)?)\s*(crore|cr|करोड़)/g);

    // Common Hindi text numerals
    let textBasedNum: number | null = null;
    if (lower.includes('डेढ़ लाख') || lower.includes('dedh lakh') || lower.includes('1.5 lakh')) textBasedNum = 150000;
    else if (lower.includes('एक लाख') || lower.includes('ek lakh')) textBasedNum = 100000;
    else if (lower.includes('दो लाख') || lower.includes('do lakh')) textBasedNum = 200000;
    else if (lower.includes('तीन लाख') || lower.includes('teen lakh')) textBasedNum = 300000;
    else if (lower.includes('पचास हजार') || lower.includes('50 hazar')) textBasedNum = 50000;

    if (textBasedNum) {
      extracted.estimatedCost = textBasedNum;
      parsedNotes.push(`Cost: ₹${textBasedNum.toLocaleString('en-IN')}`);
    } else if (croreMatches && croreMatches.length > 0) {
      const val = parseFloat(croreMatches[0].replace(/[^\d.]/g, '')) * 10000000;
      extracted.estimatedCost = val;
      parsedNotes.push(`Cost: ₹${val.toLocaleString('en-IN')}`);
    } else if (lakhMatches && lakhMatches.length > 0) {
      const numbers = lakhMatches.map(m => {
        const val = parseFloat(m.replace(/[^\d.]/g, ''));
        return val * 100000;
      });

      if (numbers.length === 1) {
        // If single lakh mentioned, if <= 1.5L likely cost, else if 2-5L likely cost
        extracted.estimatedCost = numbers[0];
        parsedNotes.push(`Cost: ₹${numbers[0].toLocaleString('en-IN')}`);
      } else if (numbers.length >= 2) {
        // First usually cost or income
        if (lower.includes('income') || lower.includes('आय') || lower.includes('வருமானம்') || lower.includes('उत्पन्न')) {
          extracted.annualIncome = numbers[0];
          extracted.estimatedCost = numbers[1];
          parsedNotes.push(`Income: ₹${numbers[0].toLocaleString('en-IN')}, Cost: ₹${numbers[1].toLocaleString('en-IN')}`);
        } else {
          extracted.estimatedCost = numbers[0];
          extracted.annualIncome = numbers[1];
          parsedNotes.push(`Cost: ₹${numbers[0].toLocaleString('en-IN')}, Income: ₹${numbers[1].toLocaleString('en-IN')}`);
        }
      }
    } else if (thousandMatches && thousandMatches.length > 0) {
      const val = parseFloat(thousandMatches[0].replace(/[^\d.]/g, '')) * 1000;
      extracted.estimatedCost = val;
      parsedNotes.push(`Cost: ₹${val.toLocaleString('en-IN')}`);
    } else {
      // Direct numeric check
      const directNums = lower.match(/\b\d{4,7}\b/g);
      if (directNums && directNums.length > 0) {
        const parsed = parseInt(directNums[0], 10);
        if (parsed <= 5000000) {
          extracted.estimatedCost = parsed;
          parsedNotes.push(`Cost: ₹${parsed.toLocaleString('en-IN')}`);
        }
      }
    }

    // 3. Gender check
    if (lower.includes('female') || lower.includes('woman') || lower.includes('महिला') || lower.includes('स्त्री') || lower.includes('பெண்')) {
      extracted.gender = 'female';
      parsedNotes.push('Gender: Female (Eligible for 0.5%–1% Special Rebate)');
    } else if (lower.includes('male') || lower.includes('पुरुष') || lower.includes('ஆண்')) {
      extracted.gender = 'male';
    }

    if (parsedNotes.length > 0) {
      setExtractedSummary(`AI Extracted: ${parsedNotes.join(' • ')}`);
    } else {
      setExtractedSummary('Voice received. Adjust sliders below if details need fine-tuning.');
    }

    onVoiceProfileParsed(extracted, text);
  };

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(15, 23, 42, 0.95))',
        border: '1px solid rgba(56, 189, 248, 0.35)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '28px',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)'
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        {/* Left Info & Prompt */}
        <div style={{ flex: '1 1 300px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ background: '#38bdf8', color: '#0b1120', fontSize: '0.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
              {currentStrings.speakHint}
            </span>
            {isRecording && (
              <span style={{ background: '#ef4444', color: '#ffffff', fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Radio size={11} />
                <span>LIVE STREAMING (&lt; 50ms)</span>
              </span>
            )}
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              Voice Support in {lang === 'hi' ? 'हिन्दी' : lang === 'ta' ? 'தமிழ்' : lang === 'mr' ? 'मराठी' : 'English'}
            </span>
          </div>
          <p style={{ fontSize: '0.88rem', color: isRecording ? '#38bdf8' : '#e2e8f0', fontWeight: isRecording ? 700 : 500 }}>
            {isRecording ? currentStrings.listening : currentStrings.prompt}
          </p>
        </div>

        {/* Right Voice Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Read Aloud Button */}
          <button
            type="button"
            className="btn-secondary"
            style={{
              padding: '10px 16px',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: isReadingAloud ? 'rgba(244, 63, 94, 0.2)' : undefined,
              borderColor: isReadingAloud ? '#f43f5e' : undefined
            }}
            onClick={() => onReadAloud()}
            title="Read scheme guidance aloud in selected language"
          >
            <Volume2 size={16} style={{ color: isReadingAloud ? '#f43f5e' : '#38bdf8' }} />
            <span>{isReadingAloud ? 'Stop Audio' : 'Listen Page'}</span>
          </button>

          {/* Microphone Recording Button */}
          <button
            type="button"
            className="btn-primary"
            style={{
              padding: '10px 20px',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: isRecording ? 'linear-gradient(135deg, #f43f5e, #e11d48)' : undefined,
              boxShadow: isRecording ? '0 0 20px rgba(244, 63, 94, 0.6)' : undefined,
              animation: isRecording ? 'pulse 1.2s infinite' : undefined
            }}
            onClick={handleToggleRecord}
          >
            {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
            <span>{isRecording ? 'Stop Speaking' : 'Speak to Fill Form'}</span>
          </button>
        </div>
      </div>

      {/* Real-time Transcription Display */}
      {transcript && (
        <div
          style={{
            marginTop: '14px',
            padding: '12px 16px',
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(56, 189, 248, 0.25)',
            borderRadius: '10px',
            fontSize: '0.85rem'
          }}
        >
          <div style={{ color: '#38bdf8', fontWeight: 700, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={14} />
            <span>{currentStrings.recognized}</span>
          </div>
          <p style={{ color: '#f8fafc', fontStyle: 'italic', marginBottom: '6px' }}>"{transcript}"</p>
          {extractedSummary && (
            <div style={{ color: '#34d399', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle size={14} />
              <span>{extractedSummary}</span>
            </div>
          )}
        </div>
      )}

      {/* Error message if any */}
      {recognitionError && (
        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px', color: '#f43f5e', fontSize: '0.8rem' }}>
          <AlertCircle size={14} />
          <span>{recognitionError}</span>
        </div>
      )}
    </div>
  );
};
