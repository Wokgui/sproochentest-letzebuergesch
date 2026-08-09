// V20.16 — journaux RTL directement lisibles avec sous-titres français
(function(){
'use strict';
const VERSION='V20.16';
const RTL_FR='https://play.rtl.lu/shows/fr/journal/episodes';
const episodes=[
 {date:'07/08/2026',duration:'22 min 42 s',url:'https://play.rtl.lu/shows/fr/journal/episodes/r/3469221'},
 {date:'06/08/2026',duration:'18 min 01 s',url:'https://play.rtl.lu/shows/fr/journal/episodes/r/3469187'},
 {date:'05/08/2026',duration:'18 min 54 s',url:'https://play.rtl.lu/shows/fr/journal/episodes/r/3469107'}
];
const css=document.createElement('style');
css.textContent=`
.rtl216ep{display:block;padding:15px;border:1px solid var(--line);border-radius:15px;margin:9px 0;background:#fff;color:var(--ink);text-decoration:none}.rtl216ep:active{transform:scale(.995)}.rtl216ep b{display:block;font-size:17px}.rtl216ep small{display:block;color:var(--muted);margin-top:4px}.rtl216play{display:inline-block;margin-top:9px;padding:9px 12px;border-radius:11px;background:var(--blue);color:#fff;font-weight:850}.rtl216note{padding:12px 13px;border-radius:13px;background:#f4f6f9;color:var(--muted);font-size:13px;line-height:1.45;margin-top:12px}
`;
document.head.appendChild(css);
function render(){
 if(!window.newsGate)return;
 newsGate.innerHTML=`<div class="card"><div class="eyebrow">RTL Lëtzebuerg</div><h3 style="margin:6px 0">Regarder un journal</h3><p class="muted">Appuie directement sur un journal : la vidéo RTL s'ouvre avec les sous-titres français fournis par RTL.</p>${episodes.map(e=>`<a class="rtl216ep" href="${e.url}" target="_blank" rel="noopener"><b>Journal du ${e.date}</b><small>${e.duration} · audio luxembourgeois · sous-titres français</small><span class="rtl216play">▶ Regarder</span></a>`).join('')}<a class="source" href="${RTL_FR}" target="_blank" rel="noopener"><b>Voir tous les journaux sous-titrés</b><small>Liste officielle RTL Play</small></a><div class="rtl216note"><b>Pour le double sous-titrage LU + FR :</b> RTL publie ici la vidéo luxembourgeoise avec une piste française. La piste luxembourgeoise synchronisée n'est pas exposée sur cette page. Je ne te demande donc plus de saisir les sous-titres toi-même. Pour avoir les deux simultanément, il faut ajouter une transcription automatique luxembourgeoise synchronisée côté application.</div></div>`;
}
window.renderNews=render;
document.querySelectorAll('.brand small').forEach(x=>x.textContent=VERSION+' · RTL sous-titré + voix humaines');
document.title='Sproochentest Lëtzebuergesch '+VERSION;
})();