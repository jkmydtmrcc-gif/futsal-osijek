/**
 * Oblikovanje teksta objave.
 *
 * Tekst se u bazi drži kao običan tekst s nekoliko oznaka — iste one koje
 * ljudi već pišu u porukama:
 *
 *   **podebljano**   *kurziv*   __podcrtano__   [natpis](https://adresa)
 *   ## Podnaslov     - stavka popisa     1. numerirana stavka     > citat
 *
 * Zašto ne HTML: tekst iz baze bi se onda morao ubacivati kao HTML, a to je
 * vrata za svaki zalijepljeni `<script>`. Ovdje se oznake pretvaraju u
 * stablo, a React od stabla gradi elemente — ništa iz baze se nikad ne
 * izvodi kao kod. Oznaka koja nije zatvorena ostaje obična zvjezdica: tekst
 * se nikad ne izgubi zbog tipfelera.
 *
 * Emotikoni ne trebaju ništa posebno: to su obična slova (Unicode), pa se
 * spremaju i prikazuju kao i svako drugo slovo.
 *
 * Bez ijednog uvoza iz Reacta, pa `npm test` može gađati izravno.
 */

/* ── Unutar retka ──────────────────────────────────────────────────────── */

/* Redom prednosti: poveznica, pa podebljano (`**`) prije kurziva (`*`), da se
   `**` ne pročita kao dva kurziva. Gola adresa postaje poveznica sama, bez
   završne interpunkcije — „vidi https://klub.hr.“ ne smije vući točku. */
const UZORAK =
  /\[([^\]\n]+)\]\(([^)\s]+)\)|\*\*(?!\s)(.+?)(?<!\s)\*\*|__(?!\s)(.+?)(?<!\s)__|\*(?![\s*])(.+?)(?<![\s*])\*|(https?:\/\/[^\s<>()]*[^\s<>().,;:!?'"])/;

/** Smije li adresa postati poveznica? Samo web, pošta, telefon i stranice kluba. */
export function sigurnaAdresa(adresa) {
  const a = String(adresa ?? '').trim();
  return /^(https?:\/\/|mailto:|tel:|\/(?!\/))/i.test(a) ? a : null;
}

/**
 * Tekst jednog retka → čvorovi:
 *   `'tekst'` · `{ vrsta: 'b' | 'i' | 'u', djeca }` · `{ vrsta: 'a', href, djeca }`
 */
export function uRetku(tekst) {
  const izlaz = [];
  let ostatak = String(tekst ?? '');

  while (ostatak) {
    const m = UZORAK.exec(ostatak);
    if (!m) {
      izlaz.push(ostatak);
      break;
    }
    if (m.index > 0) izlaz.push(ostatak.slice(0, m.index));

    const [cijelo, natpis, adresa, b, u, i, gola] = m;
    if (natpis !== undefined) {
      const href = sigurnaAdresa(adresa);
      // Nesigurna adresa (npr. `javascript:`) ostaje samo natpis, bez poveznice.
      izlaz.push(href ? { vrsta: 'a', href, djeca: uRetku(natpis) } : natpis);
    } else if (b !== undefined) izlaz.push({ vrsta: 'b', djeca: uRetku(b) });
    else if (u !== undefined) izlaz.push({ vrsta: 'u', djeca: uRetku(u) });
    else if (i !== undefined) izlaz.push({ vrsta: 'i', djeca: uRetku(i) });
    else izlaz.push({ vrsta: 'a', href: gola, djeca: [gola] });

    ostatak = ostatak.slice(m.index + cijelo.length);
  }

  // Susjedni komadi običnog teksta spajaju se — manje čvorova, isti ispis.
  return izlaz.reduce((acc, c) => {
    if (typeof c === 'string' && typeof acc[acc.length - 1] === 'string') acc[acc.length - 1] += c;
    else acc.push(c);
    return acc;
  }, []);
}

/* ── Blokovi ───────────────────────────────────────────────────────────── */

const vrstaRetka = (red) => {
  if (/^#{1,3}\s+\S/.test(red)) return 'h';
  if (/^\s*[-•*]\s+\S/.test(red)) return 'ul';
  if (/^\s*\d+[.)]\s+\S/.test(red)) return 'ol';
  if (/^>\s?/.test(red)) return 'citat';
  return 'p';
};

const ocisti = (red, vrsta) => {
  if (vrsta === 'h') return red.replace(/^#{1,3}\s+/, '');
  if (vrsta === 'ul') return red.replace(/^\s*[-•*]\s+/, '');
  if (vrsta === 'ol') return red.replace(/^\s*\d+[.)]\s+/, '');
  if (vrsta === 'citat') return red.replace(/^>\s?/, '');
  return red;
};

/**
 * Odlomci (niz, ili tekst s praznim redom između odlomaka) → blokovi:
 *   `{ vrsta: 'p' | 'citat', redci: [čvorovi po retku] }`
 *   `{ vrsta: 'h', djeca }`
 *   `{ vrsta: 'ul' | 'ol', stavke: [čvorovi po stavci] }`
 *
 * Unutar odlomka svaki redak sam kaže što je, pa podnaslov ili popis ne
 * traže prazan red ispred sebe. Uzastopni redci iste vrste čine jedan blok;
 * jednostruki prijelaz unutar običnog odlomka ostaje prijelaz retka.
 */
export function blokovi(odlomci) {
  const popis = Array.isArray(odlomci)
    ? odlomci
    : String(odlomci ?? '').split(/\n\s*\n/);

  const izlaz = [];
  for (const odlomak of popis) {
    const redci = String(odlomak ?? '')
      .split('\n')
      .map((r) => r.replace(/\s+$/, ''))
      .filter((r) => r.trim());

    let trenutni = null;
    for (const red of redci) {
      const vrsta = vrstaRetka(red);
      const sadrzaj = uRetku(ocisti(red, vrsta).trim());

      if (vrsta === 'h') {
        izlaz.push({ vrsta: 'h', djeca: sadrzaj });
        trenutni = null;
        continue;
      }
      if (!trenutni || trenutni.vrsta !== vrsta) {
        trenutni = vrsta === 'ul' || vrsta === 'ol' ? { vrsta, stavke: [] } : { vrsta, redci: [] };
        izlaz.push(trenutni);
      }
      (trenutni.stavke ?? trenutni.redci).push(sadrzaj);
    }
  }
  return izlaz;
}

/** Tekst bez oznaka — za uvod, opis stranice i sve gdje oblikovanja nema. */
export function bezOznaka(tekst) {
  const ravno = (cvorovi) =>
    cvorovi.map((c) => (typeof c === 'string' ? c : ravno(c.djeca))).join('');
  return String(tekst ?? '')
    .split('\n')
    .map((red) => ravno(uRetku(ocisti(red, vrstaRetka(red)))))
    .join('\n');
}

/* ── Uređivanje (gumbi u administraciji) ───────────────────────────────── */

/**
 * Omota odabrani tekst oznakom (`**`, `*`, `__`). Bez odabira umetne
 * primjer i označi ga, da se odmah može pisati preko njega. Ako je odabrani
 * tekst već omotan istom oznakom, oznaka se skida — drugi klik poništi prvi.
 *
 * Vraća `{ tekst, od, do }` — novi sadržaj i novi odabir.
 */
export function omotaj(tekst, od, do_, oznaka, primjer = 'tekst') {
  const t = String(tekst ?? '');
  const n = oznaka.length;
  const odabrano = t.slice(od, do_);

  // Već omotano — oznaka unutar odabira ili tik oko njega.
  if (odabrano.length > 2 * n && odabrano.startsWith(oznaka) && odabrano.endsWith(oznaka)) {
    const unutra = odabrano.slice(n, -n);
    return { tekst: t.slice(0, od) + unutra + t.slice(do_), od, do: od + unutra.length };
  }
  if (t.slice(od - n, od) === oznaka && t.slice(do_, do_ + n) === oznaka && odabrano) {
    return { tekst: t.slice(0, od - n) + odabrano + t.slice(do_ + n), od: od - n, do: do_ - n };
  }

  // Razmaci na rubovima odabira ostaju izvan oznake: `** riječ **` se ne bi
  // pročitalo kao podebljano.
  const sadrzaj = odabrano.trim() || primjer;
  const lijevo = odabrano.length - odabrano.trimStart().length;
  const desno = odabrano.trim() ? odabrano.length - odabrano.trimEnd().length : 0;
  const prije = t.slice(0, od) + odabrano.slice(0, lijevo);
  const poslije = (odabrano.trim() ? odabrano.slice(odabrano.length - desno) : '') + t.slice(do_);
  const novi = prije + oznaka + sadrzaj + oznaka + poslije;
  const pocetak = prije.length + n;
  return { tekst: novi, od: pocetak, do: pocetak + sadrzaj.length };
}

/**
 * Dodaje oznaku na početak svakog odabranog retka (`## `, `- `, `1. `, `> `).
 * Ako je svaki redak već ima, skida je. Numerirani popis broji redom.
 */
export function oznaciRetke(tekst, od, do_, vrsta) {
  const t = String(tekst ?? '');
  const pocetak = t.lastIndexOf('\n', Math.max(0, od - 1)) + 1;
  let kraj = t.indexOf('\n', do_ > od && t[do_ - 1] === '\n' ? do_ - 1 : do_);
  if (kraj === -1) kraj = t.length;

  const redci = t.slice(pocetak, kraj).split('\n');
  const vec = redci.every((r) => !r.trim() || vrstaRetka(r) === vrsta);

  let broj = 0;
  const novi = redci.map((r) => {
    if (!r.trim()) return r;
    if (vec) return ocisti(r, vrsta);
    const cist = ocisti(r, vrstaRetka(r));
    broj += 1;
    const prefiks = { h: '## ', ul: '- ', ol: `${broj}. `, citat: '> ' }[vrsta];
    return prefiks + cist;
  });

  // Prazan redak dobije samo oznaku, da se odmah može pisati.
  if (redci.length === 1 && !redci[0].trim() && !vec) {
    novi[0] = { h: '## ', ul: '- ', ol: '1. ', citat: '> ' }[vrsta];
  }

  const blok = novi.join('\n');
  return { tekst: t.slice(0, pocetak) + blok + t.slice(kraj), od: pocetak, do: pocetak + blok.length };
}

/** Umetne tekst (npr. emotikon) na mjesto kursora, umjesto odabranog. */
export function umetni(tekst, od, do_, dodatak) {
  const t = String(tekst ?? '');
  const novi = t.slice(0, od) + dodatak + t.slice(do_);
  const kursor = od + dodatak.length;
  return { tekst: novi, od: kursor, do: kursor };
}
