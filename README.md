# Al Yusro website preview

Static Astro rebuild of mahadalyusro.sch.id. See `CLAUDE.md` for scope, stack and rules.

- `npm install`, then `npm run dev` (Node 22.12+)
- `npm run build` writes the static site to `dist/`
- Designs: `design/*.dc.html`. Content: `content/site.json` (single source of truth)
- Deploys on Netlify (`netlify.toml`); Cloudflare Pages also works (build `npm run build`, output `dist`)

## Editing articles (Sveltia CMS)

Staff edit articles at `/admin` on the deployed site. Saving commits a Markdown file to `src/content/artikel/` on GitHub, and the host rebuilds the site.

1. Each editor needs a GitHub account with write access to this repository.
2. Sign in on `/admin` with "Sign in with token", using a GitHub fine-grained personal access token limited to this repository (Contents: read and write).
3. For one-click GitHub login instead, deploy the free Sveltia CMS Authenticator to Cloudflare Workers and set its URL as `base_url` in `public/admin/config.yml`.

The CMS commits to `main`, so the host should deploy from `main`.

## Daily rebuild

Dated content (PSB waves, the academic calendar, the article age notice, today's date on `/jadwal/shalat`) is fixed at build time, so the site rebuilds every night at 00:07 WIB (`.github/workflows/daily-rebuild.yml`). Until the hook is set up, each run shows a "Daily rebuild skipped" warning.

1. In Netlify: Site configuration > Build & deploy > Build hooks > Add build hook, branch `main`. Copy the URL.
2. In GitHub: Settings > Secrets and variables > Actions > New repository secret, name `DEPLOY_HOOK_URL`, value the URL.
3. Check it: Actions > Daily rebuild > Run workflow. A new deploy should appear in Netlify within a minute.

## Search engines

Preview deploys send `noindex` and a closed `robots.txt`, so they don't compete with the live site. When this becomes the real site, set the environment variable `PUBLIC_INDEXABLE=true` on the host.
