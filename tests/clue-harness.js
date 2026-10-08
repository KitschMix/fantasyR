const fs = require('fs');
const path = require('path');
const vm = require('vm');

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
  vm.runInContext(read('clue-ai.js'), sandbox);
  // Expose state for assertions without replacing the real startup/selection logic.
  vm.runInContext(read('clue.js').replace('  window.ClueGame = {',
    '  window.clueTest = { state, aiDifficultyKey, aiEvidenceView, aiDeductions, aiResearchPlan, buildAiAccusation, resolveSuggestion, chooseHumanRefute, announceShownCard, rememberObservedCard, aiSuggestion, chooseAiDestination };\n  window.ClueGame = {'), sandbox);
  return { ...sandbox.window, difficultySelect, playerCountSelect, renderedPlayers };
}


module.exports = { loadClue };
