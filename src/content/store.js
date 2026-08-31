/**
 * Pohrana uređenog sadržaja.
 *
 * Stranica je statična (Vite + Vercel), bez poslužitelja i baze — zato
 * izmjene iz administracije žive u `localStorage` preglednika u kojem su
 * napravljene. To znači:
 *   • izmjene vidi samo taj preglednik, ne i posjetitelji,
 *   • za trajnu objavu sadržaj se izveze (JSON) i preda u repozitorij,
 *     odnosno uveze na drugom uređaju.
 * Administracija to jasno piše na vrhu, da nitko ne ostane iznenađen.
 */
import { DEFAULT_CONTENT, CONTENT_VERSION } from './defaults';

export const STORAGE_KEY = 'mnk-osijek-kandit:sadrzaj';

const isPlainObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/**
 * Spaja spremljeno preko zadanog.
 *
 * Objekti se spajaju po ključevima, a nizovi se preuzimaju u cijelosti —
 * popis igrača ili redaka tablice je uređen skup, pa spajanje "po indeksu"
 * ne bi imalo smisla (brisanje retka ne bi ništa obrisalo).
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

/** Čita spremljene izmjene. Neispravan zapis se ignorira, ne ruši stranicu. */
function readStored() {
  if (typeof localStorage === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!isPlainObject(parsed) || !isPlainObject(parsed.content)) return null;
    if (parsed.version !== CONTENT_VERSION) return null;
    return parsed.content;
  } catch {
    return null;
  }
}

/** Cijeli sadržaj: zadano + spremljeno. */
export function loadContent() {
  const stored = readStored();
  return stored ? merge(DEFAULT_CONTENT, stored) : DEFAULT_CONTENT;
}

const listeners = new Set();

function announce(content) {
  listeners.forEach((fn) => fn(content));
}

/** Sprema sadržaj i javlja svima koji ga prikazuju. Vraća poruku o ishodu. */
export function saveContent(content) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: CONTENT_VERSION, savedAt: new Date().toISOString(), content })
    );
  } catch (err) {
    // Najčešće: puna pohrana (velike slike upisane kao data URL).
    return { ok: false, error: err?.name === 'QuotaExceededError' ? 'puno' : 'greska' };
  }
  announce(merge(DEFAULT_CONTENT, content));
  return { ok: true };
}

/** Briše izmjene i vraća zadani sadržaj. */
export function resetContent() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* prazna pohrana nije razlog za pad */
  }
  announce(DEFAULT_CONTENT);
}

/** Ima li spremljenih izmjena u ovom pregledniku. */
export function hasStoredContent() {
  return readStored() !== null;
}

/** Pretplata na promjene — i unutar kartice i iz druge kartice istog preglednika. */
export function subscribe(fn) {
  listeners.add(fn);

  const onStorage = (e) => {
    if (e.key === STORAGE_KEY) fn(loadContent());
  };
  window.addEventListener('storage', onStorage);

  return () => {
    listeners.delete(fn);
    window.removeEventListener('storage', onStorage);
  };
}

/** Sadržaj kao uredno oblikovan JSON — za spremanje u datoteku. */
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
