import { GoogleGenAI } from '@google/genai';
import { UserInputProfile, SectorType, EducationLevel, GenderType } from '../types';

export interface AIQueryResponse {
  profile: Partial<UserInputProfile>;
  naturalLanguageSummary: string;
  hindiSummary: string;
  recommendedInvestmentIdea?: string;
  hindiInvestmentIdea?: string;
}

/**
 * Intelligent NLP parser that works offline (rule-based fallback) AND online (Gemini LLM API).
 * Parses broken English, Hindi, Hinglish, or regional inputs into JSON profiles.
 */
export async function parseQueryWithAI(userText: string, apiKey?: string): Promise<AIQueryResponse> {
  if (apiKey && apiKey.trim().length > 5) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
You are SamriddhiAI, an expert Indian Government Scheme & Micro-Finance matching assistant.
Analyze the user's input (it may be in Hindi, Hinglish, broken English, or regional phrase) and extract structured financial & demographic profile details for government loan matching.

User Query: "${userText}"

Return ONLY a valid JSON object matching this schema without markdown codeblocks or quotes:
{
  "sector": "micro_enterprise" | "term_loan" | "education_inland" | "education_abroad" | "agriculture" | "green_business" | "women_entrepreneurship" | "sanitation_allied",
  "estimatedCost": number (in INR, e.g. 100000 for 1 lakh),
  "annualIncome": number (in INR, e.g. 250000),
  "gender": "male" | "female" | "transgender",
  "education": "below_10th" | "matriculate" | "graduate" | "post_graduate_professional",
  "isExistingBusiness": boolean,
  "summaryEn": "Short sentence in English explaining extracted requirements",
  "summaryHi": "हिन्दी में एक वाक्य में विवरण",
  "businessIdeaEn": "Suggested low-capital micro-business idea based on input",
  "businessIdeaHi": "हिन्दी में व्यावसायिक सुझाव"
}
`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        profile: {
          sector: parsed.sector || 'micro_enterprise',
          estimatedCost: Number(parsed.estimatedCost) || 140000,
          annualIncome: Number(parsed.annualIncome) || 250000,
          gender: (parsed.gender as GenderType) || 'female',
          education: (parsed.education as EducationLevel) || 'matriculate',
          isExistingBusiness: Boolean(parsed.isExistingBusiness)
        },
        naturalLanguageSummary: parsed.summaryEn || `Parsed request for ${parsed.sector} with estimated cost of ₹${parsed.estimatedCost}`,
        hindiSummary: parsed.summaryHi || `आपकी जानकारी का विश्लेषण पूर्ण: ₹${parsed.estimatedCost} लागत हेतु योजना प्राप्त हुई`,
        recommendedInvestmentIdea: parsed.businessIdeaEn,
        hindiInvestmentIdea: parsed.businessIdeaHi
      };
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local NLP engine:', err);
    }
  }

  // Robust Local Heuristic NLP Parser (Works 100% offline for broken English / Hindi / Hinglish)
  return parseQueryLocally(userText);
}

function parseQueryLocally(text: string): AIQueryResponse {
  const lower = text.toLowerCase();
  let sector: SectorType = 'micro_enterprise';
  let estimatedCost = 140000;
  let annualIncome = 250000;
  let gender: GenderType = 'female';
  let education: EducationLevel = 'matriculate';
  let isExistingBusiness = false;

  // Sector keyword matching
  if (lower.includes('tailor') || lower.includes('सिलाई') || lower.includes('silai') || lower.includes('boutique') || lower.includes('beauty') || lower.includes('women') || lower.includes('महिला') || lower.includes('shg')) {
    sector = 'women_entrepreneurship';
    gender = 'female';
  } else if (lower.includes('farm') || lower.includes('kisan') || lower.includes('किसान') || lower.includes('dairy') || lower.includes('दूध') || lower.includes('goat') || lower.includes('गाय') || lower.includes('buffalo') || lower.includes('agriculture')) {
    sector = 'agriculture';
  } else if (lower.includes('study') || lower.includes('padhai') || lower.includes('पढ़ाई') || lower.includes('college') || lower.includes('degree') || lower.includes('btech') || lower.includes('mbbs') || lower.includes('school')) {
    if (lower.includes('abroad') || lower.includes('foreign') || lower.includes('विदेश') || lower.includes('usa') || lower.includes('uk')) {
      sector = 'education_abroad';
    } else {
      sector = 'education_inland';
    }
  } else if (lower.includes('solar') || lower.includes('green') || lower.includes('ev') || lower.includes('electric') || lower.includes('e-rickshaw') || lower.includes('रिक्शा')) {
    sector = 'green_business';
  } else if (lower.includes('clean') || lower.includes('swachh') || lower.includes('safai') || lower.includes('सफाई')) {
    sector = 'sanitation_allied';
  } else if (lower.includes('factory') || lower.includes('plant') || lower.includes('machinery') || lower.includes('dokan') || lower.includes('dukan') || lower.includes('shop') || lower.includes('large')) {
    sector = 'term_loan';
  }

  // Gender extraction
  if (lower.includes('man') || lower.includes('boy') || lower.includes('पुरुष') || lower.includes('ladka') || lower.includes('male')) {
    gender = 'male';
  } else if (lower.includes('woman') || lower.includes('female') || lower.includes('lady') || lower.includes('महिला') || lower.includes('ladki')) {
    gender = 'female';
  }

  // Number & Amount Extraction (Lakhs / Thousands / Numeric Regex)
  const lakhMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|l|लाख)/i);
  if (lakhMatch) {
    estimatedCost = parseFloat(lakhMatch[1]) * 100000;
  } else {
    const rawNumMatch = lower.match(/(\d{5,7})/);
    if (rawNumMatch) {
      estimatedCost = parseInt(rawNumMatch[1], 10);
    }
  }

  // Income Extraction
  const incomeMatch = lower.match(/(?:income|aay|आय|kamai|salana)\s*(?:is|of|=|:)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|l|लाख)?/i);
  if (incomeMatch) {
    const val = parseFloat(incomeMatch[1]);
    annualIncome = val < 50 ? val * 100000 : val;
  }

  if (lower.includes('existing') || lower.includes('already') || lower.includes('पुराना') || lower.includes('चला रहा')) {
    isExistingBusiness = true;
  }

  return {
    profile: {
      sector,
      estimatedCost,
      annualIncome,
      gender,
      education,
      isExistingBusiness
    },
    naturalLanguageSummary: `Extracted parameters: ${sector.replace('_', ' ')} sector with budget ₹${(estimatedCost/100000).toFixed(2)} Lakhs for ${gender} applicant.`,
    hindiSummary: `प्राप्त विवरण: ${gender === 'female' ? 'महिला' : 'पुरुष'} आवेदक हेतु ${sector} क्षेत्र में ₹${(estimatedCost/100000).toFixed(2)} लाख की लागत परियोजना।`,
    recommendedInvestmentIdea: sector === 'women_entrepreneurship' 
      ? 'Custom Garment Tailoring & Apparel Boutique with Embroidery Machinery' 
      : 'Micro Agro-Processing / Local Retail Supply Store',
    hindiInvestmentIdea: sector === 'women_entrepreneurship' 
      ? 'सिलाई कढ़ाई सेंटर एवं परिधान बुटीक' 
      : 'कृषि उत्पाद प्रसंस्करण अथवा स्थानीय रिटेल दुकान'
  };
}
