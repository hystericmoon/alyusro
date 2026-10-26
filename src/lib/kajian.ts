import { site, known } from './site';

/** Routine kajian from site.json. Times and themes the school has not published are left out. */
export const kajianRutin = () =>
  site.kajianRutin.map((k) => ({
    name: k.name,
    when: known((k as { when?: string }).when),
    audience: known((k as { audience?: string }).audience),
  }));
