import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContent, useStandings } from '../lib/content';

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

/** Miče kvačice i velika slova, pa „utakmica“ i „UTAKMICA“ budu isto. */
const norm = (s) =>
  String(s ?? '')
    .toLocaleLowerCase('hr-HR')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd');

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
        rijeci: ['utakmic', 'kada', 'kad igra', 'sljedec', 'iduc', 'termin', 'raspored', 'kolo'],
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
        rijeci: ['tablic', 'poredak', 'mjesto', 'bodov', 'koliko bod', 'liga'],
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
        rijeci: ['dvoran', 'gdje', 'adres', 'lokacij', 'zrinjevac', 'kako doc', 'parking', 'doci'],
        pitanje: 'Gdje se igraju domaće utakmice?',
        odgovor: () =>
          `Domaće utakmice igraju se u ${hero.venue}. Adresa: ${contact.address.join(', ')}.` +
          (tickets.info?.length
            ? ` ${tickets.info.map((r) => `${r.label}: ${r.value}`).join(' · ')}.`
            : ''),
        put: '/ulaznice',
        putLabel: 'Dolazak na utakmicu',
      },
      {
        id: 'ulaznice',
        rijeci: ['ulaznic', 'karte', 'kupit', 'cijena ulaz', 'tribin'],
        pitanje: 'Kako do ulaznice?',
        odgovor: () =>
          `Klub nema online prodaju ulaznica. Ulaznice se kupuju na dan utakmice na ulazu, a za rezervacije i grupne dolaske javi se na ${contact.email}.`,
        put: '/ulaznice',
        putLabel: 'Ulaznice i česta pitanja',
      },
      {
        id: 'kontakt',
        rijeci: ['kontakt', 'mail', 'email', 'telefon', 'broj tel', 'javit', 'pisat'],
        pitanje: 'Kako kontaktirati klub?',
        odgovor: () => `E-mail: ${contact.email}. Telefon: ${contact.phone}.`,
        put: '/kontakt',
        putLabel: 'Kontakt',
      },
      {
        id: 'dres',
        rijeci: ['dres', 'shop', 'kupit dres', 'oprema', 'lopta', 'artikl', 'trgovin', 'salasport'],
        pitanje: 'Gdje kupiti dres?',
        odgovor: () =>
          `Opremu prodaje SalaSport — klub nema vlastitu naplatu. Na stranici Fan Shop je ${shop.products.length} artikala, a klik vodi na stranicu artikla u trgovini. Dres se može naručiti i s prezimenom i brojem.`,
        put: '/shop',
        putLabel: 'Fan Shop',
      },
      {
        id: 'postava',
        rijeci: ['igrac', 'postav', 'momcad', 'tko igra', 'kapetan', 'trener', 'vratar', 'stozer'],
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
        rijeci: ['novost', 'vijest', 'objav', 'sto ima nov', 'transfer'],
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
        rijeci: ['klub', 'osnovan', 'povijest', 'godin', 'uspjeh', 'o vama', 'boje'],
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

  /* Bodovanje: koliko se ključnih riječi teme pojavljuje u pitanju. */
  const odgovoriNa = (tekst) => {
    const t = norm(tekst);
    if (!t.trim()) return null;

    let najbolja = null;
    let najviše = 0;

    teme.forEach((tema) => {
      const pogodaka = tema.rijeci.filter((r) => t.includes(r)).length;
      if (pogodaka > najviše) {
        najviše = pogodaka;
        najbolja = tema;
      }
    });

    return najviše > 0 ? najbolja : null;
  };

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
      >
        <span className="as-fab__ikona" aria-hidden="true">
          {otvoren ? '✕' : '?'}
        </span>
        <span className="as-fab__tekst">{otvoren ? 'Zatvori' : 'Pitaj klub'}</span>
      </button>

      <div
        id="klupski-asistent"
        className={`as${otvoren ? ' je-otvoren' : ''}`}
        role="dialog"
        aria-label="Klupski asistent"
        hidden={!otvoren}
      >
        <div className="as__vrh">
          <div>
            <span className="as__naslov">Klupski asistent</span>
            <span className="as__pod">Odgovara iz podataka na stranici</span>
          </div>
        </div>

        <div className="as__tok">
          {razgovor.length === 0 && (
            <>
              <p className="as__uvod">
                Pitaj me nešto o klubu. Odgovaram iz onoga što piše na ovoj stranici —
                ako ne znam, reći ću ti.
              </p>
              <div className="as__prijedlozi">
                {teme.slice(0, 5).map((tema) => (
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
            </>
          )}

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
            placeholder="Npr. kad je sljedeća utakmica?"
            aria-label="Pitanje"
          />
          <button type="submit" disabled={!upit.trim()}>
            Pitaj
          </button>
        </form>
      </div>
    </>
  );
}
