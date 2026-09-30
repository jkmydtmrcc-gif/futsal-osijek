/**
 * Datum i vrijeme utakmice.
 *
 * Sve ide preko ugrađenog `Intl` — nijedna knjižnica za datume. Preglednik
 * već nosi cijelu bazu vremenskih zona, pa bi dodavanje knjižnice bilo
 * stotinjak kilobajta za posao koji platforma radi sama.
 *
 * Zona je fiksno Zagreb, a ne korisnikova: utakmica počinje u 19:00 po
 * Zagrebu i za navijača u Osijeku i za onog u Münchenu. Kad bi se pisalo po
 * lokalnoj zoni, isti termin bi pisao drukčije ovisno o tome gdje je tko.
 *
 * Bez ijednog uvoza, pa `npm test` može gađati izravno.
 */

export const ZONA = 'Europe/Zagreb';

/**
 * Pomak zone u minutama za zadani trenutak.
 *
 * Hrvatska ima ljetno računanje vremena, pa pomak nije stalan: +60 zimi,
 * +120 ljeti. Zato se traži za konkretan trenutak, a ne jednom zauvijek.
 */
function pomakMinuta(trenutak, zona = ZONA) {
  const dio = new Intl.DateTimeFormat('en-US', { timeZone: zona, timeZoneName: 'shortOffset' })
    .formatToParts(trenutak)
    .find((p) => p.type === 'timeZoneName')?.value;

  // „GMT" bez broja znači pomak nula (Britanija zimi).
  const pogodak = String(dio ?? '').match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  if (!pogodak) return 0;

  const znak = pogodak[1] === '-' ? -1 : 1;
  return znak * (Number(pogodak[2]) * 60 + Number(pogodak[3] ?? 0));
}

/**
 * Datum i sat iz obrasca → trenutak u vremenu.
 *
 * Administracija ima dva domaća polja, `date` i `time`, jer nitko ne tipka
 * ISO nizove. Ovdje se spajaju u trenutak, uz pomak zone koji vrijedi baš
 * tog datuma.
 *
 * Pomak se traži dvaput: prvi put za pogođeni trenutak, pa se ispravi i
 * provjeri je li se time prešlo preko granice ljetnog vremena. Bez toga bi
 * utakmica u noći prijelaza ispala sat ranije ili kasnije.
 */
export function spojiDatumVrijeme(datum, vrijeme, zona = ZONA) {
  if (!datum) return null;
  const sat = vrijeme || '00:00';

  const kaoUtc = Date.parse(`${datum}T${sat}:00Z`);
  if (Number.isNaN(kaoUtc)) return null;

  const prvi = pomakMinuta(kaoUtc, zona);
  let trenutak = kaoUtc - prvi * 60000;

  const drugi = pomakMinuta(trenutak, zona);
  if (drugi !== prvi) trenutak = kaoUtc - drugi * 60000;

  return new Date(trenutak).toISOString();
}

/** Trenutak → `{ datum, vrijeme }` za dva polja obrasca. */
export function razdvojiDatumVrijeme(iso, zona = ZONA) {
  if (!iso) return { datum: '', vrijeme: '' };
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return { datum: '', vrijeme: '' };

  const dijelovi = new Intl.DateTimeFormat('en-CA', {
    timeZone: zona,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(t);

  const uzmi = (tip) => dijelovi.find((p) => p.type === tip)?.value ?? '';
  return {
    datum: `${uzmi('year')}-${uzmi('month')}-${uzmi('day')}`,
    // Ponoć `Intl` zna ispisati kao „24"; obrazac to ne prima.
    vrijeme: `${uzmi('hour') === '24' ? '00' : uzmi('hour')}:${uzmi('minute')}`,
  };
}

/** Veliko prvo slovo — `Intl` vraća „sub", a na stranici piše „Sub". */
const veliko = (t) => (t ? t.charAt(0).toLocaleUpperCase('hr-HR') + t.slice(1) : t);

/** `Sub 17.10.` — kratki oblik za popise i traku. */
export function formatDatum(iso, zona = ZONA) {
  const t = Date.parse(iso ?? '');
  if (Number.isNaN(t)) return '';
  const tekst = new Intl.DateTimeFormat('hr-HR', {
    timeZone: zona,
    weekday: 'short',
    day: 'numeric',
    month: 'numeric',
  }).format(t);
  // hr-HR vraća „sub, 17. 10." — zarez i razmaci se ovdje stišću.
  return veliko(tekst.replace(',', '').replace(/\s+/g, ' ').replace(/(\d+)\. (\d+)\./, '$1.$2.'));
}

/** `19:00` */
export function formatSat(iso, zona = ZONA) {
  const t = Date.parse(iso ?? '');
  if (Number.isNaN(t)) return '';
  return new Intl.DateTimeFormat('hr-HR', {
    timeZone: zona,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(t);
}

/** `subota, 17. listopada 2026. u 19:00` — za stranicu utakmice i `datetime`. */
export function formatPuni(iso, zona = ZONA) {
  const t = Date.parse(iso ?? '');
  if (Number.isNaN(t)) return '';
  const dan = new Intl.DateTimeFormat('hr-HR', {
    timeZone: zona,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(t);
  return `${dan} u ${formatSat(iso, zona)}`;
}

/**
 * Koliko je ostalo do trenutka.
 *
 * `sad` se ubrizgava, a ne uzima iz `Date.now()`, da provjera bude
 * ponovljiva. Vraća pune dane i sate — **bez sekundi**: otkucavajući brojač
 * je ukras koji klupskoj stranici ne stoji, a „za 3 dana" kaže sve što treba.
 */
export function zaKoliko(iso, sad = Date.now()) {
  const t = Date.parse(iso ?? '');
  if (Number.isNaN(t)) return null;

  const razlika = t - (sad instanceof Date ? sad.getTime() : sad);
  const proslo = razlika < 0;
  const minuta = Math.floor(Math.abs(razlika) / 60000);

  return { proslo, dana: Math.floor(minuta / 1440), sati: Math.floor((minuta % 1440) / 60), minuta: minuta % 60 };
}

/** „za 3 dana", „za 2 sata", „uskoro", „prije 5 dana" — kratko i ljudski. */
export function opisRazmaka(iso, sad = Date.now()) {
  const r = zaKoliko(iso, sad);
  if (!r) return '';

  const jedinica = r.dana > 0
    ? `${r.dana} ${r.dana === 1 ? 'dan' : r.dana < 5 ? 'dana' : 'dana'}`
    : r.sati > 0
      ? `${r.sati} ${r.sati === 1 ? 'sat' : r.sati < 5 ? 'sata' : 'sati'}`
      : null;

  if (!jedinica) return r.proslo ? 'upravo odigrano' : 'uskoro';
  return r.proslo ? `prije ${jedinica}` : `za ${jedinica}`;
}
