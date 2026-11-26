// QA: scroll the IQ page and log errors/warnings (desktop or mobile).
import { chromium } from 'playwright-core';
const mode = process.argv[2] || 'desktop';
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext(mode === 'mobile' ? { viewport: { width: 393, height: 852 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const log = [];
page.on('pageerror', (e) => log.push('PAGEERROR ' + e.message));
page.on('console', (m) => ['error', 'warning'].includes(m.type()) && !/KHR_parallel|GPU stall|GL Driver/.test(m.text()) && log.push(m.type() + ' ' + m.text().slice(0, 240)));
await page.goto('http://localhost:5173/iq', { waitUntil: 'networkidle' });
await page.waitForSelector('.ld2', { state: 'detached', timeout: 90000 }).catch(() => log.push('loader never closed'));
await page.waitForTimeout(2000);
const H = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
for (let y = 0; y <= H; y += 300) { await page.evaluate((y) => window.scrollTo(0, y), y); await page.waitForTimeout(120); }
await page.waitForTimeout(1500);
const state = await page.evaluate(() => {
  const vis = (sel) => [...document.querySelectorAll(sel)].map((e) => +getComputedStyle(e).opacity).join(',');
  return { iqd: vis('.iqd-step'), iqu: vis('.iqu-card'), iqo: vis('.iqo-doc'), form: vis('.iqe .field'), heads: vis('.iqd-head > *, .iqu-head > *, .iqo-head > *'), k: document.querySelector('.ps')?.getAttribute('class'), overflow: document.documentElement.scrollWidth - innerWidth };
});
console.log(mode, JSON.stringify(state));
console.log(log.slice(0, 15).join('\n') || 'no errors');
await browser.close();
