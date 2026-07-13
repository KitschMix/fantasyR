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
