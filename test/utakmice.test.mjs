/**
 * Provjera zapisa o utakmici.
 *
 * Ovdje se lome tri stvari koje se u pregledniku ne vide odmah:
 * razdvajanje imena („Torcida-Biberon" je jedno ime, ne dva kluba),
 * rezultat 0:0 (koji je rezultat, a ne „nema rezultata") i perspektiva
 * našeg kluba kad igramo u gostima.
 */
import { razdvojiNaziv, matchFromRow, razvrstaj, forma, poNatjecanju, rasclaniRaspored } from '../src/lib/utakmice.js';

let pao = 0;
const jest = (uvjet, opis) => {
  console.log(`  ${uvjet ? '✓' : '✗'} ${opis}`);
  if (!uvjet) pao += 1;
};

const NAS = 'Osijek Kandit';

console.log('\nrazdvajanje naslova na domaćina i gosta');
{
  const r = razdvojiNaziv('Osijek Kandit — Futsal Dinamo');
  jest(r.home === 'Osijek Kandit' && r.away === 'Futsal Dinamo', 'duga crta');
}
jest(razdvojiNaziv('Olmissum – Osijek Kandit').away === 'Osijek Kandit', 'srednja crta');
jest(razdvojiNaziv('Osijek Kandit vs Rijeka').away === 'Rijeka', '„vs"');
jest(razdvojiNaziv('Osijek Kandit - Square').away === 'Square', 'crtica s razmacima');
{
  // Ovo je razlog zašto se crtica prihvaća samo s razmacima uokolo.
  const r = razdvojiNaziv('Torcida-Biberon');
  jest(r.home === 'Torcida-Biberon' && r.away === '', 'ime s crticom ostaje jedno ime');
}
{
  const r = razdvojiNaziv('Torcida-Biberon — Osijek Kandit');
  jest(r.home === 'Torcida-Biberon' && r.away === 'Osijek Kandit', 'ime s crticom uz pravi razdjelnik');
}
jest(razdvojiNaziv('').home === '', 'prazno ostaje prazno');

console.log('\nnenadograđena baza (stari redak)');
{
  const u = matchFromRow(
    { id: 'a', sort_order: 1, when: 'Sub 17.10.', comp: 'HMNL · 7. kolo', title: 'Osijek Kandit — Futsal Dinamo', venue: 'Zrinjevac' },
    NAS
  );
  jest(u.when === 'Sub 17.10.', 'termin ostaje stari tekst');
  jest(u.home === 'Osijek Kandit' && u.away === 'Futsal Dinamo', 'momčadi se izvuku iz naslova');
  jest(u.odigrana === false, 'bez rezultata nije odigrana');
  jest(u.nasa === true && u.jeDoma === true, 'prepoznata kao naša, domaća');
  jest(u.protivnik === 'Futsal Dinamo', 'protivnik je onaj drugi');
  jest(u.score === '', 'bez rezultata nema zapisa rezultata');
}

console.log('\nrezultat');
{
  const u = matchFromRow({ id: 'b', home: 'Osijek Kandit', away: 'Rijeka', home_score: 3, away_score: 2, kickoff: '2026-10-17T17:00:00Z' }, NAS);
  jest(u.odigrana && u.outcome === 'w' && u.score === '3:2', 'domaća pobjeda');
}
{
  const u = matchFromRow({ id: 'c', home: 'Olmissum', away: 'Osijek Kandit', home_score: 1, away_score: 4 }, NAS);
  jest(u.jeDoma === false && u.outcome === 'w', 'gostujuća pobjeda je pobjeda');
  jest(u.protivnik === 'Olmissum', 'protivnik u gostima je domaćin');
}
{
  // Najlakša greška: `Number('')` je 0, pa „još nije odigrano" postane 0:0.
  const u = matchFromRow({ id: 'd', home: 'Osijek Kandit', away: 'Square', home_score: 0, away_score: 0 }, NAS);
  jest(u.odigrana === true, '0:0 je odigrana utakmica');
  jest(u.outcome === 'd', '0:0 je neriješeno');
  jest(u.score === '0:0', 'rezultat piše 0:0');
}
{
  const u = matchFromRow({ id: 'e', home: 'Osijek Kandit', away: 'Square', home_score: null, away_score: null }, NAS);
  jest(u.odigrana === false && u.outcome === null, 'prazan rezultat nije odigrana');
}
{
  const u = matchFromRow({ id: 'f', home: 'Rijeka', away: 'Square', home_score: 2, away_score: 1 }, NAS);
  jest(u.nasa === false && u.outcome === null, 'tuđa utakmica nema naš ishod');
}
{
  // Odgođena, pa odigrana i upisana kasnije — status ne smije nadglasati rezultat.
  const u = matchFromRow({ id: 'g', home: 'Osijek Kandit', away: 'Vrgorac', home_score: 5, away_score: 1, status: 'odgodeno' }, NAS);
  jest(u.odigrana === true, 'upisan rezultat znači odigrana bez obzira na status');
}

console.log('\nrazvrstavanje');
{
  const sad = Date.parse('2026-10-20T12:00:00Z');
  const redci = [
    { id: '1', home: 'Osijek Kandit', away: 'Futsal Dinamo', kickoff: '2026-10-17T17:00:00Z', home_score: 3, away_score: 2 },
    { id: '2', home: 'Olmissum', away: 'Osijek Kandit', kickoff: '2026-10-24T17:00:00Z' },
    { id: '3', home: 'Osijek Kandit', away: 'Crnica', kickoff: '2026-10-28T17:00:00Z' },
    { id: '4', home: 'Osijek Kandit', away: 'Rijeka', kickoff: '2026-10-10T17:00:00Z', home_score: 1, away_score: 1 },
  ];
  const r = razvrstaj(redci.map((x) => matchFromRow(x, NAS)), sad);
  jest(r.odigrane.length === 2 && r.nadolazece.length === 2, 'podjela po trenutku i rezultatu');
  jest(r.odigrane[0].id === '1', 'odigrane idu od najnovije');
  jest(r.nadolazece[0].id === '2', 'nadolazeće idu od najbliže');
  jest(r.zadnja.id === '1', 'zadnji rezultat je najnovija odigrana');
  jest(r.sljedeca.id === '2', 'sljedeća je najbliža nadolazeća');
}
{
  // Nenadograđena baza: nema trenutka ni rezultata — sve ostaje nadolazeće,
  // u redoslijedu upisa. To je današnje ponašanje i mora se zadržati.
  const redci = [
    { id: 'x', sort_order: 2, when: 'Sub 24.10.', title: 'Olmissum — Osijek Kandit' },
    { id: 'y', sort_order: 1, when: 'Sub 17.10.', title: 'Osijek Kandit — Futsal Dinamo' },
  ];
  const r = razvrstaj(redci.map((x) => matchFromRow(x, NAS)), Date.parse('2026-10-20T12:00:00Z'));
  jest(r.odigrane.length === 0, 'bez trenutka i rezultata ništa nije odigrano');
  jest(r.nadolazece.map((u) => u.id).join() === 'y,x', 'redoslijed je onaj iz sort_order');
}
{
  const r = razvrstaj([], Date.now());
  jest(r.sljedeca === null && r.zadnja === null, 'prazan popis ne ruši');
}

console.log('\nforma');
{
  // razvrstaj vraća najnoviju prvu; forma se čita slijeva nadesno, pa se okreće.
  const odigrane = [
    matchFromRow({ id: '1', home: 'Osijek Kandit', away: 'A', home_score: 3, away_score: 0 }, NAS),
    matchFromRow({ id: '2', home: 'B', away: 'Osijek Kandit', home_score: 2, away_score: 2 }, NAS),
    matchFromRow({ id: '3', home: 'Osijek Kandit', away: 'C', home_score: 0, away_score: 1 }, NAS),
  ];
  jest(forma(odigrane).join('') === 'ldw', `najstarija prva (${forma(odigrane).join('')})`);
  jest(forma(odigrane, 2).join('') === 'dw', 'ograničenje na zadnje dvije');
  jest(forma([]).length === 0, 'bez utakmica nema forme');
}

console.log('\ngrupiranje po natjecanju');
{
  const u = [
    matchFromRow({ id: '1', comp: 'SuperSport HMNL', title: 'A — B' }, NAS),
    matchFromRow({ id: '2', comp: 'Hrvatski kup', title: 'C — D' }, NAS),
    matchFromRow({ id: '3', comp: 'SuperSport HMNL', title: 'E — F' }, NAS),
  ];
  const g = poNatjecanju(u);
  jest(g.length === 2, 'dvije skupine');
  jest(g[0].comp === 'SuperSport HMNL' && g[0].matches.length === 2, 'redoslijed po prvom pojavljivanju');
  jest(poNatjecanju([matchFromRow({ id: '9', title: 'A — B' }, NAS)])[0].comp === 'Ostalo', 'bez natjecanja ide u „Ostalo"');
}

console.log('\nuvoz rasporeda lijepljenjem');
{
  const tekst = [
    '17.10.2026. 19:00  Osijek Kandit - Futsal Dinamo  Zrinjevac',
    '24.10. 19:00 Olmissum — Osijek Kandit',
    '2026-10-28 20:00 | Osijek Kandit : Crnica | Športska dvorana Zrinjevac',
    '05.11.2026.\t18.30\tTorcida-Biberon — Osijek Kandit\tSplit',
    '',
    'ovo nije utakmica',
  ].join('\n');
  const r = rasclaniRaspored(tekst, { godina: 2026, comp: 'SuperSport HMNL' });

  jest(r.length === 5, `prazan redak se preskače, ostali ostaju (${r.length})`);
  // Ovo je greška zbog koje je parser prepisan: „17.10.2026." prolazi i kao
  // sat, pa je termin ispadao 17:10.
  jest(r[0].datum === '2026-10-17' && r[0].vrijeme === '19:00', `datum se ne čita kao sat (${r[0].datum} ${r[0].vrijeme})`);
  jest(r[0].home === 'Osijek Kandit' && r[0].away === 'Futsal Dinamo', 'momčadi bez ostatka retka');
  jest(r[0].venue === 'Zrinjevac', 'dvorana iz stupca odvojenog razmacima');
  jest(r[1].datum === '2026-10-24', 'godina se dopuni kad je nema');
  jest(r[2].venue === 'Športska dvorana Zrinjevac', 'stupci odvojeni uspravnom crtom');
  jest(r[3].vrijeme === '18:30', 'sat s točkom kad dvotočja nema');
  jest(r[3].home === 'Torcida-Biberon', 'ime s crticom preživi i u uvozu');
  jest(r[3].venue === 'Split', 'stupci odvojeni tabulatorom');
  jest(r[0].comp === 'SuperSport HMNL', 'natjecanje se prenese na sve retke');

  // Najvažnije: redak koji se ne da pročitati se **ne** preskače tiho.
  jest(r[4].greska === 'nema datuma', 'neprepoznat redak nosi razlog');
  jest(r.filter((x) => x.greska).length === 1, 'samo jedan redak je sporan');
}
jest(rasclaniRaspored('').length === 0, 'prazan unos daje prazan popis');
jest(rasclaniRaspored(null).length === 0, 'null ne ruši');

console.log(pao === 0 ? '\nSVE PROLAZI\n' : `\nPALO: ${pao}\n`);
process.exit(pao === 0 ? 0 : 1);
