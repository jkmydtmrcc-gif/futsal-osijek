/**
 * Karta dvorane.
 *
 * OpenStreetMap umjesto Google Mapsa: ugrađuje se bez ključa i bez kolačića
 * za praćenje.
 *
 * Karta se učitava odmah, bez međukoraka „prikaži kartu“. To znači da
 * OpenStreetMap vidi IP svakog posjetitelja stranice s podnožjem — zato to
 * stranica `/kolacici` i kaže naglas, umjesto da prešuti.
 */
export default function VenueMap({ map, className = '', height = 260 }) {
  const { lat, lon, zoom = 16, label, link } = map;

  /* Okvir se zadaje pravokutnikom, a ne razinom približavanja; širina se
     računa iz zooma pa veći broj znači bliže. */
  const d = 0.004 * (17 - zoom + 1);
  const bbox = [lon - d, lat - d / 2, lon + d, lat + d / 2].join(',');
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;

  return (
    <div className={`vmap ${className}`.trim()} style={{ '--vmap-h': `${height}px` }}>
      <iframe
        className="vmap__frame"
        src={src}
        title={`Karta — ${label}`}
        loading="lazy"
        referrerPolicy="no-referrer"
      />

      <a className="vmap__link" href={link} target="_blank" rel="noopener noreferrer">
        Otvori upute ↗
      </a>
    </div>
  );
}
