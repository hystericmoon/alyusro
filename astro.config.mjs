// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// Plain Astro: no UI framework. Interactive bits are small scripts next to
// the component that needs them, so each one maps cleanly to a Blade partial.
export default defineConfig({
  output: 'static',
  site: 'https://mahadalyusro.sch.id',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  vite: { plugins: [tailwindcss()] },
});
