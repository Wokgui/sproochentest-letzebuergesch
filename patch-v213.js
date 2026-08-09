// V20.13 — prononciation du vocabulaire et écoutes propres à chaque leçon
(function(){
'use strict';
const VERSION='V20.13';
const phraseBank={};
let spokenAudio=null;

function speakWithDevice(text,button,status){
  if(!('speechSynthesis' in window)||typeof SpeechSynthesisUtterance==='undefined'){
    if(status)status.textContent='Prononciation indisponible sur cet appareil.';
    if(button)button.textContent='🔊';
    return;
  }
  speechSynthesis.cancel();
  const utterance=new SpeechSynthesisUtterance(text);
  utterance.lang='lb-LU';
  utterance.rate=.82;
  utterance.onstart=()=>{if(button)button.textContent='🔊 Lecture…';if(status)status.textContent='Prononciation du téléphone'};
  utterance.onend=()=>{if(button)button.textContent=button.classList.contains('v213icon')?'🔊':'▶ Réécouter'};
  utterance.onerror=()=>{if(button)button.textContent='Réessayer';if(status)status.textContent='La lecture a échoué.'};
  speechSynthesis.speak(utterance);
}

window.v213Speak=async function(text,button,status){
  const phrase=String(text||'').trim();
  if(!phrase)return;
  if(button)button.textContent='…';
  const isWord=!phrase.includes(' ');
  if(isWord&&typeof window.resolveAudio==='function'){
    try{
      const url=await window.resolveAudio(phrase);
      if(url){
        spokenAudio?.pause();spokenAudio=new Audio(url);
        spokenAudio.onplay=()=>{if(button)button.textContent='🔊 Lecture…';if(status)status.textContent='Voix humaine'};
        spokenAudio.onended=()=>{if(button)button.textContent=button.classList.contains('v213icon')?'🔊':'▶ Réécouter'};
        await spokenAudio.play();return;
      }
    }catch(error){}
  }
  speakWithDevice(phrase,button,status);
};

function shuffledChoices(correct,pool){
  const values=[correct,...pool.filter(x=>x&&x!==correct)].filter((x,i,a)=>a.indexOf(x)===i).slice(0,3);
  for(let i=values.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[values[i],values[j]]=[values[j],values[i]]}
  return {opts:values,a:values.indexOf(correct)};
}

window.v213BuildListening=function(index){
  const lesson=lessons[index];
  const phrases=phraseBank[index]||[];
  const sources=[...phrases.slice(0,2),...lesson.words.map(w=>({lu:w[0],fr:w[1]}))];
  const translations=[...phrases.map(x=>x.fr),...lesson.words.map(w=>w[1])];
  return sources.slice(0,3).map(item=>{
    const choice=shuffledChoices(item.fr,translations);
    return {speech:item.lu,lu:item.lu,fr:item.fr,q:'Que signifie ce que tu entends ?',opts:choice.opts,a:choice.a};
  });
};

const previousLessonWords=window.renderLessonWords;
window.renderLessonWords=function(){
  previousLessonWords();
  const host=document.getElementById('lessonContent');
  if(!host)return;
  host.querySelectorAll('.word').forEach((row,i)=>{
    const button=row.querySelector('.audioBtn');
    const status=row.querySelector('.audioStatus');
    const word=lessons[activeLesson].words[i]?.[0];
    if(button&&word){button.textContent='🔊 Écouter';button.removeAttribute('onclick');button.onclick=()=>window.v213Speak(word,button,status)}
    if(status)status.textContent='Voix humaine si disponible, sinon téléphone';
  });
  const pairs=[];
  host.querySelectorAll('.v206phrase').forEach(row=>{
    const lu=row.querySelector('.lu')?.textContent.trim();
    const fr=row.querySelector('.fr')?.textContent.trim();
    if(!lu||!fr)return;
    pairs.push({lu,fr});
    const button=document.createElement('button');button.className='v213icon';button.type='button';button.textContent='🔊';button.title='Écouter la phrase';button.setAttribute('aria-label','Écouter la phrase');button.onclick=()=>window.v213Speak(lu,button);row.appendChild(button);
  });
  phraseBank[activeLesson]=pairs;
};

const style=document.createElement('style');
style.textContent='.v206phrase{position:relative;padding-right:48px}.v213icon{position:absolute;right:4px;top:50%;transform:translateY(-50%);width:38px;height:38px;border-radius:12px;background:var(--blue2);color:var(--blue);font-size:17px}.v213icon:focus-visible{outline:3px solid #8fc8f5;outline-offset:2px}';
document.head.appendChild(style);
const previousHome=window.renderHome;
window.renderHome=function(){previousHome();document.querySelectorAll('.brand small').forEach(x=>x.textContent=VERSION+' · audio lié aux leçons')};
document.title='Sproochentest Lëtzebuergesch '+VERSION;
window.renderHome();
})();
