import { Link, useParams } from 'react-router-dom';
import Brush from '../components/Brush';
import Pip from '../components/Pip';
import Reveal from '../components/Reveal';
import NewsCard from '../components/NewsCard';
import NijePronadeno from './NijePronadeno';
import { useContent } from '../content/ContentContext';

/** Pojedinačna novost — `/novosti/{id}`. */
export default function Novost() {
  const { id } = useParams();
  const { news } = useContent();

  const item = news.items.find((n) => n.id === id);
  if (!item) return <NijePronadeno />;

  const others = news.items.filter((n) => n.id !== item.id).slice(0, 3);

  return (
    <>
      <article className="post">
        <section className="phero phero--post" aria-labelledby="post-naslov">
          <div className="scanlines scanlines--wide" aria-hidden="true" />
          <Brush variant="league-1" />
          <Brush variant="hero-2" />

          <div className="shell phero__inner">
            <Reveal>
              <Link className="post__back" to="/novosti">
                ← Sve novosti
              </Link>
              <span className="eyebrow eyebrow--sky">
                {item.date} · {item.cat}
              </span>
              <h1 className="phero__title" id="post-naslov">
                {item.title}
              </h1>
            </Reveal>
            <Reveal delay={130}>
              <p className="phero__lead">{item.lead}</p>
            </Reveal>
          </div>
        </section>

        <section className="slab slab--paper">
          <Brush variant="squad-2" />
          <div className="shell post__grid">
            <div className="post__main">
              {item.image && (
                <Reveal variant="scale">
                  <img
                    className="post__photo notch-br-22"
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                  />
                </Reveal>
              )}

              {(item.body ?? []).map((paragraph, i) => (
                <Reveal key={i} delay={60 + i * 70}>
                  <p className="prose prose--wide">{paragraph}</p>
                </Reveal>
              ))}
            </div>

            <Reveal as="aside" variant="right" delay={140} className="post__aside">
              <div className="post__meta">
                <span className="post__meta-label">Objavljeno</span>
                <span className="post__meta-value">{item.date}</span>
              </div>
              <div className="post__meta">
                <span className="post__meta-label">Kategorija</span>
                <span className="post__meta-value">{item.cat}</span>
              </div>
              <div className="btn-row">
                <Link className="btn btn--blue notch-12" to="/novosti">
                  Sve novosti
                </Link>
              </div>
              <p className="slab__foot">
                <Pip /> Prati klub i na društvenim mrežama.
              </p>
            </Reveal>
          </div>
        </section>
      </article>

      {others.length > 0 && (
        <section className="slab" aria-labelledby="naslov-jos">
          <div className="shell">
            <div className="section-head">
              <Reveal>
                <span className="eyebrow">Još iz kluba</span>
                <h2 className="section-title" id="naslov-jos">
                  Pročitaj i ovo
                </h2>
              </Reveal>
              <Reveal variant="right" delay={120}>
                <Link className="link-underline" to="/novosti">
                  Sve novosti →
                </Link>
              </Reveal>
            </div>

            <div className="news-list">
              {others.map((n, i) => (
                <NewsCard item={n} index={i} key={n.id} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
