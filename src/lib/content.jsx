import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, supabaseConfigured } from './supabase';
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
    source: supabaseConfigured ? 'ucitavanje' : 'ugradeno',
    error: null,
  }));

  useEffect(() => {
    if (!supabase) return undefined;
    let otkazano = false;

    (async () => {
      const [igraci, statistika, novosti, utakmice, tablica, artikli, sponzori, postavke] =
        await Promise.all([
          supabase.from('igraci').select('*').order('sort_order'),
          supabase.from('igraci_statistika').select('*').order('sort_order'),
          supabase.from('novosti').select('*').order('sort_order'),
          supabase.from('utakmice').select('*').order('sort_order'),
          supabase.from('tablica').select('*').order('pos'),
          supabase.from('shop').select('*').order('sort_order'),
          supabase.from('sponzori').select('*').order('sort_order'),
          supabase.from('postavke').select('*'),
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
