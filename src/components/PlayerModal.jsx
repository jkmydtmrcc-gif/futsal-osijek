import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Pip from './Pip';
import Brush from './Brush';
import { COMPETITIONS, STAT_FIELDS } from '../data/site';

/**
 * Kartica igrača preko cijelog ekrana.
 *
 * Otvara se klikom na igrača — i na naslovnici i na stranici postave.
 * Lijevo je portret, desno podaci i statistika po sezonama i natjecanjima.
 *
 * Sve što se ovdje vidi upisuje se u administraciji. Polja koja nisu
 * ispunjena se ne prikazuju: prazan redak „Visina —“ ne govori ništa, a
 * zauzima mjesto i izgleda kao greška.
 *
 * Renderira se u `document.body`, ne na mjestu poziva. Omotač rute ima
 * animaciju ulaska preko `translate`, a element s `translate` postaje okvir
 * za `position: fixed` potomke — modal bi tada bio vezan uz visinu stranice
 * umjesto uz ekran i pao bi na njezino dno.
 */
export default function PlayerModal({ player, onClose }) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);

  const stats = player?.stats ?? [];

  /* Sezone i natjecanja se izvode iz upisane statistike — izbornik nudi samo
     ono za što stvarno postoje brojke. */
  const seasons = useMemo(() => {
    const seen = [];
    stats.forEach((row) => {
      if (row.season && !seen.includes(row.season)) seen.push(row.season);
    });
    return seen;
  }, [stats]);

  const comps = useMemo(() => {
    const seen = [];
    stats.forEach((row) => {
      const c = row.comp || COMPETITIONS[0];
      if (!seen.includes(c)) seen.push(c);
    });
    return seen.length ? seen : [COMPETITIONS[0]];
  }, [stats]);

  const [comp, setComp] = useState(comps[0]);
  const [season, setSeason] = useState(seasons[0] ?? '');

  useEffect(() => {
    setComp(comps[0]);
    setSeason(seasons[0] ?? '');
  }, [comps, seasons]);

  const row = stats.find((r) => (r.comp || COMPETITIONS[0]) === comp && r.season === season);

  /* Escape zatvara, fokus ulazi u karticu, a stranica iza ne kliže. */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);

    const { body } = document;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPad = body.style.paddingRight;
    body.style.overflow = 'hidden';
    if (gap > 0) body.style.paddingRight = `${gap}px`;

    closeRef.current?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPad;
    };
  }, [onClose]);

  /* Tab ostaje unutar kartice dok je otvorena. */
  const onKeyDown = (e) => {
    if (e.key !== 'Tab') return;
    const focusable = panelRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable?.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  if (!player) return null;

  const surname = player.name.split(' ').filter(Boolean).pop();
  const details = [
    { label: 'Broj', value: player.number ? String(player.number) : '' },
    { label: 'Pozicija', value: player.pos },
    { label: 'Datum rođenja', value: player.birth },
    { label: 'Odakle je', value: player.from },
    { label: 'Visina', value: player.height },
    { label: 'Noga', value: player.foot },
    { label: 'U klubu od', value: player.joined },
  ].filter((d) => d.value);

  return createPortal(
    <div
      className="pm"
      role="dialog"
      aria-modal="true"
      aria-label={`${player.name} — profil igrača`}
      onKeyDown={onKeyDown}
    >
      {/* Klik izvan kartice zatvara. Zaslon je element bez uloge, pa ga
          čitači ekrana preskaču — zatvaranje ima i pravi gumb. */}
      <div className="pm__scrim" onClick={onClose} aria-hidden="true" />

      <div className="pm__panel notch-br-24" ref={panelRef}>
        <div className="scanlines scanlines--wide" aria-hidden="true" />
        <Brush variant="pm" />

        <button type="button" className="pm__close" onClick={onClose} ref={closeRef}>
          Zatvori ✕
        </button>

        <div className="pm__grid">
          {/* --- Portret ---------------------------------------------------- */}
          <div className="pm__shot">
            <span className="pm__num" aria-hidden="true">
              {player.number}
            </span>
            {player.photo ? (
              <img className="pm__photo" src={player.photo} alt={`${player.name} — portret`} />
            ) : (
              <span className="pm__ghost" aria-hidden="true">
                {surname}
              </span>
            )}
          </div>

          {/* --- Podaci ----------------------------------------------------- */}
          <div className="pm__body">
            {player.number ? (
              <div className="pm__badge">
                <span className="pm__badge-hash">BROJ</span>
                <span className="pm__badge-num">{player.number}</span>
              </div>
            ) : null}
            <span className="eyebrow eyebrow--sky">{player.pos}</span>
            <h2 className="pm__name">
              <span className="pm__first">
                {player.name.split(' ').slice(0, -1).join(' ')}
              </span>
              <span className="pm__last">{surname}</span>
            </h2>

            {details.length > 0 && (
              <dl className="pm__facts">
                {details.map((d) => (
                  <div className="pm__fact" key={d.label}>
                    <dt>{d.label}</dt>
                    <dd>{d.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            {/* --- Statistika ---------------------------------------------- */}
            <div className="pm__stats">
              <div className="pm__stats-head">
                <span className="pm__stats-title">Statistika</span>

                {stats.length > 0 && (
                  <div className="pm__selects">
                    {comps.length > 1 && (
                      <label className="pm__select">
                        <span className="sr-only">Natjecanje</span>
                        <select value={comp} onChange={(e) => setComp(e.target.value)}>
                          {comps.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                    {seasons.length > 1 && (
                      <label className="pm__select pm__select--sm">
                        <span className="sr-only">Sezona</span>
                        <select value={season} onChange={(e) => setSeason(e.target.value)}>
                          {seasons.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </label>
                    )}
                  </div>
                )}
              </div>

              {stats.length === 0 ? (
                <p className="pm__empty">
                  <Pip tone="sky" /> Statistika za ovog igrača još nije upisana.
                </p>
              ) : (
                <>
                  {comps.length === 1 && seasons.length === 1 && (
                    <span className="pm__scope">
                      {comps[0]} · {seasons[0]}
                    </span>
                  )}
                  <div className="pm__table">
                    {STAT_FIELDS.map((field) => (
                      <div className="pm__row" key={field.id}>
                        <span className="pm__row-l">{field.label}</span>
                        <span className="pm__row-v">{row?.[field.id] ?? 0}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
