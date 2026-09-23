import { Link } from 'react-router-dom';
import Brush from '../components/Brush';
import Reveal from '../components/Reveal';
import { CONTACT_PATH } from '../data/site';
import { useContent } from '../lib/content';

/**
 * Sponzori u razinama: glavni, gold, podupiratelji.
 *
 * Pločica pokaže logotip kad postoji, a kad ne — ime sponzora ispisano.
 * Namjerno se ne podmeće tuđi logotip kao zamjena: to je izgledalo kao da
 * klub ima osamnaest istih sponzora.
 */
function SponsorCell({ sponsor, size }) {
  const inner = sponsor.logo ? (
    <img src={sponsor.logo} alt={sponsor.name} loading="lazy" />
  ) : (
    <span className="sponsor__name">{sponsor.name}</span>
  );

  const className = `sponsor sponsor--${size}${sponsor.logo ? ' has-logo' : ''}`;

  if (sponsor.href) {
    return (
      <a className={className} href={sponsor.href} target="_blank" rel="noopener noreferrer">
        {inner}
        {sponsor.note && <span className="sponsor__note">{sponsor.note}</span>}
      </a>
    );
  }

  return (
    <div className={className}>
      {inner}
      {sponsor.note && <span className="sponsor__note">{sponsor.note}</span>}
    </div>
  );
}

export default function Partners() {
  const { sponsors } = useContent();

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
          {sponsors.counts.map((count, i) => (
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

      <div className="tiers">
        {sponsors.tiers
          .filter((tier) => tier.sponsors.length > 0)
          .map((tier, t) => (
            <Reveal className={`tier tier--${tier.size}`} delay={t * 90} key={tier.id}>
              <div className="tier__head">
                <span className="tier__tag">{tier.tag}</span>
                <span className="tier__line" aria-hidden="true" />
              </div>

              <div className="tier__grid">
                {tier.sponsors.map((sponsor, i) => (
                  <Reveal
                    as="div"
                    variant="scale"
                    delay={i * 45}
                    key={`${sponsor.name}-${i}`}
                    className="tier__cell"
                  >
                    <SponsorCell sponsor={sponsor} size={tier.size} />
                  </Reveal>
                ))}
              </div>
            </Reveal>
          ))}
      </div>
    </section>
  );
}
