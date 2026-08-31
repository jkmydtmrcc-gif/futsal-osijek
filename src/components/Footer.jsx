import { Link } from 'react-router-dom';
import Brush from './Brush';
import { FOOTER_LINKS, SOCIALS, CONTACT_PATH, LEGAL_LINKS, CREDIT } from '../data/site';
import { useContent } from '../content/ContentContext';

export default function Footer() {
  const { contact, images } = useContent();

  return (
    <footer className="site-footer">
      <Brush variant="footer-1" />
      <Brush variant="footer-2" />
      <Brush variant="footer-3" />

      <div className="site-footer__grid">
        <div className="footer-brand">
          <div className="footer-brand__row">
            <img
              className="footer-brand__crest notch-8"
              src={images.crest}
              alt="Grb Futsal kluba Osijek"
              width="56"
              height="56"
              loading="lazy"
            />
            <div className="footer-brand__text">
              <span className="footer-brand__name">MNK Osijek Kandit</span>
              <span className="footer-brand__sub">OSN. 2002.</span>
            </div>
          </div>
          <p>
            Futsal klub iz Osijeka. Brzina, energija i strast na parketu od prve do
            posljednje minute.
          </p>
          <div className="footer-social">
            {SOCIALS.map((s) => (
              <Link key={s.id} to={CONTACT_PATH} aria-label={s.name}>
                {s.label}
              </Link>
            ))}
          </div>
        </div>

        <nav className="footer-col" aria-label="Klub">
          <span className="footer-col__title">Klub</span>
          {FOOTER_LINKS.map((link) => (
            <Link key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="footer-col">
          <span className="footer-col__title">Kontakt</span>
          <span className="footer-col__address">
            {contact.address.map((line, i) => (
              <span key={line}>
                {line}
                {i < contact.address.length - 1 && <br />}
              </span>
            ))}
          </span>
          <a className="is-highlight" href={`mailto:${contact.email}`}>
            {contact.email}
          </a>
          <a className="is-highlight" href={`tel:${contact.phoneHref}`}>
            {contact.phone}
          </a>
        </div>

        <div className="footer-col">
          <span className="footer-col__title">Lokacija dvorane</span>
          {/* Ugradnja karte dolazi uz stranicu Kontakt. */}
          <div className="footer-map">
            <div className="footer-map__grid" aria-hidden="true" />
            <Brush variant="map" />
            <span className="footer-map__label" aria-hidden="true">
              [ mapa ]
            </span>
          </div>
        </div>
      </div>

      <div className="footer-legal">
        <div className="footer-legal__inner">
          <span className="footer-legal__copy">
            © 2026 MNK Osijek Kandit. Sva prava pridržana.
          </span>
          <div className="footer-legal__links">
            {LEGAL_LINKS.map((label) => (
              <Link key={label} to={CONTACT_PATH}>
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="footer-credit">
          <span className="footer-credit__line" aria-hidden="true" />
          <span className="footer-credit__text">
            {CREDIT.prefix} <strong>{CREDIT.name}</strong>
          </span>
          <span className="footer-credit__line" aria-hidden="true" />
        </div>
      </div>
    </footer>
  );
}
