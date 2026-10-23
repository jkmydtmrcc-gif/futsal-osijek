import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { punNaslov, skrati, IME_KLUBA } from '../lib/dijeljenje';

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
 * Napomena o pregledavateljima: ovo se postavlja u pregledniku, nakon
 * učitavanja. Google to čita jer izvršava JavaScript, ali Facebookov i
 * WhatsAppov pregledavatelj ne izvršavaju. Njima iste oznake, izračunate
 * istom funkcijom (`lib/dijeljenje.js`), upisuje poslužitelj
 * (`api/dijeljenje.js`) — pa podijeljena novost stiže sa svojom slikom i
 * tekstom, a ne s naslovnom.
 */


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

export default function Meta({ title, description, image, type = 'website' }) {
  const { pathname } = useLocation();

  useEffect(() => {
    const full = punNaslov(title);
    const desc = skrati(description);
    const url = `${window.location.origin}${pathname}`;
    /* Slika za dijeljenje mora biti puna adresa — relativna putanja se u
       Facebookovom pregledavatelju ne razriješi. */
    const img = image
      ? new URL(image, window.location.origin).href
      : `${window.location.origin}/uploads/S-oskanvma10_GOM_300525-970.webp`;

    document.title = full;
    setMeta('name', 'description', desc);
    setLink('canonical', url);

    setMeta('property', 'og:site_name', IME_KLUBA);
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
