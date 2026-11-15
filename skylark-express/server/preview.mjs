// Preview server: serves ./dist with clean URLs, compression and byte ranges, plus a LABELLED TEST API
// under /api/test/* that the preview build uses for tracking, POD, PIN and enquiry flows.
// It is for local review and automated tests only. Do not deploy it as a production backend.
//   npm run build:preview && npm run preview        (PORT=4321 by default)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { exampleShipments, examplePins } from '../src/data/examples.ts';

const ROOT = path.resolve(new URL('../dist', import.meta.url).pathname);
const PORT = +(process.env.PORT || 4321);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.mp4': 'video/mp4', '.vtt': 'text/vtt; charset=utf-8', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon' };
const state = { failNext: 0, enquiries: new Map(), log: [] };
const json = (res, code, body) => { res.writeHead(code, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' }); res.end(JSON.stringify(body)); };
const readBody = (req) => new Promise((ok) => { let b = ''; req.on('data', (c) => { b += c; if (b.length > 1e5) req.destroy(); }); req.on('end', () => { try { ok(JSON.parse(b || '{}')); } catch { ok({}); } }); });

async function testApi(req, res, url) {
  const p = url.pathname;
  if (p === '/api/test/track') {
    const n = (url.searchParams.get('number') || '').toUpperCase();
    if (n === 'EXAMPLE-DOWN') return json(res, 503, { error: 'provider_unavailable' });
    const s = exampleShipments.find((x) => x.number === n);
    return s ? json(res, 200, { example: true, shipment: s }) : json(res, 404, { error: 'not_found' });
  }
  if (p === '/api/test/pod' && req.method === 'POST') {
    const b = await readBody(req); const s = exampleShipments.find((x) => x.number === String(b.number || '').toUpperCase());
    if (!s || !s.podAvailable) return json(res, 404, { error: 'no_pod' });
    return b.verification === '560027' ? json(res, 200, { authorised: true, example: true }) : json(res, 403, { authorised: false });
  }
  if (p === '/api/test/pin') {
    const pin = url.searchParams.get('pin') || '';
    if (pin === '500000') return json(res, 503, { error: 'lookup_unavailable' });
    const r = examplePins[pin];
    return r ? json(res, 200, { ...r, example: true }) : json(res, 404, { status: 'missing' });
  }
  if (p === '/api/test/enquiry' && req.method === 'POST') {
    const b = await readBody(req);
    if (state.failNext > 0) { state.failNext--; return json(res, 503, { error: 'temporarily_unavailable' }); }
    const key = String(b.idempotencyKey || '');
    if (key && state.enquiries.has(key)) return json(res, 200, { reference: state.enquiries.get(key), test: true, duplicate: true });
    const ref = `TEST-${b.type === 'contact' ? 'MSG' : 'QTE'}-${String(state.enquiries.size + 1).padStart(4, '0')}`;
    if (key) state.enquiries.set(key, ref); state.log.push({ ref, type: b.type, service: b.service });
    return json(res, 201, { reference: ref, test: true });
  }
  if (p === '/api/test/control') { // used by the automated tests to exercise failure and retry
    if (req.method === 'POST') { const b = await readBody(req); if (typeof b.failNext === 'number') state.failNext = b.failNext; if (b.reset) { state.enquiries.clear(); state.log.length = 0; } }
    return json(res, 200, { failNext: state.failNext, accepted: state.enquiries.size, log: state.log });
  }
  return json(res, 404, { error: 'unknown_test_endpoint' });
}
function resolveFile(urlPath) {
  let p = decodeURIComponent(urlPath); if (p.includes('\0')) return null;
  const abs = path.join(ROOT, path.normalize(p)); if (!abs.startsWith(ROOT)) return null;
  for (const c of [abs, abs + '.html', path.join(abs, 'index.html')]) { try { if (fs.statSync(c).isFile()) return c; } catch {} }
  return null;
}
http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  if (url.pathname.startsWith('/api/test/')) return testApi(req, res, url);
  let file = resolveFile(url.pathname), code = 200;
  if (!file) { file = path.join(ROOT, '404.html'); code = 404; }
  const ext = path.extname(file), type = TYPES[ext] || 'application/octet-stream', stat = fs.statSync(file);
  const immutable = url.pathname.startsWith('/_astro/') || url.pathname.startsWith('/fonts/');
  const head = { 'Content-Type': type, 'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : ext === '.html' ? 'no-cache' : 'public, max-age=3600', 'X-Robots-Tag': 'noindex, nofollow', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' };
  if (ext === '.mp4') { // byte ranges so video can seek and the scrub clip can stream
    const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
    head['Accept-Ranges'] = 'bytes';
    if (range) { const s = range[1] ? +range[1] : 0, e = range[2] ? Math.min(+range[2], stat.size - 1) : stat.size - 1; res.writeHead(206, { ...head, 'Content-Range': `bytes ${s}-${e}/${stat.size}`, 'Content-Length': e - s + 1 }); return fs.createReadStream(file, { start: s, end: e }).pipe(res); }
    res.writeHead(code, { ...head, 'Content-Length': stat.size }); return fs.createReadStream(file).pipe(res);
  }
  const compressible = /html|css|javascript|json|svg|xml|plain|vtt/.test(type), ae = req.headers['accept-encoding'] || '';
  if (compressible && /\bbr\b/.test(ae)) { res.writeHead(code, { ...head, 'Content-Encoding': 'br', Vary: 'Accept-Encoding' }); return fs.createReadStream(file).pipe(zlib.createBrotliCompress({ params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } })).pipe(res); }
  if (compressible && /\bgzip\b/.test(ae)) { res.writeHead(code, { ...head, 'Content-Encoding': 'gzip', Vary: 'Accept-Encoding' }); return fs.createReadStream(file).pipe(zlib.createGzip()).pipe(res); }
  res.writeHead(code, { ...head, 'Content-Length': stat.size }); fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`Skylark Express preview on http://localhost:${PORT}  (test API under /api/test/*)`));
