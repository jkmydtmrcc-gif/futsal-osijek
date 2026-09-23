import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const KLJUC = 'mnk-osijek-kandit:kolacici';

/**
 * Obavijest o kolačićima.
 *
 * Stranica ne postavlja kolačiće za praćenje i nema analitiku, pa ovo nije
 * traka za privolu s gumbima „prihvati sve / odbij“ — takva traka pita za
 * nešto čega nema, i to je zavaravanje u drugom smjeru.
 *
 * Umjesto toga stoji obavijest što se stvarno sprema i zašto, uz poveznicu
 * na stranicu s pojedinostima. Potvrda se pamti pa se traka više ne javlja.
 *
 * Ako se ikad doda analitika ili ugradnja koja postavlja kolačiće bez pitanja,
 * ovo treba pretvoriti u pravu privolu — s odbijanjem koje stvarno radi.
 */
export default function Kolacici() {
  const [vidljivo, setVidljivo] = useState(false);

  useEffect(() => {
    // Odgoda da traka ne skoči prije nego se stranica složi.
    let t;
    try {
      if (localStorage.getItem(KLJUC) !== 'da') {
        t = setTimeout(() => setVidljivo(true), 900);
      }
    } catch {
      // Preglednik s isključenom pohranom: traka se pokaže, ali se ne pamti.
      t = setTimeout(() => setVidljivo(true), 900);
    }
    return () => clearTimeout(t);
  }, []);

  if (!vidljivo) return null;

  const potvrdi = () => {
    try {
      localStorage.setItem(KLJUC, 'da');
    } catch {
      /* bez pohrane se traka javi ponovno — bolje nego pad */
    }
    setVidljivo(false);
  };

  return (
    <div className="ck" role="region" aria-label="Obavijest o kolačićima">
      <div className="ck__inner">
        <p className="ck__text">
          Ova stranica <b>ne prati posjetitelje</b> i nema analitiku ni oglasne
          kolačiće. Sprema se samo ono bez čega ne radi — i tvoja potvrda ove
          obavijesti.{' '}
          <Link className="ck__link" to="/kolacici">
            Više o tome
          </Link>
        </p>
        <button type="button" className="ck__btn" onClick={potvrdi}>
          U redu
        </button>
      </div>
    </div>
  );
}
