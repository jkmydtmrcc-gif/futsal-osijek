/**
 * Prijenos utakmice uživo.
 *
 * Jedno pravilo nosi cijelu datoteku: **rezultat se računa iz golova**, ne
 * upisuje. Semafor i tijek utakmice su dva prikaza istog niza događaja, pa
 * ne mogu reći različite stvari. Upisani rezultat bi prije ili kasnije
 * proturječio popisu ispod sebe, i to javno, usred utakmice.
 *
 * Minutu upisuje operater za stolom, ne teče sat. Futsal ima zaustavljano
 * vrijeme: sat koji sam teče traži pauzu na svaki prekid, a čim je operater
 * jednom zaboravi, stranica pokazuje krivu minutu dok netko ne primijeti.
 *
 * Bez ijednog uvoza iz Reacta, pa `npm test` može gađati izravno.
 */

/** Vrste događaja koje nose gol. Autogol ide **drugoj** momčadi. */
const GOLOVI = new Set(['gol', 'deseterac', 'autogol']);

/**
 * Je li minuta upisana?
 *
 * `Number(null)` je `0`, a `0` je konačan broj — pa bi komentar bez minute
 * prošao kao „nulta minuta" i obrisao zadnju poznatu minutu sa semafora.
 * Isti previd je ranije pretvarao neodigranu utakmicu u rezultat 0:0.
 */
const imaMinutu = (v) => v !== null && v !== undefined && v !== '' && Number.isFinite(Number(v));

/** Redoslijed upisa; `sort_order` je glavni, vrijeme upisa je pričuva. */
const poRedu = (a, b) => {
  const r = (a.sort_order ?? 0) - (b.sort_order ?? 0);
  if (r !== 0) return r;
  return Date.parse(a.created_at ?? 0) - Date.parse(b.created_at ?? 0);
};

/** Događaji poredani onako kako su se dogodili. */
export function poredaj(dogadaji) {
  return [...(dogadaji ?? [])].sort(poRedu);
}

/**
 * Rezultat izveden iz golova.
 *
 * `nasa` kaže je li događaj naš. Gol pripada momčadi koja ga je dala, osim
 * autogola — on pripada protivniku. To je jedino mjesto gdje se predznak
 * lako zabrlja, pa ima vlastiti test.
 *
 * `jeDoma` kaže igramo li kod kuće, jer semafor piše domaćin : gost.
 */
export function rezultatIzDogadaja(dogadaji, jeDoma = true) {
  let nasi = 0;
  let njihovi = 0;

  (dogadaji ?? []).forEach((d) => {
    if (!GOLOVI.has(d.vrsta)) return;
    const namaIde = d.vrsta === 'autogol' ? !d.nasa : Boolean(d.nasa);
    if (namaIde) nasi += 1;
    else njihovi += 1;
  });

  return jeDoma ? { home: nasi, away: njihovi } : { home: njihovi, away: nasi };
}

/**
 * Stanje prijenosa, izvedeno iz zadnjeg događaja.
 *
 * Minuta i poluvrijeme se čitaju iz zadnjeg upisanog događaja koji ih nosi —
 * ne iz sata. Dok ništa nije upisano, utakmica nije počela.
 */
export function stanjePrijenosa(dogadaji) {
  const redom = poredaj(dogadaji);
  if (!redom.length) {
    return { pocela: false, zavrsena: false, poluvrijeme: 1, minuta: null, odmor: false };
  }

  const zadnji = redom[redom.length - 1];
  const sMinutom = [...redom].reverse().find((d) => imaMinutu(d.minuta));

  return {
    pocela: true,
    zavrsena: zadnji.vrsta === 'kraj',
    odmor: zadnji.vrsta === 'kraj_pol',
    poluvrijeme: Number(zadnji.poluvrijeme) || 1,
    minuta: sMinutom ? Number(sMinutom.minuta) : null,
  };
}

/** `1. poluvrijeme · 14'`, `Poluvrijeme`, `Kraj`, `Uskoro` */
export function opisStanja(stanje) {
  if (!stanje.pocela) return 'Uskoro';
  if (stanje.zavrsena) return 'Kraj';
  if (stanje.odmor) return 'Poluvrijeme';
  const pol = `${stanje.poluvrijeme}. poluvrijeme`;
  return stanje.minuta === null ? pol : `${pol} · ${stanje.minuta}'`;
}

/* Natpis uz svaki redak u tijeku utakmice. Znak je tekstualni, ne emotikon:
   emotikoni se na Androidu, iOS-u i Windowsu crtaju različito, pa bi tijek
   utakmice izgledao drukčije na svakom uređaju. */
const VRSTE = {
  pocetak:   { znak: '▶', naziv: 'Početak',          istice: false },
  gol:       { znak: '⚽', naziv: 'Gol',              istice: true },
  deseterac: { znak: '⚽', naziv: 'Gol s deseterca',  istice: true },
  autogol:   { znak: '⚽', naziv: 'Autogol',          istice: true },
  zuti:      { znak: '▌', naziv: 'Žuti karton',      istice: false },
  crveni:    { znak: '▌', naziv: 'Crveni karton',    istice: false },
  timeout:   { znak: '⏸', naziv: 'Timeout',          istice: false },
  kraj_pol:  { znak: '⏱', naziv: 'Kraj poluvremena', istice: false },
  kraj:      { znak: '⏹', naziv: 'Kraj utakmice',    istice: true },
  komentar:  { znak: '·', naziv: '',                 istice: false },
};

/** Ime koje stoji uz događaj: naš igrač iz postave, inače upisano ime. */
function imeUzDogadaj(d, igraci) {
  if (d.igrac_id) {
    const igrac = (igraci ?? []).find((i) => i.id === d.igrac_id);
    if (igrac) return igrac.name;
  }
  return d.ime || '';
}

/**
 * Tijek utakmice za prikaz — **najnoviji prvi**.
 *
 * Tako se čita svaki prijenos uživo: zadnje što se dogodilo je ono zbog čega
 * je navijač otvorio stranicu.
 */
export function sloziFeed(dogadaji, igraci) {
  return poredaj(dogadaji)
    .reverse()
    .map((d) => {
      const vrsta = VRSTE[d.vrsta] ?? VRSTE.komentar;
      return {
        id: d.id,
        vrsta: d.vrsta,
        znak: vrsta.znak,
        naziv: vrsta.naziv,
        istice: vrsta.istice,
        nasa: Boolean(d.nasa),
        minuta: imaMinutu(d.minuta) ? Number(d.minuta) : null,
        poluvrijeme: Number(d.poluvrijeme) || 1,
        ime: imeUzDogadaj(d, igraci),
        tekst: d.tekst || '',
      };
    });
}

/** Postava razdvojena na početnu petorku i klupu, naših i protivničkih. */
export function sloziPostavu(postave, igraci, nasa) {
  const redci = (postave ?? [])
    .filter((p) => Boolean(p.nasa) === nasa)
    .sort(poRedu)
    .map((p) => {
      const igrac = p.igrac_id ? (igraci ?? []).find((i) => i.id === p.igrac_id) : null;
      return {
        id: p.id,
        /* Ključ igrača, a ne retka postave — konzola uz njega veže strijelca,
           pa gol zna tko ga je dao i kad se postava poslije promijeni. */
        igracId: p.igrac_id ?? null,
        ime: igrac?.name || p.ime || '',
        broj: p.broj ?? igrac?.number ?? null,
        pocetna: Boolean(p.pocetna),
      };
    })
    .filter((p) => p.ime);

  return {
    pocetna: redci.filter((p) => p.pocetna),
    klupa: redci.filter((p) => !p.pocetna),
  };
}

/**
 * Odbrojavanje do početka utakmice.
 *
 * `sad` se ubrizgava, da test ne ovisi o trenutku pokretanja. Sekunde su
 * ovdje na mjestu: ovo je stranica prijenosa, a ne ukras u heroju — ondje
 * su namjerno izostavljene.
 */
export function odbrojavanje(kickoff, sad = Date.now()) {
  const t = Date.parse(kickoff ?? '');
  if (Number.isNaN(t)) return null;

  const sekundi = Math.floor((t - (sad instanceof Date ? sad.getTime() : sad)) / 1000);
  if (sekundi <= 0) return { proslo: true, dana: 0, sati: 0, minuta: 0, sekundi: 0, ukupno: 0 };

  return {
    proslo: false,
    dana: Math.floor(sekundi / 86400),
    sati: Math.floor((sekundi % 86400) / 3600),
    minuta: Math.floor((sekundi % 3600) / 60),
    sekundi: sekundi % 60,
    ukupno: sekundi,
  };
}

/** `2 dana 4 h`, `3 h 12 min`, `04:21` — sekunde tek u zadnjem satu. */
export function opisOdbrojavanja(o) {
  if (!o || o.proslo) return '';
  if (o.dana > 0) return `${o.dana} d ${o.sati} h`;
  if (o.ukupno >= 3600) return `${o.sati} h ${String(o.minuta).padStart(2, '0')} min`;
  return `${String(o.minuta).padStart(2, '0')}:${String(o.sekundi).padStart(2, '0')}`;
}
