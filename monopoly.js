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
    { id: 20, name: "우주여행",       type: "corner",   corner: "parking" },
    { id: 21, name: "뉴욕",           type: "property", color: "#FF0000", price: 220, rent: [18, 90, 250, 700, 875, 1050] },
    { id: 22, name: "황금열쇠",       type: "event",    event: "chance" },
    { id: 23, name: "워싱턴",         type: "property", color: "#FF0000", price: 220, rent: [18, 90, 250, 700, 875, 1050] },
    { id: 24, name: "토론토",         type: "property", color: "#FF0000", price: 240, rent: [20, 100, 300, 750, 925, 1100] },
    { id: 25, name: "JFK공항",        type: "property", color: "#4682B4", price: 200, rent: [25, 50, 100, 200] },
    { id: 26, name: "리우",           type: "property", color: "#FFD700", price: 260, rent: [22, 110, 330, 800, 975, 1150] },
    { id: 27, name: "부에노스",       type: "property", color: "#FFD700", price: 260, rent: [22, 110, 330, 800, 975, 1150] },
    { id: 28, name: "항공패스",       type: "property", color: "#808080", price: 150, rent: [4, 10] },
    { id: 29, name: "멕시코시티",     type: "property", color: "#FFD700", price: 280, rent: [24, 120, 360, 850, 1025, 1200] },
    { id: 30, name: "무인도로",       type: "corner",   corner: "goToJail" },
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

  const START_MONEY = 1500;
  const GO_SALARY = 200;
  const JAIL_TURNS = 3;
  const AI_THINK_DELAY = 1200;
  const DICE_ROLL_DURATION = 600;
  const DICE_FRAME_MS = 60;

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
    buyButton:        $("#monopolyBuyButton"),
    endTurnButton:    $("#monopolyEndTurnButton"),
    manageButton:     $("#monopolyManageButton"),
    propertyInfo:     $("#monopolyPropertyInfo"),
    log:              $("#monopolyLog"),
    manageDialog:     $("#monopolyManageDialog"),
    manageList:       $("#monopolyManageList")
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
    lastDoubleCount: 0
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
    const CORNER_SIZE = 13; // % of board for corner tiles
    const SIDE_TILES = 9;
    const avail = 100 - CORNER_SIZE;
    const step = avail / SIDE_TILES;

    if (index === 0)  return { x: 100 - CORNER_SIZE, y: 100 - CORNER_SIZE, w: CORNER_SIZE, h: CORNER_SIZE }; // GO (bottom-right)
    if (index <= 9)   return { x: 100 - CORNER_SIZE - index * step, y: 100 - CORNER_SIZE, w: step, h: CORNER_SIZE }; // bottom row, right→left
    if (index === 10) return { x: 0, y: 100 - CORNER_SIZE, w: CORNER_SIZE, h: CORNER_SIZE }; // Jail (bottom-left)
    if (index <= 19)  return { x: 0, y: 100 - CORNER_SIZE - (index - 10) * step, w: CORNER_SIZE, h: step }; // left col, bottom→top
    if (index === 20) return { x: 0, y: 0, w: CORNER_SIZE, h: CORNER_SIZE }; // Free Parking (top-left)
    if (index <= 29)  return { x: CORNER_SIZE + (index - 21) * step, y: 0, w: step, h: CORNER_SIZE }; // top row, left→right
    if (index === 30) return { x: 100 - CORNER_SIZE, y: 0, w: CORNER_SIZE, h: CORNER_SIZE }; // Go To Jail (top-right)
    if (index <= 39)  return { x: 100 - CORNER_SIZE, y: CORNER_SIZE + (39 - index) * step, w: CORNER_SIZE, h: step }; // right col, top→bottom
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
        html += `<span class="tile-price">₩${tile.price}</span>`;
      }
      div.innerHTML = html;
      div.title = tile.type === "property"
        ? `${tile.name} — 가격: ₩${tile.price}, 기본 임대료: ₩${tile.rent[0]}`
        : tile.name;
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

      // Avatar always attached to token (current player gets bob animation)
      const avatar = document.createElement("img");
      avatar.className = `monopoly-board-turn-avatar${i === state.currentPlayer && !state.finished ? " active" : ""}`;
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
      card.className = `monopoly-player-card${i === state.currentPlayer && !state.finished ? " active" : ""}${p.bankrupt ? " bankrupt" : ""}`;
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
        jailed: `${p?.jailTurns || 0}턴 남음`,
        finished: "게임이 끝났습니다"
      };
      els.phaseLabel.textContent = labels[state.phase] || "-";
    }
    if (els.rollButton) {
      els.rollButton.disabled = !humanTurn || state.phase !== "awaitRoll" || state.diceRolling;
    }
    if (els.buyButton) {
      const tile = p ? tileAt(p.position) : null;
      const canBuy = humanTurn && state.phase === "buyDecision" && tile?.type === "property" && !state.players.some(pl => pl.properties.includes(p.position));
      els.buyButton.disabled = !canBuy;
      els.buyButton.textContent = canBuy ? `💰 구매 (₩${tile.price})` : "💰 구매";
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

    let rentInfo = `기본 임대료: ₩${tile.rent[0]}`;
    if (tile.rent.length > 1) {
      rentInfo += `<br>건축 단계: ${tile.rent.slice(1).map((r, i) => `Lv${i + 1}: ₩${r}`).join(", ")}`;
    }

    els.propertyInfo.innerHTML = `
      <h3><span style="display:inline-block;width:14px;height:14px;background:${tile.color};border-radius:3px;margin-right:6px"></span>${escapeHtml(tile.name)}</h3>
      <p>가격: ₩${tile.price}</p>
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
    renderBoard();
    renderPieces();
    renderPlayers();
    renderControls();
    renderLog();
    renderDice();
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

  function getRent(tile, playerPosition) {
    if (tile.type !== "property") return 0;
    const owner = getOwner(tile.id);
    if (!owner) return 0;

    // Railroad
    if (tile.color === "#4682B4") {
      const owned = RAILROAD_IDS.filter(id => owner.properties.includes(id)).length;
      return 25 * Math.pow(2, owned - 1); // 25, 50, 100, 200
    }
    // Utility
    if (tile.color === "#808080") {
      const owned = UTILITY_IDS.filter(id => owner.properties.includes(id)).length;
      const roll = state.dice[0] + state.dice[1];
      return owned === 2 ? roll * 10 : roll * 4;
    }
    // Regular property
    const baseRent = tile.rent[0];
    if (isMonopoly(owner, tile.color)) {
      return baseRent * 2; // Monopoly doubles base rent
    }
    return baseRent;
  }

  /* ── Player Management ── */
  function payMoney(from, to, amount) {
    const actual = Math.min(from.money, amount);
    from.money -= actual;
    if (to && !to.bankrupt) {
      to.money += actual;
    }
    return actual;
  }

  function collectMoney(player, amount) {
    player.money += amount;
  }

  function goBankrupt(player, creditor) {
    player.bankrupt = true;
    // Transfer properties to creditor
    if (creditor) {
      creditor.properties.push(...player.properties);
      creditor.properties.sort((a, b) => a - b);
    }
    player.properties = [];
    addLog(`💀 ${playerDisplayName(player)} 파산!`);
  }

  /* ── Movement ── */
  async function movePlayer(player, steps) {
    const oldPos = player.position;
    const newPos = (player.position + steps) % 40;
    // Pass GO
    if (newPos < oldPos && steps > 0) {
      collectMoney(player, GO_SALARY);
      addLog(`🏁 ${playerDisplayName(player)} 출발지를 지나 ₩${GO_SALARY} 획득!`);
    }
    // Animate step by step
    await animatePlayerMove(player, oldPos, newPos);
    player.position = newPos;
  }

  async function teleportPlayer(player, target, passGo) {
    const oldPos = player.position;
    if (passGo && (target < oldPos || target === 0)) {
      collectMoney(player, GO_SALARY);
      addLog(`🏁 ${playerDisplayName(player)} 출발지를 지나 ₩${GO_SALARY} 획득!`);
    }
    await animateTeleport(player, target);
    player.position = target;
  }

  /* ── Jail Logic ── */
  async function sendToJail(player) {
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
  }

  async function handlePropertyLanding(player, tile) {
    const owner = getOwner(tile.id);
    if (!owner || owner === player) {
      // Unowned or own property
      if (!owner) {
        if (player.human) {
          state.phase = "buyDecision";
          addLog(`📍 ${playerDisplayName(player)} ${tile.name}에 도착. 구매 가능 (₩${tile.price})`);
          renderControls();
          return; // Wait for human decision
        } else {
          // AI buy decision
          aiBuyDecision(player, tile);
          return;
        }
      }
      addLog(`📍 ${playerDisplayName(player)} 자기 땅 ${tile.name}에 도착.`);
      state.phase = "buyDecision";
      renderControls();
      return;
    }
    // Pay rent
    const rent = getRent(tile, player.position);
    const paid = payMoney(player, owner, rent);
    addLog(`💸 ${playerDisplayName(player)} → ${playerDisplayName(owner)} 임대료 ₩${paid} 지불 (${tile.name})`);
    if (player.money <= 0) {
      goBankrupt(player, owner);
    }
    state.phase = "buyDecision";
    renderControls();
  }

  async function handleEventTile(player, tile) {
    let card;
    if (tile.event === "chance") {
      card = drawChance();
      addLog(`🔑 황금열쇠 카드: ${card.text}`);
    } else if (tile.event === "fund") {
      card = drawFund();
      addLog(`🎴 사회복지기금 카드: ${card.text}`);
    } else if (tile.event === "tax") {
      const tax = tile.amount || 100;
      player.money -= tax;
      addLog(`💸 ${playerDisplayName(player)} 세금 ₩${tax} 지불`);
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

    await wait(800);
    await executeCard(player, card);
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
        addLog(`💰 ${playerDisplayName(player)} ₩${card.amount} 획득`);
        break;
      case "pay":
        player.money -= card.amount;
        addLog(`💸 ${playerDisplayName(player)} ₩${card.amount} 지불`);
        if (player.money <= 0) goBankrupt(player, null);
        break;
      case "payAll":
        state.players.filter(p => p !== player && !p.bankrupt).forEach(op => {
          payMoney(player, op, card.amount);
        });
        addLog(`💸 ${playerDisplayName(player)} 모든 플레이어에게 ₩${card.amount} 지불`);
        if (player.money <= 0) goBankrupt(player, null);
        break;
      case "collectAll":
        state.players.filter(p => p !== player && !p.bankrupt).forEach(op => {
          payMoney(op, player, card.amount);
        });
        addLog(`💰 ${playerDisplayName(player)} 모든 플레이어에게서 ₩${card.amount} 수집`);
        break;
      case "buildingCost": {
        const houses = player.properties.reduce((sum, id) => sum + (player.buildings?.[id] || 0), 0);
        const cost = houses * card.house;
        player.money -= cost;
        if (cost > 0) addLog(`💸 ${playerDisplayName(player)} 건설비용 ₩${cost} 지불`);
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
      case "parking":
        addLog(`🚀 ${playerDisplayName(player)} 우주여행 칸에 도착.`);
        break;
      case "goToJail":
        await sendToJail(player);
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
    addLog(`🏠 ${playerDisplayName(player)} ${tile.name} 구매! (₩${tile.price})`);

    // Check monopoly
    if (tile.color !== "#808080" && tile.color !== "#4682B4" && isMonopoly(player, tile.color)) {
      addLog(`⭐ ${playerDisplayName(player)} ${tile.name} 색상 독점!`);
    }
  }

  /* ── AI Logic ── */
  function aiBuyDecision(player, tile) {
    if (tile.type !== "property" || getOwner(tile.id)) {
      state.phase = "buyDecision";
      renderAll();
      endTurn();
      return;
    }
    // AI buys if affordable and money > 200 (keep reserve)
    if (player.money >= tile.price + 200 || player.money >= tile.price && state.turnCount > 15) {
      buyProperty(player);
    } else {
      addLog(`🚫 ${playerDisplayName(player)} ${tile.name} 구매를 포기.`);
    }
    state.phase = "buyDecision";
    renderAll();
    endTurn();
  }

  async function runAiTurn() {
    clearAiTimer();
    const player = activePlayer();
    if (!player || player.human || player.bankrupt || state.phase === "finished") return;

    // Jail logic
    if (player.inJail) {
      const dice = rollDice();
      await animateDice(dice);
      player.jailTurns--;
      if (dice[0] === dice[1]) {
        player.inJail = false;
        addLog(`🎲 ${playerDisplayName(player)} 더블로 탈옥!`);
        await movePlayer(player, dice[0] + dice[1]);
        await wait(600);
        await handleTileLanding(player);
        return;
      } else if (player.jailTurns <= 0) {
        player.inJail = false;
        payMoney(player, null, 50);
        addLog(`💸 ${playerDisplayName(player)} 벌금 ₩50 내고 출소.`);
      } else {
        addLog(`🔒 ${playerDisplayName(player)} 구금 중 (${player.jailTurns}턴 남음)`);
      }
      endTurn();
      return;
    }

    // Roll dice
    const dice = rollDice();
    await animateDice(dice);

    // Doubles
    if (dice[0] === dice[1]) {
      state.lastDoubleCount++;
      addLog(`🎲 ${playerDisplayName(player)} 더블! (${dice[0]}+${dice[1]})`);
      if (state.lastDoubleCount >= 3) {
        await sendToJail(player);
        state.lastDoubleCount = 0;
        endTurn();
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

  function endTurn() {
    if (state.phase === "finished") return;
    if (checkWinner()) return;

    const p = activePlayer();
    // Doubles = extra turn
    if (state.dice[0] === state.dice[1] && !p.inJail && !p.bankrupt && state.lastDoubleCount < 3) {
      addLog(`🔄 ${playerDisplayName(p)} 더블로 한 번 더!`);
      state.phase = "awaitRoll";
      renderAll();
      if (!p.human) scheduleAiTurn();
      return;
    }

    const next = nextPlayerIndex(state.currentPlayer);
    state.currentPlayer = next;
    state.turnCount++;
    state.lastDoubleCount = 0;
    state.phase = "awaitRoll";
    renderAll();

    const np = activePlayer();
    if (np.bankrupt) {
      endTurn();
      return;
    }
    if (!np.human) scheduleAiTurn();
  }

  function scheduleAiTurn() {
    clearAiTimer();
    if (state.phase === "finished") return;
    state.aiTimer = setTimeout(runAiTurn, AI_THINK_DELAY);
  }

  /* ── Human Actions ── */
  async function humanRoll() {
    const player = activePlayer();
    if (!player?.human || state.phase !== "awaitRoll" || state.diceRolling) return;

    // Jail logic
    if (player.inJail) {
      const dice = rollDice();
      await animateDice(dice);
      player.jailTurns--;
      if (dice[0] === dice[1]) {
        player.inJail = false;
        addLog(`🎲 더블로 탈옥!`);
        await movePlayer(player, dice[0] + dice[1]);
        await wait(600);
        await handleTileLanding(player);
        return;
      } else if (player.jailTurns <= 0) {
        player.inJail = false;
        payMoney(player, null, 50);
        addLog(`💸 벌금 ₩50 내고 출소.`);
      } else {
        addLog(`🔒 구금 중 (${player.jailTurns}턴 남음)`);
        state.phase = "buyDecision";
        renderAll();
        renderControls();
        return;
      }
      state.phase = "buyDecision";
      renderAll();
      renderControls();
      return;
    }

    const dice = rollDice();
    await animateDice(dice);

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

  function humanBuy() {
    const player = activePlayer();
    if (!player?.human || state.phase !== "buyDecision") return;
    buyProperty(player);
    state.phase = "buyDecision";
    renderAll();
    renderControls();
  }

  function humanEndTurn() {
    const player = activePlayer();
    if (!player?.human) return;
    endTurn();
  }

  /* ── Manage Dialog ── */
  function openManageDialog() {
    const player = activePlayer();
    if (!player?.human || !player.properties.length) return;
    if (!els.manageDialog || !els.manageList) return;

    els.manageList.innerHTML = player.properties.map(id => {
      const tile = tileAt(id);
      const rent = getRent(tile, player.position);
      return `
        <div class="monopoly-manage-item" data-tile-id="${id}">
          <div class="monopoly-manage-item-info">
            <span class="monopoly-manage-color" style="background:${tile.color}"></span>
            <span>
              <span class="monopoly-manage-item-name">${escapeHtml(tile.name)}</span><br>
              <span class="monopoly-manage-item-rent">임대료: ₩${rent}</span>
            </span>
          </div>
          <button class="monopoly-manage-sell-btn" data-sell-id="${id}">매각 (₩${Math.floor(tile.price / 2)})</button>
        </div>
      `;
    }).join("");

    els.manageList.querySelectorAll(".monopoly-manage-sell-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const tileId = Number(btn.dataset.sellId);
        sellProperty(player, tileId);
        openManageDialog(); // Refresh
      });
    });

    if (typeof els.manageDialog.showModal === "function") {
      els.manageDialog.showModal();
    }
  }

  function sellProperty(player, tileId) {
    const idx = player.properties.indexOf(tileId);
    if (idx < 0) return;
    const tile = tileAt(tileId);
    const sellPrice = Math.floor(tile.price / 2);
    player.properties.splice(idx, 1);
    player.money += sellPrice;
    if (player.buildings) delete player.buildings[tileId];
    addLog(`🏷️ ${playerDisplayName(player)} ${tile.name} 매각 (₩${sellPrice})`);
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
        bankrupt: false
      };
    });

    state.currentPlayer = 0;
    state.phase = "awaitRoll";
    state.dice = [];
    state.diceRolling = false;
    state.chanceDeck = shuffle([...CHANCE_CARDS]);
    state.fundDeck = shuffle([...FUND_CARDS]);
    state.log = [];
    state.turnCount = 1;
    state.lastDoubleCount = 0;

    addLog(`🌐 부루마불 게임 시작! ${count}명 참가.`);
    addLog(`💰 각 플레이어 ₩${START_MONEY} 보유.`);

    document.body.classList.add("monopoly-playing");
    els.setupPanel?.classList.add("hidden");
    els.gamePanel?.classList.remove("hidden");
    renderAll();
  }

  function resetToSetup() {
    clearAiTimer();
    document.body.classList.remove("monopoly-playing");
    document.body.classList.add("monopoly-active");
    els.gamePanel?.classList.add("hidden");
    els.setupPanel?.classList.remove("hidden");
    state.phase = "idle";
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
    els.buyButton?.addEventListener("click", humanBuy);
    els.endTurnButton?.addEventListener("click", humanEndTurn);
    els.manageButton?.addEventListener("click", openManageDialog);
    els.manageDialog?.addEventListener("click", e => {
      if (e.target === els.manageDialog) els.manageDialog.close();
    });

    // Hide loading
    document.body.classList.remove("app-loading");
    document.querySelector("#loadingOverlay")?.classList.add("hidden");
  }

  init();

  window.MonopolyGame = { start: startGame, leave: leaveGame };
})();
