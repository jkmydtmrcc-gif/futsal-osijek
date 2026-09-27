/**
 * Znak asistenta — klupski štit koji je ujedno oblačić za razgovor.
 *
 * Obris prati siluetu klupskog grba (zaobljen vrh, šiljak prema dolje), a
 * tri točke unutra kažu što gumb radi. Tako znak pripada klubu, a ne izgleda
 * kao ikona iz zbirke koja se vidi na svakoj drugoj stranici.
 *
 * Prije je ovdje bila futsal lopta. Šavovi iz peterokuta prema rubu na
 * 36 piksela su se stopili u pet krakova, pa je izgledala kao volan.
 *
 * Crta se kao SVG, ne kao slika: ostaje oštra na svakoj veličini, boju
 * preuzima iz mjesta na kojem stoji (`currentColor`) i ne traži još jedan
 * mrežni dohvat.
 */
export default function AsistentIkona({ className = '' }) {
  return (
    <svg
      className={`asikona ${className}`.trim()}
      viewBox="0 0 40 40"
      aria-hidden="true"
      focusable="false"
    >
      <path
        className="asikona__stit"
        d="M8.2 11.8a3.2 3.2 0 0 1 3.2-3.2h17.2a3.2 3.2 0 0 1 3.2 3.2v9.4c0 5.6-4.8 9.2-11.8 12-7-2.8-11.8-6.4-11.8-12Z"
      />
      <g className="asikona__tocke">
        <circle cx="14.5" cy="18.2" r="1.7" />
        <circle cx="20" cy="18.2" r="1.7" />
        <circle cx="25.5" cy="18.2" r="1.7" />
      </g>
    </svg>
  );
}
