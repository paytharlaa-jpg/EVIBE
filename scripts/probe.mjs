// QA: report page errors and whether a selector exists. node probe.mjs path selector
import { chromium } from 'playwright-core';
const [path, sel] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
page.on('pageerror', (e) => console.log('PAGEERR', e.message));
page.on('console', (m) => m.type() === 'error' && console.log('CONSOLE', m.text().slice(0, 300)));
await page.goto('http://localhost:5173' + path, { waitUntil: 'networkidle' });
await page.waitForTimeout(8000);
console.log('found', await page.evaluate((s) => !!document.querySelector(s), sel), await page.evaluate(() => document.querySelector('main')?.className));
await browser.close();
