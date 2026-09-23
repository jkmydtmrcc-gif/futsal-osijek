import { Component } from 'react';

/**
 * Hvata pad prikaza i nudi izlaz.
 *
 * Sadržaj stranice dolazi iz baze i spaja se preko ugrađenog. Ako se tamo
 * nađe nešto neočekivano (popis koji je postao tekst, polje koje je nestalo),
 * React sruši cijelo stablo i ostane bijela stranica — bez ikakve naznake
 * što je pošlo po zlu.
 *
 * Zato ovdje stoje izlaz na naslovnicu i poveznica na administraciju, gdje se
 * neispravan unos može popraviti.
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
            npr. unos koji nije u obliku koji stranica očekuje.
          </p>

          <div className="crash__actions">
            <button type="button" className="btn btn--solid notch-12" onClick={this.handleReset}>
              Natrag na naslovnicu
            </button>
            <a className="btn btn--ghost" href="/admin">
              Administracija
            </a>
          </div>

          <p className="crash__note">
            Ako se ponavlja, provjeri zadnji unos u administraciji — najčešće je
            uzrok polje ostavljeno u obliku koji stranica ne očekuje.
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
