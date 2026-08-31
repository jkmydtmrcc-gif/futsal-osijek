/**
 * Kriptografija — samo Web Crypto, bez node modula.
 *
 * Zbog toga isti kod radi na Vercel Edge runtimeu, u Node-u i u lokalnom
 * razvojnom poslužitelju. Ništa se ovdje ne izmišlja: brojevi su iz
 * `crypto.getRandomValues`, potpisi su HMAC-SHA256, a usporedbe tajni idu
 * u konstantnom vremenu.
 */

const enc = new TextEncoder();
const dec = new TextDecoder();

/* --- base64url ------------------------------------------------------------ */

export function b64urlEncode(bytes) {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function b64urlDecode(text) {
  const pad = text.length % 4 === 0 ? '' : '='.repeat(4 - (text.length % 4));
  const bin = atob(text.replace(/-/g, '+').replace(/_/g, '/') + pad);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

/* --- nasumičnost ---------------------------------------------------------- */

/** Nasumični heksadekadski niz — za identifikatore sesija i zapisa. */
export function randomId(bytes = 32) {
  const buf = crypto.getRandomValues(new Uint8Array(bytes));
  return Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Šesteroznamenkasti kod za prijavu.
 *
 * `getRandomValues` daje ravnomjernu raspodjelu po 32 bita, a odbacivanjem
 * vrijednosti iznad zadnje pune milijunke miče se pristranost koju bi obični
 * `% 1000000` unio.
 */
export function randomCode(digits = 6) {
  const max = 10 ** digits;
  const limit = Math.floor(0xffffffff / max) * max;
  const buf = new Uint32Array(1);
  let value;
  do {
    crypto.getRandomValues(buf);
    [value] = buf;
  } while (value >= limit);
  return String(value % max).padStart(digits, '0');
}

/* --- sažeci i potpisi ------------------------------------------------------ */

export async function sha256Hex(text) {
  const digest = await crypto.subtle.digest('SHA-256', enc.encode(text));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

async function hmacKey(secret) {
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Usporedba u konstantnom vremenu.
 *
 * Obični `===` na tajnama curi informaciju kroz vrijeme izvođenja: napadač
 * mjeri koliko je znakova pogodio. Ovdje se uvijek prođe cijela duljina.
 */
export function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

/* --- žeton sesije (JWT, HS256) -------------------------------------------- */

/**
 * Potpisuje podatke sesije.
 *
 * Žeton nosi samo identifikator sesije i rok — sve ostalo (tko je, kad se
 * prijavio) stoji na poslužitelju. Tako se sesija može poništiti odjavom;
 * žeton koji sam sebi vjeruje ne bi se dao opozvati.
 */
export async function signToken(payload, secret, ttlSeconds) {
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + ttlSeconds };
  const head = b64urlEncode(enc.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const data = `${head}.${b64urlEncode(enc.encode(JSON.stringify(body)))}`;
  const sig = await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(data));
  return `${data}.${b64urlEncode(new Uint8Array(sig))}`;
}

/** Provjerava potpis i rok. Vraća sadržaj ili `null` — nikad ne baca. */
export async function verifyToken(token, secret) {
  try {
    const parts = String(token).split('.');
    if (parts.length !== 3) return null;
    const [head, body, sig] = parts;

    const ok = await crypto.subtle.verify(
      'HMAC',
      await hmacKey(secret),
      b64urlDecode(sig),
      enc.encode(`${head}.${body}`)
    );
    if (!ok) return null;

    const payload = JSON.parse(dec.decode(b64urlDecode(body)));
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
