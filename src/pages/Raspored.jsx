import { Link } from 'react-router-dom';
import Brush from '../components/Brush';
import Pip from '../components/Pip';
import Reveal from '../components/Reveal';
import PageHero from '../components/PageHero';
import { TICKETS_PATH } from '../data/site';
import { useContent, useStandings } from '../content/ContentContext';

export default function Raspored() {
  const { pages, league } = useContent();
  const standings = useStandings();
  const us = standings.find((row) => row.isUs);

  return (
    <>
      <PageHero page={pages['/raspored']}>
        {us && (
          <div className="phero__stats">
            <span className="phero__stat">
              <strong>{us.pos}.</strong> mjesto
            </span>
            <span className="phero__stat">
              <strong>{us.points}</strong> bodova
            </span>
            <span className="phero__stat">
              <strong>{us.played}</strong> utakmica
            </span>
          </div>
        )}
      </PageHero>

      {/* --- Tablica i nadolazeće ------------------------------------------ */}
      <section className="slab slab--dark" aria-labelledby="naslov-tablica">
        <div className="scanlines scanlines--wide" aria-hidden="true" />
        <Brush variant="league-1" />
        <Brush variant="league-2" />

        <div className="shell">
          <Reveal>
            <span className="eyebrow eyebrow--sky">Poredak</span>
            <h2 className="section-title section-title--light" id="naslov-tablica">
              Tablica
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
                {standings.map((row, i) => (
                  <Reveal
                    variant="right"
                    delay={100 + i * 50}
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

                <div className="legend">
                  <span className="legend__item">
                    <span className="legend__swatch legend__swatch--top" aria-hidden="true" />
                    Prva {league.playoffCutoff} mjesta — doigravanje
                  </span>
                  <span className="legend__item">
                    <span className="legend__swatch legend__swatch--us" aria-hidden="true" />
                    {league.ourClub}
                  </span>
                </div>

                <p className="standings__note">{league.note}</p>
              </div>
            </Reveal>

            <div className="fixtures">
              <span className="eyebrow eyebrow--sky eyebrow--sm">Nadolazeće utakmice</span>
              {league.fixtures.map((f, i) => (
                <Reveal variant="right" delay={i * 110} className="fixture notch-br-14" key={f.title}>
                  <div className="fixture__meta">
                    <span className="fixture__when">{f.when}</span>
                    <Pip size="sm" />
                    <span className="fixture__comp">{f.comp}</span>
                  </div>
                  <h3 className="fixture__title">{f.title}</h3>
                  <span className="fixture__venue">{f.venue}</span>
                </Reveal>
              ))}

              <Reveal variant="right" delay={360}>
                <Link className="league__cta" to={TICKETS_PATH}>
                  Dolazak na Zrinjevac
                  <Pip size="lg" tone="cur" />
                </Link>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* --- Odigrano ------------------------------------------------------ */}
      {league.results.length > 0 && (
        <section className="slab slab--paper" aria-labelledby="naslov-rezultati">
          <Brush variant="squad-1" />
          <div className="shell">
            <Reveal>
              <span className="eyebrow">Odigrano</span>
              <h2 className="section-title" id="naslov-rezultati">
                Rezultati
              </h2>
            </Reveal>

            <div className="results">
              {league.results.map((r, i) => (
                <Reveal className="result notch-br-14" delay={i * 90} key={`${r.when}-${r.title}`}>
                  <span className="result__when">{r.when}</span>
                  <h3 className="result__title">{r.title}</h3>
                  <span className={`result__score result__score--${r.outcome || 'n'}`}>
                    {r.score}
                  </span>
                  <span className="result__comp">{r.comp}</span>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --- Klubovi lige --------------------------------------------------- */}
      <section className="slab" aria-labelledby="naslov-klubovi">
        <div className="shell">
          <Reveal>
            <span className="eyebrow">SuperSport HMNL</span>
            <h2 className="section-title" id="naslov-klubovi">
              Klubovi lige
            </h2>
          </Reveal>

          <Reveal className="clubs clubs--paper notch-br-16" delay={140}>
            <div className="clubs__list">
              {league.clubs.map((c, i) => (
                <Reveal as="span" variant="scale" delay={120 + i * 40} className="clubs__chip" key={c}>
                  {c}
                </Reveal>
              ))}
            </div>
          </Reveal>

          <Reveal delay={260}>
            <p className="slab__foot">
              <Pip /> Termini se potvrđuju objavom kalendara HMNL-a. Promjene javljamo u{' '}
              <Link className="link-inline" to="/novosti">
                novostima
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
