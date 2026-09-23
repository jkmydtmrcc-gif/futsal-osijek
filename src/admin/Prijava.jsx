import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Prijava() {
  const [email, setEmail] = useState('');
  const [lozinka, setLozinka] = useState('');
  const [greska, setGreska] = useState(null);
  const [salje, setSalje] = useState(false);

  const posalji = async (e) => {
    e.preventDefault();
    setSalje(true);
    setGreska(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password: lozinka });
    if (error) setGreska(error.message);
    setSalje(false);
  };

  return (
    <div className="admin admin--prijava">
      <form className="prijava" onSubmit={posalji}>
        <span className="prijava__nad">MNK Osijek Kandit</span>
        <h1 className="prijava__naslov">Prijava</h1>

        <label className="apolje">
          <span className="apolje__label">E-mail</span>
          <input
            className="apolje__input"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>

        <label className="apolje">
          <span className="apolje__label">Lozinka</span>
          <input
            className="apolje__input"
            type="password"
            autoComplete="current-password"
            value={lozinka}
            onChange={(e) => setLozinka(e.target.value)}
            required
          />
        </label>

        {greska && <p className="anapomena anapomena--greska">{greska}</p>}

        <button className="agumb agumb--glavni" type="submit" disabled={salje}>
          {salje ? 'Prijavljujem…' : 'Prijavi se'}
        </button>

        <Link className="prijava__natrag" to="/">← Natrag na stranicu</Link>
      </form>
    </div>
  );
}
