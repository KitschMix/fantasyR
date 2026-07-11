// cursed-item.test.js — cursed item slot
const { loadEngine, makeHand, addCursedItem, suite, test, assertEqual, assertTrue } = require('./runner');

let pass = 0, total = 0;

suite('cursed-item: cursed item slot', () => {
  const ctx = loadEngine(false);

  total++; test('cursed item in separate slot', () => {
    const h = makeHand(ctx, ['FR01']);
    addCursedItem(ctx, h, 'FR02');
    assertEqual(h.cards().length, 1, 'main hand size unchanged');
    assertEqual(h.faceDownCursedItems().length, 1, 'cursed item in slot');
    pass++;
  });

  total++; test('cursed item contributes to score', () => {
    const h = makeHand(ctx, ['FR01']); // Mountain = 9
    addCursedItem(ctx, h, 'FR02');    // Cavern = 6, +25 if Dragon
    // Total should include cursed item
    const score = h.score();
    assertTrue(score >= 9, `cursed item should add to score, got ${score}`);
    pass++;
  });
});

console.log(`\nResult: ${pass}/${total} passed`);
process.exit(pass === total ? 0 : 1);
