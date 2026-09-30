// Landing page review v1: responsive artwork, accessible entry points, and all naming modes.
const { chromium } = require('playwright');
const path = require('node:path');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const url = pathToFileURL(path.resolve(__dirname, '../index.html')).href;
  for (const width of [1440, 1100, 701, 700, 390, 320]) {
    await page.setViewportSize({ width, height: 960 });
    await page.goto(url);
    assert.equal(await page.locator('#landingCast svg').count(), 3);
    assert.equal(await page.locator('.topbar').isVisible(), false);
    assert.equal(await page.locator('.dialogue-panel').isVisible(), false);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `No horizontal overflow at ${width}`);
    for (const id of ['generatedModeButton', 'mixedModeButton', 'playerModeButton']) {
      assert.equal(await page.locator(`#${id}`).isVisible(), true);
    }
    if ([1440,390,320].includes(width)) await page.screenshot({ path: path.join(__dirname, `landing-${width}.png`), fullPage: true });
  }

  // Keyboard users can jump to the choices, read the rules, and start each mode directly.
  for (const [mode, id] of [['generated','generatedModeButton'],['mixed','mixedModeButton'],['player','playerModeButton']]) {
    await page.goto(url);
    await page.locator('.landing-jump').click();
    await page.locator('.landing-rules summary').click();
    assert.equal(await page.locator('.landing-rules').getAttribute('open'), '');
    await page.locator(`#${id}`).focus();
    await page.keyboard.press('Enter');
    await page.waitForTimeout(50);
    const state = await page.evaluate(() => JSON.parse(window.render_game_to_text()));
    assert.equal(state.mode, mode);
    assert.equal(state.peopleMet, 1);
    assert.equal(await page.locator('#introOverlay').isVisible(), false);
    assert.equal(await page.locator('.topbar').isVisible(), true);
    assert.equal(await page.locator('.dialogue-panel').isVisible(), true);
    assert.equal(await page.evaluate(() => document.body.classList.contains('welcoming')), false);
    assert.equal(await page.evaluate(() => scrollY), 0);
    assert.equal(await page.evaluate(() => {
      const ids = [...document.querySelectorAll('[id]')].map((node) => node.id);
      return ids.length === new Set(ids).size;
    }), true);
  }
  assert.deepEqual(errors, []);
  await browser.close();
  console.log('Passed: 320–1440px layout, three SVG guests, rules disclosure, all mode starts, scrolling, and unique SVG IDs.');
})().catch((error) => { console.error(error); process.exit(1); });
