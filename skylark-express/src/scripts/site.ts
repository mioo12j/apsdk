// Shared, site-wide behaviour. Every effect here is enhancement: pages read and work without it.
import { motionOK, videoOK, setMotion, reduced } from './motion';
const $ = <T extends Element>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends Element>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<T>(s));
const root = document.documentElement;
const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));
const finePointer = matchMedia('(hover:hover) and (pointer:fine)');

/* ── menus ─────────────────────────────────────────────────────────────── */
const sb = $<HTMLButtonElement>('[data-submenu-btn]'), sm = $<HTMLElement>('[data-submenu]');
if (sb && sm) {
  const set = (o: boolean) => { sb.setAttribute('aria-expanded', String(o)); sm.dataset.open = String(o); };
  sb.addEventListener('click', () => set(sb.getAttribute('aria-expanded') !== 'true'));
  sb.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { e.preventDefault(); set(true); $<HTMLAnchorElement>('a', sm)?.focus(); } });
  sm.addEventListener('keydown', (e) => {
    const links = $$<HTMLAnchorElement>('a', sm); const i = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (e.key === 'ArrowDown') { e.preventDefault(); links[(i + 1) % links.length].focus(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); links[(i - 1 + links.length) % links.length].focus(); }
    if (e.key === 'Escape') { set(false); sb.focus(); }
  });
  document.addEventListener('click', (e) => { if (!sb.contains(e.target as Node) && !sm.contains(e.target as Node)) set(false); });
  sb.parentElement!.addEventListener('focusout', (e) => { if (!sb.parentElement!.contains((e as FocusEvent).relatedTarget as Node)) set(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && sb.getAttribute('aria-expanded') === 'true') { set(false); sb.focus(); } });
}
const mb = $<HTMLButtonElement>('[data-menu-btn]'), mm = $<HTMLElement>('[data-menu]');
if (mb && mm) {
  const label = $('[data-menu-label]', mb)!;
  $$<HTMLElement>('a', mm).forEach((a, i) => a.style.setProperty('--i', String(i)));
  const set = (o: boolean) => {
    mb.setAttribute('aria-expanded', String(o)); mm.dataset.open = String(o); label.textContent = o ? 'Close' : 'Menu';
    document.body.style.overflow = o ? 'hidden' : '';
    if (o) { const top = $<HTMLElement>('[data-header]')!.getBoundingClientRect().bottom; mm.style.top = top + 'px'; $<HTMLAnchorElement>('a', mm)?.focus(); }
  };
  mb.addEventListener('click', () => set(mb.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (e) => {
    if (mb.getAttribute('aria-expanded') !== 'true') return;
    if (e.key === 'Escape') { set(false); mb.focus(); }
    if (e.key === 'Tab') {
      const f = [mb, ...$$<HTMLElement>('a,button', mm)]; const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  matchMedia('(min-width:1080px)').addEventListener('change', (e) => e.matches && set(false));
}

/* ── search ────────────────────────────────────────────────────────────── */
const sd = $<HTMLDialogElement>('[data-search]');
if (sd) {
  let index: any[] | null = null, opener: HTMLElement | null = null;
  const input = $<HTMLInputElement>('input', sd)!, out = $<HTMLElement>('[data-search-results]', sd)!;
  const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9 ]/g, ' ');
  const render = () => {
    const q = norm(input.value).trim();
    if (!q) { out.innerHTML = '<p class="small muted" style="padding:12px">Try “Bangalore”, “PTL”, “cold chain” or “proof of delivery”.</p>'; return; }
    const terms = q.split(/\s+/);
    const hits = (index || []).map((it) => { const hay = it.h as string; let s = 0; for (const t of terms) { if (!hay.includes(t)) return null; s += norm(it.t).includes(t) ? 3 : 1; } return { it, s }; })
      .filter(Boolean).sort((a: any, b: any) => b.s - a.s).slice(0, 12) as any[];
    out.innerHTML = hits.length
      ? `<p class="sr-only">${hits.length} results</p>` + hits.map(({ it }, i) => `<a href="${it.u}" style="--i:${i}"><span class="k">${it.k}</span><br><span class="t">${it.t}</span><br><span class="s">${it.d}</span></a>`).join('')
      : `<div style="padding:12px"><p><strong>No results for “${input.value.replace(/[<>&]/g, '')}”.</strong></p><p class="small">Call <a href="tel:+911141666666">+91 11 4166 6666</a> or email <a href="mailto:info@skylarkexpressdelhi.com">info@skylarkexpressdelhi.com</a>.</p></div>`;
  };
  const open = async (el: HTMLElement) => {
    opener = el; sd.showModal(); input.focus();
    if (!index) { try { index = (await (await fetch('/search-index.json')).json()).map((i: any) => ({ ...i, h: norm([i.t, i.d, i.x || ''].join(' ')) })); render(); } catch { out.innerHTML = '<p style="padding:12px">Search is unavailable. Use the menu, or call +91 11 4166 6666.</p>'; } }
  };
  $$<HTMLElement>('[data-search-open]').forEach((b) => b.addEventListener('click', () => open(b)));
  $('[data-search-close]', sd)!.addEventListener('click', () => sd.close());
  sd.addEventListener('close', () => opener?.focus());
  sd.addEventListener('click', (e) => { if (e.target === sd) sd.close(); });
  input.addEventListener('input', render);
  document.addEventListener('keydown', (e) => { if (e.key === '/' && !/input|textarea|select/i.test((e.target as HTMLElement).tagName) && !sd.open) { e.preventDefault(); open(document.activeElement as HTMLElement); } });
}

/* ── automatic reveals: headings, eyebrows and lists animate in as they enter ── */
const SKIP = '.page-hero,.sky,.sd-hero,.reel,[data-journey],[data-modes],.site-footer,dialog';
const STAGGER = '.rows,.roles,.tl:not(.trk-tl),.vals,.ops,.tech-list,.cats,.suits,.ct-topics,.c-pts,.all,.acc,.flow,.seq,.scale,.others,.ind-exp ol,.role-cols,.h-side,.sel,.spec,.foot-grid';
$$<HTMLElement>(STAGGER).forEach((list) => Array.from(list.children).forEach((c, i) => {
  if (c.hasAttribute('data-reveal') || c.closest('.page-hero,.sky')) return;
  c.setAttribute('data-reveal', ''); (c as HTMLElement).style.setProperty('--d', `${Math.min(i, 8) * 70}ms`);
}));
$$<HTMLElement>('main h2.display, main .display.h-1, main .display.h-page').forEach((h) => {
  if (h.hasAttribute('data-reveal') || h.closest('[data-reveal]') || h.closest(SKIP)) return;
  h.setAttribute('data-reveal', 'title');
});
$$<HTMLElement>('main .eyebrow').forEach((e) => { if (!e.closest(SKIP) && (!e.hasAttribute('data-reveal') || e.dataset.reveal === '')) e.setAttribute('data-reveal', 'line'); });
const rv = $$<HTMLElement>('[data-reveal]');
if (rv.length) {
  if (!('IntersectionObserver' in window) || reduced()) rv.forEach((e) => e.classList.add('in'));
  else { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }); rv.forEach((e) => io.observe(e)); }
}

/* ── count-up: numbers already in the HTML count up when they enter ──────── */
if ('IntersectionObserver' in window && !reduced()) {
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return; io.unobserve(e.target);
    const node = Array.from(e.target.childNodes).find((n) => n.nodeType === 3 && /\d/.test(n.textContent || '')) as Text | undefined;
    const final = node?.textContent || ''; const m = final.match(/^(\D*?)(\d[\d,]*)(.*)$/s);
    if (!node || !m || !motionOK()) return;
    const target = +m[2].replace(/,/g, ''); if (target < 5 || target === 1993) return;
    const t0 = performance.now(), dur = 1100;
    const step = (now: number) => { const k = clamp((now - t0) / dur); const v = Math.round(target * (1 - Math.pow(1 - k, 3))); node.textContent = m[1] + v.toLocaleString('en-IN') + m[3]; if (k < 1) requestAnimationFrame(step); else node.textContent = final; };
    requestAnimationFrame(step);
  }), { threshold: 0.6 });
  $$('[data-count]').forEach((el) => io.observe(el));
}

/* ── scroll loop: header state, route progress, parallax, drift, marquees, progress lines ── */
const header = $<HTMLElement>('[data-header]');
const rp = $<HTMLElement>('[data-route-progress]');
const par = $$<HTMLElement>('[data-parallax]');
const drift = $$<HTMLElement>('[data-drift]');
const prog = $$<HTMLElement>('[data-progress]');
const mq = $$<HTMLElement>('[data-marquee]').map((el) => ({ el, track: el.firstElementChild as HTMLElement, speed: parseFloat(el.dataset.marquee || '0.4'), half: 0 }));
const mbar = $<HTMLElement>('[data-mbar]');
const measure = () => mq.forEach((m) => { m.half = m.track.scrollWidth / 2; });
let lastY = scrollY, vel = 0;
function tick() {
  const y = scrollY, vh = innerHeight, max = Math.max(1, root.scrollHeight - vh);
  header?.classList.toggle('is-scrolled', y > 8);
  if (rp) { const p = clamp(y / max); rp.style.setProperty('--sp', p.toFixed(4)); rp.classList.toggle('on', p > 0.01); }
  vel = vel * 0.8 + (y - lastY) * 0.2; lastY = y;
  if (mbar) mbar.classList.toggle('show', y > vh * 0.7 && !mbar.classList.contains('kb'));
  if (!motionOK()) return;
  for (const el of par) { const r = (el.parentElement || el).getBoundingClientRect(); const p = clamp((vh - r.top) / (vh + r.height)); el.style.translate = `0 ${((p - 0.5) * parseFloat(el.dataset.parallax || '10')).toFixed(2)}%`; }
  for (const el of drift) { el.style.translate = `0 ${(y * parseFloat(el.dataset.drift || '-0.15')).toFixed(1)}px`; }
  for (const el of prog) { const r = el.getBoundingClientRect(); el.style.setProperty('--p', clamp((vh * 0.7 - r.top) / Math.max(1, r.height)).toFixed(4)); }
  for (const m of mq) { if (!m.half) continue; const r = m.el.getBoundingClientRect(); if (r.bottom < -50 || r.top > vh + 50) continue; let x = (y * Math.abs(m.speed) + Math.abs(vel) * 0) % m.half; m.track.style.transform = `translate3d(${m.speed > 0 ? -x : x - m.half}px,0,0)`; }
}
let raf = 0;
const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; tick(); }); };
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', () => { measure(); onScroll(); });
addEventListener('load', () => { measure(); tick(); });
measure(); tick();

/* ── pointer effects: tilt cards and spotlight bands (fine pointers only) ── */
if (finePointer.matches) {
  $$<HTMLElement>('[data-tilt]').forEach((el) => {
    el.addEventListener('pointermove', (e) => {
      if (!motionOK()) return; const r = el.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg) translateY(-4px)`;
      el.style.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`); el.style.setProperty('--gy', `${((y + 0.5) * 100).toFixed(1)}%`);
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
  $$<HTMLElement>('[data-spot]').forEach((el) => el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); el.style.setProperty('--mx', `${e.clientX - r.left}px`); el.style.setProperty('--my', `${e.clientY - r.top}px`); }));
}

/* ── opening hours: "Open now" from the published hours, in IST ─────────── */
const openEls = $$<HTMLElement>('[data-open-status]');
if (openEls.length) {
  const ist = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const d = ist.getDay(), h = ist.getHours() + ist.getMinutes() / 60, work = d >= 1 && d <= 6;
  const open = work && h >= 10 && h < 18;
  const next = work && h < 10 ? 'today' : d === 6 || d === 0 ? 'Monday' : 'tomorrow';
  openEls.forEach((el) => { el.classList.add(open ? 'is-open' : 'is-closed'); el.textContent = open ? 'Open now · until 6:00 pm IST' : `Closed · opens ${next} at 10:00 am IST`; });
}

/* ── phone quick-action bar: hide while typing so it never covers the keyboard ── */
if (mbar) {
  document.addEventListener('focusin', (e) => { if ((e.target as HTMLElement).matches?.('input,textarea,select')) { mbar.classList.add('kb'); mbar.classList.remove('show'); } });
  document.addEventListener('focusout', () => { mbar.classList.remove('kb'); onScroll(); });
}

/* ── footer van: drives along the lane once when the footer comes into view ── */
const drive = $$<HTMLElement>('[data-drive]');
if (drive.length && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('go'); io.unobserve(e.target); } }), { threshold: 0.5 });
  drive.forEach((d) => io.observe(d));
}

/* ── background video loops: stream only while on screen; always pausable ── */
const loops = $$<HTMLElement>('[data-loop]');
const loopSrc = (v: HTMLVideoElement) => `${v.dataset.src}-${innerWidth * devicePixelRatio > 1100 ? '720' : '480'}.mp4`;
const playLoop = (box: HTMLElement) => {
  const v = box.querySelector('video')!; if (box.dataset.userPaused || !videoOK()) return;
  if (!v.getAttribute('src')) { v.src = loopSrc(v); v.addEventListener('playing', () => box.classList.add('is-playing'), { once: true }); }
  v.play().catch(() => {});
};
const pauseLoop = (box: HTMLElement) => box.querySelector('video')?.pause();
const inView = new Set<HTMLElement>();
if (loops.length && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((es) => es.forEach((e) => { const b = e.target as HTMLElement; if (e.isIntersecting) { inView.add(b); playLoop(b); } else { inView.delete(b); pauseLoop(b); } }), { threshold: 0.12, rootMargin: '120px 0px' });
  loops.forEach((b) => io.observe(b));
}
$$<HTMLButtonElement>('[data-loop-toggle]').forEach((btn) => btn.addEventListener('click', () => {
  const box = btn.closest<HTMLElement>('[data-loop]')!; const pause = btn.getAttribute('aria-pressed') !== 'true';
  btn.setAttribute('aria-pressed', String(pause)); btn.setAttribute('aria-label', btn.getAttribute('aria-label')!.replace(pause ? 'Pause' : 'Play', pause ? 'Play' : 'Pause'));
  if (pause) { box.dataset.userPaused = '1'; pauseLoop(box); } else { delete box.dataset.userPaused; if (!videoOK()) setMotion(true); playLoop(box); }
}));

/* ── visitor's "Pause animations" control ──────────────────────────────── */
const mt = $$<HTMLButtonElement>('[data-motion-toggle]');
const syncMotion = () => {
  const off = root.dataset.motion === 'off';
  mt.forEach((b) => { b.setAttribute('aria-pressed', String(off)); const l = b.querySelector('[data-motion-label]'); if (l) l.textContent = off ? 'Play animations' : 'Pause animations'; });
  if (off) loops.forEach(pauseLoop); else inView.forEach(playLoop);
};
mt.forEach((b) => b.addEventListener('click', () => setMotion(root.dataset.motion === 'off')));
document.addEventListener('motionchange', () => { syncMotion(); onScroll(); });
syncMotion();
