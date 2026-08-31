import { Link } from 'react-router-dom';
import Brush from '../components/Brush';
import Pip from '../components/Pip';
import Reveal from '../components/Reveal';
import ProductCard from '../components/ProductCard';
import { useContent } from '../content/ContentContext';

/**
 * Klub nema vlastitu naplatu — sekcija vodi na SalaSport. Zato ovdje nema
 * ni izmišljenih cijena ni gumba za košaricu koji ništa ne radi.
 */
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
              Cijeli Fan Shop →
            </Link>
          </Reveal>
        </div>

        <div className="product-grid product-grid--dark">
          {shop.products.slice(0, 4).map((product, i) => (
            <ProductCard product={product} index={i} key={product.id ?? product.href} />
          ))}
        </div>

        <div className="shop__perks">
          <Reveal as="span" className="shop__perk" delay={0}>
            <Pip size="md" tone="sky" />
            {shop.note}
          </Reveal>
          <Reveal
            as="a"
            className="shop__perk shop__perk--link"
            delay={110}
            href={shop.searchUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Pip size="md" tone="sky" />
            salasport.hr ↗
          </Reveal>
        </div>
      </div>
    </section>
  );
}
