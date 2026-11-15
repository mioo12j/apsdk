// Branch search + map selection. A map pin, a keyboard selection and a directory row open the same record.
type O = { id: string; city: string; label: string; kind: string; typeLabel: string; region: string; state: string; address?: string; pin?: string; phone?: string; aliases: string[]; tel: string; directions: string };
const raw = document.getElementById('office-data');
if (raw) {
  const data = JSON.parse(raw.textContent!) as { offices: O[]; markers: { id: string; members: string[]; label: string }[] };
  const byId = new Map(data.offices.map((o) => [o.id, o]));
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
  const norm = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  const cardHTML = (o: O, linkToDirectory = false) => `
    <article class="office-card" data-office="${o.id}">
      <p class="tag${o.kind === 'hq' ? ' hq' : ''}">${esc(o.typeLabel)}</p>
      <h3 class="display h-3">${esc(o.label)}</h3>
      ${o.address ? `<p class="addr">${esc(o.address)}</p>` : `<p class="addr muted">City location. Branch details for ${esc(o.city)} are shared by the central team.</p>`}
      <p class="human">
        ${o.kind === 'city'
          ? `<a class="btn btn-primary" href="/contact?topic=branch&city=${encodeURIComponent(o.city)}">Ask the central team for branch details</a><a href="tel:+911141666666">Call +91 11 4166 6666</a>`
          : `<a class="btn btn-primary" href="${o.tel}">Call ${esc(o.phone!)}</a><a href="${o.directions}" rel="noopener" target="_blank">Directions<span class="sr-only"> to ${esc(o.label)} (opens a map in a new tab)</span></a>`}
        ${linkToDirectory ? `<a href="/network#${o.id}">Open in directory</a>` : ''}
      </p>
    </article>`;
  const search = (q: string): O[] => {
    const n = norm(q); if (!n) return [];
    if (/^\d{3,6}$/.test(n)) return data.offices.filter((o) => o.pin && o.pin.startsWith(n));
    const terms = n.split(' ');
    return data.offices.map((o) => {
      const hay = [o.city, o.label, o.region, o.state, o.address || '', ...o.aliases].map(norm);
      let score = 0;
      for (const t of terms) { const exact = hay.some((h) => h === t || h.split(' ').includes(t)); const part = hay.some((h) => h.includes(t)); if (!part) return null; score += exact ? 2 : 1; }
      if (o.kind !== 'city') score += 0.5;
      return { o, score };
    }).filter(Boolean).sort((a: any, b: any) => b.score - a.score).map((x: any) => x.o);
  };
  document.querySelectorAll<HTMLElement>('[data-network]').forEach((root) => {
    const mode = root.dataset.network; // 'full' | 'home'
    const card = root.querySelector<HTMLElement>('[data-office-panel]');
    const live = root.querySelector<HTMLElement>('[data-network-status]');
    const input = root.querySelector<HTMLInputElement>('[data-branch-search]');
    const results = root.querySelector<HTMLElement>('[data-branch-results]');
    const rows = Array.from(root.querySelectorAll<HTMLElement>('[data-row]'));
    const groups = Array.from(root.querySelectorAll<HTMLElement>('[data-group]'));
    const pins = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-pin]'));
    const select = (ids: string[], from: 'pin' | 'row' | 'search', focusCard = false) => {
      const os = ids.map((i) => byId.get(i)!).filter(Boolean);
      pins.forEach((p) => p.setAttribute('aria-pressed', String(p.dataset.pin!.split('+').some((i) => ids.includes(i)))));
      rows.forEach((r) => r.classList.toggle('is-selected', ids.includes(r.dataset.row!)));
      if (card) {
        card.innerHTML = (os.length > 1 ? `<p class="small muted">${os.length} listed locations here. Each opens the same record as its directory row.</p>` : '') + os.map((o) => cardHTML(o, mode === 'home')).join('');
        card.hidden = false;
        if (focusCard) { card.setAttribute('tabindex', '-1'); card.focus({ preventScroll: from !== 'row' }); }
      }
      if (live) live.textContent = os.length === 1 ? `Selected ${os[0].label}, ${os[0].typeLabel}.` : `Selected ${os.length} locations: ${os.map((o) => o.label).join(', ')}.`;
      if (mode === 'full' && from === 'pin' && os.length === 1) history.replaceState(null, '', '#' + os[0].id);
    };
    pins.forEach((p) => p.addEventListener('click', () => select(p.dataset.pin!.split('+'), 'pin', true)));
    root.querySelectorAll<HTMLButtonElement>('[data-show]').forEach((b) => b.addEventListener('click', () => {
      select([b.dataset.show!], 'row');
      const mapEl = root.querySelector<HTMLElement>('[data-map-view]');
      if (mapEl && getComputedStyle(mapEl).display !== 'none') mapEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }));
    if (input) {
      const run = () => {
        const q = input.value.trim();
        if (rows.length) { // full directory: filter in place
          const hit = q ? new Set(search(q).map((o) => o.id)) : null;
          let n = 0; rows.forEach((r) => { const on = !hit || hit.has(r.dataset.row!); r.hidden = !on; if (on) n++; });
          groups.forEach((g) => (g.hidden = !g.querySelector('[data-row]:not([hidden])')));
          const empty = root.querySelector<HTMLElement>('[data-empty]'); if (empty) empty.hidden = n > 0;
          if (live) live.textContent = q ? (n ? `${n} location${n === 1 ? '' : 's'} match “${q}”.` : `No listed location matches “${q}”.`) : '';
          if (hit && hit.size === 1) select([...hit], 'search');
        } else if (results) { // home: short result list
          const os = q ? search(q).slice(0, 4) : [];
          results.innerHTML = q ? (os.length ? os.map((o) => cardHTML(o, true)).join('') : `<div class="notice warn"><p class="notice-h">No listed location matches “${esc(q)}”.</p><p>Ask the central team: <a href="tel:+911141666666">+91 11 4166 6666</a> or <a href="/contact?topic=branch">send a message</a>.</p></div>`) : '';
          if (live) live.textContent = q ? `${os.length} location${os.length === 1 ? '' : 's'} found.` : '';
          if (os.length) select([os[0].id], 'search');
        }
      };
      input.addEventListener('input', run);
      input.form?.addEventListener('submit', (e) => { e.preventDefault(); run(); });
      const qp = new URLSearchParams(location.search).get('q'); if (qp) { input.value = qp; run(); }
    }
    // map / list view toggle (phones default to the directory)
    const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-view-btn]'));
    tabs.forEach((t) => t.addEventListener('click', () => { root.dataset.view = t.dataset.viewBtn!; tabs.forEach((x) => x.setAttribute('aria-pressed', String(x === t))); }));
    if (mode === 'full' && location.hash) { const id = location.hash.slice(1); if (byId.has(id)) select([id], 'row'); }
  });
  // animate maps on entry
  const maps = document.querySelectorAll<HTMLElement>('[data-map][data-anim]');
  if ('IntersectionObserver' in window) { const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add('in'), io.unobserve(e.target))), { threshold: 0.25 }); maps.forEach((m) => io.observe(m)); }
  else maps.forEach((m) => m.classList.add('in'));
}
