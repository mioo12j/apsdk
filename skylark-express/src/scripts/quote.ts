// Quote enquiry: three steps, entries retained, inline validation, duplicate-submit guard.
// A confirmation or reference is shown only after the server accepts the enquiry.
import { cfg, api, esc, humanHTML, CENTRAL } from './config';
const form = document.querySelector<HTMLFormElement>('[data-quote]')!;
const steps = Array.from(form.querySelectorAll<HTMLFieldSetElement>('[data-q-step]'));
const prog = Array.from(form.querySelectorAll<HTMLElement>('[data-q-progress] li'));
const back = form.querySelector<HTMLButtonElement>('[data-q-back]')!, next = form.querySelector<HTMLButtonElement>('[data-q-next]')!, submit = form.querySelector<HTMLButtonElement>('[data-q-submit]')!;
const summary = form.querySelector<HTMLElement>('[data-q-summary]')!, statusEl = form.querySelector<HTMLElement>('[data-q-status]')!;
const review = form.querySelector<HTMLElement>('[data-q-review]')!, done = document.querySelector<HTMLElement>('[data-q-done]')!;
const KEY = 'skylark.quote.v1';
const el = (n: string) => form.elements.namedItem(n) as HTMLInputElement;
const NAMES = ['service', 'pickup', 'destination', 'cargo', 'weight', 'dimensions', 'storage', 'timing', 'notes', 'name', 'company', 'phone', 'email'];
const LABEL: Record<string, string> = { service: 'Service', pickup: 'Pickup', destination: 'Destination', cargo: 'Cargo', weight: 'Weight', dimensions: 'Dimensions / pieces', storage: 'Storage', timing: 'Timing', notes: 'Notes', name: 'Name', company: 'Company', phone: 'Phone', email: 'Email' };
let step = 0, sending = false, token = crypto.randomUUID?.() || String(Date.now());

// restore retained entries, then apply values carried from the referring page (service, PIN, service-specific fields)
try { const saved = JSON.parse(sessionStorage.getItem(KEY) || '{}'); for (const n of NAMES) if (saved[n]) el(n).value = saved[n]; } catch {}
const qp = new URLSearchParams(location.search);
const extraLabels: Record<string, string> = { lane: 'Lane', loadSize: 'Load size', frequency: 'Frequency', origin: 'Origin', volume: 'Volume', arrivalWindow: 'Required arrival window', skuCount: 'SKUs', location: 'Preferred location', conditions: 'Conditions', grossWeight: 'Gross weight', access: 'Access constraints', targetDate: 'Target date', fragility: 'Fragility', size: 'Size', product: 'Product', range: 'Handling range' };
if (qp.get('service') && Array.from(el('service').options as any as HTMLOptionElement[]).some((o) => o.value === qp.get('service'))) el('service').value = qp.get('service')!;
if (qp.get('pickup') || qp.get('origin')) el('pickup').value = (qp.get('pickup') || qp.get('origin'))!.slice(0, 80);
if (qp.get('destination')) el('destination').value = qp.get('destination')!.slice(0, 80);
if (qp.get('timing')) el('timing').value = qp.get('timing')!.slice(0, 80);
if (qp.get('dimensions')) el('dimensions').value = qp.get('dimensions')!.slice(0, 120);
if (qp.get('grossWeight')) el('weight').value = qp.get('grossWeight')!.slice(0, 60);
const extras = Object.keys(extraLabels).filter((k) => qp.get(k) && !['origin', 'grossWeight'].includes(k)).map((k) => `${extraLabels[k]}: ${qp.get(k)!.slice(0, 200)}`);
if (extras.length && !el('notes').value) el('notes').value = extras.join('\n');
if ([...qp.keys()].length) history.replaceState(null, '', '/quote'); // keep route details out of the address bar once read

const save = () => { const d: any = {}; for (const n of NAMES) d[n] = el(n).value; try { sessionStorage.setItem(KEY, JSON.stringify(d)); } catch {} };
form.addEventListener('input', save);

const setErr = (n: string, msg: string) => { const i = el(n), e = i.closest('.field')!.querySelector<HTMLElement>('.err')!; if (!e.id) e.id = `q-${n}-e`; e.textContent = msg; e.hidden = !msg; if (msg) { i.setAttribute('aria-invalid', 'true'); i.setAttribute('aria-describedby', [i.getAttribute('aria-describedby') || '', e.id].join(' ').trim()); } else i.removeAttribute('aria-invalid'); };
const rules: Record<number, () => [string, string][]> = {
  0: () => { const e: [string, string][] = [];
    if (!el('service').value) e.push(['service', 'Choose a service, or “Not sure yet”.']);
    if (el('pickup').value.trim().length < 2) e.push(['pickup', 'Enter the pickup city or six-digit PIN code.']);
    else if (/^\d+$/.test(el('pickup').value.trim()) && !/^\d{6}$/.test(el('pickup').value.trim())) e.push(['pickup', 'A PIN code has six digits.']);
    if (el('destination').value.trim().length < 2) e.push(['destination', 'Enter the destination city or six-digit PIN code.']);
    else if (/^\d+$/.test(el('destination').value.trim()) && !/^\d{6}$/.test(el('destination').value.trim())) e.push(['destination', 'A PIN code has six digits.']);
    if (el('cargo').value.trim().length < 5) e.push(['cargo', 'Describe the cargo in a few words.']);
    return e; },
  1: () => [],
  2: () => { const e: [string, string][] = []; const ph = el('phone').value.trim(), em = el('email').value.trim();
    if (el('name').value.trim().length < 2) e.push(['name', 'Enter your name.']);
    if (el('company').value.trim().length < 2) e.push(['company', 'Enter your company name.']);
    if (!ph && !em) { e.push(['phone', 'Enter a phone number or an email address so we can reply.']); }
    if (ph && ph.replace(/\D/g, '').length < 10) e.push(['phone', 'Enter a phone number with at least 10 digits.']);
    if (em && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) e.push(['email', 'Enter an email address like name@company.com.']);
    return e; },
};
function validate(s: number, focus = true) {
  steps[s].querySelectorAll<HTMLInputElement>('.input').forEach((i) => i.name && i.closest('.field')?.querySelector('.err') && setErr(i.name, ''));
  const errs = rules[s](); errs.forEach(([n, m]) => setErr(n, m));
  if (errs.length) { summary.innerHTML = `<p class="notice-h">Please correct ${errs.length === 1 ? 'one field' : errs.length + ' fields'} to continue.</p><ul>${errs.map(([n, m]) => `<li><a href="#${el(n).id}">${esc(LABEL[n])}: ${esc(m)}</a></li>`).join('')}</ul>`; summary.hidden = false; if (focus) el(errs[0][0]).focus(); }
  else summary.hidden = true;
  return !errs.length;
}
// the selected service's object slides in beside the heading
const cutImg = document.querySelector<HTMLImageElement>('[data-q-cut]');
const cuts = cutImg ? (JSON.parse(cutImg.dataset.cuts || '{}') as Record<string, string>) : {};
function showCut() {
  if (!cutImg) return; const src = cuts[el('service').value] || cuts['']; if (!src || cutImg.getAttribute('src') === src) return;
  cutImg.classList.remove('swap'); cutImg.src = src; void cutImg.offsetWidth; cutImg.classList.add('swap');
}
function conditional() { const sv = el('service').value || 'not-sure'; form.querySelectorAll<HTMLElement>('[data-for]').forEach((b) => (b.hidden = !b.dataset.for!.split(' ').includes(sv))); }
function show(s: number, focus = true) {
  step = s; steps.forEach((f, i) => (f.hidden = i !== s));
  prog.forEach((p, i) => { p.classList.toggle('done', i < s); i === s ? p.setAttribute('aria-current', 'step') : p.removeAttribute('aria-current'); });
  back.hidden = s === 0; next.hidden = s === 2; submit.hidden = s !== 2; conditional();
  if (s === 2) review.innerHTML = '<dl>' + ['service', 'pickup', 'destination', 'cargo', 'weight', 'dimensions', 'storage', 'timing'].filter((n) => el(n).value.trim()).map((n) => `<div><dt>${LABEL[n]}</dt><dd>${esc(n === 'service' ? (el(n) as any).selectedOptions[0].text : el(n).value)}</dd></div>`).join('') + '</dl>';
  if (focus) { const lg = steps[s].querySelector<HTMLElement>('legend')!; lg.tabIndex = -1; lg.focus(); }
}
next.addEventListener('click', () => { if (validate(step)) show(step + 1); });
back.addEventListener('click', () => { summary.hidden = true; show(step - 1); });
el('service').addEventListener('change', () => { conditional(); showCut(); });
// errors update while typing (not on blur: a blur-time layout shift can swallow the click on Continue)
form.addEventListener('input', (e) => { const t = e.target as HTMLInputElement; if (t.getAttribute?.('aria-invalid') === 'true') { const errs = rules[step](); setErr(t.name, errs.find(([n]) => n === t.name)?.[1] || ''); } });
form.addEventListener('keydown', (e) => { if (e.key === 'Enter' && (e.target as HTMLElement).tagName === 'INPUT' && step < 2) { e.preventDefault(); next.click(); } });

const collect = () => { const d: Record<string, string> = {}; for (const n of NAMES) if (el(n).value.trim()) d[n] = el(n).value.trim(); d.serviceName = (el('service') as any).selectedOptions[0].text; return d; };
const textSummary = (d: Record<string, string>) => ['Freight quote request', '', ...NAMES.filter((n) => d[n]).map((n) => `${LABEL[n]}: ${n === 'service' ? d.serviceName : d[n]}`)].join('\n');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  for (const s of [0, 1, 2]) if (!validate(s, false)) { show(s, false); validate(s); return; }
  if (sending) return; // duplicate-submission guard
  const d = collect(), txt = textSummary(d);
  if (cfg.forms.mode === 'offline') { // mail handoff: nothing has been sent by the website
    const href = `mailto:${CENTRAL.email}?subject=${encodeURIComponent('Freight quote request: ' + d.serviceName + ', ' + d.pickup + ' to ' + d.destination)}&body=${encodeURIComponent(txt)}`;
    form.hidden = true; done.hidden = false;
    done.innerHTML = `<h2 class="display h-2">Your email draft is ready</h2><p><strong>Nothing has been sent yet.</strong> Your mail app should now show a draft addressed to <a href="mailto:${CENTRAL.email}">${CENTRAL.email}</a>. Press send there to submit the request.</p><p>If no draft opened, copy the summary below and email it to <strong>${CENTRAL.email}</strong>.</p><pre data-q-text>${esc(txt)}</pre><p class="cluster"><a class="btn btn-primary" href="${href}">Open email draft</a><button class="btn btn-ink" type="button" data-copy>Copy summary</button><button class="btn btn-ghost" type="button" data-edit>Edit request</button></p><p role="status" aria-live="polite" data-copy-status></p>${humanHTML('Or call:')}`;
    done.focus(); location.href = href; wireDone(txt); return;
  }
  sending = true; submit.disabled = true; back.disabled = true; submit.textContent = 'Sending…'; statusEl.innerHTML = '<p class="trk-loading"><span class="spin" aria-hidden="true"></span>Sending your request…</p>'; summary.hidden = true;
  let ok = false, ref = '', test = false;
  try { const res = await api(cfg.forms.endpoint, { method: 'POST', body: JSON.stringify({ type: 'quote', idempotencyKey: token, ...d }) }, 15000); ok = res.ok && !!res.body?.reference; ref = res.body?.reference || ''; test = !!res.body?.test; } catch {}
  sending = false; submit.disabled = false; back.disabled = false; submit.textContent = 'Send quote request'; statusEl.innerHTML = '';
  if (!ok) { // input is preserved; the visitor can retry or use the human route
    summary.innerHTML = `<p class="notice-h">Your request was not sent.</p><p>Our system did not accept it just now. Your entries are still here. Try again, or contact the team directly.</p>${humanHTML('')}<p><button class="btn btn-ink" type="button" data-q-retry>Try again</button></p>`;
    summary.hidden = false; summary.focus(); summary.querySelector<HTMLButtonElement>('[data-q-retry]')!.addEventListener('click', () => form.requestSubmit(submit)); return;
  }
  try { sessionStorage.removeItem(KEY); } catch {}
  token = crypto.randomUUID?.() || String(Date.now());
  form.hidden = true; done.hidden = false;
  done.innerHTML = `<svg class="q-tick" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="none" stroke="#1C6B3F" stroke-width="3" pathLength="1"/><path d="M19 33l9 9 17-19" fill="none" stroke="#1C6B3F" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/></svg><h2 class="display h-2">Request received</h2>${test ? '<p class="notice warn"><strong>Test environment.</strong> This reference came from the local test API. No enquiry was sent to Skylark Express.</p>' : ''}<p>Your enquiry has been accepted by our system and passed to the sales team for review. It is not a booking. We aim to reply within one business day.</p><p>Reference: <strong class="mono" data-q-ref>${esc(ref)}</strong></p><pre data-q-text>${esc(txt)}</pre><p class="cluster"><button class="btn btn-ink" type="button" data-copy>Copy summary</button><a class="btn btn-ghost" href="/">Back to home</a></p><p role="status" aria-live="polite" data-copy-status></p>${humanHTML('Need to add something?')}`;
  done.focus(); wireDone(txt);
});
function wireDone(txt: string) {
  done.querySelector<HTMLButtonElement>('[data-copy]')?.addEventListener('click', async () => { const st = done.querySelector('[data-copy-status]')!; try { await navigator.clipboard.writeText(txt); st.textContent = 'Summary copied.'; } catch { st.textContent = 'Copy failed. Select the text above and copy it.'; } });
  done.querySelector<HTMLButtonElement>('[data-edit]')?.addEventListener('click', () => { done.hidden = true; form.hidden = false; show(0); });
}
form.removeAttribute('action'); // JS handles submission; the mailto action is the no-JS fallback
show(0, false);
showCut();
