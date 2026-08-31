import { lessons } from './data.js';

export const STATE_SCHEMA_VERSION = 12;
export const PROGRESS_BACKUP_FORMAT = 'letzlies-progress-v2';

const isObject = value => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const asObject = value => isObject(value) ? value : {};
const asArray = value => Array.isArray(value) ? value : [];

export const emptyState = () => ({
  completed:[],favorites:[],progress:{},words:{},phrases:{},grammarNotes:{},pronunciation:[],dictation:[],dailyPlans:{},weeklyPlans:{},skillHistory:{},
  exerciseProgress:{quiz:{},listening:{},last:null},challengeHistory:[],reinforcementHistory:[],remediationHistory:[],bookProgress:{},bookOffline:{},seen:{},quizScores:{},mistakes:{},
  sproochScores:{listening:{},listeningHistory:[],oral:[],photo:[],quick:[]},mockRuns:[],strictExam:null,examSessions:[],lastLesson:null,activity:{},dailyGoal:10,readerScale:1,
  audio:{voice:'mia',rate:1,listenOnly:false}
});

export function dedupeHistory(arr,keyFn,limit=100){
  const m=new Map();
  for(const x of asArray(arr)){
    if(!x || typeof x !== 'object') continue;
    const k=keyFn(x);
    const prev=m.get(k);
    if(!prev || (Number(x.updatedAt)||0)>=(Number(prev.updatedAt)||0)) m.set(k,x);
  }
  return [...m.values()].sort((a,b)=>(Number(a.updatedAt)||0)-(Number(b.updatedAt)||0)).slice(-limit);
}

function cleanLessonMap(value,validLesson){
  return Object.fromEntries(Object.entries(asObject(value)).filter(([id])=>validLesson(id)));
}

function cleanDateMap(value,limit=60){
  return Object.fromEntries(Object.entries(asObject(value))
    .filter(([k,v])=>/^\d{4}-\d{2}-\d{2}$/.test(k)&&isObject(v))
    .sort(([a],[b])=>a.localeCompare(b)).slice(-limit));
}

function cleanExerciseProgress(value,validLesson){
  const raw=asObject(value), quiz=cleanLessonMap(raw.quiz,validLesson), listening=asObject(raw.listening);
  let last=isObject(raw.last)?{...raw.last}:null;
  if(last?.lessonId && !validLesson(last.lessonId)) last=null;
  return {quiz,listening:{...listening},last};
}

export function normalizeState(raw={},device={}){
  raw=asObject(raw);
  const base=emptyState(), validLesson=id=>Boolean(lessons.find(l=>l.id===id));
  const s={...base,...raw};
  s.completed=[...new Set(asArray(raw.completed).filter(validLesson))];
  s.favorites=[...new Set(asArray(raw.favorites).filter(validLesson))];
  s.progress=cleanLessonMap(raw.progress,validLesson);
  s.quizScores=cleanLessonMap(raw.quizScores,validLesson);
  s.words={...asObject(raw.words)};
  s.phrases={...asObject(raw.phrases)};
  s.grammarNotes={...asObject(raw.grammarNotes)};
  s.dailyPlans={...asObject(raw.dailyPlans)};
  s.weeklyPlans={...asObject(raw.weeklyPlans)};
  s.skillHistory=cleanDateMap(raw.skillHistory,60);
  s.exerciseProgress=cleanExerciseProgress(raw.exerciseProgress,validLesson);
  s.challengeHistory=dedupeHistory(raw.challengeHistory,x=>`${x.updatedAt||0}|${x.score||0}|${x.total||0}`,40);
  s.reinforcementHistory=dedupeHistory(raw.reinforcementHistory,x=>`${x.updatedAt||0}|${x.id||''}|${x.flagged?'flagged':''}`,80);
  s.remediationHistory=dedupeHistory(raw.remediationHistory,x=>`${x.updatedAt||0}|${x.mistakeId||''}|${x.action||''}`,120);
  s.pronunciation=dedupeHistory(raw.pronunciation,x=>`${x.lessonId||''}|${x.index??''}|${x.updatedAt||0}|${x.score||0}`,60).filter(x=>!x.lessonId||validLesson(x.lessonId));
  s.dictation=dedupeHistory(raw.dictation,x=>`${x.lessonId||''}|${x.index??''}|${x.updatedAt||0}|${x.score||0}`,80).filter(x=>!x.lessonId||validLesson(x.lessonId));
  s.mockRuns=dedupeHistory(raw.mockRuns,x=>`${x.updatedAt||0}|${x.index||0}`,30);
  s.strictExam=isObject(raw.strictExam)?{...raw.strictExam}:null;
  s.examSessions=dedupeHistory(raw.examSessions,x=>`${x.id||''}|${x.completedAt||x.updatedAt||0}`,20);
  const scores=asObject(raw.sproochScores);
  s.sproochScores={
    listening:{...asObject(scores.listening)},
    listeningHistory:dedupeHistory(scores.listeningHistory,x=>`${x.updatedAt||0}|${x.partId||x.id||''}|${x.score||0}|${x.total||0}|${x.strict?'strict':''}`,120),
    oral:dedupeHistory(scores.oral,x=>`${x.updatedAt||0}|${x.topic||''}|${x.score||0}`,30),
    photo:dedupeHistory(scores.photo,x=>`${x.updatedAt||0}|${x.scene||''}|${x.score||0}`,30),
    quick:dedupeHistory(scores.quick,x=>`${x.updatedAt||0}|${x.topic||''}|${x.lessonId||''}|${x.score||0}`,40).filter(x=>!x.lessonId||validLesson(x.lessonId))
  };
  s.bookProgress={...asObject(raw.bookProgress)};
  const deviceOffline=device && Object.prototype.hasOwnProperty.call(device,'bookOffline') ? device.bookOffline : raw.bookOffline;
  s.bookOffline={...asObject(deviceOffline)};
  s.seen={...asObject(raw.seen)};
  s.mistakes={...asObject(raw.mistakes)};
  s.activity={...asObject(raw.activity)};
  s.lastLesson=validLesson(raw.lastLesson)?raw.lastLesson:null;
  s.dailyGoal=[5,10,15,20].includes(Number(raw.dailyGoal))?Number(raw.dailyGoal):10;
  s.readerScale=[.92,1,1.12,1.24].includes(Number(raw.readerScale))?Number(raw.readerScale):1;
  s.audio={...base.audio,...asObject(raw.audio)};
  s.audio.voice=s.audio.voice==='mil'?'mil':'mia';
  s.audio.rate=Number(s.audio.rate)===.8?.8:1;
  s.audio.listenOnly=Boolean(s.audio.listenOnly);
  return s;
}

export function parseStoredStateText(text){
  if(text===null || text===undefined || text==='') return normalizeState({});
  const raw=JSON.parse(text);
  if(!isObject(raw)) throw new Error('STATE_ROOT');
  return normalizeState(raw);
}

export function createProgressBackup(state,{appVersion='unknown'}={}){
  return {
    format:PROGRESS_BACKUP_FORMAT,
    schemaVersion:STATE_SCHEMA_VERSION,
    appVersion,
    exportedAt:new Date().toISOString(),
    state:normalizeState(state)
  };
}

export function parseProgressBackup(payload,{bookOffline}={}){
  if(!isObject(payload)) throw new Error('BACKUP_INVALID');
  const wrapped=payload.format===PROGRESS_BACKUP_FORMAT;
  if(payload.format && !wrapped) throw new Error('BACKUP_FORMAT');
  const raw=wrapped?payload.state:payload;
  if(!isObject(raw)) throw new Error('BACKUP_STATE');
  return normalizeState(raw,{bookOffline});
}
