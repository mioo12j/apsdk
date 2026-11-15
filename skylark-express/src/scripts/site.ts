// Shared, tiny: menus, search dialog, scroll reveals. No dependency on any page animation.
const $ = <T extends Element>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends Element>(s: string, r: ParentNode = document) => Array.from(r.querySelectorAll<T>(s));

// Company submenu
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
// Mobile menu
const mb = $<HTMLButtonElement>('[data-menu-btn]'), mm = $<HTMLElement>('[data-menu]');
if (mb && mm) {
  const label = $('[data-menu-label]', mb)!;
  const set = (o: boolean) => {
    mb.setAttribute('aria-expanded', String(o)); mm.dataset.open = String(o); label.textContent = o ? 'Close' : 'Menu';
    document.body.style.overflow = o ? 'hidden' : '';
    if (o) { const top = document.querySelector<HTMLElement>('[data-header]')!.getBoundingClientRect().bottom; mm.style.top = top + 'px'; $<HTMLAnchorElement>('a', mm)?.focus(); }
  };
  mb.addEventListener('click', () => set(mb.getAttribute('aria-expanded') !== 'true'));
  document.addEventListener('keydown', (e) => {
    if (mb.getAttribute('aria-expanded') !== 'true') return;
    if (e.key === 'Escape') { set(false); mb.focus(); }
    if (e.key === 'Tab') { // keep focus within header + menu while open
      const f = [mb, ...$$<HTMLElement>('a,button', mm)]; const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  matchMedia('(min-width:1080px)').addEventListener('change', (e) => e.matches && set(false));
}
// Search
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
      ? `<p class="sr-only">${hits.length} results</p>` + hits.map(({ it }) => `<a href="${it.u}"><span class="k">${it.k}</span><br><span class="t">${it.t}</span><br><span class="s">${it.d}</span></a>`).join('')
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
// Reveals
const rv = $$<HTMLElement>('[data-reveal]');
if (rv.length) {
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion:reduce)').matches) rv.forEach((e) => e.classList.add('in'));
  else { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }); rv.forEach((e) => io.observe(e)); }
}
