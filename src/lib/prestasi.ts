import data from '../../content/prestasi.json';

export type Record = { rank: string; competition: string; level: string; organizer: string; year: number | string };
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
