var cursedHoardItems = false;
var cursedHoardSuits = false;
var playerCount = 2;

const TYPE_META = {
  land: { label: "땅", color: "#5a6534", glyph: "▲" },
  flood: { label: "물", color: "#2d6371", glyph: "≈" },
  weather: { label: "날씨", color: "#516476", glyph: "☁" },
  flame: { label: "불", color: "#823d2d", glyph: "✹" },
  army: { label: "군대", color: "#6b5636", glyph: "⚔" },
  wizard: { label: "마법사", color: "#365a86", glyph: "✦" },
  leader: { label: "지도자", color: "#7a4d25", glyph: "♛" },
  beast: { label: "야수", color: "#386745", glyph: "◆" },
  weapon: { label: "무기", color: "#5e5b55", glyph: "†" },
  artifact: { label: "유물", color: "#5f5874", glyph: "◈" },
  wild: { label: "와일드", color: "#4c3f52", glyph: "★" },
  building: { label: "건물", color: "#73898f", glyph: "▣" },
  outsider: { label: "이방인", color: "#d0b75b", glyph: "✧" },
  undead: { label: "언데드", color: "#536c5e", glyph: "☠" },
  "cursed-item": { label: "저주받은 유물", color: "#cdc7b5", glyph: "!" }
};

const EXCLUDED_SOURCE_IDS = new Set(["FR54", "FR55", "FR55P"]);
let CARD_LIBRARY = buildSourceCardLibrary();
let CURSED_ITEM_LIBRARY = buildCursedItemLibrary();

function buildSourceCardLibrary() {
  if (!hasSourceDeck()) return [];
  return Object.values(deck.cards).filter((card) => !EXCLUDED_SOURCE_IDS.has(card.id)).map((card) => {
    const bonusText = card.bonus ? cleanEffectText(getTranslatedCardText(card.id, "bonus")) : "";
    const penaltyText = card.penalty ? cleanEffectText(getTranslatedCardText(card.id, "penalty")) : "";
    const actionText = card.action ? cleanEffectText(getTranslatedCardText(card.id, "action")) : "";
    const effectParts = getCardFaceEffectParts(card, bonusText, penaltyText, actionText);

    return {
      id: card.id,
      sourceId: card.id,
      sourceName: card.name,
      name: getTranslatedCardText(card.id, "name") || card.name,
      type: card.suit,
      base: card.strength,
      text: effectParts.join(" "),
      bonusText,
      penaltyText,
      actionText
    };
  });
}

function buildCursedItemLibrary() {
  if (!hasSourceDeck()) return [];
  return Object.values(deck.cursedItems || {}).map((card) => {
    const bonusText = card.bonus ? cleanEffectText(getTranslatedCardText(card.id, "bonus")) : "";
    const penaltyText = card.penalty ? cleanEffectText(getTranslatedCardText(card.id, "penalty")) : "";
    const actionText = card.action ? cleanEffectText(getTranslatedCardText(card.id, "action")) : "";
    const effectParts = getCardFaceEffectParts(card, bonusText, penaltyText, actionText);

    return {
      id: card.id,
      sourceId: card.id,
      sourceName: card.name,
      name: getTranslatedCardText(card.id, "name") || card.name,
      type: card.suit,
      base: card.strength,
      cursedItem: true,
      text: effectParts.join(" "),
      bonusText,
      penaltyText,
      actionText
    };
  });
}

function hasSourceDeck() {
  return typeof deck !== "undefined" && deck && deck.cards && typeof deck.cards === "object";
}

function getTranslatedCardText(cardId, field) {
  return CARD_TRANSLATIONS_KR?.[`${cardId}.${field}`] || "";
}

function displayNameForSource(source) {
  if (!source) return "";
  const sourceId = typeof source === "string" ? source : source.id;
  return getTranslatedCardText(sourceId, "name") || source.name || sourceId;
}

function cleanEffectText(value) {
  if (!value) return "";
  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getCardFaceEffectParts(card, bonusText, penaltyText, actionText) {
  const compactSummary = getCompactCardFaceSummary(card);
  if (compactSummary) return [compactSummary];

  const actionSummary = getCardFaceActionSummary(card);
  const effectParts = [];
  if (bonusText) effectParts.push(`보너스: ${bonusText}`);
  if (penaltyText) effectParts.push(`패널티: ${penaltyText}`);
  if (actionText) effectParts.push(actionSummary || `선택 효과: ${actionText}`);
  return effectParts;
}

function getCompactCardFaceSummary(card) {
  const summaries = {
    FR09: "보너스: 물 또는 불 카드 1장의 패널티를 무효화.",
    FR49: "보너스: 손패 카드 1장의 종류를 변경. 이름/기본 힘/보너스/패널티는 유지.",
    FR51: "보너스: 유물/지도자/마법사/무기/야수 1장의 이름과 종류를 복사. 보너스/패널티/기본 힘은 복사 불가.",
    FR52: "보너스: 군대/땅/날씨/물/불 1장의 이름과 종류를 복사. 보너스/패널티/기본 힘은 복사 불가.",
    FR53: "보너스: 손패 카드 1장의 이름/종류/기본 힘/패널티를 복사. 보너스는 복사 불가.",
    CH20: "보너스: 버린 군대/지도자/마법사/야수/언데드 1장을 점수에 추가.",
    CH22: "보너스: 유물/지도자/마법사/무기/야수/언데드 1장의 이름과 종류를 복사. 보너스/패널티/기본 힘은 복사 불가.",
    CH23: "보너스: 군대/건물/땅/날씨/물/불 1장의 이름과 종류를 복사. 보너스/패널티/기본 힘은 복사 불가."
  };
  return summaries[card.id] || "";
}

function getCardFaceActionSummary(card) {
  const summaries = {
    FR09: "선택 효과: 물 또는 불 카드 1장의 패널티를 무효화.",
    FR28: "선택 효과: 버린 군대/지도자/마법사/야수 1장을 점수에 추가.",
    FR49: "선택 효과: 손패 카드 1장의 종류를 원하는 종류로 변경.",
    FR51: "선택 효과: 유물/지도자/마법사/무기/야수 1장을 복사.",
    FR52: "선택 효과: 군대/땅/날씨/물/불 1장을 복사.",
    FR53: "선택 효과: 손패 카드 1장을 복사.",
    CH08: "선택 효과: 손패 카드 1장이 무효가 되는 것을 막음.",
    CH20: "선택 효과: 버린 군대/지도자/마법사/야수/언데드 1장을 점수에 추가.",
    CH22: "선택 효과: 유물/지도자/마법사/무기/야수/언데드 1장을 복사.",
    CH23: "선택 효과: 군대/건물/땅/날씨/물/불 1장을 복사."
  };
  return summaries[card.id] || "";
}

const SOURCE_CARD_IDS = {
  island: typeof ISLAND !== "undefined" ? ISLAND : "FR09",
  necromancer: typeof NECROMANCER !== "undefined" ? NECROMANCER : "FR28",
  bookOfChanges: typeof BOOK_OF_CHANGES !== "undefined" ? BOOK_OF_CHANGES : "FR49",
  shapeshifter: typeof SHAPESHIFTER !== "undefined" ? SHAPESHIFTER : "FR51",
  mirage: typeof MIRAGE !== "undefined" ? MIRAGE : "FR52",
  doppelganger: typeof DOPPELGANGER !== "undefined" ? DOPPELGANGER : "FR53",
  chNecromancer: typeof CH_NECROMANCER !== "undefined" ? CH_NECROMANCER : "CH20",
  chShapeshifter: typeof CH_SHAPESHIFTER !== "undefined" ? CH_SHAPESHIFTER : "CH22",
  chMirage: typeof CH_MIRAGE !== "undefined" ? CH_MIRAGE : "CH23",
  chAngel: typeof CH_ANGEL !== "undefined" ? CH_ANGEL : "CH08"
};

const SOURCE_CARD_GROUPS = {
  island: [SOURCE_CARD_IDS.island],
  necromancer: [SOURCE_CARD_IDS.necromancer, SOURCE_CARD_IDS.chNecromancer],
  bookOfChanges: [SOURCE_CARD_IDS.bookOfChanges],
  shapeshifter: [SOURCE_CARD_IDS.shapeshifter, SOURCE_CARD_IDS.chShapeshifter],
  mirage: [SOURCE_CARD_IDS.mirage, SOURCE_CARD_IDS.chMirage],
  doppelganger: [SOURCE_CARD_IDS.doppelganger],
  angel: [SOURCE_CARD_IDS.chAngel]
};

const SOURCE_SUIT_OPTIONS = [
  { value: "land", label: "땅" },
  { value: "flood", label: "물" },
  { value: "weather", label: "날씨" },
  { value: "flame", label: "불" },
  { value: "army", label: "군대" },
  { value: "wizard", label: "마법사" },
  { value: "leader", label: "지도자" },
  { value: "beast", label: "야수" },
  { value: "weapon", label: "무기" },
  { value: "artifact", label: "유물" },
  { value: "wild", label: "와일드" },
  { value: "building", label: "건물" },
  { value: "outsider", label: "이방인" },
  { value: "undead", label: "언데드" }
];

const SHAPESHIFTER_TARGET_TYPES = ["artifact", "leader", "wizard", "weapon", "beast", "undead"];
const MIRAGE_TARGET_TYPES = ["army", "building", "land", "weather", "flood", "flame"];
const NECROMANCER_TARGET_TYPES = ["army", "leader", "wizard", "beast", "undead"];

const CARD_ART_IDS = new Set(Array.from({ length: 53 }, (_, index) => index + 1));
const EXPANSION_CARD_ART_IDS = new Set([
  "CH01", "CH02", "CH03", "CH04",
  "CH06", "CH07", "CH08", "CH09", "CH10", "CH11", "CH12", "CH13", "CH14", "CH15",
  "CH24", "CH25", "CH26", "CH27", "CH28", "CH29", "CH30", "CH31", "CH32", "CH33",
  "CH34", "CH35", "CH36", "CH37", "CH38", "CH39", "CH40", "CH41", "CH42", "CH43",
  "CH44", "CH45", "CH46", "CH47"
]);
const CARD_ART_VERSION = "small-20260618-expansion";

const CARD_LONG_PRESS_MS = 450;
const CARD_LONG_PRESS_MOVE_LIMIT = 12;
const CARD_ZOOM_SCALE = 2.5;
const DIALOGUE_CHANCE = 0.3;
const DIALOGUE_IDLE_INTERVAL_MS = 10000;
const DIALOGUE_DISPLAY_MS = 6200;
const DIALOGUE_START_DISPLAY_MS = 8200;
const DIALOGUE_END_DISPLAY_MS = 15000;
const DIALOGUE_BOOKS = window.FANTASY_DIALOGUE_BOOKS || {};
const DIALOGUE_CHARACTER_BOOKS = window.FANTASY_DIALOGUE_CHARACTER_BOOKS || {};

const PROFILE_ASSET_ROOT = "assets/profiles/user";
const AI_DIFFICULTY_LABELS = {
  normal: "보통",
  hard: "어려움",
  expert: "매우어려움",
  boss: "최종보스"
};
const AI_PROFILE_DIFFICULTY_KEYS = ["normal", "hard", "expert"];
const HUMAN_PROFILE = {
  name: "나",
  avatarUrl: profileImageUrl("유저.jpg")
};
const AI_PROFILE_GROUPS = {
  normal: [
    { name: "건일", avatarUrl: profileImageUrl("보통-건일.jpg") },
    { name: "루나", avatarUrl: profileImageUrl("보통-루나.jpg") },
    { name: "이지", avatarUrl: profileImageUrl("보통-이지.jpg") },
    { name: "케이", avatarUrl: profileImageUrl("보통-케이.jpg") }
  ],
  hard: [
    { name: "레이븐", avatarUrl: profileImageUrl("어려움-레이븐.jpg") },
    { name: "메이", avatarUrl: profileImageUrl("어려움-메이.jpg") },
    { name: "미미", avatarUrl: profileImageUrl("어려움-미미.jpg") },
    { name: "미카", avatarUrl: profileImageUrl("어려움-미카.jpg") },
    { name: "채호", avatarUrl: profileImageUrl("어려움-채호.jpg") },
    { name: "하준", avatarUrl: profileImageUrl("어려움-하준.jpg") }
  ],
  expert: [
    { name: "강범례", avatarUrl: profileImageUrl("매우어려움-강범례.jpg") },
    { name: "변판길", avatarUrl: profileImageUrl("매우어려움-변판길.jpg") },
    { name: "변판득", avatarUrl: profileImageUrl("매우어려움-변판득.jpg") },
    { name: "서진숙", avatarUrl: profileImageUrl("매우어려움-서진숙.jpg") },
    { name: "유리", avatarUrl: profileImageUrl("매우어려움-유리.jpg") },
    { name: "제갈혜정", avatarUrl: profileImageUrl("매우어려움-제갈혜정.jpg") },
    { name: "채춘미", avatarUrl: profileImageUrl("매우어려움-채춘미.jpg") }
  ]
};

const state = {
  players: [],
  deck: [],
  discard: [],
  activePlayer: 0,
  phase: "setup",
  selectedCardId: null,
  drawnCardId: null,
  turnNumber: 1,
  finished: false,
  pendingFinish: false,
  playerCount: 2,
  aiDifficulty: "normal",
  includeExpansion: false,
  includeCursedItems: false,
  cursedDeck: [],
  cursedDiscard: [],
  animating: false,
  cardActions: {},
  confirmedActions: {}
};

const els = {
  setupPanel: document.querySelector("#setupPanel"),
  gameBoard: document.querySelector("#gameBoard"),
  playerCountSelect: document.querySelector("#playerCountSelect"),
  aiDifficultySelect: document.querySelector("#aiDifficultySelect"),
  expansionCheckbox: document.querySelector("#expansionCheckbox"),
  cursedItemsCheckbox: document.querySelector("#cursedItemsCheckbox"),
  startButton: document.querySelector("#startButton"),
  newGameButton: document.querySelector("#newGameButton"),
  rulesButton: document.querySelector("#rulesButton"),
  rulesDialog: document.querySelector("#rulesDialog"),
  cardCatalogButton: document.querySelector("#cardCatalogButton"),
  cardCatalogDialog: document.querySelector("#cardCatalogDialog"),
  cardCatalogList: document.querySelector("#cardCatalogList"),
  cardCatalogSummary: document.querySelector("#cardCatalogSummary"),
  endDialog: document.querySelector("#endDialog"),
  endSummary: document.querySelector("#endSummary"),
  restartGameButton: document.querySelector("#restartGameButton"),
  turnLabel: document.querySelector("#turnLabel"),
  phaseLabel: document.querySelector("#phaseLabel"),
  scoreList: document.querySelector("#scoreList"),
  gameLog: document.querySelector("#gameLog"),
  opponentsRow: document.querySelector("#opponentsRow"),
  deckButton: document.querySelector("#deckButton"),
  deckCount: document.querySelector("#deckCount"),
  discardCount: document.querySelector("#discardCount"),
  discardLimitLabel: document.querySelector("#discardLimitLabel"),
  endHint: document.querySelector("#endHint"),
  discardProgress: document.querySelector("#discardProgress"),
  discardArea: document.querySelector("#discardArea"),
  playerHand: document.querySelector("#playerHand"),
  handScore: document.querySelector("#handScore"),
  sortButton: document.querySelector("#sortButton"),
  cardDetail: document.querySelector("#cardDetail"),
  scoreActions: document.querySelector("#scoreActions"),
  scoreBreakdown: document.querySelector("#scoreBreakdown")
};

let activeCardZoom = null;
let suppressCardClick = false;
let dialogueUsage = new Map();
let idleDialogueTimer = null;
let idleDialogueToken = 0;
const speechClearTimers = new Map();

function shuffle(items) {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function profileImageUrl(fileName) {
  return encodeURI(`${PROFILE_ASSET_ROOT}/${fileName}`);
}

function aiDifficultyLabel(difficulty) {
  return AI_DIFFICULTY_LABELS[difficulty] || AI_DIFFICULTY_LABELS.normal;
}

function isBossProfile(profile) {
  return profile?.name === "강범례";
}

function prepareAiProfile(profile, difficulty, labelOverride = null) {
  const boss = isBossProfile(profile);
  return {
    ...profile,
    boss,
    difficulty: boss ? "boss" : difficulty,
    difficultyLabel: boss ? AI_DIFFICULTY_LABELS.boss : (labelOverride || aiDifficultyLabel(difficulty))
  };
}

function aiPlayerDisplayName(profile) {
  if (profile.boss) return "강범례(최종보스)";
  return `${profile.name} (${profile.difficultyLabel})`;
}

function randomAiDifficultyKey() {
  return AI_PROFILE_DIFFICULTY_KEYS[Math.floor(Math.random() * AI_PROFILE_DIFFICULTY_KEYS.length)];
}

function selectAiProfiles(difficulty, count) {
  const pool = difficulty === "random"
    ? AI_PROFILE_DIFFICULTY_KEYS.flatMap((key) => AI_PROFILE_GROUPS[key]).map((profile) => (
      prepareAiProfile(profile, randomAiDifficultyKey(), "랜덤")
    ))
    : (AI_PROFILE_GROUPS[difficulty] || AI_PROFILE_GROUPS.normal).map((profile) => (
      prepareAiProfile(profile, AI_PROFILE_GROUPS[difficulty] ? difficulty : "normal")
    ));
  return shuffle(pool).slice(0, count);
}

function createPlayerRoster() {
  const aiProfiles = selectAiProfiles(state.aiDifficulty, state.playerCount - 1);
  return [
    {
      id: 0,
      name: HUMAN_PROFILE.name,
      baseName: HUMAN_PROFILE.name,
      human: true,
      avatarUrl: HUMAN_PROFILE.avatarUrl,
      difficulty: null,
      difficultyLabel: "",
      speech: "",
      hand: [],
      activeCursedItem: null,
      usedCursedItems: []
    },
    ...aiProfiles.map((profile, index) => {
      return {
        id: index + 1,
        name: aiPlayerDisplayName(profile),
        baseName: profile.name,
        human: false,
        avatarUrl: profile.avatarUrl,
        difficulty: profile.difficulty,
        difficultyLabel: profile.difficultyLabel,
        boss: profile.boss,
        speech: "",
        hand: [],
        activeCursedItem: null,
        usedCursedItems: []
      };
    })
  ];
}

function cloneDeck() {
  return CARD_LIBRARY.map((card) => ({ ...card }));
}

function cloneCursedDeck() {
  return CURSED_ITEM_LIBRARY.map((card) => ({ ...card }));
}

function disableSourceDeckSuits() {
  if (typeof deck.disableCursedHoardSuits === "function") {
    deck.disableCursedHoardSuits();
    return;
  }
  if (typeof base !== "undefined") {
    deck.cards = { ...base };
  }
}

function enableSourceDeckSuits() {
  if (typeof deck.enableCursedHoardSuits === "function") {
    deck.enableCursedHoardSuits();
    return;
  }
  if (typeof base === "undefined" || typeof cursedHoard === "undefined") return;
  deck.cards = { ...base, ...cursedHoard };
  Object.values(cursedHoard).forEach((card) => {
    if (card.replaces) {
      delete deck.cards[card.replaces];
    }
  });
}

function disableSourceDeckItems() {
  if (typeof deck.disableCursedHoardItems === "function") {
    deck.disableCursedHoardItems();
    return;
  }
  deck.cursedItems = {};
}

function enableSourceDeckItems() {
  if (typeof deck.enableCursedHoardItems === "function") {
    deck.enableCursedHoardItems();
    return;
  }
  if (typeof cursedItems !== "undefined") {
    deck.cursedItems = cursedItems;
  }
}

function configureDeckOptions() {
  cursedHoardSuits = state.includeExpansion;
  cursedHoardItems = state.includeCursedItems;
  playerCount = state.playerCount;

  disableSourceDeckSuits();
  disableSourceDeckItems();
  if (state.includeExpansion) enableSourceDeckSuits();
  if (state.includeCursedItems) enableSourceDeckItems();

  CARD_LIBRARY = buildSourceCardLibrary();
  CURSED_ITEM_LIBRARY = buildCursedItemLibrary();
}

function startingHandSize() {
  return state.includeExpansion ? 8 : 7;
}

function discardLimit() {
  return state.includeExpansion ? 12 : 10;
}

function drawCursedItem() {
  if (!state.includeCursedItems) return null;
  if (state.cursedDeck.length === 0 && state.cursedDiscard.length > 0) {
    state.cursedDeck = shuffle(state.cursedDiscard.splice(0));
  }
  return state.cursedDeck.pop() || null;
}

function updateTitleArt() {
  const showExpansionTitle = Boolean(els.expansionCheckbox?.checked || state.includeExpansion);
  document.body.classList.toggle("expansion-title-active", showExpansionTitle);
}

function startGame() {
  resetDialogueState();
  state.playerCount = Number(els.playerCountSelect.value);
  state.aiDifficulty = els.aiDifficultySelect?.value || "normal";
  state.includeExpansion = Boolean(els.expansionCheckbox?.checked);
  state.includeCursedItems = Boolean(els.cursedItemsCheckbox?.checked);
  updateTitleArt();
  configureDeckOptions();
  state.deck = shuffle(cloneDeck());
  state.discard = [];
  state.cursedDeck = state.includeCursedItems ? shuffle(cloneCursedDeck()) : [];
  state.cursedDiscard = [];
  state.players = createPlayerRoster();

  for (let round = 0; round < startingHandSize(); round += 1) {
    state.players.forEach((player) => {
      player.hand.push(state.deck.pop());
    });
  }

  if (state.includeCursedItems) {
    state.players.forEach((player) => {
      player.activeCursedItem = drawCursedItem();
    });
  }

  state.activePlayer = 0;
  state.phase = "draw";
  state.selectedCardId = null;
  state.drawnCardId = null;
  state.turnNumber = 1;
  state.finished = false;
  state.pendingFinish = false;
  state.animating = false;
  state.cardActions = {};
  state.confirmedActions = {};
  els.setupPanel.classList.add("hidden");
  els.gameBoard.classList.remove("hidden");
  clearLog();
  log(`게임 시작. ${startingHandSize()}장 손패로 시작합니다. 덱이나 공개 버린 카드에서 1장을 가져오세요.`);
  render();
  speakAllAiDialogue("start", { duration: DIALOGUE_START_DISPLAY_MS });
  syncIdleDialogueTimer();
}

function clearLog() {
  els.gameLog.innerHTML = "";
}

function log(message) {
  const item = document.createElement("li");
  item.textContent = message;
  els.gameLog.prepend(item);
  while (els.gameLog.children.length > 12) {
    els.gameLog.lastElementChild.remove();
  }
}

function currentPlayer() {
  return state.players[state.activePlayer];
}

function cardSourceId(card) {
  return String(card.sourceId ?? card.id);
}

function cardArtIdFromSource(sourceId) {
  const normalized = String(sourceId || "");
  const match = normalized.match(/^FR(\d+)$/);
  if (match) return Number(match[1]);

  const sourceCard = hasSourceDeck() ? deck.getCardById(normalized) : null;
  const replacedSourceId = sourceCard?.replaces;
  const replacementMatch = replacedSourceId ? String(replacedSourceId).match(/^FR(\d+)$/) : null;
  if (replacementMatch) return Number(replacementMatch[1]);

  return Number(normalized);
}

function cardArtUrl(card) {
  const sourceId = cardSourceId(card);
  if (EXPANSION_CARD_ART_IDS.has(sourceId)) {
    return `assets/card-art/${sourceId}.png?v=${CARD_ART_VERSION}`;
  }
  const artId = cardArtIdFromSource(sourceId);
  return CARD_ART_IDS.has(artId) ? `assets/card-art/${artId}.png?v=${CARD_ART_VERSION}` : "";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function playerAvatarHtml(player) {
  if (!player?.avatarUrl) return "";
  return `<img class="player-avatar" src="${escapeHtml(player.avatarUrl)}" alt="" loading="lazy" />`;
}

function playerNameTagHtml(player) {
  return `
    <div class="player-name-tag">
      ${playerAvatarHtml(player)}
      <strong>${escapeHtml(player.name)}</strong>
    </div>
  `;
}

function playerSpeechBubbleHtml(player) {
  return `
    <div class="speech-bubble${player?.speech ? "" : " empty"}" ${player?.speech ? "" : 'aria-hidden="true"'}>
      ${player?.speech ? escapeHtml(player.speech) : ""}
    </div>
  `;
}

function resetDialogueState() {
  stopIdleDialogueTimer();
  speechClearTimers.forEach((timer) => window.clearTimeout(timer));
  speechClearTimers.clear();
  dialogueUsage = new Map();
}

function dialoguePlayerName(player) {
  return player?.baseName || String(player?.name || "").replace(/\s*\(.+\)\s*$/, "");
}

function dialogueBooksForPlayer(player) {
  return DIALOGUE_CHARACTER_BOOKS[dialoguePlayerName(player)] || [];
}

function dialogueUsageSet(bookKey, eventKey) {
  const key = `${bookKey}:${eventKey}`;
  if (!dialogueUsage.has(key)) dialogueUsage.set(key, new Set());
  return dialogueUsage.get(key);
}

function hasUnusedDialogue(bookKey, eventKey) {
  const lines = DIALOGUE_BOOKS[bookKey]?.[eventKey] || [];
  if (lines.length === 0) return false;
  const used = dialogueUsageSet(bookKey, eventKey);
  return lines.some((line) => !used.has(line));
}

function pickDialogueLine(player, eventKey) {
  const books = shuffle(dialogueBooksForPlayer(player)).filter((bookKey) => hasUnusedDialogue(bookKey, eventKey));
  for (const bookKey of books) {
    const lines = DIALOGUE_BOOKS[bookKey]?.[eventKey] || [];
    const used = dialogueUsageSet(bookKey, eventKey);
    const unused = lines.filter((line) => !used.has(line));
    if (unused.length === 0) continue;
    const line = unused[Math.floor(Math.random() * unused.length)];
    used.add(line);
    return line;
  }
  return "";
}

function aiDialogueCandidates(eventKey, excludedIds = []) {
  const excluded = new Set(excludedIds);
  return state.players.filter((player) => (
    !player.human
    && !excluded.has(player.id)
    && dialogueBooksForPlayer(player).some((bookKey) => hasUnusedDialogue(bookKey, eventKey))
  ));
}

function clearPlayerSpeech(player) {
  if (!player) return;
  const timer = speechClearTimers.get(player.id);
  if (timer) window.clearTimeout(timer);
  speechClearTimers.delete(player.id);
  player.speech = "";
}

function clearAllSpeech() {
  state.players.forEach(clearPlayerSpeech);
}

function setPlayerSpeech(player, line, duration = DIALOGUE_DISPLAY_MS) {
  if (!player || !line) return;
  const timer = speechClearTimers.get(player.id);
  if (timer) window.clearTimeout(timer);
  player.speech = line;
  if (duration > 0) {
    speechClearTimers.set(player.id, window.setTimeout(() => {
      if (player.speech === line) {
        player.speech = "";
        renderOpponents();
      }
      speechClearTimers.delete(player.id);
    }, duration));
  }
}

function speakSingleDialogue(eventKey, options = {}) {
  const {
    chance = DIALOGUE_CHANCE,
    excludedIds = [],
    player = null,
    duration = DIALOGUE_DISPLAY_MS
  } = options;
  if (Math.random() >= chance) return false;

  const candidates = player ? [player] : shuffle(aiDialogueCandidates(eventKey, excludedIds));
  for (const candidate of candidates) {
    if (!candidate || candidate.human) continue;
    const line = pickDialogueLine(candidate, eventKey);
    if (!line) continue;
    clearAllSpeech();
    setPlayerSpeech(candidate, line, duration);
    renderOpponents();
    return true;
  }
  return false;
}

function speakAllAiDialogue(eventKey, options = {}) {
  const { duration = DIALOGUE_START_DISPLAY_MS, eventByPlayer = null } = options;
  clearAllSpeech();
  state.players.filter((player) => !player.human).forEach((player) => {
    const playerEventKey = eventByPlayer ? eventByPlayer(player) : eventKey;
    const line = pickDialogueLine(player, playerEventKey);
    if (line) setPlayerSpeech(player, line, duration);
  });
  renderOpponents();
}

function canIdleDialogueRun() {
  return currentPlayer()?.human
    && !state.finished
    && !state.pendingFinish
    && !state.animating
    && (state.phase === "draw" || state.phase === "discard");
}

function stopIdleDialogueTimer() {
  idleDialogueToken += 1;
  if (idleDialogueTimer) {
    window.clearTimeout(idleDialogueTimer);
    idleDialogueTimer = null;
  }
}

function scheduleNextIdleDialogue() {
  if (!currentPlayer()?.human || state.finished || state.pendingFinish) return;
  const token = idleDialogueToken;
  idleDialogueTimer = window.setTimeout(() => {
    idleDialogueTimer = null;
    if (token !== idleDialogueToken) return;
    if (canIdleDialogueRun()) {
      speakSingleDialogue("wait", { chance: 1, duration: DIALOGUE_DISPLAY_MS });
    }
    scheduleNextIdleDialogue();
  }, DIALOGUE_IDLE_INTERVAL_MS);
}

function syncIdleDialogueTimer() {
  if (currentPlayer()?.human && !state.finished && !state.pendingFinish) {
    if (!idleDialogueTimer) {
      idleDialogueToken += 1;
      scheduleNextIdleDialogue();
    }
    return;
  }
  stopIdleDialogueTimer();
}

function getPenaltyClearInfo(card, scoreRow) {
  if (!scoreRow?.penaltyCleared || !card.penaltyText) return null;
  const sourceName = displayNameForSource(scoreRow.penaltyClearedBy) || "다른 카드";
  return {
    title: `${sourceName} 카드로 인해 패널티 삭제`
  };
}

function getBlankInfo(card, scoreRow) {
  if (!scoreRow?.blanked) return null;
  if (scoreRow.blankedBy?.reason === "source") {
    return {
      title: `${displayNameForSource(scoreRow.blankedBy)} 카드로 인해 무효`
    };
  }
  return {
    title: `${card.name} 카드 조건 불충족으로 무효`
  };
}

function formatCardEffectText(value, penaltyClearInfo = null) {
  if (!value) return "효과 없음";
  const segments = splitEffectSegments(value);
  if (segments.length === 0) {
    return escapeHtml(value).replace(/(보너스|패널티)(?=:)/g, "<strong>$1</strong>");
  }

  return segments.map((segment) => {
    const text = `<strong>${escapeHtml(segment.label)}</strong>: ${escapeHtml(segment.body)}`;
    if (segment.type !== "penalty" || !penaltyClearInfo) return text;
    return `<span class="card-effect-cleared">${text}</span>`;
  }).join(" ");
}

function splitEffectSegments(value) {
  const pattern = /(보너스|패널티|선택 효과):/g;
  const matches = [...String(value).matchAll(pattern)];
  if (matches.length === 0) return [];

  return matches.map((match, index) => {
    const start = match.index + match[0].length;
    const end = index + 1 < matches.length ? matches[index + 1].index : String(value).length;
    const label = match[1];
    return {
      label,
      type: label === "패널티" ? "penalty" : label === "보너스" ? "bonus" : "action",
      body: String(value).slice(start, end).trim()
    };
  });
}

function cardActionKey(cardId) {
  return String(cardId);
}

function setCardAction(cardId, values) {
  const key = cardActionKey(cardId);
  const normalized = values.map((value) => String(value || ""));
  clearCardActionConfirmation(cardId);
  if (normalized.every((value) => !value)) {
    delete state.cardActions[key];
  } else {
    state.cardActions[key] = normalized;
  }
}

function clearCardAction(cardId) {
  delete state.cardActions[cardActionKey(cardId)];
  clearCardActionConfirmation(cardId);
}

function getCardAction(cardId) {
  return state.cardActions[cardActionKey(cardId)] || null;
}

function cardActionSignature(cardId) {
  return JSON.stringify((getCardAction(cardId) || []).map((value) => String(value || "")));
}

function clearCardActionConfirmation(cardId) {
  delete state.confirmedActions[cardActionKey(cardId)];
}

function confirmCardAction(card, player) {
  if (!isCardActionComplete(card, player)) return false;
  const sourceId = cardSourceId(card);
  state.confirmedActions[cardActionKey(sourceId)] = cardActionSignature(sourceId);
  return true;
}

function isCardActionConfirmed(card, player) {
  if (!isCardActionComplete(card, player)) return false;
  const sourceId = cardSourceId(card);
  return state.confirmedActions[cardActionKey(sourceId)] === cardActionSignature(sourceId);
}

function hasCardSource(hand, sourceId) {
  return hand.some((card) => cardSourceId(card) === String(sourceId));
}

function getSourceCardById(sourceId) {
  return CARD_LIBRARY.find((card) => cardSourceId(card) === String(sourceId)) || null;
}

function isSourceId(sourceId, group) {
  return (SOURCE_CARD_GROUPS[group] || []).includes(String(sourceId));
}

function getPlayerSourceId(player, group) {
  return player?.hand.find((card) => isSourceId(cardSourceId(card), group))?.sourceId || null;
}

function isPhoenixCard(card) {
  return ["FR55", "FR55P"].includes(cardSourceId(card));
}

function getScoringHand(player) {
  if (!player) return [];
  const scoringHand = [...player.hand];
  const necromancerExtra = getNecromancerExtraCard(player);
  if (necromancerExtra) scoringHand.push(necromancerExtra);
  return scoringHand;
}

function getNecromancerExtraCard(player) {
  if (!player?.human || player.hand.length > startingHandSize()) return null;
  const necromancerId = getPlayerSourceId(player, "necromancer");
  if (!necromancerId) return null;

  const action = getCardAction(necromancerId);
  const selectedId = String(action?.[0] || "");
  if (!selectedId) return null;

  const discardCard = state.discard.find((card) => (
    cardSourceId(card) === selectedId && NECROMANCER_TARGET_TYPES.includes(card.type)
  ));
  return discardCard ? { ...discardCard, necromancerExtra: true } : null;
}

function getNormalizedActionData(card, hand) {
  const sourceId = cardSourceId(card);
  const type = getActionControlType(card);
  const action = getCardAction(sourceId);
  if (!action) return null;

  if (type === "shapeshifter") {
    const target = getSourceCardById(action[0]);
    return target && SHAPESHIFTER_TARGET_TYPES.includes(target.type) ? [cardSourceId(target)] : null;
  }

  if (type === "mirage") {
    const target = getSourceCardById(action[0]);
    return target && MIRAGE_TARGET_TYPES.includes(target.type) ? [cardSourceId(target)] : null;
  }

  if (type === "doppelganger") {
    const targetId = String(action[0] || "");
    return targetId && targetId !== sourceId && hasCardSource(hand, targetId) ? [targetId] : null;
  }

  if (type === "bookOfChanges") {
    const targetId = String(action[0] || "");
    const suit = action[1];
    const validSuit = getAvailableSuitOptions().some((option) => option.value === suit);
    return targetId && targetId !== sourceId && hasCardSource(hand, targetId) && validSuit
      ? [targetId, suit]
      : null;
  }

  if (type === "island") {
    const targetId = String(action[0] || "");
    const target = hand.find((candidate) => cardSourceId(candidate) === targetId);
    return target && (["flood", "flame"].includes(target.type) || isPhoenixCard(target)) ? [targetId] : null;
  }

  if (type === "angel") {
    const targetId = String(action[0] || "");
    return targetId && targetId !== sourceId && hasCardSource(hand, targetId) ? [targetId] : null;
  }

  return null;
}

function getRequiredActionIssues(player) {
  if (!player?.human) return [];
  cleanupUnavailableActions(player);
  return player.hand
    .filter((card) => getActionControlType(card))
    .filter((card) => doesActionRequireChoice(card, player))
    .filter((card) => !isCardActionConfirmed(card, player))
    .map((card) => ({ card, type: getActionControlType(card) }));
}

function doesActionRequireChoice(card, player) {
  const type = getActionControlType(card);
  const sourceId = cardSourceId(card);

  if (type === "shapeshifter") return buildGlobalTargetOptions(SHAPESHIFTER_TARGET_TYPES).length > 0;
  if (type === "mirage") return buildGlobalTargetOptions(MIRAGE_TARGET_TYPES).length > 0;
  if (type === "doppelganger") return buildHandTargetOptions(player.hand, sourceId).length > 0;
  if (type === "necromancer") return buildDiscardTargetOptions(NECROMANCER_TARGET_TYPES).length > 0;
  if (type === "bookOfChanges") {
    return buildHandTargetOptions(player.hand, sourceId).length > 0 && getAvailableSuitOptions().length > 0;
  }
  if (type === "island") {
    return getIslandTargetOptions(player.hand, sourceId).length > 0;
  }
  if (type === "angel") {
    return buildHandTargetOptions(player.hand, sourceId).length > 0;
  }

  return false;
}

function isCardActionComplete(card, player) {
  const sourceId = cardSourceId(card);
  const type = getActionControlType(card);

  if (type === "necromancer") {
    return Boolean(getNecromancerExtraCard(player));
  }

  return Boolean(getNormalizedActionData(card, player.hand));
}

function applyActionDataToScoringHand(scoringHand, hand) {
  hand.forEach((card) => {
    const actionData = getNormalizedActionData(card, hand);
    if (!actionData) return;

    const sourceId = cardSourceId(card);
    const actionCard = scoringHand.getCardById(sourceId);
    if (!actionCard) return;

    scoringHand.cardsInHand[sourceId] = new CardInHand(actionCard.card, actionData);
  });
}

function scoreHand(hand, cursedItems = []) {
  return scoreSourceHand(hand, cursedItems);
}

function scorePlayer(player, hand = getScoringHand(player)) {
  return scoreHand(hand, player?.usedCursedItems || []);
}

function buildScoringDiscard() {
  const cards = state.discard.map((card) => deck.getCardById(cardSourceId(card))).filter(Boolean);
  return {
    cards: () => cards,
    contains: (cardName) => cards.some((card) => card.name === cardName),
    containsSuit: (suitName) => cards.some((card) => card.suit === suitName),
    countSuit: (suitName) => cards.filter((card) => card.suit === suitName).length
  };
}

function scoreSourceHand(hand, cursedItems = []) {
  const scoringHand = new Hand();
  const originalCanAdd = scoringHand._canAdd;
  scoringHand._canAdd = () => true;
  const scoringCards = [...hand, ...cursedItems];
  scoringCards.forEach((card) => {
    scoringHand.addCard(deck.getCardById(card.sourceId));
  });
  scoringHand._canAdd = originalCanAdd;
  applyActionDataToScoringHand(scoringHand, hand);

  const total = scoringHand.score(buildScoringDiscard());
  const penaltyClearSources = getPenaltyClearSources(scoringHand);
  const blankSources = getBlankSources(scoringHand);
  const scoredCards = new Map([
    ...scoringHand.cards().map((card) => [card.id, card]),
    ...scoringHand.faceDownCursedItems().map((card) => [card.id, card])
  ]);
  const rows = scoringCards.map((card) => {
    const scored = scoredCards.get(card.sourceId);
    if (!scored) {
      return {
        card,
        base: card.base,
        baseOriginal: card.base,
        bonus: 0,
        penalty: 0,
        total: card.base,
        blanked: false,
        blankedBy: null,
        penaltyCleared: false,
        penaltyClearedBy: null
      };
    }

    return {
      card: {
        ...card,
        name: card.name,
        type: scored.suit,
        base: scored.strength
      },
      base: scored.blanked ? 0 : scored.strength,
      baseOriginal: scored.strength,
      bonus: scored.bonusPoints || 0,
      penalty: scored.penaltyPoints || 0,
      total: scored.points(),
      blanked: scored.blanked,
      blankedBy: scored.blanked ? blankSources.get(scored.id) || null : null,
      penaltyCleared: scored.penaltyCleared,
      penaltyClearedBy: scored.penaltyCleared ? penaltyClearSources.get(scored.id) || null : null
    };
  });

  return { total, rows };
}

function getBlankSources(scoringHand) {
  const sources = new Map();
  const cards = scoringHand.cards();

  cards.forEach((blanker) => {
    if (typeof blanker.blanks !== "function" || blanker.penaltyCleared) return;
    cards.forEach((target) => {
      if (!target.blanked || target.id === blanker.id) return;
      let blanksTarget = false;
      try {
        blanksTarget = Boolean(blanker.blanks(target, scoringHand));
      } catch {
        blanksTarget = false;
      }
      if (!blanksTarget || !canBlankerApply(blanker, target, scoringHand)) return;
      if (!sources.has(target.id)) {
        sources.set(target.id, {
          id: blanker.id,
          name: blanker.name,
          reason: "source"
        });
      }
    });
  });

  cards.forEach((target) => {
    if (!target.blanked || typeof target.blankedIf !== "function" || target.penaltyCleared) return;
    let blankedByCondition = false;
    try {
      blankedByCondition = Boolean(target.blankedIf(scoringHand));
    } catch {
      blankedByCondition = false;
    }
    if (!blankedByCondition || sources.has(target.id)) return;
    sources.set(target.id, {
      id: target.id,
      name: target.name,
      reason: "condition"
    });
  });

  return sources;
}

function canBlankerApply(blanker, target, scoringHand) {
  if (!blanker.blanked) return true;
  if (typeof target.blanks !== "function") return false;
  try {
    return Boolean(target.blanks(blanker, scoringHand));
  } catch {
    return false;
  }
}

function getPenaltyClearSources(scoringHand) {
  const sources = new Map();
  const cards = scoringHand.cards();
  cards.forEach((clearer) => {
    if (typeof clearer.clearsPenalty !== "function") return;
    cards.forEach((target) => {
      if (!target.penaltyCleared) return;
      let clearsTarget = false;
      try {
        clearsTarget = Boolean(clearer.clearsPenalty(target));
      } catch {
        clearsTarget = false;
      }
      if (!clearsTarget) return;
      if (!sources.has(target.id) || clearer.id === SOURCE_CARD_IDS.island) {
        sources.set(target.id, {
          id: clearer.id,
          name: clearer.name
        });
      }
    });
  });
  return sources;
}

function renderWithCardMove(card, sourceElement, onComplete) {
  const sourceRect = sourceElement?.getBoundingClientRect?.();
  render();
  if (!sourceRect) {
    onComplete?.();
    return;
  }
  scheduleFrame(() => {
    animateCardMove(card.id, sourceRect, onComplete);
  });
}

function scheduleFrame(callback) {
  if (typeof window.requestAnimationFrame === "function") {
    window.requestAnimationFrame(callback);
  } else {
    window.setTimeout(callback, 16);
  }
}

function animateCardMove(cardId, sourceRect, onComplete) {
  const target = els.playerHand.querySelector(dataCardSelector(cardId));
  if (!target) {
    onComplete?.();
    return;
  }

  animateCardElementToTarget(target.cloneNode(true), sourceRect, target.getBoundingClientRect(), {
    hideTarget: target,
    onComplete
  });
}

function renderWithDiscardMove(card, sourceElement, onComplete) {
  const sourceRect = sourceElement?.getBoundingClientRect?.();
  render();
  if (!sourceRect) {
    onComplete?.();
    return;
  }
  scheduleFrame(() => animateCardToDiscard(card, sourceRect, onComplete));
}

function animateCardToDiscard(card, sourceRect, onComplete) {
  const target = els.discardArea.querySelector(dataCardSelector(card.id));
  if (!target) {
    onComplete?.();
    return;
  }

  animateCardElementToTarget(target.cloneNode(true), sourceRect, target.getBoundingClientRect(), {
    hideTarget: target,
    onComplete
  });
}

function renderWithAiDrawMove(card, sourceRect, playerId, hiddenCard, onComplete) {
  render();
  if (!sourceRect) {
    onComplete?.();
    return;
  }
  scheduleFrame(() => animateCardToOpponent(card, sourceRect, playerId, hiddenCard, onComplete));
}

function animateCardToOpponent(card, sourceRect, playerId, hiddenCard, onComplete) {
  const target = getOpponentLandingElement(playerId);
  if (!target) {
    onComplete?.();
    return;
  }

  const movingCard = hiddenCard ? createCardBackElement() : createCardElement(card, { playable: false });
  animateCardElementToTarget(movingCard, sourceRect, target.getBoundingClientRect(), {
    fadeOut: true,
    onComplete
  });
}

function animateCardElementToTarget(movingCard, sourceRect, targetRect, options = {}) {
  const { hideTarget, fadeOut = false, onComplete } = options;
  const duration = 440;
  let done = false;

  const finish = () => {
    if (done) return;
    done = true;
    movingCard.remove();
    hideTarget?.classList.remove("motion-arriving");
    onComplete?.();
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    onComplete?.();
    return;
  }

  movingCard.classList.add("moving-card");
  movingCard.classList.remove("selected", "playable");
  movingCard.setAttribute("aria-hidden", "true");
  Object.assign(movingCard.style, {
    position: "fixed",
    left: `${sourceRect.left}px`,
    top: `${sourceRect.top}px`,
    width: `${sourceRect.width}px`,
    height: `${sourceRect.height}px`,
    minHeight: `${sourceRect.height}px`,
    margin: "0",
    zIndex: "50",
    pointerEvents: "none",
    opacity: fadeOut ? "0.92" : "0.35"
  });

  hideTarget?.classList.add("motion-arriving");
  document.body.append(movingCard);

  const moveToTarget = () => {
    movingCard.style.transition = [
      `left ${duration}ms cubic-bezier(.18,.82,.26,1)`,
      `top ${duration}ms cubic-bezier(.18,.82,.26,1)`,
      `width ${duration}ms cubic-bezier(.18,.82,.26,1)`,
      `height ${duration}ms cubic-bezier(.18,.82,.26,1)`,
      `min-height ${duration}ms cubic-bezier(.18,.82,.26,1)`,
      `opacity ${duration}ms ease`
    ].join(", ");
    movingCard.style.left = `${targetRect.left}px`;
    movingCard.style.top = `${targetRect.top}px`;
    movingCard.style.width = `${targetRect.width}px`;
    movingCard.style.height = `${targetRect.height}px`;
    movingCard.style.minHeight = `${targetRect.height}px`;
    movingCard.style.opacity = fadeOut ? "0" : "1";
  };

  if (!movingCard.animate) {
    scheduleFrame(moveToTarget);
    window.setTimeout(finish, duration + 90);
    return;
  }

  const animation = movingCard.animate([
    {
      left: `${sourceRect.left}px`,
      top: `${sourceRect.top}px`,
      width: `${sourceRect.width}px`,
      height: `${sourceRect.height}px`,
      minHeight: `${sourceRect.height}px`,
      opacity: fadeOut ? 0.92 : 0.35
    },
    {
      left: `${targetRect.left}px`,
      top: `${targetRect.top}px`,
      width: `${targetRect.width}px`,
      height: `${targetRect.height}px`,
      minHeight: `${targetRect.height}px`,
      opacity: fadeOut ? 0 : 1
    }
  ], {
    duration,
    easing: "cubic-bezier(.18,.82,.26,1)"
  });
  animation.addEventListener("finish", finish, { once: true });
  animation.addEventListener("cancel", finish, { once: true });
  window.setTimeout(finish, duration + 120);
}

function createCardBackElement() {
  const element = document.createElement("div");
  element.className = "moving-card-back";
  element.innerHTML = `<span>◆</span>`;
  return element;
}

function getOpponentPanel(playerId) {
  const escaped = window.CSS?.escape ? window.CSS.escape(String(playerId)) : String(playerId).replace(/"/g, '\\"');
  return document.querySelector(`.opponent[data-player-id="${escaped}"]`);
}

function getOpponentLandingElement(playerId) {
  const panel = getOpponentPanel(playerId);
  if (!panel) return null;
  const minis = panel.querySelectorAll(".mini-card");
  return minis[minis.length - 1] || panel;
}

function dataCardSelector(cardId) {
  const value = String(cardId);
  const escaped = window.CSS?.escape ? window.CSS.escape(value) : value.replace(/"/g, '\\"');
  return `[data-card-id="${escaped}"]`;
}

function drawFromDeck(eventOrElement) {
  if (!canHumanDraw() || state.deck.length === 0) return;
  const sourceElement = eventOrElement?.currentTarget || eventOrElement || els.deckButton;
  const card = state.deck.pop();
  state.animating = true;
  currentPlayer().hand.push(card);
  state.drawnCardId = card.id;
  state.phase = "discard";
  state.selectedCardId = card.id;
  log(`${card.name} 카드를 덱에서 가져왔습니다. 버릴 카드를 선택하세요.`);
  renderWithCardMove(card, sourceElement, () => {
    state.animating = false;
    render();
  });
}

function drawFromDiscard(cardId, sourceElement) {
  if (!canHumanDraw()) return;
  const index = state.discard.findIndex((card) => card.id === cardId);
  if (index < 0) return;
  const [card] = state.discard.splice(index, 1);
  state.animating = true;
  currentPlayer().hand.push(card);
  state.drawnCardId = card.id;
  state.phase = "discard";
  state.selectedCardId = card.id;
  log(`${card.name} 카드를 공개 영역에서 가져왔습니다. 버릴 카드를 선택하세요.`);
  renderWithCardMove(card, sourceElement, () => {
    state.animating = false;
    render();
    speakSingleDialogue("takeDiscard", { excludedIds: [currentPlayer().id] });
  });
}

function discardFromHand(cardId, sourceElement) {
  if (!currentPlayer().human || state.phase !== "discard" || state.finished || state.animating) {
    selectCard(cardId);
    return;
  }
  const player = currentPlayer();
  const index = player.hand.findIndex((card) => card.id === cardId);
  if (index < 0) return;
  const [card] = player.hand.splice(index, 1);
  cleanupUnavailableActions(player);
  state.animating = true;
  state.discard.push(card);
  state.selectedCardId = card.id;
  log(`${player.name}: ${card.name} 카드를 버렸습니다.`);
  renderWithDiscardMove(card, sourceElement, () => {
    state.animating = false;
    endTurn();
  });
}

function endTurn() {
  if (state.discard.length >= discardLimit() || state.deck.length === 0) {
    requestFinishGame();
    return;
  }

  state.drawnCardId = null;
  state.phase = "draw";
  state.activePlayer = (state.activePlayer + 1) % state.players.length;
  if (state.activePlayer === 0) state.turnNumber += 1;
  render();
  syncIdleDialogueTimer();

  if (!currentPlayer().human) {
    window.setTimeout(runAiTurn, 550);
  }
}

function requestFinishGame() {
  stopIdleDialogueTimer();
  state.pendingFinish = true;
  state.phase = "finalActions";
  state.activePlayer = 0;
  state.drawnCardId = null;

  const missing = getRequiredActionIssues(state.players[0]);
  if (missing.length > 0) {
    state.selectedCardId = missing[0].card.id;
    log(`게임 종료 전 ${missing.map((entry) => entry.card.name).join(", ")} 선택을 확정하세요.`);
    render();
    return;
  }

  finishGame();
}

function completePendingFinishIfReady() {
  if (!state.pendingFinish || state.finished) return;
  const missing = getRequiredActionIssues(state.players[0]);
  if (missing.length > 0) {
    return;
  }
  finishGame();
}

function canUseCursedItem(player) {
  return state.includeCursedItems
    && player?.human
    && currentPlayer() === player
    && state.phase === "draw"
    && !state.finished
    && !state.animating;
}

function useActiveCursedItem(player) {
  if (!canUseCursedItem(player) || !player.activeCursedItem) return;
  player.usedCursedItems.push(player.activeCursedItem);
  log(`${player.name}: ${player.activeCursedItem.name} 유물을 사용했습니다.`);
  player.activeCursedItem = null;
  render();
}

function replaceActiveCursedItem(player) {
  if (!canUseCursedItem(player) || !player.activeCursedItem) return;
  if (player.activeCursedItem) {
    state.cursedDiscard.push(player.activeCursedItem);
    log(`${player.name}: ${player.activeCursedItem.name} 유물을 버리고 새 유물을 뽑았습니다.`);
  }
  player.activeCursedItem = drawCursedItem();
  render();
}

function handleAiCursedItem(player) {
  if (!state.includeCursedItems || !player.activeCursedItem) return;
  const current = scorePlayer(player).total;
  const withItem = scoreHand(getScoringHand(player), [...(player.usedCursedItems || []), player.activeCursedItem]).total;
  if (withItem >= current) {
    player.usedCursedItems.push(player.activeCursedItem);
    log(`${player.name}: ${player.activeCursedItem.name} 유물을 사용했습니다.`);
    player.activeCursedItem = null;
  } else if (state.cursedDeck.length > 0 || state.cursedDiscard.length > 0) {
    state.cursedDiscard.push(player.activeCursedItem);
    player.activeCursedItem = drawCursedItem();
    log(`${player.name}: 저주받은 유물을 교체했습니다.`);
  }
}

function finishGame() {
  state.pendingFinish = false;
  state.finished = true;
  state.phase = "finished";
  const ranked = [...state.players]
    .map((player) => ({ player, score: scorePlayer(player).total }))
    .sort((a, b) => b.score - a.score);
  log(`게임 종료. 승자: ${ranked[0].player.name} (${ranked[0].score}점)`);
  stopIdleDialogueTimer();
  render();
  speakAllAiDialogue(null, {
    duration: DIALOGUE_END_DISPLAY_MS,
    eventByPlayer: (player) => ranked[0].player.id === player.id ? "win" : "lose"
  });
  showEndNotification(ranked);
}

function showEndNotification(ranked) {
  if (!els.endDialog || !els.endSummary) return;
  els.endSummary.innerHTML = `
    <strong>${ranked[0].player.name} 승리</strong>
    <span>${ranked[0].score}점으로 게임이 끝났습니다.</span>
    <ol>
      ${ranked.map((entry) => `<li>${entry.player.name} <b>${entry.score}점</b></li>`).join("")}
    </ol>
  `;

  if (typeof els.endDialog.showModal === "function" && !els.endDialog.open) {
    els.endDialog.showModal();
  }
}

function canHumanDraw() {
  return !state.finished && !state.animating && currentPlayer().human && state.phase === "draw";
}

function selectCard(cardId) {
  state.selectedCardId = cardId;
  renderDetail();
  renderCardsSelection();
}

function sortHand() {
  const player = state.players[0];
  player.hand.sort((a, b) => {
    const typeCompare = TYPE_META[a.type].label.localeCompare(TYPE_META[b.type].label, "ko");
    return typeCompare || b.base - a.base;
  });
  render();
}

function runAiTurn() {
  if (state.finished || currentPlayer().human || state.animating) return;
  const player = currentPlayer();
  handleAiCursedItem(player);
  const drawChoice = chooseAiDraw(player);
  let drawn;
  let drawSourceRect = null;
  let hiddenDraw = false;
  const drewFromDiscard = drawChoice.source === "discard";

  if (drewFromDiscard) {
    const sourceCard = state.discard[drawChoice.index];
    drawSourceRect = els.discardArea.querySelector(dataCardSelector(sourceCard.id))?.getBoundingClientRect?.();
    const [card] = state.discard.splice(drawChoice.index, 1);
    drawn = card;
    player.hand.push(card);
    log(`${player.name}: 공개 영역에서 ${card.name} 카드를 가져갔습니다.`);
  } else {
    drawSourceRect = els.deckButton.getBoundingClientRect();
    hiddenDraw = true;
    drawn = state.deck.pop();
    player.hand.push(drawn);
    log(`${player.name}: 덱에서 카드 1장을 가져갔습니다.`);
  }

  state.animating = true;
  if (drewFromDiscard) {
    speakSingleDialogue("takeDiscard", { excludedIds: [player.id] });
  }
  renderWithAiDrawMove(drawn, drawSourceRect, player.id, hiddenDraw, () => {
    const discardId = chooseAiDiscard(player, player.hand);
    const discardIndex = player.hand.findIndex((card) => card.id === discardId);
    const discardSourceRect = getOpponentLandingElement(player.id)?.getBoundingClientRect?.();
    const [discarded] = player.hand.splice(discardIndex, 1);
    state.discard.push(discarded);
    state.selectedCardId = discarded.id;
    log(`${player.name}: ${discarded.name} 카드를 버렸습니다.`);
    speakSingleDialogue("discard", { player });
    renderWithDiscardMove(discarded, { getBoundingClientRect: () => discardSourceRect }, () => {
      state.animating = false;
      endTurn();
    });
  });
}

function aiDifficultyKey(player) {
  return AI_DIFFICULTY_LABELS[player?.difficulty] ? player.difficulty : "normal";
}

function chooseAiDraw(player) {
  const difficulty = aiDifficultyKey(player);
  if (difficulty === "normal") return chooseNormalAiDraw(player);
  return chooseScoredAiDraw(player, difficulty);
}

function chooseNormalAiDraw(player) {
  if (state.discard.length === 0) return { source: "deck" };

  const currentScore = scorePlayer(player).total;
  let best = { source: "deck", value: currentScore + 5 };

  state.discard.forEach((card, index) => {
    const testHand = [...player.hand, card];
    const discardId = chooseNormalAiDiscard(player, testHand);
    const finalHand = testHand.filter((candidate) => candidate.id !== discardId);
    const value = scorePlayer(player, finalHand).total + (card.base * 0.08) + (Math.random() * 1.25);
    if (value > best.value) {
      best = { source: "discard", index, value };
    }
  });

  return best;
}

function chooseScoredAiDraw(player, difficulty) {
  if (state.discard.length === 0) return { source: "deck" };

  const deckBias = difficulty === "boss" ? 0.5 : (difficulty === "expert" ? 2 : 4);
  const currentValue = evaluateAiHandValue(player, player.hand, difficulty);
  let best = { source: "deck", value: currentValue + deckBias };

  if (difficulty === "boss" && state.deck.length > 0) {
    const topDeckCard = state.deck[state.deck.length - 1];
    const testHand = [...player.hand, topDeckCard];
    const discardId = chooseAiDiscard(player, testHand, difficulty);
    const finalHand = testHand.filter((candidate) => candidate.id !== discardId);
    best = { source: "deck", value: evaluateAiHandValue(player, finalHand, difficulty) + 0.35 };
  }

  state.discard.forEach((card, index) => {
    const testHand = [...player.hand, card];
    const discardId = chooseAiDiscard(player, testHand, difficulty);
    const finalHand = testHand.filter((candidate) => candidate.id !== discardId);
    const value = evaluateAiHandValue(player, finalHand, difficulty);
    if (value > best.value) {
      best = { source: "discard", index, value };
    }
  });

  return best;
}

function chooseAiDiscard(player, hand, difficulty = aiDifficultyKey(player)) {
  if (difficulty === "normal") return chooseNormalAiDiscard(player, hand);
  return chooseBestScoreDiscard(player, hand, difficulty);
}

function chooseNormalAiDiscard(player, hand) {
  const score = scorePlayer(player, hand);
  const rowsById = new Map(score.rows.map((row) => [cardSourceId(row.card), row]));
  let worstCard = hand[0];
  let worstValue = Infinity;

  hand.forEach((card) => {
    const row = rowsById.get(cardSourceId(card));
    const value = (row?.total ?? card.base) + (card.base * 0.15) + (Math.random() * 1.2);
    if (value < worstValue) {
      worstValue = value;
      worstCard = card;
    }
  });

  return worstCard.id;
}

function chooseBestScoreDiscard(player, hand, difficulty) {
  let bestCard = hand[0];
  let bestValue = -Infinity;
  let bestTieBreaker = -Infinity;

  hand.forEach((card) => {
    const testHand = hand.filter((candidate) => candidate.id !== card.id);
    const value = evaluateAiHandValue(player, testHand, difficulty);
    const tieBreaker = testHand.reduce((sum, candidate) => sum + candidate.base, 0) - (card.base * 0.05);
    if (value > bestValue || (value === bestValue && tieBreaker > bestTieBreaker)) {
      bestValue = value;
      bestTieBreaker = tieBreaker;
      bestCard = card;
    }
  });

  return bestCard.id;
}

function evaluateAiHandValue(player, hand, difficulty) {
  const score = scorePlayer(player, hand);
  if (difficulty !== "expert" && difficulty !== "boss") return score.total;

  const typeCount = new Set(hand.map((card) => card.type)).size;
  const bonusTotal = score.rows.reduce((sum, row) => sum + Math.max(0, row.bonus), 0);
  const penaltyTotal = score.rows.reduce((sum, row) => sum + Math.min(0, row.penalty), 0);
  const blankedCount = score.rows.filter((row) => row.blanked).length;
  const penaltyClearedCount = score.rows.filter((row) => row.penaltyCleared).length;
  if (difficulty === "boss") {
    const deadWeightCount = score.rows.filter((row) => row.blanked || row.total <= 0).length;
    return score.total
      + (typeCount * 0.45)
      + Math.min(10, bonusTotal * 0.05)
      + (penaltyClearedCount * 2)
      + (estimateActionPotential(hand) * 1.45)
      - (blankedCount * 2.6)
      - (deadWeightCount * 0.8)
      + Math.max(-9, penaltyTotal * 0.08);
  }

  return score.total
    + (typeCount * 0.25)
    + Math.min(6, bonusTotal * 0.03)
    + (penaltyClearedCount * 1.25)
    + estimateActionPotential(hand)
    - (blankedCount * 1.6)
    + Math.max(-5, penaltyTotal * 0.04);
}

function estimateActionPotential(hand) {
  return hand.reduce((sum, card) => {
    const type = getActionControlType(card);
    if (!type) return sum;
    if (type === "necromancer") return sum + (buildDiscardTargetOptions(NECROMANCER_TARGET_TYPES).length > 0 ? 2.4 : 0.4);
    if (type === "doppelganger" || type === "bookOfChanges" || type === "angel") return sum + 1.4;
    if (type === "shapeshifter" || type === "mirage") return sum + 1.1;
    if (type === "island") return sum + 1;
    return sum + 0.5;
  }, 0);
}

function render() {
  renderStatus();
  renderOpponents();
  renderTable();
  renderPlayerHand();
  renderDetail();
}

function renderStatus() {
  const player = currentPlayer();
  els.turnLabel.textContent = state.finished ? "게임 종료" : `${player.name} / ${state.turnNumber}라운드`;
  els.phaseLabel.textContent = phaseText();

  els.scoreList.innerHTML = "";
  state.players.filter((entry) => entry.human).forEach((entry) => {
    const score = scorePlayer(entry).total;
    const card = document.createElement("div");
    card.className = `score-card${entry.id === state.activePlayer && !state.finished ? " active" : ""}`;
    card.innerHTML = `
      <div class="name-line">
        ${playerNameTagHtml(entry)}
        <span>${state.finished || entry.human ? `${score}점` : "?점"}</span>
      </div>
      <small>${entry.hand.length}장 보유</small>
    `;
    els.scoreList.append(card);
  });
}

function phaseText() {
  if (state.finished) return "점수 계산 완료";
  if (state.pendingFinish || state.phase === "finalActions") return "마지막 선택";
  if (state.animating) return "이동 중";
  if (state.phase === "draw") return currentPlayer().human ? "가져오기" : "AI 생각 중";
  if (state.phase === "discard") return "버리기";
  return "대기";
}

function renderOpponents() {
  els.opponentsRow.innerHTML = "";
  state.players.slice(1).forEach((player, offset) => {
    const index = offset + 1;
    const opponent = document.createElement("div");
    opponent.className = `opponent${index === state.activePlayer && !state.finished ? " active" : ""}`;
    opponent.dataset.playerId = player.id;
    const score = scorePlayer(player).total;
    opponent.innerHTML = `
      <div class="opponent-head">
        ${playerNameTagHtml(player)}
        <small>${state.finished ? `${score}점` : "점수 비공개"}</small>
      </div>
      ${playerSpeechBubbleHtml(player)}
    `;
    if (state.finished) {
      opponent.classList.add("revealed-opponent");
      const revealedHand = document.createElement("div");
      revealedHand.className = "revealed-hand";
      revealedHand.setAttribute("aria-label", `${player.name} 공개 손패 ${player.hand.length}장`);
      player.hand.forEach((card) => {
        revealedHand.append(createRevealedCardElement(card));
      });
      opponent.append(revealedHand);
    } else {
      const miniHand = document.createElement("div");
      miniHand.className = "mini-hand";
      miniHand.setAttribute("aria-label", `${player.name} 손패 ${player.hand.length}장`);
      miniHand.innerHTML = player.hand.map(() => '<span class="mini-card"></span>').join("");
      opponent.append(miniHand);
    }
    els.opponentsRow.append(opponent);
  });
}

function renderTable() {
  els.deckCount.textContent = state.deck.length;
  els.discardCount.textContent = state.discard.length;
  if (els.discardLimitLabel) {
    els.discardLimitLabel.textContent = `/${discardLimit()}`;
  }
  if (els.endHint) {
    els.endHint.textContent = `${discardLimit()}장이 되면 종료`;
  }
  if (els.discardProgress) {
    const progress = Math.min(100, (state.discard.length / discardLimit()) * 100);
    els.discardProgress.style.width = `${progress}%`;
    els.discardProgress.classList.toggle("full", state.discard.length >= discardLimit());
  }
  els.deckButton.disabled = !canHumanDraw() || state.deck.length === 0;

  els.discardArea.innerHTML = "";
  if (state.discard.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty-detail";
    empty.textContent = "아직 공개된 카드가 없습니다.";
    els.discardArea.append(empty);
  } else {
    state.discard.forEach((card) => {
      const slot = document.createElement("div");
      slot.className = "discard-card-slot";
      slot.append(createCardElement(card, {
        playable: canHumanDraw(),
        onClick: (event) => canHumanDraw() ? drawFromDiscard(card.id, event.currentTarget) : selectCard(card.id)
      }));
      els.discardArea.append(slot);
    });
  }
}

function renderPlayerHand() {
  const player = state.players[0];
  cleanupUnavailableActions(player);
  const scoreHandCards = getScoringHand(player);
  const score = scorePlayer(player, scoreHandCards);
  const scoreRowsBySourceId = new Map(score.rows.map((row) => [cardSourceId(row.card), row]));
  els.handScore.textContent = `${score.total}점`;
  els.playerHand.style.setProperty("--hand-card-count", Math.max(player.hand.length, 1));
  els.playerHand.innerHTML = "";
  player.hand.forEach((card) => {
    els.playerHand.append(createCardElement(card, {
      scoreRow: scoreRowsBySourceId.get(cardSourceId(card)) || null,
      playable: state.phase === "discard" && currentPlayer().human && !state.finished && !state.animating,
      onClick: (event) => {
        if (state.phase === "discard" && currentPlayer().human && !state.finished && !state.animating) {
          discardFromHand(card.id, event.currentTarget);
        } else {
          selectCard(card.id);
        }
      }
    }));
  });

  renderScoreActions(player);
  renderScoreBreakdown(score);
}

function attachCardZoom(cardElement, card, options = {}) {
  let longPressTimer = 0;
  let pointerId = null;
  let startX = 0;
  let startY = 0;
  let zoomTriggered = false;

  const clearLongPress = () => {
    if (longPressTimer) {
      window.clearTimeout(longPressTimer);
      longPressTimer = 0;
    }
  };

  const finishPress = (event) => {
    if (pointerId !== null && event.pointerId !== pointerId) return;
    clearLongPress();
    if (pointerId !== null && cardElement.hasPointerCapture?.(pointerId)) {
      cardElement.releasePointerCapture(pointerId);
    }
    pointerId = null;
    if (zoomTriggered) {
      suppressNextCardClick();
      hideCardZoom();
    }
  };

  cardElement.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    clearLongPress();
    pointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    zoomTriggered = false;
    cardElement.setPointerCapture?.(event.pointerId);
    longPressTimer = window.setTimeout(() => {
      longPressTimer = 0;
      if (!cardElement.isConnected) return;
      zoomTriggered = true;
      suppressNextCardClick();
      showCardZoom(card, cardElement, options);
    }, CARD_LONG_PRESS_MS);
  });

  cardElement.addEventListener("pointermove", (event) => {
    if (pointerId !== event.pointerId || zoomTriggered) return;
    const distance = Math.hypot(event.clientX - startX, event.clientY - startY);
    if (distance > CARD_LONG_PRESS_MOVE_LIMIT) {
      clearLongPress();
    }
  });

  cardElement.addEventListener("pointerup", finishPress);
  cardElement.addEventListener("pointercancel", finishPress);
  cardElement.addEventListener("pointerleave", (event) => {
    if (pointerId === event.pointerId && !zoomTriggered) {
      finishPress(event);
    }
  });
  cardElement.addEventListener("contextmenu", (event) => {
    if (zoomTriggered || activeCardZoom) {
      event.preventDefault();
    }
  });
}

function suppressNextCardClick() {
  suppressCardClick = true;
  window.setTimeout(() => {
    suppressCardClick = false;
  }, 300);
}

function shouldSuppressCardClick(event) {
  if (!suppressCardClick) return false;
  event.preventDefault();
  event.stopPropagation();
  suppressCardClick = false;
  return true;
}

function showCardZoom(card, sourceElement, options = {}) {
  hideCardZoom();
  const sourceRect = sourceElement.getBoundingClientRect();
  const sourceWidth = Math.max(1, sourceRect.width);
  const sourceHeight = Math.max(1, sourceRect.height);
  const overlay = document.createElement("div");
  const stage = document.createElement("div");
  const preview = buildCardElement(card, { playable: false, scoreRow: options.scoreRow || null });

  overlay.className = "card-zoom-overlay";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", "Card zoom");
  stage.className = "card-zoom-stage";
  stage.style.width = `${sourceWidth * CARD_ZOOM_SCALE}px`;
  stage.style.height = `${sourceHeight * CARD_ZOOM_SCALE}px`;
  preview.classList.add("card-zoom-preview");
  preview.tabIndex = -1;
  preview.setAttribute("aria-hidden", "true");
  preview.style.width = `${sourceWidth}px`;
  preview.style.height = `${sourceHeight}px`;
  preview.style.minHeight = `${sourceHeight}px`;
  preview.style.setProperty("--card-zoom-scale", CARD_ZOOM_SCALE);

  stage.append(preview);
  overlay.append(stage);
  overlay.addEventListener("click", hideCardZoom);
  activeCardZoom = overlay;
  document.body.classList.add("card-zoom-open");
  document.body.append(overlay);
  window.addEventListener("keydown", handleCardZoomKeydown);
  window.requestAnimationFrame(() => overlay.classList.add("visible"));
}

function hideCardZoom() {
  if (!activeCardZoom) return;
  activeCardZoom.remove();
  activeCardZoom = null;
  document.body.classList.remove("card-zoom-open");
  window.removeEventListener("keydown", handleCardZoomKeydown);
}

function handleCardZoomKeydown(event) {
  if (event.key === "Escape") {
    hideCardZoom();
  }
}

function buildCardElement(card, options = {}) {
  const meta = TYPE_META[card.type];
  const artUrl = cardArtUrl(card);
  const penaltyClearInfo = getPenaltyClearInfo(card, options.scoreRow);
  const blankInfo = getBlankInfo(card, options.scoreRow);
  const statusInfo = blankInfo || penaltyClearInfo;
  const statusTooltip = statusInfo
    ? `<span class="card-status-tooltip">${escapeHtml(statusInfo.title)}</span>`
    : "";
  const button = document.createElement("button");
  button.type = "button";
  button.className = `card ${options.playable ? "playable" : "disabled-card"}${artUrl ? " has-art" : ""}${blankInfo ? " blanked-card" : ""}${state.selectedCardId === card.id ? " selected" : ""}`;
  button.style.setProperty("--card-color", meta.color);
  button.dataset.cardId = card.id;
  button.dataset.glyph = meta.glyph;
  button.innerHTML = `
    ${statusTooltip}
    <div class="card-head">
      <span class="card-name">${card.name}</span>
      <span class="card-points">${card.base}</span>
    </div>
    <div class="card-art" aria-hidden="true">
      ${artUrl ? `<img src="${artUrl}" alt="" loading="lazy" />` : `<span>${meta.glyph}</span>`}
    </div>
    <span class="card-type">${meta.label}</span>
    <p class="card-effect">${formatCardEffectText(card.text, penaltyClearInfo)}</p>
  `;
  if (statusInfo) {
    const showClearTooltip = () => button.classList.add("show-clear-tooltip");
    const hideClearTooltip = () => button.classList.remove("show-clear-tooltip");
    button.addEventListener("pointerenter", showClearTooltip);
    button.addEventListener("pointerover", showClearTooltip);
    button.addEventListener("mousemove", showClearTooltip);
    button.addEventListener("pointerleave", hideClearTooltip);
    button.addEventListener("mouseleave", hideClearTooltip);
    button.addEventListener("focus", showClearTooltip);
    button.addEventListener("blur", hideClearTooltip);
  }
  return button;
}

function createCardElement(card, options = {}) {
  const button = buildCardElement(card, options);
  attachCardZoom(button, card, options);
  button.addEventListener("click", (event) => {
    if (shouldSuppressCardClick(event)) return;
    const handler = options.onClick || (() => selectCard(card.id));
    handler(event);
  });
  return button;
}

function createRevealedCardElement(card) {
  const meta = TYPE_META[card.type];
  const button = document.createElement("button");
  button.type = "button";
  button.className = `revealed-card${state.selectedCardId === card.id ? " selected" : ""}`;
  button.style.setProperty("--card-color", meta.color);
  button.dataset.cardId = card.id;
  button.innerHTML = `
    <span class="revealed-card-name">${card.name}</span>
    <span class="revealed-card-meta">${meta.label} · ${card.base}점</span>
  `;
  attachCardZoom(button, card);
  button.addEventListener("click", (event) => {
    if (shouldSuppressCardClick(event)) return;
    selectCard(card.id);
  });
  return button;
}

function catalogTypeOrder(card) {
  const order = SOURCE_SUIT_OPTIONS.findIndex((option) => option.value === card.type);
  if (order >= 0) return order;
  if (card.type === "cursed-item") return SOURCE_SUIT_OPTIONS.length + 1;
  return SOURCE_SUIT_OPTIONS.length;
}

function catalogCards() {
  const cards = [...CARD_LIBRARY];
  if (state.includeCursedItems) {
    cards.push(...CURSED_ITEM_LIBRARY);
  }
  return cards.sort((a, b) => (
    catalogTypeOrder(a) - catalogTypeOrder(b)
    || a.base - b.base
    || a.name.localeCompare(b.name, "ko")
  ));
}

function createCatalogCard(card) {
  const meta = TYPE_META[card.type] || TYPE_META.wild;
  const artUrl = cardArtUrl(card);
  const item = document.createElement("article");
  item.className = "catalog-card";
  item.style.setProperty("--card-color", meta.color);
  item.innerHTML = `
    <div class="catalog-art" aria-hidden="true">
      ${artUrl ? `<img src="${artUrl}" alt="" loading="lazy" />` : `<span>${meta.glyph}</span>`}
    </div>
    <div class="catalog-info">
      <div class="catalog-head">
        <strong class="catalog-name">${escapeHtml(card.name)}</strong>
        <span class="catalog-base">${card.base}</span>
      </div>
      <span class="catalog-meta">${escapeHtml(meta.label)}</span>
      <p class="catalog-effect">${formatCardEffectText(card.text || "효과 없음")}</p>
    </div>
  `;
  return item;
}

function openCardCatalog() {
  if (!els.cardCatalogDialog || !els.cardCatalogList) return;
  const cards = catalogCards();
  els.cardCatalogList.innerHTML = "";
  const fragment = document.createDocumentFragment();
  cards.forEach((card) => {
    fragment.append(createCatalogCard(card));
  });
  els.cardCatalogList.append(fragment);
  if (els.cardCatalogSummary) {
    const cursedCount = state.includeCursedItems ? CURSED_ITEM_LIBRARY.length : 0;
    const expansionText = state.includeExpansion ? "확장팩 포함" : "오리지널";
    const cursedText = state.includeCursedItems ? `저주받은 유물 ${cursedCount}장 포함` : "저주받은 유물 제외";
    els.cardCatalogSummary.textContent = `${expansionText} · ${cursedText} · 총 ${cards.length}장`;
  }
  if (typeof els.cardCatalogDialog.showModal === "function" && !els.cardCatalogDialog.open) {
    els.cardCatalogDialog.showModal();
  }
}

function renderCardsSelection() {
  document.querySelectorAll(".card").forEach((cardElement) => {
    cardElement.classList.toggle("selected", cardElement.dataset.cardId === state.selectedCardId);
  });
}

function getSelectedCard() {
  const allKnownCards = [
    ...state.deck,
    ...state.discard,
    ...state.cursedDeck,
    ...state.cursedDiscard,
    ...state.players.flatMap((player) => [
      ...player.hand,
      ...(player.activeCursedItem ? [player.activeCursedItem] : []),
      ...(player.usedCursedItems || [])
    ])
  ];
  return allKnownCards.find((card) => card.id === state.selectedCardId) || null;
}

function renderDetail() {
  if (!els.cardDetail) return;
  const card = getSelectedCard();
  if (!card) {
    els.cardDetail.className = "card-detail empty-detail";
    els.cardDetail.textContent = "카드를 선택하면 효과와 점수 내역이 표시됩니다.";
    return;
  }

  const meta = TYPE_META[card.type];
  const effectHtml = [
    card.bonusText ? `<div class="detail-effect-row bonus-value"><strong>보너스</strong><span>${card.bonusText}</span></div>` : "",
    card.penaltyText ? `<div class="detail-effect-row penalty-value"><strong>패널티</strong><span>${card.penaltyText}</span></div>` : "",
    card.actionText ? `<div class="detail-effect-row"><strong>선택</strong><span>${card.actionText}</span></div>` : ""
  ].join("");
  els.cardDetail.className = "card-detail";
  els.cardDetail.innerHTML = `
    <div class="detail-card-name">${card.name}</div>
    <div class="detail-meta">${meta.label} · 기본 ${card.base}점</div>
    <div class="detail-effect">${effectHtml || card.text || "효과 없음"}</div>
  `;
}

function renderScoreActions(player) {
  els.scoreActions.innerHTML = "";
  if (!player) {
    els.scoreActions.classList.add("hidden");
    return;
  }

  cleanupUnavailableActions(player);
  const actionCards = player.hand.filter((card) => getActionControlType(card));
  const missing = state.pendingFinish ? getRequiredActionIssues(player) : [];
  const cursedPanel = createCursedItemControl(player);
  els.scoreActions.classList.toggle("hidden", actionCards.length === 0 && missing.length === 0 && !cursedPanel);
  if (cursedPanel) {
    els.scoreActions.append(cursedPanel);
  }
  if (missing.length > 0) {
    const notice = document.createElement("div");
    notice.className = "score-action-notice";
    notice.textContent = `게임 종료 전 확정 필요: ${missing.map((entry) => entry.card.name).join(", ")}`;
    els.scoreActions.append(notice);
  }
  actionCards.forEach((card) => {
    els.scoreActions.append(createActionControl(card, player));
  });
}

function createCursedItemControl(player) {
  if (!state.includeCursedItems || !player?.human) return null;
  const section = document.createElement("section");
  const active = player.activeCursedItem;
  const usedCount = player.usedCursedItems?.length || 0;
  section.className = "score-action-card cursed-item-control";
  section.innerHTML = `
    <div class="action-card-title">
      <strong>저주받은 유물</strong>
      <span>${active ? "앞면" : "없음"} / 사용 ${usedCount}장</span>
    </div>
    <div class="cursed-item-summary">
      ${active ? `<b>${active.name}</b><span>${active.base}점</span><small>${active.text || "효과 없음"}</small>` : "<span>현재 앞면 유물이 없습니다.</span>"}
    </div>
  `;
  const actions = document.createElement("div");
  actions.className = "cursed-item-actions";

  const useButton = document.createElement("button");
  useButton.type = "button";
  useButton.className = "secondary-button";
  useButton.textContent = "사용";
  useButton.disabled = !active || !canUseCursedItem(player);
  useButton.addEventListener("click", () => useActiveCursedItem(player));

  const replaceButton = document.createElement("button");
  replaceButton.type = "button";
  replaceButton.className = "secondary-button";
  replaceButton.textContent = "교체";
  replaceButton.disabled = !active || !canUseCursedItem(player);
  replaceButton.addEventListener("click", () => replaceActiveCursedItem(player));

  actions.append(useButton, replaceButton);
  section.append(actions);
  return section;
}

function cleanupUnavailableActions(player) {
  const handActionIds = new Set(player.hand.map((card) => cardActionKey(cardSourceId(card))));
  const controlIds = new Set(Object.values(SOURCE_CARD_GROUPS).flat().map((id) => cardActionKey(id)));
  Object.keys(state.cardActions).forEach((key) => {
    if (controlIds.has(key) && !handActionIds.has(key)) {
      delete state.cardActions[key];
    }
  });
  Object.keys(state.confirmedActions).forEach((key) => {
    if (controlIds.has(key) && !handActionIds.has(key)) {
      delete state.confirmedActions[key];
    }
  });
  cleanupInvalidActionTargets(player);
}

function cleanupInvalidActionTargets(player) {
  player.hand.forEach((card) => {
    if (!getActionControlType(card)) return;
    const sourceId = cardSourceId(card);
    const key = cardActionKey(sourceId);
    const action = state.cardActions[key];
    if (!action) return;
    if (isActionTargetAvailable(card, player, action)) return;

    delete state.cardActions[key];
    delete state.confirmedActions[key];
  });
}

function isActionTargetAvailable(card, player, action) {
  const sourceId = cardSourceId(card);
  const type = getActionControlType(card);
  const targetId = String(action[0] || "");
  if (!targetId) return true;

  if (type === "shapeshifter") {
    const target = getSourceCardById(targetId);
    return Boolean(target && SHAPESHIFTER_TARGET_TYPES.includes(target.type));
  }

  if (type === "mirage") {
    const target = getSourceCardById(targetId);
    return Boolean(target && MIRAGE_TARGET_TYPES.includes(target.type));
  }

  if (type === "doppelganger" || type === "bookOfChanges" || type === "angel") {
    return targetId !== sourceId && hasCardSource(player.hand, targetId);
  }

  if (type === "island") {
    const target = player.hand.find((candidate) => cardSourceId(candidate) === targetId);
    return Boolean(target && (["flood", "flame"].includes(target.type) || isPhoenixCard(target)));
  }

  if (type === "necromancer") {
    return state.discard.some((discardCard) => (
      cardSourceId(discardCard) === targetId && NECROMANCER_TARGET_TYPES.includes(discardCard.type)
    ));
  }

  return true;
}

function getActionControlType(card) {
  const sourceId = cardSourceId(card);
  if (isSourceId(sourceId, "shapeshifter")) return "shapeshifter";
  if (isSourceId(sourceId, "mirage")) return "mirage";
  if (isSourceId(sourceId, "doppelganger")) return "doppelganger";
  if (isSourceId(sourceId, "necromancer")) return "necromancer";
  if (isSourceId(sourceId, "bookOfChanges")) return "bookOfChanges";
  if (isSourceId(sourceId, "island")) return "island";
  if (isSourceId(sourceId, "angel")) return "angel";
  return null;
}

function createActionControl(card, player) {
  const sourceId = cardSourceId(card);
  const type = getActionControlType(card);
  const action = getCardAction(sourceId) || [];
  const requiresChoice = doesActionRequireChoice(card, player);
  const section = document.createElement("section");
  section.className = "score-action-card";
  if (state.pendingFinish && requiresChoice) {
    section.classList.add(isCardActionConfirmed(card, player) ? "complete" : "required");
  }
  section.innerHTML = `
    <div class="action-card-title">
      <strong>${card.name}</strong>
      <span>${actionLabel(type)}</span>
    </div>
  `;

  const fields = document.createElement("div");
  fields.className = "action-fields";

  if (type === "shapeshifter") {
    fields.append(createSelectField("복사", action[0] || "", buildGlobalTargetOptions(SHAPESHIFTER_TARGET_TYPES), (value) => {
      setCardAction(sourceId, [value]);
      render();
    }));
  } else if (type === "mirage") {
    fields.append(createSelectField("복사", action[0] || "", buildGlobalTargetOptions(MIRAGE_TARGET_TYPES), (value) => {
      setCardAction(sourceId, [value]);
      render();
    }));
  } else if (type === "doppelganger") {
    fields.append(createSelectField("복사", action[0] || "", buildHandTargetOptions(player.hand, sourceId), (value) => {
      setCardAction(sourceId, [value]);
      render();
    }));
  } else if (type === "necromancer") {
    fields.append(createSelectField("추가", action[0] || "", buildDiscardTargetOptions(NECROMANCER_TARGET_TYPES), (value) => {
      setCardAction(sourceId, [value]);
      render();
    }));
  } else if (type === "bookOfChanges") {
    fields.append(createSelectField("대상", action[0] || "", buildHandTargetOptions(player.hand, sourceId), (value) => {
      setCardAction(sourceId, [value, action[1] || ""]);
      render();
    }));
    fields.append(createSelectField("종류", action[1] || "", getAvailableSuitOptions(), (value) => {
      setCardAction(sourceId, [action[0] || "", value]);
      render();
    }));
  } else if (type === "island") {
    fields.append(createSelectField("보호", action[0] || "", getIslandTargetOptions(player.hand, sourceId), (value) => {
      setCardAction(sourceId, [value]);
      render();
    }));
  } else if (type === "angel") {
    fields.append(createSelectField("보호", action[0] || "", buildHandTargetOptions(player.hand, sourceId), (value) => {
      setCardAction(sourceId, [value]);
      render();
    }));
  }

  if (requiresChoice) {
    fields.classList.add("with-confirm");
    fields.append(createActionConfirmButton(card, player));
  }

  if (state.pendingFinish && requiresChoice) {
    const note = document.createElement("div");
    note.className = "action-required-note";
    note.textContent = isCardActionConfirmed(card, player) ? "확정 완료" : "게임 종료 전 확정 필요";
    section.append(note);
  }
  section.append(fields);
  return section;
}

function createActionConfirmButton(card, player) {
  const button = document.createElement("button");
  const confirmed = isCardActionConfirmed(card, player);
  const complete = isCardActionComplete(card, player);
  button.type = "button";
  button.className = "action-confirm-button";
  button.textContent = confirmed ? "확정됨" : "확정";
  button.disabled = confirmed || !complete;
  button.addEventListener("click", () => {
    if (!confirmCardAction(card, player)) return;
    completePendingFinishIfReady();
    if (!state.finished) render();
  });
  return button;
}

function actionLabel(type) {
  const labels = {
    shapeshifter: "이름/종류 복사",
    mirage: "이름/종류 복사",
    doppelganger: "손패 복사",
    necromancer: "버린 카드 추가",
    bookOfChanges: "종류 변경",
    island: "패널티 제거",
    angel: "무효 방지"
  };
  return labels[type] || "";
}

function createSelectField(label, selectedValue, options, onChange) {
  const field = document.createElement("label");
  field.className = "action-field";

  const labelText = document.createElement("span");
  labelText.textContent = label;

  const select = document.createElement("select");
  const hasOptions = options.length > 0;
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = hasOptions ? "선택 안 함" : "대상 없음";
  select.append(defaultOption);

  options.forEach((option) => {
    const item = document.createElement("option");
    item.value = String(option.value);
    item.textContent = option.label;
    select.append(item);
  });

  select.value = options.some((option) => String(option.value) === String(selectedValue)) ? String(selectedValue) : "";
  select.disabled = !hasOptions;
  select.addEventListener("change", () => {
    onChange(select.value);
    completePendingFinishIfReady();
  });

  field.append(labelText, select);
  return field;
}

function buildGlobalTargetOptions(types) {
  return buildCardOptions(CARD_LIBRARY.filter((card) => (
    card.sourceId !== undefined && types.includes(card.type)
  )));
}

function getAvailableSuitOptions() {
  const available = new Set(CARD_LIBRARY.map((card) => card.type));
  return SOURCE_SUIT_OPTIONS.filter((option) => available.has(option.value));
}

function buildDiscardTargetOptions(types) {
  return buildCardOptions(state.discard.filter((card) => types.includes(card.type)));
}

function buildHandTargetOptions(hand, sourceId) {
  return buildCardOptions(hand.filter((card) => cardSourceId(card) !== sourceId));
}

function getIslandTargetOptions(hand, sourceId) {
  return buildCardOptions(hand.filter((card) => (
    cardSourceId(card) !== sourceId && (["flood", "flame"].includes(card.type) || isPhoenixCard(card))
  )));
}

function buildCardOptions(cards) {
  return cards
    .map((card) => {
      const meta = TYPE_META[card.type] || { label: card.type };
      return {
        value: cardSourceId(card),
        label: `${card.name} (${meta.label})`
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label, "ko"));
}

function renderScoreBreakdown(score) {
  els.scoreBreakdown.innerHTML = "";
  const baseTotal = score.rows.reduce((sum, row) => sum + row.base, 0);
  const bonusRows = score.rows.filter((row) => row.bonus > 0).sort((a, b) => b.bonus - a.bonus);
  const penaltyRows = score.rows.filter((row) => row.penalty < 0).sort((a, b) => a.penalty - b.penalty);
  const neutralRows = score.rows
    .filter((row) => row.bonus === 0 && row.penalty === 0)
    .sort((a, b) => b.base - a.base);
  const bonusTotal = bonusRows.reduce((sum, row) => sum + row.bonus, 0);
  const penaltyTotal = penaltyRows.reduce((sum, row) => sum + row.penalty, 0);

  const summary = document.createElement("div");
  summary.className = "breakdown-summary";
  summary.innerHTML = `
    <div><span>기본</span><strong>${baseTotal}점</strong></div>
    <div><span>보너스</span><strong class="bonus-value">+${bonusTotal}점</strong></div>
    <div><span>패널티</span><strong class="penalty-value">${penaltyTotal}점</strong></div>
    <div><span>총점</span><strong>${score.total}점</strong></div>
  `;
  els.scoreBreakdown.append(summary);

  renderBreakdownSection("보너스", bonusRows, "bonus", "bonus");
  renderBreakdownSection("패널티", penaltyRows, "penalty", "penalty");
  renderBreakdownSection("효과 없음", neutralRows, "neutral");
}

function renderBreakdownSection(title, rows, type, pointKey = "total") {
  const section = document.createElement("section");
  section.className = `breakdown-section ${type}-section`;

  const total = rows.reduce((sum, row) => sum + row[pointKey], 0);
  const displayTotal = type === "neutral" ? `${rows.length}장` : `${formatSigned(total)}점`;
  section.innerHTML = `
    <div class="breakdown-section-head">
      <span>${title}</span>
      <strong>${displayTotal}</strong>
    </div>
  `;

  if (rows.length === 0) {
    const empty = document.createElement("div");
    empty.className = "breakdown-empty";
    empty.textContent = `${title} 카드 없음`;
    section.append(empty);
  } else {
    rows.forEach((row) => {
      const item = document.createElement("div");
      item.className = "breakdown-row";
      const value = row[pointKey];
      const statusText = row.blanked
        ? `무효 / 기본 ${row.baseOriginal}`
        : `기본 ${row.baseOriginal}${row.penaltyCleared ? " / 패널티 제거" : ""}`;
      item.innerHTML = `
        <span>${row.card.name}<br><small>${statusText} / ${type === "neutral" ? "합계" : title} ${formatSigned(value)}</small></span>
        <strong class="${value > 0 ? "bonus-value" : value < 0 ? "penalty-value" : ""}">${row.total}점</strong>
      `;
      section.append(item);
    });
  }

  els.scoreBreakdown.append(section);
}

function formatSigned(value) {
  return value > 0 ? `+${value}` : `${value}`;
}

els.startButton.addEventListener("click", startGame);
els.newGameButton.addEventListener("click", () => {
  els.setupPanel.classList.remove("hidden");
  els.gameBoard.classList.add("hidden");
  state.phase = "setup";
  state.pendingFinish = false;
  state.finished = false;
  state.confirmedActions = {};
  updateTitleArt();
});
els.expansionCheckbox?.addEventListener("change", updateTitleArt);
els.deckButton.addEventListener("click", drawFromDeck);
els.cardCatalogButton?.addEventListener("click", openCardCatalog);
els.sortButton.addEventListener("click", sortHand);
els.rulesButton.addEventListener("click", () => els.rulesDialog.showModal());
els.restartGameButton.addEventListener("click", () => {
  els.endDialog.close();
  startGame();
});

updateTitleArt();
