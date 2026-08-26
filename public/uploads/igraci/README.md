# Portreti igrača

Izrezane slike (bez pozadine), **WebP** s prozirnošću, širine 900px.

Naziv datoteke mora točno odgovarati onome što piše u
`src/data/site.js` → `PLAYERS` → `photo`:

| Igrač             | Br. | Datoteka                  |
|-------------------|-----|---------------------------|
| Franko Jamičić    | 1   | `franko-jamicic.webp`      |
| Andrej Pandurević | 8   | `andrej-pandurevic.webp`   |
| Filip Petrušić    | 19  | `filip-petrusic.webp`      |
| Josip Šalaj       | 7   | `josip-salaj.webp`         |
| Nejc Hozjan       | 77  | `nejc-hozjan.webp`         |
| Matias Mijić      | 4   | `matias-mijic.webp`        |
| Antonio Sekulić   | 23  | `antonio-sekulic.webp`     |

## Bez kvačica u nazivu datoteke

Ovo nije kozmetika. macOS sprema "Ć" u nazivu datoteke rastavljeno
(C + kvačica kao zaseban znak), a u kodu se piše sastavljeno kao
jedan znak. Izgleda isto, ali su različiti bajtovi — preglednik
traži jedno, na disku je drugo, i slika se ne učita.

Zato: samo mala slova, bez kvačica, bez razmaka.

## Veličina

Originali su bili 4000x6000px i 13-20 MB po slici — oko 104 MB za
sedam igrača. Kartica ih prikazuje na ~250px, pa je to bilo 64 puta
više piksela nego što treba, i stranica bi na mobilnim podacima bila
neupotrebljiva.

Sada su 900px WebP, ukupno oko 550 KB. Originali stoje u
`_originali-slike/igraci/` u korijenu projekta (ne ide na git).

Za novu sliku: ubaci original i pretvori ga istim postupkom —
900px široko, WebP, kvaliteta 88.

Preporuka za snimanje: uspravna slika, igrač po sredini. Kartica sama
poravnava igrača na dno i podmeće tamni preljev ispod imena.

Datoteka koja ne postoji ne ruši ništa — kartica prikaže prezime
u pozadini dok slika ne stigne.
