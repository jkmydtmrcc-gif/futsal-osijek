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

export const PLAYERS = [
  { name: 'Riccardo Ditano', pos: 'Vratar', note: 'Italija' },
  { name: 'Andrej Pandurević', pos: 'Kapetan', note: 'Domaći igrač' },
  { name: 'Gordan Duvančić', pos: 'Igrač u polju', note: 'Hrvatska' },
  { name: 'Jeremy Bukovec', pos: 'Igrač u polju', note: 'Hrvatska' },
  { name: 'Nejc Hozjan', pos: 'Igrač u polju', note: 'Slovenija' },
  { name: 'Matheus Dener', pos: 'Igrač u polju', note: 'Brazil' },
  { name: 'Everton Cardoso — Gallo', pos: 'Igrač u polju', note: 'Brazil' },
  { name: 'Vitor Lima', pos: 'Igrač u polju', note: 'Povratnik u klub' },
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

export const PRODUCTS = [
  {
    cat: 'Dres',
    name: 'Domaći dres — bijelo-plavi',
    price: 'Cijena na upit',
    slot: 'foto dresa',
    tag: 'Novo',
  },
  { cat: 'Dres', name: 'Gostujući dres', price: 'Cijena na upit', slot: 'foto dresa', tag: '' },
  {
    cat: 'Navijački rekviziti',
    name: 'Klupski šal',
    price: 'Cijena na upit',
    slot: 'foto šala',
    tag: '',
  },
  {
    cat: 'Navijački rekviziti',
    name: 'Kapa s grbom',
    price: 'Cijena na upit',
    slot: 'foto kape',
    tag: '',
  },
];

export const SHOP_PERKS = [
  'Preuzimanje u dvorani na dan utakmice',
  'Klupski web: mnkosijek.com',
  'Upiti: osijek.kelme@gmail.com',
];

export const FEATURED_NEWS = {
  flag: 'Izdvojeno',
  title: 'Finale doigravanja nakon pobjede protiv Futsal Dinama',
  lead: 'U sezoni 2024/25 klub je do prvog finala došao preko Torcide Biberon u četvrtfinalu i Futsal Dinama u polufinalu.',
  meta: 'Sezona 2024/25 · Doigravanje',
};

export const NEWS = [
  {
    date: 'Ljeto 2026.',
    cat: 'Transferi',
    title: 'Vitor Lima vratio se u klub',
    lead: 'Povratak brazilskog igrača klub je najavio na svojim društvenim mrežama.',
  },
  {
    date: 'Sezona 2025/26',
    cat: 'Liga',
    title: 'Drugo mjesto regularnog dijela HMNL-a',
    lead: 'Momčad je ligaški dio završila druga, a doigravanje napustila u četvrtfinalu.',
  },
  {
    date: 'Sezona 2024/25',
    cat: 'Doigravanje',
    title: 'Finale nakon pobjeda protiv Torcide i Dinama',
    lead: 'U finalnoj seriji naslov je osvojilo Novo vrijeme Makarska.',
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

/**
 * Stranice koje su još u izradi.
 *
 * Svaka dobiva isto zaglavlje i podnožje kao naslovnica, a u sredini
 * poruku "u izgradnji" u istoj vizualnoj temi. Kad stranica bude gotova,
 * njezin unos se ovdje briše i dodaje se prava ruta.
 */
export const UNDER_CONSTRUCTION = {
  '/klub': {
    navId: 'klub',
    eyebrow: 'Klub',
    title: 'O klubu',
    lead: 'Priprema se priča o klubu od osnutka 2002. — ljudi, dvorana i putanja kroz lige.',
    progress: 45,
  },
  '/postava': {
    navId: 'postava',
    eyebrow: 'Prva postava',
    title: 'Momčad',
    lead: 'Profili igrača i stručnog stožera čekaju službene portrete i podatke o sezoni.',
    progress: 60,
  },
  '/raspored': {
    navId: 'raspored',
    eyebrow: 'SuperSport HMNL',
    title: 'Raspored i tablica',
    lead: 'Cijeli kalendar i tablica upisuju se čim HMNL objavi termine sezone 2026/27.',
    progress: 35,
  },
  '/shop': {
    navId: 'shop',
    eyebrow: 'Službena klupska oprema',
    title: 'Fan Shop',
    lead: 'Dresovi, šalovi i navijački rekviziti — trgovina se otvara uz fotografije i cijene.',
    progress: 50,
  },
  '/novosti': {
    navId: 'novosti',
    eyebrow: 'Novosti',
    title: 'Iz kluba',
    lead: 'Arhiva vijesti, najave utakmica i izvještaji uskoro na jednom mjestu.',
    progress: 40,
  },
  '/kontakt': {
    navId: 'kontakt',
    eyebrow: 'Javi nam se',
    title: 'Kontakt',
    lead: 'Obrazac, karta dvorane i kontakti za medije i partnere su u pripremi.',
    progress: 55,
  },
  '/ulaznice': {
    navId: null,
    eyebrow: 'Zrinjevac',
    title: 'Ulaznice',
    lead: 'Online prodaja ulaznica priprema se za novu sezonu. Do tada — na blagajni dvorane.',
    progress: 30,
  },
};

/** Poruka za rutu koja ne postoji. */
export const NOT_FOUND = {
  navId: null,
  eyebrow: 'Greška 404',
  title: 'Nema te stranice',
  lead: 'Poveznica je možda zastarjela ili je adresa krivo upisana.',
  progress: null,
};
