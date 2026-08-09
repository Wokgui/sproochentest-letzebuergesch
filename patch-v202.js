// V20.2 — accueil pro, vocabulaire complet 2 sens, oral vraiment guidé
(function(){
'use strict';

const style=document.createElement('style');
style.textContent=`
:root{--bg:#f5f7fb;--ink:#142033;--muted:#69778b;--line:#dfe5ed;--blue:#1478d4;--blue2:#e8f3fd}
body{background:var(--bg)}
.app{padding-top:14px}
.top{margin-bottom:10px}
#home .hero{padding:8px 0 12px!important;margin:0!important}
#home .hero .eyebrow{font-size:11px}
#home .hero h2{font-size:27px;margin:5px 0 6px}
#home .hero p{font-size:13px;margin:0 0 10px}
#home .hero .primary{padding:13px 15px;border-radius:13px}
#overviewBox{display:none!important}
.v202dash{margin:8px 0 18px}
.v202progressLine{display:flex;align-items:center;gap:10px;padding:10px 0 14px;border-bottom:1px solid var(--line)}
.v202progressLine strong{font-size:20px}.v202progressLine .grow{flex:1}.v202progressLine .progress{margin:0;height:8px}
.v202skills{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:13px}
.v202skill{display:flex;align-items:flex-start;gap:9px;text-align:left;padding:12px;border-radius:14px;background:#eaf0f6;color:var(--ink);min-height:82px}
.v202skill .ico{font-size:21px;line-height:1}.v202skill b{display:block;font-size:14px}.v202skill small{display:block;color:var(--muted);font-size:11px;line-height:1.3;margin-top:3px;font-weight:500}
.v202section{font-size:12px;font-weight:850;color:var(--muted);text-transform:uppercase;letter-spacing:.6px;margin:20px 0 7px}
#path{margin:0!important}
.pathItem{padding:12px 0}.dot{width:34px;height:34px;flex-basis:34px}.pathItem b{font-size:14px}.pathItem small{font-size:11px}
.bottomTools{margin-top:24px!important;padding-top:15px!important}
.v202lessonHead{display:flex;gap:11px;align-items:center;padding-bottom:12px;border-bottom:1px solid var(--line);margin-bottom:4px}
.v202lessonHead .lessonNo{width:43px;height:43px;border-radius:13px;font-size:17px}
.v202lessonHead h2{font-size:22px;margin:2px 0}.v202lessonHead .tiny{font-size:11px}
.v202words{margin-top:4px}.v202word{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;padding:12px 0;border-bottom:1px solid var(--line)}
.v202word .lux{font-size:20px}.v202word .fr{font-size:13px;margin-top:2px}.v202word .audioBtn{font-size:12px;padding:7px 9px;border-radius:10px}.v202word .audioStatus{display:none}
.v202start{margin-top:14px}
.v202stage{font-size:11px;font-weight:850;color:var(--blue);text-transform:uppercase;letter-spacing:.55px;margin:2px 0 6px}
.v202counter{font-size:11px;color:var(--muted);margin-bottom:14px}.v202prompt{font-size:25px;font-weight:850;line-height:1.18;margin:14px 0 8px}
.v202revealBtn{width:auto!important;display:inline-block;padding:9px 13px!important;border-radius:11px!important;background:#e7eef5!important;color:#31506b!important;font-size:13px!important;font-weight:800!important}
.v202answer{font-size:22px;font-weight:850;padding:13px 0 5px}
.v202judge{display:flex;gap:8px;margin-top:10px}.v202judge button{flex:1;padding:11px;border-radius:11px;font-weight:800}.v202judge .no{background:var(--red2);color:var(--red)}.v202judge .yes{background:var(--green2);color:var(--green)}
.v202summary{padding:8px 0}.v202summary strong{font-size:26px}.v202mini{font-size:12px;color:var(--muted);line-height:1.4}
.v202audioChoice{display:block;width:100%;text-align:left;padding:11px;border-radius:11px;background:#e9eef3;border:1px solid var(--line);margin:7px 0;color:var(--ink)}
.v202audioChoice.good{background:var(--green2);border-color:#9cdbbd}.v202audioChoice.bad{background:var(--red2);border-color:#f2adb4}
.v202trans button{width:100%;padding:9px 11px;border-radius:10px;background:#e7eef5;color:#31506b;font-weight:800;margin-top:7px}.v202trans .box{display:none;padding:10px 11px;border-radius:10px;background:#e9eef3;margin-top:5px;line-height:1.4}.v202trans .label{font-size:10px;color:var(--muted);font-weight:850;text-transform:uppercase;margin-bottom:3px}
.v202speakGoal{font-size:20px;font-weight:850;line-height:1.25;margin:8px 0 14px}.v202guide{padding:9px 0;border-bottom:1px solid var(--line)}.v202guide b{display:block;font-size:13px;margin-bottom:2px}.v202guide span{font-size:12px;color:var(--muted);line-height:1.35}
.v202chips{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}.v202chips span{padding:6px 8px;border-radius:9px;background:var(--blue2);color:#145f9f;font-size:12px;font-weight:750}
.v202example{display:none;padding:10px 0;color:var(--ink);font-size:13px;line-height:1.45;border-top:1px solid var(--line);border-bottom:1px solid var(--line);margin:10px 0}
.v202checks{margin-top:12px}.v202check{display:flex;align-items:flex-start;gap:9px;padding:9px 0;border-bottom:1px solid var(--line);font-size:13px}.v202check input{width:19px;height:19px;margin-top:0}.v202eval{margin-top:12px}
`;
document.head.appendChild(style);

function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function mixedBothWays(){
 const pool=[];lessons[activeLesson].words.forEach((w,id)=>{pool.push({id,dir:'Français → luxembourgeois',q:w[1],a:w[0]});pool.push({id,dir:'Luxembourgeois → français',q:w[0],a:w[1]})});shuffle(pool);
 const out=[];while(pool.length){const prev=out[out.length-1];let c=pool.map((x,i)=>({x,i})).filter(y=>!prev||y.x.id!==prev.id);if(!c.length)c=pool.map((x,i)=>({x,i}));out.push(pool.splice(c[Math.floor(Math.random()*c.length)].i,1)[0])}return out
}

// Accueil : une action principale + deux entraînements ciblés expliqués.
const previousHome=window.renderHome;
window.renderHome=function(){
 previousHome();
 const done=(state.done||[]).length,pct=Math.round(done/lessons.length*100),next=Math.min(done,lessons.length-1);
 const hero=document.querySelector('#home .hero');
 if(hero){
  const eyebrow=hero.querySelector('.eyebrow');if(eyebrow)eyebrow.textContent='Prochaine étape';
  const h=hero.querySelector('h2');if(h)h.textContent=`Leçon ${next+1} · ${lessons[next].title}`;
  const p=hero.querySelector('p');if(p)p.textContent='Vocabulaire complet → compréhension orale → expression orale guidée.';
  const btn=hero.querySelector('.primary');if(btn){btn.textContent=done?'Continuer la leçon':'Commencer';btn.onclick=()=>openLesson(next)}
 }
 let dash=document.getElementById('v202dash');
 if(!dash){dash=document.createElement('div');dash.id='v202dash';dash.className='v202dash';hero?.insertAdjacentElement('afterend',dash)}
 if(dash)dash.innerHTML=`<div class="v202progressLine"><div><strong>${done}/${lessons.length}</strong><div class="tiny">leçons validées</div></div><div class="grow"><div class="progress"><span style="width:${pct}%"></span></div><div class="tiny" style="margin-top:5px">${pct}% du parcours</div></div></div><div class="v202skills"><button class="v202skill" onclick="openOralSection('listen')"><span class="ico">🎧</span><span><b>Compréhension</b><small>Entraînement libre d’écoute. Les écoutes obligatoires restent aussi dans chaque leçon.</small></span></button><button class="v202skill" onclick="openOralSection('speak')"><span class="ico">🗣️</span><span><b>Expression</b><small>Entraînement libre pour parler. L’expression guidée reste aussi dans chaque leçon.</small></span></button></div>`;
 document.querySelectorAll('#home .sectionTitle').forEach(x=>{const h=x.querySelector('h3');if(h&&h.textContent.includes('Parcours')){h.textContent='Parcours';const s=x.querySelector('small');if(s)s.textContent='30 leçons'}});
 document.querySelectorAll('.brand small').forEach(x=>x.textContent='V20.2 · préparation Sproochentest');
};

// Écran d'apprentissage vocabulaire plus compact.
window.renderLessonWords=function(){
 const l=lessons[activeLesson];
 lessonContent.innerHTML=`<div class="v202lessonHead"><div class="lessonNo">${activeLesson+1}</div><div><div class="tiny">Leçon ${activeLesson+1}/${lessons.length}</div><h2>${l.title}</h2><div class="tiny">${l.words.length} éléments · chacun sera travaillé dans les 2 sens</div></div></div><div class="v202words">${l.words.map(w=>`<div class="word v202word"><div><div class="lux">${w[0]}</div><div class="fr">${w[1]}</div><span class="audioStatus"></span></div><button class="audioBtn">🔊 Écouter</button></div>`).join('')}</div><button class="primary v202start" onclick="startLessonPractice()">Mémoriser les ${l.words.length} éléments</button>`;
};

// Entraînement : absolument tous les mots dans les deux sens.
let prac=[],pracPos=0,pracKnown=0,pracShown=false;
window.startLessonPractice=function(){prac=mixedBothWays();pracPos=0;pracKnown=0;renderPractice()};
function renderPractice(){
 if(pracPos>=prac.length){lessonContent.innerHTML=`<div class="v202summary"><div class="v202stage">Mémorisation terminée</div><strong>${prac.length}/${prac.length}</strong><p class="v202mini">Tous les éléments ont été présentés une fois dans chaque sens. Le test final va maintenant reprendre les ${prac.length} cartes dans un nouvel ordre.</p><button class="primary" onclick="startQuiz()">Passer au test complet</button></div>`;return}
 const c=prac[pracPos];pracShown=false;lessonContent.innerHTML=`<div class="v202stage">Mémorisation · ${c.dir}</div><div class="v202counter">${pracPos+1}/${prac.length}</div><div class="v202prompt">${c.q}</div><button class="v202revealBtn" onclick="v202RevealPractice()">Révéler la réponse</button><div id="v202PracticeAnswer"></div>`
}
window.v202RevealPractice=function(){if(pracShown)return;pracShown=true;const c=prac[pracPos];document.getElementById('v202PracticeAnswer').innerHTML=`<div class="v202answer">${c.a}</div><div class="v202judge"><button class="no" onclick="v202JudgePractice(false)">À revoir</button><button class="yes" onclick="v202JudgePractice(true)">Je savais</button></div>`};
window.v202JudgePractice=function(ok){if(ok)pracKnown++;pracPos++;renderPractice()};

// Test : tous les éléments, encore dans les deux sens.
let test=[],testPos=0,testGood=0,testShown=false;
window.startQuiz=function(){test=mixedBothWays();testPos=0;testGood=0;renderTest()};
function renderTest(){
 if(testPos>=test.length){finishTest();return}
 const c=test[testPos];testShown=false;lessonContent.innerHTML=`<div class="v202stage">Test complet · ${c.dir}</div><div class="v202counter">${testPos+1}/${test.length} · tous les mots passent dans les 2 sens</div><div class="v202prompt">${c.q}</div><button class="v202revealBtn" onclick="v202RevealTest()">Révéler</button><div id="v202TestAnswer"></div>`
}
window.v202RevealTest=function(){if(testShown)return;testShown=true;const c=test[testPos];document.getElementById('v202TestAnswer').innerHTML=`<div class="v202answer">${c.a}</div><div class="v202judge"><button class="no" onclick="v202JudgeTest(false)">À revoir</button><button class="yes" onclick="v202JudgeTest(true)">Je savais</button></div>`};
window.v202JudgeTest=function(ok){if(ok)testGood++;testPos++;renderTest()};
function finishTest(){const pct=Math.round(testGood/test.length*100);if(pct<80){lessonContent.innerHTML=`<div class="v202summary"><div class="v202stage">Résultat vocabulaire</div><strong>${pct}%</strong><p class="v202mini">${testGood}/${test.length} réponses déclarées sues. Il faut 80 % pour passer à la compréhension orale.</p><button class="primary" onclick="startQuiz()">Refaire le test complet</button><button class="secondary" style="width:100%;margin-top:8px" onclick="renderLessonWords()">Revoir les mots</button></div>`;return}startListening()}

// Plusieurs écoutes humaines ; transcription LU + FR masquée.
const aud=[
 {u:'https://lod.lu/uploads/examples/OGG/9b/9bb3ff56b0168aa51fe1737239761208.ogg',lu:'moien, Madamm, wat kann ech fir Iech maachen?',fr:'Bonjour Madame, que puis-je faire pour vous ?',q:'Que fait la personne ?',o:['Elle salue et propose son aide.','Elle dit au revoir.','Elle demande l’heure.'],a:0},
 {u:'https://lod.lu/uploads/examples/OGG/f2/f20e0cdaccb6c76c06f8720ac34ac7a9.ogg',lu:'moien, wéi geet et?',fr:'Bonjour, comment ça va ?',q:'Que demande la personne ?',o:['Comment ça va ?','Où habites-tu ?','Quel âge as-tu ?'],a:0},
 {u:'https://lod.lu/uploads/examples/OGG/92/926b1dbd7e2c5081e03a3a1a229605d8.ogg',lu:'salut, ech ginn elo heem!',fr:'Salut, je rentre maintenant à la maison !',q:'Que va faire la personne ?',o:['Elle rentre chez elle.','Elle va travailler.','Elle va au restaurant.'],a:0},
 {u:'https://lod.lu/uploads/examples/OGG/57/5708aa802f9771f2a431a9310f609b90.ogg',lu:'ech wunnen zu Eech',fr:'J’habite à Eich.',q:'Que dit la personne ?',o:['Elle habite à Eech.','Elle travaille à Eech.','Elle vient d’Eech.'],a:0},
 {u:'https://lod.lu/uploads/examples/OGG/99/993dc701e65f000216eed16a3d7b4dc0.ogg',lu:'déi nei Buslinn fiert vun der Gare op de Flughafen',fr:'La nouvelle ligne de bus va de la gare à l’aéroport.',q:'Quel trajet est annoncé ?',o:['De la gare à l’aéroport.','De l’aéroport au magasin.','De l’école à la gare.'],a:0},
 {u:'https://lod.lu/uploads/examples/OGG/bd/bd64bfea677c6f9acc314b9fd4ed0cb2.ogg',lu:'mir hunn eng Taass Kaffi gedronk',fr:'Nous avons bu une tasse de café.',q:'Qu’ont-ils bu ?',o:['Une tasse de café.','Un verre d’eau.','Du thé.'],a:0}
];
function audioSet(i){if(i===0)return aud.slice(0,3);let s=3+(i%3);return [aud[s%aud.length],aud[(s+1)%aud.length],aud[(s+2)%aud.length]]}
let listens=[],li=0,player=null;
function startListening(){listens=audioSet(activeLesson);li=0;renderListening()}
function renderListening(){if(li>=listens.length){renderSpeaking();return}const x=listens[li];lessonContent.innerHTML=`<div class="v202stage">Compréhension orale · ${li+1}/${listens.length}</div><h2 style="margin:5px 0 10px">Écoute sans lire</h2><button class="primary" onclick="v202Play(this)">▶ Écouter</button><div class="v202prompt" style="font-size:19px">${x.q}</div>${x.o.map((o,i)=>`<button class="v202audioChoice" onclick="v202AnswerAudio(${i},this)">${o}</button>`).join('')}<div id="v202AudioReveal"></div>`}
window.v202Play=function(btn){const x=listens[li];try{player?.pause();player=new Audio(x.u);btn.textContent='🔊 Lecture…';player.play().then(()=>player.onended=()=>btn.textContent='▶ Réécouter').catch(()=>btn.textContent='Réessayer')}catch(e){btn.textContent='Réessayer'}};
window.v202AnswerAudio=function(choice,btn){const x=listens[li],bs=btn.parentElement.querySelectorAll('.v202audioChoice');bs.forEach((b,i)=>{b.disabled=true;if(i===x.a)b.classList.add('good')});if(choice!==x.a)btn.classList.add('bad');document.getElementById('v202AudioReveal').innerHTML=`<div class="v202trans"><button onclick="v202Toggle(this,'lu')">Afficher le luxembourgeois</button><div class="box" data-lang="lu"><div class="label">Luxembourgeois</div>${x.lu}</div><button onclick="v202Toggle(this,'fr')">Afficher le français</button><div class="box" data-lang="fr"><div class="label">Français</div>${x.fr}</div></div><button class="primary" style="margin-top:11px" onclick="v202NextAudio()">${li+1<listens.length?'Écoute suivante':'Passer à l’expression orale'}</button>`};
window.v202Toggle=function(btn,lang){const box=btn.parentElement.querySelector(`[data-lang="${lang}"]`),open=box.style.display==='block';box.style.display=open?'none':'block';btn.textContent=(open?'Afficher ':'Masquer ')+(lang==='lu'?'le luxembourgeois':'le français')};
window.v202NextAudio=function(){li++;renderListening()};

// Expression orale : objectif + étapes + amorces + exemple + grille d'auto-évaluation.
const guides={
0:{goal:'Salue une personne, échange une formule simple puis prends congé.',steps:['Dis bonjour.','Ajoute une courte formule sociale.','Termine par au revoir ou à bientôt.'],chips:['Moien','Wéi geet et?','Äddi','Bis geschwënn'],example:'Moien! Wéi geet et? … Äddi, bis geschwënn!'},
3:{goal:'Présente-toi en 3 ou 4 phrases.',steps:['Donne ton prénom.','Dis d’où tu viens.','Dis où tu habites.','Ajoute une information simple.'],chips:['Ech heeschen …','Ech kommen aus …','Ech wunnen zu …'],example:'Ech heeschen Anne-Sophie. Ech kommen aus Frankräich. Ech wunnen zu …'},
8:{goal:'Parle de ta famille pendant environ 30 secondes.',steps:['Présente ta famille.','Choisis une personne.','Donne un détail simple sur elle.'],chips:['Meng Famill …','Meng Mamm …','Mäi Papp …','Ech hunn …'],example:'Meng Famill ass … Ech hunn … Meng Mamm …'},
27:{goal:'Décris une image de façon organisée.',steps:['Dis d’abord ce que représente la scène.','Décris les personnes ou objets.','Dis ce qu’ils font.','Situe au moins un élément.'],chips:['Op dem Bild gesinn ech …','virun','hannert','nieft'],example:'Op dem Bild gesinn ech … Virun … ass … Nieft …'},
28:{goal:'Donne ton avis et justifie-le.',steps:['Annonce ton avis.','Donne une raison avec « well ».','Ajoute un exemple simple.'],chips:['Fir mech …','Ech mengen …','well …','Zum Beispill …'],example:'Fir mech ass … gutt, well … Zum Beispill …'}
};
function guide(i){if(guides[i])return guides[i];const l=lessons[i];return{goal:`Parle du thème « ${l.title} » en 3 phrases simples.`,steps:['Commence par une phrase directe.','Ajoute deux informations liées au thème.','Termine par une information personnelle ou une préférence.'],chips:l.words.slice(0,4).map(w=>w[0]),example:`Exemple possible : utilise 2 ou 3 éléments de la leçon « ${l.title} » dans des phrases courtes.`}}
function renderSpeaking(){const g=guide(activeLesson);lessonContent.innerHTML=`<div class="v202stage">Expression orale · étape finale</div><div class="v202speakGoal">${g.goal}</div>${g.steps.map((s,i)=>`<div class="v202guide"><b>${i+1}. ${s}</b><span>Prépare seulement l’idée, puis parle sans lire.</span></div>`).join('')}<div class="v202section">Amorces utiles</div><div class="v202chips">${g.chips.map(c=>`<span>${c}</span>`).join('')}</div><button class="v202revealBtn" onclick="v202ShowExample(this)">Voir un exemple possible</button><div class="v202example">${g.example}</div><button class="primary" style="margin-top:14px" onclick="v202StartEval()">J’ai répondu à voix haute</button><div id="v202Eval"></div>`}
window.v202ShowExample=function(btn){const e=btn.nextElementSibling,open=e.style.display==='block';e.style.display=open?'none':'block';btn.textContent=open?'Voir un exemple possible':'Masquer l’exemple'};
window.v202StartEval=function(){document.getElementById('v202Eval').innerHTML=`<div class="v202section">Auto-évaluation</div><div class="v202checks"><label class="v202check"><input type="checkbox" class="v202cb"><span>J’ai répondu au sujet demandé.</span></label><label class="v202check"><input type="checkbox" class="v202cb"><span>J’ai produit au moins 3 phrases compréhensibles.</span></label><label class="v202check"><input type="checkbox" class="v202cb"><span>J’ai utilisé au moins 2 mots ou expressions de la leçon.</span></label><label class="v202check"><input type="checkbox" class="v202cb"><span>J’ai parlé sans lire une réponse préparée.</span></label></div><button class="primary v202eval" onclick="v202EvaluateSpeaking()">Valider mon auto-évaluation</button>`};
window.v202EvaluateSpeaking=function(){const n=[...document.querySelectorAll('.v202cb')].filter(x=>x.checked).length;if(n<3){document.getElementById('v202Eval').insertAdjacentHTML('beforeend',`<p class="v202mini">${n}/4 critères. Recommence l’expression orale en t’aidant des repères ci-dessus.</p><button class="secondary" style="width:100%" onclick="v202RestartSpeaking()">Réessayer</button>`);return}if(!state.done.includes(activeLesson)){state.done.push(activeLesson);state.done.sort((a,b)=>a-b);save()}lessonContent.innerHTML=`<div class="v202summary" style="text-align:center"><div style="font-size:42px">✓</div><h2>Leçon validée</h2><p class="v202mini">Vocabulaire complet dans les deux sens + compréhension orale + expression orale auto-évaluée.</p><button class="primary" onclick="show('home')">Retour au parcours</button></div>`};
window.v202RestartSpeaking=renderSpeaking;

document.title='Sproochentest Lëtzebuergesch V20.2';
renderHome();
})();