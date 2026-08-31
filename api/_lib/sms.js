/**
 * Slanje SMS-a.
 *
 * Podržani su Twilio i Infobip (Infobip je hrvatski, pa su cijene prema
 * hrvatskim brojevima obično povoljnije). Bez postavljenih varijabli okoline
 * radi „console“ način: kod se ispiše u zapis poslužitelja umjesto da se
 * pošalje — tako se cijeli tok prijave može isprobati lokalno, bez troška i
 * bez ijednog vanjskog računa.
 */

export const SMS_DRIVER = (
  process.env.SMS_DRIVER ||
  (process.env.TWILIO_ACCOUNT_SID ? 'twilio' : '') ||
  (process.env.INFOBIP_API_KEY ? 'infobip' : '') ||
  'console'
).toLowerCase();

/** Radi li slanje uistinu ili se kod samo ispisuje u zapis. */
export const smsIsLive = SMS_DRIVER === 'twilio' || SMS_DRIVER === 'infobip';

async function sendTwilio(to, body) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  if (!sid || !token || !from) throw new Error('Twilio nije potpuno postavljen.');

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${sid}:${token}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: to, From: from, Body: body }),
  });

  if (!res.ok) {
    // Odgovor davatelja ide u zapis, ali ne i korisniku — može sadržavati
    // podatke o računu.
    const detail = await res.text();
    throw new Error(`Twilio ${res.status}: ${detail.slice(0, 300)}`);
  }
}

async function sendInfobip(to, body) {
  const key = process.env.INFOBIP_API_KEY;
  const base = (process.env.INFOBIP_BASE_URL || '').replace(/\/+$/, '');
  const from = process.env.INFOBIP_FROM || 'MNKOsijek';
  if (!key || !base) throw new Error('Infobip nije potpuno postavljen.');

  const res = await fetch(`${base}/sms/2/text/advanced`, {
    method: 'POST',
    headers: {
      Authorization: `App ${key}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      messages: [{ from, destinations: [{ to }], text: body }],
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Infobip ${res.status}: ${detail.slice(0, 300)}`);
  }
}

/**
 * Šalje kod za prijavu.
 *
 * Poruka namjerno ne sadrži poveznicu — kod koji stigne uz poveznicu je
 * mamac za phishing. Piše i da ga nitko iz kluba neće tražiti.
 */
export async function sendLoginCode(phone, code) {
  const body = `MNK Osijek Kandit — kod za prijavu: ${code}\nVrijedi 5 minuta. Nikome ga ne prosljeđuj.`;

  if (SMS_DRIVER === 'twilio') return sendTwilio(phone, body);
  if (SMS_DRIVER === 'infobip') return sendInfobip(phone, body);

  // Razvojni način: kod ide u zapis poslužitelja.
  console.log(`\n[SMS→${phone}] kod za prijavu: ${code}\n`);
  return undefined;
}
