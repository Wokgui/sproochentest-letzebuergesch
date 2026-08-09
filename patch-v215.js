// V20.15 — atelier RTL : sélection d'un journal, double transcription LU/FR et vocabulaire révisable
(function(){
'use strict';
const VERSION='V20.15';
const RTL_LIST='https://play.rtl.lu/shows/lb/journal/episodes';
const VOCAB_KEY='sproochentest-rtl-vocab-v1';

const css=document.createElement('style');
css.textContent=`
.rtlToolbar{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}.rtlToolbar button,.rtlToolbar a{padding:10px 12px;border-radius:12px;background:#eef4f8;color:#23516f;font-weight:800;text-decoration:none}.rtlEpisode{padding:14px;border:1px solid var(--line);border-radius:15px;margin:9px 0;background:#fff}.rtlEpisode b{display:block;margin-bottom:4px}.rtlEpisode small{color:var(--muted);line-height:1.35}.rtlEpisode.active{border-color:#79b8eb;background:#f6fbff}.rtlGrid{display:grid;grid-template-columns:1fr;gap:10px}.rtlGrid textarea{min-height:120px}.rtlCaption{background:#111827;color:#fff;border-radius:16px;padding:14px;margin:12px 0}.rtlCaption .lu{font-size:19px;font-weight:850;line-height:1.35}.rtlCaption .fr2{font-size:15px;color:#d5deeb;line-height:1.35;margin-top:7px}.rtlCaption .tag{font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:#8fc8ff;font-weight:900;margin-bottom:5px}.rtlVocab{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}.rtlWord{padding:9px 11px;border-radius:12px;background:#f1f5f9;border:1px solid var(--line);color:var(--ink);font-weight:750}.rtlWord.saved{background:var(--green2);border-color:#9cdbbd;color:var(--green)}.rtlSaved{padding:10px 0;border-bottom:1px solid var(--line)}.rtlSaved:last-child{border-bottom:0}.rtlSaved b{font-size:18px}.rtlHint{font-size:12px;color:var(--muted);line-height:1.4;margin-top:8px}@media(min-width:640px){.rtlGrid{grid-template-columns:1fr 1fr}}
`;
document.head.appendChild(css);

const episodes=[
 {id:'latest',title:'Derniers journaux RTL',desc:'Choisis le journal du jour dans la liste officielle.',url:RTL_LIST},
 {id:'2026-06-04',title:'De Journal vum 4. Juni 2026',desc:'Tripartite, tourisme, international, sport.',url:'https://play.rtl.lu/shows/lb/journal/episodes/r/3462061'},
 {id:'2026-03-20',title:'De Journal vum 20. Mäerz 2026',desc:'Énergie, UE, syndicats, passeport, santé.',url:'https://play.rtl.lu/shows/lb/journal/episodes/r/3452721'}
];

const stop=new Set(('an am op um vun fir mat déi den der dem des e en eng engem enger ass sinn si war waren gëtt ginn huet hunn ech du hien hatt mir dir eis iech se sech net och nach wéi wat wou wien wann well do hei elo haut gëschter muer méi manner ganz vill dëst dësen dëser dësem dëst zu ze a bei no vir iwwer ënner tëscht oder mee mä als dat dass de d').split(/\s+/));
const glossary={
 'regierung':'gouvernement','noriichten':'actualités','leit':'gens / personnes','aarbecht':'travail','schoul':'école','gesondheet':'santé','spidol':'hôpital','minister':'ministre','premier':'Premier ministre','stad':'ville','gemeng':'commune','land':'pays','lëtzebuerg':'Luxembourg','strooss':'route / rue','gare':'gare','zuch':'train','bus':'bus','tram':'tram','wieder':'météo','hëtzt':'chaleur','waasser':'eau','feier':'incendie / feu','police':'police','sécherheet':'sécurité','gesetz':'loi','chamber':'Chambre des députés','europa':'Europe','accord':'accord','gewerkschaften':'syndicats','projet':'projet','aarbechten':'travaux','internationalen':'international','noriichteniwwerbléck':'tour d’horizon de l’actualité'
};

function readSaved(){try{return JSON.parse(localStorage.getItem(VOCAB_KEY)||'[]')}catch(e){return[]}}
function writeSaved(items){localStorage.setItem(VOCAB_KEY,JSON.stringify(items))}
function esc(s){return String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function cleanToken(t){return t.toLocaleLowerCase('lb-LU').replace(/^[^\p{L}]+|[^\p{L}'’-]+$/gu,'')}
function extractWords(text){
 const freq=new Map();
 String(text||'').split(/\s+/).map(cleanToken).filter(w=>w.length>=4&&!stop.has(w)).forEach(w=>freq.set(w,(freq.get(w)||0)+1));
 return [...freq.entries()].sort((a,b)=>b[1]-a[1]||b[0].length-a[0].length).slice(0,18).map(([lu,count])=>({lu,fr:glossary[lu]||'',count}));
}
function splitSentences(text){return String(text||'').replace(/\s+/g,' ').trim().split(/(?<=[.!?])\s+/).filter(Boolean)}
function alignPairs(lu,fr){const a=splitSentences(lu),b=splitSentences(fr),n=Math.max(a.length,b.length);return Array.from({length:n},(_,i)=>({lu:a[i]||'',fr:b[i]||''})).filter(x=>x.lu||x.fr)}

window.v215SelectEpisode=function(id){
 const ep=episodes.find(x=>x.id===id)||episodes[0];
 window.v215Episode=ep;
 document.querySelectorAll('.rtlEpisode').forEach(x=>x.classList.toggle('active',x.dataset.id===id));
 const title=document.getElementById('rtlSelectedTitle');if(title)title.textContent=ep.title;
 const link=document.getElementById('rtlOpen');if(link)link.href=ep.url;
};
window.v215BuildCaptions=function(){
 const lu=document.getElementById('rtlLu')?.value.trim()||'',fr=document.getElementById('rtlFr')?.value.trim()||'';
 const out=document.getElementById('rtlCaptions'),voc=document.getElementById('rtlVocab');
 if(!lu){out.innerHTML='<div class="feedback">Ajoute d’abord la transcription luxembourgeoise.</div>';voc.innerHTML='';return}
 const pairs=alignPairs(lu,fr);
 out.innerHTML=pairs.map((x,i)=>`<div class="rtlCaption"><div class="tag">Passage ${i+1}</div><div class="lu">${esc(x.lu)}</div>${x.fr?`<div class="fr2">${esc(x.fr)}</div>`:'<div class="fr2">Traduction française à compléter.</div>'}</div>`).join('');
 const words=extractWords(lu),saved=readSaved();
 voc.innerHTML=`<div class="sectionTitle"><h3>Vocabulaire important</h3><small>${words.length} propositions</small></div><div class="rtlVocab">${words.map((w,i)=>{const yes=saved.some(s=>s.lu===w.lu);return `<button class="rtlWord ${yes?'saved':''}" onclick="v215SaveWord(${i},this)">${esc(w.lu)}${w.fr?` · ${esc(w.fr)}`:''}</button>`}).join('')}</div><div class="rtlHint">Appuie sur un mot pour l’ajouter aux révisions. Les mots-outils et les formes très courtes sont filtrés automatiquement.</div>`;
 window.v215Words=words;
};
window.v215SaveWord=function(i,btn){
 const w=window.v215Words?.[i];if(!w)return;
 const items=readSaved();
 if(!items.some(x=>x.lu===w.lu))items.push({lu:w.lu,fr:w.fr||'À traduire',source:window.v215Episode?.title||'RTL Journal',added:Date.now()});
 writeSaved(items);btn?.classList.add('saved');renderSavedVocab();
};
window.v215RemoveWord=function(i){const items=readSaved();items.splice(i,1);writeSaved(items);renderSavedVocab()};
function renderSavedVocab(){
 const box=document.getElementById('rtlSaved');if(!box)return;const items=readSaved();
 box.innerHTML=items.length?items.map((x,i)=>`<div class="rtlSaved"><b>${esc(x.lu)}</b><div class="fr">${esc(x.fr)}</div><div class="tiny">${esc(x.source||'RTL')}</div><button class="secondary" style="margin-top:7px;padding:7px 10px" onclick="v215RemoveWord(${i})">Retirer</button></div>`).join(''):'<div class="notice">Aucun mot du journal ajouté pour le moment.</div>';
}

function renderRtlNews(){
 if(!window.newsGate)return;
 newsGate.innerHTML=`
 <div class="card"><div class="eyebrow">RTL Lëtzebuerg</div><h3 style="margin:6px 0">Choisir un journal</h3><p class="muted">La vidéo reste chez RTL. L’app ajoute la couche d’apprentissage : luxembourgeois, français et vocabulaire.</p>
 ${episodes.map(e=>`<div class="rtlEpisode ${e.id==='latest'?'active':''}" data-id="${e.id}" onclick="v215SelectEpisode('${e.id}')"><b>${esc(e.title)}</b><small>${esc(e.desc)}</small></div>`).join('')}
 <div class="rtlToolbar"><a id="rtlOpen" href="${RTL_LIST}" target="_blank" rel="noopener">▶ Regarder sur RTL Play</a></div></div>
 <div class="card"><div class="eyebrow">Double sous-titrage</div><h3 id="rtlSelectedTitle" style="margin:6px 0">Derniers journaux RTL</h3><p class="muted">Colle la transcription luxembourgeoise et, si disponible, la version française. L’app les aligne phrase par phrase.</p><div class="rtlGrid"><div><div class="tiny">Lëtzebuergesch</div><textarea id="rtlLu" placeholder="Transcription luxembourgeoise…"></textarea></div><div><div class="tiny">Français</div><textarea id="rtlFr" placeholder="Sous-titres ou traduction française…"></textarea></div></div><button class="primary" style="margin-top:10px" onclick="v215BuildCaptions()">Créer le double sous-titrage</button><div id="rtlCaptions"></div><div id="rtlVocab"></div></div>
 <div class="card"><div class="sectionTitle" style="margin-top:0"><h3>Mots ajoutés aux révisions</h3><small>Journal RTL</small></div><div id="rtlSaved"></div></div>
 <div class="notice">Étape suivante prévue : récupération automatique des sous-titres quand RTL les expose de façon exploitable, puis synchronisation par timecodes. Cette version n’héberge ni ne copie les vidéos RTL.</div>`;
 window.v215Episode=episodes[0];renderSavedVocab();
}

// Remplace l'ancien écran Journal par l'atelier, sans casser le reste du parcours.
window.renderNews=renderRtlNews;
const previousReview=window.renderReview;
window.renderReview=function(){
 previousReview();
 const items=readSaved();if(!items.length)return;
 const extra=document.createElement('div');extra.className='card';extra.innerHTML='<div class="sectionTitle" style="margin-top:0"><h3>Vocabulaire RTL</h3><small>'+items.length+' mot(s)</small></div>'+items.slice().sort(()=>Math.random()-.5).slice(0,6).map(x=>`<div class="word"><div class="lux">${esc(x.lu)}</div><div class="fr">${esc(x.fr)}</div><div class="tiny">${esc(x.source||'RTL')}</div></div>`).join('');
 document.getElementById('review')?.appendChild(extra);
};

document.querySelectorAll('.brand small').forEach(x=>x.textContent=VERSION+' · RTL bilingue + voix humaines');
document.title='Sproochentest Lëtzebuergesch '+VERSION;
})();