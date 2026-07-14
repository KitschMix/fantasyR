/* ===== 도미니언 (Dominion) ===== */
(function () {
  "use strict";

  /* ── Card Definitions ── */
  const TREASURES = {
    copper:   { name: "Copper",   cost: 0, coins: 1, type: "treasure", emoji: "🟤" },
    silver:   { name: "Silver",   cost: 3, coins: 2, type: "treasure", emoji: "⚪" },
    gold:     { name: "Gold",     cost: 6, coins: 3, type: "treasure", emoji: "🟡" }
  };

  const VICTORIES = {
    estate:   { name: "Estate",   cost: 2, vp: 1, type: "victory", emoji: "🏠" },
    duchy:    { name: "Duchy",    cost: 5, vp: 3, type: "victory", emoji: "🏰" },
    province: { name: "Province", cost: 8, vp: 6, type: "victory", emoji: "👑" }
  };

  const CURSE_CARD = { name: "Curse", cost: 0, vp: -1, type: "curse", emoji: "💀" };

  const KINGDOM_CARDS = [
    { id: "village",      name: "Village",      cost: 3, type: "action", emoji: "🏘️",  desc: "+1카드 +2행동",               onPlay: (s) => { drawCards(s, 1); s.actions += 2; } },
    { id: "smithy",       name: "Smithy",       cost: 4, type: "action", emoji: "🔨",  desc: "+3카드",                      onPlay: (s) => { drawCards(s, 3); } },
    { id: "market",       name: "Market",       cost: 5, type: "action", emoji: "🏪",  desc: "+1카드 +1행동 +1구매 +1코인", onPlay: (s) => { drawCards(s, 1); s.actions += 1; s.buys += 1; s.coins += 1; } },
    { id: "laboratory",   name: "Laboratory",   cost: 5, type: "action", emoji: "🔬",  desc: "+2카드 +1행동",               onPlay: (s) => { drawCards(s, 2); s.actions += 1; } },
    { id: "festival",     name: "Festival",     cost: 5, type: "action", emoji: "🎪",  desc: "+2행동 +1구매 +2코인",        onPlay: (s) => { s.actions += 2; s.buys += 1; s.coins += 2; } },
    { id: "woodcutter",   name: "Woodcutter",   cost: 3, type: "action", emoji: "🪓",  desc: "+1구매 +2코인",               onPlay: (s) => { s.buys += 1; s.coins += 2; } },
    { id: "workshop",     name: "Workshop",     cost: 3, type: "action", emoji: "🛠️",  desc: "4이하 카드 1장 무료 획득",     onPlay: (s) => { s.workshopGain = true; } },
    { id: "militia",      name: "Militia",      cost: 4, type: "action", emoji: "⚔️",  desc: "+2코인 / 상대 3장으로 축소",   onPlay: (s) => { s.coins += 2; s.militiaAttack = true; } },
    { id: "mine",         name: "Mine",         cost: 5, type: "action", emoji: "⛏️",  desc: "보물 업그레이드",              onPlay: (s) => { s.mineAction = true; } },
    { id: "chapel",       name: "Chapel",       cost: 2, type: "action", emoji: "⛪",  desc: "최대 4장 트래시",              onPlay: (s) => { s.chapelAction = true; } },
    { id: "cellar",       name: "Cellar",       cost: 2, type: "action", emoji: "🍷",  desc: "+1행동 / 원하는 만큼 교체",    onPlay: (s) => { s.actions += 1; s.cellarAction = true; } },
    { id: "remodel",      name: "Remodel",      cost: 4, type: "action", emoji: "♻️",  desc: "트래시 후 +2비용 카드 획득",   onPlay: (s) => { s.remodelAction = true; } },
    { id: "moneylender",  name: "Moneylender",  cost: 4, type: "action", emoji: "💰",  desc: "Copper 트래시 → +3코인",      onPlay: (s) => { s.moneylenderAction = true; } },
    { id: "witch",        name: "Witch",        cost: 5, type: "action", emoji: "🧙",  desc: "+2카드 / 상대 Curse 부여",     onPlay: (s) => { drawCards(s, 2); s.witchAttack = true; } }
  ];

  const KINGDOM_SUPPLY_COUNT = 10;
  const HAND_SIZE = 5;
  const AI_DELAY = 600;
  const DOMINION_ZOOM_STORAGE_KEY = "fantasyR.dominionZoomPercent";
  const DOMINION_ZOOM_MIN_PERCENT = 70;
  const DOMINION_ZOOM_MAX_PERCENT = 200;
  const DOMINION_ZOOM_STEP_PERCENT = 10;

  /* ── DOM ── */
  const $ = (sel) => document.querySelector(sel);
  const els = {
    setupPanel:    $("#dominionSetupPanel"),
    gamePanel:     $("#dominionGamePanel"),
    startButton:   $("#startDominionButton"),
    playerCount:   $("#dominionPlayerCountSelect"),
    backButton:    $("#dominionBackButton"),
    newGameButton: $("#dominionNewGameButton"),
    exitButton:    $("#dominionExitButton"),
    rulesButton:   $("#dominionRulesButton"),
    rulesDialog:   $("#dominionRulesDialog"),
    playersList:   $("#dominionPlayersList"),
    turnLabel:     $("#dominionTurnLabel"),
    phaseLabel:    $("#dominionPhaseLabel"),
    stats:         $("#dominionStats"),
    supply:        $("#dominionSupply"),
    playArea:      $("#dominionPlayArea"),
    hand:          $("#dominionHand"),
    playAllBtn:    $("#dominionPlayAllTreasures"),
    endBuyBtn:     $("#dominionEndBuyButton"),
    endTurnBtn:    $("#dominionEndTurnButton"),
    zoomOutButton: $("#dominionZoomOutButton"),
    zoomInButton:  $("#dominionZoomInButton"),
    zoomLabel:     $("#dominionZoomLabel"),
    log:           $("#dominionLog")
  };

  /* ── State ── */
  const state = {
    players: [],
    currentPlayer: 0,
    phase: "idle",
    supply: {},
    kingdomCards: [],
    turnCount: 0,
    log: [],
    aiTimer: 0
  };

  let dominionZoomPercent = 100;

  /* ── Profiles ── */
  const SHARED = window.FANTASY_SHARED_PROFILES || {};
  const PROFILE_ROOT = SHARED.root || "assets/profiles/user";
  function imgUrl(f) { return encodeURI(`${PROFILE_ROOT}/${f}`); }
  function aiProfiles() {
    const g = SHARED.groups || {};
    const keys = SHARED.difficultyKeys || ["normal", "hard", "expert"];
    const difficulty = (typeof state !== "undefined" && state.aiDifficulty) || "normal";
    if (difficulty === "random") {
      return keys.flatMap((k) => (g[k] || []).map((p) => ({ ...p, difficulty: k })));
    }
    const group = g[difficulty] || g.normal || [];
    return group.map((p) => ({ ...p, difficulty }));
  }

  /* ── Helpers ── */
  function shuffle(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
  function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
  function esc(v) { return String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function addLog(m) { state.log.unshift(m); state.log = state.log.slice(0, 50); }
  function activePlayer() { return state.players[state.currentPlayer]; }
  function clampNumber(value, min, max) { return Math.max(min, Math.min(max, value)); }

  function currentViewportSize() {
    const viewport = window.visualViewport || {};
    const root = document.documentElement || {};
    return {
      width: Math.max(320, Number(viewport.width || window.innerWidth || root.clientWidth || window.screen?.availWidth || 1366)),
      height: Math.max(320, Number(viewport.height || window.innerHeight || root.clientHeight || window.screen?.availHeight || 768))
    };
  }

  function suggestedInitialDominionZoomPercent() {
    const { width, height } = currentViewportSize();
    const isPhonePortrait = width <= 700 && height > width;
    if (isPhonePortrait) return 80;
    return 100;
  }

  function loadDominionZoomPercent() {
    try {
      const saved = window.localStorage.getItem(DOMINION_ZOOM_STORAGE_KEY);
      const numeric = Number(saved);
      return saved !== null && String(saved).trim() !== "" && Number.isFinite(numeric)
        ? clampNumber(numeric, DOMINION_ZOOM_MIN_PERCENT, DOMINION_ZOOM_MAX_PERCENT)
        : suggestedInitialDominionZoomPercent();
    } catch {
      return suggestedInitialDominionZoomPercent();
    }
  }

  function saveDominionZoomPercent(percent) {
    try {
      window.localStorage.setItem(DOMINION_ZOOM_STORAGE_KEY, String(percent));
    } catch {
      // Storage can be blocked; the current page zoom still works.
    }
  }

  function renderDominionZoomControls() {
    els.gamePanel?.style.setProperty("--dominion-ui-zoom", String(dominionZoomPercent / 100));
    if (els.zoomLabel) els.zoomLabel.textContent = `${dominionZoomPercent}%`;
    if (els.zoomOutButton) els.zoomOutButton.disabled = dominionZoomPercent <= DOMINION_ZOOM_MIN_PERCENT;
    if (els.zoomInButton) els.zoomInButton.disabled = dominionZoomPercent >= DOMINION_ZOOM_MAX_PERCENT;
  }

  function setDominionZoomPercent(percent, persist = true) {
    dominionZoomPercent = clampNumber(
      Math.round(percent / DOMINION_ZOOM_STEP_PERCENT) * DOMINION_ZOOM_STEP_PERCENT,
      DOMINION_ZOOM_MIN_PERCENT,
      DOMINION_ZOOM_MAX_PERCENT
    );
    renderDominionZoomControls();
    if (persist) saveDominionZoomPercent(dominionZoomPercent);
  }

  function adjustDominionZoom(delta) {
    setDominionZoomPercent(dominionZoomPercent + delta);
  }

  function initializeDominionZoomControls() {
    setDominionZoomPercent(loadDominionZoomPercent(), false);
  }

  /* ── Card Helpers ── */
  function makeCard(template) {
    return { ...template, id: `${template.name || template.id}_${Math.random().toString(36).slice(2, 6)}` };
  }

  function cardCost(card) {
    return card.cost ?? 0;
  }

  function isTreasure(card) { return card.type === "treasure"; }
  function isVictory(card) { return card.type === "victory"; }
  function isAction(card) { return card.type === "action"; }
  function isCurse(card) { return card.type === "curse"; }

  function cardColor(card) {
    if (isTreasure(card)) return TREASURES[card.name.toLowerCase()] ? undefined : undefined;
    return undefined;
  }

  /* ── Draw / Discard ── */
  function drawCards(player, n) {
    for (let i = 0; i < n; i++) {
      if (!player.deck.length) {
        if (!player.discard.length) return;
        player.deck = shuffle(player.discard);
        player.discard = [];
      }
      const card = player.deck.pop();
      if (card) player.hand.push(card);
    }
  }

  function discardHand(player) {
    player.discard.push(...player.hand);
    player.hand = [];
  }

  function discardPlayed(player) {
    player.discard.push(...player.played);
    player.played = [];
  }

  function trashCard(player, card) {
    const idx = player.hand.indexOf(card);
    if (idx >= 0) player.hand.splice(idx, 1);
    state.trash.push(card);
  }

  /* ── VP Calculation ── */
  function countVP(player) {
    const all = [...player.hand, ...player.deck, ...player.discard];
    let vp = 0;
    all.forEach(c => { if (c.vp) vp += c.vp; });
    return vp;
  }

  function countDeck(player) {
    return player.hand.length + player.deck.length + player.discard.length;
  }

  /* ── Supply ── */
  function supplyPileLeft(cardName) {
    return (state.supply[cardName] || []).length;
  }

  function takeFromSupply(cardName) {
    const pile = state.supply[cardName];
    if (!pile || !pile.length) return null;
    return pile.pop();
  }

  function canBuy(player, cardName) {
    const pile = state.supply[cardName];
    if (!pile || !pile.length) return false;
    const card = pile[pile.length - 1];
    return player.buys > 0 && player.coins >= cardCost(card);
  }

  function buyCard(player, cardName) {
    if (!canBuy(player, cardName)) return false;
    const card = takeFromSupply(cardName);
    if (!card) return false;
    player.coins -= cardCost(card);
    player.buys -= 1;
    player.discard.push(card);
    return true;
  }

  /* ── End Game Check ── */
  function checkGameOver() {
    if (supplyPileLeft("Province") <= 0) return true;
    let emptyPiles = 0;
    for (const name of Object.keys(state.supply)) {
      if (supplyPileLeft(name) <= 0) emptyPiles++;
    }
    return emptyPiles >= 3;
  }

  /* ── Rendering ── */
  function cardHtml(card, disabled, extraClass) {
    return `<div class="dominion-card ${card.type}${disabled ? " disabled" : ""}${extraClass ? " " + extraClass : ""}" data-card-id="${esc(card.id)}" title="${esc(card.desc || card.name)}">
      <span class="dominion-card-cost">${cardCost(card)}</span>
      <span class="dominion-card-name">${card.emoji || ""} ${esc(card.name)}</span>
      ${card.desc ? `<span class="dominion-card-desc">${esc(card.desc)}</span>` : ""}
      <span class="dominion-card-type">${card.type}</span>
    </div>`;
  }

  function renderSupply() {
    if (!els.supply) return;
    const player = activePlayer();
    const allCards = [...state.kingdomCards.map(k => k.name), "Copper", "Silver", "Gold", "Estate", "Duchy", "Province"];
    if (state.cursePile > 0) allCards.push("Curse");

    els.supply.innerHTML = allCards.map(name => {
      const pile = state.supply[name] || [];
      const count = pile.length;
      const card = pile[pile.length - 1];
      const empty = count <= 0;
      const affordable = player && !empty && player.coins >= (card ? cardCost(card) : 999) && player.buys > 0;
      const isVP = card && isVictory(card);
      return `<div class="dominion-supply-pile${card ? " " + card.type : ""}${empty ? " empty" : ""}${affordable ? " highlight" : ""}" data-pile="${esc(name)}">
        <span class="dominion-pile-count">${count}</span>
        <span class="dominion-pile-cost">${card ? cardCost(card) : "-"}</span>
        <span class="dominion-pile-name">${card ? (card.emoji || "") + " " : ""}${esc(name)}</span>
        <span class="dominion-pile-type${isVP ? " dominion-pile-vp" : ""}">${card ? card.type : ""}</span>
      </div>`;
    }).join("");

    els.supply.querySelectorAll(".dominion-supply-pile:not(.empty)").forEach(el => {
      el.addEventListener("click", () => {
        const pileName = el.dataset.pile;
        if (state.phase === "buy" && activePlayer()?.human) {
          attemptBuy(pileName);
        } else if (state.phase === "workshop" && activePlayer()?.human) {
          attemptWorkshopGain(pileName);
        } else if (state.phase === "remodelGain" && activePlayer()?.human) {
          attemptRemodelGain(pileName);
        }
      });
    });
  }

  function renderHand() {
    if (!els.hand) return;
    const player = activePlayer();
    if (!player) { els.hand.innerHTML = ""; return; }
    els.hand.innerHTML = player.hand.map((card, i) => {
      const playable = state.phase === "action" && isAction(card) && player.human && player.actions > 0;
      const treasurePlayable = state.phase === "buy" && isTreasure(card) && player.human;
      const cellarPlayable = state.phase === "cellar" && player.human;
      const minePlayable = state.phase === "mine" && isTreasure(card) && player.human;
      const remodelPlayable = state.phase === "remodel" && player.human;
      const disabled = !playable && !treasurePlayable && !cellarPlayable && !minePlayable && !remodelPlayable;
      return cardHtml(card, disabled);
    }).join("");

    els.hand.querySelectorAll(".dominion-card:not(.disabled)").forEach(el => {
      el.addEventListener("click", () => {
        const cardId = el.dataset.cardId;
        const card = player.hand.find(c => c.id === cardId);
        if (!card) return;
        if (state.phase === "action" && isAction(card)) {
          playActionCard(player, card);
        } else if (state.phase === "buy" && isTreasure(card)) {
          playTreasureCard(player, card);
        } else if (state.phase === "cellar") {
          // Discard selected card for Cellar
          const idx = player.hand.indexOf(card);
          if (idx >= 0) { player.hand.splice(idx, 1); player.discard.push(card); }
          addLog(`${player.name}: Cellar로 ${card.name} 버림`);
          renderAll();
        } else if (state.phase === "mine" && isTreasure(card)) {
          // Mine: trash treasure, gain treasure costing +3
          const maxCost = cardCost(card) + 3;
          trashCard(player, card);
          const options = Object.keys(state.supply).filter(n => {
            const pile = state.supply[n];
            return pile.length > 0 && isTreasure(pile[pile.length - 1]) && cardCost(pile[pile.length - 1]) <= maxCost;
          }).sort((a, b) => cardCost(state.supply[b][state.supply[b].length - 1]) - cardCost(state.supply[a][state.supply[a].length - 1]));
          if (options.length) {
            const gained = takeFromSupply(options[0]);
            if (gained) { player.hand.push(gained); addLog(`${player.name}: Mine ${card.name}→${options[0]}`); }
          }
          state.phase = "buy";
          renderAll();
        } else if (state.phase === "remodel") {
          // Remodel: trash card, gain card costing +2
          const maxCost = cardCost(card) + 2;
          trashCard(player, card);
          state.phase = "remodelGain";
          state.remodelMaxCost = maxCost;
          addLog(`${player.name}: ${card.name} 트래시. ${maxCost}이하 카드를 공급처에서 선택.`);
          renderAll();
        } else if (state.phase === "remodelGain") {
          // This shouldn't happen - remodelGain is handled by supply click
        }
      });
    });
  }

  function renderPlayArea() {
    if (!els.playArea) return;
    els.playArea.innerHTML = activePlayer()?.played.map(c => cardHtml(c, true)).join("") || "";
  }

  function renderPlayers() {
    if (!els.playersList) return;
    els.playersList.innerHTML = state.players.map((p, i) => {
      const vp = countVP(p);
      return `<section class="dominion-player-card${i === state.currentPlayer ? " active" : ""}">
        <div class="dominion-player-header">
          <img class="dominion-player-avatar" src="${esc(p.avatarUrl)}" alt="" />
          <span class="dominion-player-name">${esc(p.name)}</span>
          <span class="dominion-player-score">${vp}vp</span>
        </div>
        <div class="dominion-player-stats">덱 ${p.deck.length} · 패 ${p.hand.length} · 버림 ${p.discard.length}</div>
      </section>`;
    }).join("");
  }

  function renderControls() {
    const p = activePlayer();
    if (els.turnLabel) els.turnLabel.textContent = p ? `${p.name} 차례` : "-";
    if (els.phaseLabel) {
      const labels = {
        action: "행동 카드 사용",
        buy: "카드 구매 (또는 보물 사용)",
        workshop: "4이하 카드 선택",
        cellar: "버릴 카드 선택 후 구매 종료",
        mine: "업그레이드할 보물 선택",
        remodel: "트래시할 카드 선택",
        remodelGain: `${state.remodelMaxCost || 0}이하 카드 획득`,
        cleanup: "정리 중...",
        finished: "게임 종료"
      };
      els.phaseLabel.textContent = labels[state.phase] || "-";
    }
    if (els.stats && p) {
      els.stats.innerHTML = `
        <span class="dominion-stat">🃏 ${p.actions} 행동</span>
        <span class="dominion-stat">🛒 ${p.buys} 구매</span>
        <span class="dominion-stat">💰 ${p.coins} 코인</span>
      `;
    }
    if (els.playAllBtn) els.playAllBtn.disabled = !p?.human || state.phase !== "buy";
    if (els.endBuyBtn) {
      els.endBuyBtn.disabled = !p?.human || !["buy", "cellar"].includes(state.phase);
      els.endBuyBtn.textContent = state.phase === "cellar" ? "확정" : "구매 종료";
    }
    if (els.endTurnBtn) els.endTurnBtn.disabled = !p?.human || (state.phase !== "action" && state.phase !== "buy");
  }

  function renderLog() {
    if (!els.log) return;
    els.log.innerHTML = state.log.map(m => `<li>${esc(m)}</li>`).join("");
  }

  function renderAll() {
    renderPlayers();
    renderSupply();
    renderHand();
    renderPlayArea();
    renderControls();
    renderLog();
  }

  /* ── Player Build ── */
  function buildPlayers(count) {
    const pool = shuffle(aiProfiles());
    return Array.from({ length: count }, (_, i) => {
      const human = i === 0;
      const prof = human ? null : pool[i - 1] || { name: `AI ${i}`, avatarUrl: imgUrl("보통-건일.jpg") };
      const deck = shuffle([
        ...Array(7).fill(null).map(() => makeCard(TREASURES.copper)),
        ...Array(3).fill(null).map(() => makeCard(VICTORIES.estate))
      ]);
      return {
        id: human ? "human" : `ai${i}`,
        human,
        name: human ? "플레이어" : (prof.name || `AI ${i}`),
        avatarUrl: human ? imgUrl("유저.jpg") : prof.avatarUrl,
        deck,
        hand: [],
        discard: [],
        played: [],
        actions: 0,
        buys: 0,
        coins: 0,
        workshopGain: false,
        mineAction: false,
        chapelAction: false,
        cellarAction: false,
        remodelAction: false,
        moneylenderAction: false,
        militiaAttack: false,
        witchAttack: false
      };
    });
  }

  /* ── Turn Flow ── */
  function beginTurn(playerIndex) {
    state.currentPlayer = playerIndex;
    state.turnCount++;
    const p = activePlayer();
    p.actions = 1;
    p.buys = 1;
    p.coins = 0;
    p.played = [];
    p.workshopGain = false;
    p.mineAction = false;
    p.chapelAction = false;
    p.cellarAction = false;
    p.remodelAction = false;
    p.moneylenderAction = false;
    p.militiaAttack = false;
    p.witchAttack = false;
    drawCards(p, HAND_SIZE);
    state.phase = "action";
    addLog(`--- ${p.name} 턴 ${state.turnCount} ---`);
    renderAll();
    if (!p.human) {
      state.aiTimer = setTimeout(runAiTurn, AI_DELAY);
    }
  }

  function nextPlayerIndex(from) {
    return (from + 1) % state.players.length;
  }

  /* ── Play Action Card ── */
  function playActionCard(player, card) {
    if (state.phase !== "action" || player.actions <= 0) return;
    const idx = player.hand.indexOf(card);
    if (idx < 0) return;
    player.hand.splice(idx, 1);
    player.played.push(card);
    player.actions -= 1;

    // Execute card effect
    if (card.onPlay) card.onPlay(player);

    addLog(`${player.name}: ${card.emoji} ${card.name} 사용`);

    // Handle special effects that need UI
    if (player.workshopGain) {
      player.workshopGain = false;
      if (player.human) {
        state.phase = "workshop";
        addLog("4이하 카드를 선택하세요.");
        renderAll();
        return;
      } else {
        aiWorkshopGain(player);
      }
    }

    if (player.chapelAction) {
      player.chapelAction = false;
      if (player.human) {
        state.phase = "chapel";
        addLog("트래시할 카드를 선택하세요 (최대 4장).");
        renderAll();
        return;
      } else {
        aiChapelTrash(player);
      }
    }

    if (player.cellarAction) {
      player.cellarAction = false;
      if (player.human) {
        state._preCellarDiscardCount = player.discard.length;
        state.phase = "cellar";
        addLog("버릴 카드를 선택하세요 (0장 이상). 구매 종료로 확정.");
        renderAll();
        return;
      } else {
        aiCellarDiscard(player);
      }
    }

    if (player.moneylenderAction) {
      player.moneylenderAction = false;
      const copper = player.hand.find(c => c.name === "Copper");
      if (copper) {
        trashCard(player, copper);
        player.coins += 3;
        addLog(`${player.name}: Copper 트래시 → +3코인`);
      }
    }

    if (player.mineAction) {
      player.mineAction = false;
      if (player.human) {
        state.phase = "mine";
        addLog("업그레이드할 보물을 선택하세요.");
        renderAll();
        return;
      } else {
        aiMineUpgrade(player);
      }
    }

    if (player.remodelAction) {
      player.remodelAction = false;
      if (player.human) {
        state.phase = "remodel";
        addLog("트래시할 카드를 선택하세요.");
        renderAll();
        return;
      } else {
        aiRemodel(player);
      }
    }

    if (player.witchAttack) {
      player.witchAttack = false;
      state.players.forEach(op => {
        if (op !== player && !op.isEliminated) {
          const curse = takeFromSupply("Curse");
          if (curse) {
            op.discard.push(curse);
            addLog(`${player.name}: ${op.name}에게 Curse 부여!`);
          }
        }
      });
    }

    // After action, check if more actions possible
    if (player.actions <= 0 || !player.hand.some(c => isAction(c))) {
      state.phase = "buy";
    }
    renderAll();
  }

  /* ── Play Treasure ── */
  function playTreasureCard(player, card) {
    if (state.phase !== "buy") return;
    const idx = player.hand.indexOf(card);
    if (idx < 0) return;
    player.hand.splice(idx, 1);
    player.played.push(card);
    player.coins += (card.coins || 0);
    addLog(`${player.name}: ${card.emoji} ${card.name} 사용 (+${card.coins}코인)`);
    renderAll();
  }

  function playAllTreasures(player) {
    if (state.phase !== "buy") return;
    const treasures = player.hand.filter(c => isTreasure(c));
    treasures.forEach(c => playTreasureCard(player, c));
  }

  /* ── Buy ── */
  function attemptBuy(cardName) {
    const p = activePlayer();
    if (!p?.human || state.phase !== "buy") return;
    if (buyCard(p, cardName)) {
      const card = state.supply[cardName]?.length ? state.supply[cardName][state.supply[cardName].length - 1] : null;
      addLog(`${p.name}: ${cardName} 구매 (남은 코인: ${p.coins})`);
      if (p.buys <= 0) endBuyPhase();
      renderAll();
    }
  }

  function endBuyPhase() {
    const p = activePlayer();
    if (!p) return;

    // Cellar: draw cards equal to discarded
    if (state.phase === "cellar") {
      const cellarDiscards = p.discard.length - (state._preCellarDiscardCount || 0);
      drawCards(p, cellarDiscards);
      if (cellarDiscards > 0) addLog(`${p.name}: Cellar로 ${cellarDiscards}장 드로우`);
    }

    // Clean up
    discardHand(p);
    discardPlayed(p);
    drawCards(p, HAND_SIZE);
    state.phase = "action";
    p.actions = 1;
    p.buys = 1;
    p.coins = 0;
    addLog(`${p.name}: 정리 완료`);
    endTurn();
  }

  function endTurn() {
    if (checkGameOver()) {
      state.phase = "finished";
      finishGame();
      return;
    }
    beginTurn(nextPlayerIndex(state.currentPlayer));
  }

  /* ── Special Actions (simplified for AI & human) ── */
  function attemptWorkshopGain(cardName) {
    const p = activePlayer();
    if (!p?.human || state.phase !== "workshop") return;
    const pile = state.supply[cardName];
    if (!pile || !pile.length) return;
    const card = pile[pile.length - 1];
    if (cardCost(card) > 4) { addLog("4이하 카드만 가능합니다."); return; }
    const gained = takeFromSupply(cardName);
    if (gained) {
      p.discard.push(gained);
      addLog(`${p.name}: Workshop으로 ${cardName} 획득`);
    }
    state.phase = "buy";
    renderAll();
  }

  function attemptRemodelGain(cardName) {
    const p = activePlayer();
    if (!p?.human || state.phase !== "remodelGain") return;
    const pile = state.supply[cardName];
    if (!pile || !pile.length) return;
    const card = pile[pile.length - 1];
    if (cardCost(card) > (state.remodelMaxCost || 0)) { addLog(`${state.remodelMaxCost}이하 카드만 가능합니다.`); return; }
    const gained = takeFromSupply(cardName);
    if (gained) {
      p.discard.push(gained);
      addLog(`${p.name}: Remodel로 ${cardName} 획득`);
    }
    state.phase = "buy";
    renderAll();
  }

  function aiWorkshopGain(player) {
    const options = Object.keys(state.supply).filter(n => {
      const pile = state.supply[n];
      return pile.length > 0 && cardCost(pile[pile.length - 1]) <= 4;
    }).sort((a, b) => {
      const ca = state.supply[a][state.supply[a].length - 1];
      const cb = state.supply[b][state.supply[b].length - 1];
      return cardCost(cb) - cardCost(ca);
    });
    if (options.length) {
      const name = options[0];
      const gained = takeFromSupply(name);
      if (gained) { player.discard.push(gained); addLog(`${player.name}: Workshop으로 ${name} 획득`); }
    }
  }

  function aiChapelTrash(player) {
    // Trash worst cards (curses, then coppers, then estates)
    const priority = ["Curse", "Copper", "Estate"];
    let trashed = 0;
    for (const pname of priority) {
      if (trashed >= 4) break;
      const card = player.hand.find(c => c.name === pname);
      if (card) { trashCard(player, card); trashed++; addLog(`${player.name}: ${pname} 트래시`); }
    }
  }

  function aiCellarDiscard(player) {
    // Discard victory cards and curses, then draw same amount
    const toDiscard = player.hand.filter(c => isVictory(c) || isCurse(c));
    const count = toDiscard.length;
    toDiscard.forEach(c => {
      const idx = player.hand.indexOf(c);
      if (idx >= 0) { player.hand.splice(idx, 1); player.discard.push(c); }
    });
    drawCards(player, count);
    if (count > 0) addLog(`${player.name}: Cellar로 ${count}장 교체`);
  }

  function aiMineUpgrade(player) {
    // Upgrade Copper→Silver or Silver→Gold
    const copper = player.hand.find(c => c.name === "Copper");
    const silver = player.hand.find(c => c.name === "Silver");
    if (silver) {
      trashCard(player, silver);
      const gold = takeFromSupply("Gold");
      if (gold) player.hand.push(gold);
      addLog(`${player.name}: Mine Silver→Gold`);
    } else if (copper) {
      trashCard(player, copper);
      const newSilver = takeFromSupply("Silver");
      if (newSilver) player.hand.push(newSilver);
      addLog(`${player.name}: Mine Copper→Silver`);
    }
  }

  function aiRemodel(player) {
    // Trash worst card, gain card costing up to +2
    const priority = ["Curse", "Estate", "Copper", "Silver"];
    for (const pname of priority) {
      const card = player.hand.find(c => c.name === pname);
      if (card) {
        const maxCost = cardCost(card) + 2;
        trashCard(player, card);
        const options = Object.keys(state.supply).filter(n => {
          const pile = state.supply[n];
          return pile.length > 0 && cardCost(pile[pile.length - 1]) <= maxCost;
        }).sort((a, b) => {
          const ca = state.supply[a][state.supply[a].length - 1];
          const cb = state.supply[b][state.supply[b].length - 1];
          return cardCost(cb) - cardCost(ca);
        });
        if (options.length) {
          const gained = takeFromSupply(options[0]);
          if (gained) { player.discard.push(gained); addLog(`${player.name}: Remodel ${pname}→${options[0]}`); }
        }
        return;
      }
    }
  }

  /* ── AI Logic ── */
  function runAiTurn() {
    clearAiTimer();
    const p = activePlayer();
    if (!p || p.human || state.phase === "finished") return;

    // Action phase: play best action card
    while (p.actions > 0 && p.hand.some(c => isAction(c))) {
      const actionCard = chooseAiAction(p);
      if (!actionCard) break;
      playActionCard(p, actionCard);
      // Handle AI special actions inline
      if (p.workshopGain) { p.workshopGain = false; aiWorkshopGain(p); }
      if (p.chapelAction) { p.chapelAction = false; aiChapelTrash(p); }
    }

    // Buy phase
    state.phase = "buy";
    playAllTreasures(p);
    renderAll();

    // Buy best card
    const buyChoice = chooseAiBuy(p);
    if (buyChoice) {
      if (buyCard(p, buyChoice)) {
        addLog(`${p.name}: ${buyChoice} 구매`);
      }
    }

    renderAll();
    setTimeout(() => {
      endBuyPhase();
    }, AI_DELAY);
  }

  function chooseAiAction(player) {
    const actions = player.hand.filter(c => isAction(c));
    if (!actions.length) return null;
    // Prefer cards that give more: Market > Laboratory > Festival > Village > Smithy > others
    const priority = ["Market", "Laboratory", "Festival", "Village", "Smithy", "Witch", "Militia", "Mine", "Workshop", "Woodcutter", "Cellar", "Remodel", "Moneylender", "Chapel"];
    for (const name of priority) {
      const card = actions.find(c => c.name === name);
      if (card) return card;
    }
    return actions[0];
  }

  function chooseAiBuy(player) {
    if (player.buys <= 0) return null;
    const options = Object.keys(state.supply).filter(n => canBuy(player, n));
    if (!options.length) return null;

    // Priority: Province > Gold > Duchy > Silver > action cards > Estate > Copper
    if (player.coins >= 8 && supplyPileLeft("Province") > 0) return "Province";
    if (player.coins >= 6 && supplyPileLeft("Gold") > 0) return "Gold";
    if (player.coins >= 5 && supplyPileLeft("Duchy") > 0 && supplyPileLeft("Province") <= 4) return "Duchy";
    if (player.coins >= 5) {
      const k5 = ["Market", "Laboratory", "Festival", "Witch"].filter(n => supplyPileLeft(n) > 0);
      if (k5.length) return k5[0];
    }
    if (player.coins >= 4) {
      const k4 = ["Militia", "Remodel", "Smithy"].filter(n => supplyPileLeft(n) > 0);
      if (k4.length) return k4[0];
    }
    if (player.coins >= 3 && supplyPileLeft("Silver") > 0) return "Silver";
    if (player.coins >= 3) {
      const k3 = ["Village", "Woodcutter", "Workshop"].filter(n => supplyPileLeft(n) > 0);
      if (k3.length) return k3[0];
    }
    if (player.coins >= 2 && supplyPileLeft("Estate") > 0 && supplyPileLeft("Province") <= 2) return "Estate";
    return null;
  }

  function clearAiTimer() {
    if (state.aiTimer) { clearTimeout(state.aiTimer); state.aiTimer = 0; }
  }

  /* ── Game End ── */
  function finishGame() {
    const results = state.players.map(p => ({
      name: p.name,
      vp: countVP(p),
      human: p.human
    })).sort((a, b) => b.vp - a.vp);

    if (state.startedAt && window.FANTASY_PLAYER_STATS) {
      const human = results.find((r) => r.human);
      if (human) {
        const isWin = results[0] && results[0].human;
        window.FANTASY_PLAYER_STATS.recordGame({
          gameType: "dominion",
          result: isWin ? "win" : "loss",
          score: human.vp || 0,
          durationSec: Math.max(0, Math.floor((Date.now() - state.startedAt) / 1000)),
          playerCount: state.players.length,
          deckList: null,
        });
      }
    }
    addLog("=== 게임 종료 ===");
    results.forEach((r, i) => {
      addLog(`${i + 1}위: ${r.name} — ${r.vp} VP`);
    });

    const winner = results[0];
    addLog(`🏆 ${winner.name} 승리! (${winner.vp} VP)`);
    renderAll();
  }

  /* ── Game Start ── */
  function startGame() {
    state.startedAt = Date.now();
    state.aiDifficulty = els.difficultySelect?.value || els.aiDifficultySelect?.value || "normal";
    clearAiTimer();
    const count = Math.min(4, Math.max(2, Number(els.playerCount?.value || 3)));

    // Pick 10 kingdom cards
    state.kingdomCards = shuffle([...KINGDOM_CARDS]).slice(0, KINGDOM_SUPPLY_COUNT);

    // Build supply
    state.supply = {};
    state.supply["Copper"] = Array(60).fill(null).map(() => makeCard(TREASURES.copper));
    state.supply["Silver"] = Array(40).fill(null).map(() => makeCard(TREASURES.silver));
    state.supply["Gold"] = Array(30).fill(null).map(() => makeCard(TREASURES.gold));
    state.supply["Estate"] = Array(count <= 2 ? 8 : 12).fill(null).map(() => makeCard(VICTORIES.estate));
    state.supply["Duchy"] = Array(count <= 2 ? 8 : 12).fill(null).map(() => makeCard(VICTORIES.duchy));
    state.supply["Province"] = Array(count <= 2 ? 8 : 12).fill(null).map(() => makeCard(VICTORIES.province));
    state.cursePile = count === 2 ? 10 : count === 3 ? 20 : 30;
    state.supply["Curse"] = Array(state.cursePile).fill(null).map(() => makeCard(CURSE_CARD));

    state.kingdomCards.forEach(k => {
      state.supply[k.name] = Array(10).fill(null).map(() => makeCard(k));
    });

    state.players = buildPlayers(count);
    state.trash = [];
    state.turnCount = 0;
    state.log = [];
    state.phase = "action";

    addLog(`👑 도미니언 게임 시작! ${count}명 참가.`);
    addLog(`킹덤 카드: ${state.kingdomCards.map(k => k.name).join(", ")}`);

    document.body.classList.add("dominion-playing");
    els.setupPanel?.classList.add("hidden");
    els.gamePanel?.classList.remove("hidden");

    beginTurn(0);
  }

  function resetToSetup() {
    clearAiTimer();
    document.body.classList.remove("dominion-playing");
    document.body.classList.add("dominion-active");
    els.gamePanel?.classList.add("hidden");
    els.setupPanel?.classList.remove("hidden");
  }

  async function leaveGame() {
    const ok = await window.showConfirm({
      title: "첫 화면으로",
      message: "게임이 진행 중이면 진행 상황이 사라집니다.\n첫 화면으로 돌아가시겠습니까?",
      confirmText: "첫 화면으로",
      cancelText: "취소",
      tone: "danger",
      icon: "⚠️"
    });
    if (!ok) return;
    window.location.href = "./index.html";
  }

  /* ── Init ── */
  /* ── Tutorial (Interactive) ── */
  let tutorialActive = false;
  let tutorialStepIdx = 0;

  const TUT = {
    overlay: () => document.querySelector("#dominionTutorialOverlay"),
    tooltip: () => document.querySelector("#dominionTutorialTooltip"),
    title: () => document.querySelector("#dominionTutorialTooltipTitle"),
    body: () => document.querySelector("#dominionTutorialTooltipBody"),
    nextBtn: () => document.querySelector("#dominionTutorialTooltipNext"),
    highlight: () => document.querySelector("#dominionTutorialHighlight")
  };

  function showTutTooltip(targetSelector, title, body, btnText, onNext) {
    const target = document.querySelector(targetSelector);
    const overlay = TUT.overlay();
    const tooltip = TUT.tooltip();
    const highlight = TUT.highlight();
    if (!overlay || !tooltip) return;

    overlay.classList.remove("hidden");
    if (TUT.title()) TUT.title().textContent = title;
    if (TUT.body()) TUT.body().innerHTML = body;
    const btn = TUT.nextBtn();
    if (btn) btn.textContent = btnText || "다음";

    // Position tooltip near target
    if (target) {
      const rect = target.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      let top = rect.top - tooltipRect.height - 16;
      let left = rect.left + rect.width / 2 - tooltipRect.width / 2;
      if (top < 10) top = rect.bottom + 16;
      if (left < 10) left = 10;
      if (left + tooltipRect.width > window.innerWidth - 10) left = window.innerWidth - tooltipRect.width - 10;
      tooltip.style.top = `${top}px`;
      tooltip.style.left = `${left}px`;

      // Highlight ring
      highlight.style.top = `${rect.top - 4}px`;
      highlight.style.left = `${rect.left - 4}px`;
      highlight.style.width = `${rect.width + 8}px`;
      highlight.style.height = `${rect.height + 8}px`;
      highlight.style.display = "block";
    } else {
      tooltip.style.top = "50%";
      tooltip.style.left = "50%";
      tooltip.style.transform = "translate(-50%, -50%)";
      highlight.style.display = "none";
    }

    if (btn) {
      const handler = () => {
        btn.removeEventListener("click", handler);
        if (onNext) onNext();
      };
      btn.addEventListener("click", handler);
    }
  }

  function hideTutOverlay() {
    TUT.overlay()?.classList.add("hidden");
    TUT.highlight().style.display = "none";
  }

  function startInteractiveTutorial() {
    tutorialActive = true;
    tutorialStepIdx = 0;
    startGame();
    // Override first few cards for predictable tutorial
    setTimeout(() => tutStep1(), 500);
  }

  function tutStep1() {
    showTutTooltip(null,
      "1단계: 환영합니다!",
      `이 게임에서 당신은 <strong>덱 빌딩</strong>을 합니다.<br><br>
       현재 손패에 <strong>7장의 Copper</strong>와 <strong>3장의 Estate</strong>가 있습니다.<br><br>
       Copper는 보물 카드로, 구매 단계에서 코인이 됩니다.<br>
       Estate는 승점 카드로, 게임 끝나면 점수를 줍니다.`,
      "다음 →",
      () => tutStep2()
    );
  }

  function tutStep2() {
    showTutTooltip("#dominionSupply",
      "2단계: 공급처",
      `이곳이 <strong>공급처</strong>입니다. 여기서 카드를 구매합니다.<br><br>
       각 카드 옆에 가격과 남은 수량이 표시됩니다.<br>
       보라색은 <strong>승점</strong>, 노란색은 <strong>보물</strong>, 회색은 <strong>행동 카드</strong>입니다.`,
      "다음 →",
      () => tutStep3()
    );
  }

  function tutStep3() {
    showTutTooltip("#dominionHand",
      "3단계: 내 패",
      `이곳이 <strong>내 패</strong>입니다.<br><br>
       현재 행동 단계입니다. 행동 카드(회색)가 있다면 클릭해서 사용하세요.<br>
       행동 카드가 없으면 <strong>"턴 종료"</strong> 버튼을 눌러 구매 단계로 넘어가세요.`,
      "알겠습니다!",
      () => {
        hideTutOverlay();
        // Wait for player to end turn or play action
        state._tutWaitingForBuy = true;
      }
    );
  }

  // Hook into render to check tutorial state
  const origRenderAll = renderAll;
  function tutRenderAll() {
    origRenderAll();
    if (!tutorialActive) return;

    if (state._tutWaitingForBuy && state.phase === "buy") {
      state._tutWaitingForBuy = false;
      setTimeout(() => tutStep4(), 300);
    }
    if (state._tutWaitingForSupply && (state.phase === "buy" || state.phase === "action")) {
      // Check if a card was bought
    }
  }
  // Patch renderAll to include tutorial hooks
  const _origRenderAll = renderAll;

  function tutStep4() {
    showTutTooltip(null,
      "4단계: 구매 단계",
      `이제 <strong>구매 단계</strong>입니다!<br><br>
       손패의 보물 카드(갈색)를 클릭하면 코인이 됩니다.<br>
       <strong>"전부 사용"</strong> 버튼으로 한 번에 사용할 수도 있어요.<br><br>
       코인이 모이면 공급처에서 카드를 클릭해 구매하세요!<br>
       초반에는 <strong>Silver(₩3)</strong>를 사는 것이 좋습니다.`,
      "전부 사용 버튼을 눌러보세요!",
      () => {
        hideTutOverlay();
        state._tutWaitingForBuyCard = true;
      }
    );
  }

  function init() {
    els.startButton?.addEventListener("click", startGame);
    els.newGameButton?.addEventListener("click", resetToSetup);
    els.exitButton?.addEventListener("click", leaveGame);
    els.backButton?.addEventListener("click", leaveGame);
    els.rulesButton?.addEventListener("click", () => { if (typeof els.rulesDialog?.showModal === "function" && !els.rulesDialog.open) els.rulesDialog.showModal(); });
    els.rulesDialog?.addEventListener("click", e => { if (e.target === els.rulesDialog) els.rulesDialog.close(); });
    els.playAllBtn?.addEventListener("click", () => { if (activePlayer()?.human) playAllTreasures(activePlayer()); });
    els.endBuyBtn?.addEventListener("click", () => { if (activePlayer()?.human && state.phase === "buy") endBuyPhase(); });
    els.endTurnBtn?.addEventListener("click", () => {
      const p = activePlayer();
      if (!p?.human) return;
      if (state.phase === "action") { state.phase = "buy"; renderAll(); return; }
      if (state.phase === "buy") endBuyPhase();
    });
    els.zoomOutButton?.addEventListener("click", () => adjustDominionZoom(-DOMINION_ZOOM_STEP_PERCENT));
    els.zoomInButton?.addEventListener("click", () => adjustDominionZoom(DOMINION_ZOOM_STEP_PERCENT));
    initializeDominionZoomControls();

    // Tutorial button - starts interactive tutorial
    const tutorialBtn = document.querySelector("#dominionTutorialButton");
    tutorialBtn?.addEventListener("click", startInteractiveTutorial);

    document.body.classList.remove("app-loading");
    document.querySelector("#loadingOverlay")?.classList.add("hidden");
  }

  init();
  window.DominionGame = { start: startGame, leave: leaveGame };
})();
