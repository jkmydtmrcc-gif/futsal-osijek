import Meta from '../components/Meta';
import { useContent } from '../lib/content';
import Hero from '../sections/Hero';
import Impact from '../sections/Impact';
import Squad from '../sections/Squad';
import League from '../sections/League';
import Venue from '../sections/Venue';
import Shop from '../sections/Shop';
import News from '../sections/News';

/** Naslovnica — implementacija dizajna Naslovnica.dc.html. */
export default function Naslovnica() {
  const { hero, images } = useContent();

  return (
    <>
      <Meta description={hero.slogan} image={images.celebration} />
      <Hero />
      <Impact />
      <Squad />
      <League />
      <Venue />
      <Shop />
      <News />
    </>
  );
}
