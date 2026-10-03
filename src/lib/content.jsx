import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { bazaPostavljena, procitaj } from './citac';
import { matchFromRow, razvrstaj, forma } from './utakmice';
import { slozi } from './tablica';
import {
  merge,
  zadaniSadrzaj,
  playerFromRow,
  slozinovosti,
  productFromRow,
  tiersFromRows,
} from './mapiranje';

/* Ponovni izvoz: ostatak koda i dalje traži zadani sadržaj odavde. */
export { zadaniSadrzaj };

const ContentContext = createContext(null);
/**
 * Sadržaj stranice.
 *
 * Kreće od ugrađenih vrijednosti iz `data/site.js` i, ako je Supabase spojen,
 * zamijeni ih onime iz baze. Zato stranica radi u tri slučaja: projekt nije
 * spojen, baza je prazna, ili baza padne — u sva tri posjetitelj vidi zadnji
 * poznati sadržaj umjesto prazne stranice.
 *
 * Popisi koji se mijenjaju kroz sezonu (igrači, novosti, utakmice, tablica,
 * artikli, sponzori) imaju svoju tablicu. Ono čega ima po jedan komad
 * (kontakt, karta, tekstovi stranica, brojke) stoji u `postavke` kao
 * ključ → JSON: inače bi svaka nova rubrika tražila novu tablicu i novu
 * migraciju.
 */

/* --- pružatelj ------------------------------------------------------------ */

export function ContentProvider({ children }) {
  const [data, setData] = useState(() => ({
    ...zadaniSadrzaj(),
    source: bazaPostavljena ? 'ucitavanje' : 'ugradeno',
    error: null,
  }));

  useEffect(() => {
    if (!bazaPostavljena) return undefined;
    let otkazano = false;
    const prekid = new AbortController();
    const uzmi = (tablica, poredak) => procitaj(tablica, poredak, { signal: prekid.signal });

    (async () => {
      const [igraci, statistika, novosti, utakmice, tablica, artikli, sponzori, postavke] =
        await Promise.all([
          uzmi('igraci', 'sort_order'),
          uzmi('igraci_statistika', 'sort_order'),
          uzmi('novosti', 'sort_order'),
          uzmi('utakmice', 'sort_order'),
          uzmi('tablica', 'pos'),
          uzmi('shop', 'sort_order'),
          uzmi('sponzori', 'sort_order'),
          uzmi('postavke'),
        ]);

      if (otkazano) return;

      /* Tablice koje su dodane kasnije mogu nedostajati u bazi koja još nije
         nadograđena. To nije razlog za praznu stranicu — takav se dio samo
         preskoči i ostane ugrađena vrijednost. */
      const kriticne = [igraci, novosti, utakmice, tablica, artikli];
      const greska = kriticne.find((r) => r.error)?.error ?? null;

      if (greska) {
        setData((d) => ({ ...d, source: 'ugradeno', error: greska.message }));
        return;
      }

      setData((d) => {
        const next = { ...d, source: 'baza', error: null };

        if (igraci.data?.length) {
          next.players = igraci.data.map((row) => playerFromRow(row, statistika.data));
        }

        /* Istaknuta objava ostaje u popisu, pa stranica objave može naći i
           nju. Isti poziv slaže i ugrađene novosti, pa se ta dva izvora ne
           mogu razići. */
        if (novosti.data?.length) next.news = slozinovosti(novosti.data);

        /* Utakmice iz baze prolaze kroz `matchFromRow`, koji zna i za stare
           retke bez termina i rezultata — pa nenadograđena baza daje točno
           današnji prikaz. `fixtures` i `results` zadržavaju oblik koji
           `Hero`, `League` i `Raspored` već čitaju, zato se tamo ništa ne
           mijenja da bi rezultati proradili. */
        if (utakmice.data?.length) {
          const svi = utakmice.data.map((row) => matchFromRow(row, next.league.ourClub));
          const { nadolazece, odigrane, sljedeca, zadnja, uzivo } = razvrstaj(svi, Date.now());
          next.league = {
            ...next.league,
            demo: false,
            matches: svi,
            fixtures: nadolazece,
            results: odigrane,
            sljedeca,
            zadnja,
            /* Utakmica u prijenosu. Traka i heroj prelaze na živi rezultat
               samo kad ovo postoji — pa se izvan utakmice ništa ne osvježava
               u pozadini. */
            uzivo,
            forma: forma(odigrane),
          };
        }
        /* Datum ažuriranja se ne upisuje rukom — baza ga vodi sama okidačem na
           `tablica`. Uzima se najnoviji redak, jer se tablica uređuje redak po
           redak, a ispod nje stoji jedan datum za cijelu tablicu. */
        if (tablica.data?.length) {
          const dodiri = tablica.data
            .map((r) => Date.parse(r.updated_at ?? ''))
            .filter((t) => Number.isFinite(t));
          next.league = {
            ...next.league,
            standings: tablica.data,
            azurirano: dodiri.length ? new Date(Math.max(...dodiri)).toISOString() : null,
          };
        }
        if (artikli.data?.length) {
          next.shop = { ...next.shop, products: artikli.data.map(productFromRow) };
        }
        if (sponzori.data?.length) {
          next.sponsors = { ...next.sponsors, tiers: tiersFromRows(sponzori.data) };
        }

        /* Postavke se slažu preko zadanog, pa nepopunjena rubrika zadrži
           ugrađeni tekst umjesto da ostane prazna. */
        (postavke.data ?? []).forEach(({ key, value }) => {
          if (!key || value === null || value === undefined) return;
          next[key] = merge(next[key], value);
        });

        return next;
      });
    })();

    return () => {
      otkazano = true;
      prekid.abort();
    };
  }, []);

  const value = useMemo(() => data, [data]);
  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error('useContent mora biti unutar <ContentProvider>');
  return ctx;
}

/**
 * Tablica s izvedenim poljima: gol-razlika, koji redak smo mi, koji vodi u
 * doigravanje i forma uz naš redak. Sve se računa pri čitanju, pa se u bazi
 * drže samo upisani podaci — ništa izvedeno ne može zastarjeti.
 */
export function useStandings() {
  const { league } = useContent();

  return useMemo(
    () =>
      slozi(league.standings, {
        ourClub: league.ourClub,
        playoffCutoff: league.playoffCutoff,
        forma: league.forma,
      }),
    [league.standings, league.ourClub, league.playoffCutoff, league.forma]
  );
}
