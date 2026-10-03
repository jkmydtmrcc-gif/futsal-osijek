/**
 * Utakmica kao zapis.
 *
 * Do sada je utakmica bila natpis: `when` je bio slobodan tekst („Sub 17.10."),
 * a `title` jedan niz („Osijek Kandit — Futsal Dinamo"). Iz natpisa se ne da
 * izvesti ništa — ni sljedeća utakmica, ni podjela na odigrano i nadolazeće,
 * ni forma, ni rezultat.
 *
 * Ovdje se redak iz baze pretvara u zapis s pravim trenutkom, razdvojenim
 * momčadima i rezultatom. Ključno je da radi i **prije** nego itko nadogradi
 * bazu: kad novih stupaca nema, ime se razdvoji iz starog `title`, a termin
 * ostane stari tekst. Stranica tada izgleda točno kao prije, redak po redak.
 *
 * Bez ijednog uvoza iz Reacta, pa `npm test` može gađati izravno.
 */
import { formatDatum, formatSat } from './vrijeme.js';

/** Miče kvačice i velika slova, za usporedbu imena klubova. */
const norm = (s) =>
  String(s ?? '')
    .toLocaleLowerCase('hr-HR')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * „Osijek Kandit — Futsal Dinamo" → `{ home: 'Osijek Kandit', away: 'Futsal Dinamo' }`
 *
 * Ovo je nosiva finta degradacije: i redak koji nikad nije vidio novu shemu
 * daje domaćina i gosta, pa sučelje s razdvojenim momčadima radi prije
 * migracije.
 *
 * Redoslijed razdjelnika je bitan. Duga crta i „vs" su nedvosmisleni, a
 * obična crtica nije — „Torcida-Biberon" je jedno ime. Zato se crtica prihvaća
 * samo kad je okružena razmacima.
 */
export function razdvojiNaziv(naslov) {
  const tekst = String(naslov ?? '').trim();
  if (!tekst) return { home: '', away: '' };

  const razdjelnici = [/\s+[—–]\s+/, /\s+vs\.?\s+/i, /\s+-\s+/, /\s+:\s+/];
  for (const r of razdjelnici) {
    const dijelovi = tekst.split(r);
    if (dijelovi.length === 2 && dijelovi[0].trim() && dijelovi[1].trim()) {
      return { home: dijelovi[0].trim(), away: dijelovi[1].trim() };
    }
  }
  // Nema razdjelnika — cijeli naslov je „domaćin", da se bar nešto prikaže.
  return { home: tekst, away: '' };
}

/** Je li rezultat upisan? `0` je rezultat, `null` i `''` nisu. */
const imaBroj = (v) => v !== null && v !== undefined && v !== '' && Number.isFinite(Number(v));

/**
 * Redak iz baze → zapis o utakmici.
 *
 * `nasKlub` određuje perspektivu: `jeDoma`, `ishod` i `protivnik` gledaju se
 * iz kuta našeg kluba.
 */
export function matchFromRow(row, nasKlub = '') {
  const kickoff = row.kickoff || null;

  const izNaslova = razdvojiNaziv(row.title);
  const home = (row.home || '').trim() || izNaslova.home;
  const away = (row.away || '').trim() || izNaslova.away;

  const homeScore = imaBroj(row.home_score) ? Number(row.home_score) : null;
  const awayScore = imaBroj(row.away_score) ? Number(row.away_score) : null;

  // Odigrana je kad ima oba rezultata; status je samo dodatna potvrda, pa
  // odgođena utakmica s upisanim rezultatom ne ispadne „nadolazeća".
  const odigrana = (homeScore !== null && awayScore !== null) || row.status === 'odigrano';
  // Utakmica u prijenosu nije ni odigrana ni nadolazeća — ona je *sada*.
  const uzivo = row.status === 'uzivo';

  const nas = norm(nasKlub);
  const jeDoma = nas ? norm(home) === nas : true;
  const jeGost = nas ? norm(away) === nas : false;
  const nasa = jeDoma || jeGost;

  let ishod = null;
  if (odigrana && nasa && homeScore !== null && awayScore !== null) {
    const nasi = jeDoma ? homeScore : awayScore;
    const njihovi = jeDoma ? awayScore : homeScore;
    ishod = nasi > njihovi ? 'w' : nasi < njihovi ? 'l' : 'd';
  }

  return {
    id: row.id,
    slug: row.slug || '',
    kickoff,
    // Popisi i dalje čitaju `when` i `title` — zato ostaju, samo se sada
    // izvode iz trenutka kad on postoji.
    when: kickoff ? formatDatum(kickoff) : row.when || '',
    sat: kickoff ? formatSat(kickoff) : '',
    comp: row.comp || '',
    round: row.round || '',
    season: row.season || '',
    venue: row.venue || '',
    home,
    away,
    homeScore,
    awayScore,
    status: row.status || '',
    uzivo,
    title: home && away ? `${home} — ${away}` : row.title || home || '',
    score: odigrana ? `${homeScore}:${awayScore}` : '',
    outcome: ishod,
    odigrana,
    nasa,
    jeDoma,
    protivnik: jeDoma ? away : jeGost ? home : '',
    sortOrder: Number(row.sort_order ?? 0),
  };
}

/**
 * Razvrstava utakmice na odigrane i nadolazeće.
 *
 * Utakmica bez trenutka i bez rezultata ostaje u nadolazećima, u redoslijedu
 * u kojem je upisana — to je točno današnje ponašanje, pa nenadograđena baza
 * izgleda kao i prije.
 *
 * Utakmica u prijenosu izlazi iz obje skupine. Njezin je termin prošao, pa bi
 * inače pala među odigrane i traka bi je pokazala kao „zadnje odigrano" —
 * bez rezultata, jer ga još nema.
 */
export function razvrstaj(utakmice, sad = Date.now()) {
  const sada = sad instanceof Date ? sad.getTime() : sad;
  const vrijeme = (u) => (u.kickoff ? Date.parse(u.kickoff) : NaN);

  const odigrane = [];
  const nadolazece = [];
  const uzivo = utakmice.find((u) => u.uzivo) ?? null;

  utakmice.forEach((u) => {
    if (u.uzivo) return;
    const t = vrijeme(u);
    if (u.odigrana || (Number.isFinite(t) && t < sada)) odigrane.push(u);
    else nadolazece.push(u);
  });

  // Odigrane: najnovija prva. Nadolazeće: najbliža prva.
  const poVremenu = (smjer) => (a, b) => {
    const ta = vrijeme(a);
    const tb = vrijeme(b);
    if (Number.isFinite(ta) && Number.isFinite(tb)) return (ta - tb) * smjer;
    if (Number.isFinite(ta)) return -1;
    if (Number.isFinite(tb)) return 1;
    return a.sortOrder - b.sortOrder;
  };

  odigrane.sort(poVremenu(-1));
  nadolazece.sort(poVremenu(1));

  return {
    odigrane,
    nadolazece,
    uzivo,
    zadnja: odigrane.find((u) => u.nasa) ?? null,
    sljedeca: nadolazece.find((u) => u.nasa) ?? null,
  };
}

/**
 * Forma: zadnjih `n` ishoda, od najstarijeg prema najnovijem.
 *
 * Čita se slijeva nadesno kao na svakoj tablici, pa se popis odigranih
 * (najnovija prva) ovdje okreće.
 */
export function forma(odigrane, n = 5) {
  return odigrane
    .filter((u) => u.nasa && u.outcome)
    .slice(0, n)
    .map((u) => u.outcome)
    .reverse();
}

/** Grupira po natjecanju, u redoslijedu prvog pojavljivanja. */
export function poNatjecanju(utakmice) {
  const mapa = new Map();
  utakmice.forEach((u) => {
    const kljuc = u.comp || 'Ostalo';
    if (!mapa.has(kljuc)) mapa.set(kljuc, []);
    mapa.get(kljuc).push(u);
  });
  return [...mapa.entries()].map(([comp, matches]) => ({ comp, matches }));
}

/*
 * ── Uvoz rasporeda lijepljenjem ────────────────────────────────────────────
 *
 * Bez ovoga cijela priča ne vrijedi ništa: sve gore je vodovod koji istinite
 * podatke čini lijepima, a nitko neće ručno utipkati 22 termina kroz obrazac.
 *
 * Prima ono što se dobije kad se s HNS Semafora ili iz klupskog rasporeda
 * označi i kopira kolo. Namjerno je popustljiv oko oblika, jer se lijepi
 * tekst iz tablice, a ne uredan zapis:
 *
 *   17.10.2026. 19:00  Osijek Kandit - Futsal Dinamo  Zrinjevac
 *   24.10. 19:00 Olmissum — Osijek Kandit
 *   2026-10-28 20:00 | Osijek Kandit : Crnica | Zrinjevac
 */

/**
 * Odvaja datum od ostatka retka.
 *
 * Datum mora ići prvi i mora se **maknuti** iz teksta prije traženja sata:
 * `17.10.2026.` inače prođe i kao sat („17.10"), pa termin ispadne 17:10.
 */
function odvojiDatum(tekst, zadanaGodina) {
  const iso = tekst.match(/(\d{4})-(\d{1,2})-(\d{1,2})\.?/);
  if (iso) {
    return {
      datum: `${iso[1]}-${iso[2].padStart(2, '0')}-${iso[3].padStart(2, '0')}`,
      ostatak: tekst.replace(iso[0], ' '),
    };
  }

  const hr = tekst.match(/\b(\d{1,2})\.\s*(\d{1,2})\.(?:\s*(\d{4})\.?)?/);
  if (!hr) return { datum: null, ostatak: tekst };

  return {
    datum: `${hr[3] || zadanaGodina}-${hr[2].padStart(2, '0')}-${hr[1].padStart(2, '0')}`,
    ostatak: tekst.replace(hr[0], ' '),
  };
}

/** Sat iz ostatka retka. Dvotočje je sigurno, točka tek kad dvotočja nema. */
function odvojiSat(tekst) {
  const sDvotockom = tekst.match(/\b([01]?\d|2[0-3]):([0-5]\d)\b/);
  const pogodak = sDvotockom ?? tekst.match(/\b([01]?\d|2[0-3])\.([0-5]\d)\b/);
  if (!pogodak) return { vrijeme: null, ostatak: tekst };
  return {
    vrijeme: `${pogodak[1].padStart(2, '0')}:${pogodak[2]}`,
    ostatak: tekst.replace(pogodak[0], ' '),
  };
}

/**
 * Tekst → redci za pregled prije upisa.
 *
 * Vraća i retke koje nije uspio pročitati (`greska`), da ih uređivač vidi i
 * ispravi umjesto da tiho nestanu. Tiho preskakanje je ovdje najgore moguće
 * ponašanje: klub bi mislio da je upisao cijelo kolo, a fali mu utakmica.
 *
 * Stupci se razdvajaju uspravnom crtom, tabulatorom ili s dva i više razmaka
 * — tako se lijepi iz tablice, gdje je dvorana svoj stupac.
 */
export function rasclaniRaspored(tekst, { godina = new Date().getFullYear(), comp = '', venue = '' } = {}) {
  return String(tekst ?? '')
    .split(/\r?\n/)
    .map((redak) => redak.trim())
    .filter(Boolean)
    .map((redak, i) => {
      const poDatumu = odvojiDatum(redak, godina);
      const poSatu = odvojiSat(poDatumu.ostatak);

      const stupci = poSatu.ostatak
        .split(/\s*\|\s*|\t+|\s{2,}/)
        .map((d) => d.trim())
        .filter(Boolean);

      const { home, away } = razdvojiNaziv(stupci[0] ?? '');
      const dvorana = stupci[1] ?? venue;

      const greska = !poDatumu.datum
        ? 'nema datuma'
        : !home || !away
          ? 'ne prepoznajem momčadi'
          : null;

      return {
        redniBroj: i + 1,
        izvor: redak,
        greska,
        datum: poDatumu.datum,
        vrijeme: poSatu.vrijeme ?? '19:00',
        home,
        away,
        comp,
        venue: dvorana,
      };
    });
}
