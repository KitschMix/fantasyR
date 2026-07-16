/* ===== 스시고! (Sushi Go!) ===== */
(function () {
  "use strict";

  /* ── Card Definitions ── */
  // 공식 스시고! Gamewright 판 분배 (합계 108장):
  //   새우튀김 14, 사시미 14, 만두 14, 김밥 6/12/8, 계란 5, 연어 10, 문어 5,
  //   푸딩 10, 와사비 6, 젓가락 4.
  // 젓가락은 원본 룰의 스왑 메커닉이 미구현이므로 0점 데코로 동작.
  // image: 카드 일러스트 (WebP, 290px). 사시미는 공식 일러스트가 없어 🐟 이모지로 폴백.
  const CARD_DEFS = [
    { type: "nigiri",     name: "계란 초밥",   emoji: "🥚", image: "assets/sushi/계란초밥.webp",   points: 1, copies: 5 },
    { type: "nigiri",     name: "연어 초밥",   emoji: "🍣", image: "assets/sushi/연어 초밥.webp", points: 2, copies: 10 },
    { type: "nigiri",     name: "문어 초밥",   emoji: "🐙", image: "assets/sushi/오징어초밥.webp", points: 3, copies: 5 },
    { type: "maki",       name: "김밥 3",      emoji: "🍱", image: "assets/sushi/김밥3.webp",     points: 0, maki: 3, copies: 8 },
    { type: "maki",       name: "김밥 2",      emoji: "🍙", image: "assets/sushi/김밥2.webp",     points: 0, maki: 2, copies: 12 },
    { type: "maki",       name: "김밥 1",      emoji: "🍘", image: "assets/sushi/김밥1.webp",     points: 0, maki: 1, copies: 6 },
    { type: "tempura",    name: "새우튀김",    emoji: "🍤", image: "assets/sushi/새우튀김.webp",   points: 0, copies: 14 },
    { type: "sashimi",    name: "사시미",      emoji: "🐟", image: "assets/sushi/생선회.webp",     points: 0, copies: 14 },
    { type: "dumpling",   name: "만두",        emoji: "🥟", image: "assets/sushi/만두.webp",       points: 0, copies: 14 },
    { type: "wasabi",     name: "와사비",      emoji: "🟢", image: "assets/sushi/와사비ㅏ.webp",   points: 0, copies: 6 },
    { type: "pudding",    name: "푸딩",        emoji: "🍮", image: "assets/sushi/푸딩.webp",       points: 0, copies: 10 },
    { type: "chopsticks", name: "젓가락",      emoji: "🥢", image: "assets/sushi/젓가락.webp",     points: 0, copies: 4 }
  ];

  const TOTAL_ROUNDS = 3;
  const DUMPLING_SCORES = [0, 1, 3, 5, 8, 11];
  const HAND_SIZES = { 2: 10, 3: 9, 4: 8, 5: 7 }; // 공식 스시고! 분배
  const AI_FIRST_REVEAL_MIN_MS = 700;
  const AI_FIRST_REVEAL_VARIANCE_MS = 300;
  const AI_NEXT_REVEAL_MS = 380;
  const AI_TURN_GAP_MS = 160;

  /* ── DOM ── */
  const $ = (sel) => document.querySelector(sel);
  const els = {
    setupPanel:    $("#sushiSetupPanel"),
    gamePanel:     $("#sushiGamePanel"),
    startButton:   $("#startSushiButton"),
    playerCount:   $("#sushiPlayerCountSelect"),
    difficultySelect: $("#sushiDifficultySelect"),
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
    inventoryPreview:       $("#sushiInventoryPreview"),
    inventoryPreviewAvatar: $("#sushiInventoryPreviewAvatar"),
    inventoryPreviewTitle:  $("#sushiInventoryPreviewTitle"),
    inventoryPreviewMeta:   $("#sushiInventoryPreviewMeta"),
    inventoryPreviewCards:  $("#sushiInventoryPreviewCards"),
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
    const handSize = HAND_SIZES[playerCount] || 8;
    state.hands = [];
    for (let i = 0; i < playerCount; i++) {
      state.hands.push(deck.splice(0, handSize));
    }
  }

  /* ── Scoring ── */
  function scoreRound() {
    const playerCount = state.players.length;
    const roundScores = new Array(playerCount).fill(0);
    // 분해용: [{ nigiri, wasabiBonus, tempura, sashimi, dumpling, maki, makiBonus }, ...]
    const breakdown = Array.from({ length: playerCount }, () => ({
      nigiri: 0, wasabiBonus: 0, tempura: 0, sashimi: 0, dumpling: 0, maki: 0, makiBonus: 0
    }));

    // Count maki
    const makiCounts = state.pickedThisRound.map(cards => cards.reduce((s, c) => s + (c.maki || 0), 0));
    const maxMaki = Math.max(...makiCounts);
    const secondMaki = Math.max(...makiCounts.filter(m => m < maxMaki));
    const makiWinners = makiCounts.map((m, i) => m === maxMaki ? i : -1).filter(i => i >= 0);
    const makiSeconds = makiCounts
      .map((m, i) => m === secondMaki && m < maxMaki && m > 0 ? i : -1)
      .filter(i => i >= 0);

    if (maxMaki > 0) {
      // 공식 룰북: "1등 동점이면 6점을 나눠서 갖습니다. 이 경우에는 두번째로 많은
      // 사람은 점수를 얻지 못합니다."
      if (makiWinners.length === 1) {
        // 1등 단독: 6점
        roundScores[makiWinners[0]] += 6;
        breakdown[makiWinners[0]].makiBonus = 6;
        // 2등은 1등이 단독일 때만 점수. 단독이면 3, 동점이면 3/N 분배.
        if (makiSeconds.length === 1) {
          roundScores[makiSeconds[0]] += 3;
          breakdown[makiSeconds[0]].makiBonus = 3;
        } else if (makiSeconds.length > 1) {
          const share = Math.floor(3 / makiSeconds.length);
          makiSeconds.forEach(i => {
            roundScores[i] += share;
            breakdown[i].makiBonus = share;
          });
        }
      } else {
        // 1등 동점: 6점 분배, 2등 없음
        const share = Math.floor(6 / makiWinners.length);
        makiWinners.forEach(i => {
          roundScores[i] += share;
          breakdown[i].makiBonus = share;
        });
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
          case "nigiri": {
            const pts = card.points * wasabiMultiplier;
            roundScores[i] += pts;
            breakdown[i].nigiri += pts;
            if (wasabiMultiplier === 3) breakdown[i].wasabiBonus += card.points * 2;
            wasabiMultiplier = 1;
            break;
          }
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
          case "chopsticks":
            // 젓가락: 스왑 메커닉 미구현 → 점수 없음 (데코 카드)
            break;
          // maki scored above, pudding scored at game end
        }
      });

      const tp = Math.floor(tempuraCount / 2) * 5;
      const sh = Math.floor(sashimiCount / 3) * 10;
      const dm = DUMPLING_SCORES[Math.min(dumplingCount, 5)];
      roundScores[i] += tp + sh + dm;
      breakdown[i].tempura = tp;
      breakdown[i].sashimi = sh;
      breakdown[i].dumpling = dm;
    }

    return { totals: roundScores, breakdown };
  }

  function scorePudding() {
    const playerCount = state.players.length;
    const puddingCounts = state.players.map(p => p.puddings);
    const maxP = Math.max(...puddingCounts);
    const minP = Math.min(...puddingCounts);
    const puddingScores = new Array(playerCount).fill(0);

    if (maxP === minP) return puddingScores; // Tie = no bonus/penalty

    // 원본 룰: 1등 동점이면 모든 동점자가 +6점, 동점 꼴등 모두 -6점
    puddingCounts.forEach((p, i) => {
      if (p === maxP) puddingScores[i] += 6;
      if (p === minP) puddingScores[i] -= 6;
    });

    return puddingScores;
  }

  /* ── AI Card Selection ── */
  function aiSelectCard(handIndex, difficulty) {
    const hand = state.hands[handIndex];
    if (!hand.length) return 0;
    const diff = difficulty || "normal";

    // 베이스 가중치 (난이도 공통)
    const baseScores = hand.map(card => {
      switch (card.type) {
        case "nigiri":     return card.points * 1.5;
        case "wasabi":     return 2.5;
        case "tempura":    return 2.5;
        case "sashimi":    return 3.3;
        case "dumpling":   return 2;
        case "maki":       return card.maki * 1.2;
        case "pudding":    return 1.5;
        case "chopsticks": return 0.3; // 스왑 메커닉 미구현 → 최후순위
        default:           return 1;
      }
    });

    if (diff === "normal") return argmax(baseScores);

    // ── hard/expert 공통: 핸드 컨텍스트 (쌍 완성, 와사비 페어링) ──
    const picked = state.pickedThisRound[handIndex] || [];
    const pickedTypes = picked.reduce((acc, c) => { acc[c.type] = (acc[c.type] || 0) + 1; return acc; }, {});
    const player = state.players[handIndex];
    const scores = baseScores.map((s, i) => {
      const card = hand[i];
      let v = s;
      // 새우튀김: 이미 홀수 장이면 다음 1장에 큰 가중
      if (card.type === "tempura") v += (pickedTypes.tempura % 2) ? 4 : -1;
      // 사시미: 1,4,7…장일 때 다음 1장에 큰 가중
      if (card.type === "sashimi") v += (pickedTypes.sashimi % 3 === 1) ? 5 : (pickedTypes.sashimi % 3 === 2 ? -1 : 0);
      // 만두: 많이 모을수록 보너스 곡선이므로 항상 약간 가산
      if (card.type === "dumpling") v += Math.min(pickedTypes.dumpling || 0, 4) * 0.3;
      // 와사비: 미보유 시 가중, 보유 중이면 페어링할 고가치 초밥 우선 (다음 턴에서 소비)
      if (card.type === "wasabi" && player.wasabiHeld === 0) v += 1.5;
      // 다음 턴 고가치 초밥 + 보유 와사비 = 큰 가치
      if (card.type === "nigiri" && player.wasabiHeld > 0) v += card.points * 1.5; // 3배 효과의 즉시 가산
      // 푸딩: 이미 3개 이상이면 추가 가중 낮춤
      if (card.type === "pudding") v -= Math.max(0, (player.puddings - 2)) * 0.8;
      return v;
    });

    if (diff === "hard") return argmax(scores);

    // ── expert: 김밥 선두 견제 + 푸딩 게임 인식 ──
    // 다른 플레이어들의 김밥 합계 계산
    const othersMaki = state.players.reduce((max, p, idx) => {
      if (idx === handIndex) return max;
      const mine = (state.pickedThisRound[idx] || []).reduce((s, c) => s + (c.maki || 0), 0);
      return Math.max(max, mine);
    }, 0);
    const myMaki = pickedTypes.maki || 0;
    const isMakiLeader = myMaki > othersMaki;
    const isMakiTrailing = myMaki + 0 < othersMaki;

    return argmax(scores.map((v, i) => {
      const card = hand[i];
      // 김밥: 선두면 추가 가치 ↓ (1등 확정 시 불필요), 뒤지면 ↑
      if (card.type === "maki") {
        v += isMakiTrailing ? card.maki * 0.8 : (isMakiLeader ? -card.maki * 0.5 : 0);
      }
      // 푸딩: 마지막 라운드이고 0개면 패널티 위험 → 반드시 가지기
      if (card.type === "pudding") {
        const roundsLeft = TOTAL_ROUNDS - state.currentRound + 1;
        if (roundsLeft <= 1 && player.puddings === 0) v += 3;
      }
      // expert: 약간의 노이즈 (동점 방지)
      v += Math.random() * 0.4;
      return v;
    }));
  }

  function argmax(arr) {
    let bestIdx = 0, bestScore = -Infinity;
    arr.forEach((s, i) => { if (s > bestScore) { bestScore = s; bestIdx = i; } });
    return bestIdx;
  }

  /* ── Rendering ── */
  function inventoryPreviewCardMarkup(card) {
    let desc = "";
    let points = "";
    if (card.type === "nigiri") { desc = "회전 초밥"; points = `${card.points}점`; }
    else if (card.type === "maki") { desc = `김밥 ${card.maki}장 ` + "●".repeat(card.maki); }
    else if (card.type === "tempura") desc = "2장 = 5점";
    else if (card.type === "sashimi") desc = "3장 = 10점";
    else if (card.type === "dumpling") desc = "누적 1·3·5·8·11";
    else if (card.type === "wasabi") desc = "다음 초밥 ×3";
    else if (card.type === "pudding") desc = "최종 +6/-6";
    else if (card.type === "chopsticks") { desc = "데코 카드"; points = "—"; }

    const visual = card.image
      ? `<img class="sushi-card-image" src="${esc(card.image)}" alt="" loading="lazy" />`
      : `<span class="sushi-card-emoji" aria-hidden="true">${card.emoji}</span>`;

    return `<article class="sushi-card ${card.type} sushi-inventory-preview-card" aria-label="${esc(card.name)}, ${esc(desc)}">
      <span class="sushi-card-art">${visual}</span>
      <span class="sushi-card-text">
        <span class="sushi-card-name">${esc(card.name)}</span>
        <span class="sushi-card-points">${points}</span>
        <span class="sushi-card-desc">${desc}</span>
      </span>
    </article>`;
  }

  function showInventoryPreview(playerIndex) {
    const player = state.players[playerIndex];
    if (!player || !els.inventoryPreview || !els.inventoryPreviewCards) return;

    const picks = state.pickedThisRound[playerIndex] || [];
    if (els.inventoryPreviewAvatar) {
      els.inventoryPreviewAvatar.src = player.avatarUrl || "";
      els.inventoryPreviewAvatar.alt = `${player.name} 프로필`;
    }
    if (els.inventoryPreviewTitle) els.inventoryPreviewTitle.textContent = `${player.name}의 선택 카드`;
    if (els.inventoryPreviewMeta) {
      els.inventoryPreviewMeta.textContent = `라운드 ${state.currentRound} · ${picks.length}장 선택`;
    }
    els.inventoryPreviewCards.innerHTML = picks.length
      ? picks.map(inventoryPreviewCardMarkup).join("")
      : `<div class="sushi-inventory-preview-empty">아직 선택한 카드가 없습니다.</div>`;
    els.inventoryPreview.classList.remove("hidden");
    els.inventoryPreview.setAttribute("aria-hidden", "false");
  }

  function hideInventoryPreview() {
    if (!els.inventoryPreview) return;
    els.inventoryPreview.classList.add("hidden");
    els.inventoryPreview.setAttribute("aria-hidden", "true");
  }

  function renderPlayers() {
    if (!els.playersList) return;
    hideInventoryPreview();
    els.playersList.innerHTML = state.players.map((p, i) => {
      const picks = state.pickedThisRound[i] || [];
      const isHuman = i === 0;
      const pickThumbs = picks.map(c => {
        const visual = c.image
          ? `<img class="sushi-pick-thumb-img" src="${esc(c.image)}" alt="${esc(c.name)}" loading="lazy" />`
          : `<span class="sushi-pick-thumb-emoji" aria-hidden="true">${c.emoji}</span>`;
        return `<span class="sushi-pick-thumb" title="${esc(c.name)}">${visual}</span>`;
      }).join("");
      const wasabiBadge = p.wasabiHeld > 0
        ? `<span class="sushi-wasabi-indicator" title="다음 초밥 3배">🟢×${p.wasabiHeld}</span>`
        : "";
      return `<section class="sushi-player-card${i === 0 ? " active" : ""}${isHuman ? " human" : ""}"
        data-player-index="${i}" tabindex="0"
        aria-label="${esc(p.name)} 프로필 및 선택 카드 ${picks.length}장. 크게 보려면 포커스하세요.">
        <div class="sushi-player-header">
          <img class="sushi-player-avatar" src="${esc(p.avatarUrl)}" alt="" />
          <span class="sushi-player-name">${esc(p.name)}</span>
          ${wasabiBadge}
          <span class="sushi-player-score">${p.totalScore}점</span>
        </div>
        <div class="sushi-player-picks">
          ${pickThumbs || "<small class='sushi-pick-empty'>아직 없음</small>"}
        </div>
      </section>`;
    }).join("");

    els.playersList.querySelectorAll(".sushi-player-card").forEach(cardEl => {
      const playerIndex = Number(cardEl.dataset.playerIndex);
      const openPreview = () => showInventoryPreview(playerIndex);
      cardEl.addEventListener("mouseenter", openPreview);
      cardEl.addEventListener("mouseleave", hideInventoryPreview);
      cardEl.addEventListener("focusin", openPreview);
      cardEl.addEventListener("focusout", event => {
        if (!cardEl.contains(event.relatedTarget)) hideInventoryPreview();
      });
    });
  }

  function renderHand() {
    if (!els.hand) return;
    const hand = state.hands[0];
    if (!hand) { els.hand.innerHTML = ""; return; }

    els.hand.innerHTML = hand.map((card, i) => {
      let desc = "";
      let points = "";
      if (card.type === "nigiri") { desc = "회전 초밥"; points = `${card.points}점`; }
      else if (card.type === "maki") { desc = `김밥 ${card.maki}장 ` + "●".repeat(card.maki); points = ""; }
      else if (card.type === "tempura") { desc = "2장 = 5점"; points = ""; }
      else if (card.type === "sashimi") { desc = "3장 = 10점"; points = ""; }
      else if (card.type === "dumpling") { desc = "누적 1·3·5·8·11"; points = ""; }
      else if (card.type === "wasabi") { desc = "다음 초밥 ×3"; points = ""; }
      else if (card.type === "pudding") { desc = "최종 +6/-6"; points = ""; }
      else if (card.type === "chopsticks") { desc = "데코 카드"; points = "—"; }

      // 일러스트 또는 이모지 폴백 (사시미는 공식 일러스트 없음 → 🐟)
      const visual = card.image
        ? `<img class="sushi-card-image" src="${esc(card.image)}" alt="${esc(card.name)} 일러스트" loading="lazy" />`
        : `<span class="sushi-card-emoji" aria-hidden="true">${card.emoji}</span>`;

      return `<button type="button" class="sushi-card ${card.type}" data-index="${i}"
        aria-label="${esc(card.name)}, ${desc}, 선택하여 손에 추가">
        <span class="sushi-card-art">${visual}</span>
        <span class="sushi-card-text">
          <span class="sushi-card-name" aria-hidden="true">${esc(card.name)}</span>
          <span class="sushi-card-points" aria-hidden="true">${points}</span>
          <span class="sushi-card-desc" aria-hidden="true">${desc}</span>
        </span>
      </button>`;
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

  /**
   * sourceEl에서 targetEl로 카드를 곡선으로 비행시키는 애니메이션.
   * WAAPI keyframe으로 시작점 → 아치 정점 → 도착점(축소+회전+fade).
   * sourceRect/targetRect를 인자로 받아 viewport 밖이어도 안전하게 비행.
   * clone은 left/top=0으로 두고 transform에 절대 좌표를 넣음.
   * clone은 비행 후 자동 제거. removeSource가 true면 sourceEl도 함께 제거 (AI ghost용).
   */
  function flyCardToInventory(sourceEl, targetEl, sourceRect, targetRect, removeSource) {
    if (!sourceEl || !targetEl) return Promise.resolve();

    // 출발/도착 위치 (인자가 있으면 사용, 없으면 측정)
    let startRect = sourceRect || sourceEl.getBoundingClientRect();
    let endRect = targetRect || targetEl.getBoundingClientRect();

    // viewport 밖이면 fallback (손패 중앙 / 사이드바 상단)
    const W = window.innerWidth;
    const H = window.innerHeight;
    if (startRect.top < -50 || startRect.top > H + 50 || startRect.width === 0) {
      startRect = { left: W / 2 - 70, top: H - 220, width: 140, height: 186 };
    }
    if (endRect.top < -50 || endRect.top > H + 50 || endRect.width === 0) {
      endRect = { left: 30, top: 90, width: 36, height: 48 };
    }

    // 사용자 카드 clone: sourceEl의 innerHTML만 복사하고,
    // 별도 fixed element를 만들어 transform으로만 위치 결정.
    const clone = sourceEl.cloneNode(true);
    clone.classList.remove("picked", "passing", "dealing", "round-end", "selected");
    clone.classList.add("sushi-card-fly-clone");
    clone.removeAttribute("id");
    clone.style.position = "fixed";
    clone.style.left = "0px";
    clone.style.top = "0px";
    clone.style.width = startRect.width + "px";
    clone.style.height = startRect.height + "px";
    clone.style.margin = "0";
    clone.style.animation = "none";
    // append와 WAAPI 시작 사이에도 (0, 0)에 한 프레임 노출되지 않게 선배치한다.
    clone.style.transform = `translate(${startRect.left}px, ${startRect.top}px) scale(1) rotate(0deg)`;
    clone.style.opacity = "1";
    document.body.appendChild(clone);

    const startX = startRect.left;
    const startY = startRect.top;
    const endX = endRect.left;
    const endY = endRect.top;
    const dx = endX - startX;
    const dy = endY - startY;
    // 곡선 아치 높이: 이동 거리에 비례 (최소 70, 최대 180)
    const archHeight = Math.max(70, Math.min(180, Math.abs(dx) * 0.25 + Math.abs(dy) * 0.15));
    const midX = startX + dx * 0.5;
    const midY = Math.min(startY, endY) - archHeight;
    const rotSign = dx >= 0 ? 1 : -1;

    // 절대 좌표 transform (clone의 left/top은 0)
    const anim = clone.animate([
      { transform: `translate(${startX}px, ${startY}px) scale(1) rotate(0deg)`, opacity: 1, offset: 0 },
      { transform: `translate(${midX}px, ${midY}px) scale(1.12) rotate(${rotSign * 8}deg)`, opacity: 1, offset: 0.55 },
      { transform: `translate(${endX}px, ${endY}px) scale(0.42) rotate(${rotSign * -12}deg)`, opacity: 0, offset: 1 }
    ], {
      duration: 560,
      easing: "cubic-bezier(0.34, 0.95, 0.5, 1)"
    });

    return anim.finished.then(() => {
      clone.remove();
      // AI ghost 카드 등 임시 source는 비행 후 제거
      if (removeSource && sourceEl.parentNode) sourceEl.remove();
    }).catch(() => {
      // 애니메이션 취소 시에도 clone 정리
      if (clone.parentNode) clone.remove();
      if (removeSource && sourceEl.parentNode) sourceEl.remove();
    });
  }

  /**
   * AI 비행용 ghost 카드 생성. 손패 카드와 동일한 크기의 복제 원본만 만들고,
   * 실제 DOM에는 flyCardToInventory가 만든 비행 clone만 추가한다.
   * 출발 위치는 dataset에 저장한다.
   */
  function makeGhostCardEl(card, sourceEl, size) {
    const el = document.createElement("div");
    el.className = `sushi-card ${card.type} sushi-card-ghost`;
    const visual = card.image
      ? `<img class="sushi-card-image" src="${esc(card.image)}" alt="" />`
      : `<span class="sushi-card-emoji">${card.emoji}</span>`;
    el.innerHTML = `
      <span class="sushi-card-art">${visual}</span>
      <span class="sushi-card-text">
        <span class="sushi-card-name">${esc(card.name)}</span>
      </span>
    `;
    const w = size?.width || 140;
    const h = size?.height || 186;
    el.style.position = "fixed";
    el.style.left = "0px";
    el.style.top = "0px";
    el.style.width = w + "px";
    el.style.height = h + "px";
    // 출발 위치 저장 (flyCardToInventory의 sourceRect로 사용됨)
    const rect = sourceEl.getBoundingClientRect();
    el.dataset.flyStartLeft = String(rect.left + rect.width / 2 - w / 2);
    el.dataset.flyStartTop = String(rect.top + rect.height / 2 - h / 2);
    return el;
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

  /**
   * AI 선택 말풍선 표시. NPC 카드가 사이드바의 헤더에서 인벤토리로 날아가기 전
   * "xxx가 xxx 선택" 같은 정보를 잠깐 보여줘서 선택을 인지할 수 있게 함.
   * 1~1.5초 후 hideAiSelectionBubble로 제거 (비행 시작 시점).
   */
  function showAiSelectionBubble(playerIndex, card) {
    if (!els.playersList) return;
    const cardEl = els.playersList.querySelector(
      `.sushi-player-card:nth-child(${playerIndex + 1})`
    );
    if (!cardEl) return;
    // 중복 방지
    if (cardEl.querySelector('.sushi-ai-bubble')) return;
    const p = state.players[playerIndex];
    if (!p) return;
    const bubble = document.createElement('div');
    bubble.className = 'sushi-ai-bubble';
    bubble.innerHTML =
      `<span class="bubble-emoji">${p.emoji}</span>` +
      `<strong>${p.name}</strong> 선택 ` +
      `<span class="bubble-card">${card.emoji} ${card.name}</span>`;
    // AI 카드 사이 살짝 어긋나게 배치 (여러 AI가 있을 때 겹침 방지)
    const offset = (playerIndex - 1) * 4;
    bubble.style.top = `${-38 - offset}px`;
    cardEl.appendChild(bubble);
  }

  function hideAiSelectionBubble(playerIndex) {
    if (!els.playersList) return;
    const cardEl = els.playersList.querySelector(
      `.sushi-player-card:nth-child(${playerIndex + 1})`
    );
    if (!cardEl) return;
    cardEl.querySelectorAll('.sushi-ai-bubble').forEach(el => el.remove());
  }

  function selectCardForPlayer(playerIndex, cardIndex) {
    const hand = state.hands[playerIndex];
    if (!hand || cardIndex < 0 || cardIndex >= hand.length) return false;

    const card = hand.splice(cardIndex, 1)[0];
    state.pickedThisRound[playerIndex].push(card);

    if (card.type === "pudding") {
      state.players[playerIndex].puddings++;
    }
    if (card.type === "wasabi") {
      state.players[playerIndex].wasabiHeld++;
    }
    if (card.type === "nigiri" && state.players[playerIndex].wasabiHeld > 0) {
      state.players[playerIndex].wasabiHeld--;
    }

    const p = state.players[playerIndex];
    addLog(`${p.emoji} ${p.name}: ${card.emoji} ${card.name} 선택`);
    return true;
  }

  function pickCard(playerIndex, cardIndex) {
    if (playerIndex !== 0) return;
    // 비행 진행 중 중복 클릭 차단. "pick"은 정상, "roundEnd"/"finished"는 종료 상태.
    if (state.phase === "flying") return;

    // 이전 비행 잔여물 정리 (혹시 남아있으면)
    document.querySelectorAll('.sushi-card-fly-clone, .sushi-card-ghost').forEach(el => el.remove());

    state.phase = "flying";

    // 손패 카드 크기 미리 측정 (AI ghost 카드용)
    const handCardSize = els.hand?.querySelector(".sushi-card")?.getBoundingClientRect();

    // 사용자 카드 비행 시작 (state 업데이트 전, 손패에서 인벤토리로 곡선 비행)
    const userCardEls = els.hand?.querySelectorAll(".sushi-card");
    const userSourceEl = userCardEls?.[cardIndex];
    const userTargetEl = els.playersList?.querySelector(".sushi-player-card:first-child .sushi-player-picks");

    // 모든 비행 promise를 모아서 마지막 비행 종료 후 phase 복원
    const flights = [];

    if (userSourceEl && userTargetEl) {
      userSourceEl.classList.add("picked");
      const userRect = userSourceEl.getBoundingClientRect();
      const userTargetRect = userTargetEl.getBoundingClientRect();
      flights.push(flyCardToInventory(userSourceEl, userTargetEl, userRect, userTargetRect));
    }

    // Wait for animation then process (가속: 450→250ms)
    setTimeout(async () => {
      if (!selectCardForPlayer(playerIndex, cardIndex)) {
        Promise.all(flights).finally(() => { state.phase = "idle"; });
        return;
      }

      // Animate passing (remaining hand slides left)
      if (els.hand) {
        els.hand.querySelectorAll(".sushi-card").forEach((el, i) => {
          // 이전 턴의 등장 애니메이션이 passing을 덮어쓰지 않게 정리한다.
          el.classList.remove("dealing");
          el.style.animationDelay = `${i * 25}ms`;
          el.classList.add("passing");
        });
      }

      // AI picks for this turn. 실제 드래프트 계산은 한 턴이지만,
      // 선택 표시와 카드 비행은 한 명씩 보여 줘서 진행 순서를 읽기 쉽게 한다.
      const aiTurns = [];
      for (let i = 1; i < state.players.length; i++) {
        if (state.hands[i] && state.hands[i].length > 0) {
          const aiIdx = aiSelectCard(i, state.aiDifficulty);
          const aiCard = state.hands[i][aiIdx];
          aiTurns.push({ playerIndex: i, aiIdx, aiCard });
        }
      }

      for (let turnIndex = 0; turnIndex < aiTurns.length; turnIndex++) {
        const turn = aiTurns[turnIndex];
        const i = turn.playerIndex;

        showAiSelectionBubble(i, turn.aiCard);
        const revealDelay = turnIndex === 0
          ? AI_FIRST_REVEAL_MIN_MS + Math.floor(Math.random() * AI_FIRST_REVEAL_VARIANCE_MS)
          : AI_NEXT_REVEAL_MS;
        await wait(revealDelay);
        hideAiSelectionBubble(i);

        const aiSourceEl = els.playersList?.querySelector(`.sushi-player-card:nth-child(${i + 1}) .sushi-player-header`);
        const aiTargetEl = els.playersList?.querySelector(`.sushi-player-card:nth-child(${i + 1}) .sushi-player-picks`);
        let aiFlight = Promise.resolve();
        if (aiSourceEl && aiTargetEl) {
          const ghost = makeGhostCardEl(turn.aiCard, aiSourceEl, handCardSize);
          // ghost dataset에서 출발 위치 읽기
          const aiStartRect = {
            left: parseFloat(ghost.dataset.flyStartLeft) || 0,
            top: parseFloat(ghost.dataset.flyStartTop) || 0,
            width: parseFloat(ghost.style.width) || 140,
            height: parseFloat(ghost.style.height) || 186
          };
          const aiTargetRect = aiTargetEl.getBoundingClientRect();
          aiFlight = flyCardToInventory(ghost, aiTargetEl, aiStartRect, aiTargetRect, true);
          flights.push(aiFlight);
        }
        selectCardForPlayer(i, turn.aiIdx);

        // 현재 AI 카드가 도착한 뒤 다음 AI가 선택을 공개한다.
        await aiFlight;
        if (turnIndex < aiTurns.length - 1) await wait(AI_TURN_GAP_MS);
      }

      // 모든 AI의 순차 애니메이션이 끝난 뒤 손패를 왼쪽으로 넘긴다.
      await wait(200);
      const firstHand = state.hands.shift();
      state.hands.push(firstHand);

      // Check if round over
      if (state.hands[0].length === 0) {
        renderAll();
        // Animate round end (가속: 600→350ms)
        if (els.hand) {
          els.hand.querySelectorAll(".sushi-card").forEach((el, i) => {
            el.style.animationDelay = `${i * 35}ms`;
            el.classList.add("round-end");
          });
        }
        setTimeout(() => endRound(), 350);
        // 비행 종료 후 phase 복원. 라운드 종료(endRound → 'roundEnd')는 변경 안 함.
        Promise.all(flights).finally(() => {
          if (state.phase === "flying") state.phase = "pick";
        });
        return;
      }

      renderAll();
      // Animate new hand appearing
      if (els.hand) {
        els.hand.querySelectorAll(".sushi-card").forEach((el, i) => {
          el.style.animationDelay = `${i * 30}ms`;
          el.classList.add("dealing");
          el.addEventListener("animationend", event => {
            if (event.animationName !== "sushiDealCard") return;
            el.classList.remove("dealing");
            el.style.animationDelay = "";
          }, { once: true });
        });
      }

      // 모든 비행 완료 후 phase를 'pick'으로 복원해서 다음 사이클에서 사용자가
      // 새 손패의 카드를 클릭할 수 있게 함. (라운드 종료 시 endRound가 'roundEnd'로
      // 변경하므로 race condition 없음.)
      Promise.all(flights).finally(() => {
        if (state.phase === "flying") state.phase = "pick";
      });
    }, 250);
  }

  function startDrafting() {
    state.phase = "pick";
    state.pickedThisRound = state.players.map(() => []);
    renderAll();
  }

  /* ── Round End ── */
  function endRound() {
    state.phase = "roundEnd";
    const { totals: roundScores, breakdown } = scoreRound();
    roundScores.forEach((score, i) => { state.players[i].roundScore += score; });
    state.players.forEach((p, i) => { p.totalScore = p.roundScore + p.gameEndScore; });

    // Show round end overlay
    els.roundEnd?.classList.remove("hidden");
    if (els.roundEndTitle) els.roundEndTitle.textContent = `라운드 ${state.currentRound} 종료`;
    if (els.roundEndScores) {
      els.roundEndScores.innerHTML = state.players.map((p, i) => {
        const b = breakdown[i];
        const lines = [];
        if (b.nigiri) lines.push(`🍣 회전 초밥 <strong>+${b.nigiri}</strong>` + (b.wasabiBonus ? ` <small>(와사비 보너스 +${b.wasabiBonus})</small>` : ""));
        if (b.tempura) lines.push(`🍤 새우튀김 쌍 <strong>+${b.tempura}</strong>`);
        if (b.sashimi) lines.push(`🐟 사시미 트리플 <strong>+${b.sashimi}</strong>`);
        if (b.dumpling) lines.push(`🥟 만두 <strong>+${b.dumpling}</strong>`);
        if (b.makiBonus) lines.push(`🍱 김밥 보너스 <strong>+${b.makiBonus}</strong>`);
        return `<div class="sushi-score-block">
          <div class="sushi-score-row">
            <span class="sushi-score-row-name">${p.emoji} ${p.name}</span>
            <span class="sushi-score-row-points">+${roundScores[i]}점 (총 ${p.totalScore}점)</span>
          </div>
          ${lines.length ? `<ul class="sushi-score-breakdown">${lines.map(l => `<li>${l}</li>`).join("")}</ul>` : ""}
        </div>`;
      }).join("");
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
    state.currentRound = TOTAL_ROUNDS; // 라운드 라벨 "4/3" 깜빡임 방지
    if (state.startedAt && window.FANTASY_PLAYER_STATS) {
      const sorted = [...state.players].sort((a, b) => b.totalScore - a.totalScore);
      const human = state.players.find((p) => p && p.human);
      if (human) {
        const isWin = sorted[0] && sorted[0].id === human.id;
        window.FANTASY_PLAYER_STATS.recordGame({
          gameType: "sushi-go",
          result: isWin ? "win" : "loss",
          score: human.totalScore || 0,
          durationSec: Math.max(0, Math.floor((Date.now() - state.startedAt) / 1000)),
          playerCount: state.players.length,
          deckList: null,
        });
      }
    }
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
    state.startedAt = Date.now();
    state.aiDifficulty = els.difficultySelect?.value || els.aiDifficultySelect?.value || "normal";
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
        puddings: 0,
        wasabiHeld: 0
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
  /* ── Tutorial ── */
  const TUTORIAL_STEPS = [
    {
      title: "게임 목표",
      html: `<span class="tutorial-emoji">🍣</span>
        <h3>스시고!에 오신 것을 환영합니다!</h3>
        <p>3라운드 동안 스시 카드를 골라 <strong>가장 많은 점수</strong>를 획득하세요!</p>
        <div class="tutorial-highlight">매 턴 카드 1장을 고르고, 나머지는 왼쪽 사람에게 넘깁니다.</div>`
    },
    {
      title: "드래프팅",
      html: `<span class="tutorial-emoji">🔄</span>
        <h3>카드 드래프팅이란?</h3>
        <p>손패에서 <strong>1장</strong>을 선택하면, 나머지 카드가 왼쪽 플레이어에게 전달됩니다.</p>
        <p>왼쪽에서는 받은 카드에서 또 1장을 고르고, 나머지를 넘깁니다.</p>
        <div class="tutorial-highlight">카드가 모두 없어지면 라운드 종료!<br>상대가 뭘 고르는지 보면서 전략을 세우세요.</div>`
    },
    {
      title: "회전 초밥 & 와사비",
      html: `<span class="tutorial-emoji">🍣</span>
        <h3>회전 초밥으로 즉시 점수!</h3>
        <ul>
          <li>🥚 <strong>계란 초밥</strong> — 1점</li>
          <li>🍣 <strong>연어 초밥</strong> — 2점</li>
          <li>🐙 <strong>문어 초밥</strong> — 3점</li>
        </ul>
        <p>🟢 <strong>와사비</strong>를 먼저 놓으면, 다음 초밥 점수가 <strong>3배!</strong></p>
        <div class="tutorial-highlight">와사비 → 문어 초밥 = 3×3 = <strong>9점!</strong></div>`
    },
    {
      title: "모으는 카드",
      html: `<span class="tutorial-emoji">📦</span>
        <h3>많이 모을수록 강해지는 카드들</h3>
        <ul>
          <li>🍤 <strong>새우튀김</strong> — 2장 = 5점</li>
          <li>🐟 <strong>사시미</strong> — 3장 = 10점</li>
          <li>🥟 <strong>만두</strong> — 1장=1점, 2장=3점, 3장=5점, 4장=8점, 5장=11점</li>
        </ul>
        <div class="tutorial-highlight">만두는 5장 모으면 11점! 하지만 상대도 노릴 수 있어요.</div>`
    },
    {
      title: "김밥 & 푸딩",
      html: `<span class="tutorial-emoji">🍱</span>
        <h3>김밥과 푸딩은 특별합니다</h3>
        <p>🍱 <strong>김밥</strong> — 라운드 종료 시 가장 많이 가진 사람 <strong>6점</strong>, 2등 <strong>3점</strong></p>
        <p>🍮 <strong>푸딩</strong> — 3라운드 전체가 끝난 후 가장 많은 사람 <strong>+6점</strong>, 가장 적은 사람 <strong>-6점</strong></p>
        <div class="tutorial-highlight">푸딩은 3라운드 동안 누적됩니다. 너무 많이 버리면 -6점!</div>`
    },
    {
      title: "전략 팁",
      html: `<span class="tutorial-emoji">💡</span>
        <h3>승리를 위한 전략</h3>
        <ul>
          <li><strong>상대 파악:</strong> 상대가 뭘 고르는지 보면 전략이 보여요</li>
          <li><strong>포기:</strong> 사시미 1장은 0점. 못 모을 것 같으면 과감히 버리세요</li>
          <li><strong>와사비 타이밍:</strong> 와사비 놓고 다음 턴에 초밥이 안 오면 낭비!</li>
          <li><strong>김밥 견제:</strong> 상대가 김밥을 많이 모으면 1장을 뺏어오세요</li>
          <li><strong>푸딩 관리:</strong> 최소 2~3장은 확보해두세요</li>
        </ul>`
    },
    {
      title: "게임 흐름",
      html: `<span class="tutorial-emoji">🎮</span>
        <h3>게임은 이렇게 진행됩니다</h3>
        <ol>
          <li><strong>라운드 시작:</strong> 카드가 배분됩니다 (인원수에 따라 8~10장)</li>
          <li><strong>드래프팅:</strong> 카드를 1장씩 선택하며 손패가 줄어듭니다</li>
          <li><strong>라운드 종료:</strong> 점수 계산 + 김밥 보너스</li>
          <li><strong>3라운드 후:</strong> 푸딩 점수 반영 → 최종 승자 결정!</li>
        </ol>
        <div class="tutorial-highlight">자, 이제 게임을 시작해볼까요? 🍣</div>`
    }
  ];

  let tutorialStep = 0;

  function showTutorial(step) {
    tutorialStep = Math.max(0, Math.min(step, TUTORIAL_STEPS.length - 1));
    const s = TUTORIAL_STEPS[tutorialStep];
    const titleEl = document.querySelector("#sushiTutorialTitle");
    const stepEl = document.querySelector("#sushiTutorialStep");
    const bodyEl = document.querySelector("#sushiTutorialBody");
    const prevBtn = document.querySelector("#sushiTutorialPrev");
    const nextBtn = document.querySelector("#sushiTutorialNext");
    if (titleEl) titleEl.textContent = `📖 ${s.title}`;
    if (stepEl) stepEl.textContent = `${tutorialStep + 1}/${TUTORIAL_STEPS.length}`;
    if (bodyEl) bodyEl.innerHTML = s.html;
    if (prevBtn) prevBtn.disabled = tutorialStep === 0;
    if (nextBtn) nextBtn.textContent = tutorialStep === TUTORIAL_STEPS.length - 1 ? "완료" : "다음 →";
  }

  function init() {
    els.startButton?.addEventListener("click", startGame);
    els.newGameButton?.addEventListener("click", resetToSetup);
    els.exitButton?.addEventListener("click", leaveGame);
    els.backButton?.addEventListener("click", leaveGame);
    els.rulesButton?.addEventListener("click", () => { if (typeof els.rulesDialog?.showModal === "function" && !els.rulesDialog.open) els.rulesDialog.showModal(); });
    els.rulesDialog?.addEventListener("click", e => { if (e.target === els.rulesDialog) els.rulesDialog.close(); });
    els.nextRoundBtn?.addEventListener("click", nextRound);
    els.playAgainBtn?.addEventListener("click", startGame);

    // Tutorial
    const tutorialBtn = document.querySelector("#sushiTutorialButton");
    const tutorialDialog = document.querySelector("#sushiTutorialDialog");
    const tutorialPrev = document.querySelector("#sushiTutorialPrev");
    const tutorialNext = document.querySelector("#sushiTutorialNext");
    tutorialBtn?.addEventListener("click", () => {
      if (typeof tutorialDialog?.showModal === "function") { showTutorial(0); tutorialDialog.showModal(); }
    });
    tutorialPrev?.addEventListener("click", () => showTutorial(tutorialStep - 1));
    tutorialNext?.addEventListener("click", () => {
      if (tutorialStep >= TUTORIAL_STEPS.length - 1) tutorialDialog?.close();
      else showTutorial(tutorialStep + 1);
    });

    document.body.classList.remove("app-loading");
    document.querySelector("#loadingOverlay")?.classList.add("hidden");
  }

  init();
  window.SushiGoGame = { start: startGame, leave: leaveGame };
})();
