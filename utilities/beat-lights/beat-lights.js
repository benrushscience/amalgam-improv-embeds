// Beat Lights v1 — settings, drift-free playback, and a quiet fullscreen stage.
import { COLORS, divideScene, duration, formatTime, parseTime, positionAt, validateBeats } from "./timing.mjs";

const byId = id => document.getElementById(id);
const storageKey = "amalgam-beat-lights-v1";
const defaultBeats = () => divideScene(180, 3);
let beats = defaultBeats();
let running = false;
let elapsedBeforeRun = 0;
let startedAt = 0;
let frame = 0;
let wakeLock = null;
let wakePending = false;
let lastAnnouncement = "";
let hideControlsTimer = 0;
let wasNativeFullscreen = false;

// Storage is optional: restricted embeds still work without it.
try {
  const saved = localStorage.getItem(storageKey);
  if (saved) beats = validateBeats(JSON.parse(saved));
} catch { /* Invalid or unavailable saved settings fall back to defaults. */ }

function saveSettings() {
  try { localStorage.setItem(storageKey, JSON.stringify(beats)); } catch { /* Keep the live settings in memory. */ }
}

function showMessage(message) { byId("message").textContent = message; }
function elapsedNow() { return elapsedBeforeRun + (running ? (performance.now() - startedAt) / 1000 : 0); }

// Build labels and values with DOM APIs so custom names are always plain text.
function renderRows() {
  const rows = byId("beat-rows");
  rows.replaceChildren();
  beats.forEach((beat, index) => {
    const row = document.createElement("div");
    row.className = "beat-row";
    const nameLabel = document.createElement("label");
    nameLabel.textContent = `Beat ${index + 1}`;
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.maxLength = 60;
    nameInput.value = beat.name;
    nameInput.placeholder = "Optional beat name";
    nameInput.dataset.field = "name";
    nameInput.setAttribute("aria-label", `Beat ${index + 1} name`);
    nameLabel.append(nameInput);
    row.append(nameLabel);
    COLORS.forEach(color => {
      const label = document.createElement("label");
      label.className = `phase-${color}`;
      label.textContent = color[0].toUpperCase() + color.slice(1);
      const input = document.createElement("input");
      Object.assign(input, { type: "number", min: "0", max: "86400", step: "1", required: true, value: String(beat[color]) });
      input.dataset.field = color;
      input.setAttribute("aria-label", `Beat ${index + 1} ${color} seconds`);
      label.append(input);
      row.append(label);
    });
    const total = document.createElement("div");
    total.className = "beat-duration";
    total.innerHTML = '<span>Total</span><output></output>';
    total.querySelector("output").textContent = formatTime(duration(beat));
    row.append(total);
    rows.append(row);
  });
}

function readRows() {
  const next = [...byId("beat-rows").children].map(row => {
    const beat = {};
    row.querySelectorAll("input").forEach(input => {
      beat[input.dataset.field] = input.dataset.field === "name" ? input.value.trim() : input.valueAsNumber;
    });
    return beat;
  });
  return validateBeats(next);
}

function updateSummary() {
  const total = beats.reduce((sum, beat) => sum + duration(beat), 0);
  byId("plan-summary").textContent = `${beats.length} ${beats.length === 1 ? "beat" : "beats"} · ${formatTime(total)} total`;
  byId("scene-length").value = formatTime(total);
  byId("beat-number").value = beats.length;
  [...byId("beat-rows").children].forEach((row, index) => {
    row.querySelector("output").textContent = formatTime(duration(beats[index]));
  });
}

function acceptEdits() {
  try {
    beats = readRows();
    updateSummary();
    saveSettings();
    showMessage("");
    renderStage();
    return true;
  } catch (error) {
    showMessage(error.message);
    return false;
  }
}

// Announce cue changes, not every timer tick, for screen-reader users.
function renderStage() {
  const state = positionAt(beats, elapsedNow());
  if (state.complete && running) {
    elapsedBeforeRun = state.total;
    running = false;
    releaseWakeLock();
  }
  byId("stage").dataset.phase = state.phase;
  byId("beat-count").textContent = state.complete ? "SCENE COMPLETE" : `${state.index + 1} OF ${beats.length}`;
  byId("beat-title").textContent = `Beat ${state.index + 1}`;
  byId("beat-name").textContent = beats[state.index].name;
  byId("beat-name").hidden = !beats[state.index].name;
  byId("elapsed").textContent = formatTime(state.elapsed);
  byId("scene-total").textContent = formatTime(state.total);
  byId("elapsed-label").textContent = "SCENE ELAPSED";
  byId("beat-remaining").textContent = state.complete ? "All beats complete" : `${formatTime(Math.ceil(state.remaining))} in this beat`;
  byId("progress").style.width = `${state.elapsed / state.total * 100}%`;
  byId("progress").style.backgroundColor = `var(--${state.phase})`;
  const cue = { green: "Green · Explore", yellow: "Yellow · Get ready", red: "Red · Transition" }[state.phase];
  byId("status").textContent = state.complete ? "Scene complete. Take a breath." : running ? cue : state.elapsed > 0 ? `Paused · ${cue}` : "Ready when you are.";
  byId("play").textContent = state.complete ? "Play again ↻" : running ? "Pause scene Ⅱ" : state.elapsed > 0 ? "Resume scene ▶" : "Start scene ▶";
  byId("stage-play").textContent = byId("play").textContent;
  byId("settings-fields").disabled = running || state.elapsed > 0;
  const announcement = state.complete ? "Scene complete." : `Beat ${state.index + 1}. ${beats[state.index].name}. ${cue}. ${running ? "Running" : "Paused"}.`;
  if (announcement !== lastAnnouncement) {
    byId("announcement").textContent = announcement;
    lastAnnouncement = announcement;
  }
}

function tick() {
  renderStage();
  if (running) frame = requestAnimationFrame(tick);
}

// A single elapsed-time anchor preserves timing through delayed frames and tab changes.
function togglePlayback() {
  if (running) {
    elapsedBeforeRun = elapsedNow();
    running = false;
    cancelAnimationFrame(frame);
    releaseWakeLock();
    renderStage();
    return;
  }
  if (positionAt(beats, elapsedBeforeRun).complete) resetPlayback();
  if (elapsedBeforeRun === 0 && !acceptEdits()) return;
  startedAt = performance.now();
  running = true;
  showMessage("Reset the scene to edit its timing.");
  requestWakeLock();
  tick();
}

function resetPlayback() {
  running = false;
  elapsedBeforeRun = 0;
  cancelAnimationFrame(frame);
  releaseWakeLock();
  showMessage("");
  renderStage();
}

// Wake lock is best-effort and released whenever the scene is not running.
async function requestWakeLock() {
  if (!running || document.hidden || !navigator.wakeLock || wakeLock || wakePending) return;
  wakePending = true;
  try {
    const lock = await navigator.wakeLock.request("screen");
    if (!running || document.hidden) { await lock.release(); return; }
    wakeLock = lock;
    lock.addEventListener("release", () => { if (wakeLock === lock) wakeLock = null; });
  } catch { /* Playback remains available when the device denies wake lock. */ }
  finally { wakePending = false; }
}

function releaseWakeLock() {
  const lock = wakeLock;
  wakeLock = null;
  if (lock) lock.release().catch(() => {});
}

// Native fullscreen falls back to a page-filling stage inside restricted iframes.
function revealControls() {
  document.body.classList.add("controls-visible");
  clearTimeout(hideControlsTimer);
  hideControlsTimer = setTimeout(() => document.body.classList.remove("controls-visible"), 3000);
}

async function enterStage() {
  if (document.body.classList.contains("stage-mode")) return;
  document.body.classList.add("stage-mode");
  revealControls();
  byId("exit-stage").focus({ preventScroll: true });
  try {
    if (document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
      wasNativeFullscreen = true;
    }
  } catch { /* The stage still fills the page when native fullscreen is blocked. */ }
}

async function leaveStage() {
  document.body.classList.remove("stage-mode", "controls-visible");
  clearTimeout(hideControlsTimer);
  if (document.fullscreenElement) {
    try { await document.exitFullscreen(); } catch { /* Page layout is already restored. */ }
  }
  wasNativeFullscreen = false;
  byId("fullscreen").focus({ preventScroll: true });
}

// Settings are applied immediately when valid; dividing explicitly rebuilds the beat plan.
byId("settings-form").addEventListener("submit", event => event.preventDefault());
byId("beat-rows").addEventListener("input", acceptEdits);
byId("divide").addEventListener("click", () => {
  try {
    beats = divideScene(parseTime(byId("scene-length").value), byId("beat-number").valueAsNumber,
      byId("default-yellow").valueAsNumber, byId("default-red").valueAsNumber, beats.map(beat => beat.name));
    renderRows();
    updateSummary();
    saveSettings();
    renderStage();
    showMessage("Scene divided. Fine-tune any beat below.");
  } catch (error) { showMessage(error.message); }
});
byId("defaults").addEventListener("click", () => {
  beats = defaultBeats();
  byId("default-yellow").value = 15;
  byId("default-red").value = 15;
  renderRows();
  updateSummary();
  saveSettings();
  resetPlayback();
});
byId("play").addEventListener("click", togglePlayback);
byId("stage-play").addEventListener("click", togglePlayback);
byId("stage-reset").addEventListener("click", resetPlayback);
byId("reset").addEventListener("click", resetPlayback);
byId("fullscreen").addEventListener("click", enterStage);
byId("exit-stage").addEventListener("click", leaveStage);
document.addEventListener("fullscreenchange", () => {
  if (!document.fullscreenElement && wasNativeFullscreen) leaveStage();
});
["pointermove", "pointerdown", "focusin"].forEach(type => document.addEventListener(type, () => {
  if (document.body.classList.contains("stage-mode")) revealControls();
}));
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) { renderStage(); requestWakeLock(); }
});
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && document.body.classList.contains("stage-mode")) { leaveStage(); return; }
  if (event.ctrlKey || event.metaKey || event.altKey || event.repeat || event.target.closest("input, textarea, select, [contenteditable='true']")) return;
  if (event.code === "Space" && (document.body.classList.contains("stage-mode") || !event.target.closest("button"))) { event.preventDefault(); togglePlayback(); }
  if (event.key.toLowerCase() === "r") { event.preventDefault(); resetPlayback(); }
  if (event.key.toLowerCase() === "f") {
    event.preventDefault();
    if (document.body.classList.contains("stage-mode")) leaveStage(); else enterStage();
  }
});
window.addEventListener("pagehide", releaseWakeLock);
renderRows();
updateSummary();
renderStage();
