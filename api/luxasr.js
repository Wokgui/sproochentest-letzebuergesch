export const config={api:{bodyParser:false}};

async function rawBody(req){const parts=[];for await(const c of req)parts.push(Buffer.isBuffer(c)?c:Buffer.from(c));return Buffer.concat(parts)}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

export default async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'POST uniquement'});
  try{
    const body=await rawBody(req);if(!body.length)return res.status(400).json({error:'Audio vide'});
    const ct=String(req.headers['content-type']||'audio/webm').split(';')[0];
    const submit=await fetch('https://luxasr.uni.lu/asr2?language=lb&diarization=Disabled&outfmt=vtt&maxlen=42',{
      method:'POST',headers:{'Content-Type':ct,'X-Filename':'rtl-segment.webm'},body
    });
    const sj=await submit.json().catch(()=>null);
    if(submit.status!==202||!sj?.job_id)return res.status(502).json({error:'LuxASR a refusé le segment',detail:sj||submit.status});
    const id=sj.job_id;let state=null;
    for(let i=0;i<60;i++){
      await sleep(1000);
      const sr=await fetch('https://luxasr.uni.lu/v3/asr/jobs/'+encodeURIComponent(id),{cache:'no-store'});
      state=await sr.json().catch(()=>null);
      if(state?.status==='completed')break;
      if(state?.status==='failed')return res.status(502).json({error:'LuxASR: transcription échouée',detail:state});
    }
    if(state?.status!=='completed')return res.status(504).json({error:'LuxASR: délai dépassé'});
    const rr=await fetch('https://luxasr.uni.lu/v3/asr/jobs/'+encodeURIComponent(id)+'/result',{cache:'no-store'});
    const vtt=await rr.text();if(!rr.ok)return res.status(502).json({error:'LuxASR: résultat indisponible'});
    res.setHeader('Cache-Control','no-store');return res.status(200).json({ok:true,vtt});
  }catch(e){return res.status(500).json({error:e.message||'Erreur LuxASR'});}
}
