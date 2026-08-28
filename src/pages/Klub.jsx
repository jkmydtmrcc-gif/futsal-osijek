import Brush from '../components/Brush';
import Pip from '../components/Pip';
import Reveal from '../components/Reveal';
import PageHero from '../components/PageHero';
import { PAGES, CLUB_FACTS, HONOURS, STAFF, CONTACT, IMAGES } from '../data/site';

export default function Klub() {
  return (
    <>
      <PageHero page={PAGES['/klub']} />

      <section className="slab" aria-label="Klub u brojkama">
        <Brush variant="impact" />
        <div className="shell facts">
          {CLUB_FACTS.map((f, i) => (
            <Reveal className="facts__cell" key={f.label} delay={i * 90}>
              <span className="facts__value">{f.value}</span>
              <span className="facts__label">{f.label}</span>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="slab slab--paper" aria-labelledby="naslov-prica">
        <Brush variant="squad-1" />
        <div className="shell split">
          <Reveal variant="left" className="split__main">
            <span className="eyebrow">Klub</span>
            <h2 className="section-title" id="naslov-prica">
              Bijelo-plavi
              <br />
              iz Osijeka
            </h2>
            <p className="prose">
              MNK Osijek Kandit osnovan je 2002. godine. Domaće utakmice igra u
              Športskoj dvorani Zrinjevac, koja prima 1.160 gledatelja, a natječe se
              u SuperSport HMNL-u — prvoj hrvatskoj malonogometnoj ligi.
            </p>
            <p className="prose">
              Kandit je naziv sponzor kluba, pa ime tvrtke stoji uz ime grada u
              punom nazivu momčadi.
            </p>
          </Reveal>

          <Reveal variant="right" delay={120} className="split__side">
            <img
              className="split__img notch-br-22"
              src={IMAGES.team}
              alt="Momčad Kandita slavi pobjedu"
              loading="lazy"
            />
            <div className="staff">
              {STAFF.map((s) => (
                <div className="staff__row" key={s.role}>
                  <span className="staff__role">{s.role}</span>
                  <span className="staff__name">{s.name}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="slab slab--dark" aria-labelledby="naslov-uspjesi">
        <div className="scanlines scanlines--wide" aria-hidden="true" />
        <Brush variant="league-1" />
        <div className="shell">
          <Reveal>
            <span className="eyebrow eyebrow--sky">Rezultati</span>
            <h2 className="section-title section-title--light" id="naslov-uspjesi">
              Zadnje dvije sezone
            </h2>
          </Reveal>

          <div className="honours">
            {HONOURS.map((h, i) => (
              <Reveal className="honour" key={h.title} delay={120 + i * 110} variant="right">
                <span className="honour__when">{h.when}</span>
                <div>
                  <h3 className="honour__title">{h.title}</h3>
                  <p className="honour__note">{h.note}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={340}>
            <p className="slab__foot">
              <Pip tone="sky" /> Dvorana Zrinjevac · {CONTACT.address[1]}, {CONTACT.address[2]}
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
