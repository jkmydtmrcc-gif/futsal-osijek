import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { upisiBezNepoznatih } from '../lib/postgrest';

/**
 * Jedna tablica iz baze: učitavanje, spremanje retka, dodavanje i brisanje.
 *
 * Svaka radnja odmah osvježi popis iz baze umjesto da pogađa novo stanje —
 * tako se na ekranu vidi točno ono što je u bazi, uključujući i ono što
 * je netko drugi u međuvremenu promijenio.
 *
 * Shemu nadograđuje vlasnik ručno, pokretanjem `supabase/schema.sql`. Između
 * objave nove verzije stranice i tog trenutka obrazac zna imati polje kojem u
 * bazi nema stupca. Supabase tada odbija **cijeli** redak, pa se ne bi moglo
 * promijeniti ni ime igrača. Zato se takvo polje izbaci i upis ponovi, a
 * njegovo ime izađe kao `neupisano` — da sučelje može reći što nije spremljeno
 * umjesto da šuti.
 */
export default function useTable(tablica, poredakPo = 'sort_order') {
  const [redovi, setRedovi] = useState([]);
  const [stanje, setStanje] = useState('ucitavanje');
  const [greska, setGreska] = useState(null);
  const [neupisano, setNeupisano] = useState([]);

  const ucitaj = useCallback(async () => {
    if (!supabase) {
      setStanje('nespojeno');
      return;
    }
    setStanje('ucitavanje');
    const { data, error } = await supabase.from(tablica).select('*').order(poredakPo);
    if (error) {
      setGreska(error.message);
      setStanje('greska');
      return;
    }
    setRedovi(data ?? []);
    setGreska(null);
    setStanje('spremno');
  }, [tablica, poredakPo]);

  useEffect(() => {
    ucitaj();
  }, [ucitaj]);

  /** Upis koji preskače stupce kojih u bazi još nema. */
  const upisi = async (polja, posalji) => {
    const { error, izbaceno } = await upisiBezNepoznatih(polja, posalji);
    if (izbaceno.length) setNeupisano((prije) => [...new Set([...prije, ...izbaceno])]);
    if (error) {
      setGreska(error.message);
      return false;
    }
    setGreska(null);
    await ucitaj();
    return true;
  };

  const spremi = async (red) => {
    const { id, created_at: _ignore, ...polja } = red;
    return upisi(polja, (p) => supabase.from(tablica).update(p).eq('id', id));
  };

  const dodaj = async (polja) => upisi(polja, (p) => supabase.from(tablica).insert(p));

  const obrisi = async (id) => {
    const { error } = await supabase.from(tablica).delete().eq('id', id);
    if (error) {
      setGreska(error.message);
      return false;
    }
    await ucitaj();
    return true;
  };

  return { redovi, stanje, greska, neupisano, ucitaj, spremi, dodaj, obrisi };
}
