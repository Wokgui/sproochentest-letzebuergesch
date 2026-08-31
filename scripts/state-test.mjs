import assert from 'node:assert/strict';
import { emptyState, normalizeState, parseStoredStateText, createProgressBackup, parseProgressBackup, PROGRESS_BACKUP_FORMAT, STATE_SCHEMA_VERSION } from '../src/state.js';

const L1='a1-presentation', L2='a1-cafe', BAD='lesson-does-not-exist';

// Sauvegarde ancienne, avant weeklyPlans/skillHistory/examen strict.
const v14=normalizeState({
  completed:[L1,BAD,L1],favorites:[L2,BAD],
  progress:{[L1]:{index:2,updatedAt:10},[BAD]:{index:99}},
  quizScores:{[L1]:{score:4,total:5},[BAD]:{score:9,total:9}},
  dailyGoal:15,readerScale:1.12,
  sproochScores:{photo:[{score:3,scene:'restaurant',updatedAt:12}]}
});
assert.deepEqual(v14.completed,[L1]);
assert.deepEqual(v14.favorites,[L2]);
assert.equal(v14.progress[BAD],undefined);
assert.equal(v14.quizScores[BAD],undefined);
assert.deepEqual(v14.weeklyPlans,{});
assert.equal(v14.sproochScores.photo.length,1);
assert.equal(v14.dailyGoal,15);

// Sauvegarde v1.9 : plans hebdomadaires et historiques à conserver/dédupliquer.
const v19=normalizeState({
  completed:[L1], weeklyPlans:{'2026-08-24':{focus:'oral'}}, dailyPlans:{'2026-08-30':{lessonId:L2}},
  pronunciation:[
    {lessonId:L1,index:0,updatedAt:100,score:2,note:'old'},
    {lessonId:L1,index:0,updatedAt:100,score:2,note:'new'}
  ],
  skillHistory:Object.fromEntries(Array.from({length:70},(_,i)=>[`2026-${String(6+Math.floor(i/28)).padStart(2,'0')}-${String(i%28+1).padStart(2,'0')}`,{reading:i}]))
});
assert.equal(v19.weeklyPlans['2026-08-24'].focus,'oral');
assert.equal(v19.dailyPlans['2026-08-30'].lessonId,L2);
assert.equal(v19.pronunciation.length,1);
assert.equal(v19.pronunciation[0].note,'new');
assert.ok(Object.keys(v19.skillHistory).length<=60);

// Sauvegarde v2.5 : session stricte et historique d'examen doivent survivre.
const v25=normalizeState({
  strictExam:{id:'strict-1',stage:'listening',listeningSet:'b1-model-1'},
  examSessions:[{id:'s1',completedAt:200,updatedAt:200,index:72}],
  sproochScores:{quick:[
    {lessonId:L1,topic:'famill',score:4,updatedAt:10},
    {lessonId:BAD,topic:'famill',score:5,updatedAt:20}
  ]},
  lastLesson:BAD
});
assert.equal(v25.strictExam.stage,'listening');
assert.equal(v25.examSessions.length,1);
assert.equal(v25.sproochScores.quick.length,1);
assert.equal(v25.sproochScores.quick[0].lessonId,L1);
assert.equal(v25.lastLesson,null);

// Un import ne doit jamais prétendre que les livres d'un autre appareil sont présents localement.
const importedWithDevice=normalizeState({bookOffline:{renert:{bytes:999,source:'foreign'}}},{bookOffline:{sigfrid:{bytes:123,source:'device'}}});
assert.equal(importedWithDevice.bookOffline.renert,undefined);
assert.equal(importedWithDevice.bookOffline.sigfrid.bytes,123);

// Types corrompus : la normalisation ne doit jamais lever d'exception.
const damaged=normalizeState({
  completed:'not-an-array', favorites:42, progress:null, words:['bad'], phrases:'bad', grammarNotes:false,
  exerciseProgress:'bad', challengeHistory:'bad', pronunciation:{}, dictation:null,
  sproochScores:'bad', bookProgress:'bad', bookOffline:'bad', seen:null, mistakes:7, activity:[],
  dailyGoal:999, readerScale:'huge', audio:'bad', lastLesson:BAD
});
assert.deepEqual(damaged.completed,[]);
assert.deepEqual(damaged.progress,{});
assert.deepEqual(damaged.exerciseProgress,{quiz:{},listening:{},last:null});
assert.equal(damaged.dailyGoal,10);
assert.equal(damaged.readerScale,1);
assert.equal(damaged.audio.voice,'mia');
assert.equal(damaged.audio.rate,1);
assert.equal(damaged.lastLesson,null);

// Nouveau format v2.9 : round-trip, schéma et rétrocompatibilité avec les anciens dumps bruts.
const payload=createProgressBackup({...emptyState(),completed:[L1],dailyGoal:20},{appVersion:'3.0.0'});
assert.equal(payload.format,PROGRESS_BACKUP_FORMAT);
assert.equal(payload.schemaVersion,STATE_SCHEMA_VERSION);
assert.equal(payload.appVersion,'3.0.0');
const roundTrip=parseProgressBackup(payload,{bookOffline:{}});
assert.deepEqual(roundTrip.completed,[L1]);
assert.equal(roundTrip.dailyGoal,20);
const oldRaw=parseProgressBackup({completed:[L2],dailyGoal:5},{bookOffline:{}});
assert.deepEqual(oldRaw.completed,[L2]);
assert.equal(oldRaw.dailyGoal,5);
assert.throws(()=>parseProgressBackup({format:'unknown-backup',state:{completed:[L1]}}));
assert.throws(()=>parseProgressBackup(null));
assert.deepEqual(parseStoredStateText(null).completed,[]);
assert.throws(()=>parseStoredStateText('\"primitive-corrupt-state\"'));
assert.throws(()=>parseStoredStateText('{truncated'));
assert.deepEqual(parseStoredStateText(JSON.stringify({completed:[L1]})).completed,[L1]);

// v3.0 : historique d'écoute détaillé et anciennes photos restent compatibles.
const v30=normalizeState({sproochScores:{listening:{hv1:{score:4,total:5,updatedAt:10}},listeningHistory:[{partId:'hv1',score:3,total:5,updatedAt:8},{partId:'hv1',score:4,total:5,updatedAt:10}],photo:[{score:3,scene:'restaurant',updatedAt:5},{score:4,criteria:[4,4,3,4,5],scene:'gare',updatedAt:6}]}});
assert.equal(v30.sproochScores.listeningHistory.length,2);
assert.equal(v30.sproochScores.photo[0].criteria,undefined);
assert.deepEqual(v30.sproochScores.photo[1].criteria,[4,4,3,4,5]);
const v31=normalizeState({reinforcementHistory:[{id:'mot-a',kind:'word',flagged:false,updatedAt:20},{id:'mot-a',kind:'word',flagged:true,updatedAt:21}]});assert.equal(v31.reinforcementHistory.length,2);assert.equal(STATE_SCHEMA_VERSION,12);

console.log('State migration test OK');
