/**
 * Stanje sesije.
 *
 * GET — tko je prijavljen (administracija to pita pri otvaranju).
 * DELETE — odjava: sesija se briše u pohrani i kolačić se poništava.
 */
import { fail, json, requireMethod, sameOrigin } from '../_lib/http.js';
import { findAdmin, adminsConfigured } from '../_lib/admins.js';
import {
  clearSessionCookie,
  currentAdmin,
  destroySession,
  sessionConfigured,
} from '../_lib/session.js';
import { maskPhone } from '../_lib/content.js';
import { kvIsPersistent } from '../_lib/kv.js';
import { smsIsLive } from '../_lib/sms.js';

export const config = { runtime: 'edge' };

export default async function handler(request) {
  const notAllowed = requireMethod(request, 'GET', 'DELETE');
  if (notAllowed) return notAllowed;

  // Stanje postavljenosti — administracija po njemu zna smije li obećati
  // objavu ili mora reći da poslužitelj još nije spojen.
  const setup = {
    admins: adminsConfigured(),
    session: sessionConfigured(),
    storage: kvIsPersistent,
    sms: smsIsLive,
  };

  if (!setup.session) {
    return json({ ok: true, admin: null, setup });
  }

  if (request.method === 'DELETE') {
    if (!sameOrigin(request)) return fail(403, 'Zahtjev nije s ove stranice.');
    await destroySession(request);
    return json({ ok: true, admin: null, setup }, { headers: { 'Set-Cookie': clearSessionCookie() } });
  }

  const admin = await currentAdmin(request, findAdmin);

  return json({
    ok: true,
    admin: admin ? { name: admin.name, phone: maskPhone(admin.phone), since: admin.since } : null,
    setup,
  });
}
