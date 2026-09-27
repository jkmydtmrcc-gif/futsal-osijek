import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';
import { TICKETS_PATH } from '../data/site';
import { useContent } from '../lib/content';

export default function Venue() {
  const { hero, images } = useContent();

  return (
    <section className="venue" aria-labelledby="naslov-dvorana">
      <img
        className="venue__photo"
        src={images.team}
        alt="Navijači i momčad u dvorani Zrinjevac"
        loading="lazy"
      />
      <div className="venue__veil" aria-hidden="true" />

      <div className="venue__inner">
        <Reveal>
          <span className="eyebrow eyebrow--sky">{hero.venue}</span>
        </Reveal>
        <Reveal delay={110}>
          <h2 className="venue__title" id="naslov-dvorana">
            Ovdje se futsal igra
            <br />
            punim srcem
          </h2>
        </Reveal>
        <Reveal delay={230}>
          <Link className="venue__cta" to={TICKETS_PATH}>
            Budi na tribini
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
