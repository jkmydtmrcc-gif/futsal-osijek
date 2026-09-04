import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, supabaseConfigured } from './supabase';
import {
  PLAYERS as PLAYERS_FALLBACK,
  NEWS as NEWS_FALLBACK,
  FEATURED_NEWS as FEATURED_FALLBACK,
  FIXTURES as FIXTURES_FALLBACK,
  STANDINGS as STANDINGS_FALLBACK,
  OUR_CLUB,
  PLAYOFF_CUTOFF,
} from '../data/site';

const ContentContext = createContext(null);

/** Redak tablice dobiva oznake koje kartica i tablica koriste za isticanje. */
const decorateStandings = (rows) =>
  rows.map((row) => ({
    ...row,
    isUs: row.club === OUR_CLUB,
    isPlayoff: row.pos <= PLAYOFF_CUTOFF,
  }));

/**
 * Sadržaj koji se mijenja kroz sezonu.
 *
 * Kreće od ugrađenih vrijednosti iz `data/site.js` i, ako je Supabase
 * spojen, zamijeni ih onime iz baze. Zato stranica radi u tri slučaja:
 * projekt nije spojen, baza je prazna, ili baza padne — u sva tri
 * posjetitelj vidi zadnji poznati sadržaj umjesto prazne stranice.
 */
export function ContentProvider({ children }) {
  const [data, setData] = useState({
    players: PLAYERS_FALLBACK,
    news: NEWS_FALLBACK,
    featured: FEATURED_FALLBACK,
    fixtures: FIXTURES_FALLBACK,
    standings: STANDINGS_FALLBACK,
    source: supabaseConfigured ? 'ucitavanje' : 'ugradeno',
    error: null,
  });

  useEffect(() => {
    if (!supabase) return undefined;

    let otkazano = false;

    (async () => {
      const [igraci, novosti, utakmice, tablica] = await Promise.all([
        supabase.from('igraci').select('*').order('sort_order'),
        supabase.from('novosti').select('*').order('sort_order'),
        supabase.from('utakmice').select('*').order('sort_order'),
        supabase.from('tablica').select('*').order('pos'),
      ]);

      if (otkazano) return;

      const greska =
        igraci.error || novosti.error || utakmice.error || tablica.error || null;

      if (greska) {
        setData((d) => ({ ...d, source: 'ugradeno', error: greska.message }));
        return;
      }

      const sveNovosti = novosti.data ?? [];
      const istaknuta = sveNovosti.find((n) => n.featured);

      setData((d) => ({
        ...d,
        players: igraci.data?.length ? igraci.data : d.players,
        news: sveNovosti.length ? sveNovosti.filter((n) => !n.featured) : d.news,
        featured: istaknuta
          ? { flag: 'Izdvojeno', title: istaknuta.title, lead: istaknuta.lead, meta: `${istaknuta.date} · ${istaknuta.cat}` }
          : d.featured,
        fixtures: utakmice.data?.length ? utakmice.data : d.fixtures,
        standings: tablica.data?.length ? decorateStandings(tablica.data) : d.standings,
        source: 'baza',
        error: null,
      }));
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
