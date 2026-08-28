import Brush from '../components/Brush';
import Pip from '../components/Pip';
import Reveal from '../components/Reveal';
import PageHero from '../components/PageHero';
import { PAGES, SHOP_LINKS, SHOP_NOTE, SHOP_URL } from '../data/site';

/**
 * Fan Shop je razdjelnik prema SalaSportu — klub nema vlastitu naplatu.
 * Cijene i dostupnost stoje kod trgovine, pa se ovdje namjerno ne prepisuju:
 * prepisani podaci zastare i onda lažu.
 */
export default function Shop() {
  return (
    <>
      <PageHero page={PAGES['/shop']}>
        <a className="btn btn--solid notch-12" href={SHOP_URL} target="_blank" rel="noopener noreferrer">
          Otvori salasport.hr ↗
        </a>
      </PageHero>

      <section className="slab slab--blue" aria-labelledby="naslov-shop">
        <div className="scanlines scanlines--shop" aria-hidden="true" />
        <Brush variant="shop-1" />
        <Brush variant="shop-2" />

        <div className="shell">
          <Reveal>
            <span className="eyebrow eyebrow--sky">Kategorije</span>
            <h2 className="section-title section-title--light" id="naslov-shop">
              Što te zanima
            </h2>
          </Reveal>

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

          <Reveal delay={260}>
            <p className="slab__foot slab__foot--light">
              <Pip tone="sky" /> {SHOP_NOTE}
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
