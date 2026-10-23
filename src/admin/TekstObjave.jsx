import { useLayoutEffect, useRef, useState } from 'react';
import Oblikovano from '../components/Oblikovano';
import { omotaj, oznaciRetke, umetni } from '../lib/oblikovanje';

/**
 * Polje za tekst objave s alatnom trakom: podebljano, kurziv, podcrtano,
 * podnaslov, popisi, citat, poveznica i emotikoni — uz pregled kako će
 * tekst izgledati na stranici.
 *
 * U bazu ide običan tekst s oznakama (`**podebljano**`, `*kurziv*` …), pa
 * se oznake mogu i ručno pisati, a tekst zalijepljen iz Worda ili s mreža
 * ne donosi skrivene stilove. Gumbi samo umeću te oznake oko odabira.
 */
const EMOTIKONI = [
  '⚽', '🥅', '🏆', '🥇', '🥈', '🥉', '🎯', '🏟️',
  '🔥', '💪', '👏', '🙌', '🎉', '🥳', '👊', '🙏',
  '💙', '🤍', '❤️', '🇭🇷', '⭐', '🚀', '✅', '❌',
  '📅', '🕖', '📍', '🎟️', '📸', '🎥', '📣', '📰',
  '😀', '😁', '😂', '😍', '🤩', '😎', '😮', '😢',
  '😡', '🤝', '👍', '👎', '👉', '⬆️', '➡️', '‼️',
];

/* `vrsta` kaže što gumb radi: omata odabir, označava retke ili otvara
   prozorčić. `kratica` je tipka uz Ctrl / Cmd. */
const GUMBI = [
  { id: 'b', natpis: 'B', naslov: 'Podebljano (Ctrl+B)', vrsta: 'omot', oznaka: '**', primjer: 'podebljani tekst', kratica: 'b', stil: { fontWeight: 900 } },
  { id: 'i', natpis: 'I', naslov: 'Kurziv (Ctrl+I)', vrsta: 'omot', oznaka: '*', primjer: 'kurziv', kratica: 'i', stil: { fontStyle: 'italic' } },
  { id: 'u', natpis: 'U', naslov: 'Podcrtano (Ctrl+U)', vrsta: 'omot', oznaka: '__', primjer: 'podcrtani tekst', kratica: 'u', stil: { textDecoration: 'underline' } },
  { id: 'h', natpis: 'Podnaslov', naslov: 'Podnaslov', vrsta: 'redak', redak: 'h' },
  { id: 'ul', natpis: '• Popis', naslov: 'Popis s točkicama', vrsta: 'redak', redak: 'ul' },
  { id: 'ol', natpis: '1. Popis', naslov: 'Numerirani popis', vrsta: 'redak', redak: 'ol' },
  { id: 'citat', natpis: '❝ Citat', naslov: 'Citat (npr. izjava trenera)', vrsta: 'redak', redak: 'citat' },
  { id: 'a', natpis: '🔗 Poveznica', naslov: 'Poveznica (Ctrl+K)', vrsta: 'poveznica', kratica: 'k' },
];

export default function TekstObjave({ label, value, onChange, rows = 10 }) {
  // Stare objave mogu u bazi stajati i kao niz odlomaka.
  const tekst = Array.isArray(value) ? value.join('\n\n') : (value ?? '');
  const polje = useRef(null);
  const odabirPoslije = useRef(null);
  const [emotikoni, setEmotikoni] = useState(false);
  const [pregled, setPregled] = useState(false);

  // Odabir se vraća tek nakon što React upiše novi tekst u polje — inače bi
  // ga upis pomaknuo na kraj.
  useLayoutEffect(() => {
    const o = odabirPoslije.current;
    if (!o || !polje.current) return;
    odabirPoslije.current = null;
    polje.current.focus();
    polje.current.setSelectionRange(o.od, o.do);
  });

  const primijeni = (fn) => {
    const el = polje.current;
    const od = el ? el.selectionStart : tekst.length;
    const do_ = el ? el.selectionEnd : tekst.length;
    const r = fn(tekst, od, do_);
    odabirPoslije.current = { od: r.od, do: r.do };
    onChange(r.tekst);
  };

  const pokreni = (g) => {
    if (g.vrsta === 'omot') return primijeni((t, od, do_) => omotaj(t, od, do_, g.oznaka, g.primjer));
    if (g.vrsta === 'redak') return primijeni((t, od, do_) => oznaciRetke(t, od, do_, g.redak));
    if (g.vrsta === 'poveznica') {
      const adresa = window.prompt('Adresa poveznice (npr. https://… ili /raspored):', 'https://');
      if (!adresa || adresa === 'https://') return;
      return primijeni((t, od, do_) => {
        const natpis = t.slice(od, do_).trim() || 'ovdje';
        const r = umetni(t, od, do_, `[${natpis}](${adresa.trim()})`);
        return { tekst: r.tekst, od: od + 1, do: od + 1 + natpis.length };
      });
    }
  };

  const tipka = (e) => {
    if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
    const g = GUMBI.find((x) => x.kratica === e.key.toLowerCase());
    if (!g) return;
    e.preventDefault();
    pokreni(g);
  };

  return (
    <div className="apolje apolje--puna atekst">
      <span className="apolje__label">{label}</span>

      <div className="atekst__traka" role="toolbar" aria-label="Oblikovanje teksta">
        {GUMBI.map((g) => (
          <button
            type="button"
            className="atekst__gumb"
            title={g.naslov}
            aria-label={g.naslov}
            style={g.stil}
            // `mousedown` bi inače maknuo fokus s polja i izgubio odabir.
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => pokreni(g)}
            key={g.id}
          >
            {g.natpis}
          </button>
        ))}
        <button
          type="button"
          className={`atekst__gumb${emotikoni ? ' je-ukljucen' : ''}`}
          title="Emotikoni"
          aria-expanded={emotikoni}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setEmotikoni((v) => !v)}
        >
          😀 Emotikoni
        </button>
        <span className="atekst__razmak" />
        <button
          type="button"
          className={`atekst__gumb${pregled ? ' je-ukljucen' : ''}`}
          aria-pressed={pregled}
          onClick={() => setPregled((v) => !v)}
        >
          👁 Pregled
        </button>
      </div>

      {emotikoni && (
        <div className="atekst__emotikoni" role="group" aria-label="Umetni emotikon">
          {EMOTIKONI.map((em) => (
            <button
              type="button"
              className="atekst__emotikon"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => primijeni((t, od, do_) => umetni(t, od, do_, em))}
              key={em}
            >
              {em}
            </button>
          ))}
        </div>
      )}

      <textarea
        ref={polje}
        className="apolje__input apolje__input--tekst atekst__polje"
        rows={rows}
        value={tekst}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={tipka}
        aria-label={label}
      />

      <span className="atekst__pomoc">
        Prazan red = novi odlomak · <b>**podebljano**</b> · <i>*kurziv*</i> · __podcrtano__ ·
        ## podnaslov · - popis · &gt; citat · [natpis](https://adresa)
      </span>

      {pregled && (
        <div className="atekst__pregled post__tekst" aria-label="Pregled teksta">
          {tekst.trim() ? <Oblikovano tekst={tekst} /> : <p className="prose">Tekst je prazan.</p>}
        </div>
      )}
    </div>
  );
}
