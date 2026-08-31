import Marquee from '../components/Marquee';
import Pip from '../components/Pip';
import { useContent } from '../content/ContentContext';

export default function Ticker() {
  const { ticker } = useContent();

  return (
    <Marquee items={ticker} className="ticker">
      {(item, i) => (
        <span className={`ticker__item${item.accent ? ' ticker__item--sky' : ''}`} key={i}>
          {item.text}
          <Pip tone="sky" />
        </span>
      )}
    </Marquee>
  );
}
