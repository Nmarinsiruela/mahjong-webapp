import './Stars.css';

// Star rating drawn as round pips, like the dots on a circles tile
export default function Stars({ count, size = 'sm' }) {
  return (
    <span className={`pips pips-${size}`} role="img" aria-label={`${count} de 3 estrellas`}>
      {[1, 2, 3].map(n => <span key={n} className={n <= count ? 'pip on' : 'pip'} />)}
    </span>
  );
}
