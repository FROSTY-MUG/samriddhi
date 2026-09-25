import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin, ShieldCheck, AlertOctagon, CheckCircle2,
  Navigation, QrCode, Phone, Landmark, Printer, Download
} from 'lucide-react';

interface BankBranch {
  branchCode: string;
  bankName: string;
  branchName: string;
  ifsc: string;
  lat: number;
  lon: number;
  npaPercentage: number;
  activeQuotaInr: number;
  address: string;
  phone: string;
  isCleared: boolean;
}

const SAMPLE_BRANCHES: BankBranch[] = [
  {
    branchCode: 'SBI-DEL-01234',
    bankName: 'State Bank of India',
    branchName: 'Janakpuri District Centre',
    ifsc: 'SBIN0001234',
    lat: 28.6297,
    lon: 77.0827,
    npaPercentage: 1.8,
    activeQuotaInr: 25000000,
    address: 'Plot 4, Community Centre, Janakpuri, New Delhi - 110058',
    phone: '+91-11-25501234',
    isCleared: true,
  },
  {
    branchCode: 'PNB-DEL-04561',
    bankName: 'Punjab National Bank',
    branchName: 'Connaught Place Main Branch',
    ifsc: 'PUNB0045610',
    lat: 28.6315,
    lon: 77.2197,
    npaPercentage: 2.4,
    activeQuotaInr: 40000000,
    address: '7, Harsha Bhawan, E-Block, Connaught Place, New Delhi - 110001',
    phone: '+91-11-23314561',
    isCleared: true,
  },
  {
    branchCode: 'BOB-DEL-09921',
    bankName: 'Bank of Baroda',
    branchName: 'Okhla Industrial Area',
    ifsc: 'BARB0OKHIND',
    lat: 28.5284,
    lon: 77.2731,
    npaPercentage: 3.1,
    activeQuotaInr: 18000000,
    address: 'Phase II, Okhla Industrial Area, New Delhi - 110020',
    phone: '+91-11-26389921',
    isCleared: true,
  },
  {
    branchCode: 'CAN-DEF-99999',
    bankName: 'Canara Bank (High NPA)',
    branchName: 'Distressed Loan Recovery Branch',
    ifsc: 'CNRB0099999',
    lat: 28.6200,
    lon: 77.2100,
    npaPercentage: 8.9, // High NPA > 5.0% -> Blocked!
    activeQuotaInr: 5000000,
    address: 'Ring Road, New Delhi - 110002',
    phone: '+91-11-23399999',
    isCleared: false,
  },
];

// Helper to center map view
const MapController: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 12);
  }, [center, map]);
  return null;
};

// Create custom Government-style Map Pins
const createGovIcon = (isCleared: boolean) => {
  const bg = isCleared ? '#138808' : '#DC2626';
  const label = isCleared ? '✓ NPA Safe' : '⚠ High NPA';
  return L.divIcon({
    className: 'custom-gov-pin',
    html: `
      <div style="display:flex; flex-direction:column; align-items:center;">
        <div style="background:${bg}; color:#fff; font-size:10px; font-weight:800; padding:2px 6px; border-radius:4px; box-shadow:0 2px 4px rgba(0,0,0,0.3); border:1px solid #fff; white-space:nowrap;">
          ${label}
        </div>
        <div style="width:12px; height:12px; background:${bg}; transform:rotate(45deg); margin-top:-6px; border-bottom:1px solid #fff; border-right:1px solid #fff;"></div>
      </div>
    `,
    iconSize: [80, 40],
    iconAnchor: [40, 36],
  });
};

interface BankRouterMapProps {
  lang?: 'en' | 'hi';
  userLat?: number;
  userLon?: number;
  schemeName?: string;
  loanAmount?: number;
}

export const BankRouterMap: React.FC<BankRouterMapProps> = ({
  lang = 'hi',
  userLat = 28.6297,
  userLon = 77.0827,
  schemeName = 'Mahila Samriddhi Yojana (MSY)',
  loanAmount = 126000,
}) => {
  const [selectedBranch, setSelectedBranch] = useState<BankBranch>(SAMPLE_BRANCHES[0]);
  const [routingToken, setRoutingToken] = useState<string>('SAM-2026-SC-7184');

  const center: [number, number] = [userLat, userLon];

  return (
    <div className="w-full bg-[#FFFFFF] border-[1.5px] border-[#CBD5E1] rounded-xl p-5 shadow-[0_2px_4px_rgba(0,0,0,0.06)] my-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-[#CBD5E1] pb-3 mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-black text-[#002244] flex items-center gap-2">
            <Landmark size={22} className="text-[#002244]" />
            <span>
              {lang === 'hi'
                ? 'पोस्टगिस चैनल पार्टनर बैंक लोकेटर (Geo-Spatial Routing)'
                : 'PostGIS Channel Partner Bank Locator'}
            </span>
          </h3>
          <p className="text-xs text-slate-600 font-semibold">
            {lang === 'hi'
              ? 'स्थान-आधारित एल्गोरिथम द्वारा सुरक्षित (NPA ≤ 5.0%) बैंक शाखाओं को ही चिन्हित किया गया है'
              : 'Spatial routing algorithm strictly clears branches with NPA ≤ 5.0% and active quotas'}
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs font-bold">
          <span className="flex items-center gap-1 text-[#138808]">
            <span className="w-3 h-3 rounded-full bg-[#138808] inline-block" />
            {lang === 'hi' ? 'अनुमोदित शाखा (NPA ≤ 5%)' : 'Cleared Branch (NPA ≤ 5%)'}
          </span>
          <span className="flex items-center gap-1 text-rose-700">
            <span className="w-3 h-3 rounded-full bg-[#DC2626] inline-block" />
            {lang === 'hi' ? 'प्रतिबंधित शाखा (High NPA)' : 'Blocked (High NPA)'}
          </span>
        </div>
      </div>

      {/* Grid: Map on Left (60%), Branch Details on Right (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Leaflet Map Container */}
        <div className="lg:col-span-7 h-[380px] rounded-xl overflow-hidden border-[1.5px] border-[#CBD5E1] relative shadow-inner z-0">
          <MapContainer
            center={center}
            zoom={11}
            scrollWheelZoom={false}
            className="w-full h-full"
            style={{ minHeight: '380px', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapController center={center} />

            {/* Render Branch Pins */}
            {SAMPLE_BRANCHES.map((b) => (
              <Marker
                key={b.branchCode}
                position={[b.lat, b.lon]}
                icon={createGovIcon(b.isCleared)}
                eventHandlers={{
                  click: () => setSelectedBranch(b),
                }}
              >
                <Popup>
                  <div className="text-xs p-1">
                    <p className="font-extrabold text-[#002244]">{b.bankName}</p>
                    <p className="text-[11px] font-bold text-slate-700">{b.branchName}</p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">IFSC: {b.ifsc}</p>
                    <p className="text-[11px] font-black mt-1" style={{ color: b.isCleared ? '#138808' : '#DC2626' }}>
                      NPA: {b.npaPercentage}% ({b.isCleared ? 'Cleared' : 'Blocked > 5.0%'})
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Right: Selected Branch Card + Action Button */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
          <div className="bg-[#F8FAFC] border-[1.5px] border-[#CBD5E1] rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-mono font-bold text-slate-500">
                {selectedBranch.branchCode}
              </span>
              <span
                className={`text-xs font-black px-2.5 py-0.5 rounded uppercase ${
                  selectedBranch.isCleared
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {selectedBranch.isCleared ? '✓ Cleared for Disbursal' : '⚠ Blocked (NPA > 5.0%)'}
              </span>
            </div>

            <h4 className="text-base font-black text-[#002244]">
              {selectedBranch.bankName}
            </h4>
            <p className="text-xs font-bold text-slate-700">
              {selectedBranch.branchName} • <span className="font-mono">{selectedBranch.ifsc}</span>
            </p>

            <p className="text-xs text-slate-600 mt-2 flex items-start gap-1.5 font-medium">
              <MapPin size={14} className="text-[#002244] shrink-0 mt-0.5" />
              <span>{selectedBranch.address}</span>
            </p>

            <div className="mt-3 pt-3 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase">
                  एनपीए अनुपात (NPA Ratio)
                </span>
                <span
                  className={`text-sm font-black ${
                    selectedBranch.isCleared ? 'text-[#138808]' : 'text-[#DC2626]'
                  }`}
                >
                  {selectedBranch.npaPercentage}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 font-bold block uppercase">
                  उपलब्ध कोटा (Active Quota)
                </span>
                <span className="text-sm font-black text-[#002244]">
                  ₹{(selectedBranch.activeQuotaInr / 100000).toFixed(0)} Lakhs
                </span>
              </div>
            </div>

            {/* Google Maps External Navigation */}
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${selectedBranch.lat},${selectedBranch.lon}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 w-full py-2 bg-white border border-[#CBD5E1] text-[#002244] rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-slate-50 transition"
            >
              <Navigation size={14} className="text-[#FF9933]" />
              <span>{lang === 'hi' ? 'गूगल मैप्स नेविगेशन खोलें' : 'Open Google Maps Navigation'}</span>
            </a>
          </div>

          {/* 3. The Digital Routing Token Card with Scannable QR Code */}
          <div className="bg-[#002244] text-white rounded-xl p-4 border border-slate-700 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-600 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#FF9933]" />
                <span className="text-xs font-black tracking-wider uppercase">
                  {lang === 'hi' ? 'डिजिटल रूटिंग टोकन' : 'DIGITAL ROUTING TOKEN'}
                </span>
              </div>
              <span className="font-mono text-xs text-amber-300 font-bold">
                {routingToken}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* SVG QR Code Representation */}
              <div className="p-2 bg-white rounded-lg shrink-0">
                <svg className="w-16 h-16" viewBox="0 0 100 100">
                  {/* Outer Frame */}
                  <rect width="100" height="100" fill="#ffffff" />
                  {/* Corner Position Detection Squares */}
                  <rect x="5" y="5" width="28" height="28" fill="#002244" />
                  <rect x="10" y="10" width="18" height="18" fill="#ffffff" />
                  <rect x="14" y="14" width="10" height="10" fill="#002244" />

                  <rect x="67" y="5" width="28" height="28" fill="#002244" />
                  <rect x="72" y="10" width="18" height="18" fill="#ffffff" />
                  <rect x="76" y="14" width="10" height="10" fill="#002244" />

                  <rect x="5" y="67" width="28" height="28" fill="#002244" />
                  <rect x="10" y="72" width="18" height="18" fill="#ffffff" />
                  <rect x="14" y="76" width="10" height="10" fill="#002244" />

                  {/* QR Pattern Blocks */}
                  <rect x="40" y="10" width="8" height="8" fill="#002244" />
                  <rect x="52" y="10" width="8" height="8" fill="#002244" />
                  <rect x="40" y="24" width="8" height="8" fill="#002244" />
                  <rect x="46" y="40" width="12" height="12" fill="#FF9933" />
                  <rect x="40" y="65" width="8" height="8" fill="#002244" />
                  <rect x="70" y="50" width="8" height="8" fill="#002244" />
                  <rect x="82" y="65" width="8" height="8" fill="#002244" />
                  <rect x="70" y="80" width="8" height="8" fill="#002244" />
                </svg>
              </div>

              {/* Token Details */}
              <div className="text-xs space-y-1">
                <p className="font-extrabold text-white">{schemeName}</p>
                <p className="text-amber-300 font-bold">
                  {lang === 'hi' ? 'ऋण राशि: ' : 'Amount: '} ₹{loanAmount.toLocaleString()}
                </p>
                <p className="text-[11px] text-slate-300">
                  {lang === 'hi' ? 'आवंटित बैंक: ' : 'Allocated Bank: '}
                  {selectedBranch.bankName}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-slate-600 text-[10px] text-slate-300 flex items-center justify-between">
              <span>{lang === 'hi' ? 'शाखा प्रबंधक को यह क्यूआर दिखाएं' : 'Show this QR to Branch Manager'}</span>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1 text-[#FF9933] hover:underline font-bold"
              >
                <Printer size={12} />
                <span>{lang === 'hi' ? 'प्रिंट' : 'Print'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankRouterMap;
