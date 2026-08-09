// V19.7 — accueil compact, exercices fiables, oral intégré à chaque leçon
(function(){
'use strict';

const style=document.createElement('style');
style.textContent=`
.compactProgress{padding:16px;border:1px solid var(--line);border-radius:18px;background:#fff;margin-bottom:14px}.compactProgress .topline{display:flex;align-items:center;gap:10px}.compactProgress strong{font-size:20px}.compactProgress .grow{flex:1}.quickOral{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.quickOral button{padding:12px;border-radius:13px;background:var(--blue2);color:var(--blue);font-weight:850}.fiveSteps{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin-top:12px}.fiveSteps div{padding:8px 3px;border-radius:10px;background:#f4f7fa;text-align:center;font-size:10px;color:var(--muted)}.fiveSteps b{display:block;color:var(--ink);font-size:14px;margin-bottom:2px}.checkpoint{padding:18px;border:1px solid var(--line);border-radius:18px;background:#fff}.checkpoint .stage{font-size:12px;font-weight:850;color:var(--blue);text-transform:uppercase;letter-spacing:.5px}.checkpoint h2{margin:7px 0 10px}.checkpointAudio{width:100%;padding:14px;border-radius:14px;background:var(--blue);color:#fff;font-weight:850;margin:10px 0}.checkpointChoice{display:block;width:100%;text-align:left;padding:12px;border-radius:12px;background:#f5f7fa;border:1px solid var(--line);margin:7px 0;color:var(--ink)}.checkpointChoice.good{background:var(--green2);border-color:#9cdbbd}.checkpointChoice.bad{background:var(--red2);border-color:#f2adb4}.checkpointReveal{padding:13px;border-radius:13px;background:#f4f6f9;margin-top:10px;line-height:1.45}.compactHeroText{margin:7px 0 0;color:var(--muted);font-size:13px}
`;
document.head.appendChild(style);

// ---------- Accueil beaucoup plus compact ----------
const previousRenderHome=window.renderHome;
window.renderHome=function(){
  previousRenderHome();
  const done=Array.isArray(state.done)?state.done.length:0;
  const pct=Math.round(done/lessons.length*100);
  const totalItems=lessons.reduce((n,l)=>n+l.words.length,0);
  const hero=document.querySelector('#home .hero');
  if(hero){
    const p=hero.querySelector('p');
    if(p)p.textContent='30 leçons. Chaque leçon : vocabulaire, compréhension orale et expression orale.';
  }
  let box=document.getElementById('overviewBox');
  if(!box){box=document.createElement('div');box.id='overviewBox';hero?.insertAdjacentElement('afterend',box)}
  if(box){
    box.innerHTML=`<div class="compactProgress"><div class="topline"><div><strong>${done}/${lessons.length}</strong><div class="tiny">leçons terminées</div></div><div class="grow"><div class="progress" style="margin:0"><span style="width:${pct}%"></span></div><div class="tiny" style="margin-top:5px">${pct}% · ${totalItems} éléments au total</div></div></div><div class="quickOral"><button onclick="openOralSection('listen')">🎧 Compréhension</button><button onclick="openOralSection('speak')">🗣️ Expression</button></div></div>`;
  }
  // Supprime les blocs explicatifs non interactifs de la première page.
  document.querySelectorAll('#home .sectionTitle').forEach(t=>{
    const h=t.querySelector('h3');
    if(h && h.textContent.trim()==='Principe'){
      t.style.display='none';
      if(t.nextElementSibling)t.nextElementSibling.style.display='none';
    }
  });
  const navNews=document.querySelector('.nav button[data-screen="news"]');
  if(navNews)navNews.innerHTML='<span>🎧</span>Oral';
  document.querySelectorAll('.brand small').forEach(x=>x.textContent='Départ zéro · V19.7');
};
window.openOralSection=function(mode){if(typeof setOralMode==='function')setOralMode(mode);show('news')};

// ---------- Leçon : 5 étapes visibles ----------
window.renderLessonWords=function(){
  const l=lessons[activeLesson];
  lessonContent.innerHTML=`<div class="card"><div class="lessonHead"><div class="lessonNo">${activeLesson+1}</div><div><div class="eyebrow">Leçon ${activeLesson+1}/${lessons.length}</div><h2 style="margin:4px 0">${l.title}</h2><div class="tiny">${l.words.length} éléments</div></div></div><div class="fiveSteps"><div><b>1</b>Apprendre</div><div><b>2</b>Exercices</div><div><b>3</b>Vocab.</div><div><b>4</b>Comprendre</div><div><b>5</b>Parler</div></div></div><div class="card"><div class="tiny">À apprendre</div>${l.words.map((w,i)=>`<div class="word"><div class="lux">${w[0]}</div><div class="fr">${w[1]}</div><div class="audioLine"><button class="audioBtn">🔊 Écouter</button><span class="audioStatus">Voix humaine uniquement</span></div></div>`).join('')}</div><button class="primary" onclick="startLessonPractice()">Passer aux exercices</button>`;
};

// ---------- Exercices intermédiaires : corrige "Exercice suivant" ----------
let pPractice=[],pIndex=0;
const oralPromptByLesson={
  0:'Salue quelqu’un puis dis au revoir.',1:'Dis je, tu et nous en luxembourgeois.',2:'Fais une phrase simple avec « je suis ».',3:'Présente-toi : prénom et lieu d’habitation.',4:'Dis un âge simple.',5:'Pose une question avec « wou » ou « wéi ».',6:'Joue un mini-dialogue : bonjour, comment ça va, réponse, au revoir.',7:'Dis une phrase simple avec « aujourd’hui » et « Luxembourg ».',8:'Présente deux personnes de ta famille.',9:'Cite deux jours de la semaine.',10:'Dis si c’est le matin, midi, soir ou nuit.',11:'Donne une heure simple.',12:'Décris deux pièces de ton logement.',13:'Dis ce que tu manges et ce que tu bois.',14:'Imagine un achat et utilise acheter ou payer.',15:'Dis comment tu te déplaces.',16:'Donne une direction simple.',17:'Dis où tu travailles ou invente une réponse.',18:'Parle d’un loisir.',19:'Décris la météo.',20:'Dis simplement où tu as mal.',21:'Cite deux vêtements.',22:'Fais une commande très simple au restaurant.',23:'Dis ce que tu aimes et ce que tu préfères.',24:'Dis une chose faite hier.',25:'Dis un projet pour demain.',26:'Décris une personne.',27:'Décris une image avec devant, derrière ou à côté.',28:'Donne ton avis et une raison.',29:'Demande de répéter puis de parler plus lentement.'
};
function shuffled(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
window.startLessonPractice=function(){
  const l=lessons[activeLesson],ws=shuffled(l.words);
  pPractice=[];
  ws.slice(0,Math.min(3,ws.length)).forEach((w,i)=>{
    if(i%2===0)pPractice.push({type:'🧠 Rappel actif',title:'Retrouve le sens',prompt:`Que signifie « ${w[0]} » ?`,answer:w[1],hint:'Réponds sans proposition.'});
    else pPractice.push({type:'✍️ Production',title:'Produis le luxembourgeois',prompt:`Comment dis-tu « ${w[1]} » ?`,answer:w[0],hint:'Aucune réponse suggérée.'});
  });
  pPractice.push({type:'🗣️ Préparation orale',title:'Utilise ce que tu viens d’apprendre',prompt:oralPromptByLesson[activeLesson]||`Utilise deux éléments de la leçon « ${l.title} » à voix haute.`,answer:'Il n’y a pas une seule réponse parfaite : vérifie surtout que les mots te viennent sans regarder.',hint:'Parle réellement à voix haute.'});
  pIndex=0;renderPatchPractice();
};
window.renderPatchPractice=function(){
  if(pIndex>=pPractice.length){
    lessonContent.innerHTML=`<div class="card"><div class="eyebrow">Exercices terminés</div><h2>Test complet du vocabulaire</h2><p class="muted">Tous les éléments seront demandés dans les deux sens, mélangés et sans QCM. Ensuite viendront obligatoirement la compréhension orale et l’expression orale.</p><button class="primary" onclick="startQuiz()">Commencer le test vocabulaire</button></div>`;
    return;
  }
  const p=pPractice[pIndex];
  lessonContent.innerHTML=`<div class="exerciseBox"><div class="exerciseType">${p.type}</div><div class="tiny">Exercice ${pIndex+1}/${pPractice.length}</div><h3>${p.title}</h3><div class="selfQ">${p.prompt}</div><p class="muted">${p.hint}</p><button class="primary" onclick="revealPatchPractice()">Révéler / vérifier</button><div id="patchPracticeAnswer"></div></div>`;
};
window.revealPatchPractice=function(){
  const p=pPractice[pIndex];
  const host=document.getElementById('patchPracticeAnswer');
  if(host)host.innerHTML=`<div class="reveal">${p.answer}</div><button class="primary" onclick="nextPatchPractice()">Exercice suivant</button>`;
};
window.nextPatchPractice=function(){pIndex++;renderPatchPractice()};

// ---------- Suivi du score du test vocabulaire ----------
let trackedGood=0,trackedTotal=0;
const oldStartQuiz=window.startQuiz;
const oldJudgeSelf=window.judgeSelf;
window.startQuiz=function(){trackedGood=0;trackedTotal=lessons[activeLesson].words.length*2;oldStartQuiz()};
window.judgeSelf=function(ok){if(ok)trackedGood++;oldJudgeSelf(ok)};

// ---------- Checkpoint oral obligatoire après le vocabulaire ----------
let cpPlayer=null,cpListening=null,cpLesson=0;
const cpListeningBank=[
 {audio:'https://lod.lu/uploads/examples/OGG/57/5708aa802f9771f2a431a9310f609b90.ogg',text:'ech wunnen zu Eech',q:'Que dit la personne ?',opts:['Elle habite à Eech.','Elle travaille à Eech.','Elle quitte Eech.'],a:0},
 {audio:'https://lod.lu/uploads/examples/OGG/7a/7af2674e596a6c81e13aa53e3bfd8a89.ogg',text:'fiert dëse Bus op Eech?',q:'Que demande la personne ?',opts:['Si ce bus va à Eech.','Le prix du bus.','L’heure de fermeture de la gare.'],a:0},
 {audio:'https://lod.lu/uploads/examples/OGG/99/993dc701e65f000216eed16a3d7b4dc0.ogg',text:'déi nei Buslinn fiert vun der Gare op de Flughafen',q:'Quel trajet est annoncé ?',opts:['De la gare à l’aéroport.','De l’aéroport au magasin.','De l’école à la maison.'],a:0},
 {audio:'https://lod.lu/uploads/examples/OGG/bd/bd64bfea677c6f9acc314b9fd4ed0cb2.ogg',text:'mir hunn eng Taass Kaffi gedronk',q:'Qu’ont-ils bu ?',opts:['Une tasse de café.','Un verre d’eau.','Du thé.'],a:0},
 {audio:'https://lod.lu/uploads/examples/OGG/fe/fef9b02ea8a96664cdf7fb8ace799f71.ogg',text:'wa schéint Wieder ass, si vill Cyclisten op der Strooss',q:'Que se passe-t-il quand il fait beau ?',opts:['Il y a beaucoup de cyclistes.','Les bus s’arrêtent.','Tout le monde reste chez soi.'],a:0},
 {audio:'https://lod.lu/uploads/examples/OGG/5e/5e89147416f5f194d1231df26ec7d19c.ogg',text:'am Autobus sinn nach Sëtzplaze fräi',q:'Quelle information est donnée ?',opts:['Il reste des places assises.','Le bus est complet.','Le bus est en retard.'],a:0}
];
function checkpointItemForLesson(i){return cpListeningBank[Math.min(cpListeningBank.length-1,Math.floor(i/5))]}
window.finishSelfTest=function(){
  const pct=trackedTotal?Math.round(trackedGood/trackedTotal*100):0;
  if(pct<80){
    lessonContent.innerHTML=`<div class="card" style="text-align:center;padding:28px"><div style="font-size:48px">↻</div><h2>Vocabulaire à consolider</h2><p class="muted">${trackedGood}/${trackedTotal} réponses déclarées sues · ${pct} %. Il faut 80 % avant de passer à l’oral.</p><button class="primary" onclick="openLesson(activeLesson)">Revoir la leçon</button></div>`;
    return;
  }
  cpLesson=activeLesson;cpListening=checkpointItemForLesson(cpLesson);renderIntegratedListening();
};
function renderIntegratedListening(){
  const x=cpListening;
  lessonContent.innerHTML=`<div class="checkpoint"><div class="stage">Étape 4/5 · Compréhension orale</div><h2>Écoute sans lire</h2><p class="muted">Le vocabulaire est acquis. Maintenant il faut comprendre du luxembourgeois entendu.</p><button class="checkpointAudio" onclick="playCheckpointAudio(this)">▶ Écouter la phrase</button><div class="selfQ" style="font-size:19px">${x.q}</div>${x.opts.map((o,i)=>`<button class="checkpointChoice" onclick="answerCheckpoint(${i},this)">${o}</button>`).join('')}<div id="checkpointReveal"></div></div>`;
}
window.playCheckpointAudio=function(btn){try{cpPlayer?.pause();cpPlayer=new Audio(cpListening.audio);btn.textContent='🔊 Lecture…';cpPlayer.play().then(()=>cpPlayer.onended=()=>btn.textContent='▶ Réécouter').catch(()=>btn.textContent='Réessayer')}catch(e){btn.textContent='Réessayer'}};
window.answerCheckpoint=function(choice,btn){
  const buttons=btn.parentElement.querySelectorAll('.checkpointChoice');
  buttons.forEach((b,i)=>{b.disabled=true;if(i===cpListening.a)b.classList.add('good')});
  if(choice!==cpListening.a)btn.classList.add('bad');
  document.getElementById('checkpointReveal').innerHTML=`<div class="checkpointReveal"><b>Transcription :</b><br>${cpListening.text}</div><button class="primary" style="margin-top:12px" onclick="renderIntegratedSpeaking()">Continuer vers l’expression orale</button>`;
};
window.renderIntegratedSpeaking=function(){
  const prompt=oralPromptByLesson[cpLesson]||`Utilise au moins deux éléments de la leçon « ${lessons[cpLesson].title} » dans une réponse à voix haute.`;
  lessonContent.innerHTML=`<div class="checkpoint"><div class="stage">Étape 5/5 · Expression orale</div><h2>À toi de parler</h2><div class="selfQ" style="font-size:20px">${prompt}</div><p class="muted">Réponds réellement à voix haute, sans lire une réponse préparée.</p><button class="primary" onclick="document.getElementById('speakJudge').style.display='block';this.style.display='none'">J’ai répondu</button><div id="speakJudge" style="display:none"><div class="checkpointReveal">Auto-évalue uniquement si tu as réellement produit la réponse sans regarder le vocabulaire.</div><div class="judge"><button class="no" onclick="finishIntegratedLesson(false)">À revoir</button><button class="yes" onclick="finishIntegratedLesson(true)">Je savais répondre</button></div></div></div>`;
};
window.finishIntegratedLesson=function(ok){
  if(!ok){lessonContent.innerHTML=`<div class="card" style="text-align:center;padding:28px"><div style="font-size:48px">↻</div><h2>Expression orale à revoir</h2><p class="muted">Le vocabulaire est bon, mais cette leçon n’est pas encore validée. Refais-la en essayant de parler plus spontanément.</p><button class="primary" onclick="openLesson(cpLesson)">Revoir la leçon</button></div>`;return}
  if(!state.done.includes(cpLesson)){state.done.push(cpLesson);state.done.sort((a,b)=>a-b);save()}
  lessonContent.innerHTML=`<div class="card" style="text-align:center;padding:28px"><div style="font-size:48px">✓</div><h2>Leçon complètement maîtrisée</h2><p class="muted">Vocabulaire + compréhension orale + expression orale validés.</p><button class="primary" onclick="show('home')">Retour au parcours</button></div>`;
};

// Met à jour l'intitulé de la zone orale.
const newsHero=document.querySelector('#news .newsHero');
if(newsHero){newsHero.querySelector('.eyebrow').textContent='Entraînement oral';newsHero.querySelector('h2').textContent='Comprendre et parler.';newsHero.querySelector('p').textContent='Deux parcours séparés, en plus des checkpoints obligatoires intégrés aux leçons.'}

document.title='Sproochentest Lëtzebuergesch V19.7';
renderHome();
})();