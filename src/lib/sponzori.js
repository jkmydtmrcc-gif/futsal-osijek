/**
 * Sponzori: poredak razina, podjela podupiratelja na redove i mjere trake.
 *
 * Bez ijednog uvoza iz Reacta, pa `npm test` može gađati izravno.
 */

const norm = (s) =>
  String(s ?? '')
    .toLocaleLowerCase('hr-HR')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, ' ')
    .trim();

/** Glavni, pa gold, pa podupiratelji. Što nije među njima ide na kraj. */
const REDOSLIJED = ['glavni', 'gold', 'podupir'];

/**
 * Razine u pravom redoslijedu, bez obzira kako su upisane.
 *
 * Razine su dolazile onim redom kojim se prvi put pojavi njihov sponzor u
 * tablici, pa je vlasnik koji je prvo upisao podupiratelja dobio stranicu s
 * podupirateljima iznad glavnog sponzora. Redoslijed je pravilo stranice, ne
 * posljedica redoslijeda unosa.
 *
 * Prepoznaje se po oznaci i po naslovu razine („Gold sponzori", „gold",
 * „Podupiratelji"), bez obzira na velika slova i kvačice.
 */
export function razvrstajRazine(razine) {
  const rang = (t) => {
    const kljuc = `${norm(t.id)} ${norm(t.tag)}`;
    const i = REDOSLIJED.findIndex((r) => kljuc.includes(r));
    return i === -1 ? REDOSLIJED.length : i;
  };
  return (razine ?? [])
    .map((t, i) => ({ t, i }))
    .sort((a, b) => rang(a.t) - rang(b.t) || a.i - b.i)
    .map((x) => x.t);
}

/** Je li ovo razina podupiratelja (ona koja ide u redove s karuselom)? */
export const jePodupiratelj = (razina) =>
  `${norm(razina?.id)} ${norm(razina?.tag)}`.includes('podupir');

/** Koliko podupiratelja treba da trake imaju smisla. */
export const NAJMANJE_ZA_REDOVE = 6;

/**
 * Podupiratelji u redove za karusel.
 *
 * Dijele se kružno (1., 4., 7. u prvi red…), pa su redovi jednako dugi i
 * sponzori ostaju u upisanom redoslijedu — prvi red počinje prvim, drugi
 * drugim. Redovi se ne dijele na uzastopne komade: tada bi prvi red uvijek
 * bio „najstariji" sponzori, a zadnji najnoviji.
 *
 * S premalo sponzora vraća `null`, a stranica ih tada slaže u običnu mrežu.
 * Karusel s dva logotipa koji kruže u tri reda bio bi isti logotip ponovljen
 * dvadeset puta — izgledao bi kao kvar, ne kao partneri.
 */
export function razdijeliNaRedove(sponzori, redova = 3, najmanje = NAJMANJE_ZA_REDOVE) {
  if (!sponzori || sponzori.length < najmanje) return null;
  const redovi = Array.from({ length: redova }, () => []);
  sponzori.forEach((s, i) => redovi[i % redova].push(s));
  return redovi;
}

/** Red 0 klizi ulijevo, red 1 udesno, red 2 ulijevo… */
export const smjerReda = (i) => (i % 2 === 0 ? 'lijevo' : 'desno');

/**
 * Popis ponovljen dok jedna polovica trake nije šira od ekrana.
 *
 * Traka pomiče stazu za pola, pa polovica mora prekriti cijeli ekran — inače
 * se na širokom monitoru na kraju vidi prazna rupa. Ponavlja se cijeli popis,
 * ne dio njega, da dvije polovice budu istovjetne i petlja bešavna.
 */
export function popuniTraku(sponzori, sirinaCelije, razmak = 12, sirinaEkrana = 2200) {
  if (!sponzori?.length) return [];
  const potrebno = Math.max(2, Math.ceil(sirinaEkrana / (sirinaCelije + razmak)));
  const out = [];
  while (out.length < potrebno) out.push(...sponzori);
  return out;
}

/**
 * Trajanje jednog kruga u sekundama, iz brzine u pikselima na sekundu.
 *
 * Fiksno trajanje dalo bi redovima različitog broja logotipa različite
 * brzine — kraći red bi jurio, duži puzao. Računa se iz puta (jedna polovica
 * trake), pa svi redovi idu istom brzinom, a redovi se razlikuju tek malo
 * da ne klize u koraku.
 */
export function trajanjeTrake(brojStavki, sirinaCelije, razmak = 12, brzina = 36) {
  return Math.max(8, Math.round((brojStavki * (sirinaCelije + razmak)) / brzina));
}

/** Širina pločice u traci po veličini razine, u pikselima. */
export const SIRINA_CELIJE = { lg: 360, md: 240, sm: 188 };
