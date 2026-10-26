import { getEntry } from 'astro:content';
import { site, numberWord } from './site';

// Markdown pages can quote content/site.json instead of copying values:
// {{halaqah.ideal}} becomes "delapan". Unknown keys stay as typed, so a typo
// shows on the page instead of silently disappearing.
const VALUES: Record<string, string> = {
  'halaqah.ideal': numberWord(site.school.halaqahRatio.ideal),
  'halaqah.max': numberWord(site.school.halaqahRatio.max),
  'sekolah.nama': site.school.name,
  'sekolah.alamat': site.school.address,
  whatsapp: site.school.whatsapp.display,
};
const fill = (html: string) => html.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (m, key: string) => VALUES[key] ?? m);

const strip = (s: string) => s.replace(/<[^>]+>/g, '').trim();
/**
 * Markdown tables get what TableScroll.astro gives every other table: a
 * caption (the nearest heading above, for screen readers) and a focusable
 * region that scrolls sideways on narrow screens.
 */
function wrapTables(html: string, id: string) {
  let n = 0;
  return html.replace(/<table>([\s\S]*?)<\/table>/g, (table, inner: string, offset: number) => {
    const before = html.slice(0, offset);
    const heading = [...before.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/g)].at(-1)?.[1];
    const cap = `cap-${id}-${++n}`;
    const caption = `<caption id="${cap}" class="sr-only">${heading ? strip(heading) : 'Tabel'}</caption>`;
    return `<div role="region" tabindex="0" aria-labelledby="${cap}" class="table-scroll scroll-cue"><table>${caption}${inner}</table></div>`;
  });
}

/** A content page's HTML (values filled in) and its h2 headings for the table of contents. */
export async function getHalaman(id: string) {
  const entry = await getEntry('halaman', id);
  if (!entry) throw new Error(`Missing src/content/halaman/${id}.md`);
  const rendered = entry.rendered;
  const headings = ((rendered?.metadata?.headings ?? []) as { depth: number; slug: string; text: string }[])
    .filter((h) => h.depth === 2)
    .map((h) => ({ id: h.slug, text: h.text }));
  return { data: entry.data, html: wrapTables(fill(rendered?.html ?? ''), id), headings };
}
