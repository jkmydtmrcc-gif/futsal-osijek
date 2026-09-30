/**
 * Provjera datuma i vremena utakmice.
 *
 * Dvije stvari se ovdje lako pokvare i teško primijete: prijelaz na ljetno
 * računanje vremena (utakmica ispadne sat ranije ili kasnije) i oblik zapisa
 * koji `Intl` vraća drukčije nego što na stranici treba pisati.
 */
import {
  spojiDatumVrijeme,
  razdvojiDatumVrijeme,
  formatDatum,
  formatSat,
  formatPuni,
  zaKoliko,
  opisRazmaka,
} from '../src/lib/vrijeme.js';

let pao = 0;
const jest = (uvjet, opis) => {
  console.log(`  ${uvjet ? '✓' : '✗'} ${opis}`);
  if (!uvjet) pao += 1;
};

console.log('\nspajanje datuma i sata uz pomak zone');
// Zadnja nedjelja ožujka 2026. je 29., zadnja nedjelja listopada 25.
jest(spojiDatumVrijeme('2026-03-28', '19:00') === '2026-03-28T18:00:00.000Z', 'dan prije prijelaza je zimsko vrijeme (+01)');
jest(spojiDatumVrijeme('2026-03-30', '19:00') === '2026-03-30T17:00:00.000Z', 'dan poslije prijelaza je ljetno (+02)');
jest(spojiDatumVrijeme('2026-10-17', '19:00') === '2026-10-17T17:00:00.000Z', 'listopad prije prijelaza je ljetno (+02)');
jest(spojiDatumVrijeme('2026-11-07', '19:00') === '2026-11-07T18:00:00.000Z', 'studeni je zimsko (+01)');
// Ponoć 17. 10. po Zagrebu (+02) je 16. 10. u 22:00 UTC — dan ranije.
jest(spojiDatumVrijeme('2026-10-17') === '2026-10-16T22:00:00.000Z', 'bez sata je ponoć tog dana po Zagrebu');
jest(spojiDatumVrijeme('') === null, 'bez datuma nema trenutka');
jest(spojiDatumVrijeme('ovo nije datum', '19:00') === null, 'neispravan datum ne ruši');

console.log('\npovratak u dva polja obrasca');
{
  const r = razdvojiDatumVrijeme('2026-10-17T17:00:00.000Z');
  jest(r.datum === '2026-10-17' && r.vrijeme === '19:00', `ljetni termin natrag u obrazac (${r.datum} ${r.vrijeme})`);
}
{
  const r = razdvojiDatumVrijeme('2026-11-07T18:00:00.000Z');
  jest(r.datum === '2026-11-07' && r.vrijeme === '19:00', `zimski termin natrag u obrazac (${r.datum} ${r.vrijeme})`);
}
{
  // Ponoć: Intl zna ispisati „24", a obrazac to ne prima.
  const r = razdvojiDatumVrijeme(spojiDatumVrijeme('2026-06-01', '00:00'));
  jest(r.vrijeme === '00:00', `ponoć je 00:00, ne 24:00 (${r.vrijeme})`);
}
jest(razdvojiDatumVrijeme(null).datum === '', 'prazan ulaz daje prazna polja');

console.log('\noblik zapisa');
jest(formatDatum('2026-10-17T17:00:00Z') === 'Sub 17.10.', `kratki datum (${formatDatum('2026-10-17T17:00:00Z')})`);
jest(formatSat('2026-10-17T17:00:00Z') === '19:00', 'sat po Zagrebu, ne po UTC-u');
jest(formatPuni('2026-10-17T17:00:00Z').includes('subota'), 'puni oblik ima dan u tjednu');
jest(formatPuni('2026-10-17T17:00:00Z').includes('u 19:00'), 'puni oblik ima sat');
jest(formatDatum('') === '' && formatSat(null) === '', 'prazan ulaz daje prazan niz, ne „Invalid Date"');

console.log('\nkoliko je ostalo');
{
  const sad = Date.parse('2026-10-14T12:00:00Z');
  const r = zaKoliko('2026-10-17T17:00:00Z', sad);
  jest(r.proslo === false && r.dana === 3, `tri dana unaprijed (${r.dana}d ${r.sati}h)`);
}
{
  const sad = Date.parse('2026-10-20T12:00:00Z');
  const r = zaKoliko('2026-10-17T17:00:00Z', sad);
  jest(r.proslo === true, 'prošla utakmica je označena kao prošla');
}
jest(zaKoliko('nije datum', Date.now()) === null, 'neispravan trenutak vraća null');

console.log('\nkratki opis razmaka');
jest(opisRazmaka('2026-10-17T17:00:00Z', Date.parse('2026-10-14T12:00:00Z')) === 'za 3 dana', 'za 3 dana');
jest(opisRazmaka('2026-10-17T17:00:00Z', Date.parse('2026-10-16T17:00:00Z')) === 'za 1 dan', 'jednina za jedan dan');
jest(opisRazmaka('2026-10-17T17:00:00Z', Date.parse('2026-10-17T15:00:00Z')) === 'za 2 sata', 'sati kad je manje od dana');
jest(opisRazmaka('2026-10-17T17:00:00Z', Date.parse('2026-10-17T16:45:00Z')) === 'uskoro', 'ispod sat vremena je „uskoro"');
jest(opisRazmaka('2026-10-17T17:00:00Z', Date.parse('2026-10-20T17:00:00Z')) === 'prije 3 dana', 'prošlost je „prije"');

console.log(pao === 0 ? '\nSVE PROLAZI\n' : `\nPALO: ${pao}\n`);
process.exit(pao === 0 ? 0 : 1);
