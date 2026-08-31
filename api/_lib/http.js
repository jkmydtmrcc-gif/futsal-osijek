/**
 * Zajednički dio svake funkcije: odgovori, zaglavlja, čitanje tijela i
 * provjera podrijetla zahtjeva.
 */

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'same-origin',
  'Cache-Control': 'no-store',
};

export function json(data, { status = 200, headers = {} } = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...SECURITY_HEADERS, ...headers },
  });
}

/** Greška u dosljednom obliku — poruka je na hrvatskom, za prikaz korisniku. */
export function fail(status, message, extra = {}) {
  return json({ ok: false, error: message, ...extra }, { status });
}

export function noContent(headers = {}) {
  return new Response(null, { status: 204, headers: { ...SECURITY_HEADERS, ...headers } });
}

/** Čita JSON tijelo uz ograničenje veličine. Vraća `null` ako nije ispravno. */
export async function readJson(request, maxBytes = 1_500_000) {
  const length = Number(request.headers.get('content-length') ?? 0);
  if (length > maxBytes) return { tooLarge: true };

  const text = await request.text();
  if (text.length > maxBytes) return { tooLarge: true };

  try {
    return { data: JSON.parse(text) };
  } catch {
    return { invalid: true };
  }
}

/**
 * Zahtjevi koji mijenjaju podatke moraju stizati s vlastite stranice.
 *
 * Kolačić je `SameSite=Lax`, što već odbija većinu CSRF-a, ali provjera
 * podrijetla zatvara i preostale rubove (obrasci, stariji preglednici). Kad
 * zaglavlja `Origin` nema — a nema ga kod poziva izvan preglednika — traži se
 * vlastito zaglavlje koje obična HTML forma ne može poslati.
 */
export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return request.headers.get('x-mnk-admin') === '1';

  try {
    const host = request.headers.get('host');
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** IP pozivatelja — za ograničavanje broja pokušaja. */
export function clientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'nepoznat';
}

/** Provjerava da je metoda dopuštena; inače vraća gotov odgovor. */
export function requireMethod(request, ...allowed) {
  if (allowed.includes(request.method)) return null;
  return fail(405, 'Metoda nije dopuštena.', { allowed });
}
