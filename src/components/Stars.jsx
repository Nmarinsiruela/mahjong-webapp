import { useI18n } from '../i18n';
import './Stars.css';

// Star rating drawn as round pips, like the dots on a circles tile
export default function Stars({ count, size = 'sm' }) {
  const { t } = useI18n();

  return (
    <span className={`pips pips-${size}`} role="img" aria-label={t.stars(count)}>
      {[1, 2, 3].map(n => <span key={n} className={n <= count ? 'pip on' : 'pip'} />)}
    </span>
  );
}
