/**
 * Oznake za dijeljenje (naslov, opis, slika) — za svaku adresu stranice.
 *
 * Kad se poveznica zalijepi u WhatsApp, Facebook, Messenger ili Viber,
 * njihov pregledavatelj skine HTML stranice i pročita `og:` oznake. Ali
 * JavaScript ne izvršava — a stranica je aplikacija koja oznake postavlja
 * tek u pregledniku (`Meta.jsx`). Zato je svaka podijeljena novost stizala
 * s naslovnom fotografijom i općim opisom kluba.
 *
 * Isti izračun sada vrijedi na dva mjesta: u pregledniku (`Meta.jsx`) i na
 * poslužitelju (`api/dijeljenje.js`), koji pregledavateljima vraća HTML s
 * već upisanim oznakama. Jedna funkcija — pa se ta dva ne mogu razići.
 *
 * Bez ijednog uvoza iz Reacta i bez preglednika, pa radi i u Nodeu.
 */
import { bezOznaka, blokovi } from './oblikovanje.js';

export const IME_KLUBA = 'MNK Osijek Kandit';

/** Naslov u kartici i u pregledu poveznice. */
export const punNaslov = (naslov) =>
  naslov ? `${naslov} — ${IME_KLUBA}` : `${IME_KLUBA} — službene stranice kluba`;

/** Skraćuje opis na duljinu koju tražilice i pregledi još prikazuju cijelu. */
export function skrati(tekst, max = 160) {
  const cist = String(tekst ?? '').replace(/\s+/g, ' ').trim();
  if (cist.length <= max) return cist;
  return `${cist.slice(0, max - 1).replace(/[\s,;:.–—-]+\S*$/, '')}…`;
}

/** Prvi odlomak teksta objave, bez oznaka — kad objava nema uvod. */
function prviOdlomak(body) {
  const ravno = (cvorovi) => cvorovi.map((c) => (typeof c === 'string' ? c : ravno(c.djeca))).join('');
  for (const b of blokovi(body ?? [])) {
    if (b.vrsta === 'p' || b.vrsta === 'citat') return b.redci.map(ravno).join(' ');
  }
  return '';
}

/** `'/novosti/'` → `'/novosti'`; upit i sidro se odbacuju. */
export function ocistiPut(put) {
  const p = String(put ?? '/').split(/[?#]/)[0] || '/';
  const s = p.startsWith('/') ? p : `/${p}`;
  return s.length > 1 ? s.replace(/\/+$/, '') : s;
}

/**
 * Oznake za jednu adresu.
 *
 * `sadrzaj` je isti oblik koji stranica dobiva iz `useContent()`: `pages`,
 * `news`, `hero`, `images`, `notFound`. Vraća `{ naslov, opis, slika, vrsta,
 * pronadeno }` — `slika` može biti relativna, pretvara je `punaAdresa`.
 */
export function oznakeZaPut(put, sadrzaj) {
  const p = ocistiPut(put);
  const zadanaSlika = sadrzaj.images?.celebration ?? '';

  if (p === '/') {
    return { naslov: null, opis: sadrzaj.hero?.slogan ?? '', slika: zadanaSlika, vrsta: 'website', pronadeno: true };
  }

  const novost = p.match(/^\/novosti\/([^/]+)$/);
  if (novost) {
    let id = novost[1];
    try {
      id = decodeURIComponent(id);
    } catch {
      /* neispravan postotni zapis — traži se kakav jest */
    }
    const item = (sadrzaj.news?.items ?? []).find((n) => String(n.id) === id);
    if (item) {
      return {
        naslov: item.title,
        opis: bezOznaka(item.lead) || prviOdlomak(item.body),
        // Objava bez fotografije dijeli se s klupskom — bolje nego bez slike.
        slika: item.image || zadanaSlika,
        vrsta: 'article',
        pronadeno: true,
      };
    }
  }

  const stranica = sadrzaj.pages?.[p];
  if (stranica && !novost) {
    return { naslov: stranica.title, opis: stranica.lead, slika: zadanaSlika, vrsta: 'website', pronadeno: true };
  }

  const nema = sadrzaj.notFound ?? {};
  return { naslov: nema.title ?? 'Nema te stranice', opis: nema.lead ?? '', slika: zadanaSlika, vrsta: 'website', pronadeno: false };
}

/** Relativna adresa slike → puna. Pregledavatelji relativnu ne razriješe. */
export function punaAdresa(adresa, izvor) {
  if (!adresa) return '';
  try {
    return new URL(adresa, izvor).href;
  } catch {
    return '';
  }
}

const zaAtribut = (s) =>
  String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/**
 * Upisuje oznake u `index.html`.
 *
 * Postojeće oznake za dijeljenje i opis se brišu i pišu ispočetka — tako se
 * ne može dogoditi da ostane stara `og:image` uz novu `og:title`. Sve ostalo
 * u dokumentu (skripte, pisma, ikone) ostaje netaknuto, pa posjetitelj koji
 * dobije ovaj HTML dobije i potpunu stranicu.
 */
export function upisiOznake(html, oznake, izvor, put) {
  const naslov = punNaslov(oznake.naslov);
  const opis = skrati(oznake.opis);
  const slika = punaAdresa(oznake.slika, izvor);
  const url = punaAdresa(ocistiPut(put), izvor);

  const meta = [
    ['name', 'description', opis],
    ['property', 'og:site_name', IME_KLUBA],
    ['property', 'og:type', oznake.vrsta],
    ['property', 'og:locale', 'hr_HR'],
    ['property', 'og:title', naslov],
    ['property', 'og:description', opis],
    ['property', 'og:url', url],
    ['property', 'og:image', slika],
    ['property', 'og:image:alt', oznake.naslov ?? IME_KLUBA],
    ['name', 'twitter:card', 'summary_large_image'],
    ['name', 'twitter:title', naslov],
    ['name', 'twitter:description', opis],
    ['name', 'twitter:image', slika],
  ]
    .filter(([, , v]) => v)
    .map(([a, k, v]) => `<meta ${a}="${k}" content="${zaAtribut(v)}">`);

  const blok = [`<title>${zaAtribut(naslov)}</title>`, ...meta, `<link rel="canonical" href="${zaAtribut(url)}">`].join('\n');

  const bez = String(html)
    .replace(/<title>[\s\S]*?<\/title>\s*/i, '')
    .replace(/<meta\s+(?:name|property)="(?:description|og:[^"]*|twitter:[^"]*)"[^>]*>\s*/gi, '')
    .replace(/<link\s+rel="canonical"[^>]*>\s*/gi, '');

  return /<\/head>/i.test(bez) ? bez.replace(/<\/head>/i, `${blok}\n</head>`) : `${blok}\n${bez}`;
}
