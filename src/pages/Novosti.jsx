import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Brush from '../components/Brush';
import Pip from '../components/Pip';
import Reveal from '../components/Reveal';
import PageHero from '../components/PageHero';
import NewsCard from '../components/NewsCard';
import { useContent } from '../content/ContentContext';

const SVE = 'Sve';

export default function Novosti() {
  const { pages, news } = useContent();
  const [filter, setFilter] = useState(SVE);
  const featured = news.featured;

  const cats = useMemo(() => {
    const seen = [];
    news.items.forEach((n) => {
      if (n.cat && !seen.includes(n.cat)) seen.push(n.cat);
    });
    return [SVE, ...seen];
  }, [news.items]);

  const shown = useMemo(
    () => (filter === SVE ? news.items : news.items.filter((n) => n.cat === filter)),
    [news.items, filter]
  );

  return (
    <>
      <PageHero page={pages['/novosti']} />

      <section className="slab slab--paper" aria-labelledby="naslov-vijesti">
        <Brush variant="news-1" />
        <Brush variant="news-2" />

        <div className="shell">
          <Reveal>
            <span className="eyebrow">Izdvojeno</span>
            <h2 className="section-title" id="naslov-vijesti">
              Iz kluba
            </h2>
          </Reveal>

          <Reveal
            as={Link}
            to={featured.id ? `/novosti/${featured.id}` : '/novosti'}
            variant="scale"
            className="feature feature--link notch-br-24"
            delay={100}
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

          <Reveal className="chips" delay={140} role="group" aria-label="Filtriranje novosti">
            {cats.map((c) => (
              <button
                type="button"
                key={c}
                className={`chip${c === filter ? ' is-on' : ''}`}
                aria-pressed={c === filter}
                onClick={() => setFilter(c)}
              >
                {c}
              </button>
            ))}
          </Reveal>

          <div className="news-list">
            {shown.map((item, i) => (
              <NewsCard item={item} index={i} key={item.id ?? item.title} />
            ))}
          </div>

          {shown.length === 0 && (
            <p className="slab__foot">
              <Pip /> U ovoj kategoriji još nema objava.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
