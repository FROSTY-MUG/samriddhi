import { SCHEMES_DATABASE } from '../data/schemes';
import { CHANNEL_PARTNERS_DATABASE } from '../data/partners';
import { Scheme, ChannelPartner, SectorType } from '../types';
import { fetchGovernmentDataContext } from './govDataFetch';

export interface LiveSchemeFeed {
  schemes: Scheme[];
  partners: ChannelPartner[];
  lastUpdated: string;
  source: string;
}

/** Fetch official records when configured; retain the bundled verified catalog as a safe fallback. */
export async function fetchLiveGovernmentSchemes(sectorFilter?: SectorType): Promise<LiveSchemeFeed> {
  const context = await fetchGovernmentDataContext(sectorFilter || 'government schemes');
  let filteredSchemes = SCHEMES_DATABASE;
  if (sectorFilter) filteredSchemes = SCHEMES_DATABASE.filter(s => s.category === sectorFilter);

  return {
    schemes: filteredSchemes,
    partners: CHANNEL_PARTNERS_DATABASE,
    lastUpdated: new Date(context.fetchedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    source: context.isLive ? `${context.source} + local scheme catalog` : 'Offline cached government data + local scheme catalog'
  };
}
