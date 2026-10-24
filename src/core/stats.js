// Stat helpers: percent mode and TRPG (ability score) mode share one stored stat object.

/**
 * TRPG ability modifier: floor((score - 10) / 2).
 * @param {number} score
 * @returns {number}
 */
export function trpgModifier(score) {
  return Math.floor((score - 10) / 2);
}

/**
 * Format a modifier with an explicit sign: 3 -> "+3", 0 -> "+0", -1 -> "-1".
 * @param {number} modifier
 * @returns {string}
 */
export function formatModifier(modifier) {
  return modifier < 0 ? String(modifier) : `+${modifier}`;
}

/**
 * Display values for one stat in the given mode.
 * @param {{percent: number, score: number}} stat
 * @param {'percent'|'trpg'} mode anything other than 'trpg' means percent
 * @returns {{value: number, max: number, text: string}}
 */
export function statDisplay(stat, mode) {
  if (mode === 'trpg') {
    return { value: stat.score, max: 30, text: `${stat.score} (${formatModifier(trpgModifier(stat.score))})` };
  }
  return { value: stat.percent, max: 100, text: String(stat.percent) };
}
