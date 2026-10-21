# Al Yusro website preview

Static Astro rebuild of mahadalyusro.sch.id. See `CLAUDE.md` for scope, stack and rules.

- `npm install`, then `npm run dev` (Node 22.12+)
- `npm run build` writes the static site to `dist/`
- Designs: `design/*.dc.html`. Content: `content/site.json` (single source of truth)
- Deploys on Netlify (`netlify.toml`) or Cloudflare Pages (build `npm run build`, output `dist`)
