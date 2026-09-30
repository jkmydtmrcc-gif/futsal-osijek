import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { rasclaniRaspored } from '../lib/utakmice';
import { spojiDatumVrijeme } from '../lib/vrijeme';
import { Polje } from './Polja';
import { oblik, sBrojem } from '../lib/tekst';

/**
 * Uvoz cijelog kola lijepljenjem.
 *
 * Bez ovoga ostatak ne vrijedi ništa: traka s utakmicom, podjela na odigrano
 * i nadolazeće i forma u tablici sve rade na pravim terminima — a nitko neće
 * kroz obrazac utipkati 22 termina, jedan po jedan.
 *
 * Označi se kolo na HNS Semaforu (`semafor.hns.family` → SuperSport HMNL) ili
 * u klupskom rasporedu, zalijepi ovdje, pogleda što je pročitano i tek onda
 * upiše. Redak koji se ne da pročitati **ostaje vidljiv** s razlogom — tiho
 * preskakanje bi značilo da klub misli da je upisao cijelo kolo, a fali mu
 * utakmica.
 */
export default function UvozRasporeda({ naKraju }) {
  const [tekst, setTekst] = useState('');
  const [comp, setComp] = useState('SuperSport HMNL');
  const [venue, setVenue] = useState('Športska dvorana Zrinjevac');
  const [godina, setGodina] = useState(new Date().getFullYear());
  const [redci, setRedci] = useState(null);
  const [stanje, setStanje] = useState('mirno');
  const [poruka, setPoruka] = useState(null);

  const pretvori = () => {
    setPoruka(null);
    setRedci(rasclaniRaspored(tekst, { godina: Number(godina), comp, venue }));
  };

  const dobri = (redci ?? []).filter((r) => !r.greska);
  const sporni = (redci ?? []).filter((r) => r.greska);

  const upisi = async () => {
    if (!dobri.length) return;
    setStanje('upisujem');
    setPoruka(null);

    const { data: postojeci } = await supabase.from('utakmice').select('id');
    const pocetak = (postojeci?.length ?? 0) + 1;

    const { error } = await supabase.from('utakmice').insert(
      dobri.map((r, i) => ({
        sort_order: pocetak + i,
        kickoff: spojiDatumVrijeme(r.datum, r.vrijeme),
        comp: r.comp,
        home: r.home,
        away: r.away,
        venue: r.venue,
        // Stari stupci se pune također, da redak izgleda ispravno i ako se
        // stranica negdje još osloni na njih.
        when: '',
        title: `${r.home} — ${r.away}`,
      }))
    );

    if (error) {
      setPoruka({ vrsta: 'greska', tekst: error.message });
      setStanje('mirno');
      return;
    }

    setPoruka({ vrsta: 'ok', tekst: `Upisano ${dobri.length} utakmica.` });
    setTekst('');
    setRedci(null);
    setStanje('mirno');
    naKraju?.();
  };

  return (
    <section className="asekcija auvoz">
      <div className="asekcija__vrh">
        <div>
          <h2 className="asekcija__naslov">Uvoz rasporeda</h2>
          <p className="asekcija__opis">
            Zalijepi kolo s HNS Semafora ili iz klupskog rasporeda. Prvo se pokaže što je
            pročitano, upis ide tek na tvoju potvrdu.
          </p>
        </div>
      </div>

      <div className="auvoz__postavke">
        <Polje label="Natjecanje" value={comp} onChange={setComp} />
        <Polje label="Dvorana (kad je nema u retku)" value={venue} onChange={setVenue} />
        <Polje label="Godina (kad je nema u datumu)" type="number" value={godina} onChange={setGodina} />
      </div>

      <label className="apolje">
        <span className="apolje__label">Zalijepi ovdje</span>
        <textarea
          className="apolje__input apolje__input--tekst"
          rows={8}
          value={tekst}
          onChange={(e) => setTekst(e.target.value)}
          placeholder={'17.10.2026. 19:00  Osijek Kandit - Futsal Dinamo  Zrinjevac\n24.10. 19:00  Olmissum — Osijek Kandit'}
        />
      </label>

      <div className="auvoz__gumbi">
        <button type="button" className="agumb" onClick={pretvori} disabled={!tekst.trim()}>
          Pretvori
        </button>
        {dobri.length > 0 && (
          <button
            type="button"
            className="agumb agumb--glavni"
            onClick={upisi}
            disabled={stanje === 'upisujem'}
          >
            {stanje === 'upisujem'
              ? 'Upisujem…'
              : `Upiši ${sBrojem(dobri.length, 'utakmicu', 'utakmice', 'utakmica')}`}
          </button>
        )}
      </div>

      {poruka && (
        <p className={`anapomena ${poruka.vrsta === 'ok' ? 'anapomena--ok' : 'anapomena--greska'}`}>
          {poruka.tekst}
        </p>
      )}

      {redci && redci.length === 0 && <p className="anapomena">Nije pročitan nijedan redak.</p>}

      {redci && redci.length > 0 && (
        <>
          {sporni.length > 0 && (
            <p className="anapomena anapomena--pazi">
              {sBrojem(sporni.length, 'redak', 'retka', 'redaka')} se ne{' '}
              {oblik(sporni.length, 'da', 'daju', 'da')} pročitati i{' '}
              {oblik(sporni.length, 'neće biti upisan', 'neće biti upisana', 'neće biti upisano')}.
              Ispravi {oblik(sporni.length, 'ga', 'ih', 'ih')} u tekstu iznad pa ponovno klikni
              „Pretvori".
            </p>
          )}

          <div className="auvoz__pregled">
            {redci.map((r) => (
              <div className={`auvoz__redak${r.greska ? ' je-sporan' : ''}`} key={r.redniBroj}>
                <span className="auvoz__kad">{r.greska ? '—' : `${r.datum} ${r.vrijeme}`}</span>
                <span className="auvoz__susret">
                  {r.greska ? r.izvor : `${r.home} — ${r.away}`}
                </span>
                <span className="auvoz__dvorana">{r.greska ? r.greska : r.venue}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
