import { Language } from './translations';

export interface VoiceSpeakOptions {
  lang?: Language;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

// Global state for voice management
let currentAudio: HTMLAudioElement | null = null;
let heartbeatTimer: any = null;
let activeUtterances: SpeechSynthesisUtterance[] = [];
let voiceCache: SpeechSynthesisVoice[] = [];
const audioUrlCache = new Map<string, string>();

// Monotonic generation counter. Bumped on every speak/stop call so that a
// stale async callback (delayed setTimeout or a slow Gemini fetch) can detect
// that it has been superseded and must NOT touch audio state.
let speechGeneration = 0;

// Initialize voices as early as possible
if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  const loadVoices = () => {
    try {
      voiceCache = window.speechSynthesis.getVoices();
    } catch {
      // Ignore
    }
  };
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

/**
 * Returns best matching voice for selected language.
 * Prioritizes native Indian localized voices for low latency & natural accent.
 */
export function getBestVoice(lang: Language = 'en'): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  if (!voiceCache || voiceCache.length === 0) {
    voiceCache = window.speechSynthesis.getVoices();
  }
  const voices = voiceCache;
  if (!voices || voices.length === 0) return null;

  const langCode = lang === 'hi' ? 'hi' : lang === 'ta' ? 'ta' : lang === 'mr' ? 'mr' : 'en';

  if (langCode === 'hi') {
    // 1. Exact hi-IN matches
    const hiVoice = voices.find(v => v.lang.replace('_', '-').toLowerCase().startsWith('hi') || v.name.includes('Hindi') || v.name.includes('हिन्दी'));
    if (hiVoice) return hiVoice;
  } else if (langCode === 'ta') {
    const taVoice = voices.find(v => v.lang.replace('_', '-').toLowerCase().startsWith('ta') || v.name.includes('Tamil') || v.name.includes('தமிழ்'));
    if (taVoice) return taVoice;
  } else if (langCode === 'mr') {
    const mrVoice = voices.find(v => v.lang.replace('_', '-').toLowerCase().startsWith('mr') || v.name.includes('Marathi') || v.name.includes('मराठी'));
    if (mrVoice) return mrVoice;
  } else {
    // en-IN preferred for Indian government context
    const enInVoice = voices.find(v => v.lang.replace('_', '-').toLowerCase() === 'en-in' || v.name.toLowerCase().includes('india'));
    if (enInVoice) return enInVoice;
    const enVoice = voices.find(v => v.lang.toLowerCase().startsWith('en'));
    if (enVoice) return enVoice;
  }

  // Fallback to first available voice or null
  return voices[0] || null;
}

/**
 * Stop all ongoing speech (both Web Speech API and HTML5 Audio) immediately.
 */
export function stopAllVoice(): void {
  // Invalidate all in-flight async speech work (stale setTimeout, Gemini fetch)
  speechGeneration++;

  // 1. Clear heartbeat
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }

  // 2. Stop HTML5 audio
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {
      // Ignore
    }
    currentAudio = null;
  }

  // 3. Stop Web Speech Synthesis
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore
    }
  }

  activeUtterances = [];
}

/**
 * Clean up text for natural spoken synthesis.
 * Strips markdown symbols, asterisks, hash signs, brackets, etc.
 */
function cleanTextForSpeech(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/#{1,6}\s?/g, '')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/₹\s?(\d+)/g, 'रु $1')
    .replace(/INR\s?(\d+)/g, 'रु $1')
    .replace(/[•\-\_\|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Split text into short natural sentences for immediate streaming playback.
 * Chunk 1 starts instantly (< 20ms) while following sentences are queued seamlessly.
 */
function splitIntoSentences(text: string): string[] {
  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) return [];

  // Split on Hindi danda (।), period, question mark, exclamation, or newline
  const rawParts = cleaned.split(/(?<=[।\.?!])\s+/);
  const result: string[] = [];

  for (const part of rawParts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    // If a sentence is very long (> 160 chars), break on commas or conjunctions to avoid Chrome cutoff
    if (trimmed.length > 160) {
      const subParts = trimmed.split(/(?<=[\,;])\s+/);
      for (const sub of subParts) {
        if (sub.trim()) result.push(sub.trim());
      }
    } else {
      result.push(trimmed);
    }
  }

  return result.length > 0 ? result : [cleaned];
}

/**
 * High-performance Instant Voice Synthesizer.
 * Starts speaking in under 20ms using native Web Speech API with sentence streaming.
 */
export function speakInstant(
  text: string,
  options: VoiceSpeakOptions = {}
): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }

  const {
    lang = 'en',
    rate = 0.96,
    pitch = 1.0,
    onStart,
    onEnd,
    onError
  } = options;

  // Stop any active audio first
  stopAllVoice();
  // Capture the current generation: any other speak/stop call while the
  // 15ms deferred queue below is pending invalidates this one.
  const generation = speechGeneration;

  const sentences = splitIntoSentences(text);
  if (sentences.length === 0) {
    onEnd?.();
    return true;
  }

  const voice = getBestVoice(lang);
  const langCode = lang === 'hi' ? 'hi-IN' : lang === 'ta' ? 'ta-IN' : lang === 'mr' ? 'mr-IN' : 'en-IN';

  // A newer speak/stop call ran while we were splitting text — bail out quietly.
  if (generation !== speechGeneration) {
    return true;
  }

  // Chromium bug workaround: ensure speechSynthesis is unpaused
  if (window.speechSynthesis.paused) {
    window.speechSynthesis.resume();
  }

  activeUtterances = [];
  let isStarted = false;

  // Keep-alive heartbeat for long speeches in Chromium (prevents Chrome 15-second cutoff)
  heartbeatTimer = setInterval(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
        window.speechSynthesis.pause();
        window.speechSynthesis.resume();
      } else if (!window.speechSynthesis.speaking) {
        clearInterval(heartbeatTimer);
        heartbeatTimer = null;
      }
    }
  }, 9000);

  // Short delay of 15ms avoids the cancel-then-speak dropping bug in Chromium
  setTimeout(() => {
    // Stale: another speech started or stopped before this deferred queue ran.
    if (generation !== speechGeneration) {
      return;
    }
    sentences.forEach((sentence, index) => {
      const utterance = new SpeechSynthesisUtterance(sentence);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.lang = langCode;
      if (voice) {
        utterance.voice = voice;
      }

      if (index === 0) {
        utterance.onstart = () => {
          if (!isStarted) {
            isStarted = true;
            onStart?.();
          }
        };
      }

      if (index === sentences.length - 1) {
        utterance.onend = () => {
          if (heartbeatTimer) {
            clearInterval(heartbeatTimer);
            heartbeatTimer = null;
          }
          activeUtterances = [];
          onEnd?.();
        };

        utterance.onerror = (e) => {
          if (heartbeatTimer) {
            clearInterval(heartbeatTimer);
            heartbeatTimer = null;
          }
          activeUtterances = [];
          if (e.error !== 'canceled' && e.error !== 'interrupted') {
            onError?.(e);
          }
          onEnd?.();
        };
      } else {
        utterance.onerror = (e) => {
          if (e.error !== 'canceled' && e.error !== 'interrupted') {
            console.warn('Interim sentence speech warning:', e);
          }
        };
      }

      activeUtterances.push(utterance);
      window.speechSynthesis.speak(utterance);
    });
  }, 15);

  return true;
}

/**
 * Convert base64 PCM to playable WAV blob URL.
 */
function pcmToWavUrl(base64: string, mimeType?: string): string {
  // Gemini returns the true sample rate in the audio mimeType, e.g.
  // "audio/pcm;codec=pcm;rate=24000". Using it avoids distorted/incorrect playback.
  const rateMatch = mimeType?.match(/rate=([0-9]+)/i);
  const sampleRate = rateMatch ? parseInt(rateMatch[1], 10) : 24000;
  const pcm = Uint8Array.from(atob(base64), character => character.charCodeAt(0));
  const buffer = new ArrayBuffer(44 + pcm.length);
  const view = new DataView(buffer);
  const write = (offset: number, value: string) => [...value].forEach((char, index) => view.setUint8(offset + index, char.charCodeAt(0)));
  write(0, 'RIFF'); view.setUint32(4, 36 + pcm.length, true); write(8, 'WAVE');
  write(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, 1, true);
  view.setUint16(22, 1, true); view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true); view.setUint16(34, 16, true); write(36, 'data'); view.setUint32(40, pcm.length, true);
  new Uint8Array(buffer, 44).set(pcm);
  return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }));
}

/**
 * Gemini Neural Cloud TTS with in-memory caching and strict 2.5s network timeout.
 * If Gemini takes longer than 2.5s or fails, it falls back to Instant Native TTS seamlessly.
 */
export async function speakWithGeminiOptimized(
  text: string,
  apiKey?: string,
  voiceName = 'Kore',
  options: VoiceSpeakOptions = {}
): Promise<boolean> {
  const { lang = 'en', onStart, onEnd, onError } = options;
  const clean = cleanTextForSpeech(text);
  // Capture the current generation: any newer speak/stopAllVoice call while we
  // wait on the network (up to 2.5s) invalidates this playback.
  const generation = speechGeneration;

  if (!apiKey?.trim() || typeof Audio === 'undefined') {
    return speakInstant(clean, options);
  }

  // Check in-memory audio cache for 0ms latency playback
  const cacheKey = `${voiceName}:${clean}`;
  if (audioUrlCache.has(cacheKey)) {
    const cachedUrl = audioUrlCache.get(cacheKey)!;
    stopAllVoice();
    currentAudio = new Audio(cachedUrl);
    currentAudio.onplay = () => onStart?.();
    currentAudio.onended = () => {
      currentAudio = null;
      onEnd?.();
    };
    currentAudio.onerror = (e) => {
      currentAudio = null;
      onError?.(e);
      onEnd?.();
    };
    // Audio could not start (e.g. user gesture requirement) — fallback to instant speech.
    try {
      if (generation !== speechGeneration) return true;
      await currentAudio.play();
      return true;
    } catch {
      if (generation !== speechGeneration) return true;
      // Audio play failed (e.g. user gesture requirement), fallback to instant speech
      return speakInstant(clean, options);
    }
  }

  // Strict 2.5s timeout controller to prevent the app from freezing for 11+ seconds
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 2500);

  try {
    const GEMINI_TTS_MODEL = 'gemini-2.5-flash-preview-tts';
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TTS_MODEL}:generateContent?key=${encodeURIComponent(apiKey.trim())}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{ parts: [{ text: clean.slice(0, 300) }] }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: { prebuiltVoiceConfig: { voiceName } }
            }
          }
        })
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      return speakInstant(clean, options);
    }

    const payload = await response.json();
    const part = payload.candidates?.[0]?.content?.parts?.find((item: any) => item.inlineData?.data);
    if (!part?.inlineData?.data) {
      return speakInstant(clean, options);
    }

    const wavUrl = pcmToWavUrl(part.inlineData.data, part.inlineData.mimeType);
    audioUrlCache.set(cacheKey, wavUrl);

    stopAllVoice();
    // A newer speak/stop call happened while we were fetching — do not play stale audio.
    if (generation !== speechGeneration) return true;
    currentAudio = new Audio(wavUrl);
    currentAudio.onplay = () => onStart?.();
    currentAudio.onended = () => {
      currentAudio = null;
      onEnd?.();
    };
    currentAudio.onerror = (e) => {
      currentAudio = null;
      onError?.(e);
      onEnd?.();
    };

    await currentAudio.play();
    return true;
  } catch (err: any) {
    clearTimeout(timeoutId);
    // Abort or network failure — instantly fall back to Web Speech without user noticing lag
    return speakInstant(clean, options);
  }
}
