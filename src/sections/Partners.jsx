import { Link } from 'react-router-dom';
import Brush from '../components/Brush';
import Reveal from '../components/Reveal';
import { PARTNER_COUNTS, PARTNER_ROWS, CONTACT_PATH } from '../data/site';
import { useContent } from '../content/ContentContext';

export default function Partners() {
  const { images } = useContent();

  return (
    <section className="partners" aria-labelledby="naslov-partneri">
      <Brush variant="partners-1" />
      <Brush variant="partners-2" />

      <div className="partners__head">
        <Reveal style={{ position: 'relative' }}>
          <Brush variant="partners-head" />
          <span className="eyebrow" style={{ position: 'relative' }}>
            Uz nas su
          </span>
          <h2 className="partners__title" id="naslov-partneri">
            Partneri kluba
          </h2>
        </Reveal>

        <div className="partners__counts">
          {PARTNER_COUNTS.map((count, i) => (
            <Reveal key={count.label} delay={i * 100}>
              <span className="partners__count-n">{count.value}</span>
              <span className="partners__count-l">{count.label}</span>
            </Reveal>
          ))}
          <Reveal variant="right" delay={220}>
            <Link className="link-underline" to={CONTACT_PATH}>
              Postani partner →
            </Link>
          </Reveal>
        </div>
      </div>

      <div className="headline-partner">
        <Reveal variant="scale" className="headline-partner__card notch-br-22">
          <div className="headline-partner__edge" aria-hidden="true" />
          <img
            className="headline-partner__logo"
            src={images.kandit}
            alt="Kandit — glavni partner kluba"
          />
          <div className="headline-partner__copy">
            <span className="eyebrow eyebrow--sm">Glavni partner kluba</span>
            <p>
              Kandit je naziv sponzor kluba — ime koje stoji uz Osijek u imenu MNK
              Osijek Kandit.
            </p>
          </div>
        </Reveal>
      </div>

      {/* Logotipi ostalih partnera još nisu isporučeni. */}
      <div className="partner-rows" aria-hidden="true">
        {PARTNER_ROWS.map((row) => (
          <div className={`partner-row partner-row--${row.modifier}`} key={row.id}>
            <span className="partner-row__tag">{row.tag}</span>
            <div className="partner-row__strip">
              <div className="partner-row__track">
                {Array.from({ length: row.count }, (_, i) => (
                  <span className="partner-row__cell" key={i}>
                    <img src={images.kandit} alt="" loading="lazy" />
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
