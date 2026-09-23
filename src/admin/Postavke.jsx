import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { zadaniSadrzaj } from '../lib/content';
import { Polje, Tekst } from './Polja';

/**
 * Tekstovi i podaci kojih ima po jedan komad.
 *
 * Za razliku od igrača ili novosti, ovo nisu popisi nego pojedinačne
 * vrijednosti — kontakt, karta, naslovi stranica, slogan. Drže se u tablici
 * `postavke` kao ključ → JSON i spajaju preko ugrađenog sadržaja, pa polje
 * koje nitko nije dirao zadrži tekst iz koda.
 *
 * Svaka skupina ima svoj „Spremi”, isto kao redak u ostalim uređivačima.
 */

/* Opis polja po skupini. `put` je putanja unutar JSON-a te skupine. */
const SKUPINE = [
  {
    key: 'hero',
    naslov: 'Naslovnica',
    polja: [
      { put: 'slogan', label: 'Slogan u heroju', tip: 'tekst' },
      { put: 'venue', label: 'Dvorana (podnaslov)' },
    ],
  },
  {
    key: 'contact',
    naslov: 'Kontakt',
    polja: [
      { put: 'email', label: 'E-mail' },
      { put: 'phone', label: 'Telefon' },
      { put: 'phoneHref', label: 'Telefon za poveznicu', placeholder: '+38531227503' },
      { put: 'address', label: 'Adresa (jedan redak po retku)', tip: 'popis' },
    ],
  },
  {
    key: 'map',
    naslov: 'Karta dvorane',
    polja: [
      { put: 'lat', label: 'Širina (lat)', tip: 'broj' },
      { put: 'lon', label: 'Dužina (lon)', tip: 'broj' },
      { put: 'zoom', label: 'Približavanje', tip: 'broj' },
      { put: 'label', label: 'Natpis' },
      { put: 'link', label: 'Poveznica na upute' },
    ],
  },
  {
    key: 'shop',
    naslov: 'Fan Shop',
    polja: [
      { put: 'url', label: 'Adresa trgovine' },
      { put: 'searchUrl', label: 'Pretraga „kandit”' },
      { put: 'note', label: 'Napomena ispod artikala', tip: 'tekst' },
      { put: 'custom.title', label: 'Naslov personalizacije dresa' },
      { put: 'custom.lead', label: 'Uvod personalizacije', tip: 'tekst' },
      { put: 'custom.defaultName', label: 'Zadano prezime na dresu' },
      { put: 'custom.defaultNumber', label: 'Zadani broj na dresu' },
      { put: 'custom.href', label: 'Poveznica na dres u trgovini' },
    ],
  },
  {
    key: 'league',
    naslov: 'Tablica — postavke',
    polja: [
      { put: 'ourClub', label: 'Naš klub (ime kojim se redak ističe)' },
      { put: 'playoffCutoff', label: 'Mjesta za doigravanje', tip: 'broj' },
      { put: 'note', label: 'Napomena ispod tablice', tip: 'tekst' },
      { put: 'clubs', label: 'Klubovi lige (jedan po retku)', tip: 'popis' },
    ],
  },
  {
    key: 'topbarBadge',
    naslov: 'Gornja traka',
    ravno: true,
    polja: [{ put: '', label: 'Natpis uz točkicu', placeholder: 'Novosti · na dan utakmice „Live”' }],
  },
];

/* Stranice se uređuju posebno — ima ih više i sve imaju ista tri polja. */
const PODSTRANICE = ['/klub', '/postava', '/raspored', '/shop', '/novosti', '/kontakt', '/ulaznice'];

const dohvati = (obj, put) =>
  put ? put.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj) : obj;

function postavi(obj, put, vrijednost) {
  if (!put) return vrijednost;
  const [glava, ...rep] = put.split('.');
  if (rep.length === 0) return { ...obj, [glava]: vrijednost };
  return { ...obj, [glava]: postavi(obj?.[glava] ?? {}, rep.join('.'), vrijednost) };
}

export default function Postavke() {
  const [spremljeno, setSpremljeno] = useState({});
  const [stanje, setStanje] = useState('ucitavanje');
  const [greska, setGreska] = useState(null);

  const ucitaj = useCallback(async () => {
    if (!supabase) {
      setStanje('nespojeno');
      return;
    }
    const { data, error } = await supabase.from('postavke').select('*');
    if (error) {
      setGreska(error.message);
      setStanje('greska');
      return;
    }
    const mapa = {};
    (data ?? []).forEach(({ key, value }) => {
      mapa[key] = value;
    });
    setSpremljeno(mapa);
    setGreska(null);
    setStanje('spremno');
  }, []);

  useEffect(() => {
    ucitaj();
  }, [ucitaj]);

  const spremiKljuc = async (key, value) => {
    const { error } = await supabase
      .from('postavke')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) {
      setGreska(error.message);
      return false;
    }
    await ucitaj();
    return true;
  };

  if (stanje === 'ucitavanje') return <p className="anapomena">Učitavam…</p>;
  if (stanje === 'nespojeno')
    return <p className="anapomena anapomena--greska">Supabase nije spojen.</p>;

  const zadano = zadaniSadrzaj();

  return (
    <section className="asekcija">
      <div className="asekcija__vrh">
        <div>
          <h2 className="asekcija__naslov">Tekstovi i kontakt</h2>
          <p className="asekcija__opis">
            Polje koje ostaviš prazno zadrži tekst iz koda — ne ostaje prazno na stranici.
          </p>
        </div>
      </div>

      {greska && <p className="anapomena anapomena--greska">{greska}</p>}

      {SKUPINE.map((skupina) => (
        <Skupina
          key={skupina.key}
          skupina={skupina}
          pocetno={
            skupina.ravno
              ? (spremljeno[skupina.key] ?? zadano[skupina.key])
              : { ...zadano[skupina.key], ...(spremljeno[skupina.key] ?? {}) }
          }
          onSpremi={(v) => spremiKljuc(skupina.key, v)}
        />
      ))}

      <Skupina
        skupina={{
          key: 'pages',
          naslov: 'Zaglavlja podstranica',
          polja: PODSTRANICE.flatMap((put) => [
            { put: `${put}.eyebrow`, label: `${put} — nadnaslov` },
            { put: `${put}.title`, label: `${put} — naslov` },
            { put: `${put}.lead`, label: `${put} — uvod`, tip: 'tekst' },
          ]),
        }}
        pocetno={{ ...zadano.pages, ...(spremljeno.pages ?? {}) }}
        onSpremi={(v) => spremiKljuc('pages', v)}
      />
    </section>
  );
}

function Skupina({ skupina, pocetno, onSpremi }) {
  const [nacrt, setNacrt] = useState(pocetno);
  const [radi, setRadi] = useState(false);

  useEffect(() => setNacrt(pocetno), [JSON.stringify(pocetno)]);

  const promijenjeno = JSON.stringify(nacrt) !== JSON.stringify(pocetno);

  const spremi = async () => {
    setRadi(true);
    await onSpremi(nacrt);
    setRadi(false);
  };

  return (
    <div className="aredak">
      <div className="aredak__vrh">
        <span className="aredak__naslov">{skupina.naslov}</span>
      </div>

      <div className="aredak__polja">
        {skupina.polja.map((polje) => {
          const vrijednost = dohvati(nacrt, polje.put);
          const promijeni = (v) => setNacrt((n) => postavi(n, polje.put, v));

          if (polje.tip === 'popis') {
            return (
              <Tekst
                key={polje.put || skupina.key}
                label={polje.label}
                rows={4}
                value={(vrijednost ?? []).join('\n')}
                onChange={(text) =>
                  promijeni(
                    text
                      .split('\n')
                      .map((r) => r.trim())
                      .filter(Boolean)
                  )
                }
              />
            );
          }

          if (polje.tip === 'tekst') {
            return (
              <Tekst
                key={polje.put || skupina.key}
                label={polje.label}
                value={vrijednost}
                onChange={promijeni}
              />
            );
          }

          return (
            <Polje
              key={polje.put || skupina.key}
              label={polje.label}
              type={polje.tip === 'broj' ? 'number' : 'text'}
              value={vrijednost}
              placeholder={polje.placeholder}
              onChange={promijeni}
            />
          );
        })}
      </div>

      <div className="aredak__radnje">
        <button
          type="button"
          className="agumb agumb--glavni"
          disabled={!promijenjeno || radi}
          onClick={spremi}
        >
          {radi ? 'Spremam…' : promijenjeno ? 'Spremi' : 'Spremljeno'}
        </button>
      </div>
    </div>
  );
}
