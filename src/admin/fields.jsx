import { useRef, useState } from 'react';

/* ==========================================================================
   Gradivni dijelovi obrazaca u administraciji.
   Namjerno bez vanjskih biblioteka — obična polja i jedan generički
   uređivač popisa pokrivaju sve što se na stranici uređuje.
   ========================================================================== */

export function Polje({ label, hint, children }) {
  return (
    <label className="adm-field">
      <span className="adm-field__label">
        {label}
        {hint && <span className="adm-field__hint">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export function Tekst({ label, hint, value, onChange, placeholder }) {
  return (
    <Polje label={label} hint={hint}>
      <input
        className="adm-input"
        type="text"
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Polje>
  );
}

export function Broj({ label, hint, value, onChange }) {
  return (
    <Polje label={label} hint={hint}>
      <input
        className="adm-input"
        type="number"
        value={value ?? 0}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </Polje>
  );
}

export function Odlomak({ label, hint, value, onChange, rows = 4, placeholder }) {
  return (
    <Polje label={label} hint={hint}>
      <textarea
        className="adm-input adm-input--area"
        rows={rows}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Polje>
  );
}

/** Niz redaka teksta ⇄ jedno polje s odlomcima odvojenima praznim redom. */
export function Odlomci({ label, hint, value, onChange, rows = 8 }) {
  return (
    <Odlomak
      label={label}
      hint={hint ?? 'Svaki odlomak u svoj red (prazan red između odlomaka)'}
      rows={rows}
      value={(value ?? []).join('\n\n')}
      onChange={(text) =>
        onChange(
          text
            .split(/\n\s*\n/)
            .map((p) => p.trim())
            .filter(Boolean)
        )
      }
    />
  );
}

/**
 * Smanjuje sliku prije spremanja.
 *
 * Slike odabrane s računala spremaju se kao data URL u `localStorage`, a
 * on je malen (par MB). Fotografija s mobitela ga sama popuni, pa se svaka
 * slika prije spremanja smanji na najviše 1400px i prekodira u JPEG.
 */
function smanjiSliku(file, maxSide = 1400) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Slika se ne može pročitati.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Datoteka nije slika.'));
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Slika: putanja ili adresa, uz mogućnost odabira datoteke s računala.
 *
 * Preporuka je putanja u `public/uploads/` — takva slika ide s repozitorijem
 * i vidi je svaki posjetitelj. Odabir s računala je za brzu probu: slika
 * tada živi samo u ovom pregledniku.
 */
export function Slika({ label, hint, value, onChange }) {
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const pick = async (file) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      onChange(await smanjiSliku(file));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="adm-image">
      <Tekst
        label={label}
        hint={hint ?? 'npr. /uploads/slika.webp'}
        value={value}
        onChange={onChange}
        placeholder="/uploads/…"
      />

      <div className="adm-image__row">
        <div className="adm-image__preview">
          {value ? (
            <img src={value} alt="" />
          ) : (
            <span className="adm-image__empty">bez slike</span>
          )}
        </div>

        <div className="adm-image__actions">
          <button
            type="button"
            className="adm-btn adm-btn--ghost"
            onClick={() => fileRef.current?.click()}
            disabled={busy}
          >
            {busy ? 'Učitavam…' : 'Odaberi s računala'}
          </button>
          {value && (
            <button type="button" className="adm-btn adm-btn--ghost" onClick={() => onChange('')}>
              Ukloni
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => pick(e.target.files?.[0])}
          />
          {error && <span className="adm-error">{error}</span>}
        </div>
      </div>
    </div>
  );
}

/**
 * Uređivač popisa: dodavanje, brisanje i pomicanje stavki.
 *
 * `fields` opisuje koja polja stavka ima; `render` je izlaz za slučajeve
 * koje generički opis ne pokriva.
 */
export function Popis({ items, onChange, novo, naslov, fields, render, prazno }) {
  const list = items ?? [];
  // Stavke su sklopljene dok se ne otvore — popis s petnaest artikala inače
  // postane nepregledna traka polja dugačka nekoliko ekrana.
  const [otvoreno, setOtvoreno] = useState(() => new Set());
  const toggle = (i) =>
    setOtvoreno((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const set = (i, next) => onChange(list.map((item, j) => (i === j ? next : item)));
  const remove = (i) => onChange(list.filter((_, j) => j !== i));
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= list.length) return;
    const copy = [...list];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
  };

  return (
    <div className="adm-list">
      {list.length === 0 && <p className="adm-empty">{prazno ?? 'Popis je prazan.'}</p>}

      {list.map((item, i) => (
        <div className={`adm-item${otvoreno.has(i) ? ' is-open' : ''}`} key={i}>
          <div className="adm-item__bar">
            <button
              type="button"
              className="adm-item__toggle"
              aria-expanded={otvoreno.has(i)}
              onClick={() => toggle(i)}
            >
              <span className="adm-item__caret" aria-hidden="true">
                {otvoreno.has(i) ? '▾' : '▸'}
              </span>
              <span className="adm-item__title">{naslov ? naslov(item, i) : `Stavka ${i + 1}`}</span>
            </button>
            <div className="adm-item__tools">
              <button
                type="button"
                className="adm-icon"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label="Pomakni gore"
              >
                ↑
              </button>
              <button
                type="button"
                className="adm-icon"
                onClick={() => move(i, 1)}
                disabled={i === list.length - 1}
                aria-label="Pomakni dolje"
              >
                ↓
              </button>
              <button
                type="button"
                className="adm-icon adm-icon--danger"
                onClick={() => remove(i)}
                aria-label="Obriši"
              >
                ✕
              </button>
            </div>
          </div>

          {otvoreno.has(i) && (
          <div className="adm-item__body">
            {(fields ?? []).map((f) => {
              const value = item[f.key];
              const change = (v) => set(i, { ...item, [f.key]: v });

              if (f.type === 'area')
                return (
                  <Odlomak key={f.key} label={f.label} hint={f.hint} value={value} onChange={change} />
                );
              if (f.type === 'odlomci')
                return (
                  <Odlomci key={f.key} label={f.label} hint={f.hint} value={value} onChange={change} />
                );
              if (f.type === 'broj')
                return <Broj key={f.key} label={f.label} hint={f.hint} value={value} onChange={change} />;
              if (f.type === 'slika')
                return (
                  <Slika key={f.key} label={f.label} hint={f.hint} value={value} onChange={change} />
                );
              return (
                <Tekst
                  key={f.key}
                  label={f.label}
                  hint={f.hint}
                  value={value}
                  onChange={change}
                  placeholder={f.placeholder}
                />
              );
            })}
            {render?.(item, (next) => set(i, next), i)}
          </div>
          )}
        </div>
      ))}

      {novo && (
        <button
          type="button"
          className="adm-btn adm-btn--add"
          onClick={() => {
            setOtvoreno((prev) => new Set(prev).add(list.length));
            onChange([...list, novo()]);
          }}
        >
          + Dodaj
        </button>
      )}
    </div>
  );
}

/** Popis običnih tekstova (npr. traka s natpisima, adresa u više redaka). */
export function PopisTeksta({ label, hint, value, onChange, rows = 6 }) {
  return (
    <Odlomak
      label={label}
      hint={hint ?? 'Jedna stavka po retku'}
      rows={rows}
      value={(value ?? []).join('\n')}
      onChange={(text) =>
        onChange(
          text
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean)
        )
      }
    />
  );
}
