import type { APIRoute } from 'astro';
import { ORIGIN } from '../data/site';
export const GET: APIRoute = () => {
  const preview = import.meta.env.PUBLIC_SITE_MODE === 'preview';
  const body = preview ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /*?number=\nDisallow: /*?docket=\nDisallow: /*?pin=\n\nSitemap: ${ORIGIN}/sitemap.xml\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
};
