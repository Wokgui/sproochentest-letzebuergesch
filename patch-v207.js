// V20.7 — compréhension progressive : séquences, plusieurs questions, niveau B1
(function(){
'use strict';
const css=document.createElement('style');css.textContent=`
.v207lab{padding:2px 0}.v207level{padding:13px 0;border-bottom:1px solid var(--line)}.v207level b{display:block;font-size:15px}.v207level small{display:block;color:var(--muted);line-height:1.35;margin:3px 0 8px}.v207level button{padding:9px 11px;border-radius:10px;background:var(--blue2);color:var(--blue);font-weight:850}.v207audioHead{padding-bottom:10px;border-bottom:1px solid var(--line)}.v207audioHead h2{margin:4px 0}.v207audioHead p{margin:4px 0;color:var(--muted);font-size:13px;line-height:1.4}.v207q{padding:13px 0;border-bottom:1px solid var(--line)}.v207q b{display:block;margin-bottom:7px}.v207opt{display:block;width:100%;text-align:left;padding:10px 11px;border-radius:10px;background:#e9eef3;border:1px solid var(--line);margin:6px 0}.v207opt.good{background:var(--green2);border-color:#9cdbbd}.v207opt.bad{background:var(--red2);border-color:#efadb4}.v207score{font-size:34px;font-weight:950;margin:5px 0}.v207trans{margin-top:12px}.v207trans button{width:100%;padding:9px 11px;border-radius:10px;background:#e7edf4;color:#31506b;font-weight:850;margin-top:7px}.v207trans .box{display:none;padding:10px 11px;border-radius:10px;background:#e9eef3;margin-top:5px;line-height:1.45;font-size:13px}.v207progress{display:flex;gap:5px;margin:10px 0}.v207progress i{height:6px;flex:1;background:#dfe6ee;border-radius:8px}.v207progress i.on{background:var(--blue)}
`;document.head.appendChild(css);

let lab=document.getElementById('listeningLab');if(!lab){lab=document.createElement('section');lab.id='listeningLab';lab.className='screen';lab.innerHTML='<button class="back" onclick="show(\'examPrep\')">← Retour</button><div id="listeningLabContent"></div>';document.querySelector('.app').appendChild(lab)}

const sets=[
 {title:'Niveau 1 · informations simples',desc:'3 courtes interventions humaines. Il faut repérer l’idée principale et un détail.',clips:[
  ['https://lod.lu/uploads/examples/OGG/f2/f20e0cdaccb6c76c06f8720ac34ac7a9.ogg','Moien, wéi geet et?','Bonjour, comment ça va ?'],
  ['https://lod.lu/uploads/examples/OGG/57/5708aa802f9771f2a431a9310f609b90.ogg','Ech wunnen zu Eech.','J’habite à Eich.'],
  ['https://lod.lu/uploads/examples/OGG/bd/bd64bfea677c6f9acc314b9fd4ed0cb2.ogg','Mir hunn eng Taass Kaffi gedronk.','Nous avons bu une tasse de café.']],qs:[
   ['Quelle question est posée au début ?',['Comment ça va ?','Où habites-tu ?','Quelle heure est-il ?'],0],
   ['Où habite la personne ?',['À Eich.','À la gare.','À l’aéroport.'],0],
   ['Qu’ont-ils bu ?',['Du café.','Du thé.','De l’eau.'],0]]},
 {title:'Niveau 2 · situation quotidienne',desc:'Une séquence de plusieurs informations. Il faut retenir le trajet et un détail pratique.',clips:[
  ['https://lod.lu/uploads/examples/OGG/99/993dc701e65f000216eed16a3d7b4dc0.ogg','Déi nei Buslinn fiert vun der Gare op de Flughafen.','La nouvelle ligne de bus va de la gare à l’aéroport.'],
  ['https://lod.lu/uploads/examples/OGG/5e/5e89147416f5f194d1231df26ec7d19c.ogg','Am Autobus sinn nach Sëtzplaze fräi.','Il reste encore des places assises dans le bus.'],
  ['https://lod.lu/uploads/examples/OGG/7a/7af2674e596a6c81e13aa53e3bfd8a89.ogg','Fiert dëse Bus op Eech?','Est-ce que ce bus va à Eich ?']],qs:[
   ['Quel trajet fait la nouvelle ligne ?',['Gare → aéroport.','Aéroport → centre commercial.','Eich → école.'],0],
   ['Quelle information pratique est donnée ?',['Il reste des places assises.','Le bus est annulé.','Le bus est complet.'],0],
   ['Que demande ensuite une personne ?',['Si le bus va à Eich.','Le prix du billet.','L’heure du dernier bus.'],0]]},
 {title:'Niveau 3 · compréhension B1',desc:'Plusieurs idées successives. Écoute toute la séquence avant de répondre aux 4 questions.',clips:[
  ['https://lod.lu/uploads/examples/OGG/32/326d946b134d79ed507e0984cef18ad4.ogg',"Maach de Radio méi haart, ech wëll d'Wieder lauschteren!",'Monte la radio, je veux écouter la météo !'],
  ['https://lod.lu/uploads/examples/OGG/fe/fef9b02ea8a96664cdf7fb8ace799f71.ogg','Wa schéint Wieder ass, si vill Cyclisten op der Strooss.','Quand il fait beau, il y a beaucoup de cyclistes sur la route.'],
  ['https://lod.lu/uploads/examples/OGG/13/13de89caafec442213caf9dfeef11f25.ogg','Ech maachen all Dag no der Aarbecht Sport.','Je fais du sport tous les jours après le travail.'],
  ['https://lod.lu/uploads/examples/OGG/40/40836e9206b1d78780016006811f0bc4.ogg','Ech kann elo kee Congé huelen, ech hunn ze vill Aarbecht um Büro.','Je ne peux pas prendre congé maintenant, j’ai trop de travail au bureau.']],qs:[
   ['Pourquoi faut-il monter le son de la radio ?',['Pour écouter la météo.','Pour écouter de la musique.','Pour entendre un appel.'],0],
   ['Que se passe-t-il quand il fait beau ?',['Il y a beaucoup de cyclistes.','Les routes ferment.','Les bus sont gratuits.'],0],
   ['Quand la personne fait-elle du sport ?',['Après le travail.','Avant le petit-déjeuner.','Seulement le dimanche.'],0],
   ['Pourquoi ne peut-elle pas prendre congé ?',['Elle a trop de travail.','Elle est malade.','Elle voyage déjà.'],0]]}
];
let si=0,qi=0,answers=[],labPlayer=null,playing=false;
window.openListeningLab=function(){document.getElementById('listeningLabContent').innerHTML=`<div class="v204stage">Compréhension orale</div><h2 style="margin:4px 0 8px">Progression vers le B1</h2><p class="muted">Écoute d’abord sans transcription. Chaque séquence contient plusieurs informations et plusieurs questions.</p>${sets.map((s,i)=>`<div class="v207level"><b>${s.title}</b><small>${s.desc}</small><button onclick="v207Start(${i})">Commencer</button></div>`).join('')}`;show('listeningLab')};
window.v207Start=function(i){si=i;qi=0;answers=[];renderSetIntro()};
function renderSetIntro(){const s=sets[si];document.getElementById('listeningLabContent').innerHTML=`<div class="v207audioHead"><div class="v204stage">${s.title}</div><h2>Écoute toute la séquence</h2><p>${s.desc}</p><div class="v207progress">${s.clips.map(()=>'<i></i>').join('')}</div><button class="primary" id="v207play" onclick="v207PlaySequence()">▶ Écouter la séquence</button></div><div id="v207after"></div>`}
window.v207PlaySequence=async function(){if(playing)return;playing=true;const s=sets[si],btn=document.getElementById('v207play'),bars=[...document.querySelectorAll('.v207progress i')];btn.textContent='🔊 Lecture…';for(let i=0;i<s.clips.length;i++){bars.forEach((b,j)=>b.classList.toggle('on',j===i));await new Promise(resolve=>{try{labPlayer?.pause();labPlayer=new Audio(s.clips[i][0]);labPlayer.onended=resolve;labPlayer.onerror=resolve;labPlayer.play().catch(resolve)}catch(e){resolve()}});await new Promise(r=>setTimeout(r,450))}bars.forEach(b=>b.classList.remove('on'));playing=false;btn.textContent='▶ Réécouter';document.getElementById('v207after').innerHTML='<button class="primary" style="margin-top:10px" onclick="v207BeginQuestions()">Répondre aux questions</button>'};
window.v207BeginQuestions=function(){qi=0;answers=[];renderQuestion()};
function renderQuestion(){const s=sets[si];if(qi>=s.qs.length){renderResult();return}const q=s.qs[qi];document.getElementById('listeningLabContent').innerHTML=`<div class="v204stage">${s.title} · question ${qi+1}/${s.qs.length}</div><div class="v207q"><b>${q[0]}</b>${q[1].map((o,i)=>`<button class="v207opt" onclick="v207Answer(${i},this)">${o}</button>`).join('')}</div><div id="v207feedback"></div>`}
window.v207Answer=function(a,btn){const s=sets[si],q=s.qs[qi],ok=a===q[2];answers.push(ok);const bs=btn.parentElement.querySelectorAll('.v207opt');bs.forEach((b,i)=>{b.disabled=true;if(i===q[2])b.classList.add('good')});if(!ok)btn.classList.add('bad');document.getElementById('v207feedback').innerHTML=`<div class="v204feedback ${ok?'ok':'ko'}">${ok?'✓ Bonne réponse':'✗ Bonne réponse : '+q[1][q[2]]}</div><button class="primary" onclick="v207NextQ()">${qi+1<s.qs.length?'Question suivante':'Voir le résultat'}</button>`};
window.v207NextQ=function(){qi++;renderQuestion()};
function renderResult(){const s=sets[si],n=answers.filter(Boolean).length,p=Math.round(n/s.qs.length*100);document.getElementById('listeningLabContent').innerHTML=`<div class="v204stage">Résultat</div><div class="v207score">${p}%</div><p class="muted">${n}/${s.qs.length} réponses correctes.</p><div class="v207trans"><button onclick="v207ToggleAll(this,'lu')">Afficher toute la transcription luxembourgeoise</button><div class="box" data-all="lu">${s.clips.map(x=>x[1]).join('<br><br>')}</div><button onclick="v207ToggleAll(this,'fr')">Afficher toute la traduction française</button><div class="box" data-all="fr">${s.clips.map(x=>x[2]).join('<br><br>')}</div></div><button class="primary" style="margin-top:12px" onclick="openListeningLab()">Choisir un autre niveau</button>`}
window.v207ToggleAll=function(btn,lang){const box=btn.parentElement.querySelector(`[data-all="${lang}"]`),open=box.style.display==='block';box.style.display=open?'none':'block';btn.textContent=(open?'Afficher ':'Masquer ')+(lang==='lu'?'toute la transcription luxembourgeoise':'toute la traduction française')};

// Prépa examen : remplace l'accès compréhension par le laboratoire progressif.
const oldExam=window.openExamPrep;window.openExamPrep=function(){oldExam();setTimeout(()=>{const h=document.getElementById('examContent');if(!h)return;const rows=h.querySelectorAll('.v204examRow');rows.forEach(r=>{const b=r.querySelector('b');if(b&&b.textContent.includes('Compréhension')){const bt=r.querySelector('button');if(bt){bt.textContent='Progression B1';bt.onclick=openListeningLab}const sm=r.querySelector('small');if(sm)sm.textContent='Phrase courte → séquence quotidienne → compréhension multi-informations avec plusieurs questions.'}})},0)};
document.querySelectorAll('.brand small').forEach(x=>x.textContent='V20.7 · compréhension B1 progressive');
document.title='Sproochentest Lëtzebuergesch V20.7';
})();