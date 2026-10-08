const { suite, test, assertEqual, assertTrue } = require('./runner');
const { loadClue } = require('./clue-harness');
let pass = 0;
let total = 0;

suite('clue: 설정 화면 난이도와 캐릭터 배정', () => {
  const game = loadClue();
  const groups = game.FANTASY_SHARED_PROFILES.groups;
  const labels = game.FANTASY_SHARED_PROFILES.difficultyLabels;

  for (const difficulty of ['normal', 'hard', 'expert']) {
    total++; test(`${difficulty}: 3~6명 게임에서 전용 캐릭터와 난이도 적용`, () => {
      game.difficultySelect.value = difficulty;
      for (const count of [3, 4, 5, 6]) {
        game.playerCountSelect.value = String(count);
        game.ClueGame.start();
        const { state } = game.clueTest;
        assertEqual(state.players.length, count);
        assertEqual(state.aiDifficulty, difficulty);
        for (const player of state.players.slice(1)) {
          assertTrue(groups[difficulty].some((p) => p.name === player.name && p.avatarUrl === player.avatarUrl));
          assertEqual(player.difficulty, difficulty);
          assertEqual(player.difficultyLabel, labels[difficulty]);
          assertEqual(game.clueTest.aiDifficultyKey(player), difficulty);
        }
        assertTrue(game.renderedPlayers.slice(1).every((p) => p.innerHTML.includes(`<small>${labels[difficulty]}</small>`)));
      }
      pass++;
    });
  }

  total++; test('완전랜덤: 최종보스를 포함한 모든 그룹 등장 및 표시', () => {
    game.difficultySelect.value = 'random';
    const seen = new Set();
    for (let round = 0; round < 100; round++) {
      game.ClueGame.start();
      for (const player of game.clueTest.state.players.slice(1)) {
        seen.add(player.difficulty);
        assertTrue(groups[player.difficulty].some((p) => p.name === player.name));
        assertEqual(player.difficultyLabel, labels[player.difficulty]);
        if (player.difficulty === 'boss') {
          assertEqual(game.clueTest.aiDifficultyKey(player), 'expert');
          assertTrue(game.renderedPlayers.some((p) => p.innerHTML.includes('<small>최종보스</small>')));
        }
      }
    }
    assertEqual([...seen].sort().join(','), Object.keys(groups).sort().join(','));
    pass++;
  });

  total++; test('다시 시작할 때 변경한 난이도 적용', () => {
    game.difficultySelect.value = 'hard';
    game.ClueGame.start();
    assertTrue(game.clueTest.state.players.slice(1).every((p) => p.difficulty === 'hard'));
    pass++;
  });
});

console.log(`\nResult: ${pass}/${total} passed`);
process.exit(pass === total ? 0 : 1);
