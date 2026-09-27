import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { bazaPostavljena, procitaj } from './citac';
import {
  merge,
  zadaniSadrzaj,
  playerFromRow,
  newsFromRow,
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

        const sveNovosti = novosti.data ?? [];
        if (sveNovosti.length) {
          const istaknuta = sveNovosti.find((n) => n.featured);
          next.news = {
            items: sveNovosti.filter((n) => !n.featured).map(newsFromRow),
            featured: istaknuta
              ? {
                  ...newsFromRow(istaknuta),
                  flag: 'Izdvojeno',
                  meta: `${istaknuta.date ?? ''} · ${istaknuta.cat ?? ''}`.trim(),
                }
              : d.news.featured,
          };
        }

        if (utakmice.data?.length) next.league = { ...next.league, fixtures: utakmice.data };
        if (tablica.data?.length) next.league = { ...next.league, standings: tablica.data };
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
 * Tablica s izvedenim poljima: koji redak smo mi i koji vodi u doigravanje.
 * Računa se pri čitanju, pa se u bazi drže samo upisani podaci.
 */
export function useStandings() {
  const { league } = useContent();

  return useMemo(
    () =>
      (league.standings ?? []).map((row) => ({
        ...row,
        isUs: row.club === league.ourClub,
        isPlayoff: row.pos <= league.playoffCutoff,
      })),
    [league.standings, league.ourClub, league.playoffCutoff]
  );
}
