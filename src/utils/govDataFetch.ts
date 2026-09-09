import { Scheme } from '../types';

export interface GovernmentDataItem {
  title: string;
  description: string;
  url: string;
  source: string;
  updatedAt?: string;
}

export interface GovernmentDataContext {
  items: GovernmentDataItem[];
  fetchedAt: string;
  source: string;
  isLive: boolean;
}

const CACHE_KEY = 'samriddhi_gov_data_cache_v1';
const DATA_GOV_API = 'https://api.data.gov.in/resource';
const DEFAULT_DATASET = '9ef84268-d588-465a-a308-a864a43d0070';
const TIMEOUT_MS = 7000;

function readCache(): GovernmentDataContext | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) as GovernmentDataContext : null;
  } catch {
    return null;
  }
}

function saveCache(value: GovernmentDataContext) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(value)); } catch { /* private mode */ }
}

async function fetchJson(url: string): Promise<any> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } });
    if (!response.ok) throw new Error(`Government feed returned ${response.status}`);
    return await response.json();
  } finally {
    window.clearTimeout(timer);
  }
}

function recordToItem(record: Record<string, unknown>, index: number): GovernmentDataItem {
  const values = Object.values(record).map(value => String(value ?? '').trim()).filter(Boolean);
  const title = String(record.scheme_name || record.title || record.name || values[0] || `Government scheme ${index + 1}`);
  const description = String(record.description || record.details || record.objective || values.slice(1, 4).join(' | ') || 'Official government scheme information');
  return { title, description, url: 'https://www.myscheme.gov.in/', source: 'data.gov.in' };
}

/** Fetches public government data when available and always returns a cached/offline-safe result. */
export async function fetchGovernmentDataContext(query = ''): Promise<GovernmentDataContext> {
  const apiKey = import.meta.env.VITE_DATA_GOV_API_KEY as string | undefined;
  const dataset = (import.meta.env.VITE_DATA_GOV_SCHEMES_DATASET as string | undefined) || DEFAULT_DATASET;
  const cached = readCache();

  if (apiKey) {
    try {
      const url = `${DATA_GOV_API}/${dataset}?api-key=${encodeURIComponent(apiKey)}&format=json&limit=25`;
      const payload = await fetchJson(url);
      const records = Array.isArray(payload?.records) ? payload.records : [];
      const terms = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
      const items = records.map(recordToItem).filter((item: GovernmentDataItem) =>
        terms.length === 0 || terms.some(term => `${item.title} ${item.description}`.toLowerCase().includes(term))
      ).slice(0, 8);
      const live: GovernmentDataContext = { items, fetchedAt: new Date().toISOString(), source: 'data.gov.in (official API)', isLive: true };
      saveCache(live);
      return live;
    } catch (error) {
      console.warn('Official government feed unavailable; using cached data:', error);
    }
  }

  return cached || { items: [], fetchedAt: new Date().toISOString(), source: 'Local scheme database', isLive: false };
}

export function formatGovernmentContext(context: GovernmentDataContext): string {
  if (!context.items.length) return 'No additional live government records were available. Use the local verified scheme database and clearly label estimates.';
  return context.items.map(item => `- ${item.title}: ${item.description} [Source: ${item.source}; ${item.url}]`).join('\n');
}

export function getOfficialSchemeSources(): string[] {
  return ['https://www.myscheme.gov.in/', 'https://www.jansamarth.in/', 'https://www.data.gov.in/'];
}

export type { Scheme };
