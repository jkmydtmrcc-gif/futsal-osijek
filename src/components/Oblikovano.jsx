import { Fragment } from 'react';
import { Link } from 'react-router-dom';
import { blokovi } from '../lib/oblikovanje';

/**
 * Tekst objave s oblikovanjem — podebljano, kurziv, podnaslovi, popisi,
 * citati i poveznice.
 *
 * Oznake čita `src/lib/oblikovanje.js` i od njih slaže stablo; ovdje se od
 * stabla grade React elementi. Ništa iz baze se ne ubacuje kao HTML.
 *
 * `omot` dobiva svaki blok, da stranica objave može svaki odlomak zasebno
 * pustiti da se pojavi (`Reveal`), a pregled u administraciji bez toga.
 */
export default function Oblikovano({ tekst, omot: Omot = Fragment, omotProps = () => ({}) }) {
  return blokovi(tekst).map((blok, i) => (
    <Omot key={i} {...omotProps(i)}>
      <Blok blok={blok} />
    </Omot>
  ));
}

function Blok({ blok }) {
  if (blok.vrsta === 'h') {
    return (
      <h2 className="prose__podnaslov">
        <Cvorovi cvorovi={blok.djeca} />
      </h2>
    );
  }

  if (blok.vrsta === 'ul' || blok.vrsta === 'ol') {
    const Popis = blok.vrsta;
    return (
      <Popis className={`prose prose--wide prose__popis prose__popis--${blok.vrsta}`}>
        {blok.stavke.map((stavka, i) => (
          <li key={i}>
            <Cvorovi cvorovi={stavka} />
          </li>
        ))}
      </Popis>
    );
  }

  const redci = blok.redci.map((red, i) => (
    <Fragment key={i}>
      {i > 0 && <br />}
      <Cvorovi cvorovi={red} />
    </Fragment>
  ));

  if (blok.vrsta === 'citat') {
    return (
      <blockquote className="prose prose--wide prose__citat">
        <p>{redci}</p>
      </blockquote>
    );
  }

  return <p className="prose prose--wide">{redci}</p>;
}

function Cvorovi({ cvorovi }) {
  return cvorovi.map((c, i) => {
    if (typeof c === 'string') return <Fragment key={i}>{c}</Fragment>;

    const djeca = <Cvorovi cvorovi={c.djeca} />;
    if (c.vrsta === 'b') return <strong key={i}>{djeca}</strong>;
    if (c.vrsta === 'i') return <em key={i}>{djeca}</em>;
    if (c.vrsta === 'u') return <u key={i}>{djeca}</u>;

    // Poveznica unutar stranice ide kroz usmjerivač (bez ponovnog učitavanja);
    // vanjska se otvara u novoj kartici.
    if (c.href.startsWith('/')) {
      return (
        <Link key={i} className="link-inline" to={c.href}>
          {djeca}
        </Link>
      );
    }
    const vanjska = /^https?:/i.test(c.href);
    return (
      <a
        key={i}
        className="link-inline"
        href={c.href}
        {...(vanjska ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {djeca}
      </a>
    );
  });
}
