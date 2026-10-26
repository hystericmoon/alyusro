import data from '../../content/prestasi.json';

export type Record = { name: string; rank: string; competition: string; level: string; organizer: string; year: number | string };
export const records = data.records as Record[];

/** Competition family, by keywords. Anything unmatched counts as "Lomba lainnya". */
export function family(c: string): string {
  const s = c.toLowerCase();
  if (/(olimpiade|oba\b)/.test(s) && /(arab|oba\b)/.test(s)) return 'Olimpiade Bahasa Arab';
  if (/(mhq|hifzh|hifdz|tahfi[zd]h|hafalan|juz)/.test(s)) return 'Hafalan Al-Qur’an (MHQ)';
  if (/(khitob|pidato|speech|ceramah)/.test(s)) return 'Pidato dan khitobah';
  if (/(arab|lughoh|i[’']?rab|imla|dauroh)/.test(s)) return 'Bahasa Arab lainnya';
  if (/(lcc|cerdas cermat)/.test(s)) return 'Cerdas cermat';
  if (/olimpiade/.test(s)) return 'Olimpiade lainnya';
  if (/hadi[st]/.test(s)) return 'Hadits';
  return 'Lomba lainnya';
}

/** Highest scope named in the level column. */
export function scope(level: string): string {
  const s = level.toLowerCase();
  if (/internasional/.test(s)) return 'Internasional';
  if (/nasional/.test(s)) return 'Nasional';
  if (/(provinsi|jawa barat|jabar|dki|banten|regional)/.test(s)) return 'Provinsi';
  if (/(kabupaten|kota|kecamatan|bogor)/.test(s)) return 'Kabupaten/kota';
  return 'Lainnya';
}

export const isWinner = (r: Record) => /juara\s*1\b|emas|gold/i.test(r.rank) || /juara satu/i.test(r.rank);

export function summary() {
  const years = [...new Set(records.map((r) => Number(r.year)).filter(Number.isFinite))].sort((a, b) => b - a);
  const families = [...new Set(records.map((r) => family(r.competition)))];
  const count = (f: (r: Record) => boolean) => records.filter(f).length;
  const byFamily = families
    .map((f) => ({
      family: f,
      total: count((r) => family(r.competition) === f),
      perYear: years.map((y) => count((r) => family(r.competition) === f && Number(r.year) === y)),
    }))
    .sort((a, b) => b.total - a.total);
  const scopes = ['Internasional', 'Nasional', 'Provinsi', 'Kabupaten/kota', 'Lainnya']
    .map((s) => ({ scope: s, total: count((r) => scope(r.level) === s) }))
    .filter((s) => s.total > 0);
  return {
    total: records.length,
    years,
    byFamily,
    yearTotals: years.map((y) => count((r) => Number(r.year) === y)),
    scopes,
    nationalFirsts: count((r) => scope(r.level) === 'Nasional' && isWinner(r)),
  };
}

/**
 * The most recent top achievement, for the homepage hero: winners only
 * (Juara 1, Medali Emas), newest year first, then the widest scope, then
 * file order (new rows go at the top). Null when there is none.
 */
export function latestTop(): string | null {
  const rankOf = ['Internasional', 'Nasional', 'Provinsi', 'Kabupaten/kota', 'Lainnya'];
  const best = records
    .map((r, i) => ({ r, i, year: Number(r.year) }))
    .filter(({ r, year }) => isWinner(r) && Number.isFinite(year) && r.rank && r.competition)
    .sort((a, b) => b.year - a.year || rankOf.indexOf(scope(a.r.level)) - rankOf.indexOf(scope(b.r.level)) || a.i - b.i)[0];
  if (!best) return null;
  const { r, year } = best;
  // Acronyms ("OBA", "MHQ") read better as their competition family.
  const name = /^[A-Z]{2,5}$/.test(r.competition.trim()) ? family(r.competition).replace(/\s*\(.*\)$/, '') : r.competition.trim();
  const sc = scope(r.level);
  const where = sc === 'Internasional' || sc === 'Nasional' || sc === 'Provinsi' ? ` tingkat ${sc.toLowerCase()}` : '';
  const stage = /\b(SD|SMP|SMA)\b/.exec(r.level)?.[1];
  return `${r.rank} ${name}${where}${stage && where ? ` (${stage})` : ''}, ${year}`;
}

export type Article = { id: string; title: string; year: number; body: string };
export type Highlight = {
  competition: string;
  scope: string;
  organizer: string;
  year: number;
  entries: { name: string; rank: string; stage?: string }[];
  article?: { href: string; title: string };
};

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();

/**
 * "Sorotan" on /prestasi: international results first, then national
 * winners (Juara 1, Medali Emas), newest year first, then file order. Rows
 * from the same competition, organizer and year form one highlight; at most
 * one highlight per competition family, so the row shows range. An article
 * is linked only when it is a Prestasi article from the same year, about the
 * same competition family, and names one of the students exactly.
 */
export function highlights(articles: Article[], max = 4): Highlight[] {
  const groups = new Map<string, { i: number; rows: Record[] }>();
  records.forEach((r, i) => {
    const sc = scope(r.level);
    if (!(sc === 'Internasional' || (sc === 'Nasional' && isWinner(r)))) return;
    if (!Number.isFinite(Number(r.year))) return;
    const key = [r.year, norm(r.competition), norm(r.organizer)].join('|');
    const g = groups.get(key) ?? groups.set(key, { i, rows: [] }).get(key)!;
    g.rows.push(r);
  });
  const intl = (g: { rows: Record[] }) => (scope(g.rows[0].level) === 'Internasional' ? 0 : 1);
  const sorted = [...groups.values()].sort(
    (a, b) => intl(a) - intl(b) || Number(b.rows[0].year) - Number(a.rows[0].year) || a.i - b.i,
  );
  const seen = new Set<string>();
  const out: Highlight[] = [];
  for (const { rows } of sorted) {
    const r = rows[0];
    const fam = family(r.competition);
    if (seen.has(fam)) continue;
    seen.add(fam);
    const year = Number(r.year);
    const names = rows.map((x) => norm(x.name));
    const match = articles.find(
      (a) => a.year === year && family(a.title) === fam && names.some((n) => norm(a.body).includes(n)),
    );
    out.push({
      // Acronyms ("OBA", "MHQ") read better as their competition family.
      competition: /^[A-Z]{2,5}$/.test(r.competition.trim()) ? fam.replace(/\s*\(.*\)$/, '') : r.competition.trim(),
      scope: scope(r.level),
      organizer: r.organizer.trim(),
      year,
      entries: rows.map((x) => ({ name: x.name, rank: x.rank, stage: /\b(SD|SMP|SMA)\b/.exec(x.level)?.[1] })),
      article: match && { href: `/artikel/${match.id}/`, title: match.title },
    });
    if (out.length === max) break;
  }
  return out;
}
