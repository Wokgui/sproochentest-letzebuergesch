// V20.17 — RTL : vidéo FR RTL + sous-titres luxembourgeois générés gratuitement dans le navigateur
(function(){
'use strict';
const VERSION='V20.17';
const RTL_FR='https://play.rtl.lu/shows/fr/journal/episodes';
const VOCAB_KEY='sproochentest-rtl-vocab-v1';
const episodes=[
 {date:'07/08/2026',duration:'22 min 42 s',url:'https://play.rtl.lu/shows/fr/journal/episodes/r/3469221'},
 {date:'06/08/2026',duration:'18 min 01 s',url:'https://play.rtl.lu/shows/fr/journal/episodes/r/3469187'},
 {date:'05/08/2026',duration:'18 min 54 s',url:'https://play.rtl.lu/shows/fr/journal/episodes/r/3469107'}
];
let selected=null,chunks=[],transcriber=null,busy=false;
const css=document.createElement('style');
css.textContent=`
.rtlEp{padding:14px;border:1px solid var(--line);border-radius:15px;margin:9px 0;background:#fff;cursor:pointer}.rtlEp.active{border-color:#67aee7;background:#f3f9ff}.rtlEp b{display:block}.rtlEp small{color:var(--muted)}.rtlPlayer{position:relative;border-radius:16px;overflow:hidden;background:#000;margin-top:12px}.rtlPlayer video{display:block;width:100%;max-height:64vh;background:#000}.rtlLuSub{position:absolute;left:4%;right:4%;top:6%;z-index:4;text-align:center;color:#fff;font-size:clamp(17px,4.5vw,25px);font-weight:900;line-height:1.25;text-shadow:0 2px 5px #000,0 0 8px #000;background:#0008;border-radius:10px;padding:7px 10px;pointer-events:none}.rtlActions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.rtlActions button,.rtlActions a{padding:10px 12px;border-radius:12px;background:var(--blue2);color:#115c9f;font-weight:800;text-decoration:none}.rtlActions .go{background:var(--blue);color:#fff}.rtlStatus{margin-top:9px;padding:10px 12px;border-radius:12px;background:#f4f6f9;color:var(--muted);font-size:13px;line-height:1.4}.rtlStatus strong{color:var(--ink)}.rtlProgress{height:8px;background:#e5eaf1;border-radius:99px;overflow:hidden;margin-top:8px}.rtlProgress span{display:block;height:100%;background:var(--blue);width:0%}.rtlTranscript{max-height:230px;overflow:auto;margin-top:10px}.rtlLine{padding:9px 0;border-bottom:1px solid var(--line);font-size:14px;line-height:1.35}.rtlLine time{color:var(--muted);font-size:11px;margin-right:7px}.rtlVocab{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px}.rtlWord{padding:8px 10px;border-radius:11px;background:#f1f5f9;border:1px solid var(--line);font-weight:750}.rtlWord.saved{background:var(--green2);color:var(--green)}
`;
document.head.appendChild(css);
function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function status(text,pct){const s=document.getElementById('rtlStatus');if(s)s.innerHTML=text+(pct==null?'':`<div class="rtlProgress"><span style="width:${pct}%"></span></div>`)}
function pick360(media){return media.find(x=>/360p\.mp4/i.test(x))||media.find(x=>/480p\.mp4/i.test(x))||media.find(x=>/\.mp4/i.test(x))||media.find(x=>/\.m3u8/i.test(x))}
async function loadEpisode(i){
 selected=episodes[i];chunks=[];document.querySelectorAll('.rtlEp').forEach((e,j)=>e.classList.toggle('active',j===i));
 status('<strong>Chargement de la vidéo RTL…</strong>',8);
 try{const r=await fetch('/api/rtl-meta?url='+encodeURIComponent(selected.url));const data=await r.json();if(!r.ok||!data.ok)throw new Error(data.error||'RTL indisponible');const media=pick360(data.media||[]);if(!media)throw new Error('Flux vidéo introuvable');const v=document.getElementById('rtlVideo');v.src=media;v.load();document.getElementById('rtlOriginal').href=selected.url;document.getElementById('rtlTitle').textContent='Journal du '+selected.date;document.getElementById('rtlLuSub').textContent='';document.getElementById('rtlTranscript').innerHTML='';document.getElementById('rtlVocab').innerHTML='';status('Vidéo prête. Le français est déjà incrusté par RTL. Appuie sur <strong>Générer les sous-titres LU</strong> pour ajouter le luxembourgeois.',100)}catch(e){status('<strong>Erreur :</strong> '+esc(e.message))}
}
async function audio16k(url){
 status('<strong>Téléchargement audio/vidéo pour transcription locale…</strong>',12);
 const r=await fetch(url);if(!r.ok)throw new Error('Téléchargement RTL impossible ('+r.status+')');
 const buf=await r.arrayBuffer();status('<strong>Décodage de l’audio…</strong>',28);
 const C=window.AudioContext||window.webkitAudioContext;const ctx=new C();const decoded=await ctx.decodeAudioData(buf.slice(0));
 const len=Math.ceil(decoded.duration*16000);const off=new OfflineAudioContext(1,len,16000);const src=off.createBufferSource();src.buffer=decoded;src.connect(off.destination);src.start();const rendered=await off.startRendering();await ctx.close();return rendered.getChannelData(0).slice();
}
async function getTranscriber(){
 if(transcriber)return transcriber;
 status('<strong>Premier lancement : téléchargement du modèle Whisper gratuit…</strong><br>Il reste ensuite en cache dans le navigateur.',35);
 const mod=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1');
 mod.env.allowLocalModels=false;
 transcriber=await mod.pipeline('automatic-speech-recognition','Xenova/whisper-tiny');
 return transcriber;
}
function normalizeChunks(out){
 const cs=(out&&out.chunks)||[];return cs.map(c=>{let a=0,b=0;if(Array.isArray(c.timestamp)){a=Number(c.timestamp[0]||0);b=Number(c.timestamp[1]||a+4)}return{start:a,end:Number.isFinite(b)?b:a+4,text:String(c.text||'').trim()}}).filter(x=>x.text)
}
function renderTranscript(){const box=document.getElementById('rtlTranscript');box.innerHTML=chunks.map(c=>`<div class="rtlLine"><time>${Math.floor(c.start/60)}:${String(Math.floor(c.start%60)).padStart(2,'0')}</time>${esc(c.text)}</div>`).join('');buildVocab(chunks.map(x=>x.text).join(' '))}
function buildVocab(text){const stop=new Set('déi deen den dem der an am op um vun fir mat ass sinn war waren huet hunn gëtt ginn sech net och nach wéi wat wou wien wann well do hei elo haut méi ganz vill dës dëst een eng engem enger zu ze bei no vir iwwer ënner oder mee mä als dass ech du hien hatt mir dir eis iech'.split(' '));const m=new Map();(text.toLowerCase().match(/[a-zà-ÿäëéèêöüß’'-]{4,}/gi)||[]).forEach(w=>{w=w.replace(/[’'-]+$/,'');if(!stop.has(w))m.set(w,(m.get(w)||0)+1)});const words=[...m].sort((a,b)=>b[1]-a[1]).slice(0,14).map(x=>x[0]);const saved=readSaved();document.getElementById('rtlVocab').innerHTML=words.map(w=>`<button class="rtlWord ${saved.some(s=>s.lu===w)?'saved':''}" data-w="${esc(w)}">${esc(w)}</button>`).join('');document.querySelectorAll('.rtlWord').forEach(b=>b.onclick=()=>saveWord(b.dataset.w,b))}
function readSaved(){try{return JSON.parse(localStorage.getItem(VOCAB_KEY)||'[]')}catch(e){return[]}}
function saveWord(w,b){const a=readSaved();if(!a.some(x=>x.lu===w))a.push({lu:w,fr:'À réviser',source:selected?'Journal du '+selected.date:'RTL',added:Date.now()});localStorage.setItem(VOCAB_KEY,JSON.stringify(a));b.classList.add('saved')}
async function transcribe(){if(busy)return;const v=document.getElementById('rtlVideo');if(!selected||!v.src){status('Choisis d’abord un journal.');return}busy=true;const btn=document.getElementById('rtlTranscribe');btn.disabled=true;try{const audio=await audio16k(v.src);const pipe=await getTranscriber();status('<strong>Transcription luxembourgeoise en cours sur ton appareil…</strong><br>Tu peux laisser cet écran ouvert.',58);const out=await pipe(audio,{language:'luxembourgish',task:'transcribe',return_timestamps:true,chunk_length_s:30,stride_length_s:5});chunks=normalizeChunks(out);if(!chunks.length&&out.text)chunks=[{start:0,end:v.duration||99999,text:out.text}];renderTranscript();status('<strong>Terminé.</strong> Le luxembourgeois s’affiche maintenant en haut de la vidéo, en même temps que le français RTL.',100)}catch(e){status('<strong>Impossible de générer les sous-titres :</strong> '+esc(e.message)+'<br><small>Sur certains appareils, le navigateur peut manquer de mémoire ou RTL peut bloquer le téléchargement direct.</small>')}finally{busy=false;btn.disabled=false}}
function sync(){const v=document.getElementById('rtlVideo'),sub=document.getElementById('rtlLuSub');if(!v||!sub)return;const t=v.currentTime,c=chunks.find(x=>t>=x.start&&t<(x.end||x.start+5));sub.textContent=c?c.text:''}
function render(){if(!window.newsGate)return;newsGate.innerHTML=`<div class="card"><div class="eyebrow">RTL · double sous-titrage gratuit</div><h3 style="margin:6px 0">Choisir un journal</h3><p class="muted">La vidéo garde les sous-titres français RTL. L’app génère en plus le luxembourgeois directement sur ton appareil, sans API payante.</p>${episodes.map((e,i)=>`<div class="rtlEp" onclick="v217Load(${i})"><b>Journal du ${e.date}</b><small>${e.duration}</small></div>`).join('')}</div><div class="card"><div class="eyebrow">Lecture bilingue</div><h3 id="rtlTitle" style="margin:6px 0">Choisis un journal</h3><div class="rtlPlayer"><video id="rtlVideo" controls playsinline></video><div id="rtlLuSub" class="rtlLuSub"></div></div><div class="rtlActions"><button id="rtlTranscribe" class="go">Générer les sous-titres LU gratuitement</button><a id="rtlOriginal" href="${RTL_FR}" target="_blank" rel="noopener">Ouvrir sur RTL</a></div><div id="rtlStatus" class="rtlStatus">Aucune transcription payante : le traitement utilise Whisper directement dans le navigateur.</div><div id="rtlTranscript" class="rtlTranscript"></div><div id="rtlVocab" class="rtlVocab"></div></div>`;document.getElementById('rtlTranscribe').onclick=transcribe;document.getElementById('rtlVideo').addEventListener('timeupdate',sync)}
window.v217Load=loadEpisode;window.renderNews=render;
document.querySelectorAll('.brand small').forEach(x=>x.textContent=VERSION+' · RTL bilingue local gratuit');document.title='Sproochentest Lëtzebuergesch '+VERSION;
})();