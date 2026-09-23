import Brush from './Brush';
import Reveal from './Reveal';
import Meta from './Meta';

/** Zajednički vrh svake podstranice — ista tema kao tamne sekcije naslovnice. */
export default function PageHero({ page, children, metaImage }) {
  return (
    <section className="phero" aria-labelledby="phero-naslov">
      {/* Naslov i opis stranice su isti tekstovi koje urednik upisuje, pa se
          meta oznake održavaju same. */}
      <Meta title={page.title} description={page.lead} image={metaImage} />

      <div className="scanlines scanlines--wide" aria-hidden="true" />
      <Brush variant="league-1" />
      <Brush variant="hero-2" />

      <div className="shell phero__inner">
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
    </section>
  );
}
