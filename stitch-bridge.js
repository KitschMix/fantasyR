// filepath: stitch-bridge.js
// Stitch ↔ 우리 게임 통합 브릿지
// Stitch는 SPA (REST API 없음)이므로 iframe 임베드 + postMessage + MCP 통합

(function () {
  "use strict";

  const STITCH = window.FANTASY_STITCH_CONFIG;
  if (!STITCH) {
    console.warn("[Stitch Bridge] stitch-config.js 로드 안 됨");
    return;
  }

  /* ── MCP (Model Context Protocol) 클라이언트 ── */
  let mcpSocket = null;
  let mcpConnected = false;
  const mcpListeners = new Map();

  function connectMCP() {
    if (!STITCH.options.debug && !STITCH.apiKey) return Promise.reject("no key");
    return new Promise((resolve, reject) => {
      try {
        mcpSocket = new WebSocket(STITCH.mcpEndpoint);
      } catch (e) {
        reject(e);
        return;
      }
      const timeout = setTimeout(() => {
        if (!mcpConnected) reject("timeout");
      }, 5000);

      mcpSocket.addEventListener("open", () => {
        clearTimeout(timeout);
        mcpConnected = true;
        if (STITCH.options.debug) console.log("[Stitch MCP] 연결됨");
        // 인증
        mcpSocket.send(JSON.stringify({
          jsonrpc: "2.0", id: 1, method: "auth",
          params: { apiKey: STITCH.apiKey }
        }));
        resolve(mcpSocket);
      });

      mcpSocket.addEventListener("message", (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (STITCH.options.debug) console.log("[Stitch MCP] 메시지:", msg);
          const handler = mcpListeners.get(msg.id);
          if (handler) handler.resolve(msg.result || msg.error);
          mcpListeners.delete(msg.id);
          // 브로드캐스트 이벤트
          window.dispatchEvent(new CustomEvent("stitch:mcp", { detail: msg }));
        } catch (err) {
          console.error("[Stitch MCP] 메시지 파싱 실패:", err);
        }
      });

      mcpSocket.addEventListener("error", (e) => {
        clearTimeout(timeout);
        if (STITCH.options.debug) console.warn("[Stitch MCP] 오류:", e);
        reject(e);
      });

      mcpSocket.addEventListener("close", () => {
        mcpConnected = false;
        if (STITCH.options.debug) console.log("[Stitch MCP] 연결 종료");
      });
    });
  }

  function mcpCall(method, params) {
    return new Promise((resolve, reject) => {
      if (!mcpConnected) return reject("not connected");
      const id = Date.now() + Math.random();
      mcpListeners.set(id, { resolve, reject });
      mcpSocket.send(JSON.stringify({
        jsonrpc: "2.0", id, method, params
      }));
      setTimeout(() => {
        if (mcpListeners.has(id)) {
          mcpListeners.delete(id);
          reject("timeout");
        }
      }, 30000);
    });
  }

  /* ── iframe 임베드 ── */
  function embedStitch(container, opts = {}) {
    if (!container) return null;
    const projectId = opts.projectId || "";
    const path = projectId ? `/projects/${projectId}` : "";
    const url = `${STITCH.baseUrl}${path}`;

    // 기존 iframe 제거
    container.innerHTML = "";

    // Stitch는 인증된 사용자만 접근 가능 (403 회피)
    // 옵션 1: 새 창으로 열기 (가장 안정적)
    // 옵션 2: iframe 시도 + 폴백 메시지

    const wrapper = document.createElement("div");
    wrapper.className = "stitch-iframe-wrapper";
    wrapper.innerHTML = `
      <div class="stitch-iframe-info">
        <p>🎨 <strong>Google Stitch</strong>는 인증된 사용자만 접근 가능합니다.</p>
        <p>Stitch 페이지를 <strong>새 창</strong>에서 열어 디자인하세요.</p>
        <div class="stitch-iframe-actions">
          <button class="stitch-btn-small" data-action="open-newtab">🪟 새 창에서 열기</button>
          <button class="stitch-btn-small" data-action="try-iframe">🔄 iframe 재시도</button>
          <button class="stitch-btn-small" data-action="embed-url">📋 공유 URL 붙여넣기</button>
        </div>
      </div>
      <div class="stitch-iframe-mount" style="display:none;"></div>
    `;
    container.appendChild(wrapper);

    const info = wrapper.querySelector(".stitch-iframe-info");
    const mount = wrapper.querySelector(".stitch-iframe-mount");

    function mountIframe(targetUrl) {
      mount.innerHTML = "";
      const iframe = document.createElement("iframe");
      iframe.src = targetUrl;
      iframe.style.cssText = "width:100%;height:600px;border:0;border-radius:8px;background:#1a1a2e;";
      iframe.allow = "clipboard-read; clipboard-write; camera; microphone";
      iframe.title = "Stitch Designer";
      mount.appendChild(iframe);
      mount.style.display = "block";
      info.style.display = "none";

      const messageHandler = (e) => {
        if (!e.origin.includes("withgoogle.com")) return;
        if (STITCH.options.debug) console.log("[Stitch iframe] 메시지:", e.data);
        window.dispatchEvent(new CustomEvent("stitch:iframe", { detail: e.data }));
      };
      window.addEventListener("message", messageHandler);

      iframe.addEventListener("load", () => {
        // 403 등 오류 페이지 감지
        try {
          const body = iframe.contentDocument?.body?.innerText || "";
          if (body.includes("403") || body.includes("do not have access")) {
            mount.style.display = "none";
            info.style.display = "block";
            info.innerHTML = `<p>⚠️ Stitch 403: 인증 필요. 새 창에서 로그인 후 시도하세요.</p>`;
          }
        } catch (e) {
          // cross-origin이라 접근 불가 (정상)
        }
      });

      return iframe;
    }

    wrapper.querySelector('[data-action="open-newtab"]').addEventListener("click", () => {
      window.open(url, "_blank", "noopener,noreferrer");
    });
    wrapper.querySelector('[data-action="try-iframe"]').addEventListener("click", () => {
      mountIframe(url);
    });
    wrapper.querySelector('[data-action="embed-url"]').addEventListener("click", () => {
      const sharedUrl = prompt("Stitch 공유 URL 또는 프로젝트 ID 붙여넣기:");
      if (sharedUrl) {
        const finalUrl = sharedUrl.startsWith("http")
          ? sharedUrl
          : `${STITCH.baseUrl}/projects/${sharedUrl}`;
        mountIframe(finalUrl);
      }
    });

    // opts.autoIframe = true 면 바로 시도
    if (opts.autoIframe) mountIframe(url);

    return { wrapper, url, mountIframe: (u) => mountIframe(u || url) };
  }

  /* ── 디자인 import (Stitch → 우리 코드) ── */
  async function importDesign(designUrl, targetFile) {
    // Stitch 디자인 URL에서 HTML/CSS 추출
    // 1) 사용자가 Stitch에서 export한 .zip 파일을 받음
    // 2) 파일을 읽어서 우리 프로젝트 구조에 통합

    return new Promise((resolve, reject) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".zip,.html,.css";
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return reject("no file");

        try {
          if (file.name.endsWith(".zip")) {
            const JSZip = window.JSZip;
            if (!JSZip) {
              return reject("JSZip 미로드 (필요: <script src=\"https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js\"></script>)");
            }
            const zip = await JSZip.loadAsync(file);
            const files = {};
            for (const [path, entry] of Object.entries(zip.files)) {
              if (entry.dir) continue;
              if (path.endsWith(".html") || path.endsWith(".css") || path.endsWith(".js")) {
                files[path] = await entry.async("string");
              }
            }
            resolve(files);
          } else {
            const text = await file.text();
            resolve({ [file.name]: text });
          }
        } catch (err) {
          reject(err);
        }
      };
      input.click();
    });
  }

  /* ── 디자인 export (우리 코드 → Stitch) ── */
  async function exportToStitch(html, prompt) {
    if (!mcpConnected) {
      await connectMCP().catch(() => {});
    }
    if (mcpConnected) {
      try {
        return await mcpCall("design.create", {
          prompt: prompt || "Generate UI design based on provided HTML",
          html: html,
          apiKey: STITCH.apiKey
        });
      } catch (err) {
        console.warn("[Stitch Bridge] MCP export 실패:", err);
      }
    }
    // Fallback: Stitch URL 반환
    return {
      url: `${STITCH.baseUrl}/?import=${encodeURIComponent(btoa(html)).slice(0, 100)}`,
      method: "manual"
    };
  }

  /* ── 디자인 컨텍스트 (게임별 화면 정의) ── */
  function getDesignContext(game) {
    return STITCH.designContext[game] || null;
  }

  /* ── UI 헬퍼 ── */
  function createStitchPanel(container, opts = {}) {
    if (!container) return;
    const ctx = opts.game ? getDesignContext(opts.game) : null;

    container.innerHTML = `
      <div class="stitch-panel">
        <div class="stitch-panel-header">
          <h3>🎨 Stitch 디자인 통합</h3>
          <span class="stitch-status" id="stitchStatus">대기 중</span>
        </div>
        <div class="stitch-panel-body">
          <div class="stitch-actions">
            <button class="stitch-btn stitch-embed" data-action="embed">
              <span>🖼️</span> Stitch 열기
            </button>
            <button class="stitch-btn stitch-import" data-action="import">
              <span>📥</span> 디자인 가져오기
            </button>
            <button class="stitch-btn stitch-export" data-action="export">
              <span>📤</span> Stitch로 보내기
            </button>
            <button class="stitch-btn stitch-mcp" data-action="mcp">
              <span>🔌</span> MCP 연결
            </button>
          </div>
          ${ctx ? `
            <div class="stitch-context">
              <h4>${ctx.name} 화면 가이드</h4>
              <ul>${ctx.screens.map(s => `<li>${s}</li>`).join("")}</ul>
              <div class="stitch-palette">
                ${ctx.colorPalette.map(c => `<span class="stitch-swatch" style="background:${c}"></span>`).join("")}
              </div>
            </div>
          ` : ""}
          <div class="stitch-iframe-container" id="stitchIframeContainer"></div>
        </div>
      </div>
    `;

    // 이벤트
    container.querySelectorAll(".stitch-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const action = btn.dataset.action;
        const status = container.querySelector("#stitchStatus");
        try {
          if (action === "embed") {
            const r = embedStitch(container.querySelector("#stitchIframeContainer"));
            status.textContent = "Stitch 로드됨";
          } else if (action === "import") {
            status.textContent = "파일 선택 대기...";
            const files = await importDesign();
            status.textContent = `${Object.keys(files).length}개 파일 가져옴`;
            window.dispatchEvent(new CustomEvent("stitch:imported", { detail: files }));
          } else if (action === "export") {
            status.textContent = "전송 중...";
            const r = await exportToStitch(document.documentElement.outerHTML);
            status.textContent = r.url ? "URL 생성됨" : "전송됨";
            if (r.url) window.open(r.url, "_blank");
          } else if (action === "mcp") {
            status.textContent = "MCP 연결 중...";
            try {
              await connectMCP();
              status.textContent = mcpConnected ? "✅ MCP 연결됨" : "❌ 실패";
            } catch (e) {
              // Event 객체 또는 문자열 처리
              let msg = "연결 실패";
              if (typeof e === "string") msg = e;
              else if (e?.code === 400) msg = "MCP 400 (인증 필요)";
              else if (e?.code) msg = `MCP ${e.code}`;
              else if (e?.message) msg = e.message;
              else if (e?.type) msg = `${e.type} (third-party 차단)`;
              status.textContent = "❌ " + msg;
              status.title = "VS Code Stitch 확장 또는 새 창 워크플로우를 사용하세요";
            }
          }
        } catch (err) {
          status.textContent = "❌ " + (err.message || err);
          console.error("[Stitch]", err);
        }
      });
    });
  }

  /* ── 공개 API ── */
  window.FANTASY_STITCH = {
    embed: embedStitch,
    import: importDesign,
    export: exportToStitch,
    connectMCP,
    mcpCall,
    createPanel: createStitchPanel,
    getContext: getDesignContext,
    isMCPConnected: () => mcpConnected
  };

  if (STITCH.options.debug) {
    console.log("[Stitch Bridge] 로드됨. baseUrl:", STITCH.baseUrl);
    console.log("[Stitch Bridge] 사용법: FANTASY_STITCH.createPanel(containerEl, {game:'splendor'})");
  }
})();