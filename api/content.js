/**
 * Objavljeni sadržaj stranice.
 *
 * GET  — javno. Ovo posjetitelji vide; nema prijave i smije se predmemorirati.
 * PUT  — samo prijavljeni urednik. Ovo je „objavi“ gumb: nakon njega svi vide
 *        novi sadržaj, bez novog deploya.
 */
import { fail, json, readJson, requireMethod, sameOrigin } from './_lib/http.js';
import { findAdmin } from './_lib/admins.js';
import { currentAdmin, sessionConfigured } from './_lib/session.js';
import { hit, LIMITS } from './_lib/ratelimit.js';
import { sha256Hex } from './_lib/crypto.js';
import { requirePersistentStore } from './_lib/kv.js';
import {
  MAX_CONTENT_BYTES,
  readAudit,
  readPublished,
  validateContent,
  writePublished,
} from './_lib/content.js';

export const config = { runtime: 'edge' };

export default async function handler(request) {
  const notAllowed = requireMethod(request, 'GET', 'PUT');
  if (notAllowed) return notAllowed;

  if (request.method === 'GET') return read();
  return publish(request);
}

/* --- javno čitanje --------------------------------------------------------- */

async function read() {
  const record = await readPublished();

  if (!record) {
    // Još nije ništa objavljeno — stranica tada prikazuje sadržaj iz koda.
    return json(
      { ok: true, published: false, content: null },
      { headers: { 'Cache-Control': 'public, max-age=0, s-maxage=30, stale-while-revalidate=300' } }
    );
  }

  return json(
    {
      ok: true,
      published: true,
      revision: record.revision,
      updatedAt: record.updatedAt,
      content: record.content,
    },
    {
      headers: {
        // Kratka predmemorija na rubu: objava je vidljiva gotovo odmah, a
        // stranica se ne oslanja na svaki pogodak do pohrane.
        'Cache-Control': 'public, max-age=0, s-maxage=30, stale-while-revalidate=300',
        ETag: `"${record.revision}"`,
      },
    }
  );
}

/* --- objava ---------------------------------------------------------------- */

async function publish(request) {
  if (!sameOrigin(request)) return fail(403, 'Zahtjev nije s ove stranice.');
  if (!sessionConfigured()) return fail(503, 'Poslužitelj još nije postavljen za objavu.');

  const noStore = requirePersistentStore();
  if (noStore) return fail(503, `Objava nije dostupna: ${noStore}`);

  const admin = await currentAdmin(request, findAdmin);
  if (!admin) return fail(401, 'Nisi prijavljen. Prijavi se ponovno.');

  const limit = await hit(
    'publish',
    await sha256Hex(admin.phone),
    LIMITS.publishPerAdmin.limit,
    LIMITS.publishPerAdmin.window
  );
  if (!limit.ok) return fail(429, 'Previše objava u kratko vrijeme. Pričekaj koju minutu.');

  const body = await readJson(request, MAX_CONTENT_BYTES + 100_000);
  if (body.tooLarge) {
    return fail(413, 'Sadržaj je prevelik. Slike ubaci u public/uploads/ i upiši putanju.');
  }
  if (body.invalid) return fail(400, 'Neispravan JSON.');

  let clean;
  try {
    clean = validateContent(body.data?.content);
  } catch (err) {
    return fail(422, err.message);
  }

  const record = await writePublished(clean, admin);

  console.log(`[objava] ${admin.name} → inačica ${record.revision}`);

  return json({
    ok: true,
    revision: record.revision,
    updatedAt: record.updatedAt,
    updatedBy: record.updatedBy,
    audit: await readAudit(5),
  });
}
