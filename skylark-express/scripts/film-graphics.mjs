// Renders the film's editable graphics (titles, shipping record, end frame) to transparent PNGs.
// Edit the text here and re-run: node scripts/film-graphics.mjs && python3 scripts/build-film.py
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(new URL('..', import.meta.url).pathname);
const out = path.join(root, 'media-src/work/ov');
fs.mkdirSync(out, { recursive: true });
const b64 = (p) => fs.readFileSync(path.join(root, p)).toString('base64');
const logo = `data:image/png;base64,${b64('public/brand/skylark-express-logo.png')}`;
const css = (W, H) => `
@font-face{font-family:BC;font-weight:700;src:url(data:font/woff2;base64,${b64('public/fonts/barlow-condensed-latin-700-normal.woff2')})}
@font-face{font-family:Inter;font-weight:400 600;src:url(data:font/woff2;base64,${b64('public/fonts/inter-latin-wght-normal.woff2')})}
*{box-sizing:border-box;margin:0}
html,body{width:${W}px;height:${H}px;background:transparent;overflow:hidden}
body{font-family:Inter,sans-serif;color:#F6F4EE;--u:${W > H ? W / 1920 : W / 900}px;--safe-x:${W > H ? '6.5%' : '8%'};--safe-b:${W > H ? '9%' : '14%'}}
.frame{position:absolute;inset:0}
.chap{position:absolute;left:var(--safe-x);bottom:var(--safe-b);display:flex;align-items:center;gap:calc(18*var(--u))}
.chap .n{font:600 calc(22*var(--u))/1 ui-monospace,Menlo,monospace;color:#0B202C;background:#D5EF44;padding:calc(8*var(--u)) calc(12*var(--u));border-radius:calc(4*var(--u))}
.chap .t{font:700 calc(64*var(--u))/1 BC;letter-spacing:.01em;text-shadow:0 2px 24px rgba(4,14,20,.75)}
.chap .s{font:500 calc(26*var(--u))/1.2 Inter;opacity:.95;text-shadow:0 2px 16px rgba(4,14,20,.9)}
.shade{position:absolute;inset:auto 0 0 0;height:38%;background:linear-gradient(to top,rgba(4,14,20,.72),rgba(4,14,20,0))}
.note{position:absolute;right:var(--safe-x);top:7%;font:500 calc(22*var(--u))/1 Inter;background:rgba(11,32,44,.78);padding:calc(10*var(--u)) calc(16*var(--u));border-radius:999px;border:1px solid rgba(246,244,238,.4)}
.big{position:absolute;left:var(--safe-x);right:var(--safe-x);top:${W > H ? '14%' : '10%'};font:700 calc(${W > H ? 118 : 104}*var(--u))/.95 BC;text-shadow:0 4px 40px rgba(4,14,20,.8);max-width:${W > H ? '46%' : '100%'}}
.big small{display:block;font:600 calc(24*var(--u))/1 Inter;letter-spacing:.16em;text-transform:uppercase;color:#D5EF44;margin-bottom:calc(22*var(--u))}
.topshade{position:absolute;inset:0;background:linear-gradient(${W > H ? '100deg' : '180deg'},rgba(4,14,20,.78),rgba(4,14,20,0) ${W > H ? '58%' : '55%'})}
/* POD */
.pod-bg{position:absolute;inset:0;background:#F6F4EE}
.pod{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:${W > H ? '62%' : '86%'};background:#fff;color:#102532;border:calc(2*var(--u)) solid #102532;padding:calc(${W > H ? 52 : 60}*var(--u));font-size:calc(${W > H ? 27 : 34}*var(--u))}
.pod .head{display:flex;justify-content:space-between;align-items:center;gap:20px}
.pod .head img{height:calc(${W > H ? 84 : 110}*var(--u))}
.pod .ex{font:600 .7em/1 Inter;letter-spacing:.12em;text-transform:uppercase;background:#FFF6CC;color:#5A4500;border:1.5px solid #5A4500;border-radius:999px;padding:.5em .9em}
.pod .bands{margin:calc(34*var(--u)) 0;display:grid;gap:calc(14*var(--u))}
.pod .bands i{display:block;height:calc(16*var(--u));background:linear-gradient(90deg,#1A9FDD 0 62%,#9CCB3B 62% 100%)}
.pod .status{font:700 3.6em/.95 BC;color:#102532}
.pod .sub{font:700 2em/1 BC;color:#006780;margin-top:.15em}
.pod dl{display:grid;grid-template-columns:${W > H ? 'repeat(4,1fr)' : 'repeat(2,1fr)'};gap:1em 1.2em;margin-top:1.3em;border-top:1.5px solid rgba(16,37,50,.3);padding-top:1.1em}
.pod dt{font:600 .62em/1.2 Inter;letter-spacing:.12em;text-transform:uppercase;color:#4A5B66}
.pod dd{font:500 .95em/1.3 ui-monospace,Menlo,monospace}
/* end */
.end-shade{position:absolute;inset:0;background:linear-gradient(180deg,rgba(11,32,44,.93) 0%,rgba(11,32,44,.8) 40%,rgba(11,32,44,.15) 72%,rgba(11,32,44,0) 100%)}
.end{position:absolute;left:0;right:0;top:${W > H ? '13%' : '16%'};display:grid;justify-items:center;gap:calc(40*var(--u))}
.end .plate{background:#F6F4EE;padding:calc(26*var(--u)) calc(40*var(--u));border-radius:calc(6*var(--u))}
.end .plate img{display:block;height:calc(${W > H ? 190 : 200}*var(--u))}
.end .line{font:700 calc(${W > H ? 104 : 84}*var(--u))/1 BC;letter-spacing:.01em;text-align:center;padding:0 6%}
.end .co{font:500 calc(24*var(--u))/1 Inter;letter-spacing:.14em;text-transform:uppercase;color:#91D3DC}
`;
const chap = (n, t, s) => `<div class="shade"></div><div class="chap"><span class="n">${n}</span><div><div class="t">${t}</div>${s ? `<div class="s">${s}</div>` : ''}</div></div>`;
const frames = {
  note: `<div class="note">Illustrative shipment journey</div>`,
  c1: chap('01', 'Pickup', 'Sealed, labelled and scanned'),
  c2: chap('02', 'First mile', 'Collected from the shipper'),
  c3: chap('03', 'Hub', 'Counted, scanned and staged'),
  mode: `<div class="topshade"></div><div class="big"><small>Linehaul</small>The right mode for the load.</div>`,
  road: chap('A', 'Road', 'Full or part truck load'),
  rail: chap('B', 'Rail', 'Road pickup, rail leg, road delivery'),
  air: chap('C', 'Air', 'Urgent and scheduled consignments'),
  c4: chap('04', 'Delivery', 'Scanned by the recipient'),
  pod: `<div class="pod-bg"></div><div class="pod"><div class="head"><img src="${logo}"><span class="ex">Example record</span></div><div class="bands"><i></i><i></i></div><div class="status">Delivered</div><div class="sub">Proof of delivery</div><dl><div><dt>Docket</dt><dd>EXAMPLE-1004</dd></div><div><dt>Route</dt><dd>Gurugram → Bengaluru</dd></div><div><dt>Pieces</dt><dd>1 of 1</dd></div><div><dt>Received</dt><dd>13 Nov, 12:48 IST</dd></div></dl></div>`,
  end: `<div class="end-shade"></div><div class="end"><div class="plate"><img src="${logo}"></div><div class="line">Speed. Safety. Savings.</div><div class="co">Skylark Express (Delhi) Pvt. Ltd.</div></div>`,
};
const browser = await chromium.launch();
for (const [tag, W, H] of [['l', 1920, 1080], ['p', 720, 1280]]) {
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  for (const [name, html] of Object.entries(frames)) {
    await page.setContent(`<style>${css(W, H)}</style><div class="frame">${html}</div>`);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(out, `${tag}_${name}.png`), omitBackground: true });
  }
  await page.close();
}
await browser.close();
console.log('graphics written to', out);
