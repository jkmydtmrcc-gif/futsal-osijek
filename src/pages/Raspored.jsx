import Brush from '../components/Brush';
import Pip from '../components/Pip';
import Reveal from '../components/Reveal';
import PageHero from '../components/PageHero';
import { PAGES, STANDINGS_NOTE, CLUBS } from '../data/site';
import { useContent } from '../lib/content';

export default function Raspored() {
  const { standings, fixtures } = useContent();

  return (
    <>
      <PageHero page={PAGES['/raspored']} />

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
                <p className="standings__note">{STANDINGS_NOTE}</p>
              </div>
            </Reveal>

            <div className="fixtures">
              <span className="eyebrow eyebrow--sky eyebrow--sm">Nadolazeće utakmice</span>
              {fixtures.map((f, i) => (
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
            </div>
          </div>

          <Reveal className="clubs notch-br-16" delay={140}>
            <span className="eyebrow eyebrow--sm">Klubovi lige</span>
            <div className="clubs__list">
              {CLUBS.map((c, i) => (
                <Reveal as="span" variant="scale" delay={120 + i * 40} className="clubs__chip" key={c}>
                  {c}
                </Reveal>
              ))}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
