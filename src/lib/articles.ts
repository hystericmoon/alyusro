import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getCollection, type CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'artikel'>;

const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

/**
 * Title as HTML with the honorifics ﷻ and ﷺ wrapped: as single ligature
 * glyphs they render far larger than the text around them.
 */
export const titleHtml = (t: string) => escapeHtml(t).replace(/[\uFDFA\uFDFB]/g, (m) => `<span class="honorific" lang="ar">${m}</span>`);

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
// Dates are shown in WIB, whatever the build machine's timezone.
export const formatDate = (d: Date) => {
  const w = new Date(d.getTime() + 7 * 3600 * 1000);
  return `${w.getUTCDate()} ${MONTHS[w.getUTCMonth()]} ${w.getUTCFullYear()}`;
};

/** Published articles, newest first. */
export async function getArticles(): Promise<Article[]> {
  const all = await getCollection('artikel', (a) => !a.data.draft);
  return all.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** The label shown above a title: the series, or the category for standalone pieces. */
export const kicker = (a: Article) => a.data.series ?? a.data.category;

/** Cards show the real cover only for photos; posters and missing covers get the designed one. */
export const hasPhotoCover = (a: Article) => !!a.data.cover && !a.data.poster;

/** Filter key: each series is its own filter; everything else is "Kabar ma’had". */
export const NEWS = 'Kabar ma’had';
export const filterKey = (a: Article) => a.data.series ?? NEWS;

/** Older than 12 months at build time (the daily rebuild keeps this current). */
export const isOld = (a: Article, now = new Date()) => now.getTime() - a.data.date.getTime() > 365 * 24 * 3600 * 1000;

/**
 * Up to `n` articles to read next, newest first: the same series, then the
 * same category, then the same filter group, then anything.
 */
export function related(all: Article[], a: Article, n = 3): Article[] {
  const others = all.filter((x) => x.id !== a.id);
  const tiers = [
    (x: Article) => !!a.data.series && x.data.series === a.data.series,
    (x: Article) => x.data.category === a.data.category,
    (x: Article) => filterKey(x) === filterKey(a),
    () => true,
  ];
  const out: Article[] = [];
  for (const t of tiers) for (const x of others) if (out.length < n && !out.includes(x) && t(x)) out.push(x);
  return out;
}

/**
 * Pixel size of an uploaded cover (WebP, from public/), read at build time so
 * the <img> gets width and height and the page does not shift as it loads.
 */
export function coverSize(src: string): { width: number; height: number } | null {
  try {
    const b = readFileSync(join(process.cwd(), 'public', src));
    if (b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') return null;
    const chunk = b.toString('ascii', 12, 16);
    if (chunk === 'VP8X') return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) };
    if (chunk === 'VP8L') {
      const bits = b.readUInt32LE(21);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
    if (chunk === 'VP8 ') return { width: b.readUInt16LE(26) & 0x3fff, height: b.readUInt16LE(28) & 0x3fff };
  } catch {
    // Missing or unreadable file: render without dimensions.
  }
  return null;
}

/**
 * srcset for an uploaded cover: the 480 and 800 px copies that
 * scripts/cover-variants.mjs wrote before the build (only those that exist),
 * plus the original at its own width.
 */
export function coverSrcset(src: string, width?: number): string | undefined {
  const m = /^\/uploads\/artikel\/([^/]+\.webp)$/.exec(src);
  if (!m || !width) return undefined;
  const parts = [480, 800]
    .filter((w) => w < width && existsSync(join(process.cwd(), 'public/uploads/artikel/_w', String(w), m[1]!)))
    .map((w) => `/uploads/artikel/_w/${w}/${m[1]} ${w}w`);
  return parts.length ? [...parts, `${src} ${width}w`].join(', ') : undefined;
}

/** The 800 px copy of an uploaded cover, if the prebuild step wrote one. */
export function coverPhoneSrc(src: string): string | undefined {
  const m = /^\/uploads\/artikel\/([^/]+\.webp)$/.exec(src);
  return m && existsSync(join(process.cwd(), 'public/uploads/artikel/_w/800', m[1]!)) ? `/uploads/artikel/_w/800/${m[1]}` : undefined;
}

/**
 * Background of the designed cover: one tone per series, so a series is
 * recognisable on cards. Series take the tones in the order they started
 * (oldest first), so adding articles never changes an existing series' tone.
 * Standalone articles use the school navy.
 */
const TONES = ['bg-sky-600', 'bg-ink', 'bg-sky-dawn', 'bg-sky-500', 'bg-lapis-deep'];
export function coverTone(a: Article, all: Article[]): string {
  if (!a.data.series) return 'bg-lapis';
  const order = [...all].sort((x, y) => x.data.date.getTime() - y.data.date.getTime()).map((x) => x.data.series);
  const series = [...new Set(order.filter(Boolean))];
  return TONES[series.indexOf(a.data.series) % TONES.length]!;
}

/** Previous and next part in the same series, by part number. */
export function seriesNeighbours(all: Article[], a: Article) {
  if (!a.data.series || !a.data.part) return { prev: undefined, next: undefined };
  const parts = all.filter((x) => x.data.series === a.data.series && x.data.part).sort((x, y) => x.data.part! - y.data.part!);
  const i = parts.findIndex((x) => x.id === a.id);
  return { prev: parts[i - 1], next: parts[i + 1] };
}
