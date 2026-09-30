/**
 * Sitnice hrvatskog jezika koje sučelje inače zabrlja.
 *
 * „Upiši 3 utakmica" i „Jedan redak se ne da pročitati, ispravi ih" su
 * greške koje čitatelj ne prijavi, ali ih primijeti — i upravo od takvih se
 * sitnica sklapa dojam da je stranica složena na brzinu.
 *
 * Bez ijednog uvoza, pa `npm test` može gađati izravno.
 */

/**
 * Oblik riječi uz broj.
 *
 * Hrvatski ima tri oblika, a pravilo ide po zadnjoj znamenki — uz iznimku za
 * 11–14, koji unatoč zadnjoj znamenki idu u treći oblik:
 *
 *   1, 21, 31…      → `jedan`     („1 utakmica")
 *   2–4, 22–24…     → `nekoliko`  („3 utakmice")
 *   0, 5–20, 25–30… → `mnogo`     („5 utakmica")
 */
export function oblik(broj, jedan, nekoliko, mnogo) {
  const n = Math.abs(Math.trunc(Number(broj) || 0));
  const zadnje = n % 10;
  const zadnjeDvije = n % 100;

  if (zadnjeDvije >= 11 && zadnjeDvije <= 14) return mnogo;
  if (zadnje === 1) return jedan;
  if (zadnje >= 2 && zadnje <= 4) return nekoliko;
  return mnogo;
}

/** `3 utakmice`, `1 utakmica`, `5 utakmica` */
export function sBrojem(broj, jedan, nekoliko, mnogo) {
  return `${broj} ${oblik(broj, jedan, nekoliko, mnogo)}`;
}
