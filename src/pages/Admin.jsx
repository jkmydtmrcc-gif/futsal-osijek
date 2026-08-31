import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  loadContent,
  saveContent,
  resetContent,
  hasStoredContent,
  toJson,
  fromJson,
} from '../content/store';
import { DEFAULT_CONTENT } from '../content/defaults';
import * as S from '../admin/sections';

/**
 * Lozinka je obična zapreka, ne zaštita.
 *
 * Stranica je statična i sve što je u njoj završi u JavaScriptu koji svatko
 * može pročitati — tko zna gdje gledati, vidjet će i ovu lozinku. Ona
 * sprječava slučajan ulazak, ništa više. Prava zaštita traži poslužitelj i
 * prijavu, a to je posao za sljedeći korak (npr. mali CMS ili Netlify/
 * Vercel funkcija s korisničkim računima).
 */
const LOZINKA = 'kandit2002';
const KLJUC_PRIJAVE = 'mnk-osijek-kandit:admin';

const KARTICE = [
  { id: 'slike', label: 'Slike', Component: S.Slike },
  { id: 'naslovnica', label: 'Naslovnica', Component: S.Naslovnica },
  { id: 'novosti', label: 'Novosti', Component: S.Novosti },
  { id: 'momcad', label: 'Momčad', Component: S.Momcad },
  { id: 'liga', label: 'Tablica i raspored', Component: S.Liga },
  { id: 'shop', label: 'Fan Shop', Component: S.Shop },
  { id: 'klub', label: 'O klubu', Component: S.Klub },
  { id: 'kontakt', label: 'Kontakt i ulaznice', Component: S.Kontakt },
  { id: 'stranice', label: 'Zaglavlja stranica', Component: S.Stranice },
];

/** Postavlja vrijednost duboko u objektu, bez mijenjanja izvornika. */
function setIn(obj, path, value) {
  const [head, ...rest] = path.split('.');
  if (rest.length === 0) return { ...obj, [head]: value };
  return { ...obj, [head]: setIn(obj[head] ?? {}, rest.join('.'), value) };
}

const clone = (v) => JSON.parse(JSON.stringify(v));

export default function Admin() {
  const [prijavljen, setPrijavljen] = useState(
    () => sessionStorage.getItem(KLJUC_PRIJAVE) === 'da'
  );

  if (!prijavljen) return <Prijava onOk={() => setPrijavljen(true)} />;
  return <Ploca onOdjava={() => setPrijavljen(false)} />;
}

/* --- Prijava --------------------------------------------------------------- */
function Prijava({ onOk }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (value === LOZINKA) {
      sessionStorage.setItem(KLJUC_PRIJAVE, 'da');
      onOk();
    } else {
      setError('Kriva lozinka.');
    }
  };

  return (
    <div className="adm adm--gate">
      <form className="adm-gate" onSubmit={submit}>
        <span className="adm-gate__eyebrow">MNK Osijek Kandit</span>
        <h1 className="adm-gate__title">Administracija</h1>
        <p className="adm-gate__lead">Uređivanje sadržaja stranice.</p>

        <label className="adm-field">
          <span className="adm-field__label">Lozinka</span>
          <input
            className="adm-input"
            type="password"
            value={value}
            autoFocus
            onChange={(e) => {
              setValue(e.target.value);
              setError('');
            }}
          />
        </label>

        {error && <span className="adm-error">{error}</span>}

        <button type="submit" className="adm-btn adm-btn--primary">
          Prijava
        </button>

        <Link className="adm-gate__back" to="/">
          ← Natrag na stranicu
        </Link>
      </form>
    </div>
  );
}

/* --- Ploča ----------------------------------------------------------------- */
function Ploca({ onOdjava }) {
  const [draft, setDraft] = useState(() => clone(loadContent()));
  const [tab, setTab] = useState(KARTICE[0].id);
  const [dirty, setDirty] = useState(false);
  const [poruka, setPoruka] = useState(hasStoredContent() ? 'Učitane su spremljene izmjene.' : '');
  const fileRef = useRef(null);

  const set = useCallback((path, value) => {
    setDraft((d) => setIn(d, path, value));
    setDirty(true);
    setPoruka('');
  }, []);

  // Zatvaranje kartice s nespremljenim izmjenama traži potvrdu preglednika.
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const spremi = () => {
    const res = saveContent(draft);
    if (res.ok) {
      setDirty(false);
      setPoruka('Spremljeno. Izmjene su odmah vidljive na stranici.');
    } else if (res.error === 'puno') {
      setPoruka(
        'Pohrana preglednika je puna — najčešće zbog slika odabranih s računala. ' +
          'Ubaci slike u public/uploads/ i upiši putanju umjesto njih.'
      );
    } else {
      setPoruka('Spremanje nije uspjelo.');
    }
  };

  const vrati = () => {
    if (!confirm('Vratiti sav sadržaj na zadano? Sve izmjene u ovom pregledniku se brišu.')) return;
    resetContent();
    setDraft(clone(DEFAULT_CONTENT));
    setDirty(false);
    setPoruka('Vraćeno na zadani sadržaj.');
  };

  const izvezi = () => {
    const blob = new Blob([toJson(draft)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mnk-osijek-kandit-sadrzaj-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const uvezi = async (file) => {
    if (!file) return;
    try {
      setDraft(fromJson(await file.text()));
      setDirty(true);
      setPoruka('Datoteka je učitana. Provjeri sadržaj pa klikni Spremi.');
    } catch (err) {
      setPoruka(`Uvoz nije uspio: ${err.message}`);
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const odjava = () => {
    if (dirty && !confirm('Imaš nespremljene izmjene. Odjaviti se?')) return;
    sessionStorage.removeItem(KLJUC_PRIJAVE);
    onOdjava();
  };

  const Aktivna = useMemo(
    () => KARTICE.find((k) => k.id === tab)?.Component ?? (() => null),
    [tab]
  );

  return (
    <div className="adm">
      <header className="adm-top">
        <div className="adm-top__left">
          <span className="adm-top__mark">MNK Osijek Kandit</span>
          <h1 className="adm-top__title">Administracija</h1>
        </div>

        <div className="adm-top__tools">
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            hidden
            onChange={(e) => uvezi(e.target.files?.[0])}
          />
          <Link className="adm-btn adm-btn--ghost" to="/" target="_blank" rel="noreferrer">
            Otvori stranicu ↗
          </Link>
          <button type="button" className="adm-btn adm-btn--ghost" onClick={() => fileRef.current?.click()}>
            Uvezi JSON
          </button>
          <button type="button" className="adm-btn adm-btn--ghost" onClick={izvezi}>
            Izvezi JSON
          </button>
          <button type="button" className="adm-btn adm-btn--ghost" onClick={vrati}>
            Vrati zadano
          </button>
          <button type="button" className="adm-btn adm-btn--ghost" onClick={odjava}>
            Odjava
          </button>
          <button
            type="button"
            className={`adm-btn adm-btn--primary${dirty ? ' is-dirty' : ''}`}
            onClick={spremi}
          >
            {dirty ? 'Spremi izmjene' : 'Spremljeno'}
          </button>
        </div>
      </header>

      <p className="adm-warn">
        Izmjene se spremaju <b>u ovaj preglednik</b>, a ne na poslužitelj — stranica je
        statična i nema bazu. Posjetitelji vide sadržaj iz koda. Da izmjene postanu
        javne: klikni <b>Izvezi JSON</b> i pošalji datoteku onome tko održava stranicu
        (sadržaj se ubaci u repozitorij), ili je na drugom računalu učitaj preko{' '}
        <b>Uvezi JSON</b>.
      </p>

      {poruka && <p className="adm-msg">{poruka}</p>}

      <div className="adm-body">
        <nav className="adm-tabs" aria-label="Dijelovi sadržaja">
          {KARTICE.map((k) => (
            <button
              type="button"
              key={k.id}
              className={`adm-tab${k.id === tab ? ' is-on' : ''}`}
              onClick={() => setTab(k.id)}
              aria-current={k.id === tab ? 'true' : undefined}
            >
              {k.label}
            </button>
          ))}
        </nav>

        <div className="adm-panel">
          <Aktivna c={draft} set={set} />
        </div>
      </div>

      {/* Ista radnja kao gore, nadohvat palca na mobitelu. */}
      <div className="adm-sticky">
        <button
          type="button"
          className={`adm-btn adm-btn--primary${dirty ? ' is-dirty' : ''}`}
          onClick={spremi}
        >
          {dirty ? 'Spremi izmjene' : 'Spremljeno'}
        </button>
      </div>
    </div>
  );
}
