import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { upisiBezNepoznatih } from '../lib/postgrest';
import { matchFromRow, razvrstaj } from '../lib/utakmice';
import { formatDatum, formatSat } from '../lib/vrijeme';
import {
  rezultatIzDogadaja,
  stanjePrijenosa,
  opisStanja,
  sloziFeed,
  sloziPostavu,
} from '../lib/uzivo';

/**
 * Konzola za prijenos uživo.
 *
 * Ovo se koristi za zapisničkim stolom, dok utakmica traje. Operater nema
 * vremena ni za čitanje ni za tipkanje, pa je sve podređeno jednom pravilu:
 * **jedan klik po događaju**. Minuta se nudi, ne traži; strijelac se bira iz
 * popisa; sve ostalo je gumb.
 *
 * Dvije stvari koje izgledaju kao sitnica, a nisu:
 *
 * - **Svaki upisani događaj ima „Obriši".** Pod pritiskom se griješi, a bez
 *   poništavanja greška ostaje javno vidljiva do kraja utakmice.
 * - **Rezultat se ne upisuje.** Računa se iz golova, pa semafor na stranici
 *   ne može reći nešto drugo od tijeka ispod njega. U `utakmice` se upiše tek
 *   na kraju, kad je konačan.
 */

const VRSTE_KARTONA = [
  { vrsta: 'zuti', label: 'Žuti' },
  { vrsta: 'crveni', label: 'Crveni' },
];

export default function Uzivo() {
  const [utakmice, setUtakmice] = useState([]);
  const [igraci, setIgraci] = useState([]);
  const [odabrana, setOdabrana] = useState('');
  const [dogadaji, setDogadaji] = useState([]);
  const [postave, setPostave] = useState([]);
  const [stanje, setStanje] = useState('ucitavanje');
  const [greska, setGreska] = useState(null);
  const [minuta, setMinuta] = useState('');
  const [poluvrijeme, setPoluvrijeme] = useState(1);
  const [komentar, setKomentar] = useState('');

  /* ── učitavanje ────────────────────────────────────────────────────────── */

  useEffect(() => {
    (async () => {
      const [u, i] = await Promise.all([
        supabase.from('utakmice').select('*').order('sort_order'),
        supabase.from('igraci').select('*').order('sort_order'),
      ]);
      if (u.error) {
        setGreska(u.error.message);
        setStanje('greska');
        return;
      }
      setUtakmice(u.data ?? []);
      setIgraci(i.data ?? []);
      setStanje('spremno');

      // Teče li već prijenos, otvara se on — nakon osvježavanja stranice
      // usred utakmice operater ne bi trebao ništa tražiti.
      const uTijeku = (u.data ?? []).find((r) => r.status === 'uzivo');
      if (uTijeku) setOdabrana(uTijeku.id);
    })();
  }, []);

  const ucitajPrijenos = useCallback(async (id) => {
    if (!id) {
      setDogadaji([]);
      setPostave([]);
      return;
    }
    const [d, p] = await Promise.all([
      supabase.from('dogadaji').select('*').eq('utakmica_id', id).order('sort_order'),
      supabase.from('postave').select('*').eq('utakmica_id', id).order('sort_order'),
    ]);
    if (d.error) {
      setGreska(`Tijek se ne može učitati: ${d.error.message}`);
      return;
    }
    setDogadaji(d.data ?? []);
    setPostave(p.data ?? []);
    setGreska(null);
  }, []);

  useEffect(() => {
    ucitajPrijenos(odabrana);
  }, [odabrana, ucitajPrijenos]);

  /* ── izvedeno ──────────────────────────────────────────────────────────── */

  const redak = utakmice.find((u) => u.id === odabrana) ?? null;
  const utakmica = redak ? matchFromRow(redak, '') : null;

  const popis = useMemo(() => {
    const svi = utakmice.map((r) => matchFromRow(r, ''));
    const { nadolazece, odigrane } = razvrstaj(svi, Date.now());
    // Nadolazeće prve: na dan utakmice je prva u popisu gotovo uvijek ona
    // koja se igra.
    return [...nadolazece, ...odigrane];
  }, [utakmice]);

  const rezultat = rezultatIzDogadaja(dogadaji, true);
  const tijek = stanjePrijenosa(dogadaji);
  const feed = sloziFeed(dogadaji, igraci);
  const nasaPostava = sloziPostavu(postave, igraci, true);

  // Minuta se nudi iz zadnjeg događaja; operater je ispravi kad treba.
  useEffect(() => {
    if (tijek.minuta !== null) setMinuta(String(tijek.minuta));
    if (tijek.poluvrijeme) setPoluvrijeme(tijek.poluvrijeme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tijek.minuta, tijek.poluvrijeme]);

  /* ── upisivanje ────────────────────────────────────────────────────────── */

  const upisi = async (polja) => {
    if (!odabrana) return;
    const { error } = await upisiBezNepoznatih({ ...polja, utakmica_id: odabrana }, (p) =>
      supabase.from('dogadaji').insert(p)
    );
    if (error) {
      setGreska(
        error.message.includes('dogadaji')
          ? 'Tablica „dogadaji" još ne postoji. Pokreni supabase/schema.sql u Supabase → SQL Editor.'
          : error.message
      );
      return;
    }
    setGreska(null);
    ucitajPrijenos(odabrana);
  };

  const dogadaj = (vrsta, dodatno = {}) =>
    upisi({
      vrsta,
      minuta: minuta === '' ? null : Number(minuta),
      poluvrijeme,
      sort_order: dogadaji.length + 1,
      ...dodatno,
    });

  const obrisi = async (id) => {
    const { error } = await supabase.from('dogadaji').delete().eq('id', id);
    if (error) return setGreska(error.message);
    ucitajPrijenos(odabrana);
  };

  const postaviStatus = async (status) => {
    const polja = { status };
    if (status === 'odigrano') {
      // Konačni rezultat ide u utakmicu tek sada — odande ga čitaju traka,
      // popis rezultata i forma u tablici.
      const konacni = rezultatIzDogadaja(dogadaji, utakmica?.jeDoma ?? true);
      polja.home_score = konacni.home;
      polja.away_score = konacni.away;
    }
    const { error } = await upisiBezNepoznatih(polja, (p) =>
      supabase.from('utakmice').update(p).eq('id', odabrana)
    );
    if (error) return setGreska(error.message);
    setUtakmice((prije) => prije.map((u) => (u.id === odabrana ? { ...u, ...polja } : u)));
    setGreska(null);
  };

  /* ── prikaz ────────────────────────────────────────────────────────────── */

  if (stanje === 'ucitavanje') return <p className="anapomena">Učitavam…</p>;
  if (stanje === 'greska') return <p className="anapomena anapomena--greska">{greska}</p>;

  const teceOvdje = redak?.status === 'uzivo';

  return (
    <section className="asekcija">
      <div className="asekcija__vrh">
        <div>
          <h2 className="asekcija__naslov">Prijenos uživo</h2>
          <p className="asekcija__opis">
            Odaberi utakmicu, upiši postave i vodi tijek. Rezultat se računa iz golova — ne
            upisuje se ručno. „Kraj utakmice" upiše konačni rezultat u raspored, pa se utakmica
            odmah pojavi među odigranima.
          </p>
        </div>
      </div>

      {greska && <p className="anapomena anapomena--greska">{greska}</p>}

      <label className="apolje">
        <span className="apolje__label">Utakmica</span>
        <select
          className="apolje__input"
          value={odabrana}
          onChange={(e) => setOdabrana(e.target.value)}
        >
          <option value="">— odaberi utakmicu —</option>
          {popis.map((u) => (
            <option value={u.id} key={u.id}>
              {u.kickoff ? `${formatDatum(u.kickoff)} ${formatSat(u.kickoff)} · ` : ''}
              {u.home} — {u.away}
            </option>
          ))}
        </select>
      </label>

      {!odabrana && <p className="anapomena">Odaberi utakmicu da se otvori konzola.</p>}

      {odabrana && (
        <>
          <div className="akonzola__semafor">
            <span className={`akonzola__znak${teceOvdje ? ' je-uzivo' : ''}`}>
              {teceOvdje ? 'UŽIVO' : 'Nije u prijenosu'}
            </span>
            <span className="akonzola__rezultat">
              {utakmica.home} <strong>{rezultat.home}</strong>
              <em>:</em>
              <strong>{rezultat.away}</strong> {utakmica.away}
            </span>
            <span className="akonzola__stanje">{opisStanja(tijek)}</span>
          </div>

          <div className="akonzola__gumbi akonzola__gumbi--stanje">
            {!teceOvdje ? (
              <button type="button" className="agumb agumb--glavni" onClick={() => postaviStatus('uzivo')}>
                ▶ Uključi prijenos
              </button>
            ) : (
              <button type="button" className="agumb" onClick={() => postaviStatus('')}>
                ⏸ Isključi prijenos
              </button>
            )}
          </div>

          <Postave
            utakmicaId={odabrana}
            igraci={igraci}
            postave={postave}
            naKraju={() => ucitajPrijenos(odabrana)}
            onGreska={setGreska}
          />

          <div className="akonzola">
            <div className="akonzola__vrijeme">
              <label className="apolje apolje--broj">
                <span className="apolje__label">Minuta</span>
                <input
                  className="apolje__input"
                  type="number"
                  min="0"
                  max="60"
                  value={minuta}
                  onChange={(e) => setMinuta(e.target.value)}
                />
              </label>
              <label className="apolje apolje--broj">
                <span className="apolje__label">Poluvrijeme</span>
                <select
                  className="apolje__input"
                  value={poluvrijeme}
                  onChange={(e) => setPoluvrijeme(Number(e.target.value))}
                >
                  <option value={1}>1.</option>
                  <option value={2}>2.</option>
                </select>
              </label>
            </div>

            <div className="akonzola__gumbi">
              <Gol naslov="Gol — mi" nasa igraci={nasaPostava} onUpisi={dogadaj} />
              <Gol naslov="Gol — protivnik" nasa={false} igraci={nasaPostava} onUpisi={dogadaj} />
            </div>

            <div className="akonzola__gumbi">
              {VRSTE_KARTONA.map((k) => (
                <span className="akonzola__par" key={k.vrsta}>
                  <button type="button" className="agumb" onClick={() => dogadaj(k.vrsta, { nasa: true })}>
                    {k.label} — mi
                  </button>
                  <button type="button" className="agumb" onClick={() => dogadaj(k.vrsta, { nasa: false })}>
                    {k.label} — njima
                  </button>
                </span>
              ))}
              <button type="button" className="agumb" onClick={() => dogadaj('timeout', { nasa: true })}>
                Timeout — mi
              </button>
              <button type="button" className="agumb" onClick={() => dogadaj('timeout', { nasa: false })}>
                Timeout — njima
              </button>
            </div>

            <div className="akonzola__gumbi">
              <button type="button" className="agumb" onClick={() => dogadaj('pocetak')}>
                Početak
              </button>
              <button
                type="button"
                className="agumb"
                onClick={() => {
                  dogadaj('kraj_pol');
                  setPoluvrijeme(2);
                }}
              >
                Kraj poluvremena
              </button>
              <button
                type="button"
                className="agumb agumb--brisi"
                onClick={() => {
                  if (!window.confirm('Završiti utakmicu? Rezultat se upisuje u raspored.')) return;
                  dogadaj('kraj');
                  postaviStatus('odigrano');
                }}
              >
                Kraj utakmice
              </button>
            </div>

            <div className="akonzola__komentar">
              <label className="apolje">
                <span className="apolje__label">Komentar</span>
                <input
                  className="apolje__input"
                  value={komentar}
                  placeholder="Velika obrana Jamičića s dva metra."
                  onChange={(e) => setKomentar(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter' || !komentar.trim()) return;
                    dogadaj('komentar', { tekst: komentar.trim() });
                    setKomentar('');
                  }}
                />
              </label>
              <button
                type="button"
                className="agumb"
                disabled={!komentar.trim()}
                onClick={() => {
                  dogadaj('komentar', { tekst: komentar.trim() });
                  setKomentar('');
                }}
              >
                Upiši
              </button>
            </div>
          </div>

          <div className="akonzola__tijek">
            <span className="apolje__label">Tijek utakmice</span>
            {feed.length === 0 && <p className="anapomena">Još nema upisanih događaja.</p>}
            {feed.map((d) => (
              <div className={`akonzola__redak${d.nasa ? ' je-nas' : ''}`} key={d.id}>
                <span className="akonzola__minuta">{d.minuta === null ? '—' : `${d.minuta}'`}</span>
                <span className="akonzola__opis">
                  {d.naziv} {d.ime && `· ${d.ime}`} {d.tekst}
                </span>
                <button type="button" className="agumb agumb--brisi" onClick={() => obrisi(d.id)}>
                  Obriši
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

/**
 * Gol s odabirom strijelca.
 *
 * Strijelac se bira iz postave, a ne iz cijelog popisa igrača: u postavi ih
 * je deset, u popisu dvadeset i pet, a traži se usred utakmice. Protivnički
 * gol se upisuje bez imena — tko je zabio često se ni ne zna odmah.
 */
function Gol({ naslov, nasa, igraci, onUpisi }) {
  const [otvoreno, setOtvoreno] = useState(false);
  const svi = [...igraci.pocetna, ...igraci.klupa];

  if (!nasa || svi.length === 0) {
    return (
      <button
        type="button"
        className="agumb agumb--glavni"
        onClick={() => onUpisi('gol', { nasa })}
      >
        {naslov}
      </button>
    );
  }

  return (
    <span className="akonzola__par">
      <button type="button" className="agumb agumb--glavni" onClick={() => setOtvoreno((v) => !v)}>
        {naslov}
      </button>
      {otvoreno && (
        <span className="akonzola__strijelci">
          {svi.map((i) => (
            <button
              type="button"
              className="agumb agumb--pod"
              key={i.id}
              onClick={() => {
                onUpisi('gol', { nasa: true, igrac_id: i.igracId ?? null, ime: i.igracId ? '' : i.ime });
                setOtvoreno(false);
              }}
            >
              {i.broj !== null ? `${i.broj}. ` : ''}
              {i.ime}
            </button>
          ))}
          <button
            type="button"
            className="agumb agumb--pod"
            onClick={() => {
              onUpisi('gol', { nasa: true });
              setOtvoreno(false);
            }}
          >
            Bez strijelca
          </button>
        </span>
      )}
    </span>
  );
}

/**
 * Postave prije utakmice.
 *
 * Naši igrači idu kvačicama iz popisa — nitko neće tipkati deset imena.
 * Protivnici se lijepe kao tekst, po jedan u retku, jer ih u bazi nema i
 * nema razloga da ih bude.
 */
function Postave({ utakmicaId, igraci, postave, naKraju, onGreska }) {
  const [otvoreno, setOtvoreno] = useState(false);
  const [tekstProtivnika, setTekstProtivnika] = useState('');
  const upisani = new Set(postave.filter((p) => p.nasa && p.igrac_id).map((p) => p.igrac_id));

  const prekidac = async (igrac) => {
    const postojeci = postave.find((p) => p.igrac_id === igrac.id);
    if (postojeci) {
      const { error } = await supabase.from('postave').delete().eq('id', postojeci.id);
      if (error) return onGreska(error.message);
    } else {
      const { error } = await upisiBezNepoznatih(
        {
          utakmica_id: utakmicaId,
          nasa: true,
          igrac_id: igrac.id,
          broj: igrac.number ?? null,
          pocetna: postave.filter((p) => p.nasa && p.pocetna).length < 5,
          sort_order: postave.length + 1,
        },
        (p) => supabase.from('postave').insert(p)
      );
      if (error) {
        return onGreska(
          error.message.includes('postave')
            ? 'Tablica „postave" još ne postoji. Pokreni supabase/schema.sql.'
            : error.message
        );
      }
    }
    naKraju();
  };

  const upisiProtivnike = async () => {
    const redci = tekstProtivnika
      .split(/\r?\n/)
      .map((r) => r.trim())
      .filter(Boolean)
      .map((r, i) => {
        const m = r.match(/^(\d{1,2})[.\s]+(.+)$/);
        return {
          utakmica_id: utakmicaId,
          nasa: false,
          ime: m ? m[2].trim() : r,
          broj: m ? Number(m[1]) : null,
          pocetna: i < 5,
          sort_order: i + 1,
        };
      });
    if (!redci.length) return;

    const { error } = await supabase.from('postave').insert(redci);
    if (error) return onGreska(error.message);
    setTekstProtivnika('');
    naKraju();
  };

  return (
    <div className="akonzola__postave">
      <button
        type="button"
        className="agumb agumb--pod"
        aria-expanded={otvoreno}
        onClick={() => setOtvoreno((v) => !v)}
      >
        {otvoreno ? '▾ Sakrij postave' : `▸ Postave (${postave.length} upisanih)`}
      </button>

      {otvoreno && (
        <>
          <span className="apolje__label">Naši igrači — prvih pet je početna petorka</span>
          <div className="akonzola__kvacice">
            {igraci.map((i) => (
              <button
                type="button"
                key={i.id}
                className={`agumb agumb--pod${upisani.has(i.id) ? ' je-odabran' : ''}`}
                onClick={() => prekidac(i)}
              >
                {upisani.has(i.id) ? '✓ ' : ''}
                {i.number}. {i.name}
              </button>
            ))}
          </div>

          <label className="apolje">
            <span className="apolje__label">Protivnici — jedan po retku, npr. „7 Matić"</span>
            <textarea
              className="apolje__input apolje__input--tekst"
              rows={5}
              value={tekstProtivnika}
              onChange={(e) => setTekstProtivnika(e.target.value)}
            />
          </label>
          <button
            type="button"
            className="agumb"
            disabled={!tekstProtivnika.trim()}
            onClick={upisiProtivnike}
          >
            Upiši protivnike
          </button>
        </>
      )}
    </div>
  );
}
