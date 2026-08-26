import { Link } from 'react-router-dom';
import Brush from '../components/Brush';
import Pip from '../components/Pip';
import Reveal from '../components/Reveal';
import { STANDINGS, STANDINGS_NOTE, FIXTURES, TIMELINE, CLUBS } from '../data/site';

export default function League() {
  return (
    <section className="league" id="raspored" aria-labelledby="naslov-liga">
      <div className="scanlines scanlines--wide" aria-hidden="true" />
      <Brush variant="league-1" />
      <Brush variant="league-2" />

      <div className="shell">
        <Reveal>
          <span className="eyebrow eyebrow--sky">SuperSport HMNL · 2026/27</span>
          <h2 className="league__title" id="naslov-liga">
            Tablica i <span className="outline outline--soft">raspored</span>
          </h2>
        </Reveal>

        <div className="league__row league__row--top">
          <Reveal variant="left" className="standings">
            <div className="standings__inner">
              <div className="standings__head">
                <span>Poz</span>
                <span>Klub</span>
                <span style={{ textAlign: 'center' }}>Ut</span>
                <span style={{ textAlign: 'right' }}>Bod</span>
              </div>

              {STANDINGS.map((row, i) => (
                <Reveal
                  variant="right"
                  delay={120 + i * 55}
                  className={[
                    'standings__row',
                    row.isPlayoff ? 'is-top' : '',
                    row.isUs ? 'is-us' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  key={row.club}
                >
                  <span className="standings__pos">{row.pos}</span>
                  <span className="standings__club">{row.club}</span>
                  <span className="standings__played">{row.played}</span>
                  <span className="standings__pts">{row.points}</span>
                </Reveal>
              ))}

              <p className="standings__note">{STANDINGS_NOTE}</p>
            </div>
          </Reveal>

          <div className="fixtures">
            <span className="eyebrow eyebrow--sky eyebrow--sm">Nadolazeće utakmice</span>
            {FIXTURES.map((fixture, i) => (
              <Reveal
                variant="right"
                delay={i * 110}
                className="fixture notch-br-14"
                key={fixture.title}
              >
                <div className="fixture__meta">
                  <span className="fixture__when">{fixture.when}</span>
                  <Pip size="sm" />
                  <span className="fixture__comp">{fixture.comp}</span>
                </div>
                <h3 className="fixture__title">{fixture.title}</h3>
                <span className="fixture__venue">{fixture.venue}</span>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="league__row">
          <Reveal variant="left" className="timeline">
            <span className="eyebrow eyebrow--sky eyebrow--sm">Klub kroz sezone</span>
            {TIMELINE.map((entry, i) => (
              <Reveal
                delay={120 + i * 90}
                className="timeline__item"
                key={`${entry.when}-${entry.title}`}
              >
                <span className="timeline__when">{entry.when}</span>
                <div className="timeline__body">
                  <h3 className="timeline__title">{entry.title}</h3>
                  <p className="timeline__note">{entry.note}</p>
                </div>
              </Reveal>
            ))}
          </Reveal>

          <div className="league__side">
            <Reveal variant="right" className="clubs notch-br-16">
              <span className="eyebrow eyebrow--sm">Klubovi lige</span>
              <div className="clubs__list">
                {CLUBS.map((club, i) => (
                  <Reveal
                    as="span"
                    variant="scale"
                    delay={150 + i * 45}
                    className="clubs__chip"
                    key={club}
                  >
                    {club}
                  </Reveal>
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
