import { describe, it, expect, vi, afterEach } from 'vitest';
import { MESSAGES, LANGUAGES, detectLanguage } from '../src/i18n';
import { DIFFICULTY_IDS } from '../src/logic/difficulty';
import { MATCH_CLASSES } from '../src/logic/tiles';

// "menu.play: function/1", "title: string", ... for every message
function shape(messages, prefix = '') {
  return Object.entries(messages).flatMap(([key, value]) => {
    const path = prefix + key;
    if (typeof value === 'function') return [`${path}: function/${value.length}`];
    if (value && typeof value === 'object' && !Array.isArray(value)) return shape(value, `${path}.`);
    return [`${path}: ${Array.isArray(value) ? `array/${value.length}` : typeof value}`];
  }).sort();
}

describe.each(Object.keys(MESSAGES))('%s messages', id => {
  const t = MESSAGES[id];

  it('have the same keys and message types as Spanish', () => {
    expect(shape(t)).toEqual(shape(MESSAGES.es));
  });

  it('name and describe every difficulty', () => {
    for (const difficulty of DIFFICULTY_IDS) {
      expect(t.difficulty[difficulty].name).toBeTruthy();
      expect(t.difficulty[difficulty].summary).toBeTruthy();
    }
  });

  it('name every tile face', () => {
    for (const { suit, values } of MATCH_CLASSES) {
      for (const value of values) {
        const entry = t.tiles[suit];
        expect(typeof entry === 'function' ? entry(value) : entry[value]).toBeTruthy();
      }
    }
  });

  it('is offered in the language picker', () => {
    expect(LANGUAGES.map(l => l.id)).toContain(id);
  });
});

describe('detectLanguage', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('uses the first supported browser language', () => {
    vi.stubGlobal('navigator', { languages: ['fr-FR', 'es-MX', 'en-US'] });
    expect(detectLanguage()).toBe('es');
  });

  it('falls back to English', () => {
    vi.stubGlobal('navigator', { languages: ['de-DE'] });
    expect(detectLanguage()).toBe('en');
  });
});
