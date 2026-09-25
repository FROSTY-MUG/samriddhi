import React, { useState } from 'react';
import { AlertCircle, Pause, Play } from 'lucide-react';

interface MarqueeTickerProps {
  lang?: 'en' | 'hi';
}

export const MarqueeTicker: React.FC<MarqueeTickerProps> = ({ lang = 'hi' }) => {
  const [isPaused, setIsPaused] = useState(false);

  const noticesHindi = [
    '🔔 वैधानिक पात्रता सीमा: रियायती 4.0% - 6.5% वार्षिक ब्याज दर हेतु वार्षिक पारिवारिक आय ₹5.00 लाख से कम होनी अनिवार्य है।',
    '⚡ महिला विशेष छूट: महिला समृद्धि योजना (MSY) के अंतर्गत अनुसूचित जाति की महिला उद्यमियों को 1.0% अतिरिक्त ब्याज छूट।',
    '🏦 सुरक्षित चैनल राउटिंग: पोस्टगिस (PostGIS) प्रणाली द्वारा केवल 5.0% से कम एनपीए (NPA) वाली अधिकृत बैंक शाखाओं को ही आवेदन अग्रेषित होंगे।',
    '📜 यूआईडीएआई गोपनीयता: आधार पेपरलेस ई-केवाईसी में 12-अंकों का आधार नंबर पूर्णतः विलोपित [Aadhaar Redacted] किया जाता है।',
  ];

  const noticesEnglish = [
    '🔔 Statutory Ceiling: Annual family income must be below ₹5.00 Lakhs to qualify for 4.0% - 6.5% concessional credit under NSFDC.',
    '⚡ Special Rebate: 1.0% concessional interest rebate active for SC women entrepreneurs under Mahila Samriddhi Yojana (MSY).',
    '🏦 Channel Partner Safety: PostGIS spatial routing strictly excludes branches where NPA > 5.0% or unutilized quota is depleted.',
    '📜 UIDAI Privacy Directive: 12-digit Aadhaar numbers are actively redacted to [Aadhaar Redacted] in compliance with statutory regulations.',
  ];

  const notices = lang === 'hi' ? noticesHindi : noticesEnglish;

  return (
    <div
      className="w-full bg-[#FEF08A] text-[#854D0E] border-y-[1.5px] border-[#FACC15] py-2 px-4 flex items-center select-none overflow-hidden shadow-[0_2px_4px_rgba(0,0,0,0.04)]"
      role="region"
      aria-label="Statutory Government Notices / वैधानिक सरकारी सूचनाएं"
    >
      {/* High-Contrast Statutory Notice Badge */}
      <div className="flex items-center gap-1.5 bg-[#854D0E] text-white font-black text-xs px-3 py-1 rounded uppercase tracking-wider shrink-0 z-10 shadow-sm min-h-[32px]">
        <AlertCircle size={15} className="text-[#FEF08A]" />
        <span>{lang === 'hi' ? 'महत्वपूर्ण वैधानिक सूचना' : 'STATUTORY CEILING NOTICE'}</span>
      </div>

      {/* Marquee Content */}
      <div
        className="flex-1 overflow-hidden relative mx-3"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className={`flex items-center gap-12 whitespace-nowrap text-xs sm:text-sm font-bold text-[#713F12] transition-all ${
            isPaused ? '' : 'animate-marquee'
          }`}
          style={{
            animationDuration: '32s',
            animationTimingFunction: 'linear',
            animationIterationCount: 'infinite',
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        >
          {notices.map((text, idx) => (
            <span key={idx} className="inline-flex items-center gap-2">
              <span>{text}</span>
              {idx < notices.length - 1 && (
                <span className="text-[#EA580C] font-black">●</span>
              )}
            </span>
          ))}
        </div>
      </div>

      {/* Play / Pause Accessibility Button (minimum 44x44px target) */}
      <button
        onClick={() => setIsPaused(!isPaused)}
        title={isPaused ? 'सूचनाएं चालू करें (Resume Ticker)' : 'सूचनाएं रोकें (Pause Ticker)'}
        className="min-h-[44px] min-w-[44px] text-[#854D0E] hover:text-black p-2 rounded hover:bg-yellow-200 transition shrink-0 flex items-center justify-center font-bold"
        aria-label="Pause or Resume Ticker"
      >
        {isPaused ? <Play size={16} className="text-emerald-700" /> : <Pause size={16} />}
      </button>
    </div>
  );
};

export default MarqueeTicker;
