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
})();
