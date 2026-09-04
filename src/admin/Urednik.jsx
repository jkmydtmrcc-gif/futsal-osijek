import { useEffect, useState } from 'react';
import useTable from './useTable';

/**
 * Zajednički uređivač jedne tablice.
 *
 * Svaki redak je vlastiti obrazac s vlastitim "Spremi" — namjerno, jer je
 * jedno veliko spremanje svega odjednom teže razumjeti i lakše slučajno
 * pregaziti tuđu izmjenu.
 */
export default function Urednik({ naslov, opis, tablica, poredakPo, polja, prazan, opisRetka }) {
  const { redovi, stanje, greska, spremi, dodaj, obrisi } = useTable(tablica, poredakPo);

  if (stanje === 'ucitavanje') return <p className="anapomena">Učitavam…</p>;
  if (stanje === 'nespojeno')
    return <p className="anapomena anapomena--greska">Supabase nije spojen — provjeri varijable okoline.</p>;

  return (
    <section className="asekcija">
      <div className="asekcija__vrh">
        <div>
          <h2 className="asekcija__naslov">{naslov}</h2>
          {opis && <p className="asekcija__opis">{opis}</p>}
        </div>
        <button type="button" className="agumb agumb--novi" onClick={() => dodaj(prazan(redovi))}>
          + Dodaj
        </button>
      </div>

      {greska && <p className="anapomena anapomena--greska">{greska}</p>}

      {redovi.length === 0 && <p className="anapomena">Još nema unosa. Klikni „Dodaj”.</p>}

      <div className="alista">
        {redovi.map((red) => (
          <Redak
            key={red.id}
            red={red}
            polja={polja}
            opisRetka={opisRetka}
            onSpremi={spremi}
            onObrisi={obrisi}
          />
        ))}
      </div>
    </section>
  );
}

function Redak({ red, polja, opisRetka, onSpremi, onObrisi }) {
  const [nacrt, setNacrt] = useState(red);
  const [stanje, setStanje] = useState('mirno');

  // Kad se popis osvježi iz baze, obrazac prati novo stanje.
  useEffect(() => setNacrt(red), [red]);

  const promijenjeno = JSON.stringify(nacrt) !== JSON.stringify(red);

  const spremi = async () => {
    setStanje('spremam');
    const ok = await onSpremi(nacrt);
    setStanje(ok ? 'spremljeno' : 'greska');
    if (ok) setTimeout(() => setStanje('mirno'), 1600);
  };

  const postavi = (kljuc) => (v) => setNacrt((n) => ({ ...n, [kljuc]: v }));

  return (
    <article className={`akartica${promijenjeno ? ' je-promijenjena' : ''}`}>
      <header className="akartica__vrh">
        <span className="akartica__naslov">{opisRetka(nacrt)}</span>
        <div className="akartica__radnje">
          <button
            type="button"
            className="agumb"
            onClick={spremi}
            disabled={!promijenjeno || stanje === 'spremam'}
          >
            {stanje === 'spremam' ? 'Spremam…' : stanje === 'spremljeno' ? 'Spremljeno ✓' : 'Spremi'}
          </button>
          <button
            type="button"
            className="agumb agumb--brisi"
            onClick={() => {
              if (window.confirm(`Obrisati „${opisRetka(nacrt)}”? Ovo se ne može vratiti.`)) {
                onObrisi(red.id);
              }
            }}
          >
            Obriši
          </button>
        </div>
      </header>

      <div className="akartica__polja">{polja(nacrt, postavi)}</div>
    </article>
  );
}
