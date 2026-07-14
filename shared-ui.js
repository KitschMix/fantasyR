(function () {
  "use strict";

  let centerToastTimer = 0;
  let currentCenterToastKey = "";
  let dismissedCenterToastKey = "";

  function getToastElements() {
    return {
      toast: document.querySelector("#turnToast"),
      text: document.querySelector("#turnToastText")
    };
  }

  function finishInitialLoading() {
    document.body.classList.remove("app-loading");
  }

  function hideCenterToast() {
    const { toast } = getToastElements();
    if (centerToastTimer) {
      window.clearTimeout(centerToastTimer);
      centerToastTimer = 0;
    }
    toast?.classList.remove("visible");
    toast?.setAttribute("aria-hidden", "true");
  }

  function dismissCenterToast() {
    const { toast } = getToastElements();
    if (!toast?.classList.contains("visible")) return;
    dismissedCenterToastKey = currentCenterToastKey || "";
    hideCenterToast();
  }

  function showCenterToast(message, duration = 1000, options = {}) {
    const { toast, text } = getToastElements();
    if (!toast || !text || !message) return;

    const key = options.key ? String(options.key) : "";
    if (key && dismissedCenterToastKey === key) return;
    currentCenterToastKey = key;

    if (centerToastTimer) {
      window.clearTimeout(centerToastTimer);
      centerToastTimer = 0;
    }

    toast.dataset.mode = options.mode || "default";
    text.innerHTML = message;
    toast.classList.remove("visible");
    toast.setAttribute("aria-hidden", "false");
    void toast.offsetWidth;
    toast.classList.add("visible");

    if (duration > 0) {
      centerToastTimer = window.setTimeout(hideCenterToast, duration);
    }
  }

  window.hideCenterToast = hideCenterToast;
  window.dismissCenterToast = dismissCenterToast;
  window.showCenterToast = showCenterToast;

  document.addEventListener("DOMContentLoaded", () => {
    getToastElements().toast?.addEventListener("click", dismissCenterToast);
  });
  window.addEventListener("load", finishInitialLoading, { once: true });
  window.setTimeout(finishInitialLoading, 3200);

  /* ── Confirm Dialog (공통 확인 팝업) ── */
  /**
   * @param {Object} options
   * @param {string} options.title - 헤더 제목
   * @param {string} options.message - 본문 메시지 (\n 줄바꿈 가능)
   * @param {string} options.icon - 헤더 아이콘 emoji
   * @param {string} options.confirmText - 확인 버튼 텍스트
   * @param {string} options.cancelText - 취소 버튼 텍스트
   * @param {string} options.tone - 'default' | 'danger'
   * @returns {Promise<boolean>} true=확인, false=취소
   */
  function showConfirm(options) {
    const dialog = document.querySelector("#fantasyConfirmDialog");
    if (!dialog) return Promise.resolve(true);

    const opts = options || {};
    const title = opts.title || "확인";
    const message = opts.message || "정말 진행하시겠습니까?";
    const icon = opts.icon || "⚠️";
    const confirmText = opts.confirmText || "확인";
    const cancelText = opts.cancelText || "취소";
    const tone = opts.tone === "danger" ? "danger" : "default";

    const headerEl = dialog.querySelector("#fantasyConfirmHeader");
    const iconEl = dialog.querySelector("#fantasyConfirmIcon");
    const msgEl = dialog.querySelector("#fantasyConfirmMessage");
    const cancelBtn = dialog.querySelector("#fantasyConfirmCancel");
    const okBtn = dialog.querySelector("#fantasyConfirmOk");

    if (headerEl) headerEl.textContent = (icon || "⚠️") + " " + title;
    if (iconEl) iconEl.textContent = icon;
    if (msgEl) msgEl.textContent = message;
    if (cancelBtn) cancelBtn.textContent = cancelText;
    if (okBtn) okBtn.textContent = confirmText;
    dialog.setAttribute("data-tone", tone);

    return new Promise((resolve) => {
      let settled = false;
      const finish = (result) => {
        if (settled) return;
        settled = true;
        cancelBtn?.removeEventListener("click", onCancel);
        okBtn?.removeEventListener("click", onOk);
        dialog.removeEventListener("cancel", onEsc);
        if (dialog.open) dialog.close();
        resolve(result);
      };
      const onCancel = () => finish(false);
      const onOk = () => finish(true);
      const onEsc = (e) => {
        e.preventDefault();
        finish(false);
      };

      cancelBtn?.addEventListener("click", onCancel);
      okBtn?.addEventListener("click", onOk);
      dialog.addEventListener("cancel", onEsc);
      if (typeof dialog.showModal === "function") {
        try { dialog.showModal(); } catch (err) { finish(true); }
      } else {
        finish(true);
      }
    });
  }

  window.showConfirm = showConfirm;
})();
