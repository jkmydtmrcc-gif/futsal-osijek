import Reveal from '../components/Reveal';
import PageHero from '../components/PageHero';
import PlayerCard from '../components/PlayerCard';
import Brush from '../components/Brush';
import { PAGES, PLAYERS, STAFF } from '../data/site';

export default function Postava() {
  return (
    <>
      <PageHero page={PAGES['/postava']} />

      <section className="slab slab--paper" aria-labelledby="naslov-igraci">
        <Brush variant="squad-1" />
        <Brush variant="squad-2" />
        <div className="shell">
          <Reveal>
            <span className="eyebrow">Igrači</span>
            <h2 className="section-title" id="naslov-igraci">
              Momčad
            </h2>
          </Reveal>

          <div className="squad-grid">
            {PLAYERS.map((player, i) => (
              <PlayerCard player={player} index={i} key={player.name} />
            ))}
          </div>

          <div className="staff staff--wide">
            {STAFF.map((s, i) => (
              <Reveal className="staff__row" key={s.role} delay={i * 100}>
                <span className="staff__role">{s.role}</span>
                <span className="staff__name">{s.name}</span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
