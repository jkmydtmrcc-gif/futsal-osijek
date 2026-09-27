/**
 * Fotografija istaknute novosti, s pričuvom.
 *
 * Bez ove pričuve je `<img src="">` završio u DOM-u čim bi novost u bazi
 * ostala bez fotografije. To nije samo prazan okvir: prazan `src` neki
 * preglednici tumače kao adresu same stranice i skinu je ponovno.
 *
 * Umjesto toga stoji klupska ploha s grbom — ista kakvu nosi kartica
 * artikla bez fotografije, pa stranica ima jedan jezik za „slike još nema“.
 */
export default function FeaturePhoto({ src, alt }) {
  if (src) {
    return <img className="feature__photo" src={src} alt={alt} loading="lazy" />;
  }

  return (
    <span className="feature__photo feature__plate" aria-hidden="true">
      <img src="/grb.webp" alt="" loading="lazy" />
    </span>
  );
}
