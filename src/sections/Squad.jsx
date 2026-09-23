import { useState } from 'react';
import { Link } from 'react-router-dom';
import Brush from '../components/Brush';
import PlayerCard from '../components/PlayerCard';
import Rail from '../components/Rail';
import Reveal from '../components/Reveal';
import PlayerModal from '../components/PlayerModal';
import { useContent } from '../content/ContentContext';

export default function Squad() {
  const { players } = useContent();
  const [open, setOpen] = useState(null);

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
      </div>

      {/* Traka ide izvan .shell da kartice mogu kliziti do samog ruba
          ekrana, ali se prva poravnava s ostatkom sadržaja. */}
      <Rail label="Igrači prve postave" className="squad__rail">
        {players.map((player, i) => (
          <div className="squad__slide" data-rail-item key={player.id ?? player.name}>
            <PlayerCard player={player} index={i} onOpen={() => setOpen(player)} />
          </div>
        ))}
      </Rail>

      {open && <PlayerModal player={open} onClose={() => setOpen(null)} />}
    </section>
  );
}
