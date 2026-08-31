# MNK Osijek Kandit — službene stranice

React (Vite) statična stranica. Nema poslužitelja ni baze — sve se poslužuje
kao datoteke.

## Pokretanje

```
npm install
npm run dev      # razvojni poslužitelj na http://localhost:5173
npm run build    # produkcijski build u dist/
npm run preview  # pregled builda
```

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
| `/admin` | Administracija sadržaja |

## Fan Shop

Klub nema vlastitu naplatu. Svaka kartica artikla vodi na stranicu na kojoj se
artikl stvarno kupuje u trgovini **SalaSport** (`salasport.hr`).

Dvije stvari koje se drže namjerno:

- **Cijena je prazna dok je netko ne upiše.** Cijene stoje kod trgovine i
  mijenjaju se; prepisana cijena koja zastari — laže. Dok je prazna, kartica
  nudi „Provjeri cijenu”.
- **Poveznica vodi samo na adresu koja postoji.** Artikl bez vlastite stranice
  u trgovini vodi na svoju kategoriju ili na pretragu „kandit”, nikad na
  izmišljeni URL koji završi na 404.

Ako artikl nema fotografiju, kartica ga nacrta sama (`ProductArt.jsx`) — u
klupskim bojama, po vrsti artikla.

## Administracija (`/admin`)

Uređuju se slike, novosti, igrači i stožer, tablica, utakmice, Fan Shop,
podaci o klubu, kontakt, česta pitanja i zaglavlja svih stranica.

Lozinka je u `src/pages/Admin.jsx` (`LOZINKA`).

**Dvije važne granice:**

1. **Lozinka nije zaštita.** Stranica je statična, pa sve što je u njoj završi
   u JavaScriptu koji svatko može pročitati — uključujući lozinku. Ona
   sprječava slučajan ulazak, ništa više. Prava zaštita traži poslužitelj i
   prijavu.
2. **Izmjene žive u pregledniku.** Spremaju se u `localStorage` uređaja na
   kojem su napravljene; posjetitelji vide sadržaj iz koda. Da izmjene postanu
   javne: **Izvezi JSON** → datoteka se preda onome tko održava stranicu, a
   sadržaj se prenese u `src/data/site.js`. Na drugom uređaju se ista datoteka
   može učitati preko **Uvezi JSON**.

Za trajnu objavu bez ovog koraka trebao bi pravi CMS ili poslužiteljska
funkcija s korisničkim računima.

## Slike

Slike idu u `public/uploads/` i upisuju se kao putanja (`/uploads/ime.webp`) —
takva slika ide s repozitorijem i vidi je svaki posjetitelj. Odabir datoteke s
računala u administraciji sprema sliku samo u taj preglednik (smanjenu na
1400px) i služi za brzu probu.

## Sadržaj u kodu

Zadani sadržaj je u `src/data/site.js`; `src/content/` ga spaja sa spremljenim
izmjenama i nudi kroz `useContent()`.
