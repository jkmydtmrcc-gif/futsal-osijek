import Brush from '../components/Brush';
import Reveal from '../components/Reveal';
import { useContent } from '../content/ContentContext';

export default function Impact() {
  const { impact } = useContent();

  return (
    <section className="impact" aria-label="Klub u brojkama">
      <Brush variant="impact" />
      <div className="shell impact__grid">
        {impact.map((stat, i) => (
          <Reveal className="impact__cell" key={stat.label} delay={i * 90}>
            <span className="impact__n">{stat.value}</span>
            <span className="impact__label">{stat.label}</span>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
