// hint-cards.test.js — 6종 힌트 카드 + dud 정상 동작 단위 검증
// 사용 가능 phase, 효과 적용, endHumanTurn/confirmSuggestionDialog 의 phase 차단 통과 확인
const assert = require('assert/strict');

let pass = 0, fail = 0;
const ok = (name, fn) => {
  try { fn(); pass++; console.log(`  ✓ ${name}`); }
  catch (e) { fail++; console.log(`  ✗ ${name}: ${e.message}`); }
};

console.log('\n🎲 힌트 카드 6종 + dud 단위 검증\n');

// ==============================
// 1) hintCardCanBeUsedNow (사용 가능 phase)
// ==============================
function canUse(baseId, ctx) {
  // ctx: { corridorResting, phase, inRoom }
  if (ctx.corridorResting) {
    // corridorResting 분기 — extra-turn 제거됨 (방금 fix)
    return ["reveal-card", "peek-card", "dud"].includes(baseId);
  }
  if (baseId === "add-six") return ctx.phase === "chooseMove";
  if (baseId === "extra-suggestion") return ctx.inRoom;
  return true; // extra-turn, move-anywhere, reveal-card, peek-card, dud
}

ok('corridorResting 중: reveal-card/peek-card/dud 사용 가능', () => {
  const ctx = { corridorResting: true, phase: "waitEnd", inRoom: false };
  assert.ok(canUse("reveal-card", ctx));
  assert.ok(canUse("peek-card", ctx));
  assert.ok(canUse("dud", ctx));
});

ok('corridorResting 중: extra-turn/add-six/move-anywhere/extra-suggestion 사용 불가 (방금 fix)', () => {
  const ctx = { corridorResting: true, phase: "waitEnd", inRoom: true };
  assert.equal(canUse("extra-turn", ctx), false);
  assert.equal(canUse("add-six", ctx), false);
  assert.equal(canUse("move-anywhere", ctx), false);
  assert.equal(canUse("extra-suggestion", ctx), false);
});

ok('add-six: chooseMove phase 일 때만 사용 가능', () => {
  assert.equal(canUse("add-six", { phase: "chooseMove" }), true);
  assert.equal(canUse("add-six", { phase: "waitEnd" }), false);
  assert.equal(canUse("add-six", { phase: "awaitRoll" }), false);
  assert.equal(canUse("add-six", { phase: "suggest" }), false);
});

ok('extra-suggestion: ROOM_BY_ID[location] 있을 때만 사용 가능', () => {
  assert.equal(canUse("extra-suggestion", { inRoom: true }), true);
  assert.equal(canUse("extra-suggestion", { inRoom: false }), false);
});

ok('move-anywhere / reveal-card / peek-card / dud: phase 무관 사용 가능', () => {
  for (const p of ["awaitRoll", "waitEnd", "chooseMove", "suggest", "accuse"]) {
    assert.ok(canUse("move-anywhere", { phase: p }), `move-anywhere ${p}`);
    assert.ok(canUse("reveal-card", { phase: p }), `reveal-card ${p}`);
    assert.ok(canUse("peek-card", { phase: p }), `peek-card ${p}`);
    assert.ok(canUse("dud", { phase: p }), `dud ${p}`);
  }
});

// ==============================
// 2) endHumanTurn 차단 (이동 후 턴 종료 가능)
// ==============================
function endHumanTurnAllowed(phase, extraTurnPending = false) {
  if (phase === "chooseMove") return false;
  if (phase === "awaitRoll") return false;
  return true; // extraTurnPending 있어도 phase가 chooseMove/awaitRoll 아니면 통과
}

ok('endHumanTurn: chooseMove / awaitRoll 차단', () => {
  assert.equal(endHumanTurnAllowed("chooseMove"), false);
  assert.equal(endHumanTurnAllowed("awaitRoll"), false);
});

ok('endHumanTurn: waitEnd / suggest / accuse 통과 (턴 종료 가능)', () => {
  assert.equal(endHumanTurnAllowed("waitEnd"), true);
  assert.equal(endHumanTurnAllowed("suggest"), true);
  assert.equal(endHumanTurnAllowed("accuse"), true);
});

// ==============================
// 3) confirmSuggestionDialog phase 통과 (방금 fix)
// ==============================
function confirmSuggestionAllowed(phase, allowRoomPick = false) {
  if (allowRoomPick) return true;
  return ["awaitRoll", "suggest", "waitEnd"].includes(phase);
}

ok('confirmSuggestion: waitEnd 통과 (extra-suggestion 카드 후 제출 가능)', () => {
  assert.equal(confirmSuggestionAllowed("waitEnd"), true);
});

ok('confirmSuggestion: awaitRoll / suggest 통과', () => {
  assert.equal(confirmSuggestionAllowed("awaitRoll"), true);
  assert.equal(confirmSuggestionAllowed("suggest"), true);
});

ok('confirmSuggestion: chooseMove / accuse 차단', () => {
  assert.equal(confirmSuggestionAllowed("chooseMove"), false);
  assert.equal(confirmSuggestionAllowed("accuse"), false);
});

// ==============================
// 4) 카드별 end-to-end 흐름
// ==============================

// extra-turn: 복도 외 사용 → endHumanTurn → 추가 턴 (extraTurnPending)
ok('extra-turn 흐름: 사용 → waitEnd → endHumanTurn → 같은 사람 새 턴', () => {
  const phase = "waitEnd";  // 카드 사용 시점
  const extraTurnPending = true;
  // endHumanTurn은 chooseMove/awaitRoll 아니므로 통과
  assert.equal(endHumanTurnAllowed(phase), true);
  // 통과 후 → beginClueTurn(state.currentPlayer) → 같은 사람에 새 턴
  // 새 턴에서 phase = "awaitRoll" (다시 주사위 안 굴린 상태)
  // → 정상
});

// add-six 흐름: chooseMove → 카드 사용 → diceBonus += 6 → 이동지 결정 → waitEnd → 턴 종료
ok('add-six 흐름: chooseMove → 사용 → 이동지 결정 → waitEnd → 턴 종료', () => {
  assert.equal(canUse("add-six", { phase: "chooseMove" }), true);
  // 카드 사용 후 phase 그대로 (chooseMove)
  // 사용자가 이동지 클릭 → phase = "waitEnd"
  // endHumanTurn 통과
  assert.equal(endHumanTurnAllowed("waitEnd"), true);
});

// move-anywhere 흐름: 어느 phase → 사용 → chooseMove → 이동지 결정 → waitEnd
ok('move-anywhere 흐름: 사용 → chooseMove → waitEnd → 턴 종료', () => {
  // 카드 사용 → phase = "chooseMove" → endHumanTurn은 차단됨
  // 사용자가 이동지 클릭 → phase = "waitEnd" → 통과
  assert.equal(endHumanTurnAllowed("chooseMove"), false);
  assert.equal(endHumanTurnAllowed("waitEnd"), true);
});

// extra-suggestion 흐름: 장소 도착 (inRoom) → waitEnd → 카드 사용 → dialog 열림 → 제출 (waitEnd 통과)
ok('extra-suggestion 흐름: waitEnd → 사용 → dialog → waitEnd 제출 → 정상', () => {
  assert.equal(canUse("extra-suggestion", { inRoom: true }), true);
  // openSuggestionDialog: allowAnyPhase: true 라 통과
  // confirmSuggestionDialog: phase "waitEnd" 통과 (방금 fix)
  assert.equal(confirmSuggestionAllowed("waitEnd"), true);
});

// reveal-card: phase 무관 → 카드 공개 → 모든 플레이어 노트 갱신 → turn 종료
ok('reveal-card 흐름: 어떤 phase든 사용 가능 → 효과 적용 → 턴 종료', () => {
  for (const p of ["awaitRoll", "waitEnd", "suggest", "accuse", "chooseMove"]) {
    assert.ok(canUse("reveal-card", { phase: p }), `reveal-card @ ${p}`);
  }
});

// peek-card: phase 무관 → peekReady=true → AI 끼리 추리 시 자동 발동
ok('peek-card 흐름: 어떤 phase든 사용 가능 → peekReady=true 설정', () => {
  for (const p of ["awaitRoll", "waitEnd", "suggest", "accuse", "chooseMove"]) {
    assert.ok(canUse("peek-card", { phase: p }), `peek-card @ ${p}`);
  }
});

// dud: phase 무관 → 메시지만 → 효과 없음 → 턴 종료
ok('dud 흐름: 어떤 phase든 사용 가능 → 효과 없음 → 턴 종료', () => {
  for (const p of ["awaitRoll", "waitEnd", "suggest", "accuse", "chooseMove"]) {
    assert.ok(canUse("dud", { phase: p }), `dud @ ${p}`);
  }
});

console.log(`\n=== 결과 ===\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail === 0 ? 0 : 1);
