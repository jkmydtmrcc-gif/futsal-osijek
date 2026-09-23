import { useState } from 'react';
import Brush from './Brush';
import Reveal from './Reveal';
import Meta from './Meta';

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

  return (
    <section className={`phero${showArt ? ' phero--art' : ''}`} aria-labelledby="phero-naslov">
      {/* Naslov i opis stranice su isti tekstovi koje urednik upisuje, pa se
          meta oznake održavaju same. */}
      <Meta title={page.title} description={page.lead} image={metaImage} />

      <div className="scanlines scanlines--wide" aria-hidden="true" />
      <Brush variant="league-1" />
      <Brush variant="hero-2" />

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
          {children && <Reveal delay={230}>{children}</Reveal>}
        </div>
      </div>
    </section>
  );
}
