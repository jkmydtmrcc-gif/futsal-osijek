import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loadContent, refreshPublished, subscribe } from './store';

const ContentContext = createContext(null);

/**
 * Daje cijeloj stranici trenutni sadržaj.
 *
 * Prvo se odmah prikaže ono što već imamo (zadano iz koda ili predmemorirana
 * objava) — bez čekanja na mrežu i bez praznog bljeska. Zatim se u pozadini
 * dohvati zadnja objava i, ako se razlikuje, stranica se osvježi.
 */
export function ContentProvider({ children }) {
  const [content, setContent] = useState(loadContent);

  useEffect(() => {
    const unsubscribe = subscribe(setContent);
    refreshPublished();
    return unsubscribe;
  }, []);

  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>;
}

/** Cijeli sadržaj. */
export function useContent() {
  const value = useContext(ContentContext);
  if (!value) throw new Error('useContent se koristi izvan <ContentProvider>.');
  return value;
}

/**
 * Tablica s izvedenim poljima: koji redak smo mi i koji vodi u doigravanje.
 * Računa se pri čitanju, pa se u pohrani drže samo upisani podaci.
 */
export function useStandings() {
  const { league } = useContent();

  return useMemo(
    () =>
      league.standings.map((row) => ({
        ...row,
        isUs: row.club === league.ourClub,
        isPlayoff: row.pos <= league.playoffCutoff,
      })),
    [league.standings, league.ourClub, league.playoffCutoff]
  );
}

/** Zaglavlje pojedine stranice po ruti. */
export function usePage(path) {
  const { pages } = useContent();
  return pages[path];
}
