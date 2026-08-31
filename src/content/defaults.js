/**
 * Zadani sadržaj stranice, složen iz `data/site.js` u jedan objekt.
 *
 * Sve što se smije uređivati iz administracije živi ovdje. Ono što nije
 * sadržaj nego struktura (rute, ikone društvenih mreža, potpis izrađivača)
 * se i dalje uvozi izravno iz `data/site.js` — takve stvari se mijenjaju u
 * kodu, ne u pregledniku.
 */
import {
  SLOGAN,
  VENUE,
  TOPBAR_STRIP,
  TICKER,
  HERO_FACTS,
  IMPACT,
  PLAYERS,
  STAFF,
  OUR_CLUB,
  PLAYOFF_CUTOFF,
  STANDINGS,
  STANDINGS_NOTE,
  FIXTURES,
  RESULTS,
  TIMELINE,
  CLUBS,
  FEATURED_NEWS,
  NEWS,
  CLUB_FACTS,
  CLUB_STORY,
  HONOURS,
  SHOP_URL,
  SHOP_SEARCH_URL,
  SHOP_LINKS,
  SHOP_PRODUCTS,
  SHOP_CUSTOM,
  SHOP_STEPS,
  SHOP_NOTE,
  CONTACT,
  VENUE_INFO,
  TICKET_FAQ,
  IMAGES,
  PAGES,
} from '../data/site';

/** Duboka kopija — zadane vrijednosti se nikad ne smiju mijenjati u mjestu. */
const clone = (value) => JSON.parse(JSON.stringify(value));

/* `STANDINGS` već ima izračunata polja (isUs, isPlayoff); u pohranu ide samo
   ono što se stvarno upisuje, a izvedeno se računa pri čitanju. */
const standingsRows = STANDINGS.map(({ pos, club, played, points }) => ({
  pos,
  club,
  played,
  points,
}));

export const DEFAULT_CONTENT = clone({
  images: IMAGES,

  hero: {
    slogan: SLOGAN,
    venue: VENUE,
    facts: HERO_FACTS,
  },

  topbar: TOPBAR_STRIP,
  ticker: TICKER,
  impact: IMPACT,

  players: PLAYERS,
  staff: STAFF,

  league: {
    ourClub: OUR_CLUB,
    playoffCutoff: PLAYOFF_CUTOFF,
    note: STANDINGS_NOTE,
    standings: standingsRows,
    fixtures: FIXTURES,
    results: RESULTS,
    clubs: CLUBS,
    timeline: TIMELINE,
  },

  news: {
    featured: FEATURED_NEWS,
    items: NEWS,
  },

  club: {
    facts: CLUB_FACTS,
    story: CLUB_STORY,
    honours: HONOURS,
  },

  shop: {
    url: SHOP_URL,
    searchUrl: SHOP_SEARCH_URL,
    note: SHOP_NOTE,
    categories: SHOP_LINKS,
    products: SHOP_PRODUCTS,
    custom: SHOP_CUSTOM,
    steps: SHOP_STEPS,
  },

  contact: CONTACT,

  tickets: {
    info: VENUE_INFO,
    faq: TICKET_FAQ,
  },

  pages: PAGES,
});

/** Verzija zapisa u pregledniku — mijenja se ako se oblik sadržaja promijeni. */
export const CONTENT_VERSION = 1;
