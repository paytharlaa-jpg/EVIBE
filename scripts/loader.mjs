// QA: intro (no gate). Records stalls (long tasks > 50 ms) while the logo is
// moving, the audio state, and frames. Runs twice: autoplay allowed / blocked.
// Usage: node scripts/loader.mjs <outDir> [url]
import { chromium } from 'playwright-core';
import fs from 'node:fs';
const out = process.argv[2];
const url = process.argv[3] || 'http://localhost:5173/';
fs.mkdirSync(out, { recursive: true });

for (const autoplay of [true, false]) {
  const browser = await chromium.launch({
    executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
    args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', ...(autoplay ? ['--autoplay-policy=no-user-gesture-required'] : [])],
  });
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await page.addInitScript(() => {
    window.__long = [];
    new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__long.push({ t: e.startTime, d: Math.round(e.duration) }))).observe({ type: 'longtask', buffered: true });
  });
  await page.goto(url);
  await page.waitForSelector('.ld2--preroll', { timeout: 30000 });
  await page.waitForTimeout(600);
  const tag = autoplay ? 'auto' : 'blocked';
  await page.screenshot({ path: `${out}/${tag}-0-preroll.png` });
  const labelPre = await page.textContent('.ld2-sound').catch(() => 'none');
  await page.waitForSelector('.ld2--trailer', { timeout: 30000 });
  const tTrailer = await page.evaluate(() => performance.now());
  let labelAfterTap = '-';
  if (!autoplay) {
    await page.mouse.click(30, 450); // any click on the page unlocks audio
    await page.waitForFunction(() => /Sound on/.test(document.querySelector('.ld2-sound')?.textContent || ''), null, { timeout: 5000 }).catch(() => {});
    labelAfterTap = await page.textContent('.ld2-sound').catch(() => 'none');
  }
  if (!process.env.NOSHOTS) {
    await page.waitForTimeout(1400);
    await page.screenshot({ path: `${out}/${tag}-1.png` });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${out}/${tag}-2.png` });
  }
  await page.waitForSelector('.ld2', { state: 'detached', timeout: 60000 });
  const long = await page.evaluate((t0) => window.__long.filter((e) => e.t + e.d > t0 && e.t < t0 + 3150).map((e) => `${e.d}ms@+${Math.round(e.t - t0)}`), tTrailer);
  console.log(`[${tag}] sound label at start: "${labelPre}" → after tap: "${labelAfterTap}" | stalls while logo moving: ${long.length ? long.join(' ') : 'none'} | errors: ${errs.length ? errs.join(' ; ') : 'none'}`);
  await browser.close();
}
