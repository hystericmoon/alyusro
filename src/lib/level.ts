import { site, levels, known, registerUrl, numberWord, type Level } from './site';

export type JuzRow = { label: string; value: string; tone: string; juz: number[] };
export type FeeRow = { item: string; value: string };
export type WaveRow = { name: string; opens: string | null; test: string | null };

type RawFee = { item: string; amount: number; label?: string; period?: string };
type RawWave = { name: string; opens: string; test: string };

const rupiah = (n: number) => `Rp${n.toLocaleString('id-ID')}`;

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const parseDate = (s: string): Date | null => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  return m ? new Date(Date.UTC(+m[1]!, +m[2]! - 1, +m[3]!)) : null;
};
const longDate = (s: string): string | null => {
  const d = parseDate(s);
  return d ? `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}` : null;
};

/** "Juz 30", "Juz 30, 29, dan 28", "Juz 30–26", "Juz 30–26 dan 1–15". */
export function juzLabel(juz: number[]): string {
  if (juz.length === 1) return `Juz ${juz[0]}`;
  const runs: number[][] = [];
  juz.forEach((n, i) => {
    const prev = juz[i - 1];
    const run = runs[runs.length - 1];
    if (run && prev !== undefined && Math.abs(n - prev) === 1 && (run.length < 2 || n - prev === (run[1]! - run[0]!))) run.push(n);
    else runs.push([n]);
  });
  if (runs.length === 1 && juz.length <= 3) {
    return `Juz ${juz.slice(0, -1).join(', ')}, dan ${juz[juz.length - 1]}`;
  }
  const parts = runs.map((r) => (r.length > 1 ? `${r[0]}–${r[r.length - 1]}` : `${r[0]}`));
  return `Juz ${parts.slice(0, -1).join(', ')}${parts.length > 1 ? ' dan ' : ''}${parts[parts.length - 1]}`;
}

// Rows are spread across the lapis scale; prior hafalan (from an earlier level) is a pale sky tone.
const TONE_STEPS: Record<number, string[]> = {
  1: ['lapis-5'],
  2: ['lapis-4', 'lapis-5'],
  3: ['lapis-1', 'lapis-3', 'lapis-5'],
  4: ['lapis-1', 'lapis-2', 'lapis-4', 'lapis-5'],
  5: ['lapis-1', 'lapis-2', 'lapis-3', 'lapis-4', 'lapis-5'],
};

/** Waves from site.json whose test date has not passed. Waves without real dates stay (null dates). */
export function upcomingWaves(slug: string, today = new Date()): WaveRow[] {
  const all = ((site.psb.waves as Record<string, RawWave[]>)[slug] ?? []) as RawWave[];
  const todayUtc = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  return all
    .filter((w) => {
      const test = parseDate(w.test);
      return !test || test.getTime() >= todayUtc;
    })
    .map((w) => ({ name: w.name, opens: longDate(w.opens), test: longDate(w.test) }));
}

export function buildLevel(level: Level, today = new Date()) {
  const idx = levels.indexOf(level);
  const prior = (level as Level & { juzMapPrior?: { label: string; juz: number[] } }).juzMapPrior;
  const rows = level.juzMap ?? [];
  const steps = TONE_STEPS[Math.min(rows.length, 5)] ?? [];

  const juzRows: JuzRow[] = [
    ...(prior ? [{ label: prior.label, value: juzLabel(prior.juz), tone: 'sky-100', juz: prior.juz }] : []),
    ...rows.map((r, i) => ({ label: r.label, value: juzLabel(r.juz), tone: steps[i] ?? 'lapis-5', juz: r.juz })),
  ];
  const juzCount = (level as Level & { juzCount?: number }).juzCount ?? 0;
  if (!juzRows.length) juzRows.push({ label: `Selama ${level.name}`, value: level.target, tone: 'lapis-5', juz: [] });

  const toneOf = new Map<number, string>();
  juzRows.forEach((r) => r.juz.forEach((n) => toneOf.set(n, r.tone)));

  const fees: FeeRow[] = ((level.fees ?? []) as RawFee[]).map((f) => ({
    item: known(f.period) ? `${f.item} ${f.period}` : f.item,
    value: f.amount === 0 && f.label ? f.label : rupiah(f.amount),
  }));
  const feesYear = known((level as Level & { feesYear?: string }).feesYear);
  const feeNote = level.feesNote ?? (feesYear ? `Berlaku untuk tahun ajaran ${feesYear}.` : '');

  const waves = upcomingWaves(level.slug, today);
  const hasWaveData = ((site.psb.waves as Record<string, RawWave[]>)[level.slug] ?? []).length > 0;
  // Open only when site.json says so and, if waves are listed, one has not passed yet.
  const open = level.psbOpen === true && (!hasWaveData || waves.length > 0);

  const brochures = site.psb.brochures as Record<string, string | null>;
  const prev = levels[idx - 1];
  const next = levels[idx + 1];

  return {
    level,
    juzRows,
    hasMap: toneOf.size > 0,
    cells: Array.from({ length: 30 }, (_, i) => ({ n: i + 1, tone: toneOf.get(i + 1) ?? null })),
    mapLabel: `Juz yang dihafal di ${level.name}: ${juzRows.map((r) => `${r.label} ${r.value}`).join(', ')}.`,
    juzCount,
    juzCountWord: numberWord(juzCount),
    fees,
    feeNote,
    regFee: fees[0]?.value ?? 'Belum dipublikasikan',
    open,
    waves,
    academicYear: known(site.psb.academicYear),
    // Show the wave table only once at least one real date is published.
    wavesAnnounced: waves.some((w) => w.opens || w.test),
    registerUrl: registerUrl(level.slug),
    brochureUrl: brochures[level.slug] || null,
    head: known(level.head),
    facts: [
      ['Setara', level.setara],
      [level.durationLabel, known(level.duration)],
      ['Target hafalan', level.target],
    ].filter((f): f is [string, string] => !!f[1]),
    prev: prev ? { name: prev.name, path: prev.path } : null,
    next: next ? { name: next.name, path: next.path } : null,
  };
}
