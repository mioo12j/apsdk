// Renders the social sharing image (1200×630) from the hero frame and the logo master.
import { createRequire } from 'node:module'; import fs from 'node:fs'; import path from 'node:path';
const { chromium } = createRequire(import.meta.url)('playwright');
const root = path.resolve(new URL('..', import.meta.url).pathname); const b64 = (p) => fs.readFileSync(path.join(root, p)).toString('base64');
const html = `<style>@font-face{font-family:BC;font-weight:700;src:url(data:font/woff2;base64,${b64('public/fonts/barlow-condensed-latin-700-normal.woff2')})}@font-face{font-family:Inter;src:url(data:font/woff2;base64,${b64('public/fonts/inter-latin-wght-normal.woff2')})}
*{margin:0;box-sizing:border-box}body{width:1200px;height:630px;position:relative;font-family:Inter;color:#F6F4EE;background:#0B202C;overflow:hidden}
img.bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:78% 50%}.sh{position:absolute;inset:0;background:linear-gradient(90deg,rgba(11,32,44,.96),rgba(11,32,44,.8) 38%,rgba(11,32,44,0) 66%)}
.c{position:absolute;left:64px;top:56px;bottom:56px;width:560px;display:flex;flex-direction:column;justify-content:space-between}.pl{background:#F6F4EE;padding:12px 18px;border-radius:5px;align-self:flex-start}.pl img{height:72px;display:block}
h1{font:700 82px/.94 BC}.l{font:600 22px Inter;letter-spacing:.14em;text-transform:uppercase;color:#D5EF44}</style>
<img class="bg" src="data:image/png;base64,${b64('src/assets/img/hero-poster.png')}"><div class="sh"></div><div class="c"><div class="pl"><img src="data:image/png;base64,${b64('public/brand/skylark-express-logo.png')}"></div><h1>From the first pickup to the final handover.</h1><div class="l">Speed. Safety. Savings.</div></div>`;
const br = await chromium.launch(); const p = await br.newPage({ viewport: { width: 1200, height: 630 } }); await p.setContent(html); await p.evaluate(() => document.fonts.ready);
await p.screenshot({ path: path.join(root, 'public/brand/og-skylark-express.jpg'), type: 'jpeg', quality: 84 }); await br.close(); console.log('og image written');
