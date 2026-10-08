const { suite, test, assertEqual, assertTrue } = require('./runner');
const { loadClue } = require('./clue-harness');
let pass = 0, total = 0;
const check = (name, fn) => { total++; test(name, () => { fn(); pass++; }); };

function setup() {
  const game = loadClue();
  const toasts = [], results = [];
  game.window.showCenterToast = (message, duration, options) => toasts.push({ message, ...options });
  game.window.FANTASY_PLAYER_STATS = { recordGame: (result) => results.push(result) };
  game.playerCountSelect.value = '3';
  game.ClueGame.start();
  toasts.length = 0;
  return { game, api: game.clueTest, toasts, results };
}
function finishReveal(game, api) {
  game.clock.advance(5000);
  api.dismissClueEvent();
}

suite('clue: 최종 발표 후 결과 표시', () => {
  for (const index of [0, 1]) {
    check(`${index === 0 ? '사람' : 'AI'} 승리: 고발 → 정답 공개 → 승리 순서`, () => {
      const { game, api, toasts, results } = setup();
      const player = api.state.players[index];
      api.state.currentPlayer = index;
      api.presentFinalAccusation(player, api.state.solution);
      assertTrue(api.state.currentEvent.title.endsWith('최종 고발'));
      assertEqual(api.state.phase, 'reveal');
      assertEqual(toasts.length, 0);
      assertEqual(results.length, 0);
      assertTrue(!api.state.log.some((line) => line.includes('승리')));
      api.dismissClueEvent();
      assertTrue(api.state.currentEvent.title.endsWith('최종 고발'), 'early click must not skip cards');
      finishReveal(game, api);
      assertEqual(api.state.currentEvent.title, '사건 봉투 공개');
      assertTrue(!api.state.currentEvent.actor, 'no victory dialogue during reveal');
      assertEqual(toasts.length, 0);
      assertEqual(results.length, 0);
      game.clock.advance(4999);
      api.dismissClueEvent();
      assertEqual(api.state.currentEvent.title, '사건 봉투 공개');
      assertTrue(!api.state.log.some((line) => line.includes('승리')));
      game.clock.advance(1);
      api.dismissClueEvent();
      assertTrue(api.state.currentEvent.title.endsWith('승리'));
      assertEqual(api.state.phase, 'finished');
      assertEqual(toasts.filter((t) => t.mode === 'clue-finish').length, 1);
      assertEqual(results.length, player.human ? 1 : 0);
      api.dismissClueEvent();
      api.dismissClueEvent();
      assertEqual(toasts.filter((t) => t.mode === 'clue-finish').length, 1);
    });
  }

  check('앞선 이벤트가 남아 있으면 고발과 승리 모두 차례를 기다림', () => {
    const { game, api, toasts } = setup();
    api.queueClueEvent({ title: '이전 발표' });
    api.presentFinalAccusation(api.state.players[0], api.state.solution);
    assertEqual(api.state.currentEvent.title, '이전 발표');
    assertEqual(toasts.length, 0);
    api.dismissClueEvent();
    assertTrue(api.state.currentEvent.title.endsWith('최종 고발'));
    finishReveal(game, api);
    assertEqual(api.state.currentEvent.title, '사건 봉투 공개');
    finishReveal(game, api);
    assertTrue(api.state.currentEvent.title.endsWith('승리'));
  });

  check('공개 중 새 게임을 시작하면 이전 승리 알림과 기록을 취소', () => {
    const { game, api, toasts, results } = setup();
    api.presentFinalAccusation(api.state.players[0], api.state.solution);
    finishReveal(game, api);
    game.ClueGame.start();
    game.clock.advance(6000);
    assertEqual(api.state.phase, 'awaitRoll');
    assertTrue(!api.state.finished);
    assertEqual(toasts.filter((t) => t.mode === 'clue-finish').length, 0);
    assertEqual(results.length, 0);
  });

  check('AI 고발 실패: 공개 전에 탈락시키지 않고, 공개 후 게임 계속', () => {
    const { game, api, toasts } = setup();
    const player = api.state.players[1];
    api.state.currentPlayer = 1;
    const wrong = { ...api.state.solution, suspect: { type: 'suspect', id: 'suspect:wrong', name: '오답' } };
    api.presentFinalAccusation(player, wrong);
    assertTrue(!player.eliminated);
    finishReveal(game, api);
    assertEqual(api.state.currentEvent.title, '고발 실패');
    assertTrue(player.eliminated);
    assertTrue(!api.state.finished);
    assertEqual(toasts.filter((t) => t.mode === 'clue-finish').length, 0);
  });

  check('마지막 AI 탈락에 따른 승리도 정답 공개 뒤에 표시', () => {
    const { game, api, toasts } = setup();
    api.state.players[2].eliminated = true;
    const player = api.state.players[1];
    api.state.currentPlayer = 1;
    api.presentFinalAccusation(player, { ...api.state.solution, suspect: { type: 'suspect', id: 'suspect:wrong', name: '오답' } });
    finishReveal(game, api);
    assertEqual(api.state.currentEvent.title, '고발 실패');
    assertEqual(toasts.length, 0);
    api.dismissClueEvent();
    assertEqual(api.state.currentEvent.title, '사건 봉투 공개');
    assertEqual(toasts.length, 0);
    finishReveal(game, api);
    assertTrue(api.state.currentEvent.title.endsWith('승리'));
    assertEqual(toasts.filter((t) => t.mode === 'clue-finish').length, 1);
  });
});

console.log(`\nResult: ${pass}/${total} passed`);
process.exit(pass === total ? 0 : 1);
