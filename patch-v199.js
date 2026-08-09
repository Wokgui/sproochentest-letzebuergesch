// V19.9 — corrige la boucle après vocabulaire + transcriptions LU/DE masquées
(function(){
'use strict';

const css=document.createElement('style');
css.textContent=`
.dualTranscript{margin-top:12px}.dualTranscript button{width:100%;padding:10px 12px;border-radius:11px;background:#eef4f8;color:#2d4660;font-weight:800;margin-top:7px}.dualTranscript .box{display:none;padding:11px 12px;border-radius:11px;background:#f6f8fb;border:1px solid var(--line);margin-top:6px;line-height:1.45}.dualTranscript .label{font-size:11px;color:var(--muted);font-weight:800;text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px}
`;
document.head.appendChild(css);

// Compteur local fiable pour le test final du vocabulaire.
let v199Good=0,v199Total=0;
const prevStartQuiz=window.startQuiz;
const prevJudgeSelf=window.judgeSelf;
window.startQuiz=function(){v199Good=0;v199Total=lessons[activeLesson].words.length*2;prevStartQuiz()};
window.judgeSelf=function(ok){if(ok)v199Good++;prevJudgeSelf(ok)};

const bank=[
 {audio:'https://lod.lu/uploads/examples/OGG/9b/9bb3ff56b0168aa51fe1737239761208.ogg',lu:'moien, Madamm, wat kann ech fir Iech maachen?',de:'Guten Tag, gnädige Frau, was kann ich für Sie tun?',q:'Que fait la personne ?',opts:['Elle salue et propose son aide.','Elle dit au revoir.','Elle demande l’heure.'],a:0},
 {audio:'https://lod.lu/uploads/examples/OGG/f2/f20e0cdaccb6c76c06f8720ac34ac7a9.ogg',lu:'moien, wéi geet et?',de:'Hallo, wie geht es?',q:'Que demande la personne ?',opts:['Comment ça va ?','Où habites-tu ?','Quel âge as-tu ?'],a:0},
 {audio:'https://lod.lu/uploads/examples/OGG/92/926b1dbd7e2c5081e03a3a1a229605d8.ogg',lu:'salut, ech ginn elo heem!',de:'Tschüss, ich gehe jetzt nach Hause!',q:'Que va faire la personne ?',opts:['Elle rentre chez elle.','Elle va travailler.','Elle va au restaurant.'],a:0},
 {audio:'https://lod.lu/uploads/examples/OGG/57/5708aa802f9771f2a431a9310f609b90.ogg',lu:'ech wunnen zu Eech',de:'Ich wohne in Eich.',q:'Que dit la personne ?',opts:['Elle habite à Eech.','Elle travaille à Eech.','Elle vient d’Eech.'],a:0},
 {audio:'https://lod.lu/uploads/examples/OGG/7a/7af2674e596a6c81e13aa53e3bfd8a89.ogg',lu:'fiert dëse Bus op Eech?',de:'Fährt dieser Bus nach Eich?',q:'Que demande la personne ?',opts:['Si ce bus va à Eech.','Le prix du bus.','L’heure du train.'],a:0},
 {audio:'https://lod.lu/uploads/examples/OGG/99/993dc701e65f000216eed16a3d7b4dc0.ogg',lu:'déi nei Buslinn fiert vun der Gare op de Flughafen',de:'Die neue Buslinie fährt vom Bahnhof zum Flughafen.',q:'Quel trajet est annoncé ?',opts:['De la gare à l’aéroport.','De l’aéroport au magasin.','De l’école à la gare.'],a:0},
 {audio:'https://lod.lu/uploads/examples/OGG/bd/bd64bfea677c6f9acc314b9fd4ed0cb2.ogg',lu:'mir hunn eng Taass Kaffi gedronk',de:'Wir haben eine Tasse Kaffee getrunken.',q:'Qu’ont-ils bu ?',opts:['Une tasse de café.','Un verre d’eau.','Du thé.'],a:0},
 {audio:'https://lod.lu/uploads/examples/OGG/4c/4c4f9a38005924e30b5af0572dc95d29.ogg',lu:'hien drénkt nëmme schwaarze Kaffi',de:'Er trinkt nur schwarzen Kaffee.',q:'Quel café boit-il ?',opts:['Seulement du café noir.','Du café au lait.','Il ne boit pas de café.'],a:0},
 {audio:'https://lod.lu/uploads/examples/OGG/fe/fef9b02ea8a96664cdf7fb8ace799f71.ogg',lu:'wa schéint Wieder ass, si vill Cyclisten op der Strooss',de:'Wenn schönes Wetter ist, sind viele Radfahrer auf der Straße.',q:'Que se passe-t-il quand il fait beau ?',opts:['Il y a beaucoup de cyclistes.','Les bus s’arrêtent.','Tout le monde reste chez soi.'],a:0}
];
function lessonClips(i){if(i===0)return bank.slice(0,3);if(i<=7)return bank.slice(3,6);if(i===13||i===14||i===22||i===23)return bank.slice(6,8);if(i===19)return [bank[8],bank[5]];return [bank[(i+3)%bank.length],bank[(i+5)%bank.length]]}

let lessonAudio=[],lessonAudioIndex=0,lessonPlayer=null;
function transcriptControls(x){return `<div class="dualTranscript"><button onclick="toggleTranscript(this,'lu')">Afficher le luxembourgeois</button><div class="box" data-lang="lu"><div class="label">Luxembourgeois</div>${x.lu}</div><button onclick="toggleTranscript(this,'de')">Afficher l’allemand</button><div class="box" data-lang="de"><div class="label">Allemand</div>${x.de}</div></div>`}
window.toggleTranscript=function(btn,lang){const box=btn.parentElement.querySelector('.box[data-lang="'+lang+'"]');const open=box.style.display==='block';box.style.display=open?'none':'block';btn.textContent=(open?'Afficher ':'Masquer ')+(lang==='lu'?'le luxembourgeois':'l’allemand')};

function renderLessonListening(){
 if(lessonAudioIndex>=lessonAudio.length){if(typeof window.renderGuidedSpeaking==='function')window.renderGuidedSpeaking();return}
 const x=lessonAudio[lessonAudioIndex];
 lessonContent.innerHTML=`<div class="checkpoint"><div class="stage">Compréhension ${lessonAudioIndex+1}/${lessonAudio.length}</div><h2>Écoute sans lire</h2><p class="muted">Les deux transcriptions sont cachées par défaut.</p><button class="checkpointAudio" onclick="playV199Audio(this)">▶ Écouter</button><div class="selfQ" style="font-size:19px">${x.q}</div>${x.opts.map((o,i)=>`<button class="checkpointChoice" onclick="answerV199Audio(${i},this)">${o}</button>`).join('')}<div id="v199Reveal"></div></div>`;
}
window.playV199Audio=function(btn){const x=lessonAudio[lessonAudioIndex];try{lessonPlayer?.pause();lessonPlayer=new Audio(x.audio);btn.textContent='🔊 Lecture…';lessonPlayer.play().then(()=>lessonPlayer.onended=()=>btn.textContent='▶ Réécouter').catch(()=>btn.textContent='Réessayer')}catch(e){btn.textContent='Réessayer'}};
window.answerV199Audio=function(choice,btn){const x=lessonAudio[lessonAudioIndex],buttons=btn.parentElement.querySelectorAll('.checkpointChoice');buttons.forEach((b,i)=>{b.disabled=true;if(i===x.a)b.classList.add('good')});if(choice!==x.a)btn.classList.add('bad');document.getElementById('v199Reveal').innerHTML=transcriptControls(x)+`<button class="primary" style="margin-top:12px" onclick="lessonAudioIndex++;renderV199Listening()">Écoute suivante</button>`};
window.renderV199Listening=renderLessonListening;

// Remplace la fin du test vocabulaire : plus de boucle, passage direct aux écoutes.
window.finishSelfTest=function(){
 const pct=v199Total?Math.round(v199Good/v199Total*100):0;
 if(pct<80){lessonContent.innerHTML=`<div class="card" style="text-align:center;padding:28px"><div style="font-size:48px">↻</div><h2>Vocabulaire à consolider</h2><p class="muted">${v199Good}/${v199Total} · ${pct} %. Il faut 80 % avant l’oral.</p><button class="primary" onclick="openLesson(activeLesson)">Revoir la leçon</button></div>`;return}
 lessonAudio=lessonClips(activeLesson);lessonAudioIndex=0;renderLessonListening();
};

// Applique les mêmes transcriptions masquées dans l'onglet Compréhension générale.
const prevAnswerListening=window.answerListening;
window.answerListening=function(i,choice,btn){prevAnswerListening(i,choice,btn);setTimeout(()=>{const box=btn.closest('.oralItem');const reveal=box&&box.querySelector('.oralReveal');if(!reveal)return;const text=(reveal.textContent||'').match(/Transcription\s*:\s*([^\n]+)/i);if(!text)return;const lu=text[1].trim();const de='Traduction allemande à ajouter pour cet extrait.';reveal.innerHTML=transcriptControls({lu,de});},0)};

document.querySelectorAll('.brand small').forEach(x=>x.textContent='Départ zéro · V19.9');
document.title='Sproochentest Lëtzebuergesch V19.9';
})();