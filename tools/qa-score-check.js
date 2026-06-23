const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

const context = {
  console,
  cursedHoardSuits: false,
  jQuery: {
    i18n: {
      prop(value) {
        return value;
      },
    },
  },
  playerCount: 4,
};

vm.createContext(context);

for (const file of [
  "vendor/fantasy-realms-kor/deck.js",
  "vendor/fantasy-realms-kor/messages-kr.js",
  "vendor/fantasy-realms-kor/hand.js",
]) {
  vm.runInContext(read(file), context, { filename: file });
}

vm.runInContext(
  `this.__qa = {
    Hand,
    deck,
    ISLAND,
    BOOK_OF_CHANGES,
    SHAPESHIFTER,
    MIRAGE,
    DOPPELGANGER,
    CH_ANGEL,
    CH_NECROMANCER
  };`,
  context,
);

const { Hand, deck } = context.__qa;

function emptyDiscard() {
  return {
    cards() {
      return [];
    },
    contains() {
      return false;
    },
    containsSuit() {
      return false;
    },
    countSuit() {
      return 0;
    },
  };
}

function score(cardIds, actions = [], options = {}) {
  context.cursedHoardSuits = Boolean(options.expansion);

  if (options.expansion) {
    deck.enableCursedHoardSuits();
  } else {
    deck.disableCursedHoardSuits();
  }

  const hand = new Hand();
  hand.loadFromArrays(cardIds, actions);
  const total = hand.score(options.discard || emptyDiscard());

  return {
    total,
    hand,
    card(id) {
      return hand.getCardById(id);
    },
  };
}

const checks = [];

function check(name, run) {
  checks.push({ name, run });
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual(actual, expected, message) {
  assert(
    actual === expected,
    `${message} (expected ${expected}, got ${actual})`,
  );
}

check("Smoke is blanked when no flame exists", () => {
  const result = score(["FR13"]);
  assertEqual(result.total, 0, "Smoke should score 0 without flame");
  assert(result.card("FR13").blanked, "Smoke should be marked blanked");
});

check("Smoke scores normally when a flame exists", () => {
  const result = score(["FR13", "FR17"]);
  assert(!result.card("FR13").blanked, "Smoke should not be blanked with flame");
  assertEqual(result.card("FR13").points(), 27, "Smoke should keep its strength");
});

check("Great Flood blanks Forest but not Mountain", () => {
  const forest = score(["FR08", "FR04"]);
  assert(forest.card("FR04").blanked, "Forest should be blanked by Great Flood");

  const mountain = score(["FR08", "FR01"]);
  assert(!mountain.card("FR01").blanked, "Mountain should survive Great Flood");
});

check("Island clears the selected flood or flame penalty", () => {
  const withoutIslandAction = score(["FR09", "FR07", "FR17"]);
  const withIslandAction = score(["FR09", "FR07", "FR17"], [["FR09", "FR07"]]);

  assertEqual(
    withIslandAction.total - withoutIslandAction.total,
    3,
    "Island should remove Swamp's flame penalty",
  );
  assert(withIslandAction.card("FR07").penaltyCleared, "Swamp penalty should be marked cleared");
});

check("Rangers removes army from all penalties", () => {
  const withoutRangers = score(["FR07", "FR17", "FR21"]);
  const withRangers = score(["FR07", "FR17", "FR21", "FR25"]);

  assertEqual(withoutRangers.card("FR07").penaltyPoints, -6, "Swamp should count flame and army");
  assertEqual(withRangers.card("FR07").penaltyPoints, -3, "Swamp should ignore army when Rangers is present");
});

check("Warship removes army from flood penalties", () => {
  const withoutWarship = score(["FR08", "FR21"]);
  const withWarship = score(["FR08", "FR21", "FR41"]);

  assert(withoutWarship.card("FR21").blanked, "Great Flood should blank army without Warship");
  assert(!withWarship.card("FR21").blanked, "Great Flood should ignore army when Warship is present");
});

check("Book of Changes changes the selected card suit before scoring", () => {
  const result = score(["FR49", "FR13"], [["FR49", "FR13", "flame"]]);

  assertEqual(result.card("FR13").suit, "flame", "Smoke should be changed to flame");
  assert(!result.card("FR13").blanked, "Changed Smoke should satisfy its own flame requirement");
});

check("Shapeshifter copies allowed deck card name and suit", () => {
  const result = score(["FR51"], [["FR51", "FR35"]]);

  assertEqual(result.card("FR51").name, deck.getCardById("FR35").name, "Shapeshifter name copy failed");
  assertEqual(result.card("FR51").suit, deck.getCardById("FR35").suit, "Shapeshifter suit copy failed");
});

check("Mirage copies allowed deck card name and suit", () => {
  const result = score(["FR52"], [["FR52", "FR01"]]);

  assertEqual(result.card("FR52").name, deck.getCardById("FR01").name, "Mirage name copy failed");
  assertEqual(result.card("FR52").suit, deck.getCardById("FR01").suit, "Mirage suit copy failed");
});

check("Doppelganger copies an in-hand card's strength and suit", () => {
  const result = score(["FR53", "FR01"], [["FR53", "FR01"]]);

  assertEqual(result.card("FR53").name, result.card("FR01").name, "Doppelganger name copy failed");
  assertEqual(result.card("FR53").strength, result.card("FR01").strength, "Doppelganger strength copy failed");
});

check("Expansion Great Flood blanks building cards", () => {
  const result = score(["CH18", "CH01"], [], { expansion: true });

  assert(result.card("CH01").blanked, "Expansion Great Flood should blank Dungeon");
});

check("Angel protects the selected magic card from blanking", () => {
  const result = score(["CH08", "CH18", "CH01"], [["CH08", "CH01"]], {
    expansion: true,
  });

  assert(!result.card("CH01").blanked, "Angel-selected Dungeon should not be blanked");
});

check("Expansion Necromancer protects undead from blanking", () => {
  const result = score(["CH20", "CH11", "CH10"], [], { expansion: true });

  assert(!result.card("CH11").blanked, "Undead should not be blanked while CH Necromancer is present");
});

let failed = 0;

for (const item of checks) {
  try {
    item.run();
    console.log(`[PASS] ${item.name}`);
  } catch (error) {
    failed += 1;
    console.error(`[FAIL] ${item.name}`);
    console.error(`       ${error.message}`);
  }
}

console.log("");
console.log(`${checks.length - failed}/${checks.length} score checks passed.`);

if (failed > 0) {
  process.exitCode = 1;
}
