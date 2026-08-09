function clean(s){return String(s||'').replace(/\\u002F/g,'/').replace(/\\\//g,'/').replace(/&amp;/g,'&')}
function uniq(a){return [...new Set(a.filter(Boolean))]}
export default async function handler(req,res){
 if(req.method!=='POST')return res.status(405).json({error:'POST uniquement'});
 try{
  const raw=String(req.query.url||'');const u=new URL(raw);
  if(u.protocol!=='https:'||!u.hostname.endsWith('rtl.lu'))return res.status(400).json({error:'URL RTL invalide'});
  const pr=await fetch(u.toString(),{headers:{'user-agent':'Mozilla/5.0'}});const html=clean(await pr.text());
  if(!pr.ok)return res.status(pr.status).json({error:'RTL '+pr.status});
  const urls=uniq((html.match(/https?:[^\"'<>\\\s]+/g)||[]).map(x=>x.replace(/[),}\]]+$/,'')));
  const media=urls.filter(x=>/\.mp4(\?|$)/i.test(x));
  const m=media.find(x=>/360p\.mp4/i.test(x))||media.find(x=>/480p\.mp4/i.test(x))||media[0];
  if(!m)return res.status(404).json({error:'Vidéo MP4 RTL introuvable'});
  const vr=await fetch(m,{headers:{'user-agent':'Mozilla/5.0'}});if(!vr.ok||!vr.body)return res.status(502).json({error:'Téléchargement RTL impossible'});
  const ct=(vr.headers.get('content-type')||'video/mp4').split(';')[0];
  const submit=await fetch('https://luxasr.uni.lu/asr2?language=lb&diarization=Disabled&outfmt=vtt&maxlen=42',{method:'POST',headers:{'Content-Type':ct,'X-Filename':'rtl-journal.mp4'},body:vr.body,duplex:'half'});
  const sj=await submit.json().catch(()=>null);
  if(submit.status!==202||!sj?.job_id)return res.status(502).json({error:'LuxASR a refusé le journal',detail:sj||submit.status});
  res.setHeader('Cache-Control','no-store');return res.status(200).json({ok:true,job_id:sj.job_id});
 }catch(e){return res.status(500).json({error:e.message||'Erreur LuxASR'});}
}