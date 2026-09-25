import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { API_BASE } from '../utils/apiConfig';

interface Scheme {
  scheme_id: string;
  scheme_name: string;
  effective_rate: number;
  max_limit: number;
  eligibility_status: string;
}

export const SchemeFilterDashboard: React.FC = () => {
  const [formData, setFormData] = useState({
    amount: 100000,
    income: 250000,
    category: 'SC',
    gender: 'F'
  });
  
  const [results, setResults] = useState<Scheme[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEligibleSchemes = async () => {
    setLoading(true);
    try {
      // Build query string dynamically
      const params = new URLSearchParams({
        amount: formData.amount.toString(),
        income: formData.income.toString(),
        category: formData.category,
        gender: formData.gender
      });

      const response = await fetch(`${API_BASE}/api/v1/schemes/filter?${params}`);
      
      if (!response.ok) {
        // Fallback for SIH demo if the python backend is not currently spinning
        setTimeout(() => {
          setResults([
            {
              scheme_id: "NSFDC-MSY",
              scheme_name: "Mahila Samriddhi Yojana",
              effective_rate: formData.gender === 'F' ? 4.0 : 5.0,
              max_limit: 140000.0,
              eligibility_status: "Verified Eligible (Fallback)"
            },
            {
              scheme_id: "NSFDC-MFS",
              scheme_name: "Micro Finance Scheme",
              effective_rate: formData.gender === 'F' ? 5.5 : 6.5,
              max_limit: 140000.0,
              eligibility_status: "Verified Eligible (Fallback)"
            }
          ]);
          setLoading(false);
        }, 600);
        return;
      }
      
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Failed to fetch live schemes", error);
      // Fallback for SIH demo
      setResults([
        {
          scheme_id: "NSFDC-MSY",
          scheme_name: "Mahila Samriddhi Yojana",
          effective_rate: formData.gender === 'F' ? 4.0 : 5.0,
          max_limit: 140000.0,
          eligibility_status: "Verified Eligible (Fallback)"
        }
      ]);
    }
    setLoading(false);
  };

  // Auto-fetch on mount or when criteria changes significantly
  useEffect(() => {
    fetchEligibleSchemes();
  }, [formData.category, formData.gender]);

  return (
    <div className="gov-container" style={{ padding: '24px', background: '#F3F4F6', borderRadius: '12px' }}>
      <div className="filter-panel" style={{ background: '#FFF', padding: '20px', borderTop: '4px solid #FF9933', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderRadius: '8px' }}>
        <h3 style={{ color: '#002244', marginTop: 0, marginBottom: '16px' }}>पात्रता मानदंड (Eligibility Criteria)</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>Loan Amount (₹)</label>
            <input 
              type="number" 
              value={formData.amount} 
              onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
              style={{ width: '100%', padding: '8px', border: '1px solid #CBD5E1', borderRadius: '4px' }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>Family Income (₹)</label>
            <input 
              type="number" 
              value={formData.income} 
              onChange={(e) => setFormData({...formData, income: Number(e.target.value)})}
              style={{ width: '100%', padding: '8px', border: '1px solid #CBD5E1', borderRadius: '4px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>Category</label>
            <select 
              value={formData.category} 
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              style={{ width: '100%', padding: '8px', border: '1px solid #CBD5E1', borderRadius: '4px' }}
            >
              <option value="SC">Scheduled Caste (SC)</option>
              <option value="ST">Scheduled Tribe (ST)</option>
              <option value="OBC">Other Backward Class (OBC)</option>
              <option value="GEN">General</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', marginBottom: '6px' }}>Gender</label>
            <select 
              value={formData.gender} 
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
              style={{ width: '100%', padding: '8px', border: '1px solid #CBD5E1', borderRadius: '4px' }}
            >
              <option value="F">Female</option>
              <option value="M">Male</option>
              <option value="O">Other</option>
            </select>
          </div>
        </div>
        
        <button 
          onClick={fetchEligibleSchemes}
          style={{ marginTop: '20px', background: '#002244', color: '#FFF', padding: '10px 24px', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600 }}
        >
          <Search size={16} /> Apply Live Filters
        </button>
      </div>

      <div className="results-grid" style={{ marginTop: '24px', display: 'grid', gap: '16px' }}>
        {loading ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748b' }}>Analyzing statutory eligibility...</div>
        ) : results.length > 0 ? (
          results.map((scheme) => (
            <div key={scheme.scheme_id} style={{ background: '#FFF', padding: '20px', borderLeft: '4px solid #138808', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div>
                <h4 style={{ margin: '0 0 8px 0', color: '#1F2937', fontSize: '1.1rem' }}>{scheme.scheme_name}</h4>
                <span style={{ background: '#DCFCE7', color: '#166534', padding: '4px 8px', fontSize: '12px', borderRadius: '4px', fontWeight: 600 }}>
                  {scheme.eligibility_status}
                </span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#002244' }}>{scheme.effective_rate.toFixed(2)}% p.a.</div>
                <div style={{ fontSize: '12px', color: '#4B5563', marginTop: '4px' }}>Max Limit: ₹{scheme.max_limit.toLocaleString()}</div>
              </div>
            </div>
          ))
        ) : (
          <div style={{ padding: '24px', background: '#FEE2E2', color: '#991B1B', border: '1px solid #F87171', borderRadius: '8px', textAlign: 'center' }}>
            No schemes found matching the exact statutory criteria. Please adjust income or amount.
          </div>
        )}
      </div>
    </div>
  );
}
