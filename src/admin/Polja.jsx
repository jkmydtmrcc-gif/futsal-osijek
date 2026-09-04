/** Sitni gradivni dijelovi obrazaca — da svaki uređivač ne ponavlja isto. */

export function Polje({ label, value, onChange, type = 'text', ...rest }) {
  return (
    <label className="apolje">
      <span className="apolje__label">{label}</span>
      <input
        className="apolje__input"
        type={type}
        value={value ?? ''}
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        {...rest}
      />
    </label>
  );
}

export function Tekst({ label, value, onChange, rows = 3 }) {
  return (
    <label className="apolje">
      <span className="apolje__label">{label}</span>
      <textarea
        className="apolje__input apolje__input--tekst"
        rows={rows}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

export function Kvacica({ label, value, onChange }) {
  return (
    <label className="akvacica">
      <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}
