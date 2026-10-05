/**
 * Priprema slike prije slanja u Storage.
 *
 * Dvije stvari, obje u pregledniku:
 *
 * 1. Smanjivanje. Originali portreta su znali biti 4000×6000 i 15 MB, a
 *    kartica ih prikazuje na ~250px. Bez ovoga bi svaka nova slika pojela
 *    besplatnu kvotu i usporila stranicu na mobilnim podacima.
 * 2. Rezanje pozadine za portrete igrača (`lib/pozadina.js`).
 *
 * Sve ide kroz canvas na korisnikovom računalu — nema slanja slike nikakvoj
 * vanjskoj usluzi, pa ništa ne košta i fotografija ne putuje nikamo osim u
 * klupski Storage.
 */
import { ukloniPozadinu, okvirSadrzaja, ocjena, PLATNO, rasporedPortreta } from './pozadina.js';

const KVALITETA = 0.88;

/** Podržava li preglednik WebP zapis iz canvasa? Ako ne — PNG. */
function zapis() {
  const c = document.createElement('canvas');
  c.width = 1;
  c.height = 1;
  return c.toDataURL('image/webp').startsWith('data:image/webp')
    ? { tip: 'image/webp', nastavak: 'webp' }
    : { tip: 'image/png', nastavak: 'png' };
}

function naBlob(canvas, tip) {
  return new Promise((razrijesi, odbij) => {
    canvas.toBlob(
      (blob) => (blob ? razrijesi(blob) : odbij(new Error('Slika se nije dala zapisati.'))),
      tip,
      KVALITETA
    );
  });
}

/** Datoteka → bitmap, smanjen na najviše `maxSirina` piksela širine. */
async function ucitaj(datoteka, maxSirina) {
  const bitmap = await createImageBitmap(datoteka);
  const omjer = Math.min(1, maxSirina / bitmap.width);
  const w = Math.max(1, Math.round(bitmap.width * omjer));
  const h = Math.max(1, Math.round(bitmap.height * omjer));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  return { canvas, ctx, w, h };
}

/** Obična slika (artikl, sponzor, grb): samo smanjivanje i pretvorba. */
export async function pripremiSliku(datoteka, { maxSirina = 1200 } = {}) {
  const { canvas } = await ucitaj(datoteka, maxSirina);
  const { tip, nastavak } = zapis();
  const blob = await naBlob(canvas, tip);
  return { blob, nastavak, sirina: canvas.width, visina: canvas.height };
}

/**
 * Portret igrača: smanjivanje, rezanje pozadine i slaganje lika na platno
 * iste veličine za sve igrače.
 *
 * Lik se ne reže po obrisu nego se postavlja na platno omjera kartice
 * (`PLATNO`), uvijek iste visine i uz donji rub (`rasporedPortreta`). Tako su
 * svi igrači na kartici jednako veliki, bez obzira kako je fotografija
 * kadrirana i u kojoj je pozi igrač.
 */
export async function pripremiPortret(datoteka, { maxSirina = 1100, prag = 28 } = {}) {
  const { ctx, w, h } = await ucitaj(datoteka, maxSirina);
  const piksel = ctx.getImageData(0, 0, w, h);

  const rez = ukloniPozadinu({ data: piksel.data, width: w, height: h }, { prag });
  const okvir = okvirSadrzaja(rez);

  // Bez ijednog neprozirnog piksela nema se što spremiti — vraća se original.
  if (!okvir) {
    return { ...(await pripremiSliku(datoteka, { maxSirina })), udio: rez.udio, ocjena: ocjena(rez.udio) };
  }

  const izvor = document.createElement('canvas');
  izvor.width = w;
  izvor.height = h;
  izvor.getContext('2d').putImageData(new ImageData(rez.data, w, h), 0, 0);

  const mjesto = rasporedPortreta(okvir);
  const izlaz = document.createElement('canvas');
  izlaz.width = PLATNO.sirina;
  izlaz.height = PLATNO.visina;
  const izlazCtx = izlaz.getContext('2d');
  izlazCtx.imageSmoothingQuality = 'high';
  izlazCtx.drawImage(
    izvor,
    okvir.x, okvir.y, okvir.width, okvir.height,
    mjesto.x, mjesto.y, mjesto.sirina, mjesto.visina
  );

  // WebP i PNG čuvaju prozirnost; JPEG ne, pa se za portrete ne koristi.
  const { tip, nastavak } = zapis();
  const blob = await naBlob(izlaz, tip);

  return {
    blob,
    nastavak,
    sirina: PLATNO.sirina,
    visina: PLATNO.visina,
    udio: rez.udio,
    ocjena: ocjena(rez.udio),
  };
}
