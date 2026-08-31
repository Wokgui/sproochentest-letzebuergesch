import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const books=[
  {name:'renert.txt',url:'https://download.data.public.lu/resources/the-works-in-luxembourguish-of-michel-rodange/20190414-150411/renert.txt',sha1:'3fbf9fb8f57b283c7dc0fa7fc67cf024e910ef7e'},
  {name:'dleierchen.txt',url:'https://download.data.public.lu/resources/the-works-in-luxembourguish-of-michel-rodange/20190414-194136/dleierchen.txt',sha1:'181203fd5938febeefcc8236dd2b3a91509e2eee'},
  {name:'sigfrid.txt',url:'https://download.data.public.lu/resources/the-works-in-luxembourguish-of-michel-rodange/20190414-150720/sigfrid.txt',sha1:'ef55d82b4e13d277c980aa11870afd5e5c9f63de'}
];

await mkdir('public/books',{recursive:true});
for(const book of books){
  const r=await fetch(book.url);
  if(!r.ok) throw new Error(`${book.name}: HTTP ${r.status}`);
  const bytes=Buffer.from(await r.arrayBuffer());
  const hash=createHash('sha1').update(bytes).digest('hex');
  if(hash!==book.sha1) throw new Error(`${book.name}: empreinte inattendue (${hash})`);
  await writeFile(`public/books/${book.name}`,bytes);
  console.log(`✓ ${book.name} · ${(bytes.length/1024).toFixed(1)} Ko · SHA-1 vérifié`);
}
