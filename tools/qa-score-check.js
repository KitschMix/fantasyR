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

function makeDiscard(cardIds) {
  const cards = cardIds.map((id) => deck.getCardById(id)).filter(Boolean);
  return {
    cards() {
      return cards;
    },
    contains(cardName) {
      return cards.some((card) => card.name === cardName);
    },
    containsSuit(suitName) {
      return cards.some((card) => card.suit === suitName);
    },
    countSuit(suitName) {
      return cards.filter((card) => card.suit === suitName).length;
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
  const discard = options.discardIds ? makeDiscard(options.discardIds) : options.discard || emptyDiscard();
  const total = hand.score(discard);

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

check("Expansion deck replaces original cards and excludes cursed items", () => {
  deck.enableCursedHoardSuits();
  const replacedOriginals = ["FR03", "FR06", "FR08", "FR25", "FR28", "FR48", "FR51", "FR52"];
  const replacements = ["CH16", "CH17", "CH18", "CH19", "CH20", "CH21", "CH22", "CH23"];

  for (const id of replacedOriginals) {
    assert(!deck.getCardById(id), `${id} should be replaced in expansion mode`);
  }
  for (const id of replacements) {
    assert(deck.getCardById(id), `${id} should exist in expansion mode`);
  }
  assert(!deck.getCardById("CH24"), "Cursed item cards should stay excluded from the normal expansion deck");
});

check("Dungeon scores undead, beast, and artifact groups", () => {
  const result = score(["CH01", "CH11", "CH12", "FR36", "FR49"], [], { expansion: true });

  assertEqual(result.card("CH01").bonusPoints, 35, "Dungeon group bonus failed");
});

check("Castle scores leader, army, land, and another building", () => {
  const result = score(["CH02", "FR31", "FR21", "FR01", "CH01"], [], { expansion: true });

  assertEqual(result.card("CH02").bonusPoints, 40, "Castle suit bonus failed");
});

check("Crypt scores undead strength and blanks leaders", () => {
  const result = score(["CH03", "CH11", "CH12", "FR31"], [], { expansion: true });

  assertEqual(result.card("CH03").bonusPoints, 18, "Crypt undead strength bonus failed");
  assert(result.card("FR31").blanked, "Crypt should blank leaders");
});

check("Chapel scores only when exactly two listed suits are present", () => {
  const result = score(["CH04", "FR31", "CH11", "FR01"], [], { expansion: true });

  assertEqual(result.card("CH04").bonusPoints, 40, "Chapel exact two-suit bonus failed");
});

check("Garden scores leaders and beasts, then blanks with undead", () => {
  const active = score(["CH05", "FR31", "FR36"], [], { expansion: true });
  const blanked = score(["CH05", "FR31", "CH11"], [], { expansion: true });

  assertEqual(active.card("CH05").bonusPoints, 22, "Garden leader/beast bonus failed");
  assert(blanked.card("CH05").blanked, "Garden should be blanked by undead");
});

check("Genie scores by player count before extra-card UI selection", () => {
  const result = score(["CH06"], [], { expansion: true });

  assertEqual(result.card("CH06").points(), -20, "Genie should score -50 plus 30 with four players");
});

check("Leprechaun scores base points before extra draw UI selection", () => {
  const result = score(["CH09"], [], { expansion: true });

  assertEqual(result.card("CH09").points(), 20, "Leprechaun should keep its base score");
});

check("Judge scores uncleared penalty cards", () => {
  const result = score(["CH07", "FR07", "FR21"], [], { expansion: true });

  assertEqual(result.card("CH07").bonusPoints, 20, "Judge should count two uncleared penalty cards");
});

check("Demon blanks singleton non-outsider suits", () => {
  const singleton = score(["CH10", "FR01"], [], { expansion: true });
  const paired = score(["CH10", "FR01", "FR02"], [], { expansion: true });

  assert(singleton.card("FR01").blanked, "Demon should blank singleton Mountain");
  assert(!paired.card("FR01").blanked, "Demon should not blank paired land cards");
  assert(!paired.card("FR02").blanked, "Demon should not blank paired land cards");
});

check("Undead discard-reference cards score their discard piles", () => {
  const darkQueen = score(["CH11"], [], {
    expansion: true,
    discardIds: ["FR01", "FR07", "FR17", "FR13", "FR36"],
  });
  const ghoul = score(["CH12"], [], {
    expansion: true,
    discardIds: ["FR30", "FR31", "FR21", "FR36", "CH11"],
  });
  const specter = score(["CH13"], [], {
    expansion: true,
    discardIds: ["FR30", "FR49", "CH06"],
  });
  const deathKnight = score(["CH15"], [], {
    expansion: true,
    discardIds: ["FR41", "FR21"],
  });

  assertEqual(darkQueen.card("CH11").bonusPoints, 25, "Dark Queen discard bonus failed");
  assertEqual(ghoul.card("CH12").bonusPoints, 20, "Ghoul discard bonus failed");
  assertEqual(specter.card("CH13").bonusPoints, 18, "Specter discard bonus failed");
  assertEqual(deathKnight.card("CH15").bonusPoints, 14, "Death Knight discard bonus failed");
});

check("Lich scores Necromancer and other undead", () => {
  const result = score(["CH14", "CH20", "CH11", "CH12"], [], { expansion: true });

  assertEqual(result.card("CH14").bonusPoints, 30, "Lich Necromancer/undead bonus failed");
});

check("Expansion replacement cards score updated suit support", () => {
  const bellTower = score(["CH16", "CH11"], [], { expansion: true });
  const fountain = score(["CH17", "FR41", "FR01"], [], { expansion: true });
  const rangers = score(["CH19", "FR01", "CH01"], [], { expansion: true });
  const worldTree = score(["CH21", "CH01", "CH06", "CH11", "FR01", "FR07", "FR17", "FR21"], [], {
    expansion: true,
  });

  assertEqual(bellTower.card("CH16").bonusPoints, 15, "Expansion Bell Tower should count undead");
  assertEqual(fountain.card("CH17").bonusPoints, 23, "Expansion Fountain should count weapon strength");
  assertEqual(rangers.card("CH19").bonusPoints, 20, "Expansion Rangers should count land and building");
  assertEqual(worldTree.card("CH21").bonusPoints, 70, "Expansion World Tree unique-suit bonus failed");
});

check("Expansion wild cards copy newly added suits", () => {
  const shapeshifter = score(["CH22"], [["CH22", "CH11"]], { expansion: true });
  const mirage = score(["CH23"], [["CH23", "CH01"]], { expansion: true });

  assertEqual(shapeshifter.card("CH22").name, deck.getCardById("CH11").name, "Expansion Shapeshifter should copy undead names");
  assertEqual(shapeshifter.card("CH22").suit, "undead", "Expansion Shapeshifter should copy undead suit");
  assertEqual(mirage.card("CH23").name, deck.getCardById("CH01").name, "Expansion Mirage should copy building names");
  assertEqual(mirage.card("CH23").suit, "building", "Expansion Mirage should copy building suit");
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
