import React from 'react';
import { UserCheck, Search, FileText, Landmark } from 'lucide-react';

export default function OnboardingFlow() {
  const steps = [
    {
      id: 1,
      title: "Step 1: Digital KYC Verification",
      desc: "Enter your demographic details. We use API Setu to verify your identity.",
      action: "Input [Aadhaar Redacted] and PAN to auto-verify your SC Category and Income.",
      icon: <UserCheck size={24} className="text-blue-600" />
    },
    {
      id: 2,
      title: "Step 2: AI Scheme Matching",
      desc: "Our engine scrapes live data from myScheme and NSFDC to find exact matches.",
      action: "The system matches you to the Micro Finance Scheme at 6.5% interest.",
      icon: <Search size={24} className="text-emerald-600" />
    },
    {
      id: 3,
      title: "Step 3: Generate Digital Dossier",
      desc: "Receive an official pre-screening PDF containing a unique QR Routing Token.",
      action: "Download or print the generated token.",
      icon: <FileText size={24} className="text-amber-600" />
    },
    {
      id: 4,
      title: "Step 4: Visit the Nearest Cleared Bank",
      desc: "Our Geo-Router directs you to the closest branch with active loan quota.",
      action: "Hand the printed dossier to the branch manager for fast-track disbursal.",
      icon: <Landmark size={24} className="text-indigo-600" />
    }
  ];

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-8 border-b-2 border-orange-500 pb-2">
        आवेदन प्रक्रिया (How to Apply)
      </h2>
      <div className="relative border-l-4 border-gray-200 ml-4 space-y-8">
        {steps.map((step) => (
          <div key={step.id} className="mb-8 pl-8 relative">
            <div className="absolute -left-[22px] bg-white border-4 border-gray-200 p-2 rounded-full shadow-sm">
              {step.icon}
            </div>
            <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
            <p className="text-gray-600 mt-1">{step.desc}</p>
            <div className="mt-2 bg-gray-50 border-l-4 border-blue-500 p-3 text-sm text-gray-700 font-medium">
              👉 {step.action}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
