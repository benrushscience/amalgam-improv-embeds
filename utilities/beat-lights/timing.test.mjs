// Beat Lights timing checks v1 — run with: node --test utilities/beat-lights/timing.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { divideScene, duration, formatTime, parseTime, positionAt, validateBeats } from "./timing.mjs";

test("three-minute default changes cue at exact boundaries and ends at 180 seconds", () => {
  const beats = divideScene(180, 3);
  assert.deepEqual(beats.map(beat => [beat.green, beat.yellow, beat.red]), [[30, 15, 15], [30, 15, 15], [30, 15, 15]]);
  for (const [seconds, index, phase] of [[0, 0, "green"], [29.999, 0, "green"], [30, 0, "yellow"], [45, 0, "red"], [60, 1, "green"], [90, 1, "yellow"], [105, 1, "red"], [120, 2, "green"], [165, 2, "red"]]) {
    const actual = positionAt(beats, seconds);
    assert.equal(actual.index, index);
    assert.equal(actual.phase, phase);
    assert.equal(actual.complete, false);
  }
  assert.deepEqual(positionAt(beats, 500), { index: 2, phase: "red", elapsed: 180, remaining: 0, total: 180, complete: true });
});

test("uneven division preserves every second and gives longer beats more green", () => {
  const beats = divideScene(301, 3);
  assert.deepEqual(beats.map(duration), [101, 100, 100]);
  assert.deepEqual(beats.map(beat => beat.green), [71, 70, 70]);
});

test("short beats retain at least half green, including one-second beats", () => {
  for (let total = 3; total < 180; total++) {
    const beats = divideScene(total, 3);
    assert.equal(beats.reduce((sum, beat) => sum + duration(beat), 0), total);
    for (const beat of beats) assert.ok(beat.green >= duration(beat) / 2);
  }
});

test("custom unequal beats and skipped phases use the correct next cue", () => {
  const beats = validateBeats([{ name: "Explore", green: 5, yellow: 0, red: 2 }, { name: "Heighten", green: 0, yellow: 3, red: 0 }]);
  assert.equal(positionAt(beats, 5).phase, "red");
  assert.equal(positionAt(beats, 7).phase, "yellow");
  assert.equal(positionAt(beats, 7).index, 1);
  assert.equal(positionAt(beats, 10).complete, true);
  assert.deepEqual(divideScene(30, 1, 0, 0)[0], { name: "", green: 30, yellow: 0, red: 0 });
});

test("duration parsing and invalid configurations are explicit", () => {
  assert.equal(parseTime("3:00"), 180);
  assert.equal(parseTime("75"), 75);
  assert.equal(parseTime("1:02:03"), 3723);
  assert.equal(formatTime(3723), "62:03");
  for (const value of ["", "3:99", "1.5", "1:", "-10", "1:2:3:4"]) assert.ok(Number.isNaN(parseTime(value)));
  for (const args of [[2, 3], [180, 0], [180, 25], [86401, 1], [180, 3, -1, 15], [180, 3, 1.5, 15]]) assert.throws(() => divideScene(...args));
  for (const beat of [{ name: "", green: 0, yellow: 0, red: 0 }, { name: "", green: NaN, yellow: 15, red: 15 }, { name: "", green: 86400, yellow: 1, red: 0 }]) assert.throws(() => validateBeats([beat]));
});
