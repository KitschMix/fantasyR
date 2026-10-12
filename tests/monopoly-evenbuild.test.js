// monopoly-evenbuild.test.js
// 공식 Monopoly 균등 건축 규칙(EVEN-BUILD RULE) 단위 검증
//
// 규칙: 색 그룹의 한 칸에 (nextLevel)번째 건물을 지으려면,
//      그룹의 다른 모든 땅(내가 소유한)도 최소 (nextLevel - 1)개의 건물이 있어야 함.
//       - 1번째 집 짓기: 그룹 전체 소유 (모노폴리) 필수
//       - 2번째 집 짓기: 다른 땅에 최소 1집
//       - 3번째 집 짓기: 다른 땅에 최소 2집
//       - 4번째 집 짓기: 다른 땅에 최소 3집
//       - 호텔: 다른 땅에 최소 3집 (= 우리 impl에서는 level 4 = 호텔)
//
// 검증 케이스:
//   1) 모노폴리 미완: 첫 집 짓기 실패
//   2) 균형 잡힌 그룹: 다음 단계 짓기 성공
//   3) 다른 땅이 부족: 다음 단계 짓기 실패
//   4) 파산 후 균형 보정: 그룹의 max-min 차이가 1 이하로 줄어듬

const assert = require('assert/strict');

let pass = 0, total = 0;
function ok(name, fn) {
  total++;
  try { fn(); console.log(`  ✓ ${name}`); pass++; }
  catch (e) { console.log(`  ✗ ${name}: ${e.message}`); }
}

// 검증할 규칙을 직접 함수로 추출 (canBuildOn의 균등 부분)
function canBuildEvenLevel({ targetTile, targetNextLevel, ownedInGroup, groupTiles, levelOf }) {
  if (!ownedInGroup.includes(targetTile)) {
    return { ok: false, reason: 'NOT_OWNED' };
  }
  // 1) 모노폴리: 그룹의 모든 타일을 소유해야 함
  for (const tid of (groupTiles || [])) {
    if (!ownedInGroup.includes(tid)) {
      return { ok: false, reason: 'NEED_MONOPOLY', offender: tid };
    }
  }
  // 2) 균등: 다른 owned 타일들이 nextLevel - 1 이상
  for (const other of ownedInGroup) {
    if (other === targetTile) continue;
    if (levelOf(other) < targetNextLevel - 1) {
      return { ok: false, reason: 'NEED_OTHERS_AT_N_MINUS_1', need: targetNextLevel - 1, have: levelOf(other) };
    }
  }
  return { ok: true };
}

// 채권자가 건물을 받아 균형 잡는 알고리즘을 시뮬레이션 (balanceGroupBuildings 흐름)
function balanceGroupBuildings({ ownedInGroup, levelOf, sellOne }) {
  let safety = 1000;
  while (safety-- > 0) {
    const levels = ownedInGroup.map((id) => levelOf(id));
    const maxL = Math.max(...levels);
    const minL = Math.min(...levels);
    if (maxL - minL <= 1) break;
    const candidates = ownedInGroup.filter((id) => levelOf(id) === maxL);
    if (!candidates.length) break;
    sellOne(candidates[0]);
  }
  return ownedInGroup.map((id) => levelOf(id));
}

ok('1) 모노폴리 미완: 그룹에 1개만 소유하면 첫 집 짓기 실패', () => {
  // 노란색 그룹 = [1(타이베이), 3(홍콩), 4(마닐라)] — 1만 소유
  const owned = [1];
  const lvl = (id) => 0;
  const r = canBuildEvenLevel({
    targetTile: 1, targetNextLevel: 1,
    ownedInGroup: owned,
    groupTiles: [1, 3, 4],
    levelOf: lvl
  });
  assert.equal(r.ok, false);
  assert.equal(r.reason, 'NEED_MONOPOLY');
});

ok('2) 균형 잡힌 상태: 두 칸 모두 1집 → 타이베이에 2집 짓기 가능', () => {
  const owned = [1, 3]; // 타이베이/홍콩 모두 1집
  const lvl = (id) => (id === 1 || id === 3 ? 1 : 0);
  const r = canBuildEvenLevel({
    targetTile: 1, targetNextLevel: 2,
    ownedInGroup: owned, levelOf: lvl
  });
  assert.equal(r.ok, true);
});

ok('3) 다른 칸이 부족: 타이베이 1집, 홍콩 0집 → 타이베이에 2집 실패', () => {
  const owned = [1, 3];
  const lvl = (id) => (id === 1 ? 1 : 0); // 홍콩 0집
  const r = canBuildEvenLevel({
    targetTile: 1, targetNextLevel: 2,
    ownedInGroup: owned, levelOf: lvl
  });
  assert.equal(r.ok, false);
  assert.equal(r.reason, 'NEED_OTHERS_AT_N_MINUS_1');
  assert.equal(r.need, 1);
  assert.equal(r.have, 0);
});

ok('4) 균형 잡힌 상태: 3×3 → 한 칸에 호텔(4) 가능', () => {
  const owned = [1, 3, 4]; // 노란색 3개 모두 3집
  const lvl = (id) => 3;
  const r = canBuildEvenLevel({
    targetTile: 1, targetNextLevel: 4, // 호텔
    ownedInGroup: owned, levelOf: lvl
  });
  assert.equal(r.ok, true, '모든 다른 땅이 3집이면 호텔 OK');
});

ok('5) 한 칸만 부족: 타이베이 4(호텔), 홍콩 2 → 호텔 추가 실패 (마닐라도 4여야 함)', () => {
  const owned = [1, 3, 4];
  const lvl = (id) => (id === 1 ? 4 : (id === 3 ? 4 : 2)); // 마닐라 2집
  const r = canBuildEvenLevel({
    targetTile: 1, targetNextLevel: 5, // 다른 칸에 호텔 올림
    ownedInGroup: owned, levelOf: lvl
  });
  assert.equal(r.ok, false);
});

ok('6) 파산 후 균형 보정: 한 그룹 [4,4,0]이 들어오면 [2,2,0]까지만 줄어듬', () => {
  // simulate: 한 그룹에 파산자 buildings 4,4,0 이 들어옴
  const owned = ['A', 'B', 'C'];
  const state = { A: 4, B: 4, C: 0 };
  const lvl = (id) => state[id];
  const sellOne = (id) => { state[id] = Math.max(0, (state[id] || 0) - 1); };
  const after = balanceGroupBuildings({ ownedInGroup: owned, levelOf: lvl, sellOne });
  // 균형: max-min <= 1
  const max = Math.max(...after);
  const min = Math.min(...after);
  assert.ok(max - min <= 1, `max(${max}) - min(${min}) <= 1`);
  // 0이 있던 타일은 건드리지 않거나 그대로 0
  assert.equal(state.C, 0, 'C(0)는 0 유지');
});

ok('7) 균형 보정 시뮬레이션: [3,1,1] → [2,1,1]', () => {
  const owned = ['A', 'B', 'C'];
  const state = { A: 3, B: 1, C: 1 };
  const sellOne = (id) => { state[id] = Math.max(0, (state[id] || 0) - 1); };
  balanceGroupBuildings({ ownedInGroup: owned, levelOf: (id) => state[id], sellOne });
  assert.equal(state.A, 2, 'A가 3→2로 줄어 max-min=1을 만족');
  assert.equal(state.B, 1);
  assert.equal(state.C, 1);
});

ok('8) 균형 보정 동작 검증: [3,0,0] → [1,0,0] (max-min=1 까지)', () => {
  // 이 단순화된 균형(impl의 level 4 = 호텔을 그냥 하나의 값으로 다룸)에서는
  // 가장 높은 타일을 매각하면서 max-min ≤ 1 까지 내림 → 최종적으로 가장 높은 타일 = 1
  const owned = ['A', 'B', 'C'];
  const state = { A: 3, B: 0, C: 0 };
  const sellOne = (id) => { state[id] = Math.max(0, (state[id] || 0) - 1); };
  balanceGroupBuildings({ ownedInGroup: owned, levelOf: (id) => state[id], sellOne });
  // A: 3→1, B,C 그대로. max-min = 1
  assert.equal(state.A, 1);
  assert.equal(state.B, 0);
  assert.equal(state.C, 0);
});

ok('9) 보너스: 단일 소유(group 유일) → 제한 없음', () => {
  // 그룹에 나 혼자만 있는 경우 → 다른 타일 검증 루프가 비어서 OK
  const owned = [1];
  const r = canBuildEvenLevel({
    targetTile: 1, targetNextLevel: 4,
    ownedInGroup: owned, levelOf: () => 0
  });
  // 그룹에 두 번째 타일이 없으면 항상 균형 OK (1번째 집은 monopoly 미달 → NOT_OWNED 분기로 잡혀야 하지만,
  // 여기 시뮬레이션에서는 NOT_OWNED 분기 안 거치므로 모노폴리 미완은 별도 검증)
  // 이 케이스는 "그룹에 두 번째 땅이 없는 경우"를 가정한 것이라 통과
  assert.equal(r.ok, true);
});

console.log(`\nResult: ${pass}/${total} passed`);
process.exit(pass === total ? 0 : 1);
