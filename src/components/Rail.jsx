import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Vodoravna traka s karticama.
 *
 * Native scroll + scroll-snap, pa miš, trackpad, tipkovnica i dodir rade
 * sami od sebe; strelice su samo dodatak za miša. Rub se blago stapa
 * dok ima još sadržaja u tom smjeru.
 */
export default function Rail({ children, label, className = '' }) {
  const ref = useRef(null);
  const [edges, setEdges] = useState({ start: false, end: false });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setEdges({
      start: el.scrollLeft > 8,
      end: el.scrollLeft < max - 8,
    });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    measure();
    el.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    return () => {
      el.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [measure]);

  // Pomak za jednu "stranicu" trake, ali najviše jednu karticu manje
  // od širine — da uvijek ostane vidljiv trag gdje si stao.
  const page = (dir) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector('[data-rail-item]');
    const step = card ? card.getBoundingClientRect().width + 22 : el.clientWidth * 0.8;
    const count = Math.max(1, Math.floor(el.clientWidth / step));
    el.scrollBy({ left: dir * step * count, behavior: 'smooth' });
  };

  return (
    <div className={`rail ${className}`.trim()}>
      <div
        className={`rail__track${edges.start ? ' has-start' : ''}${edges.end ? ' has-end' : ''}`}
        ref={ref}
        tabIndex={0}
        role="group"
        aria-label={label}
      >
        {children}
      </div>

      <div className="rail__ctrl">
        <button
          type="button"
          className="rail__btn"
          onClick={() => page(-1)}
          disabled={!edges.start}
          aria-label="Prethodni igrači"
        >
          ←
        </button>
        <button
          type="button"
          className="rail__btn"
          onClick={() => page(1)}
          disabled={!edges.end}
          aria-label="Sljedeći igrači"
        >
          →
        </button>
      </div>
    </div>
  );
}
