/**
 * Razgovor s poslužiteljem.
 *
 * Sve što mijenja podatke šalje zaglavlje `x-mnk-admin` i `credentials:
 * 'same-origin'` — prvo je dio zaštite od CSRF-a (obična HTML forma s tuđe
 * stranice ga ne može poslati), drugo šalje kolačić sesije.
 */

const BASE = '/api';

async function call(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      credentials: 'same-origin',
      headers: {
        'x-mnk-admin': '1',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error('Nema veze s poslužiteljem.');
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* odgovor bez tijela (npr. 204) */
  }

  if (!res.ok) {
    const err = new Error(data?.error ?? `Greška ${res.status}.`);
    err.status = res.status;
    throw err;
  }

  return data;
}

/* --- sadržaj --------------------------------------------------------------- */

/**
 * Objavljeni sadržaj.
 *
 * Vraća `null` kad još ništa nije objavljeno ili kad poslužitelja nema (npr.
 * stranica podignuta bez backenda) — u oba slučaja stranica pada natrag na
 * sadržaj iz koda i radi normalno.
 */
export async function fetchPublished() {
  try {
    const data = await call('/content');
    return data?.published ? data : null;
  } catch {
    return null;
  }
}

/** Objavljuje sadržaj svima. Zahtijeva prijavu. */
export function publishContent(content) {
  return call('/content', { method: 'PUT', body: { content } });
}

/* --- prijava ---------------------------------------------------------------- */

export function fetchSession() {
  return call('/auth/session');
}

export function requestCode(phone) {
  return call('/auth/request-code', { method: 'POST', body: { phone } });
}

export function verifyCode(challengeId, code) {
  return call('/auth/verify-code', { method: 'POST', body: { challengeId, code } });
}

export function logout() {
  return call('/auth/session', { method: 'DELETE' });
}
