// V19.8 — vocabulaire complet, plusieurs écoutes thématiques, oral guidé, historique/reset
(function(){
'use strict';

const css=document.createElement('style');
css.textContent=`
.historyTools{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0 14px}.historyTools button{padding:11px;border-radius:12px;font-weight:800}.historyTools .redo{background:var(--blue2);color:var(--blue)}.historyTools .reset{background:#fff0f1;color:#b92b39;border:1px solid #f2c4c9}
.vocabSummary{padding:12px;border-radius:13px;background:#f5f8fc;margin:10px 0;font-size:13px;line-height:1.45}.listenProgress{font-size:12px;color:var(--muted);margin:7px 0}.guideSteps{margin:12px 0}.guideStep{padding:10px 12px;border-left:3px solid #d7e8f8;background:#f8fbfe;margin:7px 0;border-radius:0 12px 12px 0}.guideStep b{display:block;margin-bottom:3px}.phraseBank{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}.phraseBank span{padding:7px 9px;border-radius:10px;background:var(--blue2);color:#145f9f;font-size:12px;font-weight:750}.examFormat{padding:13px;border-radius:14px;background:#fff8ee;border:1px solid #f1dfc5;margin:10px 0}.examFormat b{display:block;margin-bottom:4px}.oldLessonSelect{width:100%;padding:12px;border-radius:12px;border:1px solid var(--line);background:#fff;color:var(--ink);margin:8px 0 10px}
`;
document.head.appendChild(css);

// ---------- Banque d'écoutes thématiques humaines LOD ----------
const clips={
 greetings:[
  {audio:'https://lod.lu/uploads/examples/OGG/9b/9bb3ff56b0168aa51fe1737239761208.ogg',text:'moien, Madamm, wat kann ech fir Iech maachen?',q:'Que fait la personne ?',opts:['Elle salue et propose son aide.','Elle dit au revoir.','Elle demande l’heure.'],a:0},
  {audio:'https://lod.lu/uploads/examples/OGG/f2/f20e0cdaccb6c76c06f8720ac34ac7a9.ogg',text:'moien, wéi geet et?',q:'Que demande la personne ?',opts:['Comment ça va ?','Où habites-tu ?','Quel âge as-tu ?'],a:0},
  {audio:'https://lod.lu/uploads/examples/OGG/92/926b1dbd7e2c5081e03a3a1a229605d8.ogg',text:'salut, ech ginn elo heem!',q:'Que va faire la personne ?',opts:['Elle rentre chez elle.','Elle va travailler.','Elle va au restaurant.'],a:0}
 ],
 present:[
  {audio:'https://lod.lu/uploads/examples/OGG/57/5708aa802f9771f2a431a9310f609b90.ogg',text:'ech wunnen zu Eech',q:'Que dit la personne ?',opts:['Elle habite à Eech.','Elle travaille à Eech.','Elle vient d’Eech.'],a:0},
  {audio:'https://lod.lu/uploads/examples/OGG/7a/7af2674e596a6c81e13aa53e3bfd8a89.ogg',text:'fiert dëse Bus op Eech?',q:'Que demande la personne ?',opts:['Si ce bus va à Eech.','Le prix du bus.','L’heure du train.'],a:0}
 ],
 family:[
  {audio:'https://lod.lu/uploads/examples/OGG/4c/4c07e6d399dd264468724335b5b92e9a.ogg',text:'mat aacht Kanner si mir eng aussergewéinlech grouss Famill',q:'Pourquoi cette famille est-elle grande ?',opts:['Elle a huit enfants.','Elle habite dans huit maisons.','Elle a huit voitures.'],a:0},
  {audio:'https://lod.lu/uploads/examples/OGG/07/07cfa81a44b151a932f9716eac736257.ogg',text:'ech hu Famill an der Schwäiz',q:'Où la personne a-t-elle de la famille ?',opts:['En Suisse.','Au Luxembourg.','En Belgique.'],a:0}
 ],
 time:[
  {audio:'https://lod.lu/uploads/examples/OGG/9b/9bd1640635f4d3031bc70763e5aa8694.ogg',text:'erwäch mech muer de Moien ëm siwen Auer!',q:'À quelle heure faut-il réveiller la personne ?',opts:['À sept heures.','À huit heures.','À midi.'],a:0},
  {audio:'https://lod.lu/uploads/examples/OGG/cf/cf4bbfbc34e19d8fb2b4206c75518e58.ogg',text:'ëm wéi vill Auer iesst dir gewéinlech zu Moien?',q:'De quoi parle la question ?',opts:['De l’heure du petit-déjeuner.','De l’heure du travail.','De l’heure du train.'],a:0}
 ],
 house:[
  {audio:'https://lod.lu/uploads/examples/OGG/16/16aa77de612cf26ec7db36d7ba5331aa.ogg',text:'mir hunn nach vill Aarbecht ronderëm eist neit Haus',q:'De quoi parle-t-on ?',opts:['De travaux autour d’une nouvelle maison.','D’un déménagement au bureau.','D’une nouvelle voiture.'],a:0},
  {audio:'https://lod.lu/uploads/examples/OGG/4c/4c319890785f39942c34f829d99b4300.ogg',text:'an eiser Strooss ginn dräi Haiser gebaut',q:'Que se passe-t-il dans la rue ?',opts:['Trois maisons sont construites.','Trois maisons sont vendues.','Une route est fermée.'],a:0}
 ],
 food:[
  {audio:'https://lod.lu/uploads/examples/OGG/bd/bd64bfea677c6f9acc314b9fd4ed0cb2.ogg',text:'mir hunn eng Taass Kaffi gedronk',q:'Qu’ont-ils bu ?',opts:['Une tasse de café.','Un verre d’eau.','Du thé.'],a:0},
  {audio:'https://lod.lu/uploads/examples/OGG/4c/4c4f9a38005924e30b5af0572dc95d29.ogg',text:'hien drénkt nëmme schwaarze Kaffi',q:'Quel café boit-il ?',opts:['Seulement du café noir.','Du café au lait.','Il ne boit pas de café.'],a:0},
  {audio:'https://lod.lu/uploads/examples/OGG/60/60400894c0e61156c798c8843ae929d8.ogg',text:'bestell eis nach zwee Kaffien!',q:'Combien de cafés faut-il commander ?',opts:['Deux.','Un.','Trois.'],a:0}
 ],
 transport:[
  {audio:'https://lod.lu/uploads/examples/OGG/99/993dc701e65f000216eed16a3d7b4dc0.ogg',text:'déi nei Buslinn fiert vun der Gare op de Flughafen',q:'Quel trajet est annoncé ?',opts:['De la gare à l’aéroport.','De l’aéroport au magasin.','De l’école à la gare.'],a:0},
  {audio:'https://lod.lu/uploads/examples/OGG/5e/5e89147416f5f194d1231df26ec7d19c.ogg',text:'am Autobus sinn nach Sëtzplaze fräi',q:'Quelle information est donnée ?',opts:['Il reste des places assises.','Le bus est complet.','Le bus est en retard.'],a:0}
 ],
 work:[
  {audio:'https://lod.lu/uploads/examples/OGG/40/40836e9206b1d78780016006811f0bc4.ogg',text:'ech kann elo kee Congé huelen, ech hunn ze vill Aarbecht um Büro',q:'Pourquoi la personne ne prend-elle pas congé ?',opts:['Elle a trop de travail au bureau.','Elle est malade.','Elle part en voyage.'],a:0},
  {audio:'https://lod.lu/uploads/examples/OGG/13/13de89caafec442213caf9dfeef11f25.ogg',text:'ech maachen all Dag no der Aarbecht Sport',q:'Que fait la personne après le travail ?',opts:['Du sport.','Elle dort.','Elle cuisine.'],a:0},
  {audio:'https://lod.lu/uploads/examples/OGG/87/8752beb7371d16d43964e9a7f9734d35.ogg',text:"ech fueren all Dag dee selwechte Wee op d'Aarbecht",q:'Que fait la personne chaque jour ?',opts:['Elle prend le même chemin pour aller au travail.','Elle change de travail.','Elle travaille à domicile.'],a:0}
 ],
 leisure:[
  {audio:'https://lod.lu/uploads/examples/OGG/fe/fe0f05cac51195df10d8abdbebeeb928.ogg',text:'ech maache reegelméisseg Sport, fir a Form ze bleiwen',q:'Pourquoi la personne fait-elle du sport ?',opts:['Pour rester en forme.','Pour gagner de l’argent.','Pour aller au travail.'],a:0},
  {audio:'https://lod.lu/uploads/examples/OGG/df/dfe74a88bf9cd54fe685e5b9edb74489.ogg',text:'an der Zeitung interesséiert mech virun allem de Sport',q:'Quelle rubrique intéresse surtout la personne ?',opts:['Le sport.','La météo.','La politique.'],a:0}
 ],
 weather:[
  {audio:'https://lod.lu/uploads/examples/OGG/fe/fef9b02ea8a96664cdf7fb8ace799f71.ogg',text:'wa schéint Wieder ass, si vill Cyclisten op der Strooss',q:'Que se passe-t-il quand il fait beau ?',opts:['Il y a beaucoup de cyclistes.','Les bus s’arrêtent.','Tout le monde reste chez soi.'],a:0},
  {audio:'https://lod.lu/uploads/examples/OGG/32/326d946b134d79ed507e0984cef18ad4.ogg',text:"maach de Radio méi haart, ech wëll d'Wieder lauschteren!",q:'Pourquoi faut-il monter le son ?',opts:['Pour écouter la météo.','Pour écouter un match.','Pour téléphoner.'],a:0}
 ]
};
function categoryForLesson(i){if(i<=2)return'greetings';if(i<=7)return'present';if(i===8)return'family';if(i>=9&&i<=11)return'time';if(i===12||i===27)return'house';if(i===13||i===14||i===22||i===23)return'food';if(i===15||i===16)return'transport';if(i===17)return'work';if(i===18)return'leisure';if(i===19)return'weather';if(i===20)return'present';if(i===21)return'present';if(i>=24&&i<=26)return'present';if(i===28)return'work';return'transport'}
function clipsForLesson(i){const arr=clips[categoryForLesson(i)]||clips.present;return arr.slice(0,Math.min(3,arr.length))}

// ---------- Outils progression ----------
window.openOldLessonChooser=function(){
 const done=(state.done||[]).slice().sort((a,b)=>a-b);
 const opts=done.length?done.map(i=>`<option value="${i}">Leçon ${i+1} · ${lessons[i].title}</option>`).join(''):'<option>Aucune leçon terminée</option>';
 const host=document.getElementById('oldLessonBox');if(!host)return;
 host.innerHTML=`<select id="oldLessonSelect" class="oldLessonSelect" ${done.length?'':'disabled'}>${opts}</select><button class="primary" ${done.length?'':'disabled'} onclick="openLesson(Number(document.getElementById('oldLessonSelect').value))">Refaire cette leçon</button>`;
};
window.resetAllProgress=function(){
 if(!confirm('Tout réinitialiser ? Toutes les leçons terminées et la progression locale seront effacées.'))return;
 localStorage.removeItem(KEY);state={done:[],seen:[],streak:1};save();renderHome();show('home');
};
const homeRenderPrev=window.renderHome;
window.renderHome=function(){homeRenderPrev();let tools=document.getElementById('historyTools');const path=document.getElementById('path');if(!tools&&path){tools=document.createElement('div');tools.id='historyTools';path.parentElement.insertBefore(tools,path)}if(tools)tools.innerHTML=`<div class="historyTools"><button class="redo" onclick="openOldLessonChooser()">↺ Refaire une leçon</button><button class="reset" onclick="resetAllProgress()">Tout réinitialiser</button></div><div id="oldLessonBox"></div>`;document.querySelectorAll('.brand small').forEach(x=>x.textContent='Départ zéro · V19.8')};

// ---------- Exercices de vocabulaire : TOUS les mots, dans les 2 sens ----------
let fullPractice=[],fullPracticeIndex=0;
function mixNoTwin(cards){const pool=cards.slice();for(let i=pool.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[pool[i],pool[j]]=[pool[j],pool[i]]}const out=[];while(pool.length){const prev=out[out.length-1];let choices=pool.map((c,i)=>({c,i})).filter(x=>!prev||x.c.id!==prev.id);if(!choices.length)choices=pool.map((c,i)=>({c,i}));const p=choices[Math.floor(Math.random()*choices.length)].i;out.push(pool.splice(p,1)[0])}return out}
window.startLessonPractice=function(){const l=lessons[activeLesson],cards=[];l.words.forEach((w,id)=>{cards.push({id,type:'FR → LB',prompt:w[1],answer:w[0]});cards.push({id,type:'LB → FR',prompt:w[0],answer:w[1]})});fullPractice=mixNoTwin(cards);fullPracticeIndex=0;renderFullPractice()};
window.renderFullPractice=function(){if(fullPracticeIndex>=fullPractice.length){lessonContent.innerHTML=`<div class="card"><div class="eyebrow">Entraînement vocabulaire terminé</div><h2>${fullPractice.length} cartes vues</h2><p class="muted">Tous les mots ont été demandés une fois en français → luxembourgeois et une fois en luxembourgeois → français. Le test final va les reprendre dans un nouvel ordre mélangé.</p><button class="primary" onclick="startQuiz()">Commencer le test vocabulaire</button></div>`;return}const c=fullPractice[fullPracticeIndex];lessonContent.innerHTML=`<div class="exerciseBox"><div class="exerciseType">${c.type}</div><div class="tiny">Vocabulaire ${fullPracticeIndex+1}/${fullPractice.length}</div><div class="selfQ">${c.prompt}</div><p class="muted">Réponds sans proposition.</p><button class="primary" onclick="revealFullPractice()">Révéler</button><div id="fullPracticeAnswer"></div></div>`};
window.revealFullPractice=function(){const c=fullPractice[fullPracticeIndex],h=document.getElementById('fullPracticeAnswer');if(h)h.innerHTML=`<div class="reveal">${c.answer}</div><button class="primary" onclick="nextFullPractice()">Suivant</button>`};
window.nextFullPractice=function(){fullPracticeIndex++;renderFullPractice()};

// ---------- Après test vocabulaire : plusieurs écoutes thématiques ----------
let multiClips=[],multiIndex=0,multiPlayer=null,multiCorrect=0;
window.finishSelfTest=(function(prev){return function(){
 const good=(typeof trackedGood!=='undefined'?trackedGood:0),total=(typeof trackedTotal!=='undefined'?trackedTotal:lessons[activeLesson].words.length*2),pct=total?Math.round(good/total*100):0;
 if(pct<80){lessonContent.innerHTML=`<div class="card" style="text-align:center;padding:28px"><div style="font-size:48px">↻</div><h2>Vocabulaire à consolider</h2><p class="muted">${good}/${total} · ${pct} %. Il faut 80 %.</p><button class="primary" onclick="openLesson(activeLesson)">Revoir la leçon</button></div>`;return}
 multiClips=clipsForLesson(activeLesson);multiIndex=0;multiCorrect=0;renderMultiListening();
}})(window.finishSelfTest);
function renderMultiListening(){if(multiIndex>=multiClips.length){renderGuidedSpeaking();return}const x=multiClips[multiIndex];lessonContent.innerHTML=`<div class="checkpoint"><div class="stage">Compréhension ${multiIndex+1}/${multiClips.length}</div><h2>Écoute liée à la leçon</h2><div class="listenProgress">Plusieurs écoutes sont prévues, pas un seul extrait générique.</div><button class="checkpointAudio" onclick="playMultiClip(this)">▶ Écouter</button><div class="selfQ" style="font-size:19px">${x.q}</div>${x.opts.map((o,i)=>`<button class="checkpointChoice" onclick="answerMultiClip(${i},this)">${o}</button>`).join('')}<div id="multiReveal"></div></div>`}
window.renderMultiListening=renderMultiListening;
window.playMultiClip=function(btn){const x=multiClips[multiIndex];try{multiPlayer?.pause();multiPlayer=new Audio(x.audio);btn.textContent='🔊 Lecture…';multiPlayer.play().then(()=>multiPlayer.onended=()=>btn.textContent='▶ Réécouter').catch(()=>btn.textContent='Réessayer')}catch(e){btn.textContent='Réessayer'}};
window.answerMultiClip=function(choice,btn){const x=multiClips[multiIndex],buttons=btn.parentElement.querySelectorAll('.checkpointChoice');buttons.forEach((b,i)=>{b.disabled=true;if(i===x.a)b.classList.add('good')});if(choice!==x.a)btn.classList.add('bad');else multiCorrect++;document.getElementById('multiReveal').innerHTML=`<div class="checkpointReveal"><b>Transcription :</b><br>${x.text}</div><button class="primary" style="margin-top:12px" onclick="multiIndex++;renderMultiListening()">Écoute suivante</button>`};

// ---------- Expression orale avec repères ----------
const speakingGuides={
0:{prompt:'Salue une personne et prends congé.',steps:['Commence par une salutation.','Ajoute une petite phrase sociale.','Termine par une formule de départ.'],phrases:['Moien','Wéi geet et?','Äddi','Bis geschwënn']},
3:{prompt:'Présente-toi en 4 petites phrases.',steps:['Prénom','Origine','Lieu d’habitation','Une information personnelle simple'],phrases:['Ech heeschen …','Ech kommen aus …','Ech wunnen zu …','Ech sinn …']},
8:{prompt:'Parle de ta famille pendant environ 30 secondes.',steps:['Dis qui compose ta famille.','Choisis une personne.','Ajoute un détail simple sur elle.'],phrases:['Meng Famill …','Meng Mamm …','Mäi Papp …','Ech hunn …']},
17:{prompt:'Parle de ton travail ou d’une activité.',steps:['Dis ce que tu fais.','Dis où.','Dis si tu aimes ou non.','Ajoute une raison simple.'],phrases:['Ech schaffen …','Ech schaffen zu …','Ech hunn … gär','well …']},
18:{prompt:'Parle d’un loisir.',steps:['Nom du loisir','Quand tu le pratiques','Avec qui','Pourquoi tu l’aimes'],phrases:['Ech maachen …','Ech maachen dat …','mat …','well …']},
27:{prompt:'Décris une image imaginaire de manière organisée.',steps:['Vue générale : où sommes-nous ?','Personnes : qui vois-tu ?','Actions : que font-elles ?','Position : devant, derrière, à côté','Un détail ou une comparaison'],phrases:['Op dem Bild gesinn ech …','Do ass / sinn …','Hien / si …','virun','hannert','nieft']},
28:{prompt:'Donne ton avis et justifie-le.',steps:['Annonce ton avis.','Donne une raison.','Ajoute un exemple simple.'],phrases:['Fir mech …','Ech mengen …','well …','Zum Beispill …']},
29:{prompt:'Entraîne les phrases de secours utiles au test.',steps:['Demander de répéter','Demander de parler plus lentement','Dire que tu n’as pas compris'],phrases:['Kënnt Dir dat widderhuelen?','Méi lues, wann ech gelift.','Ech hunn dat net verstanen.']}
};
function guideFor(i){if(speakingGuides[i])return speakingGuides[i];if(i<8)return{prompt:'Fais 2 ou 3 phrases avec le contenu de cette leçon.',steps:['Commence par une phrase très courte.','Ajoute un deuxième élément appris.','Répète plus clairement si nécessaire.'],phrases:lessons[i].words.slice(0,4).map(w=>w[0])};if(i<17)return{prompt:'Parle du thème de la leçon pendant 20 à 30 secondes.',steps:['Annonce le thème.','Donne 2 informations simples.','Ajoute un détail personnel.'],phrases:lessons[i].words.slice(0,4).map(w=>w[0])};return{prompt:'Réponds comme dans un petit entretien A2.',steps:['Réponse directe','2 détails simples','Une justification ou préférence'],phrases:lessons[i].words.slice(0,4).map(w=>w[0])}}
function renderGuidedSpeaking(){const g=guideFor(activeLesson);lessonContent.innerHTML=`<div class="checkpoint"><div class="stage">Expression orale guidée</div><h2>${g.prompt}</h2><div class="guideSteps">${g.steps.map((s,i)=>`<div class="guideStep"><b>Repère ${i+1}</b>${s}</div>`).join('')}</div><div class="tiny">Mots / amorces utilisables :</div><div class="phraseBank">${g.phrases.map(p=>`<span>${p}</span>`).join('')}</div><p class="muted">Regarde d’abord les repères, puis cache-les mentalement et réponds à voix haute.</p><button class="primary" onclick="document.getElementById('guidedJudge').style.display='block';this.style.display='none'">J’ai répondu</button><div id="guidedJudge" style="display:none"><div class="judge"><button class="no" onclick="finishGuided(false)">À revoir</button><button class="yes" onclick="finishGuided(true)">J’ai pu répondre</button></div></div></div>`}
window.renderGuidedSpeaking=renderGuidedSpeaking;
window.finishGuided=function(ok){if(!ok){lessonContent.innerHTML=`<div class="card"><h2>À retravailler</h2><p class="muted">Revois la leçon puis refais les repères oraux.</p><button class="primary" onclick="openLesson(activeLesson)">Recommencer la leçon</button></div>`;return}if(!state.done.includes(activeLesson)){state.done.push(activeLesson);state.done.sort((a,b)=>a-b);save()}lessonContent.innerHTML=`<div class="card" style="text-align:center;padding:28px"><div style="font-size:48px">✓</div><h2>Leçon validée</h2><p class="muted">Vocabulaire complet dans les deux sens + ${multiClips.length} écoutes + expression orale guidée.</p><button class="primary" onclick="show('home')">Retour au parcours</button></div>`};

// ---------- Présentation fidèle du format officiel du Sproochentest ----------
const oldRenderNews=window.renderNews;
window.renderNews=function(){oldRenderNews();const host=document.getElementById('newsGate');if(!host)return;const intro=`<div class="card"><div class="eyebrow">Format officiel à viser</div><div class="examFormat"><b>Compréhension orale · B1</b>3 textes : information de journal radio · conversation quotidienne entre 2 personnes · échange ou présentation. Réponses par QCM.</div><div class="examFormat"><b>Expression orale · A2</b>2 × 5 minutes : entretien sur un thème choisi parmi 2, puis description d’un support visuel choisi parmi 3.</div><p class="tiny">Les petites phrases LOD servent à construire l’oreille au début. Les simulations avancées doivent ensuite reproduire ces formats plus longs.</p></div>`;host.insertAdjacentHTML('afterbegin',intro)};

document.title='Sproochentest Lëtzebuergesch V19.8';renderHome();
})();