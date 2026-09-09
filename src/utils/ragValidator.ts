import { EducationLevel, GenderType, SectorType } from '../types';

const SECTORS: SectorType[] = ['micro_enterprise', 'term_loan', 'education_inland', 'education_abroad', 'agriculture', 'green_business', 'women_entrepreneurship', 'sanitation_allied'];
const GENDERS: GenderType[] = ['male', 'female', 'transgender'];
const EDUCATION: EducationLevel[] = ['below_10th', 'matriculate', 'graduate', 'post_graduate_professional'];

export interface ValidatedRAGFields {
  sector: SectorType;
  estimatedCost: number;
  annualIncome: number;
  gender: GenderType;
  education: EducationLevel;
  isExistingBusiness: boolean;
  summaryEn: string;
  summaryHi: string;
  investmentPlanEn: string;
  investmentPlanHi: string;
  loanAdviceEn: string;
  loanAdviceHi: string;
}

const text = (value: unknown, fallback: string) => typeof value === 'string' && value.trim() ? value.trim().slice(0, 2000) : fallback;
const boundedNumber = (value: unknown, fallback: number, min: number, max: number) => {
  const number = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(number) && number >= min && number <= max ? number : fallback;
};

/** Normalizes model output before it can influence eligibility or financial UI. */
export function validateRAGPayload(input: unknown): ValidatedRAGFields | null {
  if (!input || typeof input !== 'object') return null;
  const value = input as Record<string, unknown>;
  if (!SECTORS.includes(value.sector as SectorType)) return null;
  if (value.gender !== undefined && !GENDERS.includes(value.gender as GenderType)) return null;
  if (value.education !== undefined && !EDUCATION.includes(value.education as EducationLevel)) return null;

  return {
    sector: value.sector as SectorType,
    estimatedCost: boundedNumber(value.estimatedCost, 140000, 10000, 50000000),
    annualIncome: boundedNumber(value.annualIncome, 250000, 0, 100000),
    gender: (value.gender as GenderType) || 'female',
    education: (value.education as EducationLevel) || 'matriculate',
    isExistingBusiness: value.isExistingBusiness === true,
    summaryEn: text(value.summaryEn, 'Your request was matched against the local scheme catalog.'),
    summaryHi: text(value.summaryHi, 'आपकी जानकारी का स्थानीय योजना सूची से मिलान किया गया है।'),
    investmentPlanEn: text(value.investmentPlanEn, 'Confirm the project quotation and promoter contribution with the implementing agency.'),
    investmentPlanHi: text(value.investmentPlanHi, 'परियोजना quotation और लाभार्थी अंशदान की पुष्टि संबंधित एजेंसी से करें।'),
    loanAdviceEn: text(value.loanAdviceEn, 'Verify current terms with the official implementing agency before applying.'),
    loanAdviceHi: text(value.loanAdviceHi, 'आवेदन से पहले संबंधित आधिकारिक एजेंसी से वर्तमान शर्तों की पुष्टि करें।')
  };
}
