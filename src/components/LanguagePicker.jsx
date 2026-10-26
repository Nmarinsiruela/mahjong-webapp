import { LANGUAGES, useI18n } from '../i18n';
import './LanguagePicker.css';

// A compact ES | EN switch. Each option is announced in its own language.
export default function LanguagePicker() {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className="language-picker" role="radiogroup" aria-label={t.language}>
      {LANGUAGES.map(({ id, code, name }) => (
        <label key={id} className="language-option">
          <input
            type="radio"
            name="language"
            value={id}
            checked={language === id}
            onChange={() => setLanguage(id)}
            aria-label={name}
            lang={id}
          />
          <span aria-hidden="true">{code}</span>
        </label>
      ))}
    </div>
  );
}
