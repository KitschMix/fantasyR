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

  async function loadLiveRanking(list) {
    if (!list) return;
    const panel = list.closest(".game-ranking-panel");
    const status = panel?.querySelector("[data-ranking-status]");
    const gameType = list.dataset.gameType || "";
    const stats = window.FANTASY_PLAYER_STATS;

    list.innerHTML = '<li class="leaderboard-empty"><strong>불러오는 중...</strong></li>';
    if (status) status.textContent = "랭킹을 불러오는 중입니다.";

    if (!gameType || typeof stats?.fetchTopRankings !== "function") {
      list.innerHTML = '<li class="leaderboard-empty"><strong>랭킹 연결을 확인해주세요.</strong></li>';
      if (status) status.textContent = "랭킹 서비스를 불러오지 못했습니다.";
      return;
    }

    const rankings = await stats.fetchTopRankings(gameType, 10);
    if (!rankings.length) {
      list.innerHTML = '<li class="leaderboard-empty"><strong>아직 등록된 기록이 없습니다.</strong></li>';
      if (status) status.textContent = "싱글플레이 기록이 등록되면 이곳에 표시됩니다.";
      return;
    }

    list.innerHTML = rankings.map((entry, index) => `
      <li>
        <span class="leaderboard-rank">${index + 1}</span>
        <strong>${escapeHtml(entry.nickname || "익명")}</strong>
        <b>${Number(entry.total_score || 0).toLocaleString("ko-KR")}점</b>
        <small>승률 ${Number(entry.win_rate_pct || 0)}% · ${Number(entry.total_games || 0)}게임</small>
      </li>
    `).join("");
    if (status) status.textContent = "닉네임별 누적 점수 기준 TOP 10입니다.";
  }

  document.addEventListener("DOMContentLoaded", () => {
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
        const list = document.querySelector(button.dataset.liveRankingRefresh || "");
        button.disabled = true;
        await loadLiveRanking(list);
        button.disabled = false;
      });
    });
  });
})();
