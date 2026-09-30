/**
 * Provjera čitanja PostgREST-ovih grešaka.
 *
 * Povod: administracija šalje svako polje nacrta kao izmjenu. Čim obrazac
 * dobije polje kojem u bazi još nema stupca, Supabase odbije **cijeli** redak
 * — pa vlasnik ne može ni ime igrača promijeniti dok ne pokrene novu shemu.
 * Ovdje se provjerava da se ime stupca izvuče točno i da se nepovezana greška
 * ne proguta.
 */
import { nedostajuciStupac, upisiBezNepoznatih } from '../src/lib/postgrest.js';

let pao = 0;
const jest = (uvjet, opis) => {
  console.log(`  ${uvjet ? '✓' : '✗'} ${opis}`);
  if (!uvjet) pao += 1;
};

console.log('\nprepoznavanje nepoznatog stupca');
jest(
  nedostajuciStupac({
    code: 'PGRST204',
    message: "Could not find the 'kickoff' column of 'utakmice' in the schema cache",
  }) === 'kickoff',
  'PGRST204 iz predmemorije sheme'
);
jest(
  nedostajuciStupac({
    code: '42703',
    message: 'column "home_score" of relation "utakmice" does not exist',
  }) === 'home_score',
  '42703 s navodnicima'
);
jest(
  nedostajuciStupac({ message: 'column utakmice.away_score does not exist' }) === 'away_score',
  '42703 s točkom umjesto navodnika'
);
jest(nedostajuciStupac('Could not find the \'round\' column of \'utakmice\'') === 'round', 'greška kao običan niz');

console.log('\nšto se ne smije prepoznati');
jest(nedostajuciStupac({ message: 'new row violates row-level security policy' }) === null, 'pravilo pristupa nije nepoznat stupac');
jest(nedostajuciStupac({ message: 'duplicate key value violates unique constraint' }) === null, 'dvostruki ključ nije nepoznat stupac');
jest(nedostajuciStupac(null) === null, 'bez greške nema stupca');
jest(nedostajuciStupac({}) === null, 'greška bez poruke ne ruši');

console.log('\nponavljanje upisa bez nepoznatih stupaca');
{
  // Baza poznaje samo `name`; ostalo odbija.
  const poznati = ['name'];
  const pokusaji = [];
  const upisi = async (polja) => {
    pokusaji.push(Object.keys(polja));
    const visak = Object.keys(polja).find((k) => !poznati.includes(k));
    return visak
      ? { error: { message: `Could not find the '${visak}' column of 'utakmice' in the schema cache` } }
      : { error: null };
  };

  const r = await upisiBezNepoznatih({ name: 'Kandit', kickoff: '2026-10-17', home_score: 3 }, upisi);
  jest(r.error === null, 'na kraju prođe');
  jest(r.izbaceno.length === 2, `izbačena su dva polja (${r.izbaceno.join(', ')})`);
  jest(r.izbaceno.includes('kickoff') && r.izbaceno.includes('home_score'), 'izbačena su točno nepoznata');
  jest(pokusaji.length === 3, `tri pokušaja, ne više (${pokusaji.length})`);
  jest(pokusaji.at(-1).join() === 'name', 'zadnji pokušaj nosi samo poznato polje');
}

{
  // Greška koja nije nepoznat stupac mora izaći van, ne smije se ponavljati.
  let brojPoziva = 0;
  const upisi = async () => {
    brojPoziva += 1;
    return { error: { message: 'new row violates row-level security policy' } };
  };
  const r = await upisiBezNepoznatih({ name: 'x' }, upisi);
  jest(r.error !== null, 'nepovezana greška se vraća');
  jest(brojPoziva === 1, 'bez ponavljanja');
  jest(r.izbaceno.length === 0, 'ništa nije izbačeno');
}

{
  // Stupac kojeg nema u nacrtu ne može se izbaciti — inače beskonačna petlja.
  let brojPoziva = 0;
  const upisi = async () => {
    brojPoziva += 1;
    return { error: { message: "Could not find the 'nepostojeci' column of 'x' in the schema cache" } };
  };
  const r = await upisiBezNepoznatih({ name: 'x' }, upisi);
  jest(r.error !== null, 'stupac izvan nacrta ne vrti petlju');
  jest(brojPoziva === 1, 'stalo je nakon prvog pokušaja');
}

console.log(pao === 0 ? '\nSVE PROLAZI\n' : `\nPALO: ${pao}\n`);
process.exit(pao === 0 ? 0 : 1);
