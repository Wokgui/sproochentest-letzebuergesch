import { lessons, oralTopics, photoScenes, listening } from '../src/data.js';

const errors=[];
const warnings=[];
const terminal=/[.!?…]$/u;
const noDoubleSpace=s=>! /\s{2,}/u.test(String(s));
const noStraightApostrophe=s=>! String(s).includes("'");

function checkText(label,text,{question=false,terminalRequired=true}={}){
  const s=String(text||'').trim();
  if(!s) errors.push(`${label}: texte vide`);
  if(!noDoubleSpace(s)) errors.push(`${label}: espaces doublés`);
  if(!noStraightApostrophe(s)) errors.push(`${label}: apostrophe droite détectée`);
  if(terminalRequired && s && !terminal.test(s)) errors.push(`${label}: ponctuation finale manquante`);
  if(question && s && !s.endsWith('?')) errors.push(`${label}: question sans point d’interrogation`);
}

for(const lesson of lessons){
  const seen=new Set();
  for(const [i,s] of (lesson.sentences||[]).entries()){
    checkText(`${lesson.id} phrase ${i+1} LB`,s.lb);
    checkText(`${lesson.id} phrase ${i+1} FR`,s.fr);
    const key=s.lb.trim().toLocaleLowerCase('lb-LU');
    if(seen.has(key)) errors.push(`${lesson.id}: phrase luxembourgeoise dupliquée (${i+1})`);
    seen.add(key);
  }
  for(const [i,q] of (lesson.quiz||[]).entries()){
    checkText(`${lesson.id} quiz ${i+1}`,q.question,{question:true});
    for(const [j,a] of (q.answers||[]).entries()) checkText(`${lesson.id} quiz ${i+1} réponse ${j+1}`,a,{terminalRequired:false});
  }
  for(const [i,g] of (lesson.grammar||[]).entries()){
    if(!Array.isArray(g)||g.length<2||!String(g[0]).trim()||!String(g[1]).trim()) errors.push(`${lesson.id}: règle de grammaire ${i+1} incomplète`);
  }
}

for(const topic of oralTopics){
  const seen=new Set();
  for(const [i,q] of (topic.questions||[]).entries()){
    checkText(`oral ${topic.id} Q${i+1}`,q,{question:true});
    const k=q.trim().toLocaleLowerCase('lb-LU');
    if(seen.has(k)) errors.push(`oral ${topic.id}: question dupliquée`);
    seen.add(k);
  }
}

for(const scene of photoScenes){
  const seen=new Set();
  for(const [i,q] of (scene.prompts||[]).entries()){
    checkText(`visuel ${scene.id} Q${i+1}`,q,{question:true});
    const k=q.trim().toLocaleLowerCase('lb-LU');
    if(seen.has(k)) errors.push(`visuel ${scene.id}: question dupliquée`);
    seen.add(k);
  }
}

const expectedKind={1:'radio',2:'conversation',3:'presentation'};
for(const ex of listening){
  checkText(`${ex.id} titre`,ex.title,{terminalRequired:false});
  checkText(`${ex.id} texte`,ex.text);
  if(ex.kind!==expectedKind[ex.part]) errors.push(`${ex.id}: type attendu ${expectedKind[ex.part]}, reçu ${ex.kind||'absent'}`);
  if(ex.part===2 && !ex.text.includes('?')) warnings.push(`${ex.id}: conversation sans question explicite`);
  for(const [i,q] of ex.questions.entries()){
    checkText(`${ex.id} Q${i+1}`,q.question,{question:true});
    for(const [j,a] of q.answers.entries()) checkText(`${ex.id} Q${i+1} réponse ${j+1}`,a,{terminalRequired:false});
  }
}

// Régressions linguistiques déjà corrigées en v2.4.
const allLb=[
  ...lessons.flatMap(l=>[l.title,...l.sentences.map(s=>s.lb),...l.quiz.flatMap(q=>[q.question,...q.answers])]),
  ...oralTopics.flatMap(t=>[t.title,...t.questions,...(t.starters||[])]),
  ...photoScenes.flatMap(s=>[s.title,...s.prompts]),
  ...listening.flatMap(x=>[x.title,x.text,...x.questions.flatMap(q=>[q.question,...q.answers])])
].join('\n');
const forbidden=[
  'ginn et vill Geleeënheeten',
  'Et ginn Attraktiounen',
  'Et gi vill Fielsen',
  'ginn et heiansdo Verspéidungen',
  'Mëschung vun deenen zwee',
  'neie Resident',
  'Hien freet vill',
  'De Moie bleift d’Schwämm normal',
  'am Beschten'
];
for(const phrase of forbidden) if(allLb.includes(phrase)) errors.push(`Régression linguistique détectée: « ${phrase} »`);

console.log(`Audit linguistique: ${lessons.length} histoires, ${oralTopics.length} thèmes oraux, ${photoScenes.length} visuels, ${listening.length} textes B1.`);
if(warnings.length) console.log(`Avertissements linguistiques: ${warnings.length}\n- ${warnings.join('\n- ')}`);
if(errors.length){console.error(`Erreurs linguistiques: ${errors.length}\n- ${errors.join('\n- ')}`);process.exit(1);}
console.log('Audit linguistique OK');
