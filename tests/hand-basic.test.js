// hand-basic.test.js — basic score addition without special effects
const { loadEngine, makeHand, suite, test, assertEqual } = require('./runner');

let pass = 0, total = 0;

suite('hand-basic: basic score addition', () => {
  const ctx = loadEngine(false);
  // Mountain(9) + Cavern(6) + Bell Tower(8) + Forest(7) + Earth Elemental(4)
  //   + Fountain of Life(1) + Swamp(18) = 53 base
  // No flame cards, so Swamp penalty = 0
  // No beasts, so Forest bonus = 0
  // Earth Elemental: 15 * land_count_excluding_self = 15*4 = 60
  // Fountain of Life: max strength in qualifying suits = Swamp(18, flood) = 18
  // Total: 53 + 60 + 18 = 131

  total++; test('7 simple cards total score', () => {
    const h = makeHand(ctx, ['FR01','FR02','FR03','FR04','FR05','FR06','FR07']);
    assertEqual(h.score(), 131, 'total ');
    pass++;
  });

  total++; test('single card (no bonuses/penalties)', () => {
    const h = makeHand(ctx, ['FR01']); // Mountain, no other cards
    assertEqual(h.score(), 9, 'Mountain alone ');
    pass++;
  });

  total++; test('two cards no synergy', () => {
    const h = makeHand(ctx, ['FR01','FR02']); // Mountain + Cavern, no Dwarvish/Dragon
    // Mountain: 9 + 0 (no Smoke+Wildfire) = 9
    // Cavern: 6 + 0 (no Dwarvish/Dragon) = 6
    assertEqual(h.score(), 15, 'Mountain+Cavern ');
    pass++;
  });

  total++; test('empty hand', () => {
    const h = makeHand(ctx, []);
    assertEqual(h.score(), 0, 'empty ');
    pass++;
  });
});

console.log(`\nResult: ${pass}/${total} passed`);
process.exit(pass === total ? 0 : 1);
