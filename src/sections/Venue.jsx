import { Link } from 'react-router-dom';
import Brush from '../components/Brush';
import Reveal from '../components/Reveal';
import { VENUE, TICKETS_PATH, IMAGES } from '../data/site';

export default function Venue() {
  return (
    <section className="venue" aria-labelledby="naslov-dvorana">
      <img
        className="venue__photo"
        src={IMAGES.team}
        alt="Navijači i momčad u dvorani Zrinjevac"
        loading="lazy"
      />
      <div className="venue__veil" aria-hidden="true" />
      <Brush variant="venue-1" />
      <Brush variant="venue-2" />

      <div className="venue__inner">
        <Reveal>
          <span className="eyebrow eyebrow--sky">{VENUE}</span>
        </Reveal>
        <Reveal delay={110}>
          <h2 className="venue__title" id="naslov-dvorana">
            Ovdje se futsal igra
            <br />
            punim srcem
          </h2>
        </Reveal>
        <Reveal delay={230}>
          <Link className="venue__cta notch-12" to={TICKETS_PATH}>
            Budi na tribini
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
