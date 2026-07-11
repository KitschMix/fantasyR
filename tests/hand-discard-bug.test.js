// tests/hand-discard-bug.test.js — discard 의존 카드 크래시 방지 (BUG-004)
// 발견된 명백한 큰 버그: hand.js score() 호출 시 discard가 undefined면
// CH11/CH12/CH13/CH15의 bonusScore에서 TypeError 크래시
// 수정: score()가 discard 기본값을 안전한 빈 객체로 설정
const { loadEngine, makeHand, suite, test, assertEqual } = require('./runner');

let pass = 0, total = 0;

suite('hand-discard-bug: discard undefined 크래시 방지 (BUG-004)', () => {
  const ctx = loadEngine(true, true, 2);

  total++; test('CH11 Dark Queen alone (discard=undefined) — 크래시 안 함', () => {
    // 수정 전: TypeError 크래시
    // 수정 후: discard 빈 객체로 기본값 → 10 (strength) + 0 (bonus) = 10
    const h = makeHand(ctx, ['CH11']);
    assertEqual(h.score(), 10, 'Dark Queen strength 10, no bonus (discard 비어있음) ');
    pass++;
  });

  total++; test('CH12 Ghoul alone (discard=undefined)', () => {
    // Ghoul strength 8, bonus 0 (discard 비어있음)
    const h = makeHand(ctx, ['CH12']);
    assertEqual(h.score(), 8, 'Ghoul strength 8 ');
    pass++;
  });

  total++; test('CH13 Specter alone (discard=undefined)', () => {
    // Specter strength 12, bonus 0
    const h = makeHand(ctx, ['CH13']);
    assertEqual(h.score(), 12, 'Specter strength 12 ');
    pass++;
  });

  total++; test('CH15 Death Knight alone (discard=undefined)', () => {
    // Death Knight strength 14, bonus 0
    const h = makeHand(ctx, ['CH15']);
    assertEqual(h.score(), 14, 'Death Knight strength 14 ');
    pass++;
  });

  total++; test('CH11 + 1 normal card (mixed)', () => {
    // Dark Queen(10) + Mountain(9) = 19
    const h = makeHand(ctx, ['CH11', 'FR01']);
    assertEqual(h.score(), 19, 'Dark Queen 10 + Mountain 9 = 19 ');
    pass++;
  });
});

console.log(`\nResult: ${pass}/${total} passed`);
console.log(`\n⚠ 발견된 명백한 큰 버그: discard undefined 크래시 (BUG-004)`);
console.log(`   hand.js score()에서 discard=undefined면 CH11/12/13/15가 크래시`);
console.log(`   수정: score()가 discard 기본값을 안전한 빈 객체로 설정`);
process.exit(pass === total ? 0 : 1);
