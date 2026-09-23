import { Component } from 'react';
import { DRAFT_KEY, CACHE_KEY } from '../content/store';

/**
 * Hvata pad prikaza i nudi izlaz.
 *
 * Sadržaj stranice dolazi izvana — s poslužitelja ili iz uvezenog JSON-a — i
 * spaja se preko zadanog. Ako se tamo nađe nešto neočekivano (popis koji je
 * postao tekst, polje koje je nestalo), React sruši cijelo stablo i ostane
 * bijela stranica. Bez ovoga bi bila bijela i administracija, pa se
 * neispravan sadržaj ne bi imao gdje popraviti — jedini izlaz bilo bi ručno
 * brisanje pohrane preglednika.
 *
 * Zato ovdje stoje dva gumba: jedan miče lokalnu skicu i predmemoriju, drugi
 * vodi u administraciju.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // U zapis preglednika, da se ima što pokazati ako netko javi grešku.
    console.error('[stranica] pad prikaza:', error, info?.componentStack);
  }

  handleReset = () => {
    try {
      localStorage.removeItem(DRAFT_KEY);
      localStorage.removeItem(CACHE_KEY);
    } catch {
      /* i bez pohrane ponovno učitavanje ima smisla */
    }
    window.location.href = '/';
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="crash">
        <div className="crash__inner">
          <span className="crash__badge">Greška</span>
          <h1 className="crash__title">Nešto je puklo</h1>
          <p className="crash__lead">
            Stranica se nije uspjela prikazati. Najčešći uzrok je neispravan sadržaj —
            npr. uvezena datoteka koja nije u očekivanom obliku.
          </p>

          <div className="crash__actions">
            <button type="button" className="btn btn--solid notch-12" onClick={this.handleReset}>
              Očisti i učitaj ponovno
            </button>
            <a className="btn btn--ghost" href="/admin">
              Administracija
            </a>
          </div>

          <p className="crash__note">
            „Očisti“ briše samo lokalnu skicu i predmemoriju ovog preglednika.
            Objavljeni sadržaj ostaje netaknut.
          </p>

          <details className="crash__details">
            <summary>Tehnički podaci</summary>
            <pre>{String(this.state.error?.stack ?? this.state.error)}</pre>
          </details>
        </div>
      </div>
    );
  }
}
