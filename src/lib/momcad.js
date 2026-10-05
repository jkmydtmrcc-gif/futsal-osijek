/**
 * Momčad: tko je igrač, tko trener i kako se to dijeli u skupine.
 *
 * Trener je u popisu istih redaka kao i igrači — ima karticu, profil i
 * fotografiju kao i oni, samo bez broja na dresu. Zato je sve što pita „koliko
 * je igrača" ili „koji su brojevi na dresovima" moralo naučiti da trener nije
 * igrač: inače bi stranica tvrdila da klub ima sedamnaest igrača, a jedan od
 * njih nema broj.
 *
 * Bez ijednog uvoza iz Reacta, pa `npm test` može gađati izravno.
 */

/** Miče kvačice i velika slova — „Trener" i „trener " su ista pozicija. */
const norm = (s) =>
  String(s ?? '')
    .toLocaleLowerCase('hr-HR')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, ' ')
    .trim();

/** Je li ova osoba trener? Pozicija „Glavni trener" i „Pomoćni trener" također. */
export const jeTrener = (p) => norm(p?.pos).includes('trener');

/** Samo igrači — bez trenera. */
export const samoIgraci = (players) => (players ?? []).filter((p) => !jeTrener(p));

/** Samo treneri. */
export const samoTreneri = (players) => (players ?? []).filter(jeTrener);

/** `0` je broj (dres s nulom postoji), prazno i `null` nisu. */
const imaBroj = (v) => v !== null && v !== undefined && v !== '' && Number.isFinite(Number(v));

/**
 * Brojevi na dresovima za traku na stranici momčadi.
 *
 * Samo igrači koji broj stvarno imaju: igrač kojem broj još nije upisan ne
 * smije u traku kao „0", a trener ga nema nikad.
 */
export function brojeviNaDresovima(players) {
  return samoIgraci(players)
    .filter((p) => imaBroj(p.number))
    .map((p) => ({ key: p.id ?? p.name, broj: Number(p.number) }));
}

/**
 * Igrači (i trener) po skupinama iz `POSITION_GROUPS`.
 *
 * Ako netko u administraciji upiše poziciju koja nije ni u jednoj skupini, ne
 * nestaje — dobiva vlastitu skupinu na kraju, pod svojim nazivom pozicije.
 */
export function grupirajMomcad(players, grupe) {
  const popis = players ?? [];
  const skupine = grupe.map((g) => {
    const trazeno = g.match.map(norm);
    return {
      id: g.id,
      label: g.label,
      players: popis.filter((p) => trazeno.includes(norm(p.pos))),
    };
  });

  const zauzeto = new Set(grupe.flatMap((g) => g.match.map(norm)));
  popis
    .filter((p) => !zauzeto.has(norm(p.pos)))
    .forEach((p) => {
      const nadjena = skupine.find((g) => norm(g.label) === norm(p.pos));
      if (nadjena) nadjena.players.push(p);
      else skupine.push({ id: p.pos, label: p.pos || 'Ostali', players: [p] });
    });

  return skupine.filter((g) => g.players.length > 0);
}

/**
 * Stožer bez onih koji već imaju svoju karticu.
 *
 * Trener i kapetan su se vodili u popisu stožera, a sad stoje u momčadi s
 * fotografijom i profilom. Da ostanu na oba mjesta, isto bi se ime pojavilo
 * dvaput na istoj stranici.
 */
export function stozerBezKartica(staff, players) {
  const imena = new Set((players ?? []).map((p) => norm(p.name)));
  return (staff ?? []).filter((s) => !imena.has(norm(s.name)));
}
