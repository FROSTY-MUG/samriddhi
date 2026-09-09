const GEMINI_TTS_MODEL = 'gemini-2.5-flash-preview-tts';

function pcmToWavUrl(base64: string, sampleRate = 24000): string {
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

/** Uses Gemini TTS when a key is present. Returns false when callers should use browser speech fallback. */
export async function speakWithGemini(text: string, apiKey?: string, voiceName = 'Kore'): Promise<boolean> {
  if (!apiKey?.trim() || typeof Audio === 'undefined') return false;
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_TTS_MODEL}:generateContent?key=${encodeURIComponent(apiKey.trim())}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName } }
          }
        }
      })
    });
    if (!response.ok) return false;
    const payload = await response.json();
    const part = payload.candidates?.[0]?.content?.parts?.find((item: any) => item.inlineData?.data);
    if (!part?.inlineData?.data) return false;
    const audio = new Audio(pcmToWavUrl(part.inlineData.data));
    await audio.play();
    audio.addEventListener('ended', () => URL.revokeObjectURL(audio.src), { once: true });
    return true;
  } catch (error) {
    console.warn('Gemini TTS unavailable; using browser voice fallback:', error);
    return false;
  }
}
