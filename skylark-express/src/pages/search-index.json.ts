import type { APIRoute } from 'astro';
import { pages } from '../data/site';
import { services } from '../data/services';
import { offices } from '../data/offices';
import { faqs } from '../data/faqs';
import { industries } from '../data/industries';
import { roles } from '../data/careers';
export const GET: APIRoute = () => {
  const items = [
    ...pages.filter((p) => !p.href.startsWith('/services/')).map((p) => ({ k: 'Page', t: p.title, d: p.desc, u: p.href })),
    ...services.map((s) => ({ k: 'Service', t: s.name, d: s.summary, u: `/services/${s.slug}`, x: [s.selector, s.short, ...s.suits, ...s.spec.flat(), ...(s.categories?.map((c) => c.name) ?? []), s.slug === 'road-logistics' ? 'ftl ptl full truck load part truck load partial load' : '', s.slug === 'project-cargo' ? 'odc over dimensional oversized heavy machinery' : ''].join(' ') })),
    ...industries.map((i) => ({ k: 'Industry', t: i.name, d: i.concern, u: `/industries#${i.id}`, x: i.paragraphs.join(' ') + (i.id === 'healthcare-pharma' ? ' cold chain temperature vaccine medicine' : '') })),
    ...offices.map((o) => ({ k: o.kind === 'city' ? 'Listed city' : o.typeLabel, t: o.label, d: o.address ?? `${o.state}. Ask the central team for branch details.`, u: `/network#${o.id}`, x: [...o.aliases, o.region, o.state, o.pin ?? ''].join(' ') })),
    ...faqs.map((f) => ({ k: 'Help', t: f.q, d: f.a.slice(0, 130) + '…', u: `/help#${f.id}`, x: f.a + ' ' + f.topic })),
    ...roles.filter((r) => r.status === 'open').map((r) => ({ k: 'Role', t: `${r.title}, ${r.city}`, d: r.summary, u: `/careers/${r.slug}`, x: 'job vacancy career ' + r.team })),
  ];
  return new Response(JSON.stringify(items), { headers: { 'Content-Type': 'application/json' } });
};
