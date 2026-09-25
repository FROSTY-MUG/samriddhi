import React, { useState } from 'react';
import { Calculator, Calendar, Landmark, PiggyBank, ShieldCheck, ArrowRight } from 'lucide-react';

interface FinancialModelingProps {
  lang?: 'en' | 'hi';
  initialCost?: number;
  initialRate?: number;
  initialMoratorium?: number;
  initialTenureYears?: number;
}

export const FinancialModeling: React.FC<FinancialModelingProps> = ({
  lang = 'hi',
  initialCost = 140000,
  initialRate = 4.0,
  initialMoratorium = 6,
  initialTenureYears = 5,
}) => {
  const [projectCost, setProjectCost] = useState<number>(initialCost);
  const [interestRate, setInterestRate] = useState<number>(initialRate);
  const [moratoriumMonths, setMoratoriumMonths] = useState<number>(initialMoratorium);
  const [tenureYears, setTenureYears] = useState<number>(initialTenureYears);

  // Financial calculations
  const govtLoanRatio = 0.90; // 90% NSFDC Concessional Channel
  const beneficiaryMarginRatio = 0.10; // 10% Beneficiary Promoter Equity

  const govtLoanAmount = Math.round(projectCost * govtLoanRatio);
  const beneficiaryMargin = Math.round(projectCost * beneficiaryMarginRatio);

  const totalTenureMonths = tenureYears * 12;
  const repaymentMonths = Math.max(1, totalTenureMonths - moratoriumMonths);

  const monthlyRate = interestRate / 12 / 100;
  const emi =
    monthlyRate > 0
      ? Math.round(
          (govtLoanAmount * monthlyRate * Math.pow(1 + monthlyRate, repaymentMonths)) /
            (Math.pow(1 + monthlyRate, repaymentMonths) - 1)
        )
      : Math.round(govtLoanAmount / repaymentMonths);

  const totalRepayment = emi * repaymentMonths;
  const totalInterest = Math.max(0, totalRepayment - govtLoanAmount);

  return (
    <div className="w-full bg-[#FFFFFF] border-[1.5px] border-[#CBD5E1] rounded-xl p-5 shadow-[0_2px_4px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#CBD5E1] pb-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#002244] text-[#FF9933] flex items-center justify-center font-bold">
            <Calculator size={22} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#002244]">
              {lang === 'hi'
                ? 'रियायती ऋण एवं वित्तीय संरचना विज़ुअलाइज़र (Financial Modeling)'
                : 'Concessional Loan & EMI Financial Visualizer'}
            </h3>
            <p className="text-xs text-slate-600 font-semibold">
              {lang === 'hi'
                ? '90% सरकारी सहायता vs 10% लाभार्थी अंशदान और मोरेटोरियम समय-सारणी'
                : '90% Government Subsidy/Loan vs 10% Beneficiary Margin & Moratorium Timeline'}
            </p>
          </div>
        </div>

        <span className="text-xs font-black bg-[#138808] text-white px-2.5 py-1 rounded shadow-sm">
          {interestRate}% {lang === 'hi' ? 'रियायती ब्याज' : 'Concessional Interest'}
        </span>
      </div>

      {/* 1. Color-Coded Stacked Progress Bar: 90% Govt vs 10% Beneficiary */}
      <div className="mb-6 bg-[#F8FAFC] border-[1.5px] border-[#CBD5E1] p-4 rounded-xl">
        <div className="flex justify-between items-center text-xs font-black text-[#002244] mb-2">
          <span>
            {lang === 'hi'
              ? 'ऋण संरचना अनुपात (90:10 Statutory Ratio)'
              : 'Credit Structure Breakdown (90:10 Ratio)'}
          </span>
          <span className="text-slate-600">
            {lang === 'hi' ? 'कुल परियोजना लागत: ' : 'Total Cost: '}
            <strong className="text-[#002244] text-sm">₹{projectCost.toLocaleString()}</strong>
          </span>
        </div>

        {/* Stacked Progress Bar */}
        <div className="w-full h-8 bg-slate-200 rounded-lg flex overflow-hidden border border-[#CBD5E1]">
          {/* 90% Government Subsidy / Concessional Loan (Navy) */}
          <div
            style={{ width: '90%' }}
            className="bg-[#002244] text-white flex items-center justify-center text-xs font-bold transition-all px-2 overflow-hidden whitespace-nowrap"
            title="90% Government / NSFDC Channel Loan"
          >
            <span className="truncate">
              90% {lang === 'hi' ? 'सरकारी ऋण: ' : 'Govt Loan: '} ₹{govtLoanAmount.toLocaleString()}
            </span>
          </div>

          {/* 10% Beneficiary Margin (Green) */}
          <div
            style={{ width: '10%' }}
            className="bg-[#138808] text-white flex items-center justify-center text-[11px] font-bold transition-all px-1 overflow-hidden whitespace-nowrap"
            title="10% Beneficiary Margin / Promoter Equity"
          >
            <span className="truncate">
              10% {lang === 'hi' ? 'अंशदान: ' : 'Margin: '} ₹{beneficiaryMargin.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-3 text-xs font-bold">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-[#002244] inline-block" />
            <span className="text-slate-800">
              {lang === 'hi' ? '90% NSFDC सरकारी ऋण (Navy)' : '90% NSFDC Govt Loan (Navy)'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded bg-[#138808] inline-block" />
            <span className="text-slate-800">
              {lang === 'hi' ? '10% लाभार्थी अंशदान (Green)' : '10% Beneficiary Margin (Green)'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Timeline: Moratorium (Grace Period) vs Repayment Phases */}
      <div className="mb-6 bg-[#F8FAFC] border-[1.5px] border-[#CBD5E1] p-4 rounded-xl">
        <h4 className="text-xs font-black text-[#002244] uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Calendar size={15} className="text-[#FF9933]" />
          <span>
            {lang === 'hi'
              ? 'ऋण अदायगी समय-सारणी: मोरेटोरियम बनाम पुनर्भुगतान चरण'
              : 'Repayment Schedule: Moratorium vs Amortization Timeline'}
          </span>
        </h4>

        {/* Timeline Visual Track */}
        <div className="relative pt-2 pb-1">
          <div className="h-6 w-full bg-slate-200 rounded-lg flex overflow-hidden border border-[#CBD5E1]">
            {/* Moratorium Phase (Grace Period) */}
            <div
              style={{ width: `${(moratoriumMonths / totalTenureMonths) * 100}%` }}
              className="bg-[#FF9933] text-[#002244] flex items-center justify-center text-[11px] font-black tracking-wide px-2"
              title={`Moratorium: First ${moratoriumMonths} months`}
            >
              <span className="truncate">
                {moratoriumMonths} {lang === 'hi' ? 'माह मोरेटोरियम (छूट)' : 'Mo. Moratorium'}
              </span>
            </div>

            {/* Repayment Phase */}
            <div
              style={{ width: `${(repaymentMonths / totalTenureMonths) * 100}%` }}
              className="bg-[#002244] text-white flex items-center justify-center text-[11px] font-black tracking-wide px-2"
              title={`Repayment: Remaining ${repaymentMonths} months`}
            >
              <span className="truncate">
                {repaymentMonths} {lang === 'hi' ? 'माह नियमित ईएमआई' : 'Mo. Regular EMI'}
              </span>
            </div>
          </div>

          {/* Timeline markers */}
          <div className="flex justify-between text-[11px] font-bold text-slate-500 mt-1.5">
            <span>0 {lang === 'hi' ? 'माह (शुरुआत)' : 'Months (Start)'}</span>
            <span className="text-amber-800">
              {lang === 'hi' ? 'मोरेटोरियम समाप्त: ' : 'Moratorium Ends: '} {moratoriumMonths}{' '}
              {lang === 'hi' ? 'माह' : 'mo'}
            </span>
            <span>
              {totalTenureMonths} {lang === 'hi' ? 'माह (पूर्ण चुकता)' : 'Months (Full Repayment)'}
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-600 font-semibold mt-2.5 bg-white p-2 rounded border border-slate-200">
          ℹ️ {lang === 'hi'
            ? `प्रथम ${moratoriumMonths} माह की मोरेटोरियम अवधि के दौरान मूलधन की कोई किस्त नहीं देनी होगी। व्यवसाय स्थिर होने के पश्चात ₹${emi.toLocaleString()}/माह की रियायती ईएमआई लागू होगी।`
            : `During the first ${moratoriumMonths} months of moratorium, no principal installment is payable. Equated concessional installments of ₹${emi.toLocaleString()}/month commence from Month ${moratoriumMonths + 1}.`}
        </p>
      </div>

      {/* 3. Interactive Parameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Loan Amount / Project Cost Slider */}
        <div className="bg-white border-[1.5px] border-[#CBD5E1] p-3.5 rounded-lg">
          <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
            <span>{lang === 'hi' ? 'परियोजना लागत (Project Cost)' : 'Project Cost'}</span>
            <span className="font-black text-[#002244] text-sm">₹{projectCost.toLocaleString()}</span>
          </div>
          <input
            type="range"
            min={20000}
            max={500000}
            step={10000}
            value={projectCost}
            onChange={(e) => setProjectCost(Number(e.target.value))}
            className="w-full accent-[#002244] h-2 bg-slate-200 rounded cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-bold mt-1">
            <span>₹20,000</span>
            <span>₹5,00,000</span>
          </div>
        </div>

        {/* Moratorium Duration Slider */}
        <div className="bg-white border-[1.5px] border-[#CBD5E1] p-3.5 rounded-lg">
          <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
            <span>{lang === 'hi' ? 'मोरेटोरियम अवधि (Moratorium)' : 'Moratorium Period'}</span>
            <span className="font-black text-amber-700 text-sm">
              {moratoriumMonths} {lang === 'hi' ? 'माह (Months)' : 'Months'}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={12}
            step={3}
            value={moratoriumMonths}
            onChange={(e) => setMoratoriumMonths(Number(e.target.value))}
            className="w-full accent-[#FF9933] h-2 bg-slate-200 rounded cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-bold mt-1">
            <span>0 {lang === 'hi' ? 'माह' : 'mo'}</span>
            <span>6 {lang === 'hi' ? 'माह' : 'mo'}</span>
            <span>12 {lang === 'hi' ? 'माह' : 'mo'}</span>
          </div>
        </div>
      </div>

      {/* 4. Final EMI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#002244] text-white p-4 rounded-xl border border-slate-700">
        <div>
          <span className="text-[10px] text-slate-300 font-bold block uppercase tracking-wider">
            {lang === 'hi' ? 'मासिक किस्त (EMI)' : 'Monthly EMI'}
          </span>
          <span className="text-base sm:text-xl font-black text-[#FF9933]">
            ₹{emi.toLocaleString()}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-300 font-bold block uppercase tracking-wider">
            {lang === 'hi' ? 'सरकारी ऋण' : 'Govt Loan'}
          </span>
          <span className="text-sm sm:text-base font-bold text-white">
            ₹{govtLoanAmount.toLocaleString()}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-300 font-bold block uppercase tracking-wider">
            {lang === 'hi' ? 'लाभार्थी अंश' : 'Your Margin (10%)'}
          </span>
          <span className="text-sm sm:text-base font-bold text-[#138808]">
            ₹{beneficiaryMargin.toLocaleString()}
          </span>
        </div>

        <div>
          <span className="text-[10px] text-slate-300 font-bold block uppercase tracking-wider">
            {lang === 'hi' ? 'कुल ब्याज' : 'Total Interest'}
          </span>
          <span className="text-sm sm:text-base font-bold text-sky-300">
            ₹{totalInterest.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default FinancialModeling;
