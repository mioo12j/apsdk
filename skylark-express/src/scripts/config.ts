// Runtime view of the integration settings (inlined at build time from src/config/integrations.ts).
import { integrations } from '../config/integrations';
export const cfg = integrations;
export const CENTRAL = { phones: [['+91 11 4166 6666', '+911141666666'], ['+91 84488 99679', '+918448899679']], email: 'info@skylarkexpressdelhi.com', hours: 'Monday–Saturday, 10:00 am–6:00 pm IST' };
export const humanHTML = (lead = 'Speak to our team:') => `<p class="human"><span>${lead}</span>${CENTRAL.phones.map(([d, t]) => `<a href="tel:${t}">${d}</a>`).join('')}<a href="mailto:${CENTRAL.email}">${CENTRAL.email}</a><span class="small muted">${CENTRAL.hours}</span></p>`;
export const esc = (s: string) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
export async function api(url: string, init?: RequestInit, timeout = 12000) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), timeout);
  try { const r = await fetch(url, { ...init, signal: ctl.signal, headers: { Accept: 'application/json', ...(init?.body ? { 'Content-Type': 'application/json' } : {}), ...(init?.headers || {}) } }); const body = await r.json().catch(() => ({})); return { ok: r.ok, status: r.status, body }; }
  finally { clearTimeout(t); }
}
