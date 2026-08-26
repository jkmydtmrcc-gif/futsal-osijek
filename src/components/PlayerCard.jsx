import { useState } from 'react';
import Pip from './Pip';
import Reveal from './Reveal';

/** Prezime za vodeni žig iza igrača ("Everton Cardoso — Gallo" → "Gallo"). */
function surnameOf(name) {
  const parts = name.split(' ').filter((p) => p && p !== '—');
  return parts[parts.length - 1] ?? name;
}

/**
 * Kartica igrača.
 *
 * Portret je izrezan (bez pozadine), pa ga kartica sama podlaže: prijelaz
 * boje, potez kistom kao tlo, prezime u pozadini i mekano stapanje donjeg
 * ruba u bijeli dio kartice — da se ne vidi gdje je izrez odrezan.
 *
 * Ako fotografija nedostaje ili se ne učita, ostaje rezervirano mjesto,
 * pa se slike mogu dodavati jedna po jedna.
 */
export default function PlayerCard({ player, index = 0 }) {
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(player.photo) && !failed;

  return (
    <Reveal as="article" variant="blur" delay={index * 70} className="player notch-br-22">
      <div className={`player__shot${showPhoto ? ' has-photo' : ''}`}>
        <div className="player__grain" aria-hidden="true" />
        <div className="player__wash" aria-hidden="true" />
        <span className="player__ghost" aria-hidden="true">
          {surnameOf(player.name)}
        </span>

        {showPhoto && (
          <img
            className="player__photo"
            src={player.photo}
            alt={`${player.name} — portret`}
            loading="lazy"
            onError={() => setFailed(true)}
          />
        )}

        <span className="player__tag">{player.pos}</span>
        <div className="player__fade" aria-hidden="true" />
      </div>

      <div className="player__body">
        <h3 className="player__name">{player.name}</h3>
        <div className="player__note-row">
          <Pip />
          <span className="player__note">{player.note}</span>
        </div>
      </div>
    </Reveal>
  );
}
