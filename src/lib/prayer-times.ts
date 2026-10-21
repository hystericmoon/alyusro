/**
 * Browser-side prayer times for today: the Kemenag/myquran API (cached per
 * day in sessionStorage, one request shared by every script on the page),
 * with the local calculation as an instant fallback.
 */
import { calcPrayerTimes, prayerTimesFromApi, type PrayerMinutes } from './day-view';

export type PrayerConfig = { geo: { lat: number; lng: number }; api: { url: string; city: string } };
type Day = { y: number; m: number; d: number; iso: string };

const pending = new Map<string, Promise<PrayerMinutes>>();

export const calcFor = (cfg: PrayerConfig, day: Day) => calcPrayerTimes(day.y, day.m, day.d, cfg.geo.lat, cfg.geo.lng);

export function fetchFor(cfg: PrayerConfig, day: Day): Promise<PrayerMinutes> {
  const key = `alyusro-shalat-${day.iso}`;
  const existing = pending.get(key);
  if (existing) return existing;
  const job = (async () => {
    try {
      const cached = sessionStorage.getItem(key);
      if (cached) return JSON.parse(cached) as PrayerMinutes;
    } catch {}
    const res = await fetch(cfg.api.url.replace('{city}', cfg.api.city).replace('{date}', day.iso));
    if (!res.ok) throw new Error(String(res.status));
    const json = await res.json();
    const times = prayerTimesFromApi(json?.data?.jadwal ?? {});
    if (!times) throw new Error('bad jadwal');
    try {
      sessionStorage.setItem(key, JSON.stringify(times));
    } catch {}
    return times;
  })();
  pending.set(key, job);
  job.catch(() => pending.delete(key));
  return job;
}
