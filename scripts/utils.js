// scripts/utils.js — Pure utility functions extracted from script.js (Phase 6 partial)
// Safe to use anywhere; no game-state dependencies.

/**
 * Fisher–Yates shuffle. Returns a new array; original is not mutated.
 * @param {Array} items
 * @returns {Array} shuffled copy
 */
function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
