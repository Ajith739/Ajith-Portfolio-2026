import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.QA_PLAYWRIGHT || 'playwright');
assert(process.env.QA_URL, 'Set QA_URL to the running dev or production preview URL');
const browser = await chromium.launch({ headless: true, executablePath: process.env.QA_CHROME });
const context = await browser.newContext();
if (process.env.QA_OFFLINE_FONTS === '1') await context.route('https://fonts.googleapis.com/**', route => route.abort());
const sizes = [[320,568],[360,800],[375,812],[390,844],[412,915],[430,932],[600,960],[768,1024],[820,1180],[1024,768],[1024,1366],[1280,720],[1366,768],[1440,900],[1536,864],[1920,1080],[2560,1440]];
const errors = [], results = [];
async function open(width, height) {
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width, height });
  await page.goto(process.env.QA_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  return page;
}
async function snapshot(page) {
  return page.evaluate(() => ({
    height: document.documentElement.scrollHeight,
    overflow: document.documentElement.scrollWidth - innerWidth,
    hero: document.querySelector('.mxd-hero-section').getBoundingClientRect().height,
    canvas: [document.querySelector('canvas').clientWidth, document.querySelector('canvas').clientHeight],
    sections: [...document.querySelectorAll('.mxd-section')].map(section => section.getBoundingClientRect().height),
    triggers: ScrollTrigger.getAll().length,
    pins: document.querySelectorAll('.pin-spacer').length,
    invalid: ScrollTrigger.getAll().filter(trigger => !Number.isFinite(trigger.start) || !Number.isFinite(trigger.end)).length,
  }));
}
try {
  const page = await open(1440, 900);
  await page.evaluate(() => {
    window.qaRunners = new Set(); window.qaEngines = new Set();
    const run = Matter.Runner.run, stop = Matter.Runner.stop, create = Matter.Engine.create;
    Matter.Runner.run = (runner, ...args) => { qaRunners.add(runner); return run(runner, ...args); };
    Matter.Runner.stop = runner => { qaRunners.delete(runner); return stop(runner); };
    Matter.Engine.create = (...args) => { const engine = create(...args); qaEngines.add(engine); return engine; };
    portfolioViewport.scrollTo(document.querySelector('.mxd-gravity-section'), { immediate: true });
  });
  await page.waitForTimeout(600);
  for (let cycle = 0; cycle < 3; cycle++) {
    for (const width of [390,1440,390,1440,768,1366,430,1920,820]) {
      await page.setViewportSize({ width, height: width < 768 ? 844 : 900 });
      await page.waitForTimeout(280);
    }
  }
  const physics = await page.evaluate(() => ({ engines: qaEngines.size, runners: qaRunners.size }));
  assert.equal(physics.engines, 1, 'Resizes must reuse one physics world');
  assert(physics.runners <= 1, 'Resizes must not accumulate active runners');
  await page.evaluate(() => portfolioViewport.scrollTo(0, { immediate: true }));
  for (const [width, height] of sizes) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(800);
    const resized = await snapshot(page), directPage = await open(width, height), direct = await snapshot(directPage);
    const result = { viewport: [width, height], resized, direct }; results.push(result);
    assert.equal(resized.invalid, 0, `${width}: numeric trigger positions`);
    assert.equal(resized.overflow, 0, `${width}: horizontal overflow`);
    assert.equal(resized.triggers, direct.triggers, `${width}: trigger lifecycle`);
    assert.equal(resized.pins, direct.pins, `${width}: pin lifecycle`);
    assert(Math.abs(resized.height - direct.height) <= 1, `${width}: page height differs after resize`);
    assert(Math.abs(resized.hero - direct.hero) <= 1, `${width}: hero height differs after resize`);
    assert.equal(resized.canvas[0], width, `${width}: canvas width`);
    resized.sections.forEach((value, i) => assert(Math.abs(value - direct.sections[i]) <= 1, `${width}: section ${i} differs`));
    await directPage.close();
  }
  for (const [width, height] of [[390,844],[844,390],[390,844]]) {
    await page.setViewportSize({ width, height }); await page.waitForTimeout(800);
    assert.equal((await snapshot(page)).invalid, 0);
  }
  for (let width = 330; width <= 1650; width += 40) await page.setViewportSize({ width, height: 850 });
  await page.setViewportSize({ width: 1440, height: 900 }); await page.waitForTimeout(1000);
  const final = await snapshot(page), desktop = results.find(result => result.viewport[0] === 1440).direct;
  assert.equal(final.height, desktop.height, 'Arbitrary drag must return to the direct-load layout');
  await page.emulateMedia({ reducedMotion: 'reduce' }); await page.waitForTimeout(300);
  await page.locator('#color-switcher').click(); await page.waitForTimeout(300);
  assert.equal((await snapshot(page)).height, desktop.height, 'Reduced motion and theme must preserve layout');
  await page.locator('.mxd-menu__toggle').click(); await page.waitForTimeout(1400);
  assert(await page.locator('.mxd-menu__hamburger').evaluate(element => element.classList.contains('active')));
  await page.locator('.mxd-menu__toggle').click(); await page.waitForTimeout(1400);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.locator('a[href="#works"]').click(); await page.waitForTimeout(1400);
  assert(await page.evaluate(() => scrollY > 0), 'Lenis anchor navigation must scroll');
  assert.equal(errors.length, 0, errors.join('\n'));
  console.log('Passed: 17 viewport comparisons, 27 breakpoint transitions, orientation, drag, physics reuse, theme, reduced motion, menu, and Lenis anchor navigation.');
} finally {
  if (process.env.QA_REPORT) await writeFile(process.env.QA_REPORT, JSON.stringify({ results, errors }, null, 2));
  await browser.close();
}
