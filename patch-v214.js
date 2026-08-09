// V20.14 — audio humain uniquement, sans synthèse vocale
(function(){
'use strict';
const VERSION='V20.14';
const key=text=>String(text||'').trim().toLocaleLowerCase('lb-LU').replace(/[.,!?;:…]/g,'').replace(/\s+/g,' ');
const humanPhrases=new Map([
 ['moien, wéi geet et?','https://lod.lu/uploads/examples/OGG/f2/f20e0cdaccb6c76c06f8720ac34ac7a9.ogg'],
 ['moien, madamm, wat kann ech fir iech maachen?','https://lod.lu/uploads/examples/OGG/9b/9bb3ff56b0168aa51fe1737239761208.ogg'],
 ['salut, ech ginn elo heem!','https://lod.lu/uploads/examples/OGG/92/926b1dbd7e2c5081e03a3a1a229605d8.ogg'],
 ['ech wunnen zu eech','https://lod.lu/uploads/examples/OGG/57/5708aa802f9771f2a431a9310f609b90.ogg'],
 ['fiert dëse bus op eech?','https://lod.lu/uploads/examples/OGG/7a/7af2674e596a6c81e13aa53e3bfd8a89.ogg'],
 ['déi nei buslinn fiert vun der gare op de flughafen','https://lod.lu/uploads/examples/OGG/99/993dc701e65f000216eed16a3d7b4dc0.ogg'],
 ['mir hunn eng taass kaffi gedronk','https://lod.lu/uploads/examples/OGG/bd/bd64bfea677c6f9acc314b9fd4ed0cb2.ogg'],
 ['hien drénkt nëmme schwaarze kaffi','https://lod.lu/uploads/examples/OGG/4c/4c4f9a38005924e30b5af0572dc95d29.ogg'],
 ['bestell eis nach zwee kaffien!','https://lod.lu/uploads/examples/OGG/60/60400894c0e61156c798c8843ae929d8.ogg'],
 ['ech maachen all dag no der aarbecht sport','https://lod.lu/uploads/examples/OGG/13/13de89caafec442213caf9dfeef11f25.ogg'],
 ['ech fueren all dag dee selwechte wee op d\'aarbecht','https://lod.lu/uploads/examples/OGG/87/8752beb7371d16d43964e9a7f9734d35.ogg'],
 ['ech maache reegelméisseg sport, fir a form ze bleiwen','https://lod.lu/uploads/examples/OGG/fe/fe0f05cac51195df10d8abdbebeeb928.ogg'],
 ['wa schéint wieder ass, si vill cyclisten op der strooss','https://lod.lu/uploads/examples/OGG/fe/fef9b02ea8a96664cdf7fb8ace799f71.ogg'],
 ["maach de radio méi haart, ech wëll d'wieder lauschteren!",'https://lod.lu/uploads/examples/OGG/32/326d946b134d79ed507e0984cef18ad4.ogg'],
 ['am autobus sinn nach sëtzplaze fräi','https://lod.lu/uploads/examples/OGG/5e/5e89147416f5f194d1231df26ec7d19c.ogg']
].map(([text,url])=>[key(text),url]));
let player=null;
const phraseUrl=text=>humanPhrases.get(key(text))||null;

async function findHumanUrl(text){
 const direct=phraseUrl(text);if(direct)return direct;
 const value=String(text||'').trim();
 if(!value.includes(' ')&&typeof window.resolveAudio==='function'){
  try{return await window.resolveAudio(value)}catch(error){return null}
 }
 return null;
}

window.v213Speak=async function(text,button,status){
 if(button){button.disabled=true;button.textContent='Recherche…'}
 if(status)status.textContent='Recherche d’un enregistrement humain…';
 const url=await findHumanUrl(text);
 if(!url){
  if(button){button.disabled=false;button.textContent=button.classList.contains('v213icon')?'🔇':'Audio indisponible'}
  if(status)status.textContent='Aucun enregistrement humain disponible pour le moment.';
  return;
 }
 try{
  player?.pause();player=new Audio(url);
  player.onplay=()=>{if(button)button.textContent='🔊 Lecture…';if(status)status.textContent='Voix humaine'};
  player.onended=()=>{if(button){button.disabled=false;button.textContent=button.classList.contains('v213icon')?'🔊':'▶ Réécouter'}};
  player.onerror=()=>{if(button){button.disabled=false;button.textContent='Réessayer'}if(status)status.textContent='Impossible de charger cet enregistrement.'};
  await player.play();
 }catch(error){if(button){button.disabled=false;button.textContent='Réessayer'}if(status)status.textContent='Impossible de lire cet enregistrement.'}
};

function choices(correct,pool){
 const values=[correct,...pool.filter(x=>x&&x!==correct)].filter((x,i,a)=>a.indexOf(x)===i).slice(0,3);
 for(let i=values.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[values[i],values[j]]=[values[j],values[i]]}
 return {opts:values,a:values.indexOf(correct)};
}

window.v213BuildListening=function(index){
 const lesson=lessons[index];
 const phraseRows=[...document.querySelectorAll('#lessonContent .v206phrase')].map(row=>({lu:row.querySelector('.lu')?.textContent.trim(),fr:row.querySelector('.fr')?.textContent.trim()})).filter(x=>x.lu&&x.fr&&phraseUrl(x.lu));
 const wordRows=lesson.words.map(w=>({lu:w[0],fr:w[1]}));
 const sources=[...phraseRows,...wordRows].slice(0,3);
 const translations=[...phraseRows.map(x=>x.fr),...wordRows.map(x=>x.fr)];
 return sources.map(item=>{const c=choices(item.fr,translations);return{speech:item.lu,lu:item.lu,fr:item.fr,q:'Que signifie ce que tu entends ?',opts:c.opts,a:c.a}});
};

const previousLessonWords=window.renderLessonWords;
window.renderLessonWords=function(){
 previousLessonWords();
 document.querySelectorAll('#lessonContent .audioStatus').forEach(x=>x.textContent='Enregistrement humain uniquement');
 document.querySelectorAll('#lessonContent .v206phrase').forEach(row=>{
  const text=row.querySelector('.lu')?.textContent.trim();const button=row.querySelector('.v213icon');if(!button)return;
  if(!phraseUrl(text)){button.disabled=true;button.textContent='🔇';button.title='Enregistrement humain à ajouter';button.setAttribute('aria-label','Enregistrement humain à ajouter')}
 });
};

const previousHome=window.renderHome;
window.renderHome=function(){previousHome();document.querySelectorAll('.brand small').forEach(x=>x.textContent=VERSION+' · voix humaines uniquement')};
document.title='Sproochentest Lëtzebuergesch '+VERSION;
window.renderHome();
})();
