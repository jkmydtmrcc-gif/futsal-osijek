/**
 * Provjera momčadi: trener, skupine i brojevi na dresovima.
 *
 * Trener je u istom popisu kao i igrači, pa je sve što broji igrače ili
 * dresove moralo naučiti da trener nije igrač. Greška ovdje se vidi tek na
 * stranici — „17 igrača" kad ih je 16, ili broj „0" u traci s dresovima koji
 * pripada treneru.
 */
import {
  jeTrener,
  samoIgraci,
  samoTreneri,
  brojeviNaDresovima,
  grupirajMomcad,
  stozerBezKartica,
} from '../src/lib/momcad.js';
import { POSITION_GROUPS, PLAYERS } from '../src/data/site.js';
import { playerFromRow } from '../src/lib/mapiranje.js';

let pao = 0;
const jest = (uvjet, opis) => {
  console.log(`  ${uvjet ? '✓' : '✗'} ${opis}`);
  if (!uvjet) pao += 1;
};

const igrac = (name, number, pos = 'Igrač u polju') => ({ id: name, name, number, pos });

console.log('\ntko je trener');
jest(jeTrener({ pos: 'Trener' }), '„Trener"');
jest(jeTrener({ pos: 'trener ' }), 'mala slova i razmak');
jest(jeTrener({ pos: 'Glavni trener' }), '„Glavni trener"');
jest(jeTrener({ pos: 'Pomoćni trener' }), '„Pomoćni trener"');
jest(!jeTrener({ pos: 'Vratar' }), 'vratar nije trener');
jest(!jeTrener({ pos: 'Kapetan' }), 'kapetan nije trener');
jest(!jeTrener({}), 'bez pozicije ne ruši');
jest(!jeTrener(undefined), 'nepostojeća osoba ne ruši');

console.log('\nigrači i treneri');
{
  const svi = [igrac('A', 1, 'Vratar'), igrac('B', 8), igrac('T', null, 'Trener')];
  jest(samoIgraci(svi).length === 2, 'trener se ne broji kao igrač');
  jest(samoTreneri(svi).length === 1 && samoTreneri(svi)[0].name === 'T', 'treneri se izdvoje');
}
jest(samoIgraci(undefined).length === 0, 'prazan popis ne ruši');

console.log('\nbrojevi na dresovima');
{
  const svi = [igrac('A', 1), igrac('B', 0), igrac('C', null), igrac('D', ''), igrac('T', null, 'Trener'), igrac('E', 77)];
  const b = brojeviNaDresovima(svi).map((x) => x.broj);
  jest(b.join() === '1,0,77', `dres s nulom je pravi broj, prazan nije (${b.join()})`);
}
{
  // Trener s upisanim brojem (netko je greškom upisao) ipak ne ide u traku.
  const b = brojeviNaDresovima([igrac('T', 5, 'Trener'), igrac('A', 9)]).map((x) => x.broj);
  jest(b.join() === '9', 'trener nikad nije u traci dresova');
}

console.log('\nskupine');
{
  const svi = [
    igrac('Vratar 1', 1, 'Vratar'),
    igrac('Kap', 8, 'Kapetan'),
    igrac('Igrač', 19),
    igrac('Trener', null, 'Trener'),
  ];
  const g = grupirajMomcad(svi, POSITION_GROUPS);
  jest(g.map((x) => x.id).join() === 'vratari,polje,trener', `redoslijed: ${g.map((x) => x.id).join()}`);
  jest(g[1].players.length === 2, 'kapetan ide među igrače u polju');
  jest(g[2].label === 'Trener' && g[2].players.length === 1, 'trener ima svoju skupinu');
}
{
  // Pozicija pisana drukčije ne smije izbaciti osobu iz skupine.
  const g = grupirajMomcad([igrac('A', 1, 'vratar'), igrac('T', null, ' TRENER ')], POSITION_GROUPS);
  jest(g.length === 2 && g[0].id === 'vratari' && g[1].id === 'trener', 'velika/mala slova i razmaci su svejedno');
}
{
  const g = grupirajMomcad([igrac('A', 1), igrac('P', 5, 'Pivot')], POSITION_GROUPS);
  jest(g.some((x) => x.label === 'Pivot' && x.players.length === 1), 'nepoznata pozicija dobije vlastitu skupinu');
}
{
  const g = grupirajMomcad([igrac('A', 1, 'Pivot'), igrac('B', 2, 'Pivot')], POSITION_GROUPS);
  jest(g.length === 1 && g[0].players.length === 2, 'dvije osobe iste nepoznate pozicije dijele skupinu');
}
jest(grupirajMomcad([], POSITION_GROUPS).length === 0, 'prazna momčad nema skupina');

console.log('\nstožer bez duplikata');
{
  const staff = [
    { role: 'Trener', name: 'Carmine Tarantino' },
    { role: 'Kapetan', name: 'Andrej Pandurević' },
    { role: 'Fizioterapeut', name: 'Ivo Ivić' },
  ];
  const momcad = [igrac('Andrej Pandurević', 8), igrac('Carmine Tarantino', null, 'Trener')];
  const s = stozerBezKartica(staff, momcad);
  jest(s.length === 1 && s[0].name === 'Ivo Ivić', 'ostaje samo onaj tko nema karticu');
}
{
  const s = stozerBezKartica([{ role: 'Trener', name: 'ČARMINE tarantino' }], [igrac('Carmine Tarantino', null, 'Trener')]);
  jest(s.length === 0, 'imena se uspoređuju bez obzira na velika slova');
}
jest(stozerBezKartica(undefined, undefined).length === 0, 'prazan stožer ne ruši');

console.log('\nugrađeni kadar');
{
  jest(PLAYERS.length === 17, `16 igrača i trener (${PLAYERS.length})`);
  jest(samoIgraci(PLAYERS).length === 16, `igrača je 16 (${samoIgraci(PLAYERS).length})`);
  jest(samoTreneri(PLAYERS).length === 1, 'trener je jedan');

  const brojevi = brojeviNaDresovima(PLAYERS).map((b) => b.broj);
  jest(new Set(brojevi).size === brojevi.length, 'nijedan broj dresa se ne ponavlja');

  // Brojevi iz tablice s dresovima — ako se ovo slomi, netko je promijenio
  // broj, pa neka bude namjerno.
  const ocekivani = {
    Pandurević: 8, Hozjan: 77, Jamičić: 1, Sekulić: 23, 'López': 33, Petrušić: 19,
    Mijić: 4, Šalaj: 7, Suton: 88, Trdin: 11, Ronaldinho: 17, Lima: 10,
    Yuri: 20, Jurišić: 18, Jakopec: 27, Mioč: 40,
  };
  const krivi = Object.entries(ocekivani).filter(([prezime, broj]) => {
    const p = PLAYERS.find((x) => x.name.split(' ').pop() === prezime);
    return !p || p.number !== broj;
  });
  jest(krivi.length === 0, krivi.length ? `krivi brojevi: ${krivi.map((k) => k[0]).join(', ')}` : 'svih 16 brojeva se slaže s tablicom');

  jest(PLAYERS.filter((p) => p.pos === 'Vratar').map((p) => p.name).sort().join() === 'Franko Jamičić,Víctor López', 'vratari su Jamičić i López');

  // Slika koje nema ne smije se tražiti: 404 po kartici je gubitak i buka u konzoli.
  const bezDatoteke = PLAYERS.filter((p) => p.photo === '');
  jest(bezDatoteke.length === 10, `bez slike su ${bezDatoteke.length} osoba (9 igrača i trener)`);
}

console.log('\nredak iz baze bez broja');
{
  const p = playerFromRow({ id: 'x', name: 'Carmine Tarantino', number: null, pos: 'Trener' }, []);
  jest(p.number === null, 'trener iz baze ostaje bez broja');
  jest(jeTrener(p), 'i prepoznaje se kao trener');
}

console.log(pao === 0 ? '\nSVE PROLAZI\n' : `\nPALO: ${pao}\n`);
process.exit(pao === 0 ? 0 : 1);
