import { provjeriRedak } from '../lib/tablica';

/**
 * Upozorenje na redak tablice koji se sam sebi protivi.
 *
 * Tipfeler u tablici je najvidljivija greška koju klupska stranica može
 * imati, a jedina obrana je aritmetika samog retka: odigrano mora biti zbroj
 * ishoda, a bodovi tri po pobjedi i jedan po neriješenom.
 *
 * Namjerno **ne** blokira spremanje: odbitak bodova postoji, pa se može
 * dogoditi da je redak točan iako se ne zbraja. Zadaća je pitati, ne
 * odlučiti.
 */
export default function ProvjeraRetka({ redak }) {
  const upozorenja = provjeriRedak(redak);
  if (upozorenja.length === 0) return null;

  return (
    <p className="anapomena anapomena--pazi apolje--puna">
      Provjeri brojke: {upozorenja.join(' ')}
    </p>
  );
}
