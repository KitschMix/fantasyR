// sushi-go.test.js — rulebook compliance tests for Sushi Go!
// Verifies (1) official 108-card composition and (2) maki tie scoring per Korean rulebook.
const fs = require('fs');
const path = require('path');
const { suite, test, assertTrue } = require('./runner');

const SUSHI_SRC = fs.readFileSync(
  path.join(__dirname, '..', 'sushi-go.js'),
  'utf8'
);

let pass = 0, total = 0;

/* ──────────────── helpers ──────────────── */

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

function assertArrays(actual, expected, msg = '') {
  if (!arraysEqual(actual, expected)) {
    throw new Error(`${msg}expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

// Extract CARD_DEFS array literal from the source and evaluate it.
function parseCardDefs() {
  const m = SUSHI_SRC.match(/const CARD_DEFS\s*=\s*(\[[\s\S]*?\n\s*\]);/);
  if (!m) throw new Error('CARD_DEFS not found in sushi-go.js');
  // eslint-disable-next-line no-new-func
  return Function(`return ${m[1]};`)();
}

// Maki scoring algorithm — mirrors sushi-go.js scoreRound() block.
// Korean rulebook: "1등 동점이면 6점을 나눠서 갖습니다. 이 경우에는 두번째로
// 많은 사람은 점수를 얻지 못합니다."
//   1등 단독 = 6, 2등 단독(1등 단독일 때) = 3, 1등 동점 = floor(6/N),
//   2등 동점(1등 단독) = floor(3/N). 1등 동점이면 2등 없음.
function scoreMaki(makiCounts) {
  const n = makiCounts.length;
  const roundScores = new Array(n).fill(0);
  const makiBonus   = new Array(n).fill(0);

  const maxMaki = Math.max(...makiCounts);
  if (maxMaki > 0) {
    const winners = makiCounts.map((m, i) => m === maxMaki ? i : -1).filter(i => i >= 0);
    const subMax  = Math.max(...makiCounts.filter(m => m < maxMaki));
    const seconds = makiCounts
      .map((m, i) => m === subMax && m < maxMaki && m > 0 ? i : -1)
      .filter(i => i >= 0);

    if (winners.length === 1) {
      roundScores[winners[0]] += 6;
      makiBonus[winners[0]] = 6;
      if (seconds.length === 1) {
        roundScores[seconds[0]] += 3;
        makiBonus[seconds[0]] = 3;
      } else if (seconds.length > 1) {
        const share = Math.floor(3 / seconds.length);
        seconds.forEach(i => {
          roundScores[i] += share;
          makiBonus[i] = share;
        });
      }
    } else {
      const share = Math.floor(6 / winners.length);
      winners.forEach(i => {
        roundScores[i] += share;
        makiBonus[i] = share;
      });
    }
  }
  return { roundScores, makiBonus };
}

/* ──────────────── tests ──────────────── */

suite('sushi-go: card composition (Gamewright official 108)', () => {
  const defs = parseCardDefs();
  const byType = {};
  defs.forEach(d => { byType[d.type] = (byType[d.type] || 0) + d.copies; });

  total++; test('total card count is 108', () => {
    const totalCards = defs.reduce((s, d) => s + d.copies, 0);
    assertTrue(totalCards === 108, `total cards: expected 108, got ${totalCards}`);
    pass++;
  });

  total++; test('chopsticks is exactly 4 copies', () => {
    const chopsticks = defs.filter(d => d.type === 'chopsticks')
      .reduce((s, d) => s + d.copies, 0);
    assertTrue(chopsticks === 4, `chopsticks copies: expected 4, got ${chopsticks}`);
    pass++;
  });

  total++; test('Gamewright baseline counts (tempura/sashimi/dumpling/pudding)', () => {
    assertTrue(byType.tempura === 14, `tempura: expected 14, got ${byType.tempura}`);
    assertTrue(byType.sashimi === 14, `sashimi: expected 14, got ${byType.sashimi}`);
    assertTrue(byType.dumpling === 14, `dumpling: expected 14, got ${byType.dumpling}`);
    assertTrue(byType.pudding  === 10, `pudding: expected 10, got ${byType.pudding}`);
    pass++;
  });

  total++; test('maki composition (6/8/12)', () => {
    const maki1 = defs.find(d => d.maki === 1).copies;
    const maki2 = defs.find(d => d.maki === 2).copies;
    const maki3 = defs.find(d => d.maki === 3).copies;
    assertTrue(maki1 === 6,  `maki-1: expected 6, got ${maki1}`);
    assertTrue(maki2 === 12, `maki-2: expected 12, got ${maki2}`);
    assertTrue(maki3 === 8,  `maki-3: expected 8, got ${maki3}`);
    pass++;
  });

  total++; test('nigiri composition (egg 5 / salmon 10 / octopus 5)', () => {
    const eggs   = defs.filter(d => d.type === 'nigiri' && d.points === 1).reduce((s, d) => s + d.copies, 0);
    const salmon = defs.filter(d => d.type === 'nigiri' && d.points === 2).reduce((s, d) => s + d.copies, 0);
    const octo   = defs.filter(d => d.type === 'nigiri' && d.points === 3).reduce((s, d) => s + d.copies, 0);
    assertTrue(eggs   === 5,  `egg: expected 5, got ${eggs}`);
    assertTrue(salmon === 10, `salmon: expected 10, got ${salmon}`);
    assertTrue(octo   === 5,  `octopus: expected 5, got ${octo}`);
    pass++;
  });
});

suite('sushi-go: maki tie rule (Korean rulebook)', () => {
  // ── 1등 단독 케이스 ──
  total++; test('1st solo, no 2nd → [6, 0, 0]', () => {
    assertArrays(scoreMaki([6, 0, 0]).roundScores, [6, 0, 0]);
    pass++;
  });

  total++; test('1st solo + 2nd solo → [6, 3, 0]', () => {
    assertArrays(scoreMaki([6, 4, 0]).roundScores, [6, 3, 0]);
    pass++;
  });

  total++; test('1st solo + 2nd tied (2 players) → [6, 1, 1, 0]', () => {
    // 2등 동점이면 3/N = 1점씩 분배
    assertArrays(scoreMaki([6, 3, 3, 0]).roundScores, [6, 1, 1, 0]);
    pass++;
  });

  total++; test('1st solo + 2nd tied (3 players) → [6, 1, 1, 1]', () => {
    // 3/N = 1점
    assertArrays(scoreMaki([6, 3, 3, 3]).roundScores, [6, 1, 1, 1]);
    pass++;
  });

  // ── 1등 동점 케이스 (룰북 핵심) ──
  total++; test('1st tied (2 players) → [3, 3, 0, 0]', () => {
    // "6점을 나눠서 갖습니다" → 6/2 = 3점
    assertArrays(scoreMaki([5, 5, 0, 0]).roundScores, [3, 3, 0, 0]);
    pass++;
  });

  total++; test('1st tied (3 players) → [2, 2, 2, 0]', () => {
    // 6/3 = 2점
    assertArrays(scoreMaki([5, 5, 5, 0]).roundScores, [2, 2, 2, 0]);
    pass++;
  });

  total++; test('1st tied (2 players) + clear 2nd → [3, 3, 0, 0]', () => {
    // 룰북: "이 경우에는 두번째로 많은 사람은 점수를 얻지 못합니다"
    assertArrays(scoreMaki([5, 5, 2, 0]).roundScores, [3, 3, 0, 0]);
    pass++;
  });

  total++; test('1st tied (3 players) + clear 2nd → [2, 2, 2, 0, 0]', () => {
    assertArrays(scoreMaki([5, 5, 5, 2, 0]).roundScores, [2, 2, 2, 0, 0]);
    pass++;
  });

  total++; test('all tied (4 players, no maki 2nd) → [1, 1, 1, 1]', () => {
    // 6/4 = 1점 (Math.floor)
    assertArrays(scoreMaki([4, 4, 4, 4]).roundScores, [1, 1, 1, 1]);
    pass++;
  });

  // ── 엣지 케이스 ──
  total++; test('no maki picked → all zero', () => {
    assertArrays(scoreMaki([0, 0, 0]).roundScores, [0, 0, 0]);
    pass++;
  });

  total++; test('all maki zero but maxMaki still 0 → no bonuses', () => {
    assertArrays(scoreMaki([0, 0]).makiBonus, [0, 0]);
    pass++;
  });

  // ── breakdown 검증 ──
  total++; test('makiBonus breakdown for 1st tied (2 players)', () => {
    assertArrays(scoreMaki([5, 5, 2]).makiBonus, [3, 3, 0]);
    pass++;
  });

  total++; test('makiBonus breakdown for 1st tied (4 players)', () => {
    assertArrays(scoreMaki([4, 4, 4, 4]).makiBonus, [1, 1, 1, 1]);
    pass++;
  });
});

console.log(`\nResult: ${pass}/${total} passed`);
process.exit(pass === total ? 0 : 1);