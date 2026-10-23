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
import { zadaniSadrzaj, slozinovosti, merge } from '../src/lib/mapiranje.js';
import { adresaUpita } from '../src/lib/citac.js';
import { oznakeZaPut, upisiOznake, ocistiPut } from '../src/lib/dijeljenje.js';
import { NOT_FOUND } from '../src/data/site.js';

const ROK_MS = 2500;

async function citaj(tablica, poredak) {
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
  const sadrzaj = { ...zadaniSadrzaj(), notFound: NOT_FOUND };
  const [novosti, postavke] = await Promise.all([citaj('novosti', 'sort_order'), citaj('postavke')]);

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
  const put = ocistiPut(req.query?.put ?? '/');

  const [sadrzaj, html] = await Promise.all([ucitajSadrzaj(), predlozak(izvor)]);
  const oznake = oznakeZaPut(put, sadrzaj);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  // Pregledavatelji ionako pamte pregled; pet minuta na CDN-u znači da nova
  // ili ispravljena objava ima pravi pregled najkasnije za pet minuta.
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400');
  // Uvijek 200, kao i sama stranica: kad baza na trenutak ne odgovori, nova
  // objava se ne nađe — a pregledavatelj bi 404 zapamtio danima.
  res.status(200).send(upisiOznake(html, oznake, izvor, put));
}
