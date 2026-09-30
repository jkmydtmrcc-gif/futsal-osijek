import { useState } from 'react';
import { Link } from 'react-router-dom';
import Pip from '../components/Pip';
import Reveal, { stupnjevito } from '../components/Reveal';
import PageHero from '../components/PageHero';
import { CONTACT_PATH } from '../data/site';
import { useContent } from '../lib/content';

/**
 * Klub nema online prodaju ulaznica koju bismo ovdje mogli vezati, pa
 * stranica ne izmišlja cijene ni kupovni tok — daje podatke o dvorani,
 * odgovara na česta pitanja i upućuje na klub.
 */
export default function Ulaznice() {
  const { pages, contact, images, tickets, league } = useContent();
  const [open, setOpen] = useState(0);

  return (
    <>
      <PageHero page={pages['/ulaznice']} grafika={images.artUlaznice}>
        <div className="phero__actions">
          <a className="btn btn--solid" href={`mailto:${contact.email}`}>
            Rezerviraj e-mailom
          </a>
          <Link className="btn btn--ghost" to="/raspored">
            Raspored utakmica
          </Link>
        </div>
      </PageHero>

      {/* --- Dvorana ------------------------------------------------------- */}
      <section className="slab slab--paper" aria-labelledby="naslov-ulaznice">
        <div className="shell split">
          <Reveal variant="left" className="split__main">
            <span className="eyebrow">Dolazak</span>
            <h2 className="section-title" id="naslov-ulaznice">
              Budi na tribini
            </h2>
            <p className="prose">
              Domaće utakmice igraju se u Športskoj dvorani Zrinjevac na adresi{' '}
              {contact.address[1]}, {contact.address[2]}. Dvorana prima 1.160 gledatelja.
            </p>
            <p className="prose">
              Za ulaznice, grupne dolaske i najave gostujućih navijača javi se klubu —
              termine objavljujemo kad HMNL potvrdi raspored kola.
            </p>

            <div className="infolist">
              {tickets.info.map((row, i) => (
                <Reveal className="infolist__row" delay={stupnjevito(i, 80, 3)} key={row.label}>
                  <span className="infolist__label">{row.label}</span>
                  <span className="infolist__value">{row.value}</span>
                </Reveal>
              ))}
            </div>

            <div className="btn-row">
              <a className="btn btn--blue" href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
              <Link className="btn btn--ghost btn--ink" to={CONTACT_PATH}>
                Svi kontakti
              </Link>
            </div>
          </Reveal>

          <Reveal variant="right" delay={130} className="split__side">
            <img
              className="split__img"
              src={images.celebration}
              alt="Navijači na tribini dvorane Zrinjevac"
              loading="lazy"
            />
            <p className="slab__foot">
              <Pip /> Zrinjevac · 1.160 mjesta
            </p>
          </Reveal>
        </div>
      </section>

      {/* --- Nadolazeće utakmice ------------------------------------------- */}
      {league.fixtures.length > 0 && (
        <section className="slab slab--dark" aria-labelledby="naslov-termini">

          <div className="shell">
            <div className="section-head">
              <Reveal>
                <span className="eyebrow eyebrow--sky">Termini</span>
                <h2 className="section-title section-title--light" id="naslov-termini">
                  Sljedeće na Zrinjevcu
                </h2>
              </Reveal>
              <Reveal variant="right" delay={120}>
                <Link className="link-underline link-underline--light" to="/raspored">
                  Cijeli raspored →
                </Link>
              </Reveal>
            </div>

            <Reveal className="fixtures fixtures--row">
              {league.fixtures.map((f) => (
                <div className="fixture" key={f.title}>
                  <div className="fixture__meta">
                    <span className="fixture__when">{f.when}</span>
                    <Pip size="sm" />
                    <span className="fixture__comp">{f.comp}</span>
                  </div>
                  <h3 className="fixture__title">{f.title}</h3>
                  <span className="fixture__venue">{f.venue}</span>
                </div>
              ))}
            </Reveal>
          </div>
        </section>
      )}

      {/* --- Česta pitanja -------------------------------------------------- */}
      <section className="slab" aria-labelledby="naslov-pitanja">
        <div className="shell">
          <Reveal>
            <span className="eyebrow">Pitanja</span>
            <h2 className="section-title" id="naslov-pitanja">
              Često pitano
            </h2>
          </Reveal>

          <div className="faq">
            {tickets.faq.map((row, i) => (
              <Reveal className={`faq__item${open === i ? ' is-open' : ''}`} delay={stupnjevito(i, 80, 3)} key={row.q}>
                <button
                  type="button"
                  className="faq__q"
                  aria-expanded={open === i}
                  onClick={() => setOpen(open === i ? -1 : i)}
                >
                  <span>{row.q}</span>
                  <span className="faq__sign" aria-hidden="true">
                    {open === i ? '−' : '+'}
                  </span>
                </button>
                {open === i && <p className="faq__a">{row.a}</p>}
              </Reveal>
            ))}
          </div>

          <Reveal delay={280}>
            <p className="slab__foot">
              <Pip /> Nema odgovora na tvoje pitanje?{' '}
              <Link className="link-inline" to={CONTACT_PATH}>
                Javi se klubu
              </Link>
              .
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
