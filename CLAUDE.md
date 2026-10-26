# Al Yusro website rebuild

A volunteer redesign of https://mahadalyusro.sch.id (Ma’had Tahfizh Al Yusro, a tahfizh pesantren in Tenjolaya, Bogor), built as a working preview to offer the school for free. Audience: parents choosing a level for their child, mostly on phones. All site copy is Indonesian.

## Goal of this repo

A clickable, deployable static preview of the whole public site, built from the designs in `design/`, with real content from `content/site.json`. It must be easy for the school’s small IT & Multimedia team to adopt later.

Not in scope: the login dashboard and the registration system. Those stay on the school’s existing Laravel system. Link to them by their current URLs. Articles move to this repo (see Stack).

## Stack

- Astro, static output, no UI framework and no component library. Interactive parts are native HTML plus a small script beside the component, so each maps cleanly to a Laravel Blade partial (header, footer, juz map, day view, level page, fee table).
  - Filter chips: `<button aria-pressed>` + a few lines of script (juz map, article and facility filters).
  - FAQ: native `<details>`. Desktop menus (1280px and up): `<details name>` disclosures, plus a few lines of script beside `SiteHeader.astro` so Escape (focus back to the summary) and a click outside close them; without the script they still open and close on click.
  - Mobile menu (below 1280px, where the header no longer fits one row): native Popover API (`popovertarget`), no JS.
  - Every non-interactive page ships zero client JS.
- The live day view is a small script (`src/components/home/DayView.astro`) sharing its logic with the build in `src/lib/day-view.ts`.
- Tailwind v4, themed in `src/styles/global.css` with `--*: initial`, so only the tokens below exist (colors, fonts, radius, font sizes named by pixel value, spacing at 1px per step: `p-24` is 24px). Extra fills the designs use are listed there as derived tokens. Buttons are shared classes: `btn-primary`, `btn-secondary`, `btn-light`, `btn-ghost-night`.
- Motion: GSAP for at most three moments: the juz map fills in class order (VII to XI) when it scrolls into view, the level terraces rise in sequence, and the day-view "now" line animates to the current time. GSAP loads only when motion is allowed. Everything else is CSS: micro-interactions (button press, chip preview, terrace lift), the living sky (sun position and sky tint follow the time in Bogor), and night stars in the day view. With `prefers-reduced-motion`, show the final state with no animation.
- Articles: Astro content collection in `src/content/artikel/` (Markdown), edited by school staff through Sveltia CMS at `/admin`. Login, registration and PSB forms stay on the school's Laravel system.
- Deploy target: Netlify (`netlify.toml`; build `npm run build`, output `dist`, Node 22 via `.nvmrc` and `engines`). Headers and redirects live in `public/_headers` and `public/_redirects`. Cloudflare Pages also works (`wrangler.toml`) but cannot proxy `/dashboard` to Laravel later, so Netlify is the chosen host. The preview is `noindex` until the school switches over.

## Source files

- `design/*.dc.html`: approved designs. They use a template syntax (`{{hole}}`, `<sc-for>`, `<sc-if>`, `<x-dc>`, `<helmet>`, a `DCLogic` class in a script). Treat them as visual and markup specs. Convert holes and loops into Astro props and `.map()`, move logic into small scripts. Keep the markup, spacing, type, colors, and accessibility attributes as designed.
- `design/Peta-situs.dc.html`: the site map and content inventory. It is the page list for this build.
- `content/site.json`: single source of truth for levels, fees, PSB waves, FAQ, schedule, staff, academic calendar, contact. Pages must read from it; never hard-code a fee, date, or target in a page. It holds only known values: anything unknown is left out, not filled with a placeholder. `known()` in `src/lib/site.ts` treats a missing, empty or `[bracketed]` value as unknown, so no bracket ever reaches a page.
- `content/prestasi.json`: achievements with students' full names (the school consented in October 2026). `content/fasilitas.json`: facility photos with alt text and captions.
- `src/content/artikel/*.md`: articles (migrated from the old site with students' full names and the original cover photos; articles without a cover image, and on cards those whose cover is a poster or flyer (`poster: true`), get a designed cover: series or category, part number, khatam star, one tone per series). `src/content/halaman/*.md`: prose for content pages; they can quote site.json with `{{halaqah.ideal}}` etc. (see `src/lib/halaman.ts`). Both are editable in Sveltia CMS at `/admin`.

## Pages and URLs

Keep the current site’s URLs so links and search rankings survive:

- `/` homepage: `Beranda-gabungan` (hafalan map hero, “Sehari di Al Yusro” day view, levels as terraces, Gunung Salak landscape footer). Exactly four sections.
- `/jenjang/pendidikan/{taud,kuttab,mahdon,madrasah,darul-ilmi}` and `/mahad-aly`: one template, `Jenjang-template`.
- `/psb`: `Pendaftaran` hub.
- `/kurikulum/tahfizh`: `Kurikulum-tahfizh` content page. Same template for `/kurikulum/bahasa-arab`, `/tentang` (new), `/sehari-di-mahad` (new); leave out anything the school has not published.
- `/artikel` and an article detail route: `Artikel`, `Artikel-detail`.
- `/fasilitas`: `Fasilitas`.
- `/prestasi`, `/kalender-akademik`, `/info/kajian`, `/pendidikan/tenaga/pendidik`: build with the content-page or list templates. Prestasi shows totals by competition and year, then the full list by name and year.
- `/jadwal/shalat` (today and the month, Kemenag times via myquran with the build-time calculation as fallback) and `/konversi/nama` (Latin-to-Arabic names in the browser, `src/lib/nama-arab.ts`: dictionary first, then by sound). Both replace the Laravel pages.
- `/404`: designed not-found page (levels, `/psb`, WhatsApp).
- The closing call to action on content and conversion pages is the Gunung Salak landscape (`Landscape.astro`): headline, "Daftar santri baru", and a "Mulai dari sini" panel (WhatsApp, `/psb`, map). Content pages end with a "Selanjutnya" link above it, not a second dark band. Utility pages (`/jadwal/shalat`, `/konversi/nama`, `/kalender-akademik`, `/info/kajian`, 404) close with the compact `ClosingBand.astro` (one line, WhatsApp, "Daftar santri baru").
- Interior pages open with `PageHeader.astro` (breadcrumb, h1, intro, optional photo; without a photo a tinted band with the juz-cell motif). Long-form text uses the one `.prose` class (articles and content pages). Every data table sits in `TableScroll.astro` (focusable region named by its caption; `sticky` keeps the first column in view on phones). Photos use `Photo.astro` (800/1600 WebP, 1600 JPG fallback).
- Every “Daftar” button goes to `psb.registerUrls` in `site.json` (`/dashboard/register`, or `/psbmahadaly` for Ma’had ‘Aly).

## Low-maintenance rules (the school has little staff time)

- One source for anything dated or priced: `site.json`.
- Time-sensitive blocks hide themselves when stale: past PSB waves disappear; a level with no future wave shows “Pendaftaran belum dibuka” and links to the WhatsApp info group.
- Missing data is left out of the layout: no placeholder, no “belum dipublikasikan” or “segera diumumkan” state, no empty box, no blank label. A level without fees has no Biaya section; a level without wave dates has no wave table; a column with no values is dropped.
- Articles older than 12 months show the notice from `Artikel-detail`.
- Prayer times come from the same Kemenag/myquran API the current `/jadwal/shalat` uses (Kab. Bogor). The client-side calculation in the design is a fallback only.

## Design system

- Type: Manrope for body, UI and headings, self-hosted in `public/fonts` (headings use the "Manrope Display" face with `size-adjust: 74%`, because the heading scale was drawn for the narrower Markazi Text; both faces have width-matched fallbacks). Arabic: Almarai Bold for names, labels and headings (`:lang(ar)`, ExtraBold when set as a heading); Noto Naskh Arabic for Arabic in article bodies (ayat, hadith, du'a) and the honorifics ﷺ ﷻ. Almarai and Noto Naskh load from Google Fonts, linked at the end of `<body>` so they never block the first paint.
- Colors (the school's own; token names `lapis`/`amber` kept from the design so markup does not change):
  - Neutrals: paper `#F7F7F4`, white `#FFFFFF`, ink `#1B2235`, body text `#2C3448`, muted `#4A5368`, rule `#D9DCE4`.
  - `lapis` = school navy `#073E6B` (from mahadalyusro.sch.id): primary buttons, links, active states, focus ring. `lapis-deep` `#052D4F` (derived: button hover/press).
  - Juz map scale `lapis-1..5`: `#DEEAF6 #9CC1DF #629DCB #1C71B3 #073E6B`, pale tint to navy through the logo blue `#1C71B3` (step 4, exact). Neighbouring steps differ by at least 1.5:1.
  - `amber` = logo gold `#E3AF14`, used only for time (the “now” line, the sun, the next prayer). `amber-edge` `#7A5C00` (derived: 1px edge so the gold keeps 3:1 on light fills). No gold anywhere else.
  - `sky-*` (terraces, day-view blocks and bands) are derived on the navy's hue: `#E3EDF7 #C4D9EE #9EC0E2`, dawn `#2A5E96`, `#1C71B3`, `#125891`.
  - Logo: `public/logo.svg` (full lockup), `public/logo-mark.svg` (emblem, header mark), `public/favicon.png` rendered from the emblem.
- Shape: pill buttons and filter chips; 10px cells and small blocks, 16px cards, 22–28px panels and photos (tokens in `global.css`).
- No thin rules or 1px outlined boxes. Separate with space, a tone step (`.card` is white on paper; paper on white sections) or striped table rows (`--stripe`). The only lines left are the day-view timeline's hour and prayer gridlines (a chart).
- Frosted glass (`.glass`, `.glass-paper`, `.glass-night`, the CTA panel) only where something sits behind it: the sky and campus photo, the night sections, sticky bars and menus. Each fill is opaque enough for AA over whatever is behind, with a solid fallback.
- Photos: the school's own, from its Instagram (@mahadtahfizhalyusro), in `public/photos` as 800 and 1600 px WebP. The school consented (October 2026) to student photos from its Instagram and to students' full names. Every photo needs real Indonesian alt text; level pages take an optional `photo` in `site.json`.

## Accessibility (must keep)

- WCAG 2.2 AA contrast on every text pair (all design pairs were checked).
- Touch targets at least 44px. Visible focus ring that works on light and dark backgrounds.
- Arabic text in `lang="ar" dir="rtl"`. Juz map has a text `aria-label`; class buttons use `aria-pressed`.
- Live day view updates without `aria-live` (no announcements every 30 seconds). Selection readouts may use `aria-live="polite"`.
- Real `<table>` elements for fees, waves, and schedules. Breadcrumbs with `aria-current="page"`.
- Every image needs real alt text. The current site ships “Deskripsi Gambar” and empty alts; do not repeat that.

## No new content from the school

This is an independent preview, built without the school's involvement, so no further content will come from it. Build only from what is already published (the old site, its Instagram, `content/*.json`, the migrated articles). Never invent facts, dates, fees or names, and don't add placeholders or "content needed" states waiting for the school. Known gaps that stay out of the site: PSB year and wave dates, Madrasah SPP period, Mahdhon program length and fee year, TAUD and Mahdhon heads, school-lesson hours in the day view, Sunday activities, kajian times and themes, Ma’had ‘Aly registration status, next year's academic calendar.

## Status

Done: homepage, six level pages, `/psb`, `/artikel` and 78 migrated articles, `/kurikulum/tahfizh`, `/kurikulum/bahasa-arab`, `/tentang`, `/sehari-di-mahad`, `/info/kajian`, `/kalender-akademik`, `/pendidikan/tenaga/pendidik`, `/prestasi`, `/fasilitas`, `/jadwal/shalat`, `/konversi/nama`, 404, Sveltia CMS for articles, page prose and `site.json` (every key declared in `public/admin/config.yml`; `scripts/check-site.mjs` runs as `prebuild` and stops a deploy if a save leaves a required value missing).

Next (dashboard settings, not code): CMS sign-in and the daily rebuild hook (`DEPLOY_HOOK_URL` secret); turn off Netlify's "Powered by Netlify" badge.
