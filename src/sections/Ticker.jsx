import Marquee from '../components/Marquee';
import Pip from '../components/Pip';
import { TICKER } from '../data/site';

export default function Ticker() {
  return (
    <Marquee items={TICKER} className="ticker">
      {(item, i) => (
        <span className={`ticker__item${item.accent ? ' ticker__item--sky' : ''}`} key={i}>
          {item.text}
          <Pip tone="sky" />
        </span>
      )}
    </Marquee>
  );
}
