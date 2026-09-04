import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, supabaseConfigured } from '../lib/supabase';
import Urednik from './Urednik';
import Prijava from './Prijava';
import { Polje, Tekst, Kvacica, SlikaPolje } from './Polja';

const KARTICE = [
  { id: 'igraci', label: 'Igrači' },
  { id: 'novosti', label: 'Novosti' },
  { id: 'utakmice', label: 'Utakmice' },
  { id: 'tablica', label: 'Tablica' },
  { id: 'shop', label: 'Fan Shop' },
];

export default function AdminApp() {
  const [sesija, setSesija] = useState(undefined); // undefined = još provjeravam
  const [kartica, setKartica] = useState('igraci');

  useEffect(() => {
    if (!supabase) {
      setSesija(null);
      return undefined;
    }
    supabase.auth.getSession().then(({ data }) => setSesija(data.session ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSesija(s ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!supabaseConfigured) {
    return (
      <div className="admin admin--poruka">
        <h1 className="admin__logo">Admin</h1>
        <p className="anapomena anapomena--greska">
          Supabase još nije spojen. Postavi <code>VITE_SUPABASE_URL</code> i{' '}
          <code>VITE_SUPABASE_ANON_KEY</code>, pa osvježi stranicu.
        </p>
        <Link className="agumb" to="/">← Natrag na stranicu</Link>
      </div>
    );
  }

  if (sesija === undefined) return <div className="admin admin--poruka">Provjeravam prijavu…</div>;
  if (!sesija) return <Prijava />;

  return (
    <div className="admin">
      <header className="admin__vrh">
        <div>
          <span className="admin__logo">MNK Osijek Kandit</span>
          <span className="admin__pod">Uređivanje sadržaja</span>
        </div>
        <div className="admin__radnje">
          <Link className="agumb" to="/">Pogledaj stranicu ↗</Link>
          <button type="button" className="agumb" onClick={() => supabase.auth.signOut()}>
            Odjava
          </button>
        </div>
      </header>

      <nav className="admin__kartice" aria-label="Vrste sadržaja">
        {KARTICE.map((k) => (
          <button
            key={k.id}
            type="button"
            className={`admin__kartica${kartica === k.id ? ' je-aktivna' : ''}`}
            onClick={() => setKartica(k.id)}
          >
            {k.label}
          </button>
        ))}
      </nav>

      <main className="admin__sadrzaj">
        {kartica === 'igraci' && (
          <Urednik
            naslov="Igrači"
            opis="Redoslijed određuje poredak na stranici. Fotografija je putanja do datoteke u public/uploads/igraci/."
            tablica="igraci"
            opisRetka={(r) => `${r.number || '?'} · ${r.name || 'Novi igrač'}`}
            prazan={(r) => ({ sort_order: r.length + 1, name: 'Novi igrač', number: 0, pos: 'Igrač u polju', note: 'Hrvatska', photo: '' })}
            polja={(n, set) => (
              <>
                <Polje label="Ime i prezime" value={n.name} onChange={set('name')} />
                <Polje label="Broj na dresu" type="number" value={n.number} onChange={set('number')} />
                <Polje label="Pozicija" value={n.pos} onChange={set('pos')} />
                <Polje label="Napomena (država ili status)" value={n.note} onChange={set('note')} />
                <Polje label="Fotografija" value={n.photo} onChange={set('photo')} placeholder="/uploads/igraci/ime-prezime.webp" />
                <Polje label="Redoslijed" type="number" value={n.sort_order} onChange={set('sort_order')} />
              </>
            )}
          />
        )}

        {kartica === 'novosti' && (
          <Urednik
            naslov="Novosti"
            opis="Označena vijest ide u veliki okvir na naslovnici i stranici Novosti. Označi samo jednu."
            tablica="novosti"
            opisRetka={(r) => r.title || 'Nova vijest'}
            prazan={(r) => ({ sort_order: r.length, date: '', cat: '', title: 'Nova vijest', lead: '', featured: false })}
            polja={(n, set) => (
              <>
                <Polje label="Naslov" value={n.title} onChange={set('title')} />
                <Polje label="Datum (slobodan tekst)" value={n.date} onChange={set('date')} placeholder="Sezona 2025/26" />
                <Polje label="Kategorija" value={n.cat} onChange={set('cat')} placeholder="Liga" />
                <Tekst label="Uvod" value={n.lead} onChange={set('lead')} />
                <Kvacica label="Izdvojena vijest" value={n.featured} onChange={set('featured')} />
                <Polje label="Redoslijed" type="number" value={n.sort_order} onChange={set('sort_order')} />
              </>
            )}
          />
        )}

        {kartica === 'utakmice' && (
          <Urednik
            naslov="Nadolazeće utakmice"
            opis="Prikazuju se na naslovnici i na stranici Raspored."
            tablica="utakmice"
            opisRetka={(r) => r.title || 'Nova utakmica'}
            prazan={(r) => ({ sort_order: r.length + 1, when: '', comp: '', title: 'Domaći — Gosti', venue: '' })}
            polja={(n, set) => (
              <>
                <Polje label="Kada" value={n.when} onChange={set('when')} placeholder="Sub 17.10." />
                <Polje label="Natjecanje" value={n.comp} onChange={set('comp')} placeholder="HMNL · 7. kolo" />
                <Polje label="Susret" value={n.title} onChange={set('title')} placeholder="Osijek Kandit — Futsal Dinamo" />
                <Polje label="Dvorana" value={n.venue} onChange={set('venue')} />
                <Polje label="Redoslijed" type="number" value={n.sort_order} onChange={set('sort_order')} />
              </>
            )}
          />
        )}

        {kartica === 'tablica' && (
          <Urednik
            naslov="Tablica lige"
            opis="Osijek Kandit se sam ističe u tablici — piši ime točno tako."
            tablica="tablica"
            poredakPo="pos"
            opisRetka={(r) => `${r.pos}. ${r.club || 'Novi klub'}`}
            prazan={(r) => ({ pos: r.length + 1, club: 'Novi klub', played: 0, points: 0 })}
            polja={(n, set) => (
              <>
                <Polje label="Pozicija" type="number" value={n.pos} onChange={set('pos')} />
                <Polje label="Klub" value={n.club} onChange={set('club')} />
                <Polje label="Odigrano" type="number" value={n.played} onChange={set('played')} />
                <Polje label="Bodovi" type="number" value={n.points} onChange={set('points')} />
              </>
            )}
          />
        )}
        {kartica === 'shop' && (
          <Urednik
            naslov="Fan Shop"
            opis="Svaki artikl je kvadratić na stranici. Klik vodi na poveznicu koju upišeš — obično na stranicu artikla u SalaSportu."
            tablica="shop"
            opisRetka={(r) => r.name || 'Novi artikl'}
            prazan={(r) => ({ sort_order: r.length + 1, name: 'Novi artikl', price: '', image: '', href: '', badge: '' })}
            polja={(n, set) => (
              <>
                <Polje label="Naziv" value={n.name} onChange={set('name')} />
                <Polje label="Cijena" value={n.price} onChange={set('price')} placeholder="29,90 €" />
                <Polje label="Poveznica (kamo vodi klik)" type="url" value={n.href} onChange={set('href')} placeholder="https://salasport.hr/proizvod/…" />
                <Polje label="Oznaka (nije obavezno)" value={n.badge} onChange={set('badge')} placeholder="Novo" />
                <SlikaPolje label="Slika artikla" value={n.image} onChange={set('image')} />
                <Polje label="Redoslijed" type="number" value={n.sort_order} onChange={set('sort_order')} />
              </>
            )}
          />
        )}
      </main>
    </div>
  );
}
