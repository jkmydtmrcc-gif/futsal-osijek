/**
 * Znak asistenta — futsal lopta u jednoj debljini poteza.
 *
 * Crta se kao SVG, ne kao slika: ostaje oštra na svakoj veličini, boju
 * preuzima iz mjesta na kojem stoji (`currentColor`) i ne traži još jedan
 * mrežni dohvat.
 *
 * Koordinate su izračunate, ne pogođene: peterokut ima vrh prema gore, a
 * šavovi idu iz njegovih vrhova ravno prema rubu, svakih 72°. Ranija inačica
 * je bila puna ploha — svijetli disk s tamnim peterokutom — pa je unutar
 * plavog kruga gumba izgledala kao naljepnica nalijepljena preko njega.
 * Sada je obris, pa gumb ostaje jedan predmet.
 */
export default function AsistentIkona({ className = '' }) {
  return (
    <svg
      className={`asikona ${className}`.trim()}
      viewBox="0 0 40 40"
      aria-hidden="true"
      focusable="false"
    >
      <circle className="asikona__krug" cx="20" cy="20" r="15.4" />

      <g className="asikona__savovi">
        <path d="M20 13.55 L20 4.6" />
        <path d="M26.13 18.01 L34.65 15.24" />
        <path d="M23.79 25.22 L29.05 32.46" />
        <path d="M16.21 25.22 L10.95 32.46" />
        <path d="M13.87 18.01 L5.35 15.24" />
      </g>

      <path
        className="asikona__peterokut"
        d="M20 13.55 L26.13 18.01 L23.79 25.22 L16.21 25.22 L13.87 18.01 Z"
      />
    </svg>
  );
}
