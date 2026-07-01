(function () {
  "use strict";

  const SUSPECTS = ["스칼렛", "머스터드", "화이트", "그린", "피콕", "플럼"];
  const WEAPONS = ["촛대", "단검", "파이프", "권총", "밧줄", "렌치"];
  const ROOMS = [
    { id: "bedroom", name: "침실", x: 18, y: 19, cost: 4 },
    { id: "bathroom", name: "욕실", x: 40, y: 13, cost: 3 },
    { id: "study", name: "서재", x: 58, y: 13, cost: 3 },
    { id: "kitchen", name: "부엌", x: 82, y: 24, cost: 4 },
    { id: "dining", name: "식당", x: 80, y: 52, cost: 3 },
    { id: "living", name: "거실", x: 82, y: 76, cost: 4 },
    { id: "hall", name: "마당", x: 48, y: 86, cost: 4 },
    { id: "garage", name: "차고", x: 17, y: 80, cost: 5 },
    { id: "game", name: "게임룸", x: 20, y: 52, cost: 3 }
  ];
  const HINT_ACTION = { id: "hint", name: "? 카드", hint: true };
  const CLUE_ZONE = { id: "clue", name: "CLUE 존", x: 50, y: 58, cost: 6, clue: true };
  const MOVE_DESTINATIONS = [...ROOMS, CLUE_ZONE];
  const CENTRAL_NEAR_ROOM_IDS = ["study", "dining", "hall", "game"];
  const ROOM_BY_ID = Object.fromEntries(ROOMS.map((room) => [room.id, room]));
  const ROOM_BY_NAME = Object.fromEntries(ROOMS.map((room) => [room.name, room]));
  const CENTER = { id: "center", name: "복도", x: 50, y: 50 };
  const ROOM_LINKS = {
    bedroom: { bathroom: 4, game: 4, center: 4 },
    bathroom: { bedroom: 4, study: 3, center: 3 },
    study: { bathroom: 3, kitchen: 4, center: 3 },
    kitchen: { study: 4, dining: 3, center: 4 },
    dining: { kitchen: 3, living: 3, center: 3 },
    living: { dining: 3, hall: 4, center: 4 },
    hall: { living: 4, garage: 5, center: 4 },
    garage: { hall: 5, game: 3, center: 4 },
    game: { garage: 3, bedroom: 4, center: 3 },
    clue: { center: CLUE_ZONE.cost },
    center: Object.fromEntries(MOVE_DESTINATIONS.map((destination) => [destination.id, destination.cost]))
  };
  const TOKEN_COLORS = ["#de3b35", "#f0c84b", "#e8e4da", "#60b86e", "#5da9e9", "#9b6ee8"];
  const CARD_TYPE_LABEL = { suspect: "용의자", weapon: "도구", room: "장소" };
  const CARD_IMAGE_SLUGS = {
    "suspect:스칼렛": "suspect-scarlet",
    "suspect:머스터드": "suspect-mustard",
    "suspect:화이트": "suspect-white",
    "suspect:그린": "suspect-green",
    "suspect:피콕": "suspect-peacock",
    "suspect:플럼": "suspect-plum",
    "weapon:촛대": "weapon-candlestick",
    "weapon:단검": "weapon-dagger",
    "weapon:파이프": "weapon-pipe",
    "weapon:권총": "weapon-pistol",
    "weapon:밧줄": "weapon-rope",
    "weapon:렌치": "weapon-wrench",
    "room:침실": "room-bedroom",
    "room:욕실": "room-bathroom",
    "room:서재": "room-study",
    "room:부엌": "room-kitchen",
    "room:식당": "room-dining",
    "room:거실": "room-living",
    "room:마당": "room-hall",
    "room:차고": "room-garage",
    "room:게임룸": "room-game"
  };
  const CARD_BACK_SRC = "assets/clue-cards/back.webp";
  const HINT_CARD_SRC = "assets/clue-cards/hint-tool-card.webp";
  const AI_DELAY_MS = 1250;
  const DICE_ROLL_DURATION_MS = 650;
  const DICE_ROLL_FRAME_MS = 58;
  const SHARED_PROFILES = window.FANTASY_SHARED_PROFILES || {};
  const SHARED_NICKNAME_RULES = window.FANTASY_SHARED_NICKNAME_RULES || {};
  const PROFILE_ASSET_ROOT = SHARED_PROFILES.root || "assets/profiles/user";
  const HUMAN_PROFILE_STORAGE_KEY = SHARED_NICKNAME_RULES.storageKey || "fantasyKingdom.humanProfile.v1";

  const els = {
    enterButton: document.querySelector("#enterClueButton"),
    setupPanel: document.querySelector("#clueSetupPanel"),
    gamePanel: document.querySelector("#clueGamePanel"),
    startButton: document.querySelector("#startClueButton"),
    playerCountSelect: document.querySelector("#cluePlayerCountSelect"),
    exitButton: document.querySelector("#clueExitGameButton"),
    backButton: document.querySelector("#clueBackButton"),
    newGameButton: document.querySelector("#clueNewGameButton"),
    rulesButton: document.querySelector("#clueRulesButton"),
    rulesDialog: document.querySelector("#clueRulesDialog"),
    playersList: document.querySelector("#cluePlayersList"),
    turnLabel: document.querySelector("#clueTurnLabel"),
    phaseLabel: document.querySelector("#cluePhaseLabel"),
    board: document.querySelector("#clueBoard"),
    dice: document.querySelector("#clueDice"),
    rollButton: document.querySelector("#clueRollButton"),
    endTurnButton: document.querySelector("#clueEndTurnButton"),
    moveHint: document.querySelector("#clueMoveHint"),
    moveOptions: document.querySelector("#clueMoveOptions"),
    handList: document.querySelector("#clueHandList"),
    suggestSuspect: document.querySelector("#clueSuggestSuspect"),
    suggestWeapon: document.querySelector("#clueSuggestWeapon"),
    suggestionCardPanel: document.querySelector("#clueSuggestionCardPanel"),
    suggestionRoomCard: document.querySelector("#clueSuggestionRoomCard"),
    suggestSuspectPicker: document.querySelector("#clueSuggestSuspectPicker"),
    suggestWeaponPicker: document.querySelector("#clueSuggestWeaponPicker"),
    suggestionRoomLabel: document.querySelector("#clueSuggestionRoomLabel"),
    makeSuggestionButton: document.querySelector("#clueMakeSuggestionButton"),
    accuseSuspect: document.querySelector("#clueAccuseSuspect"),
    accuseRoom: document.querySelector("#clueAccuseRoom"),
    accuseWeapon: document.querySelector("#clueAccuseWeapon"),
    accusationCard: document.querySelector("#clueAccusationCard"),
    makeAccusationButton: document.querySelector("#clueMakeAccusationButton"),
    cancelAccusationButton: document.querySelector("#clueCancelAccusationButton"),
    notes: document.querySelector("#clueNotes"),
    log: document.querySelector("#clueLog")
  };

  const state = {
    started: false,
    finished: false,
    currentPlayer: 0,
    phase: "setup",
    players: [],
    solution: null,
    deck: [],
    hintDeck: [],
    dice: [],
    dicePreview: [],
    diceRolling: false,
    diceRollTimer: 0,
    reachableRooms: [],
    humanKnown: new Set(),
    noteMarks: {},
    pendingRefute: null,
    eventQueue: [],
    eventShowing: false,
    choiceTimer: 0,
    piecePositions: {},
    turnSerial: 0,
    lastTurnNoticeKey: "",
    log: [],
    aiTimer: 0
  };

  let clueEventLayer = null;
  let clueChoiceLayer = null;

  function profileImageUrl(fileName) {
    return encodeURI(`${PROFILE_ASSET_ROOT}/${fileName}`);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function hasFinalConsonant(value) {
    const text = String(value || "").trim();
    const code = text.charCodeAt(text.length - 1);
    return code >= 0xac00 && code <= 0xd7a3 && (code - 0xac00) % 28 !== 0;
  }

  function withSubject(value) {
    return `${value}${hasFinalConsonant(value) ? "이" : "가"}`;
  }

  function withTopic(value) {
    return `${value}${hasFinalConsonant(value) ? "은" : "는"}`;
  }

  function cardImageUrl(entry) {
    if (entry?.type === "hint") return HINT_CARD_SRC;
    return entry?.back ? CARD_BACK_SRC : `assets/clue-cards/${CARD_IMAGE_SLUGS[entry?.id] || "back"}.webp`;
  }

  function cardLabel(entry) {
    if (entry?.back) return "카드";
    return entry?.name || "";
  }

  function cardFigureHtml(entry, className = "clue-event-card-image") {
    if (entry?.type === "hint") {
      return `
        <span class="${className} clue-hint-card-image">
          <img src="${escapeHtml(HINT_CARD_SRC)}" alt="${escapeHtml(cardLabel(entry))}" loading="lazy" decoding="async" />
          <span class="clue-hint-card-copy">
            <b>${entry.title.map((line) => `<span>${escapeHtml(line)}</span>`).join("")}</b>
            <small>${entry.body.map((line) => `<span>${escapeHtml(line)}</span>`).join("")}</small>
          </span>
        </span>
      `;
    }
    return `
      <span class="${className}">
        <img src="${escapeHtml(cardImageUrl(entry))}" alt="${escapeHtml(cardLabel(entry))}" loading="lazy" decoding="async" />
        ${entry?.back ? "" : `<span>${escapeHtml(cardLabel(entry))}</span>`}
      </span>
    `;
  }

  function ensureClueEventLayer() {
    if (!clueEventLayer) {
      clueEventLayer = document.createElement("div");
      clueEventLayer.className = "clue-event-overlay";
      clueEventLayer.setAttribute("aria-live", "polite");
      document.body.append(clueEventLayer);
    }
    return clueEventLayer;
  }

  function ensureClueChoiceLayer() {
    if (!clueChoiceLayer) {
      clueChoiceLayer = document.createElement("div");
      clueChoiceLayer.className = "clue-choice-overlay";
      clueChoiceLayer.setAttribute("aria-live", "assertive");
      document.body.append(clueChoiceLayer);
    }
    return clueChoiceLayer;
  }

  function isChoiceOpen() {
    return Boolean(clueChoiceLayer?.classList.contains("open"));
  }

  function queueClueEvent(event) {
    state.eventQueue.push({ cards: [], ...event });
    playNextClueEvent();
  }

  function dismissClueEvent() {
    if (!state.eventShowing) return;
    const layer = ensureClueEventLayer();
    layer.classList.remove("open");
    layer.innerHTML = "";
    state.eventShowing = false;
    playNextClueEvent();
  }

  function playNextClueEvent() {
    if (state.eventShowing || isChoiceOpen()) return;
    const event = state.eventQueue.shift();
    if (!event) {
      if (state.pendingRefute) showHumanRefutePrompt();
      else showClueTurnNotice();
      return;
    }
    const layer = ensureClueEventLayer();
    state.eventShowing = true;
    layer.innerHTML = `
      <section class="clue-event-card">
        <strong>${escapeHtml(event.title || "클루")}</strong>
        <p>${escapeHtml(event.message || "")}</p>
        ${event.detail ? `<small>${escapeHtml(event.detail)}</small>` : ""}
        ${event.cards?.length ? `<div class="clue-event-card-row">${event.cards.map((entry) => cardFigureHtml(entry)).join("")}</div>` : ""}
        <span class="clue-popup-hint">팝업을 클릭하면 팝업 닫기</span>
      </section>
    `;
    layer.classList.add("open");
    layer.querySelector(".clue-event-card")?.addEventListener("click", dismissClueEvent);
  }

  function clearClueEventLayers() {
    if (state.choiceTimer) window.clearTimeout(state.choiceTimer);
    state.choiceTimer = 0;
    state.eventQueue = [];
    state.eventShowing = false;
    state.pendingRefute = null;
    clueEventLayer?.classList.remove("open");
    clueChoiceLayer?.classList.remove("open");
    if (clueEventLayer) clueEventLayer.innerHTML = "";
    if (clueChoiceLayer) clueChoiceLayer.innerHTML = "";
  }

  function preloadClueCardImages() {
    [CARD_BACK_SRC, HINT_CARD_SRC, ...Object.values(CARD_IMAGE_SLUGS).map((slug) => `assets/clue-cards/${slug}.webp`)].forEach((src) => {
      const image = new Image();
      image.src = src;
    });
  }

  function shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function currentHumanNickname() {
    try {
      const profile = JSON.parse(window.localStorage?.getItem(HUMAN_PROFILE_STORAGE_KEY) || "null");
      return String(profile?.nickname || "").trim();
    } catch {
      return "";
    }
  }

  function aiProfiles() {
    const groups = SHARED_PROFILES.groups || {};
    return ["normal", "hard", "expert"].flatMap((key) => groups[key] || []);
  }

  function buildPlayers(count) {
    const names = ["스칼렛", "머스터드", "화이트", "그린", "피콕", "플럼"];
    const pool = shuffle(aiProfiles());
    const colors = shuffle(TOKEN_COLORS);
    return Array.from({ length: count }, (_, index) => {
      if (index === 0) {
        return {
          id: "human",
          human: true,
          name: currentHumanNickname() || "탐정",
          suspect: names[index],
          color: colors[index % colors.length],
          location: "center",
          hand: [],
          known: new Set(),
          eliminated: false
        };
      }
      const profile = pool[index - 1] || { name: `AI ${index}`, avatarUrl: profileImageUrl("보통-건일.jpg") };
      return {
        id: `ai${index}`,
        human: false,
        name: profile.name || `AI ${index}`,
        avatarUrl: profile.avatarUrl,
        suspect: names[index],
        color: colors[index % colors.length],
        location: "center",
        hand: [],
        known: new Set(),
        eliminated: false
      };
    });
  }

  function card(type, name) {
    return { id: `${type}:${name}`, type, name };
  }

  const NOTE_IMAGE_WIDTH = 420;
  const NOTE_IMAGE_HEIGHT = 620;
  const NOTE_COLUMN_EDGES = [88, 129, 168, 208, 248, 288, 327, 367, 407];
  const NOTE_HEADER_ROW = { y1: 13, y2: 45 };
  const NOTE_ROW_EDGES = {
    suspect: [68, 91, 114, 138, 161, 184, 208],
    weapon: [231, 254, 277, 301, 324, 347, 371],
    room: [394, 417, 440, 464, 487, 510, 534, 557, 580, 604]
  };
  const DEDUCTION_ROWS = [
    ...["그린", "머스터드", "피콕", "플럼", "스칼렛", "화이트"].map((name, index) => ({
      card: card("suspect", name),
      y1: NOTE_ROW_EDGES.suspect[index],
      y2: NOTE_ROW_EDGES.suspect[index + 1]
    })),
    ...["렌치", "촛대", "단검", "권총", "파이프", "밧줄"].map((name, index) => ({
      card: card("weapon", name),
      y1: NOTE_ROW_EDGES.weapon[index],
      y2: NOTE_ROW_EDGES.weapon[index + 1]
    })),
    ...["욕실", "서재", "게임룸", "차고", "침실", "거실", "부엌", "마당", "식당"].map((name, index) => ({
      card: card("room", name),
      y1: NOTE_ROW_EDGES.room[index],
      y2: NOTE_ROW_EDGES.room[index + 1]
    }))
  ];
  const NOTE_STATES = ["", "suspect", "confirmed", "excluded"];
  const NOTE_SYMBOLS = { suspect: "?", confirmed: "O", excluded: "×" };
  const NOTE_LABELS = { suspect: "의심", confirmed: "확정", excluded: "제외" };
  const NOTE_COLUMN_COUNT = NOTE_COLUMN_EDGES.length - 1;
  const CARD_TYPE_ORDER = { suspect: 0, weapon: 1, room: 2 };
  const HINT_CARD_DEFINITIONS = [
    {
      id: "extra-turn",
      name: "차례를 한 번 더 진행합니다.",
      title: ["차례를", "한 번 더", "진행합니다."],
      body: ["지금 사용하거나", "필요할 때 사용합니다."],
      copies: 2
    },
    {
      id: "extra-suggestion",
      name: "한 번 더 추리합니다.",
      title: ["한 번 더", "추리합니다."],
      body: ["자기 말이나 다른 사람의 말", "또는 토큰을 이동하지 않고", "원하는 장소, 사람, 도구를 정해", "추리할 수 있습니다.", "지금 사용합니다."],
      copies: 2
    },
    {
      id: "add-six",
      name: "나온 주사위에 6을 더할 수 있습니다.",
      title: ["나온 주사위에", "6을 더할 수", "있습니다."],
      body: ["지금 사용하거나", "필요할 때 사용합니다."],
      copies: 2
    },
    {
      id: "reveal-card",
      name: "다른 사람의 카드 한 장을 공개합니다.",
      title: ["다른 사람의 카드", "한 장을 공개합니다."],
      body: ["한 사람을 정해 이 카드를 보여주면,", "그 사람은 자기 카드 중 한 장을", "모두에게 보여주어야 합니다.", "지금 사용합니다."],
      copies: 2
    },
    {
      id: "move-anywhere",
      name: "원하는 장소로 이동합니다.",
      title: ["원하는 장소로", "이동합니다."],
      body: ["지금 사용합니다."],
      copies: 2
    },
    {
      id: "peek-card",
      name: "카드 엿보기",
      title: ["카드 엿보기"],
      body: ["누군가 다른 사람에게 추리 카드를", "보여줄 때 그 카드를 볼 수 있습니다.", "필요할 때 사용합니다."],
      copies: 2
    },
    {
      id: "dud",
      name: "꽝",
      title: ["꽝"],
      body: ["아무 효과가 없습니다."],
      copies: 3
    }
  ];

  function createGameDeck() {
    const solution = {
      suspect: card("suspect", randomItem(SUSPECTS)),
      weapon: card("weapon", randomItem(WEAPONS)),
      room: card("room", randomItem(ROOMS).name)
    };
    const deck = [
      ...SUSPECTS.map((name) => card("suspect", name)),
      ...WEAPONS.map((name) => card("weapon", name)),
      ...ROOMS.map((room) => card("room", room.name))
    ].filter((entry) => !Object.values(solution).some((hidden) => hidden.id === entry.id));
    return { solution, deck: shuffle(deck) };
  }

  function dealCards(deck) {
    state.players.forEach((player) => {
      player.hand = [];
      player.known = new Set();
    });
    deck.forEach((entry, index) => {
      const player = state.players[index % state.players.length];
      player.hand.push(entry);
      player.known.add(entry.id);
      if (player.human) state.humanKnown.add(entry.id);
    });
  }

  function createHintDeck() {
    return shuffle(HINT_CARD_DEFINITIONS.flatMap((definition) => {
      return Array.from({ length: definition.copies }, (_, copyIndex) => ({
        ...definition,
        id: `hint:${definition.id}:${copyIndex + 1}`,
        type: "hint"
      }));
    }));
  }

  function drawHintCard(player) {
    if (!state.hintDeck.length) {
      log("남은 ? 카드가 없습니다.");
      queueClueEvent({
        title: "? 카드",
        message: "남은 ? 카드가 없습니다."
      });
      return null;
    }
    const drawn = state.hintDeck.shift();
    log(`${withSubject(player.name)} ? 카드 '${drawn.name}'을 뽑았습니다.`);
    queueClueEvent({
      title: "? 카드",
      message: `${withSubject(player.name)} ? 카드를 뽑았습니다.`,
      cards: [drawn]
    });
    return drawn;
  }

  function log(message) {
    state.log.unshift(message);
    state.log = state.log.slice(0, 32);
  }

  function roomName(location) {
    if (location === CLUE_ZONE.id) return CLUE_ZONE.name;
    return location === "center" ? CENTER.name : ROOM_BY_ID[location]?.name || location;
  }

  function locationPoint(location) {
    if (location === "center") return CENTER;
    if (location === CLUE_ZONE.id) return CLUE_ZONE;
    return ROOM_BY_ID[location] || CENTER;
  }

  function rollDice() {
    return [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
  }

  function clearDiceRollTimer() {
    if (state.diceRollTimer) {
      window.clearTimeout(state.diceRollTimer);
      state.diceRollTimer = 0;
    }
    state.diceRolling = false;
    state.dicePreview = [];
  }

  function currentDiceDisplay() {
    return state.diceRolling && state.dicePreview.length ? state.dicePreview : state.dice;
  }

  function renderDiceDisplay() {
    if (!els.dice) return;
    const values = currentDiceDisplay();
    els.dice.classList.toggle("rolling", state.diceRolling);
    els.dice.setAttribute("aria-label", state.diceRolling ? "주사위를 굴리는 중" : "주사위 결과");
    els.dice.innerHTML = values.length
      ? `
        <span class="clue-die">${values[0]}</span>
        <span class="clue-dice-plus">+</span>
        <span class="clue-die">${values[1]}</span>
      `
      : '<span class="clue-dice-empty">-</span>';
  }

  function animateDiceRoll(finalDice) {
    clearDiceRollTimer();
    state.dice = [];
    state.dicePreview = rollDice();
    state.diceRolling = true;
    renderControls();
    const startedAt = window.performance.now();
    return new Promise((resolve) => {
      const tick = () => {
        const elapsed = window.performance.now() - startedAt;
        if (elapsed >= DICE_ROLL_DURATION_MS) {
          state.dice = finalDice;
          state.dicePreview = [];
          state.diceRolling = false;
          state.diceRollTimer = 0;
          renderControls();
          resolve();
          return;
        }
        state.dicePreview = rollDice();
        renderControls();
        state.diceRollTimer = window.setTimeout(tick, DICE_ROLL_FRAME_MS);
      };
      state.diceRollTimer = window.setTimeout(tick, DICE_ROLL_FRAME_MS);
    });
  }

  function activePlayer() {
    return state.players[state.currentPlayer];
  }

  function nextPlayerIndex(from = state.currentPlayer) {
    for (let offset = 1; offset <= state.players.length; offset += 1) {
      const index = (from + offset) % state.players.length;
      if (!state.players[index].eliminated) return index;
    }
    return 0;
  }

  function matchingCards(player, suggestion) {
    const ids = new Set([suggestion.suspect.id, suggestion.weapon.id, suggestion.room.id]);
    return player.hand.filter((entry) => ids.has(entry.id));
  }

  function announceSuggestion(player, suggestion) {
    queueClueEvent({
      title: `${player.name}의 추리`,
      message: `${withSubject(suggestion.suspect.name)} ${suggestion.weapon.name}로 ${suggestion.room.name}에서 죽였다고 추리합니다.`,
      cards: [suggestion.suspect, suggestion.weapon, suggestion.room]
    });
  }

  function announceNoCard(target) {
    queueClueEvent({
      title: "반박 없음",
      message: `${withTopic(target.name)} 보여줄 카드가 없다고 합니다.`
    });
  }

  function announceShownCard(target, player, shown, revealName = false) {
    const message = target.human
      ? `당신이 ${player.name}에게 카드 1장을 보여줬습니다.`
      : player.human
        ? `${withSubject(target.name)} 당신에게 카드 1장을 보여줬습니다.`
        : `${withSubject(target.name)} ${player.name}에게 카드 1장을 보여줬습니다.`;
    queueClueEvent({
      title: "카드 제시",
      message,
      detail: revealName ? `확인한 카드: ${shown.name}` : "",
      cards: revealName ? [shown] : [{ back: true }]
    });
  }

  function showHumanRefutePrompt() {
    if (!state.pendingRefute) return;
    if (state.eventShowing || state.eventQueue.length) {
      if (!state.choiceTimer) {
        state.choiceTimer = window.setTimeout(() => {
          state.choiceTimer = 0;
          showHumanRefutePrompt();
        }, 160);
      }
      return;
    }
    const pending = state.pendingRefute;
    const suggester = state.players[pending.suggesterIndex];
    const layer = ensureClueChoiceLayer();
    layer.innerHTML = `
      <section class="clue-choice-card">
        <strong>보여줄 카드를 선택하세요</strong>
        <p>${escapeHtml(suggester.name)}의 추리를 반박할 수 있습니다.</p>
        <small>${escapeHtml(pending.suggestion.suspect.name)} / ${escapeHtml(pending.suggestion.room.name)} / ${escapeHtml(pending.suggestion.weapon.name)}</small>
        <div class="clue-choice-card-row">
          ${pending.matches.map((entry) => `
            <button class="clue-choice-card-button" type="button" data-card-id="${escapeHtml(entry.id)}">
              <img src="${escapeHtml(cardImageUrl(entry))}" alt="${escapeHtml(entry.name)}" />
              <span>${escapeHtml(entry.name)}</span>
            </button>
          `).join("")}
        </div>
      </section>
    `;
    layer.classList.add("open");
    layer.querySelectorAll(".clue-choice-card-button").forEach((button) => {
      button.addEventListener("click", () => chooseHumanRefute(button.dataset.cardId));
    });
  }

  function chooseHumanRefute(cardId) {
    const pending = state.pendingRefute;
    if (!pending) return;
    const shown = pending.matches.find((entry) => entry.id === cardId) || pending.matches[0];
    const player = state.players[pending.suggesterIndex];
    player.known.add(shown.id);
    log(`당신이 ${player.name}에게 ${shown.name} 카드를 보여줬습니다.`);
    state.pendingRefute = null;
    clueChoiceLayer?.classList.remove("open");
    if (clueChoiceLayer) clueChoiceLayer.innerHTML = "";
    announceShownCard(state.players[pending.targetIndex], player, shown, true);
    finishAiTurnAfterSuggestion();
  }

  function resolveSuggestion(playerIndex, suggestion) {
    const player = state.players[playerIndex];
    const suspectPlayer = state.players.find((entry) => entry.suspect === suggestion.suspect.name);
    if (suspectPlayer) suspectPlayer.location = ROOM_BY_NAME[suggestion.room.name]?.id || suspectPlayer.location;

    for (let offset = 1; offset < state.players.length; offset += 1) {
      const target = state.players[(playerIndex + offset) % state.players.length];
      if (target.eliminated) continue;
      const matches = matchingCards(target, suggestion);
      if (!matches.length) {
        announceNoCard(target);
        continue;
      }
      if (target.human) {
        state.pendingRefute = { suggesterIndex: playerIndex, targetIndex: (playerIndex + offset) % state.players.length, suggestion, matches };
        state.phase = "chooseRefute";
        log(`${player.name}의 추리에 보여줄 카드를 선택해야 합니다.`);
        renderClue();
        showHumanRefutePrompt();
        return { pendingHumanRefute: true };
      }
      const shown = randomItem(matches);
      player.known.add(shown.id);
      if (player.human) {
        state.humanKnown.add(shown.id);
        log(`${withSubject(target.name)} ${shown.name} 카드를 보여줬습니다.`);
      } else if (target.human) {
        log(`당신이 ${player.name}에게 ${shown.name} 카드를 보여줬습니다.`);
      } else {
        log(`${withSubject(target.name)} ${player.name}에게 카드 1장을 보여줬습니다.`);
      }
      announceShownCard(target, player, shown, player.human);
      return { shown };
    }

    log(`${player.name}의 제안은 아무도 반박하지 못했습니다.`);
    queueClueEvent({
      title: "반박 실패",
      message: `${player.name}의 추리를 아무도 반박하지 못했습니다.`
    });
    return { shown: null };
  }

  function candidateCards(player, type) {
    const source = type === "suspect" ? SUSPECTS : type === "weapon" ? WEAPONS : ROOMS.map((room) => room.name);
    return source
      .map((name) => card(type, name))
      .filter((entry) => !player.known.has(entry.id));
  }

  function chooseAiDestination(player, reachable) {
    const hint = reachable.find((destination) => destination.hint);
    if (hint && state.hintDeck.length && Math.random() < 0.3) return hint;
    const roomChoices = reachable.filter((destination) => !destination.clue && !destination.hint);
    if (!roomChoices.length) return hint || randomItem(ROOMS);
    const unknownRooms = candidateCards(player, "room").map((entry) => ROOM_BY_NAME[entry.name]?.id).filter(Boolean);
    const preferred = roomChoices.filter((room) => unknownRooms.includes(room.id));
    return randomItem(preferred.length ? preferred : roomChoices);
  }

  function aiSuggestion(player, room) {
    return {
      suspect: randomItem(candidateCards(player, "suspect")) || card("suspect", randomItem(SUSPECTS)),
      weapon: randomItem(candidateCards(player, "weapon")) || card("weapon", randomItem(WEAPONS)),
      room: card("room", room.name)
    };
  }

  function buildCertainAccusation(player) {
    const suspects = candidateCards(player, "suspect");
    const weapons = candidateCards(player, "weapon");
    const rooms = candidateCards(player, "room");
    if (suspects.length !== 1 || weapons.length !== 1 || rooms.length !== 1) return null;
    return { suspect: suspects[0], weapon: weapons[0], room: rooms[0] };
  }

  function uniqueDestinations(destinations) {
    const seen = new Set();
    return destinations.filter((destination) => {
      if (!destination || seen.has(destination.id)) return false;
      seen.add(destination.id);
      return true;
    });
  }

  function compactPercent(value, total) {
    return ((value / total) * 100).toFixed(4).replace(/\.?0+$/, "");
  }

  function noteCellStyle(row, column) {
    const x1 = NOTE_COLUMN_EDGES[column];
    const x2 = NOTE_COLUMN_EDGES[column + 1];
    return [
      `--note-left:${compactPercent(x1, NOTE_IMAGE_WIDTH)}%`,
      `--note-top:${compactPercent(row.y1, NOTE_IMAGE_HEIGHT)}%`,
      `--note-width:${compactPercent(x2 - x1, NOTE_IMAGE_WIDTH)}%`,
      `--note-height:${compactPercent(row.y2 - row.y1, NOTE_IMAGE_HEIGHT)}%`
    ].join("; ");
  }

  function sortedCaseCards(cards) {
    return [...cards].sort((left, right) => {
      const typeDiff = (CARD_TYPE_ORDER[left.type] ?? 9) - (CARD_TYPE_ORDER[right.type] ?? 9);
      if (typeDiff) return typeDiff;
      return left.name.localeCompare(right.name, "ko");
    });
  }

  function beginClueTurn(playerIndex = state.currentPlayer) {
    state.currentPlayer = playerIndex;
    state.phase = "awaitRoll";
    clearDiceRollTimer();
    state.dice = [];
    state.dicePreview = [];
    state.reachableRooms = [];
    state.turnSerial += 1;
  }

  function showClueTurnNotice(force = false) {
    if (!state.started || state.finished || !activePlayer()) return;
    if (state.eventShowing || state.eventQueue.length || isChoiceOpen()) return;
    if (typeof window.showCenterToast !== "function") return;
    const key = `clue-turn:${state.turnSerial}:${state.currentPlayer}`;
    if (!force && state.lastTurnNoticeKey === key) return;
    state.lastTurnNoticeKey = key;
    const player = activePlayer();
    window.showCenterToast(player.human ? "당신의 턴입니다" : `${player.name}의 턴.`, 1200, {
      mode: "clue-turn",
      key
    });
  }

  function isCorrectAccusation(accusation) {
    return accusation.suspect.id === state.solution.suspect.id
      && accusation.weapon.id === state.solution.weapon.id
      && accusation.room.id === state.solution.room.id;
  }

  function finishGame(player, success, accusation) {
    state.finished = true;
    state.phase = "finished";
    clearAiTimer();
    if (success) {
      log(`${player.name} 승리! 정답은 ${state.solution.suspect.name}, ${state.solution.room.name}, ${state.solution.weapon.name}입니다.`);
      queueClueEvent({
        title: `${player.name} 승리`,
        message: `정답은 ${state.solution.suspect.name}, ${state.solution.weapon.name}, ${state.solution.room.name}입니다.`,
        cards: [state.solution.suspect, state.solution.weapon, state.solution.room]
      });
      if (typeof window.showCenterToast === "function") {
        window.showCenterToast(`${player.name} 승리`, 1800, { mode: "clue-finish" });
      }
    } else {
      player.eliminated = true;
      log(`${player.name}의 고발 실패: ${accusation.suspect.name}, ${accusation.room.name}, ${accusation.weapon.name}`);
      queueClueEvent({
        title: "고발 실패",
        message: `${player.name}의 최종 고발은 틀렸습니다.`,
        cards: [accusation.suspect, accusation.weapon, accusation.room]
      });
      if (player.human) {
        log(`정답은 ${state.solution.suspect.name}, ${state.solution.room.name}, ${state.solution.weapon.name}입니다.`);
        if (typeof window.showCenterToast === "function") {
          window.showCenterToast("고발 실패", 1800, { mode: "clue-finish" });
        }
      } else {
        const activePlayers = state.players.filter((entry) => !entry.eliminated);
        if (activePlayers.length <= 1) {
          finishGame(activePlayers[0], true, state.solution);
          return;
        }
        state.finished = false;
        beginClueTurn(nextPlayerIndex());
      }
    }
    renderClue();
    if (!state.finished) {
      playNextClueEvent();
      if (!activePlayer()?.human) scheduleAiTurn();
    }
  }

  function reachableRoomsForRoll(player, total) {
    if (total <= 4) return [HINT_ACTION];
    if (total >= 10) return [HINT_ACTION, ...ROOMS, CLUE_ZONE];
    const linkedRooms = (player.location === "center" || player.location === CLUE_ZONE.id ? [] : Object.keys(ROOM_LINKS[player.location] || {}))
      .filter((id) => id !== "center")
      .map((id) => ROOM_BY_ID[id])
      .filter(Boolean);
    const centerRooms = player.location === "center" || player.location === CLUE_ZONE.id
      ? CENTRAL_NEAR_ROOM_IDS.map((id) => ROOM_BY_ID[id]).filter(Boolean)
      : [];
    return uniqueDestinations([
      ...linkedRooms,
      ...centerRooms
    ]);
  }

  function startClueGame() {
    clearAiTimer();
    clearDiceRollTimer();
    clearClueEventLayers();
    preloadClueCardImages();
    const playerCount = Math.min(6, Math.max(3, Number(els.playerCountSelect?.value || 4)));
    state.players = buildPlayers(playerCount);
    state.humanKnown = new Set();
    state.noteMarks = {};
    const { solution, deck } = createGameDeck();
    state.solution = solution;
    state.deck = deck;
    state.hintDeck = createHintDeck();
    dealCards(deck);
    state.started = true;
    state.finished = false;
    state.turnSerial = 0;
    state.lastTurnNoticeKey = "";
    beginClueTurn(0);
    state.piecePositions = {};
    state.log = [];
    log("사건 봉투가 준비되었습니다. 주사위를 굴리세요.");
    closeAccusationDialog();
    document.body.classList.add("clue-playing");
    els.setupPanel?.classList.add("hidden");
    els.gamePanel?.classList.remove("hidden");
    renderClue();
    showClueTurnNotice(true);
  }

  function leaveClueGame() {
    clearAiTimer();
    clearDiceRollTimer();
    clearClueEventLayers();
    closeAccusationDialog();
    document.body.classList.remove("clue-playing", "clue-active");
    document.body.classList.add("launcher-active");
    els.setupPanel?.classList.add("hidden");
    els.gamePanel?.classList.add("hidden");
  }

  function resetToClueSetup() {
    clearAiTimer();
    clearDiceRollTimer();
    clearClueEventLayers();
    closeAccusationDialog();
    document.body.classList.remove("clue-playing");
    document.body.classList.add("clue-active");
    els.gamePanel?.classList.add("hidden");
    els.setupPanel?.classList.remove("hidden");
  }

  function openAccusationDialog() {
    els.accusationCard?.classList.add("open");
  }

  function closeAccusationDialog() {
    els.accusationCard?.classList.remove("open");
  }

  async function rollForHuman() {
    if (state.finished || state.phase !== "awaitRoll" || state.diceRolling || !activePlayer()?.human) return;
    const finalDice = rollDice();
    await animateDiceRoll(finalDice);
    if (state.finished || state.phase !== "awaitRoll" || !activePlayer()?.human) return;
    const total = state.dice[0] + state.dice[1];
    state.reachableRooms = reachableRoomsForRoll(activePlayer(), total);
    state.phase = "chooseMove";
    log(`${activePlayer().name}: ${state.dice.join(" + ")} = ${total}`);
    renderClue();
  }

  function moveHumanTo(roomId) {
    if (state.phase !== "chooseMove" || !activePlayer()?.human) return;
    const destination = state.reachableRooms.find((entry) => entry.id === roomId);
    if (!destination) return;
    if (destination.hint) {
      drawHintCard(activePlayer());
      state.phase = "waitEnd";
      renderClue();
      return;
    }
    activePlayer().location = destination.id;
    if (destination.clue) {
      state.phase = "accuse";
      log(`${withSubject(activePlayer().name)} ${destination.name}에 들어갔습니다.`);
      renderClue();
      openAccusationDialog();
      return;
    }
    state.phase = "suggest";
    log(`${withSubject(activePlayer().name)} ${destination.name}에 들어갔습니다.`);
    renderClue();
  }

  function makeHumanSuggestion() {
    if (state.finished || state.phase !== "suggest" || !activePlayer()?.human) return;
    const room = ROOM_BY_ID[activePlayer().location];
    if (!room) return;
    const suggestion = {
      suspect: card("suspect", els.suggestSuspect?.value || SUSPECTS[0]),
      weapon: card("weapon", els.suggestWeapon?.value || WEAPONS[0]),
      room: card("room", room.name)
    };
    log(`${activePlayer().name} 제안: ${suggestion.suspect.name}, ${suggestion.room.name}, ${suggestion.weapon.name}`);
    announceSuggestion(activePlayer(), suggestion);
    resolveSuggestion(state.currentPlayer, suggestion);
    state.phase = "waitEnd";
    renderClue();
  }

  function makeHumanAccusation() {
    if (state.finished || state.phase !== "accuse" || !activePlayer()?.human) return;
    const accusation = {
      suspect: card("suspect", els.accuseSuspect?.value || SUSPECTS[0]),
      room: card("room", els.accuseRoom?.value || ROOMS[0].name),
      weapon: card("weapon", els.accuseWeapon?.value || WEAPONS[0])
    };
    closeAccusationDialog();
    queueClueEvent({
      title: `${activePlayer().name}의 최종 고발`,
      message: `${withSubject(accusation.suspect.name)} ${accusation.weapon.name}로 ${accusation.room.name}에서 죽였다고 고발합니다.`,
      cards: [accusation.suspect, accusation.weapon, accusation.room]
    });
    finishGame(activePlayer(), isCorrectAccusation(accusation), accusation);
  }

  function endHumanTurn() {
    if (state.finished || !activePlayer()?.human || state.phase === "chooseMove" || state.phase === "awaitRoll") return;
    closeAccusationDialog();
    beginClueTurn(nextPlayerIndex());
    renderClue();
    showClueTurnNotice();
    scheduleAiTurn();
  }

  function finishAiTurnAfterSuggestion() {
    if (state.finished) return;
    beginClueTurn(nextPlayerIndex());
    renderClue();
    playNextClueEvent();
    if (!activePlayer().human) scheduleAiTurn();
  }

  function clearAiTimer() {
    if (state.aiTimer) {
      window.clearTimeout(state.aiTimer);
      state.aiTimer = 0;
    }
  }

  function scheduleAiTurn() {
    clearAiTimer();
    if (state.finished || activePlayer()?.human) return;
    if (state.eventShowing || state.eventQueue.length || isChoiceOpen()) {
      state.aiTimer = window.setTimeout(scheduleAiTurn, 260);
      return;
    }
    state.aiTimer = window.setTimeout(runAiTurn, AI_DELAY_MS);
  }

  async function runAiTurn() {
    clearAiTimer();
    if (state.finished || activePlayer()?.human) return;
    const player = activePlayer();
    const finalDice = rollDice();
    await animateDiceRoll(finalDice);
    if (state.finished || activePlayer() !== player) return;
    const total = state.dice[0] + state.dice[1];
    const reachable = reachableRoomsForRoll(player, total);
    const accusation = buildCertainAccusation(player);
    if (accusation && reachable.some((destination) => destination.id === CLUE_ZONE.id)) {
      player.location = CLUE_ZONE.id;
      log(`${player.name}: ${state.dice.join(" + ")} = ${total}, ${CLUE_ZONE.name} 이동`);
      log(`${withSubject(player.name)} 최종 추리를 선언했습니다.`);
      queueClueEvent({
        title: `${player.name}의 최종 고발`,
        message: `${withSubject(accusation.suspect.name)} ${accusation.weapon.name}로 ${accusation.room.name}에서 죽였다고 고발합니다.`,
        cards: [accusation.suspect, accusation.weapon, accusation.room]
      });
      finishGame(player, isCorrectAccusation(accusation), accusation);
      return;
    }
    const room = chooseAiDestination(player, reachable);
    if (room.hint) {
      log(`${player.name}: ${state.dice.join(" + ")} = ${total}, ? 카드 획득`);
      drawHintCard(player);
      finishAiTurnAfterSuggestion();
      return;
    }
    player.location = room.id;
    log(`${player.name}: ${state.dice.join(" + ")} = ${total}, ${room.name} 이동`);
    const suggestion = aiSuggestion(player, room);
    log(`${player.name} 제안: ${suggestion.suspect.name}, ${suggestion.room.name}, ${suggestion.weapon.name}`);
    announceSuggestion(player, suggestion);
    const result = resolveSuggestion(state.currentPlayer, suggestion);
    if (state.finished) return;
    if (result?.pendingHumanRefute) return;
    finishAiTurnAfterSuggestion();
  }

  function fillSelect(select, values) {
    if (!select) return;
    select.innerHTML = values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("");
  }

  function renderPlayers() {
    if (!els.playersList) return;
    els.playersList.innerHTML = "";
    const fragment = document.createDocumentFragment();
    state.players.forEach((player, index) => {
      const item = document.createElement("section");
      item.className = `clue-player-card${index === state.currentPlayer && !state.finished ? " active" : ""}`;
      item.innerHTML = `
        <span class="clue-player-token" style="background:${player.color}">${index + 1}</span>
        <span class="clue-player-info">
          <strong>${escapeHtml(player.name)}</strong>
          <small>${escapeHtml(player.suspect)} · ${escapeHtml(roomName(player.location))}</small>
        </span>
        <b>${player.hand.length}장</b>
      `;
      fragment.append(item);
    });
    els.playersList.append(fragment);
  }

  function renderBoard() {
    if (!els.board) return;
    els.board.innerHTML = "";
    MOVE_DESTINATIONS.forEach((destination) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = [
        "clue-room-button",
        destination.clue ? "clue-zone" : "",
        state.reachableRooms.some((entry) => entry.id === destination.id) && state.phase === "chooseMove" ? "reachable" : "",
        activePlayer()?.location === destination.id ? "current" : ""
      ].filter(Boolean).join(" ");
      button.style.setProperty("--room-x", `${destination.x}%`);
      button.style.setProperty("--room-y", `${destination.y}%`);
      button.textContent = destination.name;
      button.disabled = true;
      els.board.append(button);
    });

    const offsets = [[0, 0], [1.4, 0], [-1.4, 0], [0, 1.4], [1.4, 1.4], [-1.4, 1.4]];
    state.players.forEach((player, index) => {
      const point = locationPoint(player.location);
      const [offsetX, offsetY] = offsets[index] || [0, 0];
      const previous = state.piecePositions[player.id] || point;
      const piece = document.createElement("span");
      piece.className = "clue-board-piece";
      piece.style.background = player.color;
      piece.style.setProperty("--piece-x", `${previous.x}%`);
      piece.style.setProperty("--piece-y", `${previous.y}%`);
      piece.style.setProperty("--piece-offset-x", `${offsetX}%`);
      piece.style.setProperty("--piece-offset-y", `${offsetY}%`);
      piece.textContent = index + 1;
      piece.title = `${player.name} · ${player.suspect}`;
      els.board.append(piece);
      window.requestAnimationFrame(() => {
        piece.style.setProperty("--piece-x", `${point.x}%`);
        piece.style.setProperty("--piece-y", `${point.y}%`);
      });
      state.piecePositions[player.id] = { x: point.x, y: point.y };
    });
  }

  function renderMoveOptions() {
    if (!els.moveOptions) return;
    const player = activePlayer();
    const humanCanChoose = Boolean(player?.human && state.phase === "chooseMove" && !state.finished);
    if (els.moveHint) {
      const total = state.dice.length ? state.dice[0] + state.dice[1] : 0;
      const rangeHint = total <= 4
        ? "이동할 수 없습니다. ? 카드만 선택하세요."
        : total >= 10
          ? "아무 장소, CLUE 존, ? 카드를 선택할 수 있습니다."
          : "현재 위치와 붙어있는 장소 중 하나를 선택하세요.";
      els.moveHint.textContent = humanCanChoose
        ? `주사위 합계 ${total}. ${rangeHint}`
        : "주사위를 굴리면 이동 가능한 장소가 표시됩니다.";
    }
    if (!humanCanChoose) {
      els.moveOptions.innerHTML = '<div class="clue-move-empty">아직 선택 가능한 이동지가 없습니다.</div>';
      return;
    }
    els.moveOptions.innerHTML = state.reachableRooms.map((destination) => `
      <button class="clue-move-option${destination.clue ? " clue-zone" : ""}${destination.hint ? " hint-option" : ""}" type="button" data-destination-id="${escapeHtml(destination.id)}">
        <span>${escapeHtml(destination.name)}</span>
        <small>${destination.clue ? "최종추리" : destination.hint ? "단서 획득" : "방 이동"}</small>
      </button>
    `).join("");
    els.moveOptions.querySelectorAll(".clue-move-option").forEach((button) => {
      button.addEventListener("click", () => moveHumanTo(button.dataset.destinationId));
    });
  }

  function renderHand() {
    if (!els.handList) return;
    const human = state.players[0];
    els.handList.innerHTML = human?.hand?.length
      ? sortedCaseCards(human.hand).map((entry) => `
          <span class="clue-card-chip">
            <img src="${escapeHtml(cardImageUrl(entry))}" alt="${escapeHtml(entry.name)}" loading="lazy" decoding="async" />
            <span class="clue-card-caption">
              <b>${escapeHtml(CARD_TYPE_LABEL[entry.type])}</b>
              <span>${escapeHtml(entry.name)}</span>
            </span>
          </span>
        `).join("")
      : '<small>카드 없음</small>';
  }

  function suggestionCardHtml(entry) {
    return `
      <span class="clue-suggestion-card">
        <img src="${escapeHtml(cardImageUrl(entry))}" alt="${escapeHtml(entry.name)}" loading="lazy" decoding="async" />
        <span>${escapeHtml(entry.name)}</span>
      </span>
    `;
  }

  function renderCardPicker(picker, select, type, names, enabled) {
    if (!picker || !select) return;
    picker.classList.remove("open");
    const selectedName = select.value || names[0];
    if (!select.value) select.value = selectedName;
    const selected = card(type, selectedName);
    picker.innerHTML = `
      <button class="clue-card-select-button" type="button" ${enabled ? "" : "disabled"} aria-expanded="false">
        ${suggestionCardHtml(selected)}
      </button>
      <div class="clue-card-select-menu" hidden>
        ${names.map((name) => {
          const entry = card(type, name);
          return `
            <button class="clue-card-select-option${name === selectedName ? " selected" : ""}" type="button" data-card-name="${escapeHtml(name)}">
              ${suggestionCardHtml(entry)}
            </button>
          `;
        }).join("")}
      </div>
    `;
    const button = picker.querySelector(".clue-card-select-button");
    const menu = picker.querySelector(".clue-card-select-menu");
    button?.addEventListener("click", () => {
      const isOpen = picker.classList.toggle("open");
      button.setAttribute("aria-expanded", String(isOpen));
      if (menu) menu.hidden = !isOpen;
    });
    picker.querySelectorAll(".clue-card-select-option").forEach((option) => {
      option.addEventListener("click", () => {
        select.value = option.dataset.cardName || selectedName;
        renderSuggestionCards();
      });
    });
  }

  function renderSuggestionCards() {
    const player = activePlayer();
    const humanCanSuggest = Boolean(player?.human && state.phase === "suggest" && !state.finished);
    const currentRoom = player?.human ? ROOM_BY_ID[player.location] : null;
    if (els.suggestionRoomLabel) {
      els.suggestionRoomLabel.textContent = humanCanSuggest ? "카드를 골라 제안하세요." : "방에 들어가면 카드로 제안할 수 있습니다.";
    }
    if (els.suggestionRoomCard) {
      els.suggestionRoomCard.innerHTML = currentRoom
        ? suggestionCardHtml(card("room", currentRoom.name))
        : '<div class="clue-suggestion-empty-card">방 없음</div>';
      els.suggestionRoomCard.classList.toggle("disabled", !currentRoom);
    }
    renderCardPicker(els.suggestSuspectPicker, els.suggestSuspect, "suspect", SUSPECTS, humanCanSuggest);
    renderCardPicker(els.suggestWeaponPicker, els.suggestWeapon, "weapon", WEAPONS, humanCanSuggest);
  }

  function renderNotes() {
    if (!els.notes) return;
    const playerHeaders = Array.from({ length: NOTE_COLUMN_COUNT }, (_, column) => {
      const player = state.players[column];
      return `
        <span
          class="clue-note-player-cell${player ? " filled" : ""}"
          style="${noteCellStyle(NOTE_HEADER_ROW, column)}${player ? `; --player-color:${escapeHtml(player.color)}` : ""}"
          title="${player ? escapeHtml(`${column + 1}번 ${player.name}`) : ""}"
          aria-hidden="true"
        >${player ? column + 1 : ""}</span>
      `;
    }).join("");
    const noteCells = DEDUCTION_ROWS.flatMap((row) => {
      return Array.from({ length: NOTE_COLUMN_COUNT }, (_, column) => {
        const key = `${row.card.id}:${column}`;
        const mark = state.noteMarks[key] || "";
        const title = `${row.card.name} / 메모칸 ${column + 1} / ${NOTE_LABELS[mark] || "빈칸"}`;
        return `
          <button
            class="clue-note-cell${mark ? ` ${mark}` : ""}"
            type="button"
            style="${noteCellStyle(row, column)}"
            title="${escapeHtml(title)}"
            aria-label="${escapeHtml(title)}"
            data-note-key="${escapeHtml(key)}"
          >${escapeHtml(NOTE_SYMBOLS[mark] || "")}</button>
        `;
      });
    }).join("");
    els.notes.innerHTML = playerHeaders + noteCells;
    els.notes.querySelectorAll(".clue-note-cell").forEach((button) => {
      button.addEventListener("click", () => {
        const key = button.dataset.noteKey;
        const currentIndex = NOTE_STATES.indexOf(state.noteMarks[key] || "");
        const nextState = NOTE_STATES[(currentIndex + 1) % NOTE_STATES.length];
        if (nextState) state.noteMarks[key] = nextState;
        else delete state.noteMarks[key];
        renderNotes();
      });
    });
  }

  function renderControls() {
    const player = activePlayer();
    const humanTurn = Boolean(player?.human && !state.finished);
    if (els.turnLabel) {
      els.turnLabel.textContent = state.finished ? "게임 종료" : `${player?.name || "-"} 차례`;
    }
    if (els.phaseLabel) {
      const phaseText = {
        awaitRoll: "주사위를 굴리세요.",
        chooseMove: "갈 수 있는 곳 중 하나를 선택하세요.",
        suggest: `${roomName(player?.location)}에서 제안할 수 있습니다.`,
        chooseRefute: "보여줄 카드를 선택하세요.",
        accuse: "CLUE 존에서 최종 추리를 할 수 있습니다.",
        waitEnd: "턴을 종료하세요.",
        finished: "사건이 끝났습니다."
      };
      els.phaseLabel.textContent = phaseText[state.phase] || "-";
    }
    renderDiceDisplay();
    if (els.rollButton) {
      els.rollButton.disabled = !humanTurn || state.phase !== "awaitRoll" || state.diceRolling;
    }
    if (els.endTurnButton) {
      els.endTurnButton.disabled = !humanTurn || state.diceRolling || state.phase === "chooseMove" || state.phase === "awaitRoll";
    }
    const currentRoom = ROOM_BY_ID[player?.location];
    if (els.makeSuggestionButton) {
      els.makeSuggestionButton.disabled = !humanTurn || state.phase !== "suggest" || !currentRoom;
    }
    if (els.makeAccusationButton) {
      els.makeAccusationButton.disabled = !humanTurn || state.phase !== "accuse";
    }
    if (els.cancelAccusationButton) {
      els.cancelAccusationButton.disabled = !humanTurn || state.phase !== "accuse";
    }
    if (els.accusationCard) {
      els.accusationCard.classList.toggle("open", humanTurn && state.phase === "accuse");
    }
  }

  function renderLog() {
    if (!els.log) return;
    els.log.innerHTML = state.log.map((entry) => `<li>${escapeHtml(entry)}</li>`).join("");
  }

  function renderClue() {
    renderPlayers();
    renderBoard();
    renderMoveOptions();
    renderHand();
    renderNotes();
    renderControls();
    renderSuggestionCards();
    renderLog();
  }

  function initializeClue() {
    fillSelect(els.suggestSuspect, SUSPECTS);
    fillSelect(els.suggestWeapon, WEAPONS);
    fillSelect(els.accuseSuspect, SUSPECTS);
    fillSelect(els.accuseRoom, ROOMS.map((room) => room.name));
    fillSelect(els.accuseWeapon, WEAPONS);
  }

  initializeClue();

  els.enterButton?.addEventListener("click", () => {
    document.body.classList.remove("clue-playing");
    els.gamePanel?.classList.add("hidden");
    els.setupPanel?.classList.remove("hidden");
  });
  els.startButton?.addEventListener("click", startClueGame);
  els.newGameButton?.addEventListener("click", resetToClueSetup);
  els.exitButton?.addEventListener("click", leaveClueGame);
  els.backButton?.addEventListener("click", () => {
    document.body.classList.remove("clue-playing");
    els.gamePanel?.classList.add("hidden");
  });
  els.rulesButton?.addEventListener("click", () => {
    if (typeof els.rulesDialog?.showModal === "function" && !els.rulesDialog.open) {
      els.rulesDialog.showModal();
    }
  });
  els.rulesDialog?.addEventListener("click", (event) => {
    if (event.target === els.rulesDialog) els.rulesDialog.close();
  });
  els.rollButton?.addEventListener("click", rollForHuman);
  els.endTurnButton?.addEventListener("click", endHumanTurn);
  els.makeSuggestionButton?.addEventListener("click", makeHumanSuggestion);
  els.makeAccusationButton?.addEventListener("click", makeHumanAccusation);
  els.cancelAccusationButton?.addEventListener("click", () => {
    if (state.phase !== "accuse" || !activePlayer()?.human) return;
    closeAccusationDialog();
    state.phase = "waitEnd";
    log(`${withSubject(activePlayer().name)} 고발을 미뤘습니다.`);
    renderClue();
  });
  els.accusationCard?.addEventListener("click", (event) => {
    if (event.target.closest("button, select, label")) return;
    if (state.phase !== "accuse" || !activePlayer()?.human) return;
    closeAccusationDialog();
    state.phase = "waitEnd";
    log(`${withSubject(activePlayer().name)} 고발을 미뤘습니다.`);
    renderClue();
  });

  window.ClueGame = {
    start: startClueGame,
    leave: leaveClueGame
  };
})();
