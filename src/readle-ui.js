const APP = document.getElementById('app');

function sectionHead(kicker, title, note = '') {
  const head = document.createElement('div');
  head.className = 'readle-section-head';
  head.innerHTML = `<div><small>${kicker}</small><h2>${title}</h2></div>${note ? `<span>${note}</span>` : ''}`;
  return head;
}

function enhanceLevels(root = document) {
  root.querySelectorAll('.level-pill').forEach(el => {
    const level = (el.textContent || '').trim().toLowerCase();
    el.classList.remove('level-a1', 'level-a2', 'level-b1');
    if (level === 'a1') el.classList.add('level-a1');
    if (level === 'a2') el.classList.add('level-a2');
    if (level === 'b1') el.classList.add('level-b1');
  });
}

function enhanceNav(root = document) {
  root.querySelectorAll('.bottom-nav button').forEach(button => {
    if (button.classList.contains('active')) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
}

function enhanceHome(screen) {
  if (!screen || screen.dataset.readleStructured === '1') return;
  screen.dataset.readleStructured = '1';

  const hero = screen.querySelector('.hero-card');
  const dailyGoal = screen.querySelector('.daily-goal');
  const todayCard = screen.querySelector('.today-card');
  const learningPulse = screen.querySelector('.learning-pulse');
  const exam = screen.querySelector('.exam-dashboard-card');
  const weekly = screen.querySelector('.weekly-card');
  const fragility = screen.querySelector('.fragility-card');
  const quick = screen.querySelector('.quick-grid');

  // Put the featured story before dashboards, like Readle's discovery feed.
  if (hero && dailyGoal && hero.parentElement === screen) {
    screen.insertBefore(hero, dailyGoal);
  }

  if (dailyGoal || todayCard) {
    const today = document.createElement('section');
    today.className = 'readle-home-block readle-today';
    today.append(sectionHead('SESSION', "Aujourd’hui", 'simple et guidé'));
    const hub = document.createElement('div');
    hub.className = 'readle-today-hub';
    if (dailyGoal) hub.append(dailyGoal);
    if (todayCard) hub.append(todayCard);
    today.append(hub);
    if (hero?.nextSibling) screen.insertBefore(today, hero.nextSibling);
    else screen.append(today);
  }

  if (learningPulse || exam || weekly || fragility) {
    const progress = document.createElement('section');
    progress.className = 'readle-home-block readle-progress';
    progress.append(sectionHead('SUIVI', 'Progression', 'à consulter quand tu veux'));
    const grid = document.createElement('div');
    grid.className = 'readle-progress-grid';
    if (learningPulse) grid.append(learningPulse);
    if (exam) grid.append(exam);
    if (weekly) grid.append(weekly);
    if (fragility) grid.append(fragility);
    progress.append(grid);
    if (quick?.parentElement === screen) screen.insertBefore(progress, quick);
    else screen.append(progress);
  }

  if (quick?.parentElement === screen) {
    const shortcuts = document.createElement('section');
    shortcuts.className = 'readle-home-block readle-shortcuts';
    shortcuts.append(sectionHead('ACCÈS RAPIDE', 'Outils'));
    screen.insertBefore(shortcuts, quick);
    shortcuts.append(quick);
  }

  screen.querySelectorAll(':scope > h2').forEach(h => {
    if (h.textContent.trim() === 'Weider liesen') h.textContent = 'Continuer';
  });
}

function enhanceScreen(root = document) {
  const home = root.querySelector('.screen.home');
  if (home) enhanceHome(home);

  root.querySelectorAll('.screen:not(.home)').forEach(screen => {
    screen.classList.add('readle-screen');
  });

  root.querySelectorAll('.reader').forEach(reader => {
    reader.classList.add('readle-reader');
  });

  enhanceLevels(root);
  enhanceNav(root);
}

let scheduled = false;
function scheduleEnhance() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    enhanceScreen(document);
  });
}

if (APP) {
  const observer = new MutationObserver(scheduleEnhance);
  observer.observe(APP, { childList: true, subtree: true });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', scheduleEnhance, { once: true });
} else {
  scheduleEnhance();
}
