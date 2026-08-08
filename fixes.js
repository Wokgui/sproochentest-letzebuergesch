// V19.2 — correctifs chargés après l'application principale
(function(){
  const localAudioCache = {};
  let fixedAudioPlayer = null;
  const n = s => String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/^file:/,'').replace(/\.(ogg|oga|mp3|wav|webm)$/,'').replace(/[^a-z0-9]/g,'');
  const clean = s => String(s||'').replace(/[.…?!,:;]/g,'').trim();

  async function queryCommons(word, query){
    const url='https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrlimit=25&prop=imageinfo&iiprop=url|extmetadata&format=json&origin=*&gsrsearch='+encodeURIComponent(query);
    const json=await fetch(url,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error('commons '+r.status);return r.json()});
    const pages=Object.values(json.query?.pages||{}).filter(p=>p.imageinfo?.[0]?.url);
    const target=n(word);
    let best=null,bestScore=-1;
    for(const p of pages){
      const ii=p.imageinfo[0], title=n(p.title), meta=Object.values(ii.extmetadata||{}).map(x=>x?.value||'').join(' ').replace(/<[^>]*>/g,' ').toLowerCase();
      let score=0;
      if(title===`lb${target}`||title===target)score+=100;
      if(title.includes(target))score+=35;
      if(meta.includes(String(word).toLowerCase()))score+=30;
      if(meta.includes('luxembourgish')||meta.includes('luxembourgeois')||meta.includes('lëtzebuerg'))score+=25;
      if(/lingua libre|online dictionnaire|lod/.test(meta))score+=10;
      if(score>bestScore){bestScore=score;best=ii.url;}
    }
    return bestScore>=45?best:null;
  }

  window.resolveAudio = async function(word){
    word=clean(word);
    if(!word || word.includes(' ')) return null;
    if(Object.prototype.hasOwnProperty.call(localAudioCache,word))return localAudioCache[word];
    try{
      let url=null;
      if(typeof commonsExact==='function') url=await commonsExact(word).catch(()=>null);
      if(!url) url=await queryCommons(word,`intitle:${word} incategory:"Luxembourgish pronunciation"`);
      if(!url) url=await queryCommons(word,`"${word}" incategory:"Luxembourgish pronunciation"`);
      if(!url) url=await queryCommons(word,`"${word}" incategory:"Lingua Libre pronunciation-ltz"`);
      localAudioCache[word]=url||null;
      return localAudioCache[word];
    }catch(e){
      localAudioCache[word]=null;
      return null;
    }
  };

  window.playHumanAudio = async function(btn,word,statusId){
    const status=document.getElementById(statusId);
    const original=btn.textContent;
    const cleaned=clean(word);
    if(cleaned.includes(' ')){
      if(status)status.textContent='Audio mot isolé uniquement : cette ligne est une phrase.';
      return;
    }
    btn.disabled=true; btn.textContent='⏳ Recherche…';
    if(status) status.textContent='Recherche d’une prononciation humaine…';
    const url=await window.resolveAudio(cleaned);
    btn.disabled=false; btn.textContent=original;
    if(!url){
      if(status) status.textContent='Aucun enregistrement humain fiable trouvé pour ce mot.';
      return;
    }
    try{
      if(fixedAudioPlayer){fixedAudioPlayer.pause();fixedAudioPlayer.currentTime=0;}
      fixedAudioPlayer=new Audio(url);
      fixedAudioPlayer.preload='auto';
      fixedAudioPlayer.onerror=()=>{if(status)status.textContent='Le fichier audio existe mais sa lecture a échoué.'};
      await fixedAudioPlayer.play();
      btn.textContent='🔊 Lecture…';
      if(status)status.textContent='Prononciation humaine · Wikimedia/LOD/Lingua Libre';
      fixedAudioPlayer.onended=()=>{btn.textContent=original;if(status)status.textContent='Prononciation humaine disponible';};
    }catch(e){
      btn.textContent=original;
      if(status)status.textContent='Lecture bloquée par le navigateur. Réappuie sur Écouter.';
    }
  };

  const bank=[
    {title:'Comprendre une information simple',note:'Exercice préparatoire créé pour l’application — pas un extrait RTL.',transcript:"Haut ass d'Wieder zu Lëtzebuerg meeschtens sonneg. Am Nomëtteg ginn et ronn 24 Grad. Den Owend kënnen e puer Wolleken opkommen.",questions:[{question:'De quoi parle surtout ce passage ?',options:['De la météo','Des transports','D’une école'],answer:0,explanation:'Wieder, sonneg et Grad concernent la météo.'},{question:'Quelle température est annoncée l’après-midi ?',options:['14 °C','24 °C','34 °C'],answer:1,explanation:'« 24 Grad » est annoncé pour le Nomëtteg.'},{question:'Que peut-il se passer le soir ?',options:['Des nuages peuvent arriver','Il va neiger','Il fera 40 °C'],answer:0,explanation:'« e puer Wolleken opkommen » signifie que quelques nuages peuvent arriver.'}]},
    {title:'Lieu et transport',note:'Exercice préparatoire créé pour l’application — pas un extrait RTL.',transcript:"Zu Esch fiert eng nei Buslinn vun der Gare bis bei d'Spidol. De Bus fiert all zwanzeg Minutten. Vill Leit benotzen déi nei Linn.",questions:[{question:'Dans quelle ville se passe l’information ?',options:['Esch','Diekirch','Clervaux'],answer:0,explanation:'Le passage commence par « Zu Esch ».'},{question:'Quels lieux la ligne relie-t-elle ?',options:['La gare et l’hôpital','L’école et la piscine','L’aéroport et le centre'],answer:0,explanation:'« vun der Gare bis bei d\'Spidol ».'},{question:'À quelle fréquence passe le bus ?',options:['Toutes les 10 minutes','Toutes les 20 minutes','Toutes les heures'],answer:1,explanation:'« all zwanzeg Minutten ».'}]}
  ];

  window.renderNews=function(){
    const doneCount=state?.done?.length||0;
    const ready=doneCount>=7;
    if(!ready){
      newsGate.innerHTML=`<div class="card"><div class="lockedNote"><b>🔒 Pas encore.</b><br>Le journal parlé arrive après les bases. L’objectif est d’éviter de mettre une débutante face à un débit trop rapide.</div><div class="progress"><span style="width:${Math.min(100,doneCount/7*100)}%"></span></div><div class="tiny">${doneCount}/7 étapes préparatoires terminées</div></div>`;
      return;
    }
    const items=bank.map((x,i)=>`<button class="source" onclick="openBankExercise(${i})"><b>${x.title}</b><small>${x.note}</small></button>`).join('');
    newsGate.innerHTML=`<div class="card"><div class="eyebrow">Sans API payante</div><h3>Banque de compréhensions</h3><p class="muted">Les exercices sont ajoutés directement aux mises à jour de l’application. Aucun compte API ni clé n’est nécessaire.</p>${items}<a class="source" href="https://play.rtl.lu/shows/lb/journal/episodes" target="_blank" rel="noopener"><b>Ouvrir De Journal sur RTL Play</b><small>Pour s’habituer ensuite au luxembourgeois authentique</small></a><div class="notice">Les futurs exercices authentiques pourront être préparés ici puis ajoutés à cette banque lors des mises à jour, sans facturation API.</div></div><div id="bankExercise"></div>`;
  };

  window.openBankExercise=function(i){
    const x=bank[i], host=document.getElementById('bankExercise');
    host.innerHTML=`<div class="card"><div class="eyebrow">Compréhension</div><h3>${x.title}</h3><div class="notice" style="font-size:15px;color:var(--ink)">${x.transcript}</div>${x.questions.map((q,qi)=>`<div class="questionCard"><b>${qi+1}. ${q.question}</b>${q.options.map((o,oi)=>`<button class="qOption" onclick="checkBank(this,${oi},${q.answer})">${o}</button>`).join('')}<div class="tiny">${q.explanation}</div></div>`).join('')}</div>`;
    host.scrollIntoView({behavior:'smooth',block:'start'});
  };

  window.checkBank=function(btn,choice,answer){
    const group=btn.parentElement.querySelectorAll('.qOption');
    group.forEach((b,i)=>{b.disabled=true;if(i===answer)b.classList.add('good')});
    if(choice!==answer)btn.classList.add('bad');
  };

  document.querySelectorAll('.brand small').forEach(x=>x.textContent='Départ zéro · V19.2');
  document.title='Sproochentest Lëtzebuergesch V19.2';
})();