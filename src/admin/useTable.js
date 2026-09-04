import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * Jedna tablica iz baze: učitavanje, spremanje retka, dodavanje i brisanje.
 *
 * Svaka radnja odmah osvježi popis iz baze umjesto da pogađa novo stanje —
 * tako se na ekranu vidi točno ono što je u bazi, uključujući i ono što
 * je netko drugi u međuvremenu promijenio.
 */
export default function useTable(tablica, poredakPo = 'sort_order') {
  const [redovi, setRedovi] = useState([]);
  const [stanje, setStanje] = useState('ucitavanje');
  const [greska, setGreska] = useState(null);

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

  const spremi = async (red) => {
    const { id, created_at: _ignore, ...polja } = red;
    const { error } = await supabase.from(tablica).update(polja).eq('id', id);
    if (error) {
      setGreska(error.message);
      return false;
    }
    await ucitaj();
    return true;
  };

  const dodaj = async (polja) => {
    const { error } = await supabase.from(tablica).insert(polja);
    if (error) {
      setGreska(error.message);
      return false;
    }
    await ucitaj();
    return true;
  };

  const obrisi = async (id) => {
    const { error } = await supabase.from(tablica).delete().eq('id', id);
    if (error) {
      setGreska(error.message);
      return false;
    }
    await ucitaj();
    return true;
  };

  return { redovi, stanje, greska, ucitaj, spremi, dodaj, obrisi };
}
