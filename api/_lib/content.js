/**
 * Objavljeni sadržaj: čitanje, provjera i spremanje.
 *
 * Sadržaj je jedan JSON objekt — isti oblik koji administracija uređuje i koji
 * stranica čita. Nema sheme baze koja bi se morala mijenjati sa svakim novim
 * poljem; zato je provjera prije spremanja to važnija.
 */
import { kvGetJson, kvPushCapped, kvSetJson, kvList } from './kv.js';

export const CONTENT_KEY = 'sadrzaj:objavljeno';
export const AUDIT_KEY = 'sadrzaj:dnevnik';

/** Najveći dopušteni sadržaj — slike se drže kao putanje, ne kao data URL-ovi. */
export const MAX_CONTENT_BYTES = 900_000;

const MAX_DEPTH = 12;
const MAX_STRING = 20_000;
const MAX_ARRAY = 500;
const MAX_KEYS = 200;

/**
 * Adrese koje bi u `href` ili `src` bile opasne.
 *
 * React sam bježi tekst, pa ubrizgavanje HTML-a ovdje nije put unutra — ali
 * `javascript:` poveznica jest, a `data:text/html` otvara stranicu s tuđim
 * sadržajem na našoj adresi. Slike kao `data:image/...` su u redu.
 */
const DANGEROUS = /^\s*(javascript:|vbscript:|data:(?!image\/(png|jpe?g|gif|webp|avif);base64,))/i;

function walk(value, depth, path) {
  if (depth > MAX_DEPTH) throw new Error(`Sadržaj je preduboko ugniježđen (${path}).`);

  if (value === null || typeof value === 'boolean' || typeof value === 'number') {
    if (typeof value === 'number' && !Number.isFinite(value)) {
      throw new Error(`Neispravan broj (${path}).`);
    }
    return value;
  }

  if (typeof value === 'string') {
    if (value.length > MAX_STRING) throw new Error(`Predugačak tekst (${path}).`);
    if (DANGEROUS.test(value)) throw new Error(`Nedopuštena adresa (${path}).`);
    return value;
  }

  if (Array.isArray(value)) {
    if (value.length > MAX_ARRAY) throw new Error(`Popis je predugačak (${path}).`);
    return value.map((item, i) => walk(item, depth + 1, `${path}[${i}]`));
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value);
    if (keys.length > MAX_KEYS) throw new Error(`Previše polja (${path}).`);

    const out = {};
    for (const key of keys) {
      // `__proto__` i rodbina u JSON-u nemaju što tražiti; propuštanje takvog
      // ključa u objekt otvara zagađenje prototipa.
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
      out[key] = walk(value[key], depth + 1, path ? `${path}.${key}` : key);
    }
    return out;
  }

  throw new Error(`Nepodržana vrsta podatka (${path}).`);
}

/**
 * Provjerava i čisti sadržaj koji stiže od urednika.
 *
 * Vraća očišćenu kopiju ili baca grešku s porukom koja se smije pokazati —
 * urednik mora znati koje polje je problem.
 */
export function validateContent(input) {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('Sadržaj mora biti objekt.');
  }

  const size = JSON.stringify(input).length;
  if (size > MAX_CONTENT_BYTES) {
    throw new Error(
      `Sadržaj je prevelik (${Math.round(size / 1024)} kB, najviše ${Math.round(
        MAX_CONTENT_BYTES / 1024
      )} kB). Najčešći uzrok su slike odabrane s računala — ubaci ih u public/uploads/ i upiši putanju.`
    );
  }

  return walk(input, 0, '');
}

/** Zadnja objavljena inačica ili `null` ako još ništa nije objavljeno. */
export async function readPublished() {
  return kvGetJson(CONTENT_KEY);
}

/** Sprema novu inačicu i upisuje tko ju je objavio. */
export async function writePublished(content, admin) {
  const record = {
    content,
    revision: Date.now(),
    updatedAt: new Date().toISOString(),
    updatedBy: { name: admin.name, phone: maskPhone(admin.phone) },
  };

  await kvSetJson(CONTENT_KEY, record);
  await kvPushCapped(
    AUDIT_KEY,
    {
      at: record.updatedAt,
      by: record.updatedBy,
      revision: record.revision,
      bytes: JSON.stringify(content).length,
    },
    30
  );

  return record;
}

/** Zadnjih nekoliko objava — tko je i kad mijenjao. */
export async function readAudit(count = 10) {
  return kvList(AUDIT_KEY, count);
}

/** Broj se nikad ne vraća cijeli — dovoljno je da se urednik prepozna. */
export function maskPhone(phone) {
  return phone.length > 5 ? `${phone.slice(0, 4)}…${phone.slice(-3)}` : '…';
}
