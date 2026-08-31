import { access } from 'node:fs/promises';
import { lessons, glossary, books, oralTopics, photoScenes, listening } from '../src/data.js';

const norm = s => s.toLocaleLowerCase('lb-LU').normalize('NFC').replace(/[’]/g, "'");
const errors = [];
const warnings = [];

const aliases={ass:'sinn',war:'sinn',wier:'sinn',sinn:'sinn',ginn:'goen',gi:'goen',geet:'goen',gaangen:'goen',huet:'hunn',hu:'hunn',hätt:'hunn',hat:'hunn',haten:'hunn',kënnt:'kommen',komme:'kommen',koum:'kommen',gefuer:'fueren',fiert:'fueren',léiere:'léieren',lernt:'léieren',schwätze:'schwätzen',geschwat:'schwätzen',héiert:'héieren',lauschteren:'héieren',gesäit:'gesinn',gesinn:'gesinn',kaafen:'kafen',kaaft:'kafen',bezuelen:'bezuelen',bezuelt:'bezuelen',waart:'waarden',drénke:'drénken',gedronk:'drénken',iesse:'iessen',giess:'iessen',trefft:'treffen',getraff:'treffen',wunnt:'wunnen',hëlt:'huelen',geholl:'huelen',maacht:'maachen',gemaach:'maachen',schafft:'schaffen',bleift:'bleiwen',bliwwen:'bleiwen',brauch:'brauchen',braucht:'brauchen',kann:'kënnen',kënnen:'kënnen',muss:'mussen',missten:'mussen',wëll:'wëllen',wëlle:'wëllen',soll:'sollen',seet:'soen',äntwert:'äntweren',schreiwen:'schreiwen',läit:'leien',steet:'stoen',gëtt:'ginn_aux',gouf:'ginn_aux',ënnerschriwwen:'ënnerschreiwen',gewues:'wuessen',gewuess:'wuessen',kascht:'kaschten',benotzt:'benotzen',gëllt:'gëllen',kritt:'kréien',befestegte:'befestegt',stellt:'stellen',wollt:'wëllen',ukomm:'kommen',nächsten:'nächst',waarde:'waarden',missen:'mussen',konnt:'kënnen',schéngt:'schéngen',wëlle:'wëllen',fänkt:'ufänken',verstinn:'verstoen',erkläert:'erklären',agezunn:'anzéien',zesumme:'zesummen',nopere:'noper',probéiert:'probéieren',gemierkt:'mierken',seet:'soen'};
const wordTokens=text=>(text.match(/\p{L}+(?:['’\-]\p{L}+)*/gu)||[]);
let tokenTotal=0,tokenKnown=0;
for(const lesson of lessons)for(const sentence of lesson.sentences||[])for(const raw of wordTokens(sentence.lb)){tokenTotal++;const id=norm(raw);let ok=Boolean(glossary[id]);if(!ok&&id.startsWith("d'")){const base=id.slice(2);ok=Boolean(glossary[base]||(aliases[base]&&glossary[aliases[base]]));}if(!ok&&aliases[id])ok=Boolean(glossary[aliases[id]]);if(ok)tokenKnown++;}


let automaticQuizTotal=0, automaticQuizMin=Infinity, automaticQuizMax=0;
for (const lesson of lessons) {
  const uniqueKeys=[...new Set((lesson.sentences||[]).flatMap(s=>(s.keys||[]).map(norm)).filter(k=>glossary[k]))];
  const vocab=Math.min(3,uniqueKeys.length);
  let cloze=0;
  for(const sentence of lesson.sentences||[]){
    const sentenceIds=new Set(wordTokens(sentence.lb).map(raw=>{const id=norm(raw);return aliases[id]||id;}));
    if(uniqueKeys.slice(0,3).some(k=>sentenceIds.has(k)))cloze++;
    if(cloze>=2)break;
  }
  const total=(lesson.quiz?.length||0)+vocab+cloze;
  automaticQuizTotal+=total;
  automaticQuizMin=Math.min(automaticQuizMin,total);
  automaticQuizMax=Math.max(automaticQuizMax,total);
}
for (const lesson of lessons) {
  if (!lesson.id || !lesson.level || !lesson.title) errors.push(`Leçon incomplète: ${lesson.id || '?'}`);
  if (!lesson.sentences?.length) errors.push(`${lesson.id}: aucune phrase`);
  if (!lesson.quiz?.length) warnings.push(`${lesson.id}: aucun quiz`);
  if (!lesson.grammar?.length) warnings.push(`${lesson.id}: aucune grammaire`);
  try { await access(new URL(`../covers/${lesson.cover}.svg`, import.meta.url)); }
  catch { errors.push(`${lesson.id}: couverture manquante (${lesson.cover})`); }
  for (const sentence of lesson.sentences || []) {
    for (const key of sentence.keys || []) {
      if (!glossary[norm(key)]) errors.push(`${lesson.id}: glossaire manquant pour « ${key} »`);
    }
  }
}

console.log(`Histoires: ${lessons.length} (A1 ${lessons.filter(x=>x.level==='A1').length}, A2 ${lessons.filter(x=>x.level==='A2').length}, B1 ${lessons.filter(x=>x.level==='B1').length})`);
console.log(`Entrées dictionnaire: ${Object.keys(glossary).length}`);
console.log(`Couverture dictionnaire du corpus: ${tokenKnown}/${tokenTotal} (${(tokenKnown/tokenTotal*100).toFixed(1)}%)`);
console.log(`Livres configurés: ${books.length}`);
console.log(`Sproochentest: ${oralTopics.length} thèmes A2, ${photoScenes.length} scènes, ${listening.length} écoutes / ${listening.reduce((n,x)=>n+x.questions.length,0)} questions B1`);
if(oralTopics.length<8) errors.push('Sproochentest: banque orale trop petite');
if(photoScenes.length<12) errors.push('Sproochentest: moins de 12 visuels');
const sceneIds=new Set();for(const scene of photoScenes){if(!scene.id||sceneIds.has(scene.id))errors.push(`Sproochentest: identifiant visuel invalide ou dupliqué (${scene.id||'?'})`);sceneIds.add(scene.id);if(!scene.title||!scene.image)errors.push(`Sproochentest: visuel incomplet (${scene.id||'?'})`);}
const oralIds=new Set();for(const topic of oralTopics){if(!topic.id||oralIds.has(topic.id))errors.push(`Sproochentest: thème oral dupliqué (${topic.id||'?'})`);oralIds.add(topic.id);if(!Array.isArray(topic.questions)||topic.questions.length<5)errors.push(`Sproochentest: thème oral trop pauvre (${topic.id||'?'})`);}
for(const scene of photoScenes){try{await access(new URL(`..${scene.image}`,import.meta.url));}catch{errors.push(`Sproochentest: visuel manquant (${scene.id})`);}}
const listeningIds=new Set(),questionKeys=new Set(),setParts=new Set();
for(const ex of listening){
  if(!ex.id||listeningIds.has(ex.id))errors.push(`Sproochentest: écoute ID dupliqué (${ex.id||'?'})`);listeningIds.add(ex.id);
  const sp=`${ex.set||'m1'}|${ex.part}`;if(setParts.has(sp))errors.push(`Sproochentest: partie dupliquée (${sp})`);setParts.add(sp);
  if(!ex.title||!ex.text||ex.text.trim().length<120)errors.push(`${ex.id}: contenu audio trop court ou incomplet`);
  for(const [i,q] of ex.questions.entries()){
    if(!q.question?.trim())errors.push(`${ex.id}: question vide Q${i+1}`);
    const qk=q.question?.trim().toLocaleLowerCase('fr-FR');if(qk&&questionKeys.has(qk))errors.push(`${ex.id}: question dupliquée Q${i+1}`);if(qk)questionKeys.add(qk);
    if(!Array.isArray(q.answers)||q.answers.length<2)errors.push(`${ex.id}: réponses manquantes Q${i+1}`);
    else if(new Set(q.answers.map(a=>String(a).trim().toLocaleLowerCase('fr-FR'))).size!==q.answers.length)errors.push(`${ex.id}: réponses dupliquées Q${i+1}`);
    if(!Number.isInteger(q.correct)||q.correct<0||q.correct>=q.answers.length)errors.push(`${ex.id}: correction invalide Q${i+1}`);
  }
}
const listeningSets=[...new Set(listening.map(x=>x.set||'m1'))];
if(listeningSets.length<3) errors.push('Sproochentest: moins de 3 modèles B1');
for(const set of listeningSets){const parts=listening.filter(x=>(x.set||'m1')===set).sort((a,b)=>a.part-b.part),counts=parts.map(x=>x.questions.length),partNos=parts.map(x=>x.part);if(parts.length!==3||partNos.join(',')!=='1,2,3'||counts.join(',')!=='5,4,7')errors.push(`Sproochentest: ${set} doit contenir les parties 1/2/3 avec 5 + 4 + 7 questions`);if(parts.reduce((n,x)=>n+x.questions.length,0)!==16)errors.push(`Sproochentest: ${set} doit contenir 16 questions`);}
const expectedListeningKinds={1:'radio',2:'conversation',3:'presentation'};for(const ex of listening){if(ex.kind!==expectedListeningKinds[ex.part])errors.push(`Sproochentest: ${ex.id} type ${ex.kind||'?'} incompatible avec la partie ${ex.part}`);}
console.log(`Quiz enrichis: ${automaticQuizTotal} questions au total (${automaticQuizMin}-${automaticQuizMax} par histoire)`);
if (warnings.length) console.log(`Avertissements: ${warnings.length}\n- ${warnings.join('\n- ')}`);
if (errors.length) {
  console.error(`Erreurs: ${errors.length}\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log('Audit OK');
