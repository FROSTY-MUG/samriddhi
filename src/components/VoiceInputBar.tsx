import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, RefreshCw, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface VoiceInputBarProps {
  lang?: 'en' | 'hi';
  onParsedResult?: (data: {
    sector?: string;
    amount?: number;
    income?: number;
    gender?: 'M' | 'F';
    rawTranscript: string;
  }) => void;
}

export const VoiceInputBar: React.FC<VoiceInputBarProps> = ({
  lang = 'hi',
  onParsedResult,
}) => {
  const [micState, setMicState] = useState<'idle' | 'listening' | 'processing'>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setMicState('listening');
        setStatusMessage(
          lang === 'hi'
            ? 'सुन रहे हैं... कृपया स्पष्ट बोलें (उदा: "मुझे डेयरी के लिए 1 लाख चाहिए")'
            : 'Listening... Please speak clearly (e.g., "I need 1 lakh for a dairy business")'
        );
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const trans = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            currentFinal += trans + ' ';
          } else {
            currentInterim += trans;
          }
        }

        if (currentFinal) {
          setMicState('processing');
          setTranscript((prev) => {
            const updated = (prev + ' ' + currentFinal).trim();
            parseAndEmit(updated);
            return updated;
          });
          setTimeout(() => {
            setMicState('listening');
          }, 800);
        }
        setInterimText(currentInterim);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setMicState('idle');
        if (event.error === 'not-allowed') {
          setStatusMessage(
            lang === 'hi'
              ? 'माइक्रोफ़ोन की अनुमति अस्वीकृत है। कृपया ब्राउज़र में अनुमति दें।'
              : 'Microphone permission denied. Please allow microphone access.'
          );
        } else {
          setStatusMessage(
            lang === 'hi' ? 'पुनः प्रयास करें।' : 'Could not understand audio. Please retry.'
          );
        }
      };

      recognition.onend = () => {
        if (micState === 'listening') {
          setMicState('idle');
        }
      };

      recognitionRef.current = recognition;
    } else {
      setStatusMessage(
        lang === 'hi'
          ? 'आपके ब्राउज़र में वॉइस इनपुट समर्थित नहीं है (Chrome/Edge का उपयोग करें)।'
          : 'Web Speech API is not supported in this browser (Use Chrome or Edge).'
      );
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [lang]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (micState === 'listening') {
      recognitionRef.current.stop();
      setMicState('idle');
    } else {
      setTranscript('');
      setInterimText('');
      try {
        recognitionRef.current.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
        recognitionRef.current.start();
        setMicState('listening');
      } catch (err) {
        console.warn('Recognition start exception:', err);
      }
    }
  };

  const parseAndEmit = (text: string) => {
    const textLower = text.toLowerCase();
    let sector = 'tailor';
    let amount = 100000;
    let income = 200000;
    let gender: 'M' | 'F' = 'M';

    // Trade intent matching
    if (textLower.includes('सिलाई') || textLower.includes('दर्जी') || textLower.includes('कपड़ा') || textLower.includes('tailor')) {
      sector = 'tailor';
    } else if (textLower.includes('डेयरी') || textLower.includes('दूध') || textLower.includes('गाय') || textLower.includes('भैंस') || textLower.includes('dairy')) {
      sector = 'dairy';
    } else if (textLower.includes('दुकान') || textLower.includes('किराना') || textLower.includes('shop') || textLower.includes('grocery')) {
      sector = 'shop';
    } else if (textLower.includes('सोलर') || textLower.includes('रिक्शा') || textLower.includes('solar') || textLower.includes('rickshaw')) {
      sector = 'solar';
    } else if (textLower.includes('शिक्षा') || textLower.includes('पढ़ाई') || textLower.includes('education') || textLower.includes('college')) {
      sector = 'education';
    }

    // Gender concession detection
    if (textLower.includes('महिला') || textLower.includes('औरत') || textLower.includes('female') || textLower.includes('woman')) {
      gender = 'F';
    }

    // Amount extraction
    const lakhMatch = textLower.match(/([\d.]+)\s*(?:लाख|lakh|lac)/);
    if (lakhMatch) {
      amount = parseFloat(lakhMatch[1]) * 100000;
    } else {
      const numMatch = textLower.match(/(\d{4,7})/);
      if (numMatch) {
        amount = parseInt(numMatch[1], 10);
      }
    }

    onParsedResult?.({
      sector,
      amount,
      income,
      gender,
      rawTranscript: text,
    });
  };

  return (
    <div className="w-full bg-[#FFFFFF] border-[1.5px] border-[#CBD5E1] rounded-xl p-4 sm:p-5 shadow-[0_2px_4px_rgba(0,0,0,0.06)]">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Descriptive Text & Accessibility Heading */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#002244] text-[#FF9933] flex items-center justify-center font-black border border-[#00172e] shrink-0">
            <Volume2 size={24} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#002244] leading-tight">
              {lang === 'hi'
                ? 'नागरिक सहायता डेस्क (Citizen Assistance Desk)'
                : 'Citizen Assistance Desk — AI Voice Input'}
            </h2>
            <p className="text-xs text-[#1F2937] font-semibold mt-0.5">
              {lang === 'hi'
                ? 'माइक दबाकर अपनी भाषा में बताएं: व्यवसाय का नाम व आवश्यक ऋण राशि'
                : 'Click the mic & speak: specify your business trade and loan requirement'}
            </p>
          </div>
        </div>

        {/* Prominent Microphone Floating Action Button (FAB) with 3 States */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleListening}
            className={`min-w-[56px] min-h-[56px] rounded-full flex items-center justify-center font-bold text-white transition-all shadow-md focus:outline-none focus:ring-4 ${
              micState === 'listening'
                ? 'bg-rose-600 ring-rose-300 animate-pulse scale-105'
                : micState === 'processing'
                ? 'bg-[#FF9933] text-[#002244] ring-amber-300'
                : 'bg-[#002244] hover:bg-[#003366] ring-blue-200'
            }`}
            title={
              micState === 'listening'
                ? lang === 'hi' ? 'माइक बंद करें' : 'Stop Listening'
                : lang === 'hi' ? 'माइक चालू करें' : 'Start Speaking'
            }
            aria-label="Microphone Voice Input Button"
          >
            {micState === 'listening' ? (
              <MicOff size={24} className="text-white" />
            ) : micState === 'processing' ? (
              <Loader2 size={24} className="animate-spin text-[#002244]" />
            ) : (
              <Mic size={24} className="text-[#FF9933]" />
            )}
          </button>

          <div className="flex flex-col text-left">
            <span className="text-xs font-black uppercase tracking-wider text-[#002244]">
              {micState === 'listening'
                ? lang === 'hi' ? '🔴 आवाज रिकॉर्ड हो रही है...' : '🔴 Listening Live...'
                : micState === 'processing'
                ? lang === 'hi' ? '⚙️ AI विश्लेषण जारी...' : '⚙️ Analyzing Query...'
                : lang === 'hi' ? '🎙️ माइक निष्क्रिय (Idle)' : '🎙️ Mic Idle'}
            </span>
            <span className="text-[11px] text-slate-600 font-semibold">
              {micState === 'listening'
                ? lang === 'hi' ? 'रोकने हेतु पुनः टैप करें' : 'Tap again to stop'
                : lang === 'hi' ? 'बोलने हेतु टैप करें' : 'Tap to start speaking'}
            </span>
          </div>
        </div>
      </div>

      {/* Transcript Feedback Card */}
      <div className="mt-4 bg-[#F8FAFC] border-[1.5px] border-[#CBD5E1] rounded-lg p-3 text-sm flex items-start gap-2.5">
        <Sparkles size={18} className="text-[#FF9933] shrink-0 mt-0.5" />
        <div className="flex-1">
          {transcript || interimText ? (
            <p className="text-[#1F2937] font-bold text-sm">
              <span>{transcript}</span>
              <span className="text-slate-400 italic"> {interimText}</span>
            </p>
          ) : (
            <p className="text-slate-500 italic text-xs font-medium">
              {statusMessage ||
                (lang === 'hi'
                  ? 'माइक दबाकर बोलें (उदा: "मुझे सिलाई मशीन दुकान के लिए ₹1.2 लाख का ऋण चाहिए, मेरी वार्षिक आय ₹2 लाख है")'
                  : 'Tap the mic & speak (e.g., "I need ₹1.2 Lakh loan for a tailoring shop, my annual income is ₹2 Lakh")')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceInputBar;
