import { useEffect, useRef, useState } from 'react';

/**
 * Otkriva sadržaj kad uđe u vidno polje.
 *
 * Renderira se KAO traženi element (`as`), a ne kao dodatni omotač, da ne
 * razbije grid i flex rasporede. Pomak koristi zasebno CSS svojstvo
 * `translate`, a ne `transform` — tako se ne sudara s `transform` koji
 * kartice koriste na hoveru; ta se dva svojstva slažu jedno na drugo.
 */
export default function Reveal({
  as: Tag = 'div',
  variant = 'up',
  delay = 0,
  className = '',
  style,
  children,
  ...rest
}) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    // Bez IntersectionObservera (stariji preglednici, testovi) prikaži odmah.
    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return undefined;
    }

    // Ako je element već u vidnom polju pri montiranju, ne čekaj scroll.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          observer.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const classes = ['reveal', `reveal--${variant}`, shown && 'is-visible', className]
    .filter(Boolean)
    .join(' ');

  // Kašnjenje i proslijeđeni stil se spajaju — ni jedno ne gazi drugo.
  const merged = delay ? { ...style, '--reveal-delay': `${delay}ms` } : style;

  return (
    <Tag ref={ref} className={classes} style={merged} {...rest}>
      {children}
    </Tag>
  );
}
