/**
 * Sesija urednika.
 *
 * Kolačić nosi samo potpisani identifikator sesije; tko je urednik i kad se
 * prijavio stoji u pohrani na poslužitelju. Zbog toga odjava stvarno gasi
 * pristup — žeton koji sam sebi vjeruje ne bi se dao opozvati prije isteka.
 */
import { signToken, verifyToken, randomId } from './crypto.js';
import { kvDel, kvGetJson, kvSetJson } from './kv.js';

export const COOKIE_NAME = 'mnk_admin';
export const SESSION_TTL = 60 * 60 * 12; // 12 sati

function secret() {
  const value = process.env.SESSION_SECRET;
  // Bez tajne se ne potpisuje ništa: potpis s pretpostavljenom vrijednošću
  // bio bi lažni osjećaj sigurnosti.
  if (!value || value.length < 32) {
    throw new Error('SESSION_SECRET nije postavljen (najmanje 32 znaka).');
  }
  return value;
}

/** Postoji li ispravno postavljena tajna — za prikaz stanja u administraciji. */
export function sessionConfigured() {
  const value = process.env.SESSION_SECRET;
  return Boolean(value && value.length >= 32);
}

function cookie(value, maxAge) {
  const parts = [
    `${COOKIE_NAME}=${value}`,
    'Path=/',
    'HttpOnly', // JavaScript stranice ga ne može pročitati
    'SameSite=Lax', // ne šalje se s tuđih stranica
    `Max-Age=${maxAge}`,
  ];
  // U razvoju je stranica na http://localhost, gdje `Secure` kolačić ne prolazi.
  if (process.env.NODE_ENV !== 'development') parts.push('Secure');
  return parts.join('; ');
}

/** Otvara sesiju i vraća zaglavlje `Set-Cookie`. */
export async function createSession(admin) {
  const sid = randomId(32);
  await kvSetJson(
    `sess:${sid}`,
    { phone: admin.phone, name: admin.name, since: new Date().toISOString() },
    SESSION_TTL
  );
  const token = await signToken({ sid }, secret(), SESSION_TTL);
  return cookie(token, SESSION_TTL);
}

/** Zaglavlje koje briše kolačić. */
export function clearSessionCookie() {
  return cookie('', 0);
}

function readCookie(request, name) {
  const header = request.headers.get('cookie');
  if (!header) return null;
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return rest.join('=');
  }
  return null;
}

/**
 * Vraća prijavljenog urednika ili `null`.
 *
 * Provjeravaju se tri stvari, sve tri moraju proći: potpis žetona, postojanje
 * sesije u pohrani (odjava je briše) i to da je broj i dalje na popisu
 * urednika — netko maknut s popusa gubi pristup odmah, bez čekanja isteka.
 */
export async function currentAdmin(request, findAdmin) {
  const token = readCookie(request, COOKIE_NAME);
  if (!token) return null;

  const payload = await verifyToken(token, secret());
  if (!payload?.sid) return null;

  const session = await kvGetJson(`sess:${payload.sid}`);
  if (!session) return null;

  const admin = findAdmin(session.phone);
  if (!admin) return null;

  return { ...admin, sid: payload.sid, since: session.since };
}

/** Gasi sesiju u pohrani. */
export async function destroySession(request) {
  const token = readCookie(request, COOKIE_NAME);
  if (!token) return;
  const payload = await verifyToken(token, secret()).catch(() => null);
  if (payload?.sid) await kvDel(`sess:${payload.sid}`);
}
