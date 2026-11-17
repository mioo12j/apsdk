// Film player: loads the selected rendition only after a play action; releases the decoder on close.
const dlg = document.querySelector<HTMLDialogElement>('[data-film]');
if (dlg) {
  const v = dlg.querySelector<HTMLVideoElement>('[data-film-video]')!;
  const q = <T extends HTMLElement>(s: string) => dlg.querySelector<T>(s)!;
  const toggle = q<HTMLButtonElement>('[data-film-toggle]'), mute = q<HTMLButtonElement>('[data-film-mute]'), cc = q<HTMLButtonElement>('[data-film-cc]');
  const seek = q<HTMLInputElement>('[data-film-seek]'), time = q('[data-film-time]');
  let opener: HTMLElement | null = null;
  const pick = () => {
    const c = (navigator as any).connection; const save = c?.saveData || /2g/.test(c?.effectiveType || '');
    const portrait = innerHeight > innerWidth && innerWidth < 820;
    if (portrait) return '/media/the-handover-portrait-720x1280.mp4';
    return save || innerWidth * devicePixelRatio < 1500 ? '/media/the-handover-720p.mp4' : '/media/the-handover-1080p.mp4';
  };
  const fmt = (s: number) => `0:${String(Math.floor(s)).padStart(2, '0')}`;
  const sync = () => {
    toggle.textContent = v.paused ? (v.ended ? 'Play again' : 'Play') : 'Pause'; toggle.setAttribute('aria-label', toggle.textContent!);
    mute.textContent = v.muted ? 'Sound off' : 'Sound on'; mute.setAttribute('aria-pressed', String(!v.muted));
  };
  const open = (el: HTMLElement) => {
    opener = el; dlg.showModal(); const sound = el.hasAttribute('data-film-sound');
    if (!v.querySelector('track')) { const t = document.createElement('track'); t.kind = 'captions'; t.srclang = 'en'; t.label = 'English'; t.src = '/media/the-handover.en.vtt'; t.default = true; v.append(t); } // captions are fetched with the film, not before
    v.muted = !sound; v.src = pick(); v.load(); v.play().catch(() => { v.muted = true; v.play().catch(() => {}); }); sync(); toggle.focus();
  };
  const close = () => { v.pause(); v.removeAttribute('src'); v.load(); seek.value = '0'; time.textContent = '0:00 / 0:42'; opener?.focus(); };
  document.querySelectorAll<HTMLElement>('[data-film-open]').forEach((b) => b.addEventListener('click', () => open(b)));
  q('[data-film-close]').addEventListener('click', () => dlg.close());
  dlg.addEventListener('close', close);
  toggle.addEventListener('click', () => (v.paused ? v.play() : v.pause()));
  q('[data-film-replay]').addEventListener('click', () => { v.currentTime = 0; v.play(); });
  mute.addEventListener('click', () => { v.muted = !v.muted; sync(); });
  cc.addEventListener('click', () => { const t = v.textTracks[0]; if (!t) return; const on = t.mode !== 'showing'; t.mode = on ? 'showing' : 'hidden'; cc.setAttribute('aria-pressed', String(on)); });
  seek.addEventListener('input', () => { v.currentTime = +seek.value; });
  v.addEventListener('timeupdate', () => { seek.value = String(v.currentTime); time.textContent = `${fmt(v.currentTime)} / 0:42`; });
  ['play', 'pause', 'ended', 'volumechange'].forEach((e) => v.addEventListener(e, sync));
  v.addEventListener('click', () => (v.paused ? v.play() : v.pause()));
  dlg.addEventListener('keydown', (e) => {
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'BUTTON' && e.key === ' ') return;
    if (e.key === ' ' || e.key === 'k') { e.preventDefault(); v.paused ? v.play() : v.pause(); }
    if (e.key === 'm') { v.muted = !v.muted; sync(); }
    if (e.key === 'c') cc.click();
    if (e.key === 'ArrowRight') v.currentTime = Math.min(42, v.currentTime + 5);
    if (e.key === 'ArrowLeft') v.currentTime = Math.max(0, v.currentTime - 5);
  });
}
