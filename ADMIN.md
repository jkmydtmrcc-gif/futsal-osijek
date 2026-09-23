# Admin panel — spajanje Supabasea

Stranica radi i **bez** Supabasea: tada prikazuje ugrađeni sadržaj iz
`src/data/site.js`. Spajanje ne može ništa srušiti — samo preuzima sadržaj
iz baze kad ga ima.

## 1. Napravi projekt (2 min)

[supabase.com](https://supabase.com) → **New project**.
Regija: **Frankfurt (eu-central-1)** — najbliža.
Zapiši lozinku baze koju ti ponudi.

## 2. Napravi tablice (1 min)

Supabase → **SQL Editor** → **New query** → zalijepi cijeli sadržaj
`supabase/schema.sql` iz ovog repozitorija → **Run**.

Time nastaju tablice (`igraci`, `igraci_statistika`, `novosti`, `utakmice`,
`tablica`, `shop`, `sponzori`, `postavke`), postavljaju se pravila pristupa i
upisuje sadržaj koji je sad na stranici.

**Ako si shemu već pokretao ranije:** pokreni je ponovno. Datoteka je pisana
tako da se smije pokrenuti više puta — dodaje što nedostaje, a postojeće
podatke ne dira.

## 3. Napravi korisnika (1 min)

Supabase → **Authentication** → **Users** → **Add user** → *Create new user*.
Upiši e-mail i lozinku i **uključi "Auto Confirm User"**, inače se ta osoba
ne može prijaviti dok ne potvrdi mail.

Ponovi za svakog tko smije uređivati.

## 4. Poveži stranicu (2 min)

Supabase → **Project Settings** → **API**. Trebaju ti dvije vrijednosti:

- **Project URL**
- **anon public** ključ

### Lokalno
Napravi datoteku `.env` u korijenu projekta (`.env.example` ti je predložak):

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

### Na Vercelu
**Settings → Environment Variables** → dodaj obje, za sva tri okruženja
(Production, Preview, Development) → **Redeploy**.

> Varijable moraju počinjati s `VITE_`, inače ih Vite ne ugradi.

## 5. Provjeri

Otvori `/admin`, prijavi se, promijeni nešto i pogledaj stranicu.

---

## Što se može uređivati

| Kartica  | Utječe na |
|----------|-----------|
| Igrači   | Traka na naslovnici i stranica Prva postava |
| Novosti  | Naslovnica i stranica Novosti. Označena vijest ide u veliki okvir — označi samo jednu |
| Utakmice | Nadolazeće utakmice na naslovnici i u Rasporedu |
| Tablica  | Tablica lige. Redak s klubom "Osijek Kandit" se sam ističe |
| Fan Shop | Artikli na naslovnici (prva četiri) i na stranici Fan Shop |

Ostalo (kontakti, tekstovi stranica, partneri, trake) i dalje stoji u
`src/data/site.js` — to se mijenja jednom i nema smisla za bazu.

## Slike artikala u Fan Shopu

Ovdje slike **ideš stvarno ubaciti iz admina** — odabereš datoteku i ona
ode u Supabase Storage. Alternativa je zalijepiti adresu slike s tuđe
stranice (npr. sa SalaSporta); oboje završi kao obična adresa.

Svaki artikl ima poveznicu — klik na kvadratić otvara tu adresu u novoj
kartici. Obično je to stranica proizvoda u SalaSportu.

Cijena je slobodan tekst, ne broj: klub ne vodi cjenik nego prepisuje ono
što piše u trgovini. Zato može stajati i "Cijena u trgovini".

## Fotografije igrača

Polje **Fotografija** je putanja do datoteke, npr.
`/uploads/igraci/ime-prezime.webp`. Datoteka mora biti u
`public/uploads/igraci/` u repozitoriju.

Znači: novog igrača u adminu dodaješ odmah, ali njegova slika ide kroz git.
Upload slika iz samog admina traži Supabase Storage — to je sljedeći korak
ako zatreba.

## Sigurnost

`anon` ključ je javan i to je u redu — smije samo čitati.
Pravila u bazi (RLS) daju pravo pisanja isključivo prijavljenim korisnicima,
pa nitko bez računa ne može ništa promijeniti.

**Nikad ne stavljaj `service_role` ključ u ovaj projekt** — on zaobilazi
sva pravila i završio bi u kodu koji se šalje pregledniku.


---

## Što se sve uređuje

| Kartica | Sadržaj |
| --- | --- |
| **Igrači** | Ime, broj, pozicija, fotografija te profil koji se vidi u kartici: datum rođenja, odakle je, visina, noga, u klubu od. Unutar svakog igrača je i **statistika po sezonama** (utakmice, golovi, golovi iz penala, autogolovi) — otvara se klikom, po natjecanju i sezoni. |
| **Novosti** | Naslov, datum, kategorija, uvod, **tekst objave**, fotografija i **adresa objave** (`/novosti/oznaka`). Označena vijest ide u veliki okvir. |
| **Utakmice** | Nadolazeći termini. |
| **Tablica** | Pozicija, klub, odigrano, bodovi i **grb kluba**. |
| **Fan Shop** | Naziv, kategorija, marka, opis, cijena i stara cijena, poveznica, oznaka, slika i crtež koji se koristi kad slike nema. |
| **Sponzori** | Razine (glavni / gold / podupiratelji), ime, logotip, poveznica. |
| **Tekstovi i kontakt** | Slogan, kontakt podaci, koordinate karte, postavke Fan Shopa i tablice te naslovi svih podstranica. |

### Grbovi klubova

Klub bez upisanog grba pokaže **inicijale** u pločici (OL, FD, RI…). Grbovi
drugih klubova nisu klupsko vlasništvo, pa se namjerno ne preuzimaju s
interneta — dodaj one koje ti klub ili liga daju, preko polja „Grb kluba”.

### Prazno polje ne znači prazna stranica

Sve iz kartice **Tekstovi i kontakt** spaja se preko onoga u
`src/data/site.js`. Polje koje nitko nije dirao zadrži tekst iz koda, pa
prazan unos ne ostavi rupu na stranici.

Isto vrijedi za cijele tablice: ako je tablica u bazi prazna (ili je nema jer
shema nije nadograđena), taj se dio stranice prikaže iz koda umjesto da
nestane.
