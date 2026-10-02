import { Link } from 'react-router-dom';
import Pip from '../components/Pip';
import Reveal from '../components/Reveal';
import PageHero from '../components/PageHero';
import Tablica from '../components/Tablica';
import { TICKETS_PATH } from '../data/site';
import { useContent, useStandings } from '../lib/content';

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
            {/* Omjer se pokazuje tek kad je upisan — nule bi tvrdile da smo
                odigrali šest utakmica bez ijedne pobjede i bez ijednog poraza. */}
            {us.wins + us.draws + us.losses > 0 && (
              <span className="phero__stat">
                <strong>
                  {us.wins}-{us.draws}-{us.losses}
                </strong>{' '}
                P-N-I
              </span>
            )}
          </div>
        )}
      </PageHero>

      {/* --- Tablica i nadolazeće ------------------------------------------ */}
      <section className="slab slab--dark" aria-labelledby="naslov-tablica">

        <div className="shell">
          <Reveal>
            <span className="eyebrow eyebrow--sky">Poredak</span>
            <h2 className="section-title section-title--light" id="naslov-tablica">
              Tablica
            </h2>
          </Reveal>

          <div className="league__row league__row--top">
            <Reveal variant="left" className="standings">
              <Tablica legenda />
            </Reveal>

            {/* Popis se pojavljuje odjednom: raspored koji se dijeli kao
                karte izgleda kao predložak, a ne kao kalendar sezone. */}
            <Reveal variant="right" className="fixtures">
              <span className="eyebrow eyebrow--sky eyebrow--sm">Nadolazeće utakmice</span>
              {league.fixtures.map((f) => (
                <div className="fixture" key={f.title}>
                  <div className="fixture__meta">
                    <span className="fixture__when">{f.when}</span>
                    <Pip size="sm" />
                    <span className="fixture__comp">{f.comp}</span>
                  </div>
                  <h3 className="fixture__title">{f.title}</h3>
                  <span className="fixture__venue">{f.venue}</span>
                </div>
              ))}

              <Link className="league__cta" to={TICKETS_PATH}>
                Dolazak na Zrinjevac
                <Pip size="lg" tone="cur" />
              </Link>
            </Reveal>
          </div>

          <Reveal className="league__clubs" delay={180}>
            <span className="eyebrow eyebrow--sky eyebrow--sm">Svi klubovi lige</span>
            <div className="clubs__list">
              {league.clubs.map((c) => (
                <span className="clubs__chip" key={c}>
                  {c}
                </span>
              ))}
            </div>
            <p className="slab__foot slab__foot--light">
              <Pip tone="sky" /> Termini se potvrđuju objavom kalendara HMNL-a. Promjene
              javljamo u{' '}
              <Link className="link-inline" to="/novosti">
                novostima
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </section>

      {/* --- Odigrano ------------------------------------------------------ */}
      {league.results.length > 0 && (
        <section className="slab slab--paper" aria-labelledby="naslov-rezultati">
          <div className="shell">
            <Reveal>
              <span className="eyebrow">Odigrano</span>
              <h2 className="section-title" id="naslov-rezultati">
                Rezultati
              </h2>
            </Reveal>

            <Reveal className="results">
              {league.results.map((r) => (
                <div className="result" key={`${r.when}-${r.title}`}>
                  <span className="result__when">{r.when}</span>
                  <h3 className="result__title">{r.title}</h3>
                  <span className={`result__score result__score--${r.outcome || 'n'}`}>
                    {r.score}
                  </span>
                  <span className="result__comp">{r.comp}</span>
                </div>
              ))}
            </Reveal>
          </div>
        </section>
      )}

    </>
  );
}
