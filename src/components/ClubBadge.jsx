import { useState } from 'react';

/** Inicijali kluba — „Torcida Biberon“ → „TB“, „Rijeka“ → „RI“. */
function initials(name) {
  const words = String(name ?? '')
    .split(/[\s—-]+/)
    .filter(Boolean);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toLocaleUpperCase('hr-HR');
  return (words[0][0] + words[1][0]).toLocaleUpperCase('hr-HR');
}

/**
 * Grb kluba u tablici.
 *
 * Grbovi drugih klubova nisu klupsko vlasništvo, pa se ne podmeću ni sa
 * interneta ni tuđim logotipom kao zamjenom — dok logotip nije upisan u
 * administraciji, stoji pločica s inicijalima. Isto vrijedi ako se upisana
 * slika ne učita.
 */
export default function ClubBadge({ club, logo, size = 'md' }) {
  const [failed, setFailed] = useState(false);
  const show = Boolean(logo) && !failed;

  return (
    <span className={`cbadge cbadge--${size}${show ? ' has-logo' : ''}`} aria-hidden="true">
      {show ? (
        <img src={logo} alt="" loading="lazy" onError={() => setFailed(true)} />
      ) : (
        <span className="cbadge__txt">{initials(club)}</span>
      )}
    </span>
  );
}
