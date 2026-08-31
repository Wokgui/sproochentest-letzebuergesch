import { access, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { books } from '../src/data.js';

const expected={
  renert:'3fbf9fb8f57b283c7dc0fa7fc67cf024e910ef7e',
  dleierchen:'181203fd5938febeefcc8236dd2b3a91509e2eee',
  sigfrid:'ef55d82b4e13d277c980aa11870afd5e5c9f63de'
};
if(books.length!==3) throw new Error(`Bibliothèque: 3 livres attendus, reçu ${books.length}`);
for(const b of books){
  if(expected[b.id]!==b.sha1) throw new Error(`${b.id}: SHA-1 officiel absent ou modifié`);
  if(!/^https:\/\/download\.data\.public\.lu\//.test(b.remote||'')) throw new Error(`${b.id}: URL data.public.lu invalide`);
}
if(new Set(books.map(b=>b.sha1)).size!==books.length) throw new Error('SHA-1 livres dupliqués');
const importer=await readFile(new URL('./import-books.mjs',import.meta.url),'utf8');
for(const b of books) if(!importer.includes(b.sha1)) throw new Error(`${b.id}: import-books.mjs désaligné`);
let bundled=0;
for(const b of books){
  const url=new URL(`..${b.file}`,import.meta.url);
  try{
    await access(url);
    const bytes=await readFile(url),hash=createHash('sha1').update(bytes).digest('hex');
    if(hash!==b.sha1) throw new Error(`${b.id}: texte embarqué présent mais SHA-1 incorrect (${hash})`);
    bundled++;
  }catch(e){
    if(String(e?.message||'').includes('SHA-1 incorrect')) throw e;
  }
}
console.log(`Audit livres: 3 empreintes officielles alignées · ${bundled}/3 textes complets embarqués`);
