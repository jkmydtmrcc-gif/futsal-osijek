import Reveal, { stupnjevito } from '../components/Reveal';
import { useContent } from '../lib/content';

export default function Impact() {
  const { impact } = useContent();

  return (
    <section className="impact" aria-label="Klub u brojkama">
      <div className="shell impact__grid">
        {impact.map((stat, i) => (
          <Reveal className="impact__cell" key={stat.label} delay={stupnjevito(i, 90, 3)}>
            <span className="impact__n">{stat.value}</span>
            <span className="impact__label">{stat.label}</span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
