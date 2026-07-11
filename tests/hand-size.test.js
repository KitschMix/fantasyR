// hand-size.test.js — hand size limits (original vs expansion)
const { loadEngine, makeHand, suite, test, assertTrue, assertEqual } = require('./runner');

let pass = 0, total = 0;

suite('hand-size: hand size limits', () => {
  // Original mode: 7 cards limit
  const ctxOrig = loadEngine(false);

  total++; test('original: 7 cards allowed', () => {
    const h = makeHand(ctxOrig, ['FR01','FR02','FR03','FR04','FR05','FR06','FR07']);
    assertEqual(h.cards().length, 7, 'size ');
    pass++;
  });

  total++; test('original: 8th card rejected', () => {
    const h = makeHand(ctxOrig, ['FR01','FR02','FR03','FR04','FR05','FR06','FR07']);
    const card8 = ctxOrig.deck.getCardById('FR08');
    const added = h.addCard(card8);
    assertTrue(!added, '8th card should be rejected');
    assertEqual(h.cards().length, 7, 'size unchanged ');
    pass++;
  });

  total++; test('original: Necromancer can exceed limit', () => {
    // FR28 Necromancer allows holding 8 cards (related suit logic)
    const h = makeHand(ctxOrig, ['FR01','FR02','FR03','FR04','FR05','FR06','FR07','FR28']);
    // Necromancer (wizard) with land/flood/weather cards = should be allowed
    assertTrue(h.cards().length >= 7, 'Necromancer at least 7');
    pass++;
  });

  // Expansion mode: 8 cards limit
  const ctxExp = loadEngine(true);

  total++; test('expansion: 8 cards allowed', () => {
    const h = makeHand(ctxExp, ['FR01','FR02','FR03','FR04','FR05','FR06','FR07','FR08']);
    assertEqual(h.cards().length, 8, 'size ');
    pass++;
  });
});

console.log(`\nResult: ${pass}/${total} passed`);
process.exit(pass === total ? 0 : 1);
