import { Link } from 'react-router-dom';
import Brush from '../components/Brush';
import Pip from '../components/Pip';
import { TICKETS_PATH } from '../data/site';
import { useContent } from '../content/ContentContext';

/**
 * Hero ne koristi <Reveal> — sadržaj je odmah u kadru, pa ulazne animacije
 * (floatUp) kreću po učitavanju, bez čekanja na listanje.
 */
export default function Hero() {
  const { hero, images } = useContent();

  return (
    <section className="hero" id="pocetna">
      <img
        className="hero__photo"
        src={images.celebration}
        alt="Igrač Kandita slavi s navijačima"
        fetchPriority="high"
      />
      <div className="hero__veil" aria-hidden="true" />
      <div className="scanlines" style={{ mixBlendMode: 'overlay' }} aria-hidden="true" />
      <Brush variant="hero-1" />
      <Brush variant="hero-2" />
      <Brush variant="hero-3" />

      <div className="hero__inner">
        <div className="hero__lead">
          <div className="hero__badgerow">
            <img
              className="hero__crest notch-10"
              src={images.crest}
              alt="Grb Futsal kluba Osijek"
              width="96"
              height="96"
            />
            <div className="hero__league notch-8">
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
            <Link className="btn btn--solid notch-12" to="/postava">
              Upoznaj momčad
            </Link>
            <Link className="btn btn--ghost" to={TICKETS_PATH}>
              Kupi ulaznicu
            </Link>
          </div>
        </div>

        <div className="hero__aside">
          <div className="hero__frame">
            <div className="hero__frame-wash" aria-hidden="true" />
            <img
              className="hero__frame-img notch-br-14"
              src={images.team}
              alt="Momčad Kandita slavi pobjedu"
            />
            <span className="hero__frame-tag">Zrinjevac · bijelo-plavi</span>
          </div>

          <div className="hero__facts notch-br-18">
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
        </div>
      </div>
    </section>
  );
}
