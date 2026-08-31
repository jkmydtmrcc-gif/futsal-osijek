import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Brush from './Brush';
import Pip from './Pip';
import { NAV_LINKS, TICKETS_PATH, CONTACT_PATH, SOCIALS } from '../data/site';
import { useContent } from '../content/ContentContext';

/**
 * Mobilni izbornik — zavjesa koja se spušta ispod zaglavlja.
 *
 * Uvijek je u DOM-u da bi i zatvaranje bilo animirano; kad je zatvoren,
 * `visibility: hidden` i `inert` ga vade iz reda za tipkovnicu.
 */
export default function MobileNav({ open, onClose, activeId, returnFocusRef }) {
  const { hero } = useContent();
  const panelRef = useRef(null);

  // Escape zatvara izbornik.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Dok je otvoren, stranica iza ne smije klizati. Širina trake za listanje
  // se nadoknađuje paddingom da sadržaj ne poskoči u stranu.
  useEffect(() => {
    if (!open) return undefined;
    const { body } = document;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPad = body.style.paddingRight;
    body.style.overflow = 'hidden';
    if (gap > 0) body.style.paddingRight = `${gap}px`;
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPad;
    };
  }, [open]);

  // Fokus ulazi u panel pri otvaranju i vraća se na gumb pri zatvaranju.
  useEffect(() => {
    if (open) {
      panelRef.current?.querySelector('a')?.focus();
    } else if (document.activeElement === document.body) {
      returnFocusRef?.current?.focus();
    }
  }, [open, returnFocusRef]);

  return (
    <div
      id="mobilni-izbornik"
      className={`mobile-nav${open ? ' is-open' : ''}`}
      inert={!open}
      aria-hidden={!open}
    >
      <div className="scanlines scanlines--wide" aria-hidden="true" />
      <Brush variant="league-1" />
      <Brush variant="hero-2" />

      <div className="mobile-nav__panel" ref={panelRef}>
        <nav className="mobile-nav__list" aria-label="Mobilna navigacija">
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.id}
              to={link.to}
              className={`mobile-nav__link${link.id === activeId ? ' is-active' : ''}`}
              style={{ '--i': i }}
              onClick={onClose}
              aria-current={link.id === activeId ? 'page' : undefined}
            >
              <span className="mobile-nav__num">{String(i + 1).padStart(2, '0')}</span>
              <span className="mobile-nav__label">{link.label}</span>
              <span className="mobile-nav__arrow" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </nav>

        <div className="mobile-nav__foot" style={{ '--i': NAV_LINKS.length }}>
          <Link className="mobile-nav__cta" to={TICKETS_PATH} onClick={onClose}>
            Kupi ulaznicu
            <Pip size="md" tone="sky" />
          </Link>

          <div className="mobile-nav__socials">
            {SOCIALS.map((s) => (
              <Link key={s.id} to={CONTACT_PATH} onClick={onClose} aria-label={s.name}>
                {s.label}
              </Link>
            ))}
          </div>

          <p className="mobile-nav__venue">{hero.venue}</p>
        </div>
      </div>
    </div>
  );
}
