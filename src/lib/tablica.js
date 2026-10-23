/**
 * Tablica lige.
 *
 * Do sada je redak imao četiri broja: mjesto, klub, odigrano, bodovi. Takva se
 * tablica čita kao maketa i kad su brojke istinite — jer nijedna futsal tablica
 * ne izgleda tako. Puni redak je
 * `Ut · P · N · I · GR · Golovi (dani:primljeni) · Posljednjih 5 · Bod`,
 * a tablica je podijeljena u zone: doigravanje, doigravanje za ostanak i
 * ispadanje.
 *
 * Tri odluke nose cijelu datoteku:
 *
 * 1. **Gol-razlika se računa, ne upisuje.** Upisana bi prije ili kasnije
 *    proturječila golovima iz istog retka, a onda stranica sama sebi ne
 *    vjeruje.
 * 2. **Širina tablice se prepoznaje po podacima, a ne po shemi.**
 *    `imaDetalje` gleda ima li ijedan redak išta upisano u novim stupcima.
 *    Baza koja nikad nije vidjela migraciju vraća same nule i dobije današnju
 *    tablicu od četiri stupca — bez ijedne iznimke u sučelju.
 *
 * 3. **Zone se računaju iz mjesta, ne upisuju.** Vlasnik upiše koliko mjesta
 *    vodi u doigravanje te koliko ih je za ostanak i ispadanje; tko je u kojoj
 *    zoni izvede se pri čitanju. Tako ih ne treba prepisivati kad se poredak
 *    promijeni, a klub koji prijeđe crtu odmah promijeni boju.
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
    form: typeof row.form === 'string' ? row.form : '',
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

/** Koliko se ishoda prikazuje u stupcu „Posljednjih 5“. */
export const BROJ_FORME = 5;

/**
 * Upisana forma → `['w','d','l']`, najstariji prvi.
 *
 * Vlasnik smije pisati hrvatski (`PPN`, pobjeda · neriješeno · izgubljeno) ili
 * engleski (`WWD`), velikim ili malim slovima, s razmacima ili zarezima —
 * slova se ne sudaraju, pa se sve čita bez pitanja. Ako je upisano više od
 * pet ishoda, vrijedi zadnjih pet: najnoviji su na kraju.
 */
export function formaIzTeksta(tekst) {
  const mapa = { p: 'w', w: 'w', n: 'd', d: 'd', i: 'l', l: 'l' };
  return String(tekst ?? '')
    .toLowerCase()
    .split('')
    .filter((c) => c in mapa)
    .map((c) => mapa[c])
    .slice(-BROJ_FORME);
}

/**
 * Forma jednog retka.
 *
 * Upisana forma ima prednost — vlasnik ju je namjerno napisao, a stupac uz
 * nju ima brojke iz službene tablice. Za naš klub, dok ništa nije upisano,
 * forma se računa iz naših odigranih utakmica. Za tuđe klubove nemamo
 * rezultate, pa bez upisa stoji prazno: izmišljena forma gora je od nikakve.
 */
export function formaKluba(redak, izUtakmica) {
  const upisana = formaIzTeksta(redak.form);
  if (upisana.length > 0) return upisana;
  return redak.isUs ? (izUtakmica ?? []).slice(-BROJ_FORME) : [];
}

/**
 * Ima li ijedan redak formu?
 *
 * Isto kao `imaDetalje`: stupac se pojavi tek kad ima što pokazati. Tablica
 * u kojoj svaki redak ima praznu traku izgleda kao kvar.
 */
export function imaFormu(redci) {
  return (redci ?? []).some((r) => (r.forma?.length ?? 0) > 0);
}

/** Nazivi zona onako kako se ispisuju iznad skupine redaka. */
export const ZONE = {
  doigravanje: 'Doigravanje',
  ostanak: 'Doigravanje za ostanak',
  ispadanje: 'Ispadanje',
};

/**
 * Zona jednog retka: `'doigravanje' | 'ostanak' | 'ispadanje' | null`.
 *
 * Vrh se računa po mjestu (prvih `doigravanje`), dno po poretku redaka:
 * zadnjih `ispadanje`, a neposredno iznad njih `ostanak`. Doigravanje ima
 * prednost, pa u maloj ligi zone ne mogu progutati jedna drugu — a što ostane
 * u sredini, nema zonu i nema naslov.
 *
 * `doigravanje` jednako nuli gasi sve zone: tablica bez doigravanja nema što
 * obojiti.
 */
export function oznaciZone(redci, { doigravanje = 0, ostanak = 0, ispadanje = 0 } = {}) {
  const mjesta = Math.max(0, broj(doigravanje));
  if (mjesta === 0) return redci.map(() => null);

  const ranga = redci.filter((r) => r.pos > 0).sort((a, b) => a.pos - b.pos);
  const slobodni = ranga.filter((r) => r.pos > mjesta);
  const dolje = Math.min(Math.max(0, broj(ispadanje)), slobodni.length);
  const ispod = slobodni.slice(slobodni.length - dolje);
  const preostalo = slobodni.slice(0, slobodni.length - dolje);
  const sredina = Math.min(Math.max(0, broj(ostanak)), preostalo.length);
  const zaOstanak = preostalo.slice(preostalo.length - sredina);

  return redci.map((r) => {
    if (r.pos > 0 && r.pos <= mjesta) return 'doigravanje';
    if (ispod.includes(r)) return 'ispadanje';
    if (zaOstanak.includes(r)) return 'ostanak';
    return null;
  });
}

/**
 * Redci u skupine uzastopnih istih zona — to je ono što se crta: naslov, pa
 * redci pod njim. Redci bez zone čine skupinu bez naslova.
 */
export function grupirajZone(redci) {
  const skupine = [];
  for (const redak of redci) {
    const zadnja = skupine[skupine.length - 1];
    if (zadnja && zadnja.zona === redak.zona) zadnja.redci.push(redak);
    else skupine.push({ zona: redak.zona, naslov: ZONE[redak.zona] ?? '', redci: [redak] });
  }
  return skupine;
}

/**
 * Tablica spremna za prikaz: izvedeni brojevi, oznake koji je redak naš, u
 * kojoj je zoni i kakva mu je forma.
 */
export function slozi(
  redci,
  { ourClub = '', playoffCutoff = 0, relegationPlayoff = 0, relegation = 0, forma = [] } = {}
) {
  const slozeni = (redci ?? []).map((row) => {
    const r = redakTablice(row);
    r.isUs = r.club === ourClub;
    r.forma = formaKluba(r, forma);
    return r;
  });

  const zone = oznaciZone(slozeni, {
    doigravanje: playoffCutoff,
    ostanak: relegationPlayoff,
    ispadanje: relegation,
  });
  slozeni.forEach((r, i) => {
    r.zona = zone[i];
    r.isPlayoff = r.zona === 'doigravanje';
  });

  return slozeni;
}
