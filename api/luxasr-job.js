export default async function handler(req,res){
 try{
  const id=String(req.query.id||'').trim();if(!/^[A-Za-z0-9._:-]+$/.test(id))return res.status(400).json({error:'Job invalide'});
  const sr=await fetch('https://luxasr.uni.lu/v3/asr/jobs/'+encodeURIComponent(id),{cache:'no-store'});const state=await sr.json().catch(()=>null);
  if(!sr.ok)return res.status(502).json({error:'Statut LuxASR indisponible'});
  if(state?.status!=='completed'){res.setHeader('Cache-Control','no-store');return res.status(200).json({ok:true,status:state?.status||'unknown',state});}
  const rr=await fetch('https://luxasr.uni.lu/v3/asr/jobs/'+encodeURIComponent(id)+'/result',{cache:'no-store'});const vtt=await rr.text();
  if(!rr.ok)return res.status(502).json({error:'Résultat LuxASR indisponible'});
  res.setHeader('Cache-Control','no-store');return res.status(200).json({ok:true,status:'completed',vtt});
 }catch(e){return res.status(500).json({error:e.message||'Erreur LuxASR'});}
}