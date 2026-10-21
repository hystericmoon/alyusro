// Runs before every build (npm "prebuild"). content/site.json can be edited
// in Sveltia CMS at /admin; if a save ever leaves out a value the pages need,
// this stops the deploy with a readable message, and the live site stays on
// the last good version.
import { readFileSync } from 'node:fs';

const data = JSON.parse(readFileSync(new URL('../content/site.json', import.meta.url), 'utf8'));
const errors = [];
const need = (cond, msg) => cond || errors.push(msg);
const str = (v) => typeof v === 'string' && v.trim() !== '';
const date = /^\d{4}-\d{2}-\d{2}$/;
const dateOrPlaceholder = (v) => v == null || v === '' || date.test(v) || /\[.*\]/.test(v);

const s = data.school ?? {};
for (const k of ['name', 'url', 'address', 'mapsUrl', 'infoGroupUrl', 'loginUrl']) need(str(s[k]), `school.${k} kosong`);
need(str(s.whatsapp?.display) && str(s.whatsapp?.url), 'school.whatsapp (nomor dan tautan) kosong');
need(Number.isInteger(s.halaqahRatio?.ideal) && Number.isInteger(s.halaqahRatio?.max), 'school.halaqahRatio harus angka');

const psb = data.psb ?? {};
need(str(psb.registerUrls?.default), 'psb.registerUrls.default kosong');
need(Array.isArray(psb.faq), 'psb.faq hilang');
for (const [slug, waves] of Object.entries(psb.waves ?? {})) {
  for (const w of waves ?? []) {
    need(str(w.name), `psb.waves.${slug}: gelombang tanpa nama`);
    need(dateOrPlaceholder(w.opens) && dateOrPlaceholder(w.test), `psb.waves.${slug} "${w.name}": tanggal harus TTTT-BB-HH`);
  }
}

need(Array.isArray(data.levels) && data.levels.length > 0, 'levels kosong');
const slugs = new Set();
for (const l of data.levels ?? []) {
  for (const k of ['slug', 'path', 'name', 'setara', 'target', 'headRole']) need(str(l[k]), `levels "${l.name ?? '?'}": ${k} kosong`);
  need(!slugs.has(l.slug), `levels: kode "${l.slug}" dipakai dua kali`);
  slugs.add(l.slug);
  need(/^\/.*\/$/.test(l.path ?? ''), `levels "${l.name}": alamat harus diawali dan diakhiri "/"`);
  for (const f of l.fees ?? []) need(str(f.item) && Number.isFinite(f.amount), `levels "${l.name}": biaya tanpa jenis atau jumlah`);
  for (const r of l.juzMap ?? []) need((r.juz ?? []).every((j) => Number.isInteger(j) && j >= 1 && j <= 30), `levels "${l.name}": juz harus 1–30`);
}

const ds = data.dailySchedule ?? {};
need(Array.isArray(ds.weekday) && ds.weekday.length > 0, 'dailySchedule.weekday kosong');
need(str(ds.prayerApi?.url) && str(ds.prayerApi?.city), 'dailySchedule.prayerApi hilang');
for (const e of ds.weekday ?? []) need(str(e.name) && str(e.start) && str(e.end), `dailySchedule.weekday "${e.name ?? '?'}": mulai/selesai kosong`);

const cal = data.academicCalendar ?? {};
need(Array.isArray(cal.events), 'academicCalendar.events hilang');
for (const e of cal.events ?? []) {
  need(str(e.label) && date.test(e.start ?? ''), `academicCalendar "${e.label ?? '?'}": tanggal mulai harus TTTT-BB-HH`);
  need(!e.end || date.test(e.end), `academicCalendar "${e.label}": tanggal selesai harus TTTT-BB-HH`);
}
need(Array.isArray(data.kajianRutin), 'kajianRutin hilang');
need(Array.isArray(data.staff?.people), 'staff.people hilang');

if (errors.length) {
  console.error(`content/site.json belum lengkap (${errors.length}):\n- ${errors.join('\n- ')}`);
  process.exit(1);
}
console.log('content/site.json OK');
