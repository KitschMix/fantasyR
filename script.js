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
  chAngel: typeof CH_ANGEL !== "undefined" ? CH_ANGEL : "CH08",
  chGenie: typeof CH_GENIE !== "undefined" ? CH_GENIE : "CH06",
  chLeprechaun: typeof CH_LEPRECHAUN !== "undefined" ? CH_LEPRECHAUN : "CH09",
  rangers: "FR25",
  chRangers: "CH19",
  warship: "FR41"
};

const SOURCE_CARD_GROUPS = {
  leprechaun: [SOURCE_CARD_IDS.chLeprechaun],
  genie: [SOURCE_CARD_IDS.chGenie],
  island: [SOURCE_CARD_IDS.island],
  necromancer: [SOURCE_CARD_IDS.necromancer, SOURCE_CARD_IDS.chNecromancer],
  bookOfChanges: [SOURCE_CARD_IDS.bookOfChanges],
  shapeshifter: [SOURCE_CARD_IDS.shapeshifter, SOURCE_CARD_IDS.chShapeshifter],
  mirage: [SOURCE_CARD_IDS.mirage, SOURCE_CARD_IDS.chMirage],
  doppelganger: [SOURCE_CARD_IDS.doppelganger],
  angel: [SOURCE_CARD_IDS.chAngel]
};

const ACTION_CONTROL_ORDER = [
  "leprechaun",
  "genie",
  "necromancer",
  "angel",
  "island",
  "bookOfChanges",
  "shapeshifter",
  "mirage",
  "doppelganger"
];

const ACTION_EXECUTE_VALUE = "execute";
const ACTION_EXECUTE_OPTIONS = [{ value: ACTION_EXECUTE_VALUE, label: "실행하기" }];
const OPTIONAL_ACTION_TYPES = new Set([
  "angel",
  "bookOfChanges",
  "doppelganger",
  "island",
  "mirage",
  "shapeshifter"
]);

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
  "CH01", "CH02", "CH03", "CH04", "CH05",
  "CH06", "CH07", "CH08", "CH09", "CH10", "CH11", "CH12", "CH13", "CH14", "CH15",
  "CH24", "CH25", "CH26", "CH27", "CH28", "CH29", "CH30", "CH31", "CH32", "CH33",
  "CH34", "CH35", "CH36", "CH37", "CH38", "CH39", "CH40", "CH41", "CH42", "CH43",
  "CH44", "CH45", "CH46", "CH47"
]);
const CARD_ART_VERSION = "small-20260623-garden";
const preloadedCardArtUrls = new Set();

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
const SUPABASE_CONFIG = window.FANTASY_SUPABASE_CONFIG || {};
const ONLINE_ROOM_STORAGE_KEY = "fantasyKingdom.onlineRoom.v1";
const ONLINE_TOKEN_STORAGE_KEY = "fantasyKingdom.playerToken.v1";
const HUMAN_PROFILE_STORAGE_KEY = "fantasyKingdom.humanProfile.v1";
const ONLINE_ROOM_TABLE = "fantasy_multiplayer_rooms";
const ONLINE_PLAYER_TABLE = "fantasy_multiplayer_players";
const LEADERBOARD_TABLE = "fantasy_leaderboard";
const HALL_OF_FAME_TABLE = "fantasy_beomrye_hall_of_fame";
const ONLINE_TURN_LIMIT_SECONDS = 30;
const NICKNAME_CHANGE_INTERVAL_MS = 24 * 60 * 60 * 1000;
const MIN_NICKNAME_LENGTH = 2;
const LEADERBOARD_LIMIT = 10;
const HALL_OF_FAME_REQUIRED_DIFFICULTY = "random";

const PROFILE_ASSET_ROOT = "assets/profiles/user";
const AI_DIFFICULTY_LABELS = {
  normal: "보통",
  hard: "어려움",
  expert: "매우어려움",
  random: "완전랜덤",
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
  onlineGame: false,
  cursedDeck: [],
  cursedDiscard: [],
  animating: false,
  cardActions: {},
  confirmedActions: {},
  skippedActions: {},
  leaderboardSubmitted: false,
  hallOfFameSubmitted: false,
  turnTimerKey: "",
  turnDeadlineAt: 0
};

const pendingMotionCardIds = new Set();
const pendingDiscardMotionCardIds = new Set();

const onlineState = {
  client: null,
  room: null,
  players: [],
  playerToken: "",
  subscription: null,
  loading: false,
  activeGameKey: "",
  lastAppliedRevision: "",
  lastLocalRevision: "",
  savingGame: false,
  pendingGameSave: false,
  applyingRemote: false
};

const els = {
  setupPanel: document.querySelector("#setupPanel"),
  gameBoard: document.querySelector("#gameBoard"),
  playerCountSelect: document.querySelector("#playerCountSelect"),
  aiDifficultySelect: document.querySelector("#aiDifficultySelect"),
  humanNameInput: document.querySelector("#humanNameInput"),
  confirmNicknameButton: document.querySelector("#confirmNicknameButton"),
  nicknameStatus: document.querySelector("#nicknameStatus"),
  expansionCheckbox: document.querySelector("#expansionCheckbox"),
  cursedItemsCheckbox: document.querySelector("#cursedItemsCheckbox"),
  startButton: document.querySelector("#startButton"),
  onlinePanel: document.querySelector("#onlinePanel"),
  onlineStatus: document.querySelector("#onlineStatus"),
  onlineNameInput: document.querySelector("#onlineNameInput"),
  roomCodeInput: document.querySelector("#roomCodeInput"),
  createRoomButton: document.querySelector("#createRoomButton"),
  rejoinRoomButton: document.querySelector("#rejoinRoomButton"),
  joinRoomButton: document.querySelector("#joinRoomButton"),
  onlineRoomCard: document.querySelector("#onlineRoomCard"),
  onlineRoomCode: document.querySelector("#onlineRoomCode"),
  copyRoomCodeButton: document.querySelector("#copyRoomCodeButton"),
  onlineRoomOccupancy: document.querySelector("#onlineRoomOccupancy"),
  onlineRoomHost: document.querySelector("#onlineRoomHost"),
  onlineStartRequirement: document.querySelector("#onlineStartRequirement"),
  onlinePlayerList: document.querySelector("#onlinePlayerList"),
  startOnlineGameButton: document.querySelector("#startOnlineGameButton"),
  leaveRoomButton: document.querySelector("#leaveRoomButton"),
  newGameButton: document.querySelector("#newGameButton"),
  rulesButton: document.querySelector("#rulesButton"),
  rulesDialog: document.querySelector("#rulesDialog"),
  cardCatalogButton: document.querySelector("#cardCatalogButton"),
  turnTimer: document.querySelector("#turnTimer"),
  turnTimerNumber: document.querySelector("#turnTimerNumber"),
  turnTimerLabel: document.querySelector("#turnTimerLabel"),
  cardCatalogDialog: document.querySelector("#cardCatalogDialog"),
  cardCatalogList: document.querySelector("#cardCatalogList"),
  cardCatalogSummary: document.querySelector("#cardCatalogSummary"),
  cardCatalogFilters: document.querySelector("#cardCatalogFilters"),
  cardCatalogSearchInput: document.querySelector("#cardCatalogSearchInput"),
  cardCatalogTypeSelect: document.querySelector("#cardCatalogTypeSelect"),
  endDialog: document.querySelector("#endDialog"),
  endSummary: document.querySelector("#endSummary"),
  restartGameButton: document.querySelector("#restartGameButton"),
  leaveFinishedGameButton: document.querySelector("#leaveFinishedGameButton"),
  leaderboardList: document.querySelector("#leaderboardList"),
  leaderboardOriginalList: document.querySelector("#leaderboardOriginalList"),
  leaderboardExpansionList: document.querySelector("#leaderboardExpansionList"),
  leaderboardStatus: document.querySelector("#leaderboardStatus"),
  hallOfFameCard: document.querySelector("#hallOfFameCard"),
  hallOfFameStatus: document.querySelector("#hallOfFameStatus"),
  refreshLeaderboardButton: document.querySelector("#refreshLeaderboardButton"),
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
let cardCatalogFilter = { query: "", type: "all" };
let dialogueUsage = new Map();
let idleDialogueTimer = null;
let idleDialogueToken = 0;
const speechClearTimers = new Map();
let turnTimerInterval = null;
let turnTimerHandledKey = "";

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
  const humanName = currentHumanNickname();
  return [
    {
      id: 0,
      name: humanName,
      baseName: humanName,
      human: true,
      ai: false,
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
        ai: true,
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

function preloadImageUrl(url) {
  if (!url || preloadedCardArtUrls.has(url) || typeof Image !== "function") return;
  preloadedCardArtUrls.add(url);
  const image = new Image();
  image.decoding = "async";
  image.src = url;
}

function preloadCardArt(cards) {
  cards.forEach((card) => preloadImageUrl(cardArtUrl(card)));
}

function preloadActiveCardArt() {
  preloadImageUrl("assets/deck-back.png");
  preloadCardArt(CARD_LIBRARY);
  if (state.includeCursedItems) {
    preloadCardArt(CURSED_ITEM_LIBRARY);
  }
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
  if (!confirmHumanNicknameChange(els.humanNameInput)) return;
  resetDialogueState();
  state.leaderboardSubmitted = false;
  state.hallOfFameSubmitted = false;
  state.playerCount = Number(els.playerCountSelect.value);
  state.aiDifficulty = els.aiDifficultySelect?.value || "normal";
  state.includeExpansion = Boolean(els.expansionCheckbox?.checked);
  state.includeCursedItems = Boolean(els.cursedItemsCheckbox?.checked);
  state.onlineGame = false;
  updateTitleArt();
  configureDeckOptions();
  preloadActiveCardArt();
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
  state.skippedActions = {};
  resetTurnTimerState();
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

function setOnlineStatus(message, error = false) {
  if (!els.onlineStatus) return;
  els.onlineStatus.textContent = message;
  els.onlineStatus.classList.toggle("error", error);
}

function getSupabaseClient() {
  if (onlineState.client) return onlineState.client;
  if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.key || !window.supabase?.createClient) {
    setOnlineStatus("설정 필요", true);
    return null;
  }
  onlineState.client = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key, {
    auth: { persistSession: false }
  });
  return onlineState.client;
}

function normalizeHumanNickname(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 12);
}

function nicknameValidationMessage(nickname) {
  const normalized = normalizeHumanNickname(nickname);
  if (normalized.length < MIN_NICKNAME_LENGTH) {
    return `닉네임은 ${MIN_NICKNAME_LENGTH}글자 이상이어야 합니다.`;
  }
  if (normalized === HUMAN_PROFILE.name) {
    return "'나'는 닉네임으로 사용할 수 없습니다.";
  }
  return "";
}

function readHumanProfile() {
  try {
    const profile = JSON.parse(window.localStorage?.getItem(HUMAN_PROFILE_STORAGE_KEY) || "null");
    if (profile?.nickname) {
      const nickname = normalizeHumanNickname(profile.nickname);
      if (nicknameValidationMessage(nickname)) {
        return { nickname: "", lastChangedAt: "" };
      }
      return {
        nickname,
        lastChangedAt: profile.lastChangedAt || ""
      };
    }
  } catch {
    // ignore broken local profile data
  }
  return { nickname: "", lastChangedAt: "" };
}

function saveHumanProfile(profile) {
  window.localStorage?.setItem(HUMAN_PROFILE_STORAGE_KEY, JSON.stringify({
    nickname: normalizeHumanNickname(profile.nickname),
    lastChangedAt: profile.lastChangedAt || ""
  }));
}

function currentHumanNickname() {
  return readHumanProfile().nickname;
}

function nicknameChangeRemainingText(lastChangedAt) {
  const changedAt = Date.parse(lastChangedAt || "");
  if (!changedAt) return "";
  const remainingMs = Math.max(0, NICKNAME_CHANGE_INTERVAL_MS - (Date.now() - changedAt));
  const hours = Math.floor(remainingMs / (60 * 60 * 1000));
  const minutes = Math.ceil((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
  if (hours <= 0) return `${Math.max(1, minutes)}분 후 변경 가능`;
  return `${hours}시간 ${minutes}분 후 변경 가능`;
}

function setNicknameStatus(message, error = false) {
  if (!els.nicknameStatus) return;
  els.nicknameStatus.textContent = message;
  els.nicknameStatus.classList.toggle("error", error);
}

function syncHumanNicknameInputs(force = false) {
  const nickname = currentHumanNickname();
  if (els.humanNameInput && (force || document.activeElement !== els.humanNameInput)) {
    els.humanNameInput.value = nickname;
  }
  if (els.onlineNameInput && (force || document.activeElement !== els.onlineNameInput)) {
    els.onlineNameInput.value = nickname;
  }
}

function confirmHumanNicknameChange(sourceInput = els.humanNameInput) {
  const profile = readHumanProfile();
  const desired = normalizeHumanNickname(sourceInput?.value ?? profile.nickname);
  const validationMessage = nicknameValidationMessage(desired);
  if (validationMessage) {
    window.alert(validationMessage);
    setNicknameStatus(validationMessage, true);
    sourceInput?.focus();
    return false;
  }

  if (desired === profile.nickname) {
    syncHumanNicknameInputs(true);
    setNicknameStatus(`현재 닉네임: ${profile.nickname}`);
    return true;
  }

  const changedAt = Date.parse(profile.lastChangedAt || "");
  if (changedAt && Date.now() - changedAt < NICKNAME_CHANGE_INTERVAL_MS) {
    const remaining = nicknameChangeRemainingText(profile.lastChangedAt);
    window.alert(`닉네임은 하루에 한 번만 변경할 수 있습니다.\n${remaining}`);
    syncHumanNicknameInputs(true);
    setNicknameStatus(`닉네임 변경 제한 중 (${remaining})`, true);
    return false;
  }

  const confirmed = window.confirm(
    "닉네임은 하루에 한 번만 변경할 수 있습니다.\n"
    + `확인하면 오늘은 '${desired}' 닉네임으로 고정됩니다.\n`
    + "저장할까요?"
  );
  if (!confirmed) {
    syncHumanNicknameInputs(true);
    setNicknameStatus(profile.nickname ? `현재 닉네임: ${profile.nickname}` : "닉네임을 설정해야 시작할 수 있습니다.", !profile.nickname);
    return false;
  }

  saveHumanProfile({ nickname: desired, lastChangedAt: new Date().toISOString() });
  syncHumanNicknameInputs(true);
  setNicknameStatus(`닉네임 저장 완료: ${desired}`);
  return true;
}

function initializeHumanNicknameControls() {
  syncHumanNicknameInputs();
  const nickname = currentHumanNickname();
  setNicknameStatus(
    nickname ? `현재 닉네임: ${nickname}` : "닉네임을 2글자 이상으로 설정해야 시작할 수 있습니다.",
    !nickname
  );
}

function setLeaderboardStatus(message, error = false) {
  if (!els.leaderboardStatus) return;
  els.leaderboardStatus.textContent = message;
  els.leaderboardStatus.classList.toggle("error", error);
}

function setHallOfFameStatus(message, error = false) {
  if (!els.hallOfFameStatus) return;
  els.hallOfFameStatus.textContent = message;
  els.hallOfFameStatus.classList.toggle("error", error);
}

function formatLeaderboardDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" });
}

function leaderboardMetaText(entry) {
  const count = entry.player_count ? `${entry.player_count}인` : "";
  const difficulty = entry.ai_difficulty ? aiDifficultyLabel(entry.ai_difficulty) : "";
  return [count, difficulty].filter(Boolean).join(" · ");
}

function hallOfFameMetaText(entry) {
  const mode = entry.include_expansion ? "확장팩" : "오리지널";
  const count = entry.player_count ? `${entry.player_count}인` : "";
  const difficulty = entry.ai_difficulty ? aiDifficultyLabel(entry.ai_difficulty) : "";
  const date = entry.defeated_at ? formatLeaderboardDate(entry.defeated_at) : "";
  return [mode, count, difficulty, date].filter(Boolean).join(" · ");
}

async function fetchLeaderboardEntries(client, includeExpansion) {
  return client
    .from(LEADERBOARD_TABLE)
    .select("nickname,score,player_count,include_expansion,ai_difficulty,updated_at")
    .eq("include_expansion", includeExpansion)
    .order("score", { ascending: false })
    .order("updated_at", { ascending: true })
    .limit(LEADERBOARD_LIMIT);
}

function renderLeaderboardList(listElement, entries) {
  if (!listElement) return;
  listElement.innerHTML = "";
  if (!entries?.length) {
    const item = document.createElement("li");
    item.className = "leaderboard-empty";
    item.textContent = "아직 기록 없음";
    listElement.append(item);
    return;
  }

  const fragment = document.createDocumentFragment();
  entries.forEach((entry, index) => {
    const item = document.createElement("li");
    const meta = leaderboardMetaText(entry);
    item.innerHTML = `
      <span class="leaderboard-rank">${index + 1}</span>
      <strong>${escapeHtml(entry.nickname || "익명")}</strong>
      <b>${Number(entry.score || 0)}점</b>
      <small>${escapeHtml(meta)}${entry.updated_at ? `${meta ? " · " : ""}${formatLeaderboardDate(entry.updated_at)}` : ""}</small>
    `;
    fragment.append(item);
  });
  listElement.append(fragment);
}

function renderHallOfFame(entry) {
  if (!els.hallOfFameCard) return;
  if (!entry) {
    els.hallOfFameCard.classList.add("empty");
    els.hallOfFameCard.innerHTML = `
      <span>최종보스 격파자</span>
      <strong>기록을 기다리는 중</strong>
      <b></b>
      <small>완전랜덤에서 등장한 강범례를 이기면 등록됩니다.</small>
    `;
    return;
  }

  els.hallOfFameCard.classList.remove("empty");
  els.hallOfFameCard.innerHTML = `
    <span>최종보스 격파자</span>
    <strong>${escapeHtml(entry.nickname || "익명")}</strong>
    <b>${Number(entry.score || 0)}점</b>
    <small>${escapeHtml(hallOfFameMetaText(entry))}</small>
  `;
}

async function loadHallOfFame() {
  if (!els.hallOfFameCard) return;
  const client = getSupabaseClient();
  if (!client) {
    renderHallOfFame(null);
    setHallOfFameStatus("Supabase 설정이 필요합니다.", true);
    return;
  }

  setHallOfFameStatus("명예의 전당을 불러오는 중입니다.");
  const { data, error } = await client
    .from(HALL_OF_FAME_TABLE)
    .select("nickname,score,player_count,include_expansion,ai_difficulty,defeated_at,updated_at")
    .eq("id", 1)
    .eq("ai_difficulty", HALL_OF_FAME_REQUIRED_DIFFICULTY)
    .limit(1);

  if (error) {
    renderHallOfFame(null);
    setHallOfFameStatus("명예의 전당 설정이 필요합니다. supabase-ranking-only.sql을 실행해주세요.", true);
    return;
  }

  const entry = Array.isArray(data) ? data[0] : null;
  renderHallOfFame(entry || null);
  setHallOfFameStatus(entry ? "완전랜덤 강범례를 쓰러뜨린 단 한 명입니다." : "아직 완전랜덤 범례 격파자가 없습니다.");
}

function leaderboardSubmitErrorMessage(error) {
  const message = [error?.message, error?.details, error?.hint].filter(Boolean).join(" ");
  if (error?.code === "PGRST202" || message.includes("Could not find the function")) {
    return "랭킹 등록 실패: Supabase SQL Editor에서 최신 supabase-schema.sql을 실행해주세요.";
  }
  if (error?.code === "22023" || message.includes("invalid nickname")) {
    return "랭킹 등록 실패: 닉네임은 2글자 이상이어야 하며 '나'는 사용할 수 없습니다.";
  }
  if (error?.code === "23505" || message.includes("duplicate key")) {
    return "랭킹 등록 실패: 예전 단일 랭킹 제약이 남아 있을 수 있습니다. 최신 supabase-schema.sql을 다시 실행해주세요.";
  }
  return `랭킹 등록 실패: ${message || "supabase-schema.sql 설정을 확인해주세요."}`;
}

function hallOfFameSubmitErrorMessage(error) {
  const message = [error?.message, error?.details, error?.hint].filter(Boolean).join(" ");
  if (error?.code === "PGRST202" || message.includes("Could not find the function")) {
    return "명예의 전당 등록 실패: Supabase SQL Editor에서 최신 supabase-ranking-only.sql을 실행해주세요.";
  }
  if (error?.code === "22023" || message.includes("invalid nickname")) {
    return "명예의 전당 등록 실패: 닉네임은 2글자 이상이어야 하며 '나'는 사용할 수 없습니다.";
  }
  return `명예의 전당 등록 실패: ${message || "supabase-ranking-only.sql 설정을 확인해주세요."}`;
}

async function loadLeaderboard() {
  const originalList = els.leaderboardOriginalList || els.leaderboardList;
  const expansionList = els.leaderboardExpansionList;
  if (!originalList && !expansionList) return;
  const client = getSupabaseClient();
  if (!client) {
    setLeaderboardStatus("Supabase 설정이 필요합니다.", true);
    return;
  }

  setLeaderboardStatus("랭킹을 불러오는 중입니다.");
  const [originalResult, expansionResult] = await Promise.all([
    fetchLeaderboardEntries(client, false),
    fetchLeaderboardEntries(client, true)
  ]);

  if (originalResult.error || expansionResult.error) {
    if (originalList) originalList.innerHTML = "";
    if (expansionList) expansionList.innerHTML = "";
    setLeaderboardStatus("랭킹 테이블 설정이 필요합니다. supabase-schema.sql을 실행해주세요.", true);
    return;
  }

  renderLeaderboardList(originalList, originalResult.data || []);
  renderLeaderboardList(expansionList, expansionResult.data || []);
  setLeaderboardStatus("싱글플레이에서 승리한 기록만, IP당 오리지널/확장팩 최고 점수 1개씩 표시됩니다.");
}

async function submitLeaderboardScore(ranked) {
  if (state.leaderboardSubmitted) return;
  const humanEntry = ranked.find((entry) => entry.player.human);
  const leaderboardModeLabel = state.includeExpansion ? "확장팩 랭킹" : "오리지널 랭킹";
  state.leaderboardSubmitted = true;
  if (state.onlineGame) {
    setLeaderboardStatus("온라인 게임은 랭킹에 등록하지 않습니다.");
    return;
  }
  if (!humanEntry || humanEntry.score < (ranked[0]?.score ?? Number.POSITIVE_INFINITY)) {
    setLeaderboardStatus("랭킹은 싱글플레이에서 승리했을 때만 자동 등록됩니다.");
    return;
  }

  const client = getSupabaseClient();
  if (!client) {
    setLeaderboardStatus("랭킹 등록 실패: Supabase 설정 필요", true);
    return;
  }

  const nickname = normalizeHumanNickname(humanEntry.player.baseName || humanEntry.player.name || currentHumanNickname());
  setLeaderboardStatus(`${leaderboardModeLabel}에 기록을 등록하는 중입니다.`);
  const { data, error } = await client.rpc("fantasy_submit_leaderboard_score", {
    p_nickname: nickname,
    p_score: Number(humanEntry.score || 0),
    p_player_count: Number(state.playerCount || state.players.length || 0),
    p_include_expansion: Boolean(state.includeExpansion),
    p_ai_difficulty: state.aiDifficulty || onlineState.room?.ai_difficulty || "normal"
  });

  if (error) {
    setLeaderboardStatus(leaderboardSubmitErrorMessage(error), true);
    return;
  }

  const result = Array.isArray(data) ? data[0] : data;
  const nicknameDenied = result && result.nickname_updated === false && result.nickname !== nickname;
  const scoreText = result?.score_updated ? "최고 점수 갱신!" : "기존 최고 점수를 유지했습니다.";
  setLeaderboardStatus(nicknameDenied
    ? `${leaderboardModeLabel}: ${scoreText} 닉네임은 서버 기준 하루 1회 제한으로 기존 이름을 유지했습니다.`
    : `${leaderboardModeLabel}: ${scoreText}`);
  loadLeaderboard();
}

function isBeomryePlayer(player) {
  return Boolean(player && !player.human && (
    player.boss
    || player.baseName === "강범례"
    || String(player.name || "").includes("강범례")
  ));
}

function hasBeomryeOpponent(ranked) {
  return ranked.some((entry) => isBeomryePlayer(entry.player));
}

function isRandomBeomryeHallMode() {
  return state.aiDifficulty === HALL_OF_FAME_REQUIRED_DIFFICULTY;
}

function humanWonRanked(ranked) {
  const humanEntry = ranked.find((entry) => entry.player.human);
  return Boolean(humanEntry && ranked[0]?.player.id === humanEntry.player.id);
}

function qualifiesForBeomryeHallOfFame(ranked) {
  return !state.onlineGame
    && isRandomBeomryeHallMode()
    && humanWonRanked(ranked)
    && hasBeomryeOpponent(ranked);
}

function beomryeHallIneligibleText(ranked) {
  if (!hasBeomryeOpponent(ranked)) return "";
  if (state.onlineGame) return "온라인 게임은 범례 명예의 전당에 등록하지 않습니다.";
  if (!isRandomBeomryeHallMode()) {
    return "명예의 전당은 완전랜덤에서 등장한 강범례를 이겼을 때만 등록됩니다.";
  }
  if (!humanWonRanked(ranked)) return "완전랜덤 강범례가 아직 왕좌를 지키고 있습니다.";
  return "";
}

async function submitBeomryeHallOfFame(ranked) {
  if (state.hallOfFameSubmitted) return;
  state.hallOfFameSubmitted = true;
  if (!hasBeomryeOpponent(ranked)) return;
  if (state.onlineGame) {
    setHallOfFameStatus("온라인 게임은 범례 명예의 전당에 등록하지 않습니다.");
    updateEndHallNotice("온라인 게임은 명예의 전당에 등록하지 않습니다.", "missed");
    return;
  }
  if (!isRandomBeomryeHallMode()) {
    const message = "명예의 전당은 완전랜덤에서 등장한 강범례를 이겼을 때만 등록됩니다.";
    setHallOfFameStatus(message);
    updateEndHallNotice(message, "missed");
    return;
  }
  if (!humanWonRanked(ranked)) {
    setHallOfFameStatus("완전랜덤 강범례가 아직 왕좌를 지키고 있습니다.");
    updateEndHallNotice("완전랜덤 강범례가 아직 왕좌를 지키고 있습니다.", "missed");
    return;
  }

  const client = getSupabaseClient();
  if (!client) {
    setHallOfFameStatus("명예의 전당 등록 실패: Supabase 설정 필요", true);
    updateEndHallNotice("명예의 전당 등록 실패: Supabase 설정이 필요합니다.", "missed");
    return;
  }

  updateEndHallNotice("완전랜덤 강범례 격파 기록을 명예의 전당에 새기는 중입니다.", "pending");
  const humanEntry = ranked.find((entry) => entry.player.human);
  const nickname = normalizeHumanNickname(humanEntry.player.baseName || humanEntry.player.name || currentHumanNickname());
  const { data, error } = await client.rpc("fantasy_submit_beomrye_hall_score", {
    p_nickname: nickname,
    p_score: Number(humanEntry.score || 0),
    p_player_count: Number(state.playerCount || state.players.length || 0),
    p_include_expansion: Boolean(state.includeExpansion),
    p_ai_difficulty: HALL_OF_FAME_REQUIRED_DIFFICULTY
  });

  if (error) {
    setHallOfFameStatus(hallOfFameSubmitErrorMessage(error), true);
    updateEndHallNotice(hallOfFameSubmitErrorMessage(error), "missed");
    return;
  }

  const result = Array.isArray(data) ? data[0] : data;
  updateEndHallNotice(result?.score_updated
    ? "완전랜덤 범례 격파자 명예의 전당에 등극했습니다."
    : "완전랜덤 범례는 쓰러뜨렸지만, 기존 명예의 전당 기록이 더 높습니다.",
    result?.score_updated ? "success" : "missed");
  setHallOfFameStatus(result?.score_updated
    ? "완전랜덤 범례 격파자 명예의 전당에 등극했습니다."
    : "완전랜덤 범례는 쓰러뜨렸지만 기존 명예의 전당 기록이 더 높습니다.");
  loadHallOfFame();
}

function generateOnlineToken() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `player-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function onlinePlayerToken() {
  if (onlineState.playerToken) return onlineState.playerToken;
  const stored = window.localStorage?.getItem(ONLINE_TOKEN_STORAGE_KEY);
  onlineState.playerToken = stored || generateOnlineToken();
  window.localStorage?.setItem(ONLINE_TOKEN_STORAGE_KEY, onlineState.playerToken);
  return onlineState.playerToken;
}

function onlinePlayerName() {
  return currentHumanNickname();
}

function normalizeRoomCode(value) {
  return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
}

function generateRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

function onlineRoomSnapshot() {
  if (!onlineState.room) return null;
  return {
    roomId: onlineState.room.id,
    roomCode: onlineState.room.code,
    token: onlinePlayerToken()
  };
}

function saveOnlineRoomSnapshot() {
  const snapshot = onlineRoomSnapshot();
  if (snapshot) {
    window.localStorage?.setItem(ONLINE_ROOM_STORAGE_KEY, JSON.stringify(snapshot));
  }
}

function readOnlineRoomSnapshot() {
  try {
    return JSON.parse(window.localStorage?.getItem(ONLINE_ROOM_STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

function clearOnlineRoomSnapshot() {
  window.localStorage?.removeItem(ONLINE_ROOM_STORAGE_KEY);
}

function resetOnlineRoomLocalState() {
  if (onlineState.subscription && onlineState.client?.removeChannel) {
    onlineState.client.removeChannel(onlineState.subscription);
  }
  onlineState.subscription = null;
  onlineState.room = null;
  onlineState.players = [];
  onlineState.activeGameKey = "";
  onlineState.lastAppliedRevision = "";
  onlineState.lastLocalRevision = "";
  onlineState.savingGame = false;
  onlineState.pendingGameSave = false;
  onlineState.applyingRemote = false;
  state.onlineGame = false;
  clearOnlineRoomSnapshot();
  resetTurnTimerState();
}

function returnToSetupScreen() {
  if (els.endDialog?.open) els.endDialog.close();
  hideCardZoom();
  stopIdleDialogueTimer();
  state.phase = "setup";
  state.pendingFinish = false;
  state.finished = false;
  state.onlineGame = false;
  state.animating = false;
  state.cardActions = {};
  state.confirmedActions = {};
  state.skippedActions = {};
  els.setupPanel.classList.remove("hidden");
  els.gameBoard.classList.add("hidden");
  updateTitleArt();
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("복사할 수 없습니다.");
}

async function copyOnlineRoomCode() {
  const code = onlineState.room?.code || "";
  if (!code) return;
  try {
    await copyTextToClipboard(code);
    setOnlineStatus(`방 코드 복사 ${code}`);
  } catch (error) {
    setOnlineStatus(error.message || "복사 실패", true);
  }
}

function renderOnlinePanel() {
  const connected = Boolean(onlineState.room);
  const roomStatus = onlineState.room?.status || "lobby";
  const requiredCount = onlineState.room?.player_count || 2;
  const isHost = connected && onlineState.room.host_token === onlinePlayerToken();
  const hostPlayer = connected
    ? onlineState.players.find((player) => player.token === onlineState.room.host_token)
    : null;
  const hostName = hostPlayer?.name || "-";
  const hasEnoughPlayers = onlineState.players.length >= requiredCount;
  const canStart = connected && roomStatus === "lobby" && isHost && hasEnoughPlayers && !onlineState.loading;
  const savedSnapshot = readOnlineRoomSnapshot();
  els.onlineRoomCard?.classList.toggle("hidden", !connected);
  if (els.onlineRoomCode) els.onlineRoomCode.textContent = onlineState.room?.code || "-";
  if (els.copyRoomCodeButton) els.copyRoomCodeButton.disabled = !connected || !onlineState.room?.code;

  const buttonsDisabled = onlineState.loading || !getSupabaseClient();
  if (els.createRoomButton) els.createRoomButton.disabled = buttonsDisabled || connected;
  if (els.joinRoomButton) els.joinRoomButton.disabled = buttonsDisabled || connected;
  if (els.rejoinRoomButton) {
    const canRejoin = !connected && Boolean(savedSnapshot?.roomId && savedSnapshot?.token);
    els.rejoinRoomButton.classList.toggle("hidden", !canRejoin);
    els.rejoinRoomButton.disabled = buttonsDisabled || !canRejoin;
    els.rejoinRoomButton.textContent = savedSnapshot?.roomCode
      ? `${savedSnapshot.roomCode} 재입장`
      : "이전 방 재입장";
  }
  if (els.leaveRoomButton) els.leaveRoomButton.disabled = onlineState.loading || !connected;
  if (els.onlineRoomOccupancy) {
    els.onlineRoomOccupancy.textContent = `${onlineState.players.length}/${requiredCount}명 접속`;
  }
  if (els.onlineRoomHost) {
    els.onlineRoomHost.textContent = `방장 ${hostName}${isHost ? " (나)" : ""}`;
  }
  if (els.onlineStartRequirement) {
    let requirement = "방에 들어가면 시작 조건이 표시됩니다.";
    if (connected) {
      if (roomStatus === "finished") {
        requirement = "게임이 끝난 방입니다. 나가기 후 새 방을 만들 수 있습니다.";
      } else if (roomStatus === "playing") {
        requirement = "게임 진행 중입니다. 새로고침해도 이 방으로 재접속됩니다.";
      } else if (!hasEnoughPlayers) {
        requirement = `시작하려면 ${requiredCount - onlineState.players.length}명이 더 필요합니다.`;
      } else if (!isHost) {
        requirement = "인원은 준비됐고, 방장이 시작할 수 있습니다.";
      } else {
        requirement = "인원 준비 완료. 게임을 시작할 수 있습니다.";
      }
    }
    els.onlineStartRequirement.textContent = requirement;
    els.onlineStartRequirement.classList.toggle("ready", canStart);
    els.onlineStartRequirement.classList.toggle("waiting", connected && !canStart && roomStatus === "lobby");
  }
  if (els.startOnlineGameButton) {
    els.startOnlineGameButton.disabled = !canStart;
    if (roomStatus === "finished") {
      els.startOnlineGameButton.textContent = "게임 종료";
    } else if (roomStatus === "playing") {
      els.startOnlineGameButton.textContent = "게임 진행 중";
    } else if (!isHost) {
      els.startOnlineGameButton.textContent = "방장만 시작";
    } else if (!hasEnoughPlayers) {
      els.startOnlineGameButton.textContent = `인원 대기 ${onlineState.players.length}/${requiredCount}`;
    } else {
      els.startOnlineGameButton.textContent = "게임 시작";
    }
  }
  if (els.roomCodeInput && onlineState.room?.code) els.roomCodeInput.value = onlineState.room.code;

  if (!els.onlinePlayerList) return;
  els.onlinePlayerList.innerHTML = "";
  if (!connected) return;

  const bySeat = new Map(onlineState.players.map((player) => [player.seat, player]));
  const count = onlineState.room.player_count || 2;
  for (let seat = 0; seat < count; seat += 1) {
    const item = document.createElement("li");
    const player = bySeat.get(seat);
    if (player) {
      item.className = "filled-seat";
      const badges = [];
      if (onlineState.room.host_token === player.token) {
        badges.push(`<span class="online-player-badge host">방장</span>`);
      }
      if (player.token === onlinePlayerToken()) {
        badges.push(`<span class="online-player-badge me">나</span>`);
      }
      item.innerHTML = `
        <span class="seat-number">${seat + 1}</span>
        <span class="seat-name">${escapeHtml(player.name || "이름 없음")}</span>
        <span class="seat-badges">${badges.join("")}</span>
      `;
    } else {
      item.className = "empty-seat";
      item.innerHTML = `
        <span class="seat-number">${seat + 1}</span>
        <span class="seat-name">빈 자리</span>
      `;
    }
    els.onlinePlayerList.append(item);
  }
}

async function loadOnlineRoom(roomId, options = {}) {
  const client = getSupabaseClient();
  if (!client || !roomId) return false;

  const { data: room, error: roomError } = await client
    .from(ONLINE_ROOM_TABLE)
    .select("*")
    .eq("id", roomId)
    .maybeSingle();
  if (roomError || !room) {
    setOnlineStatus("방 없음", true);
    return false;
  }
  if (options.skipFinished && room.status === "finished") {
    clearOnlineRoomSnapshot();
    setOnlineStatus("연결 대기");
    return false;
  }

  const { data: players, error: playersError } = await client
    .from(ONLINE_PLAYER_TABLE)
    .select("*")
    .eq("room_id", roomId)
    .order("seat", { ascending: true });
  if (playersError) {
    setOnlineStatus("명단 오류", true);
    return false;
  }

  onlineState.room = room;
  onlineState.players = players || [];
  saveOnlineRoomSnapshot();
  if ((room.status === "playing" || room.status === "finished") && room.game_state?.startedAt) {
    hydrateOnlineGameSnapshot(room.game_state);
    setOnlineStatus(`${room.status === "finished" ? "게임 종료" : "게임 중"} ${room.code}`);
  } else {
    setOnlineStatus(`방 ${room.code}`);
  }
  renderOnlinePanel();
  return true;
}

async function subscribeOnlineRoom(roomId) {
  const client = getSupabaseClient();
  if (!client || !roomId) return;
  if (onlineState.subscription) {
    await client.removeChannel(onlineState.subscription);
    onlineState.subscription = null;
  }

  onlineState.subscription = client
    .channel(`fantasy-room-${roomId}`)
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table: ONLINE_ROOM_TABLE,
      filter: `id=eq.${roomId}`
    }, () => loadOnlineRoom(roomId))
    .on("postgres_changes", {
      event: "*",
      schema: "public",
      table: ONLINE_PLAYER_TABLE,
      filter: `room_id=eq.${roomId}`
    }, () => loadOnlineRoom(roomId))
    .subscribe();
}

async function createOnlineRoom() {
  const client = getSupabaseClient();
  if (!client || onlineState.loading) return;
  if (!confirmHumanNicknameChange(els.onlineNameInput)) return;
  onlineState.loading = true;
  setOnlineStatus("방 생성 중");
  renderOnlinePanel();

  try {
    const token = onlinePlayerToken();
    const roomPayload = {
      code: generateRoomCode(),
      host_token: token,
      player_count: Number(els.playerCountSelect?.value || 2),
      include_expansion: Boolean(els.expansionCheckbox?.checked),
      ai_difficulty: els.aiDifficultySelect?.value || "normal",
      status: "lobby",
      game_state: {}
    };

    const { data: room, error: roomError } = await client
      .from(ONLINE_ROOM_TABLE)
      .insert(roomPayload)
      .select("*")
      .single();
    if (roomError) throw roomError;

    const { error: playerError } = await client
      .from(ONLINE_PLAYER_TABLE)
      .insert({
        room_id: room.id,
        seat: 0,
        name: onlinePlayerName(),
        token
      });
    if (playerError) throw playerError;

    onlineState.room = room;
    await loadOnlineRoom(room.id);
    await subscribeOnlineRoom(room.id);
  } catch (error) {
    setOnlineStatus(error.message || "생성 실패", true);
  } finally {
    onlineState.loading = false;
    renderOnlinePanel();
  }
}

async function joinOnlineRoom() {
  const client = getSupabaseClient();
  if (!client || onlineState.loading) return;
  if (!confirmHumanNicknameChange(els.onlineNameInput)) return;
  const code = normalizeRoomCode(els.roomCodeInput?.value);
  if (!code) {
    setOnlineStatus("코드 필요", true);
    return;
  }

  onlineState.loading = true;
  setOnlineStatus("입장 중");
  renderOnlinePanel();

  try {
    const token = onlinePlayerToken();
    const { data: room, error: roomError } = await client
      .from(ONLINE_ROOM_TABLE)
      .select("*")
      .eq("code", code)
      .maybeSingle();
    if (roomError) throw roomError;
    if (!room) throw new Error("방을 찾을 수 없습니다.");

    const { data: players, error: playersError } = await client
      .from(ONLINE_PLAYER_TABLE)
      .select("*")
      .eq("room_id", room.id)
      .order("seat", { ascending: true });
    if (playersError) throw playersError;

    const existing = (players || []).find((player) => player.token === token);
    if (existing) {
      await client
        .from(ONLINE_PLAYER_TABLE)
        .update({ name: onlinePlayerName(), connected_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      const occupied = new Set((players || []).map((player) => player.seat));
      let seat = -1;
      for (let index = 0; index < room.player_count; index += 1) {
        if (!occupied.has(index)) {
          seat = index;
          break;
        }
      }
      if (seat < 0) throw new Error("빈 자리가 없습니다.");
      const { error: joinError } = await client
        .from(ONLINE_PLAYER_TABLE)
        .insert({
          room_id: room.id,
          seat,
          name: onlinePlayerName(),
          token
        });
      if (joinError) throw joinError;
    }

    onlineState.room = room;
    await loadOnlineRoom(room.id);
    await subscribeOnlineRoom(room.id);
  } catch (error) {
    setOnlineStatus(error.message || "입장 실패", true);
  } finally {
    onlineState.loading = false;
    renderOnlinePanel();
  }
}

async function leaveOnlineRoom() {
  const client = getSupabaseClient();
  if (onlineState.loading) return;
  const roomId = onlineState.room?.id || "";
  if (!client || !roomId) {
    resetOnlineRoomLocalState();
    returnToSetupScreen();
    setOnlineStatus("연결 대기");
    renderOnlinePanel();
    return;
  }

  onlineState.loading = true;
  setOnlineStatus("나가는 중");
  renderOnlinePanel();

  try {
    await client
      .from(ONLINE_PLAYER_TABLE)
      .delete()
      .eq("room_id", roomId)
      .eq("token", onlinePlayerToken());
    setOnlineStatus("연결 대기");
  } catch (error) {
    setOnlineStatus(error.message || "나가기 실패", true);
  } finally {
    if (onlineState.subscription) {
      await client.removeChannel(onlineState.subscription);
      onlineState.subscription = null;
    }
    resetOnlineRoomLocalState();
    returnToSetupScreen();
    setOnlineStatus("연결 대기");
    onlineState.loading = false;
    renderOnlinePanel();
  }
}

async function restoreOnlineRoom() {
  const client = getSupabaseClient();
  if (!client) {
    renderOnlinePanel();
    return;
  }
  if (onlineState.loading) return;

  const snapshot = readOnlineRoomSnapshot();
  if (!snapshot?.roomId || !snapshot?.token) {
    setOnlineStatus("연결 대기");
    renderOnlinePanel();
    return;
  }

  onlineState.playerToken = snapshot.token;
  onlineState.loading = true;
  setOnlineStatus("재입장 중");
  renderOnlinePanel();
  try {
    const restored = await loadOnlineRoom(snapshot.roomId, { skipFinished: true });
    if (restored) {
      await subscribeOnlineRoom(snapshot.roomId);
      setOnlineStatus(`재접속 ${onlineState.room.code}`);
    } else {
      clearOnlineRoomSnapshot();
    }
  } finally {
    onlineState.loading = false;
  }
  renderOnlinePanel();
}

function sortedOnlinePlayers() {
  return [...onlineState.players].sort((a, b) => a.seat - b.seat);
}

function cardSnapshotId(card) {
  return card ? cardSourceId(card) : "";
}

function onlineGameRevision() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function currentOnlineSnapshot() {
  return onlineState.room?.game_state || {};
}

function isOnlinePlaying() {
  return Boolean(onlineState.room?.id && onlineState.room.status === "playing");
}

function activeSeat() {
  const player = currentPlayer();
  return player?.seat ?? player?.id ?? state.activePlayer;
}

function ensureOnlineTurnDeadline() {
  if (!isTurnTimerPhase()) {
    return { key: state.turnTimerKey || "", deadlineAt: state.turnDeadlineAt || 0 };
  }

  const key = buildTurnTimerKey();
  const now = Date.now();
  if (state.turnTimerKey !== key || !state.turnDeadlineAt || state.turnDeadlineAt <= now) {
    state.turnTimerKey = key;
    state.turnDeadlineAt = now + (ONLINE_TURN_LIMIT_SECONDS * 1000);
  }
  return { key: state.turnTimerKey, deadlineAt: state.turnDeadlineAt };
}

function serializeOnlineGameState() {
  const baseSnapshot = currentOnlineSnapshot();
  const timer = ensureOnlineTurnDeadline();
  const sortedPlayers = [...state.players]
    .map((player) => ({
      seat: player.seat ?? player.id,
      token: player.token || "",
      name: player.baseName || String(player.name || "").replace(/\s*\(나\)\s*$/, ""),
      hand: player.hand.map(cardSnapshotId),
      activeCursedItem: cardSnapshotId(player.activeCursedItem),
      usedCursedItems: (player.usedCursedItems || []).map(cardSnapshotId)
    }))
    .sort((a, b) => a.seat - b.seat);

  return {
    ...baseSnapshot,
    version: 1,
    revision: onlineGameRevision(),
    updatedAt: new Date().toISOString(),
    startedAt: baseSnapshot.startedAt || new Date().toISOString(),
    playerCount: state.playerCount || sortedPlayers.length,
    includeExpansion: state.includeExpansion,
    includeCursedItems: state.includeCursedItems,
    activeSeat: activeSeat(),
    turnNumber: state.turnNumber,
    phase: state.phase,
    pendingFinish: state.pendingFinish,
    finished: state.finished,
    drawnCardId: state.drawnCardId || "",
    selectedCardId: state.selectedCardId || "",
    turnTimerKey: timer.key,
    turnDeadlineAt: timer.deadlineAt,
    deck: state.deck.map(cardSnapshotId),
    discard: state.discard.map(cardSnapshotId),
    cursedDeck: state.cursedDeck.map(cardSnapshotId),
    cursedDiscard: state.cursedDiscard.map(cardSnapshotId),
    players: sortedPlayers,
    cardActions: { ...state.cardActions },
    confirmedActions: { ...state.confirmedActions },
    skippedActions: { ...state.skippedActions }
  };
}

async function saveOnlineGameState(reason = "") {
  if (!isOnlinePlaying() || onlineState.applyingRemote || !onlineState.room?.id) return;
  const client = getSupabaseClient();
  if (!client) return;

  if (onlineState.savingGame) {
    onlineState.pendingGameSave = true;
    return;
  }

  onlineState.savingGame = true;
  onlineState.pendingGameSave = false;
  try {
    const snapshot = serializeOnlineGameState();
    onlineState.lastLocalRevision = snapshot.revision;
    onlineState.lastAppliedRevision = snapshot.revision;
    onlineState.room = {
      ...onlineState.room,
      status: state.finished ? "finished" : "playing",
      game_state: snapshot
    };

    const { data: room, error } = await client
      .from(ONLINE_ROOM_TABLE)
      .update({
        status: state.finished ? "finished" : "playing",
        game_state: snapshot,
        updated_at: new Date().toISOString()
      })
      .eq("id", onlineState.room.id)
      .select("*")
      .single();
    if (error) throw error;
    if (room) onlineState.room = room;
  } catch (error) {
    setOnlineStatus(error.message || "동기화 실패", true);
  } finally {
    onlineState.savingGame = false;
    if (onlineState.pendingGameSave) {
      onlineState.pendingGameSave = false;
      saveOnlineGameState(reason);
    }
  }
}

function createOnlineGameSnapshot() {
  const room = onlineState.room;
  const players = sortedOnlinePlayers().slice(0, room.player_count || 2);
  const startedAt = new Date().toISOString();
  state.onlineGame = true;
  state.playerCount = players.length;
  state.aiDifficulty = room.ai_difficulty || "normal";
  state.includeExpansion = Boolean(room.include_expansion);
  state.includeCursedItems = false;
  updateTitleArt();
  configureDeckOptions();
  preloadActiveCardArt();

  const deckCards = shuffle(cloneDeck());
  const roster = players.map((player) => ({
    seat: player.seat,
    token: player.token,
    name: player.name,
    hand: [],
    activeCursedItem: null,
    usedCursedItems: []
  }));

  for (let round = 0; round < startingHandSize(); round += 1) {
    roster.forEach((player) => {
      const card = deckCards.pop();
      if (card) player.hand.push(cardSnapshotId(card));
    });
  }

  return {
    version: 1,
    revision: onlineGameRevision(),
    startedAt,
    updatedAt: startedAt,
    playerCount: roster.length,
    includeExpansion: state.includeExpansion,
    includeCursedItems: false,
    activeSeat: roster[0]?.seat ?? 0,
    turnNumber: 1,
    phase: "draw",
    pendingFinish: false,
    finished: false,
    drawnCardId: "",
    selectedCardId: "",
    turnTimerKey: [room.id, 1, roster[0]?.seat ?? 0, "draw", "turn", ""].join("|"),
    turnDeadlineAt: Date.now() + (ONLINE_TURN_LIMIT_SECONDS * 1000),
    deck: deckCards.map(cardSnapshotId),
    discard: [],
    cursedDeck: [],
    cursedDiscard: [],
    players: roster,
    cardActions: {},
    confirmedActions: {},
    skippedActions: {}
  };
}

function findCardBySnapshotId(sourceId, cursedItem = false) {
  const library = cursedItem ? CURSED_ITEM_LIBRARY : CARD_LIBRARY;
  const card = library.find((entry) => cardSourceId(entry) === String(sourceId));
  return card ? { ...card } : null;
}

function hydrateCardSnapshotList(sourceIds, cursedItem = false) {
  return (sourceIds || [])
    .map((sourceId) => findCardBySnapshotId(sourceId, cursedItem))
    .filter(Boolean);
}

function hydrateOnlineGameSnapshot(snapshot) {
  if (!snapshot?.startedAt || !Array.isArray(snapshot.players)) return false;
  const revision = snapshot.revision || snapshot.updatedAt || snapshot.startedAt;
  const boardHidden = els.gameBoard.classList.contains("hidden");
  if (revision && revision === onlineState.lastAppliedRevision && !boardHidden) {
    return true;
  }
  if (revision && revision === onlineState.lastLocalRevision && !boardHidden) {
    onlineState.lastAppliedRevision = revision;
    return true;
  }

  const firstHydrate = onlineState.activeGameKey !== snapshot.startedAt || boardHidden;
  onlineState.applyingRemote = true;

  if (firstHydrate) {
    resetDialogueState();
    state.leaderboardSubmitted = false;
    state.hallOfFameSubmitted = false;
  }
  state.playerCount = snapshot.playerCount || snapshot.players.length || 2;
  state.aiDifficulty = onlineState.room?.ai_difficulty || "normal";
  state.includeExpansion = Boolean(snapshot.includeExpansion);
  state.includeCursedItems = Boolean(snapshot.includeCursedItems);
  state.onlineGame = true;
  updateTitleArt();
  configureDeckOptions();
  preloadActiveCardArt();

  const localToken = onlinePlayerToken();
  const hydratedPlayers = snapshot.players.map((player) => {
    const isLocal = player.token === localToken;
    return {
      id: player.seat,
      seat: player.seat,
      token: player.token,
      name: isLocal ? `${player.name || "나"} (나)` : (player.name || `플레이어 ${player.seat + 1}`),
      baseName: player.name || `플레이어 ${player.seat + 1}`,
      human: isLocal,
      onlineHuman: !isLocal,
      ai: false,
      avatarUrl: isLocal ? HUMAN_PROFILE.avatarUrl : "",
      difficulty: null,
      difficultyLabel: "",
      speech: "",
      hand: hydrateCardSnapshotList(player.hand),
      activeCursedItem: findCardBySnapshotId(player.activeCursedItem, true),
      usedCursedItems: hydrateCardSnapshotList(player.usedCursedItems, true)
    };
  });

  const localIndex = hydratedPlayers.findIndex((player) => player.human);
  state.players = localIndex > 0
    ? [hydratedPlayers[localIndex], ...hydratedPlayers.filter((_, index) => index !== localIndex)]
    : hydratedPlayers;
  state.deck = hydrateCardSnapshotList(snapshot.deck);
  state.discard = hydrateCardSnapshotList(snapshot.discard);
  state.cursedDeck = hydrateCardSnapshotList(snapshot.cursedDeck, true);
  state.cursedDiscard = hydrateCardSnapshotList(snapshot.cursedDiscard, true);
  state.activePlayer = Math.max(0, state.players.findIndex((player) => player.seat === snapshot.activeSeat));
  state.phase = snapshot.phase || "draw";
  state.selectedCardId = snapshot.selectedCardId || null;
  state.drawnCardId = snapshot.drawnCardId || null;
  state.turnNumber = snapshot.turnNumber || 1;
  state.finished = Boolean(snapshot.finished || onlineState.room?.status === "finished");
  state.pendingFinish = Boolean(snapshot.pendingFinish);
  state.animating = false;
  state.cardActions = { ...(snapshot.cardActions || {}) };
  state.confirmedActions = { ...(snapshot.confirmedActions || {}) };
  state.skippedActions = { ...(snapshot.skippedActions || {}) };
  stopTurnTimer({ hide: false });
  state.turnTimerKey = snapshot.turnTimerKey || "";
  state.turnDeadlineAt = Number(snapshot.turnDeadlineAt || 0);
  turnTimerHandledKey = "";

  els.setupPanel.classList.add("hidden");
  els.gameBoard.classList.remove("hidden");
  if (firstHydrate) {
    clearLog();
    log(`온라인 게임 시작. 방 ${onlineState.room?.code || ""}`);
  }
  onlineState.activeGameKey = snapshot.startedAt;
  onlineState.lastAppliedRevision = revision;
  onlineState.applyingRemote = false;
  render();
  if (state.finished) {
    clearOnlineRoomSnapshot();
    const ranked = [...state.players]
      .map((player) => {
        const score = scorePlayer(player);
        return { player, score: score.total, scoreDetails: score };
      })
      .sort((a, b) => b.score - a.score);
    showEndNotification(ranked);
    submitLeaderboardScore(ranked);
    submitBeomryeHallOfFame(ranked);
  }
  return true;
}

async function startOnlineGame() {
  const client = getSupabaseClient();
  if (!client || !onlineState.room || onlineState.loading) return;
  if (onlineState.room.host_token !== onlinePlayerToken()) {
    setOnlineStatus("방장만 시작할 수 있습니다.", true);
    return;
  }

  const requiredCount = onlineState.room.player_count || 2;
  if (onlineState.players.length < requiredCount) {
    setOnlineStatus(`인원 대기 ${onlineState.players.length}/${requiredCount}`, true);
    renderOnlinePanel();
    return;
  }

  onlineState.loading = true;
  setOnlineStatus("게임 시작 중");
  renderOnlinePanel();

  try {
    state.leaderboardSubmitted = false;
    state.hallOfFameSubmitted = false;
    const snapshot = createOnlineGameSnapshot();
    const { data: room, error } = await client
      .from(ONLINE_ROOM_TABLE)
      .update({
        status: "playing",
        game_state: snapshot,
        updated_at: new Date().toISOString()
      })
      .eq("id", onlineState.room.id)
      .select("*")
      .single();
    if (error) throw error;

    onlineState.room = room;
    hydrateOnlineGameSnapshot(snapshot);
    setOnlineStatus(`게임 중 ${room.code}`);
  } catch (error) {
    setOnlineStatus(error.message || "시작 실패", true);
  } finally {
    onlineState.loading = false;
    renderOnlinePanel();
  }
}

function resetTurnTimerState() {
  stopTurnTimer();
  state.turnTimerKey = "";
  state.turnDeadlineAt = 0;
  turnTimerHandledKey = "";
  setTurnTimerVisible(false);
}

function isOnlineMultiplayerGame() {
  return Boolean(onlineState.room) && els.gameBoard && !els.gameBoard.classList.contains("hidden");
}

function isTurnTimerPhase() {
  return isOnlineMultiplayerGame()
    && !state.finished
    && !state.animating
    && currentPlayer()
    && ["draw", "discard", "finalActions"].includes(state.phase);
}

function buildTurnTimerKey() {
  const player = currentPlayer();
  return [
    onlineState.room?.id || "local-online",
    state.turnNumber,
    player?.id ?? state.activePlayer,
    state.phase,
    state.pendingFinish ? "final" : "turn",
    state.drawnCardId || ""
  ].join("|");
}

function turnTimerPhaseLabel() {
  if (state.pendingFinish || state.phase === "finalActions") return "초 / 최종 선택";
  if (state.phase === "discard") return "초 / 버리기";
  return "초 / 가져오기";
}

function setTurnTimerVisible(visible) {
  if (!els.turnTimer) return;
  els.turnTimer.classList.toggle("hidden", !visible);
}

function startTurnTimer(key) {
  if (!els.turnTimer) return;
  if (turnTimerInterval) window.clearInterval(turnTimerInterval);
  state.turnTimerKey = key;
  state.turnDeadlineAt = Date.now() + (ONLINE_TURN_LIMIT_SECONDS * 1000);
  turnTimerHandledKey = "";
  setTurnTimerVisible(true);
  updateTurnTimerDisplay();
  turnTimerInterval = window.setInterval(updateTurnTimerDisplay, 250);
}

function stopTurnTimer(options = {}) {
  if (turnTimerInterval) {
    window.clearInterval(turnTimerInterval);
    turnTimerInterval = null;
  }
  if (options.hide !== false) setTurnTimerVisible(false);
}

function syncTurnTimer() {
  if (!isTurnTimerPhase()) {
    resetTurnTimerState();
    return;
  }

  const key = buildTurnTimerKey();
  if (state.turnTimerKey !== key || !state.turnDeadlineAt) {
    startTurnTimer(key);
    return;
  }

  setTurnTimerVisible(true);
  if (!turnTimerInterval) {
    turnTimerInterval = window.setInterval(updateTurnTimerDisplay, 250);
  }
  updateTurnTimerDisplay();
}

function updateTurnTimerDisplay() {
  if (!els.turnTimer || !state.turnDeadlineAt) return;
  const secondsLeft = Math.max(0, Math.ceil((state.turnDeadlineAt - Date.now()) / 1000));
  if (els.turnTimerNumber) els.turnTimerNumber.textContent = String(secondsLeft);
  if (els.turnTimerLabel) els.turnTimerLabel.textContent = turnTimerPhaseLabel();
  els.turnTimer.classList.toggle("warning", secondsLeft <= 10);
  els.turnTimer.classList.toggle("danger", secondsLeft <= 5);

  if (secondsLeft <= 0) {
    handleTurnTimerExpired(state.turnTimerKey);
  }
}

function handleTurnTimerExpired(key) {
  if (!key || turnTimerHandledKey === key || key !== state.turnTimerKey) return;
  turnTimerHandledKey = key;
  stopTurnTimer({ hide: false });
  if (!canThisClientHandleTurnTimeout()) return;
  handleTimedTurnSkip();
}

function canThisClientHandleTurnTimeout() {
  if (!isOnlinePlaying()) return true;
  return onlineState.room?.host_token === onlinePlayerToken();
}

function handleTimedTurnSkip() {
  if (state.finished || state.animating) return;
  const player = currentPlayer();
  if (!player) return;

  if (state.pendingFinish || state.phase === "finalActions") {
    skipPendingFinalActions(player);
    return;
  }

  if (state.phase === "discard") {
    discardTimeoutCard(player);
    return;
  }

  if (state.phase === "draw") {
    log(`${player.name}: 제한 시간 초과로 턴을 넘겼습니다.`);
    endTurn();
  }
}

function chooseTimeoutDiscard(player) {
  if (!player?.hand?.length) return null;
  const drawnCard = state.drawnCardId
    ? player.hand.find((card) => card.id === state.drawnCardId)
    : null;
  if (drawnCard) return drawnCard;
  return [...player.hand].sort((a, b) => a.base - b.base || a.name.localeCompare(b.name, "ko"))[0];
}

function discardTimeoutCard(player) {
  const card = chooseTimeoutDiscard(player);
  if (!card) {
    log(`${player.name}: 제한 시간 초과로 턴을 넘겼습니다.`);
    endTurn();
    return;
  }

  const index = player.hand.findIndex((candidate) => candidate.id === card.id);
  if (index < 0) {
    endTurn();
    return;
  }

  const [discarded] = player.hand.splice(index, 1);
  cleanupUnavailableActions(player);
  state.discard.push(discarded);
  state.selectedCardId = discarded.id;
  log(`${player.name}: 제한 시간 초과로 ${discarded.name} 카드를 자동으로 버렸습니다.`);
  endTurn();
}

function skipPendingFinalActions(player) {
  const missing = getRequiredActionIssues(player);
  missing.forEach((entry) => skipCardAction(cardSourceId(entry.card)));
  if (missing.length > 0) {
    log(`${player.name}: 제한 시간 초과로 마지막 선택을 건너뛰었습니다.`);
  }
  completePendingFinishIfReady();
  if (!state.finished) render();
}

function currentPlayer() {
  return state.players[state.activePlayer];
}

function canControlActivePlayer() {
  const player = currentPlayer();
  if (!player?.human || state.finished || state.animating) return false;
  if (!isOnlinePlaying()) return true;
  return !onlineState.loading && !onlineState.savingGame && !onlineState.applyingRemote;
}

function canEditActionControlsForPlayer(player) {
  if (!player?.human || state.finished || state.animating) return false;
  if (state.pendingFinish || state.phase === "finalActions") {
    return player === currentPlayer() && canControlActivePlayer();
  }
  if (!isOnlinePlaying()) return true;
  return currentPlayer()?.human && !onlineState.loading && !onlineState.savingGame && !onlineState.applyingRemote;
}

function isFinalActionPhase() {
  return state.pendingFinish || state.phase === "finalActions";
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

function speakAiTurnStart(player) {
  return speakSingleDialogue("wait", {
    player,
    chance: 0.16,
    duration: DIALOGUE_DISPLAY_MS
  });
}

function speakAiScoreReaction(player, beforeScore, afterScore) {
  const delta = afterScore - beforeScore;
  if (delta >= 10) {
    return speakSingleDialogue("takeDiscard", { player, chance: 0.45, duration: DIALOGUE_DISPLAY_MS })
      || speakSingleDialogue("wait", { player, chance: 0.3, duration: DIALOGUE_DISPLAY_MS });
  }
  if (delta <= -8) {
    return speakSingleDialogue("discard", { player, chance: 0.38, duration: DIALOGUE_DISPLAY_MS });
  }
  return false;
}

function getPenaltyClearInfo(card, scoreRow) {
  if (!scoreRow?.penaltyCleared || !card.penaltyText) return null;
  const sourceName = displayNameForSource(scoreRow.penaltyClearedBy) || "다른 카드";
  return {
    title: `${sourceName} 카드로 인해 패널티 삭제`
  };
}

function getPenaltyWordClearInfo(card, scoreRow) {
  const clears = scoreRow?.penaltyWordClears || [];
  if (!card.penaltyText || clears.length === 0) return null;

  const terms = [...new Set(clears
    .map((clear) => clear.term)
    .filter((term) => term && card.penaltyText.includes(term)))];
  if (terms.length === 0) return null;

  const source = clears.find((clear) => terms.includes(clear.term))?.source;
  const sourceName = displayNameForSource(source) || "다른 카드";
  return {
    title: `${sourceName} 카드로 인해 패널티에서 ${terms.join(", ")} 제외`,
    terms
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

function formatCardEffectText(value, penaltyClearInfo = null, penaltyWordClearInfo = null) {
  if (!value) return "효과 없음";
  const segments = splitEffectSegments(value);
  if (segments.length === 0) {
    return applyPenaltyWordClears(escapeHtml(value), penaltyWordClearInfo)
      .replace(/(보너스|패널티)(?=:)/g, "<strong>$1</strong>");
  }

  return segments.map((segment) => {
    const body = segment.type === "penalty"
      ? applyPenaltyWordClears(escapeHtml(segment.body), penaltyWordClearInfo)
      : escapeHtml(segment.body);
    const text = `<strong>${escapeHtml(segment.label)}</strong>: ${body}`;
    if (segment.type !== "penalty" || !penaltyClearInfo) return text;
    return `<span class="card-effect-cleared">${text}</span>`;
  }).join(" ");
}

function applyPenaltyWordClears(html, penaltyWordClearInfo = null) {
  if (!penaltyWordClearInfo?.terms?.length) return html;
  return penaltyWordClearInfo.terms.reduce((result, term) => {
    const escapedTerm = escapeHtml(term);
    const pattern = new RegExp(escapeRegExp(escapedTerm), "g");
    return result.replace(pattern, `<span class="card-effect-word-cleared">${escapedTerm}</span>`);
  }, html);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
  saveOnlineGameState("card-action");
}

function clearCardAction(cardId) {
  const key = cardActionKey(cardId);
  delete state.cardActions[key];
  delete state.skippedActions[key];
  clearCardActionConfirmation(cardId);
}

function getCardAction(cardId) {
  return state.cardActions[cardActionKey(cardId)] || null;
}

function cardActionSignature(cardId) {
  return JSON.stringify((getCardAction(cardId) || []).map((value) => String(value || "")));
}

function isCardActionSignatureConfirmed(cardId) {
  return state.confirmedActions[cardActionKey(cardId)] === cardActionSignature(cardId);
}

function clearCardActionConfirmation(cardId) {
  const key = cardActionKey(cardId);
  delete state.confirmedActions[key];
  delete state.skippedActions[key];
}

function skipCardAction(cardId) {
  const key = cardActionKey(cardId);
  delete state.cardActions[key];
  delete state.confirmedActions[key];
  state.skippedActions[key] = true;
}

function isCardActionSkipped(card) {
  return Boolean(state.skippedActions[cardActionKey(cardSourceId(card))]);
}

function isOptionalActionType(type) {
  return OPTIONAL_ACTION_TYPES.has(type);
}

function isCardActionResolved(card, player) {
  return isCardActionSkipped(card) || isCardActionConfirmed(card, player);
}

function isOptionalActionNoSelection(card) {
  const type = getActionControlType(card);
  if (!isOptionalActionType(type)) return false;
  const action = getCardAction(cardSourceId(card));
  return !action || action.every((value) => !String(value || ""));
}

function confirmCardAction(card, player) {
  if (!isCardActionComplete(card, player)) return false;
  const sourceId = cardSourceId(card);
  if (isCardActionSignatureConfirmed(sourceId)) return true;
  if (isOptionalActionNoSelection(card)) {
    skipCardAction(sourceId);
    saveOnlineGameState("skip-action");
    return true;
  }
  if (!executeConfirmedCardAction(card, player)) return false;
  state.confirmedActions[cardActionKey(sourceId)] = cardActionSignature(sourceId);
  cleanupUnavailableActions(player);
  saveOnlineGameState("confirm-action");
  return true;
}

function isCardActionConfirmed(card, player) {
  const sourceId = cardSourceId(card);
  if (isCardActionSignatureConfirmed(sourceId)) return true;
  return false;
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

function getPlayerSourceCard(player, group) {
  return player?.hand.find((card) => isSourceId(cardSourceId(card), group)) || null;
}

function getDeckCardBySourceId(sourceId) {
  return state.deck.find((card) => cardSourceId(card) === String(sourceId)) || null;
}

function removeDeckCardBySourceId(sourceId) {
  const index = state.deck.findIndex((card) => cardSourceId(card) === String(sourceId));
  if (index < 0) return null;
  const [card] = state.deck.splice(index, 1);
  return card || null;
}

function isLeprechaunBlockingGenie(player) {
  const leprechaun = getPlayerSourceCard(player, "leprechaun");
  if (!leprechaun) return false;
  if (isCardActionSignatureConfirmed(cardSourceId(leprechaun))) return false;
  return state.deck.length > 0;
}

function executeConfirmedCardAction(card, player) {
  const type = getActionControlType(card);
  if (type === "leprechaun") return executeLeprechaunAction(card, player);
  if (type === "genie") return executeGenieAction(card, player);
  return true;
}

function executeLeprechaunAction(card, player) {
  if (!isFinalActionPhase()) return false;
  const sourceId = cardSourceId(card);
  const action = getCardAction(sourceId) || [];
  if (action[0] !== ACTION_EXECUTE_VALUE) return false;

  const gainedCard = state.deck.pop();
  if (!gainedCard) return false;

  player.hand.push(gainedCard);
  state.selectedCardId = gainedCard.id;
  log(`${player.name}: 레프리콘으로 ${gainedCard.name} 카드를 손패에 추가했습니다.`);
  return true;
}

function executeGenieAction(card, player) {
  const sourceId = cardSourceId(card);
  const action = getCardAction(sourceId) || [];
  const selectedId = String(action[1] || "");
  if (action[0] !== ACTION_EXECUTE_VALUE || !selectedId) return false;

  const gainedCard = removeDeckCardBySourceId(selectedId);
  if (!gainedCard) return false;

  player.hand.push(gainedCard);
  state.selectedCardId = gainedCard.id;
  log(`${player.name}: 지니로 ${gainedCard.name} 카드를 손패에 추가했습니다.`);
  return true;
}

function isPhoenixCard(card) {
  return ["FR55", "FR55P"].includes(cardSourceId(card));
}

function getScoringHand(player) {
  if (!player) return [];
  const scoringHand = [...player.hand];
  const necromancerExtra = getNecromancerExtraCard(player);
  if (necromancerExtra) scoringHand.push(necromancerExtra);
  const genieExtra = getGenieExtraCard(player);
  if (genieExtra) scoringHand.push(genieExtra);
  return scoringHand;
}

function getGenieExtraCard(player) {
  if (!player || isLeprechaunBlockingGenie(player)) return null;
  const genieId = getPlayerSourceId(player, "genie");
  if (!genieId) return null;

  const action = getCardAction(genieId);
  const selectedId = String(action?.[1] || "");
  if (action?.[0] !== ACTION_EXECUTE_VALUE || !selectedId) return null;

  const deckCard = getDeckCardBySourceId(selectedId);
  return deckCard ? { ...deckCard, genieExtra: true } : null;
}

function getNecromancerExtraCard(player) {
  if (!player) return null;
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
  if (!player) return [];
  cleanupUnavailableActions(player);
  return player.hand
    .map((card, index) => ({ card, index, type: getActionControlType(card) }))
    .filter((entry) => entry.type)
    .filter((entry) => doesActionRequireChoice(entry.card, player))
    .filter((entry) => !isCardActionSkipped(entry.card))
    .filter((entry) => !isCardActionConfirmed(entry.card, player))
    .sort((a, b) => (
      ACTION_CONTROL_ORDER.indexOf(a.type) - ACTION_CONTROL_ORDER.indexOf(b.type)
      || a.index - b.index
    ))
    .map(({ card, type }) => ({ card, type }));
}

function doesActionRequireChoice(card, player) {
  const type = getActionControlType(card);
  const sourceId = cardSourceId(card);

  if (type === "leprechaun") return isFinalActionPhase() && state.deck.length > 0;
  if (type === "genie") return state.deck.length > 0 && !isLeprechaunBlockingGenie(player);
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
  const action = getCardAction(sourceId) || [];

  if (isCardActionSignatureConfirmed(sourceId)) return true;
  if (isOptionalActionNoSelection(card)) return true;

  if (type === "leprechaun") {
    return isFinalActionPhase() && action[0] === ACTION_EXECUTE_VALUE && state.deck.length > 0;
  }

  if (type === "genie") {
    const selectedId = String(action[1] || "");
    return action[0] === ACTION_EXECUTE_VALUE
      && !isLeprechaunBlockingGenie(player)
      && Boolean(selectedId && getDeckCardBySourceId(selectedId));
  }

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
        penaltyClearedBy: null,
        penaltyWordClears: []
      };
    }

    const penaltyWordClears = getPenaltyWordClearsForCard(scored, card, scoringHand);
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
      penaltyClearedBy: scored.penaltyCleared ? penaltyClearSources.get(scored.id) || null : null,
      penaltyWordClears
    };
  });

  return { total, rows };
}

function getPenaltyWordClearsForCard(scoredCard, displayCard, scoringHand) {
  if (!scoredCard || scoredCard.blanked || scoredCard.penaltyCleared) return [];
  if (!displayCard?.penaltyText?.includes("군대")) return [];

  const source = getArmyPenaltyClearSource(scoredCard, scoringHand);
  if (!source) return [];

  return [{
    term: "군대",
    source: {
      id: source.id,
      name: source.name
    }
  }];
}

function getArmyPenaltyClearSource(targetCard, scoringHand) {
  const cards = scoringHand.cards();
  const rangers = cards.find((card) => (
    card.id === SOURCE_CARD_IDS.rangers || card.id === SOURCE_CARD_IDS.chRangers
  ));
  if (rangers) return rangers;

  const warship = cards.find((card) => card.id === SOURCE_CARD_IDS.warship);
  if (warship && targetCard.suit === "flood") return warship;

  return null;
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
  pendingMotionCardIds.add(card.id);
  const completeMotion = () => {
    pendingMotionCardIds.delete(card.id);
    onComplete?.();
  };
  render();
  if (!sourceRect) {
    completeMotion();
    return;
  }
  scheduleFrame(() => {
    animateCardMove(card.id, sourceRect, completeMotion);
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
  pendingDiscardMotionCardIds.add(card.id);
  const completeMotion = () => {
    pendingDiscardMotionCardIds.delete(card.id);
    onComplete?.();
  };
  render();
  if (!sourceRect) {
    completeMotion();
    return;
  }
  scheduleFrame(() => animateCardToDiscard(card, sourceRect, completeMotion));
}

function animateCardToDiscard(card, sourceRect, onComplete) {
  const target = els.discardArea.querySelector(dataCardSelector(card.id));
  if (!target) {
    onComplete?.();
    return;
  }

  animateCardElementToTarget(createCardElement(card, { playable: false }), sourceRect, target.getBoundingClientRect(), {
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
  movingCard.classList.remove("selected", "playable", "motion-arriving");
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
    saveOnlineGameState("draw-deck");
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
    saveOnlineGameState("draw-discard");
    speakSingleDialogue("takeDiscard", { excludedIds: [currentPlayer().id] });
  });
}

function discardFromHand(cardId, sourceElement) {
  if (!canControlActivePlayer() || state.phase !== "discard") {
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

function finalActionPlayerOrder() {
  return [...state.players].sort((a, b) => (
    (a.seat ?? a.id ?? 0) - (b.seat ?? b.id ?? 0)
  ));
}

function setActivePlayerByReference(player) {
  const index = state.players.indexOf(player);
  state.activePlayer = index >= 0 ? index : 0;
}

function nextPendingFinalActionPlayer() {
  const pending = finalActionPlayerOrder().flatMap((player, playerOrder) => (
    getRequiredActionIssues(player).map((issue, issueOrder) => ({
      player,
      issue,
      playerOrder,
      issueOrder
    }))
  ));
  pending.sort((a, b) => (
    ACTION_CONTROL_ORDER.indexOf(a.issue.type) - ACTION_CONTROL_ORDER.indexOf(b.issue.type)
    || a.playerOrder - b.playerOrder
    || a.issueOrder - b.issueOrder
  ));
  const next = pending[0];
  return next ? { player: next.player, missing: [next.issue] } : null;
}

function advanceFinalActions(reason = "final-actions") {
  if (!state.pendingFinish || state.finished) return true;

  resolveAiFinalActions();
  const next = nextPendingFinalActionPlayer();
  if (next) {
    setActivePlayerByReference(next.player);
    state.selectedCardId = next.missing[0].card.id;
    render();
    saveOnlineGameState(reason);
    return false;
  }

  finishGame();
  return true;
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
  saveOnlineGameState("end-turn");
  syncIdleDialogueTimer();

  if (currentPlayer().ai) {
    window.setTimeout(runAiTurn, 550);
  }
}

function requestFinishGame() {
  stopIdleDialogueTimer();
  state.pendingFinish = true;
  state.phase = "finalActions";
  state.drawnCardId = null;

  advanceFinalActions("final-actions");
}

function completePendingFinishIfReady() {
  if (!state.pendingFinish || state.finished) return;
  advanceFinalActions("final-actions");
}

function canUseCursedItem(player) {
  return state.includeCursedItems
    && player?.human
    && currentPlayer() === player
    && canControlActivePlayer()
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
  saveOnlineGameState("use-cursed-item");
}

function replaceActiveCursedItem(player) {
  if (!canUseCursedItem(player) || !player.activeCursedItem) return;
  if (player.activeCursedItem) {
    state.cursedDiscard.push(player.activeCursedItem);
    log(`${player.name}: ${player.activeCursedItem.name} 유물을 버리고 새 유물을 뽑았습니다.`);
  }
  player.activeCursedItem = drawCursedItem();
  render();
  saveOnlineGameState("replace-cursed-item");
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

function resolveAiFinalActions() {
  let changed = false;
  let safety = 0;

  while (safety < 80) {
    safety += 1;
    const next = nextPendingFinalActionPlayer();
    if (!next || !next.player.ai) break;
    setActivePlayerByReference(next.player);
    if (!resolveAiFinalAction(next.player, next.missing[0])) break;
    changed = true;
  }

  return changed;
}

function resolveAiFinalAction(player, issue) {
  const card = issue.card;
  const type = issue.type || getActionControlType(card);
  const sourceId = cardSourceId(card);

  if (type === "leprechaun") {
    setCardAction(sourceId, [ACTION_EXECUTE_VALUE]);
    if (confirmCardAction(card, player)) {
      speakSingleDialogue("takeDiscard", { player, chance: DIALOGUE_CHANCE });
      return true;
    }
    return false;
  }

  if (type === "genie") {
    const choice = chooseAiGenieCard(player);
    if (!choice) return false;
    setCardAction(sourceId, [ACTION_EXECUTE_VALUE, cardSourceId(choice)]);
    if (confirmCardAction(card, player)) {
      speakSingleDialogue("takeDiscard", { player, chance: DIALOGUE_CHANCE });
      return true;
    }
    return false;
  }

  if (type === "necromancer") {
    const choice = chooseAiNecromancerCard(player, sourceId);
    if (!choice) return false;
    setCardAction(sourceId, [cardSourceId(choice)]);
    return confirmCardAction(card, player);
  }

  const optionalChoice = chooseAiOptionalAction(player, card, type);
  if (!optionalChoice) {
    skipCardAction(sourceId);
    log(`${player.name}: ${card.name} 선택 효과를 사용하지 않았습니다.`);
    return true;
  }

  setCardAction(sourceId, optionalChoice);
  return confirmCardAction(card, player);
}

function chooseAiGenieCard(player) {
  if (state.deck.length === 0) return null;
  const difficulty = aiDifficultyKey(player);
  if (difficulty === "normal") {
    return [...state.deck].sort((a, b) => b.base - a.base || a.name.localeCompare(b.name, "ko"))[0] || null;
  }

  let bestCard = state.deck[0];
  let bestValue = -Infinity;
  state.deck.forEach((card) => {
    const value = evaluateAiHandValue(player, [...player.hand, card], difficulty);
    if (value > bestValue) {
      bestValue = value;
      bestCard = card;
    }
  });
  return bestCard || null;
}

function chooseAiNecromancerCard(player, sourceId) {
  const candidates = state.discard.filter((card) => NECROMANCER_TARGET_TYPES.includes(card.type));
  if (candidates.length === 0) return null;
  return chooseBestAiActionCandidate(player, sourceId, candidates.map((card) => ({
    values: [cardSourceId(card)],
    tie: card.base
  })))?.card || candidates[0];
}

function chooseAiOptionalAction(player, card, type) {
  const sourceId = cardSourceId(card);
  let candidates = [];

  if (type === "shapeshifter") {
    candidates = buildGlobalTargetOptions(SHAPESHIFTER_TARGET_TYPES).map((option) => ({ values: [option.value] }));
  } else if (type === "mirage") {
    candidates = buildGlobalTargetOptions(MIRAGE_TARGET_TYPES).map((option) => ({ values: [option.value] }));
  } else if (type === "doppelganger") {
    candidates = buildHandTargetOptions(player.hand, sourceId).map((option) => ({ values: [option.value] }));
  } else if (type === "bookOfChanges") {
    const targets = buildHandTargetOptions(player.hand, sourceId);
    const suits = getAvailableSuitOptions();
    candidates = targets.flatMap((target) => suits.map((suit) => ({ values: [target.value, suit.value] })));
  } else if (type === "island") {
    candidates = getIslandTargetOptions(player.hand, sourceId).map((option) => ({ values: [option.value] }));
  } else if (type === "angel") {
    candidates = buildHandTargetOptions(player.hand, sourceId).map((option) => ({ values: [option.value] }));
  }

  const best = chooseBestAiActionCandidate(player, sourceId, candidates);
  if (!best || best.value <= scorePlayer(player).total) return null;
  return best.values;
}

function chooseBestAiActionCandidate(player, sourceId, candidates) {
  let best = null;
  candidates.forEach((candidate) => {
    const value = scorePlayerWithTemporaryAction(player, sourceId, candidate.values).total;
    const tie = candidate.tie ?? 0;
    if (!best || value > best.value || (value === best.value && tie > best.tie)) {
      best = { ...candidate, value, tie, card: getSourceCardById(candidate.values[0]) };
    }
  });
  return best;
}

function scorePlayerWithTemporaryAction(player, sourceId, values) {
  const key = cardActionKey(sourceId);
  const hadAction = Object.prototype.hasOwnProperty.call(state.cardActions, key);
  const hadConfirmed = Object.prototype.hasOwnProperty.call(state.confirmedActions, key);
  const hadSkipped = Object.prototype.hasOwnProperty.call(state.skippedActions, key);
  const previousAction = state.cardActions[key];
  const previousConfirmed = state.confirmedActions[key];
  const previousSkipped = state.skippedActions[key];

  state.cardActions[key] = values.map((value) => String(value || ""));
  delete state.confirmedActions[key];
  delete state.skippedActions[key];
  const score = scorePlayer(player);

  if (hadAction) state.cardActions[key] = previousAction;
  else delete state.cardActions[key];
  if (hadConfirmed) state.confirmedActions[key] = previousConfirmed;
  else delete state.confirmedActions[key];
  if (hadSkipped) state.skippedActions[key] = previousSkipped;
  else delete state.skippedActions[key];

  return score;
}

function finishGame() {
  resetTurnTimerState();
  state.pendingFinish = false;
  state.finished = true;
  state.phase = "finished";
  const ranked = [...state.players]
    .map((player) => {
      const score = scorePlayer(player);
      return { player, score: score.total, scoreDetails: score };
    })
    .sort((a, b) => b.score - a.score);
  log(`게임 종료. 승자: ${ranked[0].player.name} (${ranked[0].score}점)`);
  stopIdleDialogueTimer();
  render();
  saveOnlineGameState("finish");
  clearOnlineRoomSnapshot();
  speakAllAiDialogue(null, {
    duration: DIALOGUE_END_DISPLAY_MS,
    eventByPlayer: (player) => ranked[0].player.id === player.id ? "win" : "lose"
  });
  showEndNotification(ranked);
  submitLeaderboardScore(ranked);
  submitBeomryeHallOfFame(ranked);
}

function showEndNotification(ranked) {
  if (!els.endDialog || !els.endSummary) return;
  const humanEntry = ranked.find((entry) => entry.player.human);
  const humanWon = Boolean(humanEntry && ranked[0]?.player.id === humanEntry.player.id);
  const leaderboardText = state.onlineGame
    ? "온라인 게임은 랭킹에 등록하지 않습니다."
    : humanWon
      ? "승리 기록을 랭킹에 자동 등록합니다."
      : "랭킹은 싱글플레이에서 승리했을 때만 등록됩니다.";
  const hallQualified = qualifiesForBeomryeHallOfFame(ranked);
  const hallText = hallQualified
    ? "완전랜덤 강범례 격파 기록도 명예의 전당에 도전합니다."
    : beomryeHallIneligibleText(ranked);
  els.endSummary.innerHTML = `
    <strong>${escapeHtml(ranked[0].player.name)} 승리</strong>
    <span>${ranked[0].score}점으로 게임이 끝났습니다.</span>
    <small>${leaderboardText}</small>
    ${hallText ? `<small>${hallText}</small>` : ""}
    ${hallText ? endHallNoticeHtml(hallQualified, hallText) : ""}
    <div class="end-score-grid">
      ${ranked.map((entry, index) => endScoreCardHtml(entry, index)).join("")}
    </div>
  `;

  if (typeof els.endDialog.showModal === "function" && !els.endDialog.open) {
    els.endDialog.showModal();
  }
}

function endHallNoticeHtml(qualified, fallbackText = "") {
  const text = qualified
    ? "완전랜덤 강범례를 쓰러뜨렸습니다. 명예의 전당 기록과 비교합니다."
    : fallbackText;
  if (!text) return "";
  return `
    <div id="endHallNotice" class="end-hall-notice${qualified ? "" : " missed"}">
      <span>범례 격파 명예의 전당</span>
      <strong>${escapeHtml(text)}</strong>
    </div>
  `;
}

function updateEndHallNotice(message, status = "pending") {
  const notice = document.querySelector("#endHallNotice");
  if (!notice) return;
  notice.classList.toggle("success", status === "success");
  notice.classList.toggle("missed", status === "missed");
  const body = notice.querySelector("strong");
  if (body) body.textContent = message;
}

function scoreSummary(score) {
  const rows = score?.rows || [];
  return {
    base: rows.reduce((sum, row) => sum + row.base, 0),
    bonus: rows.reduce((sum, row) => sum + Math.max(0, row.bonus), 0),
    penalty: rows.reduce((sum, row) => sum + Math.min(0, row.penalty), 0),
    blanked: rows.filter((row) => row.blanked).length,
    cleared: rows.filter((row) => row.penaltyCleared).length
  };
}

function endScoreCardHtml(entry, index) {
  const score = entry.scoreDetails || scorePlayer(entry.player);
  const summary = scoreSummary(score);
  const rankLabel = index === 0 ? "승자" : `${index + 1}위`;
  const name = escapeHtml(entry.player.name);
  const avatar = playerAvatarHtml(entry.player) || '<span class="end-avatar-placeholder" aria-hidden="true"></span>';
  const specialStats = [
    summary.blanked ? `무효 ${summary.blanked}장` : "",
    summary.cleared ? `패널티 제거 ${summary.cleared}장` : ""
  ].filter(Boolean).join(" · ") || "특수 처리 없음";

  return `
    <article class="end-score-card${entry.player.human ? " human" : ""}${index === 0 ? " winner" : ""}">
      <div class="end-score-head">
        ${avatar}
        <div>
          <span>${rankLabel}</span>
          <strong>${name}</strong>
        </div>
        <b>${entry.score}점</b>
      </div>
      <div class="end-score-parts">
        <span>기본 <b>${summary.base}</b></span>
        <span>보너스 <b class="bonus-value">+${summary.bonus}</b></span>
        <span>패널티 <b class="penalty-value">${summary.penalty}</b></span>
      </div>
      <small>${specialStats}</small>
    </article>
  `;
}

function canHumanDraw() {
  return canControlActivePlayer() && state.phase === "draw";
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
  if (state.finished || !currentPlayer().ai || state.animating) return;
  const player = currentPlayer();
  const scoreBeforeTurn = scorePlayer(player).total;
  speakAiTurnStart(player);
  log(`${player.name}: 카드를 고르는 중입니다.`);
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
    speakSingleDialogue("takeDiscard", { player, chance: 0.24 });
  }
  renderWithAiDrawMove(drawn, drawSourceRect, player.id, hiddenDraw, () => {
    const discardId = chooseAiDiscard(player, player.hand);
    const discardIndex = player.hand.findIndex((card) => card.id === discardId);
    const discardSourceRect = getOpponentLandingElement(player.id)?.getBoundingClientRect?.();
    const [discarded] = player.hand.splice(discardIndex, 1);
    state.discard.push(discarded);
    state.selectedCardId = discarded.id;
    log(`${player.name}: ${discarded.name} 카드를 버렸습니다.`);
    const scoreAfterTurn = scorePlayer(player).total;
    const spokeDiscard = speakSingleDialogue("discard", { player });
    if (!spokeDiscard) speakAiScoreReaction(player, scoreBeforeTurn, scoreAfterTurn);
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
  syncTurnTimer();
}

function renderStatus() {
  const player = currentPlayer();
  els.turnLabel.textContent = state.finished ? "게임 종료" : `${player.name} / ${state.turnNumber}라운드`;
  els.phaseLabel.textContent = phaseText();

  els.scoreList.innerHTML = "";
  state.players.filter((entry) => entry.human).forEach((entry) => {
    const score = scorePlayer(entry).total;
    const card = document.createElement("div");
    card.className = `score-card${currentPlayer() === entry && !state.finished ? " active" : ""}`;
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
  if (state.phase === "draw") {
    if (currentPlayer().human) return "가져오기";
    return currentPlayer().ai ? "AI 생각 중" : "상대 차례";
  }
  if (state.phase === "discard") return currentPlayer().human ? "버리기" : "상대 차례";
  return "대기";
}

function renderOpponents() {
  els.opponentsRow.innerHTML = "";
  els.opponentsRow.classList.toggle("finished-opponents", state.finished);
  state.players.slice(1).forEach((player, offset) => {
    const index = offset + 1;
    const opponent = document.createElement("div");
    opponent.className = `opponent${currentPlayer() === player && !state.finished ? " active" : ""}`;
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

  const discardEmpty = state.discard.length === 0;
  els.discardArea.classList.toggle("discard-area-empty", discardEmpty);
  els.discardArea.closest(".discard-zone")?.classList.toggle("discard-zone-empty", discardEmpty);
  els.discardArea.closest(".center-table")?.classList.toggle("center-table-discard-empty", discardEmpty);
  els.discardArea.closest(".table-area")?.classList.toggle("table-area-discard-empty", discardEmpty);
  els.discardArea.innerHTML = "";
  if (discardEmpty) {
    const empty = document.createElement("div");
    empty.className = "empty-detail";
    empty.textContent = "아직 공개된 카드가 없습니다.";
    els.discardArea.append(empty);
  } else {
    state.discard.forEach((card) => {
      const slot = document.createElement("div");
      slot.className = "discard-card-slot";
      slot.dataset.cardId = card.id;
      if (pendingDiscardMotionCardIds.has(card.id)) {
        slot.classList.add("discard-card-slot-pending");
      } else {
        slot.append(createCardElement(card, {
          playable: canHumanDraw(),
          onClick: (event) => canHumanDraw() ? drawFromDiscard(card.id, event.currentTarget) : selectCard(card.id)
        }));
      }
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
      playable: state.phase === "discard" && canControlActivePlayer(),
      onClick: (event) => {
        if (state.phase === "discard" && canControlActivePlayer()) {
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
  const penaltyWordClearInfo = getPenaltyWordClearInfo(card, options.scoreRow);
  const blankInfo = getBlankInfo(card, options.scoreRow);
  const statusInfo = blankInfo || penaltyClearInfo || penaltyWordClearInfo;
  const statusTooltip = statusInfo
    ? `<span class="card-status-tooltip">${escapeHtml(statusInfo.title)}</span>`
    : "";
  const button = document.createElement("button");
  button.type = "button";
  button.className = `card ${options.playable ? "playable" : "disabled-card"}${artUrl ? " has-art" : ""}${blankInfo ? " blanked-card" : ""}${state.selectedCardId === card.id ? " selected" : ""}${pendingMotionCardIds.has(card.id) ? " motion-arriving" : ""}`;
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
      ${artUrl ? `<img src="${artUrl}" alt="" loading="eager" decoding="sync" />` : `<span>${meta.glyph}</span>`}
    </div>
    <span class="card-type">${meta.label}</span>
    <p class="card-effect">${formatCardEffectText(card.text, penaltyClearInfo, penaltyWordClearInfo)}</p>
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

function catalogTypeOptions(cards = catalogCards()) {
  const usedTypes = new Set(cards.map((card) => card.type));
  return [
    { value: "all", label: "전체" },
    ...SOURCE_SUIT_OPTIONS.filter((option) => usedTypes.has(option.value)),
    ...(usedTypes.has("cursed-item") ? [{ value: "cursed-item", label: TYPE_META["cursed-item"].label }] : [])
  ];
}

function syncCatalogFilterControls(cards = catalogCards()) {
  if (!els.cardCatalogFilters) return;
  els.cardCatalogFilters.classList.remove("hidden");

  if (els.cardCatalogSearchInput && document.activeElement !== els.cardCatalogSearchInput) {
    els.cardCatalogSearchInput.value = cardCatalogFilter.query;
  }

  if (els.cardCatalogTypeSelect) {
    const options = catalogTypeOptions(cards);
    const validType = options.some((option) => option.value === cardCatalogFilter.type);
    if (!validType) cardCatalogFilter.type = "all";
    els.cardCatalogTypeSelect.innerHTML = options
      .map((option) => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`)
      .join("");
    els.cardCatalogTypeSelect.value = cardCatalogFilter.type;
  }
}

function hideCatalogFilters() {
  els.cardCatalogFilters?.classList.add("hidden");
}

function filteredCatalogCards(cards) {
  const query = cardCatalogFilter.query.trim().toLocaleLowerCase("ko-KR");
  return cards.filter((card) => {
    if (cardCatalogFilter.type !== "all" && card.type !== cardCatalogFilter.type) return false;
    if (!query) return true;
    const meta = TYPE_META[card.type] || TYPE_META.wild;
    const searchable = [
      card.name,
      card.sourceName,
      card.text,
      card.bonusText,
      card.penaltyText,
      card.actionText,
      meta.label
    ].filter(Boolean).join(" ").toLocaleLowerCase("ko-KR");
    return searchable.includes(query);
  });
}

function createCatalogCard(card, options = {}) {
  const meta = TYPE_META[card.type] || TYPE_META.wild;
  const item = buildCardElement(card, { playable: Boolean(options.selectable) });
  item.classList.add("catalog-card");
  item.setAttribute("aria-label", `${card.name} 카드`);
  item.title = `${card.name}\n${meta.label} ${card.base}점\n${card.text || "효과 없음"}`;
  if (options.selectable) {
    const chooseCard = () => options.onSelect?.(card);
    item.classList.add("selectable-catalog-card");
    if (String(options.selectedSourceId || "") === cardSourceId(card)) {
      item.classList.add("selected-catalog-card");
    }
    item.tabIndex = 0;
    item.setAttribute("role", "button");
    item.setAttribute("aria-label", `${card.name} 선택`);
    item.addEventListener("click", chooseCard);
    item.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      chooseCard();
    });
  }
  return item;
}

function setCardCatalogTitle(title) {
  const heading = els.cardCatalogDialog?.querySelector("h2");
  if (heading) heading.textContent = title;
}

function renderCardCatalog() {
  if (!els.cardCatalogList) return;
  const cards = catalogCards();
  const filteredCards = filteredCatalogCards(cards);
  syncCatalogFilterControls(cards);
  els.cardCatalogList.innerHTML = "";
  if (filteredCards.length === 0) {
    const empty = document.createElement("div");
    empty.className = "catalog-empty";
    empty.textContent = "조건에 맞는 카드가 없습니다.";
    els.cardCatalogList.append(empty);
  } else {
    const fragment = document.createDocumentFragment();
    filteredCards.forEach((card) => {
      fragment.append(createCatalogCard(card));
    });
    els.cardCatalogList.append(fragment);
  }
  if (els.cardCatalogSummary) {
    const cursedCount = state.includeCursedItems ? CURSED_ITEM_LIBRARY.length : 0;
    const expansionText = state.includeExpansion ? "확장팩 포함" : "오리지널";
    const cursedText = state.includeCursedItems ? `저주받은 유물 ${cursedCount}장 포함` : "저주받은 유물 제외";
    const filterText = filteredCards.length === cards.length ? "" : ` · 표시 ${filteredCards.length}장`;
    els.cardCatalogSummary.textContent = `${expansionText} · ${cursedText} · 총 ${cards.length}장${filterText}`;
  }
}

function openCardCatalog() {
  if (!els.cardCatalogDialog || !els.cardCatalogList) return;
  setCardCatalogTitle("모든 카드 보기");
  renderCardCatalog();
  if (typeof els.cardCatalogDialog.showModal === "function" && !els.cardCatalogDialog.open) {
    els.cardCatalogDialog.showModal();
  }
}

function openGenieDeckPicker(sourceId) {
  if (!els.cardCatalogDialog || !els.cardCatalogList) return;
  setCardCatalogTitle("지니 카드 선택");
  hideCatalogFilters();
  const action = getCardAction(sourceId) || [];
  const selectedSourceId = String(action[1] || "");
  const cards = [...state.deck].sort((a, b) => (
    catalogTypeOrder(a) - catalogTypeOrder(b)
    || a.base - b.base
    || a.name.localeCompare(b.name, "ko")
  ));

  els.cardCatalogList.innerHTML = "";
  const fragment = document.createDocumentFragment();
  cards.forEach((card) => {
    fragment.append(createCatalogCard(card, {
      selectable: true,
      selectedSourceId,
      onSelect: (selectedCard) => {
        setCardAction(sourceId, [ACTION_EXECUTE_VALUE, cardSourceId(selectedCard)]);
        if (els.cardCatalogDialog.open) els.cardCatalogDialog.close();
        render();
      }
    }));
  });
  els.cardCatalogList.append(fragment);
  if (els.cardCatalogSummary) {
    els.cardCatalogSummary.textContent = `지니: 남은 덱 ${cards.length}장 중 1장을 선택하세요.`;
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
  const actionCards = player.hand
    .map((card, index) => ({ card, index, type: getActionControlType(card) }))
    .filter((entry) => entry.type)
    .sort((a, b) => (
      ACTION_CONTROL_ORDER.indexOf(a.type) - ACTION_CONTROL_ORDER.indexOf(b.type)
      || a.index - b.index
    ))
    .map((entry) => entry.card);
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
  const handActionIds = new Set(state.players.flatMap((entry) => (
    entry.hand.map((card) => cardActionKey(cardSourceId(card)))
  )));
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
  Object.keys(state.skippedActions).forEach((key) => {
    if (controlIds.has(key) && !handActionIds.has(key)) {
      delete state.skippedActions[key];
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
  if (type === "leprechaun") {
    return action[0] === ACTION_EXECUTE_VALUE && (state.deck.length > 0 || isCardActionSignatureConfirmed(sourceId));
  }

  if (type === "genie") {
    const selectedId = String(action[1] || "");
    if (action[0] !== ACTION_EXECUTE_VALUE) return false;
    return !selectedId || Boolean(getDeckCardBySourceId(selectedId) || isCardActionSignatureConfirmed(sourceId));
  }

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
  if (isSourceId(sourceId, "leprechaun")) return "leprechaun";
  if (isSourceId(sourceId, "genie")) return "genie";
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
  const finalOnlyLocked = type === "leprechaun" && !isFinalActionPhase();
  const controlsDisabled = !canEditActionControlsForPlayer(player) || finalOnlyLocked;
  const section = document.createElement("section");
  section.className = "score-action-card";
  if (state.pendingFinish && requiresChoice) {
    section.classList.add(isCardActionResolved(card, player) ? "complete" : "required");
  }
  section.innerHTML = `
    <div class="action-card-title">
      <strong>${card.name}</strong>
      <span>${actionLabel(type)}</span>
    </div>
  `;

  const fields = document.createElement("div");
  fields.className = "action-fields";

  if (type === "leprechaun") {
    fields.append(createSelectField("실행", action[0] || "", ACTION_EXECUTE_OPTIONS, (value) => {
      setCardAction(sourceId, [value]);
      render();
    }, { disabled: controlsDisabled }));
    if (finalOnlyLocked) {
      const hint = document.createElement("span");
      hint.className = "action-selection-note";
      hint.textContent = "레프리콘은 게임 종료 후 최종 선택에서 사용할 수 있습니다.";
      fields.append(hint);
    }
  } else if (type === "genie") {
    const selectedCard = getDeckCardBySourceId(action[1]);
    const waitingForLeprechaun = isLeprechaunBlockingGenie(player);
    fields.append(createSelectField("실행", action[0] || "", ACTION_EXECUTE_OPTIONS, (value) => {
      setCardAction(sourceId, [value, action[1] || ""]);
      render();
    }, { disabled: controlsDisabled }));

    const pickerButton = document.createElement("button");
    pickerButton.type = "button";
    pickerButton.className = "action-pick-button";
    pickerButton.textContent = selectedCard ? `${selectedCard.name} 선택됨` : "남은 카드 선택";
    pickerButton.disabled = controlsDisabled || waitingForLeprechaun || action[0] !== ACTION_EXECUTE_VALUE || state.deck.length === 0;
    pickerButton.addEventListener("click", () => openGenieDeckPicker(sourceId));
    fields.append(pickerButton);

    const hint = document.createElement("span");
    hint.className = "action-selection-note";
    hint.textContent = waitingForLeprechaun
      ? "레프리콘을 먼저 확정해야 지니를 실행할 수 있습니다."
      : selectedCard
        ? `${selectedCard.name} 카드를 가져옵니다.`
        : "실행하기를 고른 뒤 남은 덱에서 1장을 선택하세요.";
    fields.append(hint);
  } else if (type === "shapeshifter") {
    fields.append(createSelectField("복사", action[0] || "", buildGlobalTargetOptions(SHAPESHIFTER_TARGET_TYPES), (value) => {
      setCardAction(sourceId, [value]);
      render();
    }, { allowNone: true, disabled: controlsDisabled }));
  } else if (type === "mirage") {
    fields.append(createSelectField("복사", action[0] || "", buildGlobalTargetOptions(MIRAGE_TARGET_TYPES), (value) => {
      setCardAction(sourceId, [value]);
      render();
    }, { allowNone: true, disabled: controlsDisabled }));
  } else if (type === "doppelganger") {
    fields.append(createSelectField("복사", action[0] || "", buildHandTargetOptions(player.hand, sourceId), (value) => {
      setCardAction(sourceId, [value]);
      render();
    }, { allowNone: true, disabled: controlsDisabled }));
  } else if (type === "necromancer") {
    fields.append(createSelectField("추가", action[0] || "", buildDiscardTargetOptions(NECROMANCER_TARGET_TYPES), (value) => {
      setCardAction(sourceId, [value]);
      render();
    }, { disabled: controlsDisabled }));
  } else if (type === "bookOfChanges") {
    fields.append(createSelectField("대상", action[0] || "", buildHandTargetOptions(player.hand, sourceId), (value) => {
      setCardAction(sourceId, [value, action[1] || ""]);
      render();
    }, { allowNone: true, disabled: controlsDisabled }));
    fields.append(createSelectField("종류", action[1] || "", getAvailableSuitOptions(), (value) => {
      setCardAction(sourceId, [action[0] || "", value]);
      render();
    }, { allowNone: true, disabled: controlsDisabled }));
  } else if (type === "island") {
    fields.append(createSelectField("보호", action[0] || "", getIslandTargetOptions(player.hand, sourceId), (value) => {
      setCardAction(sourceId, [value]);
      render();
    }, { allowNone: true, disabled: controlsDisabled }));
  } else if (type === "angel") {
    fields.append(createSelectField("보호", action[0] || "", buildHandTargetOptions(player.hand, sourceId), (value) => {
      setCardAction(sourceId, [value]);
      render();
    }, { allowNone: true, disabled: controlsDisabled }));
  }

  if (requiresChoice) {
    fields.classList.add("with-confirm");
    fields.append(createActionConfirmButton(card, player, controlsDisabled));
  }

  if (state.pendingFinish && requiresChoice) {
    const note = document.createElement("div");
    note.className = "action-required-note";
    note.textContent = isCardActionSkipped(card)
      ? "선택안함"
      : isCardActionConfirmed(card, player)
        ? "확정 완료"
        : "게임 종료 전 확정 필요";
    section.append(note);
  }
  section.append(fields);
  return section;
}

function createActionConfirmButton(card, player, forceDisabled = false) {
  const button = document.createElement("button");
  const confirmed = isCardActionConfirmed(card, player);
  const skipped = isCardActionSkipped(card);
  const complete = isCardActionComplete(card, player);
  button.type = "button";
  button.className = "action-confirm-button";
  button.textContent = skipped ? "선택안함" : confirmed ? "확정됨" : "확정";
  button.disabled = forceDisabled || confirmed || skipped || !complete;
  button.addEventListener("click", () => {
    if (button.disabled) return;
    if (!confirmCardAction(card, player)) return;
    completePendingFinishIfReady();
    if (!state.finished) render();
  });
  return button;
}

function actionLabel(type) {
  const labels = {
    leprechaun: "덱 맨 위 획득",
    genie: "남은 덱 선택 획득",
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

function createSelectField(label, selectedValue, options, onChange, settings = {}) {
  const field = document.createElement("label");
  field.className = "action-field";

  const labelText = document.createElement("span");
  labelText.textContent = label;

  const select = document.createElement("select");
  const hasOptions = options.length > 0;
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = settings.allowNone ? "선택안함" : hasOptions ? "선택 필요" : "대상 없음";
  select.append(defaultOption);

  options.forEach((option) => {
    const item = document.createElement("option");
    item.value = String(option.value);
    item.textContent = option.label;
    select.append(item);
  });

  select.value = options.some((option) => String(option.value) === String(selectedValue)) ? String(selectedValue) : "";
  select.disabled = !hasOptions || Boolean(settings.disabled);
  select.addEventListener("change", () => {
    if (select.disabled) return;
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

els.confirmNicknameButton?.addEventListener("click", () => confirmHumanNicknameChange(els.humanNameInput));
els.humanNameInput?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  confirmHumanNicknameChange(els.humanNameInput);
});
els.onlineNameInput?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  confirmHumanNicknameChange(els.onlineNameInput);
});
els.refreshLeaderboardButton?.addEventListener("click", loadLeaderboard);
els.refreshLeaderboardButton?.addEventListener("click", loadHallOfFame);
els.startButton.addEventListener("click", startGame);
els.createRoomButton?.addEventListener("click", createOnlineRoom);
els.rejoinRoomButton?.addEventListener("click", restoreOnlineRoom);
els.joinRoomButton?.addEventListener("click", joinOnlineRoom);
els.copyRoomCodeButton?.addEventListener("click", copyOnlineRoomCode);
els.startOnlineGameButton?.addEventListener("click", startOnlineGame);
els.leaveRoomButton?.addEventListener("click", leaveOnlineRoom);
els.roomCodeInput?.addEventListener("input", () => {
  els.roomCodeInput.value = normalizeRoomCode(els.roomCodeInput.value);
});
els.roomCodeInput?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") joinOnlineRoom();
});
els.newGameButton.addEventListener("click", () => {
  resetTurnTimerState();
  els.setupPanel.classList.remove("hidden");
  els.gameBoard.classList.add("hidden");
  state.phase = "setup";
  state.pendingFinish = false;
  state.finished = false;
  state.onlineGame = false;
  state.confirmedActions = {};
  state.skippedActions = {};
  state.leaderboardSubmitted = false;
  state.hallOfFameSubmitted = false;
  onlineState.activeGameKey = "";
  updateTitleArt();
  loadHallOfFame();
  loadLeaderboard();
});
els.expansionCheckbox?.addEventListener("change", updateTitleArt);
els.deckButton.addEventListener("click", drawFromDeck);
els.cardCatalogButton?.addEventListener("click", openCardCatalog);
els.cardCatalogSearchInput?.addEventListener("input", () => {
  cardCatalogFilter.query = els.cardCatalogSearchInput.value;
  renderCardCatalog();
});
els.cardCatalogTypeSelect?.addEventListener("change", () => {
  cardCatalogFilter.type = els.cardCatalogTypeSelect.value || "all";
  renderCardCatalog();
});
els.cardCatalogDialog?.addEventListener("click", (event) => {
  if (event.target === els.cardCatalogDialog) {
    els.cardCatalogDialog.close();
  }
});
els.sortButton.addEventListener("click", sortHand);
els.rulesButton.addEventListener("click", () => els.rulesDialog.showModal());
els.restartGameButton.addEventListener("click", () => {
  els.endDialog.close();
  startGame();
});
els.leaveFinishedGameButton?.addEventListener("click", leaveOnlineRoom);

initializeHumanNicknameControls();
updateTitleArt();
loadHallOfFame();
loadLeaderboard();
restoreOnlineRoom();
