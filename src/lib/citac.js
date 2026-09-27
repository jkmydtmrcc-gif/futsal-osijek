/**
 * Čitanje sadržaja iz Supabasea, bez Supabase SDK-a.
 *
 * Posjetitelju treba samo „daj mi sve retke ove tablice, poredane“. To je
 * jedan GET na PostgREST, sučelje koje Supabase ionako izlaže. SDK uz to
 * nosi prijavu, spremište i realtime preko websocketa — ništa od toga
 * posjetitelju ne treba, a u paketu je oko 250 KB koje svatko skine na
 * svakom otvaranju stranice.
 *
 * SDK zato ostaje samo u administraciji, gdje prijava i slanje slika stvarno
 * trebaju, i učitava se tek kad netko otvori `/admin`.
 *
 * Vraća isti oblik kao SDK — `{ data, error }` — pa pozivatelj ne mora znati
 * odakle sadržaj dolazi.
 */

/* `import.meta.env` postoji samo u Viteu. U Nodeu (gdje se vrti provjera)
   ga nema, pa bi izravno čitanje srušilo uvoz cijelog modula. */
const okolina = import.meta.env ?? {};
const url = okolina.VITE_SUPABASE_URL;
const key = okolina.VITE_SUPABASE_ANON_KEY;

/** Je li Supabase uopće postavljen? Bez ključeva stranica radi na ugrađenom sadržaju. */
export const bazaPostavljena = Boolean(url && key);

/** Adresa jednog upita. Izdvojeno da se može provjeriti bez mreže. */
export function adresaUpita(baza, tablica, poredak) {
  const p = new URLSearchParams({ select: '*' });
  if (poredak) p.set('order', `${poredak}.asc`);
  return `${String(baza).replace(/\/+$/, '')}/rest/v1/${encodeURIComponent(tablica)}?${p}`;
}

/**
 * Pretvara odgovor u `{ data, error }`.
 *
 * PostgREST kod greške vraća objekt s `message`, a kod uspjeha niz. Nepoznat
 * oblik je također greška: bolje pasti na ugrađeni sadržaj nego proslijediti
 * dalje nešto što mapiranje ne zna pročitati.
 */
export function procitajOdgovor(status, tijelo) {
  if (status >= 400) {
    const poruka =
      (tijelo && (tijelo.message || tijelo.error_description || tijelo.error)) ||
      `HTTP ${status}`;
    return { data: null, error: { message: poruka, code: tijelo?.code ?? String(status) } };
  }
  if (!Array.isArray(tijelo)) {
    return { data: null, error: { message: 'Neočekivan odgovor baze.', code: 'oblik' } };
  }
  return { data: tijelo, error: null };
}

/** Svi retci jedne tablice, poredani po `poredak`. */
export async function procitaj(tablica, poredak, { signal } = {}) {
  if (!bazaPostavljena) {
    return { data: null, error: { message: 'Baza nije postavljena.', code: 'nema-baze' } };
  }

  try {
    const odgovor = await fetch(adresaUpita(url, tablica, poredak), {
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Accept: 'application/json',
      },
      signal,
    });

    let tijelo = null;
    try {
      tijelo = await odgovor.json();
    } catch {
      tijelo = null;
    }
    return procitajOdgovor(odgovor.status, tijelo);
  } catch (e) {
    // Prekid pri napuštanju stranice nije greška koju treba prijaviti.
    if (e?.name === 'AbortError') return { data: null, error: null };
    return { data: null, error: { message: e?.message ?? 'Mreža nije dostupna.', code: 'mreza' } };
  }
}
