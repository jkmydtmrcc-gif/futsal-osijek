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
  formaIzTeksta,
  imaFormu,
  oznaciZone,
  grupirajZone,
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
jest(formaKluba({ isUs: false }, ['w', 'd', 'w']).length === 0, 'tuđi redak ne dobije izmišljenu formu iz naših utakmica');
jest(formaKluba({ isUs: true }, undefined).length === 0, 'bez forme ne ruši');
jest(formaKluba({ isUs: false, form: 'WWD' }, ['l']).join('') === 'wwd', 'upisana forma tuđeg kluba se prikazuje');
jest(formaKluba({ isUs: true, form: 'LLW' }, ['w', 'w', 'w']).join('') === 'llw', 'upisana forma ima prednost pred izračunatom');
jest(formaKluba({ isUs: true, form: '' }, ['w', 'd']).join('') === 'wd', 'bez upisa naš redak se računa iz utakmica');

console.log('\nforma iz teksta');
jest(formaIzTeksta('WWD').join('') === 'wwd', 'engleska slova');
jest(formaIzTeksta('ppn').join('') === 'wwd', 'hrvatska slova, mala');
jest(formaIzTeksta('P, N I').join('') === 'wdl', 'razmaci i zarezi se preskaču');
jest(formaIzTeksta('PPPPPNI').join('') === 'wwwdl', 'više od pet — vrijedi zadnjih pet');
jest(formaIzTeksta('x?!').length === 0 && formaIzTeksta(null).length === 0, 'smeće i null daju praznu formu');
jest(imaFormu([{ forma: [] }, { forma: ['w'] }]) === true, 'stupac forme ima smisla kad ijedan redak ima formu');
jest(imaFormu([{ forma: [] }, {}]) === false && imaFormu(undefined) === false, 'bez ijedne forme stupca nema');

console.log('\nzone');
{
  const deset = Array.from({ length: 10 }, (_, i) => ({ pos: i + 1 }));
  const z = oznaciZone(deset, { doigravanje: 8, ostanak: 1, ispadanje: 1 });
  jest(z.slice(0, 8).every((x) => x === 'doigravanje'), 'prvih osam je doigravanje');
  jest(z[8] === 'ostanak' && z[9] === 'ispadanje', 'deveti za ostanak, deseti ispada');
}
{
  const devet = Array.from({ length: 9 }, (_, i) => ({ pos: i + 1 }));
  const z = oznaciZone(devet, { doigravanje: 4, ostanak: 2, ispadanje: 1 });
  jest(z[4] === null && z[5] === null && z[6] === 'ostanak' && z[7] === 'ostanak' && z[8] === 'ispadanje', 'što ostane u sredini nema zonu');
}
{
  const cetiri = Array.from({ length: 4 }, (_, i) => ({ pos: i + 1 }));
  const z = oznaciZone(cetiri, { doigravanje: 3, ostanak: 5, ispadanje: 5 });
  jest(z.join() === 'doigravanje,doigravanje,doigravanje,ispadanje', 'u maloj ligi doigravanje ima prednost, zone se ne preklapaju');
}
{
  const redci = [{ pos: 1 }, { pos: 2 }, { pos: 3 }];
  jest(oznaciZone(redci, { doigravanje: 0, ostanak: 1, ispadanje: 1 }).every((x) => x === null), 'bez doigravanja nema nikakvih zona');
  const z = oznaciZone([{ pos: 0 }, { pos: 1 }], { doigravanje: 1, ispadanje: 1 });
  jest(z[0] === null && z[1] === 'doigravanje', 'redak bez mjesta ne upada ni u jednu zonu');
}
{
  const redci = slozi(
    Array.from({ length: 10 }, (_, i) => ({ pos: i + 1, club: `K${i + 1}`, form: i === 0 ? 'WWD' : '' })),
    { playoffCutoff: 8, relegationPlayoff: 1, relegation: 1 }
  );
  const skupine = grupirajZone(redci);
  jest(skupine.length === 3, 'tri skupine: ' + skupine.map((g) => g.zona).join(', '));
  jest(skupine[0].naslov === 'Doigravanje' && skupine[0].redci.length === 8, 'naslov i broj redaka prve skupine');
  jest(skupine[1].naslov === 'Doigravanje za ostanak' && skupine[2].naslov === 'Ispadanje', 'nazivi ostalih zona');
  jest(redci[0].forma.join('') === 'wwd' && redci[1].forma.length === 0, 'forma iz stupca stiže do retka');
  jest(grupirajZone([]).length === 0, 'prazna tablica nema skupina');
  jest(grupirajZone([{ pos: 1 }, { pos: 2 }])[0].naslov === '', 'redci bez zone nemaju naslov');
}

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
  jest(redci[1].forma.join('') === 'wwd', 'naš redak bez upisa dobije formu iz utakmica');
  jest(redci[0].forma.length === 0, 'tuđi redak bez upisa ostaje bez forme');
  jest(redci[1].gd === 14, 'gol-razlika je izvedena i ovdje');
}
{
  const redci = slozi([{ pos: 0, club: 'Bez mjesta', played: 0, points: 0 }], { playoffCutoff: 4 });
  jest(redci[0].isPlayoff === false, 'redak bez mjesta ne upada u doigravanje');
}
jest(slozi(undefined).length === 0, 'nepostojeća tablica daje prazan popis');

console.log(pao === 0 ? '\nSVE PROLAZI\n' : `\nPALO: ${pao}\n`);
process.exit(pao === 0 ? 0 : 1);
