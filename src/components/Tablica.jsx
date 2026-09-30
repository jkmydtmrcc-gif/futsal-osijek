import ClubBadge from './ClubBadge';
import { STANDINGS_SOURCE } from '../data/site';
import { useContent, useStandings } from '../lib/content';
import { imaDetalje, formatGR } from '../lib/tablica';
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
 * Grid od deset stupaca nije tablica za čitač ekrana, pa ono što oko vidi kao
 * tablicu ARIA uloge i kažu da jest. Bez toga je ovo deset nepovezanih redaka
 * teksta.
 */
export default function Tablica({ legenda = false }) {
  const { league } = useContent();
  const redci = useStandings();
  const detaljno = imaDetalje(redci);

  return (
    <div className={`standings__inner${detaljno ? ' standings__inner--puna' : ''}`}>
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
              <Zaglavlje puno="Dani golovi" sirok>
                G+
              </Zaglavlje>
              <Zaglavlje puno="Primljeni golovi" sirok>
                G−
              </Zaglavlje>
              <Zaglavlje puno="Gol-razlika">GR</Zaglavlje>
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
        {redci.map((row) => (
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
              {row.forma.length > 0 && <Forma ishodi={row.forma} />}
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
                <span className="standings__broj standings__sirok" role="cell">
                  {row.goalsFor}
                </span>
                <span className="standings__broj standings__sirok" role="cell">
                  {row.goalsAgainst}
                </span>
                <span className="standings__gr" role="cell">
                  {formatGR(row.gd)}
                </span>
              </>
            )}
            <span className="standings__pts" role="cell">
              {row.points}
            </span>
          </div>
        ))}
      </div>

      {legenda && (
        <div className="legend">
          <span className="legend__item">
            <span className="legend__swatch legend__swatch--top" aria-hidden="true" />
            Prva {league.playoffCutoff} mjesta — doigravanje
          </span>
          <span className="legend__item">
            <span className="legend__swatch legend__swatch--us" aria-hidden="true" />
            {league.ourClub}
          </span>
        </div>
      )}

      <Podnozje league={league} />
    </div>
  );
}

/** Kratica u zaglavlju nosi puno ime, da „G−“ ne ostane zagonetka. */
function Zaglavlje({ puno, sirok = false, children }) {
  return (
    <span className={`standings__c${sirok ? ' standings__sirok' : ''}`} role="columnheader">
      <abbr title={puno}>{children}</abbr>
    </span>
  );
}

/**
 * Forma uz naš redak.
 *
 * Samo uz naš — rezultate drugih klubova nemamo, a izmišljena forma uz tuđi
 * redak je jedina stvar gora od nikakve.
 */
const IME = { w: 'pobjeda', d: 'neriješeno', l: 'poraz' };
const SLOVO = { w: 'P', d: 'N', l: 'I' };

function Forma({ ishodi }) {
  return (
    <span className="forma" aria-label={`Forma: ${ishodi.map((i) => IME[i]).join(', ')}`}>
      {ishodi.map((ishod, i) => (
        <span className={`forma__pip forma__pip--${ishod}`} aria-hidden="true" key={i}>
          {SLOVO[ishod]}
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
