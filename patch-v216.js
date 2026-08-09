// V20.21 — synchronisation visuelle LU avec les sous-titres français RTL
(function(){
'use strict';
const VERSION='V20.21';
let syncOffset=Number(localStorage.getItem('rtl-lu-sync-offset')||0);
const css=document.createElement('style');
css.textContent=`
.rtlLuSub{top:auto!important;bottom:18%!important;left:3%!important;right:3%!important;background:rgba(0,0,0,.72)!important;font-size:clamp(16px,4.2vw,23px)!important;padding:6px 9px!important}
.rtlSync{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:9px}.rtlSync button{padding:8px 10px;border:1px solid var(--line);border-radius:10px;background:#fff;font-weight:800}.rtlSync span{font-size:12px;color:var(--muted);font-weight:700}
`;
document.head.appendChild(css);
function parseTime(s){const p=String(s||'0:00').split(':').map(Number);return p.length===2?p[0]*60+p[1]:((p[0]||0)*3600+(p[1]||0)*60+(p[2]||0));}
function getLines(){const box=document.getElementById('rtlTranscript');if(!box)return[];return [...box.querySelectorAll('.rtlLine')].map(el=>{const tm=el.querySelector('time');const start=parseTime(tm?.textContent);const text=el.textContent.replace(tm?.textContent||'','').trim();return{start,text};}).filter(x=>x.text).sort((a,b)=>a.start-b.start);}
function installSync(){const v=document.getElementById('rtlVideo'),sub=document.getElementById('rtlLuSub'),status=document.getElementById('rtlStatus');if(!v||!sub)return;
 let lines=getLines();
 const rebuild=()=>{lines=getLines();};
 const obs=new MutationObserver(rebuild);const tr=document.getElementById('rtlTranscript');if(tr)obs.observe(tr,{childList:true,subtree:true,characterData:true});
 const draw=()=>{if(!lines.length)return;const t=v.currentTime+syncOffset;let idx=-1;for(let i=0;i<lines.length;i++){if(lines[i].start<=t)idx=i;else break;}if(idx<0){sub.textContent='';return;}const next=lines[idx+1]?.start??(lines[idx].start+7);sub.textContent=t<next+0.15?lines[idx].text:'';};
 v.addEventListener('timeupdate',draw);v.addEventListener('seeked',draw);v.addEventListener('play',draw);
 const holder=document.createElement('div');holder.className='rtlSync';holder.innerHTML='<button id="luEarlier">LU plus tôt</button><button id="luLater">LU plus tard</button><button id="luReset">0 s</button><span id="luOffset"></span>';
 status?.insertAdjacentElement('beforebegin',holder);
 const label=()=>{const e=document.getElementById('luOffset');if(e)e.textContent='Décalage LU : '+(syncOffset>=0?'+':'')+syncOffset.toFixed(1)+' s';};
 document.getElementById('luEarlier').onclick=()=>{syncOffset+=0.5;localStorage.setItem('rtl-lu-sync-offset',syncOffset);label();draw();};
 document.getElementById('luLater').onclick=()=>{syncOffset-=0.5;localStorage.setItem('rtl-lu-sync-offset',syncOffset);label();draw();};
 document.getElementById('luReset').onclick=()=>{syncOffset=0;localStorage.setItem('rtl-lu-sync-offset','0');label();draw();};
 label();
}
const oldRender=window.renderNews;
window.renderNews=function(){if(typeof oldRender==='function')oldRender();setTimeout(installSync,0);};
document.querySelectorAll('.brand small').forEach(x=>x.textContent=VERSION+' · RTL LU/FR synchronisés');document.title='Sproochentest Lëtzebuergesch '+VERSION;
})();