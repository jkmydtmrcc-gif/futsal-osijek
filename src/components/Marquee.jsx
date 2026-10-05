/**
 * Traka koja beskonačno klizi.
 *
 * Animacija pomiče stazu za -50%, pa se popis mora prikazati dvaput —
 * udvostručavanje je ovdje, da se pozivatelj time ne mora baviti.
 *
 * `children(item, index, kopija)`: treći argument je `true` za drugu
 * polovicu. Pozivatelj ga može iskoristiti da kopije sakrije ondje gdje se
 * traka ne pomiče (uz „smanji pokrete"), jer bi inače svaki logotip stajao
 * dvaput.
 *
 * `reverse` okreće smjer, a `trackStyle` dopušta zadano trajanje kruga.
 */
export default function Marquee({
  items,
  children,
  className = '',
  trackClassName = '',
  trackStyle,
  reverse = false,
  faded = false,
}) {
  const doubled = [...items, ...items];

  return (
    <div className={`marquee ${faded ? 'marquee--faded' : ''} ${className}`.trim()} aria-hidden="true">
      <div
        className={`marquee__track${reverse ? ' marquee__track--right' : ''} ${trackClassName}`.trim()}
        style={trackStyle}
      >
        {doubled.map((item, index) => children(item, index, index >= items.length))}
      </div>
    </div>
  );
}
