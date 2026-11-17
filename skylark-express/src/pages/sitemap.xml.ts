import type { APIRoute } from 'astro';
import { pages, ORIGIN } from '../data/site';
import { roles } from '../data/careers';
// Canonical URLs only. Private tracking results, POD documents and query strings are never listed.
export const GET: APIRoute = () => {
  const today = new Date().toISOString().slice(0, 10);
  const pri = (u: string) => (u === '/' ? '1.0' : u.startsWith('/services') || u === '/track' || u === '/quote' ? '0.9' : u.startsWith('/careers/') || u === '/privacy' || u === '/terms' ? '0.4' : '0.7');
  const urls = [...pages.map((p) => p.href), ...roles.filter((r) => r.status === 'open').map((r) => `/careers/${r.slug}`)];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${ORIGIN}${u === '/' ? '/' : u}</loc><lastmod>${today}</lastmod><priority>${pri(u)}</priority></url>`).join('\n')}\n</urlset>\n`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
