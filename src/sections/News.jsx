import { Link } from 'react-router-dom';
import Brush from '../components/Brush';
import Pip from '../components/Pip';
import Reveal from '../components/Reveal';
import { IMAGES } from '../data/site';
import { useContent } from '../lib/content';

export default function News() {
  const { news, featured } = useContent();

  return (
    <section className="news" id="novosti" aria-labelledby="naslov-novosti">
      <Brush variant="news-1" />
      <Brush variant="news-2" />
      <Brush variant="news-3" />
      <Brush variant="news-4" />

      <div className="shell">
        <div className="section-head news__head">
          <Reveal className="news__head-titles">
            <Brush variant="news-head" />
            <span className="eyebrow" style={{ position: 'relative' }}>
              Novosti
            </span>
            <h2 className="news__title" id="naslov-novosti">
              Iz kluba
            </h2>
          </Reveal>
          <Reveal variant="right" delay={140}>
            <Link className="link-underline" to="/novosti">
              Sve novosti →
            </Link>
          </Reveal>
        </div>

        <div className="news__layout">
          <Reveal as="article" variant="scale" className="feature notch-br-24">
            <img
              className="feature__photo"
              src={IMAGES.celebration}
              alt="Slavlje s navijačima"
              loading="lazy"
            />
            <div className="feature__veil" aria-hidden="true" />
            <Brush variant="feature" />
            <div className="feature__body">
              <span className="feature__flag">{featured.flag}</span>
              <h3 className="feature__title">{featured.title}</h3>
              <p className="feature__lead">{featured.lead}</p>
              <div className="feature__meta">
                <Pip size="md" tone="sky" />
                <span>{featured.meta}</span>
              </div>
            </div>
          </Reveal>

          <div className="news__list">
            {news.map((item, i) => (
              <Reveal
                as="article"
                variant="right"
                delay={120 + i * 110}
                className="news-card"
                key={item.title}
              >
                <div className="news-card__edge" aria-hidden="true" />
                <span className="news-card__meta">
                  {item.date} · {item.cat}
                </span>
                <h3 className="news-card__title">{item.title}</h3>
                <p className="news-card__lead">{item.lead}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
