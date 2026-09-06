const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 35;
const buckets = new Map();

const SCENARIOS = {
  alldag: 'conversation quotidienne, vie de tous les jours',
  restaurant: 'restaurant, café, commander, goûts et habitudes alimentaires',
  aarbecht: 'travail, collègues, horaires et organisation',
  reesen: 'voyage, transports, vacances et déplacements',
  sproochentest: 'préparation au Sproochentest avec thèmes personnels A2'
};

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

function clientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return forwarded || String(req.socket?.remoteAddress || 'unknown');
}

function limited(req) {
  const now = Date.now();
  const ip = clientIp(req);
  const current = buckets.get(ip);
  if (!current || now - current.startedAt > WINDOW_MS) {
    buckets.set(ip, { startedAt: now, count: 1 });
    return false;
  }
  current.count += 1;
  return current.count > MAX_REQUESTS;
}

function cleanHistory(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(-8).flatMap(item => {
    const role = item?.role === 'assistant' ? 'assistant' : item?.role === 'user' ? 'user' : null;
    const content = typeof item?.content === 'string' ? item.content.trim().slice(0, 700) : '';
    return role && content ? [{ role, content }] : [];
  });
}

function parseModelJson(text) {
  const raw = String(text || '').trim();
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  try {
    const data = JSON.parse(cleaned);
    const reply = typeof data.reply === 'string' ? data.reply.trim() : '';
    const correction = typeof data.correction === 'string' && data.correction.trim() ? data.correction.trim() : null;
    if (reply) return { reply: reply.slice(0, 900), correction: correction?.slice(0, 700) || null };
  } catch {}
  return raw ? { reply: raw.slice(0, 900), correction: null } : null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'METHOD_NOT_ALLOWED' });
  if (String(req.headers['sec-fetch-site'] || '').toLowerCase() === 'cross-site') {
    return json(res, 403, { error: 'CROSS_SITE_BLOCKED' });
  }
  if (limited(req)) return json(res, 429, { error: 'TOO_MANY_REQUESTS' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }
  const message = typeof body?.message === 'string' ? body.message.trim().slice(0, 700) : '';
  if (!message) return json(res, 400, { error: 'EMPTY_MESSAGE' });

  const scenarioKey = SCENARIOS[body?.scenario] ? body.scenario : 'alldag';
  const scenario = SCENARIOS[scenarioKey];
  const history = cleanHistory(body?.history);
  const authToken = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN;
  if (!authToken) return json(res, 503, { error: 'AI_NOT_CONFIGURED', fallback: true });

  const system = `Tu es Mia, une coach conversationnelle chaleureuse de luxembourgeois (Lëtzebuergesch) pour un apprenant francophone de niveau A2 qui prépare notamment le Sproochentest.\n\nContexte actuel : ${scenario}.\n\nRègles :\n- Réponds principalement en luxembourgeois naturel, moderne et oral.\n- Fais court : 1 à 3 phrases, puis généralement une question simple pour poursuivre la conversation.\n- Adapte ton vocabulaire à A2, mais reste naturelle.\n- Ne transforme pas l'échange en cours magistral.\n- Analyse la phrase de l'apprenant. Corrige seulement une erreur utile ou une formulation vraiment peu naturelle.\n- La correction est en français, très brève, et doit donner la bonne formulation luxembourgeoise.\n- Ne corrige pas les petites bizarreries pouvant venir de la reconnaissance vocale.\n- Si la phrase est correcte, correction doit être null.\n- Si l'apprenant parle français parce qu'il bloque, aide-le à reformuler en luxembourgeois puis poursuis.\n\nRéponds UNIQUEMENT avec un objet JSON valide sous cette forme : {"reply":"réponse en luxembourgeois","correction":null} ou {"reply":"réponse en luxembourgeois","correction":"correction courte en français"}.`;

  try {
    const gateway = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        model: 'openai/gpt-5.6-luna',
        messages: [
          { role: 'system', content: system },
          ...history,
          { role: 'user', content: message }
        ],
        max_tokens: 220,
        temperature: 0.35
      })
    });

    if (!gateway.ok) {
      const detail = await gateway.text().catch(() => '');
      console.error('AI Gateway error', gateway.status, detail.slice(0, 500));
      return json(res, 502, { error: 'AI_GATEWAY_ERROR', fallback: true });
    }

    const payload = await gateway.json();
    const content = payload?.choices?.[0]?.message?.content;
    const parsed = parseModelJson(content);
    if (!parsed) return json(res, 502, { error: 'INVALID_AI_RESPONSE', fallback: true });
    return json(res, 200, { ...parsed, source: 'ai' });
  } catch (error) {
    console.error('Conversation endpoint failed', error);
    return json(res, 502, { error: 'AI_REQUEST_FAILED', fallback: true });
  }
}
