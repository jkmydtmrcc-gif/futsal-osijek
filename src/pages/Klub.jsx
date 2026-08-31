import { Link } from 'react-router-dom';
import Brush from '../components/Brush';
import Pip from '../components/Pip';
import Reveal from '../components/Reveal';
import PageHero from '../components/PageHero';
import { TICKETS_PATH } from '../data/site';
import { useContent } from '../content/ContentContext';

export default function Klub() {
  const { pages, club, staff, league, contact, images, hero } = useContent();

  return (
    <>
      <PageHero page={pages['/klub']}>
        <div className="phero__actions">
          <Link className="btn btn--solid notch-12" to="/postava">
            Prva postava
          </Link>
          <Link className="btn btn--ghost" to={TICKETS_PATH}>
            Dolazak na utakmicu
          </Link>
        </div>
      </PageHero>

      {/* --- Brojke -------------------------------------------------------- */}
      <section className="slab" aria-label="Klub u brojkama">
        <Brush variant="impact" />
        <div className="shell facts">
          {club.facts.map((f, i) => (
            <Reveal className="facts__cell" key={f.label} delay={i * 90}>
              <span className="facts__value">{f.value}</span>
              <span className="facts__label">{f.label}</span>
            </Reveal>
          ))}
        </div>
      </section>

      {/* --- Priča --------------------------------------------------------- */}
      <section className="slab slab--paper" aria-labelledby="naslov-prica">
        <Brush variant="squad-1" />
        <div className="shell split">
          <Reveal variant="left" className="split__main">
            <span className="eyebrow">Klub</span>
            <h2 className="section-title" id="naslov-prica">
              Bijelo-plavi
              <br />
              iz Osijeka
            </h2>
            {club.story.map((paragraph, i) => (
              <p className="prose" key={i}>
                {paragraph}
              </p>
            ))}

            <div className="btn-row">
              <Link className="btn btn--blue notch-12" to="/raspored">
                Raspored i tablica
              </Link>
              <Link className="btn btn--ghost btn--ink" to="/novosti">
                Novosti iz kluba
              </Link>
            </div>
          </Reveal>

          <Reveal variant="right" delay={120} className="split__side">
            <img
              className="split__img notch-br-22"
              src={images.team}
              alt="Momčad Kandita slavi pobjedu"
              loading="lazy"
            />
            <div className="staff">
              {staff.map((s) => (
                <div className="staff__row" key={s.role}>
                  <span className="staff__role">{s.role}</span>
                  <span className="staff__name">{s.name}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* --- Uspjesi ------------------------------------------------------- */}
      <section className="slab slab--dark" aria-labelledby="naslov-uspjesi">
        <div className="scanlines scanlines--wide" aria-hidden="true" />
        <Brush variant="league-1" />
        <div className="shell">
          <Reveal>
            <span className="eyebrow eyebrow--sky">Rezultati</span>
            <h2 className="section-title section-title--light" id="naslov-uspjesi">
              Zadnje dvije sezone
            </h2>
          </Reveal>

          <div className="honours">
            {club.honours.map((h, i) => (
              <Reveal className="honour" key={h.title} delay={120 + i * 110} variant="right">
                <span className="honour__when">{h.when}</span>
                <div>
                  <h3 className="honour__title">{h.title}</h3>
                  <p className="honour__note">{h.note}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={340}>
            <p className="slab__foot">
              <Pip tone="sky" /> Dvorana Zrinjevac · {contact.address[1]}, {contact.address[2]}
            </p>
          </Reveal>
        </div>
      </section>

      {/* --- Kroz sezone --------------------------------------------------- */}
      <section className="slab slab--paper" aria-labelledby="naslov-kroz-sezone">
        <Brush variant="squad-2" />
        <div className="shell">
          <Reveal>
            <span className="eyebrow">Kronologija</span>
            <h2 className="section-title" id="naslov-kroz-sezone">
              Klub kroz sezone
            </h2>
          </Reveal>

          <div className="timeline timeline--paper">
            {league.timeline.map((entry, i) => (
              <Reveal
                className="timeline__item"
                delay={100 + i * 90}
                key={`${entry.when}-${entry.title}`}
              >
                <span className="timeline__when">{entry.when}</span>
                <div className="timeline__body">
                  <h3 className="timeline__title">{entry.title}</h3>
                  <p className="timeline__note">{entry.note}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* --- Dvorana ------------------------------------------------------- */}
      <section className="venue venue--page" aria-labelledby="naslov-dvorana-klub">
        <img
          className="venue__photo"
          src={images.celebration}
          alt="Dvorana Zrinjevac na dan utakmice"
          loading="lazy"
        />
        <div className="venue__veil" aria-hidden="true" />
        <Brush variant="venue-1" />
        <Brush variant="venue-2" />

        <div className="venue__inner">
          <Reveal>
            <span className="eyebrow eyebrow--sky">{hero.venue}</span>
          </Reveal>
          <Reveal delay={110}>
            <h2 className="venue__title" id="naslov-dvorana-klub">
              Naš parket
              <br />
              je Zrinjevac
            </h2>
          </Reveal>
          <Reveal delay={230}>
            <Link className="venue__cta notch-12" to={TICKETS_PATH}>
              Kako doći na utakmicu
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
