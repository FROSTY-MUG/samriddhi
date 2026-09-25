import React from 'react';

interface GovHeaderProps {
  lang?: 'en' | 'hi';
}

export const GovHeader: React.FC<GovHeaderProps> = ({ lang = 'hi' }) => {
  return (
    <div className="w-full bg-[#FFFFFF] border-b-2 border-[#002244] shadow-[0_2px_4px_rgba(0,0,0,0.06)] select-none">
      <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Left: State Emblem of India (Ashoka Pillar) SVG */}
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center justify-center p-2 border-[1.5px] border-[#CBD5E1] rounded-md bg-[#F8FAFC]">
            <svg
              className="w-12 h-14 text-[#002244]"
              viewBox="0 0 100 125"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="State Emblem of India (Ashoka Pillar Capital)"
            >
              {/* Four Lions Capital representation */}
              <circle cx="50" cy="22" r="14" fill="#002244" />
              <circle cx="30" cy="28" r="11" fill="#002244" />
              <circle cx="70" cy="28" r="11" fill="#002244" />
              <path d="M22 48 Q50 36 78 48 L72 74 Q50 68 28 74 Z" fill="#002244" />
              
              {/* Abacus Base with Ashoka Chakra */}
              <rect x="18" y="75" width="64" height="6" rx="2" fill="#002244" />
              <circle cx="50" cy="92" r="13" fill="none" stroke="#002244" strokeWidth="2.5" />
              <circle cx="50" cy="92" r="2.5" fill="#002244" />
              {/* Chakra Spokes */}
              <line x1="50" y1="79" x2="50" y2="105" stroke="#002244" strokeWidth="1.5" />
              <line x1="37" y1="92" x2="63" y2="92" stroke="#002244" strokeWidth="1.5" />
              <line x1="41" y1="83" x2="59" y2="101" stroke="#002244" strokeWidth="1.5" />
              <line x1="59" y1="83" x2="41" y2="101" stroke="#002244" strokeWidth="1.5" />
              
              {/* Plinth with Satyameva Jayate Banner */}
              <rect x="12" y="108" width="76" height="13" rx="3" fill="#002244" />
              <text x="50" y="117.5" fill="#FFFFFF" fontSize="7.5" textAnchor="middle" fontWeight="bold">
                सत्यमेव जयते
              </text>
            </svg>
            <span className="text-[9px] font-black text-[#002244] uppercase tracking-wider mt-1">
              {lang === 'hi' ? 'भारत सरकार' : 'GOVT. OF INDIA'}
            </span>
          </div>

          {/* Center: Ministry text & NSFDC */}
          <div className="flex flex-col text-left">
            <h1 className="text-lg sm:text-xl md:text-2xl font-black text-[#002244] tracking-tight leading-tight flex items-center gap-2">
              <span>समृद्धि AI (SamriddhiAI)</span>
              <span className="text-xs bg-[#FF9933] text-[#002244] px-2.5 py-0.5 rounded font-black tracking-wide border border-amber-600/30">
                SIH 2026 • PS 26092
              </span>
            </h1>
            <p className="text-xs sm:text-sm font-extrabold text-[#1F2937] leading-snug mt-0.5">
              सामाजिक न्याय और अधिकारिता मंत्रालय / Ministry of Social Justice and Empowerment
            </p>
            <p className="text-xs font-bold text-[#002244] flex items-center gap-1.5 mt-0.5">
              <span className="bg-[#002244] text-white px-1.5 py-0.5 rounded text-[11px] font-black">NSFDC</span>
              <span>
                {lang === 'hi'
                  ? 'राष्ट्रीय अनुसूचित जाति वित्त एवं विकास निगम'
                  : 'National Scheduled Castes Finance & Development Corporation'}
              </span>
            </p>
          </div>
        </div>

        {/* Right: Digital India & Swachh Bharat Logos */}
        <div className="flex items-center gap-4 flex-wrap justify-end">
          {/* Digital India Emblem Representation */}
          <div className="flex items-center gap-2 p-2 border-[1.5px] border-[#CBD5E1] rounded-md bg-[#F8FAFC]">
            <div className="flex flex-col text-right">
              <span className="text-xs font-black tracking-wider text-[#FF9933]">
                Digital India
              </span>
              <span className="text-[10px] font-bold text-[#138808]">
                डिजिटल भारत
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#002244] flex items-center justify-center font-black text-white text-xs border border-amber-400">
              DI
            </div>
          </div>

          {/* Swachh Bharat Spectacles representation */}
          <div className="flex items-center gap-2 p-2 border-[1.5px] border-[#CBD5E1] rounded-md bg-[#F8FAFC]">
            <svg className="w-12 h-6" viewBox="0 0 100 50">
              <circle cx="30" cy="25" r="18" fill="none" stroke="#002244" strokeWidth="4" />
              <circle cx="70" cy="25" r="18" fill="none" stroke="#002244" strokeWidth="4" />
              <path d="M48 25 L52 25" stroke="#002244" strokeWidth="4" />
              <text x="30" y="28" fill="#138808" fontSize="8" fontWeight="bold" textAnchor="middle">स्वच्छ</text>
              <text x="70" y="28" fill="#FF9933" fontSize="8" fontWeight="bold" textAnchor="middle">भारत</text>
            </svg>
            <span className="text-[9px] font-bold text-slate-700 leading-tight">
              एक कदम स्वच्छता की ओर
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovHeader;
