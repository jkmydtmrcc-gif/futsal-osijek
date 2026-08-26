/**
 * Dekorativni potez kistom. Položaj, boja i filter dolaze iz klase
 * `.brush--{variant}` u styles.css — ovdje se bira samo koja se koristi.
 */
export default function Brush({ variant, className = '' }) {
  return <div className={`brush brush--${variant} ${className}`.trim()} aria-hidden="true" />;
}
