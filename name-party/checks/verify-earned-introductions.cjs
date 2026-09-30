// Earned introductions review v1: warm-up, success milestones, mistakes, and resets.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  // Expose private answers only in this intercepted test copy.
  await page.route('**/game-test', route => route.fulfill({ contentType: 'text/html', body: html.replace('// Read only on-screen', 'window.review = { state: () => gameState, isIntroductionReady };\n// Read only on-screen') }));
  await page.addInitScript(() => { Math.random = () => 0.1; });
  const state = () => page.evaluate(() => JSON.parse(window.render_game_to_text()));
  const click = name => page.getByRole('button', { name, exact: true }).click();
  async function introduce() {
    await click('Next');
    if (await page.getByRole('button', { name: 'Name them', exact: true }).count()) {
      const id = (await state()).guest.id;
      await page.locator('.name-entry').fill(['Alex','Blair','Casey','Devon'][id - 1]);
      await click('Name them');
      await click('Next guest');
    } else await click('Nice to meet you');
    await page.waitForTimeout(400);
  }
  async function recall(correct) {
    const name = await page.evaluate(() => window.review.state().currentCharacter.name);
    await page.locator('.name-entry').fill(correct ? name : 'Wrongname');
    await page.locator('.name-entry').press('Enter');
  }
  async function next() { await click('Continue'); await page.waitForTimeout(400); }

  for (const mode of ['generated','mixed','player']) {
    await page.goto('http://localhost/game-test');
    await page.locator(`#${mode}ModeButton`).click();
    await introduce();
    assert.equal((await state()).peopleMet, 2);
    await introduce();
    await recall(true);
    assert.equal((await state()).introductionProgress.warmupRemembered, 1);
    await next();
    assert.equal((await state()).peopleMet, 2);
    await recall(true);
    assert.equal((await state()).introductionProgress.ready, true);
    await next();
    assert.equal((await state()).peopleMet, 3);
    assert.equal((await state()).introductionProgress.correct, 0);
    await introduce();
    await recall(true); await next();
    await recall(false);
    assert.equal((await state()).introductionProgress.correct, 1);
    await next();
    for (let total = 2; total <= 4; total++) {
      await recall(true);
      assert.equal((await state()).introductionProgress.correct, total);
      assert.equal((await state()).peopleMet, 3);
      assert.equal((await state()).introductionProgress.ready, total === 4);
      if (mode === 'generated' && total === 2) {
        await page.waitForTimeout(1500);
        await page.screenshot({ path: path.join(__dirname, 'earned-progress-desktop.png'), fullPage: true });
        await page.setViewportSize({ width: 390, height: 844 });
        await page.screenshot({ path: path.join(__dirname, 'earned-progress-mobile.png'), fullPage: true });
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
        await page.setViewportSize({ width: 1280, height: 1000 });
      }
      await next();
    }
    assert.equal((await state()).peopleMet, 4);
    assert.equal((await state()).introductionProgress.correct, 0);
    assert.equal((await state()).introductionProgress.distinctGuests, 0);
    await introduce();
    await recall(false); await next(); await recall(false);
    assert.equal((await state()).gameOver, true);
    await page.locator('#restartGeneratedButton').click();
    assert.equal((await state()).peopleMet, 1);
    assert.equal((await state()).introductionProgress.warmupRemembered, 0);
    assert.equal((await state()).mistakes, 0);
  }
  // Explicitly check that four successes on just one identity cannot unlock a guest.
  assert.equal(await page.evaluate(() => {
    const s = window.review.state();
    s.characters = [{ id:1 },{ id:2 },{ id:3 }];
    s.introductionCorrect = 4;
    s.introductionRecalledIds = new Set([1]);
    return window.review.isIntroductionReady();
  }), false);
  assert.deepEqual(errors, []);
  await browser.close();
  console.log('Passed: all naming modes, two-guest warm-up, four correct across two identities, retained progress on mistakes, single unlock, resets, and mobile layout.');
})().catch(error => { console.error(error); process.exit(1); });
