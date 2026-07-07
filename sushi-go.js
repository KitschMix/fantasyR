/* ===== 스시고! (Sushi Go!) ===== */
(function () {
  "use strict";

  /* ── Card Definitions ── */
  const CARD_DEFS = [
    { type: "nigiri",   name: "계란 초밥",   emoji: "🥚", points: 1, copies: 5 },
    { type: "nigiri",   name: "연어 초밥",   emoji: "🍣", points: 2, copies: 5 },
    { type: "nigiri",    name: "문어 초밥",   emoji: "🐙", points: 3, copies: 3 },
    { type: "maki",     name: "김밥 3",      emoji: "🍱", points: 0, maki: 3, copies: 8 },
    { type: "maki",     name: "김밥 2",      emoji: "🍙", points: 0, maki: 2, copies: 5 },
    { type: "maki",     name: "김밥 1",      emoji: "🍘", points: 0, maki: 1, copies: 4 },
    { type: "tempura",  name: "새우튀김",    emoji: "🍤", points: 0, copies: 8 },
    { type: "sashimi",  name: "사시미",      emoji: "🐟", points: 0, copies: 10 },
    { type: "dumpling", name: "만두",        emoji: "🥟", points: 0, copies: 14 },
    { type: "wasabi",   name: "와사비",      emoji: "🟢", points: 0, copies: 4 },
    { type: "pudding",  name: "푸딩",        emoji: "🍮", points: 0, copies: 10 }
  ];

  const TOTAL_ROUNDS = 3;
  const DUMPLING_SCORES = [0, 1, 3, 5, 8, 11];

  /* ── DOM ── */
  const $ = (sel) => document.querySelector(sel);
  const els = {
    setupPanel:    $("#sushiSetupPanel"),
    gamePanel:     $("#sushiGamePanel"),
    startButton:   $("#startSushiButton"),
    playerCount:   $("#sushiPlayerCountSelect"),
    backButton:    $("#sushiBackButton"),
    newGameButton: $("#sushiNewGameButton"),
    exitButton:    $("#sushiExitButton"),
    rulesButton:   $("#sushiRulesButton"),
    rulesDialog:   $("#sushiRulesDialog"),
    roundLabel:    $("#sushiRoundLabel"),
    playersList:   $("#sushiPlayersList"),
    makiRanking:   $("#sushiMakiRanking"),
    hand:          $("#sushiHand"),
    handInfo:      $("#sushiHandInfo"),
    pickInfo:      $("#sushiPickInfo"),
    puddingCount:  $("#sushiPuddingCount"),
    log:           $("#sushiLog"),
    roundEnd:      $("#sushiRoundEnd"),
    roundEndTitle: $("#sushiRoundEndTitle"),
    roundEndScores:$("#sushiRoundEndScores"),
    nextRoundBtn:  $("#sushiNextRoundButton"),
    gameEnd:       $("#sushiGameEnd"),
    gameEndTitle:  $("#sushiGameEndTitle"),
    gameEndScores: $("#sushiGameEndScores"),
    playAgainBtn:  $("#sushiPlayAgainButton")
  };

  /* ── State ── */
  const state = {
    players: [],
    currentRound: 1,
    hands: [],       // hands[playerIndex] = [cards]
    pickedThisRound: [], // pickedThisRound[playerIndex] = [cards]
    log: [],
    phase: "idle"
  };

  /* ── Profiles ── */
  const SHARED = window.FANTASY_SHARED_PROFILES || {};
  const PROFILE_ROOT = SHARED.root || "assets/profiles/user";
  function imgUrl(f) { return encodeURI(`${PROFILE_ROOT}/${f}`); }
  function aiProfiles() {
    const g = SHARED.groups || {};
    return (SHARED.difficultyKeys || ["normal", "hard", "expert"]).flatMap(k => (g[k] || []).map(p => ({ ...p, difficulty: k })));
  }

  /* ── Helpers ── */
  function shuffle(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
  function wait(ms) { return new Promise(r => setTimeout(r, ms)); }
  function esc(v) { return String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function addLog(m) { state.log.unshift(m); state.log = state.log.slice(0, 40); }

  /* ── Deck Building ── */
  function buildDeck() {
    const deck = [];
    CARD_DEFS.forEach(def => {
      for (let i = 0; i < def.copies; i++) {
        deck.push({ ...def, id: `${def.type}_${def.name}_${i}` });
      }
    });
    return shuffle(deck);
  }

  /* ── Deal ── */
  function dealCards(playerCount) {
    const deck = buildDeck();
    const handSize = playerCount === 2 ? 10 : playerCount === 3 ? 9 : 8;
    state.hands = [];
    for (let i = 0; i < playerCount; i++) {
      state.hands.push(deck.splice(0, handSize));
    }
  }

  /* ── Scoring ── */
  function scoreRound() {
    const playerCount = state.players.length;
    const roundScores = new Array(playerCount).fill(0);

    // Count maki
    const makiCounts = state.pickedThisRound.map(cards => cards.reduce((s, c) => s + (c.maki || 0), 0));
    const maxMaki = Math.max(...makiCounts);
    const secondMaki = Math.max(...makiCounts.filter(m => m < maxMaki));
    const makiWinners = makiCounts.map((m, i) => m === maxMaki ? i : -1).filter(i => i >= 0);
    const makiSeconds = makiCounts.map((m, i) => m === secondMaki && m < maxMaki ? i : -1).filter(i => i >= 0);

    if (maxMaki > 0) {
      if (makiWinners.length === 1) {
        roundScores[makiWinners[0]] += 6;
      } else {
        makiWinners.forEach(i => { roundScores[i] += Math.floor(6 / makiWinners.length); });
      }
      if (makiSeconds.length === 1) {
        roundScores[makiSeconds[0]] += 3;
      } else if (makiSeconds.length > 1) {
        makiSeconds.forEach(i => { roundScores[i] += Math.floor(3 / makiSeconds.length); });
      }
    }

    // Score each player's picked cards
    for (let i = 0; i < playerCount; i++) {
      const cards = state.pickedThisRound[i];
      let wasabiMultiplier = 1;
      let tempuraCount = 0;
      let sashimiCount = 0;
      let dumplingCount = 0;

      cards.forEach(card => {
        switch (card.type) {
          case "nigiri":
            roundScores[i] += card.points * wasabiMultiplier;
            wasabiMultiplier = 1;
            break;
          case "wasabi":
            wasabiMultiplier = 3;
            break;
          case "tempura":
            tempuraCount++;
            break;
          case "sashimi":
            sashimiCount++;
            break;
          case "dumpling":
            dumplingCount++;
            break;
          // maki scored above, pudding scored at game end
        }
      });

      roundScores[i] += Math.floor(tempuraCount / 2) * 5;
      roundScores[i] += Math.floor(sashimiCount / 3) * 10;
      roundScores[i] += DUMPLING_SCORES[Math.min(dumplingCount, 5)];
    }

    return roundScores;
  }

  function scorePudding() {
    const playerCount = state.players.length;
    const puddingCounts = state.players.map(p => p.puddings);
    const maxP = Math.max(...puddingCounts);
    const minP = Math.min(...puddingCounts);
    const puddingScores = new Array(playerCount).fill(0);

    if (maxP === minP) return puddingScores; // Tie = no bonus/penalty

    const maxWinners = puddingCounts.map((p, i) => p === maxP ? i : -1).filter(i => i >= 0);
    const minLosers = puddingCounts.map((p, i) => p === minP ? i : -1).filter(i => i >= 0);

    maxWinners.forEach(i => { puddingScores[i] += Math.floor(6 / maxWinners.length); });
    minLosers.forEach(i => { puddingScores[i] -= Math.floor(6 / minLosers.length); });

    return puddingScores;
  }

  /* ── AI Card Selection ── */
  function aiSelectCard(handIndex) {
    const hand = state.hands[handIndex];
    if (!hand.length) return 0;

    // Simple AI: prefer high-value cards
    const scores = hand.map(card => {
      switch (card.type) {
        case "nigiri": return card.points * 1.5;
        case "wasabi": return 2.5;
        case "tempura": return 2.5;
        case "sashimi": return 3.3;
        case "dumpling": return 2;
        case "maki": return card.maki * 1.2;
        case "pudding": return 1.5;
        default: return 1;
      }
    });
    let bestIdx = 0;
    let bestScore = -1;
    scores.forEach((s, i) => { if (s > bestScore) { bestScore = s; bestIdx = i; } });
    return bestIdx;
  }

  /* ── Rendering ── */
  function renderPlayers() {
    if (!els.playersList) return;
    els.playersList.innerHTML = state.players.map((p, i) => {
      const picks = state.pickedThisRound[i] || [];
      const pickBadges = picks.map(c => `<span class="sushi-pick-badge">${c.emoji}</span>`).join("");
      return `<section class="sushi-player-card${i === 0 ? " active" : ""}">
        <div class="sushi-player-header">
          <img class="sushi-player-avatar" src="${esc(p.avatarUrl)}" alt="" />
          <span class="sushi-player-name">${esc(p.name)}</span>
          <span class="sushi-player-score">${p.totalScore}점</span>
        </div>
        <div class="sushi-player-picks">${pickBadges || "<small style='color:var(--muted)'>아직 없음</small>"}</div>
      </section>`;
    }).join("");
  }

  function renderHand() {
    if (!els.hand) return;
    const hand = state.hands[0];
    if (!hand) { els.hand.innerHTML = ""; return; }

    els.hand.innerHTML = hand.map((card, i) => {
      let desc = "";
      if (card.type === "nigiri") desc = `${card.points}점`;
      else if (card.type === "maki") desc = `김밥 ${card.maki}개`;
      else if (card.type === "tempura") desc = "2장 = 5점";
      else if (card.type === "sashimi") desc = "3장 = 10점";
      else if (card.type === "dumpling") desc = "1/3/5/8/11점";
      else if (card.type === "wasabi") desc = "다음 초밥 ×3";
      else if (card.type === "pudding") desc = "최종 푸딩";

      return `<div class="sushi-card ${card.type}" data-index="${i}">
        <div class="sushi-card-emoji">${card.emoji}</div>
        <div class="sushi-card-name">${esc(card.name)}</div>
        <div class="sushi-card-desc">${desc}</div>
      </div>`;
    }).join("");

    els.hand.querySelectorAll(".sushi-card").forEach(el => {
      el.addEventListener("click", () => {
        if (state.phase !== "pick") return;
        const idx = Number(el.dataset.index);
        pickCard(0, idx);
      });
    });

    if (els.handInfo) els.handInfo.textContent = `${hand.length}장 남음`;
    if (els.pickInfo) els.pickInfo.textContent = "카드를 1장 선택하세요";
  }

  function renderPuddingCount() {
    if (!els.puddingCount) return;
    els.puddingCount.innerHTML = state.players.map(p =>
      `<span class="sushi-pudding-item">${p.emoji} ${p.name}: ${p.puddings}🍮</span>`
    ).join("");
  }

  function renderMakiRanking() {
    if (!els.makiRanking) return;
    const makiCounts = state.players.map((p, i) => ({
      name: p.name,
      emoji: p.emoji,
      maki: (state.pickedThisRound[i] || []).reduce((s, c) => s + (c.maki || 0), 0)
    })).sort((a, b) => b.maki - a.maki);
    els.makiRanking.innerHTML = `<div class="sushi-panel-title">김밥 현황</div>` +
      makiCounts.map(m => `<div style="font-size:12px;margin:2px 0">${m.emoji} ${m.name}: ${m.maki}개</div>`).join("");
  }

  function renderLog() {
    if (!els.log) return;
    els.log.innerHTML = state.log.map(m => `<li>${esc(m)}</li>`).join("");
  }

  function renderAll() {
    renderPlayers();
    renderHand();
    renderPuddingCount();
    renderMakiRanking();
    renderLog();
    if (els.roundLabel) els.roundLabel.textContent = `라운드 ${state.currentRound}/${TOTAL_ROUNDS}`;
  }

  /* ── Drafting ── */
  function selectCardForPlayer(playerIndex, cardIndex) {
    const hand = state.hands[playerIndex];
    if (!hand || cardIndex < 0 || cardIndex >= hand.length) return false;

    const card = hand.splice(cardIndex, 1)[0];
    state.pickedThisRound[playerIndex].push(card);

    if (card.type === "pudding") {
      state.players[playerIndex].puddings++;
    }

    const p = state.players[playerIndex];
    addLog(`${p.emoji} ${p.name}: ${card.emoji} ${card.name} 선택`);
    return true;
  }

  function pickCard(playerIndex, cardIndex) {
    if (!selectCardForPlayer(playerIndex, cardIndex)) return;

    // AI picks for this turn
    for (let i = 1; i < state.players.length; i++) {
      if (state.hands[i] && state.hands[i].length > 0) {
        const aiIdx = aiSelectCard(i);
        selectCardForPlayer(i, aiIdx);
      }
    }

    // Pass hands left
    const firstHand = state.hands.shift();
    state.hands.push(firstHand);

    // Check if round over
    if (state.hands[0].length === 0) {
      renderAll();
      endRound();
      return;
    }

    renderAll();
  }
  }

  function startDrafting() {
    state.phase = "pick";
    state.pickedThisRound = state.players.map(() => []);
    renderAll();
  }

  /* ── Round End ── */
  function endRound() {
    state.phase = "roundEnd";
    const roundScores = scoreRound();
    roundScores.forEach((score, i) => { state.players[i].roundScore += score; });
    state.players.forEach((p, i) => { p.totalScore = p.roundScore + p.gameEndScore; });

    // Show round end overlay
    els.roundEnd?.classList.remove("hidden");
    if (els.roundEndTitle) els.roundEndTitle.textContent = `라운드 ${state.currentRound} 종료`;
    if (els.roundEndScores) {
      els.roundEndScores.innerHTML = state.players.map((p, i) => `
        <div class="sushi-score-row">
          <span class="sushi-score-row-name">${p.emoji} ${p.name}</span>
          <span class="sushi-score-row-points">+${roundScores[i]}점 (총 ${p.totalScore}점)</span>
        </div>
      `).join("");
    }

    // Log maki winners
    const makiCounts = state.pickedThisRound.map(cards => cards.reduce((s, c) => s + (c.maki || 0), 0));
    const maxMaki = Math.max(...makiCounts);
    if (maxMaki > 0) {
      const winners = state.players.filter((_, i) => makiCounts[i] === maxMaki);
      addLog(`🍱 김밥 1위: ${winners.map(p => p.name).join(", ")} (+6점)`);
    }

    renderAll();
  }

  function nextRound() {
    els.roundEnd?.classList.add("hidden");
    state.currentRound++;

    if (state.currentRound > TOTAL_ROUNDS) {
      endGame();
      return;
    }

    // Deal new cards
    dealCards(state.players.length);
    startDrafting();
    addLog(`--- 라운드 ${state.currentRound} 시작 ---`);
    renderAll();
  }

  /* ── Game End ── */
  function endGame() {
    state.phase = "finished";
    const puddingScores = scorePudding();
    puddingScores.forEach((score, i) => { state.players[i].gameEndScore += score; });
    state.players.forEach(p => { p.totalScore = p.roundScore + p.gameEndScore; });

    const sorted = [...state.players].sort((a, b) => b.totalScore - a.totalScore);

    els.gameEnd?.classList.remove("hidden");
    if (els.gameEndTitle) els.gameEndTitle.textContent = `🏆 ${sorted[0].name} 승리!`;
    if (els.gameEndScores) {
      els.gameEndScores.innerHTML = sorted.map((p, i) => `
        <div class="sushi-score-row">
          <span class="sushi-score-row-name">${i + 1}위 ${p.emoji} ${p.name}</span>
          <span class="sushi-score-row-points">${p.totalScore}점</span>
        </div>
      `).join("");
    }

    addLog(`🏆 ${sorted[0].name} 승리! (${sorted[0].totalScore}점)`);
    puddingScores.forEach((s, i) => {
      if (s !== 0) addLog(`🍮 ${state.players[i].name}: 푸딩 ${s > 0 ? "+" : ""}${s}점`);
    });
    renderAll();
  }

  /* ── Game Start ── */
  function startGame() {
    const count = Math.min(5, Math.max(2, Number(els.playerCount?.value || 3)));
    const pool = shuffle(aiProfiles());

    state.players = Array.from({ length: count }, (_, i) => {
      const human = i === 0;
      const prof = human ? null : pool[i - 1] || { name: `AI ${i}`, avatarUrl: imgUrl("보통-건일.jpg") };
      return {
        id: human ? "human" : `ai${i}`,
        human,
        name: human ? "플레이어" : (prof.name || `AI ${i}`),
        avatarUrl: human ? imgUrl("유저.jpg") : prof.avatarUrl,
        emoji: ["🧑", "🤖", "🎭", "🎪", "🦊"][i] || "👤",
        totalScore: 0,
        roundScore: 0,
        gameEndScore: 0,
        puddings: 0
      };
    });

    state.currentRound = 1;
    state.log = [];
    state.phase = "pick";

    dealCards(count);

    addLog(`🍣 스시고! 게임 시작! ${count}명 참가.`);
    addLog(`--- 라운드 1 시작 ---`);

    document.body.classList.add("sushi-playing");
    els.setupPanel?.classList.add("hidden");
    els.gamePanel?.classList.remove("hidden");
    els.roundEnd?.classList.add("hidden");
    els.gameEnd?.classList.add("hidden");

    startDrafting();
    renderAll();
  }

  function resetToSetup() {
    document.body.classList.remove("sushi-playing");
    document.body.classList.add("sushi-active");
    els.gamePanel?.classList.add("hidden");
    els.setupPanel?.classList.remove("hidden");
    els.roundEnd?.classList.add("hidden");
    els.gameEnd?.classList.add("hidden");
  }

  function leaveGame() { window.location.href = "./"; }

  /* ── Init ── */
  function init() {
    els.startButton?.addEventListener("click", startGame);
    els.newGameButton?.addEventListener("click", resetToSetup);
    els.exitButton?.addEventListener("click", leaveGame);
    els.backButton?.addEventListener("click", leaveGame);
    els.rulesButton?.addEventListener("click", () => { if (typeof els.rulesDialog?.showModal === "function" && !els.rulesDialog.open) els.rulesDialog.showModal(); });
    els.rulesDialog?.addEventListener("click", e => { if (e.target === els.rulesDialog) els.rulesDialog.close(); });
    els.nextRoundBtn?.addEventListener("click", nextRound);
    els.playAgainBtn?.addEventListener("click", startGame);

    document.body.classList.remove("app-loading");
    document.querySelector("#loadingOverlay")?.classList.add("hidden");
  }

  init();
  window.SushiGoGame = { start: startGame, leave: leaveGame };
})();
