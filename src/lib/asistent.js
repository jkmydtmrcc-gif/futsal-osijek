/**
 * Prepoznavanje teme pitanja za klupskog asistenta.
 *
 * Stoji odvojeno od komponente i bez ijednog uvoza iz Reacta, pa se može
 * provjeriti običnim Nodeom (`npm test`). Upravo je ovdje nastala greška
 * koju se u pregledniku lako previdi: na „gdje kupiti dres“ asistent je
 * odgovarao o dvorani.
 */

/**
 * Ključne riječi po temi.
 *
 * Stoje ovdje, a ne u komponenti, da ih provjera može gađati izravno —
 * inače bi test provjeravao izmišljeni popis, a stranica radila po svojem.
 *
 * Dvije stvari se pokazale bitnima:
 * • „kupit“ samo za sebe ne znači ništa — kupuje se i ulaznica i dres. Zato
 *   stoje cijeli izrazi („kupit ulaznic“, „kupit dres“).
 * • upitne riječi imaju i svoj puni izraz („kada igra“, „gdje se igra“), pa
 *   pobijede kad pitanje stvarno o tome i govori.
 */
export const TEME_RIJECI = {
  utakmica: ['utakmic', 'kad igra', 'kada igra', 'sljedec', 'iduc', 'termin', 'raspored', 'kolo', 'kada', 'kad'],
  tablica: ['tablic', 'poredak', 'mjesto', 'bodov', 'koliko bod', 'liga'],
  dvorana: ['dvoran', 'adres', 'lokacij', 'zrinjevac', 'kako doc', 'parking', 'doci', 'gdje se igra', 'gdje'],
  ulaznice: ['ulaznic', 'karte', 'kupit ulaznic', 'kupit kart', 'cijena ulaz', 'tribin'],
  kontakt: ['kontakt', 'mail', 'email', 'telefon', 'broj tel', 'javit', 'pisat'],
  dres: ['dres', 'shop', 'kupit dres', 'oprema', 'lopta', 'artikl', 'trgovin', 'salasport'],
  postava: ['igrac', 'postav', 'momcad', 'kapetan', 'trener', 'vratar', 'stozer', 'tko igra'],
  novosti: ['novost', 'vijest', 'objav', 'sto ima nov', 'transfer'],
  klub: ['klub', 'osnovan', 'povijest', 'uspjeh', 'o vama', 'boje'],
};

/** Miče kvačice i velika slova, pa „utakmica“ i „UTAKMICA“ budu isto. */
export function norm(s) {
  return String(s ?? '')
    .toLocaleLowerCase('hr-HR')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd');
}

/**
 * Upitne riječi stoje u gotovo svakom pitanju i ne govore o čemu je riječ,
 * pa nose samo mrvicu boda — dovoljno da razdvoje neriješeno, premalo da
 * nadglasaju pravu ključnu riječ.
 */
const UPITNE = ['gdje', 'kada', 'kad', 'kako', 'tko', 'koliko', 'koje', 'sto', 'zasto'];

/** Bodovi jedne teme za zadano pitanje. Duži izraz je specifičniji. */
export function bodujTemu(tema, pitanje) {
  const t = norm(pitanje);
  return tema.rijeci.reduce((zbroj, rijec) => {
    if (!t.includes(rijec)) return zbroj;
    return zbroj + (UPITNE.includes(rijec) ? 0.25 : rijec.length);
  }, 0);
}

/**
 * Tema s najviše bodova, ili `null` kad nijedna riječ ne pogađa — tada
 * asistent kaže da ne zna, umjesto da nagađa.
 */
export function odaberiTemu(teme, pitanje) {
  if (!norm(pitanje).trim()) return null;

  let najbolja = null;
  let najviše = 0;

  teme.forEach((tema) => {
    const b = bodujTemu(tema, pitanje);
    if (b > najviše) {
      najviše = b;
      najbolja = tema;
    }
  });

  return najviše > 0 ? najbolja : null;
}
