/**
 * Korak 2. prijave: provjeri kod i otvori sesiju.
 *
 * Kod je jednokratan i ima tri kočnice: rok od pet minuta, najviše pet
 * pokušaja po izazovu i ograničenje po IP-u. Šesteroznamenkasti kod ima
 * milijun mogućnosti — bez ovoga bi se dao pogoditi.
 */
import { fail, json, readJson, requireMethod, sameOrigin, clientIp } from '../_lib/http.js';
import { findAdmin } from '../_lib/admins.js';
import { sha256Hex, timingSafeEqual } from '../_lib/crypto.js';
import { kvDel, kvGetJson, kvSetJson, requirePersistentStore } from '../_lib/kv.js';
import { hit, LIMITS } from '../_lib/ratelimit.js';
import { createSession, sessionConfigured } from '../_lib/session.js';
import { maskPhone } from '../_lib/content.js';

export const config = { runtime: 'edge' };

const MAX_ATTEMPTS = 5;

export default async function handler(request) {
  const notAllowed = requireMethod(request, 'POST');
  if (notAllowed) return notAllowed;

  if (!sameOrigin(request)) return fail(403, 'Zahtjev nije s ove stranice.');
  const noStore = requirePersistentStore();
  if (noStore) return fail(503, `Prijava nije dostupna: ${noStore}`);

  if (!sessionConfigured()) return fail(503, 'Prijava još nije postavljena na poslužitelju.');

  const body = await readJson(request, 2000);
  if (body.tooLarge || body.invalid) return fail(400, 'Neispravan zahtjev.');

  const challengeId = String(body.data?.challengeId ?? '').trim();
  const code = String(body.data?.code ?? '').replace(/\D/g, '');

  if (!/^[a-f0-9]{32}$/.test(challengeId) || code.length !== 6) {
    return fail(400, 'Upiši šesteroznamenkasti kod iz poruke.');
  }

  const ip = clientIp(request);
  const perIp = await hit('verify-ip', ip, LIMITS.verifyPerIp.limit, LIMITS.verifyPerIp.window);
  if (!perIp.ok) return fail(429, 'Previše pokušaja. Pokušaj ponovno za sat vremena.');

  const key = `otp:${challengeId}`;
  const challenge = await kvGetJson(key);
  if (!challenge) return fail(400, 'Kod je istekao. Zatraži novi.');

  if (challenge.attempts >= MAX_ATTEMPTS) {
    await kvDel(key);
    return fail(429, 'Previše krivih pokušaja. Zatraži novi kod.');
  }

  // Mamac (broj koji nije urednik) nema pohranjen telefon; sažetak mu je
  // nasumičan, pa usporedba padne kao i kod krivog koda — s istom porukom.
  const given = await sha256Hex(`${challengeId}:${code}`);
  if (!challenge.phone || !timingSafeEqual(given, challenge.hash)) {
    const left = MAX_ATTEMPTS - challenge.attempts - 1;
    // Preostali rok se ne produžuje — krivi pokušaj ne smije držati izazov
    // živim duže nego što je smio trajati.
    const age = Math.floor((Date.now() - challenge.createdAt) / 1000);
    await kvSetJson(key, { ...challenge, attempts: challenge.attempts + 1 }, Math.max(1, 300 - age));

    return fail(
      401,
      left > 0 ? `Kod nije točan. Preostalo pokušaja: ${left}.` : 'Kod nije točan. Zatraži novi.'
    );
  }

  // Kod je jednokratan: briše se prije nego što sesija nastane, pa isti kod
  // ne može otvoriti dvije sesije.
  await kvDel(key);

  const admin = findAdmin(challenge.phone);
  if (!admin) return fail(403, 'Ovaj broj više nije na popisu urednika.');

  let setCookie;
  try {
    setCookie = await createSession(admin);
  } catch (err) {
    console.error('[prijava] sesija:', err.message);
    return fail(503, 'Prijava još nije postavljena na poslužitelju.');
  }

  console.log(`[prijava] ${admin.name} (${maskPhone(admin.phone)}) — uspješno, IP ${ip}`);

  return json(
    { ok: true, admin: { name: admin.name, phone: maskPhone(admin.phone) } },
    { headers: { 'Set-Cookie': setCookie } }
  );
}
