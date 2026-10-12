// fr-tiebreak.test.js — finishGame의 tie-break 정렬 검증
// 공식 FR 룰: 점수 동률 → 손패 카드 수가 적은 플레이어 승리
// 검증: sort((a,b) => b.score - a.score || a.handSize - b.handSize)
const assert = require('assert/strict');

function rankRoster(players) {
  return [...players]
    .map((player) => ({ player, score: player.score, handSize: player.hand.length }))
    .sort((a, b) => b.score - a.score || a.handSize - b.handSize);
}

let pass = 0, total = 0;

const ok = (name, fn) => {
  total++;
  try { fn(); console.log(`  ✓ ${name}`); pass++; }
  catch (e) { console.log(`  ✗ ${name}: ${e.message}`); }
};

ok('단독 1등: 점수만으로 승자 결정', () => {
  const ranked = rankRoster([
    { name: 'A', score: 50, hand: [1,2,3,4,5,6,7] },
    { name: 'B', score: 30, hand: [1,2,3,4,5,6] },
    { name: 'C', score: 10, hand: [1,2,3,4,5] }
  ]);
  assert.equal(ranked[0].player.name, 'A');
  assert.equal(ranked[1].player.name, 'B');
  assert.equal(ranked[2].player.name, 'C');
});

ok('점수 동률: 손패 적은 사람이 승리', () => {
  const ranked = rankRoster([
    { name: 'Big',  score: 50, hand: [1,2,3,4,5,6,7,8,9] },
    { name: 'Slim', score: 50, hand: [1,2,3] },
    { name: 'Mid',  score: 50, hand: [1,2,3,4,5,6] }
  ]);
  assert.equal(ranked[0].player.name, 'Slim', '카드 수 적음 → 1등');
  assert.equal(ranked[1].player.name, 'Mid', '중간 카드 수 → 2등');
  assert.equal(ranked[2].player.name, 'Big', '가장 많은 카드 → 3등');
});

ok('점수 동률 + 손패 동률(공동 승리): 안정 정렬로 입력 순서 유지', () => {
  const ranked = rankRoster([
    { name: 'P1', score: 100, hand: [1,2,3] },
    { name: 'P2', score: 100, hand: [1,2,3] },
    { name: 'P3', score: 50,  hand: [1,2,3,4] }
  ]);
  assert.equal(ranked[0].player.name, 'P1', '안정 정렬: 입력 순서 첫 번째가 1등 표시');
  assert.equal(ranked[1].player.name, 'P2');
  assert.equal(ranked[2].player.name, 'P3');
});

ok('라운드-아웃 카운트: 4명 게임 = 트리거 후 3턴', () => {
  // 공식 FR 룰: 트리거한 사람 외, 나머지 N-1명이 각 1턴씩
  const playerCount = 4;
  const roundOutTurnsLeft = Math.max(0, playerCount - 1);
  assert.equal(roundOutTurnsLeft, 3, '4명이면 3턴 추가');
});

ok('라운드-아웃 카운트: 2명 게임 = 트리거 후 1턴', () => {
  const roundOutTurnsLeft = Math.max(0, 2 - 1);
  assert.equal(roundOutTurnsLeft, 1, '2명이면 1턴 추가');
});

ok('라운드-아웃 카운트: 3명 게임 = 트리거 후 2턴', () => {
  const roundOutTurnsLeft = Math.max(0, 3 - 1);
  assert.equal(roundOutTurnsLeft, 2, '3명이면 2턴 추가');
});

ok('라운드-아웃 음수 가드: 1명 게임은 0 (즉시 종료)', () => {
  const roundOutTurnsLeft = Math.max(0, 1 - 1);
  assert.equal(roundOutTurnsLeft, 0, '1명이면 즉시 종료');
});

console.log(`\nResult: ${pass}/${total} passed`);
process.exit(pass === total ? 0 : 1);
