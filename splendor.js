/* ===== 스플렌더 (Splendor) ===== */
(function () {
  "use strict";

  /* ── Gem Types ── */
  const GEMS = ["diamond", "sapphire", "emerald", "ruby", "onyx"];
  const GEM_LABELS = { diamond: "다이아", sapphire: "사파이어", emerald: "에메랄드", ruby: "루비", onyx: "오닉스", gold: "골드" };
  const GEM_COLORS = { diamond: "#e8e4da", sapphire: "#5da9e9", emerald: "#60b86e", ruby: "#de3b35", onyx: "#4a4a4a", gold: "#f0c84b" };
  const WIN_SCORE = 15;

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
    log:            $("#splendorLog")
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
    turnCount: 0
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
    return `<div class="splendor-card${reserved ? " splendor-card-reserved" : ""}${state.selectedCard?.tier === tier && state.selectedCard?.index === index ? " selected" : ""}${affordable ? " affordable" : ""}"
      data-tier="${tier}" data-index="${index}" ${reserved ? 'data-reserved="1"' : ""}
      style="border-top: 4px solid ${tierColors[tier] || "var(--line)"}">
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
    const tierEmoji = { 1: "🥉", 2: "🥈", 3: "🥇" };
    return `<div class="splendor-card-back" data-tier="${tier}">
      ${tierEmoji[tier] || "💎"}<span class="splendor-deck-count">${deck.length}</span>
    </div>`;
  }

  /* ── Noble Rendering ── */
  function nobleHtml(noble, index) {
    const reqHtml = Object.entries(noble.requires)
      .map(([g, n]) => `<span class="splendor-noble-req-gem">${gemImg(g, 22)}${n}</span>`).join("");
    return `<div class="splendor-noble" data-nindex="${index}">
      <span class="splendor-noble-emoji">👑</span>
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
        <div class="splendor-player-gems">${gemsHtml || "<small style='color:var(--muted)'>없음</small>"}</div>
        <div class="splendor-player-gems" style="margin-top:4px">${bonusHtml}</div>
      `;
      els.playersList.appendChild(card);
    });
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
    els.myReserved.innerHTML = p.reserved.map((c, i) => {
      const costHtml = Object.entries(c.cost).filter(([, n]) => n > 0).map(([g, n]) => gemPip(g, n)).join("");
      return `<div class="splendor-reserved-mini" data-rindex="${i}" title="예약 카드 ${i + 1}">
        <span style="font-weight:900;color:var(--accent)">${c.points || ""}</span>
        ${gemImg(c.bonus, 24)}
        <div style="display:flex;gap:1px">${costHtml}</div>
      </div>`;
    }).join("") || "<small style='color:var(--muted)'>없음</small>";
    // Click reserved card to buy it
    els.myReserved.querySelectorAll(".splendor-reserved-mini").forEach(el => {
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
      const labels = {
        action: "보석 가져오기, 카드 구매, 또는 카드 예약",
        done: "턴 종료 대기",
        finished: "게임 종료"
      };
      els.phaseLabel.textContent = labels[state.phase] || "-";
    }
    // Turn end is automatic (no button)
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
    preview.innerHTML = `<div class="splendor-card" style="border-top: 4px solid ${tierColors[1] || "var(--line)"}">
      <div class="splendor-card-top">
        <span class="splendor-card-points">${card.points ? "★".repeat(Math.min(card.points, 5)) : ""}</span>
        <span class="splendor-card-bonus">${gemImg(card.bonus, 40)}</span>
      </div>
      <div class="splendor-card-middle"></div>
      <div class="splendor-card-cost">${costHtml}</div>
    </div>`;
    // Position near the card
    let top = rect.top - 20;
    let left = rect.right + 10;
    if (left + 220 > window.innerWidth) left = rect.left - 220;
    if (top + 280 > window.innerHeight) top = window.innerHeight - 290;
    if (top < 10) top = 10;
    preview.style.top = `${top}px`;
    preview.style.left = `${left}px`;
    preview.classList.remove("hidden");
  }

  function hideCardPreview() {
    const preview = document.querySelector("#splendorCardPreview");
    if (preview) preview.classList.add("hidden");
    hoverCard = null;
  }

  function showNoblePreview(noble, rect) {
    const preview = document.querySelector("#splendorCardPreview");
    if (!preview || !noble) return;
    const reqHtml = Object.entries(noble.requires)
      .map(([g, n]) => `<span class="splendor-cost-pip">${gemImg(g, 24)}<span class="splendor-cost-num">${n}</span></span>`).join("");
    preview.innerHTML = `<div class="splendor-card" style="border-top: 4px solid var(--accent)">
      <div class="splendor-card-top">
        <span class="splendor-card-points">★★★</span>
        <span style="font-size:36px">👑</span>
      </div>
      <div class="splendor-card-middle"></div>
      <div class="splendor-card-cost" style="flex-direction:column">${reqHtml}</div>
    </div>`;
    let top = rect.top - 20;
    let left = rect.right + 10;
    if (left + 220 > window.innerWidth) left = rect.left - 220;
    if (top + 280 > window.innerHeight) top = window.innerHeight - 290;
    if (top < 10) top = 10;
    preview.style.top = `${top}px`;
    preview.style.left = `${left}px`;
    preview.classList.remove("hidden");
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
        }, 500);
      } else if (nobleEl) {
        const nIndex = Number(nobleEl.dataset.nindex);
        if (isNaN(nIndex)) return;
        const noble = state.nobles[nIndex];
        if (!noble || noble === hoverCard) return;
        clearTimeout(hoverTimer);
        hoverCard = noble;
        hoverTimer = setTimeout(() => {
          showNoblePreview(noble, nobleEl.getBoundingClientRect());
        }, 500);
      }
    });
    document.addEventListener("mouseout", e => {
      const el = e.target.closest(".splendor-card, .splendor-noble");
      if (el) { clearTimeout(hoverTimer); hideCardPreview(); }
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
  function buildPlayers(count) {
    const pool = shuffle(aiProfiles());
    return Array.from({ length: count }, (_, i) => {
      const isHuman = i === 0;
      const profile = isHuman ? null : pool[i - 1] || { name: `AI ${i}`, avatarUrl: profileImageUrl("보통-건일.jpg") };
      return {
        index: i,
        id: isHuman ? "human" : `ai${i}`,
        human: isHuman,
        name: isHuman ? "플레이어" : (profile.name || `AI ${i}`),
        avatarUrl: isHuman ? profileImageUrl("유저.jpg") : profile.avatarUrl,
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
    const earned = [];
    state.nobles = state.nobles.filter(noble => {
      const meets = Object.entries(noble.requires).every(([g, n]) => (player.bonuses[g] || 0) >= n);
      if (meets) {
        earned.push(noble);
        player.points += noble.points;
        player.nobles.push(noble);
        return false;
      }
      return true;
    });
    return earned;
  }

  /* ── Draw Card ── */
  function drawCard(tier) {
    if (!state.tiers[tier].length) return null;
    return state.tiers[tier].shift();
  }

  /* ── Token Selection ── */
  function onTokenClick(gem) {
    if (state.phase !== "action" || !activePlayer().human) return;
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
    if (state.selectedTokens.length === 3 || (state.selectedTokens.length === 2 && state.selectedTokens[0] === state.selectedTokens[1])) {
      // Auto-take tokens
      takeTokens(state.selectedTokens);
    }

    renderTokens();
    renderControls();
  }

  function takeTokens(gems) {
    const p = activePlayer();
    gems.forEach(g => {
      p.gems[g] = (p.gems[g] || 0) + 1;
      state.tokenBank[g]--;
    });
    const labels = gems.map(g => GEM_LABELS[g]).join(", ");
    addLog(`${p.name}: 보석 ${labels} 획득`);
    state.selectedTokens = [];
    state.phase = "done";
    renderAll();
    if (!p.human) return;
    // Check nobles & win
    endTurn();
  }

  /* ── Card Purchase ── */
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
    payForCard(card, p);
    state.visibleCards[tier][index] = drawCard(tier);
    addLog(`${p.name}: ${GEM_LABELS[card.bonus]} 카드 구매 (${card.points}점)`);
    const earned = checkNobles(p);
    earned.forEach(n => addLog(`${p.name}: 귀족 획득! (+${n.points}점)`));
    state.phase = "done";
    state.selectedCard = null;
    renderAll();
    if (p.points >= WIN_SCORE) {
      state.phase = "finished";
      addLog(`🏆 ${p.name} 승리! ${p.points}점!`);
      renderAll();
      return;
    }
    endTurn();
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
    payForCard(card, p);
    p.reserved.splice(ri, 1);
    addLog(`${p.name}: 예약 카드 구매 (${card.points}점)`);
    const earned = checkNobles(p);
    earned.forEach(n => addLog(`${p.name}: 귀족 획득! (+${n.points}점)`));
    state.phase = "done";
    state.selectedCard = null;
    renderAll();
    if (p.points >= WIN_SCORE) {
      state.phase = "finished";
      addLog(`🏆 ${p.name} 승리! ${p.points}점!`);
      renderAll();
      return;
    }
    endTurn();
  }

  /* ── Card Reservation ── */
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
      addLog(`${p.name}: 티어 ${tier} 덱에서 카드 예약`);
    } else {
      p.reserved.push(card);
      state.visibleCards[tier][index] = drawCard(tier);
      addLog(`${p.name}: 카드 예약`);
    }
    // Take gold if available
    if (state.tokenBank.gold > 0) {
      p.gems.gold++;
      state.tokenBank.gold--;
    }
    state.phase = "done";
    state.selectedCard = null;
    renderAll();
    endTurn();
  }

  /* ── Return Tokens (max 10) ── */
  function checkTokenLimit(player) {
    const total = totalTokens(player);
    if (total > 10) {
      addLog(`${player.name}: 보석 ${total - 10}개를 반납해야 합니다 (최대 10개)`);
      // For simplicity, auto-return excess lowest-count gems
      while (totalTokens(player) > 10) {
        let minGem = null, minCount = Infinity;
        for (const g of GEMS) {
          if (player.gems[g] > 0 && player.gems[g] < minCount) {
            minCount = player.gems[g];
            minGem = g;
          }
        }
        if (minGem) {
          player.gems[minGem]--;
          state.tokenBank[minGem]++;
        } else break;
      }
    }
  }

  /* ── AI Logic ── */
  function aiChooseAction(player) {
    // Try to buy a visible card (prefer highest points affordable)
    let bestCard = null, bestTier = 0, bestIdx = 0, bestPoints = -1;
    for (const tier of [3, 2, 1]) {
      state.visibleCards[tier].forEach((card, i) => {
        if (card && canAffordWithGems(card, player) && card.points > bestPoints) {
          bestCard = card; bestTier = tier; bestIdx = i; bestPoints = card.points;
        }
      });
    }
    if (bestCard) {
      payForCard(bestCard, player);
      state.visibleCards[bestTier][bestIdx] = drawCard(bestTier);
      addLog(`${player.name}: 카드 구매 (${bestCard.points}점)`);
      checkNobles(player);
      return;
    }

    // Try to buy reserved card
    for (let ri = 0; ri < player.reserved.length; ri++) {
      const card = player.reserved[ri];
      if (canAffordWithGems(card, player)) {
        payForCard(card, player);
        player.reserved.splice(ri, 1);
        addLog(`${player.name}: 예약 카드 구매 (${card.points}점)`);
        checkNobles(player);
        return;
      }
    }

    // Take gems: prefer gems needed for cheapest affordable card
    const needed = {};
    for (const tier of [1, 2, 3]) {
      state.visibleCards[tier].forEach(card => {
        if (!card) return;
        const cost = effectiveCost(card, player);
        for (const [g, n] of Object.entries(cost)) {
          const deficit = n - (player.gems[g] || 0);
          if (deficit > 0) needed[g] = (needed[g] || 0) + deficit;
        }
      });
    }
    const sortedGems = Object.entries(needed)
      .filter(([g]) => state.tokenBank[g] > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([g]) => g);

    if (sortedGems.length >= 3) {
      takeTokens(sortedGems.slice(0, 3));
    } else if (sortedGems.length >= 1) {
      // Take available gems
      const picks = sortedGems.filter(g => state.tokenBank[g] > 0).slice(0, 3);
      if (picks.length >= 1) {
        takeTokens(picks);
      } else {
        // Fallback: take any available
        const any = GEMS.filter(g => state.tokenBank[g] > 0).slice(0, 3);
        if (any.length) takeTokens(any);
        else { addLog(`${player.name}: 보석이 없어 턴 넘김`); state.phase = "done"; }
      }
    } else {
      // Reserve a card from tier 3 for gold
      const tier3Card = state.visibleCards[3]?.[0];
      if (tier3Card && player.reserved.length < 3) {
        player.reserved.push(tier3Card);
        state.visibleCards[3][0] = drawCard(3);
        if (state.tokenBank.gold > 0) { player.gems.gold++; state.tokenBank.gold--; }
        addLog(`${player.name}: 카드 예약`);
      } else {
        // Take any 3 gems
        const any = GEMS.filter(g => state.tokenBank[g] > 0).slice(0, 3);
        if (any.length) takeTokens(any);
        else addLog(`${player.name}: 턴 넘김`);
      }
    }
  }

  /* ── Turn Flow ── */
  function endTurn() {
    if (state.phase === "finished") return;
    const p = activePlayer();
    checkTokenLimit(p);

    // Check win
    if (p.points >= WIN_SCORE) {
      state.phase = "finished";
      addLog(`🏆 ${p.name} 승리! ${p.points}점!`);
      renderAll();
      return;
    }

    state.currentPlayer = (state.currentPlayer + 1) % state.players.length;
    state.turnCount++;
    state.phase = "action";
    state.selectedTokens = [];
    state.selectedCard = null;

    const np = activePlayer();
    renderAll();
    if (!np.human) {
      setTimeout(runAiTurn, 800);
    }
  }

  function runAiTurn() {
    const p = activePlayer();
    if (p.human || state.phase === "finished") return;
    state.phase = "action";
    state.selectedTokens = [];
    aiChooseAction(p);
    renderAll();
    if (state.phase !== "finished") {
      setTimeout(endTurn, 600);
    }
  }

  /* ── Game Start ── */
  function startGame() {
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
    state.nobles = shuffle([...NOBLE_TILES]).slice(0, count + 1);
    state.currentPlayer = 0;
    state.phase = "action";
    state.selectedTokens = [];
    state.selectedCard = null;
    state.log = [];
    state.turnCount = 1;

    addLog(`💎 스플렌더 게임 시작! ${count}명 참가.`);
    document.body.classList.add("splendor-playing");
    els.setupPanel?.classList.add("hidden");
    els.gamePanel?.classList.remove("hidden");
    renderAll();
  }

  function resetToSetup() {
    document.body.classList.remove("splendor-playing");
    document.body.classList.add("splendor-active");
    els.gamePanel?.classList.add("hidden");
    els.setupPanel?.classList.remove("hidden");
    state.phase = "idle";
  }

  function leaveGame() {
    window.location.href = "./";
  }

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

    // Card click: buy or reserve
    document.addEventListener("click", e => {
      const card = e.target.closest(".splendor-card");
      if (!card || !activePlayer()?.human || state.phase !== "action") return;
      const tier = Number(card.dataset.tier);
      const index = Number(card.dataset.index);
      if (card.dataset.reserved) {
        attemptBuyReserved(index);
      } else {
        // Left click = buy, but we need a way to reserve too
        // Use shift+click for reserve
        if (e.shiftKey) {
          attemptReserve(tier, index);
        } else {
          attemptBuyCard(tier, index);
        }
      }
    });

    // Deck click = reserve from top
    document.addEventListener("click", e => {
      const back = e.target.closest(".splendor-card-back");
      if (!back || !activePlayer()?.human || state.phase !== "action") return;
      const tier = Number(back.dataset.tier);
      attemptReserve(tier, null);
    });

    document.body.classList.remove("app-loading");
    document.querySelector("#loadingOverlay")?.classList.add("hidden");
    initCardHover();
  }

  init();
  window.SplendorGame = { start: startGame, leave: leaveGame };
})();
