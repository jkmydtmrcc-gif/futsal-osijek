import { useState } from 'react';
import Reveal from './Reveal';

/** Ime se lomi na prvo i zadnje ("Everton Cardoso — Gallo" → Everton Cardoso / Gallo). */
function splitName(name) {
  const parts = name.split(' ').filter((p) => p && p !== '—');
  const last = parts.pop() ?? name;
  return { first: parts.join(' '), last };
}

/**
 * Kartica igrača.
 *
 * Namjerno neuredna: kartica je blago nakrivljena, redni broj ispada iz
 * kadra, pozicija stoji okomito uz rub, a pločica s imenom je zakrenuta.
 * Portret je izrezan (bez pozadine) pa scenu radi kartica — tamna podloga
 * daje kontrast bijelim dresovima.
 */
export default function PlayerCard({ player, index = 0, onOpen }) {
  const [failed, setFailed] = useState(false);
  const showPhoto = Boolean(player.photo) && !failed;
  const { first, last } = splitName(player.name);

  /* Kad se klikom otvara profil, kartica je gumb — ne `article` s `onClick`.
     Tako radi i tipkovnica i čitač ekrana, bez ručnog dodavanja role i
     rukovatelja za Enter i razmaknicu. */
  return (
    <Reveal
      as={onOpen ? 'button' : 'article'}
      type={onOpen ? 'button' : undefined}
      onClick={onOpen}
      aria-label={onOpen ? `${player.name} — otvori profil` : undefined}
      variant="blur"
      delay={index * 70}
      className={`player${showPhoto ? ' has-photo' : ''}${onOpen ? ' player--btn' : ''}`}
    >
      {/* Broj na dresu, ne redni broj u popisu. */}
      <span className={`player__num${String(player.number).length === 1 ? ' is-single' : ''}`} aria-hidden="true">
        {player.number}
      </span>

      <div className="player__glow" aria-hidden="true" />
      <div className="player__grain" aria-hidden="true" />

      {/* Prezime stoji uvijek, iza igrača. Slika je `lazy`, pa se ona
          ispod preloma ni ne pokuša učitati — bez ovoga bi kartica s
          nedostajućom slikom ostala prazna dok se ne doskrola do nje. */}
      <span className="player__ghost" aria-hidden="true">
        {last}
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

      <div className="player__scrim" aria-hidden="true" />

      <span className="player__pos">{player.pos}</span>

      <div className="player__plate">
        {first && <span className="player__first">{first}</span>}
        <h3 className="player__last">
          <span className="player__wash" aria-hidden="true" />
          {last}
        </h3>
        <span className="player__note">{player.note}</span>
      </div>

      {onOpen && (
        <span className="player__more" aria-hidden="true">
          Profil →
        </span>
      )}
    </Reveal>
  );
}
