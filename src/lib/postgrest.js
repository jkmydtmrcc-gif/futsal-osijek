/**
 * Čitanje PostgREST-ovih grešaka.
 *
 * Shema baze se nadograđuje ponovnim pokretanjem `supabase/schema.sql`, a to
 * radi vlasnik kluba kad stigne do toga. Između objave nove verzije stranice
 * i tog trenutka administracija zna imati polje kojem u bazi nema stupca.
 *
 * Bez ovoga bi Supabase odbio **cijelo** spremanje retka zbog jednog
 * nepoznatog polja, pa vlasnik ne bi mogao ni promijeniti ime igrača dok ne
 * pokrene shemu. Zato se ime stupca izvuče iz poruke, polje se izbaci i
 * spremanje se ponovi — ostalo se spremi, a sučelje kaže što nije.
 *
 * Bez ijednog uvoza, pa `npm test` može gađati izravno.
 */

/*
 * Dvije poruke koje Supabase vraća za nepoznat stupac:
 *
 *   PGRST204  Could not find the 'kickoff' column of 'utakmice' in the schema cache
 *   42703     column "kickoff" of relation "utakmice" does not exist
 *             column utakmice.kickoff does not exist
 *
 * Prva dolazi iz PostgREST-ove predmemorije sheme, druga izravno iz Postgresa
 * kad predmemorija još nije osvježena. Obje se moraju prepoznati.
 */
const OBRASCI = [
  /Could not find the '([^']+)' column/i,
  /column "([^"]+)" of relation "[^"]+" does not exist/i,
  /column [a-z_][a-z0-9_]*\.([a-z_][a-z0-9_]*) does not exist/i,
];

/**
 * Ime stupca kojeg u bazi nema, ili `null` ako je greška nešto drugo.
 *
 * Namjerno vraća `null` za sve ostalo: tiho gutanje nepoznate greške značilo
 * bi da vlasnik misli da je spremio, a nije.
 */
export function nedostajuciStupac(greska) {
  const poruka = typeof greska === 'string' ? greska : greska?.message;
  if (!poruka) return null;

  for (const obrazac of OBRASCI) {
    const pogodak = poruka.match(obrazac);
    if (pogodak) return pogodak[1];
  }
  return null;
}

/**
 * Pokušava upis i, kad baza javi nepoznat stupac, ponavlja bez njega.
 *
 * `upisi(polja)` mora vratiti Supabaseov `{ error }`. Vraća
 * `{ error, izbaceno }` — `izbaceno` su imena polja koja nisu spremljena, da
 * sučelje može reći koja.
 *
 * Granica pokušaja postoji da greška koja se uvijek ponavlja ne zavrti petlju
 * u nedogled; deset je više nego što ijedna tablica ovdje ima novih stupaca.
 */
export async function upisiBezNepoznatih(polja, upisi, najvise = 10) {
  let trenutna = { ...polja };
  const izbaceno = [];

  for (let i = 0; i <= najvise; i += 1) {
    const { error } = await upisi(trenutna);
    if (!error) return { error: null, izbaceno };

    const stupac = nedostajuciStupac(error);
    // Stupac koji nije u nacrtu ne možemo izbaciti; ponavljanje bi bilo
    // beskonačno, pa greška ide van kakva jest.
    if (!stupac || !(stupac in trenutna)) return { error, izbaceno };

    const { [stupac]: _van, ...ostatak } = trenutna;
    trenutna = ostatak;
    izbaceno.push(stupac);
  }

  return {
    error: { message: 'Previše nepoznatih stupaca — pokreni supabase/schema.sql.' },
    izbaceno,
  };
}
