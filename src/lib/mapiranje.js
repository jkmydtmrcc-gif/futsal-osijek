import * as SITE from '../data/site.js';

/**
 * Pretvorba između baze i sučelja — čiste funkcije, bez Reacta.
 *
 * Stoje odvojeno jer su to mjesta gdje se greške ne vide: imena stupaca u
 * bazi i imena polja u sučelju se ne poklapaju posvuda (`from_place` →
 * `from`, `own_goals` → `ownGoals`), pa krivo napisano ime ne ruši stranicu
 * nego samo ostavi polje prazno. Ovako se daju pokriti testom
 * (`npm test`), bez preglednika i bez baze.
 */

/** Duboka kopija zadanog sadržaja — nikad se ne mijenja u mjestu. */
const clone = (v) => JSON.parse(JSON.stringify(v));

/** Spaja spremljeno preko zadanog; nizovi se preuzimaju u cijelosti. */
export function merge(base, patch) {
  const isObj = (x) => x !== null && typeof x === 'object' && !Array.isArray(x);
  if (!isObj(patch)) return patch === undefined ? base : patch;
  if (!isObj(base)) return patch;

  const out = { ...base };
  for (const [k, v] of Object.entries(patch)) out[k] = k in base ? merge(base[k], v) : v;
  return out;
}

/** Zadani sadržaj — ono što se vidi prije nego što baza išta kaže. */
export function zadaniSadrzaj() {
  return clone({
    images: SITE.IMAGES,
    hero: { slogan: SITE.SLOGAN, venue: SITE.VENUE, facts: SITE.HERO_FACTS },
    topbar: SITE.TOPBAR_STRIP,
    topbarBadge: SITE.TOPBAR_BADGE,
    ticker: SITE.TICKER,
    impact: SITE.IMPACT,
    players: SITE.PLAYERS,
    staff: SITE.STAFF,
    league: {
      ourClub: SITE.OUR_CLUB,
      playoffCutoff: SITE.PLAYOFF_CUTOFF,
      note: SITE.STANDINGS_NOTE,
      standings: SITE.STANDINGS.map(({ pos, club, played, points, logo }) => ({
        pos,
        club,
        played,
        points,
        logo,
      })),
      fixtures: SITE.FIXTURES,
      results: SITE.RESULTS,
      clubs: SITE.CLUBS,
      timeline: SITE.TIMELINE,
    },
    news: { featured: SITE.FEATURED_NEWS, items: SITE.NEWS },
    club: { facts: SITE.CLUB_FACTS, story: SITE.CLUB_STORY, honours: SITE.HONOURS },
    shop: {
      url: SITE.SHOP_URL,
      searchUrl: SITE.SHOP_SEARCH_URL,
      note: SITE.SHOP_NOTE,
      categories: SITE.SHOP_LINKS,
      products: SITE.SHOP_PRODUCTS,
      custom: SITE.SHOP_CUSTOM,
      steps: SITE.SHOP_STEPS,
    },
    sponsors: { counts: SITE.PARTNER_COUNTS, tiers: SITE.SPONSOR_TIERS },
    contact: SITE.CONTACT,
    map: SITE.VENUE_MAP,
    tickets: { info: SITE.VENUE_INFO, faq: SITE.TICKET_FAQ },
    pages: SITE.PAGES,
  });
}

/* --- pretvorba redaka iz baze u oblik koji stranica čita ------------------ */

/* `from` je rezervirana riječ u SQL-u, pa stupac nosi ime `from_place`. */
export const playerFromRow = (row, stats) => ({
  id: row.id,
  name: row.name,
  number: row.number,
  pos: row.pos,
  note: row.note ?? '',
  photo: row.photo ?? '',
  birth: row.birth ?? '',
  from: row.from_place ?? '',
  height: row.height ?? '',
  foot: row.foot ?? '',
  joined: row.joined ?? '',
  stats: (stats ?? [])
    .filter((s) => s.igrac_id === row.id)
    .map((s) => ({
      season: s.season ?? '',
      comp: s.comp ?? '',
      games: s.games ?? 0,
      goals: s.goals ?? 0,
      penalties: s.penalties ?? 0,
      ownGoals: s.own_goals ?? 0,
    })),
});

export const newsFromRow = (row) => ({
  id: row.slug || row.id,
  date: row.date ?? '',
  cat: row.cat ?? '',
  title: row.title ?? '',
  lead: row.lead ?? '',
  image: row.image ?? '',
  body: String(row.body ?? '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean),
});

export const productFromRow = (row) => ({
  id: row.id,
  cat: row.cat ?? '',
  name: row.name ?? '',
  note: row.note ?? '',
  brand: row.brand ?? '',
  badge: row.badge ?? '',
  price: row.price ?? '',
  oldPrice: row.old_price ?? '',
  art: row.art || 'dres',
  image: row.image ?? '',
  href: row.href ?? '',
});

/** Sponzori dolaze kao ravan popis; ovdje se slažu u razine. */
export function tiersFromRows(rows) {
  const byTier = new Map();
  rows.forEach((row) => {
    const id = row.tier || 'ostalo';
    if (!byTier.has(id)) {
      byTier.set(id, {
        id,
        tag: row.tag || id,
        size: row.size || 'md',
        rotate: Boolean(row.rotate),
        sponsors: [],
      });
    }
    byTier.get(id).sponsors.push({
      name: row.name ?? '',
      logo: row.logo ?? '',
      href: row.href ?? '',
      note: row.note ?? '',
    });
  });
  return [...byTier.values()];
}
