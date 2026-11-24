// Dev QA: scroll through the site in headless Chrome and save screenshots.
// Usage: node scripts/shots.mjs [desktop|mobile] [outDir]
import { chromium } from 'playwright-core';
import fs from 'node:fs';

const mode = process.argv[2] || 'desktop';
const out = process.argv[3] || 'shots';
fs.mkdirSync(out, { recursive: true });
const url = process.env.URL || 'http://localhost:5173/';

const browser = await chromium.launch({
  executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const ctx = await browser.newContext(
  mode === 'mobile'
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }
    : { viewport: { width: 1440, height: 900 } },
);
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
await page.goto(url, { waitUntil: 'networkidle' });
await page.waitForSelector('.loader', { state: 'detached', timeout: 30000 });
await page.waitForTimeout(2200);
await page.screenshot({ path: `${out}/${mode}-00-hero.png` });

const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
const steps = Number(process.env.STEPS || 24);
for (let i = 1; i <= steps; i++) {
  const y = Math.round((total * i) / steps);
  await page.evaluate((y) => window.scrollTo(0, y), y);
  await page.waitForTimeout(1400);
  const label = await page.evaluate(() => {
    const ids = ['home', 'manifesto', 'about', 'services', 'process', 'impact', 'gallery', 'testimonials', 'faq', 'contact'];
    const mid = innerHeight / 2;
    return ids.find((id) => {
      const r = document.getElementById(id)?.getBoundingClientRect();
      return r && r.top <= mid && r.bottom >= mid;
    }) || 'footer';
  });
  await page.screenshot({ path: `${out}/${mode}-${String(i).padStart(2, '0')}-${label}.png` });
}
console.log('errors:', errors.length ? errors.join('\n') : 'none');
await browser.close();
