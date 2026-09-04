import { Link } from 'react-router-dom';
import Brush from '../components/Brush';
import Pip from '../components/Pip';
import Reveal from '../components/Reveal';
import ArtikliMreza from '../components/ArtikliMreza';
import { useContent } from '../lib/content';
import { SHOP_URL, SHOP_NOTE } from '../data/site';

export default function Shop() {
  const { shop } = useContent();

  return (
    <section className="shop" id="shop" aria-labelledby="naslov-shop">
      <div className="scanlines scanlines--shop" aria-hidden="true" />
      <Brush variant="shop-1" />
      <Brush variant="shop-2" />
      <Brush variant="shop-3" />

      <div className="shell">
        <div className="section-head">
          <Reveal>
            <span className="eyebrow eyebrow--sky">Oprema iz SalaSporta</span>
            <h2 className="shop__title" id="naslov-shop">
              Fan <span className="outline outline--white">Shop</span>
            </h2>
          </Reveal>
          <Reveal variant="right" delay={140}>
            <Link className="link-underline link-underline--light" to="/shop">
              Svi artikli →
            </Link>
          </Reveal>
        </div>

        <ArtikliMreza artikli={shop.slice(0, 4)} />

        <div className="shop__perks">
          <Reveal as="span" className="shop__perk">
            <Pip size="md" tone="sky" />
            {SHOP_NOTE}
          </Reveal>
          <Reveal as="a" className="shop__perk shop__perk--link" delay={110}
            href={SHOP_URL} target="_blank" rel="noopener noreferrer">
            <Pip size="md" tone="sky" />
            salasport.hr ↗
          </Reveal>
        </div>
      </div>
    </section>
  );
}
