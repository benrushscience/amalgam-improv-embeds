/* Character content validation v2: check scene data, links, and canonical emotion taxonomy. */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');

// Load browser data into an isolated context without requiring a web server.
const context = {window:{}};
vm.createContext(context);
for (const file of ['base-content.js', 'scene-prompts.js', 'conviction-entries.js', 'physicality-entries.js', 'voice-entries.js', 'behavior-entries.js', 'emotion-entries.js', 'want-entries.js', 'character-content.js']) {
  vm.runInContext(fs.readFileSync(path.join(__dirname,file),'utf8'),context);
}
const {entries,families} = context.window.referenceContent;
const prompts = context.window.characterScenePrompts;
const ids = new Set(entries.map(entry => entry.id));
assert.equal(ids.size,entries.length,'Entry IDs must be unique');
const wheel = JSON.parse(fs.readFileSync(path.join(__dirname,'emotion-wheel-reference.json'),'utf8'));
const emotionCount = wheel.families.reduce((total,family) => total + family.emotions.length,0);
const expectedCounts = {physicality:30,voice:30,behavior:30,want:30,value:32,belief:40,emotion:emotionCount};
assert.equal(entries.length,Object.values(expectedCounts).reduce((sum,count) => sum + count,0),'Incorrect total entry count');
for (const type of Object.keys(context.window.characterCollections)) {
  const collection = entries.filter(entry => entry.type === type);
  const expectedCount = expectedCounts[type];
  assert.equal(collection.length,expectedCount,type+' has an incorrect entry count');
  assert.equal(new Set(collection.map(entry => entry.name)).size,expectedCount,type+' has duplicate names');
}

// Match every wheel label, definition, family membership, and display order exactly.
const plain = value => JSON.parse(JSON.stringify(value));
const emotionFamilies = families.filter(family => family.type === 'emotion');
assert.deepEqual(plain(emotionFamilies.map(family => family.name)),wheel.families.map(family => family.name));
for (const family of wheel.families) {
  const actual = entries.filter(entry => entry.type === 'emotion' && entry.family === `emotion-${family.id}`);
  assert.deepEqual(plain(actual.map(entry => ({name:entry.name,definition:entry.meaning}))),family.emotions,
    family.name+' must match the wheel exactly');
}

// Optionally verify the saved reference against a freshly downloaded live wheel HTML file.
const sourceFlag = process.argv.indexOf('--wheel-source');
if (sourceFlag !== -1) {
  const html = fs.readFileSync(process.argv[sourceFlag + 1],'utf8');
  const marker = 'const families = ';
  const markerPosition = html.indexOf(marker);
  assert(markerPosition !== -1,'Wheel source does not contain its family data');
  const start = markerPosition + marker.length;
  const end = html.indexOf('\n      ];',start);
  assert(end > start,'Wheel data boundary was not found');
  const liveFamilies = vm.runInNewContext('('+html.slice(start,end + 8)+')',{}, {timeout:1000});
  const liveReference = liveFamilies.map(family => ({id:family.id,name:family.name,definition:family.definition,
    emotions:family.emotions.map(emotion => ({name:emotion.name,definition:emotion.definition}))}));
  assert.deepEqual(plain(liveReference),wheel.families,'Saved emotion reference differs from the live wheel');
}

// Every entry must resolve its family, references, and three complete examples.
for (const entry of entries) {
  assert(families.some(family => family.id === entry.family && family.type === entry.type),entry.id+' family missing');
  assert(context.window.characterCollections[entry.type],entry.id+' collection missing');
  assert.equal(prompts[entry.id]?.length,3,entry.id+' needs three scenes');
  for (const scene of prompts[entry.id]) assert(scene.setup?.trim() && scene.line?.trim(),entry.id+' incomplete scene');
  for (const id of entry.relatedIds || []) assert(ids.has(id),entry.id+' broken link: '+id);
}
const newScenes = entries.filter(entry => entry.cue).flatMap(entry => prompts[entry.id]);
assert.equal(new Set(newScenes.map(scene => scene.setup)).size,newScenes.length,'New setups must be distinct');
assert.equal(new Set(newScenes.map(scene => scene.line)).size,newScenes.length,'New lines must be distinct');
console.log(`Passed: ${entries.length} entries, ${emotionCount} wheel emotions in ${emotionFamilies.length} exact families, ${entries.length * 3} complete scenes, ${newScenes.length} distinct new setups and lines, valid connections.`);
