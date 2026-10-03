/**
 * Provjera prijenosa uživo.
 *
 * Semafor i tijek utakmice su dva prikaza istog niza događaja. Ako se
 * razilaze, stranica javno proturječi sama sebi usred utakmice — zato se
 * rezultat računa, a ne upisuje, i zato svaki test ovdje gleda baš taj
 * izračun.
 *
 * Autogol je mjesto gdje se predznak najlakše zabrlja: gol koji je dao naš
 * igrač pripada protivniku.
 */
import {
  poredaj,
  rezultatIzDogadaja,
  stanjePrijenosa,
  opisStanja,
  sloziFeed,
  sloziPostavu,
  odbrojavanje,
  opisOdbrojavanja,
} from '../src/lib/uzivo.js';

let pao = 0;
const jest = (uvjet, opis) => {
  console.log(`  ${uvjet ? '✓' : '✗'} ${opis}`);
  if (!uvjet) pao += 1;
};

const d = (sort_order, vrsta, nasa = true, dodatno = {}) => ({
  id: `d${sort_order}`,
  sort_order,
  vrsta,
  nasa,
  poluvrijeme: 1,
  ...dodatno,
});

console.log('\nrezultat se računa iz golova');
{
  const dog = [d(1, 'pocetak'), d(2, 'gol'), d(3, 'gol', false), d(4, 'deseterac')];
  const r = rezultatIzDogadaja(dog, true);
  jest(r.home === 2 && r.away === 1, `doma 2:1 (${r.home}:${r.away})`);
}
{
  // Isti događaji, ali igramo u gostima — semafor piše domaćin : gost.
  const dog = [d(1, 'gol'), d(2, 'gol', false), d(3, 'gol', false)];
  const r = rezultatIzDogadaja(dog, false);
  jest(r.home === 2 && r.away === 1, `u gostima se strane okreću (${r.home}:${r.away})`);
}
{
  // Naš igrač zabije sam sebi — gol ide protivniku.
  const r = rezultatIzDogadaja([d(1, 'autogol', true)], true);
  jest(r.home === 0 && r.away === 1, `naš autogol je gol protivnika (${r.home}:${r.away})`);
}
{
  const r = rezultatIzDogadaja([d(1, 'autogol', false)], true);
  jest(r.home === 1 && r.away === 0, `protivnički autogol je naš gol (${r.home}:${r.away})`);
}
{
  // Kartoni, timeouti i komentari ne smiju dirati rezultat.
  const dog = [d(1, 'zuti'), d(2, 'crveni', false), d(3, 'timeout'), d(4, 'komentar'), d(5, 'kraj_pol')];
  const r = rezultatIzDogadaja(dog, true);
  jest(r.home === 0 && r.away === 0, 'ostali događaji ne mijenjaju rezultat');
}
jest(rezultatIzDogadaja([]).home === 0, 'prazan prijenos je 0:0');
jest(rezultatIzDogadaja(undefined).away === 0, 'nepostojeći popis ne ruši');

console.log('\nredoslijed');
{
  const dog = [d(3, 'gol'), d(1, 'pocetak'), d(2, 'zuti')];
  jest(poredaj(dog).map((x) => x.sort_order).join() === '1,2,3', 'slaže se po sort_order');
}
{
  // Isti `sort_order` (dva upisa u istoj sekundi) — odlučuje vrijeme upisa.
  const dog = [
    { id: 'b', sort_order: 1, vrsta: 'gol', created_at: '2026-10-03T19:10:00Z' },
    { id: 'a', sort_order: 1, vrsta: 'zuti', created_at: '2026-10-03T19:05:00Z' },
  ];
  jest(poredaj(dog)[0].id === 'a', 'kod istog broja odlučuje vrijeme upisa');
}

console.log('\nstanje prijenosa');
{
  const s = stanjePrijenosa([]);
  jest(s.pocela === false && s.minuta === null, 'bez događaja utakmica nije počela');
  jest(opisStanja(s) === 'Uskoro', `prije početka piše „Uskoro“ (${opisStanja(s)})`);
}
{
  const s = stanjePrijenosa([d(1, 'pocetak', true, { minuta: 0 }), d(2, 'gol', true, { minuta: 14 })]);
  jest(s.pocela && !s.zavrsena && s.minuta === 14, 'minuta je iz zadnjeg događaja');
  jest(opisStanja(s) === '1. poluvrijeme · 14\'', `natpis: ${opisStanja(s)}`);
}
{
  // Komentar bez minute ne smije obrisati zadnju poznatu minutu.
  const s = stanjePrijenosa([d(1, 'gol', true, { minuta: 14 }), d(2, 'komentar', true, { minuta: null })]);
  jest(s.minuta === 14, 'događaj bez minute zadrži zadnju poznatu');
}
{
  const s = stanjePrijenosa([d(1, 'gol', true, { minuta: 19 }), d(2, 'kraj_pol', true, { minuta: 20 })]);
  jest(s.odmor === true && opisStanja(s) === 'Poluvrijeme', 'odmor se prepozna');
}
{
  const s = stanjePrijenosa([
    d(1, 'gol', true, { minuta: 14 }),
    d(2, 'kraj', true, { minuta: 40, poluvrijeme: 2 }),
  ]);
  jest(s.zavrsena === true && opisStanja(s) === 'Kraj', 'kraj utakmice se prepozna');
}

console.log('\ntijek utakmice');
{
  const igraci = [{ id: 'i1', name: 'Andrej Pandurević', number: 8 }];
  const dog = [
    d(1, 'pocetak', true, { minuta: 0 }),
    d(2, 'gol', true, { minuta: 7, igrac_id: 'i1' }),
    d(3, 'zuti', false, { minuta: 11, ime: 'Matić' }),
  ];
  const f = sloziFeed(dog, igraci);
  jest(f[0].minuta === 11, 'najnoviji je prvi');
  jest(f[1].ime === 'Andrej Pandurević', 'naš igrač se nađe po ključu iz postave');
  jest(f[0].ime === 'Matić', 'protivnik ide po upisanom imenu');
  jest(f[1].istice === true && f[2].istice === false, 'gol se ističe, početak ne');
  jest(f[2].naziv === 'Početak', 'svaki događaj nosi naziv');
}
{
  // Igrač obrisan iz postave nakon utakmice — redak ostaje, bez imena.
  const f = sloziFeed([d(1, 'gol', true, { igrac_id: 'nema-ga' })], []);
  jest(f[0].ime === '', 'nepoznat igrač ne ruši tijek');
}
jest(sloziFeed([], []).length === 0, 'prazan tijek daje prazan popis');

console.log('\npostave');
{
  const igraci = [
    { id: 'i1', name: 'Franko Jamičić', number: 1 },
    { id: 'i2', name: 'Andrej Pandurević', number: 8 },
  ];
  const postave = [
    { id: 'p1', sort_order: 1, nasa: true, igrac_id: 'i1', pocetna: true },
    { id: 'p2', sort_order: 2, nasa: true, igrac_id: 'i2', pocetna: false },
    { id: 'p3', sort_order: 1, nasa: false, ime: 'Matić', broj: 7, pocetna: true },
    { id: 'p4', sort_order: 2, nasa: false, ime: '', pocetna: true },
  ];
  const nasa = sloziPostavu(postave, igraci, true);
  jest(nasa.pocetna.length === 1 && nasa.klupa.length === 1, 'petorka i klupa se razdvajaju');
  jest(nasa.pocetna[0].broj === 1, 'broj se uzme iz postave igrača kad nije upisan');
  jest(nasa.pocetna[0].igracId === 'i1', 'postava nosi ključ igrača, ne retka');
  jest(sloziPostavu(postave, igraci, false).pocetna[0].igracId === null, 'protivnik nema ključ igrača');
  const njihova = sloziPostavu(postave, igraci, false);
  jest(njihova.pocetna.length === 1, 'redak bez imena se preskače');
  jest(njihova.pocetna[0].ime === 'Matić', 'protivnik ide po imenu');
}

console.log('\nodbrojavanje');
{
  const sad = Date.parse('2026-10-03T12:00:00Z');
  const o = odbrojavanje('2026-10-05T18:30:00Z', sad);
  jest(o.dana === 2 && o.sati === 6 && o.minuta === 30, `2 d 6 h 30 min (${o.dana}/${o.sati}/${o.minuta})`);
  jest(opisOdbrojavanja(o) === '2 d 6 h', `daleko se mjeri danima (${opisOdbrojavanja(o)})`);
}
{
  const sad = Date.parse('2026-10-03T15:12:00Z');
  const o = odbrojavanje('2026-10-03T18:30:00Z', sad);
  jest(opisOdbrojavanja(o) === '3 h 18 min', `isti dan ide u sate (${opisOdbrojavanja(o)})`);
}
{
  // Zadnji sat — tek tu sekunde nešto znače.
  const sad = Date.parse('2026-10-03T18:25:39Z');
  const o = odbrojavanje('2026-10-03T18:30:00Z', sad);
  jest(opisOdbrojavanja(o) === '04:21', `zadnji sat ide u mm:ss (${opisOdbrojavanja(o)})`);
}
{
  const sad = Date.parse('2026-10-03T19:00:00Z');
  const o = odbrojavanje('2026-10-03T18:30:00Z', sad);
  jest(o.proslo === true && opisOdbrojavanja(o) === '', 'prošli termin se ne odbrojava');
}
jest(odbrojavanje('', Date.now()) === null, 'bez termina nema odbrojavanja');
jest(odbrojavanje(null, Date.now()) === null, 'null ne ruši');

console.log(pao === 0 ? '\nSVE PROLAZI\n' : `\nPALO: ${pao}\n`);
process.exit(pao === 0 ? 0 : 1);
