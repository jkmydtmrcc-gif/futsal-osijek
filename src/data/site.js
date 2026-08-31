/**
 * Sav sadržaj naslovnice na jednom mjestu.
 *
 * Preneseno iz `renderVals()` u Naslovnica.dc.html — kad stignu pravi podaci
 * (HMNL kalendar, cijene u shopu, fotografije), mijenja se samo ovaj modul.
 */

export const SLOGAN =
  'Brzina, energija i strast na parketu. Klub s dušom Osijeka i ambicijom na vrhu SuperSport HMNL lige.';

export const VENUE = 'Športska dvorana Zrinjevac · 1.160 mjesta';

/* Glavna navigacija. `to` su rute za react-router. */
export const NAV_LINKS = [
  { id: 'pocetna', label: 'Početna', to: '/' },
  { id: 'klub', label: 'Klub', to: '/klub' },
  { id: 'postava', label: 'Prva postava', to: '/postava' },
  { id: 'raspored', label: 'Raspored', to: '/raspored' },
  { id: 'shop', label: 'Fan Shop', to: '/shop' },
  { id: 'novosti', label: 'Novosti', to: '/novosti' },
  { id: 'kontakt', label: 'Kontakt', to: '/kontakt' },
];

export const TICKETS_PATH = '/ulaznice';
export const CONTACT_PATH = '/kontakt';

export const TOPBAR_STRIP = [
  'MNK Osijek Kandit · Športska dvorana Zrinjevac',
  '2. mjesto regularnog dijela SuperSport HMNL-a 2025/26',
  'Finalist doigravanja 2024/25',
  'Trener: Carmine Tarantino · kapetan: Andrej Pandurević',
  'Vitor Lima ponovno u klubu',
];

export const TICKER = [
  { text: 'MNK Osijek Kandit · Zrinjevac', accent: false },
  { text: '2. mjesto regularnog dijela 2025/26', accent: true },
  { text: 'Finalist doigravanja 2024/25', accent: false },
  { text: 'Trener: Carmine Tarantino', accent: true },
  { text: 'Kapetan: Andrej Pandurević', accent: false },
  { text: 'Vitor Lima ponovno u klubu', accent: true },
  { text: 'SuperSport HMNL', accent: false },
];

export const HERO_FACTS = [
  { value: '2.', label: 'Regularni dio HMNL-a' },
  { value: '2024/25', label: 'Finale doigravanja' },
  { value: '2002.', label: 'Godina osnutka' },
];

export const IMPACT = [
  { value: '2002.', label: 'Godina osnutka' },
  { value: '1.160', label: 'Kapacitet Zrinjevca' },
  { value: '2.', label: 'Regularni dio 2025/26' },
  { value: '2024/25', label: 'Finale doigravanja' },
];

/**
 * Igrači.
 *
 * `number` je broj na dresu — prikazuje se velik, u obrisu, u kutu kartice.
 * `photo` je izrezan portret (bez pozadine) u `public/uploads/igraci/`.
 * Ako datoteka ne postoji ili se ne učita, kartica pada natrag na prezime
 * u pozadini, pa se slike mogu dodavati jedna po jedna.
 */
export const PLAYERS = [
  {
    name: 'Franko Jamičić',
    number: 1,
    pos: 'Vratar',
    note: 'Hrvatska',
    photo: '/uploads/igraci/franko-jamicic.webp',
  },
  {
    name: 'Andrej Pandurević',
    number: 8,
    pos: 'Kapetan',
    note: 'Hrvatska',
    photo: '/uploads/igraci/andrej-pandurevic.webp',
  },
  {
    name: 'Filip Petrušić',
    number: 19,
    pos: 'Igrač u polju',
    note: 'Hrvatska',
    photo: '/uploads/igraci/filip-petrusic.webp',
  },
  {
    name: 'Josip Šalaj',
    number: 7,
    pos: 'Igrač u polju',
    note: 'Hrvatska',
    photo: '/uploads/igraci/josip-salaj.webp',
  },
  {
    name: 'Nejc Hozjan',
    number: 77,
    pos: 'Igrač u polju',
    note: 'Slovenija',
    photo: '/uploads/igraci/nejc-hozjan.webp',
  },
  {
    name: 'Matias Mijić',
    number: 4,
    pos: 'Igrač u polju',
    note: 'Hrvatska',
    photo: '/uploads/igraci/matias-mijic.webp',
  },
  {
    name: 'Antonio Sekulić',
    number: 23,
    pos: 'Igrač u polju',
    note: 'Hrvatska',
    photo: '/uploads/igraci/antonio-sekulic.webp',
  },
];

/* Ime kluba po kojem se redak u tablici ističe. */
export const OUR_CLUB = 'Osijek Kandit';

/* Mjesta koja vode u doigravanje — dobivaju svjetliju boju pozicije. */
export const PLAYOFF_CUTOFF = 4;

const STANDINGS_ROWS = [
  { pos: 1, club: 'Olmissum', played: 6, points: 16 },
  { pos: 2, club: 'Osijek Kandit', played: 6, points: 13 },
  { pos: 3, club: 'Futsal Dinamo', played: 6, points: 12 },
  { pos: 4, club: 'Rijeka', played: 6, points: 11 },
  { pos: 5, club: 'Novo vrijeme', played: 6, points: 9 },
  { pos: 6, club: 'Torcida Biberon', played: 6, points: 7 },
  { pos: 7, club: 'Square', played: 6, points: 6 },
  { pos: 8, club: 'Crnica', played: 6, points: 4 },
  { pos: 9, club: 'Vrgorac', played: 6, points: 2 },
];

export const STANDINGS = STANDINGS_ROWS.map((row) => ({
  ...row,
  isUs: row.club === OUR_CLUB,
  isPlayoff: row.pos <= PLAYOFF_CUTOFF,
}));

export const STANDINGS_NOTE =
  'Prikazani poredak i termini su ogledni primjer izgleda — pravi podaci upisuju se kad HMNL objavi kalendar i tablicu sezone 2026/27.';

export const FIXTURES = [
  {
    when: 'Sub 17.10.',
    comp: 'HMNL · 7. kolo',
    title: 'Osijek Kandit — Futsal Dinamo',
    venue: 'Športska dvorana Zrinjevac',
  },
  {
    when: 'Sub 24.10.',
    comp: 'HMNL · 8. kolo',
    title: 'Olmissum — Osijek Kandit',
    venue: 'Dvorana Ribnjak, Omiš',
  },
  {
    when: 'Sri 28.10.',
    comp: 'Hrvatski kup',
    title: 'Osijek Kandit — Crnica',
    venue: 'Športska dvorana Zrinjevac',
  },
];

export const TIMELINE = [
  {
    when: '2025/26',
    title: 'Drugo mjesto regularnog dijela',
    note: 'Ligaški dio SuperSport HMNL-a momčad je završila na drugom mjestu.',
  },
  {
    when: '2025/26',
    title: 'Doigravanje — četvrtfinale',
    note: 'U završnom Glasniku HMNL-a klub je označen kao trećeplasirani sezone.',
  },
  {
    when: '2024/25',
    title: 'Finale doigravanja za prvaka',
    note: 'Do finala preko Torcide Biberon u četvrtfinalu i Futsal Dinama u polufinalu.',
  },
  {
    when: '2024/25',
    title: 'Naslov Novom vremenu',
    note: 'Finalna serija odigrana protiv Novog vremena Makarska.',
  },
];

export const CLUBS = [
  'Osijek Kandit',
  'Futsal Dinamo',
  'Novo vrijeme',
  'Olmissum',
  'Rijeka',
  'Torcida Biberon',
  'Square',
  'Crnica',
  'Vrgorac',
];

export const FEATURED_NEWS = {
  id: 'finale-2024-25',
  flag: 'Izdvojeno',
  title: 'Finale doigravanja nakon pobjede protiv Futsal Dinama',
  lead: 'U sezoni 2024/25 klub je do prvog finala došao preko Torcide Biberon u četvrtfinalu i Futsal Dinama u polufinalu.',
  meta: 'Sezona 2024/25 · Doigravanje',
  image: '/uploads/S-oskanvma10_GOM_300525-970.webp',
};

/**
 * Novosti.
 *
 * `id` je i adresa pojedinačne novosti (`/novosti/{id}`), pa mora biti
 * jedinstven i bez razmaka. `body` je niz odlomaka — tako se tekst piše i
 * uređuje bez HTML-a.
 */
export const NEWS = [
  {
    id: 'vitor-lima-povratak',
    date: 'Ljeto 2026.',
    cat: 'Transferi',
    title: 'Vitor Lima vratio se u klub',
    lead: 'Povratak brazilskog igrača klub je najavio na svojim društvenim mrežama.',
    image: '/uploads/aa.jpg',
    body: [
      'Vitor Lima ponovno je igrač MNK Osijek Kandit. Povratak je klub objavio na svojim društvenim mrežama, a navijači su ga dočekali kao jedno od najvažnijih pojačanja ljeta.',
      'Lima je u prethodnom mandatu bio jedno od prepoznatljivih lica momčadi na Zrinjevcu i igrač na kojeg se u napadu računalo u najvažnijim utakmicama sezone.',
      'Detalje ugovora klub nije objavio.',
    ],
  },
  {
    id: 'drugo-mjesto-regularnog-dijela',
    date: 'Sezona 2025/26',
    cat: 'Liga',
    title: 'Drugo mjesto regularnog dijela HMNL-a',
    lead: 'Momčad je ligaški dio završila druga, a doigravanje napustila u četvrtfinalu.',
    image: '/uploads/S-oskanvma10_GOM_300525-970.webp',
    body: [
      'Ligaški dio SuperSport HMNL-a u sezoni 2025/26 momčad je završila na drugom mjestu — najbolji plasman u regularnom dijelu u novijoj povijesti kluba.',
      'U doigravanju je put stao u četvrtfinalu, a u završnom Glasniku HMNL-a klub je označen kao trećeplasirani sezone.',
    ],
  },
  {
    id: 'finale-2024-25',
    date: 'Sezona 2024/25',
    cat: 'Doigravanje',
    title: 'Finale nakon pobjeda protiv Torcide i Dinama',
    lead: 'U finalnoj seriji naslov je osvojilo Novo vrijeme Makarska.',
    image: '/uploads/aa.jpg',
    body: [
      'Sezona 2024/25 ostala je zapisana kao sezona prvog finala doigravanja. U četvrtfinalu je pao Torcida Biberon, u polufinalu Futsal Dinamo.',
      'U finalnoj seriji protiv Novog vremena Makarska naslov je otišao u Makarsku, ali je put do finala potvrdio da je momčad ušla u sam vrh hrvatskog futsala.',
    ],
  },
  {
    id: 'zrinjevac-domaci-parket',
    date: 'Sezona 2025/26',
    cat: 'Dvorana',
    title: 'Zrinjevac ponovno pun na derbijima',
    lead: 'Domaće utakmice igraju se u Športskoj dvorani Zrinjevac s 1.160 mjesta.',
    image: '/uploads/aa.jpg',
    body: [
      'Športska dvorana Zrinjevac domaći je parket kluba. Kapacitet je 1.160 mjesta, a na derbijima protiv Olmissuma i Futsal Dinama tribine su redovito pune.',
      'Za grupne dolaske i najave gostujućih navijača klub je dostupan na e-mailu i klupskom broju telefona.',
    ],
  },
];

export const PARTNER_COUNTS = [
  { value: '2002.', label: 'Godina osnutka' },
  { value: '1.160', label: 'Kapacitet Zrinjevca' },
];

/* Logotipi ostalih partnera još nisu isporučeni; do tada svaka traka
   ponavlja Kanditov logotip kao rezervirano mjesto. */
export const PARTNER_ROWS = [
  { id: 'momcadi', tag: 'Partneri momčadi', modifier: 'a', count: 18 },
  { id: 'dvorane', tag: 'Partneri dvorane', modifier: 'b', count: 18 },
  { id: 'podupiratelji', tag: 'Podupiratelji', modifier: 'c', count: 18 },
];

export const FOOTER_LINKS = [
  { label: 'O klubu', to: '/klub' },
  { label: 'Prva postava', to: '/postava' },
  { label: 'Raspored i tablica', to: '/raspored' },
  { label: 'Novosti', to: '/novosti' },
  { label: 'Fan Shop', to: '/shop' },
];

export const SOCIALS = [
  { id: 'fb', label: 'FB', name: 'Facebook' },
  { id: 'ig', label: 'IG', name: 'Instagram' },
  { id: 'yt', label: 'YT', name: 'YouTube' },
  { id: 'tt', label: 'TT', name: 'TikTok' },
];

export const CONTACT = {
  address: ['Dvorana Zrinjevac', 'Zrinjevac 11', '31000 Osijek'],
  email: 'osijek.kelme@gmail.com',
  phone: '+385 31 227 503',
  phoneHref: '+38531227503',
};

/* Potpis izrađivača u podnožju. */
export const CREDIT = { prefix: 'Izrada', name: 'Flomis j.d.o.o.' };

export const LEGAL_LINKS = ['Uvjeti korištenja', 'Privatnost', 'Kolačići'];

export const IMAGES = {
  crest: '/uploads/images.jpeg',
  celebration: '/uploads/S-oskanvma10_GOM_300525-970.webp',
  team: '/uploads/aa.jpg',
  kandit: '/uploads/kandit-logo.png',
};

/** Poruka za rutu koja ne postoji. */
export const NOT_FOUND = {
  navId: null,
  eyebrow: 'Greška 404',
  title: 'Nema te stranice',
  lead: 'Poveznica je možda zastarjela ili je adresa krivo upisana.',
  progress: null,
};

/**
 * Zaglavlje svake stranice: nadnaslov, naslov i uvodna rečenica.
 * `navId` povezuje rutu sa stavkom u izborniku.
 */
export const PAGES = {
  '/klub': {
    navId: 'klub',
    eyebrow: 'Od 2002.',
    title: 'O klubu',
    lead: 'Futsal klub iz Osijeka. Domaći parket je Športska dvorana Zrinjevac, boje su bijelo-plave, a ime uz grad nosi Kandit.',
  },
  '/postava': {
    navId: 'postava',
    eyebrow: 'Sezona 2025/26',
    title: 'Prva postava',
    lead: 'Igrači, brojevi i pozicije. Stožer predvodi Carmine Tarantino, momčad kapetan Andrej Pandurević.',
  },
  '/raspored': {
    navId: 'raspored',
    eyebrow: 'SuperSport HMNL',
    title: 'Raspored i tablica',
    lead: 'Poredak i termini sezone 2026/27 upisuju se čim ih HMNL objavi.',
  },
  '/shop': {
    navId: 'shop',
    eyebrow: 'Klupska oprema',
    title: 'Fan Shop',
    lead: 'Opremu prodaje SalaSport — jedina specijalizirana futsal trgovina u Hrvatskoj.',
  },
  '/novosti': {
    navId: 'novosti',
    eyebrow: 'Iz kluba',
    title: 'Novosti',
    lead: 'Što se događa oko momčadi, u ligi i u dvorani.',
  },
  '/kontakt': {
    navId: 'kontakt',
    eyebrow: 'Javi nam se',
    title: 'Kontakt',
    lead: 'Dvorana Zrinjevac, e-mail i telefon kluba — za navijače, medije i partnere.',
  },
  '/ulaznice': {
    navId: null,
    eyebrow: 'Športska dvorana Zrinjevac',
    title: 'Ulaznice',
    lead: 'Domaće utakmice igraju se na Zrinjevcu, dvorani s 1.160 mjesta.',
  },
};

/**
 * Fan Shop vodi na SalaSport (Sportos j.d.o.o.), specijaliziranu futsal
 * trgovinu. Klub nema vlastitu naplatu — svaka kartica je razdjelnik prema
 * stranici trgovine na kojoj se artikl stvarno kupuje.
 */
export const SHOP_URL = 'https://salasport.hr/';

/** Pretraga "kandit" u trgovini — sve što je vezano uz klub na jednom mjestu. */
export const SHOP_SEARCH_URL = 'https://salasport.hr/?s=kandit&post_type=product';

export const SHOP_LINKS = [
  {
    cat: 'Dresovi i tekstil',
    name: 'Dresovi, hlačice, trenirke',
    note: 'Kelme, Joma, Errea',
    href: 'https://salasport.hr/kategorija-proizvoda/tekstil/',
  },
  {
    cat: 'Lopte',
    name: 'Futsal lopte',
    note: 'Select, Mikasa',
    href: 'https://salasport.hr/kategorija-proizvoda/lopte/futsal-lopte/',
  },
  {
    cat: 'Vratari',
    name: 'Golmanska oprema',
    note: 'Rukavice i štitnici',
    href: 'https://salasport.hr/kategorija-proizvoda/oprema/golmanska-oprema/',
  },
  {
    cat: 'Klubovi',
    name: 'Opremanje klubova',
    note: 'Narudžbe za momčadi',
    href: 'https://salasport.hr/klubovi/',
  },
];

/**
 * Artikli u Fan Shopu.
 *
 * `price` je namjerno prazan dok ga netko ne upiše u administraciji: cijene
 * i dostupnost stoje kod trgovine i mijenjaju se, a prepisana cijena koja
 * zastari — laže. Dok je prazan, kartica umjesto iznosa nudi "Provjeri
 * cijenu", pa je stranica točna i bez ijednog upisanog broja.
 *
 * `href` vodi točno na stranicu na kojoj se artikl kupuje. Ako artikl nema
 * svoju stranicu u trgovini, vodi na kategoriju ili na pretragu "kandit" —
 * nikad na izmišljenu adresu koja završi na 404.
 *
 * `art` bira crtež na kartici (vidi ProductArt.jsx); `image` ga pregazi kad
 * se u administraciji upiše prava fotografija.
 */
export const SHOP_PRODUCTS = [
  {
    id: 'dres-domaci',
    cat: 'Dresovi',
    name: 'MNK Osijek Kandit — dres domaći',
    note: 'Službeni dres sezone 2025/26, uz personalizaciju broja i prezimena.',
    brand: 'Joma',
    badge: 'Službeni dres',
    price: '',
    oldPrice: '',
    art: 'dres',
    image: '',
    href: 'https://salasport.hr/proizvod/dres-domaci-mnk-osijek/',
  },
  {
    id: 'dres-gostujuci',
    cat: 'Dresovi',
    name: 'MNK Osijek Kandit — dres gostujući',
    note: 'Gostujuća inačica kompleta. Dostupnost provjeri u trgovini.',
    brand: 'Joma',
    badge: '',
    price: '',
    oldPrice: '',
    art: 'dres-gost',
    image: '',
    href: 'https://salasport.hr/?s=kandit&post_type=product',
  },
  {
    id: 'golmanski-dres',
    cat: 'Vratari',
    name: 'Golmanski dres',
    note: 'Dugi rukavi, štitnici na laktovima.',
    brand: 'Joma',
    badge: '',
    price: '',
    oldPrice: '',
    art: 'golman',
    image: '',
    href: 'https://salasport.hr/kategorija-proizvoda/oprema/golmanska-oprema/',
  },
  {
    id: 'hlacice',
    cat: 'Tekstil',
    name: 'Igračke hlačice',
    note: 'Uz dres ili zasebno, u klupskim bojama.',
    brand: 'Joma',
    badge: '',
    price: '',
    oldPrice: '',
    art: 'hlacice',
    image: '',
    href: 'https://salasport.hr/kategorija-proizvoda/tekstil/',
  },
  {
    id: 'trenirka',
    cat: 'Tekstil',
    name: 'Trenirka — gornji dio',
    note: 'Za zagrijavanje i putovanja.',
    brand: 'Joma',
    badge: '',
    price: '',
    oldPrice: '',
    art: 'trenirka',
    image: '',
    href: 'https://salasport.hr/kategorija-proizvoda/tekstil/',
  },
  {
    id: 'futsal-lopta',
    cat: 'Lopte',
    name: 'Futsal lopta',
    note: 'Veličina 4, smanjeni odskok — službene lopte za dvoranu.',
    brand: 'Select · Mikasa',
    badge: '',
    price: '',
    oldPrice: '',
    art: 'lopta',
    image: '',
    href: 'https://salasport.hr/kategorija-proizvoda/lopte/futsal-lopte/',
  },
  {
    id: 'rukavice',
    cat: 'Vratari',
    name: 'Golmanske rukavice',
    note: 'Za parket, s pojačanim hvatom.',
    brand: 'Joma',
    badge: '',
    price: '',
    oldPrice: '',
    art: 'rukavice',
    image: '',
    href: 'https://salasport.hr/kategorija-proizvoda/oprema/golmanska-oprema/',
  },
  {
    id: 'opremanje-kluba',
    cat: 'Klubovi',
    name: 'Opremanje momčadi',
    note: 'Kompleti za klubove i škole futsala, s tiskom.',
    brand: 'SalaSport',
    badge: 'Za klubove',
    price: '',
    oldPrice: '',
    art: 'klub',
    image: '',
    href: 'https://salasport.hr/klubovi/',
  },
];

/**
 * Dres s imenom: posjetitelj upiše prezime i broj, kartica ih pokaže na
 * dresu, a gumb vodi na stranicu proizvoda gdje se personalizacija stvarno
 * naručuje.
 */
export const SHOP_CUSTOM = {
  eyebrow: 'Personalizacija',
  title: 'Dres s tvojim imenom',
  lead: 'Upiši prezime i broj, pogledaj kako izgleda, pa nastavi na SalaSport — personalizacija se bira na stranici proizvoda.',
  defaultName: 'PANDUREVIĆ',
  defaultNumber: '8',
  href: 'https://salasport.hr/proizvod/dres-domaci-mnk-osijek/',
};

export const SHOP_NOTE =
  'SalaSport vodi Sportos j.d.o.o. Cijene, veličine i dostupnost stoje u trgovini. Za upite o klupskoj opremi javite se klubu na osijek.kelme@gmail.com, a za narudžbe u trgovini na prodaja@salasport.hr.';

/** Koraci narudžbe — da bude jasno tko što radi. */
export const SHOP_STEPS = [
  { n: '01', title: 'Odaberi artikl', note: 'Klik na karticu otvara artikl u trgovini SalaSport.' },
  { n: '02', title: 'Veličina i tisak', note: 'Veličinu, broj i prezime biraš na stranici proizvoda.' },
  { n: '03', title: 'Naručuješ kod trgovine', note: 'Plaćanje i dostava idu preko SalaSporta, ne preko kluba.' },
];

/** Stožer — imena poznata iz klupskih objava. */
export const STAFF = [
  { role: 'Trener', name: 'Carmine Tarantino' },
  { role: 'Kapetan', name: 'Andrej Pandurević' },
];

/** Činjenice o klubu koje stoje na stranici "O klubu". */
export const CLUB_FACTS = [
  { label: 'Osnovan', value: '2002.' },
  { label: 'Dvorana', value: 'Zrinjevac' },
  { label: 'Kapacitet', value: '1.160' },
  { label: 'Boje', value: 'Bijelo-plava' },
];

/** Uspjesi — samo ono što je potvrđeno u klupskim i ligaškim objavama. */
export const HONOURS = [
  {
    when: '2024/25',
    title: 'Finale doigravanja',
    note: 'Do finala preko Torcide Biberon u četvrtfinalu i Futsal Dinama u polufinalu. Naslov je osvojilo Novo vrijeme Makarska.',
  },
  {
    when: '2025/26',
    title: 'Drugo mjesto regularnog dijela',
    note: 'Ligaški dio SuperSport HMNL-a momčad je završila druga, a doigravanje napustila u četvrtfinalu.',
  },
];

/**
 * Priča o klubu — odlomci na stranici "O klubu". Drže se ovdje, a ne u
 * JSX-u, da se mogu mijenjati iz administracije.
 */
export const CLUB_STORY = [
  'MNK Osijek Kandit osnovan je 2002. godine. Domaće utakmice igra u Športskoj dvorani Zrinjevac, koja prima 1.160 gledatelja, a natječe se u SuperSport HMNL-u — prvoj hrvatskoj malonogometnoj ligi.',
  'Kandit je naziv sponzor kluba, pa ime tvrtke stoji uz ime grada u punom nazivu momčadi. Boje su bijelo-plave, a grb i dres nose ih od prvog dana.',
  'Zadnje dvije sezone klub je proveo u samom vrhu lige: finale doigravanja 2024/25. i drugo mjesto regularnog dijela 2025/26.',
];

/**
 * Odigrane utakmice. Namjerno prazno — rezultati se upisuju u administraciji
 * kad se odigraju. Dok je popis prazan, blok se na stranici ne prikazuje.
 */
export const RESULTS = [];

/** Kako doći na Zrinjevac. */
export const VENUE_INFO = [
  { label: 'Adresa', value: 'Zrinjevac 11, 31000 Osijek' },
  { label: 'Kapacitet', value: '1.160 mjesta' },
  { label: 'Vrata', value: 'Otvaraju se sat vremena prije početka' },
  { label: 'Parking', value: 'Uz dvoranu i u okolnim ulicama' },
];

/** Česta pitanja o dolasku i ulaznicama. */
export const TICKET_FAQ = [
  {
    q: 'Prodaju li se ulaznice online?',
    a: 'Klub trenutno nema online prodaju. Ulaznice se kupuju na dan utakmice na ulazu u dvoranu, a za rezervacije se javi klubu e-mailom.',
  },
  {
    q: 'Dolazimo u grupi — može li popust?',
    a: 'Za škole, klubove i navijačke skupine javi se klubu unaprijed na osijek.kelme@gmail.com pa dogovorimo ulaz i mjesta na tribini.',
  },
  {
    q: 'Kad se objavljuju termini utakmica?',
    a: 'Termine objavljujemo čim HMNL potvrdi raspored kola. Do tada popis nadolazećih utakmica na stranici Raspored služi kao okvir.',
  },
  {
    q: 'Dolaze li gostujući navijači?',
    a: 'Dolaze, uz prethodnu najavu klubu. Za gostujući sektor javi se najkasnije tri dana prije utakmice.',
  },
];

/** Redoslijed pozicija na stranici postave. */
export const POSITION_GROUPS = [
  { id: 'vratari', label: 'Vratari', match: ['Vratar'] },
  { id: 'polje', label: 'Igrači u polju', match: ['Igrač u polju', 'Kapetan'] },
];
