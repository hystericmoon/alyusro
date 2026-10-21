import { site, known } from './site';

/** Routine kajian from site.json; unknown times read "Jadwal segera diumumkan". */
export const kajianRutin = () =>
  site.kajianRutin.map((k) => ({
    name: k.name,
    when: known(k.when) ?? 'Jadwal segera diumumkan',
    audience: known(k.audience),
  }));
