/**
 * Tablica lige.
 *
 * Do sada je redak imao četiri broja: mjesto, klub, odigrano, bodovi. Takva se
 * tablica čita kao maketa i kad su brojke istinite — jer nijedna futsal tablica
 * u Hrvatskoj ne izgleda tako. Standardni redak je
 * `Ut · P · N · I · G+ · G− · GR · Bod`.
 *
 * Dvije odluke nose cijelu datoteku:
 *
 * 1. **Gol-razlika se računa, ne upisuje.** Upisana bi prije ili kasnije
 *    proturječila golovima iz istog retka, a onda stranica sama sebi ne
 *    vjeruje.
 * 2. **Širina tablice se prepoznaje po podacima, a ne po shemi.**
 *    `imaDetalje` gleda ima li ijedan redak išta upisano u novim stupcima.
 *    Baza koja nikad nije vidjela migraciju vraća same nule i dobije današnju
 *    tablicu od četiri stupca — bez ijedne iznimke u sučelju.
 *
 * Tablica se **ne** računa iz rezultata: imamo samo svoje utakmice, a napola
 * točna tablica gora je greška od ručno upisane.
 *
 * Bez ijednog uvoza iz Reacta, pa `npm test` može gađati izravno.
 */

/** `'7'`, `7` i `null` → broj; sve ostalo → 0. */
const broj = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** Redak iz baze → redak za prikaz. Gol-razlika je izvedena. */
export function redakTablice(row) {
  const goalsFor = broj(row.goals_for);
  const goalsAgainst = broj(row.goals_against);

  return {
    ...row,
    pos: broj(row.pos),
    club: row.club ?? '',
    logo: row.logo ?? '',
    played: broj(row.played),
    wins: broj(row.wins),
    draws: broj(row.draws),
    losses: broj(row.losses),
    goalsFor,
    goalsAgainst,
    gd: goalsFor - goalsAgainst,
    points: broj(row.points),
  };
}

/**
 * Ima li tablica išta osim mjesta, odigranog i bodova?
 *
 * Prepoznavanje ide po podacima: nenadograđena baza nema te stupce, a
 * nadograđena ih ima s nulom. Oboje znači isto — nema se što pokazati — pa
 * oboje daje uski prikaz.
 */
export function imaDetalje(redci) {
  return (redci ?? []).some((r) => {
    const t = redakTablice(r);
    return t.wins + t.draws + t.losses + t.goalsFor + t.goalsAgainst > 0;
  });
}

/** `+7`, `0`, `−3` — s pravim minusom, ne crticom. */
export function formatGR(gd) {
  if (gd > 0) return `+${gd}`;
  if (gd < 0) return `−${Math.abs(gd)}`;
  return '0';
}

/**
 * Upozorenja na redak koji se sam sebi protivi.
 *
 * Tipfeler u tablici je najvidljivija moguća greška na klupskoj stranici, a
 * jedini koji ga može uhvatiti je aritmetika samog retka: odigrano mora biti
 * zbroj ishoda, a bodovi tri po pobjedi i jedan po neriješenom.
 *
 * Provjerava se tek kad ishodi uopće postoje — inače bi svaki stari redak
 * vikao na vlasnika koji još ništa nije ni upisao.
 */
export function provjeriRedak(row) {
  const r = redakTablice(row);
  const ishodi = r.wins + r.draws + r.losses;
  if (ishodi === 0) return [];

  const upozorenja = [];
  if (ishodi !== r.played) {
    upozorenja.push(`Odigrano piše ${r.played}, a P+N+I daje ${ishodi}.`);
  }

  const bodovi = r.wins * 3 + r.draws;
  if (bodovi !== r.points) {
    upozorenja.push(`Bodova ima ${r.points}, a 3·${r.wins}+${r.draws} daje ${bodovi}.`);
  }

  return upozorenja;
}

/**
 * Forma se prikazuje samo uz naš redak.
 *
 * Rezultate drugih klubova nemamo — imamo samo svoje utakmice. Lažna forma uz
 * tuđi redak bila bi izmišljotina, a prazna bi izgledala kao kvar.
 */
export function formaKluba(redak, forma) {
  return redak.isUs ? (forma ?? []) : [];
}

/**
 * Tablica spremna za prikaz: izvedeni brojevi i oznake koji je redak naš i
 * koji vodi u doigravanje.
 */
export function slozi(redci, { ourClub = '', playoffCutoff = 0, forma = [] } = {}) {
  return (redci ?? []).map((row) => {
    const r = redakTablice(row);
    r.isUs = r.club === ourClub;
    r.isPlayoff = r.pos > 0 && r.pos <= playoffCutoff;
    r.forma = formaKluba(r, forma);
    return r;
  });
}
