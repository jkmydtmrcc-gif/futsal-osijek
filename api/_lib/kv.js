/**
 * Pohrana ključ–vrijednost.
 *
 * U produkciji je Upstash Redis preko REST sučelja — obični `fetch`, bez
 * ijedne dodatne ovisnosti, pa isti kod radi i na Edge runtimeu. Ako
 * varijable okoline nisu postavljene (lokalni razvoj), koristi se pohrana u
 * memoriji procesa: dovoljna za probu, a nestaje s ponovnim pokretanjem, što
 * se u razvoju i očekuje.
 */

const URL_ENV = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN_ENV = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

export const kvIsPersistent = Boolean(URL_ENV && TOKEN_ENV);

/**
 * U produkciji pohrana u memoriji nije samo nepraktična nego i nesigurna:
 * svaka instanca funkcije ima svoju memoriju, pa bi kod za prijavu spremljen
 * na jednoj bio nevidljiv drugoj — a ograničenja broja pokušaja bi se dala
 * zaobići jednostavnim ponavljanjem dok zahtjev ne padne na svježu instancu.
 * Zato se prijava bez trajne pohrane u produkciji uopće ne pokreće.
 */
export function requirePersistentStore() {
  if (kvIsPersistent) return null;
  if (process.env.NODE_ENV === 'development') return null;
  return 'Pohrana nije postavljena (UPSTASH_REDIS_REST_URL i UPSTASH_REDIS_REST_TOKEN).';
}

/* --- pohrana u memoriji (samo razvoj) ------------------------------------- */

const mem = new Map();

function memGet(key) {
  const row = mem.get(key);
  if (!row) return null;
  if (row.expires && row.expires < Date.now()) {
    mem.delete(key);
    return null;
  }
  return row.value;
}

/* --- Upstash REST ---------------------------------------------------------- */

async function upstash(command) {
  const res = await fetch(URL_ENV, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN_ENV}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(command),
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Pohrana nije dostupna (${res.status}).`);
  }

  const data = await res.json();
  if (data.error) throw new Error(`Pohrana: ${data.error}`);
  return data.result;
}

/* --- javno sučelje --------------------------------------------------------- */

/** Čita vrijednost. Nepostojeći ili istekli ključ vraća `null`. */
export async function kvGet(key) {
  if (!kvIsPersistent) return memGet(key);
  const raw = await upstash(['GET', key]);
  return raw === null || raw === undefined ? null : raw;
}

/** Zapisuje vrijednost; `ttlSeconds` je neobavezan rok trajanja. */
export async function kvSet(key, value, ttlSeconds) {
  if (!kvIsPersistent) {
    mem.set(key, { value, expires: ttlSeconds ? Date.now() + ttlSeconds * 1000 : 0 });
    return;
  }
  const cmd = ['SET', key, value];
  if (ttlSeconds) cmd.push('EX', String(ttlSeconds));
  await upstash(cmd);
}

export async function kvDel(key) {
  if (!kvIsPersistent) {
    mem.delete(key);
    return;
  }
  await upstash(['DEL', key]);
}

/**
 * Povećava brojač i vraća novu vrijednost.
 *
 * Rok se postavlja samo pri prvom povećanju — inače bi svaki novi pokušaj
 * pomicao prozor unaprijed i ograničenje nikad ne bi isteklo.
 */
export async function kvIncr(key, ttlSeconds) {
  if (!kvIsPersistent) {
    const current = Number(memGet(key) ?? 0) + 1;
    const row = mem.get(key);
    mem.set(key, {
      value: String(current),
      expires: row?.expires || Date.now() + ttlSeconds * 1000,
    });
    return current;
  }

  const count = Number(await upstash(['INCR', key]));
  if (count === 1) await upstash(['EXPIRE', key, String(ttlSeconds)]);
  return count;
}

/** JSON pomoćnici — vrijednosti se u Redisu drže kao tekst. */
export async function kvGetJson(key) {
  const raw = await kvGet(key);
  if (raw === null) return null;
  try {
    return typeof raw === 'string' ? JSON.parse(raw) : raw;
  } catch {
    return null;
  }
}

export async function kvSetJson(key, value, ttlSeconds) {
  await kvSet(key, JSON.stringify(value), ttlSeconds);
}

/** Dodaje zapis na početak popisa i reže ga na `keep` stavki (dnevnik). */
export async function kvPushCapped(key, value, keep = 50) {
  if (!kvIsPersistent) {
    const list = JSON.parse(memGet(key) ?? '[]');
    list.unshift(value);
    mem.set(key, { value: JSON.stringify(list.slice(0, keep)), expires: 0 });
    return;
  }
  await upstash(['LPUSH', key, JSON.stringify(value)]);
  await upstash(['LTRIM', key, '0', String(keep - 1)]);
}

export async function kvList(key, count = 20) {
  if (!kvIsPersistent) {
    return JSON.parse(memGet(key) ?? '[]').slice(0, count);
  }
  const rows = (await upstash(['LRANGE', key, '0', String(count - 1)])) ?? [];
  return rows
    .map((row) => {
      try {
        return JSON.parse(row);
      } catch {
        return null;
      }
    })
    .filter(Boolean);
}
