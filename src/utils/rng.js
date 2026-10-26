// Deterministic pseudo-random numbers, so a given level always produces the
// same board. Math.random() is only used where variety is wanted (shuffles).

// FNV-1a: turns a string like "hard:42" into a 32-bit seed.
export function hashString(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// mulberry32 — tiny, fast, and good enough for games.
export function createRng(seed) {
  let a = seed >>> 0;

  const next = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  return {
    next,
    /** Float in [min, max) */
    range: (min, max) => min + next() * (max - min),
    /** Integer in [min, max] */
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    chance: (p) => next() < p,
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    /** Fisher–Yates; returns a new array */
    shuffle(arr) {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },
    /** Index chosen with probability proportional to weights[i] */
    weightedIndex(weights) {
      let total = 0;
      for (const w of weights) total += w;
      let r = next() * total;
      for (let i = 0; i < weights.length; i++) {
        r -= weights[i];
        if (r < 0) return i;
      }
      // Float rounding: fall back to the last index that could be chosen
      for (let i = weights.length - 1; i > 0; i--) if (weights[i] > 0) return i;
      return 0;
    },
  };
}

export function randomSeed() {
  return Math.floor(Math.random() * 2 ** 32);
}
