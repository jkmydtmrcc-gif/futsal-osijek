import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Reveal from './Reveal';
import Meta from './Meta';
import { NAV_LINKS } from '../data/site';

/**
 * Zajednički vrh svake podstranice — ista tema kao tamne sekcije naslovnice.
 *
 * `grafika` je izrezani igrač koji stoji desno od naslova. Bez njega je vrh
 * stranice bio naslov u praznini; s njim ima što gledati, a fotografija je
 * ionako klupska.
 *
 * Na uskim ekranima se ne prikazuje: tamo nema mjesta pokraj naslova, a
 * ispod njega bi samo gurao sadržaj niže.
 */
export default function PageHero({ page, children, metaImage, grafika }) {
  const [failed, setFailed] = useState(false);
  const showArt = Boolean(grafika) && !failed;

  // Putanja u vrhu: kratka, ali kaže gdje si. Stranice izvan izbornika
  // (ulaznice, kolačići, pojedina novost) uzimaju vlastiti naslov.
  const { pathname } = useLocation();
  const ovdje = NAV_LINKS.find((l) => l.to === pathname)?.label ?? page.title;

  return (
    <section className={`phero${showArt ? ' phero--art' : ''}`} aria-labelledby="phero-naslov">
      {/* Naslov i opis stranice su isti tekstovi koje urednik upisuje, pa se
          meta oznake održavaju same. */}
      <Meta title={page.title} description={page.lead} image={metaImage} />


      {/* Grafika je ukras i stoji izvan toka: da je u mreži, njezina bi
          visina razvukla cijeli vrh stranice i gurnula naslov na dno. */}
      {showArt && (
        <div className="phero__art" aria-hidden="true">
          <span className="phero__art-glow" />
          <img
            className="phero__art-img"
            src={grafika}
            alt=""
            loading="lazy"
            onError={() => setFailed(true)}
          />
        </div>
      )}

      <div className="shell">
        <nav className="phero__staza" aria-label="Putanja">
          <Link to="/">Početna</Link>
          <span className="phero__staza-crta" aria-hidden="true" />
          <span aria-current="page">{ovdje}</span>
        </nav>

        <div className="phero__inner">
          <Reveal>
            <span className="eyebrow eyebrow--sky">{page.eyebrow}</span>
            <h1 className="phero__title" id="phero-naslov">
              {page.title}
            </h1>
          </Reveal>
          <Reveal delay={130}>
            <p className="phero__lead">{page.lead}</p>
          </Reveal>
        </div>

        {/* Brojke i gumbi stoje u vlastitoj traci pod crtom — prije su
            visjeli odmah ispod uvoda i vrh stranice je završavao nasumično. */}
        {children && (
          <Reveal className="phero__traka" delay={230}>
            {children}
          </Reveal>
        )}
      </div>
    </section>
  );
}
