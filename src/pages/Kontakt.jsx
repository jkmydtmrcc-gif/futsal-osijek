import Brush from '../components/Brush';
import Reveal from '../components/Reveal';
import PageHero from '../components/PageHero';
import { PAGES, CONTACT, VENUE } from '../data/site';

export default function Kontakt() {
  return (
    <>
      <PageHero page={PAGES['/kontakt']} />

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
                {CONTACT.address.map((line, i) => (
                  <span key={line}>
                    {line}
                    {i < CONTACT.address.length - 1 && <br />}
                  </span>
                ))}
              </p>
              <span className="contact__note">{VENUE}</span>
            </Reveal>

            <Reveal className="contact__card notch-br-20" delay={110}>
              <span className="contact__label">E-mail</span>
              <a className="contact__link" href={`mailto:${CONTACT.email}`}>
                {CONTACT.email}
              </a>
              <span className="contact__note">Upiti navijača, medija i partnera</span>
            </Reveal>

            <Reveal className="contact__card notch-br-20" delay={220} variant="right">
              <span className="contact__label">Telefon</span>
              <a className="contact__link" href={`tel:${CONTACT.phoneHref}`}>
                {CONTACT.phone}
              </a>
              <span className="contact__note">Klupski broj</span>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
