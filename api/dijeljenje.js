/**
 * HTML za pregledavatelje poveznica (WhatsApp, Facebook, Messenger, Viber …).
 *
 * Oni ne izvršavaju JavaScript, pa bez ovoga svaka podijeljena stranica
 * stigne s naslovnom fotografijom i općim opisom kluba. Ovdje se uzme
 * obični `index.html`, a u njega se upišu naslov, opis i slika baš te
 * stranice — za novost njezina fotografija i uvod.
 *
 * Do ove funkcije dolaze **samo** pregledavatelji (`vercel.json`, uvjet na
 * `user-agent`). Posjetitelji i dalje dobivaju statičnu stranicu izravno s
 * CDN-a, pa ih ovo ni ne usporava ni ne može srušiti.
 *
 * Sve je obranjeno: ne odgovori li baza, vrijedi ugrađeni sadržaj; ne može
 * li se dohvatiti `index.html`, vraća se kratki dokument sa samim oznakama —
 * pregledavatelju ionako ništa drugo ne treba.
 */
/* Moduli stranice uvoze se tek unutar `try`: pukne li ijedan pri učitavanju,
   funkcija i dalje odgovori — običnom stranicom sa zadanim oznakama — umjesto
   greške 500, nakon koje pregled poveznice ostane potpuno prazan. */
const moduli = () =>
  Promise.all([
    import('../src/lib/mapiranje.js'),
    import('../src/lib/citac.js'),
    import('../src/lib/dijeljenje.js'),
    import('../src/data/site.js'),
  ]);

const ROK_MS = 2500;

async function citaj(adresaUpita, tablica, poredak) {
  const url = process.env.VITE_SUPABASE_URL;
  const kljuc = process.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !kljuc) return null;
  try {
    const odg = await fetch(adresaUpita(url, tablica, poredak), {
      headers: { apikey: kljuc, Authorization: `Bearer ${kljuc}` },
      signal: AbortSignal.timeout(ROK_MS),
    });
    return odg.ok ? await odg.json() : null;
  } catch {
    return null;
  }
}

/** Sadržaj kakav vidi stranica: ugrađeni, preko njega baza. */
export async function ucitajSadrzaj() {
  const [{ zadaniSadrzaj, slozinovosti, merge }, { adresaUpita }, , { NOT_FOUND }] = await moduli();
  const sadrzaj = { ...zadaniSadrzaj(), notFound: NOT_FOUND };
  const [novosti, postavke] = await Promise.all([
    citaj(adresaUpita, 'novosti', 'sort_order'),
    citaj(adresaUpita, 'postavke'),
  ]);

  if (Array.isArray(novosti) && novosti.length) sadrzaj.news = slozinovosti(novosti);
  for (const { key, value } of Array.isArray(postavke) ? postavke : []) {
    if (key && value !== null && value !== undefined) sadrzaj[key] = merge(sadrzaj[key], value);
  }
  return sadrzaj;
}

async function predlozak(izvor) {
  try {
    const odg = await fetch(`${izvor}/index.html`, { signal: AbortSignal.timeout(ROK_MS) });
    if (odg.ok) return await odg.text();
  } catch {
    /* pada na kratki dokument ispod */
  }
  return '<!DOCTYPE html>\n<html lang="hr">\n<head>\n<meta charset="utf-8">\n</head>\n<body></body>\n</html>';
}

export default async function handler(req, res) {
  const domacin = req.headers['x-forwarded-host'] ?? req.headers.host;
  const protokol = req.headers['x-forwarded-proto'] ?? 'https';
  const izvor = `${protokol}://${domacin}`;
  const put = String(req.query?.put ?? '/');
  const dijagnoza = 'dijagnoza' in (req.query ?? {});

  const htmlObecanje = predlozak(izvor);
  let html = '';
  let greska = null;
  let oznake = null;
  let brojNovosti = null;

  try {
    const [, , { oznakeZaPut, upisiOznake, ocistiPut }] = await moduli();
    const sadrzaj = await ucitajSadrzaj();
    brojNovosti = sadrzaj.news?.items?.length ?? 0;
    oznake = oznakeZaPut(ocistiPut(put), sadrzaj);
    html = upisiOznake(await htmlObecanje, oznake, izvor, ocistiPut(put));
  } catch (e) {
    greska = String(e?.stack ?? e).slice(0, 600);
    html = await htmlObecanje;
  }

  // `/api/dijeljenje?put=/novosti/…&dijagnoza` — otvori se u pregledniku i
  // kaže što bi pregledavatelj dobio i zašto.
  if (dijagnoza) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(
      JSON.stringify(
        {
          put,
          izvor,
          bazaPostavljena: Boolean(process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY),
          brojNovosti,
          oznake,
          greska,
          naslovUHtml: (html.match(/<title>([^<]*)<\/title>/) ?? [])[1] ?? null,
          ogImage: (html.match(/property="og:image" content="([^"]*)"/) ?? [])[1] ?? null,
        },
        null,
        2
      )
    );
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  if (greska) res.setHeader('X-Dijeljenje-Greska', greska.split('\n')[0].slice(0, 200).replace(/[^\x20-\x7e]/g, '?'));
  // Pregledavatelji ionako pamte pregled; pet minuta na CDN-u znači da nova
  // ili ispravljena objava ima pravi pregled najkasnije za pet minuta. Kad je
  // nešto puklo, ništa se ne pamti — sljedeći pokušaj ide ispočetka.
  res.setHeader(
    'Cache-Control',
    greska ? 'no-store' : 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400'
  );
  // Uvijek 200, kao i sama stranica: kad baza na trenutak ne odgovori, nova
  // objava se ne nađe — a pregledavatelj bi 404 zapamtio danima.
  res.status(200).send(html);
}
