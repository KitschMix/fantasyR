// regression.test.js — regression tests for known scenarios
const { loadEngine, makeHand, suite, test, assertEqual } = require('./runner');

let pass = 0, total = 0;

suite('regression: known scenarios', () => {
  const ctx = loadEngine(false);

  total++; test('Forest + Phoenix: forest bonus 12 for 1 beast', () => {
    // Forest(7) + Phoenix(14) + Forest bonus (12 for 1 beast) = 7 + 14 + 12 = 33
    const h = makeHand(ctx, ['FR04','FR55']);
    const score = h.score();
    assertTrue(score === 33, `Forest+Phoenix: ${score} (expected 33)`);
    pass++;
  });

  total++; test('Earth Elemental + 3 lands: 4 + 15*3 = 49', () => {
    // Earth El(4) + Mountain(9) + Cavern(6) + Bell Tower(8) = 4 + 15*3 + 9+6+8 = 72
    const h = makeHand(ctx, ['FR05','FR01','FR02','FR03']);
    assertEqual(h.score(), 72, 'EarthEl+3 land ');
    pass++;
  });

  total++; test('Fountain picks max qualifying (Great Flood flood=32)', () => {
    // Fountain(1) + Mountain(9) + Great Flood(32, flood)
    // Max qualifying: Great Flood(32)
    // Fountain: 1 + 32 = 33
    // Mountain: 9, Great Flood: 32 (no penalties)
    // Total: 33 + 9 + 32 = 74
    const h = makeHand(ctx, ['FR06','FR01','FR08']);
    assertEqual(h.score(), 74, 'Fountain+Mountain+GreatFlood ');
    pass++;
  });
});

console.log(`\nResult: ${pass}/${total} passed`);
process.exit(pass === total ? 0 : 1);

function assertTrue(cond, msg) {
  if (!cond) throw new Error(msg);
}
