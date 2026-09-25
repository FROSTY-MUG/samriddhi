import React, { useState } from 'react';
import { API_BASE } from '../utils/apiConfig';

export default function SchemeDashboard() {
  const [formData, setFormData] = useState({ amount: 100000, income: 250000, category: 'SC' });
  const [schemes, setSchemes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLiveSchemes = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/schemes/filter?amount=${formData.amount}&income=${formData.income}&category=${formData.category}&gender=M`);
      if (!response.ok) throw new Error(`Scheme feed returned ${response.status}`);
      const data = await response.json();
      const list = Array.isArray(data) ? data : (data.results || []);
      setSchemes(list);
    } catch (error) {
      console.error("Failed to fetch live schemes", error);
    }
    setLoading(false);
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg max-w-4xl mx-auto mt-8">
      <h3 className="text-xl font-bold mb-4 text-[#002244]">Find Live Government Schemes</h3>
      
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Required Amount (INR)</label>
          <input 
            type="number" 
            value={formData.amount} 
            onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Family Income (INR)</label>
          <input 
            type="number" 
            value={formData.income} 
            onChange={(e) => setFormData({...formData, income: Number(e.target.value)})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select 
            value={formData.category} 
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
          >
            <option value="SC">SC</option>
            <option value="ST">ST</option>
            <option value="OBC">OBC</option>
            <option value="GEN">General</option>
          </select>
        </div>
      </div>
      
      <button 
        onClick={fetchLiveSchemes} 
        disabled={loading}
        className="bg-[#002244] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition font-bold"
      >
        {loading ? 'Evaluating Eligibility...' : 'Find Eligible Schemes'}
      </button>

      {schemes.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h4 className="font-semibold text-lg mb-2">Matched Statutory Schemes:</h4>
          <ul className="space-y-3">
            {schemes.map((s, idx) => (
              <li key={idx} className="p-4 bg-white rounded shadow border-l-4 border-[#FF9933] flex justify-between items-center">
                <div>
                  <span className="font-bold text-[#002244]">{s.scheme_name || s.name}</span>
                  <p className="text-xs text-slate-500">ID: {s.scheme_id}</p>
                </div>
                <div className="text-right">
                  <span className="text-green-700 font-bold block">{s.effective_rate}% p.a.</span>
                  <span className="text-xs text-gray-500">Max: ₹{(s.max_limit || s.max_limit_inr)?.toLocaleString()}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
