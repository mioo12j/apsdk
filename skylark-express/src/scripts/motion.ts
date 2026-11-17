// Shared motion preferences: reduced motion, data saver and the visitor's own "Pause animations" choice.
const root = document.documentElement;
const mqReduce = matchMedia('(prefers-reduced-motion:reduce)');
const conn = (navigator as any).connection;
export const saveData = !!conn?.saveData || /(^|-)2g/.test(conn?.effectiveType || '');
export const reduced = () => mqReduce.matches;
/** True when decorative motion may run. */
export const motionOK = () => !mqReduce.matches && root.dataset.motion !== 'off';
/** True when background video may stream. */
export const videoOK = () => motionOK() && !saveData;
export function setMotion(on: boolean) {
  if (on) delete root.dataset.motion; else root.dataset.motion = 'off';
  try { on ? localStorage.removeItem('skylark.motion') : localStorage.setItem('skylark.motion', 'off'); } catch {}
  document.dispatchEvent(new CustomEvent('motionchange', { detail: { on } }));
}
mqReduce.addEventListener?.('change', () => document.dispatchEvent(new CustomEvent('motionchange', { detail: { on: motionOK() } })));
