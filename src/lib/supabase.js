import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Je li Supabase uopće postavljen? Bez ključeva stranica radi na ugrađenom sadržaju. */
export const supabaseConfigured = Boolean(url && key);

/**
 * Klijent, ili `null` ako projekt još nije spojen.
 *
 * Namjerno `null` umjesto pucanja: stranica mora raditi i prije nego što
 * itko otvori Supabase, inače bi jedan krivi ključ srušio cijeli site.
 */
export const supabase = supabaseConfigured ? createClient(url, key) : null;
