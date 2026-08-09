// V20.23 — bibliothèque RTL prétraitée : VTT LuxASR stockés dans l'application
(function(){
'use strict';
const VERSION='V20.23';
function sec(s){const p=String(s||'').replace(',','.').split(':').map(Number);return (p[0]||0)*3600+(p[1]||0)*60+(p[2]||0)}
function fmt(t){return Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0')}
function parseVtt(vtt){const out=[];for(const b of String(vtt||'').replace(/\r/g,'').split(/\n\n+/)){const l=b.split('\n').filter(Boolean),i=l.findIndex(x=>x.includes('-->'));if(i<0)continue;const [a,z]=l[i].split('-->').map(x=>x.trim().split(/\s+/)[0]);const text=l.slice(i+1).join(' ').replace(/<[^>]+>/g,'').trim();if(text)out.push({start:sec(a),end:sec(z),text})}return out}
function eid(){const h=document.getElementById('rtlOriginal')?.href||'';return (h.match(/\/r\/(\d+)/)||[])[1]||''}
function esc(s){return String(s).replace(/[&<>]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[m]))}
function renderLines(lines){const box=document.getElementById('rtlTranscript');if(!box)return;box.innerHTML=lines.map(c=>`<div class="rtlLine" data-end="${c.end}"><time>${fmt(c.start)}</time>${esc(c.text)}</div>`).join('')}
async function loadStatic(){const id=eid(),s=document.getElementById('rtlStatus'),btn=document.getElementById('rtlPrepare');if(!id)return false;try{const r=await fetch('./rtl-vtt/'+id+'.vtt?v=1',{cache:'no-store'});if(!r.ok)return false;const lines=parseVtt(await r.text());if(!lines.length)return false;renderLines(lines);localStorage.setItem('sproochentest-rtl-full-vtt-'+id,JSON.stringify(lines));if(s)s.innerHTML='<strong>Journal déjà préparé dans la bibliothèque.</strong> Lance la vidéo : aucun traitement n’est nécessaire sur le téléphone.';if(btn){btn.disabled=true;btn.textContent='Journal déjà prêt'};return true}catch(e){return false}}
function install(){const btn=document.getElementById('rtlPrepare'),s=document.getElementById('rtlStatus');if(!btn)return;setTimeout(async()=>{if(await loadStatic())return;btn.disabled=true;btn.textContent='Préparation automatique en cours';if(s)s.innerHTML='<strong>Ce journal n’est pas encore dans la bibliothèque.</strong> Il sera préparé automatiquement par LuxASR puis enregistré dans l’application. Le bouton d’envoi complet depuis le téléphone a été désactivé car il pouvait échouer avec les gros fichiers.';},100)}
const oldLoad=window.v220Load;window.v220Load=async function(i){if(typeof oldLoad==='function')await oldLoad(i);setTimeout(install,350)};
const oldRender=window.renderNews;window.renderNews=function(){if(typeof oldRender==='function')oldRender();setTimeout(install,100)};
document.querySelectorAll('.brand small').forEach(x=>x.textContent=VERSION+' · bibliothèque RTL prétraitée');document.title='Sproochentest Lëtzebuergesch '+VERSION;
})();