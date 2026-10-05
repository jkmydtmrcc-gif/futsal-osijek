import { Link } from 'react-router-dom';
import Reveal, { stupnjevito } from './Reveal';
import NewsFoto from './NewsFoto';

/**
 * Kartica novosti. Cijela je poveznica na pojedinačnu novost, a kad novost
 * nema `id` (npr. tek upisana u administraciji), ostaje običan članak — bez
 * poveznice koja bi vodila u prazno.
 *
 * `sFotografijom` se gasi na naslovnici: ondje kartice stoje u uskom stupcu
 * uz veliki istaknuti okvir, pa bi tri fotografije taj stupac učinile
 * višestruko višim od okvira uz koji stoji.
 */
export default function NewsCard({ item, index = 0, delay = 0, sFotografijom = true }) {
  const inner = (
    <>
      {/* Plavi rub stoji na kartici sa slikom i bez nje — isti klupski potpis
          na obje. */}
      <div className="news-card__edge" aria-hidden="true" />

      {sFotografijom && (
        <div className="news-card__media">
          <NewsFoto src={item.image} alt={item.title} varijanta="kartica" />
        </div>
      )}

      <div className="news-card__body">
        <span className="news-card__meta">
          {item.date} · {item.cat}
        </span>
        <h3 className="news-card__title">{item.title}</h3>
        <p className="news-card__lead">{item.lead}</p>
        {item.id && (
          <span className="news-card__more" aria-hidden="true">
            Pročitaj →
          </span>
        )}
      </div>
    </>
  );

  const razred = `news-card${sFotografijom ? ' news-card--foto' : ''}`;
  const kasnjenje = delay + stupnjevito(index, 110, 3);

  if (!item.id) {
    return (
      <Reveal as="article" variant="right" delay={kasnjenje} className={razred}>
        {inner}
      </Reveal>
    );
  }

  return (
    <Reveal
      as={Link}
      to={`/novosti/${item.id}`}
      variant="right"
      delay={kasnjenje}
      className={`${razred} news-card--link`}
    >
      {inner}
    </Reveal>
  );
}
