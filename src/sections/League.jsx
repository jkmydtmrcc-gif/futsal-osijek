import { Link } from 'react-router-dom';
import Pip from '../components/Pip';
import Reveal from '../components/Reveal';
import Tablica from '../components/Tablica';
import { useContent } from '../lib/content';

export default function League() {
  const { league } = useContent();

  return (
    <section className="league" id="raspored" aria-labelledby="naslov-liga">

      <div className="shell">
        <Reveal>
          <span className="eyebrow eyebrow--sky">SuperSport HMNL · 2026/27</span>
          <h2 className="league__title" id="naslov-liga">
            Tablica i <span className="outline outline--soft">raspored</span>
          </h2>
        </Reveal>

        <div className="league__row league__row--top">
          <Reveal variant="left" className="standings">
            <Tablica />
          </Reveal>

          {/* Termini se pojavljuju s popisom, a ne jedan po jedan: raspored
              koji se dijeli kao karte je vizualni potpis predloška.
              Užareni izrezani igrač uz tablicu otišao je iz istog razloga —
              bio je ukras na mjestu gdje se gledaju podaci. */}
          <Reveal variant="right" className="fixtures">
            <span className="eyebrow eyebrow--sky eyebrow--sm">Nadolazeće utakmice</span>
            {league.fixtures.map((fixture) => (
              <div className="fixture" key={fixture.title}>
                <div className="fixture__meta">
                  <span className="fixture__when">{fixture.when}</span>
                  <Pip size="sm" />
                  <span className="fixture__comp">{fixture.comp}</span>
                </div>
                <h3 className="fixture__title">{fixture.title}</h3>
                <span className="fixture__venue">{fixture.venue}</span>
              </div>
            ))}
          </Reveal>
        </div>

        <div className="league__row">
          <Reveal variant="left" className="timeline">
            <span className="eyebrow eyebrow--sky eyebrow--sm">Klub kroz sezone</span>
            {league.timeline.map((entry) => (
              <div className="timeline__item" key={`${entry.when}-${entry.title}`}>
                <span className="timeline__when">{entry.when}</span>
                <div className="timeline__body">
                  <h3 className="timeline__title">{entry.title}</h3>
                  <p className="timeline__note">{entry.note}</p>
                </div>
              </div>
            ))}
          </Reveal>

          <div className="league__side">
            <Reveal variant="right" className="clubs">
              <span className="eyebrow eyebrow--sm">Klubovi lige</span>
              <div className="clubs__list">
                {league.clubs.map((club) => (
                  <span className="clubs__chip" key={club}>
                    {club}
                  </span>
                ))}
              </div>
            </Reveal>
            <Reveal variant="right" delay={140}>
              <Link className="league__cta" to="/raspored">
                Cijeli raspored i rezultati
                <Pip size="lg" tone="cur" />
              </Link>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
