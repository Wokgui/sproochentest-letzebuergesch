const API_BASE = 'https://sproochmaschinn.lu';
const VOICE_MODEL = 'maxine';
const SESSION_TTL_MS = 8 * 60 * 1000;

let sessionId = null;
let sessionExpiresAt = 0;
let sessionPromise = null;

function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

async function fetchWithTimeout(url, options = {}, timeout = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function createSession() {
  const response = await fetchWithTimeout(`${API_BASE}/api/session`, { method: 'POST' }, 8000);
  if (!response.ok) throw new Error(`SPROOCH_SESSION_${response.status}`);
  const data = await response.json();
  if (!data?.session_id) throw new Error('SPROOCH_SESSION_INVALID');
  sessionId = data.session_id;
  sessionExpiresAt = Date.now() + SESSION_TTL_MS;
  return sessionId;
}

async function ensureSession(force = false) {
  if (!force && sessionId && Date.now() < sessionExpiresAt) return sessionId;
  if (sessionPromise) return sessionPromise;
  sessionPromise = createSession().finally(() => { sessionPromise = null; });
  return sessionPromise;
}

async function requestTts(text, forceSession = false) {
  const sid = await ensureSession(forceSession);
  const response = await fetchWithTimeout(`${API_BASE}/api/tts/${encodeURIComponent(sid)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, model: VOICE_MODEL })
  }, 10000);

  if (!response.ok) {
    if (!forceSession && [404, 408, 410].includes(response.status)) {
      sessionId = null;
      sessionExpiresAt = 0;
      return requestTts(text, true);
    }
    throw new Error(`SPROOCH_TTS_${response.status}`);
  }

  const data = await response.json();
  if (!data?.request_id) throw new Error('SPROOCH_TTS_INVALID');
  sessionExpiresAt = Date.now() + SESSION_TTL_MS;
  return data.request_id;
}

async function pollResult(requestId) {
  for (let attempt = 0; attempt < 50; attempt++) {
    const response = await fetchWithTimeout(`${API_BASE}/api/result/${encodeURIComponent(requestId)}`, {}, 8000);
    if (!response.ok) throw new Error(`SPROOCH_RESULT_${response.status}`);
    const data = await response.json();

    if (data?.status === 'completed') {
      const base64 = data?.result?.data;
      if (!base64 || typeof base64 !== 'string') throw new Error('SPROOCH_AUDIO_EMPTY');
      return Buffer.from(base64, 'base64');
    }
    if (data?.status === 'failed' || data?.status === 'error') {
      throw new Error(data?.error || 'SPROOCH_TTS_FAILED');
    }
    await new Promise(resolve => setTimeout(resolve, 350));
  }
  throw new Error('SPROOCH_TTS_TIMEOUT');
}

async function synthesize(text) {
  const requestId = await requestTts(text);
  return pollResult(requestId);
}

export default async function handler(req, res) {
  const isHealth = req.method === 'GET' && req.query?.health === '1';
  if (!isHealth && req.method !== 'POST') return sendJson(res, 405, { error: 'METHOD_NOT_ALLOWED' });
  if (!isHealth && String(req.headers['sec-fetch-site'] || '').toLowerCase() === 'cross-site') {
    return sendJson(res, 403, { error: 'CROSS_SITE_BLOCKED' });
  }

  let text = 'Moien! Wéi geet et dir?';
  if (!isHealth) {
    let body = req.body;
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch { body = {}; }
    }
    text = typeof body?.text === 'string' ? body.text.trim().slice(0, 900) : '';
    if (!text) return sendJson(res, 400, { error: 'EMPTY_TEXT' });
  }

  try {
    const bytes = await synthesize(text);
    if (isHealth) {
      return sendJson(res, 200, {
        ok: bytes.length > 0,
        engine: 'sproochmaschinn.lu',
        voice: VOICE_MODEL,
        mediaType: 'audio/wav',
        bytes: bytes.length
      });
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Length', String(bytes.length));
    res.setHeader('Cache-Control', 'private, max-age=86400');
    res.setHeader('X-Mia-Voice-Engine', 'sproochmaschinn');
    res.setHeader('X-Mia-Voice', VOICE_MODEL);
    res.end(bytes);
  } catch (error) {
    console.error('Sproochmaschinn Mia voice failed', error);
    return sendJson(res, 503, { error: 'NATURAL_VOICE_UNAVAILABLE' });
  }
}
