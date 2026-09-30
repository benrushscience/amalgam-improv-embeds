// Encounter scheduling review v2: previous-guest exclusion, random choices, and immediate counters.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
const source = html.match(/<script>([\s\S]*?)<\/script>/)[1];
const elements = new Map();
let appearanceSeed = 100;
const sandbox = {
  window: {},
  crypto: { getRandomValues(values) { values[0] = appearanceSeed++; return values; } },
  document: {
    getElementById(id) {
      if (!elements.has(id)) elements.set(id, { addEventListener() {} });
      return elements.get(id);
    }
  }
};
// This private test interface is injected only in memory, never shipped with the game.
vm.runInNewContext(source.replace('// Read only on-screen',
  'window.review = { resetGameState, createNewCharacter, chooseReturningCharacter, recordEncounter, state: () => gameState };\n      // Read only on-screen'), sandbox);
const game = sandbox.window.review;
function reset() {
  game.resetGameState();
  game.state().selectedMode = 'generated';
}

reset();
assert.equal(game.chooseReturningCharacter(), null);
const first = game.createNewCharacter();
assert.equal(elements.get('peopleMetStat').textContent, 1);
assert.equal(game.chooseReturningCharacter().id, first.id);
const second = game.createNewCharacter();
assert.equal(elements.get('peopleMetStat').textContent, 2);
for (let turn = 0; turn < 10; turn++) {
  const returned = game.chooseReturningCharacter();
  assert.equal(returned.id, turn % 2 === 0 ? first.id : second.id);
  game.recordEncounter(returned);
}

// Random returns never immediately repeat a guest when alternatives exist.
for (const rosterSize of [3, 8, 30]) {
  reset();
  for (let index = 0; index < rosterSize; index++) game.createNewCharacter();
  assert.equal(elements.get('peopleMetStat').textContent, rosterSize);
  const appearances = game.state().characters.map((guest) => JSON.stringify(guest.visual));
  const counts = new Map();
  for (let turn = 0; turn < rosterSize * 4; turn++) {
    const returned = game.chooseReturningCharacter();
    assert.notEqual(returned.id, game.state().seenCharacterIds.at(-1), 'The immediately previous guest must rest');
    counts.set(returned.id, (counts.get(returned.id) || 0) + 1);
    game.recordEncounter(returned);
  }
  assert.deepEqual(game.state().characters.map((guest) => JSON.stringify(guest.visual)), appearances);
  const newest = game.createNewCharacter();
  assert.notEqual(game.chooseReturningCharacter().id, newest.id);
  assert.equal(elements.get('peopleMetStat').textContent, rosterSize + 1);
}

// The second-most-recent guest remains eligible, even if another guest has waited longer.
reset();
for (let index = 0; index < 3; index++) game.createNewCharacter();
vm.runInNewContext('Math.random = () => 0.99;', sandbox);
assert.equal(game.chooseReturningCharacter().id, 2);
vm.runInNewContext('Math.random = () => 0;', sandbox);
assert.equal(game.chooseReturningCharacter().id, 1);

// Unnamed guests cannot become recall questions, and a new round clears encounter history.
reset();
appearanceSeed = 100;
const originalLook = JSON.stringify(game.createNewCharacter().visual);
appearanceSeed = 100;
assert.notEqual(JSON.stringify(game.createNewCharacter().visual), originalLook, 'Duplicate random looks must be retried');
reset();
assert.notEqual(JSON.stringify(game.createNewCharacter().visual), originalLook, 'A restarted game must draw a new appearance seed');
reset();
game.state().selectedMode = 'player';
game.createNewCharacter();
assert.equal(game.chooseReturningCharacter(), null);
reset();
assert.equal(game.state().seenCharacterIds.length, 0);
assert.equal(game.state().encounterNumber, 0);
console.log('Passed: immediate counters, previous-guest exclusion, random eligible choices, sole-guest fallback, stable artwork, and reset history.');
