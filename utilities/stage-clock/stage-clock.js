/* Stage Clock v1 — deadline-based timing avoids drift when browser tabs are throttled. */
'use strict';
const byId = (id) => document.getElementById(id);
const digits = byId('digits');
const clock = byId('clock');
let duration = 10 * 60 * 1000;
let remaining = duration;
let deadline = 0;
let state = 'ready';
let font = 'bold';
let lastDisplay = '';
let wakeLock = null;
let hideTimer;

// Build a seven-segment face with SVG polygons, keeping the app entirely self-contained.
const segments = ['0,1,2,4,5,6', '2,5', '0,2,3,4,6', '0,2,3,5,6', '1,2,3,5', '0,1,3,5,6', '0,1,3,4,5,6', '0,2,5', '0,1,2,3,4,5,6', '0,1,2,3,5,6'];
const polygons = ['10,3 46,3 40,9 16,9', '7,6 13,12 13,43 7,49', '49,6 49,49 43,43 43,12', '9,52 15,48 41,48 47,52 41,56 15,56', '7,55 13,61 13,92 7,98', '49,55 49,98 43,92 43,61', '10,101 16,95 40,95 46,101'];
function digitalCharacter(character) {
  if (character === ':') return '<svg class="colon" viewBox="0 0 23 104" aria-hidden="true"><circle cx="11.5" cy="34" r="4" fill="currentColor"/><circle cx="11.5" cy="72" r="4" fill="currentColor"/></svg>';
  const active = segments[Number(character)].split(',').map(Number);
  return `<svg class="digit" viewBox="0 0 60 104" aria-hidden="true">${active.map((index) => `<polygon points="${polygons[index]}" fill="currentColor"/>`).join('')}</svg>`;
}
const faces = { digital: 'monospace', mono: 'Consolas, "Courier New", monospace', bold: 'Arial, Helvetica, sans-serif', condensed: 'Impact, "Arial Narrow", sans-serif', serif: 'Georgia, "Times New Roman", serif' };

// Measure the rendered face rather than guessing at font widths on different devices.
function fitDisplay() {
  const area = document.querySelector('.display').getBoundingClientRect();
  digits.style.fontSize = '100px';
  const measure = digits.getBoundingClientRect();
  const size = Math.min((area.width * .96 / measure.width) * 100, (area.height * .84 / measure.height) * 100);
  digits.style.fontSize = `${Math.max(1, size)}px`;
}
function render() {
  const total = Math.ceil(remaining / 1000);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor(total / 60) % 60;
  const seconds = total % 60;
  // Retain the hours column for the entire run so the display does not jump in size.
  const text = (duration >= 3600000 ? `${String(hours).padStart(2, '0')}:` : '') + `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  if (lastDisplay !== text + font) {
    digits.style.fontFamily = faces[font];
    if (font === 'digital') digits.innerHTML = [...text].map(digitalCharacter).join('');
    else digits.textContent = text;
    clock.setAttribute('aria-label', `${hours} hours ${minutes} minutes ${seconds} seconds remaining`);
    document.title = `${text} · Stage Clock`;
    lastDisplay = text + font;
    fitDisplay();
  }
}
function updateControls() {
  byId('toggle').textContent = {ready: 'Start countdown', running: 'Pause', paused: 'Resume', finished: 'Start again'}[state];
  byId('status').textContent = {ready: 'Ready when you are', running: 'Countdown running', paused: 'Paused', finished: 'Time is up'}[state];
}
function tick() {
  if (state === 'running') {
    remaining = Math.max(0, deadline - Date.now());
    if (remaining === 0) {
      state = 'finished';
      updateControls();
      releaseWakeLock();
    }
  }
  render();
}

// Request screen wakefulness only while counting; unsupported browsers still run the timer.
async function acquireWakeLock() {
  if (!('wakeLock' in navigator) || document.visibilityState !== 'visible' || wakeLock) return;
  try {
    const lock = await navigator.wakeLock.request('screen');
    if (state !== 'running') { await lock.release(); return; }
    wakeLock = lock;
    lock.addEventListener('release', () => { if (wakeLock === lock) wakeLock = null; });
  } catch { /* Device power settings can decline a wake-lock request. */ }
}
function releaseWakeLock() { if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; } }
function start() {
  if (state === 'finished') remaining = duration;
  deadline = Date.now() + remaining;
  state = 'running';
  acquireWakeLock();
  updateControls();
  tick();
}
function toggle() {
  tick();
  if (state === 'running') { state = 'paused'; releaseWakeLock(); updateControls(); }
  else start();
}
function restart() {
  remaining = duration;
  deadline = Date.now() + duration;
  if (state === 'finished') state = 'ready';
  updateControls();
  render();
}

// Setting a duration deliberately stops the previous run and waits for Start.
byId('time-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const values = ['hours', 'minutes', 'seconds'].map((id) => Number(byId(id).value));
  if (!values.every(Number.isInteger) || values[0] < 0 || values[0] > 99 || values.slice(1).some((value) => value < 0 || value > 59)) return;
  const next = (values[0] * 3600 + values[1] * 60 + values[2]) * 1000;
  if (!next) { byId('message').textContent = 'Choose a duration greater than zero.'; return; }
  duration = remaining = next;
  state = 'ready';
  releaseWakeLock();
  byId('message').textContent = 'Time set. Press Start countdown when ready.';
  updateControls();
  render();
});
byId('toggle').addEventListener('click', toggle);
byId('restart').addEventListener('click', restart);
byId('new-time').addEventListener('click', () => { showControls(); byId('minutes').focus(); byId('minutes').select(); });
byId('font').addEventListener('change', (event) => { font = event.target.value; render(); });

// Fullscreen includes an in-page fallback for embedded and mobile browsers.
function setStage(active) {
  document.body.classList.toggle('stage', active);
  byId('fullscreen').textContent = active ? '↙ Exit full screen' : '↗ Full screen';
  if (active) showControls();
  else { clearTimeout(hideTimer); document.body.classList.remove('hidden-controls'); }
  requestAnimationFrame(fitDisplay);
}
async function toggleFullscreen() {
  if (document.body.classList.contains('stage')) {
    if (document.fullscreenElement) await document.exitFullscreen();
    setStage(false);
  } else {
    setStage(true);
    try { await document.documentElement.requestFullscreen(); }
    catch { byId('message').textContent = 'Stage view enabled. For a larger display, open this page directly in a new tab.'; }
  }
}
function showControls() {
  document.body.classList.remove('hidden-controls');
  clearTimeout(hideTimer);
  if (document.body.classList.contains('stage')) hideTimer = setTimeout(() => {
    if (!document.querySelector('input:focus, select:focus')) document.body.classList.add('hidden-controls');
  }, 3500);
}
byId('fullscreen').addEventListener('click', toggleFullscreen);
byId('reveal').addEventListener('click', showControls);
document.addEventListener('pointermove', showControls);
document.addEventListener('pointerdown', showControls);
document.addEventListener('focusin', showControls);
document.addEventListener('focusout', showControls);
document.addEventListener('fullscreenchange', () => { setStage(Boolean(document.fullscreenElement)); });
document.addEventListener('visibilitychange', () => { tick(); if (state === 'running') acquireWakeLock(); });
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') { setStage(false); return; }
  if (event.target.closest('input, select, button') || event.ctrlKey || event.metaKey || event.altKey || event.repeat) return;
  if (event.code === 'Space') { event.preventDefault(); toggle(); }
  if (event.key.toLowerCase() === 'r') restart();
  if (event.key.toLowerCase() === 'f') toggleFullscreen();
  showControls();
});
new ResizeObserver(fitDisplay).observe(document.querySelector('.display'));
setInterval(tick, 100);
render();
