import { useRef, useState } from 'react';
import { supabase } from '../lib/supabase';

/** Sitni gradivni dijelovi obrazaca — da svaki uređivač ne ponavlja isto. */

export function Polje({ label, value, onChange, type = 'text', ...rest }) {
  return (
    <label className="apolje">
      <span className="apolje__label">{label}</span>
      <input
        className="apolje__input"
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        {...rest}
      />
    </label>
  );
}

export function Tekst({ label, value, onChange, rows = 3 }) {
  return (
    <label className="apolje">
      <span className="apolje__label">{label}</span>
      <textarea
        className="apolje__input apolje__input--tekst"
        rows={rows}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function Kvacica({ label, value, onChange }) {
  return (
    <label className="akvacica">
      <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

/**
 * Slika: ili se odabere datoteka (ide u Supabase Storage), ili se zalijepi
 * adresa slike s tuđe stranice. Oboje završi kao obična adresa u bazi, pa
 * stranici svejedno odakle slika dolazi.
 */
export function SlikaPolje({ label, value, onChange }) {
  const [salje, setSalje] = useState(false);
  const [greska, setGreska] = useState(null);
  const unos = useRef(null);

  const posalji = async (datoteka) => {
    if (!datoteka) return;
    setSalje(true);
    setGreska(null);

    const nastavak = datoteka.name.split('.').pop()?.toLowerCase() || 'jpg';
    const naziv = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${nastavak}`;

    const { error } = await supabase.storage
      .from('shop')
      .upload(naziv, datoteka, { cacheControl: '31536000', upsert: false });

    if (error) {
      setGreska(error.message);
      setSalje(false);
      return;
    }

    const { data } = supabase.storage.from('shop').getPublicUrl(naziv);
    onChange(data.publicUrl);
    setSalje(false);
    if (unos.current) unos.current.value = '';
  };

  return (
    <div className="apolje aslika">
      <span className="apolje__label">{label}</span>

      {value ? (
        <div className="aslika__pregled">
          <img src={value} alt="" />
          <button type="button" className="agumb agumb--brisi" onClick={() => onChange('')}>
            Ukloni
          </button>
        </div>
      ) : (
        <div className="aslika__prazno">nema slike</div>
      )}

      <input
        ref={unos}
        className="aslika__unos"
        type="file"
        accept="image/*"
        disabled={salje}
        onChange={(e) => posalji(e.target.files?.[0])}
      />

      <input
        className="apolje__input"
        type="url"
        placeholder="…ili zalijepi adresu slike"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />

      {salje && <span className="aslika__stanje">Šaljem…</span>}
      {greska && <span className="aslika__stanje aslika__stanje--greska">{greska}</span>}
    </div>
  );
}
