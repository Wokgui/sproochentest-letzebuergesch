// V19.3 — correctif audio Android robuste
(function(){
  'use strict';
  const cache = new Map();
  let player = null;

  function clean(s){return String(s||'').replace(/[.…?!,:;]/g,'').trim();}
  function norm(s){return String(s||'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/^file:/,'').replace(/\.(ogg|oga|mp3|wav|webm)$/,'').replace(/[^a-z0-9]/g,'');}
  function statusFor(btn){return btn.parentElement && btn.parentElement.querySelector('.audioStatus');}
  function wordFor(btn){const row=btn.closest('.word');return clean(row && row.querySelector('.lux') ? row.querySelector('.lux').textContent : '');}

  async function searchCommons(word){
    if(cache.has(word)) return cache.get(word);
    const queries=[
      `intitle:${word} incategory:"Luxembourgish pronunciation"`,
      `"${word}" incategory:"Luxembourgish pronunciation"`,
      `"${word}" Luxembourgish pronunciation`
    ];
    const target=norm(word);
    for(const q of queries){
      try{
        const url='https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrlimit=30&prop=imageinfo&iiprop=url|extmetadata&format=json&origin=*&gsrsearch='+encodeURIComponent(q);
        const r=await fetch(url,{cache:'no-store'});
        if(!r.ok) continue;
        const j=await r.json();
        const pages=Object.values((j.query&&j.query.pages)||{});
        let best=null,score=-1;
        for(const p of pages){
          const ii=p.imageinfo&&p.imageinfo[0]; if(!ii||!ii.url) continue;
          const title=norm(p.title);
          const meta=Object.values(ii.extmetadata||{}).map(v=>v&&v.value||'').join(' ').replace(/<[^>]*>/g,' ').toLowerCase();
          let s=0;
          if(title===target||title===('lb'+target)) s+=100;
          if(title.includes(target)) s+=40;
          if(meta.includes(word.toLowerCase())) s+=35;
          if(meta.includes('luxembourgish')||meta.includes('lëtzebuerg')) s+=20;
          if(s>score){score=s;best=ii.url;}
        }
        if(best&&score>=40){cache.set(word,best);return best;}
      }catch(e){}
    }
    cache.set(word,null);return null;
  }

  async function handle(btn){
    const st=statusFor(btn), word=wordFor(btn), original='🔊 Écouter';
    btn.disabled=true; btn.textContent='⏳ Recherche…';
    if(st) st.textContent='Recherche de la prononciation humaine…';
    if(!word){btn.disabled=false;btn.textContent=original;if(st)st.textContent='Mot introuvable dans cette ligne.';return;}
    if(word.includes(' ')){btn.disabled=false;btn.textContent=original;if(st)st.textContent='Audio prévu uniquement pour les mots isolés.';return;}
    const url=await searchCommons(word);
    if(!url){btn.disabled=false;btn.textContent=original;if(st)st.textContent='Pas encore d’audio humain vérifié pour « '+word+' ».';return;}
    try{
      if(player){player.pause();player.currentTime=0;}
      player=new Audio(url);
      player.preload='auto';
      await player.play();
      btn.disabled=false;btn.textContent='🔊 Lecture…';
      if(st) st.textContent='Prononciation humaine';
      player.onended=function(){btn.textContent=original;if(st)st.textContent='Prononciation humaine disponible';};
      player.onerror=function(){btn.textContent=original;if(st)st.textContent='Le fichier audio n’a pas pu être lu.';};
    }catch(e){
      btn.disabled=false;btn.textContent=original;if(st)st.textContent='Lecture bloquée. Réappuie une fois.';
    }
  }

  document.addEventListener('click',function(e){
    const btn=e.target.closest&&e.target.closest('.audioBtn');
    if(!btn) return;
    e.preventDefault();e.stopImmediatePropagation();
    handle(btn);
  },true);

  document.querySelectorAll('.brand small').forEach(function(x){x.textContent='Départ zéro · V19.3';});
  document.title='Sproochentest Lëtzebuergesch V19.3';
})();