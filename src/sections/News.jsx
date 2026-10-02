import { Link } from 'react-router-dom';
import Pip from '../components/Pip';
import Reveal from '../components/Reveal';
import NewsCard from '../components/NewsCard';
import { useContent } from '../lib/content';
import FeaturePhoto from '../components/FeaturePhoto';

export default function News() {
  const { news } = useContent();
  const featured = news.featured;

  // Istaknuta objava je obična objava s oznakom, pa stoji i u popisu — ovdje
  // se izostavlja da se ne pojavi dvaput u istom odsječku.
  const ostale = news.items.filter((n) => n.id !== featured?.id).slice(0, 3);

  if (!featured) return null;

  return (
    <section className="news" id="novosti" aria-labelledby="naslov-novosti">

      <div className="shell">
        <div className="section-head news__head">
          <Reveal className="news__head-titles">
            <span className="eyebrow">
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
            to={`/novosti/${featured.id}`}
            variant="scale"
            className="feature feature--link"
          >
            <FeaturePhoto src={featured.image} alt={featured.title} />
            <div className="feature__veil" aria-hidden="true" />
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

          {/* Uski stupac uz veliki okvir — kartice ovdje ostaju bez
              fotografije, inače bi stupac bio triput viši od okvira uz koji
              stoji. Fotografije nose kartice na stranici Novosti. */}
          <div className="news__list">
            {ostale.map((item, i) => (
              <NewsCard
                item={item}
                index={i}
                delay={120}
                sFotografijom={false}
                key={item.id ?? item.title}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
