import React, { useState } from 'react';
import { FileUp, CheckCircle, AlertCircle, Sparkles, FileText, Loader2 } from 'lucide-react';
import { UserInputProfile } from '../types';

interface DocumentOcrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAutoFillProfile: (extracted: Partial<UserInputProfile>, applicantName: string) => void;
  lang: 'en' | 'hi' | 'ta' | 'mr';
}

export const DocumentOcrModal: React.FC<DocumentOcrModalProps> = ({
  isOpen,
  onClose,
  onAutoFillProfile,
  lang
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<{
    name?: string;
    income?: number;
    category?: string;
    gender?: string;
    address?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setExtractedData(null);
    }
  };

  const handleRunOcr = () => {
    if (!selectedFile) return;
    setIsProcessing(true);

    // Simulate Client-side / Azure Document Intelligence OCR Extraction
    setTimeout(() => {
      setIsProcessing(false);
      const mockExtraction = {
        name: 'Sunita Devi',
        income: 180000,
        category: 'Scheduled Caste (SC)',
        gender: 'female',
        address: 'Varanasi, Uttar Pradesh'
      };
      setExtractedData(mockExtraction);
    }, 1200);
  };

  const handleApplyToForm = () => {
    if (!extractedData) return;
    onAutoFillProfile({
      annualIncome: extractedData.income,
      gender: 'female',
      state: 'Uttar Pradesh',
      district: 'Varanasi'
    }, extractedData.name || 'Sunita Devi');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '560px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles style={{ color: '#38bdf8' }} size={24} />
            <h3 style={{ fontSize: '1.2rem', color: '#fff' }}>
              {lang === 'hi' ? 'दस्तावेज़ OCR और ऑटो-सत्यापन' : 'Document OCR & Auto-Verification'}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
        </div>

        <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginBottom: '16px' }}>
          {lang === 'hi'
            ? 'आय प्रमाण पत्र, आधार कार्ड या जाति प्रमाण पत्र अपलोड करें। हमारा AI स्वचालित रूप से फॉर्म भरेगा।'
            : 'Upload Income Certificate, Aadhaar, or Caste Certificate. AI will parse values and auto-fill your profile.'}
        </p>

        <div style={{
          border: '2px dashed #334155',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          background: '#0f172a',
          marginBottom: '20px'
        }}>
          <FileUp size={36} style={{ color: '#0284c7', marginBottom: '10px' }} />
          <div>
            <input type="file" accept="image/*,.pdf" onChange={handleFileChange} id="ocr-doc-input" style={{ display: 'none' }} />
            <label htmlFor="ocr-doc-input" className="btn-secondary" style={{ display: 'inline-block', cursor: 'pointer' }}>
              {selectedFile ? selectedFile.name : (lang === 'hi' ? 'दस्तावेज़ चुनें (Select Document)' : 'Browse Document File')}
            </label>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '8px' }}>
            Supports JPG, PNG, PDF (Income Cert, Aadhaar, PAN)
          </span>
        </div>

        {selectedFile && !extractedData && (
          <button onClick={handleRunOcr} disabled={isProcessing} className="btn-primary" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
            {isProcessing ? <><Loader2 className="animate-spin" size={18} /> Extracting Document Data...</> : <><Sparkles size={18} /> Run AI OCR Scan</>}
          </button>
        )}

        {extractedData && (
          <div style={{ background: '#1e293b', border: '1px solid #38bdf8', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: 'bold', marginBottom: '10px' }}>
              <CheckCircle size={18} /> Document Verified Successfully!
            </div>
            <div style={{ fontSize: '0.85rem', color: '#e2e8f0', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div><strong>Name:</strong> {extractedData.name}</div>
              <div><strong>Category:</strong> {extractedData.category}</div>
              <div><strong>Verified Income:</strong> ₹{(extractedData.income! / 100000).toFixed(2)} Lakhs</div>
              <div><strong>District:</strong> {extractedData.address}</div>
            </div>
            <button onClick={handleApplyToForm} className="btn-primary" style={{ width: '100%', marginTop: '14px' }}>
              {lang === 'hi' ? 'फॉर्म में लागू करें (Apply to Profile)' : 'Apply to Eligibility Form'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
