// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Plain Astro: no UI framework. Interactive bits are small scripts next to
// the component that needs them, so each one maps cleanly to a Blade partial.
export default defineConfig({
  output: 'static',
  // Absolute URLs (canonical, share images) follow where the site is deployed:
  // Netlify sets URL at build time; SITE_URL overrides it; the school's domain
  // is the fallback for local builds.
  site: process.env.SITE_URL || process.env.URL || 'https://mahadalyusro.sch.id',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  vite: { plugins: [tailwindcss()] },
});
