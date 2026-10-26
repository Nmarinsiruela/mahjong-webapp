import { DIFFICULTIES, DIFFICULTY_IDS } from '../logic/difficulty';
import './DifficultyPicker.css';

// Three tiles marked 易 (easy), 中 (middle) and 難 (hard). Native radios give
// arrow-key navigation and screen reader semantics for free.
export default function DifficultyPicker({ value, onChange, compact = false, name = 'difficulty' }) {
  return (
    <div className={compact ? 'difficulty-picker compact' : 'difficulty-picker'} role="radiogroup" aria-label="Dificultad">
      {DIFFICULTY_IDS.map(id => {
        const { glyph, name: label } = DIFFICULTIES[id];
        return (
          <label key={id} className={`difficulty-option ${id}`}>
            <input
              type="radio"
              name={name}
              value={id}
              checked={value === id}
              onChange={() => onChange(id)}
            />
            <span className="difficulty-face ivory">
              <span className="difficulty-glyph" aria-hidden="true">{glyph}</span>
              <span className="difficulty-name">{label}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}
