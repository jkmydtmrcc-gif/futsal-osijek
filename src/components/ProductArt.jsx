/**
 * Crtež artikla na kartici Fan Shopa.
 *
 * Fotografije artikala stoje kod trgovine i ne smiju se preuzimati, pa
 * kartica dok nema vlastitu fotografiju crta artikl sama — u klupskim
 * bojama, istim linijskim stilom kao ostatak stranice. Kad se u
 * administraciji upiše prava fotografija, ona pregazi crtež.
 *
 * `name` i `number` crtaju se na dres — tako personalizacija ("dres s
 * prezimenom") radi bez ijedne dodatne slike.
 */
export default function ProductArt({ kind = 'dres', name, number, className = '' }) {
  const common = {
    className: `product-art ${className}`.trim(),
    viewBox: '0 0 240 240',
    role: 'img',
    'aria-hidden': 'true',
    focusable: 'false',
  };

  if (kind === 'lopta') {
    return (
      <svg {...common}>
        <circle className="pa-fill" cx="120" cy="122" r="72" />
        <circle className="pa-line" cx="120" cy="122" r="72" />
        <path className="pa-line" d="M120 50l26 20-10 32h-32l-10-32z" />
        <path className="pa-line" d="M74 104l-16 30 22 26 28-10-6-32z" />
        <path className="pa-line" d="M166 104l16 30-22 26-28-10 6-32z" />
        <path className="pa-line" d="M104 150l16 44 16-44" />
      </svg>
    );
  }

  if (kind === 'rukavice') {
    return (
      <svg {...common}>
        <path
          className="pa-fill"
          d="M78 96c0-30 6-46 14-46s12 12 12 30V60c0-12 5-18 12-18s12 6 12 18v18c0-12 5-18 12-18s12 6 12 20v52c0 34-18 58-42 58s-46-20-46-52z"
        />
        <path
          className="pa-line"
          d="M78 96c0-30 6-46 14-46s12 12 12 30V60c0-12 5-18 12-18s12 6 12 18v18c0-12 5-18 12-18s12 6 12 20v52c0 34-18 58-42 58s-46-20-46-52z"
        />
        <path className="pa-line" d="M92 148h64" />
        <path className="pa-line" d="M104 178h40" />
      </svg>
    );
  }

  if (kind === 'hlacice') {
    return (
      <svg {...common}>
        <path className="pa-fill" d="M62 62h116l10 116h-46l-18-64-18 64H52z" />
        <path className="pa-line" d="M62 62h116l10 116h-46l-18-64-18 64H52z" />
        <path className="pa-line" d="M62 84h116" />
        <path className="pa-line" d="M148 106h26" />
      </svg>
    );
  }

  if (kind === 'lonac' || kind === 'klub') {
    return (
      <svg {...common}>
        <path className="pa-fill" d="M66 56h108v44c0 40-24 62-54 62s-54-22-54-62z" />
        <path className="pa-line" d="M66 56h108v44c0 40-24 62-54 62s-54-22-54-62z" />
        <path className="pa-line" d="M66 70H46v18c0 16 10 26 22 26" />
        <path className="pa-line" d="M174 70h20v18c0 16-10 26-22 26" />
        <path className="pa-line" d="M120 162v24" />
        <path className="pa-line" d="M86 194h68" />
        <path className="pa-line" d="M94 186h52v8H94z" />
      </svg>
    );
  }

  if (kind === 'trenirka') {
    return (
      <svg {...common}>
        <path
          className="pa-fill"
          d="M92 44h56l44 26-16 42-18-8v82H82v-82l-18 8-16-42z"
        />
        <path
          className="pa-line"
          d="M92 44h56l44 26-16 42-18-8v82H82v-82l-18 8-16-42z"
        />
        <path className="pa-line" d="M120 44v142" />
        <path className="pa-line" d="M112 60h16" />
        <circle className="pa-line" cx="120" cy="80" r="4" />
        <circle className="pa-line" cx="120" cy="104" r="4" />
      </svg>
    );
  }

  if (kind === 'golman') {
    return (
      <svg {...common}>
        <path
          className="pa-fill pa-fill--alt"
          d="M92 44h56l46 22-10 40-20-8v88H80v-88l-20 8-10-40z"
        />
        <path
          className="pa-line"
          d="M92 44h56l46 22-10 40-20-8v88H80v-88l-20 8-10-40z"
        />
        <path className="pa-line" d="M92 44c0 16 12 26 28 26s28-10 28-26" />
        <path className="pa-line" d="M60 104l-16 46 24 12" />
        <path className="pa-line" d="M180 104l16 46-24 12" />
      </svg>
    );
  }

  // Zadano: dres. Prezime i broj se crtaju na leđima.
  const away = kind === 'dres-gost';
  return (
    <svg {...common}>
      <path
        className={away ? 'pa-fill pa-fill--alt' : 'pa-fill'}
        d="M90 42h60l48 24-14 44-20-8v88H76v-88l-20 8-14-44z"
      />
      <path
        className="pa-line"
        d="M90 42h60l48 24-14 44-20-8v88H76v-88l-20 8-14-44z"
      />
      <path className="pa-line" d="M90 42c0 17 13 28 30 28s30-11 30-28" />
      {number ? (
        <text className="pa-number" x="120" y="146" textAnchor="middle">
          {number}
        </text>
      ) : null}
      {name ? (
        <text className="pa-name" x="120" y="98" textAnchor="middle">
          {name}
        </text>
      ) : null}
    </svg>
  );
}
