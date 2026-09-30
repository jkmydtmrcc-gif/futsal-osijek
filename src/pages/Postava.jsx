import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Reveal, { stupnjevito } from '../components/Reveal';
import PageHero from '../components/PageHero';
import PlayerCard from '../components/PlayerCard';
import PlayerModal from '../components/PlayerModal';
import Pip from '../components/Pip';
import { POSITION_GROUPS } from '../data/site';
import { useContent } from '../lib/content';

/**
 * Igrači se dijele po pozicijama iz `POSITION_GROUPS`. Ako netko u
 * administraciji upiše poziciju koja nije ni u jednoj skupini, ne nestaje —
 * dobiva vlastitu skupinu na kraju, pod svojim nazivom pozicije.
 */
function groupByPosition(players) {
  const groups = POSITION_GROUPS.map((g) => ({
    id: g.id,
    label: g.label,
    players: players.filter((p) => g.match.includes(p.pos)),
  }));

  const claimed = new Set(POSITION_GROUPS.flatMap((g) => g.match));
  const rest = players.filter((p) => !claimed.has(p.pos));
  rest.forEach((p) => {
    const found = groups.find((g) => g.label === p.pos);
    if (found) found.players.push(p);
    else groups.push({ id: p.pos, label: p.pos || 'Ostali', players: [p] });
  });

  return groups.filter((g) => g.players.length > 0);
}

export default function Postava() {
  const { pages, players, staff, images } = useContent();
  const groups = useMemo(() => groupByPosition(players), [players]);
  const [open, setOpen] = useState(null);

  const keepers = players.filter((p) => p.pos === 'Vratar').length;

  return (
    <>
      <PageHero page={pages['/postava']} grafika={images.artPostava}>
        <div className="phero__stats">
          <span className="phero__stat">
            <strong>{players.length}</strong> igrača
          </span>
          <span className="phero__stat">
            <strong>{keepers}</strong> {keepers === 1 ? 'vratar' : 'vratara'}
          </span>
          <span className="phero__stat">
            <strong>{staff.length}</strong> u stožeru
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
            {players.map((p) => (
              <span className="numbers__n" key={p.name}>
                {p.number}
              </span>
            ))}
          </Reveal>
        </div>
      </section>

      {/* --- Igrači po pozicijama ------------------------------------------ */}
      <section className="slab slab--paper" aria-labelledby="naslov-igraci">
        <div className="shell">
          <Reveal>
            <span className="eyebrow">Igrači</span>
            <h2 className="section-title" id="naslov-igraci">
              Momčad
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
      <section className="slab slab--dark" aria-labelledby="naslov-stozer">
        <div className="shell">
          <Reveal>
            <span className="eyebrow eyebrow--sky">Stručni stožer</span>
            <h2 className="section-title section-title--light" id="naslov-stozer">
              Iza momčadi
            </h2>
          </Reveal>

          <div className="staff-grid">
            {staff.map((s, i) => (
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

      {open && <PlayerModal player={open} onClose={() => setOpen(null)} />}
    </>
  );
}
