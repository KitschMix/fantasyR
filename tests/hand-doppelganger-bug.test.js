// tests/hand-doppelganger-bug.test.js — Doppelganger (FR53) bonusScore 미복사 단위 테스트
// 발견된 명백한 룰 버그: hand.js:466-479 Doppelganger 흉내 시 bonusScore 미복사
// 수정: bonusScore, relatedSuits, relatedCards 모두 복사
const { loadEngine, makeHand, suite, test, assertEqual } = require('./runner');

let pass = 0, total = 0;

function injectAction(hand, cardId, actionData) {
  const existing = hand.getCardById(cardId);
  if (!existing) throw new Error(`Card not in hand: ${cardId}`);
  // hand.cardsInHand의 CardInHand의 actionData 속성 직접 할당
  // _resetHand가 actionData를 보존하므로 score() 호출 시 정상 적용
  hand.cardsInHand[cardId].actionData = actionData;
}

suite('hand-doppelganger-bug: Doppelganger bonusScore 미복사 (BUG-002)', () => {
  const ctx = loadEngine(false);

  total++; test('FR53 alone (action 미사용, strength 0)', () => {
    const h = makeHand(ctx, ['FR53']);
    assertEqual(h.score(), 0, 'Doppelganger alone, action 미사용 ');
    pass++;
  });

  total++; test('FR53가 Mountain 흉내 (Smoke+Wildfire 있으면 +50 따라야 함)', () => {
    // 손패: Doppelganger, Mountain(원본), Smoke, Wildfire
    // Doppelganger가 Mountain 흉내 시 Mountain 효과 전부 따라야
    // → Doppelganger: 9+50=59, Mountain: 9+50=59, Smoke: 27, Wildfire: 40
    // → 합: 185
    // 수정 전: Doppelganger 9+0=9, Mountain 9+50=59, 합 135
    const h = makeHand(ctx, ['FR53', 'FR01', 'FR13', 'FR16']);
    injectAction(h, 'FR53', ['FR01']); // Doppelganger가 Mountain 흉내
    assertEqual(h.score(), 185, 'Doppelganger Mountain 흉내 + Mountain + Smoke + Wildfire ');
    pass++;
  });

  total++; test('FR53가 Candle 흉내 (Book+BT+Wizard 있으면 +100 따라야 함)', () => {
    // 손패: Doppelganger, Book of Changes, Bell Tower, Collector(wizard), Candle(원본)
    // Doppelganger가 Candle 흉내: strength=2, bonusScore=contains('Book')&&contains('BT')&&containsSuit('wizard')?100:0
    // → Candle 보너스 조건 충족 → 100
    // → Doppelganger: 2+100=102
    // Bell Tower: countSuit('wizard')=1(Collector) → +15, BT 본인 8 = 23
    // Book of Changes: 3 (action 미사용)
    // Collector: 7 + suit 다양성 (artifact 중복=0) = 7
    // Candle(원본): 2 + 보너스 100 = 102
    // 합: 102 + 3 + 23 + 7 + 102 = 237
    const h = makeHand(ctx, ['FR53', 'FR17', 'FR49', 'FR03', 'FR26']);
    injectAction(h, 'FR53', ['FR17']); // Doppelganger가 Candle 흉내
    assertEqual(h.score(), 237, 'Doppelganger Candle 흉내 + Candle + Book + BT + Collector ');
    pass++;
  });

  total++; test('FR53가 Swamp 흉내 (Lightning=flame 있으면 penalty -3 따라야 함)', () => {
    // 손패: Doppelganger(Swamp 흉내), Swamp(원본), Lightning
    // Swamp 흉내: penaltyScore = -3*(flame + army) = -3*(1+0) = -3
    // → Doppelganger: 18-3=15, Swamp: 18-3=15, Lightning: 11+30(Rainstorm 없음)=11
    // → 합: 41
    const h = makeHand(ctx, ['FR53', 'FR07', 'FR19']);
    injectAction(h, 'FR53', ['FR07']); // Doppelganger가 Swamp 흉내
    assertEqual(h.score(), 41, 'Doppelganger Swamp 흉내 + Swamp + Lightning ');
    pass++;
  });

  total++; test('FR53가 Swamp 흉내 (불꽃/군대가 없으면 패널티 없음)', () => {
    const h = makeHand(ctx, ['FR53', 'FR07']);
    injectAction(h, 'FR53', ['FR07']);
    // Doppelganger 18 + Swamp 18 = 36
    assertEqual(h.score(), 36, 'Doppelganger Swamp 흉내 (no flame/army) + Swamp ');
    pass++;
  });
});

console.log(`\nResult: ${pass}/${total} passed`);
console.log(`\n⚠ 발견된 명백한 룰 버그: FR53 Doppelganger bonusScore 미복사 (BUG-002)`);
console.log(`   hand.js:466-479: bonusScore/relatedSuits/relatedCards 미복사`);
console.log(`   수정: 모두 복사하도록 변경. 검증: Q1 135 → 185 (50점 복구)`);
process.exit(pass === total ? 0 : 1);
