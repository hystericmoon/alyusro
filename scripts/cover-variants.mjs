// Runs before every build (npm "prebuild"): smaller copies of the article
// covers uploaded through the CMS (public/uploads/artikel), so cards and
// phones don't download the full poster. Writes 480 and 800 px wide WebP
// files to public/uploads/artikel/_w/{width}/ (gitignored, rebuilt on every
// deploy); ArticleCover.astro adds a srcset only for variants that exist.
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import sharp from 'sharp';

const dir = new URL('../public/uploads/artikel/', import.meta.url).pathname;
const WIDTHS = [480, 800];
let made = 0;
for (const name of readdirSync(dir).filter((f) => f.endsWith('.webp'))) {
  const src = join(dir, name);
  const { width = 0 } = await sharp(src).metadata();
  for (const w of WIDTHS) {
    if (width <= w) continue;
    const out = join(dir, '_w', String(w), name);
    if (existsSync(out) && statSync(out).mtimeMs >= statSync(src).mtimeMs) continue;
    mkdirSync(join(dir, '_w', String(w)), { recursive: true });
    await sharp(src).resize({ width: w }).webp({ quality: 78 }).toFile(out);
    made++;
  }
}
console.log(`cover-variants: ${made} new file(s)`);
