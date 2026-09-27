/**
 * Zapisuje `sitemap.xml`, dopunjava `robots.txt` i upisuje punu adresu u
 * oznake za dijeljenje pri buildu.
 *
 * Karta stranice traži pune adrese, a domena se zna tek kad je stranica
 * negdje objavljena. Zato se uzima iz okoline:
 *
 *   SITE_URL=https://mnk-osijek-kandit.vercel.app npm run build
 *
 * Na Vercelu se `VERCEL_PROJECT_PRODUCTION_URL` postavlja sam, pa u pravilu
 * ništa ne treba upisivati. Bez ijednog od ta dva se karta namjerno **ne**
 * zapisuje: kriva domena u sitemapu je gore nego nikakva — tražilica po njoj
 * traži stranice kojih nema.
 */
import { writeFileSync, existsSync, readFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

/* Rute koje postoje bez obzira na sadržaj. Pojedinačne novosti se dodaju iz
   zadanog sadržaja; one upisane kasnije tražilica nađe preko poveznica. */
const ROUTES = [
  { path: '/', priority: '1.0', freq: 'weekly' },
  { path: '/klub', priority: '0.7', freq: 'monthly' },
  { path: '/postava', priority: '0.8', freq: 'monthly' },
  { path: '/raspored', priority: '0.9', freq: 'weekly' },
  { path: '/shop', priority: '0.7', freq: 'monthly' },
  { path: '/novosti', priority: '0.9', freq: 'weekly' },
  { path: '/kontakt', priority: '0.5', freq: 'yearly' },
  { path: '/ulaznice', priority: '0.6', freq: 'monthly' },
];

function baseUrl() {
  const explicit = process.env.SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, '');

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel.replace(/\/+$/, '')}`;

  return null;
}

/** Oznake novosti iz zadanog sadržaja, bez uvoza React koda. */
function newsPaths(root) {
  try {
    const file = readFileSync(join(root, 'src/data/site.js'), 'utf8');
    const block = file.slice(file.indexOf('export const NEWS = ['), file.indexOf('export const PARTNER_COUNTS'));
    return [...block.matchAll(/id:\s*'([a-z0-9-]+)'/g)].map((m) => `/novosti/${m[1]}`);
  } catch {
    return [];
  }
}

/**
 * Facebook i WhatsApp traže punu adresu slike u `og:image` — s relativnom
 * putanjom podijeljena poveznica stiže bez slike. Domena se zna tek pri
 * buildu, pa se upisuje ovdje, zajedno s `og:url` i `canonical`.
 */
function apsolutneOznake(dir, base) {
  const put = join(dir, 'index.html');
  if (!existsSync(put)) return;

  let html = readFileSync(put, 'utf8');

  html = html.replace(
    /(<meta property="og:image" content=")\/([^"]*")/,
    (_, a, b) => `${a}${base}/${b}`
  );

  if (!/property="og:url"/.test(html)) {
    html = html.replace(
      '<meta name="twitter:card"',
      `<meta property="og:url" content="${base}/">\n<link rel="canonical" href="${base}/">\n<meta name="twitter:card"`
    );
  }

  writeFileSync(put, html);
}

/** Znakovi koji u HTML atributu moraju biti pisani zamjenom. */
const escape = (t) =>
  String(t ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Skraćuje opis na duljinu koju tražilice još prikazuju cijelu. */
function skrati(tekst, max = 160) {
  const t = String(tekst ?? '').replace(/\s+/g, ' ').trim();
  return t.length <= max ? t : `${t.slice(0, max - 1).replace(/[\s,;:.–—-]+\S*$/, '')}…`;
}

/**
 * Za svaku rutu zapisuje vlastiti `index.html` s upisanim naslovom i
 * oznakama za dijeljenje.
 *
 * `components/Meta.jsx` to isto radi u pregledniku, ali Facebookov i
 * WhatsAppov pregledavatelj ne izvršavaju JavaScript — njima vrijedi samo
 * ono što stoji u datoteci. Bez ovoga svaka podijeljena poveznica, i ona na
 * pojedinu novost, stiže s naslovom i slikom naslovnice.
 *
 * Vercel prvo traži datoteku, pa tek onda primjenjuje prepisivanje na
 * `index.html`, tako da `/klub/index.html` sam preuzme rutu `/klub`.
 */
async function poRutama(root, dir, base) {
  const izvor = join(dir, 'index.html');
  if (!existsSync(izvor)) return 0;
  const predlozak = readFileSync(izvor, 'utf8');

  let PAGES = {};
  let NEWS = [];
  try {
    ({ PAGES = {}, NEWS = [] } = await import(pathToFileURL(join(root, 'src/data/site.js')).href));
  } catch {
    return 0;
  }

  const KLUB = 'MNK Osijek Kandit';
  const zadanaSlika = `${base}/uploads/S-oskanvma10_GOM_300525-970.webp`;

  const rute = [
    ...Object.entries(PAGES).map(([put, p]) => ({
      put,
      naslov: `${p.title} — ${KLUB}`,
      opis: skrati(p.lead),
      slika: zadanaSlika,
      vrsta: 'website',
    })),
    ...NEWS.filter((n) => n.id).map((n) => ({
      put: `/novosti/${n.id}`,
      naslov: `${n.title} — ${KLUB}`,
      opis: skrati(n.lead),
      slika: n.image ? new URL(n.image, `${base}/`).href : zadanaSlika,
      vrsta: 'article',
    })),
  ];

  let zapisano = 0;
  for (const r of rute) {
    const url = `${base}${r.put}`;
    let html = predlozak
      .replace(/<title>[^<]*<\/title>/, `<title>${escape(r.naslov)}</title>`)
      .replace(/(<meta name="description" content=")[^"]*(")/, `$1${escape(r.opis)}$2`)
      .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escape(r.naslov)}$2`)
      .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${escape(r.opis)}$2`)
      .replace(/(<meta property="og:type" content=")[^"]*(")/, `$1${r.vrsta}$2`)
      .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${escape(r.slika)}$2`)
      .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${escape(url)}$2`)
      .replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${escape(url)}$2`);

    const mapa = join(dir, ...r.put.split('/').filter(Boolean));
    mkdirSync(mapa, { recursive: true });
    writeFileSync(join(mapa, 'index.html'), html);
    zapisano += 1;
  }
  return zapisano;
}

export default function sitemapPlugin() {
  let root = process.cwd();
  let outDir = 'dist';

  return {
    name: 'mnk-sitemap',
    apply: 'build',

    configResolved(config) {
      root = config.root;
      outDir = config.build.outDir;
    },

    async closeBundle() {
      const base = baseUrl();
      const dir = join(root, outDir);

      if (!base) {
        console.log(
          '\n  sitemap  preskočen — postavi SITE_URL da se zapiše (npr. SITE_URL=https://klub.hr npm run build)\n'
        );
        return;
      }

      const today = new Date().toISOString().slice(0, 10);
      const entries = [
        ...ROUTES,
        ...newsPaths(root).map((path) => ({ path, priority: '0.6', freq: 'monthly' })),
      ];

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) => `  <url>
    <loc>${base}${e.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${e.freq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;
      writeFileSync(join(dir, 'sitemap.xml'), xml);
      apsolutneOznake(dir, base);
      const stranica = await poRutama(root, dir, base);

      const robotsPath = join(dir, 'robots.txt');
      const robots = existsSync(robotsPath) ? readFileSync(robotsPath, 'utf8').trimEnd() : 'User-agent: *\nAllow: /';
      writeFileSync(robotsPath, `${robots.replace(/\nSitemap:.*$/m, '')}\n\nSitemap: ${base}/sitemap.xml\n`);

      console.log(
        `\n  sitemap  ${entries.length} adresa na ${base}` +
          `\n  oznake   ${stranica} stranica s vlastitim naslovom i slikom za dijeljenje\n`
      );
    },
  };
}
