/**
 * Pločica artikla bez fotografije.
 *
 * Fotografije artikala stoje kod SalaSporta i ne preuzimaju se, pa dok klub
 * ne postavi svoju, kartica pokaže grb kao vodeni žig. Prije je na tom
 * mjestu stajao nacrtani dres — izgledao je kao sličica iz zbirke ikona, a
 * ne kao proizvod kluba. Kategorija se ne ponavlja ovdje: piše odmah ispod,
 * u tijelu kartice.
 */
export default function ProductPlaceholder() {
  return (
    <span className="ppl" aria-hidden="true">
      <img className="ppl__grb" src="/grb.webp" alt="" loading="lazy" />
    </span>
  );
}
