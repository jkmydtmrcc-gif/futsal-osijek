/** Mali zakošeni kvadrat koji se kroz cijeli dizajn koristi kao razdjelnik. */
export default function Pip({ size, tone, blink = false, className = '' }) {
  const classes = ['pip'];
  if (size) classes.push(`pip--${size}`);
  if (tone) classes.push(`pip--${tone}`);
  if (blink) classes.push('pip--blink');
  if (className) classes.push(className);
  return <span className={classes.join(' ')} />;
}
