/**
 * Zapisuje `sitemap.xml` i dopunjava `robots.txt` pri buildu.
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
import { writeFileSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

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

    closeBundle() {
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

      const robotsPath = join(dir, 'robots.txt');
      const robots = existsSync(robotsPath) ? readFileSync(robotsPath, 'utf8').trimEnd() : 'User-agent: *\nAllow: /';
      writeFileSync(robotsPath, `${robots.replace(/\nSitemap:.*$/m, '')}\n\nSitemap: ${base}/sitemap.xml\n`);

      console.log(`\n  sitemap  ${entries.length} adresa na ${base}\n`);
    },
  };
}
