import { Link } from 'react-router-dom';
import Brush from '../components/Brush';
import Pip from '../components/Pip';
import Reveal from '../components/Reveal';
import NewsCard from '../components/NewsCard';
import { useContent } from '../content/ContentContext';

export default function News() {
  const { news } = useContent();
  const featured = news.featured;

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
          <Reveal
            as={Link}
            to={featured.id ? `/novosti/${featured.id}` : '/novosti'}
            variant="scale"
            className="feature feature--link notch-br-24"
          >
            <img
              className="feature__photo"
              src={featured.image}
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
            {news.items.slice(0, 3).map((item, i) => (
              <NewsCard item={item} index={i} delay={120} key={item.id ?? item.title} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
