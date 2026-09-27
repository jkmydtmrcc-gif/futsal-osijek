import { Link } from 'react-router-dom';
import Pip from '../components/Pip';
import { useContent } from '../lib/content';

/**
 * Hero ne koristi <Reveal> — sadržaj je odmah u kadru, pa ulazne animacije
 * (floatUp) kreću po učitavanju, bez čekanja na listanje.
 */
export default function Hero() {
  const { hero, images, league } = useContent();

  // Prvo što navijača zanima na vrhu stranice je sljedeća utakmica.
  // Dok je nema u rasporedu, na njezino mjesto idu klupske brojke.
  const sljedeca = league.fixtures[0] ?? null;

  return (
    <section className="hero" id="pocetna">
      <img
        className="hero__photo"
        src={images.celebration}
        alt="Igrač Kandita slavi s navijačima"
        fetchPriority="high"
      />
      <div className="hero__veil" aria-hidden="true" />

      <div className="hero__inner">
        <div className="hero__lead">
          <div className="hero__badgerow">
            <div className="hero__league">
              <Pip blink />
              <span>SuperSport HMNL · 2026/27</span>
            </div>
          </div>

          <h1 className="hero__title">
            <span className="hero__title-line">MNK</span>
            <span className="hero__title-line">
              <span className="outline">Osijek</span> <span className="accent">Kandit</span>
            </span>
          </h1>

          <p className="hero__slogan">{hero.slogan}</p>

          <div className="hero__actions">
            <Link className="btn btn--solid" to="/postava">
              Upoznaj momčad
            </Link>
            <Link className="btn btn--ghost" to="/raspored">
              Raspored i tablica
            </Link>
          </div>
        </div>

        <div className="hero__aside">
          <div className="hero__frame">
            <img
              className="hero__frame-img"
              src={images.team}
              alt="Momčad Kandita slavi pobjedu"
            />
            <span className="hero__frame-tag">Zrinjevac · bijelo-plavi</span>
          </div>

          {sljedeca ? (
            <div className="hero__facts hero__next">
              <span className="eyebrow eyebrow--sm">Sljedeća utakmica</span>
              <div className="hero__next-meta">
                <span className="hero__next-when">{sljedeca.when}</span>
                <span className="hero__next-comp">{sljedeca.comp}</span>
              </div>
              <h2 className="hero__next-title">{sljedeca.title}</h2>
              <span className="hero__next-venue">{sljedeca.venue}</span>
              <Link className="hero__next-link" to="/raspored">
                Cijeli raspored i tablica →
              </Link>
            </div>
          ) : (
            <div className="hero__facts">
              <span className="eyebrow eyebrow--sm">Sezona 2025/26</span>
              <div className="hero__facts-list">
                {hero.facts.map((fact, i) => (
                  <div
                    className="hero__fact"
                    key={fact.label}
                    style={{ '--fact-delay': `${0.45 + i * 0.12}s` }}
                  >
                    <span className="hero__fact-v">{fact.value}</span>
                    <span className="hero__fact-l">{fact.label}</span>
                  </div>
                ))}
              </div>
              <div className="hero__facts-foot">{hero.venue}</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
