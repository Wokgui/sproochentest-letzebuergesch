const CACHE_KEY = 'letzlies-dictionary-cache-v2';
const NEGATIVE_TTL = 6 * 60 * 60 * 1000;
const POSITIVE_TTL = 30 * 24 * 60 * 60 * 1000;
const LOD_BASE = 'https://lod.lu/api/fr';

function norm(value) {
  return String(value || '')
    .toLocaleLowerCase('lb-LU')
    .normalize('NFC')
    .replace(/[’]/g, "'")
    .replace(/^['’]+|['’]+$/g, '');
}

function loadCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); }
  catch { return {}; }
}

function saveCache(cache) {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); }
  catch {}
}

export function cachedDictionaryEntry(word) {
  const cached = loadCache()[norm(word)];
  if (!cached) return null;
  const age = Date.now() - (cached.cachedAt || 0);
  if (cached.notFound && age > NEGATIVE_TTL) return null;
  if (!cached.notFound && age > POSITIVE_TTL) return null;
  return cached.notFound ? null : cached;
}

export function cacheDictionaryEntry(word, entry) {
  const cache = loadCache();
  cache[norm(word)] = { ...entry, cachedAt: Date.now(), source: entry.source || 'cache' };
  saveCache(cache);
}

function cacheNotFound(word) {
  const cache = loadCache();
  cache[norm(word)] = { notFound: true, cachedAt: Date.now() };
  saveCache(cache);
}

export function clearDictionaryCache() {
  localStorage.removeItem(CACHE_KEY);
}

export function dictionaryCacheStats() {
  const cache = loadCache();
  const now = Date.now();
  let positive = 0, negative = 0, expired = 0;
  for (const item of Object.values(cache)) {
    const age = now - Number(item?.cachedAt || 0);
    const ttl = item?.notFound ? NEGATIVE_TTL : POSITIVE_TTL;
    if (age > ttl) expired++;
    else if (item?.notFound) negative++;
    else positive++;
  }
  return { positive, negative, expired, total: positive + negative + expired };
}

function timeoutSignal(ms = 4500) {
  if (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) return AbortSignal.timeout(ms);
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller.signal;
}

async function getJson(url) {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: timeoutSignal()
  });
  if (!response.ok) throw new Error(`LOD_${response.status}`);
  const type = response.headers.get('content-type') || '';
  if (!type.includes('json')) throw new Error('LOD_NOT_JSON');
  return response.json();
}

function walk(value, out = []) {
  if (!value) return out;
  if (Array.isArray(value)) {
    for (const item of value) walk(item, out);
  } else if (typeof value === 'object') {
    out.push(value);
    for (const child of Object.values(value)) walk(child, out);
  }
  return out;
}

function firstString(obj, keys) {
  for (const key of keys) {
    const value = obj?.[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function allStrings(value, out = []) {
  if (typeof value === 'string' && value.trim()) out.push(value.trim());
  else if (Array.isArray(value)) value.forEach(v => allStrings(v, out));
  else if (value && typeof value === 'object') Object.values(value).forEach(v => allStrings(v, out));
  return out;
}

function looksFrenchKey(key) {
  return /(^|_|-)(fr|fra|french|francais|français)($|_|-)/i.test(key);
}

function extractFrench(obj) {
  const values = [];
  for (const [key, value] of Object.entries(obj || {})) {
    if (looksFrenchKey(key)) allStrings(value, values);
  }
  const translations = obj?.translations || obj?.translation || obj?.senses;
  if (translations) {
    for (const candidate of walk(translations)) {
      const lang = firstString(candidate, ['lang','language','locale','code']);
      if (/^(fr|fra|french|français)$/i.test(lang)) {
        const text = firstString(candidate, ['translation','text','value','label','term','word']);
        if (text) values.push(text);
      }
    }
  }
  return [...new Set(values)].filter(x => x.length < 160).slice(0, 8);
}

function extractExamples(obj) {
  const examples = [];
  for (const candidate of walk(obj)) {
    const lb = firstString(candidate, ['example','luxembourgish','lb','sentence','text']);
    const fr = firstString(candidate, ['fr','french','translation']);
    if (lb && lb.length > 8 && lb.length < 220 && !examples.some(e => e.lb === lb)) {
      examples.push({ lb, fr: fr || '' });
      if (examples.length >= 3) break;
    }
  }
  return examples;
}

function normalizeEntry(payload, requestedWord) {
  const objects = walk(payload);
  if (!objects.length) return null;
  const target = norm(requestedWord);
  const scored = objects.map(obj => {
    const lemma = firstString(obj, ['lemma','word','headword','writtenForm','title','name','label']);
    let score = lemma && norm(lemma) === target ? 20 : 0;
    if (lemma && norm(lemma).startsWith(target)) score += 5;
    if (extractFrench(obj).length) score += 8;
    if (firstString(obj, ['lod_id','lodId','id','article_id','articleId'])) score += 2;
    return { obj, lemma, score };
  }).sort((a,b) => b.score - a.score);
  const best = scored[0];
  if (!best || (!best.lemma && best.score === 0)) return null;
  const obj = best.obj;
  const fr = extractFrench(obj);
  const id = firstString(obj, ['lod_id','lodId','article_id','articleId','id']);
  const type = firstString(obj, ['partOfSpeech','part_of_speech','pos','wordType','word_type','type']);
  const genderRaw = firstString(obj, ['gender','genus']);
  const gender = /(masc|mask)/i.test(genderRaw) ? 'm' : /fem/i.test(genderRaw) ? 'f' : /(neut|säch)/i.test(genderRaw) ? 'n' : undefined;
  const plural = firstString(obj, ['plural','pluralForm','plural_form']);
  const audio = allStrings(obj).find(x => /\.(ogg|m4a|mp3)(\?|$)/i.test(x)) || '';
  return {
    lemma: best.lemma || requestedWord,
    fr,
    type: type || 'LOD',
    gender,
    plural: plural || undefined,
    examples: extractExamples(obj),
    lodId: id || undefined,
    lodAudio: audio || undefined,
    source: 'LOD'
  };
}

async function hydrateById(entry) {
  if (!entry?.lodId) return entry;
  try {
    const payload = await getJson(`${LOD_BASE}/entry/${encodeURIComponent(entry.lodId)}`);
    const detailed = normalizeEntry(payload, entry.lemma);
    if (!detailed) return entry;
    return {
      ...entry,
      ...detailed,
      fr: detailed.fr?.length ? detailed.fr : entry.fr,
      source: 'LOD'
    };
  } catch {
    return entry;
  }
}

// LOD documents the public endpoints /search, /translations, /entry/{lod_id}
// and /spellchecker/suggestions/{word}. The static OpenAPI page currently does
// not expose the query parameter names to this build environment. We therefore
// probe a small set of conventional parameter names at runtime. The adapter is
// isolated, cached and fail-safe: a LOD change never breaks reading.
export async function checkLodAvailability(word = 'Haus') {
  try {
    const payload = await getJson(`${LOD_BASE}/spellchecker/suggestions/${encodeURIComponent(word)}`);
    return { ok: true, endpoint: 'spellchecker/suggestions', payload };
  } catch (error) {
    return { ok: false, endpoint: 'spellchecker/suggestions', error: String(error?.message || error) };
  }
}

export async function lookupLod(word) {
  const cached = cachedDictionaryEntry(word);
  if (cached) return cached;
  const encoded = encodeURIComponent(word);
  const candidates = [
    `${LOD_BASE}/spellchecker/suggestions/${encoded}`,
    `${LOD_BASE}/search?query=${encoded}`,
    `${LOD_BASE}/search?q=${encoded}`,
    `${LOD_BASE}/search?search=${encoded}`,
    `${LOD_BASE}/search?term=${encoded}`,
    `${LOD_BASE}/translations?query=${encoded}`,
    `${LOD_BASE}/translations?q=${encoded}`
  ];
  for (const url of candidates) {
    try {
      const payload = await getJson(url);
      let entry = normalizeEntry(payload, word);
      if (!entry) continue;
      entry = await hydrateById(entry);
      cacheDictionaryEntry(word, entry);
      if (entry.lemma && norm(entry.lemma) !== norm(word)) cacheDictionaryEntry(entry.lemma, entry);
      return entry;
    } catch {}
  }
  cacheNotFound(word);
  return null;
}

export function lodArticleUrl(entry, fallbackWord = '') {
  if (entry?.lodId) return `https://lod.lu/artikel/${encodeURIComponent(entry.lodId)}`;
  const lemma = entry?.lemma || fallbackWord;
  return `https://lod.lu/?query=${encodeURIComponent(lemma)}`;
}
