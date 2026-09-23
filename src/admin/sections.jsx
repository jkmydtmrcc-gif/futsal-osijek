import { Tekst, Broj, Odlomak, Odlomci, Slika, Popis, PopisTeksta } from './fields';
import { COMPETITIONS, STAT_FIELDS } from '../data/site';

/* ==========================================================================
   Kartice administracije. Svaka dobiva `c` (nacrt sadržaja) i `set(putanja,
   vrijednost)` — putanja je npr. 'league.standings'.
   ========================================================================== */

/* --- Slike ---------------------------------------------------------------- */
export function Slike({ c, set }) {
  return (
    <>
      <p className="adm-note">
        Slike u <code>public/uploads/</code> upisuju se kao putanja (npr.{' '}
        <code>/uploads/aa.jpg</code>) i vidi ih svaki posjetitelj. Slika odabrana s
        računala sprema se samo u ovaj preglednik — dobra je za probu, a za objavu je
        ubaci u <code>public/uploads/</code> i upiši putanju.
      </p>

      <Slika label="Grb kluba" value={c.images.crest} onChange={(v) => set('images.crest', v)} />
      <Slika
        label="Velika fotografija (hero, novosti)"
        value={c.images.celebration}
        onChange={(v) => set('images.celebration', v)}
      />
      <Slika label="Fotografija momčadi" value={c.images.team} onChange={(v) => set('images.team', v)} />
      <Slika label="Logotip Kandita" value={c.images.kandit} onChange={(v) => set('images.kandit', v)} />
      <Slika
        label="Izrezani igrač uz tablicu"
        hint="fotografija bez pozadine (PNG ili WEBP)"
        value={c.images.cutout}
        onChange={(v) => set('images.cutout', v)}
      />
    </>
  );
}

/* --- Naslovnica ----------------------------------------------------------- */
export function Naslovnica({ c, set }) {
  return (
    <>
      <Odlomak
        label="Slogan u heroju"
        value={c.hero.slogan}
        onChange={(v) => set('hero.slogan', v)}
        rows={3}
      />
      <Tekst label="Dvorana (podnaslov)" value={c.hero.venue} onChange={(v) => set('hero.venue', v)} />

      <h3 className="adm-h3">Tri brojke u heroju</h3>
      <Popis
        items={c.hero.facts}
        onChange={(v) => set('hero.facts', v)}
        naslov={(x) => x.label || 'Brojka'}
        novo={() => ({ value: '', label: '' })}
        fields={[
          { key: 'value', label: 'Vrijednost', placeholder: '2.' },
          { key: 'label', label: 'Opis', placeholder: 'Regularni dio HMNL-a' },
        ]}
      />

      <h3 className="adm-h3">Traka s brojkama (Impact)</h3>
      <Popis
        items={c.impact}
        onChange={(v) => set('impact', v)}
        naslov={(x) => x.label || 'Brojka'}
        novo={() => ({ value: '', label: '' })}
        fields={[
          { key: 'value', label: 'Vrijednost' },
          { key: 'label', label: 'Opis' },
        ]}
      />

      <h3 className="adm-h3">Gornja traka u zaglavlju</h3>
      <Tekst
        label="Natpis uz točkicu"
        hint="na dan utakmice npr. „Live“; inače nešto što je uvijek točno"
        value={c.topbarBadge}
        onChange={(v) => set('topbarBadge', v)}
      />
      <PopisTeksta value={c.topbar} onChange={(v) => set('topbar', v)} label="Natpisi" />

      <h3 className="adm-h3">Traka ispod heroja</h3>
      <Popis
        items={c.ticker}
        onChange={(v) => set('ticker', v)}
        naslov={(x) => x.text || 'Natpis'}
        novo={() => ({ text: '', accent: false })}
        fields={[{ key: 'text', label: 'Tekst' }]}
        render={(item, change) => (
          <label className="adm-check">
            <input
              type="checkbox"
              checked={Boolean(item.accent)}
              onChange={(e) => change({ ...item, accent: e.target.checked })}
            />
            Istaknuto (svjetlija boja)
          </label>
        )}
      />
    </>
  );
}

/* --- Novosti -------------------------------------------------------------- */
export function Novosti({ c, set }) {
  return (
    <>
      <h3 className="adm-h3">Izdvojena objava</h3>
      <p className="adm-note">
        Velika kartica na naslovnici i na stranici Novosti. <b>Poveznica</b> je oznaka
        objave na koju vodi klik.
      </p>
      <Tekst label="Oznaka (npr. Izdvojeno)" value={c.news.featured.flag} onChange={(v) => set('news.featured.flag', v)} />
      <Tekst label="Naslov" value={c.news.featured.title} onChange={(v) => set('news.featured.title', v)} />
      <Odlomak label="Uvod" value={c.news.featured.lead} onChange={(v) => set('news.featured.lead', v)} rows={3} />
      <Tekst label="Podatak ispod (meta)" value={c.news.featured.meta} onChange={(v) => set('news.featured.meta', v)} />
      <Slika label="Fotografija" value={c.news.featured.image} onChange={(v) => set('news.featured.image', v)} />
      <Tekst
        label="Poveznica na objavu"
        hint="oznaka objave iz popisa ispod"
        value={c.news.featured.id}
        onChange={(v) => set('news.featured.id', v)}
      />

      <h3 className="adm-h3">Objave</h3>
      <p className="adm-note">
        <b>Oznaka</b> je adresa objave (<code>/novosti/oznaka</code>) — bez razmaka i
        kvačica. Prve tri objave prikazuju se i na naslovnici.
      </p>
      <Popis
        items={c.news.items}
        onChange={(v) => set('news.items', v)}
        naslov={(x) => x.title || 'Nova objava'}
        prazno="Još nema objava."
        novo={() => ({
          id: `objava-${Date.now()}`,
          date: '',
          cat: 'Klub',
          title: '',
          lead: '',
          image: '',
          body: [],
        })}
        fields={[
          { key: 'title', label: 'Naslov' },
          { key: 'date', label: 'Datum / sezona', placeholder: 'Ljeto 2026.' },
          { key: 'cat', label: 'Kategorija', placeholder: 'Transferi' },
          { key: 'lead', label: 'Uvod', type: 'area' },
          { key: 'body', label: 'Tekst objave', type: 'odlomci' },
          { key: 'image', label: 'Fotografija', type: 'slika' },
          { key: 'id', label: 'Oznaka (adresa)', hint: 'bez razmaka, npr. vitor-lima-povratak' },
        ]}
      />
    </>
  );
}

/* --- Momčad --------------------------------------------------------------- */

/** Statistika jednog igrača — redak po sezoni i natjecanju. */
function StatistikaIgraca({ player, onChange }) {
  return (
    <>
      <h4 className="adm-h4">Statistika po sezonama</h4>
      <p className="adm-note">
        Jedan redak = jedna sezona u jednom natjecanju. Redak koji upišeš pojavi se
        u izborniku na kartici igrača.
      </p>
      <Popis
        items={player.stats}
        onChange={(v) => onChange({ ...player, stats: v })}
        naslov={(x) => `${x.season || 'sezona?'} · ${x.comp || COMPETITIONS[0]}`}
        prazno="Nema upisane statistike — kartica će to i reći."
        novo={() => ({
          season: '',
          comp: COMPETITIONS[0],
          ...Object.fromEntries(STAT_FIELDS.map((f) => [f.id, 0])),
        })}
        fields={[
          { key: 'season', label: 'Sezona', placeholder: '25/26' },
          { key: 'comp', label: 'Natjecanje', placeholder: COMPETITIONS[0] },
          ...STAT_FIELDS.map((f) => ({ key: f.id, label: f.label, type: 'broj' })),
        ]}
      />
    </>
  );
}

export function Momcad({ c, set }) {
  return (
    <>
      <h3 className="adm-h3">Igrači</h3>
      <p className="adm-note">
        Sve odavde vidi se u kartici koja se otvori klikom na igrača.{' '}
        <b>Pozicija</b> određuje skupinu na stranici Postava: upiši točno „Vratar“,
        „Igrač u polju“ ili „Kapetan“. Prazna polja se u kartici ne prikazuju.
      </p>
      <Popis
        trazi
        items={c.players}
        onChange={(v) => set('players', v)}
        naslov={(x) => `${x.number ?? '–'} · ${x.name || 'Novi igrač'}`}
        novo={() => ({
          id: `igrac-${Date.now()}`,
          name: '',
          number: 0,
          pos: 'Igrač u polju',
          note: 'Hrvatska',
          photo: '',
          birth: '',
          from: '',
          height: '',
          foot: '',
          joined: '',
          stats: [],
        })}
        fields={[
          { key: 'name', label: 'Ime i prezime' },
          { key: 'number', label: 'Broj na dresu', type: 'broj' },
          { key: 'pos', label: 'Pozicija' },
          { key: 'note', label: 'Napomena na kartici', placeholder: 'Hrvatska' },
          { key: 'birth', label: 'Datum rođenja', placeholder: '14. 3. 1998.' },
          { key: 'from', label: 'Odakle je', placeholder: 'Osijek, Hrvatska' },
          { key: 'height', label: 'Visina', placeholder: '182 cm' },
          { key: 'foot', label: 'Noga', placeholder: 'Desna' },
          { key: 'joined', label: 'U klubu od', placeholder: '2021.' },
          { key: 'photo', label: 'Portret', type: 'slika', hint: '/uploads/igraci/ime.webp' },
          { key: 'id', label: 'Oznaka', hint: 'bez razmaka' },
        ]}
        render={(item, change) => <StatistikaIgraca player={item} onChange={change} />}
      />

      <h3 className="adm-h3">Stručni stožer</h3>
      <Popis
        items={c.staff}
        onChange={(v) => set('staff', v)}
        naslov={(x) => `${x.role || 'Uloga'} · ${x.name || ''}`}
        novo={() => ({ role: '', name: '' })}
        fields={[
          { key: 'role', label: 'Uloga' },
          { key: 'name', label: 'Ime i prezime' },
        ]}
      />
    </>
  );
}

/* --- Liga ----------------------------------------------------------------- */
export function Liga({ c, set }) {
  return (
    <>
      <h3 className="adm-h3">Tablica</h3>
      <div className="adm-grid2">
        <Tekst
          label="Naš klub"
          hint="ime kojim se redak ističe"
          value={c.league.ourClub}
          onChange={(v) => set('league.ourClub', v)}
        />
        <Broj
          label="Mjesta za doigravanje"
          value={c.league.playoffCutoff}
          onChange={(v) => set('league.playoffCutoff', v)}
        />
      </div>
      <Odlomak
        label="Napomena ispod tablice"
        value={c.league.note}
        onChange={(v) => set('league.note', v)}
        rows={3}
      />
      <p className="adm-note">
        Redak po klub. <b>Pozicija</b> određuje mjesto u tablici, a redoslijed u
        ovom popisu je ono što se prikazuje — koristi strelice gore/dolje nakon
        promjene bodova. Grbovi drugih klubova nisu klupsko vlasništvo, pa dok
        logotip nije upisan redak pokaže inicijale kluba.
      </p>
      <Popis
        trazi
        items={c.league.standings}
        onChange={(v) => set('league.standings', v)}
        naslov={(x) => `${x.pos}. ${x.club || 'Klub'} — ${x.points ?? 0} bod.`}
        novo={() => ({
          pos: (c.league.standings?.length ?? 0) + 1,
          club: '',
          played: 0,
          points: 0,
          logo: '',
        })}
        fields={[
          { key: 'pos', label: 'Pozicija', type: 'broj' },
          { key: 'club', label: 'Klub' },
          { key: 'played', label: 'Odigrano', type: 'broj' },
          { key: 'points', label: 'Bodovi', type: 'broj' },
          { key: 'logo', label: 'Grb kluba', type: 'slika', hint: '/uploads/grbovi/klub.png' },
        ]}
      />

      <p className="adm-note">
        Tablicu možeš i posložiti po bodovima jednim klikom — pozicije se tada
        preračunaju same.
      </p>
      <button
        type="button"
        className="adm-btn adm-btn--ghost adm-btn--wide"
        onClick={() => {
          const sorted = [...(c.league.standings ?? [])]
            .sort((a, b) => (b.points ?? 0) - (a.points ?? 0))
            .map((row, i) => ({ ...row, pos: i + 1 }));
          set('league.standings', sorted);
        }}
      >
        Posloži po bodovima i prenumeriraj
      </button>

      <h3 className="adm-h3">Nadolazeće utakmice</h3>
      <Popis
        items={c.league.fixtures}
        onChange={(v) => set('league.fixtures', v)}
        naslov={(x) => x.title || 'Utakmica'}
        novo={() => ({ when: '', comp: '', title: '', venue: '' })}
        fields={[
          { key: 'when', label: 'Kada', placeholder: 'Sub 17.10.' },
          { key: 'comp', label: 'Natjecanje', placeholder: 'HMNL · 7. kolo' },
          { key: 'title', label: 'Susret', placeholder: 'Osijek Kandit — Futsal Dinamo' },
          { key: 'venue', label: 'Dvorana' },
        ]}
      />

      <h3 className="adm-h3">Odigrane utakmice</h3>
      <p className="adm-note">
        Dok je popis prazan, blok „Rezultati“ se na stranici ne prikazuje. <b>Ishod</b>{' '}
        može biti <code>w</code> (pobjeda), <code>l</code> (poraz) ili <code>d</code>{' '}
        (neriješeno) — od toga ovisi boja rezultata.
      </p>
      <Popis
        items={c.league.results}
        onChange={(v) => set('league.results', v)}
        naslov={(x) => `${x.title || 'Utakmica'} ${x.score || ''}`}
        prazno="Još nema upisanih rezultata."
        novo={() => ({ when: '', comp: '', title: '', score: '', outcome: 'w' })}
        fields={[
          { key: 'when', label: 'Kada' },
          { key: 'comp', label: 'Natjecanje' },
          { key: 'title', label: 'Susret' },
          { key: 'score', label: 'Rezultat', placeholder: '4:2' },
          { key: 'outcome', label: 'Ishod (w/l/d)' },
        ]}
      />

      <h3 className="adm-h3">Klubovi lige</h3>
      <PopisTeksta label="Popis" value={c.league.clubs} onChange={(v) => set('league.clubs', v)} rows={10} />

      <h3 className="adm-h3">Klub kroz sezone</h3>
      <Popis
        items={c.league.timeline}
        onChange={(v) => set('league.timeline', v)}
        naslov={(x) => `${x.when || ''} ${x.title || ''}`}
        novo={() => ({ when: '', title: '', note: '' })}
        fields={[
          { key: 'when', label: 'Sezona' },
          { key: 'title', label: 'Naslov' },
          { key: 'note', label: 'Opis', type: 'area' },
        ]}
      />
    </>
  );
}

/* --- Fan Shop -------------------------------------------------------------- */
export function Shop({ c, set }) {
  return (
    <>
      <p className="adm-note">
        Klub nema vlastitu naplatu — svaka kartica vodi na SalaSport. <b>Cijenu</b>{' '}
        ostavi praznom ako je ne želiš održavati; kartica tada nudi „Provjeri cijenu“.
        <b> Poveznica</b> mora voditi na stranicu koja stvarno postoji u trgovini.
      </p>

      <div className="adm-grid2">
        <Tekst label="Adresa trgovine" value={c.shop.url} onChange={(v) => set('shop.url', v)} />
        <Tekst
          label="Pretraga „kandit“"
          value={c.shop.searchUrl}
          onChange={(v) => set('shop.searchUrl', v)}
        />
      </div>
      <Odlomak label="Napomena ispod artikala" value={c.shop.note} onChange={(v) => set('shop.note', v)} rows={3} />

      <h3 className="adm-h3">Artikli</h3>
      <p className="adm-note">
        <b>Crtež</b> se koristi kad nema fotografije: <code>dres</code>,{' '}
        <code>dres-gost</code>, <code>golman</code>, <code>hlacice</code>,{' '}
        <code>trenirka</code>, <code>lopta</code>, <code>rukavice</code>,{' '}
        <code>klub</code>.
      </p>
      <Popis
        items={c.shop.products}
        onChange={(v) => set('shop.products', v)}
        naslov={(x) => x.name || 'Novi artikl'}
        novo={() => ({
          id: `artikl-${Date.now()}`,
          cat: '',
          name: '',
          note: '',
          brand: '',
          badge: '',
          price: '',
          oldPrice: '',
          art: 'dres',
          image: '',
          href: c.shop.searchUrl,
        })}
        fields={[
          { key: 'name', label: 'Naziv' },
          { key: 'cat', label: 'Kategorija', placeholder: 'Dresovi' },
          { key: 'brand', label: 'Marka', placeholder: 'Joma' },
          { key: 'note', label: 'Opis', type: 'area' },
          { key: 'price', label: 'Cijena', placeholder: '49,90 €' },
          { key: 'oldPrice', label: 'Stara cijena', placeholder: '59,90 €' },
          { key: 'badge', label: 'Oznaka', placeholder: 'Akcija / Novo' },
          { key: 'href', label: 'Poveznica u trgovini' },
          { key: 'image', label: 'Fotografija', type: 'slika' },
          { key: 'art', label: 'Crtež (ako nema fotografije)' },
          { key: 'id', label: 'Oznaka' },
        ]}
      />

      <h3 className="adm-h3">Dres s imenom</h3>
      <Tekst label="Nadnaslov" value={c.shop.custom.eyebrow} onChange={(v) => set('shop.custom.eyebrow', v)} />
      <Tekst label="Naslov" value={c.shop.custom.title} onChange={(v) => set('shop.custom.title', v)} />
      <Odlomak label="Uvod" value={c.shop.custom.lead} onChange={(v) => set('shop.custom.lead', v)} rows={3} />
      <div className="adm-grid2">
        <Tekst
          label="Zadano prezime"
          value={c.shop.custom.defaultName}
          onChange={(v) => set('shop.custom.defaultName', v)}
        />
        <Tekst
          label="Zadani broj"
          value={c.shop.custom.defaultNumber}
          onChange={(v) => set('shop.custom.defaultNumber', v)}
        />
      </div>
      <Tekst
        label="Poveznica na dres u trgovini"
        value={c.shop.custom.href}
        onChange={(v) => set('shop.custom.href', v)}
      />

      <h3 className="adm-h3">Kategorije</h3>
      <Popis
        items={c.shop.categories}
        onChange={(v) => set('shop.categories', v)}
        naslov={(x) => x.name || 'Kategorija'}
        novo={() => ({ cat: '', name: '', note: '', href: c.shop.url })}
        fields={[
          { key: 'cat', label: 'Nadnaslov' },
          { key: 'name', label: 'Naziv' },
          { key: 'note', label: 'Napomena' },
          { key: 'href', label: 'Poveznica' },
        ]}
      />

      <h3 className="adm-h3">Koraci narudžbe</h3>
      <Popis
        items={c.shop.steps}
        onChange={(v) => set('shop.steps', v)}
        naslov={(x) => `${x.n || ''} ${x.title || ''}`}
        novo={() => ({ n: '', title: '', note: '' })}
        fields={[
          { key: 'n', label: 'Broj', placeholder: '01' },
          { key: 'title', label: 'Naslov' },
          { key: 'note', label: 'Opis', type: 'area' },
        ]}
      />
    </>
  );
}

/* --- Klub ------------------------------------------------------------------ */
export function Klub({ c, set }) {
  return (
    <>
      <h3 className="adm-h3">Brojke</h3>
      <Popis
        items={c.club.facts}
        onChange={(v) => set('club.facts', v)}
        naslov={(x) => x.label || 'Brojka'}
        novo={() => ({ label: '', value: '' })}
        fields={[
          { key: 'label', label: 'Opis' },
          { key: 'value', label: 'Vrijednost' },
        ]}
      />

      <h3 className="adm-h3">Priča o klubu</h3>
      <Odlomci value={c.club.story} onChange={(v) => set('club.story', v)} label="Tekst" rows={10} />

      <h3 className="adm-h3">Uspjesi</h3>
      <Popis
        items={c.club.honours}
        onChange={(v) => set('club.honours', v)}
        naslov={(x) => `${x.when || ''} ${x.title || ''}`}
        novo={() => ({ when: '', title: '', note: '' })}
        fields={[
          { key: 'when', label: 'Sezona' },
          { key: 'title', label: 'Naslov' },
          { key: 'note', label: 'Opis', type: 'area' },
        ]}
      />
    </>
  );
}

/* --- Kontakt i ulaznice ---------------------------------------------------- */
export function Kontakt({ c, set }) {
  return (
    <>
      <h3 className="adm-h3">Kontakt</h3>
      <PopisTeksta
        label="Adresa"
        hint="Jedan redak adrese po retku"
        value={c.contact.address}
        onChange={(v) => set('contact.address', v)}
        rows={4}
      />
      <div className="adm-grid2">
        <Tekst label="E-mail" value={c.contact.email} onChange={(v) => set('contact.email', v)} />
        <Tekst label="Telefon" value={c.contact.phone} onChange={(v) => set('contact.phone', v)} />
      </div>
      <Tekst
        label="Telefon za poveznicu"
        hint="bez razmaka, npr. +38531227503"
        value={c.contact.phoneHref}
        onChange={(v) => set('contact.phoneHref', v)}
      />

      <h3 className="adm-h3">Karta dvorane</h3>
      <p className="adm-note">
        Zemljopisna širina i dužina. Nađeš ih desnim klikom na mjesto u Google
        Maps ili OpenStreetMap — prvi broj je širina.
      </p>
      <div className="adm-grid2">
        <Tekst
          label="Širina (lat)"
          value={String(c.map.lat)}
          onChange={(v) => set('map.lat', Number(v) || 0)}
        />
        <Tekst
          label="Dužina (lon)"
          value={String(c.map.lon)}
          onChange={(v) => set('map.lon', Number(v) || 0)}
        />
      </div>
      <div className="adm-grid2">
        <Broj label="Približavanje (zoom)" value={c.map.zoom} onChange={(v) => set('map.zoom', v)} />
        <Tekst label="Natpis" value={c.map.label} onChange={(v) => set('map.label', v)} />
      </div>
      <Tekst label="Poveznica na upute" value={c.map.link} onChange={(v) => set('map.link', v)} />

      <h3 className="adm-h3">Podaci o dvorani (Ulaznice)</h3>
      <Popis
        items={c.tickets.info}
        onChange={(v) => set('tickets.info', v)}
        naslov={(x) => x.label || 'Podatak'}
        novo={() => ({ label: '', value: '' })}
        fields={[
          { key: 'label', label: 'Naziv' },
          { key: 'value', label: 'Vrijednost' },
        ]}
      />

      <h3 className="adm-h3">Česta pitanja</h3>
      <Popis
        items={c.tickets.faq}
        onChange={(v) => set('tickets.faq', v)}
        naslov={(x) => x.q || 'Pitanje'}
        novo={() => ({ q: '', a: '' })}
        fields={[
          { key: 'q', label: 'Pitanje' },
          { key: 'a', label: 'Odgovor', type: 'area' },
        ]}
      />
    </>
  );
}

/* --- Zaglavlja stranica ----------------------------------------------------- */
export function Stranice({ c, set }) {
  return (
    <>
      <p className="adm-note">Nadnaslov, naslov i uvodna rečenica na vrhu svake podstranice.</p>

      {Object.entries(c.pages).map(([path, page]) => (
        <div className="adm-item" key={path}>
          <div className="adm-item__bar">
            <span className="adm-item__title">{path}</span>
          </div>
          <div className="adm-item__body">
            <Tekst
              label="Nadnaslov"
              value={page.eyebrow}
              onChange={(v) => set(`pages.${path}.eyebrow`, v)}
            />
            <Tekst label="Naslov" value={page.title} onChange={(v) => set(`pages.${path}.title`, v)} />
            <Odlomak
              label="Uvod"
              rows={3}
              value={page.lead}
              onChange={(v) => set(`pages.${path}.lead`, v)}
            />
          </div>
        </div>
      ))}
    </>
  );
}

/* --- Sponzori --------------------------------------------------------------- */
export function Sponzori({ c, set }) {
  return (
    <>
      <p className="adm-note">
        Sponzori su u razinama (glavni, gold, podupiratelji). Pločica bez logotipa
        pokaže ime ispisano — namjerno, da se ne podmeće tuđi logotip kao zamjena.
        <b> Veličina</b> može biti <code>lg</code>, <code>md</code> ili{' '}
        <code>sm</code>.
      </p>

      <h3 className="adm-h3">Brojke uz naslov</h3>
      <Popis
        items={c.sponsors.counts}
        onChange={(v) => set('sponsors.counts', v)}
        naslov={(x) => x.label || 'Brojka'}
        novo={() => ({ value: '', label: '' })}
        fields={[
          { key: 'value', label: 'Vrijednost' },
          { key: 'label', label: 'Opis' },
        ]}
      />

      <h3 className="adm-h3">Razine</h3>
      <Popis
        items={c.sponsors.tiers}
        onChange={(v) => set('sponsors.tiers', v)}
        naslov={(x) => `${x.tag || 'Razina'} (${x.sponsors?.length ?? 0})`}
        novo={() => ({ id: `razina-${Date.now()}`, tag: '', size: 'md', sponsors: [] })}
        fields={[
          { key: 'tag', label: 'Naziv razine', placeholder: 'Gold sponzori' },
          { key: 'size', label: 'Veličina pločica (lg/md/sm)' },
          { key: 'id', label: 'Oznaka' },
        ]}
        render={(tier, change) => (
          <>
            <h4 className="adm-h4">Sponzori u ovoj razini</h4>
            <Popis
              trazi
              items={tier.sponsors}
              onChange={(v) => change({ ...tier, sponsors: v })}
              naslov={(x) => x.name || 'Sponzor'}
              prazno="Razina je prazna — neće se prikazati na stranici."
              novo={() => ({ name: '', logo: '', href: '', note: '' })}
              fields={[
                { key: 'name', label: 'Ime' },
                { key: 'href', label: 'Poveznica', placeholder: 'https://' },
                { key: 'note', label: 'Napomena' },
                { key: 'logo', label: 'Logotip', type: 'slika' },
              ]}
            />
          </>
        )}
      />
    </>
  );
}
