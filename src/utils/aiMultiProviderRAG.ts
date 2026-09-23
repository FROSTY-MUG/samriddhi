import { GoogleGenAI } from '@google/genai';
import { UserInputProfile, Scheme, SectorType, EducationLevel, GenderType } from '../types';
import { SCHEMES_DATABASE } from '../data/schemes';
import { fetchGovernmentDataContext, formatGovernmentContext } from './govDataFetch';
import { validateRAGPayload } from './ragValidator';

export type AIProviderType = 'gemini' | 'grok' | 'openrouter' | 'offline';

export interface AIProviderConfig {
  provider: AIProviderType;
  geminiKey?: string;
  grokKey?: string;
  openrouterKey?: string;
  openrouterModel?: string;
  voiceEngine?: 'instant' | 'gemini';
}

export interface RAGMatchedScheme {
  scheme: Scheme;
  relevanceScore: number;
  reason: string;
  hindiReason: string;
}

export interface AIRAGResponse {
  profile: Partial<UserInputProfile>;
  matchedSchemes: RAGMatchedScheme[];
  naturalLanguageSummary: string;
  hindiSummary: string;
  investmentPlan: string;
  hindiInvestmentPlan: string;
  loanAdvice: string;
  hindiLoanAdvice: string;
  providerUsed: string;
  latencyMs: number;
}

const STORAGE_KEY = 'samriddhi_ai_config';

const DEFAULT_CONFIG: AIProviderConfig = {
  provider: 'grok',
  voiceEngine: 'instant',
  // Keys are intentionally opt-in. Never ship provider secrets in a browser bundle.
  geminiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
  grokKey: import.meta.env.VITE_GROK_API_KEY || import.meta.env.VITE_GROQ_API_KEY || '',
  openrouterKey: import.meta.env.VITE_OPENROUTER_API_KEY || '',
  openrouterModel: 'meta-llama/llama-3.3-70b-instruct'
};

export function getStoredAIConfig(): AIProviderConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_CONFIG,
        ...parsed,
        geminiKey: parsed.geminiKey || DEFAULT_CONFIG.geminiKey,
        grokKey: parsed.grokKey || DEFAULT_CONFIG.grokKey,
        openrouterKey: parsed.openrouterKey || DEFAULT_CONFIG.openrouterKey
      };
    }
  } catch (e) {
    console.warn('Failed to load saved AI config:', e);
  }
  return DEFAULT_CONFIG;
}

export function saveAIConfig(config: AIProviderConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.warn('Failed to save AI config:', e);
  }
}

/**
 * Retrieve relevant schemes from the scheme database using keyword and semantic indexing (RAG Retriever)
 */
export function retrieveContextSchemes(query: string, maxResults: number = 4): Scheme[] {
  const q = query.toLowerCase();

  return [...SCHEMES_DATABASE].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    const keywordsA = `${a.name} ${a.hindiName} ${a.category} ${a.description} ${a.hindiDescription} ${a.targetDemographic}`.toLowerCase();
    const keywordsB = `${b.name} ${b.hindiName} ${b.category} ${b.description} ${b.hindiDescription} ${b.targetDemographic}`.toLowerCase();

    // Word match scoring
    const words = q.split(/\s+/).filter(w => w.length > 2);
    for (const w of words) {
      if (keywordsA.includes(w)) scoreA += 10;
      if (keywordsB.includes(w)) scoreB += 10;
    }

    // Specific domain triggers
    if ((q.includes('महिला') || q.includes('woman') || q.includes('tailor') || q.includes('सिलाई')) && a.category === 'women_entrepreneurship') scoreA += 25;
    if ((q.includes('महिला') || q.includes('woman') || q.includes('tailor') || q.includes('सिलाई')) && b.category === 'women_entrepreneurship') scoreB += 25;

    if ((q.includes('किसान') || q.includes('dairy') || q.includes('दूध') || q.includes('agriculture')) && a.category === 'agriculture') scoreA += 25;
    if ((q.includes('किसान') || q.includes('dairy') || q.includes('दूध') || q.includes('agriculture')) && b.category === 'agriculture') scoreB += 25;

    if ((q.includes('पढ़ाई') || q.includes('study') || q.includes('abroad') || q.includes('college')) && (a.category === 'education_inland' || a.category === 'education_abroad')) scoreA += 25;
    if ((q.includes('पढ़ाई') || q.includes('study') || q.includes('abroad') || q.includes('college')) && (b.category === 'education_inland' || b.category === 'education_abroad')) scoreB += 25;

    if ((q.includes('solar') || q.includes('electric') || q.includes('रिक्शा') || q.includes('ev')) && a.category === 'green_business') scoreA += 25;
    if ((q.includes('solar') || q.includes('electric') || q.includes('रिक्शा') || q.includes('ev')) && b.category === 'green_business') scoreB += 25;

    return scoreB - scoreA;
  }).slice(0, maxResults);
}

/**
 * Execute Multi-Provider RAG Query
 * Automatically routes and cascades: Groq/Grok -> OpenRouter -> Gemini -> Offline RAG
 */
export async function executeRAGSchemeMatcher(
  userQuery: string,
  config?: AIProviderConfig
): Promise<AIRAGResponse> {
  const startTime = performance.now();
  const currentConfig = config || getStoredAIConfig();
  const contextSchemes = retrieveContextSchemes(userQuery);
  const governmentContext = await fetchGovernmentDataContext(userQuery);
  const liveGovernmentSnippet = formatGovernmentContext(governmentContext);

  const contextPromptSnippet = contextSchemes.map(s =>
    `- [${s.code}] ${s.name} (${s.hindiName}): Max Cost ₹${(s.maxProjectCost / 100000).toFixed(1)}L, Interest ${s.baseInterestRate}% p.a., Max Subsidy/Assistance: ${s.maxAssistancePct}%. Category: ${s.category}. Target: ${s.targetDemographic}`
  ).join('\n');

  const systemInstructions = `
You are SamriddhiAI RAG, an expert financial advisory engine for Indian Government Concessional Schemes (NSFDC, JanSamarth, PMEGP, MUDRA, Stand-Up India).
Analyze the user's query (which may be in Hindi, Hinglish, broken English, or regional phrasing).

Knowledge Base Context:
${contextPromptSnippet}

Official Government Data Context (${governmentContext.isLive ? 'LIVE' : 'cached/local'}; fetched ${governmentContext.fetchedAt}):
${liveGovernmentSnippet}

Important: Never invent eligibility, interest rates, subsidy amounts, deadlines, or application links. Distinguish official records from local estimates and tell the user to verify current terms on the cited official portal.

Output ONLY a single raw valid JSON object without markdown formatting, code fences or backticks:
{
  "sector": "micro_enterprise" | "term_loan" | "education_inland" | "education_abroad" | "agriculture" | "green_business" | "women_entrepreneurship" | "sanitation_allied",
  "estimatedCost": number (in INR),
  "annualIncome": number (in INR, default 250000 if not specified),
  "gender": "male" | "female" | "transgender",
  "education": "below_10th" | "matriculate" | "graduate" | "post_graduate_professional",
  "isExistingBusiness": boolean,
  "summaryEn": "Clear summary in English of the user's requirement and matched support",
  "summaryHi": "हिन्दी में उपयोगकर्ता की आवश्यकता और योजना का स्पष्ट विवरण",
  "investmentPlanEn": "High-impact micro investment plan and equipment buying roadmap",
  "investmentPlanHi": "उपकरण खरीद एवं सूक्ष्म व्यवसाय निवेश योजना (हिन्दी)",
  "loanAdviceEn": "Actionable repayment and subsidy claim advice for the applicant",
  "loanAdviceHi": "सब्सिडी दावा और ईएमआई भुगतान हेतु उपयोगी सुझाव"
}
`;

  // 1. Try Groq / Grok
  const grokKey = currentConfig.grokKey?.trim();
  if (grokKey) {
    try {
      const isGroq = grokKey.startsWith('gsk_');
      const endpoint = isGroq
        ? 'https://api.groq.com/openai/v1/chat/completions'
        : 'https://api.x.ai/v1/chat/completions';
      const model = isGroq ? 'llama-3.3-70b-versatile' : 'grok-beta';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${grokKey}`
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemInstructions },
            { role: 'user', content: userQuery }
          ],
          temperature: 0.1
        })
      });

      if (response.ok) {
        const json = await response.json();
        const content = json.choices?.[0]?.message?.content || '';
        const parsed = parseCleanJson(content);
        if (parsed) {
          return buildResponseFromParsed(parsed, contextSchemes, isGroq ? 'Groq LPU (Llama 3.3 70B)' : 'Grok (xAI)', startTime);
        }
      }
    } catch (err) {
      console.warn('Groq/Grok API error, cascading to OpenRouter:', err);
    }
  }

  // 2. Try OpenRouter
  const openrouterKey = currentConfig.openrouterKey?.trim();
  if (openrouterKey) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openrouterKey}`,
          'HTTP-Referer': 'https://samriddhiai.gov.in',
          'X-Title': 'SamriddhiAI Scheme Matcher'
        },
        body: JSON.stringify({
          model: currentConfig.openrouterModel || 'meta-llama/llama-3.3-70b-instruct',
          messages: [
            { role: 'system', content: systemInstructions },
            { role: 'user', content: userQuery }
          ],
          temperature: 0.1
        })
      });

      if (response.ok) {
        const json = await response.json();
        const content = json.choices?.[0]?.message?.content || '';
        const parsed = parseCleanJson(content);
        if (parsed) {
          return buildResponseFromParsed(parsed, contextSchemes, `OpenRouter (${currentConfig.openrouterModel || 'Llama 3.3'})`, startTime);
        }
      }
    } catch (err) {
      console.warn('OpenRouter API error, cascading to Gemini:', err);
    }
  }

  // 3. Try Gemini
  const geminiKey = currentConfig.geminiKey?.trim();
  if (geminiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const res = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `${systemInstructions}\n\nUser Query: "${userQuery}"`,
      });

      const text = res.text || '';
      const parsed = parseCleanJson(text);
      if (parsed) {
        return buildResponseFromParsed(parsed, contextSchemes, 'Gemini 2.5 Flash', startTime);
      }
    } catch (err) {
      console.warn('Gemini API error, falling back to Local Offline RAG:', err);
    }
  }

  // 4. Local Offline RAG Engine (Zero network/token dependency, instant response)
  return executeOfflineRAGMatcher(userQuery, contextSchemes, startTime);
}


function parseCleanJson(text: string): any {
  try {
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (e) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

function buildResponseFromParsed(
  parsed: any,
  contextSchemes: Scheme[],
  provider: string,
  startTime: number
): AIRAGResponse {
  const validated = validateRAGPayload(parsed);
  if (!validated) {
    throw new Error('AI response failed schema or financial range validation');
  }
  const latency = Math.round(performance.now() - startTime);

  const matchedSchemes: RAGMatchedScheme[] = contextSchemes.map((s, idx) => ({
    scheme: s,
    relevanceScore: Math.max(75, 96 - idx * 7),
    reason: `Optimal fit for ₹${((parsed.estimatedCost || 140000) / 100000).toFixed(2)}L in ${parsed.sector || s.category} with ${(s.maxAssistancePct)}% concessional financing.`,
    hindiReason: `₹${((parsed.estimatedCost || 140000) / 100000).toFixed(2)} लाख लागत एवं ${s.maxAssistancePct}% रियायती ऋण हेतु श्रेष्ठ योजना।`
  }));

  return {
    profile: {
      sector: validated.sector,
      estimatedCost: validated.estimatedCost,
      annualIncome: validated.annualIncome,
      gender: validated.gender,
      education: validated.education,
      isExistingBusiness: validated.isExistingBusiness
    },
    matchedSchemes,
    naturalLanguageSummary: validated.summaryEn,
    hindiSummary: validated.summaryHi,
    investmentPlan: validated.investmentPlanEn,
    hindiInvestmentPlan: validated.investmentPlanHi,
    loanAdvice: validated.loanAdviceEn,
    hindiLoanAdvice: validated.loanAdviceHi,
    providerUsed: provider,
    latencyMs: latency
  };
}

/**
 * High-speed Heuristic Offline RAG Engine
 */
function executeOfflineRAGMatcher(
  query: string,
  contextSchemes: Scheme[],
  startTime: number
): AIRAGResponse {
  const lower = query.toLowerCase();
  let sector: SectorType = 'micro_enterprise';
  let estimatedCost = 140000;
  let annualIncome = 250000;
  let gender: GenderType = 'female';
  let education: EducationLevel = 'matriculate';
  let isExistingBusiness = false;

  // Sector keyword matching for English, Hindi & Hinglish
  if (lower.includes('tailor') || lower.includes('सिलाई') || lower.includes('silai') || lower.includes('boutique') || lower.includes('beauty') || lower.includes('महिला') || lower.includes('women') || lower.includes('shg') || lower.includes('self help')) {
    sector = 'women_entrepreneurship';
    gender = 'female';
    estimatedCost = 140000;
  } else if (lower.includes('kisan') || lower.includes('किसान') || lower.includes('dairy') || lower.includes('दूध') || lower.includes('goat') || lower.includes('गाय') || lower.includes('buffalo') || lower.includes('खेती') || lower.includes('kheti') || lower.includes('pashu')) {
    sector = 'agriculture';
    estimatedCost = 200000;
  } else if (lower.includes('study') || lower.includes('padhai') || lower.includes('पढ़ाई') || lower.includes('college') || lower.includes('btech') || lower.includes('mba') || lower.includes('degree')) {
    if (lower.includes('abroad') || lower.includes('foreign') || lower.includes('विदेश') || lower.includes('usa') || lower.includes('uk')) {
      sector = 'education_abroad';
      estimatedCost = 2000000;
    } else {
      sector = 'education_inland';
      estimatedCost = 1000000;
    }
  } else if (lower.includes('solar') || lower.includes('सोलर') || lower.includes('green') || lower.includes('ev') || lower.includes('electric') || lower.includes('e-rickshaw') || lower.includes('ई-रिक्शा')) {
    sector = 'green_business';
    estimatedCost = 300000;
  } else if (lower.includes('safai') || lower.includes('सफाई') || lower.includes('sanitation') || lower.includes('clean') || lower.includes('garbage')) {
    sector = 'sanitation_allied';
    estimatedCost = 500000;
  } else if (lower.includes('factory') || lower.includes('plant') || lower.includes('machinery') || lower.includes('dokan') || lower.includes('dukan') || lower.includes('shop') || lower.includes('unit')) {
    sector = 'term_loan';
    estimatedCost = 1000000;
  }

  // Cost extraction: Check for Lakhs, Thousands, or Raw numbers
  const lakhMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|l|लाख)/i);
  if (lakhMatch) {
    estimatedCost = parseFloat(lakhMatch[1]) * 100000;
  } else {
    const rawNum = lower.match(/(\d{5,8})/);
    if (rawNum) {
      estimatedCost = parseInt(rawNum[1], 10);
    }
  }

  // Income Extraction
  const incMatch = lower.match(/(?:income|aay|आय|kamai|salana)\s*(?:is|of|=|:)?\s*(\d+(?:\.\d+)?)\s*(?:lakh|lakhs|l|लाख)?/i);
  if (incMatch) {
    const val = parseFloat(incMatch[1]);
    annualIncome = val < 50 ? val * 100000 : val;
  }

  // Gender extraction
  if (lower.includes('man') || lower.includes('पुरुष') || lower.includes('boy') || lower.includes('ladka') || lower.includes('male')) {
    gender = 'male';
  } else if (lower.includes('woman') || lower.includes('महिला') || lower.includes('lady') || lower.includes('ladki') || lower.includes('female')) {
    gender = 'female';
  }

  if (lower.includes('existing') || lower.includes('already') || lower.includes('पुराना') || lower.includes('चल रहा')) {
    isExistingBusiness = true;
  }

  const primaryScheme = contextSchemes[0] || SCHEMES_DATABASE[0];
  const matchedSchemes: RAGMatchedScheme[] = contextSchemes.map((s, idx) => ({
    scheme: s,
    relevanceScore: Math.max(70, 95 - idx * 8),
    reason: `RAG indexed: ${s.name} covers up to ₹${(s.maxProjectCost / 100000).toFixed(1)}L with ${s.maxAssistancePct}% credit line at ${s.baseInterestRate}% interest.`,
    hindiReason: `आरएजी इंडेक्स: ${s.hindiName} ₹${(s.maxProjectCost / 100000).toFixed(1)} लाख तक ${s.maxAssistancePct}% रियायती ऋण ${s.baseInterestRate}% ब्याज पर प्रदान करती है।`
  }));

  const latency = Math.round(performance.now() - startTime);

  return {
    profile: {
      sector,
      estimatedCost,
      annualIncome,
      gender,
      education,
      isExistingBusiness
    },
    matchedSchemes,
    naturalLanguageSummary: `Matched with ${primaryScheme.name} for ${sector.replace('_', ' ')} sector with budget ₹${(estimatedCost / 100000).toFixed(2)} Lakhs.`,
    hindiSummary: `आपकी आवश्यकता अनुसार ₹${(estimatedCost / 100000).toFixed(2)} लाख बजट हेतु '${primaryScheme.hindiName}' से सर्वश्रेष्ठ तालमेल प्राप्त हुआ।`,
    investmentPlan: sector === 'women_entrepreneurship'
      ? '85% for modern electric sewing and overlock machines; 15% raw fabric inventory buffer.'
      : '75% capital asset machinery acquisition; 25% initial working capital reserve.',
    hindiInvestmentPlan: sector === 'women_entrepreneurship'
      ? '85% बजट आधुनिक इलेक्ट्रिक सिलाई व एम्ब्रॉयडरी मशीनों हेतु, 15% कपड़ा इन्वेंट्री रिजर्व।'
      : '75% मुख्य मशीनरी उपकरण खरीद, 25% कार्यशील पूंजी भंडार।',
    loanAdvice: 'Maintain 10% promoter equity ready in bank account to trigger immediate 90% nodal disbursement.',
    hindiLoanAdvice: 'खाते में 10% लाभार्थी हिस्सा तैयार रखें जिससे 90% सरकारी रियायती ऋण तुरंत स्वीकृत हो सके।',
    providerUsed: 'Local Offline RAG Engine (Fallback Active)',
    latencyMs: latency
  };
}
