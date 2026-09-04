import { Routes, Route, useLocation } from 'react-router-dom';
import BrushDefs from './components/BrushDefs';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Partners from './sections/Partners';
import Naslovnica from './pages/Naslovnica';
import Klub from './pages/Klub';
import Postava from './pages/Postava';
import Raspored from './pages/Raspored';
import Shop from './pages/Shop';
import Novosti from './pages/Novosti';
import Kontakt from './pages/Kontakt';
import Ulaznice from './pages/Ulaznice';
import NijePronadeno from './pages/NijePronadeno';
import AdminApp from './admin/AdminApp';

/**
 * Okvir stranice: zaglavlje, sadržaj, partneri i podnožje.
 *
 * Zaglavlje i podnožje su izvan <Routes> pa ostaju isti na svim rutama —
 * mijenja se samo sredina.
 */
export default function App() {
  const { pathname } = useLocation();

  // Admin ima vlastito sučelje — bez klupskog zaglavlja, podnožja i animacija.
  if (pathname.startsWith('/admin')) {
    return (
      <>
        <ScrollToTop />
        <AdminApp />
      </>
    );
  }

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
              <Route path="/klub" element={<Klub />} />
              <Route path="/postava" element={<Postava />} />
              <Route path="/raspored" element={<Raspored />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/novosti" element={<Novosti />} />
              <Route path="/kontakt" element={<Kontakt />} />
              <Route path="/ulaznice" element={<Ulaznice />} />
              <Route path="*" element={<NijePronadeno />} />
            </Routes>
          </div>
        </main>

        <Partners />
        <Footer />
      </div>
    </>
  );
}
