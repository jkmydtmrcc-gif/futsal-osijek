/**
 * Tko smije uređivati stranicu.
 *
 * Popis stoji u varijabli okoline `ADMIN_PHONES`, u obliku
 * `+385911234567:Marko Marić, +385981112223:Ivana Ivić`. Ime je neobavezno.
 *
 * Bitno: prijava ne stvara račune. Kod se šalje samo na broj koji je već na
 * ovom popisu, pa netko tko nije upisan ne može ni pokrenuti slanje — a kamoli
 * ući. Dodavanje urednika je izmjena varijable okoline, ne izmjena podataka
 * koju bi napadač mogao izvesti kroz aplikaciju.
 */

/**
 * Svodi broj na E.164 oblik (+385…).
 *
 * Hrvatski brojevi se često upisuju kao `0911234567` ili `091 123 4567`, pa se
 * vodeća nula zamjenjuje pozivnim brojem države. Bez toga bi isti čovjek s dva
 * načina upisa bio dvije različite osobe.
 */
export function normalizePhone(input, defaultCountry = '385') {
  const raw = String(input ?? '').trim();
  if (!raw) return null;

  let digits = raw.replace(/[^\d+]/g, '');

  if (digits.startsWith('00')) digits = `+${digits.slice(2)}`;
  else if (digits.startsWith('0')) digits = `+${defaultCountry}${digits.slice(1)}`;
  else if (!digits.startsWith('+')) digits = `+${digits}`;

  // E.164: plus i 8–15 znamenki.
  return /^\+\d{8,15}$/.test(digits) ? digits : null;
}

/** Popis urednika iz okoline. */
export function adminList() {
  return (process.env.ADMIN_PHONES || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [phonePart, ...nameParts] = entry.split(':');
      const phone = normalizePhone(phonePart);
      return phone ? { phone, name: nameParts.join(':').trim() || 'Urednik' } : null;
    })
    .filter(Boolean);
}

/** Vraća urednika za broj ili `null`. */
export function findAdmin(phone) {
  return adminList().find((a) => a.phone === phone) ?? null;
}

/** Je li popis urednika uopće postavljen. */
export function adminsConfigured() {
  return adminList().length > 0;
}
