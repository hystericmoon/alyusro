// WCAG 2.2 contrast audit for the color tokens in src/styles/global.css.
// Run: node scripts/contrast-audit.mjs  (prints Markdown tables; exits 1 on a failure).
// Keep the token values below in step with global.css when the palette changes.
const hex = h => { h = h.replace('#', ''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };
const lum = h => { const [r, g, b] = hex(h).map(c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
// composite rgba over a solid
const over = (fg, alpha, bg) => '#' + hex(fg).map((c, i) => Math.round(c * alpha + hex(bg)[i] * (1 - alpha)).toString(16).padStart(2, '0')).join('');
const T = {
  paper: '#F7F7F4', white: '#FFFFFF', ink: '#1B2235', body: '#2C3448', muted: '#4A5368',
  lapis: '#073E6B', 'lapis-deep': '#052D4F', amber: '#E3AF14', 'amber-edge': '#7A5C00',
  'lapis-1': '#DEEAF6', 'lapis-2': '#9CC1DF', 'lapis-3': '#629DCB', 'lapis-4': '#1C71B3', 'lapis-5': '#073E6B',
  'sky-50': '#E3EDF7', 'sky-100': '#C4D9EE', 'sky-200': '#9EC0E2', 'sky-dawn': '#2A5E96', 'sky-500': '#1C71B3', 'sky-600': '#125891',
  'night-panel': '#242D47', 'night-deep': '#11162A', mist: '#E4E9F2', 'hill-1': '#C3CDE0', 'dawn-top': '#D3DBEE', 'dawn-glow': '#F2E4D3', 'dusk-top': '#C9D0E6', 'dusk-glow': '#F0D8C4',
};
T['glass-night on ink'] = over('#242D47', 0.72, T.ink);
T['CTA panel (white 82%) over black'] = over('#FFFFFF', 0.82, '#000000');
T['dropdown glass (white 80%) over black'] = over('#FFFFFF', 0.8, '#000000');
const text = [
  // [fg, bg, size: 'body' | 'large', where]
  ['lapis', 'paper', 'body', 'Links, breadcrumbs, "Lihat …" links on paper'],
  ['lapis', 'white', 'body', 'Links and kickers on white cards; "Pendaftaran dibuka" tag on terraces'],
  ['lapis', 'lapis-1', 'body', 'aria-current menu summary and mobile-menu row; dropdown link hover'],
  ['lapis', 'dropdown glass (white 80%) over black', 'body', 'aria-current link in dropdown, worst case behind glass'],
  ['lapis', 'CTA panel (white 82%) over black', 'body', 'CTA step number and arrow, worst case behind the panel'],
  ['lapis', 'lapis-1', 'large', 'CTA step number (22px) on its chip'],
  ['white', 'lapis', 'body', 'btn-primary'],
  ['white', 'lapis-deep', 'body', 'btn-primary hover/press'],
  ['ink', 'lapis-1', 'body', 'btn-secondary, chip hover, menu button, juz cells (Kelas VII)'],
  ['body', 'lapis-1', 'body', 'Hero PSB notice text'],
  ['ink', 'lapis-2', 'body', 'btn-secondary hover, juz cells (Kelas VIII), level juz rows'],
  ['ink', 'lapis-3', 'body', 'Juz cells (Kelas IX), level juz rows'],
  ['white', 'lapis-4', 'body', 'Juz cells (Kelas X), level juz rows'],
  ['white', 'lapis-5', 'body', 'Juz cells (Kelas XI), level juz rows'],
  ['lapis-1', 'lapis', 'body', 'Typographic article cover: kicker'],
  ['white', 'lapis', 'large', 'Typographic article cover: title'],
  ['lapis-3', 'lapis', 'large', 'Typographic article cover: part number (88px, aria-hidden)'],
  ['ink', 'amber', 'body', 'Day view "now" time label (12px bold); current block text'],
  ['amber', 'ink', 'body', 'Day view "Berikutnya" line; jadwal shalat "Berikutnya" on night'],
  ['amber', 'glass-night on ink', 'body', 'Same, on a glass-night panel'],
  ['ink', 'sky-50', 'body', 'Terrace TAUD'],
  ['ink', 'sky-100', 'body', 'Terrace Kuttab; day-view blocks; level tone'],
  ['ink', 'sky-200', 'body', 'Terrace Mahdhon Tarbawi'],
  ['white', 'sky-500', 'body', 'Terrace Madrasah'],
  ['white', 'sky-600', 'body', 'Terrace Darul ‘Ilmi'],
  ['white', 'lapis', 'body', 'Terrace Ma’had ‘Aly'],
  ['white', 'sky-500', 'body', 'Terrace link hover (stays white, underlined)'],
  ['ink', 'sky-50', 'body', 'btn-light hover'],
];
const ui = [
  ['lapis', 'paper', 'Focus ring (navy outline) on paper'],
  ['lapis', 'white', 'Focus ring (navy outline) on white'],
  ['lapis', 'lapis-1', 'Focus ring (navy outline) on lapis-1 fills'],
  ['white', 'ink', 'Focus ring (white halo) on night sections'],
  ['white', 'night-panel', 'Focus ring (white halo) on night panels'],
  ['lapis', 'white', 'Focus ring: navy outline against its own white halo'],
  ['amber', 'glass-night on ink', 'Day view "now" line and dot on the night panel'],
  ['amber-edge', 'sky-100', '"Now" line edge where it crosses a schedule block'],
  ['amber-edge', 'amber', '"Now" line edge across the current (gold) block'],
  ['amber', 'night-panel', 'Jadwal shalat: next-prayer ring on its card'],
  ['amber-edge', 'mist', 'Sun edge on the day sky'],
  ['amber-edge', 'hill-1', 'Sun edge where it meets the front hill'],
  ['amber-edge', 'dawn-top', 'Sun edge on the dawn sky'],
  ['amber-edge', 'dawn-glow', 'Sun edge on the dawn glow'],
  ['amber-edge', 'dusk-top', 'Sun edge on the dusk sky'],
  ['amber-edge', 'dusk-glow', 'Sun edge on the dusk glow'],
  ['lapis-5', 'white', 'Juz Kelas XI cells against the white card'],
  ['lapis-4', 'white', 'Juz Kelas X cells against the white card'],
];
const rows = [];
let fails = 0;
for (const [fg, bg, size, where] of text) {
  const r = ratio(T[fg], T[bg]); const need = size === 'large' ? 3 : 4.5; const ok = r >= need; if (!ok) fails++;
  rows.push(`| ${where} | \`${fg}\` ${T[fg]} | \`${bg}\` ${T[bg]} | ${r.toFixed(2)} | ${need} | ${ok ? 'pass' : '**FAIL**'} |`);
}
const urows = [];
for (const [fg, bg, where] of ui) {
  const r = ratio(T[fg], T[bg]); const ok = r >= 3; if (!ok) fails++;
  urows.push(`| ${where} | \`${fg}\` ${T[fg]} | \`${bg}\` ${T[bg]} | ${r.toFixed(2)} | 3 | ${ok ? 'pass' : '**FAIL**'} |`);
}
const ramp = ['lapis-1', 'lapis-2', 'lapis-3', 'lapis-4', 'lapis-5'];
const nrows = ramp.slice(1).map((k, i) => `| \`${ramp[i]}\` ${T[ramp[i]]} → \`${k}\` ${T[k]} | ${ratio(T[ramp[i]], T[k]).toFixed(2)} |`);
const head = '| Where | Foreground | Background | Ratio | Needs | Result |\n|---|---|---|---|---|---|';
console.log('### Text (1.4.3)\n' + head + '\n' + rows.join('\n'));
console.log('\n### Non-text UI and graphics (1.4.11)\n' + head + '\n' + urows.join('\n'));
console.log('\n### Juz map: neighbouring steps (luminance ratio, informational)\n| Steps | Ratio |\n|---|---|\n' + nrows.join('\n'));
console.log(`\nFailures: ${fails}`);
process.exitCode = fails ? 1 : 0;
