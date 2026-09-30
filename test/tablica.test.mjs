/**
 * Provjera tablice lige.
 *
 * Tri stvari koje se u pregledniku ne vide odmah:
 * gol-razlika koja se računa umjesto da se upisuje, prepoznavanje pune
 * tablice **po podacima** (jer nenadograđena baza nema te stupce, a
 * nadograđena ih ima s nulom — oboje mora dati kraću tablicu), i aritmetika
 * retka, koja je jedina obrana od tipfelera u najvidljivijoj brojci na
 * stranici.
 */
import {
  redakTablice,
  imaDetalje,
  formatGR,
  provjeriRedak,
  formaKluba,
  slozi,
} from '../src/lib/tablica.js';

let pao = 0;
const jest = (uvjet, opis) => {
  console.log(`  ${uvjet ? '✓' : '✗'} ${opis}`);
  if (!uvjet) pao += 1;
};

console.log('\nredak tablice');
{
  const r = redakTablice({
    pos: 2,
    club: 'Osijek Kandit',
    played: 6,
    wins: 4,
    draws: 2,
    losses: 0,
    goals_for: 31,
    goals_against: 17,
    points: 14,
  });
  jest(r.gd === 14, 'gol-razlika se računa iz golova');
  jest(r.goalsFor === 31 && r.goalsAgainst === 17, 'golovi prežive preimenovanje');
  jest(r.points === 14, 'bodovi ostaju');
}
{
  // Nenadograđena baza: novih stupaca nema uopće.
  const r = redakTablice({ pos: 1, club: 'Olmissum', played: 6, points: 16 });
  jest(r.wins === 0 && r.draws === 0 && r.losses === 0, 'stupci kojih nema čitaju se kao nula');
  jest(r.gd === 0, 'bez golova je gol-razlika nula, ne NaN');
}
jest(redakTablice({ pos: '3', played: '6' }).pos === 3, 'brojevi kao tekst se pretvore');

console.log('\nširina tablice se bira po podacima');
{
  const stara = [
    { pos: 1, club: 'Olmissum', played: 6, points: 16 },
    { pos: 2, club: 'Osijek Kandit', played: 6, points: 13 },
  ];
  jest(imaDetalje(stara) === false, 'nenadograđena baza daje kraću tablicu');
}
{
  // Migracija je prošla, ali vlasnik još nije upisao ništa.
  const prazna = [
    { pos: 1, club: 'Olmissum', played: 6, points: 16, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0 },
  ];
  jest(imaDetalje(prazna) === false, 'nadograđena ali prazna baza također daje kraću');
}
{
  const puna = [
    { pos: 1, club: 'Olmissum', played: 6, points: 16, wins: 0, draws: 0, losses: 0, goals_for: 0, goals_against: 0 },
    { pos: 2, club: 'Osijek Kandit', played: 6, points: 14, wins: 4, draws: 2, losses: 0, goals_for: 31, goals_against: 17 },
  ];
  jest(imaDetalje(puna) === true, 'dovoljan je jedan popunjen redak');
}
jest(imaDetalje([]) === false, 'prazan popis ne ruši');
jest(imaDetalje(undefined) === false, 'nepostojeći popis ne ruši');

console.log('\ngol-razlika u tekstu');
jest(formatGR(14) === '+14', 'pozitivna dobije plus');
jest(formatGR(0) === '0', 'nula je samo nula, bez predznaka');
jest(formatGR(-17) === '−17', 'negativna dobije pravi minus, ne crticu');

console.log('\naritmetika retka');
{
  const dobar = { played: 6, wins: 4, draws: 2, losses: 0, points: 14 };
  jest(provjeriRedak(dobar).length === 0, 'složan redak nema upozorenja');
}
{
  // Najčešći tipfeler: promijeni se ishod, a odigrano ostane staro.
  const u = provjeriRedak({ played: 6, wins: 4, draws: 2, losses: 1, points: 14 });
  jest(u.length === 1 && u[0].includes('P+N+I'), `odigrano se ne slaže s ishodima (${u[0]})`);
}
{
  const u = provjeriRedak({ played: 6, wins: 4, draws: 2, losses: 0, points: 13 });
  jest(u.length === 1 && u[0].includes('bodova') === false && u[0].includes('Bodova'), 'bodovi se ne slažu s ishodima');
}
{
  const u = provjeriRedak({ played: 5, wins: 4, draws: 2, losses: 0, points: 13 });
  jest(u.length === 2, 'obje greške se jave odjednom');
}
{
  // Prije nego vlasnik išta upiše ne smije se vikati na njega.
  jest(provjeriRedak({ played: 6, points: 16 }).length === 0, 'redak bez ishoda se ne provjerava');
  jest(provjeriRedak({ played: 0, wins: 0, draws: 0, losses: 0, points: 0 }).length === 0, 'nule na početku sezone su u redu');
}

console.log('\nforma');
jest(formaKluba({ isUs: true }, ['w', 'd', 'w']).join('') === 'wdw', 'naš redak dobije formu');
jest(formaKluba({ isUs: false }, ['w', 'd', 'w']).length === 0, 'tuđi redak ne dobije izmišljenu formu');
jest(formaKluba({ isUs: true }, undefined).length === 0, 'bez forme ne ruši');

console.log('\nslaganje tablice za prikaz');
{
  const redci = slozi(
    [
      { pos: 1, club: 'Olmissum', played: 6, points: 16 },
      { pos: 2, club: 'Osijek Kandit', played: 6, points: 14, wins: 4, draws: 2, losses: 0, goals_for: 31, goals_against: 17 },
      { pos: 5, club: 'Square', played: 6, points: 6 },
    ],
    { ourClub: 'Osijek Kandit', playoffCutoff: 4, forma: ['w', 'w', 'd'] }
  );

  jest(redci[1].isUs === true && redci[0].isUs === false, 'naš klub je prepoznat po imenu');
  jest(redci[0].isPlayoff === true && redci[2].isPlayoff === false, 'granica doigravanja');
  jest(redci[1].forma.join('') === 'wwd', 'forma ide samo uz naš redak');
  jest(redci[0].forma.length === 0, 'tuđi redak ostaje bez forme');
  jest(redci[1].gd === 14, 'gol-razlika je izvedena i ovdje');
}
{
  const redci = slozi([{ pos: 0, club: 'Bez mjesta', played: 0, points: 0 }], { playoffCutoff: 4 });
  jest(redci[0].isPlayoff === false, 'redak bez mjesta ne upada u doigravanje');
}
jest(slozi(undefined).length === 0, 'nepostojeća tablica daje prazan popis');

console.log(pao === 0 ? '\nSVE PROLAZI\n' : `\nPALO: ${pao}\n`);
process.exit(pao === 0 ? 0 : 1);
