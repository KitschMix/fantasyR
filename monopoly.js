/* ===== 부루마불 (World-tour Board Game) ===== */
(function () {
  "use strict";

  /* ── Board Layout ── */
  // 40 tiles: 0=GO, 1-9=top row (left→right), 10=Jail, 11-19=right col (top→bottom),
  // 20=Free Parking, 21-29=bottom row (right→left), 30=GoToJail, 31-39=left col (bottom→top)
  const TILES = [
    { id: 0,  name: "출발",           type: "corner",   corner: "go" },
    { id: 1,  name: "타이베이",       type: "property", color: "#8B4513", price: 60,  rent: [2, 10, 30, 90, 160, 250] },
    { id: 2,  name: "사회복지기금",   type: "event",    event: "fund" },
    { id: 3,  name: "베이징",         type: "property", color: "#8B4513", price: 60,  rent: [4, 20, 60, 180, 320, 450] },
    { id: 4,  name: "여행세",         type: "event",    event: "tax", amount: 200 },
    { id: 5,  name: "김포공항",       type: "property", color: "#4682B4", price: 200, rent: [25, 50, 100, 200] },
    { id: 6,  name: "홍콩",           type: "property", color: "#ADD8E6", price: 100, rent: [6, 30, 90, 270, 400, 550] },
    { id: 7,  name: "황금열쇠",       type: "event",    event: "chance" },
    { id: 8,  name: "마닐라",         type: "property", color: "#ADD8E6", price: 100, rent: [6, 30, 90, 270, 400, 550] },
    { id: 9,  name: "싱가포르",       type: "property", color: "#ADD8E6", price: 120, rent: [8, 40, 100, 300, 450, 600] },
    { id: 10, name: "무인도",         type: "corner",   corner: "jail" },
    { id: 11, name: "카이로",         type: "property", color: "#FF69B4", price: 140, rent: [10, 50, 150, 450, 625, 750] },
    { id: 12, name: "세계여행권",     type: "property", color: "#808080", price: 150, rent: [4, 10] },
    { id: 13, name: "이스탄불",       type: "property", color: "#FF69B4", price: 140, rent: [10, 50, 150, 450, 625, 750] },
    { id: 14, name: "아테네",         type: "property", color: "#FF69B4", price: 160, rent: [12, 60, 180, 500, 700, 900] },
    { id: 15, name: "두바이공항",     type: "property", color: "#4682B4", price: 200, rent: [25, 50, 100, 200] },
    { id: 16, name: "로마",           type: "property", color: "#FFA500", price: 180, rent: [14, 70, 200, 550, 750, 950] },
    { id: 17, name: "사회복지기금",   type: "event",    event: "fund" },
    { id: 18, name: "파리",           type: "property", color: "#FFA500", price: 180, rent: [14, 70, 200, 550, 750, 950] },
    { id: 19, name: "런던",           type: "property", color: "#FFA500", price: 200, rent: [16, 80, 220, 600, 800, 1000] },
    { id: 20, name: "사회복지기금 수령", type: "corner",   corner: "fund" },
    { id: 21, name: "뉴욕",           type: "property", color: "#FF0000", price: 220, rent: [18, 90, 250, 700, 875, 1050] },
    { id: 22, name: "황금열쇠",       type: "event",    event: "chance" },
    { id: 23, name: "워싱턴",         type: "property", color: "#FF0000", price: 220, rent: [18, 90, 250, 700, 875, 1050] },
    { id: 24, name: "토론토",         type: "property", color: "#FF0000", price: 240, rent: [20, 100, 300, 750, 925, 1100] },
    { id: 25, name: "JFK공항",        type: "property", color: "#4682B4", price: 200, rent: [25, 50, 100, 200] },
    { id: 26, name: "리우",           type: "property", color: "#FFD700", price: 260, rent: [22, 110, 330, 800, 975, 1150] },
    { id: 27, name: "부에노스",       type: "property", color: "#FFD700", price: 260, rent: [22, 110, 330, 800, 975, 1150] },
    { id: 28, name: "항공패스",       type: "property", color: "#808080", price: 150, rent: [4, 10] },
    { id: 29, name: "멕시코시티",     type: "property", color: "#FFD700", price: 280, rent: [24, 120, 360, 850, 1025, 1200] },
    { id: 30, name: "우주여행",       type: "corner",   corner: "parking" },
    { id: 31, name: "시드니",         type: "property", color: "#008000", price: 300, rent: [26, 130, 390, 900, 1100, 1275] },
    { id: 32, name: "오클랜드",       type: "property", color: "#008000", price: 300, rent: [26, 130, 390, 900, 1100, 1275] },
    { id: 33, name: "황금열쇠",       type: "event",    event: "chance" },
    { id: 34, name: "하와이",         type: "property", color: "#008000", price: 320, rent: [28, 150, 450, 1000, 1200, 1400] },
    { id: 35, name: "나리타공항",     type: "property", color: "#4682B4", price: 200, rent: [25, 50, 100, 200] },
    { id: 36, name: "사회복지기금",   type: "event",    event: "fund" },
    { id: 37, name: "제주",           type: "property", color: "#4B0082", price: 350, rent: [35, 175, 500, 1100, 1300, 1500] },
    { id: 38, name: "특별여행세",     type: "event",    event: "tax", amount: 100 },
    { id: 39, name: "서울",           type: "property", color: "#4B0082", price: 400, rent: [50, 200, 600, 1400, 1700, 2000] }
  ];

  const COLOR_GROUPS = {};
  TILES.filter(t => t.type === "property" && t.color !== "#808080" && t.color !== "#4682B4").forEach(t => {
    if (!COLOR_GROUPS[t.color]) COLOR_GROUPS[t.color] = [];
    COLOR_GROUPS[t.color].push(t.id);
  });
  // Railroad group
  const RAILROAD_IDS = [5, 15, 25, 35];
  // Utility group
  const UTILITY_IDS = [12, 28];

  const CHANCE_CARDS = [
    { text: "출발 지점으로 이동하세요.", action: "moveTo", target: 0, collect: true },
    { text: "무인도로 가세요. 출발 지점을 지나도 받지 못합니다.", action: "goToJail" },
    { text: "타이베이로 이동하세요.", action: "moveTo", target: 1 },
    { text: "로마로 이동하세요.", action: "moveTo", target: 16 },
    { text: "제주로 이동하세요.", action: "moveTo", target: 37 },
    { text: "모든 플레이어에게 50원을 지불하세요.", action: "payAll", amount: 50 },
    { text: "은행에서 150원을 받습니다.", action: "collect", amount: 150 },
    { text: "은행에서 100원을 받습니다.", action: "collect", amount: 100 },
    { text: "건설비용: 각 건물당 25원, 호텔당 100원을 지불하세요.", action: "buildingCost", house: 25, hotel: 100 },
    { text: "한 바퀴 돌아 출발에서 200원을 받으세요.", action: "moveTo", target: 0, collect: true }
  ];

  const FUND_CARDS = [
    { text: "은행에서 200원을 받습니다.", action: "collect", amount: 200 },
    { text: "은행에서 50원을 받습니다.", action: "collect", amount: 50 },
    { text: "병원비로 100원을 지불하세요.", action: "pay", amount: 100 },
    { text: "보험료로 50원을 지불하세요.", action: "pay", amount: 50 },
    { text: "학교 기부금으로 150원을 지불하세요.", action: "pay", amount: 150 },
    { text: "컨설팅 수입으로 25원을 받습니다.", action: "collect", amount: 25 },
    { text: "축하합니다! 생일 선물로 각 플레이어에게서 10원씩 받습니다.", action: "collectAll", amount: 10 },
    { text: "은행에서 100원을 받습니다.", action: "collect", amount: 100 },
    { text: "미화금으로 50원을 지불하세요.", action: "pay", amount: 50 },
    { text: "출발 지점으로 이동하세요.", action: "moveTo", target: 0, collect: true }
  ];

  const SCALE_FACTOR = 10000;
  const START_MONEY = 1500 * SCALE_FACTOR;
  const GO_SALARY = 200 * SCALE_FACTOR;
  const JAIL_FINE = 50 * SCALE_FACTOR;
  const JAIL_TURNS = 3;
  const SOCIAL_FUND_FEE = 50 * SCALE_FACTOR;
  const DEFAULT_UTILITY_DICE_TOTAL = 7;
  const MAX_BUILDING_LEVEL = 5;
  const AI_THINK_DELAY = 1200;
  const DICE_ROLL_DURATION = 600;
  const DICE_FRAME_MS = 60;

  const SCENIC_BG_MAPPING = {
    "JFK공항": "jfk_airport.jpg",
    "김포공항": "gimpo_airport.jpg",
    "나리타공항": "narita_airport.jpg",
    "두바이공항": "dubai_airport.jpg",
    "뉴욕": "newyork.jpg",
    "베이징": "beijing.jpg",
    "워싱턴": "washington.jpg",
    "타이베이": "taipei.jpg",
    "토론토": "toronto.jpg",
    "런던": "london.jpg",
    "로마": "rome.jpg",
    "리우": "rio.jpg",
    "마닐라": "manila.jpg",
    "멕시코시티": "mexicocity.jpg",
    "부에노스": "buenos_aires.jpg",
    "서울": "seoul.jpg",
    "시드니": "sydney.jpg",
    "싱가포르": "singapore.jpg",
    "아테네": "athens.jpg",
    "오클랜드": "auckland.jpg",
    "이스탄불": "istanbul.jpg",
    "제주": "jeju.jpg",
    "카이로": "cairo.jpg",
    "파리": "paris.jpg",
    "하와이": "hawaii.jpg",
    "홍콩": "hongkong.jpg"
  };

  function preloadScenicImages() {
    Object.values(SCENIC_BG_MAPPING).forEach(filename => {
      const img = new Image();
      img.src = `assets/monopoly/${filename}`;
    });
  }

  // Scale TILES, CHANCE_CARDS, FUND_CARDS
  TILES.forEach(t => {
    if (t.price) t.price *= SCALE_FACTOR;
    if (t.rent) t.rent = t.rent.map(r => r * SCALE_FACTOR);
    if (t.amount) t.amount *= SCALE_FACTOR;
  });

  CHANCE_CARDS.forEach(card => {
    if (card.amount) card.amount *= SCALE_FACTOR;
    if (card.house) card.house *= SCALE_FACTOR;
    if (card.hotel) card.hotel *= SCALE_FACTOR;
    card.text = card.text.replace(/(\d+)원/g, "$1만 원");
  });

  FUND_CARDS.forEach(card => {
    if (card.amount) card.amount *= SCALE_FACTOR;
    card.text = card.text.replace(/(\d+)원/g, "$1만 원");
  });

  /* ── DOM Refs ── */
  const $ = (sel) => document.querySelector(sel);
  const els = {
    setupPanel:       $("#monopolySetupPanel"),
    gamePanel:        $("#monopolyGamePanel"),
    startButton:      $("#startMonopolyButton"),
    playerCount:      $("#monopolyPlayerCountSelect"),
    nameInput:        $("#monopolyNameInput"),
    backButton:       $("#monopolyBackButton"),
    newGameButton:    $("#monopolyNewGameButton"),
    exitButton:       $("#monopolyExitGameButton"),
    rulesButton:      $("#monopolyRulesButton"),
    rulesDialog:      $("#monopolyRulesDialog"),
    playersList:      $("#monopolyPlayersList"),
    turnLabel:        $("#monopolyTurnLabel"),
    phaseLabel:       $("#monopolyPhaseLabel"),
    board:            $("#monopolyBoard"),
    boardImage:       $("#monopolyBoardImage"),
    piecesContainer:  $("#monopolyPieces"),
    diceDisplay:      $("#monopolyDiceDisplay"),
    rollButton:       $("#monopolyRollButton"),
    endTurnButton:    $("#monopolyEndTurnButton"),
    manageButton:     $("#monopolyManageButton"),
    propertyInfo:     $("#monopolyPropertyInfo"),
    log:              $("#monopolyLog"),
    manageDialog:     $("#monopolyManageDialog"),
    manageList:       $("#monopolyManageList"),
    jailDialog:       $("#monopolyJailDialog"),
    jailTurnsLabel:   $("#monopolyJailTurnsLeft"),
    jailFineLabel:    $("#monopolyJailFineText"),
    jailFooter:       $("#monopolyJailFooter")
  };

  /* ── State ── */
  const state = {
    players: [],
    currentPlayer: 0,
    phase: "idle",       // idle, awaitRoll, rolled, buyDecision, jailed, finished
    dice: [],
    diceRolling: false,
    diceRollingStates: [false, false],
    diceTimer: 0,
    chanceDeck: [],
    fundDeck: [],
    log: [],
    turnCount: 0,
    aiTimer: 0,
    lastDoubleCount: 0,
    socialFundPool: 0,
    rentDiceTotal: 0,
    suppressDoubleExtraTurn: false
  };

  const TOKEN_EMOJIS = ["🔴", "🟢", "🔵", "🟡"];
  const TOKEN_COLORS = ["#e74c3c", "#2ecc71", "#3498db", "#f1c40f"];
  const TOKEN_NAMES = ["빨강", "초록", "파랑", "노랑"];

  const SHARED_PROFILES = window.FANTASY_SHARED_PROFILES || {};
  const SHARED_NICKNAME_RULES = window.FANTASY_SHARED_NICKNAME_RULES || {};
  const PROFILE_ASSET_ROOT = SHARED_PROFILES.root || "assets/profiles/user";
  const HUMAN_PROFILE_STORAGE_KEY = SHARED_NICKNAME_RULES.storageKey || "fantasyKingdom.humanProfile.v1";
  const AI_PROFILE_DIFFICULTY_KEYS = SHARED_PROFILES.difficultyKeys || ["normal", "hard", "expert"];

  function profileImageUrl(fileName) {
    return encodeURI(`${PROFILE_ASSET_ROOT}/${fileName}`);
  }

  function currentHumanNickname() {
    try {
      const profile = JSON.parse(localStorage.getItem(HUMAN_PROFILE_STORAGE_KEY) || "null");
      return String(profile?.nickname || "").trim();
    } catch { return ""; }
  }

  function currentHumanAvatarUrl() {
    return (SHARED_PROFILES.human?.avatarUrl) || profileImageUrl("유저.jpg");
  }

  function aiProfiles() {
    const groups = SHARED_PROFILES.groups || {};
    return AI_PROFILE_DIFFICULTY_KEYS.flatMap((key) =>
      (groups[key] || []).map((profile) => ({
        ...profile,
        difficulty: key
      }))
    );
  }

  /* ── Piece Positions (for smooth animation) ── */
  const piecePositions = {};

  /* ── Helpers ── */
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function wait(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  function escapeHtml(v) {
    return String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function addLog(msg) {
    state.log.unshift(msg);
    state.log = state.log.slice(0, 50);
  }

  function activePlayer() {
    return state.players[state.currentPlayer];
  }

  function tileAt(id) {
    return TILES[id] || TILES[0];
  }

  function playerDisplayName(p) {
    if (!p) return "?";
    return `${p.name}(${TOKEN_NAMES[p.index]})`;
  }

  /* ── Board Position Calculation ── */
  // Board is a grid: corners are bigger, sides have tiles in between
  // Positions are in % of the board
  function tilePosition(index) {
    const CORNER_SIZE = 13.5; // % of board for corner tiles (perfectly sized to leave exactly 73% for 9 side tiles)
    const SIDE_TILES = 9;
    const avail = 100 - 2 * CORNER_SIZE; // 100 - 27 = 73%
    const step = avail / SIDE_TILES; // 73 / 9 = 8.1111...%

    if (index === 0)  return { x: 100 - CORNER_SIZE, y: 100 - CORNER_SIZE, w: CORNER_SIZE, h: CORNER_SIZE }; // GO (bottom-right)
    if (index <= 9)   return { x: 100 - CORNER_SIZE - index * step, y: 100 - CORNER_SIZE, w: step, h: CORNER_SIZE }; // bottom row, right→left
    if (index === 10) return { x: 0, y: 100 - CORNER_SIZE, w: CORNER_SIZE, h: CORNER_SIZE }; // Jail (bottom-left)
    if (index <= 19)  return { x: 0, y: 100 - CORNER_SIZE - (index - 10) * step, w: CORNER_SIZE, h: step }; // left col, bottom→top
    if (index === 20) return { x: 0, y: 0, w: CORNER_SIZE, h: CORNER_SIZE }; // Free Parking (top-left)
    if (index <= 29)  return { x: CORNER_SIZE + (index - 21) * step, y: 0, w: step, h: CORNER_SIZE }; // top row, left→right
    if (index === 30) return { x: 100 - CORNER_SIZE, y: 0, w: CORNER_SIZE, h: CORNER_SIZE }; // Go To Jail (top-right)
    if (index <= 39)  return { x: 100 - CORNER_SIZE, y: CORNER_SIZE + (index - 31) * step, w: CORNER_SIZE, h: step }; // right col, top→bottom
    return { x: 50, y: 50, w: 0, h: 0 };
  }

  /* ── Board Rendering ── */
  function renderBoard() {
    if (!els.board) return;
    // Remove old tiles (keep image, pieces, dice)
    els.board.querySelectorAll(".monopoly-tile").forEach(el => el.remove());

    TILES.forEach((tile, i) => {
      const pos = tilePosition(i);
      const div = document.createElement("div");
      div.className = `monopoly-tile${tile.type === "corner" ? " corner" : ""}${tile.type === "event" ? " event-tile" : ""}`;
      const owner = state.players.find(p => p.properties.includes(i));
      if (owner) div.classList.add("owned");

      div.style.left = `${pos.x}%`;
      div.style.top = `${pos.y}%`;
      div.style.width = `${pos.w}%`;
      div.style.height = `${pos.h}%`;

      let html = "";
      if (tile.type === "property") {
        html += `<div class="tile-color-bar" style="background:${tile.color}"></div>`;
        if (owner) {
          div.style.borderColor = owner.tokenColor;
          div.style.boxShadow = `inset 0 0 10px ${owner.tokenColor}44`;
        }
      }
      html += `<span class="tile-name">${escapeHtml(tile.name)}</span>`;
      if (tile.price) {
        html += `<span class="tile-price">₩${tile.price.toLocaleString()}</span>`;
      }
      div.innerHTML = html;
      if (tile.type !== "property") {
        div.title = tile.name;
      }
      div.addEventListener("mouseenter", () => showHoverCard(i));
      div.addEventListener("mouseleave", hideHoverCard);
      div.addEventListener("click", () => {
        if (state.phase === "spaceTravel" && activePlayer().human) {
          executeSpaceTravel(activePlayer(), i);
        }
      });
      els.board.appendChild(div);
    });
  }

  function renderPieces() {
    if (!els.piecesContainer) return;
    els.piecesContainer.innerHTML = "";
    const offsets = [[0, 0], [1.6, 0], [-1.6, 0], [0, 1.6], [1.6, 1.6], [-1.6, 1.6]];

    state.players.forEach((player, i) => {
      const pos = tilePosition(player.position);
      const [ox, oy] = offsets[i] || [0, 0];
      const c = { x: pos.x + pos.w / 2, y: pos.y + pos.h / 2 };

      // Token circle
      const piece = document.createElement("span");
      piece.className = `monopoly-piece${player.bankrupt ? " bankrupt" : ""}`;
      piece.dataset.playerId = player.id;
      piece.style.background = player.tokenColor;
      piece.style.setProperty("--piece-x", `${c.x}%`);
      piece.style.setProperty("--piece-y", `${c.y}%`);
      piece.style.setProperty("--piece-offset-x", `${ox}%`);
      piece.style.setProperty("--piece-offset-y", `${oy}%`);
      piece.textContent = i + 1;
      piece.title = `${player.name}(${TOKEN_NAMES[i]}) — ${tileAt(player.position).name}`;
      els.piecesContainer.appendChild(piece);

      piecePositions[player.id] = pos;

      if (i !== state.currentPlayer || state.phase === "finished" || player.bankrupt) return;

      // Keep only the current player's avatar on the board so the tokens stay readable.
      const avatar = document.createElement("img");
      avatar.className = "monopoly-board-turn-avatar active";
      avatar.dataset.playerId = player.id;
      avatar.src = player.avatarUrl || currentHumanAvatarUrl();
      avatar.alt = "";
      avatar.loading = "lazy";
      avatar.decoding = "async";
      avatar.style.setProperty("--piece-x", `${c.x}%`);
      avatar.style.setProperty("--piece-y", `${c.y}%`);
      avatar.style.setProperty("--piece-offset-x", `${ox}%`);
      avatar.style.setProperty("--piece-offset-y", `${oy}%`);
      els.piecesContainer.appendChild(avatar);
    });
  }

  function renderPlayers() {
    if (!els.playersList) return;
    els.playersList.innerHTML = "";
    state.players.forEach((p, i) => {
      const card = document.createElement("section");
      card.className = `monopoly-player-card${i === state.currentPlayer && state.phase !== "finished" ? " active" : ""}${p.bankrupt ? " bankrupt" : ""}`;
      card.innerHTML = `
        <span class="monopoly-player-avatar-wrap">
          <img class="monopoly-player-avatar" src="${escapeHtml(p.avatarUrl || currentHumanAvatarUrl())}" alt="" loading="lazy" decoding="async" />
          <span class="monopoly-player-token" style="background:${p.tokenColor}">${i + 1}</span>
        </span>
        <span class="monopoly-player-info">
          <strong>${escapeHtml(p.name)}</strong>
          <small>${escapeHtml(tileAt(p.position).name)} · 자산 ${p.properties.length}개${p.inJail ? " · 🚔 구금" : ""}</small>
        </span>
        <b class="monopoly-player-money">₩${p.money.toLocaleString()}</b>
      `;
      els.playersList.appendChild(card);
    });
  }

  function renderDice() {
    if (!els.diceDisplay) return;
    if (state.dice.length < 2) {
      els.diceDisplay.innerHTML = "";
      return;
    }

    const rx1 = (Math.random() - 0.5) * 40;
    const ry1 = (Math.random() - 0.5) * 40;
    const rr1 = (Math.random() - 0.5) * 50;
    const sc1 = 0.85 + Math.random() * 0.3;

    const rx2 = (Math.random() - 0.5) * 40;
    const ry2 = (Math.random() - 0.5) * 40;
    const rr2 = (Math.random() - 0.5) * 50;
    const sc2 = 0.85 + Math.random() * 0.3;

    const isRolling1 = state.diceRolling && (!state.diceRollingStates || state.diceRollingStates[0]);
    const isRolling2 = state.diceRolling && (!state.diceRollingStates || state.diceRollingStates[1]);

    const html1 = isRolling1
      ? `<div class="monopoly-die rolling" style="transform:translate(${rx1}px,${ry1}px) rotate(${rr1}deg) scale(${sc1})">${state.dice[0]}</div>`
      : `<div class="monopoly-die">${state.dice[0]}</div>`;

    const html2 = isRolling2
      ? `<div class="monopoly-die rolling" style="transform:translate(${rx2}px,${ry2}px) rotate(${rr2}deg) scale(${sc2})">${state.dice[1]}</div>`
      : `<div class="monopoly-die">${state.dice[1]}</div>`;

    els.diceDisplay.innerHTML = html1 + html2;
  }

  function renderMyAssets() {
    const area = document.querySelector("#monopolyMyAssetsArea");
    const grid = document.querySelector("#monopolyMyAssetsGrid");
    const tabsContainer = document.querySelector("#monopolyAssetPlayerTabs");
    if (!area || !grid || !tabsContainer) return;

    const human = state.players.find(p => p.human);
    if (!human || state.phase === "idle" || state.phase === "finished") {
      area.classList.add("hidden");
      return;
    }

    area.classList.remove("hidden");

    // Default selection to human (index 0) if undefined or selected player went bankrupt
    if (state.selectedAssetPlayerIndex === undefined || !state.players[state.selectedAssetPlayerIndex] || state.players[state.selectedAssetPlayerIndex].bankrupt) {
      state.selectedAssetPlayerIndex = human.index;
    }

    // Render Tabs for non-bankrupt players
    tabsContainer.innerHTML = state.players.map(p => {
      if (p.bankrupt) return "";
      const isActive = p.index === state.selectedAssetPlayerIndex;
      const activeStyle = isActive 
        ? `border: 2px solid ${p.tokenColor}; background: ${p.tokenColor}15; font-weight: 800; color: var(--text);` 
        : `border: 1px solid var(--line); background: var(--surface-3); opacity: 0.75; color: var(--text);`;
        
      return `
        <button class="monopoly-asset-tab-btn" data-player-index="${p.index}" style="padding: 6px 12px; border-radius: 20px; font-size: 12px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 6px; ${activeStyle}">
          <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${p.tokenColor}"></span>
          ${p.human ? "나" : p.name} (${p.properties.length})
        </button>
      `;
    }).join("");

    // Bind tab clicks
    tabsContainer.querySelectorAll(".monopoly-asset-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        state.selectedAssetPlayerIndex = parseInt(btn.getAttribute("data-player-index"), 10);
        renderMyAssets();
      });
    });

    const targetPlayer = state.players[state.selectedAssetPlayerIndex];
    grid.innerHTML = "";

    if (targetPlayer.properties.length === 0) {
      const displayLabel = targetPlayer.human ? "내가" : `${targetPlayer.name}이(가)`;
      grid.innerHTML = `<span style="font-size: 13px; color: var(--text-muted); opacity: 0.7;">아직 ${displayLabel} 보유한 부동산이 없습니다.</span>`;
      return;
    }

    targetPlayer.properties.forEach(tileId => {
      const tile = tileAt(tileId);
      const isMon = tile.color !== "#808080" && tile.color !== "#4682B4" && isMonopoly(targetPlayer, tile.color);
      
      let groupStatus = "";
      if (tile.color === "#4682B4") {
        const owned = RAILROAD_IDS.filter(id => targetPlayer.properties.includes(id)).length;
        groupStatus = `철도 ${owned}/4`;
      } else if (tile.color === "#808080") {
        const owned = UTILITY_IDS.filter(id => targetPlayer.properties.includes(id)).length;
        groupStatus = `관공서 ${owned}/2`;
      } else {
        const owned = getColorGroupOwned(targetPlayer, tile.color).length;
        const total = (COLOR_GROUPS[tile.color] || []).length;
        groupStatus = isMon ? "⭐ 독점" : `보유 ${owned}/${total}`;
      }

      const cardDiv = document.createElement("div");
      cardDiv.className = "monopoly-asset-card";
      
      const monClass = isMon ? " monopoly-owned" : "";
      
      cardDiv.innerHTML = `
        <div class="asset-card-color-bar" style="background-color: ${tile.color || '#ccc'}"></div>
        <div class="asset-card-content">
          <div class="asset-card-name">${escapeHtml(tile.name)}</div>
          <div class="asset-card-rent">통행료: ₩${getRent(tile, targetPlayer.position).toLocaleString()}</div>
          <div class="asset-card-group-status${monClass}">${groupStatus}</div>
        </div>
      `;
      grid.appendChild(cardDiv);
    });
  }

  function showHoverCard(tileId) {
    const tile = tileAt(tileId);
    if (!tile || tile.type === "corner" || tile.type === "event") return;

    const hoverCard = document.querySelector("#monopolyBoardHoverCard");
    if (!hoverCard) return;

    const header = hoverCard.querySelector("#hoverCardHeader");
    const priceEl = hoverCard.querySelector("#hoverCardPrice");
    const rent0El = hoverCard.querySelector("#hoverCardRent0");
    const rentMonEl = hoverCard.querySelector("#hoverCardRentMon");
    const ownerEl = hoverCard.querySelector("#hoverCardOwner");
    const ownerRow = hoverCard.querySelector("#hoverCardOwnerRow");

    // Reset styles
    hoverCard.style.background = "";
    hoverCard.classList.remove("has-bg-image");
    if (header) {
      header.textContent = tile.name;
      header.style.backgroundColor = tile.color || "#808080";
      header.style.display = "";
    }

    // Set custom backgrounds for scenic tiles
    const bgImage = SCENIC_BG_MAPPING[tile.name];
    if (bgImage) {
      hoverCard.style.background = `url('assets/monopoly/${bgImage}') no-repeat center center / cover`;
      hoverCard.classList.add("has-bg-image");
      if (header) header.style.display = "none";
    }

    if (priceEl) priceEl.textContent = `₩${(tile.price || 0).toLocaleString()}`;
    if (rent0El) rent0El.textContent = `₩${(tile.rent ? tile.rent[0] : 0).toLocaleString()}`;
    
    let rentMon = tile.rent ? (tile.rent[1] || tile.rent[0] * 2) : 0;
    if (rentMonEl) rentMonEl.textContent = `₩${rentMon.toLocaleString()}`;
    
    const owner = getOwner(tileId);
    if (owner) {
      ownerEl.textContent = owner.human ? "나" : owner.name;
      ownerEl.style.color = owner.tokenColor;
      ownerRow.style.display = "flex";
    } else {
      ownerEl.textContent = "없음";
      ownerEl.style.color = "var(--text-muted)";
      ownerRow.style.display = "flex";
    }

    hoverCard.classList.remove("hidden");
  }

  function hideHoverCard() {
    const hoverCard = document.querySelector("#monopolyBoardHoverCard");
    hoverCard?.classList.add("hidden");
  }

  function renderAllPropertiesList() {
    const listContainer = document.querySelector("#monopolyAllPropertiesList");
    if (!listContainer) return;

    listContainer.innerHTML = "";

    const groups = {};
    TILES.forEach((tile, index) => {
      if (tile.type !== "property") return;
      const color = tile.color || "other";
      if (!groups[color]) groups[color] = [];
      groups[color].push({ tile, index });
    });

    Object.keys(groups).forEach(color => {
      const groupTiles = groups[color];
      const groupDiv = document.createElement("div");
      groupDiv.className = "property-color-group";
      groupDiv.style.borderLeft = `4px solid ${color === 'other' ? '#808080' : color}`;
      
      let html = "";
      groupTiles.forEach(({ tile, index }) => {
        const owner = getOwner(index);
        let badge = "";
        let ownedClass = "unowned";
        
        if (owner) {
          badge = `<span class="property-badge" style="background-color: ${owner.tokenColor}">${owner.human ? '나' : owner.name[0]}</span>`;
          ownedClass = "owned";
        }
        
        html += `
          <div class="property-list-item ${ownedClass}" data-tile-index="${index}">
            <span class="property-item-name">${escapeHtml(tile.name)}</span>
            <div class="property-item-right">
              <span class="property-item-rent">₩${(tile.rent ? tile.rent[0] : 0).toLocaleString()}</span>
              ${badge}
            </div>
          </div>
        `;
      });
      groupDiv.innerHTML = html;
      listContainer.appendChild(groupDiv);
    });

    listContainer.querySelectorAll(".property-list-item").forEach(item => {
      const idx = parseInt(item.getAttribute("data-tile-index"), 10);
      item.addEventListener("mouseenter", () => showHoverCard(idx));
      item.addEventListener("mouseleave", hideHoverCard);
    });
  }

  function renderControls() {
    const p = activePlayer();
    const humanTurn = p?.human && !p.bankrupt && state.phase !== "finished";

    if (els.turnLabel) {
      els.turnLabel.textContent = state.phase === "finished"
        ? "게임 종료"
        : p ? playerDisplayName(p) : "-";
    }
    if (els.phaseLabel) {
      const labels = {
        idle: "게임 시작 대기",
        awaitRoll: "주사위를 굴리세요",
        rolled: "이동 완료",
        buyDecision: "구매 여부를 결정하세요",
        spaceTravel: "🚀 이동할 칸을 클릭하세요",
        jailed: `${p?.jailTurns || 0}턴 남음`,
        finished: "게임이 끝났습니다"
      };
      els.phaseLabel.textContent = labels[state.phase] || "-";
    }
    if (els.rollButton) {
      els.rollButton.disabled = !humanTurn || state.phase !== "awaitRoll" || state.diceRolling;
    }
    if (els.endTurnButton) {
      els.endTurnButton.disabled = !humanTurn || (state.phase !== "buyDecision" && state.phase !== "rolled");
    }
    if (els.manageButton) {
      els.manageButton.disabled = !humanTurn || !p?.properties.length;
    }
  }

  function renderPropertyInfo(tileId) {
    if (!els.propertyInfo) return;
    const tile = tileAt(tileId);
    if (!tile || tile.type !== "property") {
      els.propertyInfo.classList.add("hidden");
      return;
    }
    const owner = state.players.find(p => p.properties.includes(tileId));
    const colorGroupCount = tile.color === "#808080" || tile.color === "#4682B4"
      ? 0
      : (COLOR_GROUPS[tile.color] || []).filter(id => state.players.some(p => p.properties.includes(id))).length;

    let rentInfo = `기본 임대료: ₩${tile.rent[0].toLocaleString()}`;
    if (tile.rent.length > 1) {
      rentInfo += `<br>건축 단계: ${tile.rent.slice(1).map((r, i) => `Lv${i + 1}: ₩${r.toLocaleString()}`).join(", ")}`;
    }

    els.propertyInfo.innerHTML = `
      <h3><span style="display:inline-block;width:14px;height:14px;background:${tile.color};border-radius:3px;margin-right:6px"></span>${escapeHtml(tile.name)}</h3>
      <p>가격: ₩${tile.price.toLocaleString()}</p>
      <p>${rentInfo}</p>
      ${owner ? `<p style="color:${owner.tokenColor}">소유자: ${playerDisplayName(owner)}</p>` : "<p>소유자: 없음</p>"}
    `;
    els.propertyInfo.classList.remove("hidden");
  }

  function renderLog() {
    if (!els.log) return;
    els.log.innerHTML = state.log.map(m => `<li>${escapeHtml(m)}</li>`).join("");
  }

  function renderAll() {
    document.body.setAttribute("data-monopoly-phase", state.phase);
    renderBoard();
    renderPieces();
    renderPlayers();
    renderControls();
    renderLog();
    renderDice();
    renderMyAssets();
    renderAllPropertiesList();
  }

  /* ── Dice Animation (bouncy physics-style) ── */
  const DICE_BOUNCE_DURATION = 1400;
  const DICE_BOUNCE_FRAME_MS = 50;

  function rollDice() {
    return [Math.floor(Math.random() * 6) + 1, Math.floor(Math.random() * 6) + 1];
  }

  function animateDice(finalDice) {
    return new Promise(resolve => {
      state.dice = [];
      state.diceRolling = true;
      state.diceRollingStates = [true, true];
      renderDice();
      renderControls();
      const start = performance.now();
      const tick = () => {
        const elapsed = performance.now() - start;
        const stopTimes = [800, 1100];
        const duration = 1100;

        if (elapsed >= duration) {
          state.dice = finalDice;
          state.diceRolling = false;
          state.diceRollingStates = [false, false];
          renderDice();
          renderControls();
          resolve();
          return;
        }

        const tempRoll = rollDice();
        const currentDice = [...state.dice];
        const rollingStates = [true, true];

        for (let i = 0; i < 2; i++) {
          if (elapsed >= stopTimes[i]) {
            currentDice[i] = finalDice[i];
            rollingStates[i] = false;
          } else {
            currentDice[i] = tempRoll[i];
            rollingStates[i] = true;
          }
        }

        state.dice = currentDice;
        state.diceRollingStates = rollingStates;
        renderDice();

        // Slow down the random cycling as we approach the end
        const progress = elapsed / duration;
        const frameDelay = DICE_BOUNCE_FRAME_MS + progress * 100;
        setTimeout(tick, frameDelay);
      };
      setTimeout(tick, DICE_BOUNCE_FRAME_MS);
    });
  }

  /* ── Step-by-step Movement Animation ── */
  const STEP_MOVE_MS = 280;
  const STEP_BOUNCE_MS = 200;
  const STEP_PAUSE_MS = 80;

  function tileCenter(index) {
    const pos = tilePosition(index);
    return { x: pos.x + pos.w / 2, y: pos.y + pos.h / 2 };
  }

  async function animatePlayerMove(player, fromTile, toTile) {
    if (!els.piecesContainer) return;
    const piece = els.piecesContainer.querySelector(`.monopoly-piece[data-player-id="${player.id}"]`);
    const avatar = els.piecesContainer.querySelector(`.monopoly-board-turn-avatar[data-player-id="${player.id}"]`);
    if (!piece) return;

    const ox = parseFloat(piece.style.getPropertyValue("--piece-offset-x")) || 0;
    const oy = parseFloat(piece.style.getPropertyValue("--piece-offset-y")) || 0;

    const steps = [];
    let cur = fromTile;
    for (let i = 0; i < 40; i++) {
      cur = (cur + 1) % 40;
      steps.push(cur);
      if (cur === toTile) break;
    }

    for (let si = 0; si < steps.length; si++) {
      const stepTile = steps[si];
      const prevTile = si === 0 ? fromTile : steps[si - 1];
      const c = tileCenter(stepTile);
      const pc = tileCenter(prevTile);
      const dx = Math.abs(c.x - pc.x);
      const dy = Math.abs(c.y - pc.y);
      const direction = dx > dy ? "h" : "v";
      
      const targetLeft = `calc(${c.x}% + ${ox}%)`;
      const targetTop = `calc(${c.y}% + ${oy}%)`;

      // Trigger the bounce/hop simultaneously with the slide transition
      piece.classList.add(direction === "h" ? "bounce-h" : "bounce-v");
      if (avatar) avatar.classList.add(direction === "h" ? "bounce-h" : "bounce-v");

      piece.style.left = targetLeft;
      piece.style.top = targetTop;
      if (avatar) {
        avatar.style.left = targetLeft;
        avatar.style.top = targetTop;
      }
      
      // Wait for movement and keyframe animation (260ms duration + 20ms buffer)
      await wait(280);
      
      piece.classList.remove("bounce-h", "bounce-v");
      if (avatar) avatar.classList.remove("bounce-h", "bounce-v");
      
      // Brief pause between hops
      await wait(60);
    }
    // Sync CSS variables to final position
    const fc = tileCenter(toTile);
    piece.style.setProperty("--piece-x", `${fc.x}%`);
    piece.style.setProperty("--piece-y", `${fc.y}%`);
    piecePositions[player.id] = tilePosition(toTile);
  }

  async function animateTeleport(player, target) {
    if (!els.piecesContainer) return;
    const piece = els.piecesContainer.querySelector(`.monopoly-piece[data-player-id="${player.id}"]`);
    const avatar = els.piecesContainer.querySelector(`.monopoly-board-turn-avatar[data-player-id="${player.id}"]`);
    if (!piece) return;
    const ox = parseFloat(piece.style.getPropertyValue("--piece-offset-x")) || 0;
    const oy = parseFloat(piece.style.getPropertyValue("--piece-offset-y")) || 0;
    const c = tileCenter(target);
    const targetLeft = `calc(${c.x}% + ${ox}%)`;
    const targetTop = `calc(${c.y}% + ${oy}%)`;
    piece.style.left = targetLeft;
    piece.style.top = targetTop;
    piece.style.setProperty("--piece-x", `${c.x}%`);
    piece.style.setProperty("--piece-y", `${c.y}%`);
    if (avatar) {
      avatar.style.left = targetLeft;
      avatar.style.top = targetTop;
    }
    piecePositions[player.id] = tilePosition(target);
    await wait(300);
  }

  /* ── Card Decks ── */
  function drawChance() {
    if (!state.chanceDeck.length) state.chanceDeck = shuffle([...CHANCE_CARDS]);
    return state.chanceDeck.shift();
  }

  function drawFund() {
    if (!state.fundDeck.length) state.fundDeck = shuffle([...FUND_CARDS]);
    return state.fundDeck.shift();
  }

  /* ── Property Logic ── */
  function getOwner(tileId) {
    return state.players.find(p => p.properties.includes(tileId) && !p.bankrupt);
  }

  function getColorGroupOwned(player, color) {
    const group = COLOR_GROUPS[color] || [];
    return group.filter(id => player.properties.includes(id));
  }

  function isMonopoly(player, color) {
    const group = COLOR_GROUPS[color] || [];
    return group.length > 0 && group.every(id => player.properties.includes(id));
  }

  function isBuildableProperty(tile) {
    return tile?.type === "property" && tile.color !== "#808080" && tile.color !== "#4682B4";
  }

  function buildingLevel(player, tileId) {
    return Math.max(0, Math.min(MAX_BUILDING_LEVEL, Number(player?.buildings?.[tileId] || 0)));
  }

  function buildingLabel(level) {
    if (level >= MAX_BUILDING_LEVEL) return "호텔";
    return level > 0 ? `건물 Lv${level}` : "건물 없음";
  }

  function getBuildCost(tile) {
    return Math.max(50 * SCALE_FACTOR, Math.floor((tile?.price || 0) / 2));
  }

  function getBuildingSellValue(tile) {
    return Math.floor(getBuildCost(tile) / 2);
  }

  function getPropertySellValue(tile) {
    return Math.floor((tile?.price || 0) / 2);
  }

  function canBuildOn(player, tile) {
    if (!isBuildableProperty(tile)) return "공항/관공서는 건설할 수 없습니다.";
    if (!player.properties.includes(tile.id)) return "소유한 땅만 건설할 수 있습니다.";
    if (!isMonopoly(player, tile.color)) return "같은 색상 그룹을 모두 소유해야 건설할 수 있습니다.";

    const level = buildingLevel(player, tile.id);
    if (level >= MAX_BUILDING_LEVEL) return "이미 최대 단계입니다.";

    const groupLevels = (COLOR_GROUPS[tile.color] || []).map(id => buildingLevel(player, id));
    if (level > Math.min(...groupLevels)) return "같은 색상 그룹을 고르게 건설해야 합니다.";

    const cost = getBuildCost(tile);
    if (player.money < cost) return "잔액이 부족합니다.";
    return "";
  }

  function getTotalLiquidationValue(player) {
    return player.properties.reduce((sum, id) => {
      const tile = tileAt(id);
      return sum + getPropertySellValue(tile) + buildingLevel(player, id) * getBuildingSellValue(tile);
    }, 0);
  }

  function canPayWithLiquidation(player, amount) {
    return player.money + getTotalLiquidationValue(player) >= amount;
  }

  function getRent(tile, playerPosition) {
    if (tile.type !== "property") return 0;
    const owner = getOwner(tile.id);
    if (!owner) return 0;

    // Railroad
    if (tile.color === "#4682B4") {
      const owned = RAILROAD_IDS.filter(id => owner.properties.includes(id)).length;
      return 25 * SCALE_FACTOR * Math.pow(2, owned - 1); // 25, 50, 100, 200 scaled
    }
    // Utility
    if (tile.color === "#808080") {
      const owned = UTILITY_IDS.filter(id => owner.properties.includes(id)).length;
      const roll = state.rentDiceTotal || DEFAULT_UTILITY_DICE_TOTAL;
      return owned === 2 ? roll * 10 * SCALE_FACTOR : roll * 4 * SCALE_FACTOR;
    }
    // Regular property
    const level = buildingLevel(owner, tile.id);
    if (level > 0) {
      return tile.rent[Math.min(level, tile.rent.length - 1)] || tile.rent[tile.rent.length - 1];
    }
    const baseRent = tile.rent[0];
    if (isMonopoly(owner, tile.color)) {
      return baseRent * 2; // Monopoly doubles base rent
    }
    return baseRent;
  }

  /* ── Player Management ── */
  function sellBuildingForCash(player, tileId, quiet = false) {
    const tile = tileAt(tileId);
    const level = buildingLevel(player, tileId);
    if (level <= 0) return 0;
    const sellPrice = getBuildingSellValue(tile);
    player.buildings[tileId] = level - 1;
    player.money += sellPrice;
    if (!quiet) addLog(`🏗️ ${playerDisplayName(player)} ${tile.name} 건물 매각 (${buildingLabel(level)} → ${buildingLabel(level - 1)}, ₩${sellPrice.toLocaleString()})`);
    return sellPrice;
  }

  function sellPropertyForCash(player, tileId, quiet = false) {
    const idx = player.properties.indexOf(tileId);
    if (idx < 0) return 0;
    const tile = tileAt(tileId);
    const sellPrice = getPropertySellValue(tile);
    player.properties.splice(idx, 1);
    if (player.buildings) delete player.buildings[tileId];
    player.money += sellPrice;
    if (!quiet) addLog(`🏷️ ${playerDisplayName(player)} ${tile.name} 매각 (₩${sellPrice.toLocaleString()})`);
    return sellPrice;
  }

  function liquidateAssetsForPayment(player, amount) {
    if (!player || player.bankrupt || player.money >= amount) return;

    while (player.money < amount) {
      const buildingTileId = player.properties
        .filter(id => buildingLevel(player, id) > 0)
        .sort((a, b) => buildingLevel(player, b) - buildingLevel(player, a) || getBuildingSellValue(tileAt(b)) - getBuildingSellValue(tileAt(a)))[0];
      if (buildingTileId !== undefined) {
        sellBuildingForCash(player, buildingTileId);
        continue;
      }

      const propertyTileId = player.properties
        .filter(id => buildingLevel(player, id) === 0)
        .sort((a, b) => getPropertySellValue(tileAt(a)) - getPropertySellValue(tileAt(b)))[0];
      if (propertyTileId === undefined) break;
      sellPropertyForCash(player, propertyTileId);
    }
  }

  function payMoney(from, to, amount, options = {}) {
    const due = Math.max(0, amount || 0);
    if (options.allowLiquidation !== false) {
      liquidateAssetsForPayment(from, due);
    }
    const actual = Math.min(from.money, due);
    from.money -= actual;
    if (to && !to.bankrupt) {
      to.money += actual;
    } else if (options.toSocialFund) {
      state.socialFundPool += actual;
    }
    return actual;
  }

  function payBank(player, amount, options = {}) {
    return payMoney(player, null, amount, { ...options, toSocialFund: false });
  }

  function paySocialFund(player, amount, options = {}) {
    return payMoney(player, null, amount, { ...options, toSocialFund: true });
  }

  function collectMoney(player, amount) {
    player.money += amount;
  }

  function goBankrupt(player, creditor) {
    if (player.bankrupt) return;
    player.bankrupt = true;
    // Transfer properties to creditor
    if (creditor) {
      if (!creditor.buildings) creditor.buildings = {};
      player.properties.forEach(id => {
        const level = buildingLevel(player, id);
        if (level > 0) creditor.buildings[id] = level;
      });
      creditor.properties.push(...player.properties);
      creditor.properties.sort((a, b) => a - b);
    }
    player.properties = [];
    player.buildings = {};
    player.inJail = false;
    player.spaceTravelReady = false;
    addLog(`💀 ${playerDisplayName(player)} 파산!`);
  }

  /* ── Movement ── */
  function awardGoSalary(player) {
    collectMoney(player, GO_SALARY);
    addLog(`🏁 ${playerDisplayName(player)} 출발지를 지나 ₩${GO_SALARY.toLocaleString()} 획득!`);
  }

  function passesGoForward(oldPos, target) {
    return target < oldPos;
  }

  async function movePlayer(player, steps) {
    const oldPos = player.position;
    const newPos = (player.position + steps) % 40;
    // Pass GO
    if (newPos < oldPos && steps > 0) {
      awardGoSalary(player);
    }
    // Animate step by step
    await animatePlayerMove(player, oldPos, newPos);
    player.position = newPos;
  }

  async function teleportPlayer(player, target, passGo) {
    state.rentDiceTotal = 0;
    const oldPos = player.position;
    if (passGo && (target < oldPos || target === 0)) {
      awardGoSalary(player);
    }
    await animateTeleport(player, target);
    player.position = target;
  }

  /* ── Jail Logic ── */
  async function sendToJail(player) {
    state.rentDiceTotal = 0;
    await animateTeleport(player, 10);
    player.position = 10;
    player.inJail = true;
    player.jailTurns = JAIL_TURNS;
    state.lastDoubleCount = 0;
    addLog(`🏝️ ${playerDisplayName(player)} 무인도로 이동했습니다!`);
  }

  /* ── Event Handling ── */
  async function handleTileLanding(player) {
    const tile = tileAt(player.position);
    renderPropertyInfo(player.position);

    switch (tile.type) {
      case "property":
        await handlePropertyLanding(player, tile);
        break;
      case "event":
        await handleEventTile(player, tile);
        break;
      case "corner":
        await handleCornerTile(player, tile);
        break;
    }

    if (player.bankrupt && activePlayer() === player && state.phase !== "finished") {
      state.phase = "buyDecision";
      renderAll();
      await endTurn();
    }
  }

  function showPropertyPopup(player, tile) {
    return new Promise(resolve => {
      const dialog = document.querySelector("#monopolyPropertyDialog");
      if (!dialog) {
        resolve();
        return;
      }
      const header = dialog.querySelector("#monopolyPropertyHeader");
      const name = dialog.querySelector("#monopolyPropertyName");
      const priceEl = dialog.querySelector("#monopolyPropertyPrice");
      const rent0El = dialog.querySelector("#monopolyPropertyRent0");
      const rentMonEl = dialog.querySelector("#monopolyPropertyRentMon");
      const ownerEl = dialog.querySelector("#monopolyPropertyOwner");
      const footer = dialog.querySelector("#monopolyPropertyFooter");

      const popup = dialog.querySelector(".monopoly-property-popup");

      // Reset popup styles
      if (popup) {
        popup.style.background = "";
      }
      dialog.classList.remove("has-bg-image");
      if (header) {
        header.style.backgroundColor = tile.color || "#808080";
        header.style.display = "";
      }
      if (name) {
        name.textContent = tile.name;
        name.style.display = "";
      }

      // Set custom landing backgrounds for scenic tiles
      const bgImage = SCENIC_BG_MAPPING[tile.name];
      if (bgImage) {
        if (popup) popup.style.background = `url('assets/monopoly/${bgImage}') no-repeat center center / cover`;
        dialog.classList.add("has-bg-image");
        if (header) header.style.display = "none";
        if (name) name.style.display = "none"; // Gold text already on image
      }

      if (priceEl) priceEl.textContent = `₩${(tile.price || 0).toLocaleString()}`;
      if (rent0El) rent0El.textContent = `₩${(tile.rent ? tile.rent[0] : 0).toLocaleString()}`;
      
      const rentMon = tile.rent ? (tile.rent[1] || tile.rent[0] * 2) : 0;
      if (rentMonEl) rentMonEl.textContent = `₩${rentMon.toLocaleString()}`;

      const owner = getOwner(tile.id);
      if (owner) {
        ownerEl.textContent = owner.human ? "나" : owner.name;
        ownerEl.style.color = owner.tokenColor;
      } else {
        ownerEl.textContent = "없음";
        ownerEl.style.color = "var(--text-muted)";
      }

      footer.innerHTML = "";

      let settled = false;
      const preventCancel = (event) => event.preventDefault();
      const closeDialog = () => {
        if (settled) return;
        settled = true;
        dialog.removeEventListener("cancel", preventCancel);
        if (dialog.open) dialog.close();
        renderAll();
        resolve();
      };

      if (owner && owner !== player) {
        // Rent payment
        const rent = getRent(tile, player.position);
        const payBtn = document.createElement("button");
        payBtn.className = "primary-button";
        payBtn.type = "button";
        payBtn.textContent = `임대료 지불 (₩${rent.toLocaleString()})`;
        payBtn.addEventListener("click", () => {
          const paid = payMoney(player, owner, rent);
          addLog(`💸 ${playerDisplayName(player)} → ${playerDisplayName(owner)} 임대료 ₩${paid.toLocaleString()} 지불 (${tile.name})`);
          if (player.money <= 0) {
            goBankrupt(player, owner);
          }
          closeDialog();
        });
        footer.appendChild(payBtn);
      } else if (!owner) {
        // Buy or pass
        const buyBtn = document.createElement("button");
        buyBtn.className = "primary-button";
        buyBtn.type = "button";
        buyBtn.textContent = `구매 (₩${tile.price.toLocaleString()})`;
        if (player.money < tile.price) {
          buyBtn.disabled = true;
          buyBtn.textContent = "잔액 부족";
        }

        const passBtn = document.createElement("button");
        passBtn.className = "secondary-button";
        passBtn.type = "button";
        passBtn.textContent = "구매 안 하기";

        buyBtn.addEventListener("click", () => {
          buyProperty(player);
          closeDialog();
        });

        passBtn.addEventListener("click", () => {
          addLog(`🚫 ${playerDisplayName(player)} ${tile.name} 구매를 포기.`);
          closeDialog();
        });

        footer.appendChild(buyBtn);
        footer.appendChild(passBtn);
      } else {
        // Own property
        const okBtn = document.createElement("button");
        okBtn.className = "primary-button";
        okBtn.type = "button";
        okBtn.textContent = "확인";
        okBtn.addEventListener("click", closeDialog);
        footer.appendChild(okBtn);

        addLog(`📍 ${playerDisplayName(player)} 자기 땅 ${tile.name}에 도착.`);
      }

      dialog.addEventListener("cancel", preventCancel);
      dialog.showModal();
    });
  }

  async function handlePropertyLanding(player, tile) {
    if (!player.human) {
      // AI: 팝업 없이 자동 구매 판단 (사람이 취소할 수 없도록)
      await aiBuyDecision(player, tile);
      return;
    }
    await showPropertyPopup(player, tile);
    state.phase = "buyDecision";
    renderControls();
  }

  async function handleEventTile(player, tile) {
    let card;
    let isChance = false;
    if (tile.event === "chance") {
      card = drawChance();
      isChance = true;
      addLog(`🔑 황금열쇠 카드: ${card.text}`);
    } else if (tile.event === "fund") {
      card = drawFund();
      isChance = false;
      addLog(`🎴 사회복지기금 카드: ${card.text}`);
    } else if (tile.event === "tax") {
      const tax = tile.amount ?? (100 * SCALE_FACTOR);
      if (tile.id === 38) {
        paySocialFund(player, tax);
        addLog(`💸 ${playerDisplayName(player)} 특별여행세 ₩${tax.toLocaleString()} 지불 (사회복지기금 적립)`);
      } else {
        payBank(player, tax);
        addLog(`💸 ${playerDisplayName(player)} 세금 ₩${tax.toLocaleString()} 지불`);
      }
      if (player.money <= 0) goBankrupt(player, null);
      state.phase = "buyDecision";
      renderControls();
      return;
    }

    if (!card) {
      state.phase = "buyDecision";
      renderControls();
      return;
    }

    await showCardPopup(player, card, isChance);
  }

  function showCardPopup(player, card, isChance) {
    return new Promise(resolve => {
      if (!player.human) {
        wait(500)
          .then(() => executeCard(player, card))
          .then(() => {
            renderAll();
            resolve();
          });
        return;
      }

      const dialog = document.querySelector("#monopolyCardDialog");
      const popup = dialog?.querySelector(".monopoly-card-popup");
      const header = document.querySelector("#monopolyCardHeader");
      const icon = document.querySelector("#monopolyCardIcon");
      const text = document.querySelector("#monopolyCardText");
      const btn = document.querySelector("#monopolyCardActionButton");

      if (!dialog || !popup || !header || !icon || !text || !btn) {
        executeCard(player, card).then(resolve);
        return;
      }

      if (isChance) {
        popup.className = "monopoly-card-popup chance-card";
        header.textContent = "황금열쇠";
        icon.textContent = "🔑";
      } else {
        popup.className = "monopoly-card-popup fund-card";
        header.textContent = "사회복지기금";
        icon.textContent = "🎴";
      }

      text.textContent = card.text;

      let buttonText = "확인";
      const isPayAction = card.action === "pay" || card.action === "payAll" || card.action === "buildingCost";
      
      if (isPayAction) {
        let payAmount = 0;
        if (card.action === "pay") {
          payAmount = card.amount;
        } else if (card.action === "payAll") {
          payAmount = card.amount * state.players.filter(p => p !== player && !p.bankrupt).length;
        } else if (card.action === "buildingCost") {
          const costInfo = player.properties.reduce((sum, id) => {
            const level = buildingLevel(player, id);
            if (level >= MAX_BUILDING_LEVEL) sum.hotels += 1;
            else sum.houses += level;
            return sum;
          }, { houses: 0, hotels: 0 });
          payAmount = costInfo.houses * card.house + costInfo.hotels * card.hotel;
        }
        buttonText = payAmount > 0 ? `지불하기 (₩${payAmount.toLocaleString()})` : "지불하기";
      } else if (card.action === "collect" || card.action === "collectAll") {
        buttonText = "수령하기";
      }

      btn.textContent = buttonText;

      let settled = false;
      const preventCancel = (event) => event.preventDefault();
      const handleConfirm = () => {
        if (settled) return;
        settled = true;
        btn.removeEventListener("click", handleConfirm);
        dialog.removeEventListener("cancel", preventCancel);
        if (dialog.open) dialog.close();
        executeCard(player, card).then(() => {
          renderAll();
          resolve();
        });
      };

      btn.addEventListener("click", handleConfirm);
      dialog.addEventListener("cancel", preventCancel);
      dialog.showModal();
    });
  }

  async function executeCard(player, card) {
    switch (card.action) {
      case "moveTo":
        await teleportPlayer(player, card.target, card.collect);
        renderAll();
        await wait(500);
        await handleTileLanding(player);
        return;
      case "goToJail":
        await sendToJail(player);
        renderAll();
        state.phase = "buyDecision";
        renderControls();
        return;
      case "collect":
        collectMoney(player, card.amount);
        addLog(`💰 ${playerDisplayName(player)} ₩${card.amount.toLocaleString()} 획득`);
        break;
      case "pay":
        paySocialFund(player, card.amount);
        addLog(`💸 ${playerDisplayName(player)} ₩${card.amount.toLocaleString()} 지불 (사회복지기금 적립)`);
        if (player.money <= 0) goBankrupt(player, null);
        break;
      case "payAll":
        state.players.filter(p => p !== player && !p.bankrupt).forEach(op => {
          payMoney(player, op, card.amount);
        });
        addLog(`💸 ${playerDisplayName(player)} 모든 플레이어에게 ₩${card.amount.toLocaleString()} 지불`);
        if (player.money <= 0) goBankrupt(player, null);
        break;
      case "collectAll":
        state.players.filter(p => p !== player && !p.bankrupt).forEach(op => {
          payMoney(op, player, card.amount);
          if (op.money <= 0) goBankrupt(op, player);
        });
        addLog(`💰 ${playerDisplayName(player)} 모든 플레이어에게서 ₩${card.amount.toLocaleString()} 수집`);
        break;
      case "buildingCost": {
        const costInfo = player.properties.reduce((sum, id) => {
          const level = buildingLevel(player, id);
          if (level >= MAX_BUILDING_LEVEL) sum.hotels += 1;
          else sum.houses += level;
          return sum;
        }, { houses: 0, hotels: 0 });
        const cost = costInfo.houses * card.house + costInfo.hotels * card.hotel;
        payBank(player, cost);
        if (cost > 0) addLog(`💸 ${playerDisplayName(player)} 건설비용 ₩${cost.toLocaleString()} 지불`);
        if (player.money <= 0) goBankrupt(player, null);
        break;
      }
    }
    state.phase = "buyDecision";
    renderAll();
    renderControls();
  }

  async function handleCornerTile(player, tile) {
    switch (tile.corner) {
      case "go":
        addLog(`🏁 ${playerDisplayName(player)} 출발지에 도착.`);
        break;
      case "jail":
        addLog(`🔒 ${playerDisplayName(player)} 무인도에 방문 중.`);
        break;
      case "fund":
        if (state.socialFundPool > 0) {
          const reward = state.socialFundPool;
          collectMoney(player, reward);
          addLog(`💰 ${playerDisplayName(player)} 사회복지기금 수령! 적립금 ₩${reward.toLocaleString()} 획득!`);
          state.socialFundPool = 0;
        } else {
          addLog(`💰 ${playerDisplayName(player)} 사회복지기금 수령처에 도착했으나 적립금이 없습니다.`);
        }
        break;
      case "parking":
        player.spaceTravelReady = true;
        addLog(`🚀 ${playerDisplayName(player)} 우주여행 정류소에 도착! 다음 턴에 원하는 칸으로 이동할 수 있습니다.`);
        break;
    }
    state.phase = "buyDecision";
    renderAll();
    renderControls();
  }

  /* ── Buy Property ── */
  function buyProperty(player) {
    const tile = tileAt(player.position);
    if (tile.type !== "property" || getOwner(tile.id)) return;
    if (player.money < tile.price) {
      addLog(`💸 ${playerDisplayName(player)} 잔액 부족으로 구매 불가.`);
      return;
    }
    player.money -= tile.price;
    player.properties.push(tile.id);
    player.properties.sort((a, b) => a - b);
    if (!player.buildings) player.buildings = {};
    player.buildings[tile.id] = 0;
    addLog(`🏠 ${playerDisplayName(player)} ${tile.name} 구매! (₩${tile.price.toLocaleString()})`);

    // Show purchase popup notice
    setTimeout(() => {
      showNotice(`🏠 <strong>${playerDisplayName(player)}</strong>이(가)<br><strong>${tile.name}</strong>을(를) 구입했습니다!`, 1500);
    }, 100);

    // Check monopoly
    if (tile.color !== "#808080" && tile.color !== "#4682B4" && isMonopoly(player, tile.color)) {
      addLog(`⭐ ${playerDisplayName(player)} ${tile.name} 색상 독점!`);
    }
  }

  /* ── AI Logic ── */
  async function aiBuyDecision(player, tile) {
    if (tile.type !== "property") {
      state.phase = "buyDecision";
      renderAll();
      await endTurn();
      return;
    }

    const owner = getOwner(tile.id);
    if (owner && owner !== player) {
      const rent = getRent(tile, player.position);
      const paid = payMoney(player, owner, rent);
      addLog(`💸 ${playerDisplayName(player)} → ${playerDisplayName(owner)} 임대료 ₩${paid.toLocaleString()} 지불 (${tile.name})`);
      if (player.money <= 0) {
        goBankrupt(player, owner);
      }
      state.phase = "buyDecision";
      renderAll();
      await endTurn();
      return;
    }

    if (owner === player) {
      addLog(`📍 ${playerDisplayName(player)} 자기 땅 ${tile.name}에 도착.`);
      state.phase = "buyDecision";
      renderAll();
      await endTurn();
      return;
    }

    // AI buys if affordable and money > 200 * SCALE_FACTOR (keep reserve)
    if (player.money >= tile.price + 200 * SCALE_FACTOR || player.money >= tile.price && state.turnCount > 15) {
      buyProperty(player);
    } else {
      addLog(`🚫 ${playerDisplayName(player)} ${tile.name} 구매를 포기.`);
    }
    state.phase = "buyDecision";
    renderAll();
    await endTurn();
  }

  async function runAiTurn() {
    clearAiTimer();
    const player = activePlayer();
    if (!player || player.human || player.bankrupt || state.phase === "finished") return;

    // Jail logic
    if (player.inJail) {
      const unownedCount = TILES.filter(t => t.type === "property" && !getOwner(t.id)).length;
      const hasPlentyMoney = player.money >= JAIL_FINE + 1000 * SCALE_FACTOR;

      if (hasPlentyMoney && unownedCount > 3) {
        player.inJail = false;
        payBank(player, JAIL_FINE);
        addLog(`💸 ${playerDisplayName(player)} 벌금 ₩${JAIL_FINE.toLocaleString()} 내고 무인도 탈출.`);
        renderAll();
        // Continue to roll normally below!
      } else {
        const dice = rollDice();
        await animateDice(dice);
        state.rentDiceTotal = dice[0] + dice[1];
        player.jailTurns--;
        if (dice[0] === dice[1]) {
          player.inJail = false;
          state.suppressDoubleExtraTurn = true;
          addLog(`🎲 ${playerDisplayName(player)} 더블로 탈옥! (${dice[0]}+${dice[1]})`);
          await movePlayer(player, dice[0] + dice[1]);
          await wait(600);
          await handleTileLanding(player);
          if (activePlayer() === player && state.phase === "buyDecision") {
            await endTurn();
          }
          return;
        } else if (player.jailTurns <= 0) {
          player.inJail = false;
          payBank(player, JAIL_FINE);
          addLog(`💸 ${playerDisplayName(player)} 벌금 ₩${JAIL_FINE.toLocaleString()} 내고 출소.`);
          await movePlayer(player, dice[0] + dice[1]);
          await wait(600);
          await handleTileLanding(player);
          if (activePlayer() === player && state.phase === "buyDecision") {
            await endTurn();
          }
          return;
        } else {
          addLog(`🔒 ${playerDisplayName(player)} 구금 중 (${player.jailTurns}턴 남음)`);
          await endTurn();
          return;
        }
      }
    }

    // Roll dice
    const dice = rollDice();
    await animateDice(dice);
    state.rentDiceTotal = dice[0] + dice[1];
    state.suppressDoubleExtraTurn = false;

    // Doubles
    if (dice[0] === dice[1]) {
      state.lastDoubleCount++;
      addLog(`🎲 ${playerDisplayName(player)} 더블! (${dice[0]}+${dice[1]})`);
      if (state.lastDoubleCount >= 3) {
        await sendToJail(player);
        state.lastDoubleCount = 0;
        await endTurn();
        return;
      }
    } else {
      state.lastDoubleCount = 0;
    }

    await movePlayer(player, dice[0] + dice[1]);
    addLog(`🎲 ${playerDisplayName(player)} ${dice[0]}+${dice[1]}=${dice[0] + dice[1]} → ${tileAt(player.position).name}`);
    renderAll();
    await wait(600);
    await handleTileLanding(player);
    if (activePlayer() === player && state.phase === "buyDecision") {
      await endTurn();
    }
  }

  /* ── Turn Flow ── */
  function clearAiTimer() {
    if (state.aiTimer) {
      clearTimeout(state.aiTimer);
      state.aiTimer = 0;
    }
  }

  function nextPlayerIndex(from) {
    for (let i = 1; i <= state.players.length; i++) {
      const idx = (from + i) % state.players.length;
      if (!state.players[idx].bankrupt) return idx;
    }
    return from;
  }

  function checkWinner() {
    const alive = state.players.filter(p => !p.bankrupt);
    if (alive.length <= 1) {
      const winner = alive[0];
      if (winner) {
        addLog(`🏆 ${playerDisplayName(winner)} 승리!`);
        state.phase = "finished";
        renderAll();
        return true;
      }
    }
    return false;
  }

  async function endTurn() {
    if (state.phase === "finished") return;
    if (checkWinner()) return;

    const p = activePlayer();
    // Doubles = extra turn
    if (state.dice[0] === state.dice[1] && !state.suppressDoubleExtraTurn && !p.inJail && !p.bankrupt && state.lastDoubleCount < 3) {
      addLog(`🔄 ${playerDisplayName(p)} 더블로 한 번 더!`);
      showTurnToast(p, true);
      await wait(1200);
      state.phase = "awaitRoll";
      renderAll();
      if (!p.human) scheduleAiTurn();
      return;
    }

    const next = nextPlayerIndex(state.currentPlayer);
    state.currentPlayer = next;
    state.turnCount++;
    state.lastDoubleCount = 0;
    state.suppressDoubleExtraTurn = false;
    state.rentDiceTotal = 0;
    const np = activePlayer();
    if (np.bankrupt) {
      await endTurn();
      return;
    }

    // Show turn change notice popup
    showTurnToast(np);
    await wait(1200);

    if (np.spaceTravelReady) {
      state.phase = "spaceTravel";
      renderAll();
      if (np.human) {
        if (typeof window.showCenterToast === "function") {
          window.showCenterToast("🚀 우주여행 차례! 이동할 칸을 클릭하세요.", 3000, { mode: "monopoly" });
        } else {
          addLog("🚀 우주여행 차례입니다. 이동하고 싶은 칸을 클릭하세요!");
        }
      } else {
        scheduleAiSpaceTravel();
      }
      return;
    }

    state.phase = "awaitRoll";
    renderAll();
    if (!np.human) scheduleAiTurn();
  }

  function scheduleAiTurn() {
    clearAiTimer();
    if (state.phase === "finished") return;
    state.aiTimer = setTimeout(runAiTurn, AI_THINK_DELAY);
  }

  function scheduleAiSpaceTravel() {
    clearAiTimer();
    if (state.phase === "finished") return;
    state.aiTimer = setTimeout(runAiSpaceTravel, AI_THINK_DELAY);
  }

  async function executeSpaceTravel(player, destIndex) {
    state.phase = "rolled"; // Lock actions
    player.spaceTravelReady = false;
    state.rentDiceTotal = 0;
    
    addLog(`🚀 ${playerDisplayName(player)} 우주선 탑승! ${tileAt(destIndex).name}으로 이동합니다.`);
    
    // Pass GO logic during Space Travel
    if (passesGoForward(player.position, destIndex)) {
      awardGoSalary(player);
    }
    
    await animateTeleport(player, destIndex);
    player.position = destIndex;
    renderAll();
    await wait(800);
    await handleTileLanding(player);
    renderControls();
  }

  async function runAiSpaceTravel() {
    const player = activePlayer();
    if (!player || player.human || !player.spaceTravelReady) return;
    
    let dest = 0;
    // AI chooses the most expensive unowned property it can afford, otherwise goes to GO (0)
    const affordables = TILES.filter(t => t.type === "property" && !getOwner(t.id) && player.money >= t.price)
                             .sort((a, b) => b.price - a.price);
    if (affordables.length > 0) {
      dest = affordables[0].id;
    }
    
    await executeSpaceTravel(player, dest);
    
    if (activePlayer() === player && state.phase === "buyDecision") {
      await endTurn();
    }
  }

  function showNotice(message, duration = 1200) {
    return new Promise(resolve => {
      const dialog = document.querySelector("#monopolyNoticeDialog");
      const text = document.querySelector("#monopolyNoticeText");
      const btn = document.querySelector("#monopolyNoticeButton");
      if (!dialog || !text || !btn) {
        resolve();
        return;
      }
      text.innerHTML = message;
      dialog.showModal();

      let timeoutId;
      const closeNotice = () => {
        btn.removeEventListener("click", closeNotice);
        clearTimeout(timeoutId);
        if (dialog.open) dialog.close();
        resolve();
      };

      btn.addEventListener("click", closeNotice);
      timeoutId = setTimeout(closeNotice, duration);
    });
  }

  function showJailEscapePopup(player) {
    return new Promise(resolve => {
      if (!els.jailDialog || !els.jailTurnsLabel || !els.jailFineLabel || !els.jailFooter) {
        resolve("roll");
        return;
      }

      els.jailTurnsLabel.textContent = player.jailTurns;
      els.jailFineLabel.textContent = `₩${JAIL_FINE.toLocaleString()}`;
      els.jailFooter.innerHTML = "";

      const rollBtn = document.createElement("button");
      rollBtn.className = "primary-button";
      rollBtn.type = "button";
      rollBtn.textContent = "🎲 주사위 굴리기 (더블 시도)";
      rollBtn.addEventListener("click", () => {
        els.jailDialog.close();
        resolve("roll");
      });

      const payBtn = document.createElement("button");
      payBtn.className = "secondary-button";
      payBtn.type = "button";
      payBtn.textContent = `💸 벌금 지불 (₩${JAIL_FINE.toLocaleString()})`;
      if (!canPayWithLiquidation(player, JAIL_FINE)) {
        payBtn.disabled = true;
        payBtn.textContent = "잔액 부족";
      }
      payBtn.addEventListener("click", () => {
        els.jailDialog.close();
        resolve("pay");
      });

      els.jailFooter.appendChild(rollBtn);
      els.jailFooter.appendChild(payBtn);

      els.jailDialog.showModal();
    });
  }

  /* ── Human Actions ── */
  async function humanRoll() {
    const player = activePlayer();
    if (!player?.human || state.phase !== "awaitRoll" || state.diceRolling) return;

    // Jail logic
    if (player.inJail) {
      const choice = await showJailEscapePopup(player);
      if (choice === "pay") {
        player.inJail = false;
        payBank(player, JAIL_FINE);
        addLog(`💸 벌금 ₩${JAIL_FINE.toLocaleString()} 내고 무인도 탈출.`);
        renderAll();
        // Continue to normal roll below!
      } else {
        const dice = rollDice();
        await animateDice(dice);
        state.rentDiceTotal = dice[0] + dice[1];
        player.jailTurns--;
        if (dice[0] === dice[1]) {
          player.inJail = false;
          state.suppressDoubleExtraTurn = true;
          addLog(`🎲 더블로 탈옥! (${dice[0]}+${dice[1]})`);
          await movePlayer(player, dice[0] + dice[1]);
          await wait(600);
          await handleTileLanding(player);
          return;
        } else if (player.jailTurns <= 0) {
          player.inJail = false;
          payBank(player, JAIL_FINE);
          addLog(`💸 벌금 ₩${JAIL_FINE.toLocaleString()} 내고 출소.`);
          await movePlayer(player, dice[0] + dice[1]);
          await wait(600);
          await handleTileLanding(player);
          return;
        } else {
          addLog(`🔒 무인도 구금 중 (${player.jailTurns}턴 남음)`);
          state.phase = "buyDecision";
          renderAll();
          renderControls();
          return;
        }
      }
    }

    const dice = rollDice();
    await animateDice(dice);
    state.rentDiceTotal = dice[0] + dice[1];
    state.suppressDoubleExtraTurn = false;

    if (dice[0] === dice[1]) {
      state.lastDoubleCount++;
      addLog(`🎲 더블! (${dice[0]}+${dice[1]})`);
      if (state.lastDoubleCount >= 3) {
        await sendToJail(player);
        state.lastDoubleCount = 0;
        state.phase = "buyDecision";
        renderAll();
        renderControls();
        return;
      }
    } else {
      state.lastDoubleCount = 0;
    }

    await movePlayer(player, dice[0] + dice[1]);
    addLog(`🎲 ${dice[0]}+${dice[1]}=${dice[0] + dice[1]} → ${tileAt(player.position).name}`);
    state.phase = "rolled";
    renderAll();
    await wait(400);
    await handleTileLanding(player);
    renderControls();
  }


  async function humanEndTurn() {
    const player = activePlayer();
    if (!player?.human) return;
    await endTurn();
  }

  /* ── Manage Dialog ── */
  function openManageDialog() {
    const player = activePlayer();
    if (!player?.human || !player.properties.length) return;
    if (!els.manageDialog || !els.manageList) return;

    els.manageList.innerHTML = player.properties.map(id => {
      const tile = tileAt(id);
      const rent = getRent(tile, player.position);
      const level = buildingLevel(player, id);
      const buildBlockReason = canBuildOn(player, tile);
      const canBuild = !buildBlockReason;
      const canSellBuilding = level > 0;
      const buildCost = getBuildCost(tile);
      const buildingSellPrice = getBuildingSellValue(tile);
      const propertySellPrice = getPropertySellValue(tile);
      return `
        <div class="monopoly-manage-item" data-tile-id="${id}">
          <div class="monopoly-manage-item-info">
            <span class="monopoly-manage-color" style="background:${tile.color}"></span>
            <span>
              <span class="monopoly-manage-item-name">${escapeHtml(tile.name)}</span><br>
              <span class="monopoly-manage-item-rent">임대료: ₩${rent.toLocaleString()} · ${buildingLabel(level)}</span>
            </span>
          </div>
          <div class="monopoly-manage-actions">
            <button class="monopoly-manage-build-btn" type="button" data-build-id="${id}" ${canBuild ? "" : "disabled"} title="${escapeHtml(buildBlockReason || "건설")}">건설 (₩${buildCost.toLocaleString()})</button>
            <button class="monopoly-manage-sell-building-btn" type="button" data-sell-building-id="${id}" ${canSellBuilding ? "" : "disabled"}>건물 매각 (₩${buildingSellPrice.toLocaleString()})</button>
            <button class="monopoly-manage-sell-btn" type="button" data-sell-id="${id}" ${level > 0 ? "disabled" : ""}>땅 매각 (₩${propertySellPrice.toLocaleString()})</button>
          </div>
        </div>
      `;
    }).join("");

    els.manageList.querySelectorAll(".monopoly-manage-build-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const tileId = Number(btn.dataset.buildId);
        buildProperty(player, tileId);
        openManageDialog();
      });
    });

    els.manageList.querySelectorAll(".monopoly-manage-sell-building-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const tileId = Number(btn.dataset.sellBuildingId);
        sellBuilding(player, tileId);
        openManageDialog();
      });
    });

    els.manageList.querySelectorAll(".monopoly-manage-sell-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const tileId = Number(btn.dataset.sellId);
        sellProperty(player, tileId);
        openManageDialog(); // Refresh
      });
    });

    if (typeof els.manageDialog.showModal === "function" && !els.manageDialog.open) {
      els.manageDialog.showModal();
    }
  }

  function buildProperty(player, tileId) {
    const tile = tileAt(tileId);
    const reason = canBuildOn(player, tile);
    if (reason) {
      addLog(`🚧 ${tile.name} 건설 불가: ${reason}`);
      renderAll();
      return;
    }

    const cost = getBuildCost(tile);
    player.money -= cost;
    player.buildings[tileId] = buildingLevel(player, tileId) + 1;
    addLog(`🏗️ ${playerDisplayName(player)} ${tile.name} ${buildingLabel(player.buildings[tileId])} 건설 (₩${cost.toLocaleString()})`);
    renderAll();
  }

  function sellBuilding(player, tileId) {
    if (buildingLevel(player, tileId) <= 0) return;
    sellBuildingForCash(player, tileId);
    renderAll();
  }

  function sellProperty(player, tileId) {
    const tile = tileAt(tileId);
    if (buildingLevel(player, tileId) > 0) {
      addLog(`🚧 ${tile.name}의 건물을 먼저 매각해야 땅을 팔 수 있습니다.`);
      renderAll();
      return;
    }
    sellPropertyForCash(player, tileId);
    renderAll();
  }

  /* ── Game Start ── */
  function startGame() {
    clearAiTimer();
    const count = Math.min(4, Math.max(2, Number(els.playerCount?.value || 3)));
    const humanName = currentHumanNickname() || (els.nameInput?.value || "").trim() || "플레이어";
    const pool = shuffle(aiProfiles());

    state.players = Array.from({ length: count }, (_, i) => {
      if (i === 0) {
        return {
          index: i,
          id: "human",
          human: true,
          name: humanName,
          avatarUrl: currentHumanAvatarUrl(),
          emoji: TOKEN_EMOJIS[i],
          tokenColor: TOKEN_COLORS[i],
          money: START_MONEY,
          position: 0,
          properties: [],
          buildings: {},
          inJail: false,
          jailTurns: 0,
          spaceTravelReady: false,
          bankrupt: false
        };
      }
      const profile = pool[i - 1] || { name: `AI ${i}`, avatarUrl: profileImageUrl("보통-건일.jpg") };
      return {
        index: i,
        id: `ai${i}`,
        human: false,
        name: profile.name || `AI ${i}`,
        avatarUrl: profile.avatarUrl,
        emoji: TOKEN_EMOJIS[i],
        tokenColor: TOKEN_COLORS[i],
        money: START_MONEY,
        position: 0,
        properties: [],
        buildings: {},
        inJail: false,
        jailTurns: 0,
        spaceTravelReady: false,
        bankrupt: false
      };
    });

    state.currentPlayer = 0;
    state.selectedAssetPlayerIndex = 0;
    state.phase = "awaitRoll";
    state.dice = [];
    state.diceRolling = false;
    state.chanceDeck = shuffle([...CHANCE_CARDS]);
    state.fundDeck = shuffle([...FUND_CARDS]);
    state.log = [];
    state.turnCount = 1;
    state.lastDoubleCount = 0;
    state.socialFundPool = 0;
    state.rentDiceTotal = 0;
    state.suppressDoubleExtraTurn = false;

    addLog(`🌐 부루마불 게임 시작! ${count}명 참가.`);
    addLog(`💰 각 플레이어 ₩${START_MONEY.toLocaleString()} 보유.`);

    document.body.classList.add("monopoly-playing");
    els.setupPanel?.classList.add("hidden");
    els.gamePanel?.classList.remove("hidden");
    renderAll();
    const firstPlayer = state.players[0];
    // Show first turn popup notice
    setTimeout(() => {
      showTurnToast(firstPlayer);
    }, 400);
  }

  function resetToSetup() {
    clearAiTimer();
    document.body.classList.remove("monopoly-playing");
    document.body.classList.add("monopoly-active");
    els.gamePanel?.classList.add("hidden");
    els.setupPanel?.classList.remove("hidden");
    state.phase = "idle";
    state.rentDiceTotal = 0;
    state.suppressDoubleExtraTurn = false;
  }

  /* ── Center Toast (Turn Popups) ── */
  function showTurnToast(player, isDouble = false) {
    if (typeof window.showCenterToast !== "function") return;
    const emoji = player.human ? "🎲" : "🤖";
    const displayName = player.human
      ? "당신의 차례입니다"
      : `${player.name}(${TOKEN_NAMES[player.index]})의 차례`;

    const message = isDouble
      ? `<div style="font-size: 13px; opacity: 0.9; margin-bottom: 4px; color: #ffeb3b; font-weight: bold; letter-spacing: 1px;">(더블 추가 턴!)</div>${emoji} ${displayName}`
      : `${emoji} ${displayName}입니다!`;

    window.showCenterToast(message, 1200, { mode: "monopoly" });
  }

  /* ── Zoom Controls ── */
  const MONOPOLY_ZOOM_STORAGE_KEY = "fantasyR.monopolyZoomPercent";
  const MONOPOLY_ZOOM_MIN_PERCENT = 70;
  const MONOPOLY_ZOOM_MAX_PERCENT = 200;
  const MONOPOLY_ZOOM_STEP_PERCENT = 10;
  let monopolyZoomPercent = 100;

  function loadMonopolyZoomPercent() {
    try {
      const saved = window.localStorage.getItem(MONOPOLY_ZOOM_STORAGE_KEY);
      const numeric = parseInt(saved, 10);
      return (!isNaN(numeric) && numeric >= MONOPOLY_ZOOM_MIN_PERCENT && numeric <= MONOPOLY_ZOOM_MAX_PERCENT)
        ? numeric
        : 100;
    } catch {
      return 100;
    }
  }

  function saveMonopolyZoomPercent(percent) {
    try {
      window.localStorage.setItem(MONOPOLY_ZOOM_STORAGE_KEY, String(percent));
    } catch {}
  }

  function renderMonopolyZoomControls() {
    if (els.gamePanel) {
      els.gamePanel.style.setProperty("--monopoly-ui-zoom", String(monopolyZoomPercent / 100));
    }
    if (els.zoomLabel) {
      els.zoomLabel.textContent = `${monopolyZoomPercent}%`;
    }
    if (els.zoomOutButton) {
      els.zoomOutButton.disabled = monopolyZoomPercent <= MONOPOLY_ZOOM_MIN_PERCENT;
    }
    if (els.zoomInButton) {
      els.zoomInButton.disabled = monopolyZoomPercent >= MONOPOLY_ZOOM_MAX_PERCENT;
    }
  }

  function setMonopolyZoomPercent(percent, persist = true) {
    monopolyZoomPercent = Math.max(MONOPOLY_ZOOM_MIN_PERCENT, Math.min(MONOPOLY_ZOOM_MAX_PERCENT, Math.round(percent / MONOPOLY_ZOOM_STEP_PERCENT) * MONOPOLY_ZOOM_STEP_PERCENT));
    renderMonopolyZoomControls();
    if (persist) saveMonopolyZoomPercent(monopolyZoomPercent);
  }

  function adjustMonopolyZoom(delta) {
    setMonopolyZoomPercent(monopolyZoomPercent + delta);
  }

  function initializeMonopolyZoomControls() {
    els.zoomOutButton = $("#monopolyZoomOutButton");
    els.zoomInButton = $("#monopolyZoomInButton");
    els.zoomLabel = $("#monopolyZoomLabel");
    
    if (els.zoomOutButton) {
      els.zoomOutButton.addEventListener("click", () => adjustMonopolyZoom(-MONOPOLY_ZOOM_STEP_PERCENT));
    }
    if (els.zoomInButton) {
      els.zoomInButton.addEventListener("click", () => adjustMonopolyZoom(MONOPOLY_ZOOM_STEP_PERCENT));
    }
    setMonopolyZoomPercent(loadMonopolyZoomPercent(), false);
  }

  function leaveGame() {
    clearAiTimer();
    window.location.href = "./";
  }

  /* ── Init ── */
  function init() {
    // Load saved nickname
    try {
      const profile = JSON.parse(localStorage.getItem("fantasyKingdom.humanProfile.v1") || "null");
      if (profile?.nickname && els.nameInput) els.nameInput.value = profile.nickname;
    } catch {}

    // Board background is drawn with CSS so the UI does not depend on a missing image asset.
    if (els.boardImage) {
      els.boardImage.style.backgroundImage = "none";
    }

    // Event listeners
    els.startButton?.addEventListener("click", startGame);
    els.newGameButton?.addEventListener("click", resetToSetup);
    els.exitButton?.addEventListener("click", leaveGame);
    els.backButton?.addEventListener("click", leaveGame);
    els.rulesButton?.addEventListener("click", () => {
      if (typeof els.rulesDialog?.showModal === "function" && !els.rulesDialog.open) {
        els.rulesDialog.showModal();
      }
    });
    els.rulesDialog?.addEventListener("click", e => {
      if (e.target === els.rulesDialog) els.rulesDialog.close();
    });
    els.rollButton?.addEventListener("click", humanRoll);
    els.endTurnButton?.addEventListener("click", humanEndTurn);
    els.manageButton?.addEventListener("click", openManageDialog);
    els.manageDialog?.addEventListener("click", e => {
      if (e.target === els.manageDialog) els.manageDialog.close();
    });

    // Preload scenic images
    preloadScenicImages();

    // Initialize zoom
    initializeMonopolyZoomControls();

    // Hide loading
    document.body.classList.remove("app-loading");
    document.querySelector("#loadingOverlay")?.classList.add("hidden");
  }

  init();

  window.MonopolyGame = { start: startGame, leave: leaveGame };
})();
