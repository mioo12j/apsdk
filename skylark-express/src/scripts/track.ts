// Tracking tool. States: empty, invalid, loading, unknown, collection pending, in transit,
// delivery exception, delivered (with or without POD/ETA), provider unavailable.
import { validateDockets } from './dockets';
import { cfg, api, esc, humanHTML } from './config';
import { exampleShipments, type TrackResult } from '../data/examples';

const form = document.querySelector<HTMLFormElement>('[data-track]')!;
const input = form.querySelector<HTMLInputElement>('input')!;
const err = form.querySelector<HTMLElement>('.err')!;
const out = document.querySelector<HTMLElement>('[data-track-out]')!;
const status = document.querySelector<HTMLElement>('[data-track-status]')!;
const queryLink = document.querySelector<HTMLAnchorElement>('[data-query-link]');
const fmt = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
const when = (iso: string) => `${fmt.format(new Date(iso))} IST`;
const day = (iso: string) => new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(new Date(iso + 'T12:00:00+05:30'));
const queryHref = (n: string) => `/contact?topic=shipment&docket=${encodeURIComponent(n)}`;

type Lookup = { kind: 'found'; r: TrackResult; example: boolean } | { kind: 'unknown'; number: string } | { kind: 'unavailable'; number: string };
async function lookup(number: string): Promise<Lookup> {
  const ex = exampleShipments.find((s) => s.number === number);
  if (cfg.tracking.mode === 'offline') return ex ? { kind: 'found', r: ex, example: true } : { kind: 'unavailable', number };
  try {
    const res = await api(`${cfg.tracking.endpoint}?number=${encodeURIComponent(number)}`);
    if (res.ok && res.body?.shipment) return { kind: 'found', r: res.body.shipment, example: !!res.body.example };
    if (res.status === 404) return { kind: 'unknown', number };
    return { kind: 'unavailable', number };
  } catch { return { kind: 'unavailable', number }; }
}
function card(l: Lookup): string {
  if (l.kind === 'unavailable') return `<div class="notice bad" data-state="unavailable"><p class="notice-h">Live tracking is temporarily unavailable. Contact our team with your docket number.</p><p>We could not check <span class="mono">${esc(l.number)}</span> just now. Nothing has changed on your shipment because of this.</p>${humanHTML('')}<p class="cluster"><button class="btn btn-ink" type="button" data-retry>Try again</button><a class="link-arrow" href="${queryHref(l.number)}">Raise a shipment query <span aria-hidden="true">→</span></a></p></div>`;
  if (l.kind === 'unknown') return `<div class="notice warn" data-state="unknown"><p class="notice-h">We could not find <span class="mono">${esc(l.number)}</span>.</p><p>Check the number against your consignment note. A docket booked in the last few hours may not have its first scan yet.</p>${humanHTML('Still not found?')}<p><a class="link-arrow" href="${queryHref(l.number)}">Raise a shipment query <span aria-hidden="true">→</span></a></p></div>`;
  const r = l.r, latest = r.events[0];
  const eta = r.state === 'delivered' ? '' : `<div><dt>Estimated delivery</dt><dd>${r.eta ? esc(day(r.eta)) : 'Not yet available'}</dd></div>`;
  const pod = r.state !== 'delivered' ? '' : r.podAvailable
    ? `<div class="trk-pod" data-pod="${esc(r.number)}"><h3 class="display h-3">Proof of delivery (POD)</h3><p class="small">A POD is available for this shipment. It is released to the shipper, the consignee and their authorised users.</p>
        <form data-pod-form novalidate><div class="field"><label for="pod-v-${esc(r.number)}">Consignee PIN code or registered mobile number</label><input class="input mono" id="pod-v-${esc(r.number)}" name="verification" inputmode="numeric" autocomplete="off" maxlength="12" /><p class="hint">${l.example ? 'Example: enter 560027 to see an authorised result, or anything else to see a refusal.' : 'Used only to confirm you are authorised to view this document.'}</p><p class="err" role="alert" hidden></p></div><button class="btn btn-ink" type="submit">View proof of delivery</button></form><div data-pod-out role="status" aria-live="polite"></div></div>`
    : `<div class="trk-pod"><h3 class="display h-3">Proof of delivery (POD)</h3><p>The delivery is recorded, but the POD document is not available online yet.</p><p><a class="link-arrow" href="${queryHref(r.number)}&need=pod">Ask for the POD <span aria-hidden="true">→</span></a></p></div>`;
  return `<article class="trk-card" data-state="${r.state}" aria-label="Shipment ${esc(r.number)}">
    <h2><span class="mono" style="font-size:1.25rem">${esc(r.number)}</span><span class="st ${r.state}">${esc(r.statusLabel)}</span>${l.example ? '<span class="tag example">Example data</span>' : ''}</h2>
    ${r.exceptionNote ? `<div class="notice bad"><p class="notice-h">${esc(r.exceptionNote)}</p>${humanHTML('To arrange delivery:')}</div>` : ''}
    <dl class="trk-latest"><div><dt>Latest scan</dt><dd>${esc(latest.text)}</dd></div><div><dt>City</dt><dd>${esc(latest.city)}</dd></div><div><dt>Mode</dt><dd>${esc(latest.mode)}</dd></div><div><dt>Scan time</dt><dd><time datetime="${latest.time}">${when(latest.time)}</time></dd></div>
      <div><dt>Route</dt><dd>${esc(r.origin)} → ${esc(r.destination)}</dd></div><div><dt>Service</dt><dd>${esc(r.service)}</dd></div><div><dt>Pieces</dt><dd>${r.pieces}</dd></div>${eta}</dl>
    <div><h3 class="display h-3" style="margin-bottom:12px">Scan history</h3><ol class="tl" role="list">${r.events.map((e) => `<li><strong>${esc(e.text)}</strong><time datetime="${e.time}">${when(e.time)} · ${esc(e.city)} · ${esc(e.mode)}</time></li>`).join('')}</ol></div>
    ${pod}
    <p><a class="link-arrow" href="${queryHref(r.number)}">Raise a shipment query <span aria-hidden="true">→</span></a></p>
  </article>`;
}
let busy = false;
async function run(raw: string, push = true) {
  const v = validateDockets(raw);
  if (!v.ok) { err.textContent = v.message; err.hidden = false; input.setAttribute('aria-invalid', 'true'); input.focus(); status.textContent = ''; return; }
  if (busy) return; busy = true;
  err.hidden = true; input.removeAttribute('aria-invalid'); input.value = v.numbers.join(', ');
  // identifiers stay out of analytics URLs: the query string is cleared once read
  if (push) history.replaceState(null, '', '/track');
  if (queryLink) queryLink.href = queryHref(v.numbers[0]);
  out.innerHTML = `<p class="trk-loading"><span class="spin" aria-hidden="true"></span>Checking ${v.numbers.length > 1 ? v.numbers.length + ' numbers' : esc(v.numbers[0])}…</p>`;
  status.textContent = 'Checking…';
  const results = await Promise.all(v.numbers.map(lookup));
  out.innerHTML = results.map(card).join('');
  const sum = results.map((l) => l.kind === 'found' ? `${l.r.number}: ${l.r.statusLabel}` : l.kind === 'unknown' ? `${l.number}: not found` : `${l.number}: tracking unavailable`).join('. ');
  status.innerHTML = `<span class="sr-only">${esc(sum)}</span>`;
  out.querySelectorAll<HTMLButtonElement>('[data-retry]').forEach((b) => b.addEventListener('click', () => run(input.value)));
  out.querySelectorAll<HTMLElement>('[data-pod]').forEach(wirePod);
  busy = false;
  (out.firstElementChild as HTMLElement | null)?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
}
function wirePod(box: HTMLElement) {
  const number = box.dataset.pod!, f = box.querySelector<HTMLFormElement>('[data-pod-form]')!, o = box.querySelector<HTMLElement>('[data-pod-out]')!;
  const inp = f.querySelector<HTMLInputElement>('input')!, e = f.querySelector<HTMLElement>('.err')!;
  f.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const val = inp.value.replace(/\s+/g, '');
    if (!/^\d{6}$|^\d{10}$/.test(val)) { e.textContent = 'Enter the six-digit consignee PIN code or a ten-digit registered mobile number.'; e.hidden = false; inp.setAttribute('aria-invalid', 'true'); inp.focus(); return; }
    e.hidden = true; inp.removeAttribute('aria-invalid');
    const fallback = `<div class="notice warn"><p class="notice-h">We cannot show the proof of delivery online right now.</p><p>Our team can send it to an authorised contact.</p>${humanHTML('')}<p><a class="link-arrow" href="${queryHref(number)}&need=pod">Ask for the POD <span aria-hidden="true">→</span></a></p></div>`;
    if (cfg.pod.mode === 'offline') { o.innerHTML = number.startsWith('EXAMPLE-') && val === '560027' ? podDoc(number, true) : number.startsWith('EXAMPLE-') ? `<div class="notice bad"><p class="notice-h">Those details do not match this shipment.</p><p>The proof of delivery is shown only to authorised customers.</p>${humanHTML('')}</div>` : fallback; return; }
    o.innerHTML = '<p class="trk-loading"><span class="spin" aria-hidden="true"></span>Checking authorisation…</p>';
    try {
      const res = await api(cfg.pod.endpoint, { method: 'POST', body: JSON.stringify({ number, verification: val }) });
      if (res.ok && res.body?.authorised) o.innerHTML = podDoc(number, !!res.body.example, res.body.url);
      else if (res.status === 403) o.innerHTML = `<div class="notice bad"><p class="notice-h">Those details do not match this shipment.</p><p>The proof of delivery is shown only to authorised customers.</p>${humanHTML('')}</div>`;
      else o.innerHTML = fallback;
    } catch { o.innerHTML = fallback; }
  });
}
function podDoc(number: string, example: boolean, url = '') {
  const txt = `SKYLARK EXPRESS (DELHI) PVT. LTD.\nPROOF OF DELIVERY${example ? ' — EXAMPLE RECORD, FICTITIOUS DATA' : ''}\n\nDocket: ${number}\nStatus: Delivered\nRoute: Gurugram to Bengaluru\nPieces: 1 of 1\nReceived: 13 Nov 2026, 12:48 IST\nReceived at: Factory receiving bay\n`;
  const href = url || 'data:text/plain;charset=utf-8,' + encodeURIComponent(txt);
  return `<div class="notice good" data-pod-ok><p class="notice-h">Authorised. Proof of delivery for <span class="mono">${esc(number)}</span>${example ? ' <span class="tag example">Example record</span>' : ''}</p><dl class="trk-latest" style="border:0;padding-bottom:0"><div><dt>Status</dt><dd>Delivered</dd></div><div><dt>Pieces</dt><dd>1 of 1</dd></div><div><dt>Received</dt><dd>13 Nov 2026, 12:48 IST</dd></div><div><dt>Received at</dt><dd>Factory receiving bay</dd></div></dl><p><a class="btn btn-ink" href="${href}" download="POD-${esc(number)}.${url ? 'pdf' : 'txt'}">Download proof of delivery</a></p></div>`;
}
form.addEventListener('submit', (e) => { e.preventDefault(); run(input.value); });
input.addEventListener('input', () => { err.hidden = true; input.removeAttribute('aria-invalid'); });
const q = new URLSearchParams(location.search).get('number');
if (q !== null) { input.value = q; run(q); }
