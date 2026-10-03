import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Pip from '../components/Pip';
import Reveal from '../components/Reveal';
import PageHero from '../components/PageHero';
import ClubBadge from '../components/ClubBadge';
import useUzivo from '../lib/useUzivo';
import { useContent } from '../lib/content';
import { formatDatum, formatSat } from '../lib/vrijeme';
import {
  rezultatIzDogadaja,
  stanjePrijenosa,
  opisStanja,
  sloziFeed,
  sloziPostavu,
  odbrojavanje,
  opisOdbrojavanja,
} from '../lib/uzivo';

/**
 * Prijenos utakmice uživo — `/uzivo`.
 *
 * Stranica **nikad nije prazna**. Tri stanja, i svako ima što pokazati:
 * utakmica traje → semafor i tijek; utakmica je najavljena → odbrojavanje;
 * nema ničega → zadnji odigrani rezultat i gdje se prati sljedeći.
 */
export default function Uzivo() {
  const { pages, league, players } = useContent();
  const { ucitava, utakmica, dogadaji, postave, greska } = useUzivo(league.ourClub);

  return (
    <>
      <PageHero page={pages['/uzivo']} />

      {utakmica ? (
        <Prijenos
          utakmica={utakmica}
          dogadaji={dogadaji}
          postave={postave}
          igraci={players}
          standings={league.standings}
        />
      ) : (
        <Cekanje ucitava={ucitava} greska={greska} league={league} />
      )}
    </>
  );
}

/** Grb kluba iz tablice, kad je ondje upisan. */
const grb = (standings, klub) => (standings ?? []).find((r) => r.club === klub)?.logo ?? '';

/* ── Utakmica traje ──────────────────────────────────────────────────────── */

function Prijenos({ utakmica, dogadaji, postave, igraci, standings }) {
  const rezultat = rezultatIzDogadaja(dogadaji, utakmica.jeDoma);
  const stanje = stanjePrijenosa(dogadaji);
  const feed = sloziFeed(dogadaji, igraci);
  const nasa = sloziPostavu(postave, igraci, true);
  const njihova = sloziPostavu(postave, igraci, false);
  const imaPostave = nasa.pocetna.length + nasa.klupa.length + njihova.pocetna.length > 0;

  return (
    <>
      <section className="slab slab--dark semafor-ploha" aria-labelledby="naslov-semafor">
        <div className="shell">
          <h2 className="sr-only" id="naslov-semafor">
            Rezultat uživo
          </h2>

          <Reveal className="semafor">
            <div className="semafor__vrh">
              <span className="uzivo-znak">
                <span className="uzivo-znak__tocka" aria-hidden="true" />
                Uživo
              </span>
              <span className="semafor__stanje">{opisStanja(stanje)}</span>
              {utakmica.comp && <span className="semafor__comp">{utakmica.comp}</span>}
            </div>

            <div className="semafor__redak">
              <div className="semafor__klub">
                <ClubBadge club={utakmica.home} logo={grb(standings, utakmica.home)} />
                <span className={`semafor__ime${utakmica.jeDoma ? ' je-nas' : ''}`}>
                  {utakmica.home}
                </span>
              </div>
              <div className="semafor__brojke">
                <span>{rezultat.home}</span>
                <span className="semafor__dvotocje" aria-hidden="true">
                  :
                </span>
                <span>{rezultat.away}</span>
              </div>
              <div className="semafor__klub semafor__klub--desno">
                <span className={`semafor__ime${!utakmica.jeDoma ? ' je-nas' : ''}`}>
                  {utakmica.away}
                </span>
                <ClubBadge club={utakmica.away} logo={grb(standings, utakmica.away)} />
              </div>
            </div>

            {utakmica.venue && <p className="semafor__dvorana">{utakmica.venue}</p>}
          </Reveal>
        </div>
      </section>

      <section className="slab slab--paper" aria-labelledby="naslov-tijek">
        <div className="shell tijek__raspored">
          <div>
            <Reveal>
              <span className="eyebrow">Minuta po minuta</span>
              <h2 className="section-title" id="naslov-tijek">
                Tijek utakmice
              </h2>
            </Reveal>

            {feed.length === 0 ? (
              <p className="slab__foot">
                <Pip /> Utakmica još nije počela. Čim krene, ovdje se pojavljuje svaki potez.
              </p>
            ) : (
              <Reveal as="ol" className="tijek">
                {feed.map((d) => (
                  <li
                    className={`tijek__redak${d.istice ? ' je-vazan' : ''}${d.nasa ? ' je-nas' : ''}`}
                    key={d.id}
                  >
                    <span className="tijek__minuta">{d.minuta === null ? '—' : `${d.minuta}'`}</span>
                    <span className="tijek__znak" aria-hidden="true">
                      {d.znak}
                    </span>
                    <span className="tijek__tekst">
                      {d.naziv && <strong className="tijek__naziv">{d.naziv}</strong>}
                      {d.ime && <span className="tijek__ime">{d.ime}</span>}
                      {d.tekst && <span className="tijek__opis">{d.tekst}</span>}
                    </span>
                  </li>
                ))}
              </Reveal>
            )}
          </div>

          {imaPostave && (
            <Reveal variant="right" delay={120} className="postave">
              <span className="eyebrow eyebrow--sm">Postave</span>
              <Postava naslov={utakmica.home} podaci={utakmica.jeDoma ? nasa : njihova} />
              <Postava naslov={utakmica.away} podaci={utakmica.jeDoma ? njihova : nasa} />
            </Reveal>
          )}
        </div>
      </section>
    </>
  );
}

function Postava({ naslov, podaci }) {
  if (podaci.pocetna.length + podaci.klupa.length === 0) return null;

  return (
    <div className="postava">
      <h3 className="postava__naslov">{naslov}</h3>
      <Red naslov="Početna petorka" igraci={podaci.pocetna} />
      <Red naslov="Klupa" igraci={podaci.klupa} />
    </div>
  );
}

function Red({ naslov, igraci }) {
  if (!igraci.length) return null;
  return (
    <>
      <span className="postava__oznaka">{naslov}</span>
      <ul className="postava__popis">
        {igraci.map((i) => (
          <li key={i.id}>
            {i.broj !== null && <span className="postava__broj">{i.broj}</span>}
            {i.ime}
          </li>
        ))}
      </ul>
    </>
  );
}

/* ── Ništa ne traje ──────────────────────────────────────────────────────── */

function Cekanje({ ucitava, greska, league }) {
  const sljedeca = league.sljedeca ?? league.fixtures?.[0] ?? null;
  const zadnja = league.zadnja ?? null;

  return (
    <section className="slab slab--dark" aria-labelledby="naslov-cekanje">
      <div className="shell">
        <Reveal>
          <span className="eyebrow eyebrow--sky">Prijenos</span>
          <h2 className="section-title section-title--light" id="naslov-cekanje">
            {sljedeca ? 'Sljedeća utakmica' : 'Trenutno nema prijenosa'}
          </h2>
        </Reveal>

        {ucitava && (
          <p className="slab__foot slab__foot--light">
            <Pip tone="sky" /> Provjeravam ima li utakmice u tijeku…
          </p>
        )}

        {sljedeca && <Najava utakmica={sljedeca} />}

        {!sljedeca && !ucitava && (
          <p className="slab__foot slab__foot--light">
            <Pip tone="sky" /> Čim u rasporedu bude termina, ovdje kreće prijenos.{' '}
            <Link className="link-inline" to="/raspored">
              Raspored i tablica
            </Link>
          </p>
        )}

        {zadnja && (
          <div className="cekanje__zadnja">
            <span className="eyebrow eyebrow--sky eyebrow--sm">Zadnje odigrano</span>
            <p className="cekanje__rezultat">
              {zadnja.home} <strong>{zadnja.score}</strong> {zadnja.away}
            </p>
          </div>
        )}

        {/* Greška se javlja, ali tek pod ostalim sadržajem — posjetitelja
            zanima utakmica, ne stanje baze. */}
        {greska && (
          <p className="slab__foot slab__foot--light">
            <Pip tone="sky" /> Podaci o prijenosu trenutno nisu dostupni.
          </p>
        )}
      </div>
    </section>
  );
}

/**
 * Najava sljedeće utakmice s odbrojavanjem.
 *
 * Otkucavanje je ovdje sadržaj stranice, a ne ukras: posjetitelj je došao
 * baš zato da vidi kad počinje. U heroju naslovnice je namjerno nema.
 * Sekunde se pokazuju tek u zadnjem satu — prije toga su buka.
 */
function Najava({ utakmica }) {
  const [sad, setSad] = useState(() => Date.now());
  const o = odbrojavanje(utakmica.kickoff, sad);
  const blizu = o && !o.proslo && o.ukupno < 3600;

  useEffect(() => {
    if (!utakmica.kickoff) return undefined;
    const razmak = blizu ? 1000 : 30000;
    const sat = setInterval(() => setSad(Date.now()), razmak);
    return () => clearInterval(sat);
  }, [utakmica.kickoff, blizu]);

  return (
    <Reveal className="najava" delay={100}>
      <div className="najava__susret">
        <span className="najava__klub">{utakmica.home}</span>
        <span className="najava__crta" aria-hidden="true">
          —
        </span>
        <span className="najava__klub">{utakmica.away}</span>
      </div>

      <div className="najava__meta">
        {utakmica.kickoff ? (
          <>
            <span>{formatDatum(utakmica.kickoff)}</span>
            <Pip size="sm" />
            <span>{formatSat(utakmica.kickoff)}</span>
          </>
        ) : (
          <span>{utakmica.when}</span>
        )}
        {utakmica.comp && (
          <>
            <Pip size="sm" />
            <span>{utakmica.comp}</span>
          </>
        )}
      </div>

      {o && !o.proslo && (
        <div className="najava__sat">
          <span className="najava__sat-oznaka">Počinje za</span>
          <span className="najava__sat-brojke">{opisOdbrojavanja(o)}</span>
        </div>
      )}

      {o?.proslo && (
        <p className="najava__uskoro">Utakmica počinje — prijenos kreće svaki čas.</p>
      )}

      {utakmica.venue && <p className="najava__dvorana">{utakmica.venue}</p>}
    </Reveal>
  );
}
