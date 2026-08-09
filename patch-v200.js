// V20.0 — parcours direct, quiz fiable, oral enchaîné, outils en bas
(function(){
'use strict';

const css=document.createElement('style');
css.textContent=`
.bottomTools{margin:18px 0 4px;padding:14px;border:1px solid var(--line);border-radius:16px;background:#fff}.bottomTools h4{margin:0 0 9px}.bottomTools select{width:100%;padding:12px;border:1px solid var(--line);border-radius:12px;background:#fff;color:var(--ink);margin-bottom:8px}.bottomTools .row2{display:grid;grid-template-columns:1fr 1fr;gap:8px}.bottomTools .row2 button{padding:11px;border-radius:12px;font-weight:800}.bottomTools .redo{background:var(--blue2);color:var(--blue)}.bottomTools .reset{background:#fff0f1;color:#b92b39;border:1px solid #f2c4c9}
.v20audio{padding:18px;border:1px solid var(--line);border-radius:18px;background:#fff}.v20audio .stage{font-size:12px;font-weight:850;color:var(--blue);text-transform:uppercase;letter-spacing:.5px}.v20choice{display:block;width:100%;text-align:left;padding:12px;border-radius:12px;background:#f5f7fa;border:1px solid var(--line);margin:7px 0;color:var(--ink)}.v20choice.good{background:var(--green2);border-color:#9cdbbd}.v20choice.bad{background:var(--red2);border-color:#f2adb4}.v20trans button{width:100%;padding:10px 12px;border-radius:11px;background:#eef4f8;color:#2d4660;font-weight:800;margin-top:7px}.v20trans .box{display:none;padding:11px 12px;border-radius:11px;background:#f6f8fb;border:1px solid var(--line);margin-top:6px;line-height:1.45}.v20trans .label{font-size:11px;color:var(--muted);font-weight:800;text-transform:uppercase;letter-spacing:.4px;margin-bottom:4px}
`;
document.head.appendChild(css);

// Accueil : message direct et outils réellement tout en bas.
const prevHome=window.renderHome;
window.renderHome=function(){
  prevHome();
  const next=Math.min((state.done||[]).length,lessons.length-1);
  if(window.heroTitle)heroTitle.textContent=`Leçon ${next+1} · ${lessons[next].title}`;
  const hero=document.querySelector('#home .hero');
  if(hero){const p=hero.querySelector('p');if(p)p.textContent=`À faire maintenant : ${lessons[next].sub}. Puis compréhension orale et expression orale.`}
  const old=document.getElementById('historyTools');if(old)old.remove();
  const oldBox=document.getElementById('oldLessonBox');if(oldBox)oldBox.remove();
  let tools=document.getElementById('bottomTools');
  if(!tools){tools=document.createElement('div');tools.id='bottomTools';tools.className='bottomTools';const path=document.getElementById('path');if(path)path.insertAdjacentElement('afterend',tools)}
  if(tools){tools.innerHTML=`<h4>Reprendre le parcours</h4><select id="v20LessonSelect">${lessons.map((l,i)=>`<option value="${i}">Leçon ${i+1} · ${l.title}</option>`).join('')}</select><div class="row2"><button class="redo" onclick="redoAnyLesson()">↺ Refaire cette leçon</button><button class="reset" onclick="resetV20()">Tout réinitialiser</button></div>`}
  document.querySelectorAll('.brand small').forEach(x=>x.textContent='Départ zéro · V20.0');
};
window.redoAnyLesson=function(){const i=Number(document.getElementById('v20LessonSelect').value);activeLesson=i;lessons[i].words.forEach(w=>{if(!state.seen.includes(w[0]))state.seen.push(w[0])});save();renderLessonWords();show('lesson')};
window.resetV20=function(){if(!confirm('Tout réinitialiser ? Toute la progression locale sera effacée.'))return;localStorage.removeItem(KEY);state={done:[],seen:[],streak:1};save();show('home')};

// Quiz vocabulaire entièrement autonome : tous les mots dans les 2 sens.
let qCards=[],qPos=0,qGood=0,qReveal=false;
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function buildCards(){const pool=[];lessons[activeLesson].words.forEach((w,id)=>{pool.push({id,dir:'Français → luxembourgeois',prompt:w[1],answer:w[0]});pool.push({id,dir:'Luxembourgeois → français',prompt:w[0],answer:w[1]})});shuffle(pool);const out=[];while(pool.length){const prev=out[out.length-1];let choices=pool.map((c,i)=>({c,i})).filter(x=>!prev||x.c.id!==prev.id);if(!choices.length)choices=pool.map((c,i)=>({c,i}));out.push(pool.splice(choices[Math.floor(Math.random()*choices.length)].i,1)[0])}return out}
window.startQuiz=function(){qCards=buildCards();qPos=0;qGood=0;renderV20Quiz()};
window.renderV20Quiz=function(){if(qPos>=qCards.length){finishV20Quiz();return}const c=qCards[qPos];qReveal=false;lessonContent.innerHTML=`<div class="card"><div class="eyebrow">Test vocabulaire · ${qPos+1}/${qCards.length}</div><div class="tiny" style="margin-top:6px">${c.dir}</div><div class="selfQ">${c.prompt}</div><p class="muted">Réponds sans proposition.</p><button class="primary" onclick="revealV20Quiz()">Révéler la réponse</button><div id="v20QuizAnswer"></div></div>`};
window.revealV20Quiz=function(){if(qReveal)return;qReveal=true;const c=qCards[qPos];document.getElementById('v20QuizAnswer').innerHTML=`<div class="reveal">${c.answer}</div><div class="judge"><button class="no" onclick="judgeV20Quiz(false)">À revoir</button><button class="yes" onclick="judgeV20Quiz(true)">Je savais</button></div>`};
window.judgeV20Quiz=function(ok){if(ok)qGood++;qPos++;renderV20Quiz()};
function finishV20Quiz(){const pct=Math.round(qGood/qCards.length*100);if(pct<80){lessonContent.innerHTML=`<div class="card" style="text-align:center;padding:28px"><div style="font-size:48px">↻</div><h2>Vocabulaire à consolider</h2><p class="muted">${qGood}/${qCards.length} · ${pct} %. Il faut 80 %.</p><button class="primary" onclick="startQuiz()">Refaire uniquement le test</button><button class="secondary" style="width:100%;margin-top:8px" onclick="openLesson(activeLesson)">Revoir la leçon</button></div>`;return}startV20Listening()}

// Ecoutes obligatoires immédiatement après le vocabulaire.
const bank=[
{audio:'https://lod.lu/uploads/examples/OGG/9b/9bb3ff56b0168aa51fe1737239761208.ogg',lu:'moien, Madamm, wat kann ech fir Iech maachen?',de:'Guten Tag, was kann ich für Sie tun?',q:'Que fait la personne ?',opts:['Elle salue et propose son aide.','Elle dit au revoir.','Elle demande l’heure.'],a:0},
{audio:'https://lod.lu/uploads/examples/OGG/f2/f20e0cdaccb6c76c06f8720ac34ac7a9.ogg',lu:'moien, wéi geet et?',de:'Hallo, wie geht es?',q:'Que demande la personne ?',opts:['Comment ça va ?','Où habites-tu ?','Quel âge as-tu ?'],a:0},
{audio:'https://lod.lu/uploads/examples/OGG/92/926b1dbd7e2c5081e03a3a1a229605d8.ogg',lu:'salut, ech ginn elo heem!',de:'Tschüss, ich gehe jetzt nach Hause!',q:'Que va faire la personne ?',opts:['Elle rentre chez elle.','Elle va travailler.','Elle va au restaurant.'],a:0},
{audio:'https://lod.lu/uploads/examples/OGG/57/5708aa802f9771f2a431a9310f609b90.ogg',lu:'ech wunnen zu Eech',de:'Ich wohne in Eich.',q:'Que dit la personne ?',opts:['Elle habite à Eech.','Elle travaille à Eech.','Elle vient d’Eech.'],a:0},
{audio:'https://lod.lu/uploads/examples/OGG/99/993dc701e65f000216eed16a3d7b4dc0.ogg',lu:'déi nei Buslinn fiert vun der Gare op de Flughafen',de:'Die neue Buslinie fährt vom Bahnhof zum Flughafen.',q:'Quel trajet est annoncé ?',opts:['De la gare à l’aéroport.','De l’aéroport au magasin.','De l’école à la gare.'],a:0},
{audio:'https://lod.lu/uploads/examples/OGG/bd/bd64bfea677c6f9acc314b9fd4ed0cb2.ogg',lu:'mir hunn eng Taass Kaffi gedronk',de:'Wir haben eine Tasse Kaffee getrunken.',q:'Qu’ont-ils bu ?',opts:['Une tasse de café.','Un verre d’eau.','Du thé.'],a:0}
];
function audioSet(i){if(i===0)return bank.slice(0,3);const start=3+(i%3);return [bank[start%bank.length],bank[(start+1)%bank.length]]}
let aSet=[],aPos=0,aPlayer=null;
function startV20Listening(){aSet=audioSet(activeLesson);aPos=0;renderV20Listening()}
window.renderV20Listening=renderV20Listening;
function renderV20Listening(){if(aPos>=aSet.length){renderV20Speaking();return}const x=aSet[aPos];lessonContent.innerHTML=`<div class="v20audio"><div class="stage">Compréhension orale · ${aPos+1}/${aSet.length}</div><h2>Écoute sans lire</h2><button class="checkpointAudio" onclick="playV20Audio(this)">▶ Écouter</button><div class="selfQ" style="font-size:19px">${x.q}</div>${x.opts.map((o,i)=>`<button class="v20choice" onclick="answerV20Audio(${i},this)">${o}</button>`).join('')}<div id="v20AudioReveal"></div></div>`}
window.playV20Audio=function(btn){const x=aSet[aPos];try{aPlayer?.pause();aPlayer=new Audio(x.audio);btn.textContent='🔊 Lecture…';aPlayer.play().then(()=>aPlayer.onended=()=>btn.textContent='▶ Réécouter').catch(()=>btn.textContent='Réessayer')}catch(e){btn.textContent='Réessayer'}};
window.answerV20Audio=function(choice,btn){const x=aSet[aPos],buttons=btn.parentElement.querySelectorAll('.v20choice');buttons.forEach((b,i)=>{b.disabled=true;if(i===x.a)b.classList.add('good')});if(choice!==x.a)btn.classList.add('bad');document.getElementById('v20AudioReveal').innerHTML=`<div class="v20trans"><button onclick="toggleV20(this,'lu')">Afficher le luxembourgeois</button><div class="box" data-lang="lu"><div class="label">Luxembourgeois</div>${x.lu}</div><button onclick="toggleV20(this,'de')">Afficher l’allemand</button><div class="box" data-lang="de"><div class="label">Allemand</div>${x.de}</div></div><button class="primary" style="margin-top:12px" onclick="aPos++;renderV20Listening()">${aPos+1<aSet.length?'Écoute suivante':'Passer à l’expression orale'}</button>`};
window.toggleV20=function(btn,lang){const box=btn.parentElement.querySelector('.box[data-lang="'+lang+'"]');const open=box.style.display==='block';box.style.display=open?'none':'block';btn.textContent=(open?'Afficher ':'Masquer ')+(lang==='lu'?'le luxembourgeois':'l’allemand')};

function renderV20Speaking(){const l=lessons[activeLesson];const starters=l.words.slice(0,4).map(w=>w[0]);lessonContent.innerHTML=`<div class="checkpoint"><div class="stage">Expression orale</div><h2>Réponds avec des repères</h2><div class="guideStep"><b>1 · Commence simple</b>Fais une première phrase courte sur le thème « ${l.title} ».</div><div class="guideStep"><b>2 · Ajoute un détail</b>Utilise un deuxième élément de la leçon.</div><div class="guideStep"><b>3 · Termine clairement</b>Ajoute une préférence, une raison ou une information personnelle simple.</div><div class="tiny">Amorces disponibles :</div><div class="phraseBank">${starters.map(s=>`<span>${s}</span>`).join('')}</div><p class="muted">Parle à voix haute avant d’évaluer.</p><button class="primary" onclick="document.getElementById('v20SpeakJudge').style.display='block';this.style.display='none'">J’ai répondu</button><div id="v20SpeakJudge" style="display:none"><div class="judge"><button class="no" onclick="finishV20Lesson(false)">À revoir</button><button class="yes" onclick="finishV20Lesson(true)">J’ai pu répondre</button></div></div></div>`}
window.finishV20Lesson=function(ok){if(!ok){lessonContent.innerHTML=`<div class="card"><h2>Expression orale à revoir</h2><button class="primary" onclick="renderV20Speaking()">Refaire l’expression orale</button></div>`;return}if(!state.done.includes(activeLesson)){state.done.push(activeLesson);state.done.sort((a,b)=>a-b);save()}lessonContent.innerHTML=`<div class="card" style="text-align:center;padding:28px"><div style="font-size:48px">✓</div><h2>Leçon validée</h2><p class="muted">Vocabulaire + compréhension + expression orale.</p><button class="primary" onclick="show('home')">Retour au parcours</button></div>`};
window.renderV20Speaking=renderV20Speaking;

document.title='Sproochentest Lëtzebuergesch V20.0';renderHome();
})();