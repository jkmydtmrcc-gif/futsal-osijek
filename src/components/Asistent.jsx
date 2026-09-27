import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContent, useStandings } from '../lib/content';
import AsistentIkona from './AsistentIkona';
import { TEME_RIJECI, norm, odaberiTemu } from '../lib/asistent';

/**
 * Klupski asistent.
 *
 * Odgovara na pitanja iz podataka koji su već na stranici — raspored, tablica,
 * postava, kontakt, Fan Shop. Nije jezični model: ne izmišlja odgovore i ne
 * zove nikakvu vanjsku uslugu, pa ne košta ništa, radi offline i ne može
 * reći nešto čega u klupskim podacima nema.
 *
 * Kad ne prepozna pitanje, to i kaže i ponudi teme koje zna — umjesto da
 * nagađa. Nagađanje je ovdje gore od priznanja: posjetitelj bi krivi termin
 * utakmice shvatio ozbiljno.
 */

function Krizic({ className = '' }) {
  return (
    <svg
      className={`askriz ${className}`.trim()}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M7 7l10 10M17 7L7 17" />
    </svg>
  );
}

export default function Asistent() {
  const content = useContent();
  const standings = useStandings();
  const navigate = useNavigate();

  const [otvoren, setOtvoren] = useState(false);
  const [upit, setUpit] = useState('');
  const [razgovor, setRazgovor] = useState([]);
  const krajRef = useRef(null);
  const unosRef = useRef(null);

  /* Teme: ključne riječi → odgovor složen iz sadržaja stranice. */
  const teme = useMemo(() => {
    const { league, contact, hero, shop, players, staff, news, tickets } = content;
    const mi = standings.find((r) => r.isUs);
    const sljedeca = league.fixtures?.[0];

    return [
      {
        id: 'utakmica',
        rijeci: TEME_RIJECI.utakmica,
        pitanje: 'Kad je sljedeća utakmica?',
        odgovor: () =>
          sljedeca
            ? `Sljedeća utakmica: ${sljedeca.title}, ${sljedeca.when} (${sljedeca.comp}). Igra se u: ${sljedeca.venue}.`
            : 'Termini još nisu objavljeni. Čim ih HMNL potvrdi, pojave se na stranici Raspored.',
        put: '/raspored',
        putLabel: 'Otvori raspored',
      },
      {
        id: 'tablica',
        rijeci: TEME_RIJECI.tablica,
        pitanje: 'Koje smo mjesto na tablici?',
        odgovor: () =>
          mi
            ? `${league.ourClub} je ${mi.pos}. s ${mi.points} bodova iz ${mi.played} utakmica. Prva ${league.playoffCutoff} mjesta vode u doigravanje.`
            : 'Tablica još nije upisana za ovu sezonu.',
        put: '/raspored',
        putLabel: 'Cijela tablica',
      },
      {
        id: 'dvorana',
        rijeci: TEME_RIJECI.dvorana,
        pitanje: 'Gdje se igraju domaće utakmice?',
        odgovor: () => {
          const redci = (tickets.info ?? []).filter(
            (r) => !norm(r.label).includes('adres')
          );
          return (
            `Domaće utakmice igraju se u ${hero.venue}. Adresa: ${contact.address.join(', ')}.` +
            (redci.length ? ` ${redci.map((r) => `${r.label}: ${r.value}`).join(' · ')}.` : '')
          );
        },
        put: '/ulaznice',
        putLabel: 'Dolazak na utakmicu',
      },
      {
        id: 'ulaznice',
        rijeci: TEME_RIJECI.ulaznice,
        pitanje: 'Kako do ulaznice?',
        odgovor: () =>
          `Klub nema online prodaju ulaznica. Ulaznice se kupuju na dan utakmice na ulazu, a za rezervacije i grupne dolaske javi se na ${contact.email}.`,
        put: '/ulaznice',
        putLabel: 'Ulaznice i česta pitanja',
      },
      {
        id: 'kontakt',
        rijeci: TEME_RIJECI.kontakt,
        pitanje: 'Kako kontaktirati klub?',
        odgovor: () => `E-mail: ${contact.email}. Telefon: ${contact.phone}.`,
        put: '/kontakt',
        putLabel: 'Kontakt',
      },
      {
        id: 'dres',
        rijeci: TEME_RIJECI.dres,
        pitanje: 'Gdje kupiti dres?',
        odgovor: () =>
          `Opremu prodaje SalaSport — klub nema vlastitu naplatu. Na stranici Fan Shop je ${shop.products.length} artikala, a klik vodi na stranicu artikla u trgovini. Dres se može naručiti i s prezimenom i brojem.`,
        put: '/shop',
        putLabel: 'Fan Shop',
      },
      {
        id: 'postava',
        rijeci: TEME_RIJECI.postava,
        pitanje: 'Tko igra za klub?',
        odgovor: () => {
          const trener = staff.find((s) => norm(s.role).includes('trener'));
          const kapetan =
            staff.find((s) => norm(s.role).includes('kapetan')) ??
            players.find((p) => norm(p.pos).includes('kapetan'));
          const dijelovi = [`U prvoj postavi je ${players.length} igrača.`];
          if (trener) dijelovi.push(`Trener: ${trener.name}.`);
          if (kapetan) dijelovi.push(`Kapetan: ${kapetan.name}.`);
          dijelovi.push('Klik na igrača otvara njegov profil i statistiku.');
          return dijelovi.join(' ');
        },
        put: '/postava',
        putLabel: 'Prva postava',
      },
      {
        id: 'novosti',
        rijeci: TEME_RIJECI.novosti,
        pitanje: 'Ima li novosti?',
        odgovor: () => {
          const zadnja = news.items?.[0];
          return zadnja
            ? `Zadnja objava: „${zadnja.title}” (${zadnja.date}). ${zadnja.lead}`
            : 'Trenutno nema objavljenih novosti.';
        },
        put: '/novosti',
        putLabel: 'Sve novosti',
      },
      {
        id: 'klub',
        rijeci: TEME_RIJECI.klub,
        pitanje: 'Nešto o klubu?',
        odgovor: () => {
          const priča = content.club.story?.[0];
          return priča ?? 'MNK Osijek Kandit je futsal klub iz Osijeka.';
        },
        put: '/klub',
        putLabel: 'O klubu',
      },
    ];
  }, [content, standings]);

  const odgovoriNa = (tekst) => odaberiTemu(teme, tekst);

  const posalji = (tekst) => {
    const pitanje = tekst.trim();
    if (!pitanje) return;

    const tema = odgovoriNa(pitanje);
    setRazgovor((r) => [
      ...r,
      { tko: 'ja', tekst: pitanje },
      tema
        ? { tko: 'bot', tekst: tema.odgovor(), put: tema.put, putLabel: tema.putLabel }
        : {
            tko: 'bot',
            tekst:
              'To ne znam. Odgovaram iz podataka na ovoj stranici — pitaj me za raspored, tablicu, dvoranu, ulaznice, postavu, Fan Shop ili kontakt. Za sve ostalo je tu klub: ' +
              content.contact.email,
            put: '/kontakt',
            putLabel: 'Kontakt',
          },
    ]);
    setUpit('');
  };

  /* Novi odgovor uvijek u kadru. */
  useEffect(() => {
    krajRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [razgovor]);

  useEffect(() => {
    if (otvoren) unosRef.current?.focus();
  }, [otvoren]);

  useEffect(() => {
    if (!otvoren) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOtvoren(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [otvoren]);

  return (
    <>
      <button
        type="button"
        className={`as-fab${otvoren ? ' je-otvoren' : ''}`}
        onClick={() => setOtvoren((v) => !v)}
        aria-expanded={otvoren}
        aria-controls="klupski-asistent"
        aria-label={otvoren ? 'Zatvori asistenta' : 'Otvori klupskog asistenta'}
      >
        {otvoren ? <Krizic className="as-fab__x" /> : <AsistentIkona className="as-fab__ikona" />}
      </button>

      <div
        id="klupski-asistent"
        className={`as${otvoren ? ' je-otvoren' : ''}`}
        role="dialog"
        aria-label="Klupski asistent"
        hidden={!otvoren}
      >
        <div className="as__vrh">
          <span className="as__avatar">
            <AsistentIkona />
          </span>
          <div className="as__ime">
            <span className="as__naslov">Klupski asistent</span>
            <span className="as__pod">Odgovara iz podataka na stranici</span>
          </div>
          <button
            type="button"
            className="as__zatvori"
            onClick={() => setOtvoren(false)}
            aria-label="Zatvori asistenta"
          >
            <Krizic />
          </button>
        </div>

        <div className="as__tok">
          <div className="as__poruka as__poruka--bot">
            <p>
              Klupski asistent. Pitaj me o rasporedu, tablici, dvorani ili
              opremi — odgovaram iz onoga što piše na ovoj stranici.
            </p>
          </div>

          {razgovor.map((poruka, i) => (
            <div className={`as__poruka as__poruka--${poruka.tko}`} key={i}>
              <p>{poruka.tekst}</p>
              {poruka.put && (
                <button
                  type="button"
                  className="as__veza"
                  onClick={() => {
                    navigate(poruka.put);
                    setOtvoren(false);
                  }}
                >
                  {poruka.putLabel} →
                </button>
              )}
            </div>
          ))}
          <div ref={krajRef} />
        </div>

        {razgovor.length === 0 && (
          <div className="as__prijedlozi">
            {teme.slice(0, 4).map((tema) => (
              <button
                type="button"
                className="as__prijedlog"
                key={tema.id}
                onClick={() => posalji(tema.pitanje)}
              >
                {tema.pitanje}
              </button>
            ))}
          </div>
        )}

        <form
          className="as__unos"
          onSubmit={(e) => {
            e.preventDefault();
            posalji(upit);
          }}
        >
          <input
            ref={unosRef}
            type="text"
            value={upit}
            onChange={(e) => setUpit(e.target.value)}
            placeholder="Napiši pitanje…"
            aria-label="Pitanje"
          />
          <button type="submit" disabled={!upit.trim()} aria-label="Pošalji pitanje">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M5 12h13M12.5 6l6 6-6 6" />
            </svg>
          </button>
        </form>
      </div>
    </>
  );
}
