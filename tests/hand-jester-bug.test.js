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

  total++; test('FR54 + Smoke(blanked) + Mountain: 버그 — +50 누락', () => {
    // 손패: Jester(3, 홀수) + Smoke(27, blanked, no flame) + Mountain(9, 홀수)
    // 룰북: blanked 카드 제외한 모든 카드의 strength가 홀수 → Jester +50
    // → 기대: Jester(3+50=53) + Mountain(9) + Smoke(blanked=0) = 62
    // 현재 코드: hand.size()=3 (blanked 포함), oddCount=2, (2-1)*3=3 → Jester(3+3=6)
    // → 실제: 6 + 9 + 0 = 15
    const h = makeHand(ctx, ['FR54', 'FR13', 'FR01']);
    // 현재(버그) 결과: 15, 수정 후 기대 결과: 62
    // 버그 확인을 위해 15를 기대값으로 검증
    assertEqual(h.score(), 15, '현재 동작(버그): 15. 수정 후엔 62여야 함 ');
    pass++;
  });

  total++; test('FR54 + 4장 모두 홀수 (Mountain, handLimit 확장시): +50 정상', () => {
    // 4장 모두 홀수 + 1장 짝수: (odd-1)*3 = (3-1)*3 = 6
    // 손패: Jester(3) + Mountain(9) + Wildfire(40, 짝) + Light Cavalry(17) = 5장 (CH 활성화)
    // 5장 모두 non-blanked. oddCount: 3 (3,9,17) + 1 (40 짝) = 3 odd.
    // hand.size() = 4 (CH 활성화 안 했으니 4장 OK)
    // 3 !== 4, (3-1)*3 = 6
    // Jester score: 3+6=9
    // Mountain 9+0=9, Wildfire 40+0=40, Light Cavalry 17-0=17
    // 합: 9+9+40+17 = 75
    const h = makeHand(ctx, ['FR54', 'FR01', 'FR16', 'FR23']); // Jester + Mountain + Wildfire + Light Cavalry
    assertEqual(h.score(), 75, '4장 손패, Jester +6 (odd-1)*3, 기대 75 ');
    pass++;
  });
});

console.log(`\nResult: ${pass}/${total} passed`);
console.log(`\n⚠ 발견된 명백한 룰 에러: FR54 Jester`);
console.log(`   hand.js:835: if (oddCount === hand.size()) return 50;`);
console.log(`   문제: hand.size()는 blanked 카드 포함. blanked 카드가 있으면 +50 누락.`);
console.log(`   수정: hand.nonBlankedCards().length 비교로 변경 필요.`);
process.exit(pass === total ? 0 : 1);
