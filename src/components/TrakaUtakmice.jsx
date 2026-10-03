import { Link } from 'react-router-dom';
import { useContent } from '../lib/content';
import useUzivo from '../lib/useUzivo';
import { formatDatum, formatSat, opisRazmaka } from '../lib/vrijeme';
import { rezultatIzDogadaja, stanjePrijenosa, opisStanja } from '../lib/uzivo';

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
 *
 * Dok utakmica traje, traka prelazi na živi rezultat. Tek tada počinje i
 * osvježavanje u pozadini: izvan utakmice se ne šalje nijedan dodatni upit,
 * jer bi inače svaki posjetitelj cijeli dan pitao za utakmicu koje nema.
 */

function Klub({ ime, istaknut }) {
  return <span className={`tru__klub${istaknut ? ' je-nas' : ''}`}>{ime}</span>;
}

export default function TrakaUtakmice() {
  const { league } = useContent();
  const najavljena = Boolean(league.uzivo);
  const prijenos = useUzivo(league.ourClub, najavljena);

  const zadnja = league.zadnja;
  const sljedeca = league.sljedeca;
  const uzivo = prijenos.utakmica ?? league.uzivo;

  if (!uzivo && !zadnja && !sljedeca) return null;

  if (uzivo) {
    return <Prijenos utakmica={uzivo} dogadaji={prijenos.dogadaji} />;
  }

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

/**
 * Traka dok utakmica traje.
 *
 * Rezultat se računa iz događaja, isto kao na stranici prijenosa — dva
 * prikaza istog niza ne mogu reći različite stvari.
 */
function Prijenos({ utakmica, dogadaji }) {
  const rezultat = rezultatIzDogadaja(dogadaji, utakmica.jeDoma);
  const stanje = stanjePrijenosa(dogadaji);

  return (
    <aside className="tru tru--uzivo" aria-label="Utakmica u tijeku">
      <div className="shell tru__inner">
        <div className="tru__blok">
          <span className="uzivo-znak">
            <span className="uzivo-znak__tocka" aria-hidden="true" />
            Uživo
          </span>
        </div>

        <div className="tru__blok tru__blok--siri">
          <div className="tru__redak">
            <Klub ime={utakmica.home} istaknut={utakmica.jeDoma} />
            <span className="tru__rezultat tru__rezultat--uzivo">
              {rezultat.home}:{rezultat.away}
            </span>
            <Klub ime={utakmica.away} istaknut={!utakmica.jeDoma} />
          </div>
          <span className="tru__pod">
            {[opisStanja(stanje), utakmica.comp].filter(Boolean).join(' · ')}
          </span>
        </div>

        <Link className="tru__veza tru__veza--uzivo" to="/uzivo">
          Prati uživo →
        </Link>
      </div>
    </aside>
  );
}
