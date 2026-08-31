/**
 * Sadržaj stranice u tri sloja.
 *
 *   1. zadano iz koda (`data/site.js`) — uvijek postoji, radi i bez interneta,
 *   2. objavljeno s poslužitelja — ovo vide posjetitelji,
 *   3. skica u pregledniku — samo urednik koji je upisuje, dok ne objavi.
 *
 * Slaganje ide odozdo prema gore. Zbog prvog sloja stranica nikad ne ostaje
 * prazna: ako poslužitelj ne odgovara, prikaže se sadržaj iz koda umjesto
 * praznine.
 */
import { DEFAULT_CONTENT, CONTENT_VERSION } from './defaults';
import { fetchPublished } from './api';

/** Skica urednika — nespremljeni rad, samo u ovom pregledniku. */
export const DRAFT_KEY = 'mnk-osijek-kandit:skica';
/** Zadnji objavljeni sadržaj — da stranica ne bljesne starim tekstom. */
export const CACHE_KEY = 'mnk-osijek-kandit:objavljeno';

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/**
 * Spaja gornji sloj preko donjeg.
 *
 * Objekti se spajaju po ključevima, a nizovi se preuzimaju u cijelosti —
 * popis igrača ili redaka tablice je uređen skup, pa spajanje „po indeksu“ ne
 * bi imalo smisla (brisanje retka ne bi ništa obrisalo).
 */
export function merge(base, patch) {
  if (!isPlainObject(patch)) return patch === undefined ? base : patch;
  if (!isPlainObject(base)) return patch;

  const out = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    out[key] = key in base ? merge(base[key], value) : value;
  }
  return out;
}

/* --- lokalna pohrana ------------------------------------------------------- */

function readLocal(key) {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!isPlainObject(parsed) || !isPlainObject(parsed.content)) return null;
    if (parsed.version !== CONTENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeLocal(key, content, extra = {}) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({ version: CONTENT_VERSION, savedAt: new Date().toISOString(), ...extra, content })
    );
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.name === 'QuotaExceededError' ? 'puno' : 'greska' };
  }
}

/* --- stanje ---------------------------------------------------------------- */

/* Objavljeno se drži u modulu da se ne čita iz pohrane pri svakom spajanju. */
let published = readLocal(CACHE_KEY);

function compose() {
  const base = published ? merge(DEFAULT_CONTENT, published.content) : DEFAULT_CONTENT;
  const draft = readLocal(DRAFT_KEY);
  return draft ? merge(base, draft.content) : base;
}

const listeners = new Set();
const announce = () => listeners.forEach((fn) => fn(compose()));

/** Trenutni sadržaj sa svim slojevima. */
export function loadContent() {
  return compose();
}

/** Podatak o zadnjoj objavi (tko i kad), ako ga imamo. */
export function publishedInfo() {
  return published ? { revision: published.revision, updatedAt: published.updatedAt } : null;
}

/** Ima li ovaj preglednik nespremljenu skicu. */
export function hasDraft() {
  return readLocal(DRAFT_KEY) !== null;
}

/** Sprema skicu (samo lokalno). */
export function saveDraft(content) {
  const res = writeLocal(DRAFT_KEY, content);
  if (res.ok) announce();
  return res;
}

/** Briše skicu — stranica se vraća na objavljeno. */
export function discardDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* prazna pohrana nije razlog za pad */
  }
  announce();
}

/** Sadržaj bez skice — polazište za „vrati na objavljeno“. */
export function publishedContent() {
  return published ? merge(DEFAULT_CONTENT, published.content) : DEFAULT_CONTENT;
}

/**
 * Dohvaća objavljeni sadržaj i osvježava stranicu.
 *
 * Zove se pri pokretanju. Neuspjeh se ne prijavljuje korisniku — stranica u
 * tom slučaju pokazuje predmemorirano ili zadano, što je i dalje ispravno.
 */
export async function refreshPublished() {
  const data = await fetchPublished();
  if (!data?.content) return false;

  published = { content: data.content, revision: data.revision, updatedAt: data.updatedAt };
  writeLocal(CACHE_KEY, data.content, { revision: data.revision, updatedAt: data.updatedAt });
  announce();
  return true;
}

/** Nakon uspješne objave: skica je postala objavljeno, pa se briše. */
export function markPublished(content, meta) {
  published = { content, revision: meta?.revision, updatedAt: meta?.updatedAt };
  writeLocal(CACHE_KEY, content, meta);
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* nije kritično */
  }
  announce();
}

/** Pretplata na promjene — i unutar kartice i iz druge kartice istog preglednika. */
export function subscribe(fn) {
  listeners.add(fn);

  const onStorage = (e) => {
    if (e.key === DRAFT_KEY || e.key === CACHE_KEY) {
      if (e.key === CACHE_KEY) published = readLocal(CACHE_KEY);
      fn(compose());
    }
  };
  window.addEventListener('storage', onStorage);

  return () => {
    listeners.delete(fn);
    window.removeEventListener('storage', onStorage);
  };
}

/* --- izvoz i uvoz ----------------------------------------------------------- */

export function toJson(content) {
  return JSON.stringify({ version: CONTENT_VERSION, content }, null, 2);
}

/**
 * Čita JSON iz izvoza. Prihvaća i cijeli izvoz `{version, content}` i goli
 * sadržaj, pa ručno složena datoteka također prolazi.
 */
export function fromJson(text) {
  const parsed = JSON.parse(text);
  const content = isPlainObject(parsed?.content) ? parsed.content : parsed;
  if (!isPlainObject(content)) throw new Error('Datoteka ne sadrži sadržaj stranice.');
  return merge(DEFAULT_CONTENT, content);
}
