import { Link, useParams } from 'react-router-dom';
import Pip from '../components/Pip';
import Reveal from '../components/Reveal';
import NewsCard from '../components/NewsCard';
import PageHero from '../components/PageHero';
import NijePronadeno from './NijePronadeno';
import { useContent } from '../lib/content';

/**
 * Pojedinačna novost — `/novosti/{id}`.
 *
 * Vrh je isti kao na svakoj drugoj podstranici, samo bez klupske fotografije:
 * objava ima svoju, i ona stoji u punoj veličini iznad teksta. Ista slika
 * dvaput bila bi ponavljanje, a ne naglasak.
 */
export default function Novost() {
  const { id } = useParams();
  const { news } = useContent();

  // Istaknuta objava je od sada i u popisu, pa se nalazi i ona. Dok nije
  // bila, klik na veliki okvir je završavao ovdje, na stranici „Nema te
  // stranice“.
  const item = news.items.find((n) => n.id === id);
  if (!item) return <NijePronadeno />;

  const others = news.items.filter((n) => n.id !== item.id).slice(0, 3);

  return (
    <>
      <article className="post">
        <PageHero
          page={{ eyebrow: item.cat || 'Iz kluba', title: item.title, lead: item.lead }}
          metaImage={item.image}
          metaType="article"
          bezFotografije
          dugNaslov
          nadStranica={{ to: '/novosti', label: 'Novosti' }}
        />

        <section className="slab slab--paper">
          <div className="shell post__grid">
            <div className="post__main">
              {item.image && (
                <Reveal variant="scale" as="figure" className="post__figure">
                  <img className="post__photo" src={item.image} alt={item.title} />
                  <figcaption className="post__caption">{item.title}</figcaption>
                </Reveal>
              )}

              {(item.body ?? []).map((paragraph, i) => (
                <Reveal key={i} delay={60 + i * 70}>
                  <p className="prose prose--wide">{paragraph}</p>
                </Reveal>
              ))}

              {/* Objava bez teksta nije greška — klub ponekad objavi samo
                  naslov i fotografiju. Prazna stranica ipak nije u redu. */}
              {(item.body ?? []).length === 0 && (
                <p className="prose prose--wide">{item.lead}</p>
              )}
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
                <Link className="btn btn--blue" to="/novosti">
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
