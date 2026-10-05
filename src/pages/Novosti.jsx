import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Pip from '../components/Pip';
import Reveal from '../components/Reveal';
import PageHero from '../components/PageHero';
import NewsCard from '../components/NewsCard';
import { useContent } from '../lib/content';
import NewsFoto from '../components/NewsFoto';

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

  const sveNaOkupu = filter === SVE;

  /* Istaknuta objava stoji u velikom okviru iznad, pa je u mreži nema —
     ali samo dok se gleda sve. Odabere li posjetitelj kategoriju, okvir se
     makne i objava se vraća među ostale; inače bi ispala iz vlastite
     kategorije. */
  const shown = useMemo(() => {
    if (filter !== SVE) return news.items.filter((n) => n.cat === filter);
    return news.items.filter((n) => n.id !== featured?.id);
  }, [news.items, filter, featured]);

  return (
    <>
      <PageHero page={pages['/novosti']} />

      <section className="slab slab--paper" aria-labelledby="naslov-vijesti">

        <div className="shell">
          <Reveal>
            <span className="eyebrow">{sveNaOkupu ? 'Izdvojeno' : 'Odabrano'}</span>
            <h2 className="section-title" id="naslov-vijesti">
              {sveNaOkupu ? 'Iz kluba' : filter}
            </h2>
          </Reveal>

          {/* Veliki okvir stoji samo dok se gleda sve. Pod filtrom bi ista
              objava bila i u okviru i u mreži ispod njega. */}
          {sveNaOkupu && featured && (
            <Reveal
              as={Link}
              to={`/novosti/${featured.id}`}
              variant="scale"
              className="feature feature--link feature--siroki"
              delay={100}
            >
              <NewsFoto src={featured.image} alt={featured.title} varijanta="okvir" />
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
          )}

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
