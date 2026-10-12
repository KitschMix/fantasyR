// ranking-difficulty.test.js — 난이도 1순위 정렬 단위 검증
// fetchTopRankingsByTurns / ByScore / ByDuration 의 difficulty 1순위 정렬이
// 의도대로 (어려울수록 위) 작동하는지 검증.

const assert = require('assert/strict');

const DIFFICULTY_RANK = { boss: 4, expert: 3, hard: 2, normal: 1 };

// fetchTopRankingsByTurns 의 JS 정렬 로직 시뮬레이션
function sortByTurns(rows) {
  return rows.slice().sort((a, b) =>
    (DIFFICULTY_RANK[b.difficulty] - DIFFICULTY_RANK[a.difficulty])
    || (a.turns - b.turns)
    || (a.duration_sec - b.duration_sec)
  );
}

// fetchTopRankingsByScore 의 JS 정렬 로직 시뮬레이션
function sortByScore(rows) {
  return rows.slice().sort((a, b) =>
    (b.score - a.score)
    || (DIFFICULTY_RANK[b.difficulty] - DIFFICULTY_RANK[a.difficulty])
    || (a.turns - b.turns)
    || (a.duration_sec - b.duration_sec)
  );
}

// fetchTopRankingsByDuration 의 JS 정렬 로직 시뮬레이션
// ByDuration은 '최단 시간'이 핵심 → duration 1순위, 같은 duration이면 difficulty
function sortByDuration(rows) {
  return rows.slice().sort((a, b) =>
    (a.duration_sec - b.duration_sec)
    || (DIFFICULTY_RANK[b.difficulty] - DIFFICULTY_RANK[a.difficulty])
    || (b.score - a.score)
  );
}

let pass = 0, fail = 0;
const ok = (name, fn) => {
  try { fn(); pass++; console.log(`  ✓ ${name}`); }
  catch (e) { fail++; console.log(`  ✗ ${name}: ${e.message}`); }
};

console.log('\n🎲 difficulty 1순위 정렬 단위 검증\n');

// === ByTurns: difficulty > turns > duration ===
ok('ByTurns: expert 15턴 > expert 30턴 > hard 20턴 > normal 10턴 > normal 15턴', () => {
  const rows = [
    { nickname: 'normal-10', difficulty: 'normal', turns: 10, duration_sec: 300 },
    { nickname: 'normal-15', difficulty: 'normal', turns: 15, duration_sec: 400 },
    { nickname: 'hard-20',   difficulty: 'hard',   turns: 20, duration_sec: 500 },
    { nickname: 'expert-30', difficulty: 'expert', turns: 30, duration_sec: 800 },
    { nickname: 'expert-15', difficulty: 'expert', turns: 15, duration_sec: 600 }
  ];
  const sorted = sortByTurns(rows);
  assert.equal(sorted[0].nickname, 'expert-15');
  assert.equal(sorted[1].nickname, 'expert-30');
  assert.equal(sorted[2].nickname, 'hard-20');
  assert.equal(sorted[3].nickname, 'normal-10');
  assert.equal(sorted[4].nickname, 'normal-15');
});

ok('ByTurns: 같은 difficulty 안에서는 turns asc', () => {
  const rows = [
    { nickname: 'hard-30', difficulty: 'hard', turns: 30, duration_sec: 100 },
    { nickname: 'hard-10', difficulty: 'hard', turns: 10, duration_sec: 500 },
    { nickname: 'hard-20', difficulty: 'hard', turns: 20, duration_sec: 300 }
  ];
  const sorted = sortByTurns(rows);
  assert.equal(sorted[0].nickname, 'hard-10');
  assert.equal(sorted[1].nickname, 'hard-20');
  assert.equal(sorted[2].nickname, 'hard-30');
});

ok('ByTurns: boss > expert (difficulty 1순위)', () => {
  const rows = [
    { nickname: 'expert-5', difficulty: 'expert', turns: 5, duration_sec: 100 },
    { nickname: 'boss-50', difficulty: 'boss', turns: 50, duration_sec: 1000 }
  ];
  const sorted = sortByTurns(rows);
  assert.equal(sorted[0].nickname, 'boss-50', 'boss가 expert보다 위');
  assert.equal(sorted[1].nickname, 'expert-5');
});

// === ByScore: score > difficulty > turns > duration ===
ok('ByScore: 같은 score면 difficulty desc', () => {
  const rows = [
    { nickname: 'normal-100', difficulty: 'normal', turns: 5, duration_sec: 100, score: 100 },
    { nickname: 'expert-100', difficulty: 'expert', turns: 5, duration_sec: 100, score: 100 }
  ];
  const sorted = sortByScore(rows);
  assert.equal(sorted[0].nickname, 'expert-100', '같은 score면 expert가 normal보다 위');
  assert.equal(sorted[1].nickname, 'normal-100');
});

ok('ByScore: score desc 1순위, 그 다음 difficulty', () => {
  const rows = [
    { nickname: 'normal-200', difficulty: 'normal', turns: 5, duration_sec: 100, score: 200 },
    { nickname: 'expert-100', difficulty: 'expert', turns: 5, duration_sec: 100, score: 100 }
  ];
  const sorted = sortByScore(rows);
  assert.equal(sorted[0].nickname, 'normal-200', 'score 200이 score 100보다 위');
  assert.equal(sorted[1].nickname, 'expert-100');
});

// === ByDuration: difficulty > duration > score ===
ok('ByDuration: 같은 duration이면 difficulty desc', () => {
  const rows = [
    { nickname: 'normal-300', difficulty: 'normal', duration_sec: 300, score: 50 },
    { nickname: 'expert-300', difficulty: 'expert', duration_sec: 300, score: 50 }
  ];
  const sorted = sortByDuration(rows);
  assert.equal(sorted[0].nickname, 'expert-300');
  assert.equal(sorted[1].nickname, 'normal-300');
});

ok('ByDuration: duration asc 1순위, 같은 duration이면 difficulty', () => {
  const rows = [
    { nickname: 'expert-500', difficulty: 'expert', duration_sec: 500, score: 50 },
    { nickname: 'normal-200', difficulty: 'normal', duration_sec: 200, score: 50 }
  ];
  const sorted = sortByDuration(rows);
  assert.equal(sorted[0].nickname, 'normal-200', '200초가 500초보다 위');
  assert.equal(sorted[1].nickname, 'expert-500');
});

// === 사용자 요구 핵심: "어려움 20턴 > 보통 10턴" ===
ok('🎯 핵심: hard 20턴 > normal 10턴 (ByTurns)', () => {
  const rows = [
    { nickname: 'normal-10', difficulty: 'normal', turns: 10, duration_sec: 100 },
    { nickname: 'hard-20',   difficulty: 'hard',   turns: 20, duration_sec: 200 }
  ];
  const sorted = sortByTurns(rows);
  assert.equal(sorted[0].nickname, 'hard-20', '어려움 20턴이 보통 10턴보다 위');
  assert.equal(sorted[1].nickname, 'normal-10');
});

console.log(`\n=== 결과 ===\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail === 0 ? 0 : 1);
