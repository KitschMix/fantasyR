/* ===== 스플렌더 (Splendor) ===== */
(function () {
  "use strict";

  /* ── Gem Types ── */
  const GEMS = ["diamond", "sapphire", "emerald", "ruby", "onyx"];
  const GEM_LABELS = { diamond: "다이아", sapphire: "사파이어", emerald: "에메랄드", ruby: "루비", onyx: "오닉스", gold: "골드" };
  const GEM_COLORS = { diamond: "#e8e4da", sapphire: "#5da9e9", emerald: "#60b86e", ruby: "#de3b35", onyx: "#4a4a4a", gold: "#f0c84b" };
  const WIN_SCORE = 15;

  const CARD_BG_IMAGES = {
    diamond: "assets/splendor/다이아몬드카드.jpg?v=2",
    sapphire: "assets/splendor/사파이어카드.jpg?v=2",
    emerald: "assets/splendor/에메랄드.jpg?v=2",
    ruby: "assets/splendor/루비카드.jpg?v=2",
    onyx: "assets/splendor/오닉스카드.jpg?v=2"
  };

  const NOBLE_IMAGES = [
    "assets/splendor/쉴레이만 1세.jpg",
    "assets/splendor/안 드 브르타뉴.jpg",
    "assets/splendor/엘리자베트.jpg",
    "assets/splendor/이사벨 1세.jpg",
    "assets/splendor/카트린 드 메디시스.jpg",
    "assets/splendor/프랑수아 1세.jpg",
    "assets/splendor/헨리 8세.jpg"
  ];

  /* ── Noble Tiles ── */
  const NOBLE_TILES = [
    { points: 3, requires: { ruby: 4, onyx: 4 } },
    { points: 3, requires: { ruby: 4, emerald: 4 } },
    { points: 3, requires: { sapphire: 4, emerald: 4 } },
    { points: 3, requires: { diamond: 4, sapphire: 4 } },
    { points: 3, requires: { diamond: 4, onyx: 4 } },
    { points: 3, requires: { diamond: 3, ruby: 3, emerald: 3 } },
    { points: 3, requires: { ruby: 3, sapphire: 3, onyx: 3 } },
    { points: 3, requires: { diamond: 3, sapphire: 3, emerald: 3 } },
    { points: 3, requires: { sapphire: 3, emerald: 3, onyx: 3 } },
    { points: 3, requires: { diamond: 3, ruby: 3, onyx: 3 } }
  ];

  /* ── Card Definitions (tier → cards) ── */
  // Each card: { cost: {gem: n}, bonus: gem, points: n }
  function generateTier1() {
    return shuffle([
      { cost: {}, bonus: "emerald", points: 0 },
      { cost: {}, bonus: "sapphire", points: 0 },
      { cost: {}, bonus: "ruby", points: 0 },
      { cost: {}, bonus: "onyx", points: 0 },
      { cost: {}, bonus: "diamond", points: 0 },
      { cost: { emerald: 1, sapphire: 1, ruby: 1 }, bonus: "onyx", points: 0 },
      { cost: { emerald: 1, sapphire: 1, onyx: 1 }, bonus: "ruby", points: 0 },
      { cost: { diamond: 1, sapphire: 1, ruby: 1 }, bonus: "emerald", points: 0 },
      { cost: { diamond: 1, emerald: 1, onyx: 1 }, bonus: "ruby", points: 0 },
      { cost: { diamond: 1, ruby: 1, onyx: 1 }, bonus: "sapphire", points: 0 },
      { cost: { sapphire: 2, ruby: 1 }, bonus: "emerald", points: 0 },
      { cost: { emerald: 2, onyx: 1 }, bonus: "diamond", points: 0 },
      { cost: { diamond: 2, sapphire: 1 }, bonus: "ruby", points: 0 },
      { cost: { ruby: 2, onyx: 1 }, bonus: "sapphire", points: 0 },
      { cost: { diamond: 1, emerald: 2 }, bonus: "onyx", points: 0 },
      { cost: { sapphire: 2 }, bonus: "ruby", points: 0 },
      { cost: { emerald: 2 }, bonus: "diamond", points: 0 },
      { cost: { ruby: 2 }, bonus: "onyx", points: 0 },
      { cost: { onyx: 2 }, bonus: "sapphire", points: 0 },
      { cost: { diamond: 2 }, bonus: "emerald", points: 0 },
      { cost: { sapphire: 1, emerald: 1, ruby: 1, onyx: 1 }, bonus: "diamond", points: 1 },
      { cost: { diamond: 1, emerald: 1, ruby: 1, onyx: 1 }, bonus: "sapphire", points: 1 },
      { cost: { diamond: 1, sapphire: 1, ruby: 1, onyx: 1 }, bonus: "emerald", points: 1 },
      { cost: { diamond: 1, sapphire: 1, emerald: 1, onyx: 1 }, bonus: "ruby", points: 1 },
      { cost: { diamond: 1, sapphire: 1, emerald: 1, ruby: 1 }, bonus: "onyx", points: 1 },
      { cost: { emerald: 3, sapphire: 1, onyx: 1 }, bonus: "ruby", points: 1 },
      { cost: { ruby: 3, diamond: 1, sapphire: 1 }, bonus: "onyx", points: 1 },
      { cost: { onyx: 3, emerald: 1, ruby: 1 }, bonus: "diamond", points: 1 },
      { cost: { diamond: 3, sapphire: 1, onyx: 1 }, bonus: "emerald", points: 1 },
      { cost: { sapphire: 3, emerald: 1, ruby: 1 }, bonus: "diamond", points: 1 },
      { cost: { emerald: 2, sapphire: 2 }, bonus: "ruby", points: 1 },
      { cost: { ruby: 2, onyx: 2 }, bonus: "diamond", points: 1 },
      { cost: { diamond: 2, emerald: 2 }, bonus: "onyx", points: 1 },
      { cost: { sapphire: 2, ruby: 2 }, bonus: "emerald", points: 1 },
      { cost: { onyx: 2, diamond: 2 }, bonus: "sapphire", points: 1 },
      { cost: { emerald: 3, onyx: 2 }, bonus: "diamond", points: 0 },
      { cost: { ruby: 3, diamond: 2 }, bonus: "onyx", points: 0 },
      { cost: { onyx: 3, emerald: 2 }, bonus: "ruby", points: 0 },
      { cost: { diamond: 3, sapphire: 2 }, bonus: "emerald", points: 0 },
      { cost: { sapphire: 3, ruby: 2 }, bonus: "diamond", points: 0 }
    ]);
  }

  function generateTier2() {
    return shuffle([
      { cost: { emerald: 3, ruby: 2, onyx: 2 }, bonus: "diamond", points: 2 },
      { cost: { diamond: 3, ruby: 2, onyx: 2 }, bonus: "sapphire", points: 2 },
      { cost: { diamond: 2, sapphire: 3, onyx: 2 }, bonus: "emerald", points: 2 },
      { cost: { diamond: 2, sapphire: 2, ruby: 3 }, bonus: "onyx", points: 2 },
      { cost: { sapphire: 2, emerald: 3, ruby: 2 }, bonus: "diamond", points: 2 },
      { cost: { onyx: 4, emerald: 1 }, bonus: "ruby", points: 2 },
      { cost: { diamond: 4, ruby: 1 }, bonus: "sapphire", points: 2 },
      { cost: { emerald: 4, onyx: 1 }, bonus: "diamond", points: 2 },
      { cost: { ruby: 4, sapphire: 1 }, bonus: "onyx", points: 2 },
      { cost: { sapphire: 4, diamond: 1 }, bonus: "emerald", points: 2 },
      { cost: { emerald: 5 }, bonus: "ruby", points: 2 },
      { cost: { ruby: 5 }, bonus: "onyx", points: 2 },
      { cost: { diamond: 5 }, bonus: "sapphire", points: 2 },
      { cost: { onyx: 5 }, bonus: "diamond", points: 2 },
      { cost: { sapphire: 5 }, bonus: "emerald", points: 2 },
      { cost: { onyx: 3, diamond: 3, emerald: 2 }, bonus: "ruby", points: 3 },
      { cost: { emerald: 3, sapphire: 3, ruby: 2 }, bonus: "onyx", points: 3 },
      { cost: { ruby: 3, onyx: 3, diamond: 2 }, bonus: "emerald", points: 3 },
      { cost: { sapphire: 3, emerald: 3, onyx: 2 }, bonus: "diamond", points: 3 },
      { cost: { diamond: 3, ruby: 3, sapphire: 2 }, bonus: "emerald", points: 3 }
    ]);
  }

  function generateTier3() {
    return shuffle([
      { cost: { ruby: 3, onyx: 3, diamond: 3, sapphire: 3 }, bonus: "emerald", points: 4 },
      { cost: { emerald: 3, ruby: 3, sapphire: 3, onyx: 3 }, bonus: "diamond", points: 4 },
      { cost: { diamond: 3, emerald: 3, onyx: 3, ruby: 3 }, bonus: "sapphire", points: 4 },
      { cost: { sapphire: 3, emerald: 3, ruby: 3, diamond: 3 }, bonus: "onyx", points: 4 },
      { cost: { diamond: 3, sapphire: 3, onyx: 3, emerald: 3 }, bonus: "ruby", points: 4 },
      { cost: { onyx: 7 }, bonus: "ruby", points: 5 },
      { cost: { ruby: 7 }, bonus: "onyx", points: 5 },
      { cost: { emerald: 7 }, bonus: "diamond", points: 5 },
      { cost: { diamond: 7 }, bonus: "sapphire", points: 5 },
      { cost: { sapphire: 7 }, bonus: "emerald", points: 5 },
      { cost: { onyx: 6, ruby: 3 }, bonus: "diamond", points: 4 },
      { cost: { diamond: 6, sapphire: 3 }, bonus: "onyx", points: 4 },
      { cost: { emerald: 6, onyx: 3 }, bonus: "ruby", points: 4 },
      { cost: { ruby: 6, emerald: 3 }, bonus: "sapphire", points: 4 },
      { cost: { sapphire: 6, diamond: 3 }, bonus: "emerald", points: 4 },
      { cost: { ruby: 5, diamond: 3, onyx: 3 }, bonus: "emerald", points: 5 },
      { cost: { emerald: 5, sapphire: 3, ruby: 3 }, bonus: "onyx", points: 5 },
      { cost: { onyx: 5, emerald: 3, diamond: 3 }, bonus: "ruby", points: 5 },
      { cost: { diamond: 5, onyx: 3, ruby: 3 }, bonus: "sapphire", points: 5 },
      { cost: { sapphire: 5, ruby: 3, emerald: 3 }, bonus: "diamond", points: 5 }
    ]);
  }

  /* ── DOM ── */
  const $ = (sel) => document.querySelector(sel);
  const els = {
    setupPanel:     $("#splendorSetupPanel"),
    gamePanel:      $("#splendorGamePanel"),
    startButton:    $("#startSplendorButton"),
    playerCount:    $("#splendorPlayerCountSelect"),
    backButton:     $("#splendorBackButton"),
    newGameButton:  $("#splendorNewGameButton"),
    exitButton:     $("#splendorExitButton"),
    rulesButton:    $("#splendorRulesButton"),
    rulesDialog:    $("#splendorRulesDialog"),
    playersList:    $("#splendorPlayersList"),
    turnLabel:      $("#splendorTurnLabel"),
    phaseLabel:     $("#splendorPhaseLabel"),
    nobles:         $("#splendorNobles"),
    tier1:          $("#splendorTier1"),
    tier2:          $("#splendorTier2"),
    tier3:          $("#splendorTier3"),
    tokens:         $("#splendorTokens"),
    myBonuses:      null,
    myCards:        $("#splendorMyCards"),
    myReserved:     $("#splendorMyReserved"),
    endTurnButton:  null,
    log:            $("#splendorLog"),
    zoomOutButton:  $("#splendorZoomOutButton"),
    zoomInButton:   $("#splendorZoomInButton"),
    zoomLabel:      $("#splendorZoomLabel"),
    discardDialog:   $("#splendorDiscardDialog"),
    discardContainer: $("#splendorDiscardContainer"),
    discardConfirmButton: $("#splendorDiscardConfirmButton"),
    discardNeededCount: $("#splendorDiscardNeededCount"),
    nobleSelectionDialog: $("#splendorNobleSelectionDialog"),
    nobleSelectionContainer: $("#splendorNobleSelectionContainer")
  };

  /* ── State ── */
  const state = {
    players: [],
    currentPlayer: 0,
    phase: "idle",
    tokenBank: {},
    tiers: { 1: [], 2: [], 3: [] },
    visibleCards: { 1: [], 2: [], 3: [] },
    nobles: [],
    log: [],
    selectedTokens: [],
    selectedCard: null,
    turnCount: 0,
    lastRoundTriggered: false
  };

  /* ── Profiles ── */
  const SHARED_PROFILES = window.FANTASY_SHARED_PROFILES || {};
  const PROFILE_ASSET_ROOT = SHARED_PROFILES.root || "assets/profiles/user";
  function profileImageUrl(f) { return encodeURI(`${PROFILE_ASSET_ROOT}/${f}`); }
  function aiProfiles() {
    const groups = SHARED_PROFILES.groups || {};
    return (SHARED_PROFILES.difficultyKeys || ["normal", "hard", "expert"])
      .flatMap(k => (groups[k] || []).map(p => ({ ...p, difficulty: k })));
  }

  /* ── Helpers ── */
  function shuffle(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
  function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
  function esc(v) { return String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function addLog(msg) { state.log.unshift(msg); state.log = state.log.slice(0, 40); }
  function activePlayer() { return state.players[state.currentPlayer]; }
  function tokenCount(playerCount) { return playerCount === 2 ? 4 : playerCount === 3 ? 5 : 7; }

  /* ── Gem Color Helpers ── */
  const GEM_ICONS = { diamond: "💎", sapphire: "🔷", emerald: "🟢", ruby: "🔴", onyx: "⬛", gold: "⭐" };
  const GEM_IMAGES = { diamond: "assets/splendor/diamond.png", sapphire: "assets/splendor/sapphire.png", emerald: "assets/splendor/emerald.png", ruby: "assets/splendor/ruby.png", onyx: "assets/splendor/onyx.png", gold: "assets/splendor/gold.png" };

  function gemImg(gem, size = 20) {
    return `<img src="${GEM_IMAGES[gem]}" alt="${GEM_LABELS[gem]}" style="width:${size}px;height:${size}px;object-fit:contain;vertical-align:middle;" loading="lazy" />`;
  }

  function gemPip(gem, count) {
    return `<span class="splendor-cost-pip">${gemImg(gem, 24)}<span class="splendor-cost-num">${count}</span></span>`;
  }
  function gemMini(gem, count) {
    return `<span class="splendor-mini-gem">${gemImg(gem, 28)}${count}</span>`;
  }
  function tokenEl(gem, count, disabled) {
    return `<span class="splendor-token${disabled ? " disabled" : ""}" data-gem="${gem}" title="${GEM_LABELS[gem]} ${count}개">
      ${gemImg(gem, 100)}<span class="splendor-token-count">${count}</span>
    </span>`;
  }

  /* ── Card Rendering ── */
  function cardHtml(card, index, tier, reserved) {
    const costHtml = Object.entries(card.cost)
      .filter(([, n]) => n > 0)
      .map(([g, n]) => gemPip(g, n)).join("");
    const tierColors = { 1: "#6a8a6a", 2: "#8a6a3a", 3: "#5a3a6a" };
    const p = activePlayer();
    const affordable = p && p.human && !reserved && canAffordWithGems(card, p) && state.phase === "action";
    const bgUrl = CARD_BG_IMAGES[card.bonus];
    return `<div class="splendor-card${reserved ? " splendor-card-reserved" : ""}${state.selectedCard?.tier === tier && state.selectedCard?.index === index ? " selected" : ""}${affordable ? " affordable" : ""}"
      data-tier="${tier}" data-index="${index}" ${reserved ? 'data-reserved="1"' : ""}
      style="border-top: 4px solid ${tierColors[tier] || "var(--line)"}; background-image: url('${bgUrl}'); background-size: cover; background-position: center;">
      <div class="splendor-card-top">
        <span class="splendor-card-points">${card.points ? "★".repeat(Math.min(card.points, 5)) : ""}</span>
        <span class="splendor-card-bonus" title="${GEM_LABELS[card.bonus]} 보너스">${gemImg(card.bonus, 40)}</span>
      </div>
      <div class="splendor-card-middle"></div>
      <div class="splendor-card-cost">${costHtml}</div>
    </div>`;
  }

  function cardBackHtml(tier) {
    const deck = state.tiers[tier];
    return `<div class="splendor-card-back" data-tier="${tier}" style="background-image: url('assets/splendor/티어${tier}.jpg?v=2'); background-size: cover; background-position: center;">
      <span class="splendor-deck-count">${deck.length}</span>
    </div>`;
  }

  /* ── Noble Rendering ── */
  function nobleHtml(noble, index) {
    const reqHtml = Object.entries(noble.requires)
      .map(([g, n]) => `<span class="splendor-noble-req-gem">${gemImg(g, 22)}${n}</span>`).join("");
    return `<div class="splendor-noble" data-nindex="${index}" style="background-image: url('${noble.img}'); background-size: cover; background-position: center;">
      <span class="splendor-noble-points">★${noble.points}</span>
      <div class="splendor-noble-req">${reqHtml}</div>
    </div>`;
  }

  /* ── Player Rendering ── */
  function renderPlayers() {
    if (!els.playersList) return;
    els.playersList.innerHTML = "";
    state.players.forEach((p, i) => {
      const card = document.createElement("section");
      card.className = `splendor-player-card${i === state.currentPlayer ? " active" : ""}`;
      card.dataset.playerIndex = i;
      const gemsHtml = Object.entries(p.gems)
        .filter(([, n]) => n > 0)
        .map(([g, n]) => gemMini(g, n)).join("");
      const bonusHtml = Object.entries(p.bonuses)
        .filter(([, n]) => n > 0)
        .map(([g, n]) => gemMini(g, n)).join("");
      card.innerHTML = `
        <div class="splendor-player-header">
          <img class="splendor-player-avatar" src="${esc(p.avatarUrl)}" alt="" />
          <span class="splendor-player-name">${esc(p.name)}</span>
          <span class="splendor-player-score">${p.points}점</span>
        </div>
        <div class="splendor-player-gems-label">💎 보석</div>
        <div class="splendor-player-gems">${gemsHtml || "<small style='color:var(--muted)'>없음</small>"}</div>
        <div class="splendor-player-gems-label">⭐ 보너스</div>
        <div class="splendor-player-gems">${bonusHtml || "<small style='color:var(--muted)'>없음</small>"}</div>
      `;
      els.playersList.appendChild(card);
    });
    // Re-attach any active speech bubble that renderAll wiped out (e.g. after a buy/gem action).
    DIALOGUE._reapplyActiveBubble();
  }

  /* ── Board Rendering ── */
  function renderNobles() {
    if (!els.nobles) return;
    els.nobles.innerHTML = state.nobles.map((n, i) => nobleHtml(n, i)).join("");
  }

  function renderTiers() {
    [1, 2, 3].forEach(tier => {
      const container = els[`tier${tier}`];
      if (!container) return;
      const deckBack = state.tiers[tier].length ? cardBackHtml(tier) : "";
      const cards = state.visibleCards[tier].map((c, i) => c ? cardHtml(c, i, tier) : "").join("");
      container.innerHTML = deckBack + cards;
    });
  }

  function renderTokens() {
    if (!els.tokens) return;
    const p = activePlayer();
    const totalTokens = Object.values(p.gems).reduce((s, n) => s + n, 0);
    const hasSelection = state.selectedTokens.length > 0;

    const bankAvailableGems = GEMS.filter(g => (state.tokenBank[g] || 0) > 0);
    const numAvailableColors = bankAvailableGems.length;
    const bankLabel = document.querySelector(".splendor-bank-label");
    if (bankLabel) {
      if (numAvailableColors < 3 && numAvailableColors > 0) {
        bankLabel.textContent = `🏦 은행 (가져갈 수 있는 보석이 3종류 미만이므로, ${numAvailableColors}종류만 가져갈 수 있습니다)`;
        bankLabel.style.color = "#ffb020";
      } else {
        bankLabel.textContent = `🏦 은행 (클릭해서 보석 가져오기)`;
        bankLabel.style.color = "";
      }
    }



    els.tokens.innerHTML = [...GEMS, "gold"].map(gem => {
      const count = state.tokenBank[gem] || 0;
      const selected = state.selectedTokens.filter(t => t === gem).length;
      const isGold = gem === "gold";
      const disabled = isGold || count === 0;
      return `<span class="splendor-token${disabled ? " disabled" : ""}${selected ? " selected" : ""}"
        data-gem="${gem}" title="${GEM_LABELS[gem]} ${count}개${selected ? " (선택됨 " + selected + ")" : ""}">
        ${gemImg(gem, 100)}<span class="splendor-token-count">${count}</span>
      </span>`;
    }).join("") +
    (hasSelection ? `<button class="splendor-cancel-tokens" type="button" title="선택 취소">✕ 취소</button>` : "");

    // Show selected summary
    const summaryEl = document.getElementById("splendorSelectedSummary");
    if (summaryEl) {
      if (hasSelection) {
        const counts = {};
        state.selectedTokens.forEach(g => { counts[g] = (counts[g] || 0) + 1; });
        summaryEl.innerHTML = Object.entries(counts)
          .map(([g, n]) => `<span class="splendor-selected-item">${gemImg(g, 22)} ${GEM_LABELS[g]} ×${n}</span>`)
          .join("");
        summaryEl.classList.remove("hidden");
      } else {
        summaryEl.classList.add("hidden");
      }
    }

    // Bind click
    els.tokens.querySelectorAll(".splendor-token:not(.disabled)").forEach(el => {
      el.addEventListener("click", () => onTokenClick(el.dataset.gem));
    });

    // Cancel button
    const cancelBtn = els.tokens.querySelector(".splendor-cancel-tokens");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        state.selectedTokens = [];
        renderTokens();
        renderControls();
      });
    }
  }

  function renderMyBonuses() {
    if (!els.myCards) return;
    const p = activePlayer();
    if (!p.cards.length) {
      els.myCards.innerHTML = "<small style='color:var(--muted)'>아직 없음</small>";
      return;
    }
    els.myCards.innerHTML = p.cards.map(c => {
      const bonusHtml = gemMini(c.bonus, 1);
      return `<span class="splendor-mini-card" title="${GEM_LABELS[c.bonus]} ${c.points ? '★'+c.points : ''}">${bonusHtml}</span>`;
    }).join("");
  }

  function renderMyReserved() {
    if (!els.myReserved) return;
    const p = activePlayer();
    if (!p.reserved.length) {
      els.myReserved.innerHTML = "<small style='color:var(--muted)'>없음</small>";
      return;
    }
    const tierColors = { 1: "#6a8a6a", 2: "#8a6a3a", 3: "#5a3a6a" };
    els.myReserved.innerHTML = p.reserved.map((c, i) => {
      const costHtml = Object.entries(c.cost).filter(([, n]) => n > 0).map(([g, n]) => gemPip(g, n)).join("");
      const affordable = canAffordWithGems(c, p) && state.phase === "action";
      const bgUrl = CARD_BG_IMAGES[c.bonus];
      const reserverName = c._reservedBy || p.name;
      return `<div class="splendor-card splendor-card-reserved${affordable ? " affordable" : ""}"
        data-rindex="${i}" title="예약 카드 ${i + 1} — 클릭해서 구매"
        style="border-top: 4px solid ${tierColors[c.tier] || "var(--line)"}; background-image: url('${bgUrl}'); background-size: cover; background-position: center; position: relative;">
        <div class="splendor-card-top">
          <span class="splendor-card-points">${c.points ? "★".repeat(Math.min(c.points, 5)) : ""}</span>
          <span class="splendor-card-bonus">${gemImg(c.bonus, 40)}</span>
        </div>
        <div class="splendor-card-middle"></div>
        <div class="splendor-card-cost">${costHtml}</div>
        <div class="splendor-reserved-by">${esc(reserverName)}</div>
      </div>`;
    }).join("");
    // Click reserved card to buy it
    els.myReserved.querySelectorAll(".splendor-card-reserved").forEach(el => {
      el.addEventListener("click", () => {
        const ri = Number(el.dataset.rindex);
        if (state.phase !== "action") return;
        attemptBuyReserved(ri);
      });
    });
  }

  function renderControls() {
    const p = activePlayer();
    if (els.turnLabel) els.turnLabel.textContent = `${p.name} 차례`;
    if (els.phaseLabel) {
      if (state.phase === "action") {
        const selCount = state.selectedTokens.length;
        const selSame = selCount === 2 && state.selectedTokens[0] === state.selectedTokens[1];
        const maxSel = selSame ? 2 : 3;
        els.phaseLabel.textContent = selCount > 0
          ? `보석 선택 중 (${selCount}/${maxSel})`
          : "보석 가져오기, 카드 구매, 또는 카드 예약";
      } else {
        const labels = { done: "턴 종료 대기", finished: "게임 종료" };
        els.phaseLabel.textContent = labels[state.phase] || "-";
      }
    }
  }

  function renderLog() {
    if (!els.log) return;
    els.log.innerHTML = state.log.map(m => `<li>${esc(m)}</li>`).join("");
  }

  /* ── Card Hover Preview ── */
  let hoverTimer = 0;
  let hoverCard = null;

  function showCardPreview(card, rect) {
    const preview = document.querySelector("#splendorCardPreview");
    if (!preview || !card) return;
    const costHtml = Object.entries(card.cost)
      .filter(([, n]) => n > 0)
      .map(([g, n]) => gemPip(g, n)).join("");
    const tierColors = { 1: "#6a8a6a", 2: "#8a6a3a", 3: "#5a3a6a" };
    const bgUrl = CARD_BG_IMAGES[card.bonus];
    preview.innerHTML = `<div class="splendor-card" style="border-top: 4px solid ${tierColors[card.tier] || tierColors[1] || "var(--line)"}; background-image: url('${bgUrl}'); background-size: cover; background-position: center;">
      <div class="splendor-card-top">
        <span class="splendor-card-points">${card.points ? "★".repeat(Math.min(card.points, 5)) : ""}</span>
        <span class="splendor-card-bonus">${gemImg(card.bonus, 70)}</span>
      </div>
      <div class="splendor-card-middle"></div>
      <div class="splendor-card-cost">${costHtml}</div>
    </div>`;
    preview.classList.remove("hidden");
    // Force reflow so transition restarts
    void preview.offsetWidth;
    preview.classList.add("visible");
  }

  function hideCardPreview() {
    const preview = document.querySelector("#splendorCardPreview");
    if (!preview) return;
    preview.classList.remove("visible");
    preview.classList.add("hidden");
    hoverCard = null;
  }

  function showNoblePreview(noble, rect) {
    const preview = document.querySelector("#splendorCardPreview");
    if (!preview || !noble) return;
    const reqHtml = Object.entries(noble.requires)
      .map(([g, n]) => `<span class="splendor-cost-pip">${gemImg(g, 40)}<span class="splendor-cost-num">${n}</span></span>`).join("");
    preview.innerHTML = `<div class="splendor-card" style="border-top: 4px solid var(--accent); background-image: url('${noble.img}'); background-size: cover; background-position: center;">
      <div class="splendor-card-top">
        <span class="splendor-card-points">★${noble.points}</span>
      </div>
      <div class="splendor-card-middle"></div>
      <div class="splendor-card-cost" style="flex-direction:column">${reqHtml}</div>
    </div>`;
    preview.classList.remove("hidden");
    void preview.offsetWidth;
    preview.classList.add("visible");
  }

  function initCardHover() {
    // Card hover
    document.addEventListener("mouseover", e => {
      const cardEl = e.target.closest(".splendor-card:not(.splendor-card-back)");
      const nobleEl = e.target.closest(".splendor-noble");
      if (!cardEl && !nobleEl) { clearTimeout(hoverTimer); hideCardPreview(); return; }

      if (cardEl) {
        const tier = Number(cardEl.dataset.tier);
        const index = Number(cardEl.dataset.index);
        if (!tier || isNaN(index)) return;
        const card = state.visibleCards[tier]?.[index];
        if (!card || card === hoverCard) return;
        clearTimeout(hoverTimer);
        hoverCard = card;
        hoverTimer = setTimeout(() => {
          showCardPreview(card, cardEl.getBoundingClientRect());
        }, 300);
      } else if (nobleEl) {
        const nIndex = Number(nobleEl.dataset.nindex);
        if (isNaN(nIndex)) return;
        const noble = state.nobles[nIndex];
        if (!noble || noble === hoverCard) return;
        clearTimeout(hoverTimer);
        hoverCard = noble;
        hoverTimer = setTimeout(() => {
          showNoblePreview(noble, nobleEl.getBoundingClientRect());
        }, 300);
      }
    });
    document.addEventListener("mouseout", e => {
      const el = e.target.closest(".splendor-card, .splendor-noble");
      if (!el) return;
      // Ignore if moving to a child element within the same card/noble
      const related = e.relatedTarget;
      if (related && el.contains(related)) return;
      clearTimeout(hoverTimer);
      hideCardPreview();
    });
  }

  function renderAll() {
    renderPlayers();
    renderNobles();
    renderTiers();
    renderTokens();
    renderMyBonuses();
    renderMyReserved();
    renderControls();
    renderLog();
  }

  /* ── Player Building ── */
  function currentHumanNickname() {
    try {
      const profile = JSON.parse(localStorage.getItem("fantasyKingdom.humanProfile.v1") || "null");
      return String(profile?.nickname || "").trim();
    } catch { return ""; }
  }

  function buildPlayers(count) {
    const pool = shuffle(aiProfiles());
    return Array.from({ length: count }, (_, i) => {
      const isHuman = i === 0;
      const profile = isHuman ? null : pool[i - 1] || { name: `AI ${i}`, avatarUrl: profileImageUrl("보통-건일.jpg") };
      const humanName = currentHumanNickname() || "플레이어";
      return {
        index: i,
        id: isHuman ? "human" : `ai${i}`,
        human: isHuman,
        name: isHuman ? humanName : (profile.name || `AI ${i}`),
        avatarUrl: isHuman ? profileImageUrl("유저.jpg") : profile.avatarUrl,
        difficulty: isHuman ? "normal" : (profile.difficulty || "normal"),
        gems: { diamond: 0, sapphire: 0, emerald: 0, ruby: 0, onyx: 0, gold: 0 },
        bonuses: { diamond: 0, sapphire: 0, emerald: 0, ruby: 0, onyx: 0 },
        points: 0,
        cards: [],
        reserved: [],
        nobles: []
      };
    });
  }

  /* ── Token Math ── */
  function totalTokens(player) {
    return Object.values(player.gems).reduce((s, n) => s + n, 0);
  }

  function effectiveCost(card, player) {
    const cost = {};
    for (const [g, n] of Object.entries(card.cost)) {
      const discount = player.bonuses[g] || 0;
      const needed = Math.max(0, n - discount);
      if (needed > 0) cost[g] = needed;
    }
    return cost;
  }

  function canAffordWithGems(card, player) {
    const cost = effectiveCost(card, player);
    let goldNeeded = 0;
    for (const [g, n] of Object.entries(cost)) {
      const have = player.gems[g] || 0;
      if (have < n) goldNeeded += n - have;
    }
    return goldNeeded <= (player.gems.gold || 0);
  }

  function payForCard(card, player) {
    const cost = effectiveCost(card, player);
    let goldUsed = 0;
    for (const [g, n] of Object.entries(cost)) {
      const have = player.gems[g] || 0;
      const pay = Math.min(have, n);
      player.gems[g] -= pay;
      state.tokenBank[g] += pay;
      const deficit = n - pay;
      if (deficit > 0) goldUsed += deficit;
    }
    player.gems.gold -= goldUsed;
    state.tokenBank.gold += goldUsed;
    player.bonuses[card.bonus] = (player.bonuses[card.bonus] || 0) + 1;
    player.points += card.points;
    player.cards.push(card);
  }

  /* ── Noble Check ── */
  function checkNobles(player) {
    const qualifying = state.nobles.filter(noble => {
      return Object.entries(noble.requires).every(([g, n]) => (player.bonuses[g] || 0) >= n);
    });
    if (qualifying.length > 0) {
      const noble = qualifying[0];
      player.nobles.push(noble);
      player.points += noble.points;
      state.nobles = state.nobles.filter(n => n !== noble);
      return [noble];
    }
    return [];
  }

  function showNobleSelectionDialog(player, qualifying) {
    if (!els.nobleSelectionDialog || !els.nobleSelectionContainer) return;
    
    els.nobleSelectionContainer.innerHTML = qualifying.map((noble, idx) => {
      const imgPath = noble.img ? noble.img : "assets/splendor/쉴레이만 1세.jpg";
      const requirements = Object.entries(noble.requires)
        .map(([g, n]) => `<span style="margin-right: 6px;">${gemImg(g, 18)} ×${n}</span>`)
        .join(" ");
        
      return `
        <div class="splendor-noble-selection-row">
          <div class="splendor-noble-selection-info">
            <img class="splendor-noble-selection-img" src="${imgPath}" alt="${esc(noble.name)}" />
            <div>
              <div class="splendor-noble-selection-name">${esc(noble.name)} (+${noble.points}점)</div>
              <div style="font-size: 12px; color: var(--muted); margin-top: 4px;">요구 조건: ${requirements}</div>
            </div>
          </div>
          <button class="primary-button splendor-select-noble-btn" data-index="${idx}" type="button">영입</button>
        </div>
      `;
    }).join("");
    
    // Bind clicks
    els.nobleSelectionContainer.querySelectorAll(".splendor-select-noble-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.index);
        const noble = qualifying[idx];
        player.nobles.push(noble);
        player.points += noble.points;
        state.nobles = state.nobles.filter(n => n !== noble);
        addLog(`${player.name}: 귀족 획득! (+${noble.points}점)`);
        
        if (typeof els.nobleSelectionDialog.close === "function") {
          els.nobleSelectionDialog.close();
        }
        
        state.phase = "done";
        state.selectedCard = null;
        renderAll();
        endTurn();
      });
    });
    
    if (typeof els.nobleSelectionDialog.showModal === "function") {
      els.nobleSelectionDialog.showModal();
    }
  }

  /* ── Draw Card ── */
  function drawCard(tier) {
    if (!state.tiers[tier].length) return null;
    return state.tiers[tier].shift();
  }

  /* ── Token Selection ── */
  function showTokenBubble(gem, msg) {
    // Remove any existing bubble
    document.querySelectorAll(".splendor-token-bubble").forEach(b => b.remove());
    const tokenEl = els.tokens?.querySelector(`[data-gem="${gem}"]`);
    if (!tokenEl) return;
    const bubble = document.createElement("div");
    bubble.className = "splendor-token-bubble";
    bubble.textContent = msg;
    tokenEl.appendChild(bubble);
    setTimeout(() => bubble.remove(), 2000);
  }

  function onTokenClick(gem) {
    if (state.phase !== "action" || !activePlayer().human || state._tokensPending) return;

    const p = activePlayer();
    const maxTokens = tokenCount(state.players.length);
    const total = totalTokens(p);

    // Check if we already selected this gem
    const selCount = state.selectedTokens.filter(t => t === gem).length;
    const bankCount = state.tokenBank[gem] || 0;

    // Can't take gold from bank
    if (gem === "gold") return;

    if (selCount >= bankCount) return;

    // Rules: 3 different OR 2 same (if 4+ in bank)
    if (state.selectedTokens.length === 0) {
      // First pick
      state.selectedTokens.push(gem);
    } else if (state.selectedTokens.length === 1) {
      if (state.selectedTokens[0] === gem) {
        // Same gem - need 4+ in bank
        if (bankCount >= 4 && selCount < 2) {
          state.selectedTokens.push(gem);
        } else {
          showTokenBubble(gem, "4개 미만은 2개 가져갈 수 없습니다");
          return;
        }
      } else {
        // Different gem
        state.selectedTokens.push(gem);
      }
    } else if (state.selectedTokens.length === 2) {
      if (state.selectedTokens[0] === state.selectedTokens[1]) {
        // Already have 2 same - can't pick more
        return;
      }
      // 3 different gems
      if (gem !== state.selectedTokens[0] && gem !== state.selectedTokens[1]) {
        state.selectedTokens.push(gem);
      }
    }

    // Check if selection is complete
    const bankAvailableGems = GEMS.filter(g => (state.tokenBank[g] || 0) > 0);
    const numAvailableColors = bankAvailableGems.length;
    const isDoubleTake = state.selectedTokens.length === 2 && state.selectedTokens[0] === state.selectedTokens[1];
    const isDistinctTake = state.selectedTokens.length === Math.min(3, numAvailableColors);

    if (isDoubleTake || (isDistinctTake && state.selectedTokens.length > 0)) {
      // Show selected state first, then take after brief delay (for yellow border feedback)
      state._tokensPending = true;
      renderTokens();
      renderControls();
      setTimeout(() => {
        takeTokens(state.selectedTokens);
        state._tokensPending = false;
      }, 180);
      return;
    }

    renderTokens();
    renderControls();
  }

  function takeTokens(gems) {
    const p = activePlayer();
    // Show "획득" bubbles on each selected gem before removing
    if (p.human) {
      state.phase = "done"; // Lock input immediately
      gems.forEach(g => {
        const tokenEl = els.tokens?.querySelector(`[data-gem="${g}"]`);
        if (tokenEl) {
          const bubble = document.createElement("div");
          bubble.className = "splendor-token-bubble splendor-token-bubble-ok";
          bubble.textContent = "획득!";
          tokenEl.appendChild(bubble);
        }
      });
    }
    gems.forEach(g => {
      p.gems[g] = (p.gems[g] || 0) + 1;
      state.tokenBank[g]--;
    });
    const labels = gems.map(g => GEM_LABELS[g]).join(", ");
    addLog(`${p.name}: 보석 ${labels} 획득`);
    // Dialogue: user gem reaction (random AI)
    if (p.human) {
      const ais = state.players.map((_, i) => i).filter(i => !state.players[i].human);
      if (ais.length) DIALOGUE.speak(ais[Math.floor(Math.random() * ais.length)], "userGem");
    }
    state.selectedTokens = [];
    if (!p.human) state.phase = "done";
    // Delay render slightly so bubbles are visible
    if (p.human) {
      setTimeout(() => {
        renderAll();
        endTurn();
      }, 1000);
    } else {
      renderAll();
    }
  }

  /* ── Card Purchase ── */
  function showBuyAnimation(tier, index, playerName) {
    // Find the card element on the board
    const cardEl = document.querySelector(`.splendor-card[data-tier="${tier}"][data-index="${index}"]:not(.splendor-card-reserved)`);
    if (cardEl) {
      cardEl.classList.add("card-buying");
      // Add bubble
      const bubble = document.createElement("div");
      bubble.className = "splendor-buy-bubble";
      bubble.textContent = `${playerName} 카드 구매!`;
      cardEl.style.position = "relative";
      cardEl.appendChild(bubble);
    }
  }

  function attemptBuyCard(tier, index) {
    const p = activePlayer();
    if (state.phase !== "action" || !p.human) return;
    const card = state.visibleCards[tier]?.[index];
    if (!card) return;
    if (!canAffordWithGems(card, p)) {
      addLog(`${p.name}: 비용 부족으로 구매 불가`);
      renderLog();
      return;
    }
    showBuyAnimation(tier, index, p.name);
    payForCard(card, p);
    // Dialogue: user buy reaction
    if (p.human) {
      const ais = state.players.map((_, i) => i).filter(i => !state.players[i].human);
      if (ais.length) DIALOGUE.speak(ais[Math.floor(Math.random() * ais.length)], "userBuy");
    }
    // Delay card replacement so animation plays
    setTimeout(() => {
      state.visibleCards[tier][index] = drawCard(tier);
      addLog(`${p.name}: ${GEM_LABELS[card.bonus]} 카드 구매 (${card.points}점)`);
      
      const qualifying = state.nobles.filter(noble => {
        return Object.entries(noble.requires).every(([g, n]) => (p.bonuses[g] || 0) >= n);
      });

      if (p.human && qualifying.length > 1) {
        showNobleSelectionDialog(p, qualifying);
      } else {
        const earned = checkNobles(p);
        earned.forEach(n => addLog(`${p.name}: 귀족 획득! (+${n.points}점)`));
        state.phase = "done";
        state.selectedCard = null;
        renderAll();
        if (p.points >= WIN_SCORE) {
          state.lastRoundTriggered = true;
        }
        endTurn();
      }
    }, 2000);
  }

  function attemptBuyReserved(ri) {
    const p = activePlayer();
    if (state.phase !== "action" || !p.human) return;
    const card = p.reserved[ri];
    if (!card) return;
    if (!canAffordWithGems(card, p)) {
      addLog(`${p.name}: 비용 부족으로 예약 카드 구매 불가`);
      renderLog();
      return;
    }
    // Animate reserved card
    const reservedEl = els.myReserved?.querySelector(`[data-rindex="${ri}"]`);
    if (reservedEl) {
      reservedEl.classList.add("card-buying");
      const bubble = document.createElement("div");
      bubble.className = "splendor-buy-bubble";
      bubble.textContent = `${p.name} 예약 카드 구매!`;
      reservedEl.appendChild(bubble);
    }
    payForCard(card, p);
    p.reserved.splice(ri, 1);
    setTimeout(() => {
      addLog(`${p.name}: 예약 카드 구매 (${card.points}점)`);
      
      const qualifying = state.nobles.filter(noble => {
        return Object.entries(noble.requires).every(([g, n]) => (p.bonuses[g] || 0) >= n);
      });

      if (p.human && qualifying.length > 1) {
        showNobleSelectionDialog(p, qualifying);
      } else {
        const earned = checkNobles(p);
        earned.forEach(n => addLog(`${p.name}: 귀족 획득! (+${n.points}점)`));
        state.phase = "done";
        state.selectedCard = null;
        renderAll();
        if (p.points >= WIN_SCORE) {
          state.lastRoundTriggered = true;
        }
        endTurn();
      }
    }, 2000);
  }

  /* ── Card Reservation ── */
  function showReserveAnimation(tier, index, playerName) {
    const cardEl = document.querySelector(`.splendor-card[data-tier="${tier}"][data-index="${index}"]:not(.splendor-card-reserved)`);
    if (cardEl) {
      cardEl.classList.add("card-reserving");
      cardEl.style.position = "relative";
      const bubble = document.createElement("div");
      bubble.className = "splendor-buy-bubble";
      bubble.textContent = `${playerName} 카드 예약!`;
      cardEl.appendChild(bubble);
    }
  }

  function attemptReserve(tier, index) {
    const p = activePlayer();
    if (state.phase !== "action" || !p.human) return;
    if (p.reserved.length >= 3) {
      addLog(`${p.name}: 예약 최대 3장까지만 가능`);
      renderLog();
      return;
    }
    const card = state.visibleCards[tier]?.[index];
    if (!card) {
      // Reserve from deck top
      const deckCard = drawCard(tier);
      if (!deckCard) return;
      p.reserved.push(deckCard);
      deckCard._reservedBy = p.name;
      addLog(`${p.name}: 티어 ${tier} 덱에서 카드 예약`);
    } else {
      showReserveAnimation(tier, index, p.name);
      p.reserved.push(card);
      card._reservedBy = p.name;
      state.visibleCards[tier][index] = drawCard(tier);
      addLog(`${p.name}: 카드 예약`);
    }
    // Take gold if available
    if (state.tokenBank.gold > 0) {
      p.gems.gold++;
      state.tokenBank.gold--;
    }
    // Delay for animation
    setTimeout(() => {
      state.phase = "done";
      state.selectedCard = null;
      renderAll();
      endTurn();
    }, 2000);
  }

  /* ── Return Tokens (max 10) ── */
  let tempDiscard = {};

  function showDiscardDialog(player, needed) {
    if (!els.discardDialog || !els.discardContainer) return;
    
    tempDiscard = {};
    [...GEMS, "gold"].forEach(g => {
      tempDiscard[g] = 0;
    });
    
    if (els.discardNeededCount) {
      els.discardNeededCount.textContent = needed;
    }
    
    renderDiscardDialogContent(player, needed);
    
    if (typeof els.discardDialog.showModal === "function") {
      els.discardDialog.showModal();
    }
  }

  function renderDiscardDialogContent(player, needed) {
    const totalSelected = Object.values(tempDiscard).reduce((a, b) => a + b, 0);
    
    els.discardContainer.innerHTML = [...GEMS, "gold"].map(gem => {
      const owned = player.gems[gem] || 0;
      if (owned === 0) return "";
      const discard = tempDiscard[gem] || 0;
      
      return `
        <div class="splendor-discard-row" data-gem="${gem}">
          <div class="splendor-discard-gem-info">
            ${gemImg(gem, 28)}
            <span>${GEM_LABELS[gem]} (보유: ${owned}개)</span>
          </div>
          <div class="splendor-discard-val">
            ${discard > 0 ? `-${discard}개` : "선택 안 함"}
          </div>
        </div>
      `;
    }).join("");
    
    els.discardContainer.querySelectorAll(".splendor-discard-row").forEach(row => {
      row.addEventListener("click", () => {
        const gem = row.dataset.gem;
        const owned = player.gems[gem] || 0;
        const currentDiscard = tempDiscard[gem] || 0;
        const currentTotalSelected = Object.values(tempDiscard).reduce((a, b) => a + b, 0);
        
        if (currentDiscard < owned && currentTotalSelected < needed) {
          tempDiscard[gem] = currentDiscard + 1;
        } else {
          tempDiscard[gem] = 0;
        }
        
        renderDiscardDialogContent(player, needed);
      });
    });
    
    const newTotalSelected = Object.values(tempDiscard).reduce((a, b) => a + b, 0);
    if (els.discardConfirmButton) {
      els.discardConfirmButton.disabled = newTotalSelected !== needed;
    }
  }

  function autoDiscardExcess(player) {
    while (totalTokens(player) > 10) {
      let minGem = null, minCount = Infinity;
      for (const g of [...GEMS, "gold"]) {
        if (player.gems[g] > 0 && player.gems[g] < minCount) {
          minCount = player.gems[g];
          minGem = g;
        }
      }
      if (minGem) {
        player.gems[minGem]--;
        state.tokenBank[minGem]++;
        addLog(`${player.name}: 보석 ${GEM_LABELS[minGem]} 1개 자동 반납`);
      } else break;
    }
  }

  /* ── AI Logic ── */
  // 난이도별 AI 전략 설정 (디테일한 차별화)
  const AI_DIFFICULTY_CONFIG = {
    easy: {
      mistakeRate: 0.45,           // 높은 실수율
      cardStrategy: "lowest",      // 가장 저렴한 카드 우선
      tokenStrategy: "random",     // 무작위 토큰 가져가기
      considerBonus: false,        // 보너스 효율성 무시
      considerNoble: false,        // 귀족 매칭 무시
      reserveStrategy: "rare",     // 거의 예약 안 함
      avoidStarvation: false,      // 자원 고갈 무시
      preferDoubles: false         // 2개 같은 색 전략 안 씀
    },
    normal: {
      mistakeRate: 0.25,
      cardStrategy: "highest",     // 가장 높은 점수 카드
      tokenStrategy: "needed",     // 부족한 토큰 순
      considerBonus: false,
      considerNoble: false,
      reserveStrategy: "tier3",
      avoidStarvation: true,
      preferDoubles: false
    },
    hard: {
      mistakeRate: 0.10,
      cardStrategy: "value",       // 보너스 효율성 가중
      tokenStrategy: "needed",
      considerBonus: true,         // 보너스 효율성 고려
      considerNoble: false,
      reserveStrategy: "tier3_strategic",
      avoidStarvation: true,
      preferDoubles: false
    },
    expert: {
      mistakeRate: 0.03,
      cardStrategy: "value",
      tokenStrategy: "needed_bonus",
      considerBonus: true,
      considerNoble: true,         // 귀족 매칭 고려
      reserveStrategy: "high_value",
      avoidStarvation: true,
      preferDoubles: true          // 자원 보존 차원에서 같은 색 2개도 고려
    },
    boss: {
      mistakeRate: 0,
      cardStrategy: "value_noble",
      tokenStrategy: "smart",      // 보너스+귀족+자원고갈 모두 고려
      considerBonus: true,
      considerNoble: true,
      reserveStrategy: "denial",   // 상대 차단 포함
      avoidStarvation: true,
      preferDoubles: true
    }
  };

  // 헬퍼: 카드 구매 가치 점수 (높을수록 좋은 카드)
  function aiScoreCardValue(player, card) {
    let score = card.points * 10;
    // 보너스 효율성: 같은 보너스 색깔을 이미 가지고 있으면 추가 가치
    const myBonus = player.bonuses[card.bonus] || 0;
    score += myBonus * 4;
    // 보너스 잠재력: 이 카드를 사면 다른 카드 비용 절감
    let totalDiscount = 0;
    for (const [g, n] of Object.entries(card.cost)) {
      if (player.bonuses[g] > 0) totalDiscount += Math.min(player.bonuses[g], n);
    }
    score += totalDiscount * 2;
    return score;
  }

  // 헬퍼: 가장 가까운 귀족 매칭 분석
  function aiFindClosestNoble(player) {
    let bestNoble = null;
    let bestProgress = 0;
    let bestNeeded = null;
    for (const noble of state.nobles) {
      let progress = 0;
      let required = 0;
      const needed = {};
      for (const [g, n] of Object.entries(noble.requires)) {
        required += n;
        const have = player.bonuses[g] || 0;
        progress += Math.min(have, n);
        if (have < n) needed[g] = n - have;
      }
      const ratio = required > 0 ? progress / required : 0;
      if (ratio > bestProgress) {
        bestProgress = ratio;
        bestNoble = noble;
        bestNeeded = needed;
      }
    }
    return { noble: bestNoble, progress: bestProgress, needed: bestNeeded };
  }

  // 헬퍼: 보너스 색깔 가치 평가 (귀족 매칭 가중치)
  function aiScoreGemForBonus(player, gem) {
    const config = AI_DIFFICULTY_CONFIG[player.difficulty] || AI_DIFFICULTY_CONFIG.normal;
    let score = 0;
    if (config.considerBonus) {
      score += (player.bonuses[gem] || 0) * 1.5;
    }
    if (config.considerNoble) {
      const closest = aiFindClosestNoble(player);
      if (closest.needed && closest.needed[gem]) {
        score += closest.needed[gem] * 3 * (1 + closest.progress);
      }
    }
    return score;
  }

  // 헬퍼: 자원 고갈 위험 판단
  function aiIsResourceStarved() {
    const scarceColors = GEMS.filter(g => g !== 'gold' && (state.tokenBank[g] || 0) <= 1);
    return scarceColors.length >= 3;
  }

  /* ── AI Decision ── */
  function aiChooseAction(player) {
    const diff = player.difficulty || "normal";
    const config = AI_DIFFICULTY_CONFIG[diff] || AI_DIFFICULTY_CONFIG.normal;
    const makeMistake = () => Math.random() < config.mistakeRate;

    // ── 1) 카드 구매 결정 ──
    const allAffordable = [];
    for (const tier of [3, 2, 1]) {
      state.visibleCards[tier].forEach((card, i) => {
        if (card && canAffordWithGems(card, player)) {
          allAffordable.push({ card, tier, i });
        }
      });
    }

    if (allAffordable.length > 0 && !makeMistake()) {
      let bestPick = null;
      let bestScore = -Infinity;

      for (const a of allAffordable) {
        let score;
        if (config.cardStrategy === "lowest") {
          // Easy: 가장 저렴한 카드 우선 (점수 낮지만 비용도 낮음)
          score = -Object.values(a.card.cost).reduce((s, n) => s + n, 0);
        } else if (config.cardStrategy === "highest") {
          // Normal: 가장 높은 점수
          score = a.card.points;
        } else if (config.cardStrategy === "value") {
          // Hard/Expert: 가치 점수 (보너스 효율성)
          score = aiScoreCardValue(player, a.card);
          // Expert+: 귀족 매칭 보너스
          if (config.considerNoble) {
            const closest = aiFindClosestNoble(player);
            if (closest.needed && closest.needed[a.card.bonus]) {
              score += 25 * closest.progress;
            }
          }
        } else {
          // Boss: 모든 전략 종합
          score = aiScoreCardValue(player, a.card);
          const closest = aiFindClosestNoble(player);
          if (closest.needed && closest.needed[a.card.bonus]) {
            score += 30 * closest.progress;
          }
          // Boss: 5점 카드는 특별 가중
          if (a.card.points >= 4) score += 15;
        }

        if (score > bestScore) {
          bestScore = score;
          bestPick = a;
        }
      }

      if (bestPick) {
        showBuyAnimation(bestPick.tier, bestPick.i, player.name);
        payForCard(bestPick.card, player);
        state.visibleCards[bestPick.tier][bestPick.i] = drawCard(bestPick.tier);
        addLog(`${player.name}: 카드 구매 (${bestPick.card.points}점)`);
        checkNobles(player);
        DIALOGUE.speak(player.index, "aiBuy");
        return;
      }
    }

    // 실수 시 무작위 카드 (Normal/Hard/Easy만)
    if (allAffordable.length > 1 && makeMistake() && config.mistakeRate > 0.05) {
      const pick = allAffordable[Math.floor(Math.random() * allAffordable.length)];
      showBuyAnimation(pick.tier, pick.i, player.name);
      payForCard(pick.card, player);
      state.visibleCards[pick.tier][pick.i] = drawCard(pick.tier);
      addLog(`${player.name}: 카드 구매 (${pick.card.points}점)`);
      checkNobles(player);
      return;
    }

    // ── 2) 예약된 카드 구매 ──
    for (let ri = 0; ri < player.reserved.length; ri++) {
      const card = player.reserved[ri];
      if (canAffordWithGems(card, player) && !makeMistake()) {
        payForCard(card, player);
        player.reserved.splice(ri, 1);
        addLog(`${player.name}: 예약 카드 구매 (${card.points}점)`);
        checkNobles(player);
        return;
      }
    }

    // ── 3) 자원 고갈 방지 판단 ──
    const availableBankGems = GEMS.filter(g => state.tokenBank[g] > 0 && g !== 'gold');
    if (availableBankGems.length === 0) {
      // 뱅크가 완전히 빔 → 예약 또는 턴 종료
      if (player.reserved.length < 3 && config.reserveStrategy !== "rare" && !makeMistake()) {
        const tier3Card = state.visibleCards[3]?.[0];
        if (tier3Card && config.reserveStrategy !== "rare") {
          player.reserved.push(tier3Card);
          state.visibleCards[3][0] = drawCard(3);
          if (state.tokenBank.gold > 0) { player.gems.gold++; state.tokenBank.gold--; }
          addLog(`${player.name}: 카드 예약 (전략)`);
          return;
        }
      }
      addLog(`${player.name}: 토큰 없음, 턴 종료`);
      state.phase = "done";
      return;
    }

    // ── 4) 토큰 가져오기 결정 ──
    let picks;

    if (config.tokenStrategy === "random" || makeMistake()) {
      // Easy 또는 실수 시: 무작위
      picks = shuffle(availableBankGems).slice(0, 3);
    } else {
      // 필요한 토큰 계산
      const needScore = {};
      for (const tier of [1, 2, 3]) {
        state.visibleCards[tier].forEach(card => {
          if (!card) return;
          const cost = effectiveCost(card, player);
          for (const [g, n] of Object.entries(cost)) {
            const deficit = n - (player.gems[g] || 0);
            if (deficit > 0) needScore[g] = (needScore[g] || 0) + deficit;
          }
        });
      }
      // Hard+: 보너스 효율성 가중치
      if (config.considerBonus || config.considerNoble) {
        for (const gem of GEMS) {
          if (gem === 'gold') continue;
          needScore[gem] = (needScore[gem] || 0) + aiScoreGemForBonus(player, gem);
        }
      }
      // 부족한 순으로 정렬
      const sortedGems = Object.entries(needScore)
        .filter(([g]) => state.tokenBank[g] > 0)
        .sort((a, b) => b[1] - a[1])
        .map(([g]) => g);

      picks = sortedGems.slice(0, 3);
      if (picks.length < 3) {
        const remaining = availableBankGems.filter(g => !picks.includes(g));
        picks = picks.concat(remaining.slice(0, 3 - picks.length));
      }
    }

    // ── 5) 2개 같은 색 전략 (Expert/Boss만) ──
    // 자원 고갈 방지 차원에서 4+개 남아있는 같은 색 2개 가져오기
    if (config.preferDoubles && Math.random() < 0.4 && !makeMistake()) {
      for (const gem of GEMS) {
        if (state.tokenBank[gem] >= 4 && (player.gems[gem] || 0) < 3) {
          picks = [gem, gem];
          break;
        }
      }
    }

    // ── 6) 카드 예약 (Expert/Boss: 고가치 카드 전략적 확보) ──
    if (allAffordable.length === 0 && config.reserveStrategy !== "rare" && player.reserved.length < 3 && !makeMistake()) {
      // 4+점 카드 우선 예약
      let target = state.visibleCards[3]?.find(c => c && c.points >= 3);
      let ti = 3;
      if (!target) { target = state.visibleCards[2]?.find(c => c && c.points >= 3); ti = 2; }
      if (target) {
        const idx = state.visibleCards[ti].indexOf(target);
        player.reserved.push(target);
        state.visibleCards[ti][idx] = drawCard(ti);
        if (state.tokenBank.gold > 0) { player.gems.gold++; state.tokenBank.gold--; }
        addLog(`${player.name}: 카드 예약 (${target.points}점)`);
        return;
      }
    }

    if (picks.length >= 1) {
      takeTokens(picks);
      DIALOGUE.speak(player.index, "aiGem");
    } else {
      addLog(`${player.name}: 가져갈 토큰 없음`);
      state.phase = "done";
    }
  }

  /* ── Turn Flow ── */
  function showThinking(playerIndex) {
    // Remove existing bubbles
    document.querySelectorAll(".splendor-speech-bubble").forEach(b => b.remove());
    const playerCard = els.playersList?.querySelector(`[data-player-index="${playerIndex}"]`);
    if (!playerCard) return;
    const bubble = document.createElement("div");
    bubble.className = "splendor-speech-bubble";
    bubble.textContent = "생각중..";
    playerCard.style.position = "relative";
    playerCard.appendChild(bubble);
  }

  function hideThinking() {
    document.querySelectorAll(".splendor-speech-bubble").forEach(b => b.remove());
  }

  function endTurn() {
    if (state.phase === "finished") return;
    const p = activePlayer();
    
    // Check token limit
    const total = totalTokens(p);
    if (total > 10) {
      if (p.human) {
        showDiscardDialog(p, total - 10);
        return;
      } else {
        autoDiscardExcess(p);
      }
    }

    // Check if player reached win score to trigger last round
    if (p.points >= WIN_SCORE) {
      state.lastRoundTriggered = true;
    }

    // Check if the round and the game is finished
    if (state.lastRoundTriggered && state.currentPlayer === state.players.length - 1) {
      declareWinners();
      return;
    }

    hideThinking();
    state.currentPlayer = (state.currentPlayer + 1) % state.players.length;
    state.turnCount++;
    state.phase = "action";
    state.selectedTokens = [];
    state.selectedCard = null;

    const np = activePlayer();
    const npIndex = state.currentPlayer;
    renderAll();

    // Step 1: Show turn toast for 1.5s
    if (typeof showCenterToast === "function") {
      showCenterToast(`${np.name} 차례!`, 1500);
    }

    if (!np.human) {
      // Step 2: After toast, show thinking bubble (난이도별 차등)
      const diff = np.difficulty || "normal";
      const thinkConfig = {
        easy:   { min: 4500, max: 7000 },   // 쉬움: 더 오래 고민 (덜 전략적)
        normal: { min: 3000, max: 5500 },
        hard:   { min: 2200, max: 4500 },
        expert: { min: 1500, max: 3500 },   // 매우어려움: 빠르게 결정
        boss:   { min: 1000, max: 2500 }    // 최종보스: 즉시 결정
      }[diff] || { min: 3000, max: 5500 };
      const thinkTime = thinkConfig.min + Math.floor(Math.random() * (thinkConfig.max - thinkConfig.min));
      setTimeout(() => {
        showThinking(npIndex);
        setTimeout(runAiTurn, thinkTime);
      }, 1500);
    }
  }

  function declareWinners() {
    let maxPoints = -1;
    let minCards = Infinity;
    let winners = [];

    state.players.forEach(player => {
      if (player.points > maxPoints) {
        maxPoints = player.points;
        minCards = player.cards.length;
        winners = [player];
      } else if (player.points === maxPoints) {
        if (player.cards.length < minCards) {
          minCards = player.cards.length;
          winners = [player];
        } else if (player.cards.length === minCards) {
          winners.push(player);
        }
      }
    });

    state.phase = "finished";
    const sorted = [...state.players].sort((a, b) => b.points - a.points || a.cards.length - b.cards.length);
    const winnerNames = winners.map(w => w.name).join(", ");
    addLog(`🏆 ${winnerNames} 승리! (${maxPoints}점)`);
    recordGameResult({ winners, sorted, maxPoints });
    renderAll();
    DIALOGUE.stopIdleLoop();
    // Dialogue: win/loss (everyone speaks)
    state.players.forEach((p, i) => {
      if (p.human) return;
      const section = winners.includes(p) ? "aiWin" : "aiLoss";
      setTimeout(() => DIALOGUE.speak(i, section), Math.random() * 1000);
    });
    setTimeout(() => showResultModal(sorted, winners), 2000);
  }

  function showResultModal(sorted, winners) {
    const modal = document.createElement("div");
    modal.className = "splendor-result-overlay";
    const isWin = winners.some(w => w.human);
    modal.innerHTML = `
      <div class="splendor-result-modal">
        <div class="splendor-result-icon">${isWin ? "🎉" : "😢"}</div>
        <div class="splendor-result-title">${isWin ? "승리!" : "패배"}</div>
        <div class="splendor-result-subtitle">${winners.map(w => w.name).join(", ")} 우승</div>
        <div class="splendor-result-scores">
          ${sorted.map((p, i) => `
            <div class="splendor-result-row${winners.includes(p) ? " winner" : ""}${p.human ? " you" : ""}">
              <span class="splendor-result-rank">${i + 1}위</span>
              <img class="splendor-result-avatar" src="${esc(p.avatarUrl)}" alt="" />
              <span class="splendor-result-name">${esc(p.name)}${p.human ? " (나)" : ""}</span>
              <span class="splendor-result-pts">${p.points}점</span>
              <span class="splendor-result-cards">카드 ${p.cards.length}장</span>
            </div>
          `).join("")}
        </div>
        <div class="splendor-result-actions">
          <button class="primary-button splendor-result-newgame" type="button">새 게임</button>
          <button class="secondary-button splendor-result-exit" type="button">첫 화면</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector(".splendor-result-newgame")?.addEventListener("click", () => {
      modal.remove();
      resetToSetup();
    });
    modal.querySelector(".splendor-result-exit")?.addEventListener("click", () => {
      modal.remove();
      leaveGame();
    });
  }

  function runAiTurn() {
    const p = activePlayer();
    if (p.human || state.phase === "finished") return;
    state.phase = "action";
    state.selectedTokens = [];
    aiChooseAction(p);
    renderAll();
    hideThinking();
    if (state.phase !== "finished") {
      setTimeout(endTurn, 800);
    }
  }

  /* ── Game Start ── */
  function startGame() {
    state.startedAt = Date.now();
    const count = Math.min(4, Math.max(2, Number(els.playerCount?.value || 3)));
    const tc = tokenCount(count);
    state.players = buildPlayers(count);
    state.tokenBank = {};
    GEMS.forEach(g => state.tokenBank[g] = tc);
    state.tokenBank.gold = 5;
    state.tiers = { 1: generateTier1(), 2: generateTier2(), 3: generateTier3() };
    state.visibleCards = { 1: [], 2: [], 3: [] };
    for (let t = 1; t <= 3; t++) {
      for (let i = 0; i < 4; i++) state.visibleCards[t].push(drawCard(t));
    }
    state.nobles = shuffle([...NOBLE_TILES]).slice(0, count + 1).map((n, idx) => {
      n.img = NOBLE_IMAGES[idx % NOBLE_IMAGES.length];
      return n;
    });
    state.currentPlayer = 0;
    state.phase = "action";
    state.selectedTokens = [];
    state.selectedCard = null;
    state.log = [];
    state.turnCount = 1;
    state.lastRoundTriggered = false;

    addLog(`💎 스플렌더 게임 시작! ${count}명 참가.`);
    document.body.classList.add("splendor-playing");
    els.setupPanel?.classList.add("hidden");
    els.gamePanel?.classList.remove("hidden");
    renderAll();
    // Dialogue: game start (everyone speaks)
    DIALOGUE.speakAll("gameStart");
    DIALOGUE.startIdleLoop();
  }

  function resetToSetup() {
    document.body.classList.remove("splendor-playing");
    document.body.classList.add("splendor-active");
    els.gamePanel?.classList.add("hidden");
    els.setupPanel?.classList.remove("hidden");
    state.phase = "idle";
  }

  function leaveGame() {
    DIALOGUE.stopIdleLoop();
    window.location.href = "./";
  }

  function preloadSplendorAssets() {
    return new Promise(resolve => {
      const assets = [
        "assets/splendor/diamond.png",
        "assets/splendor/emerald.png",
        "assets/splendor/gold.png",
        "assets/splendor/onyx.png",
        "assets/splendor/ruby.png",
        "assets/splendor/sapphire.png",
        "assets/splendor/다이아몬드카드.jpg?v=2",
        "assets/splendor/루비카드.jpg?v=2",
        "assets/splendor/사파이어카드.jpg?v=2",
        "assets/splendor/에메랄드.jpg?v=2",
        "assets/splendor/오닉스카드.jpg?v=2",
        "assets/splendor/쉴레이만 1세.jpg",
        "assets/splendor/안 드 브르타뉴.jpg",
        "assets/splendor/엘리자베트.jpg",
        "assets/splendor/이사벨 1세.jpg",
        "assets/splendor/카트린 드 메디시스.jpg",
        "assets/splendor/프랑수아 1세.jpg",
        "assets/splendor/헨리 8세.jpg",
        "assets/splendor/티어1.jpg?v=2",
        "assets/splendor/티어2.jpg?v=2",
        "assets/splendor/티어3.jpg?v=2",
        "assets/splendor/background.jpg"
      ];
      
      let loadedCount = 0;
      const total = assets.length;
      
      const updateProgress = () => {
        const percent = Math.round((loadedCount / total) * 100);
        const smallText = document.querySelector("#loadingOverlay small");
        if (smallText) {
          smallText.textContent = `리소스 불러오는 중... (${percent}%)`;
        }
      };
      
      updateProgress();
      
      assets.forEach(src => {
        const img = new Image();
        img.onload = img.onerror = () => {
          loadedCount++;
          updateProgress();
          if (loadedCount === total) {
            resolve();
          }
        };
        img.src = src;
      });
    });
  }

  const ZOOM_STORAGE_KEY = "fantasyR.splendorZoomPercent";
  const ZOOM_MIN_PERCENT = 60;
  const ZOOM_MAX_PERCENT = 180;
  const ZOOM_STEP_PERCENT = 10;
  let splendorZoomPercent = 100;

  function currentViewportSize() {
    return {
      width: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
      height: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
    };
  }

  function clampNumber(num, min, max) {
    return Math.min(Math.max(num, min), max);
  }

  function suggestedInitialZoomPercent() {
    const { width, height } = currentViewportSize();
    const isPhonePortrait = width <= 700 && height > width;
    if (isPhonePortrait) return 70;

    const isCoarsePointer = Boolean(window.matchMedia?.("(pointer: coarse)")?.matches);
    const pixelRatio = isCoarsePointer ? 1 : Math.max(1, Number(window.devicePixelRatio || 1));
    const resolutionRatio = Math.min((width * pixelRatio) / 1920, (height * pixelRatio) / 1080);
    const percent = resolutionRatio <= 1
      ? resolutionRatio * 100
      : 100 + ((Math.min(resolutionRatio, 1.8) - 1) * 80);
    const stepped = Math.round(percent / ZOOM_STEP_PERCENT) * ZOOM_STEP_PERCENT;
    return clampNumber(stepped, ZOOM_MIN_PERCENT, ZOOM_MAX_PERCENT);
  }

  function loadZoomPercent() {
    try {
      const saved = window.localStorage.getItem(ZOOM_STORAGE_KEY);
      const numeric = Number(saved);
      return saved !== null && String(saved).trim() !== "" && Number.isFinite(numeric)
        ? clampNumber(numeric, ZOOM_MIN_PERCENT, ZOOM_MAX_PERCENT)
        : suggestedInitialZoomPercent();
    } catch {
      return suggestedInitialZoomPercent();
    }
  }

  function saveZoomPercent(percent) {
    try {
      window.localStorage.setItem(ZOOM_STORAGE_KEY, String(percent));
    } catch {}
  }

  function renderZoomControls() {
    els.gamePanel?.style.setProperty("--splendor-ui-zoom", String(splendorZoomPercent / 100));
    if (els.zoomLabel) els.zoomLabel.textContent = `${splendorZoomPercent}%`;
    if (els.zoomOutButton) els.zoomOutButton.disabled = splendorZoomPercent <= ZOOM_MIN_PERCENT;
    if (els.zoomInButton) els.zoomInButton.disabled = splendorZoomPercent >= ZOOM_MAX_PERCENT;
  }

  function setZoomPercent(percent, persist = true) {
    splendorZoomPercent = clampNumber(Math.round(percent / ZOOM_STEP_PERCENT) * ZOOM_STEP_PERCENT, ZOOM_MIN_PERCENT, ZOOM_MAX_PERCENT);
    renderZoomControls();
    if (persist) saveZoomPercent(splendorZoomPercent);
  }

  function adjustZoom(delta) {
    setZoomPercent(splendorZoomPercent + delta);
  }

  function initializeZoomControls() {
    setZoomPercent(loadZoomPercent(), false);
  }

  /* ── Dialogue System ── */
  const DIALOGUE = {
    displayMs: 3000,
    idleChance: 0.15,
    _queue: [],
    _busy: false,
    _lastSpeakers: [],  // track last 2 speakers
    _usedLines: {},     // per-section used indices

    _getTone(characterName) {
      const dlg = window.SPLENDOR_DIALOGUES;
      if (!dlg) return null;
      for (const [tone, info] of Object.entries(dlg)) {
        if (info.characters.includes(characterName)) return tone;
      }
      return null;
    },

    _pick(tone, section) {
      const dlg = window.SPLENDOR_DIALOGUES?.[tone]?.dialogues?.[section];
      if (!dlg || !dlg.length) return null;
      const key = `${tone}:${section}`;
      if (!this._usedLines[key] || this._usedLines[key].length >= dlg.length) {
        this._usedLines[key] = [];
      }
      // Pick random unused line
      let idx;
      let attempts = 0;
      do {
        idx = Math.floor(Math.random() * dlg.length);
        attempts++;
      } while (this._usedLines[key].includes(idx) && attempts < 20);
      this._usedLines[key].push(idx);
      return dlg[idx];
    },

    _activeBubble: null,  // { playerIndex, text, removeTimer }
    _showOnCard(playerIndex, text) {
      const playerCard = els.playersList?.querySelector(`[data-player-index="${playerIndex}"]`);
      if (!playerCard) return;
      // Remove existing bubble on this card
      playerCard.querySelectorAll(".splendor-speech-bubble").forEach(b => b.remove());
      const bubble = document.createElement("div");
      bubble.className = "splendor-speech-bubble";
      bubble.textContent = text;
      playerCard.appendChild(bubble);
      const removeTimer = setTimeout(() => {
        if (this._activeBubble && this._activeBubble.bubble === bubble) {
          this._activeBubble = null;
        }
        bubble.remove();
      }, this.displayMs);
      this._activeBubble = { playerIndex, text, bubble, removeTimer };
    },
    /** Re-attach the currently-displayed bubble if renderPlayers wiped it out. */
    _reapplyActiveBubble() {
      if (!this._activeBubble) return;
      const { playerIndex, text, bubble, removeTimer } = this._activeBubble;
      // If the original bubble node is still in the DOM, leave it alone.
      if (bubble.isConnected) return;
      // Otherwise re-create it without resetting the timer.
      const playerCard = els.playersList?.querySelector(`[data-player-index="${playerIndex}"]`);
      if (!playerCard) return;
      const fresh = document.createElement("div");
      fresh.className = "splendor-speech-bubble";
      fresh.textContent = text;
      playerCard.appendChild(fresh);
      this._activeBubble.bubble = fresh;
      // The existing removeTimer will clear the original reference; nothing to change.
      clearTimeout(removeTimer);
      this._activeBubble.removeTimer = setTimeout(() => {
        if (this._activeBubble && this._activeBubble.bubble === fresh) {
          this._activeBubble = null;
        }
        fresh.remove();
      }, this.displayMs);
    },

    _processQueue() {
      if (this._busy || !this._queue.length) return;
      this._busy = true;
      const { playerIndex, text } = this._queue.shift();
      this._showOnCard(playerIndex, text);
      setTimeout(() => {
        this._busy = false;
        this._processQueue();
      }, this.displayMs);
    },

    speak(playerIndex, section) {
      const p = state.players[playerIndex];
      if (!p || p.human) return;
      const tone = this._getTone(p.name);
      if (!tone) return;

      // Rule 3: No same character 3 times in a row
      const last2 = this._lastSpeakers.slice(-2);
      if (last2.length === 2 && last2[0] === playerIndex && last2[1] === playerIndex) return;

      // Rule 2: Don't speak if busy (another dialogue is showing)
      // Rule 4: Queue it
      const text = this._pick(tone, section);
      if (!text) return;

      this._lastSpeakers.push(playerIndex);
      if (this._lastSpeakers.length > 3) this._lastSpeakers.shift();

      this._queue.push({ playerIndex, text });
      this._processQueue();
    },

    // Rule 1: Everyone speaks simultaneously for game start/end
    speakAll(section) {
      if (!window.SPLENDOR_DIALOGUES) return;
      state.players.forEach((p, i) => {
        if (p.human) return;
        const tone = this._getTone(p.name);
        if (!tone) return;
        const text = this._pick(tone, section);
        if (text) {
          setTimeout(() => this._showOnCard(i, text), Math.random() * 500);
        }
      });
    },

    // Idle dialogue timer
    _idleTimer: null,
    startIdleLoop() {
      this.stopIdleLoop();
      this._idleTimer = setInterval(() => {
        if (state.phase !== "action" || !activePlayer()?.human) return;
        // Pick a random AI player
        const ais = state.players.map((p, i) => ({ p, i })).filter(x => !x.p.human);
        if (!ais.length) return;
        const pick = ais[Math.floor(Math.random() * ais.length)];
        if (Math.random() < this.idleChance) {
          this.speak(pick.i, "idle");
        }
      }, 8000);
    },
    stopIdleLoop() {
      if (this._idleTimer) { clearInterval(this._idleTimer); this._idleTimer = null; }
    }
  };

  /* ── Init ── */
  function init() {
    els.startButton?.addEventListener("click", startGame);
    els.newGameButton?.addEventListener("click", resetToSetup);
    els.exitButton?.addEventListener("click", leaveGame);
    els.backButton?.addEventListener("click", leaveGame);
    els.rulesButton?.addEventListener("click", () => {
      if (typeof els.rulesDialog?.showModal === "function" && !els.rulesDialog.open) els.rulesDialog.showModal();
    });
    els.rulesDialog?.addEventListener("click", e => { if (e.target === els.rulesDialog) els.rulesDialog.close(); });
    // Turn end is automatic (no button)

    // Card click: buy (long-press = reserve)
    let _longPressTimer = null;
    let _longPressTriggered = false;
    document.addEventListener("pointerdown", e => {
      const card = e.target.closest(".splendor-card");
      if (!card || !activePlayer()?.human || state.phase !== "action") return;
      if (card.dataset.reserved) return; // reserved cards use normal click
      const tier = Number(card.dataset.tier);
      const index = Number(card.dataset.index);
      _longPressTriggered = false;
      _longPressTimer = setTimeout(() => {
        _longPressTriggered = true;
        attemptReserve(tier, index);
      }, 2000);
    });
    document.addEventListener("pointerup", () => {
      clearTimeout(_longPressTimer);
    });
    document.addEventListener("pointercancel", () => {
      clearTimeout(_longPressTimer);
    });
    document.addEventListener("click", e => {
      const card = e.target.closest(".splendor-card");
      if (!card || !activePlayer()?.human || state.phase !== "action") return;
      if (_longPressTriggered) { _longPressTriggered = false; return; }
      const tier = Number(card.dataset.tier);
      const index = Number(card.dataset.index);
      if (card.dataset.reserved) {
        attemptBuyReserved(index);
      } else {
        attemptBuyCard(tier, index);
      }
    });

    // Deck click = reserve from top
    document.addEventListener("click", e => {
      const back = e.target.closest(".splendor-card-back");
      if (!back || !activePlayer()?.human || state.phase !== "action") return;
      const tier = Number(back.dataset.tier);
      attemptReserve(tier, null);
    });

    els.zoomOutButton?.addEventListener("click", () => adjustZoom(-ZOOM_STEP_PERCENT));
    els.zoomInButton?.addEventListener("click", () => adjustZoom(ZOOM_STEP_PERCENT));
    initializeZoomControls();



    els.discardConfirmButton?.addEventListener("click", () => {
      const p = activePlayer();
      Object.entries(tempDiscard).forEach(([gem, count]) => {
        if (count > 0) {
          p.gems[gem] -= count;
          state.tokenBank[gem] += count;
          addLog(`${p.name}: 보석 ${GEM_LABELS[gem]} ${count}개 반납`);
        }
      });
      
      if (typeof els.discardDialog?.close === "function") {
        els.discardDialog.close();
      }
      
      renderAll();
      endTurn();
    });

    preloadSplendorAssets().then(() => {
      document.body.classList.remove("app-loading");
      document.querySelector("#loadingOverlay")?.classList.add("hidden");
      initCardHover();
    });
  }

  init();
  window.SplendorGame = { start: startGame, leave: leaveGame };
})();

function recordGameResult({ winners, sorted, maxPoints }) {
  const statsApi = window.FANTASY_PLAYER_STATS;
  if (!statsApi || typeof statsApi.recordGame !== "function") return;
  const humanEntry = sorted.find((p) => p && p.human);
  if (!humanEntry) return;
  const isWin = Array.isArray(winners) && winners.some((w) => w && w.human);
  const result = isWin ? "win" : "loss";
  const durationSec = state.startedAt ? Math.max(0, Math.floor((Date.now() - state.startedAt) / 1000)) : 0;
  statsApi.recordGame({
    gameType: "splendor",
    result,
    score: maxPoints || humanEntry.points || 0,
    durationSec,
    playerCount: sorted.length,
    deckList: null,
  });
}
