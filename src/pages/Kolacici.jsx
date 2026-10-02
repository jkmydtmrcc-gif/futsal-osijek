import Pip from '../components/Pip';
import Reveal, { stupnjevito } from '../components/Reveal';
import PageHero from '../components/PageHero';
import { useContent } from '../lib/content';

/**
 * Što se sprema u preglednik i zašto.
 *
 * Popis je kratak jer je i stvarnost kratka: stranica nema analitiku, oglase
 * ni dijeljenje podataka. Ako se to ikad promijeni, ovdje se mora promijeniti
 * prvo — stranica koja piše jedno, a radi drugo, gora je od one bez ove
 * stranice.
 */
const STAVKE = [
  {
    naziv: 'Potvrda obavijesti o kolačićima',
    vrsta: 'Nužno · ostaje do brisanja podataka preglednika',
    svrha: 'Da te obavijest ne dočeka pri svakom otvaranju stranice.',
  },
  {
    naziv: 'Prijava u administraciju',
    vrsta: 'Nužno · samo za urednike kluba',
    svrha:
      'Kad se urednik prijavi, Supabase sprema žeton prijave. Posjetitelji koji ne uređuju stranicu ovo nikad ne dobiju.',
  },
  {
    naziv: 'Pisma (Saira)',
    vrsta: 'Nije vanjsko · posluženo s ove stranice',
    svrha:
      'Pisma se dohvaćaju s ovog poslužitelja, a ne s Googleovog. Zato Google ne vidi ni tvoju IP adresu ni koju si stranicu otvorio.',
  },
  {
    naziv: 'Karta dvorane (OpenStreetMap)',
    vrsta: 'Vanjska ugradnja · učitava se sa stranicom',
    svrha:
      'Karta u podnožju učitava se odmah, pa OpenStreetMap vidi tvoju IP adresu — kao i svaki poslužitelj s kojeg preglednik nešto dohvaća. Odabran je umjesto Google Maps jer ne postavlja kolačiće za praćenje niti povezuje posjet s računom.',
  },
];

export default function Kolacici() {
  const { pages, contact } = useContent();

  return (
    <>
      <PageHero page={pages['/kolacici']} />

      <section className="slab slab--paper" aria-labelledby="naslov-kolacici">
        <div className="shell">
          <Reveal>
            <span className="eyebrow">Ukratko</span>
            <h2 className="section-title" id="naslov-kolacici">
              Ne pratimo te
            </h2>
            <p className="prose prose--wide">
              Nema Google Analyticsa, nema oglasnih mreža, nema piksela za
              praćenje i nema prodaje podataka. Ono malo što se sprema, sprema se
              da bi stranica radila. Jedina stvar koja se dohvaća s tuđeg
              poslužitelja je karta dvorane u podnožju.
            </p>
          </Reveal>

          <div className="infolist infolist--wide">
            {STAVKE.map((s, i) => (
              <Reveal className="ckrow" delay={stupnjevito(i, 90, 3)} key={s.naziv}>
                <div className="ckrow__head">
                  <h3 className="ckrow__name">{s.naziv}</h3>
                  <span className="ckrow__kind">{s.vrsta}</span>
                </div>
                <p className="ckrow__why">{s.svrha}</p>
              </Reveal>
            ))}
          </div>

          <Reveal delay={300}>
            <p className="slab__foot">
              <Pip /> Sve spremljeno možeš obrisati u postavkama preglednika
              („Obriši podatke stranice“). Za pitanja piši na{' '}
              <a className="link-inline" href={`mailto:${contact.email}`}>
                {contact.email}
              </a>
              .
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
