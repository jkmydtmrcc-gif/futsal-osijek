/**
 * Provjera čitača sadržaja (PostgREST bez SDK-a).
 *
 * Ovo je put kojim posjetitelj dobiva sav sadržaj. Greška ovdje ne baci
 * iznimku nego tiho vrati ugrađeni sadržaj, pa stranica izgleda ispravno a
 * pokazuje lanjske podatke — zato se provjerava i oblik odgovora, ne samo
 * adresa.
 */
import { adresaUpita, procitajOdgovor } from '../src/lib/citac.js';

let pao = 0;
const jest = (uvjet, opis) => {
  console.log(`  ${uvjet ? '✓' : '✗'} ${opis}`);
  if (!uvjet) pao += 1;
};

console.log('\nadresa upita');
{
  const a = adresaUpita('https://abc.supabase.co', 'igraci', 'sort_order');
  jest(a.startsWith('https://abc.supabase.co/rest/v1/igraci?'), 'putanja je /rest/v1/<tablica>');
  jest(a.includes('select=%2A') || a.includes('select=*'), 'traži sve stupce');
  jest(a.includes('order=sort_order.asc'), 'poredak je uzlazni');
}
jest(
  !adresaUpita('https://abc.supabase.co', 'postavke').includes('order='),
  'bez poretka nema parametra order'
);
jest(
  adresaUpita('https://abc.supabase.co/', 'igraci', 'pos').includes('.co/rest/v1/'),
  'kosa crta na kraju adrese ne udvostručuje se'
);

console.log('\nfiltri (prijenos uživo)');
{
  // Bez filtra bi se svakih petnaest sekundi povlačili svi događaji sezone.
  const a = adresaUpita('https://abc.supabase.co', 'dogadaji', 'sort_order', {
    utakmica_id: 'eq.11111111-2222-3333-4444-555555555555',
  });
  jest(a.includes('utakmica_id=eq.11111111'), 'uvjet se nađe u adresi');
  jest(a.includes('order=sort_order.asc'), 'poredak preživi uz filtar');
}
{
  const a = adresaUpita('https://abc.supabase.co', 'utakmice', null, { status: 'eq.uzivo' });
  jest(a.includes('status=eq.uzivo') && !a.includes('order='), 'filtar radi i bez poretka');
}
{
  // Prazan uvjet ne smije postati `?status=` — PostgREST na to vrati 400 i
  // stranica bi tiho pala na ugrađeni sadržaj.
  const a = adresaUpita('https://abc.supabase.co', 'utakmice', null, {
    status: '',
    comp: undefined,
    round: null,
  });
  jest(!a.includes('status=') && !a.includes('comp=') && !a.includes('round='), 'prazni uvjeti se preskaču');
}
jest(
  !adresaUpita('https://abc.supabase.co', 'igraci', 'sort_order').includes('&amp;'),
  'bez filtara adresa ostaje ista kao prije'
);

console.log('\noblik odgovora');
{
  const r = procitajOdgovor(200, [{ id: 1 }]);
  jest(r.error === null && r.data.length === 1, 'niz je uspjeh');
}
{
  const r = procitajOdgovor(404, { message: 'relation "igraci" does not exist', code: '42P01' });
  jest(r.data === null, 'greška nema podatke');
  jest(r.error.message.includes('igraci'), 'poruka baze se prenosi');
  jest(r.error.code === '42P01', 'šifra baze se prenosi');
}
{
  const r = procitajOdgovor(500, null);
  jest(r.error.message === 'HTTP 500', 'bez tijela ostaje status');
}
{
  // Ovo je slučaj zbog kojeg provjera postoji: status 200, ali nije niz.
  const r = procitajOdgovor(200, { poruka: 'nešto drugo' });
  jest(r.data === null && r.error !== null, 'neočekivan oblik je greška, ne podatak');
}
{
  const r = procitajOdgovor(200, []);
  jest(r.error === null && r.data.length === 0, 'prazna tablica je uspjeh, ne greška');
}

console.log(pao === 0 ? '\nSVE PROLAZI\n' : `\nPALO: ${pao}\n`);
process.exit(pao === 0 ? 0 : 1);
