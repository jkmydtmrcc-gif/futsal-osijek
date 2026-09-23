import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Polje } from './Polja';

/**
 * Statistika jednog igrača — redak po sezoni i natjecanju.
 *
 * Stoji unutar retka igrača, pa se učitava tek kad se taj igrač otvori:
 * učitavati statistiku za cijelu momčad odjednom bilo bi trideset upita za
 * nešto što se gleda jedan po jedan.
 */
export default function Statistika({ igracId }) {
  const [redovi, setRedovi] = useState([]);
  const [stanje, setStanje] = useState('ucitavanje');
  const [greska, setGreska] = useState(null);

  const ucitaj = useCallback(async () => {
    if (!supabase || !igracId) {
      setStanje('spremno');
      return;
    }
    const { data, error } = await supabase
      .from('igraci_statistika')
      .select('*')
      .eq('igrac_id', igracId)
      .order('sort_order');

    if (error) {
      setGreska(error.message);
      setStanje('greska');
      return;
    }
    setRedovi(data ?? []);
    setGreska(null);
    setStanje('spremno');
  }, [igracId]);

  useEffect(() => {
    ucitaj();
  }, [ucitaj]);

  const dodaj = async () => {
    const { error } = await supabase.from('igraci_statistika').insert({
      igrac_id: igracId,
      sort_order: redovi.length + 1,
      season: '',
      comp: 'SuperSport HMNL',
    });
    if (error) setGreska(error.message);
    else await ucitaj();
  };

  const spremi = async (red) => {
    const { id, created_at: _ignore, ...polja } = red;
    const { error } = await supabase.from('igraci_statistika').update(polja).eq('id', id);
    if (error) setGreska(error.message);
    else await ucitaj();
  };

  const obrisi = async (id) => {
    if (!confirm('Obrisati ovaj redak statistike?')) return;
    const { error } = await supabase.from('igraci_statistika').delete().eq('id', id);
    if (error) setGreska(error.message);
    else await ucitaj();
  };

  if (stanje === 'ucitavanje') return <p className="anapomena">Učitavam statistiku…</p>;

  return (
    <div className="astat">
      <div className="astat__vrh">
        <span className="astat__naslov">Statistika po sezonama</span>
        <button type="button" className="agumb agumb--novi" onClick={dodaj}>
          + Sezona
        </button>
      </div>

      {greska && <p className="anapomena anapomena--greska">{greska}</p>}

      {redovi.length === 0 && (
        <p className="anapomena">
          Nema upisane statistike — kartica igrača će to i reći, umjesto da pokaže same nule.
        </p>
      )}

      {redovi.map((red) => (
        <StatRedak key={red.id} red={red} onSpremi={spremi} onObrisi={obrisi} />
      ))}
    </div>
  );
}

function StatRedak({ red, onSpremi, onObrisi }) {
  const [nacrt, setNacrt] = useState(red);
  useEffect(() => setNacrt(red), [red]);

  const set = (kljuc) => (vrijednost) => setNacrt((n) => ({ ...n, [kljuc]: vrijednost }));
  const promijenjeno = JSON.stringify(nacrt) !== JSON.stringify(red);

  return (
    <div className="astat__redak">
      <Polje label="Sezona" value={nacrt.season} onChange={set('season')} placeholder="25/26" />
      <Polje label="Natjecanje" value={nacrt.comp} onChange={set('comp')} />
      <Polje label="Utakmice" type="number" value={nacrt.games} onChange={set('games')} />
      <Polje label="Golovi" type="number" value={nacrt.goals} onChange={set('goals')} />
      <Polje label="Iz penala" type="number" value={nacrt.penalties} onChange={set('penalties')} />
      <Polje label="Autogolovi" type="number" value={nacrt.own_goals} onChange={set('own_goals')} />

      <div className="astat__radnje">
        <button
          type="button"
          className="agumb agumb--glavni"
          disabled={!promijenjeno}
          onClick={() => onSpremi(nacrt)}
        >
          {promijenjeno ? 'Spremi' : 'Spremljeno'}
        </button>
        <button type="button" className="agumb agumb--opasno" onClick={() => onObrisi(red.id)}>
          Obriši
        </button>
      </div>
    </div>
  );
}
