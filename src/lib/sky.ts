/**
 * Time-of-day helpers for the living sky (landscape) and the night stars
 * (day view). Both follow the same prayer times as the day view.
 */
import type { PrayerMinutes } from './day-view';

export type Sky = 'dawn' | 'day' | 'dusk' | 'night';

/** Sky state for minute-of-day `min` in WIB. */
export function skyAt(min: number, pt: PrayerMinutes): Sky {
  if (min < pt.subuh || min >= pt.maghrib + 20) return 'night';
  if (min < pt.terbit + 30) return 'dawn';
  if (min >= pt.maghrib - 45) return 'dusk';
  return 'day';
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Star visibility, 0–1: full at night, fading out from Subuh to sunrise, back in after Maghrib. */
export function starOpacity(min: number, pt: PrayerMinutes): number {
  if (min < pt.subuh || min >= pt.isya) return 1;
  if (min < pt.terbit) return 1 - clamp01((min - pt.subuh) / (pt.terbit - pt.subuh));
  if (min >= pt.maghrib) return clamp01((min - pt.maghrib) / (pt.isya - pt.maghrib));
  return 0;
}

/**
 * Sun position in the landscape's 1440×460 viewBox. It stays in the open sky
 * right of Gunung Salak, where the design places it: it rises from behind the
 * right-hand hills at sunrise, peaks near midday, and sinks back at Maghrib.
 * Null at night.
 */
export function sunAt(min: number, pt: PrayerMinutes): { x: number; y: number } | null {
  const t = (min - pt.terbit) / (pt.maghrib - pt.terbit);
  if (t < -0.04 || t > 1.04) return null;
  return { x: Math.round(1220 + clamp01(t) * 180), y: Math.round(310 - 178 * Math.sin(Math.PI * clamp01(t))) };
}

/** Deterministic star field, so the build and the browser agree. */
export function stars(count: number, seed = 7) {
  let s = seed;
  const rand = () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
  return Array.from({ length: count }, () => ({
    x: rand(),
    y: rand(),
    r: rand() < 0.2 ? 1.6 : rand() < 0.5 ? 1.2 : 0.9,
    o: 0.35 + rand() * 0.45,
    delay: -(rand() * 6),
    dur: 3.5 + rand() * 4,
  }));
}
