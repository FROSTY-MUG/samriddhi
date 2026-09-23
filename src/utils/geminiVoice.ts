import { speakWithGeminiOptimized, speakInstant, stopAllVoice, getBestVoice } from './voiceService';

export { speakWithGeminiOptimized, speakInstant, stopAllVoice, getBestVoice };

/**
 * Backward-compatible helper that delegates to our low-latency voice service.
 */
export async function speakWithGemini(
  text: string,
  apiKey?: string,
  voiceName = 'Kore'
): Promise<boolean> {
  return speakWithGeminiOptimized(text, apiKey, voiceName);
}

