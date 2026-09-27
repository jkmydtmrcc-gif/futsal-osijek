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

## Vrh naslovnice

Pločica uz naslov pokazuje **sljedeću utakmicu** iz rasporeda, a ne klupske
brojke: iste četiri brojke stajale su i u traci odmah ispod heroja, pa su se
čitale dvaput jedna ispod druge. Kad rasporeda nema, pločica se vraća na
brojke — vrh stranice nikad ne ostaje prazan.

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

Bez fotografije kartica pokaže grb na tamnoj klupskoj plohi
(`ProductPlaceholder.jsx`) — četiri svijetle pločice s istim sivim grbom u nizu
izgledale su kao da se slika nije učitala. Grb je malo pomaknut po mjestu u
nizu, da četiri pločice jedna uz drugu ne budu ista slika četiri puta.
Prije je na tom mjestu stajao nacrtani dres — izgledao je kao sličica iz zbirke
ikona. Crtež je ostao samo tamo gdje nešto radi: u personalizaciji na `/shop`
ispisuje upisano prezime i broj na dres (`ProductArt.jsx`).

## Sponzori

Tri razine: glavni, gold, podupiratelji. Razina bez sponzora se ne prikazuje, a
ugrađeni sadržaj više ne nosi rezervirana mjesta: „Sponzor 1 … Sponzor 8“ su
klizili preko ekrana i odavali da klub nema sponzore. Umjesto njih na dnu
odsječka stoji poziv partnerima, koji je istinit i kad razina ima jednog
sponzora.

Pločica bez logotipa pokaže ime ispisano — namjerno, jer je prije svaka traka
ponavljala isti tuđi logotip kao zamjenu, pa je izgledalo kao da klub ima
osamnaest istih sponzora. Traka klizi tek kad razina ima više od četiri
sponzora; s dva bi se isti logotip vrtio u krug.

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

Odgovara iz podataka koji su već na stranici — raspored, tablica, postava,
kontakt, Fan Shop. Nije jezični model: ne zove nikakvu vanjsku uslugu, ne košta
ništa i ne može reći nešto čega u klupskim podacima nema. Kad ne prepozna
pitanje, to i kaže i ponudi teme koje zna.

Prepoznavanje teme živi u `src/lib/asistent.js`, odvojeno od komponente, pa ga
`npm test` može gađati izravno. Povod: na „gdje kupiti dres" asistent je
odgovarao o dvorani. Brojanje pogodaka je obje teme izjednačilo — „gdje" za
dvoranu, „dres" za Fan Shop — pa je pobijedila ona koja je prva u popisu.

Sada duži izraz nosi više bodova (specifičniji je), upitne riječi skoro ništa,
a dvosmisleni izrazi stoje cijeli: ne „kupit" nego „kupit ulaznic" i
„kupit dres". Ključne riječi su u istoj datoteci kao i bodovanje — da test ne
provjerava izmišljeni popis dok stranica radi po svojem.

Znak (`AsistentIkona.jsx`) je klupski štit koji je ujedno oblačić za razgovor:
obris prati siluetu grba, tri točke unutra kažu što gumb radi. Prije toga je
bila futsal lopta — na 36 piksela su joj se šavovi stopili u pet krakova, pa
je izgledala kao volan.

## Kolačići

Stranica ne postavlja kolačiće za praćenje i nema analitiku, pa traka nije
privola s „prihvati / odbij” — takva traka pita za nešto čega nema. Umjesto
toga stoji obavijest što se stvarno sprema, uz stranicu `/kolacici` s
popisom.

Ako se ikad doda analitika ili ugradnja koja postavlja kolačiće bez pitanja,
ovo treba pretvoriti u pravu privolu, s odbijanjem koje stvarno radi.

## Pisma

Saira i Saira Condensed poslužuju se iz `public/fonts/`, a ne s
`fonts.gstatic.com`. Google inače vidi IP adresu svakog posjetitelja, što je
bila jedina vanjska usluga bez potrebe — stranica nema ni analitiku ni oglase.
Uzeti su samo podskupovi `latin` i `latin-ext`; `latin-ext` nosi č, ć, š, ž i đ.
Popis je u `src/fonts.css`.

## Zaglavlja stranica

Vrh podstranice nosi putanju (Početna — Klub), naslov i traku s brojkama pod
vlastitom crtom. Naslov je dotad bio i krivo poravnat: `.phero--art` je
stupčani flex, a u njemu `margin: 0 auto` na omotaču gasi razvlačenje, pa se
`.shell` stiskao na širinu svog sadržaja i stajao centriran negdje u sredini —
naslov stranice nije bio u istoj okomici ni s grbom u zaglavlju ni sa
sadržajem ispod.

## Izgled

`styles.css` opisuje raspored, `staklo.css` površinu (svjetlo iza ploha, staklo
na plutajućim slojevima, rub i sjena na karticama). Podjela znači da se izgled
može mijenjati bez straha da će se nešto pomaknuti.

Tamne plohe nose tanko zrno (jedna pločica 160×160 koja se ponavlja, 5,5%
prozirnosti). Ne vidi se kao tekstura, ali razbija stepenice u prijelazima i
plohi daje dubinu — izmjereno 44% više visokofrekventnog detalja. Brojke u
tablici i u statistikama koriste `tabular-nums`, pa „11" i „16" stoje točno
jedno ispod drugoga.

Iz ranije verzije su izbačeni ukrasi koji su stranicu činili neozbiljnom:
potezi kistom (SVG turbulencija), dijagonalne crte preko ploha, nasumični nagib
kartica igrača i odsječeni kut na svakoj kartici. Ostao je jedan veliki
dijagonalni rez ispod naslovnice — na toj veličini djeluje namjerno.

## Slike

Slike idu u `public/uploads/` i upisuju se kao putanja (`/uploads/ime.webp`),
ili se kroz administraciju pošalju u Supabase Storage.

Sve što ide kroz administraciju prvo prođe kroz canvas u pregledniku
(`src/lib/slika.js`): smanji se na najviše 1200px (portreti na 900px) i
pretvori u WebP. Originali portreta su znali biti 4000×6000 i 15 MB, a kartica
ih prikazuje na ~250px — bez toga bi svaka nova slika pojela besplatnu kvotu.

### Rezanje pozadine na portretima

Portret igrača se automatski reže (`src/lib/pozadina.js`): rast regije od
rubova slike prema sredini. Susjedni piksel ulazi u pozadinu ako je blizu
piksela s kojeg se širi (tako se prati i prijelaz u zamućenom studijskom
platnu) i ako nije previše odlutao od prosječne boje ruba (tako ne procuri
kroz igračev dres u sredinu). Rub se zatim omekša, pa oko igrača ne ostane
nit u boji platna.

Ne radi čuda i ne pravi se da radi: bijeli dres pred bijelim zidom nema
granicu koju bi se moglo naći. Zato uređivač **uvijek** prvo vidi original i
rez jedan uz drugi, na kariranoj podlozi, uz postotak uklonjenog i klizač
osjetljivosti — i gumb „Pošalji original". Automatika predlaže, ne odlučuje.

Sve se odvija na uređivačevom računalu: fotografija ne ide nikakvoj vanjskoj
usluzi za obradu, pa ništa ne košta i ne putuje nikamo osim u klupski Storage.
Provjereno u `test/pozadina.test.mjs` na izmišljenim slikama — greška je uvijek
ista, ili se rez ne uhvati ili procuri kroz lik, a oboje se na stranici vidi
tek kad je kasno.

## Brzina i objava

Posjetitelj **ne skida Supabase SDK**. Javni dio čita bazu običnim GET-om na
PostgREST (`src/lib/citac.js`, isti oblik odgovora `{ data, error }`); SDK
nosi prijavu, spremište i realtime preko websocketa, od čega posjetitelju ne
treba ništa. Administracija se učitava tek kad je netko otvori
(`lazy` + `Suspense`) i sa sobom vuče SDK i vlastiti CSS.

Mjereno na produkcijskom buildu: **574 KB → 328 KB** JavaScripta
(166 → 100 KB gzip). Slike: grb 223 → 21 KB (WebP umjesto PNG-a), ikona
512px 217 → 56 KB, portreti 627 → 355 KB, grafike 672 → 366 KB.

`vercel.json` drži zaglavlja: `immutable` na `/assets` i `/fonts` (ime nosi
otisak, sadržaj se ne mijenja), dan uz `stale-while-revalidate` na
`/uploads` (slike se mogu zamijeniti pod istim imenom preko administracije),
i `must-revalidate` na `index.html`.

Pri buildu se u `index.html` upisuje puna adresa u `og:image`, `og:url` i
`canonical`. S relativnom putanjom Facebook i WhatsApp pokažu poveznicu bez
slike — domena se zna tek pri objavi, pa se uzima iz `SITE_URL` ili
`VERCEL_PROJECT_PRODUCTION_URL`.

Izmjereno na produkcijskom buildu, s istim zaglavljima kakva piše
`vercel.json`: CLS 0,0001 na mobilnom i 0,023 na stolnom (prag je 0,1).

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
