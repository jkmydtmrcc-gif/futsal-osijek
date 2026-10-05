/**
 * Provjera sponzora: poredak razina, redovi podupiratelja i mjere trake.
 *
 * Tri stvari koje se u pregledniku ne vide odmah: razina koja je upisana
 * prva ne smije ispasti iznad glavnog sponzora, redovi moraju biti jednako
 * dugi, a traka mora prekriti i vrlo širok ekran — inače se na kraju staze
 * pojavi rupa.
 */
import {
  razvrstajRazine,
  jePodupiratelj,
  razdijeliNaRedove,
  smjerReda,
  popuniTraku,
  trajanjeTrake,
  NAJMANJE_ZA_REDOVE,
  SIRINA_CELIJE,
} from '../src/lib/sponzori.js';
import { tiersFromRows } from '../src/lib/mapiranje.js';

let pao = 0;
const jest = (uvjet, opis) => {
  console.log(`  ${uvjet ? '✓' : '✗'} ${opis}`);
  if (!uvjet) pao += 1;
};

const razina = (id, tag = id) => ({ id, tag, size: 'md', sponsors: [] });
const sponzori = (n) => Array.from({ length: n }, (_, i) => ({ name: `S${i + 1}`, logo: '', href: '', note: '' }));

console.log('\nporedak razina');
{
  const r = razvrstajRazine([razina('podupiratelji', 'Podupiratelji'), razina('gold', 'Gold sponzori'), razina('glavni', 'Glavni sponzori')]);
  jest(r.map((x) => x.id).join() === 'glavni,gold,podupiratelji', `glavni → gold → podupiratelji (${r.map((x) => x.id).join()})`);
}
{
  // Vlasnik je upisao drukčije: velika slova, kvačice, samo oznaka.
  const r = razvrstajRazine([razina('Podupiratelji'), razina('GOLD'), razina('Glavni')]);
  jest(r.map((x) => x.id.toLowerCase()).join() === 'glavni,gold,podupiratelji', 'velika slova ne smetaju');
}
{
  // Prepoznaje se i po naslovu, ne samo po oznaci.
  const r = razvrstajRazine([razina('x1', 'Podupiratelji kluba'), razina('x2', 'Glavni sponzor')]);
  jest(r[0].id === 'x2', 'prepoznavanje po naslovu razine');
}
{
  // Nepoznata razina ide na kraj, a nepoznate među sobom ostaju u upisanom redu.
  const r = razvrstajRazine([razina('medijski'), razina('podupiratelji'), razina('partneri'), razina('glavni')]);
  jest(r.map((x) => x.id).join() === 'glavni,podupiratelji,medijski,partneri', `nepoznate na kraju, redom (${r.map((x) => x.id).join()})`);
}
jest(razvrstajRazine([]).length === 0, 'prazan popis ne ruši');
jest(razvrstajRazine(undefined).length === 0, 'nepostojeći popis ne ruši');
{
  const ulaz = [razina('b'), razina('a')];
  razvrstajRazine(ulaz);
  jest(ulaz[0].id === 'b', 'ulazni popis se ne mijenja');
}
{
  // Stvarni put: razine iz tablice poredane po tome koji je sponzor prvi upisan.
  const t = tiersFromRows([
    { tier: 'podupiratelji', tag: 'Podupiratelji', size: 'sm', name: 'A' },
    { tier: 'glavni', tag: 'Glavni sponzori', size: 'lg', name: 'B' },
    { tier: 'gold', tag: 'Gold sponzori', size: 'md', name: 'C' },
  ]);
  jest(razvrstajRazine(t).map((x) => x.id).join() === 'glavni,gold,podupiratelji', 'razine iz baze se slažu isto');
}

console.log('\nrazina podupiratelja');
jest(jePodupiratelj({ id: 'podupiratelji', tag: '' }), 'po oznaci');
jest(jePodupiratelj({ id: 'x', tag: 'Podupiratelji kluba' }), 'po naslovu');
jest(!jePodupiratelj({ id: 'gold', tag: 'Gold sponzori' }), 'gold nije podupiratelj');
jest(!jePodupiratelj(undefined), 'nepostojeća razina ne ruši');

console.log('\nredovi podupiratelja');
{
  const r = razdijeliNaRedove(sponzori(14));
  jest(r.length === 3, 'tri reda');
  jest(r.map((x) => x.length).join() === '5,5,4', `redovi su jednako dugi, razlika najviše jedan (${r.map((x) => x.length).join()})`);
  jest(r[0].map((s) => s.name).join() === 'S1,S4,S7,S10,S13', 'sponzori idu kružno: 1., 4., 7. u prvi red');
  jest(r.flat().length === 14, 'nitko ne ispadne');
  jest(new Set(r.flat().map((s) => s.name)).size === 14, 'nitko se ne ponovi');
}
{
  const r = razdijeliNaRedove(sponzori(NAJMANJE_ZA_REDOVE));
  jest(r?.length === 3 && r.every((x) => x.length === 2), `točno na granici još ide u redove (${NAJMANJE_ZA_REDOVE})`);
}
jest(razdijeliNaRedove(sponzori(NAJMANJE_ZA_REDOVE - 1)) === null, 'ispod granice → mreža, ne karusel');
jest(razdijeliNaRedove(sponzori(0)) === null, 'bez podupiratelja nema redova');
jest(razdijeliNaRedove(undefined) === null, 'nepostojeći popis ne ruši');
{
  const r = razdijeliNaRedove(sponzori(8), 2);
  jest(r.length === 2 && r[0].length === 4, 'broj redova se može zadati');
}

console.log('\nsmjer');
jest(smjerReda(0) === 'lijevo' && smjerReda(1) === 'desno' && smjerReda(2) === 'lijevo', 'redovi naizmjence: ulijevo, udesno, ulijevo');

console.log('\ntraka prekriva i vrlo širok ekran');
{
  const cell = SIRINA_CELIJE.sm;
  for (const sirina of [1440, 1920, 2560]) {
    const popunjen = popuniTraku(sponzori(5), cell, 12, sirina);
    const polovica = popunjen.length * (cell + 12);
    jest(polovica >= sirina, `${sirina}px: polovica trake ${polovica}px ≥ ekran (${popunjen.length} pločica)`);
  }
  const p = popuniTraku(sponzori(5), cell);
  jest(p.length % 5 === 0, 'ponavlja se cijeli popis, ne dio — polovice su istovjetne');
}
jest(popuniTraku([], 188).length === 0, 'prazan red ne ruši');
jest(popuniTraku(sponzori(1), 188, 12, 400).length >= 2, 'i jedan sponzor se ponovi dovoljno puta');

console.log('\nbrzina');
{
  const sm = SIRINA_CELIJE.sm;
  // Redovi s različitim brojem pločica moraju ići ISTOM brzinom.
  const kratki = trajanjeTrake(12, sm);
  const dugi = trajanjeTrake(24, sm);
  const brzinaKratkog = (12 * (sm + 12)) / kratki;
  const brzinaDugog = (24 * (sm + 12)) / dugi;
  jest(Math.abs(brzinaKratkog - brzinaDugog) < 2, `isti piksel po sekundi (${brzinaKratkog.toFixed(1)} / ${brzinaDugog.toFixed(1)})`);
  jest(trajanjeTrake(12, sm, 12, 30) > trajanjeTrake(12, sm, 12, 40), 'veća brzina → kraće trajanje');
  jest(trajanjeTrake(1, 10) >= 8, 'trajanje nikad ne padne ispod osam sekundi (ne smije bljeskati)');
}

console.log(pao === 0 ? '\nSVE PROLAZI\n' : `\nPALO: ${pao}\n`);
process.exit(pao === 0 ? 0 : 1);
