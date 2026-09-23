# MNK Osijek Kandit — službene stranice

React (Vite) + Supabase. Sadržaj se uređuje na `/admin`, bez programera i bez
novog deploya.

## Pokretanje

```
npm install
cp .env.example .env      # Supabase ključevi (neobavezno)
npm run dev
npm run build
npm test                  # provjera pretvorbe baza ⇄ sučelje
```

Stranica radi i **bez** Supabasea — tada prikazuje ugrađeni sadržaj iz
`src/data/site.js`. Spajanje baze ne može ništa srušiti; samo preuzima ono
čega u bazi ima.

Postavljanje baze i popis svega što se uređuje: **[ADMIN.md](ADMIN.md)**.

## Stranice

| Ruta | Što je |
| --- | --- |
| `/` | Naslovnica |
| `/klub` | O klubu — brojke, priča, uspjesi, kronologija |
| `/postava` | Igrači po pozicijama i stručni stožer |
| `/raspored` | Tablica s grbovima, utakmice, rezultati, klubovi lige |
| `/shop` | Fan Shop — artikli, dres s imenom, kategorije |
| `/novosti` | Novosti s filtriranjem po kategoriji |
| `/novosti/{oznaka}` | Pojedinačna objava |
| `/kontakt` | Kontakt, poruka klubu i karta |
| `/ulaznice` | Dolazak na Zrinjevac i česta pitanja |
| `/admin` | Administracija (Supabase prijava) |

## Kartica igrača

Klik na igrača — na naslovnici ili na stranici Postava — otvara karticu preko
cijelog ekrana: portret, broj, pozicija, datum rođenja, odakle je, visina,
noga, u klubu od, te statistika po sezonama i natjecanjima.

Polje koje ostane prazno se ne prikazuje: prazan redak „Visina —” ne govori
ništa, a izgleda kao greška. Igrač bez upisane statistike to i kaže, umjesto
da pokaže same nule.

Kartica se renderira u `document.body`. Omotač rute ima animaciju ulaska preko
`translate`, a element s `translate` postaje okvir za `position: fixed`
potomke — bez portala bi kartica pala na dno stranice umjesto da stoji na
sredini ekrana.

## Fan Shop

Klub nema vlastitu naplatu. Svaka kartica artikla vodi na stranicu na kojoj se
artikl stvarno kupuje u trgovini **SalaSport**.

- **Cijena je prazna dok je netko ne upiše.** Cijene stoje kod trgovine i
  mijenjaju se; prepisana cijena koja zastari — laže. Dok je prazna, kartica
  nudi „Provjeri cijenu”.
- **Poveznica vodi samo na adresu koja postoji.** Artikl bez vlastite stranice
  u trgovini vodi na kategoriju ili na pretragu „kandit”, nikad na izmišljeni
  URL koji završi na 404.

Bez fotografije kartica nacrta artikl sama (`ProductArt.jsx`).

## Sponzori

Tri razine: glavni, gold, podupiratelji. Razina bez sponzora se ne prikazuje.
Pločica bez logotipa pokaže ime ispisano — namjerno, jer je prije svaka traka
ponavljala isti tuđi logotip kao zamjenu, pa je izgledalo kao da klub ima
osamnaest istih sponzora.

## Karta dvorane

OpenStreetMap, ne Google Maps: ugrađuje se bez ključa i bez kolačića za
praćenje. Karta se učitava odmah, pa OpenStreetMap vidi IP posjetitelja —
stranica `/kolacici` to i piše, umjesto da prešuti.

## Dijeljenje i tražilice

Svaka ruta postavlja svoj `<title>`, opis, `canonical` i Open Graph oznake, pa
poveznica podijeljena na Facebooku ili u WhatsApp grupi stiže sa slikom,
naslovom i opisom umjesto kao goli link. Pojedinačna novost nosi svoj naslov i
svoju fotografiju.

Facebookov i WhatsAppov pregledavatelj ne izvršavaju JavaScript, pa im vrijedi
ono u `index.html`; `components/Meta.jsx` te oznake precizira po rutama za
Google i za karticu preglednika.

`sitemap.xml` se zapisuje pri buildu iz `SITE_URL` ili s Vercelove domene. Bez
ijednog od toga se namjerno ne zapisuje — kriva domena u sitemapu je gora nego
nikakva.

## Klupski asistent

Gumb „Pitaj klub” dolje desno otvara asistenta koji odgovara na pitanja o
rasporedu, tablici, dvorani, ulaznicama, postavi, Fan Shopu i kontaktu.

**Nije jezični model.** Odgovore slaže iz podataka koji su već na stranici, pa
ne košta ništa, radi bez interneta i ne može izmisliti termin utakmice. Kad ne
prepozna pitanje, to i kaže i uputi na klub — nagađanje bi ovdje bilo gore od
priznanja, jer bi posjetitelj krivi podatak shvatio ozbiljno.

Teme su u `src/components/Asistent.jsx`; nova se doda kao još jedan unos s
ključnim riječima i odgovorom.

## Kolačići

Stranica ne postavlja kolačiće za praćenje i nema analitiku, pa traka nije
privola s „prihvati / odbij” — takva traka pita za nešto čega nema. Umjesto
toga stoji obavijest što se stvarno sprema, uz stranicu `/kolacici` s
popisom.

Ako se ikad doda analitika ili ugradnja koja postavlja kolačiće bez pitanja,
ovo treba pretvoriti u pravu privolu, s odbijanjem koje stvarno radi.

## Slike

Slike idu u `public/uploads/` i upisuju se kao putanja (`/uploads/ime.webp`),
ili se kroz administraciju pošalju u Supabase Storage.

## Kako je složeno

```
src/lib/supabase.js     klijent (null ako projekt nije spojen)
src/lib/mapiranje.js    čiste pretvorbe baza ⇄ sučelje + ugrađeni sadržaj
src/lib/content.jsx     ContentProvider: ugrađeno → preko toga baza
src/admin/              administracija (Urednik po tablici, Postavke, Statistika)
src/data/site.js        ugrađeni sadržaj — ono što se vidi prije baze
supabase/schema.sql     shema, pravila pristupa i početni sadržaj
test/                   provjera pretvorbe (npm test)
```

Popisi koji se mijenjaju kroz sezonu imaju svoju tablicu. Ono čega ima po
jedan komad (kontakt, karta, naslovi stranica) stoji u `postavke` kao
ključ → JSON: inače bi svaka nova rubrika tražila novu tablicu i novu
migraciju.
