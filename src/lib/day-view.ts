/**
 * "Sehari di Al Yusro" day view. Pure functions shared by the build (static
 * fallback markup) and the browser (live updates every 30 seconds), so the
 * markup below is the single template for the schedule column.
 */

export type ScheduleEntry = {
  name: string;
  days: string;
  start: string;
  end: string;
  detail?: string;
  placeholder?: boolean;
};
export type DaySchedule = {
  weekday: ScheduleEntry[];
  saturday: { title: string; detail: string };
  sunday: { title: string; detail: string };
};
export type PrayerKey = 'subuh' | 'terbit' | 'zhuhur' | 'ashar' | 'maghrib' | 'isya';
export type PrayerMinutes = Record<PrayerKey, number>;

export const DAY_NAMES = ['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
export const START = 240; // 04.00
export const END = 1200; // 20.00
const SPAN = END - START;

const pad = (v: number) => (v < 10 ? '0' : '') + v;
export const fmt = (mins: number) => `${pad(Math.floor(mins / 60))}.${pad(mins % 60)}`;
export const pct = (mins: number) => `${(((Math.max(START, Math.min(END, mins)) - START) / SPAN) * 100).toFixed(3)}%`;
const len = (a: number, b: number) => `${((Math.max(0, Math.min(END, b) - Math.max(START, a)) / SPAN) * 100).toFixed(3)}%`;

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] as string);

/** Current date and minute of day in WIB (UTC+7), whatever the visitor's timezone. */
export function nowInWib(ms = Date.now()) {
  const d = new Date(ms + 7 * 3600 * 1000);
  return {
    y: d.getUTCFullYear(),
    m: d.getUTCMonth() + 1,
    d: d.getUTCDate(),
    wd: d.getUTCDay(),
    min: d.getUTCHours() * 60 + d.getUTCMinutes(),
    iso: d.toISOString().slice(0, 10),
  };
}

/**
 * Fallback prayer-time calculation (Kemenag-style: Fajr 20°, Isha 18°, Asr
 * shadow 1, +2 min ihtiyat). The live page prefers the myquran/Kemenag API.
 */
export function calcPrayerTimes(y: number, m: number, d: number, lat: number, lng: number, tz = 7): PrayerMinutes {
  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;
  const fix = (a: number, b: number) => {
    a = a - b * Math.floor(a / b);
    return a < 0 ? a + b : a;
  };
  let Y = y;
  let M = m;
  if (M <= 2) {
    Y -= 1;
    M += 12;
  }
  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const jd = Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + d + B - 1524.5 - lng / (15 * 24);
  const sun = (t: number) => {
    const D = jd + t - 2451545.0;
    const g = fix(357.529 + 0.98560028 * D, 360);
    const q = fix(280.459 + 0.98564736 * D, 360);
    const L = fix(q + 1.915 * Math.sin(g * rad) + 0.02 * Math.sin(2 * g * rad), 360);
    const e = 23.439 - 0.00000036 * D;
    const RA = (Math.atan2(Math.cos(e * rad) * Math.sin(L * rad), Math.cos(L * rad)) * deg) / 15;
    return { decl: Math.asin(Math.sin(e * rad) * Math.sin(L * rad)) * deg, eqt: q / 15 - fix(RA, 24) };
  };
  const noon = (t: number) => fix(12 - sun(t).eqt, 24);
  const angleTime = (a: number, t: number, ccw: boolean) => {
    const s = sun(t);
    const T =
      (Math.acos(
        (-Math.sin(a * rad) - Math.sin(s.decl * rad) * Math.sin(lat * rad)) /
          (Math.cos(s.decl * rad) * Math.cos(lat * rad)),
      ) *
        deg) /
      15;
    return noon(t) + (ccw ? -T : T);
  };
  const asrTime = (t: number) => {
    const s = sun(t);
    const a = -Math.atan(1 / (1 + Math.tan(Math.abs(lat - s.decl) * rad))) * deg;
    return angleTime(a, t, false);
  };
  let t = { subuh: 5, terbit: 6, zhuhur: 12, ashar: 13, maghrib: 18, isya: 18 };
  for (let i = 0; i < 2; i++) {
    t = {
      subuh: angleTime(20, t.subuh / 24, true),
      terbit: angleTime(0.833, t.terbit / 24, true),
      zhuhur: noon(t.zhuhur / 24),
      ashar: asrTime(t.ashar / 24),
      maghrib: angleTime(0.833, t.maghrib / 24, false),
      isya: angleTime(18, t.isya / 24, false),
    };
  }
  const out = {} as PrayerMinutes;
  (Object.keys(t) as PrayerKey[]).forEach((k) => {
    out[k] = Math.round((t[k] + tz - lng / 15) * 60) + 2;
  });
  return out;
}

const hm = (s: string) => {
  const m = /^(\d{1,2})[.:](\d{2})$/.exec(s.trim());
  return m ? parseInt(m[1] as string, 10) * 60 + parseInt(m[2] as string, 10) : NaN;
};

/** Reads a myquran v2 `jadwal` object ("subuh": "04:13", ...). */
export function prayerTimesFromApi(j: Record<string, string>): PrayerMinutes | null {
  const out: PrayerMinutes = {
    subuh: hm(j.subuh ?? ''),
    terbit: hm(j.terbit ?? ''),
    zhuhur: hm(j.dzuhur ?? ''),
    ashar: hm(j.ashar ?? ''),
    maghrib: hm(j.maghrib ?? ''),
    isya: hm(j.isya ?? ''),
  };
  return Object.values(out).every(Number.isFinite) ? out : null;
}

const ALIASES: Record<string, PrayerKey> = {
  subuh: 'subuh', fajr: 'subuh', terbit: 'terbit', sunrise: 'terbit',
  zhuhur: 'zhuhur', dzuhur: 'zhuhur', dhuhr: 'zhuhur',
  ashar: 'ashar', asr: 'ashar', maghrib: 'maghrib', isya: 'isya', isha: 'isya',
};

/** Evaluates a site.json time: "05:00", "ashar+15", "maghrib-60", "min(a, b)", "max(a, b)". */
export function evalTime(expr: string, pt: PrayerMinutes): number {
  const e = expr.trim();
  const fn = /^(min|max)\((.*)\)$/i.exec(e);
  if (fn) {
    const args = (fn[2] as string).split(',').map((a) => evalTime(a, pt));
    return (fn[1] as string).toLowerCase() === 'min' ? Math.min(...args) : Math.max(...args);
  }
  const clock = hm(e);
  if (Number.isFinite(clock)) return clock;
  const rel = /^([a-z]+)\s*([+-]\s*\d+)?$/i.exec(e);
  const key = rel && ALIASES[(rel[1] as string).toLowerCase()];
  if (rel && key) return pt[key] + (rel[2] ? parseInt((rel[2] as string).replace(/\s/g, ''), 10) : 0);
  throw new Error(`Unknown schedule time "${expr}"`);
}

/** "Senin–Jumat", "Senin–Kamis", "Jumat", "Senin, Rabu" → does it include weekday `wd`? */
export function daysInclude(days: string, wd: number): boolean {
  return days.split(',').some((part) => {
    const [a, b] = part.split(/[–-]/).map((s) => DAY_NAMES.indexOf(s.trim()));
    if (a === undefined || a < 0) return false;
    if (b === undefined) return a === wd;
    return b >= a ? wd >= a && wd <= b : wd >= a || wd <= b;
  });
}

type Block = { name: string; detail: string; a: number; b: number; ph: boolean };

export type DayModel = {
  label: string;
  title: string;
  detail: string;
  next: string;
  note: string;
  showNow: boolean;
  nowTop: string;
  nowLabel: string;
  bandsHtml: string;
  trackHtml: string;
  prayersHtml: string;
};

const BAND_COLORS = ['bg-night-deep', 'bg-sky-dawn', 'bg-sky-200', 'bg-sky-50', 'bg-sky-100', 'bg-sky-500', 'bg-night-deep'];

/**
 * Builds the day view for weekday `wd` at minute `nowMin`. With `live: false`
 * (build time, no JS) it renders a labelled example Monday instead of "now".
 */
export function buildDay(schedule: DaySchedule, pt: PrayerMinutes, wd: number, nowMin: number, live = true): DayModel {
  const weekday = wd >= 1 && wd <= 5;
  const friday = wd === 5;
  // Weekends show the Monday–Thursday timetable as an example.
  const blockDay = weekday ? wd : 1;
  const raw: Block[] = schedule.weekday
    .filter((e) => daysInclude(e.days, blockDay))
    .map((e) => ({
      // Placeholder labels lose their brackets; the dashed block already says "approximate".
      name: e.name.replace(/^\[(.*)\]$/, '$1'),
      detail: e.detail ?? '',
      a: evalTime(e.start, pt),
      b: evalTime(e.end, pt),
      ph: !!e.placeholder,
    }));

  const prayers = [
    { name: 'Subuh', ar: 'الفجر', m: pt.subuh },
    { name: friday ? 'Jumat' : 'Zhuhur', ar: friday ? 'الجمعة' : 'الظهر', m: pt.zhuhur },
    { name: 'Ashar', ar: 'العصر', m: pt.ashar },
    { name: 'Maghrib', ar: 'المغرب', m: pt.maghrib },
    { name: 'Isya', ar: 'العشاء', m: pt.isya },
  ];

  let cur: Block | null = null;
  if (weekday) {
    raw.forEach((b) => {
      if (nowMin >= b.a && nowMin < b.b) cur = b;
    });
    prayers.forEach((x) => {
      if (nowMin >= x.m && nowMin < x.m + 15) {
        cur = {
          name: x.name === 'Jumat' ? 'Shalat Jumat' : `Shalat ${x.name} berjamaah`,
          detail: 'Shalat berjamaah di masjid ma’had.',
          a: x.m,
          b: x.m + 15,
          ph: false,
        };
      }
    });
  }

  const events = [
    ...raw.filter((b) => !b.ph).map((b) => ({ name: b.name, m: b.a })),
    ...prayers.map((x) => ({ name: x.name === 'Jumat' ? 'Shalat Jumat' : `Shalat ${x.name}`, m: x.m })),
  ].sort((a, b) => a.m - b.m);
  const next = weekday ? events.find((e) => e.m > nowMin) : undefined;

  let title: string;
  let detail = '';
  let nextText: string;
  if (!weekday) {
    const day = wd === 6 ? schedule.saturday : schedule.sunday;
    const unknown = /^\[.*\]$/.test(day.title.trim());
    title = unknown ? `${DAY_NAMES[wd]}: kegiatan akhir pekan` : day.title;
    detail = unknown ? '' : day.detail;
    nextText = 'Jadwal harian berlaku Senin sampai Jumat.';
  } else {
    const c = cur as Block | null;
    if (c) {
      title = c.name;
      detail = `${c.detail ? `${c.detail} ` : ''}${fmt(c.a)}–${fmt(c.b)}.`;
    } else if (nowMin < 210 || nowMin >= 1290) {
      title = 'Waktu istirahat malam';
    } else {
      title = 'Jeda di antara kegiatan';
    }
    nextText = next ? `Berikutnya: ${next.name}, pukul ${fmt(next.m)}` : 'Kegiatan dimulai lagi besok sebelum Subuh.';
  }

  const edges = [START, pt.subuh, pt.terbit, 540, pt.ashar, pt.maghrib, pt.isya, END];
  const bandsHtml = BAND_COLORS.map(
    (cls, i) =>
      `<span class="absolute inset-x-0 ${cls}" style="top:${pct(edges[i] as number)};height:${len(edges[i] as number, edges[i + 1] as number)}"></span>`,
  ).join('');

  const prayerRules = prayers
    .map((x) => `<span aria-hidden="true" class="absolute inset-x-0 border-t border-dashed border-night-dash" style="top:${pct(x.m)}"></span>`)
    .join('');
  const blocksHtml = raw
    .map((b) => {
      const pos = `top:${pct(b.a)};height:${len(b.a, b.b)}`;
      if (b.ph) {
        return `<div class="absolute inset-x-0 box-border overflow-hidden rounded-md border-[1.5px] border-dashed border-night-placeholder px-12 py-8 text-13 leading-[1.35] text-on-night-body" style="${pos}">${esc(b.name)}</div>`;
      }
      const isCur = live && weekday && cur === b;
      const tone = isCur ? 'bg-amber shadow-[0_0_0_2px_var(--color-white)]' : 'bg-sky-100';
      // An hour is about 34px tall: tighten the type so a long name fits on
      // two lines on phones, and drop the time there (the axis shows it).
      const short = b.b - b.a <= 75;
      const type = short ? 'py-2 text-12 leading-[1.2] sm:py-3 sm:text-13 sm:leading-[1.4]' : 'py-3 text-13 leading-[1.4]';
      return `<div class="absolute inset-x-0 box-border flex flex-wrap content-start gap-x-8 overflow-hidden rounded-md px-10 ${type} text-ink ${tone}" style="${pos}"${isCur ? ' data-current="true"' : ''}><strong class="font-bold">${esc(b.name)}</strong><span class="tabular-nums${short ? ' max-sm:hidden' : ''}">${fmt(b.a)}–${fmt(b.b)}</span></div>`;
    })
    .join('');

  const prayersHtml = prayers
    .map(
      (x) =>
        `<li class="absolute inset-x-0 flex -translate-y-1/2 items-baseline justify-between gap-6 text-on-night-list" style="top:${pct(x.m)}"><span>${x.name} <span lang="ar" dir="rtl" class="text-on-night-muted">${x.ar}</span></span><span class="font-bold tabular-nums">${fmt(x.m)}</span></li>`,
    )
    .join('');

  return {
    label: live
      ? `Saat ini di Al Yusro, ${DAY_NAMES[wd]} pukul ${fmt(nowMin)} WIB`
      : `Contoh: ${DAY_NAMES[wd]} pukul ${fmt(nowMin)} WIB`,
    title,
    detail,
    next: nextText,
    note: live && weekday ? `${DAY_NAMES[wd]}, waktu shalat hari ini` : 'Contoh hari Senin sampai Kamis',
    showNow: live && nowMin >= START && nowMin <= END,
    nowTop: pct(nowMin),
    nowLabel: fmt(nowMin),
    bandsHtml,
    trackHtml: prayerRules + blocksHtml,
    prayersHtml,
  };
}
