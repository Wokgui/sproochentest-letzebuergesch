import os,re,time,json,subprocess,urllib.request
from pathlib import Path

RTL_LIST='https://play.rtl.lu/shows/fr/journal/episodes'
OUT=Path('rtl-vtt'); OUT.mkdir(exist_ok=True)
LIMIT=int(os.getenv('RTL_LIMIT','12'))
UA={'User-Agent':'Mozilla/5.0'}

def get(url):
    req=urllib.request.Request(url,headers=UA)
    with urllib.request.urlopen(req,timeout=60) as r:return r.read()

def clean(s):return s.replace('\\u002F','/').replace('\\/','/').replace('&amp;','&')

def episode_ids():
    h=clean(get(RTL_LIST).decode('utf-8','ignore'))
    ids=[]
    for x in re.findall(r'/shows/fr/journal/episodes/r/(\d+)',h):
        if x not in ids:ids.append(x)
    return ids[:LIMIT]

def media_url(eid):
    u=f'https://play.rtl.lu/shows/fr/journal/episodes/r/{eid}'
    h=clean(get(u).decode('utf-8','ignore'))
    urls=re.findall(r'https?:[^\"\'<>\\\s]+',h)
    urls=[x.rstrip('),}]') for x in urls if re.search(r'\.mp4(?:\?|$)',x,re.I)]
    for pat in ('360p.mp4','480p.mp4'):
        for x in urls:
            if pat.lower() in x.lower():return x
    return urls[0] if urls else None

def transcribe(eid,url):
    tmp=f'/tmp/{eid}.mp4'
    subprocess.run(['curl','-L','--fail','--retry','3','-A','Mozilla/5.0','-o',tmp,url],check=True)
    p=subprocess.run(['curl','-sS','--fail-with-body','-X','POST','https://luxasr.uni.lu/asr2?language=lb&diarization=Disabled&outfmt=vtt&maxlen=42','-H','Content-Type: video/mp4','-H',f'X-Filename:{eid}.mp4','--data-binary',f'@{tmp}'],capture_output=True,text=True,check=True)
    jid=json.loads(p.stdout)['job_id']
    for _ in range(180):
        time.sleep(2)
        st=json.loads(get(f'https://luxasr.uni.lu/v3/asr/jobs/{jid}').decode())
        if st.get('status')=='completed':break
        if st.get('status')=='failed':raise RuntimeError('LuxASR failed')
    else: raise RuntimeError('LuxASR timeout')
    vtt=get(f'https://luxasr.uni.lu/v3/asr/jobs/{jid}/result').decode('utf-8','ignore')
    (OUT/f'{eid}.vtt').write_text(vtt,encoding='utf-8')
    os.remove(tmp)

for eid in episode_ids():
    dest=OUT/f'{eid}.vtt'
    if dest.exists():
        print(eid,'déjà prêt');continue
    try:
        m=media_url(eid)
        if not m:raise RuntimeError('MP4 introuvable')
        print('Préparation',eid)
        transcribe(eid,m)
    except Exception as e:
        print('ERREUR',eid,e)
