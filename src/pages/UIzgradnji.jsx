import { Link, useLocation } from 'react-router-dom';
import Brush from '../components/Brush';
import Pip from '../components/Pip';
import Reveal from '../components/Reveal';
import { TICKETS_PATH, CONTACT_PATH } from '../data/site';

/**
 * Zajednička stranica za sve rute koje još nisu izrađene.
 *
 * Zaglavlje, partneri i podnožje dolaze iz okvira u App.jsx, pa se stranica
 * uklapa u ostatak sitea — ovdje je samo sredina.
 */
export default function UIzgradnji({ page, notFound = false }) {
  const { pathname } = useLocation();

  // Na stranici ulaznica gumb bi vodio sam na sebe — ponudi kontakt.
  const onTicketsPage = pathname === TICKETS_PATH;
  const secondary = onTicketsPage
    ? { to: CONTACT_PATH, label: 'Kontaktiraj klub' }
    : { to: TICKETS_PATH, label: 'Kupi ulaznicu' };

  return (
    <section className="wip" aria-labelledby="wip-naslov">
      <div className="scanlines scanlines--wide" aria-hidden="true" />
      <Brush variant="league-1" />
      <Brush variant="league-2" />
      <Brush variant="hero-2" />

      <div className="wip__inner">
        <Reveal variant="scale">
          <span className="wip__badge">
            <Pip tone="sky" blink />
            {notFound ? 'Stranica nije pronađena' : 'U izgradnji'}
          </span>
        </Reveal>

        <Reveal delay={90}>
          <span className="wip__eyebrow">{page.eyebrow}</span>
          <h1 className="wip__title" id="wip-naslov">
            {page.title}
            {/* Razmak je bitan: bez njega se naslov čita kao "Momčadu izgradnji". */}
            {!notFound && <> <span className="wip__title-outline">u izgradnji</span></>}
          </h1>
        </Reveal>

        <Reveal delay={180}>
          <p className="wip__lead">{page.lead}</p>
        </Reveal>

        {page.progress != null && (
          <Reveal delay={260} className="wip__progress">
            <div
              className="wip__progress-track"
              role="progressbar"
              aria-valuenow={page.progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Napredak izrade stranice"
            >
              <div
                className="wip__progress-fill"
                style={{ '--wip-progress': `${page.progress}%` }}
              />
            </div>
            <div className="wip__progress-meta">
              <span>Napredak</span>
              <span>{page.progress}%</span>
            </div>
          </Reveal>
        )}

        <Reveal delay={340} className="wip__actions">
          <Link className="btn btn--solid notch-12" to="/">
            Natrag na naslovnicu
          </Link>
          <Link className="btn btn--ghost" to={secondary.to}>
            {secondary.label}
          </Link>
        </Reveal>

        <Reveal delay={420}>
          <p className="wip__hint">
            Naslovnica je gotova — momčad, tablica, raspored i Fan Shop već su{' '}
            <Link to="/">ondje</Link>.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
