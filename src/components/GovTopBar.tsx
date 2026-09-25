import React, { useState } from 'react';
import { Globe, Eye, Volume2, ShieldCheck } from 'lucide-react';

interface GovTopBarProps {
  currentLang?: 'en' | 'hi';
  onLangToggle?: (lang: 'en' | 'hi') => void;
  onFontSizeChange?: (size: 'sm' | 'base' | 'lg') => void;
  onScreenReaderToggle?: () => void;
}

export const GovTopBar: React.FC<GovTopBarProps> = ({
  currentLang = 'hi',
  onLangToggle,
  onFontSizeChange,
  onScreenReaderToggle,
}) => {
  const [activeSize, setActiveSize] = useState<'sm' | 'base' | 'lg'>('base');
  const [lang, setLang] = useState<'en' | 'hi'>(currentLang);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [isScreenReaderActive, setIsScreenReaderActive] = useState<boolean>(false);

  const handleSize = (size: 'sm' | 'base' | 'lg') => {
    setActiveSize(size);
    onFontSizeChange?.(size);
    if (size === 'sm') document.documentElement.style.fontSize = '14px';
    if (size === 'base') document.documentElement.style.fontSize = '16px';
    if (size === 'lg') document.documentElement.style.fontSize = '18px';
  };

  const toggleLanguage = () => {
    const nextLang = lang === 'en' ? 'hi' : 'en';
    setLang(nextLang);
    onLangToggle?.(nextLang);
  };

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
    document.body.classList.toggle('gov-high-contrast');
  };

  const handleScreenReader = () => {
    const next = !isScreenReaderActive;
    setIsScreenReaderActive(next);
    onScreenReaderToggle?.();
    if ('speechSynthesis' in window) {
      if (next) {
        const msg = new SpeechSynthesisUtterance(
          lang === 'hi'
            ? 'स्क्रीन रीडर एक्सेस सक्रिय किया गया। समृद्धि एआई पोर्टल में आपका स्वागत है।'
            : 'Screen reader accessibility enabled. Welcome to SamriddhiAI portal.'
        );
        msg.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
        window.speechSynthesis.speak(msg);
      } else {
        window.speechSynthesis.cancel();
      }
    }
  };

  return (
    <div className="w-full bg-[#1F2937] text-white border-b border-slate-700 select-none">
      {/* Tricolor Ribbon (GIGW 3.0 Standard Flag Colors) */}
      <div className="h-1.5 w-full flex">
        <div className="flex-1 bg-[#FF9933]" title="Saffron (Courage & Sacrifice)" />
        <div className="flex-1 bg-[#FFFFFF]" title="White (Peace & Truth)" />
        <div className="flex-1 bg-[#138808]" title="India Green (Prosperity)" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-1.5 flex flex-wrap justify-between items-center text-xs">
        {/* Left: Sovereign Affiliation */}
        <div className="flex items-center gap-2 font-medium tracking-wide">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-[#FF9933] animate-pulse" />
          <span className="font-extrabold text-white text-xs sm:text-sm">
            {lang === 'hi' ? 'भारत सरकार | Government of India' : 'Government of India | भारत सरकार'}
          </span>
          <span className="hidden md:inline text-slate-400">|</span>
          <span className="hidden md:inline text-slate-300 font-semibold text-xs">
            {lang === 'hi' ? 'सामाजिक न्याय और अधिकारिता मंत्रालय' : 'Ministry of Social Justice and Empowerment'}
          </span>
        </div>

        {/* Right: Accessibility Controls (A- / A / A+, Screen Reader & Bilingual Switch) */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Skip to Main Content */}
          <a
            href="#main-content"
            className="text-[11px] text-slate-300 hover:text-white underline underline-offset-2 min-h-[44px] flex items-center px-1 font-semibold"
          >
            {lang === 'hi' ? 'मुख्य सामग्री पर जाएं' : 'Skip to Content'}
          </a>

          {/* Screen Reader Access button */}
          <button
            onClick={handleScreenReader}
            title={lang === 'hi' ? 'स्क्रीन रीडर एक्सेस' : 'Screen Reader Access'}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-bold transition-all min-h-[44px] min-w-[44px] ${
              isScreenReaderActive
                ? 'bg-[#138808] text-white ring-2 ring-emerald-300'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
            }`}
            aria-label="Screen Reader Access"
          >
            <Volume2 size={15} />
            <span className="hidden sm:inline">
              {lang === 'hi' ? 'स्क्रीन रीडर' : 'Screen Reader'}
            </span>
          </button>

          {/* Font Resizing Controls */}
          <div
            className="flex items-center bg-slate-800 rounded border border-slate-600 px-1 py-0.5"
            role="group"
            aria-label="Font Resizing"
          >
            <button
              onClick={() => handleSize('sm')}
              title="Decrease Font Size (A-)"
              className={`min-h-[44px] min-w-[36px] px-2 py-1 text-xs font-black rounded transition-colors flex items-center justify-center ${
                activeSize === 'sm' ? 'bg-[#FF9933] text-black font-extrabold' : 'text-slate-300 hover:text-white'
              }`}
              aria-label="Decrease Font Size"
            >
              A-
            </button>
            <button
              onClick={() => handleSize('base')}
              title="Standard Font Size (A)"
              className={`min-h-[44px] min-w-[36px] px-2 py-1 text-xs font-black rounded transition-colors flex items-center justify-center ${
                activeSize === 'base' ? 'bg-[#FF9933] text-black font-extrabold' : 'text-slate-300 hover:text-white'
              }`}
              aria-label="Standard Font Size"
            >
              A
            </button>
            <button
              onClick={() => handleSize('lg')}
              title="Increase Font Size (A+)"
              className={`min-h-[44px] min-w-[36px] px-2 py-1 text-xs font-black rounded transition-colors flex items-center justify-center ${
                activeSize === 'lg' ? 'bg-[#FF9933] text-black font-extrabold' : 'text-slate-300 hover:text-white'
              }`}
              aria-label="Increase Font Size"
            >
              A+
            </button>
          </div>

          {/* High Contrast Toggle */}
          <button
            onClick={toggleHighContrast}
            title={lang === 'hi' ? 'उच्च कंट्रास्ट टॉगल' : 'Toggle High Contrast'}
            className={`min-h-[44px] min-w-[44px] p-2 rounded border border-slate-600 transition-colors flex items-center justify-center ${
              highContrast ? 'bg-amber-400 text-black' : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
            aria-label="Toggle High Contrast"
          >
            <Eye size={16} />
          </button>

          {/* Bilingual Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 bg-[#FF9933] text-[#002244] font-black px-3 py-1.5 rounded text-xs hover:bg-[#ffaa4d] transition-all shadow-sm min-h-[44px]"
            title="Change Interface Language / भाषा बदलें"
            aria-label="Bilingual Language Toggle"
          >
            <Globe size={15} />
            <span className="font-extrabold">{lang === 'hi' ? 'English' : 'हिन्दी'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GovTopBar;
