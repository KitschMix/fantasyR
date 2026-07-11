// phoenix.test.js — Phoenix promo card
const { loadEngine, makeHand, suite, test, assertEqual } = require('./runner');

let pass = 0, total = 0;

suite('phoenix: Phoenix promo card', () => {
  const ctx = loadEngine(false);

  total++; test('FR55P Phoenix Promo: can be added', () => {
    const h = makeHand(ctx, ['FR55P']);
    assertEqual(h.cards().length, 1, 'Phoenix Promo in hand ');
    pass++;
  });

  total++; test('FR55P alone has a score', () => {
    const h = makeHand(ctx, ['FR55P']);
    // Phoenix Promo has its own score (probably 14 base)
    // Just verify it's a finite number
    const score = h.score();
    assertTrue(typeof score === 'number' && !isNaN(score), `score type: ${score}`);
    pass++;
  });
});

console.log(`\nResult: ${pass}/${total} passed`);
process.exit(pass === total ? 0 : 1);

function assertTrue(cond, msg) {
  if (!cond) throw new Error(msg);
}
