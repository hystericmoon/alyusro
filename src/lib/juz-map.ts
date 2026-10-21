import { capitalize, levelBySlug, numberWord, type Level } from './site';

export type JuzClass = {
  key: string; // "VII"
  label: string; // "Kelas VII"
  juz: number[]; // in hafalan order, e.g. [30, 29, 28, 27, 26]
  range: string; // "30–26"
  tone: number; // 0..4, index into the lapis scale
};

export type JuzMapData = {
  title: string;
  description: string;
  ariaLabel: string;
  classes: JuzClass[];
  readouts: Record<string, string>; // "all" plus one per class key
};

const span = (juz: number[]) => ({ first: juz[0] as number, last: juz[juz.length - 1] as number });

/**
 * Builds the homepage hafalan map from the juzMap of the given levels in
 * site.json (Madrasah then Darul ‘Ilmi). Readout sentences follow the
 * wording in Beranda-gabungan but are filled from the data.
 */
export function buildJuzMap(slugs: string[] = ['madrasah', 'darul-ilmi']): JuzMapData {
  const lvls: Level[] = slugs.map(levelBySlug);
  const classes: JuzClass[] = [];
  const readouts: Record<string, string> = {};
  const perLevel: { level: Level; total: number; keys: string[] }[] = [];
  let cumulative = 0;

  lvls.forEach((level) => {
    const rows = level.juzMap ?? [];
    let levelTotal = 0;
    const keys: string[] = [];
    rows.forEach((row, i) => {
      const key = row.label.replace(/^kelas\s+/i, '');
      const { first, last } = span(row.juz);
      const n = row.juz.length;
      levelTotal += n;
      cumulative += n;
      keys.push(key);
      const overallIndex = classes.length;
      classes.push({ key, label: row.label, juz: row.juz, range: `${first}–${last}`, tone: overallIndex });

      let text: string;
      if (overallIndex === 0) {
        text = `${row.label} memulai dari juz ${first} sampai ${last}, ${numberWord(n)} juz pertama.`;
      } else if (i === 0) {
        text = `${row.label}, tahun pertama hafalan ${level.name}: juz ${first} sampai ${last}.`;
      } else if (i === rows.length - 1) {
        const done = cumulative === 30 ? 'Hafalan genap 30 juz.' : `Hafalan ${level.name} genap ${levelTotal} juz.`;
        text = `${row.label} menghafal juz ${first} sampai ${last}. ${done}`;
      } else {
        text = `${row.label} menghafal ${numberWord(n)} juz, dari juz ${first} sampai ${last}.`;
      }
      readouts[key] = text;
    });
    perLevel.push({ level, total: levelTotal, keys });
  });

  const kelasRange = (keys: string[]) =>
    keys.length > 1 ? `kelas ${keys[0]}–${keys[keys.length - 1]}` : `kelas ${keys[0]}`;
  const parts = perLevel.map(
    (p, i) => `${i > 0 ? 'lalu ' : ''}${p.total} juz di ${p.level.name} (${kelasRange(p.keys)})`,
  );
  readouts.all = `${capitalize(numberWord(classes.length))} tahun, ${cumulative} juz: ${parts.join(', ')}.`;

  const [firstClass, ...rest] = classes;
  const restJuz = rest.flatMap((c) => c.juz);
  const description = firstClass
    ? `Dimulai dari juz ${span(firstClass.juz).first} hingga ${span(firstClass.juz).last}` +
      (restJuz.length ? `, lalu juz ${Math.min(...restJuz)} sampai ${Math.max(...restJuz)}` : '') +
      '. Setiap juz diuji dulu sebelum santri lanjut ke juz berikutnya.'
    : '';

  const ariaLabel =
    'Peta hafalan: ' +
    classes
      .map((c) => `${c.label.toLowerCase()} juz ${span(c.juz).first} sampai ${span(c.juz).last}`)
      .join(', ') +
    '.';

  return {
    title: `Peta hafalan ${lvls.map((l) => l.name).join(' dan ')}`,
    description,
    ariaLabel,
    classes,
    readouts,
  };
}
