import { useState } from 'react';
import Brush from '../components/Brush';
import Pip from '../components/Pip';
import Reveal from '../components/Reveal';
import PageHero from '../components/PageHero';
import { SOCIALS } from '../data/site';
import { useContent } from '../content/ContentContext';

const TEME = ['Navijački upit', 'Mediji', 'Partnerstvo', 'Ulaznice', 'Ostalo'];

export default function Kontakt() {
  const { pages, contact, hero } = useContent();
  const [tema, setTema] = useState(TEME[0]);
  const [ime, setIme] = useState('');
  const [poruka, setPoruka] = useState('');

  /**
   * Stranica je statična i nema poslužitelja koji bi primio obrazac, pa
   * gumb otvara e-mail klijent s već popunjenom porukom. Nema lažnog
   * "poslano!" iza kojeg ne stoji ništa.
   */
  const mailto = `mailto:${contact.email}?subject=${encodeURIComponent(
    `${tema}${ime ? ` — ${ime}` : ''}`
  )}&body=${encodeURIComponent(poruka)}`;

  return (
    <>
      <PageHero page={pages['/kontakt']}>
        <div className="phero__actions">
          <a className="btn btn--solid notch-12" href={`mailto:${contact.email}`}>
            {contact.email}
          </a>
          <a className="btn btn--ghost" href={`tel:${contact.phoneHref}`}>
            {contact.phone}
          </a>
        </div>
      </PageHero>

      {/* --- Podaci -------------------------------------------------------- */}
      <section className="slab slab--paper" aria-labelledby="naslov-kontakt">
        <Brush variant="squad-1" />
        <div className="shell">
          <Reveal>
            <span className="eyebrow">Podaci</span>
            <h2 className="section-title" id="naslov-kontakt">
              Gdje smo
            </h2>
          </Reveal>

          <div className="contact">
            <Reveal className="contact__card notch-br-20" variant="left">
              <span className="contact__label">Dvorana</span>
              <p className="contact__value">
                {contact.address.map((line, i) => (
                  <span key={line}>
                    {line}
                    {i < contact.address.length - 1 && <br />}
                  </span>
                ))}
              </p>
              <span className="contact__note">{hero.venue}</span>
            </Reveal>

            <Reveal className="contact__card notch-br-20" delay={110}>
              <span className="contact__label">E-mail</span>
              <a className="contact__link" href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
              <span className="contact__note">Upiti navijača, medija i partnera</span>
            </Reveal>

            <Reveal className="contact__card notch-br-20" delay={220} variant="right">
              <span className="contact__label">Telefon</span>
              <a className="contact__link" href={`tel:${contact.phoneHref}`}>
                {contact.phone}
              </a>
              <span className="contact__note">Klupski broj</span>
            </Reveal>
          </div>

          <div className="socials">
            <span className="socials__label">Društvene mreže</span>
            <div className="socials__list">
              {SOCIALS.map((s) => (
                <span className="socials__item" key={s.id}>
                  <Pip /> {s.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- Poruka klubu -------------------------------------------------- */}
      <section className="slab slab--dark" aria-labelledby="naslov-poruka">
        <div className="scanlines scanlines--wide" aria-hidden="true" />
        <Brush variant="league-1" />

        <div className="shell split">
          <Reveal variant="left" className="split__main">
            <span className="eyebrow eyebrow--sky">Piši nam</span>
            <h2 className="section-title section-title--light" id="naslov-poruka">
              Javi se klubu
            </h2>
            <p className="prose">
              Ispuni polja i gumb će otvoriti tvoj e-mail s već pripremljenom porukom.
              Odgovaramo u pravilu unutar par radnih dana.
            </p>

            <div className="form">
              <div className="field">
                <span className="field__label">Tema</span>
                <div className="chips chips--tight">
                  {TEME.map((t) => (
                    <button
                      type="button"
                      key={t}
                      className={`chip chip--sm${t === tema ? ' is-on' : ''}`}
                      aria-pressed={t === tema}
                      onClick={() => setTema(t)}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <label className="field">
                <span className="field__label">Ime i prezime</span>
                <input
                  className="field__input"
                  type="text"
                  value={ime}
                  onChange={(e) => setIme(e.target.value)}
                  placeholder="Tvoje ime"
                />
              </label>

              <label className="field">
                <span className="field__label">Poruka</span>
                <textarea
                  className="field__input field__input--area"
                  rows={5}
                  value={poruka}
                  onChange={(e) => setPoruka(e.target.value)}
                  placeholder="O čemu se radi?"
                />
              </label>

              <a className="btn btn--solid notch-12" href={mailto}>
                Otvori e-mail ↗
              </a>
            </div>
          </Reveal>

          <Reveal variant="right" delay={130} className="split__side">
            <div className="mapcard notch-br-22">
              <div className="mapcard__grid" aria-hidden="true" />
              <Brush variant="map" />
              <div className="mapcard__body">
                <span className="mapcard__label">Dvorana Zrinjevac</span>
                <p className="mapcard__addr">
                  {contact.address[1]}
                  <br />
                  {contact.address[2]}
                </p>
                <a
                  className="mapcard__link"
                  href="https://www.openstreetmap.org/search?query=Zrinjevac%2011%2C%2031000%20Osijek"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Otvori kartu ↗
                </a>
              </div>
            </div>

            <p className="slab__foot slab__foot--light">
              <Pip tone="sky" /> Za dogovor termina snimanja i intervjua javi se e-mailom
              barem dan ranije.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
