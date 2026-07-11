// tests/hand-playercount-bug.test.js — CH06 Genie, CH24 Spyglass playerCount 의존
// 발견된 명백한 룰 버그: deck.js가 `var playerCount = 2` 전역변수 참조
// 3인+ 게임에서도 2인용 점수/패널티 적용 (룰 오류)
// 수정: hand.playerCount로 동적 참조
const { loadEngine, makeHand, suite, test, assertEqual } = require('./runner');

let pass = 0, total = 0;

suite('hand-playercount-bug: Genie/Spyglass playerCount (BUG-003)', () => {
  // CH06 Genie: bonus = 10 * (playerCount - 1)
  // - 2인: +10, 3인: +20, 4인: +30
  // CH24 Spyglass: penalty = playerCount === 2 ? -9 : 0
  // - 2인: -9, 3인+: 0

  total++; test('CH06 Genie alone (2인 모드): -50 + 10 = -40', () => {
    const ctx = loadEngine(true, true, 2);
    const h = makeHand(ctx, ['CH06']);
    // Genie strength -50 + bonus 10*(2-1) = -40
    assertEqual(h.score(), -40, 'Genie 2인 모드 ');
    pass++;
  });

  total++; test('CH06 Genie alone (3인 모드): -50 + 20 = -30 (수정 전엔 -40)', () => {
    const ctx = loadEngine(true, true, 3);
    const h = makeHand(ctx, ['CH06']);
    // 수정 후: Genie -50 + 10*(3-1) = -30
    // 수정 전: -50 + 10*(2-1) = -40 (playerCount=2 고정)
    assertEqual(h.score(), -30, 'Genie 3인 모드 ');
    pass++;
  });

  total++; test('CH06 Genie alone (4인 모드): -50 + 30 = -20 (수정 전엔 -40)', () => {
    const ctx = loadEngine(true, true, 4);
    const h = makeHand(ctx, ['CH06']);
    // 수정 후: -50 + 10*(4-1) = -20
    assertEqual(h.score(), -20, 'Genie 4인 모드 ');
    pass++;
  });

  total++; test('CH24 Spyglass alone (2인 모드): -1 + (-9) = -10', () => {
    const ctx = loadEngine(true, true, 2);
    const h = makeHand(ctx, []);
    const spyglass = ctx.deck.getCardById('CH24');
    h.cursedItems['CH24'] = new ctx.CardInHand({ ...spyglass, cursedItem: true });
    // Spyglass strength -1 + penalty -9 (2인) = -10
    assertEqual(h.score(), -10, 'Spyglass 2인 모드 ');
    pass++;
  });

  total++; test('CH24 Spyglass alone (3인 모드): -1 + 0 = -1 (수정 전엔 -10)', () => {
    const ctx = loadEngine(true, true, 3);
    const h = makeHand(ctx, []);
    const spyglass = ctx.deck.getCardById('CH24');
    h.cursedItems['CH24'] = new ctx.CardInHand({ ...spyglass, cursedItem: true });
    // 수정 후: -1 + 0 (3인은 패널티 없음) = -1
    // 수정 전: -1 + (-9) = -10
    assertEqual(h.score(), -1, 'Spyglass 3인 모드 ');
    pass++;
  });

  total++; test('CH24 Spyglass alone (4인 모드): -1 + 0 = -1', () => {
    const ctx = loadEngine(true, true, 4);
    const h = makeHand(ctx, []);
    const spyglass = ctx.deck.getCardById('CH24');
    h.cursedItems['CH24'] = new ctx.CardInHand({ ...spyglass, cursedItem: true });
    assertEqual(h.score(), -1, 'Spyglass 4인 모드 ');
    pass++;
  });
});

console.log(`\nResult: ${pass}/${total} passed`);
console.log(`\n⚠ 발견된 명백한 룰 버그: CH06 Genie, CH24 Spyglass playerCount=2 고정 (BUG-003)`);
console.log(`   수정: hand.playerCount 동적 참조`);
console.log(`   검증: Genie 2인 -40, 3인 -30, 4인 -20 / Spyglass 2인 -10, 3인+ -1`);
process.exit(pass === total ? 0 : 1);
