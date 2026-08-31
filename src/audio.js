const LOCAL_MODULE = '/rhvoice/src/rhvoice-tts.js';
const REMOTE_MODULE = 'https://accessibility-luxembourg.github.io/rhvoice-emscripten-lb/src/rhvoice-tts.js';

let moduleInstance = null;
let loading = null;
let lastError = null;

async function importRHVoice() {
  // Prefer a locally mirrored copy when present (fully offline build),
  // otherwise use the Luxembourg government-hosted browser build.
  try {
    return await import(LOCAL_MODULE);
  } catch {
    return await import(/* @vite-ignore */ REMOTE_MODULE);
  }
}

async function loadRHVoice(defaultVoice = 'mia') {
  if (moduleInstance) return moduleInstance;
  if (loading) return loading;
  loading = (async () => {
    const mod = await importRHVoice();
    await mod.init(undefined, defaultVoice);
    moduleInstance = mod;
    lastError = null;
    return mod;
  })().catch(error => {
    lastError = error;
    loading = null;
    throw error;
  });
  return loading;
}

export async function preloadLuxembourgishVoice(defaultVoice = 'mia') {
  try {
    await loadRHVoice(defaultVoice);
    return true;
  } catch {
    return false;
  }
}

// Call directly from a click/touch handler. This matters on iOS and is harmless elsewhere.
export function unlockAudioGesture() {
  try {
    moduleInstance?.unlock?.();
  } catch {}
}

function nativeLuxembourgishVoice() {
  if (!('speechSynthesis' in window)) return null;
  return speechSynthesis.getVoices().find(v => /^lb(?:-|$)/i.test(v.lang));
}

async function nativeSpeak(text, rate) {
  const voice = nativeLuxembourgishVoice();
  if (!voice) throw new Error('NO_LUXEMBOURGISH_VOICE');
  speechSynthesis.cancel();
  await new Promise((resolve, reject) => {
    const u = new SpeechSynthesisUtterance(text);
    u.voice = voice;
    u.lang = voice.lang;
    u.rate = rate;
    u.onend = resolve;
    u.onerror = () => reject(new Error('NATIVE_TTS_FAILED'));
    speechSynthesis.speak(u);
  });
  return { engine: 'native', voice: voice.name };
}

export async function speakLuxembourgish(text, { voice = 'mia', rate = 1 } = {}) {
  const safeRate = rate === 0.8 ? 0.8 : 1;
  try {
    const mod = await loadRHVoice(voice);
    mod.unlock?.();
    await mod.speak(text, voice, {
      rate: safeRate,
      pitch: 1,
      volume: 1
    });
    return { engine: 'rhvoice', voice };
  } catch (error) {
    try {
      return await nativeSpeak(text, safeRate);
    } catch {
      const wrapped = new Error('AUDIO_UNAVAILABLE');
      wrapped.cause = error;
      throw wrapped;
    }
  }
}

export function audioStatus() {
  return {
    ready: Boolean(moduleInstance),
    loading: Boolean(loading && !moduleInstance),
    error: lastError ? String(lastError.message || lastError) : null
  };
}


export function pauseLuxembourgish() {
  try {
    moduleInstance?.pause?.();
    return true;
  } catch {
    try { speechSynthesis?.pause?.(); } catch {}
    return false;
  }
}

export function resumeLuxembourgish() {
  try {
    moduleInstance?.resume?.();
    return true;
  } catch {
    try { speechSynthesis?.resume?.(); } catch {}
    return false;
  }
}
