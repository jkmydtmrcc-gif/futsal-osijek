import { Link } from 'react-router-dom';
import Brush from '../components/Brush';
import Pip from '../components/Pip';
import Reveal from '../components/Reveal';
import { PRODUCTS, SHOP_PERKS } from '../data/site';

export default function Shop() {
  return (
    <section className="shop" id="shop" aria-labelledby="naslov-shop">
      <div className="scanlines scanlines--shop" aria-hidden="true" />
      <Brush variant="shop-1" />
      <Brush variant="shop-2" />
      <Brush variant="shop-3" />

      <div className="shell">
        <div className="section-head">
          <Reveal>
            <span className="eyebrow eyebrow--sky">Službena klupska oprema</span>
            <h2 className="shop__title" id="naslov-shop">
              Fan <span className="outline outline--white">Shop</span>
            </h2>
          </Reveal>
          <Reveal variant="right" delay={140}>
            <Link className="link-underline link-underline--light" to="/shop">
              Svi proizvodi →
            </Link>
          </Reveal>
        </div>

        <div className="shop__grid">
          {PRODUCTS.map((product, i) => (
            <Reveal
              as="article"
              variant="blur"
              delay={i * 90}
              className="product notch-br-20"
              key={product.name}
            >
              {/* Fotografije artikala još nisu isporučene. */}
              <div className="product__shot">
                <div className="product__wash" aria-hidden="true" />
                <span className="product__placeholder" aria-hidden="true">
                  [ {product.slot} ]
                </span>
                {product.tag && <span className="product__tag">{product.tag}</span>}
              </div>
              <div className="product__body">
                <span className="product__cat">{product.cat}</span>
                <h3 className="product__name">{product.name}</h3>
                <div className="product__price-wrap">
                  <span className="product__price-wash" aria-hidden="true" />
                  <span className="product__price">{product.price}</span>
                </div>
                <button type="button" className="product__btn">
                  Dodaj u košaricu
                </button>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="shop__perks">
          {SHOP_PERKS.map((perk, i) => (
            <Reveal as="span" className="shop__perk" delay={i * 100} key={perk}>
              <Pip size="md" tone="sky" />
              {perk}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
