// V20.5 — parcours guidé, modules visibles, coach oral scénarisé
(function(){
'use strict';
const css=document.createElement('style');css.textContent=`
.v205today{padding:2px 0 14px;border-bottom:1px solid var(--line);margin-bottom:12px}.v205today h2{font-size:25px;margin:4px 0}.v205today p{margin:4px 0 10px;color:var(--muted);font-size:13px}.v205steps{display:flex;gap:5px;margin:9px 0 12px}.v205steps span{flex:1;height:6px;border-radius:9px;background:#dfe6ee}.v205steps span.on{background:var(--blue)}.v205module{padding:12px 0;border-bottom:1px solid var(--line)}.v205moduleHead{display:flex;align-items:center;gap:10px}.v205moduleNo{width:34px;height:34px;border-radius:11px;background:var(--blue2);display:grid;place-items:center;color:var(--blue);font-weight:900}.v205module b{display:block}.v205module small{color:var(--muted);line-height:1.35}.v205bar{height:5px;background:#e2e8ef;border-radius:10px;margin:8px 0 0;overflow:hidden}.v205bar i{display:block;height:100%;background:var(--blue)}.v205lessonMap{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin:12px 0}.v205lessonMap div{text-align:center;padding:7px 2px;border-radius:8px;background:#edf1f5;font-size:10px;color:var(--muted)}.v205lessonMap div.current{background:var(--blue2);color:var(--blue);font-weight:850}.v205lessonMap div.done{background:var(--green2);color:var(--green)}.v205goal{padding:10px 0;border-bottom:1px solid var(--line);font-size:13px}.v205goal b{display:block;margin-bottom:2px}.v205context{margin:12px 0}.v205contextRow{padding:10px 0;border-bottom:1px solid var(--line)}.v205contextRow .lu{font-size:17px;font-weight:850}.v205contextRow .fr{font-size:12px;color:var(--muted)}.v205coachMsg{max-width:88%;padding:11px 13px;border-radius:15px;margin:8px 0;line-height:1.4}.v205coachMsg.coach{background:#e8f3fd}.v205coachMsg.you{background:#e9eef3;margin-left:auto}.v205coachActions{display:grid;gap:7px;margin-top:10px}.v205coachActions button{text-align:left;padding:11px;border-radius:11px;background:#e9eef3;color:var(--ink)}.v205coachActions button b{display:block}.v205coachActions button small{display:block;color:var(--muted);margin-top:2px}.v205notice{font-size:12px;color:var(--muted);line-height:1.4;padding:10px 0;border-top:1px solid var(--line);margin-top:12px}.v205homeTitle{font-size:12px;text-transform:uppercase;letter-spacing:.6px;color:var(--muted);font-weight:850;margin:18px 0 4px}
`;document.head.appendChild(css);

const modules=[
 {name:'Bases essentielles',range:[0,4],goal:'Saluer, personnes, être, se présenter et nombres.'},
 {name:'Comprendre et questionner',range:[5,9],goal:'Questions simples, dialogues, première écoute, famille et jours.'},
 {name:'Vie quotidienne',range:[10,14],goal:'Moments de la journée, heure, logement, nourriture et achats.'},
 {name:'Se déplacer et agir',range:[15,19],goal:'Transport, directions, travail, loisirs et météo.'},
 {name:'Besoins et interactions',range:[20,24],goal:'Santé, vêtements, restaurant, goûts et parler du passé.'},
 {name:'Vers le Sproochentest',range:[25,29],goal:'Projets, description, image, opinion et stratégies de test.'}
];
function moduleOf(i){return modules.findIndex(m=>i>=m.range[0]&&i<=m.range[1])}
function moduleDone(m){let n=0;for(let i=m.range[0];i<=m.range[1];i++)if((state.done||[]).includes(i))n++;return n}
function lessonGoal(i){const l=lessons[i];const map={0:'Savoir saluer et prendre congé.',1:'Parler des personnes : je, tu, il, elle, nous.',2:'Construire les premières phrases avec être.',3:'Dire son nom, son origine et son lieu de vie.',4:'Comprendre et donner un nombre ou un âge.',5:'Comprendre les mots interrogatifs essentiels.',6:'Tenir un mini-dialogue très simple.',7:'Commencer à comprendre du luxembourgeois entendu.',8:'Présenter simplement sa famille.',9:'Comprendre et dire les jours.',10:'Situer une action dans la journée.',11:'Comprendre et donner une heure.',12:'Parler de son logement.',13:'Parler de ce que l’on mange et boit.',14:'Faire un achat simple.',15:'Dire comment on se déplace.',16:'Comprendre et donner une direction.',17:'Parler simplement de son travail.',18:'Parler de ses loisirs.',19:'Comprendre et décrire la météo.',20:'Dire où on a mal et comprendre une question simple de santé.',21:'Nommer et décrire des vêtements.',22:'Commander simplement au restaurant.',23:'Dire ce qu’on aime et préfère.',24:'Dire quelque chose qui s’est passé hier.',25:'Parler d’un projet futur.',26:'Décrire une personne.',27:'Décrire une image de façon organisée.',28:'Donner un avis et une raison.',29:'Savoir demander de répéter et gérer un blocage.'};return map[i]||`Utiliser le vocabulaire de « ${l.title} » dans une situation réelle.`}

const oldHome=window.renderHome;
window.renderHome=function(){oldHome();
 const done=(state.done||[]).length,next=Math.min(done,lessons.length-1),mi=moduleOf(next),m=modules[mi];
 const hero=document.querySelector('#home .hero');if(hero){hero.innerHTML=`<div class="v205today"><div class="eyebrow">Aujourd’hui · Module ${mi+1}/6</div><h2>Leçon ${next+1} · ${lessons[next].title}</h2><p>${lessonGoal(next)}</p><div class="v205steps"><span class="on"></span><span></span><span></span><span></span><span></span></div><button class="primary" onclick="openLesson(${next})">Continuer le parcours</button></div>`}
 let dash=document.getElementById('v205dash');if(!dash){dash=document.createElement('div');dash.id='v205dash';hero?.insertAdjacentElement('afterend',dash)}
 if(dash)dash.innerHTML=`<div class="v205homeTitle">Ton niveau maintenant</div><div class="row tiny"><b>${done}/${lessons.length} leçons</b><span class="grow"></span><span>${Math.round(done/lessons.length*100)}%</span></div><div class="progress"><span style="width:${done/lessons.length*100}%"></span></div><div class="v205homeTitle">6 modules · ce que tu construis</div>${modules.map((x,k)=>{const d=moduleDone(x),total=x.range[1]-x.range[0]+1;return `<div class="v205module"><div class="v205moduleHead"><div class="v205moduleNo">${k+1}</div><div class="grow"><b>${x.name}</b><small>${x.goal}</small></div><span class="tiny">${d}/${total}</span></div><div class="v205bar"><i style="width:${d/total*100}%"></i></div></div>`}).join('')}`;
 const modes=document.getElementById('v204modes');if(modes)modes.innerHTML=`<div class="v204modes"><button onclick="show('review')"><span>↻</span>Révisions</button><button onclick="openTutor()"><span>💬</span>Coach oral</button><button onclick="openExamPrep()"><span>◎</span>Prépa examen</button></div>`;
 document.querySelectorAll('.brand small').forEach(x=>x.textContent='V20.5 · parcours guidé');
};

const baseLessonWords=window.renderLessonWords;
window.renderLessonWords=function(){baseLessonWords();const host=document.getElementById('lessonContent');if(!host)return;const l=lessons[activeLesson],mi=moduleOf(activeLesson),m=modules[mi];
 const head=document.createElement('div');head.innerHTML=`<div class="v205stage"><b>Objectif</b>${lessonGoal(activeLesson)}</div><div class="v205lessonMap">${Array.from({length:5},(_,j)=>{const idx=m.range[0]+j;return `<div class="${(state.done||[]).includes(idx)?'done':idx===activeLesson?'current':''}">${idx+1}</div>`}).join('')}</div><div class="v205goal"><b>Déroulement</b>1. Découvrir → 2. Mémoriser dans les 2 sens → 3. Test complet → 4. Plusieurs écoutes → 5. Parler.</div>`;host.prepend(head);
};

// Coach oral : conversation guidée réelle, sans prétendre reconnaître le luxembourgeois.
let coachScenario=0,coachTurn=0,coachHistory=[];
const coachScenarios=[
 {title:'Saluer et faire connaissance',turns:[
  {coach:'Moien! Wéi geet et?',fr:'Bonjour ! Comment ça va ?',choices:[['Et geet mir gutt.','Je vais bien.'],['Et geet.','Ça va.'],['Net esou gutt.','Pas très bien.']]},
  {coach:'Wéi heeschs du?',fr:'Comment t’appelles-tu ?',choices:[['Ech heeschen …','Je m’appelle …'],['Ech sinn …','Je suis …']]},
  {coach:'Wou wunns du?',fr:'Où habites-tu ?',choices:[['Ech wunnen zu …','J’habite à …'],['Ech kommen aus …','Je viens de …']]},
  {coach:'Merci. Äddi!',fr:'Merci. Au revoir !',choices:[['Äddi!','Au revoir !'],['Bis geschwënn!','À bientôt !']]}
 ]},
 {title:'Petite conversation quotidienne',turns:[
  {coach:'Wat méchs du gär an denger Fräizäit?',fr:'Qu’aimes-tu faire pendant ton temps libre ?',choices:[['Ech maache gär Sport.','J’aime faire du sport.'],['Ech lauschtere gär Musek.','J’aime écouter de la musique.']]},
  {coach:'A wéini méchs du dat?',fr:'Et quand fais-tu cela ?',choices:[['Owes.','Le soir.'],['De Weekend.','Le week-end.']]},
  {coach:'Mat wiem?',fr:'Avec qui ?',choices:[['Mat menger Famill.','Avec ma famille.'],['Mat Frënn.','Avec des amis.']]}
 ]}
];
window.openTutor=function(){coachScenario=(state.done||[]).length>=8?1:0;coachTurn=0;coachHistory=[];renderCoach();show('tutor')};
function renderCoach(){const s=coachScenarios[coachScenario],t=s.turns[coachTurn],host=document.getElementById('tutorContent');if(!host)return;if(!t){host.innerHTML=`<div class="v204stage">Coach oral</div><h2>Conversation terminée</h2>${coachHistory.map(h=>`<div class="v205coachMsg coach"><b>Coach</b><br>${h.c}</div><div class="v205coachMsg you"><b>Toi</b><br>${h.u}</div>`).join('')}<button class="primary" onclick="openTutor()">Refaire la conversation</button>`;return}
 host.innerHTML=`<div class="v204stage">Coach oral · ${coachTurn+1}/${s.turns.length}</div><h2 style="margin:4px 0 10px">${s.title}</h2>${coachHistory.slice(-2).map(h=>`<div class="v205coachMsg coach">${h.c}</div><div class="v205coachMsg you">${h.u}</div>`).join('')}<div class="v205coachMsg coach"><b>${t.coach}</b><br><small>${t.fr}</small></div><p class="muted">Réponds d’abord réellement à voix haute. Ensuite choisis ci-dessous la formulation la plus proche de ce que tu as voulu dire.</p><div class="v205coachActions">${t.choices.map((c,i)=>`<button onclick="v205CoachAnswer(${i})"><b>${c[0]}</b><small>${c[1]}</small></button>`).join('')}</div><div class="v205notice"><b>Pourquoi ce mode ?</b> La reconnaissance vocale Android/Chrome n’est pas assez fiable en luxembourgeois pour noter honnêtement la prononciation. Ici, l’app fait une vraie conversation à embranchements et te force à répondre à voix haute, sans prétendre avoir compris une transcription erronée.</div>`;
}
window.v205CoachAnswer=function(i){const s=coachScenarios[coachScenario],t=s.turns[coachTurn],c=t.choices[i];coachHistory.push({c:t.coach,u:c[0]});coachTurn++;renderCoach()};

document.title='Sproochentest Lëtzebuergesch V20.5';renderHome();
})();