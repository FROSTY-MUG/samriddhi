import React from 'react';
import { GovTopBar } from './GovTopBar';
import { GovHeader } from './GovHeader';
import { MarqueeTicker } from './MarqueeTicker';
import { PhoneCall, ShieldCheck, Landmark, Globe, HelpCircle, ExternalLink } from 'lucide-react';

interface GovLayoutProps {
  children: React.ReactNode;
  lang?: 'en' | 'hi';
  onLangToggle?: (lang: 'en' | 'hi') => void;
  onFontSizeChange?: (size: 'sm' | 'base' | 'lg') => void;
}

export const GovLayout: React.FC<GovLayoutProps> = ({
  children,
  lang = 'hi',
  onLangToggle,
  onFontSizeChange,
}) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1F2937] flex flex-col font-sans">
      {/* 1. Top Utility & Accessibility Bar */}
      <GovTopBar
        currentLang={lang}
        onLangToggle={onLangToggle}
        onFontSizeChange={onFontSizeChange}
      />

      {/* 2. Official Institutional Header */}
      <GovHeader lang={lang} />

      {/* 3. Ticker & Statutory Ceiling Notice */}
      <MarqueeTicker lang={lang} />

      {/* 4. Main Body Content */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {children}
      </main>

      {/* 5. GIGW 3.0 Official Government Footer */}
      <footer className="w-full bg-[#002244] text-white border-t-4 border-[#FF9933] mt-12 select-none">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs border-b border-slate-700 pb-6">
            {/* Ministry & Mandate */}
            <div>
              <h4 className="text-sm font-black text-[#FF9933] mb-2 uppercase tracking-wide">
                {lang === 'hi' ? 'मंत्रालय एवं निगम' : 'Ministry & Corporation'}
              </h4>
              <p className="text-slate-300 leading-relaxed font-medium">
                {lang === 'hi'
                  ? 'राष्ट्रीय अनुसूचित जाति वित्त एवं विकास निगम (NSFDC), सामाजिक न्याय एवं अधिकारिता मंत्रालय, भारत सरकार का एक उपक्रम।'
                  : 'National Scheduled Castes Finance & Development Corporation (NSFDC), Ministry of Social Justice & Empowerment, Govt. of India.'}
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-sm font-black text-[#FF9933] mb-2 uppercase tracking-wide">
                {lang === 'hi' ? 'महत्वपूर्ण पोर्टल' : 'Statutory Portals'}
              </h4>
              <ul className="space-y-1.5 text-slate-300 font-semibold">
                <li>
                  <a href="https://socialjustice.gov.in" target="_blank" rel="noreferrer" className="hover:text-[#FF9933] flex items-center gap-1">
                    <span>MoSJE Portal</span> <ExternalLink size={11} />
                  </a>
                </li>
                <li>
                  <a href="https://nsfdc.nic.in" target="_blank" rel="noreferrer" className="hover:text-[#FF9933] flex items-center gap-1">
                    <span>NSFDC Official</span> <ExternalLink size={11} />
                  </a>
                </li>
                <li>
                  <a href="https://uidai.gov.in" target="_blank" rel="noreferrer" className="hover:text-[#FF9933] flex items-center gap-1">
                    <span>UIDAI myAadhaar</span> <ExternalLink size={11} />
                  </a>
                </li>
                <li>
                  <a href="https://www.india.gov.in" target="_blank" rel="noreferrer" className="hover:text-[#FF9933] flex items-center gap-1">
                    <span>National Portal of India</span> <ExternalLink size={11} />
                  </a>
                </li>
              </ul>
            </div>

            {/* Grievance & Contact */}
            <div>
              <h4 className="text-sm font-black text-[#FF9933] mb-2 uppercase tracking-wide">
                {lang === 'hi' ? 'नागरिक शिकायत एवं सहायता' : 'Citizen Grievance Desk'}
              </h4>
              <p className="text-slate-300 font-semibold">
                {lang === 'hi' ? 'निःशुल्क हेल्पलाइन: ' : 'Toll-Free Helpline: '}
                <strong className="text-white font-extrabold text-sm block">1800-200-2622</strong>
              </p>
              <p className="text-slate-300 mt-1">
                {lang === 'hi' ? 'ईमेल: ' : 'Email: '} support@samriddhi.gov.in
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                {lang === 'hi' ? 'कार्य दिवस: सोमवार से शुक्रवार (9:30 AM - 6:00 PM)' : 'Working Days: Mon - Fri (9:30 AM - 6:00 PM)'}
              </p>
            </div>

            {/* Standards Compliance */}
            <div>
              <h4 className="text-sm font-black text-[#FF9933] mb-2 uppercase tracking-wide">
                {lang === 'hi' ? 'मानक एवं अनुपालन' : 'GIGW 3.0 Compliance'}
              </h4>
              <div className="flex items-center gap-2 bg-slate-800 p-2.5 rounded border border-slate-600 mb-2">
                <ShieldCheck size={20} className="text-[#138808]" />
                <span className="text-[11px] text-slate-200 font-bold">
                  {lang === 'hi' ? 'GIGW 3.0 एवं UX4G प्रमाणित' : 'GIGW 3.0 & UX4G Certified'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                {lang === 'hi'
                  ? 'यह पोर्टल भारत सरकार के वेबसाइट दिशानिर्देशों (GIGW 3.0) एवं आधार गोपनीयता कानून 2016 के अनुरूप संचालित है।'
                  : 'Operated in accordance with Guidelines for Indian Government Websites (GIGW 3.0) and Aadhaar Act 2016.'}
              </p>
            </div>
          </div>

          {/* Bottom Copyright Strip */}
          <div className="pt-4 flex flex-col sm:flex-row justify-between items-center text-[11px] text-slate-400 gap-2">
            <span>
              © 2026 {lang === 'hi' ? 'समृद्धि AI • सर्वाधिकार सुरक्षित' : 'SamriddhiAI • All Rights Reserved'}
            </span>
            <span>
              {lang === 'hi' ? 'स्मार्ट इंडिया हैकाथॉन (SIH) 2026 • समस्या विवरण 26092' : 'Smart India Hackathon (SIH) 2026 • Problem Statement 26092'}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default GovLayout;
