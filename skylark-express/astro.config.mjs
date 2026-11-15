import { defineConfig } from 'astro/config';

// The production origin is used ONLY to generate canonical URLs, social metadata,
// structured data and the sitemap. Every asset is served locally from this build.
export default defineConfig({
  site: 'https://www.skylarkexpressdelhi.com',
  trailingSlash: 'ignore',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  compressHTML: true,
  prefetch: false,
  image: { service: { entrypoint: 'astro/assets/services/sharp' } },
  vite: { build: { cssMinify: true } },
});
