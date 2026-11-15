// Home page motion layer. Everything here is enhancement: the page reads and works without it.
const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
const conn = (navigator as any).connection;
const saveData = !!conn?.saveData || /(^|-)2g/.test(conn?.effectiveType || '');
const wide = matchMedia('(min-width:1024px)');

// 01 · hero take: plays once, silently, after the poster has rendered — capable laptops only.
const hv = document.querySelector<HTMLVideoElement>('[data-hero-video]');
if (hv && !reduce && !saveData && wide.matches && (navigator.hardwareConcurrency || 4) >= 4) {
  const start = () => {
    hv.src = innerWidth * devicePixelRatio > 1500 ? '/media/hero-dispatch-1080p.mp4' : '/media/hero-dispatch-720p.mp4';
    hv.addEventListener('playing', () => hv.classList.add('on'), { once: true });
    hv.addEventListener('ended', () => { /* settles on its composed last frame */ }, { once: true });
    hv.play().catch(() => {});
  };
  const poster = document.querySelector<HTMLImageElement>('[data-hero-poster]');
  const go = () => ('requestIdleCallback' in window ? requestIdleCallback(start, { timeout: 1500 }) : setTimeout(start, 600));
  if (poster?.complete) go(); else poster?.addEventListener('load', go, { once: true });
}

// scroll-linked values
const hero = document.querySelector<HTMLElement>('[data-hero]');
const heroMedia = document.querySelector<HTMLElement>('[data-hero-media]');
const heroCopy = document.querySelector<HTMLElement>('[data-hero-copy]');
const routes = Array.from(document.querySelectorAll<HTMLElement>('[data-route]'));
const journey = document.querySelector<HTMLElement>('[data-journey]');
const jv = document.querySelector<HTMLVideoElement>('[data-journey-video]');
const steps = Array.from(document.querySelectorAll<HTMLElement>('[data-step]'));
const frames = Array.from(document.querySelectorAll<HTMLElement>('[data-frame]'));
const fill = document.querySelector<HTMLElement>('[data-journey-fill]');
const par = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
const pinnedMQ = matchMedia('(min-width:1024px) and (min-height:700px) and (prefers-reduced-motion:no-preference)');
const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));
let jReady = false, jStep = -1, jTarget = 0, jSeeking = false;
const J_SEG = [2.5, 2.5, 3.0, 2.5], J_TOTAL = 10.5;

if (jv && !reduce && !saveData) {
  // fetch the scrub clip only when the sequence approaches, and only where it will be pinned
  const io = new IntersectionObserver((es) => {
    if (es.some((e) => e.isIntersecting) && pinnedMQ.matches) {
      io.disconnect(); jv.src = '/media/journey-scrub.mp4'; jv.load();
      jv.addEventListener('loadeddata', () => { jReady = true; jv.classList.add('on'); jv.pause(); tick(); }, { once: true });
      jv.addEventListener('seeked', () => { jSeeking = false; if (Math.abs(jv.currentTime - jTarget) > 0.06) seek(); });
    }
  }, { rootMargin: '120% 0px' });
  if (journey) io.observe(journey);
}
function seek() { if (!jv || jSeeking) return; jSeeking = true; jv.currentTime = jTarget; }

function tick() {
  const vh = innerHeight;
  if (hero && heroMedia && !reduce && wide.matches) {
    const r = hero.getBoundingClientRect(); const p = clamp(-r.top / r.height);
    heroMedia.style.transform = `translate3d(0,${(p * 9).toFixed(2)}%,0) scale(${(1 + p * 0.06).toFixed(4)})`;
    if (heroCopy) { heroCopy.style.transform = `translate3d(0,${(-p * 40).toFixed(1)}px,0)`; heroCopy.style.opacity = String(clamp(1 - p * 1.25)); }
  }
  if (!reduce) for (const s of routes) { const r = s.getBoundingClientRect(); s.style.setProperty('--p', clamp((vh * 0.62 - r.top) / r.height).toFixed(4)); }
  if (!reduce) for (const el of par) { const r = el.parentElement!.getBoundingClientRect(); const p = clamp((vh - r.top) / (vh + r.height)); el.style.transform = `translate3d(0,${((p - 0.5) * 10).toFixed(2)}%,0)`; }
  if (journey && pinnedMQ.matches) {
    const r = journey.getBoundingClientRect(); const p = clamp(-r.top / (r.height - vh + 72));
    const idx = Math.min(3, Math.floor(p * 4));
    if (idx !== jStep) { jStep = idx; steps.forEach((s, i) => s.classList.toggle('on', i === idx)); frames.forEach((f, i) => f.classList.toggle('on', i === idx)); }
    fill?.style.setProperty('--jp', p.toFixed(4));
    if (jReady && jv) { // map progress → time inside the matching chapter of the scrub clip
      const local = p * 4 - idx; let t0 = 0; for (let i = 0; i < idx; i++) t0 += J_SEG[i];
      jTarget = Math.min(J_TOTAL - 0.05, t0 + clamp(local) * (J_SEG[idx] - 0.09)); seek();
    }
  } else if (jStep !== -2) { jStep = -2; steps.forEach((s) => s.classList.add('on')); }
}
let raf = 0;
const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; tick(); }); };
addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); tick();

// route end: stop the vertical line at the "View proof of delivery" underline
const endSec = document.querySelector<HTMLElement>('[data-route="end"]'), podLink = document.querySelector<HTMLElement>('.podx-link');
const setEnd = () => { if (endSec && podLink) endSec.style.setProperty('--route-end', (podLink.getBoundingClientRect().bottom - endSec.getBoundingClientRect().top - 3) + 'px'); };
setEnd(); addEventListener('resize', setEnd); addEventListener('load', setEnd);

// 04 · services: hover, focus or selection reveals the matching photograph
const svc = document.querySelector<HTMLElement>('[data-services]');
if (svc) {
  const rows = Array.from(svc.querySelectorAll<HTMLElement>('[data-svc]')), imgs = Array.from(svc.querySelectorAll<HTMLElement>('[data-svc-img]'));
  const set = (i: number) => { rows.forEach((r, k) => r.classList.toggle('on', k === i)); imgs.forEach((m, k) => m.classList.toggle('on', k === i)); };
  rows.forEach((r, i) => {
    r.addEventListener('pointerenter', () => set(i)); r.addEventListener('focusin', () => set(i));
    r.querySelector('a')!.addEventListener('click', () => { // thumbnail expands into the service hero where View Transitions are supported
      const im = (wide.matches || innerWidth >= 900 ? imgs[i] : r).querySelector('img'); if (im) (im.style as any).viewTransitionName = 'service-hero';
    });
  });
}

// 02 · figures count up to the values already present in the HTML
if (!reduce && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return; io.unobserve(e.target);
    const node = e.target.firstChild as Text; const final = node?.textContent || ''; const m = final.match(/^(\D*)([\d,]+)(.*)$/);
    if (!m || +m[2].replace(/,/g, '') === 1993) return;
    const target = +m[2].replace(/,/g, ''), t0 = performance.now(), dur = 900;
    const step = (now: number) => { const k = clamp((now - t0) / dur); const v = Math.round(target * (1 - Math.pow(1 - k, 3))); node.textContent = m[1] + v.toLocaleString('en-IN') + m[3]; if (k < 1) requestAnimationFrame(step); else node.textContent = final; };
    requestAnimationFrame(step);
  }), { threshold: 0.6 });
  document.querySelectorAll('[data-count]').forEach((el) => io.observe(el));
}
