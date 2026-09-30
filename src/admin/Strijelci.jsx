import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { upisiBezNepoznatih } from '../lib/postgrest';

/**
 * Strijelci jedne utakmice.
 *
 * Otvara se iz retka utakmice, na zahtjev — inače bi svaka utakmica u popisu
 * odmah povukla svoje golove iz baze, i za one koje nitko ne otvori. Isti
 * obrazac koristi i statistika igrača.
 *
 * Gol se veže uz igrača iz postave kad je naš, a kad je protivnički — upiše
 * se samo ime, jer protivničkih igrača u bazi nema i nema razloga da ih bude.
 */

const VRSTE = [
  { value: 'gol', label: 'Gol' },
  { value: 'penal', label: 'Deseterac' },
  { value: 'autogol', label: 'Autogol' },
];

export default function Strijelci({ utakmicaId, igraci }) {
  const [redovi, setRedovi] = useState([]);
  const [stanje, setStanje] = useState('ucitavanje');
  const [greska, setGreska] = useState(null);

  const ucitaj = async () => {
    const { data, error } = await supabase
      .from('strijelci')
      .select('*')
      .eq('utakmica_id', utakmicaId)
      .order('sort_order');

    if (error) {
      setGreska(error.message);
      setStanje('greska');
      return;
    }
    setRedovi(data ?? []);
    setGreska(null);
    setStanje('spremno');
  };

  useEffect(() => {
    ucitaj();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [utakmicaId]);

  const dodaj = async () => {
    const { error } = await supabase.from('strijelci').insert({
      utakmica_id: utakmicaId,
      sort_order: redovi.length + 1,
      vrsta: 'gol',
    });
    if (error) return setGreska(error.message);
    ucitaj();
  };

  const spremi = async (red) => {
    const { id, created_at: _ignore, ...polja } = red;
    const { error } = await upisiBezNepoznatih(polja, (p) =>
      supabase.from('strijelci').update(p).eq('id', id)
    );
    if (error) return setGreska(error.message);
    setGreska(null);
    ucitaj();
  };

  const obrisi = async (id) => {
    const { error } = await supabase.from('strijelci').delete().eq('id', id);
    if (error) return setGreska(error.message);
    ucitaj();
  };

  if (stanje === 'ucitavanje') return <p className="anapomena">Učitavam…</p>;
  if (stanje === 'greska') {
    return (
      <p className="anapomena anapomena--pazi">
        Strijelci se ne mogu učitati: {greska}. Ako tablice još nema, pokreni{' '}
        <code>supabase/schema.sql</code>.
      </p>
    );
  }

  return (
    <div className="astrijelci">
      <div className="astrijelci__vrh">
        <span className="apolje__label">Strijelci</span>
        <button type="button" className="agumb agumb--pod" onClick={dodaj}>
          + Dodaj gol
        </button>
      </div>

      {greska && <p className="anapomena anapomena--greska">{greska}</p>}
      {redovi.length === 0 && <p className="anapomena">Još nema upisanih golova.</p>}

      {redovi.map((red) => (
        <Gol key={red.id} red={red} igraci={igraci} onSpremi={spremi} onObrisi={obrisi} />
      ))}
    </div>
  );
}

function Gol({ red, igraci, onSpremi, onObrisi }) {
  const [nacrt, setNacrt] = useState(red);
  useEffect(() => setNacrt(red), [red]);

  const set = (kljuc) => (v) => setNacrt((n) => ({ ...n, [kljuc]: v }));
  const promijenjeno = JSON.stringify(nacrt) !== JSON.stringify(red);

  return (
    <div className="astrijelci__redak">
      <label className="apolje">
        <span className="apolje__label">Igrač</span>
        <select
          className="apolje__input"
          value={nacrt.igrac_id ?? ''}
          onChange={(e) => {
            const id = e.target.value || null;
            // Naš igrač se veže po id-u; ime se tada ne upisuje da ne bi
            // ostalo staro kad se igrač promijeni.
            setNacrt((n) => ({ ...n, igrac_id: id, ime: id ? '' : n.ime }));
          }}
        >
          <option value="">— protivnički igrač —</option>
          {igraci.map((i) => (
            <option value={i.id} key={i.id}>
              {i.number}. {i.name}
            </option>
          ))}
        </select>
      </label>

      {!nacrt.igrac_id && (
        <label className="apolje">
          <span className="apolje__label">Ime</span>
          <input
            className="apolje__input"
            value={nacrt.ime ?? ''}
            onChange={(e) => set('ime')(e.target.value)}
            placeholder="Prezime strijelca"
          />
        </label>
      )}

      <label className="apolje apolje--broj">
        <span className="apolje__label">Minuta</span>
        <input
          className="apolje__input"
          type="number"
          min="1"
          max="60"
          value={nacrt.minuta ?? ''}
          onChange={(e) => set('minuta')(e.target.value === '' ? null : Number(e.target.value))}
        />
      </label>

      <label className="apolje">
        <span className="apolje__label">Vrsta</span>
        <select className="apolje__input" value={nacrt.vrsta ?? 'gol'} onChange={(e) => set('vrsta')(e.target.value)}>
          {VRSTE.map((v) => (
            <option value={v.value} key={v.value}>
              {v.label}
            </option>
          ))}
        </select>
      </label>

      <div className="astrijelci__radnje">
        <button type="button" className="agumb" disabled={!promijenjeno} onClick={() => onSpremi(nacrt)}>
          Spremi
        </button>
        <button type="button" className="agumb agumb--brisi" onClick={() => onObrisi(red.id)}>
          Obriši
        </button>
      </div>
    </div>
  );
}
