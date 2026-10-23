/**
 * Provjera oznaka za dijeljenje.
 *
 * Kvar zbog kojeg ovo postoji: podijeljena novost u WhatsAppu i na Facebooku
 * stizala je s naslovnom fotografijom i općim opisom kluba, jer pregledavatelj
 * ne izvršava JavaScript. Ovdje se provjerava da svaka adresa dobije svoje
 * oznake i da ih upis u `index.html` ne udvostruči.
 */
import { oznakeZaPut, upisiOznake, ocistiPut, skrati, punNaslov } from '../src/lib/dijeljenje.js';
import { zadaniSadrzaj, slozinovosti } from '../src/lib/mapiranje.js';
import { NOT_FOUND } from '../src/data/site.js';

let pao = 0;
const jest = (uvjet, opis) => {
  console.log(`  ${uvjet ? '✓' : '✗'} ${opis}`);
  if (!uvjet) pao += 1;
};

const baza = slozinovosti([
  { id: 'uuid-1', slug: 'pobjeda-nv', title: 'Velika pobjeda protiv Novog vremena', lead: 'Osijek je **slavio** 9:2!', image: 'https://x.supabase.co/storage/v1/object/public/slike/nv.jpg', body: 'Tekst.' },
  { id: 'uuid-2', slug: '', title: 'Bez slike i uvoda', lead: '', image: '', body: '## Podnaslov\n\nPrvi **pravi** odlomak teksta.\n\nDrugi.' },
]);
const sadrzaj = { ...zadaniSadrzaj(), news: baza, notFound: NOT_FOUND };

console.log('\noznake po adresi');
{
  const o = oznakeZaPut('/novosti/pobjeda-nv', sadrzaj);
  jest(o.naslov === 'Velika pobjeda protiv Novog vremena', 'novost: svoj naslov');
  jest(o.slika.endsWith('/nv.jpg'), 'novost: svoja fotografija, ne naslovna');
  jest(o.opis === 'Osijek je slavio 9:2!', 'novost: uvod bez zvjezdica');
  jest(o.vrsta === 'article', 'novost je članak');
}
{
  const o = oznakeZaPut('/novosti/uuid-2', sadrzaj);
  jest(o.opis === 'Prvi pravi odlomak teksta.', 'bez uvoda — prvi odlomak teksta, ne podnaslov');
  jest(o.slika === sadrzaj.images.celebration, 'bez fotografije — klupska');
}
jest(oznakeZaPut('/novosti/pobjeda-nv/', sadrzaj).naslov.startsWith('Velika'), 'kosa crta na kraju ne smeta');
jest(oznakeZaPut('/novosti/pobjeda-nv?fbclid=abc', sadrzaj).naslov.startsWith('Velika'), 'Facebookov dodatak u adresi ne smeta');
jest(oznakeZaPut('/novosti/nema-je', sadrzaj).pronadeno === false, 'nepostojeća novost');
jest(oznakeZaPut('/raspored', sadrzaj).naslov === sadrzaj.pages['/raspored'].title, 'podstranica: svoj naslov');
jest(oznakeZaPut('/', sadrzaj).naslov === null && oznakeZaPut('/', sadrzaj).opis === sadrzaj.hero.slogan, 'naslovnica: klub i slogan');
jest(ocistiPut('') === '/' && ocistiPut('klub/') === '/klub', 'čišćenje adrese');
jest(oznakeZaPut('/novosti/%E0%A4%A', sadrzaj).pronadeno === false, 'neispravan postotni zapis ne ruši');

console.log('\nupis u index.html');
{
  const html = `<!DOCTYPE html><html><head>
<meta charset="utf-8">
<title>Stari naslov</title>
<meta name="description" content="stari opis">
<meta property="og:title" content="stari">
<meta property="og:image" content="/stara.webp">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico">
</head><body><div id="root"></div><script type="module" src="/assets/index.js"></script></body></html>`;
  const o = oznakeZaPut('/novosti/pobjeda-nv', sadrzaj);
  const out = upisiOznake(html, o, 'https://klub.hr', '/novosti/pobjeda-nv');
  jest((out.match(/og:image"/g) ?? []).length === 1, 'točno jedna og:image');
  jest((out.match(/<title>/g) ?? []).length === 1 && out.includes('<title>Velika pobjeda protiv Novog vremena — MNK Osijek Kandit</title>'), 'točno jedan, novi naslov');
  jest(!out.includes('stara.webp') && !out.includes('stari opis'), 'stare oznake nestale');
  jest(out.includes('<meta property="og:url" content="https://klub.hr/novosti/pobjeda-nv">'), 'og:url puna adresa');
  jest(out.includes('<script type="module" src="/assets/index.js">') && out.includes('rel="icon"'), 'ostatak dokumenta netaknut');
  jest(out.indexOf('og:title') < out.indexOf('</head>'), 'oznake su u <head>');
}
{
  const o = { naslov: 'Naslov s "navodnicima" & <oznakom>', opis: 'opis', slika: '/a.jpg', vrsta: 'article' };
  const out = upisiOznake('<html><head></head></html>', o, 'https://klub.hr', '/x');
  jest(out.includes('content="Naslov s &quot;navodnicima&quot; &amp; &lt;oznakom&gt; — MNK Osijek Kandit"'), 'navodnici i < > su zaštićeni');
  jest(out.includes('content="https://klub.hr/a.jpg"'), 'relativna slika postaje puna adresa');
}
jest(skrati('a '.repeat(200)).length <= 160, 'opis skraćen');
jest(punNaslov(null) === 'MNK Osijek Kandit — službene stranice kluba', 'naslov naslovnice');

console.log(pao === 0 ? '\nSVE PROLAZI\n' : `\nPALO: ${pao}\n`);
process.exit(pao === 0 ? 0 : 1);
