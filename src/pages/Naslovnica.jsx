import Meta from '../components/Meta';
import { useContent } from '../lib/content';
import Hero from '../sections/Hero';
import Impact from '../sections/Impact';
import News from '../sections/News';
import Squad from '../sections/Squad';
import League from '../sections/League';
import Venue from '../sections/Venue';
import Shop from '../sections/Shop';

/**
 * Naslovnica.
 *
 * Redoslijed: heroj, novosti, momčad, tablica i raspored, Fan Shop.
 * `Impact` je uska traka s brojkama i drži se heroja kao njegov podnožak,
 * a `Venue` je fotografija dvorane koja razdvaja tablicu od trgovine.
 * Partneri i podnožje dolaze iz okvira stranice (`App.jsx`), pa su na svakoj
 * stranici isti.
 */
export default function Naslovnica() {
  const { hero, images } = useContent();

  return (
    <>
      <Meta description={hero.slogan} image={images.celebration} />
      <Hero />
      <Impact />
      <News />
      <Squad />
      <League />
      <Venue />
      <Shop />
    </>
  );
}
