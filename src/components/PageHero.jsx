import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Reveal from './Reveal';
import Meta from './Meta';
import { NAV_LINKS } from '../data/site';
import { useContent } from '../lib/content';

/**
 * Zajednički vrh svake podstranice — ista tema kao tamne sekcije naslovnice.
 *
 * Klupska fotografija ulazi s desnog ruba i gubi se u plavom prema naslovu.
 * Ista je na svim podstranicama, pa se vrh čita kao jedan oblik, a ne kao
 * sedam različitih uvoda.
 *
 * Nestajanje radi koprena u gradijentu, a ne `mask-image`: isti učinak, a
 * nema preglednika u kojem bi otkazao i ostavio tvrdi rub preko naslova.
 *
 * Širina pojasa je ograničena na 660px jer je fotografija 600×400: `cover` je
 * pri visini vrha od 440px diže 1,1×, i to je točno granica do koje nema
 * uvećanja. Preko nje bi slika omekšala, što se na velikom ekranu vidi prije
 * svega ostalog.
 *
 * `bezFotografije` koristi stranica pojedine objave — ondje fotografija stoji
 * u punoj veličini uz tekst, pa bi ista slika dvaput bila ponavljanje.
 *
 * `dugNaslov` je za naslov koji je rečenica, a ne natpis. „NOVOSTI" u 92
 * piksela je znak; naslov objave u 92 piksela je zid koji zauzme cijeli
 * ekran prije nego se stigne pročitati.
 */
export default function PageHero({
  page,
  children,
  metaImage,
  metaType,
  bezFotografije = false,
  dugNaslov = false,
  nadStranica,
}) {
  const { images } = useContent();
  const [failed, setFailed] = useState(false);
  const foto = bezFotografije || failed ? null : images.tribina;

  // Putanja u vrhu: kratka, ali kaže gdje si. Stranice izvan izbornika
  // (ulaznice, kolačići, pojedina novost) uzimaju vlastiti naslov.
  const { pathname } = useLocation();
  const ovdje = NAV_LINKS.find((l) => l.to === pathname)?.label ?? page.title;

  return (
    <section
      className={`phero${foto ? ' phero--foto' : ''}${dugNaslov ? ' phero--dug' : ''}`}
      aria-labelledby="phero-naslov"
    >
      {/* Naslov i opis stranice su isti tekstovi koje urednik upisuje, pa se
          meta oznake održavaju same. */}
      <Meta title={page.title} description={page.lead} image={metaImage} type={metaType} />

      {foto && (
        <div className="phero__foto" aria-hidden="true">
          <img
            className="phero__foto-img"
            src={foto}
            alt=""
            /* Iznad pregiba je na svakoj podstranici, pa ne smije biti
               `lazy` — tada bi se učitala tek nakon prvog iscrtavanja i vrh
               bi na trenutak bio prazna plava ploha. */
            fetchPriority="high"
            onError={() => setFailed(true)}
          />
          <span className="phero__foto-koprena" />
        </div>
      )}

      {/* Crta na dnu stoji i bez fotografije, pa svaki vrh završava isto. */}
      <span className="phero__rub" aria-hidden="true" />

      <div className="shell">
        <nav className="phero__staza" aria-label="Putanja">
          <Link to="/">Početna</Link>
          {/* Stranica unutar rubrike (objava unutar Novosti) nosi i rubriku,
              inače bi naslov objave visio odmah uz „Početna“. */}
          {nadStranica && (
            <>
              <span className="phero__staza-crta" aria-hidden="true" />
              <Link to={nadStranica.to}>{nadStranica.label}</Link>
            </>
          )}
          <span className="phero__staza-crta" aria-hidden="true" />
          <span aria-current="page">{ovdje}</span>
        </nav>

        <div className="phero__inner">
          <Reveal>
            <span className="eyebrow eyebrow--sky">{page.eyebrow}</span>
            <h1 className="phero__title" id="phero-naslov">
              {page.title}
            </h1>
          </Reveal>
          <Reveal delay={130}>
            <p className="phero__lead">{page.lead}</p>
          </Reveal>
        </div>

        {/* Brojke i gumbi stoje u vlastitoj traci pod crtom — prije su
            visjeli odmah ispod uvoda i vrh stranice je završavao nasumično. */}
        {children && (
          <Reveal className="phero__traka" delay={230}>
            {children}
          </Reveal>
        )}
      </div>
    </section>
  );
}
