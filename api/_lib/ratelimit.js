/**
 * Ograničavanje broja pokušaja.
 *
 * Klizni prozor s brojačem u pohrani. Namjerno se broji na više razina: po
 * broju telefona (da nekome ne zvoni mobitel cijelu noć i da SMS ne stvara
 * trošak), po IP-u (da jedan izvor ne pretražuje popis brojeva) i po pokušaju
 * upisa koda (da se šesteroznamenkasti kod ne pogodi grubom silom).
 */
import { kvIncr } from './kv.js';

/** Vraća `{ ok, count, limit }`. */
export async function hit(bucket, key, limit, windowSeconds) {
  const count = await kvIncr(`rl:${bucket}:${key}`, windowSeconds);
  return { ok: count <= limit, count, limit };
}

export const LIMITS = {
  /* Slanje koda: 3 puta u 15 minuta po broju. */
  codePerPhone: { limit: 3, window: 15 * 60 },
  /* Slanje koda: 10 puta na sat po IP-u — pokriva i pokušaj pretrage brojeva. */
  codePerIp: { limit: 10, window: 60 * 60 },
  /* Upis koda: 20 pokušaja na sat po IP-u, uz zaseban brojač po kodu. */
  verifyPerIp: { limit: 20, window: 60 * 60 },
  /* Objava sadržaja: 60 puta na sat po uredniku — kočnica za slučaj greške. */
  publishPerAdmin: { limit: 60, window: 60 * 60 },
};
