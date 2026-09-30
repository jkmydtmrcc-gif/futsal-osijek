import { Link } from 'react-router-dom';
import { useContent } from '../lib/content';
import { formatDatum, formatSat, opisRazmaka } from '../lib/vrijeme';

/**
 * Traka sa zadnjim rezultatom i sljedećom utakmicom.
 *
 * Ovo je ono što klupsku stranicu odmah razlikuje od predloška: navijač koji
 * otvori stranicu prvo želi znati kako je bilo i kad je sljedeća. Stoji ispod
 * zaglavlja, na svakoj stranici.
 *
 * Namjerno **bez otkucavajućeg brojača**. „za 3 dana · Sub 19:00" kaže sve, a
 * sekunde koje skaču su ukras koji klupskoj stranici oduzima ozbiljnost.
 *
 * Kad nema ni rezultata ni termina — traka se ne prikazuje. Prazan okvir s
 * crticama izgleda gore nego da ga nema.
 */

function Klub({ ime, istaknut }) {
  return <span className={`tru__klub${istaknut ? ' je-nas' : ''}`}>{ime}</span>;
}

export default function TrakaUtakmice() {
  const { league } = useContent();
  const zadnja = league.zadnja;
  const sljedeca = league.sljedeca;

  if (!zadnja && !sljedeca) return null;

  return (
    <aside className="tru" aria-label="Zadnji rezultat i sljedeća utakmica">
      <div className="shell tru__inner">
        {zadnja && (
          <div className="tru__blok">
            <span className="tru__oznaka">Zadnje odigrano</span>
            <div className="tru__redak">
              <Klub ime={zadnja.home} istaknut={zadnja.jeDoma} />
              <span className={`tru__rezultat tru__rezultat--${zadnja.outcome ?? 'n'}`}>
                {zadnja.score}
              </span>
              <Klub ime={zadnja.away} istaknut={!zadnja.jeDoma} />
            </div>
            <span className="tru__pod">
              {[zadnja.comp, zadnja.round].filter(Boolean).join(' · ')}
            </span>
          </div>
        )}

        {zadnja && sljedeca && <span className="tru__crta" aria-hidden="true" />}

        {sljedeca && (
          <div className="tru__blok">
            <span className="tru__oznaka tru__oznaka--sky">Sljedeća utakmica</span>
            <div className="tru__redak">
              <Klub ime={sljedeca.home} istaknut={sljedeca.jeDoma} />
              <span className="tru__vs" aria-hidden="true">
                —
              </span>
              <Klub ime={sljedeca.away} istaknut={!sljedeca.jeDoma} />
            </div>
            <span className="tru__pod">
              {sljedeca.kickoff ? (
                <>
                  <time dateTime={sljedeca.kickoff}>
                    {formatDatum(sljedeca.kickoff)} {formatSat(sljedeca.kickoff)}
                  </time>
                  {' · '}
                  {opisRazmaka(sljedeca.kickoff)}
                </>
              ) : (
                sljedeca.when
              )}
              {sljedeca.venue ? ` · ${sljedeca.venue}` : ''}
            </span>
          </div>
        )}

        <Link className="tru__veza" to="/raspored">
          Raspored i tablica →
        </Link>
      </div>
    </aside>
  );
}
