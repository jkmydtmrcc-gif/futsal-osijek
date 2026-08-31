/**
 * Korak 1. prijave: pošalji kod SMS-om.
 *
 * Odgovor je uvijek isti, bez obzira je li broj na popisu urednika. Kad bi se
 * razlikovao, ovaj bi zahtjev postao alat za provjeru „je li ovaj broj
 * administrator“ — a to je pola posla za napadača.
 */
import { fail, json, readJson, requireMethod, sameOrigin, clientIp } from '../_lib/http.js';
import { normalizePhone, findAdmin, adminsConfigured } from '../_lib/admins.js';
import { randomCode, sha256Hex, randomId } from '../_lib/crypto.js';
import { kvSetJson, requirePersistentStore } from '../_lib/kv.js';
import { hit, LIMITS } from '../_lib/ratelimit.js';
import { sendLoginCode, smsIsLive } from '../_lib/sms.js';
import { sessionConfigured } from '../_lib/session.js';

export const config = { runtime: 'edge' };

export const CODE_TTL = 5 * 60;

/** Isti odgovor za sve — razlika je samo u zapisu poslužitelja. */
const NEUTRAL = {
  ok: true,
  message: 'Ako je broj na popisu urednika, kod stiže SMS-om u idućih minutu.',
};

export default async function handler(request) {
  const notAllowed = requireMethod(request, 'POST');
  if (notAllowed) return notAllowed;

  if (!sameOrigin(request)) return fail(403, 'Zahtjev nije s ove stranice.');

  const noStore = requirePersistentStore();
  if (noStore) return fail(503, `Prijava nije dostupna: ${noStore}`);

  if (!adminsConfigured() || !sessionConfigured()) {
    return fail(
      503,
      'Prijava još nije postavljena na poslužitelju (ADMIN_PHONES i SESSION_SECRET).'
    );
  }

  const body = await readJson(request, 2000);
  if (body.tooLarge || body.invalid) return fail(400, 'Neispravan zahtjev.');

  const phone = normalizePhone(body.data?.phone);
  if (!phone) return fail(400, 'Upiši broj mobitela, npr. 0911234567.');

  const ip = clientIp(request);

  // Ograničenja idu prije svega ostalog — i prije provjere je li broj na
  // popisu — da se brojanjem odgovora ne može zaključiti ništa o popisu.
  const perIp = await hit('code-ip', ip, LIMITS.codePerIp.limit, LIMITS.codePerIp.window);
  if (!perIp.ok) return fail(429, 'Previše pokušaja. Pokušaj ponovno za sat vremena.');

  const perPhone = await hit(
    'code-phone',
    await sha256Hex(phone),
    LIMITS.codePerPhone.limit,
    LIMITS.codePerPhone.window
  );
  if (!perPhone.ok) {
    return fail(429, 'Previše zatraženih kodova za ovaj broj. Pokušaj za 15 minuta.');
  }

  const admin = findAdmin(phone);
  const challengeId = randomId(16);

  /* Broj koji nije na popisu dobiva mamac: izazov s nasumičnim sažetkom koji
     se nikad ne može pogoditi. Bez toga bi se popis urednika dao pročitati
     samo po tome sadrži li odgovor `challengeId` — a upravo to je razlog
     zašto je odgovor uopće neutralan. Ovako su odgovori jednaki i ovdje i u
     idućem koraku (isti tekstovi, isto brojanje pokušaja). */
  if (!admin) {
    console.warn(`[prijava] odbijen broj koji nije na popisu (IP ${ip})`);

    await kvSetJson(
      `otp:${challengeId}`,
      { phone: null, hash: await sha256Hex(randomId(32)), attempts: 0, createdAt: Date.now() },
      CODE_TTL
    );

    /* Pravi put uključuje poziv davatelju SMS-a i traje; ovaj ne. Nasumična
       stanka zamućuje tu razliku. Ne skriva je savršeno — protiv mjerenja u
       tisućama pokušaja brani ograničenje broja zahtjeva, ne ovo. */
    await new Promise((r) => setTimeout(r, 120 + Math.random() * 280));

    return json({ ...NEUTRAL, challengeId, expiresIn: CODE_TTL, devMode: !smsIsLive });
  }

  const code = randomCode(6);

  // U pohranu ide samo sažetak koda. Tko dođe do baze, ne dobije kod —
  // a sažetak je vezan uz identifikator izazova, pa ne vrijedi drugdje.
  await kvSetJson(
    `otp:${challengeId}`,
    {
      phone,
      hash: await sha256Hex(`${challengeId}:${code}`),
      attempts: 0,
      createdAt: Date.now(),
    },
    CODE_TTL
  );

  try {
    await sendLoginCode(phone, code);
  } catch (err) {
    console.error('[prijava] slanje SMS-a nije uspjelo:', err.message);
    return fail(502, 'Slanje SMS-a trenutno ne radi. Pokušaj ponovno za koju minutu.');
  }

  return json({
    ...NEUTRAL,
    challengeId,
    expiresIn: CODE_TTL,
    // U razvoju (bez postavljenog davatelja) kod se ispisuje u zapis
    // poslužitelja; sučelje o tome obavijesti urednika da ga zna potražiti.
    devMode: !smsIsLive,
  });
}
