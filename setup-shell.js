(function () {
  "use strict";

  const STORAGE_KEY = "fantasyR.setupScalePercent";
  const MIN = 50;
  const MAX = 120;
  const STEP = 10;

  function readScale() {
    const value = Number.parseInt(window.localStorage?.getItem(STORAGE_KEY) || "100", 10);
    return Number.isFinite(value) ? Math.min(MAX, Math.max(MIN, value)) : 100;
  }

  function setupScaleControl(control) {
    const target = document.querySelector(control.dataset.scaleTarget || ".game-setup-shell");
    const down = control.querySelector("[data-scale-down]");
    const up = control.querySelector("[data-scale-up]");
    const output = control.querySelector("[data-scale-value]");
    if (!target || !down || !up || !output) return;

    let scale = readScale();
    const render = () => {
      target.style.setProperty("zoom", String(scale / 100));
      output.textContent = `${scale}%`;
      down.disabled = scale <= MIN;
      up.disabled = scale >= MAX;
      window.localStorage?.setItem(STORAGE_KEY, String(scale));
    };

    down.addEventListener("click", () => {
      scale = Math.max(MIN, scale - STEP);
      render();
    });
    up.addEventListener("click", () => {
      scale = Math.min(MAX, scale + STEP);
      render();
    });
    render();
  }

  function openDialog(button) {
    const dialog = document.querySelector(button.dataset.dialogTarget || "");
    if (typeof dialog?.showModal === "function" && !dialog.open) dialog.showModal();
  }

  function refreshPreviewRanking(button) {
    const status = document.querySelector(button.dataset.statusTarget || "");
    if (!status) return;
    button.disabled = true;
    status.textContent = "랭킹을 새로 확인했습니다. 현재 내용은 디자인 시안용입니다.";
    window.setTimeout(() => {
      button.disabled = false;
    }, 500);
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  /**
   * 랭킹 모드별 자동 라벨 (HTML에 <h3>가 없을 때 fallback).
   * 새 게임은 <ol data-ranking-mode="..."> 한 줄만 적으면 자동 적용.
   */
  const RANKING_LABELS = Object.freeze({
    turns: "최단 턴 TOP 10",
    duration: "최단 시간 TOP 10",
    score: "최고 점수 TOP 10",
  });

  /**
   * 멀티플레이(온라인) 섹션 라벨 — 8게임 공통.
   * 새 게임 HTML 에 멀티플레이 모드 패널이 없어도 아래 기본값으로 자동 부착됨.
   * - panelTitle / panelStatus : 헤더
   * - createButton / joinLabel / joinPlaceholder / joinButton : 컨트롤
   * - waitingHeadline / waitingDetail : 준비 중 안내 메시지
   * - profileSource : "첫 화면 프로필 사용" 안내
   */
  const MULTIPLAYER_LABELS = Object.freeze({
    panelTitle: "멀티플레이",
    panelStatus: "준비 중",
    profileSource: "첫 화면 프로필 사용",
    createButton: "방 만들기",
    joinLabel: "방 코드",
    joinPlaceholder: "6자리 코드",
    joinButton: "입장",
    waitingHeadline:
      "친구와 함께하는 보드게임을 준비하고 있습니다.",
    waitingDetail:
      "방에 입장하면 참가자와 준비 상태를 확인한 뒤 같은 보드에서 게임을 시작하게 됩니다.",
  });

  /**
   * 랭킹 컬럼 안의 <h3> 보장.
   * HTML에 이미 <h3> 있으면 그대로 두고, 없으면 RANKING_LABELS[mode] 또는 data-ranking-title 로 자동 삽입.
   * - data-ranking-title="..." → 명시적 라벨 오버라이드 (예: "누적 점수 TOP 10")
   * - 기존 aria-label 건드리지 않음 (게임별 표시명 보존)
   */
  function ensureRankingHeading(list) {
    if (!list) return;
    const column = list.closest(".leaderboard-column");
    if (!column) return;
    if (column.querySelector(":scope > h3, :scope > section > h3, h3")) return;

    const mode = list.dataset.rankingMode || "score";
    const title = (list.dataset.rankingTitle || "").trim() || RANKING_LABELS[mode] || mode;
    const heading = document.createElement("h3");
    heading.textContent = title;
    list.parentNode.insertBefore(heading, list);
  }

  /**
   * 멀티플레이(온라인) 모드 패널 보장.
   * - HTML 에 이미 .online-panel / .online-controls / [data-setup-mode="multi"] 있으면 그대로 둠
   * - 없으면 멀티플레이 grid 안 마지막 mode-panel 뒤에 기본 "준비 중" 패널 자동 주입
   * - gameName 인자가 있으면 aria-label / 메시지에 게임명 추가 가능 (현재는 기본값 사용)
   */
  function ensureMultiplayerPanel(grid) {
    if (!grid) return;
    if (grid.querySelector(".online-panel, [data-setup-mode='multi']")) return;

    const m = MULTIPLAYER_LABELS;
    const panel = document.createElement("div");
    panel.className = "mode-panel online-panel game-setup-mode";
    panel.setAttribute("data-setup-mode", "multi");
    panel.setAttribute("aria-label", "온라인 모드 준비 중");
    panel.innerHTML = `
      <div class="mode-panel-head online-panel-head">
        <strong>${escapeHtml(m.panelTitle)}</strong>
        <span class="online-status">${escapeHtml(m.panelStatus)}</span>
      </div>
      <div class="setup-coming-actions">
        <div class="setup-profile-source">
          <span>플레이어</span>
          <strong>${escapeHtml(m.profileSource)}</strong>
        </div>
        <button class="secondary-button" type="button" disabled>${escapeHtml(m.createButton)}</button>
        <label>
          ${escapeHtml(m.joinLabel)}
          <input type="text" maxlength="6" placeholder="${escapeHtml(m.joinPlaceholder)}" disabled />
        </label>
        <button class="secondary-button" type="button" disabled>${escapeHtml(m.joinButton)}</button>
        <div class="setup-online-note">
          <strong>${escapeHtml(m.waitingHeadline)}</strong>
          <small>${escapeHtml(m.waitingDetail)}</small>
        </div>
      </div>
    `;

    // 마지막 mode-panel 뒤에 부착 (단일 모드 옆에 형제로)
    const panels = grid.querySelectorAll(".mode-panel");
    if (panels.length > 0) {
      panels[panels.length - 1].after(panel);
    } else {
      grid.appendChild(panel);
    }
  }

  async function loadLiveRanking(list) {
    if (!list) return;
    ensureRankingHeading(list);
    const panel = list.closest(".game-ranking-panel");
    const status = panel?.querySelector("[data-ranking-status]");
    const gameType = list.dataset.gameType || "";
    const mode = list.dataset.rankingMode || "score";
    const stats = window.FANTASY_PLAYER_STATS;

    list.innerHTML = '<li class="leaderboard-empty"><strong>불러오는 중...</strong></li>';
    if (status) status.textContent = "랭킹을 불러오는 중입니다.";

    if (!gameType || !stats) {
      list.innerHTML = '<li class="leaderboard-empty"><strong>랭킹 연결을 확인해주세요.</strong></li>';
      if (status) status.textContent = "랭킹 서비스를 불러오지 못했습니다.";
      return;
    }

    let rankings = [];
    let emptyMessage = "아직 등록된 기록이 없습니다.";
    let fetchOk = false;

    if (mode === "duration") {
      if (typeof stats.fetchTopRankingsByDuration === "function") {
        rankings = await stats.fetchTopRankingsByDuration(gameType, 10);
        emptyMessage = "아직 승리 기록이 없습니다.";
        fetchOk = true;
      }
    } else if (mode === "turns") {
      if (typeof stats.fetchTopRankingsByTurns === "function") {
        rankings = await stats.fetchTopRankingsByTurns(gameType, 10);
        emptyMessage = "아직 승리 기록이 없습니다.";
        fetchOk = true;
      }
    } else {
      if (typeof stats.fetchTopRankingsByScore === "function") {
        rankings = await stats.fetchTopRankingsByScore(gameType, 10);
        fetchOk = true;
      } else if (typeof stats.fetchTopRankings === "function") {
        rankings = await stats.fetchTopRankings(gameType, 10);
        fetchOk = true;
      }
    }

    if (!fetchOk) {
      list.innerHTML = '<li class="leaderboard-empty"><strong>랭킹 연결을 확인해주세요.</strong></li>';
      if (status) status.textContent = "랭킹 서비스를 불러오지 못했습니다.";
      return;
    }

    if (!rankings.length) {
      list.innerHTML = `<li class="leaderboard-empty"><strong>${escapeHtml(emptyMessage)}</strong></li>`;
      return;
    }

    if (mode === "duration") {
      list.innerHTML = rankings.map((entry, index) => `
        <li>
          <span class="leaderboard-rank">${index + 1}</span>
          <strong>${escapeHtml(entry.nickname || "익명")}</strong>
          <b>${formatRankingDuration(entry.duration_sec)}</b>
          <small>${Number(entry.player_count || 0)}명 · ${Number(entry.score || 0).toLocaleString("ko-KR")}점</small>
        </li>
      `).join("");
    } else if (mode === "turns") {
      list.innerHTML = rankings.map((entry, index) => `
        <li>
          <span class="leaderboard-rank">${index + 1}</span>
          <strong>${escapeHtml(entry.nickname || "익명")}</strong>
          <b>${Number(entry.turns || 0)}턴</b>
          <small>${Number(entry.player_count || 0)}명 · ${formatRankingDuration(entry.duration_sec)}</small>
        </li>
      `).join("");
    } else {
      list.innerHTML = rankings.map((entry, index) => `
        <li>
          <span class="leaderboard-rank">${index + 1}</span>
          <strong>${escapeHtml(entry.nickname || "익명")}</strong>
          <b>${Number(entry.score || entry.total_score || 0).toLocaleString("ko-KR")}점</b>
          <small>${Number(entry.player_count || 0)}명 · ${formatRankingDuration(entry.duration_sec)}</small>
        </li>
      `).join("");
    }

    if (status) {
      status.textContent = mode === "duration"
        ? "닉네임별 최단 승리 게임 기준 TOP 10입니다."
        : mode === "turns"
        ? "닉네임별 최단 턴 승리 게임 기준 TOP 10입니다."
        : "닉네임별 단일 게임 최고 점수 기준 TOP 10입니다.";
    }
  }

  function formatRankingDuration(sec) {
    const total = Math.max(0, Math.floor(Number(sec) || 0));
    if (!total) return "기록 없음";
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    if (h > 0) return `${h}시간 ${m}분`;
    return `${m}분`;
  }

  document.addEventListener("DOMContentLoaded", () => {
    // 멀티플레이 모드 패널 자동 부착 — 게임별 game-setup-grid 별로 1회
    document.querySelectorAll(".game-setup-grid").forEach(ensureMultiplayerPanel);

    document.querySelectorAll("[data-setup-scale]").forEach(setupScaleControl);
    document.querySelectorAll("[data-dialog-target]").forEach((button) => {
      button.addEventListener("click", () => openDialog(button));
    });
    document.querySelectorAll("[data-preview-ranking-refresh]").forEach((button) => {
      button.addEventListener("click", () => refreshPreviewRanking(button));
    });
    document.querySelectorAll("[data-live-ranking]").forEach(loadLiveRanking);
    document.querySelectorAll("[data-live-ranking-refresh]").forEach((button) => {
      button.addEventListener("click", async () => {
        button.disabled = true;
        // 특정 타겟이 있으면 그 리스트만, 없으면 패널 안의 모든 라이브 랭킹을 새로고침
        const scope = button.dataset.rankingTarget
          ? document.querySelectorAll(button.dataset.rankingTarget)
          : button.closest(".game-ranking-panel")?.querySelectorAll("[data-live-ranking]") || [];
        const lists = button.dataset.liveRankingRefresh
          ? [document.querySelector(button.dataset.liveRankingRefresh)].filter(Boolean)
          : Array.from(scope);
        await Promise.all(lists.map(loadLiveRanking));
        button.disabled = false;
      });
    });
  });
})();
