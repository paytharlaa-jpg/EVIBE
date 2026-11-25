// QA: draw calls / triangles of the Solutions film at a progress value.
import { chromium } from 'playwright-core';
const p = +(process.argv[2] || 0.25);
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
await page.addInitScript(() => {
  const orig = HTMLCanvasElement.prototype.getContext;
  window.__gl = [];
  HTMLCanvasElement.prototype.getContext = function (t, ...a) { const c = orig.call(this, t, ...a); if (t.startsWith('webgl') && c && !window.__gl.includes(c)) { window.__gl.push(c); let n = 0; const d1 = c.drawElements.bind(c), d2 = c.drawArrays.bind(c); c.drawElements = (...x) => (n++, d1(...x)); c.drawArrays = (...x) => (n++, d2(...x)); c.__n = () => { const v = n; n = 0; return v; }; } return c; };
});
await page.goto('http://localhost:5173/services', { waitUntil: 'networkidle' });
await page.waitForSelector('.svf', { timeout: 60000 });
await page.evaluate((p) => { const s = document.querySelector('.svf'); window.scrollTo(0, s.offsetTop + (s.offsetHeight - innerHeight) * p); }, p);
await page.waitForTimeout(15000);
const r = await page.evaluate(async () => { window.__gl.forEach((c) => c.__n()); const t0 = performance.now(); await new Promise((r) => setTimeout(r, 4000)); return window.__gl.map((c) => c.__n()); });
console.log('draws per 4s per canvas', r);
await browser.close();
