import { useEffect, useState } from 'react';
import { bazaPostavljena, procitaj } from './citac';
import { matchFromRow } from './utakmice';

/**
 * Prijenos uživo iz baze, osvježavan dok netko gleda.
 *
 * Četiri odluke koje ovo drže na nogama:
 *
 * 1. **Jedan prijenos za cijelu stranicu.** Stanje stoji izvan Reacta, a
 *    komponente se na njega pretplaćuju. Na naslovnici ga traže i traka i
 *    heroj; da svaka vodi svoj sat, baza bi dobivala dvostruko više upita za
 *    isti podatak.
 * 2. **Osvježava se samo dok je kartica vidljiva.** Otvorena kartica preko
 *    noći inače cijelu noć gađa bazu svakih petnaest sekundi, a nitko je ne
 *    gleda. Kad se kartica vrati u prvi plan, odmah se povuče svježe stanje.
 * 3. **Dohvaća se samo ono što treba** — utakmica sa `status=uzivo`, pa
 *    njezini događaji i postave. Bez filtra bi se povlačili svi događaji svih
 *    utakmica sezone, svakih petnaest sekundi.
 * 4. **Greška ne prazni ekran.** Padne li jedan upit, ostaje zadnje poznato
 *    stanje — bolje rezultat star petnaest sekundi nego prazan okvir.
 */

const RAZMAK = 15000;

const PRAZNO = {
  ucitava: false,
  utakmica: null,
  dogadaji: [],
  postave: [],
  greska: null,
  osvjezeno: null,
};

/* ── zajedničko stanje ────────────────────────────────────────────────────
   Namjerno izvan Reacta: pretplatnika može biti koliko god, sat je jedan. */

let stanje = { ...PRAZNO, ucitava: bazaPostavljena };
let pretplatnici = new Set();
let sat = null;
let prekid = null;
let nasKlub = '';
let slusaVidljivost = false;

const objavi = (novo) => {
  stanje = novo;
  pretplatnici.forEach((f) => f(stanje));
};

async function dohvati(signal) {
  const { data: utakmice, error } = await procitaj('utakmice', 'sort_order', {
    signal,
    filtri: { status: 'eq.uzivo' },
  });
  if (signal?.aborted) return;

  if (error) {
    objavi({ ...stanje, ucitava: false, greska: error.message });
    return;
  }

  const redak = utakmice?.[0] ?? null;
  if (!redak) {
    objavi({ ...PRAZNO, osvjezeno: Date.now() });
    return;
  }

  const filtri = { utakmica_id: `eq.${redak.id}` };
  const [dogadaji, postave] = await Promise.all([
    procitaj('dogadaji', 'sort_order', { signal, filtri }),
    procitaj('postave', 'sort_order', { signal, filtri }),
  ]);
  if (signal?.aborted) return;

  objavi({
    ucitava: false,
    utakmica: matchFromRow(redak, nasKlub),
    /* Tablice su dodane kasnije i nekritične su: baza bez njih daje semafor
       bez tijeka, umjesto prazne stranice. */
    dogadaji: dogadaji.data ?? [],
    postave: postave.data ?? [],
    greska: null,
    osvjezeno: Date.now(),
  });
}

const krug = () => {
  prekid?.abort();
  prekid = new AbortController();
  dohvati(prekid.signal);
};

const pokreni = () => {
  if (sat) return;
  krug();
  sat = setInterval(krug, RAZMAK);
};

const zaustavi = () => {
  clearInterval(sat);
  sat = null;
  prekid?.abort();
  prekid = null;
};

const naVidljivost = () => {
  if (!pretplatnici.size) return;
  if (document.visibilityState === 'visible') pokreni();
  else zaustavi();
};

/**
 * @param {string} klub   naš klub, za perspektivu (doma / u gostima)
 * @param {boolean} aktivno  gasi osvježavanje ondje gdje se prijenos samo
 *   *može* pojaviti — traka ispod zaglavlja ga pali tek kad početno
 *   učitavanje kaže da utakmica traje. Inače bi svaki posjetitelj, cijeli
 *   dan, slao upit svakih petnaest sekundi za utakmicu koje nema.
 */
export default function useUzivo(klub = '', aktivno = true) {
  const [moje, setMoje] = useState(stanje);

  useEffect(() => {
    if (!bazaPostavljena || !aktivno) return undefined;
    if (klub) nasKlub = klub;

    pretplatnici.add(setMoje);
    setMoje(stanje);

    if (!slusaVidljivost) {
      document.addEventListener('visibilitychange', naVidljivost);
      slusaVidljivost = true;
    }
    if (document.visibilityState === 'visible') pokreni();

    return () => {
      pretplatnici.delete(setMoje);
      if (pretplatnici.size === 0) {
        zaustavi();
        document.removeEventListener('visibilitychange', naVidljivost);
        slusaVidljivost = false;
      }
    };
  }, [aktivno, klub]);

  return bazaPostavljena && aktivno ? moje : PRAZNO;
}
