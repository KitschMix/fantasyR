// Test runner — provides shared context creation utilities
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const REPO_ROOT = path.resolve(__dirname, '..');

function loadEngine(expansionEnabled = false, cursedHoardItems = false, playerCount = 2) {
  const deckSrc = fs.readFileSync(
    path.join(REPO_ROOT, 'vendor/fantasy-realms-kor/deck.js'), 'utf8'
  );
  const handSrc = fs.readFileSync(
    path.join(REPO_ROOT, 'vendor/fantasy-realms-kor/hand.js'), 'utf8'
  );

  const sandbox = {
    console,
    cursedHoardSuits: false,           // legacy fallback
    cursedHoardItems,
    playerCount,                       // 실제 게임의 인원수 (CH06 Genie, CH24 Spyglass가 참조)
  };
  sandbox.window = sandbox;
  sandbox.global = sandbox;
  sandbox.globalThis = sandbox;
  // Simulate script.js's window assignment (Phase 2 decoupling)
  sandbox.__fantasyExpansionEnabled = expansionEnabled;
  vm.createContext(sandbox);

  vm.runInContext(deckSrc, sandbox, { filename: 'deck.js' });
  if (expansionEnabled) {
    vm.runInContext(
      'this.deck.enableCursedHoardSuits(); this.deck.enableCursedHoardItems();',
      sandbox,
      { filename: 'deck-enable.js' }
    );
  }
  vm.runInContext(
    handSrc + '\nthis.Hand = Hand; this.CardInHand = CardInHand;',
    sandbox,
    { filename: 'hand.js' }
  );

  return sandbox;
}

function makeHand(ctx, cardIds, options = {}) {
  const { deck, Hand } = ctx;
  const h = new Hand({
    expansionEnabled: ctx.__fantasyExpansionEnabled,
    playerCount: ctx.playerCount,
    ...options
  });
  for (const id of cardIds) {
    const card = deck.getCardById(id);
    if (!card) throw new Error(`Unknown card ID: ${id}`);
    h.addCard(card);
  }
  return h;
}

function addCursedItem(ctx, hand, cardId) {
  const card = ctx.deck.getCardById(cardId);
  if (!card) throw new Error(`Unknown card: ${cardId}`);
  hand.cursedItems[cardId] = new ctx.CardInHand({ ...card, cursedItem: true });
}

// Simple test framework
function suite(name, fn) {
  console.log(`\n=== ${name} ===`);
  fn();
}

function test(name, fn) {
  try {
    fn();
    console.log(`  \u2713 ${name}`);
    return true;
  } catch (e) {
    console.log(`  \u2717 ${name}: ${e.message}`);
    return false;
  }
}

function assertEqual(actual, expected, msg = '') {
  if (actual !== expected) {
    throw new Error(`${msg}expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertTrue(cond, msg = 'expected true') {
  if (!cond) throw new Error(msg);
}

module.exports = {
  loadEngine,
  makeHand,
  addCursedItem,
  suite,
  test,
  assertEqual,
  assertTrue,
  REPO_ROOT,
};
