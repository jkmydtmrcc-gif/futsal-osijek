/**
 * Provjera rezanja pozadine s portreta.
 *
 * Radi na izmišljenim slikama, ne na fotografijama: greška koja ovdje
 * puca uvijek je ista — ili se rez ne uhvati, ili procuri kroz igrača u
 * sredinu slike. Oboje se na stranici vidi tek kad je kasno.
 */
import { bojaRuba, ukloniPozadinu, okvirSadrzaja, ocjena, PLATNO, rasporedPortreta } from '../src/lib/pozadina.js';

let pao = 0;
const jest = (uvjet, opis) => {
  console.log(`  ${uvjet ? '✓' : '✗'} ${opis}`);
  if (!uvjet) pao += 1;
};

/** Slika: pozadina jedne boje, pravokutnik druge boje u sredini. */
function slika({ w = 40, h = 40, poz = [200, 200, 200], lik = [30, 40, 60], okvir = { x: 12, y: 10, w: 16, h: 20 }, sum = 0 } = {}) {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const i = (y * w + x) * 4;
      const u = x >= okvir.x && x < okvir.x + okvir.w && y >= okvir.y && y < okvir.y + okvir.h;
      const b = u ? lik : poz;
      const n = sum ? ((x * 7 + y * 13) % (sum * 2)) - sum : 0;
      data[i] = b[0] + n;
      data[i + 1] = b[1] + n;
      data[i + 2] = b[2] + n;
      data[i + 3] = 255;
    }
  }
  return { data, width: w, height: h };
}

const proziran = (r, x, y) => r.data[(y * r.width + x) * 4 + 3] === 0;

console.log('\nprocjena boje pozadine');
jest(
  bojaRuba(slika({ poz: [210, 40, 40] })).join() === '210,40,40',
  'ravna pozadina daje točno svoju boju'
);

console.log('\nosnovni rez');
{
  const r = ukloniPozadinu(slika());
  jest(proziran(r, 0, 0) && proziran(r, 39, 39), 'kutovi su prozirni');
  jest(r.data[((20 * 40) + 20) * 4 + 3] === 255, 'sredina lika ostaje puna');
  jest(r.udio > 0.7 && r.udio < 0.85, `udio pozadine je razuman (${r.udio.toFixed(2)})`);
}

console.log('\npozadina sa šumom i blagim prijelazom');
{
  const r = ukloniPozadinu(slika({ sum: 6 }));
  jest(proziran(r, 1, 1), 'šum ne zaustavlja širenje');
  jest(r.data[((20 * 40) + 20) * 4 + 3] === 255, 'lik i dalje ostaje');
}

console.log('\nlik slične boje kao pozadina');
{
  // Razlika manja od praga: rez ne smije procuriti kroz lik.
  const r = ukloniPozadinu(slika({ poz: [200, 200, 200], lik: [150, 150, 150] }), { rubniPrag: 60 });
  jest(r.data[((20 * 40) + 20) * 4 + 3] === 255, 'rubni prag zaustavlja curenje u sredinu');
}

console.log('\nlik dodiruje rub slike');
{
  const r = ukloniPozadinu(slika({ okvir: { x: 12, y: 20, w: 16, h: 20 } }));
  jest(r.data[((30 * 40) + 20) * 4 + 3] === 255, 'lik prislonjen na dno ostaje');
  jest(proziran(r, 0, 39), 'pozadina uz njega je i dalje prozirna');
}

console.log('\nokvir sadržaja');
{
  const r = ukloniPozadinu(slika());
  const o = okvirSadrzaja(r);
  jest(o !== null, 'okvir postoji');
  jest(o.x >= 11 && o.x <= 13, `lijevi rub oko 12 (${o.x})`);
  jest(o.y >= 9 && o.y <= 11, `gornji rub oko 10 (${o.y})`);
  jest(Math.abs(o.width - 16) <= 2, `širina oko 16 (${o.width})`);
}

console.log('\nprazna slika');
{
  const jednobojna = slika({ okvir: { x: 0, y: 0, w: 0, h: 0 } });
  const r = ukloniPozadinu(jednobojna);
  jest(okvirSadrzaja(r) === null, 'jednobojna slika nema sadržaja — vraća null, ne ruši');
}

console.log('\nocjena reza');
jest(ocjena(0.01).ok === false, 'ispod 4% je sumnjivo');
jest(ocjena(0.97).ok === false, 'preko 93% je sumnjivo');
jest(ocjena(0.6).ok === true, '60% je uredu');
jest(ocjena(0.6).poruka.includes('60'), 'poruka nosi postotak');

console.log('\nraspored lika na platnu — svi igrači jednako veliki');
{
  const mjesto = (w, h) => rasporedPortreta({ x: 0, y: 0, width: w, height: h });

  // Tri različita lika: uspravan, nizak i zdepast, i širok s raširenim rukama.
  const uspravan = mjesto(380, 880);
  const zdepast = mjesto(470, 906);
  const sitan = mjesto(200, 430);

  jest(uspravan.visina === zdepast.visina, `uspravan i zdepast imaju istu visinu (${uspravan.visina} / ${zdepast.visina})`);
  jest(sitan.visina === uspravan.visina, `i mali original se uveća na istu visinu (${sitan.visina})`);
  jest(uspravan.visina === Math.round(PLATNO.visina * 0.92), `lik zauzima 92% platna (${uspravan.visina} od ${PLATNO.visina})`);

  // Raširene ruke: preširok za visinu, pa se ograničava po širini — jedina iznimka.
  const siroki = mjesto(900, 900);
  jest(siroki.sirina <= PLATNO.sirina * 0.94 + 1, `širok lik ne izlazi na strane (${siroki.sirina} od ${PLATNO.sirina})`);
  jest(siroki.visina < uspravan.visina, 'a zbog toga je niži — iznimka je namjerna');

  // Stoji na dnu, centriran.
  jest(uspravan.y + uspravan.visina === PLATNO.visina - Math.round(PLATNO.visina * 0.02), 'lik stoji na dnu s malim razmakom');
  jest(Math.abs(uspravan.x - (PLATNO.sirina - uspravan.sirina) / 2) <= 1, 'i vodoravno je na sredini');
  jest(uspravan.x >= 0 && uspravan.y >= 0, 'ne izlazi iz platna s gornje ni lijeve strane');

  // Omjer lika se čuva — bez razvlačenja.
  const o1 = 380 / 880;
  jest(Math.abs(uspravan.sirina / uspravan.visina - o1) < 0.01, 'omjer lika se ne mijenja');

  jest(Math.abs(PLATNO.sirina / PLATNO.visina - 5 / 7) < 0.001, 'platno ima omjer kartice (5:7)');
}

console.log(pao === 0 ? '\nSVE PROLAZI\n' : `\nPALO: ${pao}\n`);
process.exit(pao === 0 ? 0 : 1);
