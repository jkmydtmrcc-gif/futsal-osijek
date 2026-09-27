/**
 * Provjera prepoznavanja teme kod klupskog asistenta.
 *
 * Povod: na „gdje kupiti dres“ asistent je odgovarao o dvorani. Obje su
 * teme imale po jedan pogodak („gdje“ i „dres“), a pobjeđivala je ona koja
 * je prva u popisu. U pregledniku se takvo što lako previdi — odgovor je
 * suvisao, samo o krivoj stvari.
 */
import { TEME_RIJECI, norm, bodujTemu, odaberiTemu } from '../src/lib/asistent.js';

let pao = 0;
const jest = (uvjet, opis) => {
  console.log(`  ${uvjet ? '✓' : '✗'} ${opis}`);
  if (!uvjet) pao += 1;
};

// Prave ključne riječi sa stranice, ne izmišljene — inače test prolazi, a
// asistent i dalje odgovara krivo.
const TEME = Object.entries(TEME_RIJECI).map(([id, rijeci]) => ({ id, rijeci }));

const tema = (pitanje) => odaberiTemu(TEME, pitanje)?.id ?? null;

console.log('\nnorm');
jest(norm('UTAKMICA') === 'utakmica', 'velika slova');
jest(norm('Pandurević') === 'pandurevic', 'kvačice');
jest(norm('Đakovo') === 'dakovo', 'đ se ne rastavlja u NFD, ima vlastito pravilo');
jest(norm(null) === '', 'prazna vrijednost ne ruši');

console.log('\nupitna riječ ne nadglasava pravu ključnu riječ');
jest(tema('gdje kupiti dres') === 'dres', '„gdje kupiti dres“ → Fan Shop, ne dvorana');
jest(tema('kada igra momčad') === 'utakmica', '„kada igra“ → utakmica, ne postava');
jest(tema('gdje se igra') === 'dvorana', 'bez druge ključne riječi upitna ipak odlučuje');

console.log('\ndulji izraz je specifičniji');
jest(tema('koliko bodova imamo') === 'tablica', 'bodovi → tablica');
jest(tema('kako do ulaznice') === 'ulaznice', 'ulaznice → ulaznice');
jest(tema('koja je adresa dvorane') === 'dvorana', 'adresa → dvorana');
jest(tema('tko je trener') === 'postava', 'trener → postava');

console.log('\nkad ne zna, kaže da ne zna');
jest(tema('kolika je cijena kave') === null, 'nepoznato pitanje nema temu');
jest(tema('kupiti dres') === 'dres', '„kupiti“ bez ulaznice ne vodi na ulaznice');
jest(tema('kupiti ulaznicu') === 'ulaznice', '„kupiti ulaznicu“ → ulaznice');
jest(tema('') === null, 'prazno pitanje nema temu');
jest(tema('   ') === null, 'samo razmaci nemaju temu');

console.log('\nbodovanje');
jest(
  bodujTemu({ rijeci: ['dres'] }, 'gdje kupiti dres') >
    bodujTemu({ rijeci: ['gdje'] }, 'gdje kupiti dres'),
  'prava riječ nosi više od upitne'
);
jest(bodujTemu({ rijeci: ['trgovin'] }, 'nema toga') === 0, 'bez pogotka nula bodova');

console.log(pao === 0 ? '\nSVE PROLAZI\n' : `\nPALO: ${pao}\n`);
process.exit(pao === 0 ? 0 : 1);
