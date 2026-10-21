/**
 * Latin-to-Arabic script for names (/konversi/nama). Names with a settled
 * Arabic spelling come from the dictionary below; any other word is written
 * by sound with the conventions Indonesian schools use for name tags and
 * certificates (p → ف, g → ج, c → تش, ng → نج, final -ah → ة). Runs in the
 * browser; the old Laravel endpoint answered "Belum terdefinisi" for any
 * name outside its list.
 */

const DICT: Record<string, string> = {
  // Names of the Prophet ﷺ, his family and companions
  muhammad: 'محمد', muhamad: 'محمد', mohammad: 'محمد', mochammad: 'محمد', moh: 'محمد', ahmad: 'أحمد', achmad: 'أحمد',
  mahmud: 'محمود', mahmood: 'محمود', hamid: 'حامد', hamidah: 'حميدة', hamdan: 'حمدان', mustafa: 'مصطفى', musthafa: 'مصطفى',
  abdullah: 'عبد الله', abdurrahman: 'عبد الرحمن', abdurrahim: 'عبد الرحيم', abdulaziz: 'عبد العزيز', abdulloh: 'عبد الله',
  abdul: 'عبد', abu: 'أبو', ibnu: 'ابن', bin: 'بن', binti: 'بنت', al: 'ال',
  abubakar: 'أبو بكر', bakar: 'بكر', umar: 'عمر', utsman: 'عثمان', usman: 'عثمان', ali: 'علي', hasan: 'حسن', husain: 'حسين',
  husein: 'حسين', hussein: 'حسين', hamzah: 'حمزة', abbas: 'عباس', bilal: 'بلال', salman: 'سلمان', zaid: 'زيد', zayd: 'زيد',
  khalid: 'خالد', kholid: 'خالد', saad: 'سعد', said: 'سعيد', saed: 'سعيد', anas: 'أنس', muadz: 'معاذ', muaz: 'معاذ',
  hudzaifah: 'حذيفة', huzaifah: 'حذيفة', ubay: 'أبي', ammar: 'عمار', amar: 'عمار', jafar: 'جعفر', mushab: 'مصعب',
  usamah: 'أسامة', usama: 'أسامة', thalhah: 'طلحة', zubair: 'الزبير', abdurrohman: 'عبد الرحمن',
  fatimah: 'فاطمة', fatima: 'فاطمة', aisyah: 'عائشة', aisya: 'عائشة', aisha: 'عائشة', khadijah: 'خديجة', khodijah: 'خديجة',
  zainab: 'زينب', ruqayyah: 'رقية', ruqoyyah: 'رقية', ummu: 'أم', kultsum: 'كلثوم', hafshah: 'حفصة', hafsah: 'حفصة',
  maryam: 'مريم', mariam: 'مريم', asma: 'أسماء', sumayyah: 'سمية', sumayah: 'سمية', safiyyah: 'صفية', shofiyyah: 'صفية',
  khansa: 'خنساء', nusaibah: 'نسيبة', hajar: 'هاجر', hawa: 'حواء', halimah: 'حليمة', aminah: 'آمنة',
  // Prophets
  adam: 'آدم', nuh: 'نوح', ibrahim: 'إبراهيم', ismail: 'إسماعيل', ishaq: 'إسحاق', yaqub: 'يعقوب', yusuf: 'يوسف', musa: 'موسى',
  harun: 'هارون', daud: 'داود', sulaiman: 'سليمان', sulaeman: 'سليمان', ilyas: 'إلياس', yunus: 'يونس', zakaria: 'زكريا',
  zakariya: 'زكريا', yahya: 'يحيى', isa: 'عيسى', idris: 'إدريس', ayyub: 'أيوب', ayub: 'أيوب', luqman: 'لقمان', lukman: 'لقمان',
  // Common Arabic given names in Indonesia
  rahman: 'رحمن', rahmat: 'رحمة', rahmah: 'رحمة', rohmah: 'رحمة', rahma: 'رحمة', rahim: 'رحيم', rizki: 'رزقي', rizky: 'رزقي',
  rizqi: 'رزقي', rizqy: 'رزقي', fathan: 'فتحان', fatih: 'فاتح', fath: 'فتح', fadil: 'فاضل', fadhil: 'فاضل', fadhilah: 'فضيلة',
  fadilah: 'فضيلة', faiz: 'فائز', faisal: 'فيصل', farhan: 'فرحان', fauzan: 'فوزان', fauzi: 'فوزي', firdaus: 'فردوس',
  hafidz: 'حافظ', hafiz: 'حافظ', hafizh: 'حافظ', hafidzah: 'حافظة', hafizhah: 'حافظة', hanif: 'حنيف', hanifah: 'حنيفة',
  hidayat: 'هداية', hidayah: 'هداية', huda: 'هدى', hakim: 'حكيم', saif: 'سيف', baiti: 'بيتي', hikmah: 'حكمة', ihsan: 'إحسان', ikhsan: 'إحسان', ilham: 'إلهام', iman: 'إيمان',
  imam: 'إمام', irfan: 'عرفان', ismah: 'عصمة', izzah: 'عزة', izzat: 'عزة', jamal: 'جمال', jamil: 'جميل', jamilah: 'جميلة',
  karim: 'كريم', karimah: 'كريمة', khairunnisa: 'خير النساء', khoirunnisa: 'خير النساء', khairul: 'خير', khoirul: 'خير',
  latif: 'لطيف', latifah: 'لطيفة', lutfi: 'لطفي', luthfi: 'لطفي', mahdi: 'مهدي', malik: 'مالك', mansur: 'منصور',
  manshur: 'منصور', muslim: 'مسلم', muslimah: 'مسلمة', mukmin: 'مؤمن', mumtaz: 'ممتاز', munir: 'منير', nabil: 'نبيل',
  nabila: 'نبيلة', nabilah: 'نبيلة', nadia: 'نادية', nadiya: 'نادية', nafisah: 'نفيسة', naufal: 'نوفل', nisa: 'نساء',
  nur: 'نور', nurul: 'نور', najib: 'نجيب', najwa: 'نجوى', qanita: 'قانتة', qonita: 'قانتة', qolbi: 'قلبي', rasyid: 'رشيد',
  rasyidah: 'رشيدة', ridwan: 'رضوان', ridho: 'رضا', ridha: 'رضا', rida: 'رضا', rafi: 'رافع', rais: 'رئيس', ramadhan: 'رمضان',
  ramadan: 'رمضان', romadhon: 'رمضان', salim: 'سالم', salma: 'سلمى', salsabila: 'سلسبيل', salsabilla: 'سلسبيل',
  shalih: 'صالح', sholih: 'صالح', saleh: 'صالح', shalihah: 'صالحة', sholihah: 'صالحة', syafiq: 'شفيق', syahid: 'شهيد',
  syarif: 'شريف', syarifah: 'شريفة', syifa: 'شفاء', taufik: 'توفيق', taufiq: 'توفيق', wahid: 'وحيد', yasin: 'ياسين',
  yazid: 'يزيد', zahra: 'زهراء', zahrah: 'زهرة', zaki: 'زكي', zakiyah: 'زكية', zulfa: 'زلفى', zulfikar: 'ذو الفقار',
  azzam: 'عزام', azam: 'عزام', arif: 'عارف', arifah: 'عارفة', aziz: 'عزيز', azizah: 'عزيزة', amin: 'أمين', amir: 'أمير',
  amirah: 'أميرة', anisa: 'أنيسة', annisa: 'النساء', aqila: 'عقيلة', aqilah: 'عقيلة', athiyyah: 'عطية', habib: 'حبيب',
  habibah: 'حبيبة', haikal: 'هيكل', hilmi: 'حلمي', husna: 'حسنى', ikhlas: 'إخلاص', kamal: 'كمال', kamil: 'كامل',
  kautsar: 'كوثر', mubarak: 'مبارك', murtadha: 'مرتضى', nashr: 'نصر', nasir: 'ناصر', nashir: 'ناصر', rasyad: 'رشاد',
  shafa: 'صفاء', syauqi: 'شوقي', thariq: 'طارق', tariq: 'طارق', ulya: 'عليا', wafa: 'وفاء', yusro: 'يسرى', khattab: 'الخطاب', affan: 'عفان', thalib: 'طالب', abi: 'أبي',
  adib: 'أديب', adiba: 'أديبة', alif: 'ألف', fikri: 'فكري', fahmi: 'فهمي', hamzi: 'حمزي', dzaki: 'ذكي', dzakiyyah: 'ذكية',
};

/** "Nurul Huda", "Abdul Aziz": the next word takes the article. */
const ARTICLE_NEXT = new Set(['abdul', 'nurul', 'khairul', 'khoirul', 'saiful', 'syaiful', 'fathul', 'baitul', 'darul', 'hidayatul', 'izzul', 'jamalul', 'kamalul', 'zainul']);

/** Two-letter sounds first, then single letters. */
const DIGRAPHS: [string, string][] = [
  ['kh', 'خ'], ['sy', 'ش'], ['sh', 'ش'], ['dz', 'ذ'], ['dh', 'ض'], ['ts', 'ث'], ['th', 'ط'], ['gh', 'غ'],
  ['ng', 'نج'], ['ny', 'ني'], ['ch', 'تش'], ['zh', 'ظ'], ['ph', 'ف'],
];
const LETTERS: Record<string, string> = {
  b: 'ب', c: 'تش', d: 'د', f: 'ف', g: 'ج', h: 'ه', j: 'ج', k: 'ك', l: 'ل', m: 'م', n: 'ن', p: 'ف', q: 'ق', r: 'ر',
  s: 'س', t: 'ت', v: 'ف', w: 'و', x: 'كس', y: 'ي', z: 'ز',
};
const VOWEL = /[aeiou]/;

/** One word by sound. */
function bySound(word: string): string {
  let w = word.replace(/(.)\1+/g, '$1'); // "Ammar", "Rizzky": doubled letters are written once
  let out = '';
  // Final -ah is ta marbutah, as in Arabic names (Nafisah, Rohmah).
  const marbutah = w.length > 3 && w.endsWith('ah');
  if (marbutah) w = w.slice(0, -2);
  let i = 0;
  while (i < w.length) {
    const ch = w[i] as string;
    const two = w.slice(i, i + 2);
    const first = i === 0;
    if (VOWEL.test(ch)) {
      const diph = two === 'ai' || two === 'ay' ? 'ي' : two === 'au' || two === 'aw' ? 'و' : '';
      if (first) {
        out += ch === 'i' || ch === 'e' ? 'إي' : ch === 'u' || ch === 'o' ? 'أو' : 'أ';
        if (diph) { out += diph; i += 2; continue; }
      } else if (diph) {
        out += 'ا' + diph;
        i += 2;
        continue;
      } else {
        out += ch === 'a' ? 'ا' : ch === 'i' || ch === 'e' ? 'ي' : 'و';
      }
      i += 1;
      continue;
    }
    const dg = DIGRAPHS.find(([lat]) => lat === two);
    if (dg) {
      out += dg[1];
      i += 2;
      continue;
    }
    out += LETTERS[ch] ?? '';
    i += 1;
  }
  return out + (marbutah ? 'ة' : '');
}

export type Converted = { arabic: string; bySound: string[] };

/** A full name: dictionary words where known, the rest by sound. */
export function toArabic(name: string): Converted {
  const words = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’'`‘]/g, '')
    .split(/[\s.,-]+/)
    .filter(Boolean);
  const guessed: string[] = [];
  const parts: string[] = [];
  for (let k = 0; k < words.length; k++) {
    const raw = words[k] as string;
    const w = raw.replace(/[^a-z]/g, '');
    if (!w) continue;
    // "Al Fatih", "Al-Fatih": the article joins the next word.
    if ((w === 'al' || w === 'el') && k + 1 < words.length) {
      const next = (words[k + 1] as string).replace(/[^a-z]/g, '');
      parts.push('ال' + (DICT[next] ?? bySound(next)).replace(/^ال/, ''));
      if (!DICT[next]) guessed.push(`Al ${next}`);
      k += 1;
      continue;
    }
    const stem = ARTICLE_NEXT.has(w) && !DICT[w] ? w.slice(0, -2) : null;
    const known = DICT[w] ?? (stem ? DICT[stem] : undefined);
    if (known) parts.push(known);
    else {
      parts.push(bySound(stem ?? w));
      guessed.push(raw);
    }
    if (ARTICLE_NEXT.has(w) && k + 1 < words.length) {
      const next = (words[k + 1] as string).replace(/[^a-z]/g, '');
      const known2 = DICT[next];
      parts.push('ال' + (known2 ?? bySound(next)).replace(/^ال/, ''));
      if (!known2) guessed.push(words[k + 1] as string);
      k += 1;
    }
  }
  const cap = (s: string) => s.replace(/(^|\s)\S/g, (c) => c.toUpperCase());
  return { arabic: parts.join(' '), bySound: guessed.map(cap) };
}
