import { Link } from 'react-router-dom';
import Pip from '../components/Pip';
import { useContent } from '../lib/content';
import useUzivo from '../lib/useUzivo';
import { formatSat, opisRazmaka } from '../lib/vrijeme';
import { rezultatIzDogadaja, stanjePrijenosa, opisStanja } from '../lib/uzivo';

/**
 * Hero ne koristi <Reveal> — sadržaj je odmah u kadru, pa ulazne animacije
 * (floatUp) kreću po učitavanju, bez čekanja na listanje.
 */
export default function Hero() {
  const { hero, images, league } = useContent();

  // Prvo što navijača zanima na vrhu stranice je sljedeća utakmica.
  // Dok je nema u rasporedu, na njezino mjesto idu klupske brojke.
  // A dok utakmica traje — ona ima prednost pred svime.
  const sljedeca = league.fixtures[0] ?? null;
  const prijenos = useUzivo(league.ourClub, Boolean(league.uzivo));
  const uzivo = prijenos.utakmica ?? league.uzivo;

  return (
    <section className="hero" id="pocetna">
      <img
        className="hero__photo"
        src={images.celebration}
        alt="Igrač Kandita slavi s navijačima"
        fetchPriority="high"
      />
      <div className="hero__veil" aria-hidden="true" />

      <div className="hero__inner">
        <div className="hero__lead">
          <div className="hero__badgerow">
            <div className="hero__league">
              <Pip blink />
              <span>SuperSport HMNL · 2026/27</span>
            </div>
          </div>

          <h1 className="hero__title">
            <span className="hero__title-line">MNK</span>
            <span className="hero__title-line">
              <span className="outline">Osijek</span> <span className="accent">Kandit</span>
            </span>
          </h1>

          <p className="hero__slogan">{hero.slogan}</p>

          <div className="hero__actions">
            <Link className="btn btn--solid" to="/postava">
              Upoznaj momčad
            </Link>
            <Link className="btn btn--ghost" to="/raspored">
              Raspored i tablica
            </Link>
          </div>
        </div>

        <div className="hero__aside">
          <div className="hero__frame">
            <img
              className="hero__frame-img"
              src={images.team}
              alt="Momčad Kandita slavi pobjedu"
            />
            <span className="hero__frame-tag">Zrinjevac · bijelo-plavi</span>
          </div>

          {uzivo ? (
            <ZivoKartica utakmica={uzivo} dogadaji={prijenos.dogadaji} />
          ) : sljedeca ? (
            <div className="hero__facts hero__next">
              <span className="eyebrow eyebrow--sm">Sljedeća utakmica</span>
              <div className="hero__next-meta">
                <span className="hero__next-when">
                  {sljedeca.when}
                  {/* Sat ide uz datum tek kad je termin pravi. Kod starog
                      tekstualnog retka sata nema, pa se ne izmišlja. */}
                  {sljedeca.kickoff ? ` ${formatSat(sljedeca.kickoff)}` : ''}
                </span>
                <span className="hero__next-comp">
                  {[sljedeca.comp, sljedeca.round].filter(Boolean).join(' · ')}
                </span>
              </div>
              <h2 className="hero__next-title">{sljedeca.title}</h2>
              <span className="hero__next-venue">
                {sljedeca.venue}
                {sljedeca.kickoff ? ` · ${opisRazmaka(sljedeca.kickoff)}` : ''}
              </span>
              <Link className="hero__next-link" to="/raspored">
                Cijeli raspored i tablica →
              </Link>
            </div>
          ) : (
            <div className="hero__facts">
              <span className="eyebrow eyebrow--sm">Sezona 2025/26</span>
              <div className="hero__facts-list">
                {hero.facts.map((fact, i) => (
                  <div
                    className="hero__fact"
                    key={fact.label}
                    style={{ '--fact-delay': `${0.45 + i * 0.12}s` }}
                  >
                    <span className="hero__fact-v">{fact.value}</span>
                    <span className="hero__fact-l">{fact.label}</span>
                  </div>
                ))}
              </div>
              <div className="hero__facts-foot">{hero.venue}</div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * Kartica sljedeće utakmice dok ona traje.
 *
 * Rezultat se računa iz događaja, kao i svugdje drugdje — tri mjesta koja
 * pokazuju isti rezultat (heroj, traka, stranica prijenosa) čitaju isti niz,
 * pa se ne mogu razići.
 */
function ZivoKartica({ utakmica, dogadaji }) {
  const rezultat = rezultatIzDogadaja(dogadaji, utakmica.jeDoma);
  const stanje = stanjePrijenosa(dogadaji);

  return (
    <div className="hero__facts hero__next hero__next--uzivo">
      <span className="uzivo-znak">
        <span className="uzivo-znak__tocka" aria-hidden="true" />
        Uživo
      </span>
      <div className="hero__next-meta">
        <span className="hero__next-when">{opisStanja(stanje)}</span>
        <span className="hero__next-comp">
          {[utakmica.comp, utakmica.round].filter(Boolean).join(' · ')}
        </span>
      </div>
      <div className="hero__zivo">
        <span className={utakmica.jeDoma ? 'je-nas' : ''}>{utakmica.home}</span>
        <strong>
          {rezultat.home}:{rezultat.away}
        </strong>
        <span className={!utakmica.jeDoma ? 'je-nas' : ''}>{utakmica.away}</span>
      </div>
      <span className="hero__next-venue">{utakmica.venue}</span>
      <Link className="hero__next-link" to="/uzivo">
        Prati utakmicu uživo →
      </Link>
    </div>
  );
}
