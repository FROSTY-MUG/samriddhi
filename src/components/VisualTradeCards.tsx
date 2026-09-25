import React from 'react';
import { CheckCircle2, ChevronRight, Tag } from 'lucide-react';

interface TradeCategory {
  id: string;
  schemeId: string;
  nameEn: string;
  nameHi: string;
  maxLimit: string;
  interestRate: string;
  rebateNote: string;
  descriptionEn: string;
  descriptionHi: string;
  vectorIcon: 'sewing' | 'ev' | 'dairy' | 'kirana' | 'education';
}

const TRADES: TradeCategory[] = [
  {
    id: 'tailor',
    schemeId: 'NSFDC-MSY',
    nameEn: 'Tailoring & Garments',
    nameHi: 'सिलाई एवं वस्त्र निर्माण',
    maxLimit: '₹1.40 Lakh Max / अधिकतम ₹1.40 लाख',
    interestRate: '4.0% p.a. (Women Concession)',
    rebateNote: '1.0% MSY छूट',
    descriptionEn: 'Sewing machines, cloth purchase, and boutique setup.',
    descriptionHi: 'सिलाई मशीन, कपड़ा क्रय एवं बुटीक दुकान स्थापना हेतु।',
    vectorIcon: 'sewing',
  },
  {
    id: 'dairy',
    schemeId: 'NSFDC-MFS',
    nameEn: 'Dairy & Animal Husbandry',
    nameHi: 'डेयरी एवं पशुपालन',
    maxLimit: '₹1.40 Lakh Max / अधिकतम ₹1.40 लाख',
    interestRate: '5.5% - 6.5% p.a.',
    rebateNote: 'रियायती दर',
    descriptionEn: 'Milch cattle, automated cans, and cold milk units.',
    descriptionHi: 'दूधारू पशु, दूध के कैन एवं संग्रह केंद्र स्थापना हेतु।',
    vectorIcon: 'dairy',
  },
  {
    id: 'kirana',
    schemeId: 'NSFDC-TLS-S',
    nameEn: 'Small Shop & Kirana Store',
    nameHi: 'किराना दुकान एवं खुदरा व्यापार',
    maxLimit: '₹5.00 Lakh Max / अधिकतम ₹5.00 लाख',
    interestRate: '6.0% - 6.5% p.a.',
    rebateNote: 'टर्म लोन',
    descriptionEn: 'Grocery stock, cash counter, and inventory support.',
    descriptionHi: 'राशन दुकान का माल, काउंटर एवं व्यापार विस्तार हेतु।',
    vectorIcon: 'kirana',
  },
  {
    id: 'solar',
    schemeId: 'NSFDC-GBS',
    nameEn: 'Green Energy & E-Rickshaw',
    nameHi: 'हरित ऊर्जा एवं ई-रिक्शा (GBS)',
    maxLimit: '₹30.00 Lakh Max / अधिकतम ₹30.00 लाख',
    interestRate: '6.5% p.a. + 15% Subsidy',
    rebateNote: '15% पूंजी अनुदान',
    descriptionEn: 'Battery e-rickshaws, solar rooftops, and bio-waste units.',
    descriptionHi: 'बैटरी ई-रिक्शा, सौर ऊर्जा संयंत्र एवं स्वच्छ ऊर्जा वाहन।',
    vectorIcon: 'ev',
  },
  {
    id: 'education',
    schemeId: 'NSFDC-ELS-IN',
    nameEn: 'Higher Technical Education',
    nameHi: 'उच्च तकनीकी एवं व्यावसायिक शिक्षा',
    maxLimit: '₹20.00 Lakh Max / अधिकतम ₹20.00 लाख',
    interestRate: '6.0% p.a. (Concessional)',
    rebateNote: 'कोर्स + 6 माह',
    descriptionEn: 'Engineering, medical, and recognized inland degrees.',
    descriptionHi: 'इंजीनियरिंग, मेडिकल एवं मान्यता प्राप्त व्यावसायिक पाठ्यक्रम।',
    vectorIcon: 'education',
  },
];

interface VisualTradeCardsProps {
  lang?: 'en' | 'hi';
  selectedTradeId?: string;
  onSelectTrade?: (trade: TradeCategory) => void;
}

export const VisualTradeCards: React.FC<VisualTradeCardsProps> = ({
  lang = 'hi',
  selectedTradeId = 'tailor',
  onSelectTrade,
}) => {
  // Render concrete flat SVG icons
  const renderVectorIcon = (type: TradeCategory['vectorIcon']) => {
    switch (type) {
      case 'sewing':
        return (
          <svg className="w-12 h-12 text-[#002244]" viewBox="0 0 64 64" fill="currentColor">
            {/* Flat Sewing Machine Vector */}
            <path d="M12 48 H52 V52 H12 Z" fill="#002244" />
            <path d="M16 20 H48 V26 H32 V36 H44 V40 H32 V48 H24 V20 Z" fill="#002244" />
            <circle cx="48" cy="24" r="6" fill="#FF9933" />
            <rect x="42" y="38" width="4" height="8" fill="#138808" />
            <circle cx="20" cy="48" r="2" fill="#FFFFFF" />
          </svg>
        );
      case 'dairy':
        return (
          <svg className="w-12 h-12 text-[#002244]" viewBox="0 0 64 64" fill="currentColor">
            {/* Flat Milk Can & Cattle Symbol */}
            <rect x="22" y="24" width="20" height="28" rx="3" fill="#002244" />
            <path d="M26 14 H38 V20 H26 Z" fill="#002244" />
            <rect x="20" y="20" width="24" height="4" rx="1" fill="#FF9933" />
            <circle cx="32" cy="38" r="6" fill="#FFFFFF" />
            <path d="M29 38 L35 38" stroke="#138808" strokeWidth="2" />
          </svg>
        );
      case 'kirana':
        return (
          <svg className="w-12 h-12 text-[#002244]" viewBox="0 0 64 64" fill="currentColor">
            {/* Flat Kirana / Grocery Storefront */}
            <path d="M12 24 L32 12 L52 24 V28 H12 Z" fill="#002244" />
            <rect x="16" y="28" width="32" height="24" fill="#F8FAFC" stroke="#002244" strokeWidth="3" />
            <rect x="22" y="34" width="8" height="18" fill="#FF9933" />
            <rect x="34" y="34" width="10" height="10" fill="#138808" />
            <line x1="12" y1="52" x2="52" y2="52" stroke="#002244" strokeWidth="4" />
          </svg>
        );
      case 'ev':
        return (
          <svg className="w-12 h-12 text-[#002244]" viewBox="0 0 64 64" fill="currentColor">
            {/* Flat 3-Wheeler E-Rickshaw Vector */}
            <path d="M14 36 L22 20 H44 L50 36 H14 Z" fill="#002244" />
            <circle cx="20" cy="46" r="6" fill="#138808" />
            <circle cx="44" cy="46" r="6" fill="#138808" />
            <circle cx="20" cy="46" r="2" fill="#FFFFFF" />
            <circle cx="44" cy="46" r="2" fill="#FFFFFF" />
            <rect x="26" y="24" width="12" height="8" fill="#FF9933" />
            <path d="M46 30 L54 36" stroke="#002244" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );
      case 'education':
        return (
          <svg className="w-12 h-12 text-[#002244]" viewBox="0 0 64 64" fill="currentColor">
            {/* Flat Graduation Cap & Books */}
            <path d="M32 14 L12 24 L32 34 L52 24 Z" fill="#002244" />
            <path d="M20 28 V40 C20 44, 44 44, 44 40 V28" fill="none" stroke="#002244" strokeWidth="3" />
            <line x1="48" y1="26" x2="48" y2="42" stroke="#FF9933" strokeWidth="2.5" />
            <circle cx="48" cy="43" r="2" fill="#FF9933" />
          </svg>
        );
    }
  };

  return (
    <div className="w-full my-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 border-b border-[#CBD5E1] pb-2">
        <div>
          <h3 className="text-base sm:text-lg font-black text-[#002244]">
            {lang === 'hi' ? 'व्यवसाय क्षेत्र चुनें (Select Your Trade Sector)' : 'Select Your Trade Sector'}
          </h3>
          <p className="text-xs text-slate-600 font-semibold">
            {lang === 'hi'
              ? 'प्रत्येक कार्ड पर वैधानिक ऋण सीमा एवं रियायती ब्याज दर अंकित है'
              : 'Each card displays statutory credit ceilings and concessional interest rates'}
          </p>
        </div>
        <span className="text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded">
          {lang === 'hi' ? 'NSFDC अधिकृत योजनाएं' : 'NSFDC Statutory Schemes'}
        </span>
      </div>

      {/* Grid of concrete 2D trade cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TRADES.map((trade) => {
          const isSelected = selectedTradeId === trade.id;
          return (
            <div
              key={trade.id}
              onClick={() => onSelectTrade?.(trade)}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              className={`text-left p-4 rounded-xl border-[1.5px] transition-all cursor-pointer select-none relative flex flex-col justify-between min-h-[160px] ${
                isSelected
                  ? 'border-[#002244] bg-[#FFFFFF] shadow-[0_4px_12px_rgba(0,34,68,0.12)] ring-2 ring-[#002244]'
                  : 'border-[#CBD5E1] bg-[#FFFFFF] hover:border-slate-400 hover:shadow-[0_2px_4px_rgba(0,0,0,0.06)]'
              }`}
            >
              {/* Header: Vector Icon + Trade Name */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-[#F8FAFC] border border-[#CBD5E1]">
                    {renderVectorIcon(trade.vectorIcon)}
                  </div>
                  {/* Concessional Badge */}
                  <div className="flex flex-col items-end">
                    <span className="text-[11px] font-black bg-[#138808] text-white px-2 py-0.5 rounded shadow-sm">
                      {trade.interestRate}
                    </span>
                    <span className="text-[10px] text-amber-700 font-bold mt-0.5">
                      {trade.rebateNote}
                    </span>
                  </div>
                </div>

                <h4 className="text-base font-black text-[#002244] leading-snug">
                  {lang === 'hi' ? trade.nameHi : trade.nameEn}
                </h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {lang === 'hi' ? trade.nameEn : trade.nameHi}
                </p>

                <p className="text-xs text-[#1F2937] font-semibold mt-2 line-clamp-2">
                  {lang === 'hi' ? trade.descriptionHi : trade.descriptionEn}
                </p>
              </div>

              {/* Statutory Limit Badge at Bottom */}
              <div className="mt-4 pt-2.5 border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black text-[#002244]">
                  <Tag size={14} className="text-[#FF9933]" />
                  <span>{trade.maxLimit}</span>
                </div>

                <div
                  className={`min-w-[44px] min-h-[44px] flex items-center justify-end font-bold text-xs ${
                    isSelected ? 'text-[#002244]' : 'text-slate-400'
                  }`}
                >
                  {isSelected ? (
                    <span className="flex items-center gap-1 text-emerald-700 font-black">
                      <CheckCircle2 size={18} />
                      {lang === 'hi' ? 'चयनित' : 'Selected'}
                    </span>
                  ) : (
                    <ChevronRight size={18} />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VisualTradeCards;
