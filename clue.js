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
  const CLUE_ZONE = { id: "clue", name: "CLUE 존", x: 50, y: 58, cost: 6, clue: true };
  const MOVE_DESTINATIONS = [...ROOMS, CLUE_ZONE];
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
  const CARD_TYPE_LABEL = { suspect: "용의자", weapon: "무기", room: "장소" };
  const AI_DELAY_MS = 720;
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
    dice: [],
    reachableRooms: [],
    humanKnown: new Set(),
    noteMarks: {},
    log: [],
    aiTimer: 0
  };

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
    return Array.from({ length: count }, (_, index) => {
      if (index === 0) {
        return {
          id: "human",
          human: true,
          name: currentHumanNickname() || "탐정",
          suspect: names[index],
          color: TOKEN_COLORS[index],
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
        color: TOKEN_COLORS[index],
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

  const DEDUCTION_ROWS = [
    ...["그린", "머스터드", "피콕", "플럼", "스칼렛", "화이트"].map((name, index) => ({
      card: card("suspect", name),
      top: 10.9 + index * 3.35
    })),
    ...["렌치", "촛대", "단검", "권총", "파이프", "밧줄"].map((name, index) => ({
      card: card("weapon", name),
      top: 36.5 + index * 3.35
    })),
    ...["욕실", "서재", "게임룸", "차고", "침실", "거실", "부엌", "마당", "식당"].map((name, index) => ({
      card: card("room", name),
      top: 62.2 + index * 3.35
    }))
  ];
  const NOTE_STATES = ["", "suspect", "confirmed", "excluded"];
  const NOTE_SYMBOLS = { suspect: "?", confirmed: "확", excluded: "×" };
  const NOTE_LABELS = { suspect: "의심", confirmed: "확정", excluded: "제외" };

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

  function shortestDistances(start) {
    const distances = { [start]: 0 };
    const open = [start];
    while (open.length) {
      const current = open.sort((a, b) => distances[a] - distances[b]).shift();
      Object.entries(ROOM_LINKS[current] || {}).forEach(([next, cost]) => {
        const candidate = distances[current] + cost;
        if (distances[next] === undefined || candidate < distances[next]) {
          distances[next] = candidate;
          open.push(next);
        }
      });
    }
    return distances;
  }

  function rollDice() {
    return [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
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

  function resolveSuggestion(playerIndex, suggestion) {
    const player = state.players[playerIndex];
    const suspectPlayer = state.players.find((entry) => entry.suspect === suggestion.suspect.name);
    if (suspectPlayer) suspectPlayer.location = ROOM_BY_NAME[suggestion.room.name]?.id || suspectPlayer.location;

    for (let offset = 1; offset < state.players.length; offset += 1) {
      const target = state.players[(playerIndex + offset) % state.players.length];
      if (target.eliminated) continue;
      const matches = matchingCards(target, suggestion);
      if (!matches.length) continue;
      const shown = randomItem(matches);
      player.known.add(shown.id);
      if (player.human) {
        state.humanKnown.add(shown.id);
        log(`${target.name}이 ${shown.name} 카드를 보여줬습니다.`);
      } else if (target.human) {
        log(`당신이 ${player.name}에게 ${shown.name} 카드를 보여줬습니다.`);
      } else {
        log(`${target.name}이 ${player.name}에게 카드 1장을 보여줬습니다.`);
      }
      return shown;
    }

    log(`${player.name}의 제안은 아무도 반박하지 못했습니다.`);
    return null;
  }

  function candidateCards(player, type) {
    const source = type === "suspect" ? SUSPECTS : type === "weapon" ? WEAPONS : ROOMS.map((room) => room.name);
    return source
      .map((name) => card(type, name))
      .filter((entry) => !player.known.has(entry.id));
  }

  function chooseAiRoom(player, reachable) {
    const roomChoices = reachable.filter((destination) => !destination.clue);
    if (!roomChoices.length) return randomItem(ROOMS);
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
      if (typeof window.showCenterToast === "function") {
        window.showCenterToast(`${player.name} 승리`, 1800, { mode: "clue-finish" });
      }
    } else {
      player.eliminated = true;
      log(`${player.name}의 고발 실패: ${accusation.suspect.name}, ${accusation.room.name}, ${accusation.weapon.name}`);
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
        state.phase = "awaitRoll";
        state.currentPlayer = nextPlayerIndex();
      }
    }
    renderClue();
  }

  function reachableRoomsForRoll(player, total) {
    const distances = shortestDistances(player.location);
    const reachable = MOVE_DESTINATIONS.filter((destination) => distances[destination.id] !== undefined && distances[destination.id] <= total);
    if (reachable.length) return reachable;
    return ROOMS
      .map((room) => ({ room, distance: distances[room.id] ?? 99 }))
      .sort((left, right) => left.distance - right.distance)
      .slice(0, 1)
      .map((entry) => entry.room);
  }

  function startClueGame() {
    clearAiTimer();
    const playerCount = Math.min(6, Math.max(3, Number(els.playerCountSelect?.value || 4)));
    state.players = buildPlayers(playerCount);
    state.humanKnown = new Set();
    state.noteMarks = {};
    const { solution, deck } = createGameDeck();
    state.solution = solution;
    state.deck = deck;
    dealCards(deck);
    state.started = true;
    state.finished = false;
    state.currentPlayer = 0;
    state.phase = "awaitRoll";
    state.dice = [];
    state.reachableRooms = [];
    state.log = [];
    log("사건 봉투가 준비되었습니다. 주사위를 굴리세요.");
    closeAccusationDialog();
    document.body.classList.add("clue-playing");
    els.setupPanel?.classList.add("hidden");
    els.gamePanel?.classList.remove("hidden");
    renderClue();
  }

  function leaveClueGame() {
    clearAiTimer();
    closeAccusationDialog();
    document.body.classList.remove("clue-playing", "clue-active");
    document.body.classList.add("launcher-active");
    els.setupPanel?.classList.add("hidden");
    els.gamePanel?.classList.add("hidden");
  }

  function resetToClueSetup() {
    clearAiTimer();
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

  function rollForHuman() {
    if (state.finished || state.phase !== "awaitRoll" || !activePlayer()?.human) return;
    state.dice = rollDice();
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
    activePlayer().location = destination.id;
    if (destination.clue) {
      state.phase = "accuse";
      log(`${activePlayer().name}이 ${destination.name}에 들어갔습니다.`);
      renderClue();
      openAccusationDialog();
      return;
    }
    state.phase = "suggest";
    log(`${activePlayer().name}이 ${destination.name}에 들어갔습니다.`);
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
    finishGame(activePlayer(), isCorrectAccusation(accusation), accusation);
  }

  function endHumanTurn() {
    if (state.finished || !activePlayer()?.human || state.phase === "chooseMove" || state.phase === "awaitRoll") return;
    closeAccusationDialog();
    state.currentPlayer = nextPlayerIndex();
    state.phase = "awaitRoll";
    state.dice = [];
    state.reachableRooms = [];
    renderClue();
    scheduleAiTurn();
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
    state.aiTimer = window.setTimeout(runAiTurn, AI_DELAY_MS);
  }

  function runAiTurn() {
    clearAiTimer();
    if (state.finished || activePlayer()?.human) return;
    const player = activePlayer();
    state.dice = rollDice();
    const total = state.dice[0] + state.dice[1];
    const reachable = reachableRoomsForRoll(player, total);
    const accusation = buildCertainAccusation(player);
    if (accusation && reachable.some((destination) => destination.id === CLUE_ZONE.id)) {
      player.location = CLUE_ZONE.id;
      log(`${player.name}: ${state.dice.join(" + ")} = ${total}, ${CLUE_ZONE.name} 이동`);
      log(`${player.name}이 최종 추리를 선언했습니다.`);
      finishGame(player, isCorrectAccusation(accusation), accusation);
      return;
    }
    const room = chooseAiRoom(player, reachable);
    player.location = room.id;
    log(`${player.name}: ${state.dice.join(" + ")} = ${total}, ${room.name} 이동`);
    const suggestion = aiSuggestion(player, room);
    log(`${player.name} 제안: ${suggestion.suspect.name}, ${suggestion.room.name}, ${suggestion.weapon.name}`);
    resolveSuggestion(state.currentPlayer, suggestion);
    if (state.finished) return;
    state.currentPlayer = nextPlayerIndex();
    state.phase = "awaitRoll";
    state.dice = [];
    state.reachableRooms = [];
    renderClue();
    if (!activePlayer().human) scheduleAiTurn();
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
      const piece = document.createElement("span");
      piece.className = "clue-board-piece";
      piece.style.background = player.color;
      piece.style.setProperty("--piece-x", `${point.x}%`);
      piece.style.setProperty("--piece-y", `${point.y}%`);
      piece.style.setProperty("--piece-offset-x", `${offsetX}%`);
      piece.style.setProperty("--piece-offset-y", `${offsetY}%`);
      piece.textContent = index + 1;
      piece.title = `${player.name} · ${player.suspect}`;
      els.board.append(piece);
    });
  }

  function renderMoveOptions() {
    if (!els.moveOptions) return;
    const player = activePlayer();
    const humanCanChoose = Boolean(player?.human && state.phase === "chooseMove" && !state.finished);
    if (els.moveHint) {
      const total = state.dice.length ? state.dice[0] + state.dice[1] : 0;
      els.moveHint.textContent = humanCanChoose
        ? `주사위 합계 ${total}. 갈 곳을 고르세요.`
        : "주사위를 굴리면 이동 가능한 장소가 표시됩니다.";
    }
    if (!humanCanChoose) {
      els.moveOptions.innerHTML = '<div class="clue-move-empty">아직 선택 가능한 이동지가 없습니다.</div>';
      return;
    }
    els.moveOptions.innerHTML = state.reachableRooms.map((destination) => `
      <button class="clue-move-option${destination.clue ? " clue-zone" : ""}" type="button" data-destination-id="${escapeHtml(destination.id)}">
        <span>${escapeHtml(destination.name)}</span>
        <small>${destination.clue ? "최종추리" : "방 이동"}</small>
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
      ? human.hand.map((entry) => `
          <span class="clue-card-chip">
            <b>${escapeHtml(CARD_TYPE_LABEL[entry.type])}</b>
            ${escapeHtml(entry.name)}
          </span>
        `).join("")
      : '<small>카드 없음</small>';
  }

  function renderNotes() {
    if (!els.notes) return;
    const playerCount = Math.max(3, state.players.length || 4);
    const left = 29.5;
    const totalWidth = 67.5;
    const cellWidth = totalWidth / playerCount;
    els.notes.innerHTML = DEDUCTION_ROWS.flatMap((row) => {
      return Array.from({ length: playerCount }, (_, column) => {
        const key = `${row.card.id}:${column}`;
        const mark = state.noteMarks[key] || "";
        const title = `${row.card.name} / ${state.players[column]?.name || `${column + 1}번`} / ${NOTE_LABELS[mark] || "빈칸"}`;
        return `
          <button
            class="clue-note-cell${mark ? ` ${mark}` : ""}"
            type="button"
            style="--note-left:${left + column * cellWidth}%; --note-top:${row.top}%; --note-width:${cellWidth}%; --note-height:3.1%;"
            title="${escapeHtml(title)}"
            aria-label="${escapeHtml(title)}"
            data-note-key="${escapeHtml(key)}"
          >${escapeHtml(NOTE_SYMBOLS[mark] || "")}</button>
        `;
      });
    }).join("");
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
        accuse: "CLUE 존에서 최종 추리를 할 수 있습니다.",
        waitEnd: "턴을 종료하세요.",
        finished: "사건이 끝났습니다."
      };
      els.phaseLabel.textContent = phaseText[state.phase] || "-";
    }
    if (els.dice) {
      els.dice.textContent = state.dice.length ? `${state.dice[0]} + ${state.dice[1]}` : "-";
    }
    if (els.rollButton) {
      els.rollButton.disabled = !humanTurn || state.phase !== "awaitRoll";
    }
    if (els.endTurnButton) {
      els.endTurnButton.disabled = !humanTurn || state.phase === "chooseMove" || state.phase === "awaitRoll";
    }
    const currentRoom = ROOM_BY_ID[player?.location];
    if (els.suggestionRoomLabel) {
      els.suggestionRoomLabel.textContent = currentRoom ? `현재 장소: ${currentRoom.name}` : "방에 들어가면 제안할 수 있습니다.";
    }
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
    log(`${activePlayer().name}이 고발을 미뤘습니다.`);
    renderClue();
  });

  window.ClueGame = {
    start: startClueGame,
    leave: leaveClueGame
  };
})();
