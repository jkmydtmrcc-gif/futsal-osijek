import { Link } from 'react-router-dom';
import Brush from '../components/Brush';
import Pip from '../components/Pip';
import Reveal from '../components/Reveal';
import { NOT_FOUND, TICKETS_PATH } from '../data/site';

export default function NijePronadeno() {
  return (
    <section className="wip" aria-labelledby="wip-naslov">
      <div className="scanlines scanlines--wide" aria-hidden="true" />
      <Brush variant="league-1" />
      <Brush variant="league-2" />
      <Brush variant="hero-2" />

      <div className="wip__inner">
        <Reveal variant="scale">
          <span className="wip__badge">
            <Pip tone="sky" blink />
            {NOT_FOUND.eyebrow}
          </span>
        </Reveal>
        <Reveal delay={90}>
          <h1 className="wip__title" id="wip-naslov">
            {NOT_FOUND.title}
          </h1>
        </Reveal>
        <Reveal delay={180}>
          <p className="wip__lead">{NOT_FOUND.lead}</p>
        </Reveal>
        <Reveal delay={280} className="wip__actions">
          <Link className="btn btn--solid notch-12" to="/">
            Natrag na naslovnicu
          </Link>
          <Link className="btn btn--ghost" to={TICKETS_PATH}>
            Ulaznice
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
