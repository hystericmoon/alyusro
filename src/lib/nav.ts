import { levels, loginUrl, registerUrl, schoolUrl, infoGroupUrl } from './site';

export type NavLink = { label: string; href: string; note?: string };
export type NavGroup = { label: string; links: NavLink[] };

/** Header menu groups, from the site map (design/Peta-situs.dc.html). */
export const mainNav: NavGroup[] = [
  {
    label: 'Profil',
    links: [
      { label: 'Tentang kami', href: '/tentang/' },
      { label: 'Pengajar dan pengurus', href: '/pendidikan/tenaga/pendidik/' },
      { label: 'Fasilitas', href: '/fasilitas/' },
      { label: 'Prestasi', href: '/prestasi/' },
    ],
  },
  {
    label: 'Jenjang',
    links: [
      ...levels.map((l) => ({ label: l.name, href: l.path, note: l.setara })),
      { label: 'Info pendaftaran', href: '/psb/' },
    ],
  },
  {
    label: 'Kurikulum',
    links: [
      { label: 'Tahfizh', href: '/kurikulum/tahfizh/' },
      { label: 'Bahasa Arab', href: '/kurikulum/bahasa-arab/' },
      { label: 'Sehari di ma’had', href: '/sehari-di-mahad/' },
      { label: 'Kalender akademik', href: '/kalender-akademik/' },
    ],
  },
  {
    label: 'Kajian & artikel',
    links: [
      { label: 'Artikel', href: '/artikel/' },
      { label: 'Info kajian', href: '/info/kajian/' },
    ],
  },
];

/** Footer columns, as in Beranda-gabungan. */
export const footerNav: NavGroup[] = [
  mainNav[0] as NavGroup,
  {
    label: 'Kurikulum',
    links: (mainNav[2] as NavGroup).links,
  },
  {
    label: 'Layanan',
    links: [
      { label: 'Jadwal shalat', href: schoolUrl('/jadwal/shalat') },
      { label: 'Nama Latin ke Arab', href: schoolUrl('/konversi/nama') },
      { label: 'Info kajian', href: '/info/kajian/' },
      { label: 'Grup info WhatsApp', href: infoGroupUrl },
    ],
  },
];

export const actions = {
  login: { label: 'Masuk wali & asatidz', href: loginUrl },
  register: { label: 'Daftar santri baru', href: registerUrl() },
};
