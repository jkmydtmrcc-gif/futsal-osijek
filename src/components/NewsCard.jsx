import { Link } from 'react-router-dom';
import Reveal from './Reveal';

/**
 * Kartica novosti. Cijela je poveznica na pojedinačnu novost, a kad novost
 * nema `id` (npr. tek upisana u administraciji), ostaje običan članak — bez
 * poveznice koja bi vodila u prazno.
 */
export default function NewsCard({ item, index = 0, delay = 0 }) {
  const inner = (
    <>
      <div className="news-card__edge" aria-hidden="true" />
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
    </>
  );

  if (!item.id) {
    return (
      <Reveal as="article" variant="right" delay={delay + index * 110} className="news-card">
        {inner}
      </Reveal>
    );
  }

  return (
    <Reveal
      as={Link}
      to={`/novosti/${item.id}`}
      variant="right"
      delay={delay + index * 110}
      className="news-card news-card--link"
    >
      {inner}
    </Reveal>
  );
}
