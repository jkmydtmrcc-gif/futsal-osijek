import { Link } from 'react-router-dom';
import Reveal from '../components/Reveal';
import Marquee from '../components/Marquee';
import { CONTACT_PATH } from '../data/site';
import { useContent } from '../lib/content';
import {
  razvrstajRazine,
  jePodupiratelj,
  razdijeliNaRedove,
  smjerReda,
  popuniTraku,
  trajanjeTrake,
  SIRINA_CELIJE,
} from '../lib/sponzori';

/**
 * Sponzori u razinama: glavni, gold, podupiratelji.
 *
 * Pločica pokaže logotip kad postoji, a kad ne — ime sponzora ispisano.
 * Namjerno se ne podmeće tuđi logotip kao zamjena: to je izgledalo kao da
 * klub ima osamnaest istih sponzora.
 */
function SponsorCell({ sponsor, size, eager = false }) {
  /* Logotip stoji u okviru stalne visine i s razmakom oko sebe, a unutra se
     smanjuje da stane (`contain`) — nikad se ne reže ni razvlači. Tako široki
     i uspravni logotipi dobivaju isti prostor, pa kartice izgledaju kao niz, a
     ne kao zbirka različitih komada. */
  const inner = sponsor.logo ? (
    <span className="sponsor__logo">
      <img src={sponsor.logo} alt={sponsor.name} loading={eager ? 'eager' : 'lazy'} />
    </span>
  ) : (
    <span className="sponsor__logo">
      <span className="sponsor__name">{sponsor.name}</span>
    </span>
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

/**
 * Nevidljiv popis poveznica za čitače ekrana.
 *
 * Traka je ukras i `Marquee` je skriva — uz to da svakog sponzora prikazuje
 * dvaput. Zato isti popis, jednom, stoji i kao običan popis.
 */
function PopisZaCitace({ sponsors }) {
  return (
    <ul className="sr-only">
      {sponsors.map((sponsor, i) => (
        <li key={`${sponsor.name}-${i}-a11y`}>
          {sponsor.href ? (
            <a href={sponsor.href} target="_blank" rel="noopener noreferrer">
              {sponsor.name}
            </a>
          ) : (
            sponsor.name
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * Jedan red karusela.
 *
 * Trajanje se računa iz puta, a ne zadaje fiksno: red s više logotipa bi
 * inače klizio brže od kraćeg. Brzina se razlikuje tek malo među redovima
 * (`brzina`), da ne idu u koraku.
 */
function Traka({ sponsors, size, smjer, brzina = 36 }) {
  const cell = SIRINA_CELIJE[size] ?? SIRINA_CELIJE.md;
  const stavke = popuniTraku(sponsors, cell);

  return (
    <Marquee
      items={stavke}
      className="tier__rail"
      trackClassName={`tier__track tier__track--${size}`}
      trackStyle={{
        '--celija': `${cell}px`,
        animationDuration: `${trajanjeTrake(stavke.length, cell, 12, brzina)}s`,
      }}
      reverse={smjer === 'desno'}
      faded
    >
      {(sponsor, i, kopija) => (
        <span
          className={`tier__cell tier__cell--rail${kopija ? ' tier__cell--kopija' : ''}`}
          key={`${sponsor.name}-${i}`}
        >
          <SponsorCell sponsor={sponsor} size={size} eager />
        </span>
      )}
    </Marquee>
  );
}

/** Svaki red malo drukčijom brzinom, da tri reda ne kližu u koraku. */
const BRZINE = [36, 42, 39];

export default function Partners() {
  const { sponsors, hero } = useContent();

  // Razina bez ijednog sponzora se ne prikazuje. Prazna razina s natpisom
  // „Gold sponzori“ i ničim ispod izgleda kao da je nešto otpalo.
  // Redoslijed je uvijek glavni → gold → podupiratelji, bez obzira kojim je
  // redom vlasnik upisivao.
  const razine = razvrstajRazine(sponsors.tiers.filter((tier) => tier.sponsors.length > 0));

  return (
    <section className="partners" aria-labelledby="naslov-partneri">
      <div className="shell">
        <div className="section-head">
          <Reveal>
            <span className="eyebrow">Uz nas su</span>
            <h2 className="partners__title" id="naslov-partneri">
              Partneri kluba
            </h2>
          </Reveal>
          <Reveal variant="right" delay={140}>
            <Link className="link-underline" to={CONTACT_PATH}>
              Postani partner →
            </Link>
          </Reveal>
        </div>

        <div className="tiers">
          {razine.map((tier, t) => (
            <Reveal className={`tier tier--${tier.size}`} delay={t * 90} key={tier.id}>
              <div className="tier__head">
                <span className="tier__tag">{tier.tag}</span>
                <span className="tier__line" aria-hidden="true" />
              </div>

              <Sadrzaj tier={tier} />
            </Reveal>
          ))}
        </div>

        {/* Poziv partnerima stoji uvijek. Prije su prazne razine punili
            „Sponzor 1 … Sponzor 8“ — izmišljena imena koja su kliznula
            preko ekrana i odavala da klub nema sponzore. */}
        <Reveal className="partners__cta" delay={razine.length * 90 + 80}>
          <div className="partners__cta-copy">
            <h3 className="partners__cta-title">Mjesto za tvoj logotip</h3>
            <p className="partners__cta-note">
              Domaće utakmice igraju se na Zrinjevcu — {hero.venue}. Za uvjete
              partnerstva i vidljivost na dresu, u dvorani i na ovoj stranici javi
              se klubu.
            </p>
          </div>
          <Link className="btn btn--blue" to={CONTACT_PATH}>
            Uvjeti partnerstva
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

/**
 * Sadržaj jedne razine.
 *
 * - Podupiratelji: tri reda karusela, svaki u suprotnom smjeru od susjednog.
 *   Tek kad ih ima dovoljno (`NAJMANJE_ZA_REDOVE`); inače mreža, jer tri reda
 *   s dva logotipa daju isti logotip ponovljen dvadeset puta.
 * - Gold: mreža. Rotira se samo ako je razina označena za rotaciju i ima
 *   dovoljno sponzora — tada kao jedan red.
 * - Glavni: uvijek mreža, jer jedan sponzor rastegnut na cijelu širinu
 *   izgleda kao prazan okvir.
 */
function Sadrzaj({ tier }) {
  const redovi = jePodupiratelj(tier) ? razdijeliNaRedove(tier.sponsors, 3) : null;

  if (redovi) {
    return (
      <>
        <PopisZaCitace sponsors={tier.sponsors} />
        <div className="tier__redovi">
          {redovi.map((red, r) => (
            <Traka
              sponsors={red}
              size={tier.size === 'lg' ? 'md' : tier.size}
              smjer={smjerReda(r)}
              brzina={BRZINE[r % BRZINE.length]}
              key={r}
            />
          ))}
        </div>
      </>
    );
  }

  if (tier.rotate && tier.size !== 'lg' && tier.sponsors.length > 4) {
    return (
      <>
        <PopisZaCitace sponsors={tier.sponsors} />
        <Traka sponsors={tier.sponsors} size={tier.size} smjer="lijevo" />
      </>
    );
  }

  /* Cijela razina se pojavi odjednom — logotipi koji uskaču jedan po jedan
     djeluju kao da ih se broji. */
  return (
    <div className="tier__grid">
      {tier.sponsors.map((sponsor, i) => (
        <div key={`${sponsor.name}-${i}`} className="tier__cell">
          <SponsorCell sponsor={sponsor} size={tier.size} />
        </div>
      ))}
    </div>
  );
}
