import { getCollection, type CollectionEntry } from 'astro:content';

export type Article = CollectionEntry<'artikel'>;

const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

/**
 * Title as HTML with the honorifics ﷻ and ﷺ wrapped: as single ligature
 * glyphs they render far larger than the text around them in Markazi.
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

/** Filter key: each series is its own filter; everything else is "Kabar ma’had". */
export const NEWS = 'Kabar ma’had';
export const filterKey = (a: Article) => a.data.series ?? NEWS;

/** Older than 12 months at build time (the daily rebuild keeps this current). */
export const isOld = (a: Article, now = new Date()) => now.getTime() - a.data.date.getTime() > 365 * 24 * 3600 * 1000;

/** Up to `n` articles to read next: same series first, then same filter group, newest first. */
export function related(all: Article[], a: Article, n = 3): Article[] {
  const others = all.filter((x) => x.id !== a.id);
  const same = others.filter((x) => filterKey(x) === filterKey(a));
  return [...same, ...others.filter((x) => !same.includes(x))].slice(0, n);
}

/** Previous and next part in the same series, by part number. */
export function seriesNeighbours(all: Article[], a: Article) {
  if (!a.data.series || !a.data.part) return { prev: undefined, next: undefined };
  const parts = all.filter((x) => x.data.series === a.data.series && x.data.part).sort((x, y) => x.data.part! - y.data.part!);
  const i = parts.findIndex((x) => x.id === a.id);
  return { prev: parts[i - 1], next: parts[i + 1] };
}
