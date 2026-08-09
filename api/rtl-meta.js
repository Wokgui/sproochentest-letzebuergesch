function clean(s){return String(s||'').replace(/\\u002F/g,'/').replace(/\\\//g,'/').replace(/&amp;/g,'&');}
function uniq(a){return [...new Set(a.filter(Boolean))];}
export default async function handler(req,res){
  try{
    const raw=String(req.query.url||'');
    const u=new URL(raw);
    if(u.protocol!=='https:'||!u.hostname.endsWith('rtl.lu')) return res.status(400).json({error:'URL RTL invalide'});
    const r=await fetch(u.toString(),{headers:{'user-agent':'Mozilla/5.0'}});
    const html=clean(await r.text());
    if(!r.ok) return res.status(r.status).json({error:'RTL '+r.status});
    const urls=uniq((html.match(/https?:[^\"'<>\\\s]+/g)||[]).map(x=>x.replace(/[),}\]]+$/,'')));
    const media=urls.filter(x=>/\.(m3u8|mp4)(\?|$)/i.test(x));
    const subtitles=urls.filter(x=>/\.(vtt|srt|ttml|xml)(\?|$)/i.test(x)||/subtitle|caption/i.test(x));
    const textHits=[];
    const re=/(?:subtitle|caption|track|src|url)[^\n]{0,220}/ig; let m;
    while((m=re.exec(html))&&textHits.length<40) textHits.push(m[0]);
    res.setHeader('Cache-Control','no-store');
    return res.status(200).json({ok:true,source:u.toString(),media:uniq(media).slice(0,30),subtitles:uniq(subtitles).slice(0,50),hints:textHits});
  }catch(e){return res.status(500).json({error:e.message||'Erreur'});}
}
