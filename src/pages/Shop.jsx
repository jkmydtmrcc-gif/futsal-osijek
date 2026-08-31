import { useMemo, useState } from 'react';
import Brush from '../components/Brush';
import Pip from '../components/Pip';
import Reveal from '../components/Reveal';
import PageHero from '../components/PageHero';
import ProductCard from '../components/ProductCard';
import ProductArt from '../components/ProductArt';
import { useContent } from '../content/ContentContext';

const SVE = 'Sve';

/** Prezime na dresu ide velikim slovima i bez dijakritike koja se ne tiska loše. */
function tidy(value) {
  return value.toLocaleUpperCase('hr-HR').slice(0, 14);
}

/**
 * Fan Shop je razdjelnik prema SalaSportu — klub nema vlastitu naplatu.
 * Cijene i dostupnost stoje kod trgovine, pa se ovdje ne prepisuju dok ih
 * netko ne upiše u administraciji: prepisani podaci zastare i onda lažu.
 */
export default function Shop() {
  const { shop, players, pages } = useContent();
  const [filter, setFilter] = useState(SVE);
  const [name, setName] = useState(shop.custom.defaultName);
  const [number, setNumber] = useState(shop.custom.defaultNumber);

  const cats = useMemo(() => {
    const seen = [];
    shop.products.forEach((p) => {
      if (p.cat && !seen.includes(p.cat)) seen.push(p.cat);
    });
    return [SVE, ...seen];
  }, [shop.products]);

  const shown = useMemo(
    () => (filter === SVE ? shop.products : shop.products.filter((p) => p.cat === filter)),
    [shop.products, filter]
  );

  return (
    <>
      <PageHero page={pages['/shop']}>
        <div className="phero__actions">
          <a
            className="btn btn--solid notch-12"
            href={shop.searchUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Sve za Kandit na salasport.hr ↗
          </a>
          <a className="btn btn--ghost" href={shop.url} target="_blank" rel="noopener noreferrer">
            Cijela trgovina
          </a>
        </div>
      </PageHero>

      {/* --- Artikli ------------------------------------------------------ */}
      <section className="slab slab--paper" aria-labelledby="naslov-artikli">
        <Brush variant="squad-1" />
        <Brush variant="squad-2" />

        <div className="shell">
          <div className="section-head">
            <Reveal>
              <span className="eyebrow">Artikli</span>
              <h2 className="section-title" id="naslov-artikli">
                Oprema kluba
              </h2>
            </Reveal>
            <Reveal variant="right" delay={120}>
              <a
                className="link-underline"
                href={shop.searchUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Otvori u trgovini →
              </a>
            </Reveal>
          </div>

          <Reveal className="chips" delay={80} role="group" aria-label="Filtriranje po kategoriji">
            {cats.map((c) => (
              <button
                type="button"
                key={c}
                className={`chip${c === filter ? ' is-on' : ''}`}
                aria-pressed={c === filter}
                onClick={() => setFilter(c)}
              >
                {c}
              </button>
            ))}
          </Reveal>

          <div className="product-grid">
            {shown.map((product, i) => (
              <ProductCard product={product} index={i} key={product.id ?? product.href} />
            ))}
          </div>

          {shown.length === 0 && (
            <p className="slab__foot">
              <Pip /> U ovoj kategoriji trenutno nema artikala.
            </p>
          )}
        </div>
      </section>

      {/* --- Dres s imenom ----------------------------------------------- */}
      <section className="slab slab--blue custom" aria-labelledby="naslov-personalizacija">
        <div className="scanlines scanlines--shop" aria-hidden="true" />
        <Brush variant="shop-1" />
        <Brush variant="shop-2" />

        <div className="shell custom__inner">
          <Reveal variant="left" className="custom__form">
            <span className="eyebrow eyebrow--sky">{shop.custom.eyebrow}</span>
            <h2 className="section-title section-title--light" id="naslov-personalizacija">
              {shop.custom.title}
            </h2>
            <p className="prose prose--light">{shop.custom.lead}</p>

            <div className="custom__fields">
              <label className="field">
                <span className="field__label">Prezime</span>
                <input
                  className="field__input"
                  type="text"
                  value={name}
                  maxLength={14}
                  onChange={(e) => setName(tidy(e.target.value))}
                  placeholder="PREZIME"
                />
              </label>
              <label className="field field--sm">
                <span className="field__label">Broj</span>
                <input
                  className="field__input"
                  type="text"
                  inputMode="numeric"
                  value={number}
                  maxLength={2}
                  onChange={(e) => setNumber(e.target.value.replace(/\D/g, '').slice(0, 2))}
                  placeholder="00"
                />
              </label>
            </div>

            <div className="custom__quick">
              <span className="custom__quick-label">Brzi odabir</span>
              <div className="chips chips--tight">
                {players.map((p) => (
                  <button
                    type="button"
                    key={p.name}
                    className="chip chip--sm"
                    onClick={() => {
                      setName(tidy(p.name.split(' ').pop()));
                      setNumber(String(p.number));
                    }}
                  >
                    {p.name.split(' ').pop()} {p.number}
                  </button>
                ))}
              </div>
            </div>

            <a
              className="btn btn--solid notch-12"
              href={shop.custom.href}
              target="_blank"
              rel="noopener noreferrer"
            >
              Naruči na salasport.hr ↗
            </a>
          </Reveal>

          <Reveal variant="right" delay={140} className="custom__preview notch-br-22">
            <ProductArt kind="dres" name={name} number={number} className="product-art--lg" />
            <span className="custom__tag">
              <Pip tone="sky" /> Domaći dres · {name || 'PREZIME'} {number}
            </span>
          </Reveal>
        </div>
      </section>

      {/* --- Kategorije i koraci ------------------------------------------ */}
      <section className="slab" aria-labelledby="naslov-kategorije">
        <div className="shell">
          <Reveal>
            <span className="eyebrow">Kategorije</span>
            <h2 className="section-title" id="naslov-kategorije">
              Sve u trgovini
            </h2>
          </Reveal>

          <div className="shop-grid">
            {shop.categories.map((item, i) => (
              <Reveal
                as="a"
                variant="blur"
                delay={i * 90}
                className="shop-card shop-card--paper notch-br-20"
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

          <div className="steps">
            {shop.steps.map((step, i) => (
              <Reveal className="step" delay={i * 100} key={step.n}>
                <span className="step__n">{step.n}</span>
                <h3 className="step__title">{step.title}</h3>
                <p className="step__note">{step.note}</p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={260}>
            <p className="slab__foot">
              <Pip /> {shop.note}
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
