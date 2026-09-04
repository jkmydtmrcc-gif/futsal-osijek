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

Time nastaju četiri tablice (igraci, novosti, utakmice, tablica),
postavljaju se pravila pristupa i upisuje sadržaj koji je sad na stranici.

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

Ostalo (kontakti, tekstovi stranica, partneri, trake) i dalje stoji u
`src/data/site.js` — to se mijenja jednom i nema smisla za bazu.

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
