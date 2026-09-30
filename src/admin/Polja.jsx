import { useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { pripremiPortret, pripremiSliku } from '../lib/slika';
import { spojiDatumVrijeme, razdvojiDatumVrijeme } from '../lib/vrijeme';

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

/**
 * Broj koji smije biti prazan.
 *
 * Obično `Polje type="number"` radi `Number('')` → `0`. Za rezultat je to
 * kriva vrijednost: prazno znači „još nije odigrano", a `0` znači „primili su
 * nula golova". Bez ove razlike bi svaka nadolazeća utakmica izgledala kao
 * 0:0.
 */
export function Broj({ label, value, onChange, ...rest }) {
  return (
    <label className="apolje apolje--broj">
      <span className="apolje__label">{label}</span>
      <input
        className="apolje__input"
        type="number"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        {...rest}
      />
    </label>
  );
}

/**
 * Termin utakmice: domaći odabir datuma i sata.
 *
 * Dva domaća polja umjesto jednog `datetime-local` — `datetime-local` je na
 * dijelu preglednika i dalje obično tekstualno polje, a nitko neće tipkati
 * `2026-10-17T19:00`. Spajaju se uz pomak zagrebačke zone koji vrijedi baš
 * tog datuma, pa utakmica u noći prijelaza na ljetno vrijeme ne ispadne sat
 * krivo.
 */
export function DatumVrijeme({ label, value, onChange }) {
  const { datum, vrijeme } = razdvojiDatumVrijeme(value);

  const promijeni = (noviDatum, novoVrijeme) => {
    if (!noviDatum) return onChange(null);
    onChange(spojiDatumVrijeme(noviDatum, novoVrijeme || '00:00'));
  };

  return (
    <div className="apolje apolje--termin">
      <span className="apolje__label">{label}</span>
      <div className="atermin">
        <input
          className="apolje__input"
          type="date"
          value={datum}
          onChange={(e) => promijeni(e.target.value, vrijeme)}
          aria-label={`${label} — datum`}
        />
        <input
          className="apolje__input apolje__input--sat"
          type="time"
          value={vrijeme}
          onChange={(e) => promijeni(datum, e.target.value)}
          aria-label={`${label} — sat`}
        />
      </div>
    </div>
  );
}

/** Odabir iz zadanog popisa (status utakmice, vrsta gola…). */
export function Odabir({ label, value, onChange, opcije }) {
  return (
    <label className="apolje">
      <span className="apolje__label">{label}</span>
      <select className="apolje__input" value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
        {opcije.map((o) => (
          <option value={o.value} key={o.value}>
            {o.label}
          </option>
        ))}
      </select>
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
 *
 * Uz `portret` se prije slanja automatski reže pozadina i slika obrezuje na
 * igrača. Rezultat se **uvijek** prvo pokaže: automatika ne može znati je li
 * pogodila, a bijeli dres pred bijelim zidom nema granicu koju bi se moglo
 * naći. Zato uz svaki rez stoji i gumb „Pošalji original“.
 */
export function SlikaPolje({ label, value, onChange, portret = false }) {
  const [salje, setSalje] = useState(false);
  const [greska, setGreska] = useState(null);
  const [radi, setRadi] = useState(false);
  const [prijedlog, setPrijedlog] = useState(null);
  const [prag, setPrag] = useState(28);
  const unos = useRef(null);
  const izvornik = useRef(null);

  /* Pregled živi kao objektna adresa; bez oslobađanja curi memorija. */
  useEffect(
    () => () => {
      if (prijedlog?.url) URL.revokeObjectURL(prijedlog.url);
      if (prijedlog?.izvorUrl) URL.revokeObjectURL(prijedlog.izvorUrl);
    },
    [prijedlog]
  );

  const posalji = async (blob, nastavak) => {
    setSalje(true);
    setGreska(null);

    const naziv = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${nastavak}`;
    const { error } = await supabase.storage
      .from('shop')
      .upload(naziv, blob, { cacheControl: '31536000', upsert: false, contentType: blob.type });

    if (error) {
      setGreska(error.message);
      setSalje(false);
      return;
    }

    const { data } = supabase.storage.from('shop').getPublicUrl(naziv);
    onChange(data.publicUrl);
    setSalje(false);
    setPrijedlog(null);
    izvornik.current = null;
    if (unos.current) unos.current.value = '';
  };

  /* Rez se može ponoviti s drugom osjetljivošću bez novog odabira datoteke. */
  const izreziIznova = async (noviPrag, datoteka = izvornik.current) => {
    if (!datoteka) return;
    setRadi(true);
    setGreska(null);
    try {
      const rez = await pripremiPortret(datoteka, { prag: noviPrag });
      setPrijedlog((staro) => {
        if (staro?.url) URL.revokeObjectURL(staro.url);
        return {
          ...rez,
          url: URL.createObjectURL(rez.blob),
          izvorUrl: staro?.izvorUrl ?? URL.createObjectURL(datoteka),
        };
      });
    } catch (e) {
      setGreska(`Slika se nije dala obraditi: ${e.message}`);
    }
    setRadi(false);
  };

  const odabrano = async (datoteka) => {
    if (!datoteka) return;
    setGreska(null);

    if (!portret) {
      setRadi(true);
      try {
        const { blob, nastavak } = await pripremiSliku(datoteka);
        await posalji(blob, nastavak);
      } catch (e) {
        setGreska(`Slika se nije dala obraditi: ${e.message}`);
      }
      setRadi(false);
      return;
    }

    izvornik.current = datoteka;
    await izreziIznova(prag, datoteka);
  };

  const posaljiOriginal = async () => {
    if (!izvornik.current) return;
    setRadi(true);
    try {
      const { blob, nastavak } = await pripremiSliku(izvornik.current, { maxSirina: 900 });
      await posalji(blob, nastavak);
    } catch (e) {
      setGreska(`Slika se nije dala obraditi: ${e.message}`);
    }
    setRadi(false);
  };

  const odustani = () => {
    setPrijedlog(null);
    izvornik.current = null;
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

      {prijedlog && (
        <div className="arez">
          <div className="arez__par">
            <figure className="arez__stavka">
              <img src={prijedlog.izvorUrl} alt="" />
              <figcaption>Original</figcaption>
            </figure>
            <figure className="arez__stavka arez__stavka--rez">
              <img src={prijedlog.url} alt="" />
              <figcaption>Bez pozadine</figcaption>
            </figure>
          </div>

          <p className={`arez__ocjena${prijedlog.ocjena.ok ? '' : ' arez__ocjena--pazi'}`}>
            {prijedlog.ocjena.poruka} Slika je {prijedlog.sirina}×{prijedlog.visina}.
          </p>

          <label className="arez__klizac">
            <span>
              Osjetljivost <b>{prag}</b>
            </span>
            <input
              type="range"
              min="12"
              max="60"
              value={prag}
              disabled={radi}
              onChange={(e) => setPrag(Number(e.target.value))}
              onMouseUp={(e) => izreziIznova(Number(e.target.value))}
              onTouchEnd={(e) => izreziIznova(Number(e.target.value))}
              onKeyUp={(e) => izreziIznova(Number(e.target.value))}
            />
            <span className="arez__savjet">
              Veći broj reže više. Ako je nestao dio igrača — smanji.
            </span>
          </label>

          <div className="arez__gumbi">
            <button
              type="button"
              className="agumb agumb--glavni"
              disabled={salje || radi}
              onClick={() => posalji(prijedlog.blob, prijedlog.nastavak)}
            >
              Spremi bez pozadine
            </button>
            <button type="button" className="agumb" disabled={salje || radi} onClick={posaljiOriginal}>
              Pošalji original
            </button>
            <button type="button" className="agumb" disabled={salje} onClick={odustani}>
              Odustani
            </button>
          </div>
        </div>
      )}

      <input
        ref={unos}
        className="aslika__unos"
        type="file"
        accept="image/*"
        disabled={salje || radi}
        onChange={(e) => odabrano(e.target.files?.[0])}
      />

      <input
        className="apolje__input"
        type="url"
        placeholder="…ili zalijepi adresu slike"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />

      {radi && <span className="aslika__stanje">Obrađujem sliku…</span>}
      {salje && <span className="aslika__stanje">Šaljem…</span>}
      {greska && <span className="aslika__stanje aslika__stanje--greska">{greska}</span>}
    </div>
  );
}
