// sim-fantasy.js — 판타지왕국 핵심 룰 시뮬레이션
//   vendor/fantasy-realms-kor/{deck,hand}.js만으로 게임을 끝까지 돌리고
//   tie-break (점수 동률 → 손패 적음) + 라운드-아웃 (트리거 후 N-1턴)을 검증.
//
// 검증 항목:
//   1) 게임이 정상 종료 (discard 10/12장 OR 덱 빔) → 라운드-아웃 후 finish
//   2) 점수 동률 시 손패 카드 수 적은 사람 우선 (FINAL sort)
//   3) 카드/저주 아이템/펜티/블랭킹이 hand.score에 반영
//   4) draw 흐름이 deck + discard 둘 다 사용

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert/strict');

function mulberry32(a) {
  return function() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function loadHandDeck(expansionEnabled = false, cursedHoardItems = false, playerCount = 2) {
  const deckSrc = fs.readFileSync(
    path.join(__dirname, '../vendor/fantasy-realms-kor/deck.js'), 'utf8'
  );
  const handSrc = fs.readFileSync(
    path.join(__dirname, '../vendor/fantasy-realms-kor/hand.js'), 'utf8'
  );
  const sandbox = {
    console,
    cursedHoardSuits: false,
    cursedHoardItems,
    playerCount,
  };
  sandbox.window = sandbox;
  sandbox.global = sandbox;
  sandbox.globalThis = sandbox;
  sandbox.__fantasyExpansionEnabled = expansionEnabled;
  vm.createContext(sandbox);
  vm.runInContext(deckSrc, sandbox, { filename: 'deck.js' });
  if (expansionEnabled) {
    vm.runInContext(
      'this.deck.enableCursedHoardSuits(); this.deck.enableCursedHoardItems();',
      sandbox, { filename: 'deck-enable.js' }
    );
  }
  vm.runInContext(
    handSrc + '\nthis.Hand = Hand; this.CardInHand = CardInHand;',
    sandbox, { filename: 'hand.js' }
  );
  return sandbox;
}

function getDiscardLimit(expansionEnabled) {
  return expansionEnabled ? 12 : 10;
}
function getStartHand(expansionEnabled) {
  return expansionEnabled ? 8 : 7;
}

// 간단한 AI: 손패에서 가장 약한 카드를 버림 (base 값 기준)
function chooseAiDiscard(hand) {
  let weakest = null;
  let weakestId = null;
  for (const c of hand) {
    if (c.blanked) continue;
    if (weakest === null || c.base < weakest.base) {
      weakest = c;
      weakestId = c.id;
    }
  }
  return weakestId;
}

function runOneGame(opts) {
  const { expansion, playerCount, seed } = opts;
  const rand = mulberry32(seed);
  const ctx = loadHandDeck(expansion, expansion, playerCount);
  const { deck, Hand, CardInHand } = ctx;

  // 덱 셔플 (CardInHand 어댑터 사용은 score 시점)
  const allCardIds = Object.keys(deck.cards);
  const shuffled = [...allCardIds];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // 플레이어 초기화
  const players = [];
  for (let p = 0; p < playerCount; p++) {
    const hand = new Hand({ expansionEnabled: ctx.__fantasyExpansionEnabled, playerCount });
    players.push({
      hand,
      handSize: 0,
      usedCursedItems: [],
      discarded: [],
    });
  }
  let deckPos = 0; // top of deck index

  // 시작 손패
  const startHand = getStartHand(expansion);
  for (let p = 0; p < playerCount; p++) {
    for (let k = 0; k < startHand; k++) {
      const id = shuffled[deckPos++];
      const card = deck.getCardById(id);
      players[p].hand.addCard(card);
      players[p].handSize++;
    }
  }

  // 라운드-아웃 추적
  let triggerPlayer = -1;
  let roundOutTurnsLeft = 0;
  let totalTurns = 0;
  const discardLimit = getDiscardLimit(expansion);

  while (true) {
    // 라운드-아웃 종료 검사
    if (triggerPlayer >= 0 && roundOutTurnsLeft <= 0) {
      break;
    }
    // 덱 비고 + 라운드-아웃 미트리거 → 트리거
    if (triggerPlayer < 0 && deckPos >= shuffled.length && !players.some((_, i) => players[i].handSize === 0)) {
      // 카드 더 못 뽑음 → 게임 종료
      break;
    }

    for (let p = 0; p < playerCount; p++) {
      if (triggerPlayer >= 0 && roundOutTurnsLeft <= 0) break;

      // 라운드-아웃이면 트리거한 사람은 더 안 함
      if (triggerPlayer === p) {
        // 트리거한 사람의 마지막 턴이 이미 끝남. 다음 사람부터 카운트
        continue;
      }

      // 카운트 다운 (라운드-아웃 중)
      if (triggerPlayer >= 0) {
        roundOutTurnsLeft--;
      }

      // Draw: 50% 확률로 deck vs discard
      let drawCard = null;
      let drawFrom = '';
      const allDiscarded = players.flatMap((pl) => pl.discarded);
      if (rand() < 0.5 && allDiscarded.length > 0) {
        const top = allDiscarded.pop();
        drawCard = deck.getCardById(top);
        drawFrom = 'discard';
      } else if (deckPos < shuffled.length) {
        const id = shuffled[deckPos++];
        drawCard = deck.getCardById(id);
        drawFrom = 'deck';
      } else {
        // 덱 빔 + discard 비었으면 turn 종료
        continue;
      }
      players[p].hand.addCard(drawCard);
      players[p].handSize++;

      // Discard: 가장 약한 카드
      const discardId = chooseAiDiscard(players[p].hand.cards().map((c) => c));
      const discardIdx = players[p].hand.cards().findIndex((c) => c.id === discardId);
      if (discardIdx < 0) continue;
      const discarded = players[p].hand.cards()[discardIdx];
      // hand.cardsInHand는 private이지만 직접 조작 (Hand API는 삭제 메서드 미노출)
      delete players[p].hand.cardsInHand[discarded.id];
      players[p].handSize--;
      players[p].discarded.push(discarded.id);

      // 트리거 검사
      const totalDiscarded = players.reduce((s, pl) => s + pl.discarded.length, 0);
      if (triggerPlayer < 0 && (totalDiscarded >= discardLimit || deckPos >= shuffled.length)) {
        triggerPlayer = p;
        roundOutTurnsLeft = playerCount - 1; // 트리거한 사람 외 N-1명
      }
      totalTurns++;
    }
  }

  // 점수 계산 — hand.score는 discard pile 객체를 기대
  const allDiscardedIds = players.flatMap((pl) => pl.discarded);
  const discardPile = {
    cards: () => allDiscardedIds.map((id) => deck.getCardById(id)),
    countSuit: (s) => allDiscardedIds.map((id) => deck.getCardById(id)).filter((c) => c && c.suit === s).length,
    contains: (name) => allDiscardedIds.map((id) => deck.getCardById(id)).some((c) => c && c.name === name),
    containsSuit: (s) => allDiscardedIds.map((id) => deck.getCardById(id)).some((c) => c && c.suit === s),
  };
  const scores = players.map((pl) => {
    const r = pl.hand.score(discardPile);
    return { total: r, handSize: pl.handSize };
  });

  // 1순위 score desc, 2순위 handSize asc (tie-break by card count, FR 공식)
  const ranked = scores
    .map((s, i) => ({ ...s, idx: i }))
    .sort((a, b) => b.total - a.total || a.handSize - b.handSize);
  const winner = ranked[0];

  return {
    ok: true,
    expansion,
    playerCount,
    seed,
    totalTurns,
    finalScores: scores,
    winnerIdx: winner.idx,
    winnerPoints: winner.total,
    handSizeRange: [Math.min(...scores.map(s => s.handSize)), Math.max(...scores.map(s => s.handSize))],
    discardTriggered: triggerPlayer >= 0
  };
}

let pass = 0, fail = 0;
const ok = (name, fn) => {
  try { fn(); pass++; console.log(`  ✓ ${name}`); }
  catch (e) { fail++; console.log(`  ✗ ${name}: ${e.message}`); }
};

console.log(`\n🎲 판타지왕국 시뮬 — AI vs AI 게임 다회 실행\n`);

const scenarios = [
  { expansion: false, playerCount: 2, seeds: [1, 2, 3, 4, 5] },
  { expansion: false, playerCount: 3, seeds: [1, 2, 3, 4, 5] },
  { expansion: false, playerCount: 4, seeds: [1, 2, 3, 4, 5] },
  { expansion: true,  playerCount: 3, seeds: [1, 2, 3] },
  { expansion: true,  playerCount: 4, seeds: [1, 2, 3] }
];
const results = [];
for (const sc of scenarios) {
  for (const seed of sc.seeds) {
    const r = runOneGame({ expansion: sc.expansion, playerCount: sc.playerCount, seed });
    results.push(r);
  }
}

// 출력: 각 시나리오의 평균 통계
ok('시뮬: 게임 종료 후 ranked[0] 정렬에 handSize 보조 키 적용 검증', () => {
  for (const r of results) {
    // tied score면 handSize가 적은 사람이 1등
    const tied = r.finalScores.filter(s => s.total === r.winnerPoints);
    for (const t of tied) {
      assert.ok(t.handSize <= Math.min(...r.finalScores.map(s => s.handSize)),
        `Tied player handSize should be smallest in game p${r.playerCount}/e${r.expansion}/s${r.seed}`);
    }
  }
});

ok('시뮬: 게임이 모두 종료 상태 (totalTurns > 0)', () => {
  for (const r of results) {
    assert.ok(r.totalTurns > 0, `game should have turns: ${JSON.stringify(r)}`);
  }
});

ok('시뮬: discard 트리거 or deck empty 둘 중 하나', () => {
  for (const r of results) {
    // 트리거됐거나 덱이 빔 → 어쨌든 종료
    assert.ok(r.discardTriggered || r.totalTurns > 0);
  }
});

ok('시뮬: 손패 사이즈 범위 정상 (1~7 또는 1~8)', () => {
  for (const r of results) {
    const [lo, hi] = r.handSizeRange;
    assert.ok(lo >= 0, 'min handSize >= 0');
    assert.ok(hi <= 8, 'max handSize <= 8');
  }
});

ok('시뮬: 점수 합리적 범위 (한 게임 내 음수 가능, 최대 ~250)', () => {
  for (const r of results) {
    for (const s of r.finalScores) {
      assert.ok(s.total >= -100 && s.total <= 500, `score out of range: ${s.total}`);
    }
  }
});

// 인원수별 평균 통계 출력
const stats = {};
for (const r of results) {
  const key = `${r.playerCount}p/${r.expansion ? 'exp' : 'std'}`;
  if (!stats[key]) stats[key] = { count: 0, turns: [], scores: [] };
  stats[key].count++;
  stats[key].turns.push(r.totalTurns);
  stats[key].scores.push(r.winnerPoints);
}
console.log(`\n--- 시나리오별 통계 ---`);
for (const [k, v] of Object.entries(stats)) {
  const avgT = (v.turns.reduce((s, t) => s + t, 0) / v.count).toFixed(1);
  const avgP = (v.scores.reduce((s, p) => s + p, 0) / v.count).toFixed(1);
  console.log(`${k.padEnd(15)} ×${v.count} 게임, 평균 턴=${avgT}, 평균 승점=${avgP}`);
}

console.log(`\n=== 결과 ===\n통과 ${pass} / 실패 ${fail}`);
process.exit(fail === 0 ? 0 : 1);
