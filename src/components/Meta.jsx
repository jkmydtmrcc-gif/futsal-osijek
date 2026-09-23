import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Naslov stranice i oznake za dijeljenje.
 *
 * Stranica je jednostranična aplikacija, pa `<title>` iz `index.html` inače
 * ostaje isti na svim rutama — u kartici preglednika, u povijesti i u
 * zabilješkama svugdje piše isto, a Google svaku podstranicu vidi kao istu
 * stvar.
 *
 * Open Graph oznake su ovdje važnije nego na većini stranica: klub objave
 * dijeli na Facebooku i u WhatsApp grupama, a bez njih poveznica stigne kao
 * goli link, bez slike i naslova.
 *
 * Napomena o tražilicama: ovo se postavlja u pregledniku, nakon učitavanja.
 * Google to čita jer izvršava JavaScript, ali Facebookov i WhatsAppov
 * pregledavatelj ne izvršavaju — njima vrijedi ono što stoji u `index.html`.
 * Zato u `index.html` stoji potpun skup oznaka za klub kao cjelinu, a ovo ih
 * po rutama precizira.
 */

const SITE = 'MNK Osijek Kandit';

/** Postavlja `<meta>` po imenu ili svojstvu; stvara oznaku ako je nema. */
function setMeta(attr, key, value) {
  if (!value) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

function setLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/** Skraćuje opis na duljinu koju tražilice još prikazuju cijelu. */
function trim(text, max = 160) {
  const clean = String(text ?? '').replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).replace(/[\s,;:.–—-]+\S*$/, '')}…`;
}

export default function Meta({ title, description, image, type = 'website' }) {
  const { pathname } = useLocation();

  useEffect(() => {
    const full = title ? `${title} — ${SITE}` : `${SITE} — službene stranice kluba`;
    const desc = trim(description);
    const url = `${window.location.origin}${pathname}`;
    /* Slika za dijeljenje mora biti puna adresa — relativna putanja se u
       Facebookovom pregledavatelju ne razriješi. */
    const img = image
      ? new URL(image, window.location.origin).href
      : `${window.location.origin}/uploads/S-oskanvma10_GOM_300525-970.webp`;

    document.title = full;
    setMeta('name', 'description', desc);
    setLink('canonical', url);

    setMeta('property', 'og:site_name', SITE);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:title', full);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:url', url);
    setMeta('property', 'og:image', img);
    setMeta('property', 'og:locale', 'hr_HR');

    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', full);
    setMeta('name', 'twitter:description', desc);
    setMeta('name', 'twitter:image', img);
  }, [title, description, image, type, pathname]);

  return null;
}
