// V20.6 — contenu enrichi + situations + révision espacée
(function(){
'use strict';
const css=document.createElement('style');css.textContent=`
.v206context{margin:14px 0 4px}.v206context h3{font-size:15px;margin:0 0 6px}.v206phrase{padding:10px 0;border-bottom:1px solid var(--line)}.v206phrase .lu{font-size:17px;font-weight:850}.v206phrase .fr{font-size:12px;color:var(--muted);margin-top:2px}.v206dialog{margin:12px 0;padding:11px 12px;border-left:3px solid var(--blue);background:#edf5fc;border-radius:0 12px 12px 0}.v206dialog b{display:block;font-size:12px;color:var(--blue);margin-bottom:5px}.v206dialog p{margin:4px 0;font-size:13px;line-height:1.35}.v206reviewTop{padding:4px 0 12px;border-bottom:1px solid var(--line);margin-bottom:10px}.v206reviewTop h2{margin:4px 0}.v206revQ{font-size:24px;font-weight:900;margin:16px 0 10px}.v206revDir{font-size:11px;color:var(--blue);font-weight:850;text-transform:uppercase}.v206revAns{font-size:21px;font-weight:900;margin:13px 0}.v206revBtns{display:grid;grid-template-columns:1fr 1fr;gap:7px}.v206revBtns button{padding:11px;border-radius:11px;font-weight:850}.v206again{background:var(--red2);color:var(--red)}.v206hard{background:#fff5df;color:#8a5b00}.v206good{background:var(--green2);color:var(--green)}.v206easy{background:var(--blue2);color:var(--blue)}.v206stats{display:flex;gap:14px;font-size:12px;color:var(--muted);margin-top:8px}.v206pill{display:inline-block;padding:5px 8px;border-radius:9px;background:#e9eef4;font-size:11px;font-weight:800;margin:2px 4px 2px 0}
`;document.head.appendChild(css);

const enrich={
0:{p:[['Moien! Wéi geet et?','Bonjour ! Comment ça va ?'],['Äddi, bis geschwënn!','Au revoir, à bientôt !']],d:['Moien!','Moien! Wéi geet et?','Gutt, merci. An dir?','Och gutt. Äddi!']},
1:{p:[['Ech sinn hei.','Je suis ici.'],['Mir sinn zesummen.','Nous sommes ensemble.']],d:['Wien ass dat?','Dat ass hien.','A si?','Si ass do.']},
2:{p:[['Ech sinn midd.','Je suis fatigué(e).'],['Du bass frëndlech.','Tu es gentil(le).']],d:['Bass du prett?','Jo, ech si prett.']},
3:{p:[['Ech heeschen Anne-Sophie.','Je m’appelle Anne-Sophie.'],['Ech wunnen zu Thionville.','J’habite à Thionville.']],d:['Wéi heeschs du?','Ech heeschen …','Wou wunns du?','Ech wunnen zu …']},
4:{p:[['Ech sinn drësseg Joer al.','J’ai trente ans.'],['Mir sinn zwee.','Nous sommes deux.']],d:['Wéi al bass du?','Ech sinn … Joer al.']},
5:{p:[['Wou wunns du?','Où habites-tu ?'],['Wéini kënns du?','Quand viens-tu ?']],d:['Wat méchs du?','Ech schaffen.','Wou?','Zu Lëtzebuerg.']},
6:{p:[['Wéi geet et dir?','Comment vas-tu ?'],['Mir gesinn eis geschwënn.','On se voit bientôt.']],d:['Moien!','Moien!','Wéi geet et?','Gutt, merci. An dir?']},
7:{p:[['Haut ass et roueg.','Aujourd’hui c’est calme.'],['D’Leit sinn zu Lëtzebuerg.','Les gens sont au Luxembourg.']],d:['Wat ass haut an den Noriichten?','Et gëtt Noriichten aus Lëtzebuerg.']},
8:{p:[['Meng Famill ass grouss.','Ma famille est grande.'],['Ech hunn eng Schwëster.','J’ai une sœur.']],d:['Hues du Geschwëster?','Jo, ech hunn eng Schwëster.']},
9:{p:[['Haut ass Méindeg.','Aujourd’hui, c’est lundi.'],['Muer ass Dënschdeg.','Demain, c’est mardi.']],d:['Wéi een Dag ass haut?','Haut ass …']},
10:{p:[['Moies drénken ech Kaffi.','Le matin je bois du café.'],['Owes sinn ech doheem.','Le soir je suis à la maison.']],d:['Wat méchs du owes?','Ech sinn doheem.']},
11:{p:[['Et ass siwen Auer.','Il est sept heures.'],['Um hallwer aacht ginn ech fort.','À sept heures et demie je pars.']],d:['Wéi vill Auer ass et?','Et ass … Auer.']},
12:{p:[['Ech wunnen an engem Appartement.','J’habite dans un appartement.'],['D’Kichen ass kleng.','La cuisine est petite.']],d:['Wou wunns du?','An engem Appartement.','Wéi ass d’Kichen?','Si ass kleng.']},
13:{p:[['Ech iessen Brout.','Je mange du pain.'],['Ech drénke Waasser.','Je bois de l’eau.']],d:['Wat wëlls du drénken?','Waasser, wann ech gelift.']},
14:{p:[['Ech wëll dat kafen.','Je veux acheter cela.'],['Wéi vill kascht dat?','Combien cela coûte ?']],d:['Wéi vill kascht dat?','Zéng Euro.','Ech huelen et.','Merci.']},
15:{p:[['Ech fuere mam Bus.','Je vais en bus.'],['Ech ginn zu Fouss.','Je vais à pied.']],d:['Wéi kënns du op d’Aarbecht?','Mam Bus.']},
16:{p:[['Gitt riichtaus.','Allez tout droit.'],['Da lénks.','Puis à gauche.']],d:['Wou ass d’Gare?','Riichtaus an dann lénks.']},
17:{p:[['Ech schaffen an enger Schoul.','Je travaille dans une école.'],['Ech fänken um aacht Auer un.','Je commence à huit heures.']],d:['Wou schaffs du?','An enger Schoul.']},
18:{p:[['Ech lauschtere gär Musek.','J’aime écouter de la musique.'],['De Weekend maache mir Sport.','Le week-end nous faisons du sport.']],d:['Wat méchs du gär?','Ech lauschtere gär Musek.']},
19:{p:[['Haut ass et sonneg.','Aujourd’hui il fait soleil.'],['Muer reent et.','Demain il pleut.']],d:['Wéi ass d’Wieder?','Et ass sonneg.']},
20:{p:[['Ech hu Kappwéi.','J’ai mal à la tête.'],['Meng Féiss doen wéi.','J’ai mal aux pieds.']],d:['Wou deet et wéi?','Am Kapp.']},
21:{p:[['Ech hunn eng blo Jackett un.','Je porte une veste bleue.'],['D’Schong si schwaarz.','Les chaussures sont noires.']],d:['Wat hues du un?','Eng blo Jackett.']},
22:{p:[['Ech hätt gär e Kaffi.','Je voudrais un café.'],['D’Rechnung, wann ech gelift.','L’addition, s’il vous plaît.']],d:['Wat wëllt Dir?','E Kaffi, wann ech gelift.','Nach eppes?','Nee, merci.']},
23:{p:[['Ech hu Musek gär.','J’aime la musique.'],['Ech hu léiwer Téi.','Je préfère le thé.']],d:['Wat hues du gär?','Ech hu Musek gär.']},
24:{p:[['Gëschter war ech doheem.','Hier j’étais à la maison.'],['Ech hunn Kaffi gedronk.','J’ai bu du café.']],d:['Wat hues du gëschter gemaach?','Ech war doheem.']},
25:{p:[['Muer ginn ech schaffen.','Demain je vais travailler.'],['De Weekend wëll ech raschten.','Le week-end je veux me reposer.']],d:['Wat méchs du muer?','Ech ginn schaffen.']},
26:{p:[['Hien ass grouss an huet brong Hoer.','Il est grand et a les cheveux bruns.'],['Si ass frëndlech.','Elle est sympathique.']],d:['Wéi gesäit hien aus?','Hien ass grouss.']},
27:{p:[['Op dem Bild gesinn ech zwou Persounen.','Sur l’image je vois deux personnes.'],['Lénks steet e Mann.','À gauche se tient un homme.']],d:['Wat gesäis du op dem Bild?','Ech gesinn zwou Persounen.']},
28:{p:[['Ech mengen, dat ass gutt.','Je pense que c’est bien.'],['Fir mech ass dat wichteg, well …','Pour moi c’est important parce que …']],d:['Wat mengs du?','Ech mengen, dat ass gutt, well …']},
29:{p:[['Kënnt Dir dat widderhuelen?','Pouvez-vous répéter ?'],['Kënnt Dir méi lues schwätzen?','Pouvez-vous parler plus lentement ?']],d:['Entschëllegt, ech hunn et net verstanen.','Kee Problem.','Kënnt Dir dat widderhuelen?','Jo, natierlech.']}
};

const prevLesson=window.renderLessonWords;
window.renderLessonWords=function(){prevLesson();const e=enrich[activeLesson],host=document.getElementById('lessonContent');if(!e||!host)return;const block=document.createElement('div');block.className='v206context';block.innerHTML=`<h3>Phrases à savoir utiliser</h3>${e.p.map(x=>`<div class="v206phrase"><div class="lu">${x[0]}</div><div class="fr">${x[1]}</div></div>`).join('')}<div class="v206dialog"><b>Mini-situation</b>${e.d.map((x,i)=>`<p><strong>${i%2?'Toi':'Interlocuteur'} :</strong> ${x}</p>`).join('')}</div>`;const btn=host.querySelector('.primary');if(btn)host.insertBefore(block,btn);else host.appendChild(block)};

const RK='sproochentest-v206-review';
function loadRev(){try{return JSON.parse(localStorage.getItem(RK))||{}}catch(e){return{}}}
function saveRev(x){localStorage.setItem(RK,JSON.stringify(x))}
function allReviewCards(){const out=[],max=Math.min((state.done||[]).length+1,lessons.length);for(let li=0;li<max;li++){lessons[li].words.forEach((w,wi)=>{out.push({k:`${li}-${wi}-f`,li,wi,dir:'Français → luxembourgeois',q:w[1],a:w[0]});out.push({k:`${li}-${wi}-l`,li,wi,dir:'Luxembourgeois → français',q:w[0],a:w[1]})})}return out}
function dueCards(){const db=loadRev(),now=Date.now(),all=allReviewCards();return all.filter(c=>!db[c.k]||db[c.k].due<=now)}
let revSession=[],revPos=0,revShown=false,revStats={again:0,hard:0,good:0,easy:0};
function mix(a){a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
window.renderReview=function(){const due=dueCards(),count=Math.min(20,due.length);reviewCount.textContent=`${due.length} dues`;reviewContent.innerHTML=`<div class="v206reviewTop"><div class="eyebrow">Révision espacée</div><h2>${due.length?`${due.length} cartes à revoir`:'Rien d’urgent aujourd’hui'}</h2><p class="muted">Les cartes difficiles reviennent vite. Les cartes faciles s’espacent progressivement.</p></div>${due.length?`<button class="primary" onclick="v206StartReview()">Réviser ${count} cartes</button>`:`<button class="secondary" style="width:100%" onclick="v206StartFreeReview()">Faire quand même 10 cartes</button>`}`};
window.v206StartReview=function(){revSession=mix(dueCards()).slice(0,20);revPos=0;revStats={again:0,hard:0,good:0,easy:0};renderRevCard()};
window.v206StartFreeReview=function(){revSession=mix(allReviewCards()).slice(0,10);revPos=0;revStats={again:0,hard:0,good:0,easy:0};renderRevCard()};
function renderRevCard(){if(revPos>=revSession.length){reviewContent.innerHTML=`<div class="v206reviewTop"><div class="eyebrow">Session terminée</div><h2>${revSession.length} cartes révisées</h2><div class="v206stats"><span>À revoir ${revStats.again}</span><span>Difficile ${revStats.hard}</span><span>Bien ${revStats.good}</span><span>Facile ${revStats.easy}</span></div></div><button class="primary" onclick="show('home')">Retour au parcours</button>`;return}const c=revSession[revPos];revShown=false;reviewContent.innerHTML=`<div class="v206revDir">${c.dir}</div><div class="tiny">Leçon ${c.li+1} · ${revPos+1}/${revSession.length}</div><div class="v206revQ">${c.q}</div><button class="v204reveal" onclick="v206Reveal()">Révéler</button><div id="v206answer"></div>`}
window.v206Reveal=function(){if(revShown)return;revShown=true;const c=revSession[revPos];document.getElementById('v206answer').innerHTML=`<div class="v206revAns">${c.a}</div><div class="v206revBtns"><button class="v206again" onclick="v206RateReview(0)">À revoir</button><button class="v206hard" onclick="v206RateReview(1)">Difficile</button><button class="v206good" onclick="v206RateReview(2)">Bien</button><button class="v206easy" onclick="v206RateReview(3)">Facile</button></div>`};
window.v206RateReview=function(r){const c=revSession[revPos],db=loadRev(),old=db[c.k]||{level:0},days=[0.02,1,3,7][r],level=r===0?0:Math.min(6,(old.level||0)+(r===3?2:1));db[c.k]={level,due:Date.now()+days*86400000};saveRev(db);['again','hard','good','easy'].forEach((k,i)=>{if(i===r)revStats[k]++});revPos++;renderRevCard()};

const prevHome=window.renderHome;
window.renderHome=function(){prevHome();const due=dueCards().length;const modes=document.getElementById('v204modes');if(modes){const b=modes.querySelector('button');if(b)b.innerHTML=`<span>↻</span>Révisions${due?` · ${due}`:''}`};document.querySelectorAll('.brand small').forEach(x=>x.textContent='V20.6 · contenu + révision espacée')};
document.title='Sproochentest Lëtzebuergesch V20.6';renderHome();
})();