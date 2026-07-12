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

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-setup-scale]").forEach(setupScaleControl);
    document.querySelectorAll("[data-dialog-target]").forEach((button) => {
      button.addEventListener("click", () => openDialog(button));
    });
    document.querySelectorAll("[data-preview-ranking-refresh]").forEach((button) => {
      button.addEventListener("click", () => refreshPreviewRanking(button));
    });
  });
})();
