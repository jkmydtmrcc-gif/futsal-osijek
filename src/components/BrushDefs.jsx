/**
 * SVG filteri koji svim `.brush` elementima daju izgled poteza kistom.
 * Renderiraju se jednom, na vrhu stranice; elementi ih dohvaćaju po id-u.
 */
export default function BrushDefs() {
  return (
    <svg className="brush-defs" width="0" height="0" aria-hidden="true" focusable="false">
      <filter id="brush-a" x="-30%" y="-70%" width="160%" height="240%">
        <feTurbulence type="fractalNoise" baseFrequency="0.0035 0.055" numOctaves="4" seed="11" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="34" xChannelSelector="R" yChannelSelector="G" result="d" />
        <feGaussianBlur in="d" stdDeviation="1.1" result="b" />
        <feComponentTransfer in="b">
          <feFuncA type="table" tableValues="0 0.05 0.5 0.9 1" />
        </feComponentTransfer>
      </filter>

      <filter id="brush-b" x="-30%" y="-70%" width="160%" height="240%">
        <feTurbulence type="fractalNoise" baseFrequency="0.006 0.08" numOctaves="3" seed="23" result="n2" />
        <feDisplacementMap in="SourceGraphic" in2="n2" scale="26" xChannelSelector="R" yChannelSelector="G" result="d" />
        <feGaussianBlur in="d" stdDeviation="0.9" result="b" />
        <feComponentTransfer in="b">
          <feFuncA type="table" tableValues="0 0.12 0.65 1" />
        </feComponentTransfer>
      </filter>

      <filter id="brush-c" x="-30%" y="-90%" width="160%" height="280%">
        <feTurbulence type="fractalNoise" baseFrequency="0.0025 0.07" numOctaves="3" seed="41" result="n3" />
        <feDisplacementMap in="SourceGraphic" in2="n3" scale="30" xChannelSelector="R" yChannelSelector="G" result="d" />
        <feGaussianBlur in="d" stdDeviation="1.6" result="b" />
        <feComponentTransfer in="b">
          <feFuncA type="table" tableValues="0 0.08 0.4 0.7" />
        </feComponentTransfer>
      </filter>
    </svg>
  );
}
