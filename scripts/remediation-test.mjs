import fs from 'node:fs';
import { listening } from '../src/data.js';
const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const state=fs.readFileSync(new URL('../src/state.js',import.meta.url),'utf8');
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));
const must=(ok,msg)=>{if(!ok)throw new Error(msg)};
must(pkg.version==='3.3.0','package v3.3 attendu');
must(listening.length===9,'9 parties B1 attendues');
for(const ex of listening){
  must(Array.isArray(ex.evidence),'evidence absente '+ex.id);
  must(ex.evidence.length===ex.questions.length,'evidence/questions incohérentes '+ex.id);
  const sentences=String(ex.text).split(/(?<=[.!?])\s+/).map(x=>x.trim()).filter(Boolean);
  ex.evidence.forEach((n,i)=>must(Number.isInteger(n)&&n>=0&&n<sentences.length,`evidence invalide ${ex.id} q${i+1}`));
}
must(app.includes('function recordListeningResults('),'enregistrement erreurs écoute absent');
must(app.includes('function renderRemediation()'),'écran remédiation absent');
must(app.includes("source:'listening'"),'source écoute non enregistrée');
must(app.includes('recordListeningResults(ex,listen.model'),'erreurs strictes non transférées au bilan');
must(state.includes('STATE_SCHEMA_VERSION = 12'),'schéma 12 absent');
must(state.includes('remediationHistory'),'historique remédiation absent');
console.log('Remediation test OK');
