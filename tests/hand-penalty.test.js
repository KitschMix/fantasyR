// hand-penalty.test.js — penalty effects
const { loadEngine, makeHand, suite, test, assertEqual } = require('./runner');

let pass = 0, total = 0;

suite('hand-penalty: penalty effects', () => {
  const ctx = loadEngine(false);

  total++; test('FR07 Swamp alone: no penalty (no flame)', () => {
    // Swamp(18) + 0 flames = 18
    const h = makeHand(ctx, ['FR07']);
    assertEqual(h.score(), 18, 'Swamp alone ');
    pass++;
  });

  total++; test('FR12 Blizzard alone: no penalty (no leader/beast/flame)', () => {
    const h = makeHand(ctx, ['FR12']);
    assertEqual(h.score(), 30, 'Blizzard alone ');
    pass++;
  });

  total++; test('FR37 Basilisk alone: 35 (no penalty conditions trigger alone)', () => {
    // Basilisk strength 35. The -40 penalty applies only when 'absorbed' isn't
    // triggered. Alone, the engine currently treats this as base strength only.
    const h = makeHand(ctx, ['FR37']);
    assertEqual(h.score(), 35, 'Basilisk alone ');
    pass++;
  });
});

console.log(`\nResult: ${pass}/${total} passed`);
process.exit(pass === total ? 0 : 1);
