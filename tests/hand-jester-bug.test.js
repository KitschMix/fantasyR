// hand-jester-bug.test.js — Jester (FR54) blanked 카드 영향 검증
// 발견된 명백한 룰 에러: hand.size()가 blanked 카드를 포함하여 Jester +50점 누락
// 수정 방향: hand.nonBlankedCards().length로 변경해야
const { loadEngine, makeHand, suite, test, assertEqual } = require('./runner');

let pass = 0, total = 0;

suite('hand-jester-bug: Jester +50 blanked 카드 영향', () => {
  const ctx = loadEngine(false);

  total++; test('FR54 Jester alone: 3+50=53 (정상 케이스)', () => {
    const h = makeHand(ctx, ['FR54']); // Jester alone
    assertEqual(h.score(), 53, 'Jester alone ');
    pass++;
  });

  total++; test('FR54 + Mountain (모두 홀수, blanked 없음): +50 정상', () => {
    const h = makeHand(ctx, ['FR54', 'FR01']); // Jester(3) + Mountain(9)
    assertEqual(h.score(), 62, 'Jester+Mountain ');
    pass++;
  });

  total++; test('FR54 + Smoke(blanked) + Mountain: blanked 카드 제외 후 +50', () => {
    // 손패: Jester(3, 홀수) + Smoke(27, blanked, no flame) + Mountain(9, 홀수)
    // 룰북: blanked 카드 제외한 모든 카드의 strength가 홀수 → Jester +50
    // → 기대: Jester(3+50=53) + Mountain(9) + Smoke(blanked=0) = 62
    const h = makeHand(ctx, ['FR54', 'FR13', 'FR01']);
    assertEqual(h.score(), 62, 'Jester + blanked Smoke + Mountain ');
    pass++;
  });

  total++; test('FR54 + 홀수 3장 + 짝수 1장: 홀수마다 +3', () => {
    // Jester(3), Mountain(9), Whirlwind(13)은 홀수이고 Wildfire(40)는 짝수다.
    // 네 카드가 모두 유효하므로 Jester 보너스는 (3-1)*3 = 6.
    const h = makeHand(ctx, ['FR54', 'FR01', 'FR16', 'FR14']);
    assertEqual(h.score(), 71, '4장 손패, Jester +6 ');
    pass++;
  });
});

console.log(`\nResult: ${pass}/${total} passed`);
console.log(`\n⚠ 발견된 명백한 룰 에러: FR54 Jester`);
console.log(`   hand.js:835: if (oddCount === hand.size()) return 50;`);
console.log(`   문제: hand.size()는 blanked 카드 포함. blanked 카드가 있으면 +50 누락.`);
console.log(`   수정: hand.nonBlankedCards().length 비교로 변경 필요.`);
process.exit(pass === total ? 0 : 1);
