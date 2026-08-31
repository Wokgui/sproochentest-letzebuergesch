import { spawn } from 'node:child_process';
import net from 'node:net';
import { access, readFile } from 'node:fs/promises';
import { lessons, books, photoScenes, listening } from '../src/data.js';

const required=['index.html','styles.css','manifest.webmanifest','sw.js','src/app.js','src/data.js','src/audio.js','src/dictionary.js','src/state.js','src/planner.js'];
for(const f of required) await access(new URL(`../${f}`, import.meta.url));
const app=await readFile(new URL('../src/app.js', import.meta.url),'utf8');
const stateSource=await readFile(new URL('../src/state.js', import.meta.url),'utf8');
const styles=await readFile(new URL('../styles.css', import.meta.url),'utf8');
const sw=await readFile(new URL('../sw.js', import.meta.url),'utf8');
const pkg=JSON.parse(await readFile(new URL('../package.json', import.meta.url),'utf8'));
for(const marker of ['renderStats','downloadAllBooks','getCachedBook','renderMistakes','recordQuizResult','renderSearch','À consolider','renderToday','todayPlan','reviewQueue','upcomingReviewQueue','dailySessionBlueprint','saveUpcomingPractice','mockTrainingSnapshot','saveMockRun','renderGrammarBook','grammarNotesList','renderShadowing','renderDictation','dictationScore','dictationStats','dailyPlans','data-today-sprooch','renderChallenge','adaptiveChallengeItems','recurringMistakes','grammarThemeStats','resumeExercise','saveQuizSession','exerciseProgress','challengeHistory','renderQuickOral','quickPromptFor','oralTopicProgress','consolidateQuickOral','quickOralStats','oralquick','weeklyPlans','competencySnapshot','dominantGap','gapLessonBoost','weeklyActivity','weeklyPlan','renderWeekly','examDiagnostic','masteryOverview','sproochPriorityVocabIds','renderReadiness','recordSkillSnapshot','skillTrend','skillHistoryRows','adaptiveWeeklyTargets','examPrepPlan','runTrainingAction','renderExamPrep','skillHistory','listeningModels','listeningModelSnapshot','listeningReferenceSnapshot','listeningBankStats','weakestListeningPart','leastPracticedOralTopics','leastPracticedPhotoScenes','nextMockListeningModel','mock-run-history','fragileLearningItems','fragilitySummary','consolidationPlan','runConsolidationAction','renderConsolidation','listeningKindLabel','renderStrictExam','startStrictExam','strictListeningScore','saveStrictExamResult','strictExamHistory','deleteCachedBook','clearBookCache','refreshBookOfflineState','applyPwaUpdate','registerPwa','sha1Hex','verifiedBookBytes','importOfficialBookFiles','exportOfflineLibrary','importOfflineLibrary']) if(!app.includes(marker)) throw new Error(`Fonction critique manquante: ${marker}`);
if(lessons.length<40) throw new Error('Corpus histoires incomplet');
if(books.length!==3) throw new Error('Bibliothèque attendue: 3 livres');
if(!styles.includes('.dictation-pane')) throw new Error('CSS dictée manquant');
if(!styles.includes('.adaptive-challenge-card')||!styles.includes('.grammar-theme-grid')||!styles.includes('.resume-exercise-card')) throw new Error('CSS v1.7 manquant');
if(!styles.includes('.quick-oral-entry')||!styles.includes('.story-oral-card')||!styles.includes('.oral-topic-grid')) throw new Error('CSS v1.8 manquant');
if(!styles.includes('.weekly-card')||!styles.includes('.weekly-targets')||!styles.includes('.competency-list')) throw new Error('CSS v1.9 manquant');
if(!styles.includes('.exam-dashboard-card')||!styles.includes('.exam-checklist')||!styles.includes('.mastery-map')||!styles.includes('.stats-diagnostic-link')) throw new Error('CSS v2.0 manquant');
if(!styles.includes('.skill-history')||!styles.includes('.exam-prep-entry')||!styles.includes('.exam-prep-tasks')) throw new Error('CSS v2.1 manquant');
if(!styles.includes('.listen-models')||!styles.includes('.listen-model-progress')||!styles.includes('.mock-listen-models')||!styles.includes('.mock-run-history')) throw new Error('CSS v2.2 manquant');
if(!styles.includes('.fragility-card')||!styles.includes('.consolidation-pane')||!styles.includes('.consolidation-tasks')||!styles.includes('.fragile-list')) throw new Error('CSS v2.3 manquant');
if(!styles.includes('.listen-kind')) throw new Error('CSS v2.4 type écoute manquant');
if(!styles.includes('.strict-exam-entry')||!styles.includes('.strict-progress')||!styles.includes('.strict-result-grid')) throw new Error('CSS v2.5 examen strict manquant');
if(!styles.includes('.update-card')||!styles.includes('.book-storage-row')||!styles.includes('.settings-stack')) throw new Error('CSS v2.6 stockage/update manquant');
if(!styles.includes('v2.7 Android / PWA hardening')||!styles.includes('safe-area-inset-top')||!styles.includes('min-height:44px')) throw new Error('CSS v2.7 Android/PWA manquant');
if(!sw.includes('letzlies-v33')) throw new Error('Cache PWA v3.3 manquant');
if(pkg.version!=='3.3.0') throw new Error(`Version package inattendue: ${pkg.version}`);
const legacyIds=['hv1','hv2','hv3'];if(!legacyIds.every(id=>listening.some(x=>x.id===id)))throw new Error('Compatibilité B1 historique hv1/hv2/hv3 rompue');
const sets=[...new Set(listening.map(x=>x.set||'m1'))];if(sets.length!==3) throw new Error(`Banque B1 attendue: 3 modèles, reçu ${sets.length}`);for(const set of sets){const parts=listening.filter(x=>(x.set||'m1')===set).sort((a,b)=>a.part-b.part);if(parts.map(x=>x.questions.length).join(',')!=='5,4,7')throw new Error(`${set}: structure B1 invalide`);}if(listening.reduce((n,x)=>n+x.questions.length,0)!==48)throw new Error('Banque B1 attendue: 48 questions');if(photoScenes.length<12)throw new Error('Banque A2 attendue: 12 visuels');const kindByPart={1:'radio',2:'conversation',3:'presentation'};if(listening.some(x=>x.kind!==kindByPart[x.part]))throw new Error('Typologie B1 v2.4 invalide');
if(!stateSource.includes('function normalizeState')||!stateSource.includes('function dedupeHistory')) throw new Error('Moteur de migration v3.0 manquant');
if(!app.includes('parseProgressBackup(incoming,{bookOffline:state.bookOffline})')) throw new Error('Import versionné v3.0 manquant');
if(!app.includes('STORAGE_BACKUP')||!app.includes('restoreLocalBackup')||!app.includes('stateRecovery.usedBackup')) throw new Error('Récupération locale v3.0 manquante');
if(!app.includes('createProgressBackup(state,{appVersion:APP_VERSION})')) throw new Error('Export versionné v3.0 manquant');
if(!app.includes('saved.targets=adaptiveWeeklyTargets(focus)')) throw new Error('Objectifs adaptatifs v2.1 manquants');
if(!app.includes("setExerciseResume('listening',{set:view.listeningSet,part:view.listeningPart})")) throw new Error('Reprise modèle + partie v2.2 manquante');
if(!app.includes('listeningSetTitle')) throw new Error('Historique des modèles B1 v2.2 manquant');
if(!app.includes("if(view.screen==='consolidation')return renderConsolidation()")) throw new Error('Route consolidation v2.3 manquante');
if(!app.includes("data-nav=\"consolidation\"")) throw new Error('Entrées consolidation v2.3 manquantes');
if(!app.includes('PARCOURS EXAMEN')) throw new Error('Libellé parcours examen manquant');
if(!app.includes("if(view.screen==='strict-exam')return renderStrictExam()")) throw new Error('Route examen strict v2.5 manquante');
if(!app.includes("setExerciseResume('strictexam'")) throw new Error('Reprise examen strict v2.5 manquante');
if(!app.includes("if(view.screen==='exam-prep')return renderExamPrep()")) throw new Error('Route révision examen v2.1 manquante');

const port=await new Promise((resolve,reject)=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p));});s.on('error',reject);});
const child=spawn(process.execPath,['scripts/serve.mjs'],{stdio:['ignore','pipe','pipe'],env:{...process.env,PORT:String(port)}});
try{
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Serveur non démarré')),5000);let err='';child.stderr.on('data',d=>err+=String(d));child.stdout.on('data',d=>{if(String(d).includes(String(port))){clearTimeout(timer);resolve();}});child.on('exit',c=>reject(new Error(`Serveur arrêté ${c}: ${err}`)));});
  for(const path of ['/','/styles.css','/src/app.js','/manifest.webmanifest','/icon-192.png','/covers/intro.svg']){const r=await fetch(`http://127.0.0.1:${port}${path}`);if(!r.ok)throw new Error(`${path}: HTTP ${r.status}`);const body=await r.text();if(body.length<20)throw new Error(`${path}: réponse vide`);}
  if(!app.includes('function listeningRecentStats')||!app.includes('listeningHistory')) throw new Error('Historique écoute v3.0 manquant');
if(!app.includes("['Détails','Cohérence','Vocabulaire','Fluidité','Clarté']")&&!app.includes("criteria=['Détails','Cohérence','Vocabulaire','Fluidité','Clarté']")) throw new Error('Évaluation photo 5 critères v3.0 manquante');
if(!styles.includes('.listen-history')||!styles.includes('.listen-trend')) throw new Error('CSS écoute v3.0 manquant');
if(!app.includes('data-review-focus="upcoming"')||!app.includes('saveUpcomingPractice')) throw new Error('Renforcement anticipé v3.1 manquant');
if(!styles.includes('.upcoming-actions')||!styles.includes('.upcoming-mini')) throw new Error('CSS renforcement anticipé v3.1 manquant');
console.log('Smoke test OK');
} finally { child.kill('SIGTERM'); }

if(!app.includes('checkLodAvailability')||!app.includes('dictionaryCacheStats')) throw new Error('Diagnostic LOD v2.6 manquant');
if(!sw.includes("e.data?.type==='SKIP_WAITING'")) throw new Error('Flux de mise à jour PWA v2.6 invalide');

if(!books.every(b=>/^[0-9a-f]{40}$/.test(b.sha1||''))) throw new Error('Empreintes SHA-1 livres v2.8 manquantes');
if(!app.includes('SHA‑1 officiel')||!app.includes('import-book-files')||!app.includes('import-book-library')) throw new Error('UI bibliothèque vérifiée v2.8 manquante');

if(!styles.includes('.recovery-card')||!styles.includes('.recovery-settings')) throw new Error('CSS récupération v3.0 manquant');
if(!stateSource.includes("PROGRESS_BACKUP_FORMAT = 'letzlies-progress-v2'")||!stateSource.includes('STATE_SCHEMA_VERSION = 12')) throw new Error('Format de sauvegarde v3.3 manquant');
if(!app.includes('function renderLessonComplete()')||!app.includes('lessonCompletionSummary')||!app.includes("route('lesson-complete'")) throw new Error('Boucle de fin de leçon v3.3 manquante');
if(!styles.includes('.lesson-complete-hero')||!styles.includes('.completion-next')) throw new Error('CSS fin de leçon v3.3 manquant');
