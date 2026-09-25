import React, { useState } from 'react';

export default function SchemeDashboard() {
  const [formData, setFormData] = useState({ amount: 100000, income: 250000, category: 'SC' });
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLiveSchemes = async () => {
    setLoading(true);
    try {
      // Replace localhost with your deployed FastAPI URL
      const response = await fetch(`http://localhost:8000/api/v1/schemes/filter?amount=${formData.amount}&income=${formData.income}&category=${formData.category}`);
      const data = await response.json();
      setSchemes(data.results || []);
    } catch (error) {
      console.error("Failed to fetch live schemes", error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg max-w-4xl mx-auto mt-8">
      <h3 className="text-xl font-bold mb-4 text-[#002244]">Find Live Government Schemes</h3>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <input 
          type="number" placeholder="Loan Amount"
          className="p-2 border rounded"
          value={formData.amount}
          onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
        />
        <input 
          type="number" placeholder="Annual Income"
          className="p-2 border rounded"
          value={formData.income}
          onChange={(e) => setFormData({...formData, income: Number(e.target.value)})}
        />
        <select 
          className="p-2 border rounded"
          value={formData.category}
          onChange={(e) => setFormData({...formData, category: e.target.value})}
        >
          <option value="SC">Scheduled Caste (SC)</option>
          <option value="ST">Scheduled Tribe (ST)</option>
          <option value="GEN">General</option>
        </select>
      </div>
      
      <button 
        onClick={fetchLiveSchemes}
        className="bg-[#002244] text-white px-6 py-2 rounded font-bold hover:bg-blue-900"
      >
        Scan Live Schemes
      </button>

      <div className="mt-6 space-y-4">
        {loading ? <p>Scraping databases...</p> : schemes.map((s: any) => (
          <div key={s.scheme_id} className="bg-white p-4 rounded border-l-4 border-green-600 shadow flex justify-between items-center">
            <div>
              <h4 className="font-bold text-lg text-gray-800">{s.scheme_name}</h4>
              <p className="text-sm text-gray-500">Max Income Limit: ₹{s.max_family_income?.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-green-700">{s.interest_rate}% p.a.</p>
              <button className="text-sm bg-orange-500 text-white px-4 py-1 rounded mt-2">
                Route to Bank
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
