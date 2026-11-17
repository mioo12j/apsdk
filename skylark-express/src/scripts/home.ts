// Home page motion layer. Everything here is enhancement: the page reads and works without it.
import scrub from '../data/generated/scrub.json';
const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
const conn = (navigator as any).connection;
const saveData = !!conn?.saveData || /(^|-)2g/.test(conn?.effectiveType || '');
const wide = matchMedia('(min-width:1024px)');

// scroll-linked values
const sky = document.querySelector<HTMLElement>('[data-sky]');
const L = (root: ParentNode | null, n: string) => root?.querySelector<HTMLElement>(`[data-layer="${n}"]`) ?? null;
const skyL = { plane: L(sky, 'plane'), truck: L(sky, 'truck'), sky: L(sky, 'skyline'), lane: L(sky, 'lane'), copy: L(sky, 'copy'), sun: L(sky, 'sun'), dawn: L(sky, 'dawn'), c1: L(sky, 'c1'), c2: L(sky, 'c2'), c3: L(sky, 'c3') };
const carton = document.querySelector<HTMLElement>('[data-layer="carton"]');
const modes = document.querySelector<HTMLElement>('[data-modes]');
const mTrack = document.querySelector<HTMLElement>('[data-modes-track]');
const mLane = document.querySelector<HTMLElement>('[data-modes-lane]');
const mPanels = Array.from(document.querySelectorAll<HTMLElement>('[data-panel]'));
const mDots = Array.from(document.querySelectorAll<HTMLElement>('[data-dot]'));
const T = (el: HTMLElement | null, v: string) => { if (el) el.style.transform = v; };
const ease = (t: number) => t * t * (3 - 2 * t);
const routes = Array.from(document.querySelectorAll<HTMLElement>('[data-route]'));
const journey = document.querySelector<HTMLElement>('[data-journey]');
const jv = document.querySelector<HTMLVideoElement>('[data-journey-video]');
const steps = Array.from(document.querySelectorAll<HTMLElement>('[data-step]'));
const frames = Array.from(document.querySelectorAll<HTMLElement>('[data-frame]'));
const fill = document.querySelector<HTMLElement>('[data-journey-fill]');
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
    jCur += d * 0.24;
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

// 01 · sky: the freighter climbs out over the headline, the truck pulls away along the lane line
function skyTick(vh: number) {
  if (!sky) return;
  const r = sky.getBoundingClientRect(), pinned = sky.classList.contains('is-pin');
  const p = clamp(pinned ? -r.top / (r.height - (vh - r.top - r.height > 0 ? 0 : 0) - (vh - 72)) : -r.top / Math.max(1, r.height * 0.9));
  if (p > 0.01) sky.setAttribute('data-moved', '');
  const vw = innerWidth / 100, pe = ease(p);
  T(skyL.plane, `translate3d(${(pe * 34 * vw).toFixed(1)}px,${(-pe * 34).toFixed(2)}vh,0) rotate(${(-6 - pe * 8).toFixed(2)}deg) scale(${(0.82 + pe * 0.45).toFixed(3)})`);
  T(skyL.truck, `translate3d(${(Math.pow(p, 1.5) * 70 * vw).toFixed(1)}px,0,0)`);
  T(skyL.lane, `translate3d(${(-p * 520).toFixed(1)}px,0,0)`);
  T(skyL.sky, `translate3d(${(-p * 4 * vw).toFixed(1)}px,${(p * 3).toFixed(2)}vh,0)`);
  T(skyL.sun, `translate3d(0,${(-p * 16).toFixed(2)}vh,0) scale(${(1 + p * 0.25).toFixed(3)})`); if (skyL.dawn) skyL.dawn.style.opacity = (p * 0.9).toFixed(3); // the sun comes up as you scroll
  T(skyL.c1, `translate3d(${(p * 18 * vw).toFixed(1)}px,0,0)`); T(skyL.c2, `translate3d(${(-p * 12 * vw).toFixed(1)}px,0,0)`); T(skyL.c3, `translate3d(${(p * 8 * vw).toFixed(1)}px,${(-p * 4).toFixed(1)}vh,0)`);
  if (skyL.copy && pinned) { const q = clamp((p - 0.62) / 0.36); skyL.copy.style.opacity = String(1 - q); skyL.copy.style.transform = `translate3d(0,${(-q * 60).toFixed(1)}px,0)`; skyL.copy.style.visibility = q >= 1 ? 'hidden' : ''; }
}
// 02 · the carton turns as the figures pass
function cartonTick(vh: number) {
  if (!carton || !carton.offsetParent) return;
  const r = carton.parentElement!.getBoundingClientRect(); const p = clamp((vh - r.top) / (vh + r.height));
  T(carton, `translate3d(0,${((0.5 - p) * 120).toFixed(1)}px,0) rotate(${((p - 0.5) * 22).toFixed(2)}deg)`);
}
// 02b · mode theatre: vertical scroll drives a horizontal run; vehicles move faster than their words
let mLastY = scrollY, mVel = 0;
function modesTick(vh: number) {
  if (!modes) return;
  const r = modes.getBoundingClientRect(), vw = innerWidth;
  if (modes.classList.contains('is-pin') && mTrack) {
    const p = clamp(-r.top / (r.height - (vh - 72))), x = p * 3; // 0..3 panels
    T(mTrack, `translate3d(${(-x * vw).toFixed(1)}px,0,0)`);
    T(mLane, `translate3d(${(-x * vw).toFixed(1)}px,0,0)`);
    const v = Math.abs(scrollY - mLastY); mLastY = scrollY; mVel = mVel * 0.82 + Math.min(1, v / 40) * 0.18; modes.style.setProperty('--vel', mVel.toFixed(3));
    mPanels.forEach((pn, i) => {
      const d = x - i; // -1 → entering from right, 0 → centred, 1 → leaving left
      T(pn.querySelector<HTMLElement>('[data-obj]'), `translate3d(${(d * vw * 0.38).toFixed(1)}px,${(i === 3 ? -Math.max(0, d) * 22 : 0).toFixed(1)}vh,0) rotate(${(i === 3 ? -4 - Math.max(0, d) * 10 : 0).toFixed(2)}deg)`);
      T(pn.querySelector<HTMLElement>('[data-word]'), `translate3d(${(d * vw * 0.3).toFixed(1)}px,0,0)`);
      const c = pn.querySelector<HTMLElement>('.m-copy'); if (c) { c.style.opacity = String(clamp(1 - Math.abs(d) * 1.6)); c.style.transform = `translate3d(${(-d * 60).toFixed(1)}px,0,0)`; }
    });
    const on = Math.round(x); mDots.forEach((d, i) => d.classList.toggle('on', i === on));
  } else {
    mPanels.forEach((pn) => { const q = pn.getBoundingClientRect(); const d = clamp((vh - q.top) / (vh + q.height)) - 0.5; T(pn.querySelector<HTMLElement>('[data-obj]'), `translate3d(${(d * vw * 0.5).toFixed(1)}px,0,0)`); T(pn.querySelector<HTMLElement>('[data-word]'), `translate3d(${(d * vw * 0.2).toFixed(1)}px,0,0)`); });
  }
}

function tick() {
  const vh = innerHeight;
  if (!reduce) { skyTick(vh); cartonTick(vh); modesTick(vh); }
  if (!reduce) for (const s of routes) { const r = s.getBoundingClientRect(); s.style.setProperty('--p', clamp((vh * 0.62 - r.top) / r.height).toFixed(4)); }
  journeyTick(vh);
}
let raf = 0;
const onScroll = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; tick(); }); };
addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); tick();

// route end: stop the vertical line at the "View proof of delivery" underline
const endSec = document.querySelector<HTMLElement>('[data-route="end"]'), podLink = document.querySelector<HTMLElement>('.podx-link');
const setEnd = () => { if (endSec && podLink) endSec.style.setProperty('--route-end', (podLink.getBoundingClientRect().bottom - endSec.getBoundingClientRect().top - 3) + 'px'); };
setEnd(); addEventListener('resize', setEnd); addEventListener('load', setEnd);


// Back/forward: pinned sections change the page height during load, so restore the exact place ourselves.
try {
  history.scrollRestoration = 'manual';
  addEventListener('pagehide', () => sessionStorage.setItem('skylark.home.y', String(scrollY)));
  const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  const saved = sessionStorage.getItem('skylark.home.y');
  if (nav?.type === 'back_forward' && saved) { const y = +saved; const go = () => scrollTo(0, y); go(); requestAnimationFrame(go); addEventListener('load', go, { once: true }); }
} catch {}

// a clicked service card's object flies into the service page header (where view transitions are supported)
document.querySelectorAll<HTMLAnchorElement>('.lift').forEach((a) => a.addEventListener('click', () => {
  const img = a.querySelector<HTMLElement>('.lift-obj img'); if (img) img.style.viewTransitionName = 'service-obj';
}));
addEventListener('pageshow', () => document.querySelectorAll<HTMLElement>('.lift-obj img').forEach((i) => (i.style.viewTransitionName = '')));
