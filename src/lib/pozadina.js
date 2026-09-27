/**
 * Uklanjanje pozadine s portreta igrača.
 *
 * Radi na običnom polju piksela (`{ data, width, height }`), bez ijednog
 * poziva prema DOM-u ili canvasu, pa se može provjeriti u Nodeu — a to je
 * ovdje bitno: greška u rezanju ne baci iznimku nego tiho pojede igraču
 * pola dresa, što se vidi tek kad slika završi na stranici.
 *
 * Postupak je rast regije od rubova slike. Susjed ulazi u pozadinu ako je
 * blizu piksela s kojeg se širi (tako se prati i prijelaz u zamućenom
 * studijskom platnu) i ako nije previše odlutao od boje ruba (tako se ne
 * procuri kroz igračev dres u sredinu slike).
 *
 * Ne radi čuda: bijeli dres pred bijelim zidom nema granicu koju bi se
 * moglo naći. Zato uređivač uvijek vidi rezultat prije spremanja i može
 * ostaviti original — automatika ovdje predlaže, ne odlučuje.
 */

/** Zbroj razlika po kanalima — dovoljno dobra mjera i puno brža od korijena. */
function razlika(d, a, b) {
  return (
    Math.abs(d[a] - d[b]) + Math.abs(d[a + 1] - d[b + 1]) + Math.abs(d[a + 2] - d[b + 2])
  );
}

/** Prosječna boja rubnog okvira — procjena boje pozadine. */
export function bojaRuba({ data, width, height }) {
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  const uzmi = (x, y) => {
    const i = (y * width + x) * 4;
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    n += 1;
  };
  for (let x = 0; x < width; x += 1) {
    uzmi(x, 0);
    uzmi(x, height - 1);
  }
  for (let y = 1; y < height - 1; y += 1) {
    uzmi(0, y);
    uzmi(width - 1, y);
  }
  return [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
}

/**
 * Prozirna pozadina na kopiji piksela.
 *
 * `prag`      — koliko se susjed smije razlikovati od piksela s kojeg se širi
 * `rubniPrag` — koliko cijela pozadina smije odlutati od boje ruba
 *
 * Vraća novo polje piksela i `udio` — koliki je dio slike proglašen
 * pozadinom. Taj broj je jedini pošten pokazatelj je li rez uspio: ispod
 * par posto znači da nije našao ništa, preko devedeset da je pojeo igrača.
 */
export function ukloniPozadinu(slika, { prag = 28, rubniPrag = 96 } = {}) {
  const { width, height } = slika;
  const data = Uint8ClampedArray.from(slika.data);
  const rub = bojaRuba(slika);

  const ukupno = width * height;
  const pozadina = new Uint8Array(ukupno);
  // Red čekanja kao obično polje indeksa; `glava` pomiče početak, pa nema
  // `shift()` koji bi na milijun piksela pomicao cijelo polje.
  const red = new Int32Array(ukupno);
  let glava = 0;
  let rep = 0;

  const blizuRuba = (i) => {
    const p = i * 4;
    return (
      Math.abs(data[p] - rub[0]) + Math.abs(data[p + 1] - rub[1]) + Math.abs(data[p + 2] - rub[2]) <
      rubniPrag
    );
  };

  const dodaj = (i) => {
    if (pozadina[i] || !blizuRuba(i)) return;
    pozadina[i] = 1;
    red[rep] = i;
    rep += 1;
  };

  for (let x = 0; x < width; x += 1) {
    dodaj(x);
    dodaj((height - 1) * width + x);
  }
  for (let y = 0; y < height; y += 1) {
    dodaj(y * width);
    dodaj(y * width + width - 1);
  }

  while (glava < rep) {
    const i = red[glava];
    glava += 1;
    const x = i % width;
    const y = (i - x) / width;
    const p = i * 4;

    if (x > 0) {
      const j = i - 1;
      if (!pozadina[j] && razlika(data, p, j * 4) < prag) dodaj(j);
    }
    if (x < width - 1) {
      const j = i + 1;
      if (!pozadina[j] && razlika(data, p, j * 4) < prag) dodaj(j);
    }
    if (y > 0) {
      const j = i - width;
      if (!pozadina[j] && razlika(data, p, j * 4) < prag) dodaj(j);
    }
    if (y < height - 1) {
      const j = i + width;
      if (!pozadina[j] && razlika(data, p, j * 4) < prag) dodaj(j);
    }
  }

  for (let i = 0; i < ukupno; i += 1) {
    if (pozadina[i]) data[i * 4 + 3] = 0;
  }

  omeksajRub(data, pozadina, width, height, rub);

  return { data, width, height, udio: rep / ukupno };
}

/**
 * Rub protiv stepenica: piksel koji graniči s prozirnim, a bojom još vuče na
 * pozadinu, dobiva djelomičnu prozirnost. Bez toga oko igrača ostane nit u
 * boji studijskog platna, koja se na tamnoj kartici vidi kao svijetli obrub.
 */
function omeksajRub(data, pozadina, width, height, rub) {
  const izmjene = [];
  for (let i = 0; i < width * height; i += 1) {
    if (pozadina[i]) continue;
    const x = i % width;
    const y = (i - x) / width;
    const susjedProziran =
      (x > 0 && pozadina[i - 1]) ||
      (x < width - 1 && pozadina[i + 1]) ||
      (y > 0 && pozadina[i - width]) ||
      (y < height - 1 && pozadina[i + width]);
    if (!susjedProziran) continue;

    const p = i * 4;
    const d =
      Math.abs(data[p] - rub[0]) + Math.abs(data[p + 1] - rub[1]) + Math.abs(data[p + 2] - rub[2]);
    // Što je bliže boji pozadine, to je prozirniji. Preko 140 razlike je
    // sigurno igrač i ostaje pun.
    if (d < 140) izmjene.push([p, Math.round((d / 140) * 255)]);
  }
  izmjene.forEach(([p, a]) => {
    data[p + 3] = Math.min(data[p + 3], a);
  });
}

/**
 * Okvir oko onoga što je ostalo neprozirno. Koristi se za obrezivanje:
 * originali su često pola platna, pa igrač na kartici ispadne sitan.
 */
export function okvirSadrzaja({ data, width, height }, prag = 12) {
  let x1 = width;
  let y1 = height;
  let x2 = -1;
  let y2 = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] > prag) {
        if (x < x1) x1 = x;
        if (x > x2) x2 = x;
        if (y < y1) y1 = y;
        if (y > y2) y2 = y;
      }
    }
  }
  if (x2 < 0) return null;
  return { x: x1, y: y1, width: x2 - x1 + 1, height: y2 - y1 + 1 };
}

/**
 * Ocjena reza, za poruku uređivaču. Automatika smije predložiti, ali mora
 * priznati kad nije sigurna.
 */
export function ocjena(udio) {
  if (udio < 0.04) return { ok: false, poruka: 'Gotovo ništa nije uklonjeno — pozadina je vjerojatno slična igraču.' };
  if (udio > 0.93) return { ok: false, poruka: 'Uklonjeno je gotovo sve — provjeri je li ostao igrač.' };
  return { ok: true, poruka: `Uklonjeno ${Math.round(udio * 100)}% slike.` };
}
