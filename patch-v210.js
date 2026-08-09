// V20.10 — navigation fiable + mise à jour PWA automatique
(function(){
'use strict';
function firstIncomplete(){const done=new Set(Array.isArray(state.done)?state.done:[]);for(let i=0;i<lessons.length;i++){if(!done.has(i))return i}return 0}
function openLessonDirect(i){i=Number(i);if(!Number.isInteger(i)||i<0||i>=lessons.length)i=firstIncomplete();activeLesson=i;quizIndex=0;quizScore=0;if(!Array.isArray(state.seen))state.seen=[];for(const w of lessons[i].words){if(!state.seen.includes(w[0]))state.seen.push(w[0])}try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}renderLessonWords();show('lesson')}
window.v210Continue=function(){openLessonDirect(firstIncomplete())};
window.v210Reset=function(){if(!confirm('Tout réinitialiser ? Toute la progression et les révisions seront effacées.'))return;try{for(const k of Object.keys(localStorage)){if(k.startsWith('sproochentest-'))localStorage.removeItem(k)}}catch(e){}state={done:[],seen:[],streak:1};activeLesson=0;quizIndex=0;quizScore=0;try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}renderHome();show('home')};
window.resetV20=window.v210Reset;
window.redoAnyLesson=function(){const s=document.getElementById('v20LessonSelect');openLessonDirect(s?Number(s.value):firstIncomplete())};
const prevHome=window.renderHome;
window.renderHome=function(){prevHome();const next=firstIncomplete();const hero=document.querySelector('#home .v205today');if(hero){const h=hero.querySelector('h2');if(h)h.textContent=`Leçon ${next+1} · ${lessons[next].title}`;const b=hero.querySelector('button.primary');if(b){b.textContent=(state.done||[]).length>=lessons.length?'Revoir le parcours':'Continuer le parcours';b.onclick=window.v210Continue;b.removeAttribute('onclick')}}const c=document.getElementById('continueBtn');if(c){c.onclick=window.v210Continue;c.removeAttribute('onclick')}const reset=document.querySelector('#bottomTools .reset');if(reset){reset.onclick=window.v210Reset;reset.removeAttribute('onclick')}document.querySelectorAll('.brand small').forEach(x=>x.textContent='V20.10 · mise à jour automatique')};
// Intercepte les anciens boutons encore rendus par les patchs précédents.
document.addEventListener('click',function(e){const b=e.target.closest('button');if(!b)return;const t=(b.textContent||'').trim().toLowerCase();if(t.includes('continuer le parcours')){e.preventDefault();e.stopImmediatePropagation();window.v210Continue();return}if(t==='tout réinitialiser'){e.preventDefault();e.stopImmediatePropagation();window.v210Reset();return}},true);
// Mise à jour PWA : vérifier au démarrage et quand l'app revient au premier plan.
if('serviceWorker' in navigator){let reloading=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloading)return;reloading=true;location.reload()});navigator.serviceWorker.ready.then(reg=>{reg.update().catch(()=>{});document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')reg.update().catch(()=>{})})}).catch(()=>{})}
document.title='Sproochentest Lëtzebuergesch V20.10';renderHome();
})();