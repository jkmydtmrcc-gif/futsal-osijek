import Brush from '../components/Brush';
import Pip from '../components/Pip';
import Reveal from '../components/Reveal';
import PageHero from '../components/PageHero';
import ArtikliMreza from '../components/ArtikliMreza';
import { useContent } from '../lib/content';
import { PAGES, SHOP_NOTE, SHOP_URL } from '../data/site';

/**
 * Fan Shop je razdjelnik prema SalaSportu — klub nema vlastitu naplatu.
 * Artikli se uređuju u adminu; cijena je slobodan tekst jer klub ne vodi
 * cjenik, nego prepisuje ono što piše u trgovini.
 */
export default function Shop() {
  const { shop } = useContent();

  return (
    <>
      <PageHero page={PAGES['/shop']}>
        <a className="btn btn--solid notch-12" href={SHOP_URL} target="_blank" rel="noopener noreferrer">
          Otvori salasport.hr ↗
        </a>
      </PageHero>

      <section className="slab slab--blue" aria-labelledby="naslov-artikli">
        <div className="scanlines scanlines--shop" aria-hidden="true" />
        <Brush variant="shop-1" />
        <Brush variant="shop-2" />

        <div className="shell">
          <Reveal>
            <span className="eyebrow eyebrow--sky">Ponuda</span>
            <h2 className="section-title section-title--light" id="naslov-artikli">
              Artikli
            </h2>
          </Reveal>

          <ArtikliMreza artikli={shop} />

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
