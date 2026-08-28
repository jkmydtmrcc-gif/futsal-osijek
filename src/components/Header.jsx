import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import Brush from './Brush';
import Pip from './Pip';
import Marquee from './Marquee';
import MobileNav from './MobileNav';
import useScrolled from '../hooks/useScrolled';
import {
  NAV_LINKS,
  TOPBAR_STRIP,
  TICKETS_PATH,
  CONTACT_PATH,
  PAGES,
  IMAGES,
} from '../data/site';

/**
 * Zaglavlje s gornjom trakom vijesti i glavnom navigacijom.
 *
 * Aktivna stavka se čita iz rute. Rute koje su još u izgradnji označavaju
 * se u izborniku i dalje normalno — samo vode na stranicu "u izgradnji".
 */
export default function Header() {
  const { pathname } = useLocation();
  const scrolled = useScrolled(24);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef(null);

  // Promjena rute zatvara mobilni izbornik.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Ulaznice nisu u izborniku, ali gumb treba biti aktivan kad si na njima.
  const activeId =
    NAV_LINKS.find((link) => link.to === pathname)?.id ??
    PAGES[pathname]?.navId ??
    null;

  return (
    <div
      className={`site-header${scrolled ? ' is-scrolled' : ''}${menuOpen ? ' is-menu-open' : ''}`}
    >
      <div className="topbar">
        <Brush variant="topbar" />
        <div className="topbar__inner">
          <span className="topbar__live">
            <Pip tone="sky" />
            Live
          </span>

          <Marquee items={TOPBAR_STRIP} className="topbar__marquee" faded>
            {(text, i) => (
              <span className="topbar__item" key={i}>
                {text}
                <Pip size="xs" />
              </span>
            )}
          </Marquee>

          <div className="topbar__social">
            <Link to={CONTACT_PATH}>FB</Link>
            <Link to={CONTACT_PATH}>IG</Link>
            <Link to={CONTACT_PATH}>YT</Link>
          </div>
        </div>
      </div>

      <header className="masthead">
        <Brush variant="masthead-1" />
        <Brush variant="masthead-2" />
        <div className="masthead__inner">
          <Link className="brand" to="/">
            <img
              className="brand__crest notch-8"
              src={IMAGES.crest}
              alt="Grb Futsal kluba Osijek"
              width="56"
              height="56"
            />
            <span className="brand__text">
              <span className="brand__name">MNK OSIJEK</span>
              <span className="brand__sub">KANDIT · OSN. 2002.</span>
            </span>
          </Link>

          <nav className="nav" aria-label="Glavna navigacija">
            {NAV_LINKS.map((link) => {
              const isActive = link.id === activeId;
              return (
                <NavLink
                  key={link.id}
                  className={`nav__link${isActive ? ' is-active' : ''}`}
                  to={link.to}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && <Pip tone="cur" />}
                  {link.label}
                </NavLink>
              );
            })}
          </nav>

          <Link className="masthead__cta" to={TICKETS_PATH}>
            <span className="masthead__cta-text">Kupi ulaznicu</span>
            <Pip size="md" tone="sky" />
          </Link>

          {/* Vidljiv tek ispod 980px; iznad toga je izbornik u traci. */}
          <button
            type="button"
            ref={toggleRef}
            className="nav-toggle"
            aria-label={menuOpen ? 'Zatvori izbornik' : 'Otvori izbornik'}
            aria-expanded={menuOpen}
            aria-controls="mobilni-izbornik"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="nav-toggle__box" aria-hidden="true">
              <span className="nav-toggle__bar" />
              <span className="nav-toggle__bar" />
              <span className="nav-toggle__bar" />
            </span>
          </button>
        </div>
      </header>

      <MobileNav
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        activeId={activeId}
        returnFocusRef={toggleRef}
      />
    </div>
  );
}
