import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Pri promjeni rute vraća pogled na vrh stranice. */
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // `instant` namjerno: glatko klizanje kroz cijelu stranicu pri
    // promjeni rute djeluje kao greška, ne kao animacija.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}
