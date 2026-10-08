const { suite, test, assertEqual, assertTrue } = require('./runner');
const { loadClue } = require('./clue-harness');
let pass = 0, total = 0;
const game = loadClue();
const engine = game.ClueAI;
const check = (name, fn) => { total++; test(name, () => { fn(); pass++; }); };
const key = (c) => [c.suspect.id, c.weapon.id, c.room.id].join('|');

function fixture() {
  const cards = ['suspect', 'weapon', 'room'].flatMap((type) =>
    ['A', 'B', 'C'].map((name) => ({ id: `${type}:${name}`, type, name })));
  return {
    cards, observerId: 'self', ownCards: ['suspect:A', 'weapon:A'],
    knownCards: ['suspect:A', 'weapon:A'], observations: [], evidence: [],
    players: ['self', 'one', 'two'].map((id) => ({ id, cardCount: 2, location: 'center', eliminated: false }))
  };
}
function record(playerId, cardIds, passedIds, refuterId = null) {
  return { playerId, cardIds, passedIds, refuterId, complete: true };
}

// Independent exhaustive deal enumeration for a small, fully specified deck.
function oracle(view) {
  const result = new Set();
  const assignment = new Map();
  const remaining = new Map(view.players.map((p) => [p.id, p.cardCount]));
  const envelope = new Set();
  const observed = new Map(view.observations);
  const own = new Set(view.ownCards);
  function visit(i) {
    if (i === view.cards.length) {
      if ([...remaining.values()].some((n) => n !== 0) || envelope.size !== 3) return;
      for (const e of view.evidence) {
        if (e.passedIds.some((id) => e.cardIds.some((c) => assignment.get(c) === id))) return;
        if (e.refuterId && !e.cardIds.some((c) => assignment.get(c) === e.refuterId)) return;
      }
      result.add(['suspect', 'weapon', 'room'].map((type) => view.cards.find((c) => c.type === type && assignment.get(c.id) === 'envelope').id).join('|'));
      return;
    }
    const c = view.cards[i];
    const owners = own.has(c.id) ? [view.observerId] : view.players.filter((p) => p.id !== view.observerId).map((p) => p.id).concat('envelope');
    for (const owner of owners) {
      if (observed.has(c.id) && observed.get(c.id) !== owner) continue;
      if (owner === 'envelope') {
        if (envelope.has(c.type) || view.knownCards.includes(c.id)) continue;
        envelope.add(c.type);
      } else {
        if (!remaining.get(owner)) continue;
        remaining.set(owner, remaining.get(owner) - 1);
      }
      assignment.set(c.id, owner);
      visit(i + 1);
      if (owner === 'envelope') envelope.delete(c.type);
      else remaining.set(owner, remaining.get(owner) + 1);
    }
  }
  visit(0);
  return result;
}

suite('clue: 공개 반박 기록과 비공개 정보 경계', () => {
  check('아무도 반박하지 못한 추리에서 자기 카드는 정답으로 오인하지 않음', () => {
    const view = fixture();
    view.evidence.push(record('self', ['suspect:A', 'weapon:A', 'room:C'], ['one', 'two']));
    for (const difficulty of ['hard', 'expert', 'boss']) {
      const result = engine.analyze(view, difficulty);
      assertTrue(result.combos.length > 1);
      assertTrue(result.combos.every((c) => c.room.id === 'room:C' && c.suspect.id !== 'suspect:A' && c.weapon.id !== 'weapon:A'));
    }
  });

  check('카드를 보여줬다는 사실은 세 카드 중 하나를 보유했다는 제약으로 사용', () => {
    const view = fixture();
    view.evidence.push(record('self', ['suspect:B', 'weapon:B', 'room:A'], [], 'one'));
    const result = engine.analyze(view, 'expert');
    assertTrue(result.combos.length > 1);
    assertTrue(!result.combos.some((c) => key(c) === 'suspect:B|weapon:B|room:A'));
    assertTrue(result.combos.some((c) => c.suspect.id === 'suspect:B'));
  });

  check('작은 덱의 모든 합법 배치와 대조: 정답 누락 없음, 보스는 정확한 후보 집합', () => {
    const variants = [fixture(), fixture(), fixture(), fixture()];
    variants[1].evidence.push(record('self', ['suspect:B', 'weapon:B', 'room:A'], [], 'one'));
    variants[2].evidence.push(record('self', ['suspect:A', 'weapon:A', 'room:C'], ['one', 'two']));
    variants[2].observations.push(['suspect:B', 'one']);
    variants[3].evidence.push(
      record('self', ['suspect:B', 'weapon:B', 'room:A'], [], 'one'),
      record('one', ['suspect:C', 'weapon:B', 'room:B'], ['self'], 'two'),
      record('two', ['suspect:A', 'weapon:C', 'room:C'], ['one'], 'self')
    );
    for (const view of variants) {
      const expected = oracle(view);
      assertTrue(expected.size > 0);
      for (const difficulty of ['hard', 'expert', 'boss']) {
        const actual = new Set(engine.analyze(view, difficulty).combos.map(key));
        assertTrue([...expected].every((c) => actual.has(c)), `${difficulty}: legal solution removed`);
        if (difficulty === 'boss') assertEqual([...actual].sort().join(','), [...expected].sort().join(','));
      }
    }
  });

  check('같은 제안의 반복만으로 후보나 위험도가 바뀌지 않음', () => {
    const view = fixture();
    const original = engine.analyze(view, 'expert').combos;
    const risk = engine.opponentRisk(view, original);
    for (let i = 0; i < 10; i++) view.evidence.push({ ...record('one', ['suspect:B', 'weapon:B', 'room:A'], []), complete: false });
    assertEqual(engine.analyze(view, 'expert').combos.map(key).join(','), original.map(key).join(','));
    assertEqual(engine.opponentRisk(view, original), risk);
  });

  check('모순된 기록에서는 정답 확정으로 오인하지 않고 고발 보류', () => {
    const view = fixture();
    view.observations.push(['suspect:A', 'one']);
    const result = engine.analyze(view, 'boss');
    assertTrue(result.inconsistent);
    assertTrue(!engine.decide(view, result.combos, { gain: 0 }).accuse);
  });
});

suite('clue: 고발과 추가 조사 사이의 판단', () => {
  const view = fixture();
  const byId = (id) => view.cards.find((c) => c.id === id);
  const combos = ['B', 'C'].map((name) => ({ suspect: byId(`suspect:${name}`), weapon: byId('weapon:C'), room: byId('room:C') }));

  check('안전하고 유용한 조사 가능: 후보 2개에서도 기다림', () => {
    assertTrue(!engine.decide(view, combos, { gain: 0.5 }).accuse);
  });
  check('상대의 반박 없는 추리 + CLUE 진입: 후보 2~3개여도 먼저 고발', () => {
    const danger = JSON.parse(JSON.stringify(view));
    danger.players[1].location = 'clue';
    danger.evidence.push(record('one', ['suspect:B', 'weapon:C', 'room:C'], ['two', 'self']));
    assertTrue(engine.decide(danger, combos, { gain: 0.5 }).accuse);
    assertTrue(engine.decide(danger, combos.concat({ ...combos[0], room: byId('room:B') }), { gain: 0.5 }).accuse);
  });
  check('추가 정보 가치가 없으면 확정될 때까지 무한 대기하지 않음', () => {
    assertTrue(engine.decide(view, combos, { gain: 0 }).accuse);
  });
  check('확정이면 즉시 고발, 후보가 너무 많으면 성급한 고발 보류', () => {
    assertTrue(engine.decide(view, [combos[0]], { gain: 1 }).accuse);
    assertTrue(!engine.decide(view, engine.analyze(view, 'expert').combos, { gain: 0 }).accuse);
  });
  check('조사 제안은 자신의 카드를 활용해 남은 용의자를 구별', () => {
    const plan = engine.researchPlan(view, combos, [byId('room:A')], 'expert');
    assertTrue(plan.gain > 0);
    assertEqual(plan.suggestion.weapon.id, 'weapon:A');
    assertTrue(['suspect:B', 'suspect:C'].includes(plan.suggestion.suspect.id));
  });
});

suite('clue: 실제 게임 연결', () => {
  check('반박 순서 기록, 비공개 카드 전달, 새 게임 초기화', () => {
    game.playerCountSelect.value = '3';
    game.difficultySelect.value = 'expert';
    game.ClueGame.start();
    const api = game.clueTest;
    const [human, first, second] = api.state.players;
    const suggestion = api.state.solution;
    api.resolveSuggestion(1, suggestion);
    const entry = api.state.deductionHistory[0];
    assertEqual(entry.passedIds.join(','), `${second.id},${human.id}`);
    assertTrue(entry.complete && !entry.refuterId);
    const shown = second.hand[0];
    api.announceShownCard(second, first, shown, false);
    assertEqual(first.observedOwners.get(shown.id), second.id);
    assertTrue(!human.observedOwners.has(shown.id));
    game.ClueGame.start();
    assertEqual(api.state.deductionHistory.length, 0);
    assertTrue(api.state.players.every((p) => p.observedOwners.size === 0));
  });

  check('고발/조사 판단이 정답 봉투와 상대 비공개 카드·지식을 읽지 않음', () => {
    game.difficultySelect.value = 'expert';
    game.ClueGame.start();
    const api = game.clueTest;
    const player = api.state.players[1];
    const solution = api.state.solution;
    Object.defineProperty(api.state, 'solution', { configurable: true, get() { throw new Error('solution read'); } });
    const originals = api.state.players.filter((p) => p !== player).map((p) => ({ p, hand: p.hand, known: p.known }));
    for (const { p, hand } of originals) {
      p.hand = new Proxy(hand, { get(target, property) { if (property === 'length') return target.length; throw new Error('hidden hand read'); } });
      Object.defineProperty(p, 'known', { configurable: true, get() { throw new Error('private knowledge read'); } });
    }
    try {
      const result = api.aiDeductions(player);
      assertTrue(result.combos.length > 0);
      api.buildAiAccusation(player);
      api.aiSuggestion(player, { id: 'bedroom', name: '침실' });
    } finally {
      Object.defineProperty(api.state, 'solution', { configurable: true, writable: true, value: solution });
      for (const { p, hand, known } of originals) {
        p.hand = hand;
        Object.defineProperty(p, 'known', { configurable: true, writable: true, value: known });
      }
    }
  });

  check('3~6명 실제 배분: 모든 고난도 분석이 실제 정답을 후보에 유지', () => {
    for (const count of [3, 4, 5, 6]) {
      game.playerCountSelect.value = String(count);
      game.ClueGame.start();
      const api = game.clueTest;
      const player = api.state.players[1];
      const view = api.aiEvidenceView(player);
      for (const difficulty of ['hard', 'expert', 'boss']) {
        const result = engine.analyze(view, difficulty);
        assertTrue(result.combos.some((c) => key(c) === key(api.state.solution)));
      }
    }
  });

  check('24회 추리 재생: 비공개 반박 후에도 정답 유지, 보스의 추가 추론 확인', () => {
    const replay = loadClue();
    replay.difficultySelect.value = 'expert';
    replay.playerCountSelect.value = '6';
    replay.ClueGame.start();
    const api = replay.clueTest;
    let deeperDeductions = 0;
    for (let turn = 0; turn < 24; turn++) {
      const player = api.state.players[1 + turn % 5];
      api.state.currentPlayer = api.state.players.indexOf(player);
      const suggestion = turn % 2
        ? api.aiSuggestion(player, { id: 'bedroom', name: '침실' })
        : {
          suspect: { id: 'suspect:스칼렛', name: '스칼렛', type: 'suspect' },
          weapon: { id: 'weapon:단검', name: '단검', type: 'weapon' },
          room: { id: 'room:서재', name: '서재', type: 'room' }
        };
      api.resolveSuggestion(api.state.currentPlayer, suggestion);
      if (api.state.pendingRefute) api.chooseHumanRefute(api.state.pendingRefute.matches[0].id);
      const view = api.aiEvidenceView(player);
      const expert = replay.ClueAI.analyze(view, 'expert');
      const boss = replay.ClueAI.analyze(view, 'boss');
      assertTrue(boss.combos.some((c) => key(c) === key(api.state.solution)));
      assertTrue(expert.combos.some((c) => key(c) === key(api.state.solution)));
      if (boss.combos.length < expert.combos.length) deeperDeductions++;
    }
    assertTrue(deeperDeductions > 0, 'boss should derive additional exclusions from ownership constraints');
  });
});

console.log(`\nResult: ${pass}/${total} passed`);
process.exit(pass === total ? 0 : 1);
