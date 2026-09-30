/**
 * Imena stupaca onako kako pišu na obrascu.
 *
 * Kad baza još nema neki stupac, `useTable` ga izbaci iz upisa i javi njegovo
 * ime — a to je ime iz baze (`home_score`). Vlasniku kluba to ništa ne znači,
 * pa se ovdje prevodi u ono što piše iznad polja.
 *
 * Popis pokriva samo stupce koji su dodani nakon prve verzije sheme; sve
 * ostalo baza ionako ima, pa se nikad ne izbacuje.
 */
const NAZIVI = {
  kickoff: 'Termin',
  home: 'Domaćin',
  away: 'Gost',
  home_score: 'Rezultat domaćina',
  away_score: 'Rezultat gosta',
  status: 'Status',
  round: 'Kolo',
  season: 'Sezona',

  wins: 'Pobjede',
  draws: 'Neriješeno',
  losses: 'Porazi',
  goals_for: 'Dani golovi',
  goals_against: 'Primljeni golovi',

  logo: 'Grb kluba',
  slug: 'Oznaka u adresi',
  image: 'Fotografija',
  body: 'Tekst objave',
  birth: 'Datum rođenja',
  from_place: 'Odakle je',
  height: 'Visina',
  foot: 'Noga',
  joined: 'U klubu od',
  cat: 'Kategorija',
  brand: 'Marka',
  note: 'Napomena',
  old_price: 'Stara cijena',
  art: 'Crtež',
  rotate: 'Rotacija',
};

/** Ime polja za prikaz; nepoznat stupac ostaje kakav jest. */
export const nazivStupca = (stupac) => NAZIVI[stupac] ?? stupac;
