import { speakLuxembourgish, unlockAudioGesture } from './audio.js';

const COACH_NAME = 'Mia';
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition || null;

const SCENARIOS = {
  alldag: {
    label: 'Alldag',
    greeting: 'Moien! Ech sinn d’Mia. Wéi geet et dir haut?',
    prompts: [
      'Wat hues du haut gemaach?',
      'Wat méchs du gär an denger Fräizäit?',
      'Wéi gesäit en normalen Dag bei dir aus?',
      'Wat hues du fir dëse Weekend geplangt?'
    ]
  },
  restaurant: {
    label: 'Restaurant',
    greeting: 'Moien! Mir sinn elo an engem Restaurant. Wat wëlls du gär bestellen?',
    prompts: [
      'Wat ëss du besonnesch gär?',
      'Drénks du léiwer Waasser, Kaffi oder eppes anescht?',
      'Gees du dacks an de Restaurant?',
      'Wat géifs du engem Frënd recommandéieren?'
    ]
  },
  aarbecht: {
    label: 'Aarbecht',
    greeting: 'Moien! Loosst eis iwwer d’Aarbecht schwätzen. Wat méchs du berufflech?',
    prompts: [
      'Wéi gesäit däin normalen Aarbechtsdag aus?',
      'Wat gefält dir am beschten un denger Aarbecht?',
      'Schaffs du léiwer eleng oder an engem Team?',
      'Wéi sinn deng Aarbechtszäiten?'
    ]
  },
  reesen: {
    label: 'Reesen',
    greeting: 'Moien! Loosst eis iwwer Reesen schwätzen. Wou waars du fir d’lescht an der Vakanz?',
    prompts: [
      'Wéi rees du am léifsten?',
      'Wat ass eng Stad, déi dir gutt gefall huet?',
      'Wat méchs du gär an der Vakanz?',
      'Wou wëlls du nach eng Kéier hifueren?'
    ]
  },
  sproochentest: {
    label: 'Sproochentest',
    greeting: 'Moien! Mir maachen eng kleng Sproochentest-Simulatioun. Kanns du dech kuerz virstellen?',
    prompts: [
      'Wou wunns du a wat gefält dir do?',
      'Wat méchs du an denger Fräizäit?',
      'Kannst du e bëssen iwwer deng Famill erzielen?',
      'Firwat léiers du Lëtzebuergesch?'
    ]
  }
};

let overlay = null;
let recognition = null;
let listening = false;
let speaking = false;
let busy = false;
let autoListen = false;
let scenario = 'alldag';
let history = [];
let fallbackTurn = 0;
let lastInterim = '';

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

function injectStyles() {
  if (document.getElementById('mia-coach-styles')) return;
  const style = document.createElement('style');
  style.id = 'mia-coach-styles';
  style.textContent = `
    .mia-entry{width:100%;margin:16px 0 18px;border:0;border-radius:24px;padding:18px 18px;display:flex;align-items:center;gap:15px;text-align:left;background:linear-gradient(135deg,#273b35,#41675a);color:#fff;box-shadow:0 12px 28px rgba(29,54,46,.18);cursor:pointer}
    .mia-entry-avatar{width:58px;height:58px;flex:0 0 58px;border-radius:50%;background:#f0c7a6;position:relative;overflow:hidden;box-shadow:inset 0 -7px 0 rgba(125,78,58,.10),0 0 0 5px rgba(255,255,255,.12)}
    .mia-entry-avatar:before{content:'';position:absolute;left:8px;right:8px;top:8px;height:24px;border-radius:60% 60% 45% 45%;background:#4a3027}
    .mia-entry-avatar:after{content:'';position:absolute;left:15px;right:15px;top:31px;height:8px;border-bottom:3px solid #9b5d54;border-radius:50%}
    .mia-entry-copy{min-width:0;display:flex;flex-direction:column;gap:3px;flex:1}.mia-entry-copy small{font-size:11px;letter-spacing:.08em;opacity:.75;font-weight:750}.mia-entry-copy b{font-size:18px}.mia-entry-copy span{font-size:13px;line-height:1.35;opacity:.82}.mia-entry-arrow{font-size:22px;opacity:.8}
    .mia-overlay{position:fixed;inset:0;z-index:10000;background:#f7f5ef;color:#24312d;display:flex;flex-direction:column;overflow:hidden;font-family:inherit}
    .mia-top{padding:max(12px,env(safe-area-inset-top)) 14px 10px;display:grid;grid-template-columns:44px 1fr 44px;align-items:center;border-bottom:1px solid rgba(35,55,49,.08);background:rgba(247,245,239,.96);backdrop-filter:blur(14px)}
    .mia-top button{width:40px;height:40px;border:0;border-radius:50%;background:#e9ece7;color:#263a34;font-size:22px;cursor:pointer}.mia-title{text-align:center;line-height:1.1}.mia-title b{display:block;font-size:16px}.mia-title span{display:block;font-size:11px;color:#73807b;margin-top:3px}
    .mia-stage{position:relative;padding:14px 16px 12px;background:radial-gradient(circle at 50% 32%,#dfeae3 0,#edf1eb 44%,#f7f5ef 75%);display:flex;flex-direction:column;align-items:center;flex:0 0 auto}
    .mia-avatar-wrap{width:142px;height:142px;position:relative;display:grid;place-items:center}.mia-ring{position:absolute;inset:5px;border-radius:50%;border:1px solid rgba(53,104,86,.18);box-shadow:0 0 0 12px rgba(64,111,94,.06)}
    .mia-face{width:112px;height:122px;border-radius:48% 48% 46% 46%;background:linear-gradient(#f2cbaa,#e5b28f);position:relative;box-shadow:inset 0 -7px 0 rgba(122,73,52,.06),0 12px 30px rgba(60,73,66,.15)}
    .mia-hair{position:absolute;left:-3px;right:-3px;top:-6px;height:58px;border-radius:54% 54% 35% 35%;background:#4c3026;clip-path:polygon(0 0,100% 0,100% 55%,84% 48%,70% 72%,52% 46%,32% 69%,10% 48%,0 63%)}
    .mia-eye{position:absolute;top:59px;width:9px;height:6px;border-radius:50%;background:#3c332f;animation:miaBlink 5.2s infinite}.mia-eye.left{left:29px}.mia-eye.right{right:29px}
    .mia-nose{position:absolute;top:70px;left:52px;width:8px;height:10px;border-right:2px solid rgba(120,72,55,.36);border-bottom:2px solid rgba(120,72,55,.25);border-radius:0 0 6px 0}
    .mia-mouth{position:absolute;left:43px;top:91px;width:27px;height:8px;border-bottom:3px solid #9b5a58;border-radius:0 0 50% 50%;transform-origin:center;transition:.12s ease}
    .mia-overlay.is-speaking .mia-mouth{animation:miaTalk .24s infinite alternate}.mia-overlay.is-speaking .mia-ring{animation:miaPulse 1.25s infinite}.mia-overlay.is-listening .mia-ring{border-color:#3d7a66;box-shadow:0 0 0 12px rgba(61,122,102,.09),0 0 0 22px rgba(61,122,102,.04);animation:miaListen 1.05s infinite}
    .mia-status{min-height:20px;margin-top:7px;font-size:12px;color:#687772;font-weight:700}.mia-status strong{color:#3d715f}.mia-scenario{margin-top:9px;display:flex;gap:7px;max-width:100%;overflow-x:auto;padding:1px 4px 3px;scrollbar-width:none}.mia-scenario::-webkit-scrollbar{display:none}.mia-scenario button{white-space:nowrap;border:1px solid #d6ded9;background:rgba(255,255,255,.74);border-radius:999px;padding:7px 11px;color:#53645e;font:inherit;font-size:12px;font-weight:700}.mia-scenario button.active{background:#355f51;color:#fff;border-color:#355f51}
    .mia-chat{flex:1;overflow:auto;padding:13px 14px 18px;display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth}.mia-message{max-width:min(84%,560px);padding:11px 13px;border-radius:18px;font-size:15px;line-height:1.42;box-shadow:0 2px 8px rgba(31,54,46,.05)}.mia-message.assistant{align-self:flex-start;background:#fff;border-bottom-left-radius:6px}.mia-message.user{align-self:flex-end;background:#355f51;color:#fff;border-bottom-right-radius:6px}.mia-message small{display:block;margin-bottom:3px;font-size:10px;text-transform:uppercase;letter-spacing:.06em;opacity:.58;font-weight:800}.mia-correction{max-width:min(88%,600px);align-self:flex-start;margin-top:-4px;background:#fff5d9;border:1px solid #eadcae;color:#5d5136;padding:9px 11px;border-radius:13px;font-size:12px;line-height:1.38}.mia-correction b{display:block;font-size:10px;letter-spacing:.06em;margin-bottom:2px}
    .mia-interim{min-height:18px;padding:0 16px 5px;color:#70807a;font-size:12px;font-style:italic;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .mia-compose{padding:9px 12px max(10px,env(safe-area-inset-bottom));background:#fff;border-top:1px solid #e3e7e3;display:grid;grid-template-columns:50px 1fr 44px;gap:8px;align-items:center}.mia-mic{width:50px;height:50px;border:0;border-radius:50%;background:#355f51;color:#fff;font-size:21px;box-shadow:0 7px 18px rgba(53,95,81,.25)}.mia-mic.listening{background:#b24f47;animation:miaMic 1.1s infinite}.mia-compose input{width:100%;box-sizing:border-box;border:1px solid #dce2dd;background:#f7f8f5;border-radius:16px;padding:13px 14px;font:inherit;font-size:15px;outline:none}.mia-compose input:focus{border-color:#6f9c8b;box-shadow:0 0 0 3px rgba(78,129,109,.09)}.mia-send{width:44px;height:44px;border:0;border-radius:50%;background:#e8eee9;color:#315848;font-size:20px}.mia-controls{position:absolute;right:13px;bottom:13px}.mia-auto{border:1px solid #d6ded9;background:rgba(255,255,255,.76);border-radius:999px;padding:6px 9px;font:inherit;font-size:10px;font-weight:800;color:#63726d}.mia-auto.on{background:#355f51;color:#fff;border-color:#355f51}
    .mia-busy{opacity:.58;pointer-events:none}
    @keyframes miaTalk{from{height:6px;transform:scaleX(.8)}to{height:14px;border-radius:45%;transform:scaleX(1.05)}}@keyframes miaPulse{50%{transform:scale(1.045);box-shadow:0 0 0 16px rgba(64,111,94,.045)}}@keyframes miaListen{50%{transform:scale(1.035)}}@keyframes miaMic{50%{box-shadow:0 0 0 9px rgba(178,79,71,.13)}}@keyframes miaBlink{0%,44%,48%,100%{transform:scaleY(1)}46%{transform:scaleY(.12)}}
    @media (min-width:700px){.mia-overlay{left:50%;right:auto;width:min(620px,100vw);transform:translateX(-50%);box-shadow:0 0 80px rgba(30,49,43,.18)}.mia-stage{padding-top:19px}.mia-avatar-wrap{width:160px;height:160px}.mia-chat{padding-left:22px;padding-right:22px}}
  `;
  document.head.append(style);
}

function avatarMarkup() {
  return `<div class="mia-avatar-wrap" aria-hidden="true"><div class="mia-ring"></div><div class="mia-face"><div class="mia-hair"></div><i class="mia-eye left"></i><i class="mia-eye right"></i><i class="mia-nose"></i><i class="mia-mouth"></i></div></div>`;
}

function injectEntry() {
  const root = document.querySelector('.sprooch-grid');
  if (!root || document.getElementById('mia-conversation-entry')) return;
  const button = document.createElement('button');
  button.id = 'mia-conversation-entry';
  button.className = 'mia-entry';
  button.type = 'button';
  button.innerHTML = `<span class="mia-entry-avatar" aria-hidden="true"></span><span class="mia-entry-copy"><small>CONVERSATION · NOUVEAU</small><b>Parler avec Mia</b><span>Conversation libre en luxembourgeois avec voix et corrections discrètes.</span></span><span class="mia-entry-arrow">›</span>`;
  button.addEventListener('click', () => {
    unlockAudioGesture();
    openCoach();
  });
  root.parentNode.insertBefore(button, root);
}

function observeApp() {
  injectStyles();
  injectEntry();
  const app = document.getElementById('app');
  if (!app) return;
  new MutationObserver(() => injectEntry()).observe(app, { childList: true, subtree: true });
}

function setStatus(text, strong = false) {
  const el = overlay?.querySelector('.mia-status');
  if (el) el.innerHTML = strong ? `<strong>${esc(text)}</strong>` : esc(text);
}

function updateStateClasses() {
  if (!overlay) return;
  overlay.classList.toggle('is-speaking', speaking);
  overlay.classList.toggle('is-listening', listening);
  overlay.classList.toggle('mia-busy', busy);
  const mic = overlay.querySelector('.mia-mic');
  if (mic) {
    mic.classList.toggle('listening', listening);
    mic.textContent = listening ? '■' : '●';
    mic.setAttribute('aria-label', listening ? 'Arrêter le micro' : 'Parler');
  }
}

function scrollChat() {
  const chat = overlay?.querySelector('.mia-chat');
  if (chat) requestAnimationFrame(() => { chat.scrollTop = chat.scrollHeight; });
}

function addMessage(role, text, correction = null) {
  const chat = overlay?.querySelector('.mia-chat');
  if (!chat || !text) return;
  const message = document.createElement('div');
  message.className = `mia-message ${role}`;
  message.innerHTML = `<small>${role === 'assistant' ? COACH_NAME : 'Du'}</small>${esc(text)}`;
  chat.append(message);
  if (correction) {
    const note = document.createElement('div');
    note.className = 'mia-correction';
    note.innerHTML = `<b>CORRECTION UTILE</b>${esc(correction)}`;
    chat.append(note);
  }
  scrollChat();
}

function currentGreeting() {
  return SCENARIOS[scenario]?.greeting || SCENARIOS.alldag.greeting;
}

function resetConversation(speakGreeting = true) {
  stopListening();
  history = [];
  fallbackTurn = 0;
  const chat = overlay?.querySelector('.mia-chat');
  if (chat) chat.innerHTML = '';
  const greeting = currentGreeting();
  addMessage('assistant', greeting);
  history.push({ role: 'assistant', content: greeting });
  if (speakGreeting) speakAssistant(greeting);
}

async function speakAssistant(text) {
  if (!overlay || !text) return;
  stopListening();
  speaking = true;
  setStatus('Mia schwätzt…', true);
  updateStateClasses();
  try {
    unlockAudioGesture();
    await speakLuxembourgish(text, { voice: 'mia', rate: 1 });
  } catch {
    setStatus('Voix indisponible — le texte reste utilisable');
  } finally {
    speaking = false;
    updateStateClasses();
    if (overlay) {
      setStatus(autoListen ? 'Lauschteren…' : 'Tippe sur le micro pour répondre');
      if (autoListen) setTimeout(() => startListening(), 180);
    }
  }
}

function stopListening() {
  if (recognition) {
    try { recognition.onend = null; recognition.stop(); } catch {}
    recognition = null;
  }
  listening = false;
  lastInterim = '';
  const interim = overlay?.querySelector('.mia-interim');
  if (interim) interim.textContent = '';
  updateStateClasses();
}

function startListening() {
  if (!overlay || busy || speaking) return;
  if (!SpeechRecognition) {
    setStatus('Reconnaissance vocale indisponible : écris ta réponse');
    overlay.querySelector('.mia-input')?.focus();
    return;
  }
  stopListening();
  const rec = new SpeechRecognition();
  recognition = rec;
  rec.lang = 'lb-LU';
  rec.continuous = false;
  rec.interimResults = true;
  rec.maxAlternatives = 1;
  rec.onstart = () => {
    listening = true;
    setStatus('Ech lauschteren…', true);
    updateStateClasses();
  };
  rec.onresult = event => {
    let finalText = '';
    let interimText = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const value = event.results[i][0]?.transcript || '';
      if (event.results[i].isFinal) finalText += value;
      else interimText += value;
    }
    lastInterim = interimText;
    const preview = overlay?.querySelector('.mia-interim');
    if (preview) preview.textContent = interimText ? `« ${interimText} »` : '';
    if (finalText.trim()) {
      stopListening();
      submitMessage(finalText.trim());
    }
  };
  rec.onerror = event => {
    listening = false;
    recognition = null;
    updateStateClasses();
    if (event.error === 'not-allowed' || event.error === 'service-not-allowed') setStatus('Autorise le micro pour parler à Mia');
    else if (event.error !== 'aborted' && event.error !== 'no-speech') setStatus('Je n’ai pas bien entendu — réessaie');
    else setStatus('Tippe sur le micro pour répondre');
  };
  rec.onend = () => {
    listening = false;
    recognition = null;
    updateStateClasses();
    if (lastInterim.trim() && !busy) {
      const text = lastInterim.trim();
      lastInterim = '';
      submitMessage(text);
    } else if (!busy && !speaking) setStatus('Tippe sur le micro pour répondre');
  };
  try { rec.start(); } catch { setStatus('Impossible de démarrer le micro'); }
}

function localCorrection(text) {
  const t = text.toLocaleLowerCase('lb-LU');
  if (/\bich\b/.test(t)) return 'En luxembourgeois, on dit « ech », pas « ich ».';
  if (/\bnicht\b/.test(t)) return 'Pour la négation courante, utilise « net » plutôt que l’allemand « nicht ».';
  if (/\bmein\b/.test(t)) return 'Le possessif luxembourgeois est généralement « mäin » et non l’allemand « mein ».';
  if (/ech\s+hu(?:nn)?\s+\d+\s+joer/.test(t)) return 'Pour l’âge : « Ech sinn … Joer al. »';
  if (/\bsehr\b/.test(t)) return '« sehr » est allemand. En luxembourgeois, on emploie souvent « ganz » ou « vill » selon le contexte.';
  return null;
}

function localReply(text) {
  const data = SCENARIOS[scenario] || SCENARIOS.alldag;
  const lower = text.toLocaleLowerCase('lb-LU');
  let reply;
  if (/^(moien|salut|hallo|bonjour)\b/.test(lower)) reply = 'Moien! Schéin, mat dir ze schwätzen. ' + data.prompts[fallbackTurn % data.prompts.length];
  else if (/\b(net|nee|näischt)\b/.test(lower) && text.length < 28) reply = 'Dat ass kee Problem. Kanns du mir e bëssen méi dovun erzielen?';
  else if (/\b(gutt|super|flott|gär|gaer)\b/.test(lower)) reply = 'Dat kléngt gutt! ' + data.prompts[fallbackTurn % data.prompts.length];
  else reply = ['Interessant! ', 'Ah jo, ech verstinn. ', 'Dat ass spannend. ', 'Ganz gutt! '][fallbackTurn % 4] + data.prompts[fallbackTurn % data.prompts.length];
  fallbackTurn += 1;
  return { reply, correction: localCorrection(text), source: 'local' };
}

async function askCoach(message) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 14000);
  try {
    const response = await fetch('/api/conversation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        message,
        scenario,
        level: 'A2',
        history: history.slice(0, -1).slice(-8)
      })
    });
    if (!response.ok) throw new Error(`HTTP_${response.status}`);
    const data = await response.json();
    if (!data?.reply) throw new Error('EMPTY_REPLY');
    return data;
  } catch {
    return localReply(message);
  } finally {
    clearTimeout(timeout);
  }
}

async function submitMessage(raw) {
  const message = String(raw || '').trim();
  if (!overlay || !message || busy) return;
  stopListening();
  const input = overlay.querySelector('.mia-input');
  if (input) input.value = '';
  addMessage('user', message);
  history.push({ role: 'user', content: message });
  busy = true;
  setStatus('Mia denkt…', true);
  updateStateClasses();
  const answer = await askCoach(message);
  if (!overlay) return;
  busy = false;
  updateStateClasses();
  addMessage('assistant', answer.reply, answer.correction || null);
  history.push({ role: 'assistant', content: answer.reply });
  history = history.slice(-10);
  if (answer.source === 'local') setStatus('Mode local · conversation simplifiée');
  await speakAssistant(answer.reply);
}

function closeCoach() {
  stopListening();
  overlay?.remove();
  overlay = null;
  speaking = false;
  busy = false;
}

function changeScenario(next) {
  if (!SCENARIOS[next] || scenario === next) return;
  scenario = next;
  overlay?.querySelectorAll('[data-mia-scene]').forEach(b => b.classList.toggle('active', b.dataset.miaScene === scenario));
  resetConversation(true);
}

function openCoach() {
  if (overlay) return;
  injectStyles();
  overlay = document.createElement('section');
  overlay.className = 'mia-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Conversation en luxembourgeois avec Mia');
  overlay.innerHTML = `
    <header class="mia-top"><button class="mia-close" type="button" aria-label="Fermer">‹</button><div class="mia-title"><b>${COACH_NAME}</b><span>Coach Lëtzebuergesch · A2</span></div><span></span></header>
    <div class="mia-stage">
      ${avatarMarkup()}
      <div class="mia-status">Prett fir ze schwätzen</div>
      <div class="mia-scenario">${Object.entries(SCENARIOS).map(([id, item]) => `<button type="button" data-mia-scene="${id}" class="${id === scenario ? 'active' : ''}">${esc(item.label)}</button>`).join('')}</div>
      <div class="mia-controls"><button class="mia-auto" type="button">Auto : aus</button></div>
    </div>
    <div class="mia-chat" aria-live="polite"></div>
    <div class="mia-interim"></div>
    <form class="mia-compose"><button class="mia-mic" type="button" aria-label="Parler">●</button><input class="mia-input" autocomplete="off" enterkeyhint="send" placeholder="Oder schreiw deng Äntwert…" aria-label="Réponse"><button class="mia-send" type="submit" aria-label="Envoyer">➤</button></form>`;
  document.body.append(overlay);

  overlay.querySelector('.mia-close').addEventListener('click', closeCoach);
  overlay.querySelector('.mia-mic').addEventListener('click', () => listening ? stopListening() : startListening());
  overlay.querySelector('.mia-compose').addEventListener('submit', event => {
    event.preventDefault();
    submitMessage(overlay.querySelector('.mia-input')?.value || '');
  });
  overlay.querySelector('.mia-auto').addEventListener('click', event => {
    autoListen = !autoListen;
    event.currentTarget.classList.toggle('on', autoListen);
    event.currentTarget.textContent = autoListen ? 'Auto : un' : 'Auto : aus';
    if (autoListen && !speaking && !busy) startListening();
    else if (!autoListen) stopListening();
  });
  overlay.querySelectorAll('[data-mia-scene]').forEach(button => button.addEventListener('click', () => changeScenario(button.dataset.miaScene)));

  resetConversation(true);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', observeApp, { once: true });
else observeApp();
