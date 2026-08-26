import { Link } from 'react-router-dom';
import Brush from '../components/Brush';
import PlayerCard from '../components/PlayerCard';
import Reveal from '../components/Reveal';
import { PLAYERS } from '../data/site';

export default function Squad() {
  return (
    <section className="squad" id="postava" aria-labelledby="naslov-momcad">
      <Brush variant="squad-1" />
      <Brush variant="squad-2" />

      <div className="shell">
        <div className="section-head">
          <Reveal>
            <span className="eyebrow">Prva postava</span>
            <h2 className="section-title" id="naslov-momcad">
              Momčad
            </h2>
          </Reveal>
          <Reveal variant="right" delay={140}>
            <Link className="link-underline" to="/postava">
              Cijela momčad →
            </Link>
          </Reveal>
        </div>

        <div className="squad__grid">
          {PLAYERS.map((player, i) => (
            <PlayerCard key={player.name} player={player} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
