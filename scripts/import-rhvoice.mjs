import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const BASE = 'https://accessibility-luxembourg.github.io/rhvoice-emscripten-lb/';
const ROOT = 'public/rhvoice';

async function fetchBytes(relative) {
  const url = new URL(relative, BASE);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return new Uint8Array(await response.arrayBuffer());
}

async function save(relative, bytes) {
  const target = join(ROOT, relative);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, bytes);
  console.log('✓', relative);
}

async function download(relative, optional = false) {
  try {
    const bytes = await fetchBytes(relative);
    await save(relative, bytes);
    return bytes;
  } catch (error) {
    if (!optional) throw error;
    console.warn('– ignoré', relative);
    return null;
  }
}

function collectStrings(value, out = new Set()) {
  if (typeof value === 'string') out.add(value);
  else if (Array.isArray(value)) value.forEach(v => collectStrings(v, out));
  else if (value && typeof value === 'object') Object.values(value).forEach(v => collectStrings(v, out));
  return out;
}

await download('src/rhvoice-tts.js');
await download('dist/rhvoice.js');
await download('dist/rhvoice.wasm');
const manifestBytes = await download('data/manifest.json');
const manifest = JSON.parse(new TextDecoder().decode(manifestBytes));

// The manifest contains the language/voice data file lists. GitHub Pages deploys
// compressed data, so try both the exact path and its .gz form. Non-file strings
// (voice names, labels, etc.) are simply ignored.
for (const raw of collectStrings(manifest)) {
  if (!raw || /^https?:/i.test(raw) || raw.includes('..')) continue;
  const clean = raw.replace(/^\/+/, '').replace(/^data\//, '');
  if (!/[./]/.test(clean)) continue;
  const exact = await download(`data/${clean}`, true);
  if (!exact && !clean.endsWith('.gz')) await download(`data/${clean}.gz`, true);
}

console.log('\nRHVoice Mia/Mil installé localement dans public/rhvoice.');
console.log('Le navigateur utilisera maintenant cette copie avant la version distante.');
