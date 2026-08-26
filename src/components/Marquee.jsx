/**
 * Traka koja beskonačno klizi.
 *
 * Animacija pomiče stazu za -50%, pa se popis mora prikazati dvaput —
 * udvostručavanje je ovdje, da se pozivatelj time ne mora baviti.
 */
export default function Marquee({
  items,
  children,
  className = '',
  trackClassName = '',
  faded = false,
}) {
  const doubled = [...items, ...items];

  return (
    <div className={`marquee ${faded ? 'marquee--faded' : ''} ${className}`.trim()} aria-hidden="true">
      <div className={`marquee__track ${trackClassName}`.trim()}>
        {doubled.map((item, index) => children(item, index))}
      </div>
    </div>
  );
}
