import fs from 'node:fs';
const app=fs.readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../styles.css',import.meta.url),'utf8');
const pkg=JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8'));
function must(ok,msg){if(!ok)throw new Error(msg);}
must(pkg.version==='3.3.0','package v3.3 attendu');
must(app.includes('function lessonCompletionSummary(lesson)'), 'résumé de fin de leçon absent');
must(app.includes('function nextStoryAfter(lesson)'), 'recommandation post-lecture absente');
must(app.includes('function renderLessonComplete()'), 'écran de fin de leçon absent');
must(app.includes("route('lesson-complete',{lessonId:lesson.id})"), 'fin de quiz non reliée au bilan');
must(app.includes('completion-consolidate')&&app.includes('completion-oral')&&app.includes('completion-next'), 'actions de boucle pédagogique incomplètes');
must(app.includes('story-recap'), 'bilan non rouvrable depuis une histoire terminée');
must(css.includes('.lesson-complete-hero')&&css.includes('.completion-words')&&css.includes('.completion-next'), 'CSS de fin de leçon absent');
console.log('Journey test OK');
