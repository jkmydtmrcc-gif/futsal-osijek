import ClubBadge from './ClubBadge';
import { STANDINGS_SOURCE } from '../data/site';
import { useContent, useStandings } from '../lib/content';
import { imaDetalje, imaFormu, grupirajZone, formatGR, BROJ_FORME } from '../lib/tablica';
import { formatDan } from '../lib/vrijeme';

/**
 * Tablica lige.
 *
 * Jedna tablica za naslovnicu i za `/raspored` — prije su bile dvije kopije
 * istog grida, pa je svaki stupac trebalo dodati dvaput i svaka je razlika
 * između njih bila slučajna.
 *
 * Širinu bira **sadržaj, a ne shema**: `imaDetalje` gleda ima li ijedan redak
 * išta upisano u ishodima i golovima. Baza koja nikad nije vidjela migraciju,
 * i ona koja ju je vidjela ali je još prazna, obje daju isto — današnju
 * tablicu od četiri stupca, bez ijedne iznimke u kodu ispod.
 *
 * Redak je `Poz · Klub · Ut · P · N · I · GR · Golovi · Posljednjih 5 · Bod`,
 * a redci su složeni u zone — doigravanje, doigravanje za ostanak, ispadanje —
 * svaka s naslovom i obojenom zagradom uz lijevi rub. Stupac forme se pojavi
 * tek kad je ijedan redak ima: prazne trake u svakom retku izgledaju kao kvar.
 *
 * Grid od deset stupaca nije tablica za čitač ekrana, pa ono što oko vidi kao
 * tablicu ARIA uloge i kažu da jest. Bez toga je ovo deset nepovezanih redaka
 * teksta.
 */
export default function Tablica({ legenda = false }) {
  const { league } = useContent();
  const redci = useStandings();
  const detaljno = imaDetalje(redci);
  const sForma = detaljno && imaFormu(redci);
  const skupine = grupirajZone(redci);

  return (
    <div
      className={`standings__inner${detaljno ? ' standings__inner--puna' : ''}${
        sForma ? ' standings__inner--forma' : ''
      }`}
    >
      {/* `role="table"` obuhvaća samo zaglavlje i retke: legenda i podnožje
          nisu retci tablice, a unutar te uloge bi bili nevaljani. */}
      <div className="standings__tablica" role="table" aria-label="Tablica lige">
        <div className="standings__head" role="row">
          <span role="columnheader">Poz</span>
          <span role="columnheader">Klub</span>
          <Zaglavlje puno="Odigrano">Ut</Zaglavlje>
          {detaljno && (
            <>
              <Zaglavlje puno="Pobjede">P</Zaglavlje>
              <Zaglavlje puno="Neriješeno">N</Zaglavlje>
              <Zaglavlje puno="Izgubljeno">I</Zaglavlje>
              <Zaglavlje puno="Gol-razlika">GR</Zaglavlje>
              <Zaglavlje puno="Golovi (dani : primljeni)" sirok>
                Gol
              </Zaglavlje>
              {sForma && (
                <Zaglavlje puno="Posljednjih pet utakmica, najstarija lijevo" forma>
                  Posljednjih 5
                </Zaglavlje>
              )}
            </>
          )}
          <span className="standings__d" role="columnheader">
            <abbr title="Bodovi">Bod</abbr>
          </span>
        </div>

        {/* Redci se pojavljuju odjednom, s tablicom, a ne jedan po jedan.
            Dijeljenje tablice kao karata je vizualni potpis predloška — a uz
            to je `reveal--right` svaki redak nakratko gurao 22 piksela
            udesno, pa se tablica mogla klizati vodoravno prije nego se
            uopće pokaže. */}
        {skupine.map((skupina, g) => (
          <div
            role="rowgroup"
            className={`zona${skupina.zona ? ` zona--${skupina.zona}` : ''}`}
            aria-label={skupina.naslov || undefined}
            key={skupina.zona ?? `bez-${g}`}
          >
            {skupina.naslov && (
              <div className="zona__naslov" aria-hidden="true">
                {skupina.naslov}
              </div>
            )}
            {skupina.redci.map((row) => (
              <div
                role="row"
                className={['standings__row', row.isPlayoff ? 'is-top' : '', row.isUs ? 'is-us' : '']
                  .filter(Boolean)
                  .join(' ')}
                key={row.club}
              >
                <span className="standings__pos" role="cell">
                  {row.pos}
                </span>
                <span className="standings__team" role="cell">
                  <ClubBadge club={row.club} logo={row.logo} />
                  <span className="standings__club">{row.club}</span>
                </span>
                <span className="standings__played" role="cell">
                  {row.played}
                </span>
                {detaljno && (
                  <>
                    <span className="standings__broj" role="cell">
                      {row.wins}
                    </span>
                    <span className="standings__broj" role="cell">
                      {row.draws}
                    </span>
                    <span className="standings__broj" role="cell">
                      {row.losses}
                    </span>
                    <span className="standings__gr" role="cell">
                      {formatGR(row.gd)}
                    </span>
                    <span className="standings__broj standings__gol standings__sirok" role="cell">
                      {row.goalsFor}:{row.goalsAgainst}
                    </span>
                    {sForma && (
                      <span className="standings__forma" role="cell">
                        <Forma ishodi={row.forma} />
                      </span>
                    )}
                  </>
                )}
                <span className="standings__pts" role="cell">
                  {row.points}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {legenda && (
        <div className="legend">
          <span className="legend__item">
            <span className="legend__swatch legend__swatch--us" aria-hidden="true" />
            {league.ourClub}
          </span>
          {sForma && (
            <span className="legend__item legend__forma">
              Posljednjih 5: P pobjeda · N neriješeno · I izgubljeno
            </span>
          )}
        </div>
      )}

      <Podnozje league={league} />
    </div>
  );
}

/** Kratica u zaglavlju nosi puno ime, da „G−“ ne ostane zagonetka. */
function Zaglavlje({ puno, sirok = false, forma = false, children }) {
  return (
    <span
      className={`standings__c${sirok ? ' standings__sirok' : ''}${forma ? ' standings__forma' : ''}`}
      role="columnheader"
    >
      <abbr title={puno}>{children}</abbr>
    </span>
  );
}

/**
 * Forma: zadnjih pet ishoda, najstariji lijevo, u traci s pet mjesta.
 *
 * Mjesta bez ishoda ostaju prazna — klub koji je odigrao tri utakmice ima tri
 * obojena polja i dva siva, pa se vidi da je to cijela povijest, a ne da je
 * nešto izgubljeno.
 */
const IME = { w: 'pobjeda', d: 'neriješeno', l: 'poraz' };
const SLOVO = { w: 'P', d: 'N', l: 'I' };

function Forma({ ishodi }) {
  const mjesta = Array.from({ length: BROJ_FORME }, (_, i) => ishodi[i] ?? null);

  return (
    <span
      className="forma"
      role="img"
      aria-label={
        ishodi.length ? `Forma: ${ishodi.map((i) => IME[i]).join(', ')}` : 'Forma: nema upisanih utakmica'
      }
    >
      {mjesta.map((ishod, i) => (
        <span
          className={`forma__pip ${ishod ? `forma__pip--${ishod}` : 'forma__pip--prazan'}`}
          aria-hidden="true"
          key={i}
        >
          {ishod ? SLOVO[ishod] : ''}
        </span>
      ))}
    </span>
  );
}

/**
 * Ispod tablice stoji ili priznanje da su podaci ogledni, ili datum i izvor.
 *
 * Nikad oboje i nikad ništa: tablica bez ijednog od toga traži da joj se
 * vjeruje na riječ, a upravo to klupske stranice gube. Priznanje nestaje samo
 * od sebe čim baza vrati prave utakmice — bez da se itko toga mora sjetiti.
 */
function Podnozje({ league }) {
  if (league.demo) return <p className="standings__note">{league.note}</p>;

  return (
    <p className="standings__note standings__izvor">
      {league.azurirano && <>Ažurirano {formatDan(league.azurirano)} · </>}
      Izvor:{' '}
      <a href={STANDINGS_SOURCE.href} target="_blank" rel="noreferrer noopener">
        {STANDINGS_SOURCE.label}
      </a>
    </p>
  );
}
