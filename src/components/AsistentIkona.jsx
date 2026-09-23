/**
 * Znak asistenta — futsal lopta.
 *
 * Crta se kao SVG, ne kao slika: ostaje oštra na svakoj veličini, mijenja
 * boju po mjestu na kojem stoji i ne traži još jedan mrežni dohvat.
 *
 * Koordinate su izračunate, ne pogođene: peterokut u sredini ima vrh prema
 * gore, a šavovi idu iz njegovih vrhova ravno prema rubu, svakih 72°. Prva
 * inačica je crtana napamet i nije se prepoznavalo što je.
 */
export default function AsistentIkona({ className = '' }) {
  return (
    <svg
      className={`asikona ${className}`.trim()}
      viewBox="0 0 48 48"
      aria-hidden="true"
      focusable="false"
    >
      <circle className="asikona__krug" cx="24" cy="24" r="22" />

      {/* Šavovi prvi, pa peterokut preko njih — tako spojevi ostaju čisti. */}
      <g className="asikona__savovi">
        <path d="M24.00 16.60 L24.00 5.60" />
        <path d="M31.04 21.71 L41.50 18.31" />
        <path d="M28.35 29.99 L34.81 38.88" />
        <path d="M19.65 29.99 L13.19 38.88" />
        <path d="M16.96 21.71 L6.50 18.31" />
      </g>

      <path
        className="asikona__peterokut"
        d="M24.00 16.60 L31.04 21.71 L28.35 29.99 L19.65 29.99 L16.96 21.71 Z"
      />
    </svg>
  );
}
