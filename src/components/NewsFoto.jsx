import { useState } from 'react';

/**
 * Fotografija novosti — uvijek cijela, bez obzira na dimenzije.
 *
 * Prije se slika punila u okvir s `object-fit: cover`, pa je okvir rezao
 * onoliko koliko treba da se popuni: panorama bi izgubila krajeve, portret
 * glavu ili noge, a ono što je klub objavio nije bilo ono što je posjetitelj
 * vidio. Sad je slika uvijek u cijelosti (`contain`), a prazan prostor oko nje
 * puni ista fotografija, uvećana i zamućena. Tako okvir ostaje jednak i
 * mreža poravnata, a slika ne izgleda stisnuto među crnim trakama.
 *
 * Pozadina je druga `<img>` s istom adresom, a ne CSS `background-image`:
 * `loading="lazy"` radi samo na elementu slike, pa bi pozadine svih kartica
 * ispod preloma inače krenule čim se stranica otvori. Preglednik za istu
 * adresu šalje jedan zahtjev.
 *
 * Varijante:
 *   `kartica` — fiksan omjer, da kartice u redu budu iste visine
 *   `okvir`   — veliki istaknuti okvir (zadano `contain` u omjeru okvira)
 *   `objava`  — stranica objave: prirodan omjer, uz najveću visinu
 *
 * Kad slike nema ili se ne učita — klupska ploha s grbom, ista kakvu nose
 * artikli. `<img src="">` neki preglednici tumače kao adresu same stranice i
 * skinu je ponovno, a slomljena slika s ikonom je ružnija od prazne plohe.
 */
export default function NewsFoto({ src, alt, varijanta = 'kartica', loading = 'lazy' }) {
  const [pala, setPala] = useState(false);

  if (!src || pala) {
    return (
      <span className={`nfoto nfoto--${varijanta} nfoto--ploha`} aria-hidden="true">
        <img className="nfoto__grb" src="/grb.webp" alt="" loading={loading} />
      </span>
    );
  }

  return (
    <span className={`nfoto nfoto--${varijanta}`}>
      <img className="nfoto__pozadina" src={src} alt="" aria-hidden="true" loading={loading} />
      <img
        className="nfoto__slika"
        src={src}
        alt={alt}
        loading={loading}
        onError={() => setPala(true)}
      />
    </span>
  );
}
