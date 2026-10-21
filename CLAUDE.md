# Al Yusro website rebuild

A volunteer redesign of https://mahadalyusro.sch.id (Ma’had Tahfizh Al Yusro, a tahfizh pesantren in Tenjolaya, Bogor), built as a working preview to offer the school for free. Audience: parents choosing a level for their child, mostly on phones. All site copy is Indonesian.

## Goal of this repo

A clickable, deployable static preview of the whole public site, built from the designs in `design/`, with real content from `content/site.json`. It must be easy for the school’s small IT & Multimedia team to adopt later.

Not in scope: the login dashboard, the registration system, the article CMS. Those stay on the school’s existing Laravel system. Link to them by their current URLs.

## Stack

- Astro, static output. Islands (written React-style, running on Preact via `@astrojs/preact` with compat; `react`/`react-dom` in package.json are npm aliases of `@preact/compat`) only for interactive components: juz map class filter, article and facility filters, FAQ, mobile menu. Every non-interactive page ships zero client JS (desktop header menus are native `<details>`; the mobile menu island hydrates with `client:media` below 1024px only).
- The live day view is a small vanilla script (`src/components/home/DayView.astro`), sharing its logic with the build in `src/lib/day-view.ts`.
- shadcn/ui primitives for those islands, in `src/components/ui/`, restyled entirely with the tokens below. Radix 1.2 Dialog does not run on preact/compat, so `Sheet` keeps the shadcn API but uses the native `<dialog>`; Radix Toggle works as is. No shadcn default theme, colors, radius or fonts. `cn()` is clsx only (no tailwind-merge, to keep islands small).
- Tailwind v4, themed in `src/styles/global.css` with `--*: initial`, so only the tokens below exist (colors, fonts, radius, font sizes named by pixel value, spacing at 1px per step: `p-24` is 24px). Extra fills the designs use are listed there as derived tokens.
- GSAP for at most three motion moments: the juz map fills in class order (VII to XI) when it scrolls into view, the level terraces rise in sequence, and the day-view "now" line animates to the current time. GSAP is loaded only when motion is allowed. With `prefers-reduced-motion`, show the final state with no animation.
- Components should map cleanly to Laravel Blade partials later (header, footer, juz map, day view, level page, fee table).
- Deploy target: Cloudflare Pages or Netlify (`netlify.toml`, `wrangler.toml`; build `npm run build`, output `dist`, Node 22 via `.nvmrc`).

## Source files

- `design/*.dc.html`: approved designs. They use a template syntax (`{{hole}}`, `<sc-for>`, `<sc-if>`, `<x-dc>`, `<helmet>`, a `DCLogic` class in a script). Treat them as visual and markup specs. Convert holes and loops into Astro props and `.map()`, move logic into small scripts. Keep the markup, spacing, type, colors, and accessibility attributes as designed.
- `design/Peta-situs.dc.html`: the site map and content inventory. It is the page list for this build.
- `content/site.json`: single source of truth for levels, fees, PSB waves, schedule, contact. Pages must read from it; never hard-code a fee, date, or target in a page.

## Pages and URLs

Keep the current site’s URLs so links and search rankings survive:

- `/` homepage: `Beranda-gabungan` (hafalan map hero, “Sehari di Al Yusro” day view, levels as terraces, Gunung Salak landscape footer). Exactly four sections.
- `/jenjang/pendidikan/{taud,kuttab,mahdon,madrasah,darul-ilmi}` and `/mahad-aly`: one template, `Jenjang-template`.
- `/psb`: `Pendaftaran` hub.
- `/kurikulum/tahfizh`: `Kurikulum-tahfizh` content page. Same template for `/kurikulum/bahasa-arab`, `/tentang` (new), `/sehari-di-mahad` (new); use clearly marked placeholder content where the school has none.
- `/artikel` and an article detail route: `Artikel`, `Artikel-detail`.
- `/fasilitas`: `Fasilitas`.
- `/prestasi`, `/kalender-akademik`, `/info/kajian`, `/pendidikan/tenaga/pendidik`: build with the content-page or list templates. Prestasi shows totals by competition and year; do not publish students’ full names without the school’s consent.
- `/jadwal/shalat` and `/konversi/nama`: link out to the existing pages for now.
- Every “Daftar” button goes to `psb.registerUrls` in `site.json` (`/dashboard/register`, or `/psbmahadaly` for Ma’had ‘Aly).

## Low-maintenance rules (the school has little staff time)

- One source for anything dated or priced: `site.json`.
- Time-sensitive blocks hide themselves when stale: past PSB waves disappear; a level with no future wave shows “Pendaftaran belum dibuka” and links to the WhatsApp info group.
- Missing data gets a designed empty state (e.g. “Rincian biaya belum dipublikasikan” + WhatsApp button), never a blank label.
- Articles older than 12 months show the notice from `Artikel-detail`.
- Prayer times come from the same Kemenag/myquran API the current `/jadwal/shalat` uses (Kab. Bogor). The client-side calculation in the design is a fallback only.

## Design system

- Type: Markazi Text (headings, Arabic) + Atkinson Hyperlegible Next (body, UI), Google Fonts.
- Colors: paper `#F7F7F4`, white `#FFFFFF`, ink `#1B2235`, body text `#2C3448`, muted `#4A5368`, rule `#D9DCE4`, lapis `#26418F`. Lapis scale for the juz map: `#DCE3F3 #B7C6E9 #8DA3D9 #4F6DB8 #26418F`. Amber `#F2A33A` is used only for time (the “now” line, the sun).
- Radius 2px on buttons and cells, 4–6px on panels. No photos of faces; photo slots are placeholders until the school supplies images and confirms its imagery policy.

## Accessibility (must keep)

- WCAG 2.2 AA contrast on every text pair (all design pairs were checked).
- Touch targets at least 44px. Visible focus ring that works on light and dark backgrounds.
- Arabic text in `lang="ar" dir="rtl"`. Juz map has a text `aria-label`; class buttons use `aria-pressed`.
- Live day view updates without `aria-live` (no announcements every 30 seconds). Selection readouts may use `aria-live="polite"`.
- Real `<table>` elements for fees, waves, and schedules. Breadcrumbs with `aria-current="page"`.
- Every image needs real alt text. The current site ships “Deskripsi Gambar” and empty alts; do not repeat that.

## Placeholders to confirm with the school

Bracketed values in `site.json` and the designs: PSB year and wave dates, SPP period, Mahdhon program length, TAUD and Mahdhon heads, school hours in the day view, Sunday activities, kajian times, Ma’had ‘Aly registration status, Madrasah target (20 vs 30 juz), Arabic spelling of the school name, logo file, photos.

## First steps

1. Scaffold Astro, add fonts and CSS tokens, build header and footer from `Beranda-gabungan`.
2. Build the homepage to match the design at 1440px and 390px.
3. Build the level template driven by `site.json`, generate all six level pages.
4. Then `/psb`, content pages, articles, facilities.
5. Deploy a preview and share the link.
