// @ts-check
import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  site: 'https://mahadalyusro.sch.id',
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  // Islands are written in React style on Preact (~60 kB lighter). `react`
  // and `react-dom` in package.json are npm aliases of @preact/compat, so
  // shadcn/Radix primitives resolve to Preact at build and in the browser.
  integrations: [preact({ compat: true })],
  vite: {
    plugins: [tailwindcss()],
  },
});
