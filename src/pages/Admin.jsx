import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  loadContent,
  saveDraft,
  discardDraft,
  hasDraft,
  publishedContent,
  publishedInfo,
  markPublished,
  refreshPublished,
  toJson,
  fromJson,
} from '../content/store';
import { publishContent } from '../content/api';
import useAuth from '../admin/useAuth';
import * as S from '../admin/sections';

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
  const auth = useAuth();

  if (auth.loading) {
    return (
      <div className="adm adm--gate">
        <p className="adm-gate__loading">Provjeravam prijavu…</p>
      </div>
    );
  }

  if (!auth.admin) return <Prijava auth={auth} />;
  return <Ploca auth={auth} />;
}

/* ==========================================================================
   Prijava — broj mobitela pa kod iz SMS-a
   ========================================================================== */

function Prijava({ auth }) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const codeRef = useRef(null);

  const step = auth.challenge ? 'kod' : 'broj';

  useEffect(() => {
    if (step === 'kod') codeRef.current?.focus();
  }, [step]);

  const submit = async (e) => {
    e.preventDefault();
    if (step === 'broj') await auth.sendCode(phone);
    else await auth.confirmCode(code);
  };

  const setupMissing =
    auth.setup && (!auth.setup.admins || !auth.setup.session || !auth.setup.storage);

  return (
    <div className="adm adm--gate">
      <form className="adm-gate" onSubmit={submit}>
        <span className="adm-gate__eyebrow">MNK Osijek Kandit</span>
        <h1 className="adm-gate__title">Administracija</h1>

        {step === 'broj' ? (
          <>
            <p className="adm-gate__lead">
              Upiši broj mobitela. Kod za prijavu stiže SMS-om — samo na brojeve
              urednika kluba.
            </p>

            <label className="adm-field">
              <span className="adm-field__label">Broj mobitela</span>
              <input
                className="adm-input"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                autoFocus
                placeholder="091 123 4567"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  auth.setError('');
                }}
              />
            </label>
          </>
        ) : (
          <>
            <p className="adm-gate__lead">
              {auth.challenge.message} Poslano na <b>{auth.challenge.phone}</b>.
            </p>

            {auth.challenge.devMode && (
              <p className="adm-gate__dev">
                Razvojni način: SMS se ne šalje, kod je ispisan u zapisu poslužitelja
                (terminal na kojem radi <code>npm run dev</code>).
              </p>
            )}

            <label className="adm-field">
              <span className="adm-field__label">Kod iz poruke</span>
              <input
                ref={codeRef}
                className="adm-input adm-input--code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                  auth.setError('');
                }}
              />
            </label>
          </>
        )}

        {auth.error && <span className="adm-error">{auth.error}</span>}

        <button type="submit" className="adm-btn adm-btn--primary" disabled={auth.busy}>
          {auth.busy ? 'Čekaj…' : step === 'broj' ? 'Pošalji kod' : 'Prijavi se'}
        </button>

        {step === 'kod' && (
          <button
            type="button"
            className="adm-gate__again"
            onClick={() => {
              setCode('');
              auth.reset();
            }}
          >
            Upiši drugi broj
          </button>
        )}

        {setupMissing && (
          <p className="adm-gate__warn">
            Poslužitelj još nije do kraja postavljen
            {!auth.setup.admins && ' · nedostaje ADMIN_PHONES'}
            {!auth.setup.session && ' · nedostaje SESSION_SECRET'}
            {!auth.setup.storage && ' · nema pohrane (Upstash)'}. Upute su u README-u.
          </p>
        )}

        <Link className="adm-gate__back" to="/">
          ← Natrag na stranicu
        </Link>
      </form>
    </div>
  );
}

/* ==========================================================================
   Ploča
   ========================================================================== */

function Ploca({ auth }) {
  const [draft, setDraft] = useState(() => clone(loadContent()));
  const [tab, setTab] = useState(KARTICE[0].id);
  const [dirty, setDirty] = useState(hasDraft());
  const [poruka, setPoruka] = useState(null);
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState(publishedInfo);
  const fileRef = useRef(null);

  const set = useCallback((path, value) => {
    setDraft((d) => setIn(d, path, value));
    setDirty(true);
    setPoruka(null);
  }, []);

  // Zatvaranje kartice s neobjavljenim izmjenama traži potvrdu preglednika.
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const say = (tone, text) => setPoruka({ tone, text });

  /* --- radnje ------------------------------------------------------------- */

  const spremiSkicu = () => {
    const res = saveDraft(draft);
    if (res.ok) {
      say('ok', 'Skica je spremljena u ovaj preglednik. Posjetitelji je još ne vide — za to klikni „Objavi“.');
    } else if (res.error === 'puno') {
      say(
        'err',
        'Pohrana preglednika je puna — najčešće zbog slika odabranih s računala. Ubaci ih u public/uploads/ i upiši putanju.'
      );
    } else {
      say('err', 'Spremanje skice nije uspjelo.');
    }
  };

  const objavi = async () => {
    if (!confirm('Objaviti izmjene? Nakon toga ih vide svi posjetitelji stranice.')) return;

    setBusy(true);
    setPoruka(null);
    try {
      const res = await publishContent(draft);
      markPublished(draft, res);
      setInfo({ revision: res.revision, updatedAt: res.updatedAt });
      setDirty(false);
      say('ok', 'Objavljeno. Izmjene su vidljive svima na stranici.');
    } catch (err) {
      if (err.status === 401) {
        say('err', 'Sesija je istekla. Prijavi se ponovno — skica ti ostaje spremljena.');
        saveDraft(draft);
        await auth.refresh();
      } else {
        say('err', err.message);
      }
    } finally {
      setBusy(false);
    }
  };

  const vratiNaObjavljeno = () => {
    if (!confirm('Odbaciti skicu i vratiti se na objavljeni sadržaj?')) return;
    discardDraft();
    setDraft(clone(publishedContent()));
    setDirty(false);
    say('ok', 'Skica je odbačena. Prikazuje se objavljeni sadržaj.');
  };

  const osvjezi = async () => {
    await refreshPublished();
    setInfo(publishedInfo());
    if (!dirty) setDraft(clone(loadContent()));
    say('ok', 'Učitana je zadnja objavljena inačica.');
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
      say('ok', 'Datoteka je učitana. Provjeri sadržaj pa klikni „Objavi“.');
    } catch (err) {
      say('err', `Uvoz nije uspio: ${err.message}`);
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const odjava = async () => {
    if (dirty && !confirm('Imaš neobjavljene izmjene. Odjaviti se? Skica ostaje spremljena.')) return;
    if (dirty) saveDraft(draft);
    await auth.signOut();
  };

  const Aktivna = useMemo(
    () => KARTICE.find((k) => k.id === tab)?.Component ?? (() => null),
    [tab]
  );

  const bezPohrane = auth.setup && !auth.setup.storage;

  return (
    <div className="adm">
      <header className="adm-top">
        <div className="adm-top__left">
          <span className="adm-top__mark">MNK Osijek Kandit</span>
          <h1 className="adm-top__title">Administracija</h1>
          <span className="adm-top__who">
            {auth.admin.name} · {auth.admin.phone}
          </span>
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
          <button type="button" className="adm-btn adm-btn--ghost" onClick={osvjezi}>
            Osvježi
          </button>
          <button type="button" className="adm-btn adm-btn--ghost" onClick={() => fileRef.current?.click()}>
            Uvezi JSON
          </button>
          <button type="button" className="adm-btn adm-btn--ghost" onClick={izvezi}>
            Izvezi JSON
          </button>
          <button type="button" className="adm-btn adm-btn--ghost" onClick={vratiNaObjavljeno}>
            Odbaci skicu
          </button>
          <button type="button" className="adm-btn adm-btn--ghost" onClick={odjava}>
            Odjava
          </button>
          <button type="button" className="adm-btn adm-btn--soft" onClick={spremiSkicu}>
            Spremi skicu
          </button>
          <button
            type="button"
            className={`adm-btn adm-btn--primary${dirty ? ' is-dirty' : ''}`}
            onClick={objavi}
            disabled={busy}
          >
            {busy ? 'Objavljujem…' : dirty ? 'Objavi izmjene' : 'Objavljeno'}
          </button>
        </div>
      </header>

      <div className="adm-status">
        <span className={`adm-pill${dirty ? ' adm-pill--draft' : ' adm-pill--live'}`}>
          {dirty ? 'Skica — vidiš samo ti' : 'U skladu s objavljenim'}
        </span>
        {info?.updatedAt && (
          <span className="adm-status__meta">
            Zadnja objava: {new Date(info.updatedAt).toLocaleString('hr-HR')}
          </span>
        )}
      </div>

      {bezPohrane && (
        <p className="adm-warn">
          Poslužitelj radi bez trajne pohrane (nema Upstash varijabli), pa objava{' '}
          <b>nestaje s ponovnim pokretanjem</b>. Za pravu objavu spoji Upstash Redis —
          upute su u README-u.
        </p>
      )}

      {poruka && <p className={poruka.tone === 'err' ? 'adm-msg adm-msg--err' : 'adm-msg'}>{poruka.text}</p>}

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

      {/* Iste radnje, nadohvat palca na mobitelu. */}
      <div className="adm-sticky">
        <button type="button" className="adm-btn adm-btn--soft" onClick={spremiSkicu}>
          Spremi skicu
        </button>
        <button
          type="button"
          className={`adm-btn adm-btn--primary${dirty ? ' is-dirty' : ''}`}
          onClick={objavi}
          disabled={busy}
        >
          {busy ? 'Objavljujem…' : 'Objavi'}
        </button>
      </div>
    </div>
  );
}
