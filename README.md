# MNK Osijek Kandit — službene stranice

React (Vite) stranica + mali backend (funkcije u `api/`). Urednici se prijavljuju
kodom iz SMS-a i objavljuju izmjene jednim klikom — bez programera i bez novog
deploya.

## Pokretanje

```
npm install
cp .env.example .env      # ispuni barem SESSION_SECRET i ADMIN_PHONES
npm run dev               # stranica + api na http://localhost:5173
npm run build
npm run preview
```

Lokalno se SMS ne šalje: kod za prijavu ispiše se u terminalu u kojem radi
`npm run dev`. Cijeli tok prijave i objave može se isprobati bez ijednog
vanjskog računa.

## Stranice

| Ruta | Što je |
| --- | --- |
| `/` | Naslovnica |
| `/klub` | O klubu — brojke, priča, uspjesi, kronologija |
| `/postava` | Igrači po pozicijama i stručni stožer |
| `/raspored` | Tablica, nadolazeće utakmice, rezultati, klubovi lige |
| `/shop` | Fan Shop — artikli, dres s imenom, kategorije |
| `/novosti` | Novosti s filtriranjem po kategoriji |
| `/novosti/{oznaka}` | Pojedinačna objava |
| `/kontakt` | Kontakt podaci i poruka klubu |
| `/ulaznice` | Dolazak na Zrinjevac i česta pitanja |
| `/admin` | Administracija — prijava SMS-om |

---

# Postavljanje na Vercel

Treba tri stvari: **Vercel** (već je tu), **Upstash Redis** (pohrana) i
**davatelja SMS-a**. Prvo dvoje ima besplatan plan; SMS se plaća po poruci.

### 1. Pohrana — Upstash Redis

Vercel → projekt → **Storage** → **Upstash for Redis** → *Create*. Vercel sam
upiše `UPSTASH_REDIS_REST_URL` i `UPSTASH_REDIS_REST_TOKEN`.

Bez pohrane se prijava i objava u produkciji **namjerno ne pokreću**. Nije to
strogoća bez razloga: svaka instanca funkcije ima svoju memoriju, pa bi kod za
prijavu spremljen na jednoj bio nevidljiv drugoj — a ograničenje broja pokušaja
bi se zaobišlo jednostavnim ponavljanjem dok zahtjev ne padne na svježu
instancu.

### 2. Tajna za sesije

```
openssl rand -hex 32
```

Rezultat ide u `SESSION_SECRET` (Vercel → Settings → Environment Variables).
Najmanje 32 znaka; kraće se odbija.

### 3. Urednici

`ADMIN_PHONES` — zarezom odvojeni brojevi, ime iza dvotočke:

```
ADMIN_PHONES=+385911234567:Marko Marić, +385981112223:Ivana Ivić
```

**Ovo je cijeli sustav računa.** Nema registracije: kod se šalje samo na broj
koji je već na popisu. Novi urednik = dopisan broj u ovu varijablu. Maknut broj
gubi pristup odmah, i ako je trenutno prijavljen.

Brojevi se mogu upisati i kao `0911234567` — pretvaraju se u `+385…`.

### 4. SMS

Podržani su Twilio i Infobip. Infobip je hrvatski, pa je prema HR brojevima
obično povoljniji; Twilio se brže postavlja.

**Twilio** (Console → Phone Numbers → kupi broj):

```
TWILIO_ACCOUNT_SID=ACxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxx
TWILIO_FROM=+385xxxxxxxx
```

**Infobip** (Portal → API keys; `BASE_URL` je na početnoj portala):

```
INFOBIP_API_KEY=xxxxxxxx
INFOBIP_BASE_URL=https://xxxxx.api.infobip.com
INFOBIP_FROM=MNKOsijek
```

Dovoljno je postaviti jednoga — davatelj se prepozna sam. Ako nije postavljen
nijedan, kod se ispisuje u zapis (Vercel → Logs), što je u redu za probu, a
neupotrebljivo za pravi rad.

> **Trošak:** svaka prijava je jedan SMS. Uz nekoliko urednika to je nekoliko
> poruka mjesečno. Sesija traje 12 sati, pa se ne šalje kod za svaku izmjenu.

### 5. Deploy

Push na `main`. Nakon deploya otvori `/admin`, upiši svoj broj i prijavi se.

### 6. Karta stranice (neobavezno)

`sitemap.xml` se zapisuje pri buildu, ali traži punu domenu. Na Vercelu se ona
zna sama (`VERCEL_PROJECT_PRODUCTION_URL`); drugdje postavi `SITE_URL`:

```
SITE_URL=https://mnk-osijek-kandit.hr npm run build
```

Bez ijednog od toga se karta **namjerno ne zapisuje** — kriva domena u
sitemapu je gora nego nikakva, jer tražilica po njoj traži stranice kojih
nema.

---

# Kako se uređuje

Administracija ima dva gumba i tu je cijela razlika:

- **Spremi skicu** — ostaje u tvom pregledniku. Posjetitelji ne vide ništa.
  Dok skica postoji, na stranici stoji žuta traka da ne pomiješaš svoj pregled
  s onim što je javno.
- **Objavi izmjene** — šalje sadržaj na poslužitelj. Od tog trena svi vide novo,
  bez deploya.

Uz to: **Izvezi/Uvezi JSON** (sigurnosna kopija ili prijenos na drugo računalo),
**Odbaci skicu** (natrag na objavljeno) i **Osvježi** (povuci zadnju objavu ako
je netko drugi nešto mijenjao).

Uređuje se: slike, novosti, igrači i stožer, tablica, utakmice, Fan Shop,
podaci o klubu, **sponzori**, kontakt, karta dvorane, česta pitanja i zaglavlja
svih stranica.

Popisi su sklopljeni dok ih ne otvoriš, imaju tražilicu (od pet stavki
naviše), pomicanje gore/dolje, umnožavanje i brisanje uz potvrdu.

## Kartica igrača

Klik na igrača — na naslovnici ili na stranici Postava — otvara karticu preko
cijelog ekrana: portret, broj, pozicija, datum rođenja, odakle je, visina,
noga, u klubu od, i statistika po sezonama i natjecanjima (utakmice, golovi,
golovi iz penala, autogolovi).

Sve se upisuje u administraciji, pod **Momčad**. Polje koje ostaviš prazno se
u kartici ne prikazuje — prazan redak „Visina —“ ne govori ništa, a izgleda
kao greška. Ako igrač nema upisanu statistiku, kartica to i kaže umjesto da
pokaže same nule.

## Sponzori

Tri razine: glavni sponzori, gold sponzori i podupiratelji. Razina bez
sponzora se ne prikazuje. Pločica bez logotipa pokaže ime sponzora ispisano —
namjerno, jer je prije toga svaka traka ponavljala isti tuđi logotip kao
zamjenu, pa je izgledalo kao da klub ima osamnaest istih sponzora.

## Karta dvorane

OpenStreetMap, ne Google Maps: ugrađuje se bez ključa i bez kolačića za
praćenje, pa stranica zbog karte ne treba privolu za kolačiće. Okvir se
učitava tek na klik — inače bi svaka stranica s podnožjem povlačila nekoliko
stotina kilobajta karte koju većina posjetitelja nikad ne otvori.

Koordinate se mijenjaju u administraciji, pod **Kontakt i ulaznice**.

## Dijeljenje i tražilice

Svaka ruta postavlja svoj `<title>`, opis, `canonical` i Open Graph oznake, pa
poveznica podijeljena na Facebooku ili u WhatsApp grupi stiže sa slikom,
naslovom i opisom umjesto kao goli link. Pojedinačna novost pritom nosi svoj
naslov i svoju fotografiju.

Facebookov i WhatsAppov pregledavatelj ne izvršavaju JavaScript, pa im vrijedi
ono što stoji u `index.html`; `components/Meta.jsx` te oznake zatim precizira
po rutama za Google i za karticu preglednika.

## Kad nešto pukne

Ako pokvaren sadržaj sruši prikaz (npr. uvezena datoteka krivog oblika),
umjesto bijele stranice se pojavi stranica s dva gumba: „Očisti i učitaj
ponovno“ (briše samo lokalnu skicu i predmemoriju, objavljeno ostaje) i
poveznica na administraciju. Bez toga bi i administracija bila bijela, pa se
neispravan sadržaj ne bi imao gdje popraviti.

## Slike

Slike idu u `public/uploads/` i upisuju se kao putanja (`/uploads/ime.webp`).
Odabir datoteke s računala u administraciji smanjuje sliku na 1400px i sprema je
**u sadržaj**, pa je koristi za probu — za trajno je bolja putanja, jer objava
ima ograničenje veličine (~900 kB na cijeli sadržaj).

---

# Sigurnost

Što je napravljeno i zašto:

| Mjera | Zašto |
| --- | --- |
| Kod se šalje samo brojevima s popisa | Nema registracije, nema računa koji se može oteti |
| Odgovor je isti za broj s popisa i izvan njega (uključujući lažni `challengeId`) | Inače bi se kroz prijavu dalo pročitati tko je urednik |
| Kod: 6 znamenki, 5 minuta, 5 pokušaja, jednokratan | Milijun mogućnosti bez ograničenja se pogodi |
| U pohrani stoji samo SHA-256 sažetak koda, vezan uz izazov | Tko dođe do baze, ne dobiva kod |
| Ograničenja: 3 koda / 15 min po broju, 10 / sat po IP-u, 20 upisa / sat po IP-u | Protiv grube sile i protiv troška SMS-a |
| Sesija: potpisani žeton u `HttpOnly`, `Secure`, `SameSite=Lax` kolačiću | JavaScript ga ne može pročitati, ne šalje se s tuđih stranica |
| Sesija se pamti i na poslužitelju | Odjava stvarno gasi pristup; žeton koji sam sebi vjeruje ne bi se dao opozvati |
| Provjera podrijetla + vlastito zaglavlje na svakoj izmjeni | CSRF |
| Provjera sadržaja prije spremanja: veličina, dubina, duljina teksta, `javascript:` adrese, `__proto__` | Ono što urednik pošalje ne smije postati oružje |
| Dnevnik objava (tko, kad, koliko) | Vidi se tko je što mijenjao |
| Usporedba tajni u konstantnom vremenu | Mjerenje vremena odaje pogođene znakove |

**Što ovo nije:** SMS kao drugi faktor nije neprobojan — postoji zamjena SIM-a
(*SIM swap*). Za klupsku stranicu je razuman kompromis; ako jednom zatreba jače,
sljedeći korak su prolazni ključevi (passkeys) uz isti popis urednika.

---

# Fan Shop

Klub nema vlastitu naplatu. Svaka kartica artikla vodi na stranicu na kojoj se
artikl stvarno kupuje u trgovini **SalaSport** (`salasport.hr`).

Dvije stvari se drže namjerno:

- **Cijena je prazna dok je netko ne upiše.** Cijene stoje kod trgovine i
  mijenjaju se; prepisana cijena koja zastari — laže. Dok je prazna, kartica
  nudi „Provjeri cijenu”.
- **Poveznica vodi samo na adresu koja postoji.** Artikl bez vlastite stranice
  u trgovini vodi na svoju kategoriju ili na pretragu „kandit”, nikad na
  izmišljeni URL koji završi na 404.

Ako artikl nema fotografiju, kartica ga nacrta sama (`ProductArt.jsx`).

---

# Kako je složeno

```
api/                 funkcije (na Vercelu svaka datoteka = jedna funkcija)
  _lib/              zajedničko: pohrana, kripto, sesije, SMS, provjere
  auth/              prijava: request-code, verify-code, session
  content.js         GET javno · PUT objava (traži prijavu)
dev-server/          Vite dodatak koji iste funkcije poslužuje lokalno
src/content/         tri sloja sadržaja: zadano → objavljeno → skica
src/admin/           polja obrazaca i kartice administracije
src/data/site.js     zadani sadržaj (ono što se vidi prije prve objave)
```

Sadržaj je jedan JSON objekt kroz cijeli sustav — isti oblik koji
administracija uređuje, koji poslužitelj sprema i koji stranica čita. Zbog toga
novo polje ne traži migraciju baze, ali traži provjeru pri spremanju (vidi
`api/_lib/content.js`).

Stranica radi i kad backenda nema: tada prikazuje sadržaj iz `src/data/site.js`.
