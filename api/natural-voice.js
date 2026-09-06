import { experimental_generateSpeech as generateSpeech } from 'ai';
import { gateway } from '@ai-sdk/gateway';

const MODEL = 'fish-audio/s2.1-pro-free';
const VOICE = '933563129e564b19a115bedd57b7406a';

function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'METHOD_NOT_ALLOWED' });
  if (String(req.headers['sec-fetch-site'] || '').toLowerCase() === 'cross-site') {
    return sendJson(res, 403, { error: 'CROSS_SITE_BLOCKED' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const text = typeof body?.text === 'string' ? body.text.trim().slice(0, 900) : '';
  if (!text) return sendJson(res, 400, { error: 'EMPTY_TEXT' });

  try {
    const directedText = `[warm, friendly, relaxed and natural conversational delivery; speak Luxembourgish fluently, with human rhythm and subtle expression] ${text}`;
    const result = await generateSpeech({
      model: gateway.speechModel(MODEL),
      text: directedText,
      voice: VOICE,
      outputFormat: 'mp3',
      abortSignal: AbortSignal.timeout(12000),
      maxRetries: 1
    });

    const bytes = Buffer.from(result.audio.uint8Array);
    res.statusCode = 200;
    res.setHeader('Content-Type', result.audio.mediaType || 'audio/mpeg');
    res.setHeader('Content-Length', String(bytes.length));
    res.setHeader('Cache-Control', 'private, max-age=86400');
    res.setHeader('X-Mia-Voice-Engine', MODEL);
    res.end(bytes);
  } catch (error) {
    console.error('Natural Mia voice failed', error);
    return sendJson(res, 503, { error: 'NATURAL_VOICE_UNAVAILABLE' });
  }
}
