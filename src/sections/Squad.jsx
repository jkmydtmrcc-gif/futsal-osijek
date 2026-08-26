import { Link } from 'react-router-dom';
import Brush from '../components/Brush';
import Pip from '../components/Pip';
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
            <Reveal
              as="article"
              variant="blur"
              delay={i * 70}
              className="player notch-br-22"
              key={player.name}
            >
              {/* Fotografije igrača još nisu isporučene. */}
              <div className="player__shot">
                <div className="player__wash" aria-hidden="true" />
                <span className="player__placeholder" aria-hidden="true">
                  [ portret igrača ]
                </span>
              </div>
              <div className="player__body">
                <span className="player__pos">{player.pos}</span>
                <h3 className="player__name">{player.name}</h3>
                <div className="player__note-row">
                  <Pip />
                  <span className="player__note">{player.note}</span>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
