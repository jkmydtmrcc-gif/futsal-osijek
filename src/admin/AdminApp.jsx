import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, supabaseConfigured } from '../lib/supabase';
import Urednik from './Urednik';
import Prijava from './Prijava';
import { Polje, Tekst, Kvacica, SlikaPolje } from './Polja';
import Statistika from './Statistika';
import Postavke from './Postavke';

const KARTICE = [
  { id: 'igraci', label: 'Igrači' },
  { id: 'novosti', label: 'Novosti' },
  { id: 'utakmice', label: 'Utakmice' },
  { id: 'tablica', label: 'Tablica' },
  { id: 'shop', label: 'Fan Shop' },
  { id: 'sponzori', label: 'Sponzori' },
  { id: 'postavke', label: 'Tekstovi i kontakt' },
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
            opis="Sve odavde vidi se u kartici koja se otvori klikom na igrača. Prazno polje se u kartici ne prikazuje."
            tablica="igraci"
            opisRetka={(r) => `${r.number || '?'} · ${r.name || 'Novi igrač'}`}
            prazan={(r) => ({ sort_order: r.length + 1, name: 'Novi igrač', number: 0, pos: 'Igrač u polju', note: 'Hrvatska', photo: '', birth: '', from_place: '', height: '', foot: '', joined: '' })}
            podsadrzaj={(red) => <Statistika igracId={red.id} />}
            polja={(n, set) => (
              <>
                <Polje label="Ime i prezime" value={n.name} onChange={set('name')} />
                <Polje label="Broj na dresu" type="number" value={n.number} onChange={set('number')} />
                <Polje label="Pozicija" value={n.pos} onChange={set('pos')} placeholder="Vratar / Igrač u polju / Kapetan" />
                <Polje label="Napomena (država ili status)" value={n.note} onChange={set('note')} />
                <Polje label="Datum rođenja" value={n.birth} onChange={set('birth')} placeholder="14. 3. 1998." />
                <Polje label="Odakle je" value={n.from_place} onChange={set('from_place')} placeholder="Osijek, Hrvatska" />
                <Polje label="Visina" value={n.height} onChange={set('height')} placeholder="182 cm" />
                <Polje label="Noga" value={n.foot} onChange={set('foot')} placeholder="Desna" />
                <Polje label="U klubu od" value={n.joined} onChange={set('joined')} placeholder="2021." />
                <SlikaPolje label="Fotografija" value={n.photo} onChange={set('photo')} />
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
            prazan={(r) => ({ sort_order: r.length, date: '', cat: '', title: 'Nova vijest', lead: '', body: '', image: '', slug: '', featured: false })}
            polja={(n, set) => (
              <>
                <Polje label="Naslov" value={n.title} onChange={set('title')} />
                <Polje label="Datum (slobodan tekst)" value={n.date} onChange={set('date')} placeholder="Sezona 2025/26" />
                <Polje label="Kategorija" value={n.cat} onChange={set('cat')} placeholder="Liga" />
                <Tekst label="Uvod" value={n.lead} onChange={set('lead')} />
                <Tekst label="Tekst objave (prazan red između odlomaka)" rows={8} value={n.body} onChange={set('body')} />
                <Polje label="Adresa objave" value={n.slug} onChange={set('slug')} placeholder="vitor-lima-povratak" />
                <SlikaPolje label="Fotografija" value={n.image} onChange={set('image')} />
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
            opis="Osijek Kandit se sam ističe u tablici — piši ime točno tako. Klub bez upisanog grba pokaže inicijale."
            tablica="tablica"
            poredakPo="pos"
            opisRetka={(r) => `${r.pos}. ${r.club || 'Novi klub'} — ${r.points ?? 0} bod.`}
            prazan={(r) => ({ pos: r.length + 1, club: 'Novi klub', played: 0, points: 0, logo: '' })}
            polja={(n, set) => (
              <>
                <Polje label="Pozicija" type="number" value={n.pos} onChange={set('pos')} />
                <Polje label="Klub" value={n.club} onChange={set('club')} />
                <Polje label="Odigrano" type="number" value={n.played} onChange={set('played')} />
                <Polje label="Bodovi" type="number" value={n.points} onChange={set('points')} />
                <SlikaPolje label="Grb kluba" value={n.logo} onChange={set('logo')} />
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
            prazan={(r) => ({ sort_order: r.length + 1, name: 'Novi artikl', cat: '', brand: '', note: '', price: '', old_price: '', image: '', href: '', badge: '', art: 'dres' })}
            polja={(n, set) => (
              <>
                <Polje label="Naziv" value={n.name} onChange={set('name')} />
                <Polje label="Kategorija" value={n.cat} onChange={set('cat')} placeholder="Dresovi" />
                <Polje label="Marka" value={n.brand} onChange={set('brand')} placeholder="Joma" />
                <Tekst label="Opis" value={n.note} onChange={set('note')} />
                <Polje label="Cijena (prazno = „Provjeri cijenu”)" value={n.price} onChange={set('price')} placeholder="29,90 €" />
                <Polje label="Stara cijena" value={n.old_price} onChange={set('old_price')} placeholder="39,90 €" />
                <Polje label="Poveznica (kamo vodi klik)" type="url" value={n.href} onChange={set('href')} placeholder="https://salasport.hr/proizvod/…" />
                <Polje label="Oznaka (nije obavezno)" value={n.badge} onChange={set('badge')} placeholder="Novo" />
                <SlikaPolje label="Slika artikla" value={n.image} onChange={set('image')} />
                <Polje label="Crtež kad nema slike" value={n.art} onChange={set('art')} placeholder="dres · lopta · rukavice · hlacice · trenirka · golman · klub" />
                <Polje label="Redoslijed" type="number" value={n.sort_order} onChange={set('sort_order')} />
              </>
            )}
          />
        )}
        {kartica === 'sponzori' && (
          <Urednik
            naslov="Sponzori"
            opis="Razina određuje gdje sponzor stoji: glavni, gold ili podupiratelji. Pločica bez logotipa pokaže ime ispisano."
            tablica="sponzori"
            opisRetka={(r) => `${r.tag || r.tier} · ${r.name || 'Novi sponzor'}`}
            prazan={(r) => ({ sort_order: r.length + 1, tier: 'gold', tag: 'Gold sponzori', size: 'md', name: 'Novi sponzor', logo: '', href: '', note: '' })}
            polja={(n, set) => (
              <>
                <Polje label="Ime" value={n.name} onChange={set('name')} />
                <Polje label="Razina (oznaka)" value={n.tier} onChange={set('tier')} placeholder="glavni · gold · podupiratelji" />
                <Polje label="Naslov razine" value={n.tag} onChange={set('tag')} placeholder="Gold sponzori" />
                <Polje label="Veličina pločice" value={n.size} onChange={set('size')} placeholder="lg · md · sm" />
                <Polje label="Poveznica" type="url" value={n.href} onChange={set('href')} placeholder="https://" />
                <Polje label="Napomena" value={n.note} onChange={set('note')} />
                <SlikaPolje label="Logotip" value={n.logo} onChange={set('logo')} />
                <Polje label="Redoslijed" type="number" value={n.sort_order} onChange={set('sort_order')} />
              </>
            )}
          />
        )}

        {kartica === 'postavke' && <Postavke />}
      </main>
    </div>
  );
}
