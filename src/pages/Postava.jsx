import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Reveal, { stupnjevito } from '../components/Reveal';
import PageHero from '../components/PageHero';
import PlayerCard from '../components/PlayerCard';
import PlayerModal from '../components/PlayerModal';
import Pip from '../components/Pip';
import { oblik } from '../lib/tekst';
import { POSITION_GROUPS } from '../data/site';
import { useContent } from '../lib/content';
import {
  grupirajMomcad,
  samoIgraci,
  samoTreneri,
  brojeviNaDresovima,
  stozerBezKartica,
} from '../lib/momcad';

export default function Postava() {
  const { pages, players, staff } = useContent();
  const groups = useMemo(() => grupirajMomcad(players, POSITION_GROUPS), [players]);
  const [open, setOpen] = useState(null);

  /* Trener ima karticu kao i igrači, ali nije igrač: ne ulazi u broj igrača,
     ni u brojeve na dresovima. */
  const igraci = samoIgraci(players);
  const treneri = samoTreneri(players);
  const keepers = igraci.filter((p) => p.pos === 'Vratar').length;
  const brojevi = useMemo(() => brojeviNaDresovima(players), [players]);

  /* Trener i kapetan stoje u momčadi s fotografijom, pa ih popis stožera ne
     ponavlja. Ostane li stožer prazan, cijeli se odsječak ne prikazuje. */
  const stozer = useMemo(() => stozerBezKartica(staff, players), [staff, players]);
  const uStozeru = stozer.length + treneri.length;

  return (
    <>
      <PageHero page={pages['/postava']}>
        <div className="phero__stats">
          <span className="phero__stat">
            <strong>{igraci.length}</strong> {oblik(igraci.length, 'igrač', 'igrača', 'igrača')}
          </span>
          <span className="phero__stat">
            <strong>{keepers}</strong> {keepers === 1 ? 'vratar' : 'vratara'}
          </span>
          <span className="phero__stat">
            <strong>{uStozeru}</strong> u stožeru
          </span>
        </div>
      </PageHero>

      {/* --- Brojevi na dresovima ------------------------------------------ */}
      <section className="slab slab--numbers" aria-label="Brojevi na dresovima">
        <div className="shell">
          <span className="eyebrow numbers-head">Brojevi na dresovima</span>
          {/* Brojevi se pojavljuju odjednom. Iskakali su jedan po jedan, a
              dvadeset brojeva puta 45 ms je gotovo sekunda skakanja — to je
              gif, ne popis momčadi. */}
          <Reveal className="numbers">
            {brojevi.map((b) => (
              <span className="numbers__n" key={b.key}>
                {b.broj}
              </span>
            ))}
          </Reveal>
        </div>
      </section>

      {/* --- Igrači po pozicijama ------------------------------------------ */}
      <section className="slab slab--paper" aria-labelledby="naslov-igraci">
        <div className="shell">
          <Reveal>
            <span className="eyebrow">Kadar</span>
            <h2 className="section-title" id="naslov-igraci">
              Sezona 2026/27
            </h2>
          </Reveal>

          {groups.map((group) => (
            <div className="squad-group" key={group.id}>
              <Reveal className="squad-group__head">
                <span className="squad-group__label">{group.label}</span>
                <span className="squad-group__line" aria-hidden="true" />
                <span className="squad-group__count">{group.players.length}</span>
              </Reveal>

              <div className="squad-grid">
                {group.players.map((player, i) => (
                  <PlayerCard
                    player={player}
                    index={i}
                    key={player.id ?? player.name}
                    onOpen={() => setOpen(player)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- Stožer -------------------------------------------------------- */}
      {stozer.length > 0 && (
      <section className="slab slab--dark" aria-labelledby="naslov-stozer">
        <div className="shell">
          <Reveal>
            <span className="eyebrow eyebrow--sky">Stručni stožer</span>
            <h2 className="section-title section-title--light" id="naslov-stozer">
              Iza momčadi
            </h2>
          </Reveal>

          <div className="staff-grid">
            {stozer.map((s, i) => (
              <Reveal className="staff-card" delay={stupnjevito(i, 110, 3)} key={s.role}>
                <span className="staff-card__role">{s.role}</span>
                <h3 className="staff-card__name">{s.name}</h3>
              </Reveal>
            ))}
          </div>

          <Reveal delay={280}>
            <p className="slab__foot">
              <Pip tone="sky" /> Popis se dopunjava kako klub objavljuje registracije za sezonu.{' '}
              <Link className="link-inline" to="/novosti">
                Novosti o transferima
              </Link>
            </p>
          </Reveal>
        </div>
      </section>
      )}

      {open && <PlayerModal player={open} onClose={() => setOpen(null)} />}
    </>
  );
}
