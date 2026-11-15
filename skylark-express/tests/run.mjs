// Acceptance walkthrough against the preview build (npm run build:preview && npm run preview).
//   node tests/run.mjs            → functional + accessibility + layout checks
//   node tests/run.mjs --perf     → also prints lab performance measurements
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const axeSrc = fs.readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');
const BASE = process.env.BASE || 'http://localhost:4321';
const results = []; let failed = 0;
const ok = (name, cond, extra = '') => { results.push(`${cond ? 'PASS' : 'FAIL'}  ${name}${extra ? '  — ' + extra : ''}`); if (!cond) failed++; };
const browser = await chromium.launch();
const ctx = async (o = {}) => browser.newContext({ viewport: { width: 1280, height: 720 }, ...o });
const control = (body) => fetch(BASE + '/api/test/control', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then((r) => r.json());
const PAGES = ['/', '/about', '/services', '/services/road-logistics', '/services/railway-logistics', '/services/air-logistics', '/services/warehousing', '/services/project-cargo', '/services/packaging', '/industries', '/network', '/serviceability', '/track', '/quote', '/technology', '/careers', '/careers/branch-operations-manager-gurugram', '/contact', '/help', '/privacy', '/terms', '/this-page-does-not-exist'];

// 1 ─ phone, throttled: start tracking before any film/animation asset loads; reduced motion; invalid docket
{
  const c = await ctx({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' }); const p = await c.newPage();
  const media = []; await p.route('**/media/**', (r) => { media.push(r.request().url()); r.abort(); });
  const cdp = await c.newCDPSession(p); await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 });
  await p.goto(BASE + '/', { waitUntil: 'domcontentloaded' });
  const input = p.locator('#hero-track-n'); await input.waitFor();
  const box = await input.boundingBox(); const btn = await p.locator('.hero-panel button[type=submit]').boundingBox(); const quote = await p.locator('.hero-actions a.btn').boundingBox();
  ok('390px: H1, tracking field, Track and Get a quote are in the first screen', box.y + box.height < 844 && btn.y + btn.height < 844 && quote.y + quote.height <= 844, `quote bottom ${Math.round(quote.y + quote.height)}px`);
  ok('390px: tracking input font is at least 16px', (await input.evaluate((e) => parseFloat(getComputedStyle(e).fontSize))) >= 16);
  await input.fill('!!'); await p.locator('.hero-panel button[type=submit]').click();
  ok('Invalid docket is rejected inline with a message', (await p.locator('#hero-track-e').isVisible()) && (await input.getAttribute('aria-invalid')) === 'true' && p.url().endsWith('/'));
  await input.fill(''); await p.locator('.hero-panel button[type=submit]').click();
  ok('Empty docket shows a prompt', /Enter a docket/.test(await p.locator('#hero-track-e').textContent()));
  await input.fill('example-1002'); await input.press('Enter'); await p.waitForURL('**/track**'); await p.locator('[data-state="in-transit"]').waitFor();
  ok('Tracking started from Home with no film or animation media requested', media.length === 0, `${media.length} media requests`);
  ok('In-transit result shows latest scan, city, mode, time with timezone and ETA', /IST/.test(await p.locator('.trk-latest').textContent()) && /Estimated delivery/.test(await p.locator('.trk-latest').textContent()));
  ok('Docket is removed from the address bar after it is read', !/number=/.test(p.url()));
  // keyboard open: the visual viewport shrinks; the field must stay reachable
  await p.setViewportSize({ width: 390, height: 420 }); await p.goto(BASE + '/'); await p.locator('#hero-track-n').focus();
  const b2 = await p.locator('#hero-track-n').boundingBox(); ok('With the keyboard open (390×420) the focused field is visible', b2.y >= 0 && b2.y + b2.height <= 420);
  await c.close();
}
// 2 ─ 1280×720: Project Cargo → quote, validation, backend failure and retry
{
  const c = await ctx(); const p = await c.newPage(); await control({ reset: true, failNext: 0 });
  await p.goto(BASE + '/'); const q = await p.locator('.hero-actions a.btn').boundingBox(); const t = await p.locator('.hero-panel button[type=submit]').boundingBox();
  ok('1280×720: both hero actions are visible at normal zoom', q.y + q.height <= 720 && t.y + t.height <= 720, `quote bottom ${Math.round(q.y + q.height)}px`);
  await p.goto(BASE + '/services/project-cargo'); await p.locator('#e-dimensions').fill('6 × 3 × 3.2 m'); await p.locator('#e-grossWeight').fill('18 tonnes');
  await p.locator('.sd-enq button[type=submit]').click(); await p.waitForURL('**/quote'); await p.locator('#q-service').waitFor();
  ok('Project Cargo → quote: the service carries over', (await p.locator('#q-service').inputValue()) === 'project-cargo');
  ok('Service-specific answers carry over (dimensions, weight)', (await p.locator('#q-dims').inputValue()).includes('6 × 3') && (await p.locator('#q-weight').inputValue()) === '18 tonnes');
  await p.locator('[data-q-next]').click();
  ok('Invalid step shows inline errors and a summary', (await p.locator('[data-q-summary]').isVisible()) && (await p.locator('#q-pickup').getAttribute('aria-invalid')) === 'true');
  await p.locator('#q-pickup').fill('1100'); await p.locator('#q-dest').fill('Bengaluru'); await p.locator('#q-cargo').fill('One crated transformer'); await p.locator('[data-q-next]').click();
  ok('A four-digit PIN is rejected', /six digits/.test(await p.locator('#q-pickup').locator('xpath=..').textContent()));
  await p.locator('#q-pickup').fill('122022'); await p.locator('[data-q-next]').click(); await p.locator('[data-q-step="1"]').waitFor({ state: 'visible' });
  await p.locator('[data-q-next]').click(); await p.locator('[data-q-back]').click();
  ok('Entries are retained when moving back', (await p.locator('#q-weight').inputValue()) === '18 tonnes');
  await p.locator('[data-q-back]').click(); ok('Step 1 entries retained', (await p.locator('#q-dest').inputValue()) === 'Bengaluru');
  await p.locator('[data-q-next]').click(); await p.locator('[data-q-next]').click();
  await p.locator('[data-q-submit]').click(); ok('Contact step validates name, company and a reachable phone or email', await p.locator('[data-q-summary]').isVisible());
  await p.locator('#q-name').fill('Test Buyer'); await p.locator('#q-company').fill('Example Works'); await p.locator('#q-email').fill('buyer@example'); await p.locator('[data-q-submit]').click();
  ok('Malformed email is rejected', (await p.locator('#q-email').getAttribute('aria-invalid')) === 'true');
  await p.locator('#q-email').fill('buyer@example.com');
  await control({ failNext: 1 }); await p.locator('[data-q-submit]').click(); await p.locator('[data-q-retry]').waitFor();
  ok('Backend failure: clear message, human fallback, no reference shown', /not sent/.test(await p.locator('[data-q-summary]').textContent()) && (await p.locator('[data-q-summary] a[href^="tel:"]').count()) === 2 && (await p.locator('[data-q-ref]').count()) === 0);
  ok('Backend failure preserves the input', (await p.locator('#q-name').inputValue()) === 'Test Buyer');
  await p.locator('[data-q-retry]').click(); await p.locator('[data-q-ref]').waitFor();
  ok('Retry succeeds and shows a reference only after the server accepts', /^TEST-QTE-/.test(await p.locator('[data-q-ref]').textContent()) && /Test environment/.test(await p.locator('[data-q-done]').textContent()));
  const st = await control({}); ok('Exactly one enquiry accepted (no duplicate submission)', st.accepted === 1, `accepted=${st.accepted}`);
  // double-click guard
  await control({ reset: true }); await p.goto(BASE + '/quote?service=road-logistics&pickup=110015&destination=560027');
  ok('PIN prefill from the referring page', (await p.locator('#q-pickup').inputValue()) === '110015' && (await p.locator('#q-dest').inputValue()) === '560027');
  await p.locator('#q-cargo').fill('20 cartons'); await p.locator('[data-q-next]').click(); await p.locator('[data-q-next]').click(); await p.locator('#q-name').fill('A B'); await p.locator('#q-company').fill('C D'); await p.locator('#q-phone').fill('98100 00000');
  await p.locator('[data-q-submit]').dblclick(); await p.locator('[data-q-ref]').waitFor(); ok('Double-click sends one enquiry', (await control({})).accepted === 1);
  await c.close();
}
// 3 ─ branches
{
  const c = await ctx({ viewport: { width: 1440, height: 900 } }); const p = await c.newPage(); await p.goto(BASE + '/network');
  ok('Registered office and New Moti Nagar branch are separate records', (await p.locator('#new-delhi-registered').count()) === 1 && (await p.locator('#new-delhi-moti-nagar').count()) === 1 && (await p.locator('#gurugram-hq').count()) === 1);
  const vis = async () => p.locator('[data-row]:visible').evaluateAll((els) => els.map((e) => e.dataset.row));
  await p.locator('#branch-q').fill('Bangalore'); const a = await vis(); await p.locator('#branch-q').fill('Bengaluru'); const b = await vis();
  ok('“Bangalore” and “Bengaluru” return the same record', a.length === 1 && a[0] === 'bengaluru' && b.join() === a.join(), `${a} / ${b}`);
  await p.locator('#branch-q').fill('110015'); ok('PIN search finds the New Moti Nagar branch', (await vis()).join() === 'new-delhi-moti-nagar');
  await p.locator('#branch-q').fill('Cochin'); ok('Alias “Cochin” finds Kochi', (await vis()).join() === 'kochi');
  const ask = p.locator('#kochi a.btn'); ok('City with unpublished details offers “Ask the central team for branch details”', /Ask the central team for branch details/.test(await ask.textContent()) && /topic=branch/.test(await ask.getAttribute('href')));
  await ask.click(); await p.locator('#c-topic').waitFor(); ok('…and reaches the central team form with the city carried', (await p.locator('#c-topic').inputValue()) === 'branch' && (await p.locator('#c-city').inputValue()) === 'Kochi');
  await p.goto(BASE + '/network'); await p.locator('#branch-q').fill('zzzz'); ok('No-match search shows a human fallback', await p.locator('[data-empty]').isVisible());
  await p.locator('#branch-q').fill('');
  const pin = p.locator('.pins-wide [data-pin*="srinagar"]'); await pin.focus(); await p.keyboard.press('Enter');
  ok('Map pin via keyboard opens the same record as the directory row', /Srinagar branch/.test(await p.locator('[data-office-panel]').textContent()) && /94190 62455/.test(await p.locator('[data-office-panel]').textContent()) && (await p.locator('#srinagar.is-selected').count()) === 1);
  await p.locator('.pins-wide [data-pin*="gurugram-hq"]').click(); const t = await p.locator('[data-office-panel]').textContent();
  ok('Delhi NCR cluster fans out to HQ, registered office and New Moti Nagar as three selectable records', /Gurugram headquarters/.test(t) && /registered office/.test(t) && /New Moti Nagar/.test(t));
  ok('tel: links are valid international numbers', (await p.locator('a[href^="tel:"]').evaluateAll((els) => els.every((e) => /^tel:\+91\d{10}$/.test(e.getAttribute('href'))))));
  await c.close();
}
// 4 ─ tracking states, POD, PIN states
{
  const c = await ctx(); const p = await c.newPage(); const go = async (n) => { await p.goto(BASE + '/track?number=' + n); await p.locator('[data-track-out] > *').first().waitFor(); };
  await go('EXAMPLE-1004'); ok('Delivered shipment shows status and scan history', (await p.locator('[data-state="delivered"] .tl li').count()) === 6);
  await p.locator('[data-pod-form] input').fill('123456'); await p.locator('[data-pod-form] button').click(); await p.locator('[data-pod-out] .notice').waitFor();
  ok('POD is refused when the visitor is not authorised', /do not match/.test(await p.locator('[data-pod-out]').textContent()) && (await p.locator('[data-pod-ok]').count()) === 0);
  await p.locator('[data-pod-form] input').fill('560027'); await p.locator('[data-pod-form] button').click(); await p.locator('[data-pod-ok]').waitFor();
  ok('Authorised POD flow shows the record and a download', (await p.locator('[data-pod-ok] a[download]').count()) === 1);
  await go('EXAMPLE-1005'); ok('Delivered without POD is handled', /not available online yet/.test(await p.locator('.trk-pod').textContent()));
  await go('EXAMPLE-1001'); ok('Collection pending without ETA is handled', /Not yet available/.test(await p.locator('.trk-latest').textContent()));
  await go('EXAMPLE-1003'); ok('Delivery exception shows the reason and phones', (await p.locator('[data-state="exception"] .notice.bad a[href^="tel:"]').count()) === 2);
  await go('ABC12345'); ok('Unknown docket: message and human fallback', (await p.locator('[data-state="unknown"] a[href^="tel:"]').count()) === 2 && /contact\?topic=shipment&docket=ABC12345/.test(await p.locator('[data-state="unknown"] .link-arrow').getAttribute('href')));
  await go('EXAMPLE-DOWN'); ok('Provider unavailable: exact fallback message, phones and retry', /Live tracking is temporarily unavailable\. Contact our team with your docket number\./.test(await p.locator('[data-state="unavailable"]').textContent()) && (await p.locator('[data-retry]').count()) === 1);
  await p.locator('[data-state="unavailable"] .link-arrow').click(); await p.locator('#c-docket').waitFor(); ok('Raise a shipment query carries the docket into support', (await p.locator('#c-docket').inputValue()) === 'EXAMPLE-DOWN' && (await p.locator('#c-topic').inputValue()) === 'shipment');
  await go('EXAMPLE-1002,EXAMPLE-1004'); ok('Multiple-number lookup returns a card per number', (await p.locator('.trk-card').count()) === 2);
  const pin = async (n) => { await p.goto(BASE + '/serviceability?pin=' + n); await p.locator('[data-pin-state]').waitFor(); return p.locator('[data-pin-state]'); };
  let r = await pin('110015'); ok('PIN serviceable → quote link with the PIN prefilled', (await r.getAttribute('data-pin-state')) === 'serviceable' && /quote\?destination=110015/.test(await r.locator('a.btn').getAttribute('href')));
  r = await pin('744101'); ok('PIN confirmed unsupported → Ask about this PIN', (await r.getAttribute('data-pin-state')) === 'unsupported' && /Ask about this PIN/.test(await r.textContent()));
  r = await pin('799001'); ok('PIN with no record → not confirmed, human fallback', (await r.getAttribute('data-pin-state')) === 'missing' && (await r.locator('a[href^="tel:"]').count()) === 2);
  r = await pin('500000'); ok('PIN lookup offline → distinct message and retry', (await r.getAttribute('data-pin-state')) === 'offline' && (await r.locator('[data-pin-retry]').count()) === 1);
  await p.goto(BASE + '/serviceability'); await p.locator('#pin-i').fill('1100'); await p.locator('.pin-form button').click(); ok('Short PIN rejected', await p.locator('#pin-e').isVisible());
  await c.close();
}
// 5 ─ keyboard, film player, Back, layout, links, headings, alt text, axe
{
  const c = await ctx({ viewport: { width: 390, height: 844 }, hasTouch: true }); const p = await c.newPage(); await p.goto(BASE + '/');
  const mb = p.locator('[data-menu-btn]'); await mb.focus(); await p.keyboard.press('Enter');
  ok('Mobile menu opens and moves focus inside', (await p.locator('[data-menu]').getAttribute('data-open')) === 'true' && (await p.evaluate(() => document.activeElement.closest('[data-menu]') !== null)));
  await p.keyboard.press('Escape'); ok('Escape closes the menu and returns focus', (await p.evaluate(() => document.activeElement.hasAttribute('data-menu-btn'))));
  const reqs = []; p.on('request', (r) => /the-handover/.test(r.url()) && reqs.push(r.url()));
  ok('Phone starts with the poster: no film request before play', reqs.length === 0);
  const pf = p.locator('[data-film-open]').first(); await pf.scrollIntoViewIfNeeded(); await pf.click(); await p.waitForTimeout(700);
  ok('Play film opens the player and fetches only the portrait rendition', (await p.locator('[data-film]').evaluate((d) => d.open)) && reqs.filter((u) => u.endsWith('.mp4')).every((u) => /portrait/.test(u)) && reqs.some((u) => /portrait/.test(u)), reqs.map((u) => u.split('/').pop()).join(','));
  ok('Film starts muted with captions track', await p.locator('[data-film-video]').evaluate((v) => v.muted && v.textTracks.length === 1)); reqs.length = reqs.length;
  await p.keyboard.press('Escape'); await p.waitForTimeout(200);
  ok('Escape closes the film, returns focus and releases the decoder', (await p.evaluate(() => document.activeElement.hasAttribute('data-film-open'))) && (await p.locator('[data-film-video]').evaluate((v) => !v.getAttribute('src'))));
  await c.close();
  const d = await ctx({ viewport: { width: 1440, height: 900 } }); const q = await d.newPage(); await q.goto(BASE + '/');
  await q.keyboard.press('Tab'); ok('First Tab reaches the skip link', await q.evaluate(() => document.activeElement.classList.contains('skip')));
  await q.locator('[data-submenu-btn]').focus(); await q.keyboard.press('Enter'); await q.keyboard.press('ArrowDown');
  ok('Company menu is keyboard operable', await q.evaluate(() => document.activeElement.getAttribute('href') === '/about'));
  await q.keyboard.press('Escape');
  await q.locator('[data-search-open]').click(); await q.locator('#site-search').fill('bangalore'); await q.locator('[data-search-results] a').first().waitFor();
  ok('Global search returns branches, services and help', /Bengaluru/.test(await q.locator('[data-search-results]').textContent()));
  await q.locator('#site-search').fill('ptl'); await q.waitForTimeout(100); ok('Search finds PTL help and service', /Road logistics/.test(await q.locator('[data-search-results]').textContent()));
  await q.locator('[data-search-close]').click(); ok('Closing search returns focus to its button', await q.evaluate(() => document.activeElement.hasAttribute('data-search-open')));
  await q.evaluate(() => document.querySelector('#services').scrollIntoView({ behavior: 'instant' })); await q.waitForTimeout(500); const y0 = await q.evaluate(() => scrollY);
  await q.locator('.svc-link').nth(3).click(); await q.waitForURL('**/services/warehousing'); await q.goBack(); await q.waitForTimeout(600);
  ok('Back from a service detail restores the visitor’s place', Math.abs((await q.evaluate(() => scrollY)) - y0) < 200, `was ${y0}, now ${await q.evaluate(() => scrollY)}`);
  await d.close();
  const sizes = [[360, 740], [390, 844], [768, 1024], [844, 390], [1280, 720], [1440, 900], [1920, 1080], [640, 360]]; // last = 1280×720 at 200% zoom
  const over = [];
  for (const [w, h] of sizes) { const cx = await ctx({ viewport: { width: w, height: h } }); const pg = await cx.newPage();
    for (const u of PAGES) { await pg.goto(BASE + u, { waitUntil: 'domcontentloaded' }); const o = await pg.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); if (o > 1) over.push(`${u}@${w}:${o}px`); }
    await cx.close(); }
  ok('No horizontal overflow on any page at 360, 390, 768, landscape phone, 1280×720, 1440, 1920 and 200% zoom', over.length === 0, over.slice(0, 8).join(' '));
  const cx = await ctx({ viewport: { width: 1280, height: 720 } }); const pg = await cx.newPage(); const hrefs = new Set(); const issues = []; const axeIssues = [];
  for (const u of PAGES) {
    const res = await pg.goto(BASE + u, { waitUntil: 'load' });
    if (u === '/this-page-does-not-exist') { ok('404 page returns 404 and offers Track, Services and Contact', res.status() === 404 && (await pg.locator('main a.btn').allTextContents()).join().replace(/\s/g, '') === 'Track,Services,Contact'); }
    const info = await pg.evaluate(() => ({ h1: document.querySelectorAll('h1').length, noAlt: [...document.images].filter((i) => !i.hasAttribute('alt')).length, title: document.title, canon: document.querySelector('link[rel=canonical]')?.href, robots: document.querySelector('meta[name=robots]')?.content, links: [...document.querySelectorAll('a[href^="/"]')].map((a) => a.getAttribute('href').split('#')[0].split('?')[0]), small: [...document.querySelectorAll('main a.btn, main button:not([data-pin]), header a, header button')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && (r.height < 43.5); }).length }));
    if (info.h1 !== 1) issues.push(`${u}: ${info.h1} h1`); if (info.noAlt) issues.push(`${u}: ${info.noAlt} img without alt`); if (!info.canon?.startsWith('https://www.skylarkexpressdelhi.com')) issues.push(`${u}: canonical ${info.canon}`); if (!/noindex/.test(info.robots || '')) issues.push(`${u}: preview not noindex`); if (info.small) issues.push(`${u}: ${info.small} controls under 44px tall`);
    info.links.forEach((l) => hrefs.add(l));
    await pg.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('in'))); await pg.addStyleTag({ content: '*{transition:none!important}' }); await pg.waitForTimeout(50);
    await pg.evaluate(axeSrc); const ax = await pg.evaluate(() => window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'] }));
    ax.violations.forEach((v) => axeIssues.push(`${u}: ${v.id} (${v.nodes.length}) ${v.nodes[0].target.join(' ')}`));
  }
  ok('Every page: one H1, alt text, production canonical, preview noindex, 44px controls', issues.length === 0, issues.slice(0, 10).join(' | '));
  ok('axe-core WCAG 2.2 A/AA: no violations on any page', axeIssues.length === 0, axeIssues.slice(0, 12).join(' | '));
  const bad = []; for (const h of hrefs) { const r = await fetch(BASE + h); if (r.status !== 200) bad.push(`${h}:${r.status}`); }
  ok(`All ${hrefs.size} internal links resolve`, bad.length === 0, bad.join(' '));
  const sm = await (await fetch(BASE + '/sitemap.xml')).text(); ok('Sitemap lists canonical production URLs and no tracking queries', /<loc>https:\/\/www\.skylarkexpressdelhi\.com\/services\/project-cargo<\/loc>/.test(sm) && !/\?[a-z]+=/.test(sm));
  await cx.close();
}
// 6 ─ lab performance (cold mobile load)
if (process.argv.includes('--perf')) {
  for (const [label, vp, cpu, net] of [['Mobile: 390×844, 4× CPU slowdown, Slow 4G (1.6 Mbps down, 750 kbps up, 150 ms RTT)', { width: 390, height: 844 }, 4, { latency: 150, downloadThroughput: (1.6 * 1024 * 1024) / 8, uploadThroughput: (750 * 1024) / 8 }], ['Laptop: 1440×900, no CPU slowdown, 10 Mbps, 40 ms RTT', { width: 1440, height: 900 }, 1, { latency: 40, downloadThroughput: (10 * 1024 * 1024) / 8, uploadThroughput: (5 * 1024 * 1024) / 8 }]]) {
    const c = await browser.newContext({ viewport: vp, isMobile: vp.width < 500, deviceScaleFactor: vp.width < 500 ? 2 : 1 }); const p = await c.newPage(); const cdp = await c.newCDPSession(p);
    await cdp.send('Network.enable'); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true }); await cdp.send('Network.emulateNetworkConditions', { offline: false, ...net }); await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
    const sizes = new Map(); const types = new Map(); cdp.on('Network.responseReceived', (e) => types.set(e.requestId, [e.response.url, e.type])); cdp.on('Network.loadingFinished', (e) => sizes.set(e.requestId, e.encodedDataLength));
    await p.addInitScript(() => { window.__lcp = 0; window.__cls = 0; new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true }); new PerformanceObserver((l) => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: 'layout-shift', buffered: true }); });
    await p.goto(BASE + '/', { waitUntil: 'load' }); await p.waitForTimeout(vp.width < 500 ? 2500 : 500);
    const m = await p.evaluate(() => ({ lcp: Math.round(window.__lcp), cls: +window.__cls.toFixed(3), fcp: Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0) }));
    let js = 0, total = 0, img = 0, biggest = ['', 0], hero = 0;
    for (const [id, [url, type]] of types) { const s = sizes.get(id) || 0; if (/\.mp4/.test(url)) continue; total += s; if (type === 'Script') js += s; if (type === 'Image') { img += s; if (/hero/.test(url)) hero = Math.max(hero, s); } if (s > biggest[1]) biggest = [url.split('/').pop(), s]; }
    const kb = (n) => (n / 1024).toFixed(1) + ' KB';
    results.push(`PERF  ${label}\n        FCP ${m.fcp} ms · LCP ${m.lcp} ms · CLS ${m.cls} · JS ${kb(js)} · images ${kb(img)} · hero poster ${kb(hero)} · total initial transfer ${kb(total)} · largest: ${biggest[0]} ${kb(biggest[1])}`);
    if (vp.width < 500) { ok('Budget: Home initial JS ≤ 150 KB compressed', js <= 150 * 1024, kb(js)); ok('Budget: mobile hero poster ≤ 180 KB', hero <= 180 * 1024, kb(hero)); ok('Budget: first mobile viewport transfer ≤ 500 KB', total <= 500 * 1024, kb(total)); ok('Lab LCP ≤ 2.5 s and CLS ≤ 0.1 on throttled mobile', m.lcp <= 2500 && m.cls <= 0.1, `LCP ${m.lcp} ms, CLS ${m.cls}`); }
    // INP proxy: interaction latency for typing + submitting the tracking field
    const t0 = Date.now(); await p.locator('#hero-track-n').fill('!!'); await p.locator('.hero-panel button[type=submit]').click(); await p.locator('#hero-track-e').waitFor(); results.push(`        tracking-field interaction to feedback: ${Date.now() - t0} ms (lab, includes automation overhead)`);
    await c.close();
  }
}
await browser.close();
console.log(results.join('\n')); console.log(`\n${results.filter((r) => r.startsWith('PASS')).length} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
