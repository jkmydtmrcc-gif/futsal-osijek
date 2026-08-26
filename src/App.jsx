import { Routes, Route, useLocation } from 'react-router-dom';
import BrushDefs from './components/BrushDefs';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Partners from './sections/Partners';
import Naslovnica from './pages/Naslovnica';
import UIzgradnji from './pages/UIzgradnji';
import { UNDER_CONSTRUCTION, NOT_FOUND } from './data/site';

/**
 * Okvir stranice: zaglavlje, sadržaj, partneri i podnožje.
 *
 * Zaglavlje i podnožje su izvan <Routes> pa ostaju isti na svim rutama —
 * mijenja se samo sredina. Gotova je zasad samo naslovnica; ostale rute
 * dolaze iz UNDER_CONSTRUCTION u data/site.js.
 */
export default function App() {
  const { pathname } = useLocation();

  return (
    <>
      <a className="skip-link" href="#sadrzaj">
        Preskoči na sadržaj
      </a>

      <BrushDefs />
      <ScrollToTop />

      <div className="page">
        <Header />

        <main id="sadrzaj">
          {/* `key` je pathname: pri promjeni rute se blok ponovno montira,
              pa se animacija ulaska odigra iznova. */}
          <div className="route" key={pathname}>
            <Routes>
              <Route path="/" element={<Naslovnica />} />

              {Object.entries(UNDER_CONSTRUCTION).map(([path, page]) => (
                <Route key={path} path={path} element={<UIzgradnji page={page} />} />
              ))}

              <Route path="*" element={<UIzgradnji page={NOT_FOUND} notFound />} />
            </Routes>
          </div>
        </main>

        <Partners />
        <Footer />
      </div>
    </>
  );
}
