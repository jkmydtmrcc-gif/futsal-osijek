/**
 * Provjera oblikovanja teksta objave.
 *
 * Najvažnije su dvije stvari koje se u pregledniku ne vide odmah: da tekst
 * iz baze nikad ne postane poveznica na `javascript:`, i da se ništa ne
 * izgubi zbog nezatvorene zvjezdice.
 */
import { uRetku, blokovi, bezOznaka, sigurnaAdresa, omotaj, oznaciRetke, umetni } from '../src/lib/oblikovanje.js';

let pao = 0;
const jest = (uvjet, opis) => {
  console.log(`  ${uvjet ? '✓' : '✗'} ${opis}`);
  if (!uvjet) pao += 1;
};
const J = (x) => JSON.stringify(x);

console.log('\nunutar retka');
jest(J(uRetku('Velika **pobjeda**!')) === J(['Velika ', { vrsta: 'b', djeca: ['pobjeda'] }, '!']), 'podebljano');
jest(J(uRetku('*kurziv*')) === J([{ vrsta: 'i', djeca: ['kurziv'] }]), 'kurziv');
jest(J(uRetku('__crta__')) === J([{ vrsta: 'u', djeca: ['crta'] }]), 'podcrtano');
jest(J(uRetku('**jako *i nakoso* da**')) === J([{ vrsta: 'b', djeca: ['jako ', { vrsta: 'i', djeca: ['i nakoso'] }, ' da'] }]), 'kurziv unutar podebljanog');
jest(J(uRetku('**Čestitke Šimi i Đuri** 🎉⚽')) === J([{ vrsta: 'b', djeca: ['Čestitke Šimi i Đuri'] }, ' 🎉⚽']), 'hrvatska slova i emotikoni prolaze netaknuti');
jest(J(uRetku('2 * 3 = 6')) === J(['2 * 3 = 6']), 'usamljena zvjezdica ostaje tekst');
jest(J(uRetku('**nezatvoreno')) === J(['**nezatvoreno']), 'nezatvorena oznaka ostaje tekst — ništa se ne gubi');
jest(J(uRetku('[Ulaznice](https://klub.hr/ulaznice)')) === J([{ vrsta: 'a', href: 'https://klub.hr/ulaznice', djeca: ['Ulaznice'] }]), 'poveznica s natpisom');
{
  const r = J(uRetku('[Klik](javascript:alert(1))'));
  jest(!r.includes('href') && r.includes('Klik'), 'javascript: nikad ne postaje poveznica, natpis ostaje');
  jest(!J(uRetku('[Klik](javascript:void)')).includes('href'), 'ni bez zagrada u adresi');
}
jest(J(uRetku('vidi https://klub.hr.')) === J(['vidi ', { vrsta: 'a', href: 'https://klub.hr', djeca: ['https://klub.hr'] }, '.']), 'gola adresa bez završne točke');
jest(J(uRetku('[Raspored](/raspored)')) === J([{ vrsta: 'a', href: '/raspored', djeca: ['Raspored'] }]), 'poveznica na stranicu kluba');
jest(sigurnaAdresa('//zlo.com') === null && sigurnaAdresa('data:text/html,x') === null, 'protokol-relativne i data: adrese odbijene');
jest(sigurnaAdresa('mailto:info@klub.hr') === 'mailto:info@klub.hr', 'mailto dopušten');
jest(J(uRetku('<script>alert(1)</script>')) === J(['<script>alert(1)</script>']), 'HTML ostaje običan tekst');

console.log('\nblokovi');
{
  const b = blokovi(['## Utakmica\nIgrali smo **dobro**.\nDrugi red.', '- Pandurević 3\n- López 2', '1. prvo\n2. drugo', '> Ponosan sam na dečke.']);
  jest(b[0].vrsta === 'h' && b[0].djeca[0] === 'Utakmica', 'podnaslov bez praznog reda ispred');
  jest(b[1].vrsta === 'p' && b[1].redci.length === 2, 'odlomak čuva prijelaz retka');
  jest(b[2].vrsta === 'ul' && b[2].stavke.length === 2 && b[2].stavke[0][0] === 'Pandurević 3', 'popis s crticama');
  jest(b[3].vrsta === 'ol' && b[3].stavke[1][0] === 'drugo', 'numerirani popis');
  jest(b[4].vrsta === 'citat' && b[4].redci[0][0] === 'Ponosan sam na dečke.', 'citat');
}
jest(blokovi('Prvi.\n\nDrugi.').length === 2, 'tekst s praznim redom daje dva odlomka');
jest(blokovi(['Stari običan odlomak.'])[0].vrsta === 'p', 'stare objave bez oznaka izgledaju isto kao prije');
jest(blokovi(undefined).length === 0 && blokovi(['', '  ']).length === 0, 'prazno ne ruši i ne daje prazne odlomke');
jest(blokovi(['• stavka'])[0].vrsta === 'ul', 'i točkica (•) je popis');

console.log('\nbez oznaka');
jest(bezOznaka('**Velika** pobjeda [ovdje](https://x.hr)') === 'Velika pobjeda ovdje', 'uvod bez zvjezdica');
jest(bezOznaka('## Naslov') === 'Naslov', 'podnaslov bez ljestvi');

console.log('\ngumbi u administraciji');
{
  const r = omotaj('Velika pobjeda', 7, 14, '**');
  jest(r.tekst === 'Velika **pobjeda**' && r.tekst.slice(r.od, r.do) === 'pobjeda', 'B omota odabir i zadrži ga označenim');
  const n = omotaj(r.tekst, r.od, r.do, '**');
  jest(n.tekst === 'Velika pobjeda', 'drugi klik skida oznaku');
  const c = omotaj('Velika **pobjeda**', 7, 18, '**');
  jest(c.tekst === 'Velika pobjeda', 'skida i kad je oznaka unutar odabira');
}
{
  const r = omotaj('Ab', 2, 2, '*', 'kurziv');
  jest(r.tekst === 'Ab*kurziv*' && r.tekst.slice(r.od, r.do) === 'kurziv', 'bez odabira umetne primjer i označi ga');
  const s = omotaj('a riječ b', 1, 8, '**');
  jest(s.tekst === 'a **riječ** b', 'razmaci na rubu odabira ostaju izvan oznake');
}
{
  const r = oznaciRetke('prvi\ndrugi\ntreći', 0, 16, 'ul');
  jest(r.tekst === '- prvi\n- drugi\n- treći', 'popis na sve odabrane retke');
  jest(oznaciRetke(r.tekst, 0, r.tekst.length, 'ul').tekst === 'prvi\ndrugi\ntreći', 'drugi klik vraća');
  jest(oznaciRetke('a\nb', 0, 3, 'ol').tekst === '1. a\n2. b', 'numerirani popis broji redom');
  jest(oznaciRetke('- a\n- b', 0, 7, 'ol').tekst === '1. a\n2. b', 'popis se pretvara u numerirani');
  jest(oznaciRetke('uvod\nNaslov\nkraj', 6, 6, 'h').tekst === 'uvod\n## Naslov\nkraj', 'podnaslov samo na redak s kursorom');
}
{
  const r = umetni('Pobjeda !', 8, 8, '⚽');
  jest(r.tekst === 'Pobjeda ⚽!' && r.od === 8 + '⚽'.length, 'emotikon na mjesto kursora');
}

console.log(pao === 0 ? '\nSVE PROLAZI\n' : `\nPALO: ${pao}\n`);
process.exit(pao === 0 ? 0 : 1);
