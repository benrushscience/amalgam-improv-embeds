// Beat Lights timing v1 — pure functions shared by the browser and timing checks.
export const COLORS = ["green", "yellow", "red"];
export const MAX_SECONDS = 86400;
export const MAX_BEATS = 24;

export function duration(beat) {
  return COLORS.reduce((sum, color) => sum + beat[color], 0);
}

export function formatTime(seconds) {
  const whole = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(whole / 60);
  return `${minutes}:${String(whole % 60).padStart(2, "0")}`;
}

// Accept seconds, m:ss, or h:mm:ss; reject partial values and overflowing fields.
export function parseTime(value) {
  const parts = value.trim().split(":");
  if (parts.length > 3 || parts.some(part => !/^\d+$/.test(part))) return NaN;
  if (parts.slice(1).some(part => Number(part) > 59)) return NaN;
  return parts.reduce((seconds, part) => seconds * 60 + Number(part), 0);
}

export function validateBeats(beats) {
  if (!Array.isArray(beats) || beats.length < 1 || beats.length > MAX_BEATS) throw new Error("Choose between 1 and 24 beats.");
  for (const [index, beat] of beats.entries()) {
    if (!beat || typeof beat.name !== "string" || beat.name.length > 60) throw new Error(`Check the name for Beat ${index + 1}.`);
    if (COLORS.some(color => !Number.isInteger(beat[color]) || beat[color] < 0 || beat[color] > MAX_SECONDS)) throw new Error(`Use whole seconds, 0 or more, for Beat ${index + 1}.`);
    if (duration(beat) === 0) throw new Error(`Give Beat ${index + 1} at least one second.`);
  }
  if (beats.reduce((sum, beat) => sum + duration(beat), 0) > MAX_SECONDS) throw new Error("Keep the scene at 24 hours or less.");
  return beats;
}

// Remainder seconds go to the first beats so the scene total stays exact.
export function divideScene(total, count, yellow = 15, red = 15, names = []) {
  if (!Number.isInteger(count) || count < 1 || count > MAX_BEATS) throw new Error("Choose between 1 and 24 beats.");
  if (!Number.isInteger(total) || total < count || total > MAX_SECONDS) throw new Error("Use a scene length of at least one second per beat, up to 24 hours.");
  if ([yellow, red].some(value => !Number.isInteger(value) || value < 0 || value > MAX_SECONDS)) throw new Error("Warning times must be whole seconds, 0 or more.");
  return Array.from({ length: count }, (_, index) => {
    const length = Math.floor(total / count) + (index < total % count ? 1 : 0);
    const warningBudget = Math.min(yellow + red, Math.floor(length / 2));
    const yellowTime = yellow + red > 0 ? Math.round(warningBudget * yellow / (yellow + red)) : 0;
    return { name: names[index] || "", green: length - warningBudget, yellow: yellowTime, red: warningBudget - yellowTime };
  });
}

// Derive the active cue from absolute elapsed time, avoiding interval drift.
export function positionAt(beats, elapsed) {
  const total = beats.reduce((sum, beat) => sum + duration(beat), 0);
  const clamped = Math.min(total, Math.max(0, elapsed));
  if (clamped >= total) return { index: beats.length - 1, phase: "red", elapsed: total, remaining: 0, total, complete: true };
  let beatStart = 0;
  for (const [index, beat] of beats.entries()) {
    const length = duration(beat);
    if (clamped < beatStart + length) {
      const within = clamped - beatStart;
      const phase = within < beat.green ? "green" : within < beat.green + beat.yellow ? "yellow" : "red";
      return { index, phase, elapsed: clamped, remaining: length - within, total, complete: false };
    }
    beatStart += length;
  }
}
