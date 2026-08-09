// V20.1 — flux autonome, LU+FR masqués, écoute suivante fiable, interface intégrée
(function(){
'use strict';

const style=document.createElement('style');
style.textContent=`
/* Interface intégrée au fond : suppression des grandes cartes blanches */
#home .card,#lesson .card,#review .card,#news .card,
.v20audio,.checkpoint,.exerciseBox,.compactProgress,.bottomTools,.skillCard,.oralItem{
  background:transparent!important;border:0!important;box-shadow:none!important;border-radius:0!important;
  padding-left:2px!important;padding-right:2px!important;
}
#home .hero{background:transparent!important;border:0!important;box-shadow:none!important;padding:8px 2px 14px!important}
#path{background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important}
.bottomTools{border-top:1px solid var(--line)!important;margin-top:28px!important;padding-top:18px!important}
.v201stage{font-size:12px;font-weight:850;color:var(--blue);text-transform:uppercase;letter-spacing:.5px;margin-bottom:6px}
.v201choice{display:block;width:100%;text-align:left;padding:12px;border-radius:12px;background:#eef2f6;border:1px solid var(--line);margin:7px 0;color:var(--ink)}
.v201choice.good{background:var(--green2);border-color:#9cdbbd}.v201choice.bad{background:var(--red2);border-color:#f2adb4}
.v201trans{margin-top:12px}.v201trans button{width:100%;padding:10px 12px;border-radius:11px;background:#eaf1f7;color:#2d4660;font-weight:800;margin-top:7px}
.v201trans .box{display:none;padding:11px 12px;border-radius:11px;background:#edf2f6;margin-top:6px;line-height:1.45}
.v201trans .label{font-size:11px;color:var(--muted);font-weight:800;text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px}
`;
document.head.appendChild(style);

// Accueil plus direct.
const oldHome=window.renderHome;
window.renderHome=function(){
  oldHome();
  const next=Math.min((state.done||[]).length,lessons.length-1);
  if(window.heroTitle)heroTitle.textContent=`Leçon ${next+1} · ${lessons[next].title}`;
  const hero=document.querySelector('#home .hero');
  if(hero){const p=hero.querySelector('p');if(p)p.textContent=`${lessons[next].sub}. Ensuite : compréhension orale puis expression orale.`}
  document.querySelectorAll('.brand small').forEach(x=>x.textContent='Départ zéro · V20.1');
};

function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function buildCards(){
  const pool=[];
  lessons[activeLesson].words.forEach((w,id)=>{
    pool.push({id,dir:'Français → luxembourgeois',prompt:w[1],answer:w[0]});
    pool.push({id,dir:'Luxembourgeois → français',prompt:w[0],answer:w[1]});
  });
  shuffle(pool);
  const out=[];
  while(pool.length){
    const prev=out[out.length-1];
    let choices=pool.map((c,i)=>({c,i})).filter(x=>!prev||x.c.id!==prev.id);
    if(!choices.length)choices=pool.map((c,i)=>({c,i}));
    out.push(pool.splice(choices[Math.floor(Math.random()*choices.length)].i,1)[0]);
  }
  return out;
}

let quiz=[],quizPos=0,quizGood=0,revealed=false;
window.startQuiz=function(){quiz=buildCards();quizPos=0;quizGood=0;renderQuiz()};
function renderQuiz(){
  if(quizPos>=quiz.length){finishQuiz();return}
  const c=quiz[quizPos];revealed=false;
  lessonContent.innerHTML=`<div class="v201stage">Test vocabulaire · ${quizPos+1}/${quiz.length}</div><div class="tiny">${c.dir}</div><div class="selfQ">${c.prompt}</div><p class="muted">Réponds sans proposition.</p><button class="primary" onclick="v201Reveal()">Révéler la réponse</button><div id="v201QuizAnswer"></div>`;
}
window.v201Reveal=function(){if(revealed)return;revealed=true;const c=quiz[quizPos];document.getElementById('v201QuizAnswer').innerHTML=`<div class="reveal">${c.answer}</div><div class="judge"><button class="no" onclick="v201Judge(false)">À revoir</button><button class="yes" onclick="v201Judge(true)">Je savais</button></div>`};
window.v201Judge=function(ok){if(ok)quizGood++;quizPos++;renderQuiz()};
function finishQuiz(){
  const pct=Math.round(quizGood/quiz.length*100);
  if(pct<80){lessonContent.innerHTML=`<div style="text-align:center;padding:24px 0"><h2>Vocabulaire à consolider</h2><p class="muted">${quizGood}/${quiz.length} · ${pct} %. Il faut 80 %.</p><button class="primary" onclick="startQuiz()">Refaire le test</button></div>`;return}
  startListening();
}

const audioBank=[
 {audio:'https://lod.lu/uploads/examples/OGG/9b/9bb3ff56b0168aa51fe1737239761208.ogg',lu:'moien, Madamm, wat kann ech fir Iech maachen?',fr:'Bonjour Madame, que puis-je faire pour vous ?',q:'Que fait la personne ?',opts:['Elle salue et propose son aide.','Elle dit au revoir.','Elle demande l’heure.'],a:0},
 {audio:'https://lod.lu/uploads/examples/OGG/f2/f20e0cdaccb6c76c06f8720ac34ac7a9.ogg',lu:'moien, wéi geet et?',fr:'Bonjour, comment ça va ?',q:'Que demande la personne ?',opts:['Comment ça va ?','Où habites-tu ?','Quel âge as-tu ?'],a:0},
 {audio:'https://lod.lu/uploads/examples/OGG/92/926b1dbd7e2c5081e03a3a1a229605d8.ogg',lu:'salut, ech ginn elo heem!',fr:'Salut, je rentre maintenant à la maison !',q:'Que va faire la personne ?',opts:['Elle rentre chez elle.','Elle va travailler.','Elle va au restaurant.'],a:0},
 {audio:'https://lod.lu/uploads/examples/OGG/57/5708aa802f9771f2a431a9310f609b90.ogg',lu:'ech wunnen zu Eech',fr:'J’habite à Eich.',q:'Que dit la personne ?',opts:['Elle habite à Eech.','Elle travaille à Eech.','Elle vient d’Eech.'],a:0},
 {audio:'https://lod.lu/uploads/examples/OGG/99/993dc701e65f000216eed16a3d7b4dc0.ogg',lu:'déi nei Buslinn fiert vun der Gare op de Flughafen',fr:'La nouvelle ligne de bus va de la gare à l’aéroport.',q:'Quel trajet est annoncé ?',opts:['De la gare à l’aéroport.','De l’aéroport au magasin.','De l’école à la gare.'],a:0},
 {audio:'https://lod.lu/uploads/examples/OGG/bd/bd64bfea677c6f9acc314b9fd4ed0cb2.ogg',lu:'mir hunn eng Taass Kaffi gedronk',fr:'Nous avons bu une tasse de café.',q:'Qu’ont-ils bu ?',opts:['Une tasse de café.','Un verre d’eau.','Du thé.'],a:0}
];
function setForLesson(i){
  if(typeof window.v213BuildListening==='function')return window.v213BuildListening(i);
  if(i===0)return audioBank.slice(0,3);
  const start=3+(i%3);return [audioBank[start%audioBank.length],audioBank[(start+1)%audioBank.length]];
}
let listening=[],listenPos=0,player=null;
function startListening(){listening=setForLesson(activeLesson);listenPos=0;renderListening()}
function renderListening(){
  if(listenPos>=listening.length){renderSpeaking();return}
  const x=listening[listenPos];
  lessonContent.innerHTML=`<div class="v201stage">Compréhension orale · ${listenPos+1}/${listening.length}</div><h2 style="margin:6px 0 10px">Écoute sans lire</h2><button class="checkpointAudio" onclick="v201Play(this)">▶ Écouter</button><div class="selfQ" style="font-size:19px">${x.q}</div>${x.opts.map((o,i)=>`<button class="v201choice" onclick="v201Answer(${i},this)">${o}</button>`).join('')}<div id="v201RevealAudio"></div>`;
}
window.v201Play=function(btn){const x=listening[listenPos];if(x.speech&&typeof window.v213Speak==='function'){window.v213Speak(x.speech,btn);return}try{player?.pause();player=new Audio(x.audio);btn.textContent='🔊 Lecture…';player.play().then(()=>player.onended=()=>btn.textContent='▶ Réécouter').catch(()=>btn.textContent='Réessayer')}catch(e){btn.textContent='Réessayer'}};
window.v201Answer=function(choice,btn){
  const x=listening[listenPos],buttons=btn.parentElement.querySelectorAll('.v201choice');
  buttons.forEach((b,i)=>{b.disabled=true;if(i===x.a)b.classList.add('good')});if(choice!==x.a)btn.classList.add('bad');
  document.getElementById('v201RevealAudio').innerHTML=`<div class="v201trans"><button onclick="v201Toggle(this,'lu')">Afficher le luxembourgeois</button><div class="box" data-lang="lu"><div class="label">Luxembourgeois</div>${x.lu}</div><button onclick="v201Toggle(this,'fr')">Afficher le français</button><div class="box" data-lang="fr"><div class="label">Français</div>${x.fr}</div></div><button class="primary" style="margin-top:12px" onclick="v201NextAudio()">${listenPos+1<listening.length?'Écoute suivante':'Passer à l’expression orale'}</button>`;
};
window.v201Toggle=function(btn,lang){const box=btn.parentElement.querySelector('.box[data-lang="'+lang+'"]');const open=box.style.display==='block';box.style.display=open?'none':'block';btn.textContent=(open?'Afficher ':'Masquer ')+(lang==='lu'?'le luxembourgeois':'le français')};
window.v201NextAudio=function(){listenPos++;renderListening()};

function renderSpeaking(){
  const l=lessons[activeLesson],starters=l.words.slice(0,4).map(w=>w[0]);
  lessonContent.innerHTML=`<div class="v201stage">Expression orale</div><h2 style="margin:6px 0 12px">Réponds avec des repères</h2><div class="guideStep"><b>1 · Commence simple</b>Fais une première phrase courte sur « ${l.title} ».</div><div class="guideStep"><b>2 · Ajoute un détail</b>Utilise un deuxième élément appris.</div><div class="guideStep"><b>3 · Termine clairement</b>Ajoute une information personnelle, une préférence ou une raison simple.</div><div class="tiny">Amorces disponibles :</div><div class="phraseBank">${starters.map(s=>`<span>${s}</span>`).join('')}</div><p class="muted">Réponds à voix haute avant de t’évaluer.</p><button class="primary" onclick="document.getElementById('v201SpeakJudge').style.display='block';this.style.display='none'">J’ai répondu</button><div id="v201SpeakJudge" style="display:none"><div class="judge"><button class="no" onclick="v201Finish(false)">À revoir</button><button class="yes" onclick="v201Finish(true)">J’ai pu répondre</button></div></div>`;
}
window.v201Finish=function(ok){if(!ok){lessonContent.innerHTML=`<h2>Expression orale à revoir</h2><button class="primary" onclick="v201RestartSpeaking()">Refaire l’expression orale</button>`;return}if(!state.done.includes(activeLesson)){state.done.push(activeLesson);state.done.sort((a,b)=>a-b);save()}lessonContent.innerHTML=`<div style="text-align:center;padding:24px 0"><div style="font-size:44px">✓</div><h2>Leçon validée</h2><p class="muted">Vocabulaire + compréhension + expression orale.</p><button class="primary" onclick="show('home')">Retour au parcours</button></div>`};
window.v201RestartSpeaking=renderSpeaking;

document.title='Sproochentest Lëtzebuergesch V20.1';
renderHome();
})();
