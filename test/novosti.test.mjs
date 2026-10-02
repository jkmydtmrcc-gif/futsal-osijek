/**
 * Provjera novosti.
 *
 * Ovdje se lomila najvidljivija poveznica na stranici. Istaknuta objava bila
 * je izbačena iz popisa, a njezina je kartica ipak vodila na
 * `/novosti/{id}` — gdje ju je stranica objave tražila baš u tom popisu.
 * Klik na veliki okvir završavao je na „Nema te stranice“, i to uvijek čim je
 * sadržaj došao iz baze.
 *
 * Zato svaki test ovdje završava istim pitanjem: **nalazi li se objava na
 * koju kartica vodi u popisu po kojem stranica objave traži?**
 */
import { slozinovosti, newsFromRow, zadaniSadrzaj } from '../src/lib/mapiranje.js';

let pao = 0;
const jest = (uvjet, opis) => {
  console.log(`  ${uvjet ? '✓' : '✗'} ${opis}`);
  if (!uvjet) pao += 1;
};

/** Točno ono što radi `Novost.jsx`: traži objavu po adresi iz kartice. */
const otvoriSe = ({ items, featured }, id) => items.some((n) => n.id === id);

console.log('\nredak iz baze');
{
  const n = newsFromRow({
    id: '11111111-2222-3333-4444-555555555555',
    slug: 'vitor-lima-povratak',
    date: 'Ljeto 2026.',
    cat: 'Transferi',
    title: 'Vitor Lima vratio se u klub',
    lead: 'Povratak brazilskog igrača.',
    image: '/uploads/aa.jpg',
    featured: true,
    body: 'Prvi odlomak.\n\nDrugi odlomak.\n\n\nTreći odlomak.',
  });
  jest(n.id === 'vitor-lima-povratak', 'adresa je `slug` kad postoji');
  jest(n.featured === true, 'oznaka istaknutog se prenosi');
  jest(n.body.length === 3, `tekst se dijeli na odlomke po praznom retku (${n.body.length})`);
}
{
  // Bez `slug`-a poveznica mora i dalje raditi — samo je ružna.
  const n = newsFromRow({ id: 'abc-123', title: 'Bez adrese' });
  jest(n.id === 'abc-123', 'bez `slug`-a adresa pada na ključ iz baze');
  jest(n.featured === false, 'neoznačena objava nije istaknuta');
  jest(Array.isArray(n.body) && n.body.length === 0, 'prazan tekst daje prazan niz odlomaka');
}
{
  // Ugrađeni sadržaj već nosi niz odlomaka; ne smije se pretvoriti u tekst.
  const n = newsFromRow({ id: 'x', body: ['Prvi.', 'Drugi.'] });
  jest(n.body.length === 2 && n.body[0] === 'Prvi.', 'već razlomljen tekst ostaje kakav jest');
}

console.log('\nistaknuta objava ostaje u popisu');
{
  const redci = [
    { id: 'a', slug: 'prva', title: 'Prva', date: 'Ruj', cat: 'Liga' },
    { id: 'b', slug: 'druga', title: 'Druga', date: 'Lis', cat: 'Transferi', featured: true },
    { id: 'c', slug: 'treca', title: 'Treća', date: 'Stu', cat: 'Liga' },
  ];
  const n = slozinovosti(redci);

  jest(n.items.length === 3, `popis ima sve objave, i istaknutu (${n.items.length})`);
  jest(n.featured.id === 'druga', 'istaknuta je ona koja je označena');
  jest(otvoriSe(n, n.featured.id), 'ISTAKNUTA SE OTVARA — kvar zbog kojeg testovi postoje');
  jest(otvoriSe(n, 'prva') && otvoriSe(n, 'treca'), 'i obične objave se otvaraju');
  jest(n.featured.flag === 'Izdvojeno', 'istaknuta nosi zastavicu za okvir');
  jest(n.featured.meta === 'Lis · Transferi', `istaknuta nosi `.concat(`„${n.featured.meta}“`));
}

console.log('\nnijedna objava nije označena');
{
  // Najčešći stvarni slučaj: vlasnik upiše vijesti i zaboravi označiti jednu.
  // Prije je tada u okviru stajala ugrađena priča koje u bazi nema — i klik
  // na nju je vodio u prazno.
  const n = slozinovosti([
    { id: 'a', slug: 'prva', title: 'Prva', date: 'Ruj', cat: 'Liga' },
    { id: 'b', slug: 'druga', title: 'Druga', date: 'Lis', cat: 'Liga' },
  ]);
  jest(n.featured.id === 'prva', 'bez označene, istaknuta je prva objava');
  jest(otvoriSe(n, n.featured.id), 'i ona se otvara');
  jest(n.items.length === 2, 'popis je i dalje cijel');
}

console.log('\nrubni slučajevi');
jest(slozinovosti([]).featured === null, 'prazna baza nema istaknutu');
jest(slozinovosti([]).items.length === 0, 'prazna baza daje prazan popis');
jest(slozinovosti(undefined).featured === null, 'nepostojeći popis ne ruši');
{
  const n = slozinovosti([{ id: 'a', slug: 'sama', title: 'Jedina', date: '', cat: '' }]);
  jest(n.featured.id === 'sama' && n.items.length === 1, 'jedina objava je ujedno istaknuta');
  jest(n.featured.meta === '', 'bez datuma i kategorije meta je prazna, ne „ · “');
}
{
  // Dvije označene: uzima se prva, ali obje ostaju u popisu.
  const n = slozinovosti([
    { id: 'a', slug: 'prva', title: 'Prva', featured: true },
    { id: 'b', slug: 'druga', title: 'Druga', featured: true },
  ]);
  jest(n.featured.id === 'prva' && n.items.length === 2, 'dvije označene ne gube nijednu objavu');
}

console.log('\nugrađeni sadržaj prolazi istim putem');
{
  const { news } = zadaniSadrzaj();
  jest(news.featured !== null, 'ugrađeni sadržaj ima istaknutu objavu');
  jest(otvoriSe(news, news.featured.id), 'i ona se otvara');
  jest(
    news.items.every((n) => news.items.filter((d) => d.id === n.id).length === 1),
    'nijedna adresa se ne ponavlja'
  );
  jest(news.items.every((n) => n.title && n.id), 'svaka objava ima naslov i adresu');
}

console.log(pao === 0 ? '\nSVE PROLAZI\n' : `\nPALO: ${pao}\n`);
process.exit(pao === 0 ? 0 : 1);
