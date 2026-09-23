import Reveal from './Reveal';
import { SHOP_URL } from '../data/site';

/**
 * Artikli Fan Shopa kao kvadratići.
 *
 * Klub nema naplatu — svaki artikl je poveznica prema trgovini, pa je
 * cijela pločica klikabilna i otvara se u novoj kartici.
 */
export default function ArtikliMreza({ artikli }) {
  if (!artikli.length) {
    return (
      <div className="artikli__prazno">
        <p>Artikli se upravo pripremaju.</p>
        <a className="btn btn--solid notch-12" href={SHOP_URL} target="_blank" rel="noopener noreferrer">
          Otvori salasport.hr ↗
        </a>
      </div>
    );
  }

  return (
    <div className="artikli">
      {artikli.map((a, i) => (
        <Reveal
          as="a"
          variant="blur"
          delay={i * 80}
          className="artikl"
          key={a.id ?? a.name}
          href={a.href || SHOP_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="artikl__okvir">
            {a.image ? (
              <img className="artikl__slika" src={a.image} alt={a.name} loading="lazy" />
            ) : (
              <span className="artikl__bezslike" aria-hidden="true">
                {a.name?.[0] ?? '?'}
              </span>
            )}
            {a.badge && <span className="artikl__oznaka">{a.badge}</span>}
            <span className="artikl__strelica" aria-hidden="true">↗</span>
          </div>

          <h3 className="artikl__ime">{a.name}</h3>
          {a.price && <span className="artikl__cijena">{a.price}</span>}
        </Reveal>
      ))}
    </div>
  );
}
