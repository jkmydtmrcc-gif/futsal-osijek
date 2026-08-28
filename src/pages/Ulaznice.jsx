import { Link } from 'react-router-dom';
import Brush from '../components/Brush';
import Pip from '../components/Pip';
import Reveal from '../components/Reveal';
import PageHero from '../components/PageHero';
import { PAGES, CONTACT, CONTACT_PATH, IMAGES } from '../data/site';

/**
 * Klub nema online prodaju ulaznica koju bismo ovdje mogli vezati, pa
 * stranica ne izmišlja cijene ni kupovni tok — daje podatke o dvorani i
 * upućuje na klub.
 */
export default function Ulaznice() {
  return (
    <>
      <PageHero page={PAGES['/ulaznice']} />

      <section className="slab slab--paper" aria-labelledby="naslov-ulaznice">
        <Brush variant="squad-2" />
        <div className="shell split">
          <Reveal variant="left" className="split__main">
            <span className="eyebrow">Dolazak</span>
            <h2 className="section-title" id="naslov-ulaznice">
              Budi na tribini
            </h2>
            <p className="prose">
              Domaće utakmice igraju se u Športskoj dvorani Zrinjevac na adresi{' '}
              {CONTACT.address[1]}, {CONTACT.address[2]}. Dvorana prima 1.160 gledatelja.
            </p>
            <p className="prose">
              Za ulaznice, grupne dolaske i najave gostujućih navijača javi se klubu —
              termine objavljujemo kad HMNL potvrdi raspored kola.
            </p>
            <div className="hero__actions">
              <a className="btn btn--solid notch-12" href={`mailto:${CONTACT.email}`}>
                {CONTACT.email}
              </a>
              <Link className="btn btn--ghost btn--ink" to={CONTACT_PATH}>
                Svi kontakti
              </Link>
            </div>
          </Reveal>

          <Reveal variant="right" delay={130} className="split__side">
            <img
              className="split__img notch-br-22"
              src={IMAGES.celebration}
              alt="Navijači na tribini dvorane Zrinjevac"
              loading="lazy"
            />
            <p className="slab__foot">
              <Pip /> Zrinjevac · 1.160 mjesta
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
