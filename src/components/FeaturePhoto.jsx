/**
 * Fotografija objave, s pričuvom.
 *
 * Bez ove pričuve je `<img src="">` završio u DOM-u čim bi novost u bazi
 * ostala bez fotografije. To nije samo prazan okvir: prazan `src` neki
 * preglednici tumače kao adresu same stranice i skinu je ponovno.
 *
 * Umjesto toga stoji klupska ploha s grbom — ista kakvu nosi kartica
 * artikla bez fotografije, pa stranica ima jedan jezik za „slike još nema“.
 *
 * Razred se prosljeđuje jer isto vrijedi i za veliki okvir i za karticu u
 * mreži: dvije veličine, jedno ponašanje.
 */
export default function FeaturePhoto({
  src,
  alt,
  className = 'feature__photo',
  plateClassName = 'feature__plate',
  loading = 'lazy',
}) {
  if (src) {
    return <img className={className} src={src} alt={alt} loading={loading} />;
  }

  return (
    <span className={`${className} ${plateClassName}`} aria-hidden="true">
      <img src="/grb.webp" alt="" loading={loading} />
    </span>
  );
}
