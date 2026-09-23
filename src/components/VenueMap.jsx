import { useState } from 'react';

/**
 * Karta dvorane.
 *
 * OpenStreetMap umjesto Google Mapsa: ugrađuje se bez ključa i bez kolačića
 * za praćenje, pa stranica zbog karte ne treba privolu za kolačiće.
 *
 * Okvir se učitava tek na klik. Ugrađena karta povuče nekoliko stotina
 * kilobajta i na svakoj stranici s podnožjem — a većina posjetitelja je
 * nikad ne pogleda.
 */
export default function VenueMap({ map, className = '', height = 260 }) {
  const [live, setLive] = useState(false);

  const { lat, lon, zoom = 16, label, link } = map;
  const d = 0.004 * (17 - zoom + 1);
  const bbox = [lon - d, lat - d / 2, lon + d, lat + d / 2].join(',');
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;

  return (
    <div className={`vmap ${className}`.trim()} style={{ '--vmap-h': `${height}px` }}>
      {live ? (
        <iframe
          className="vmap__frame"
          src={src}
          title={`Karta — ${label}`}
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ) : (
        <button type="button" className="vmap__preview" onClick={() => setLive(true)}>
          <span className="vmap__grid" aria-hidden="true" />
          <span className="vmap__pin" aria-hidden="true" />
          <span className="vmap__label">{label}</span>
          <span className="vmap__cta">Prikaži kartu</span>
        </button>
      )}

      <a className="vmap__link" href={link} target="_blank" rel="noopener noreferrer">
        Otvori upute ↗
      </a>
    </div>
  );
}
