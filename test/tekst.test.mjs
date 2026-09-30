/**
 * Provjera oblika riječi uz broj.
 *
 * Povod: gumb je pisao „Upiši 3 utakmica". Hrvatski ima tri oblika, a
 * pravilo ide po zadnjoj znamenki — uz iznimku za 11–14, koja se najčešće i
 * zaboravi.
 */
import { oblik, sBrojem } from '../src/lib/tekst.js';

let pao = 0;
const jest = (uvjet, opis) => {
  console.log(`  ${uvjet ? '✓' : '✗'} ${opis}`);
  if (!uvjet) pao += 1;
};

const u = (n) => oblik(n, 'utakmica', 'utakmice', 'utakmica');

console.log('\ntri oblika');
jest(u(1) === 'utakmica', '1 utakmica');
jest(u(2) === 'utakmice' && u(3) === 'utakmice' && u(4) === 'utakmice', '2–4 utakmice');
jest(u(5) === 'utakmica' && u(10) === 'utakmica', '5–10 utakmica');
jest(u(0) === 'utakmica', '0 utakmica');

console.log('\niznimka 11–14');
jest(u(11) === 'utakmica', '11 utakmica, ne „utakmica" po zadnjoj znamenki 1');
jest(u(12) === 'utakmica' && u(13) === 'utakmica' && u(14) === 'utakmica', '12–14 utakmica');
jest(u(21) === 'utakmica', '21 utakmica (zadnja znamenka 1)');
jest(u(22) === 'utakmice', '22 utakmice');
jest(u(101) === 'utakmica' && u(111) === 'utakmica', '101 i 111 se razlikuju po zadnje dvije znamenke');

console.log('\nrubni ulazi');
jest(u(-3) === 'utakmice', 'negativan broj gleda apsolutnu vrijednost');
jest(u(2.7) === 'utakmice', 'decimalni se odreže');
jest(u(null) === 'utakmica' && u(undefined) === 'utakmica', 'prazna vrijednost ne ruši');

console.log('\nbroj uz riječ');
jest(sBrojem(3, 'redak', 'retka', 'redaka') === '3 retka', '3 retka');
jest(sBrojem(1, 'redak', 'retka', 'redaka') === '1 redak', '1 redak');
jest(sBrojem(7, 'redak', 'retka', 'redaka') === '7 redaka', '7 redaka');

console.log(pao === 0 ? '\nSVE PROLAZI\n' : `\nPALO: ${pao}\n`);
process.exit(pao === 0 ? 0 : 1);
