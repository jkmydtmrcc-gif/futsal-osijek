import Meta from '../components/Meta';
import { useContent } from '../lib/content';
import Hero from '../sections/Hero';
import News from '../sections/News';
import Squad from '../sections/Squad';
import League from '../sections/League';
import Venue from '../sections/Venue';
import Shop from '../sections/Shop';

/**
 * Naslovnica.
 *
 * Redoslijed: heroj, novosti, momčad, tablica i raspored, Fan Shop.
 * `Venue` je fotografija dvorane koja razdvaja tablicu od trgovine.
 *
 * Traka s klupskim brojkama (`Impact`) je maknuta: 2002. · 1.160 · 2. ·
 * 2024/25 ponavljale su ono što već piše u heroju i nisu se mijenjale
 * godinama. Na tom mjestu sada stoji traka s utakmicom, odmah ispod
 * zaglavlja — klupska stranica ondje ima utakmicu, ne godinu osnutka.
 * Partneri i podnožje dolaze iz okvira stranice (`App.jsx`), pa su na svakoj
 * stranici isti.
 */
export default function Naslovnica() {
  const { hero, images } = useContent();

  return (
    <>
      <Meta description={hero.slogan} image={images.celebration} />
      <Hero />
      <News />
      <Squad />
      <League />
      <Venue />
      <Shop />
    </>
  );
}
