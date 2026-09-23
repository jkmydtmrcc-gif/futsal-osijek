/**
 * Pretvorba redaka iz Supabasea u oblik koji komponente čitaju.
 *
 * Imena stupaca u bazi i imena polja u sučelju se ne poklapaju posvuda
 * (`from_place` → `from`, `own_goals` → `ownGoals`), a to su tihe greške:
 * stranica se i dalje prikaže, samo je polje prazno. Bez prave baze ovo je
 * jedino mjesto gdje se takva greška može uhvatiti.
 *
 * Pokreće se s `npm test`.
 */
import { strict as assert } from 'node:assert';
import {
  merge,
  playerFromRow,
  newsFromRow,
  productFromRow,
  tiersFromRows,
} from '../src/lib/mapiranje.js';

let pao = 0;
function test(naziv, fn) {
  try {
    fn();
    console.log('  ✓', naziv);
  } catch (err) {
    console.log('  ✗', naziv, '\n     ', err.message);
    pao += 1;
  }
}

console.log('\nigrač iz baze');
test('from_place postaje from', () => {
  const p = playerFromRow({ id: 'a', name: 'A', from_place: 'Osijek' }, []);
  assert.equal(p.from, 'Osijek');
});
test('own_goals postaje ownGoals', () => {
  const p = playerFromRow({ id: 'a', name: 'A' }, [
    { igrac_id: 'a', season: '25/26', own_goals: 2 },
  ]);
  assert.equal(p.stats[0].ownGoals, 2);
});
test('statistika drugog igrača se ne lijepi', () => {
  const p = playerFromRow({ id: 'a', name: 'A' }, [
    { igrac_id: 'a', season: '25/26' },
    { igrac_id: 'b', season: '25/26' },
  ]);
  assert.equal(p.stats.length, 1);
});
test('prazna polja ne ruše pretvorbu', () => {
  const p = playerFromRow({ id: 'a', name: 'A' }, null);
  assert.deepEqual(p.stats, []);
  assert.equal(p.height, '');
});

console.log('\nnovost iz baze');
test('slug postaje adresa objave', () => {
  assert.equal(newsFromRow({ id: 'uuid', slug: 'vitor-lima' }).id, 'vitor-lima');
});
test('bez sluga se koristi id', () => {
  assert.equal(newsFromRow({ id: 'uuid', slug: '' }).id, 'uuid');
});
test('tekst se dijeli na odlomke', () => {
  const n = newsFromRow({ id: 'x', body: 'Prvi.\n\nDrugi.\n\n\nTreći.' });
  assert.deepEqual(n.body, ['Prvi.', 'Drugi.', 'Treći.']);
});
test('prazan tekst daje prazan popis', () => {
  assert.deepEqual(newsFromRow({ id: 'x' }).body, []);
});

console.log('\nartikl iz baze');
test('old_price postaje oldPrice', () => {
  assert.equal(productFromRow({ id: 'p', old_price: '39,90 €' }).oldPrice, '39,90 €');
});
test('prazan crtež pada na dres', () => {
  assert.equal(productFromRow({ id: 'p', art: '' }).art, 'dres');
});

console.log('\nsponzori u razine');
test('grupira se po razini, redoslijed se čuva', () => {
  const t = tiersFromRows([
    { tier: 'glavni', tag: 'Glavni sponzori', size: 'lg', name: 'Kandit' },
    { tier: 'glavni', tag: 'Glavni sponzori', size: 'lg', name: 'Saltas' },
    { tier: 'gold', tag: 'Gold sponzori', size: 'md', name: 'A' },
  ]);
  assert.equal(t.length, 2);
  assert.equal(t[0].sponsors.length, 2);
  assert.equal(t[0].size, 'lg');
});

console.log('\nspajanje postavki preko ugrađenog');
test('ugniježđeni objekt se spaja', () => {
  const m = merge({ b: { c: 2, d: 3 } }, { b: { c: 9 } });
  assert.deepEqual(m.b, { c: 9, d: 3 });
});
test('niz se preuzima u cijelosti', () => {
  assert.deepEqual(merge({ e: [1, 2, 3] }, { e: [7] }).e, [7]);
});
test('nedirnuto ostaje ugrađeno', () => {
  assert.equal(merge({ a: 1, b: 2 }, { b: 5 }).a, 1);
});

console.log(pao === 0 ? '\nSVE PROLAZI\n' : `\nPALO: ${pao}\n`);
process.exit(pao === 0 ? 0 : 1);
