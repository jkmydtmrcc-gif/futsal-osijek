import Brush from '../components/Brush';
import Pip from '../components/Pip';
import Reveal from '../components/Reveal';
import PageHero from '../components/PageHero';
import { PAGES, IMAGES } from '../data/site';
import { useContent } from '../lib/content';

export default function Novosti() {
  const { news, featured } = useContent();

  return (
    <>
      <PageHero page={PAGES['/novosti']} />

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

          <Reveal as="article" variant="scale" className="feature notch-br-24" delay={100}>
            <img className="feature__photo" src={IMAGES.celebration} alt="Slavlje s navijačima" loading="lazy" />
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

          <div className="news-list">
            {news.map((item, i) => (
              <Reveal as="article" variant="right" delay={i * 110} className="news-card" key={item.title}>
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
      </section>
    </>
  );
}
