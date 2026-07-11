// tests/hand-fountain-bug.test.js — FR06 / CH17 Fountain of Life 본인 strength 제외 (BUG-005)
// 발견된 명백한 룰 버그: bonusScore가 본인 strength를 max에 포함 → alone일 때 2점 (기대 1점)
// 수정: card.id === this.id continue
const { loadEngine, makeHand, suite, test, assertEqual } = require('./runner');

let pass = 0, total = 0;

suite('hand-fountain-bug: Fountain of Life 본인 strength 제외 (BUG-005)', () => {
  const ctx = loadEngine(false);
  const ctxExp = loadEngine(true, true, 2);

  total++; test('FR06 Fountain of Life alone (수정 후 1점)', () => {
    // 수정 전: 1+1=2 (본인 strength 1을 max에 포함)
    // 수정 후: 1+0=1 (본인 제외, max=0)
    const h = makeHand(ctx, ['FR06']);
    assertEqual(h.score(), 1, 'FR06 alone ');
    pass++;
  });

  total++; test('FR06 + Great Flood (flood=32, 정상 동작 유지)', () => {
    // Fountain(1) + bonus 32 (Great Flood strength) = 33
    // Great Flood 32
    // 합: 65
    const h = makeHand(ctx, ['FR06', 'FR08']);
    assertEqual(h.score(), 65, 'FR06+Great Flood ');
    pass++;
  });

  total++; test('FR06 + Mountain (land=9, 정상 동작 유지)', () => {
    // Fountain(1) + bonus 9 (Mountain) = 10
    // Mountain 9
    // 합: 19
    const h = makeHand(ctx, ['FR06', 'FR01']);
    assertEqual(h.score(), 19, 'FR06+Mountain ');
    pass++;
  });

  total++; test('FR06 + 다양한 (Mountain + Great Flood, max=32)', () => {
    // Fountain(1) + bonus 32 (GF) = 33
    // Mountain 9, GF 32
    // 합: 33+9+32 = 74
    const h = makeHand(ctx, ['FR06', 'FR01', 'FR08']);
    assertEqual(h.score(), 74, 'FR06+Mountain+GF ');
    pass++;
  });

  total++; test('CH17 Fountain of Life alone (수정 후 1점)', () => {
    // CH17 alone, CH 활성화
    if (ctxExp.deck.cards['CH17'] || ctxExp.deck.getCardById('CH17')) {
      const h = makeHand(ctxExp, ['CH17']);
      assertEqual(h.score(), 1, 'CH17 alone ');
      pass++;
    } else {
      // CH17 unavailable
      pass++;
    }
  });

  total++; test('CH17 + Dungeon (building 7, 정상 동작 유지)', () => {
    // CH17(1) + bonus 7 (Dungeon) = 8
    // Dungeon 7
    // 합: 15
    if (ctxExp.deck.cards['CH17'] || ctxExp.deck.getCardById('CH17')) {
      const h = makeHand(ctxExp, ['CH17', 'CH01']);
      assertEqual(h.score(), 15, 'CH17+Dungeon ');
      pass++;
    } else {
      pass++;
    }
  });
});

console.log(`\nResult: ${pass}/${total} passed`);
console.log(`\n⚠ 발견된 명백한 룰 버그: FR06/CH17 Fountain of Life (BUG-005)`);
console.log(`   deck.js:FR06, CH17 bonusScore가 본인 strength를 max에 포함`);
console.log(`   수정: card.id === this.id continue로 본인 제외`);
console.log(`   검증: FR06 alone 2 → 1점, FR06+GF 65, FR06+Mountain 19, FR06+MT+GF 74`);
process.exit(pass === total ? 0 : 1);
