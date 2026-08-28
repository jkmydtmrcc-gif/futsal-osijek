import { Link } from 'react-router-dom';
import Brush from '../components/Brush';
import Pip from '../components/Pip';
import Reveal from '../components/Reveal';
import { SHOP_LINKS, SHOP_URL, SHOP_NOTE } from '../data/site';

/**
 * Klub nema vlastitu naplatu — sekcija vodi na SalaSport. Zato ovdje nema
 * ni izmišljenih cijena ni gumba za košaricu koji ništa ne radi.
 */
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
            <span className="eyebrow eyebrow--sky">Oprema iz SalaSporta</span>
            <h2 className="shop__title" id="naslov-shop">
              Fan <span className="outline outline--white">Shop</span>
            </h2>
          </Reveal>
          <Reveal variant="right" delay={140}>
            <Link className="link-underline link-underline--light" to="/shop">
              Sve kategorije →
            </Link>
          </Reveal>
        </div>

        <div className="shop-grid">
          {SHOP_LINKS.map((item, i) => (
            <Reveal
              as="a"
              variant="blur"
              delay={i * 90}
              className="shop-card notch-br-20"
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="shop-card__cat">{item.cat}</span>
              <h3 className="shop-card__name">{item.name}</h3>
              <span className="shop-card__note">{item.note}</span>
              <span className="shop-card__go" aria-hidden="true">
                ↗
              </span>
            </Reveal>
          ))}
        </div>

        <div className="shop__perks">
          <Reveal as="span" className="shop__perk" delay={0}>
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
