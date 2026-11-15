// Home page motion layer. Everything here is enhancement: the page reads and works without it.
import scrub from '../data/generated/scrub.json';
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
const clamp = (n: number, a = 0, b = 1) => Math.min(b, Math.max(a, n));
// 03 · cinematic journey: scrolling plays the footage. Enabled unless the visitor asks for less motion or data.
const DUR = scrub.duration, CH = scrub.chapters;
const SHOTS = CH.flatMap((c) => c.shots);
const shotEl = document.querySelector<HTMLElement>('[data-journey-shot]');
const cine = !!journey && !!jv && journey.classList.contains('is-cine'); // decided by the inline script beside the section
let jReady = false, jStep = -1, jShot = -1, jTarget = 0, jCur = 0, jSeeking = false, jActive = false, jRaf = 0;
if (cine) {
  const portrait = innerWidth < 820 && innerHeight > innerWidth;
  const io = new IntersectionObserver((es) => { // fetch the footage only as the sequence approaches
    if (!es.some((e) => e.isIntersecting)) return; io.disconnect();
    jv!.src = portrait ? '/media/journey-scrub-portrait.mp4' : '/media/journey-scrub-landscape.mp4'; jv!.load();
    jv!.addEventListener('loadeddata', () => { jReady = true; jv!.pause(); jv!.classList.add('on'); }, { once: true });
    jv!.addEventListener('seeked', () => { jSeeking = false; });
  }, { rootMargin: '150% 0px' });
  io.observe(journey!);
  new IntersectionObserver((es) => { jActive = es[0].isIntersecting; if (jActive && !jRaf) jRaf = requestAnimationFrame(jLoop); }).observe(journey!);
}
function jLoop() { // ease the playhead towards the scroll position so the footage glides rather than jumps
  jRaf = 0; if (!jActive) return;
  const d = jTarget - jCur;
  if (Math.abs(d) > 0.004) {
    jCur += d * 0.16;
    if (jReady && jv && !jSeeking && Math.abs(jv.currentTime - jCur) > 0.035) { jSeeking = true; jv.currentTime = jCur; }
  }
  jRaf = requestAnimationFrame(jLoop);
}
function journeyTick(vh: number) {
  if (!cine) return;
  const r = journey!.getBoundingClientRect(); const span = r.height - (vh - 72);
  const p = clamp(-r.top / span);
  jTarget = Math.min(DUR - 0.09, p * DUR);
  if (p > 0.01) journey!.setAttribute('data-moved', '');
  const idx = Math.max(0, CH.findIndex((c) => jTarget < c.end));
  if (idx !== jStep) { jStep = idx; steps.forEach((s, i) => s.classList.toggle('on', i === idx)); frames.forEach((f, i) => f.classList.toggle('on', i === idx)); }
  const si = SHOTS.findIndex((s) => jTarget < s.start + s.dur);
  if (si !== jShot && shotEl) { jShot = si; shotEl.textContent = SHOTS[Math.max(0, si)].label; }
  fill?.style.setProperty('--jp', p.toFixed(4));
  jv?.style.setProperty('--jz', (1.02 + 0.03 * Math.sin(p * Math.PI)).toFixed(4));
}

function tick() {
  const vh = innerHeight;
  if (hero && heroMedia && !reduce && wide.matches) {
    const r = hero.getBoundingClientRect(); const p = clamp(-r.top / r.height);
    heroMedia.style.transform = `translate3d(0,${(p * 9).toFixed(2)}%,0) scale(${(1 + p * 0.06).toFixed(4)})`;
    if (heroCopy) { heroCopy.style.transform = `translate3d(0,${(-p * 40).toFixed(1)}px,0)`; heroCopy.style.opacity = String(clamp(1 - p * 1.25)); }
  }
  if (!reduce) for (const s of routes) { const r = s.getBoundingClientRect(); s.style.setProperty('--p', clamp((vh * 0.62 - r.top) / r.height).toFixed(4)); }
  if (!reduce) for (const el of par) { const r = el.parentElement!.getBoundingClientRect(); const p = clamp((vh - r.top) / (vh + r.height)); el.style.transform = `translate3d(0,${((p - 0.5) * 10).toFixed(2)}%,0)`; }
  journeyTick(vh);
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
