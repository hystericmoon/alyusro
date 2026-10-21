import data from '../../content/site.json';

export const site = data;
export type Level = (typeof data.levels)[number] & {
  juzMap?: { label: string; juz: number[] }[] | null;
  feesNote?: string;
};

export const school = data.school;
export const levels = data.levels as Level[];

/** Values containing "[...]" in site.json are placeholders (or part-placeholders) still to confirm. */
export const isPlaceholder = (v: unknown): boolean => typeof v === 'string' && /\[[^\]]*\]/.test(v);

/**
 * The value, or null when it is a placeholder or empty. Pages never show a
 * bracketed placeholder: unknown values are hidden or get a designed fallback,
 * and appear automatically once site.json has the real value.
 */
export function known<T>(v: T): T | null {
  if (v === null || v === undefined || v === '' || isPlaceholder(v)) return null;
  return v;
}

/** Paths that stay on the school's Laravel site get its origin; full URLs pass through. */
export const schoolUrl = (path: string): string => (/^https?:\/\//.test(path) ? path : school.url + path);

export const levelBySlug = (slug: string): Level => {
  const level = levels.find((l) => l.slug === slug);
  if (!level) throw new Error(`site.json has no level "${slug}"`);
  return level;
};

export const registerUrl = (slug?: string): string => {
  const urls = data.psb.registerUrls as Record<string, string>;
  return schoolUrl((slug && urls[slug]) || urls.default);
};

export const loginUrl = schoolUrl(school.loginUrl);
export const infoGroupUrl = schoolUrl(school.infoGroupUrl);

/** Only an explicit `true` means open; "[status]" and other placeholders read as not open. */
export const openLevels = (): Level[] => levels.filter((l) => l.psbOpen === true);

const ONES = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan'];

/** Indonesian number words for 1–99, used where the designs spell numbers out. */
export function numberWord(n: number): string {
  if (n < 10) return ONES[n] ?? String(n);
  if (n === 10) return 'sepuluh';
  if (n === 11) return 'sebelas';
  if (n < 20) return `${ONES[n - 10]} belas`;
  if (n < 100) {
    const tens = Math.floor(n / 10);
    const rest = n % 10;
    return `${tens === 1 ? 'sepuluh' : `${ONES[tens]} puluh`}${rest ? ` ${ONES[rest]}` : ''}`;
  }
  return String(n);
}

export const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1);
const lowerFirst = (s: string): string => s.charAt(0).toLowerCase() + s.slice(1);

/**
 * One-line summary under a level name (terraces, menus). Built from setara,
 * duration and feesNote so it follows site.json; placeholder durations are left out.
 */
export function levelSummary(level: Level): string {
  const parts = [level.setara];
  if (level.feesNote) {
    parts.push(lowerFirst(level.feesNote.replace(/\.$/, '')));
  } else if (!isPlaceholder(level.duration)) {
    const classes = /kelas\s+[^,]+$/i.exec(level.duration);
    if (level.durationLabel === 'Usia') parts.push(`usia ${level.duration}`);
    else if (classes) parts.push(lowerFirst(classes[0]));
    else parts.push(`ditempuh ${level.duration}`);
  }
  return parts.join(', ');
}

export const currentYear = new Date().getFullYear();
