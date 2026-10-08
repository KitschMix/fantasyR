const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { suite, test, assertEqual, assertTrue } = require('./runner');

let pass = 0;
let total = 0;
const read = (file) => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

function loadClue() {
  const element = () => ({
    innerHTML: '',
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    style: { setProperty() {} },
    append() {}, appendChild() {}, setAttribute() {}, addEventListener() {},
    querySelector() { return null; }, querySelectorAll() { return []; }
  });
  const difficultySelect = { value: 'normal' };
  const playerCountSelect = { value: '4' };
  const playersList = element();
  const renderedPlayers = [];
  playersList.append = (fragment) => {
    renderedPlayers.splice(0, renderedPlayers.length, ...fragment.children);
  };
  const sandbox = {
    window: {
      localStorage: { getItem() { return null; } },
      setTimeout() { return 1; }, clearTimeout() {}, clearInterval() {},
      performance: { now() { return 0; } }
    },
    document: {
      body: element(), documentElement: {},
      querySelector(selector) {
        if (selector === '#clueDifficultySelect') return difficultySelect;
        if (selector === '#cluePlayerCountSelect') return playerCountSelect;
        if (selector === '#cluePlayersList') return playersList;
        return null;
      },
      createElement: element,
      createDocumentFragment() {
        return { children: [], append(child) { this.children.push(child); } };
      }
    },
    Image: class {},
    Math: Object.create(Math)
  };
  // Seed randomness so random-mode coverage is repeatable.
  let seed = 42;
  sandbox.Math.random = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  vm.createContext(sandbox);
  vm.runInContext(read('shared-profiles.js'), sandbox);
  // Expose state for assertions without replacing the real startup/selection logic.
  vm.runInContext(read('clue.js').replace('  window.ClueGame = {',
    '  window.clueTest = { state, aiDifficultyKey };\n  window.ClueGame = {'), sandbox);
  return { ...sandbox.window, difficultySelect, playerCountSelect, renderedPlayers };
}

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
