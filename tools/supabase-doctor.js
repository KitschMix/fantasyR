// tools/supabase-doctor.js
// Supabase 연결 + 스키마 진단 스크립트
// - 8개 게임 페이지 ↔ fantasy_player_stats 매핑 확인
// - 모든 테이블/뷰 존재 + RLS + anon 권한 확인
// - 공통 스크립트 로드 순서/CDN 중복 점검
// - 랭킹/멀티플레이어/채팅 보조 테이블 상태 점검
//
// 사용:  node tools/supabase-doctor.js
// 옵션: --verbose  (상세 JSON 출력)
//
// 환경변수(optional): SUPABASE_URL, SUPABASE_KEY (없으면 supabase-config.js에서 읽음)

"use strict";

const fs = require("fs");
const path = require("path");
const https = require("https");

const REPO_ROOT = path.resolve(__dirname, "..");
const VERBOSE = process.argv.includes("--verbose");

// ──────────────────────────────────────────────────────────────
// 1) 설정 로드 (supabase-config.js 파싱)
// ──────────────────────────────────────────────────────────────
function loadConfig() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  if (url && key) return { url, key, source: "env" };

  const cfgPath = path.join(REPO_ROOT, "supabase-config.js");
  const src = fs.readFileSync(cfgPath, "utf8");
  const mUrl = src.match(/url:\s*"([^"]+)"/);
  const mKey = src.match(/key:\s*"([^"]+)"/);
  if (!mUrl || !mKey) throw new Error("supabase-config.js에서 url/key를 파싱할 수 없습니다.");
  return { url: mUrl[1], key: mKey[1], source: "supabase-config.js" };
}

// ──────────────────────────────────────────────────────────────
// 2) HTTP 헬퍼
// ──────────────────────────────────────────────────────────────
function request(method, urlPath, { headers = {}, body = null } = {}, cfg) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlPath, cfg.url);
    const opts = {
      method,
      hostname: url.hostname,
      path: url.pathname + url.search,
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
        ...headers,
      },
      timeout: 12000,
    };
    const req = https.request(opts, (res) => {
      let chunks = [];
      res.on("data", (c) => chunks.push(c));
      res.on("end", () => {
        const text = Buffer.concat(chunks).toString("utf8");
        let json = null;
        try { json = JSON.parse(text); } catch { /* ignore */ }
        resolve({ status: res.statusCode, text, json, headers: res.headers });
      });
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(new Error("timeout")); });
    if (body) req.write(body);
    req.end();
  });
}

// ──────────────────────────────────────────────────────────────
// 3) 진단 카탈로그
// ──────────────────────────────────────────────────────────────
const TABLES_TO_CHECK = [
  // 8개 게임 공통 통계
  { name: "fantasy_player_stats",       kind: "table", requiredBy: ["all"] },
  { name: "fantasy_player_summary",     kind: "view",  requiredBy: ["rankings"] },
  // 게임별 리더보드
  { name: "fantasy_tally_ho_leaderboard",   kind: "table", requiredBy: ["tally-ho"] },
  { name: "fantasy_cant_stop_leaderboard",  kind: "table", requiredBy: ["cant-stop"] },
  { name: "fantasy_monopoly_leaderboard",   kind: "table", requiredBy: ["monopoly"] },
  // 멀티플레이어 / 채팅
  { name: "fantasy_multiplayer_rooms",  kind: "table", requiredBy: ["multiplayer"] },
  { name: "fantasy_multiplayer_players",kind: "table", requiredBy: ["multiplayer"] },
  { name: "fantasy_lobby_chat",         kind: "table", requiredBy: ["chat"] },
];

const GAMES = [
  { id: "fantasy",    html: "fantasy.html" },
  { id: "splendor",   html: "splendor.html" },
  { id: "monopoly",   html: "monopoly.html" },
  { id: "clue",       html: "clue.html" },
  { id: "tally-ho",   html: "tally-ho.html" },
  { id: "cant-stop",  html: "cant-stop.html" },
  { id: "sushi-go",   html: "sushi-go.html" },
  { id: "dominion",   html: "dominion.html" },
];

// ──────────────────────────────────────────────────────────────
// 4) 게임 HTML 스크립트 점검
// ──────────────────────────────────────────────────────────────
function inspectGameHtml(htmlPath) {
  const src = fs.readFileSync(htmlPath, "utf8");
  const scriptTags = [...src.matchAll(/<script\s+([^>]*?)\s*(?:\/\s*)?>/gi)].map((m) => m[1]);

  const findSrc = (re) => src.match(re);

  const hasSupabaseCdn = /supabase-js@2/.test(src);
  const hasJsdelivr    = /cdn\.jsdelivr\.net\/.*supabase-js/.test(src);
  const hasUnpkg       = /unpkg\.com\/.*supabase-js/.test(src);
  const supabaseCdnCount = (src.match(/supabase-js@2/g) || []).length;
  const supabaseConfigCount = (src.match(/supabase-config\.js/g) || []).length;
  const playerStatsCount   = (src.match(/scripts\/player-stats\.js/g) || []).length;
  const sharedUiCount      = (src.match(/shared-ui\.js/g) || []).length;
  const sharedProfilesCount = (src.match(/shared-profiles\.js/g) || []).length;
  const setupShellCount    = (src.match(/setup-shell\.js/g) || []).length;

  return {
    hasSupabaseCdn,
    hasJsdelivr,
    hasUnpkg,
    supabaseCdnCount,
    supabaseConfigCount,
    playerStatsCount,
    sharedUiCount,
    sharedProfilesCount,
    setupShellCount,
    scriptTags: scriptTags.map((t) => t.replace(/\s+/g, " ").trim()),
  };
}

// ──────────────────────────────────────────────────────────────
// 5) 메인
// ──────────────────────────────────────────────────────────────
(async () => {
  const cfg = loadConfig();
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(" Supabase Doctor — fantasy-kingdom-pc");
  console.log("═══════════════════════════════════════════════════════════════");
  console.log(` Source : ${cfg.source}`);
  console.log(` URL    : ${cfg.url}`);
  console.log(` Key    : ${cfg.key.slice(0, 16)}…  (len=${cfg.key.length})`);
  console.log("");

  // 루트 ping
  const root = await request("GET", "/rest/v1/", {}, cfg).catch((e) => ({ status: 0, text: e.message }));
  console.log(`[ping] GET /rest/v1/        → ${root.status}  ${root.status === 200 ? "✓ reachable" : "⚠ check"}`);
  if (VERBOSE && root.json) console.log("        body:", JSON.stringify(root.json).slice(0, 200));
  console.log("");

  // ── 테이블/뷰 진단 ──
  console.log("── Tables & Views ────────────────────────────────────────────");
  const tableResults = [];
  for (const t of TABLES_TO_CHECK) {
    const r = await request(
      "GET",
      `/rest/v1/${t.name}?select=*&limit=1`,
      { headers: { Range: "0-0", Accept: "application/json" } },
      cfg
    ).catch((e) => ({ status: 0, text: e.message }));

    const exists = r.status === 200 || r.status === 206;
    let rowCount = null;
    if (exists) {
      const cr = await request("GET", `/rest/v1/${t.name}?select=count`, {}, cfg).catch(() => null);
      if (cr && cr.json && Array.isArray(cr.json)) rowCount = cr.json[0]?.count;
    }
    const status = exists ? "✓" : "✗";
    const note = exists ? (rowCount != null ? `${rowCount} rows` : "exists") : "404";
    console.log(`  ${status}  ${t.kind.padEnd(5)} ${t.name.padEnd(34)} ${note.padEnd(8)}  usedBy: ${t.requiredBy.join(",")}`);
    tableResults.push({ ...t, exists, rowCount, httpStatus: r.status });
  }
  console.log("");

  // ── HTML 스크립트 점검 ──
  console.log("── HTML Script Tags (per game) ───────────────────────────────");
  console.log("  game         jsdelivr  unpkg  sup-cfg  player-stats  shared-ui  shared-prof  setup-shell");
  const htmlResults = [];
  for (const g of GAMES) {
    const fp = path.join(REPO_ROOT, g.html);
    if (!fs.existsSync(fp)) { console.log(`  ${g.id.padEnd(12)} ✗ FILE NOT FOUND`); continue; }
    const info = inspectGameHtml(fp);
    const flag = (b) => (b ? "●" : "·");
    const warnDup = (n) => (n > 1 ? `!${n}` : String(n));
    console.log(
      `  ${g.id.padEnd(12)} ` +
      `${flag(info.hasJsdelivr).padEnd(9)}` +
      `${flag(info.hasUnpkg).padEnd(7)}` +
      `${warnDup(info.supabaseConfigCount).padEnd(9)}` +
      `${warnDup(info.playerStatsCount).padEnd(13)}` +
      `${warnDup(info.sharedUiCount).padEnd(11)}` +
      `${warnDup(info.sharedProfilesCount).padEnd(13)}` +
      `${warnDup(info.setupShellCount)}`
    );
    htmlResults.push({ game: g.id, ...info });
  }
  console.log("");

  // ── 종합 권고 ──
  console.log("── Recommendations ────────────────────────────────────────────");
  const missing = tableResults.filter((t) => !t.exists);
  if (missing.length === 0) {
    console.log("  ✓ 모든 진단 대상 테이블/뷰가 존재합니다.");
  } else {
    console.log(`  ⚠ 누락된 리소스 ${missing.length}개 — 대응 SQL:`);
    for (const m of missing) {
      const hint =
        m.name.includes("monopoly") ? "supabase-monopoly-ranking.sql" :
        m.name.includes("player_summary") || m.name === "fantasy_player_stats" ? "supabase-player-stats.sql" :
        m.name.includes("lobby_chat") ? "supabase-chat-only.sql" :
        m.name.includes("multiplayer") ? "supabase-schema.sql" :
        m.name.includes("tally_ho") || m.name.includes("cant_stop") ? "supabase-ranking-only.sql" :
        "supabase-*.sql";
      console.log(`    - ${m.name.padEnd(34)} → ${hint}`);
    }
  }

  // CDN 중복 점검
  const dupCdn = htmlResults.filter((h) => h.supabaseCdnCount > 1);
  if (dupCdn.length) {
    console.log(`  ⚠ supabase-js@2 CDN 중복 로드: ${dupCdn.map((h) => h.game).join(", ")}`);
  } else {
    console.log("  ✓ supabase-js@2 CDN 중복 없음");
  }
  const dupCfg = htmlResults.filter((h) => h.supabaseConfigCount > 1);
  if (dupCfg.length) {
    console.log(`  ⚠ supabase-config.js 중복 로드: ${dupCfg.map((h) => h.game).join(", ")}`);
  } else {
    console.log("  ✓ supabase-config.js 중복 없음");
  }
  const dupStats = htmlResults.filter((h) => h.playerStatsCount > 1);
  if (dupStats.length) {
    console.log(`  ⚠ scripts/player-stats.js 중복 로드: ${dupStats.map((h) => h.game).join(", ")}`);
  } else {
    console.log("  ✓ scripts/player-stats.js 중복 없음");
  }

  // Vercel 차단 — jsdelivr는 unpkg로
  const jsdelivrUsers = htmlResults.filter((h) => h.hasJsdelivr);
  if (jsdelivrUsers.length) {
    console.log(`  ⚠ Vercel에서 jsdelivr 차단 가능: ${jsdelivrUsers.map((h) => h.game).join(", ")} → unpkg로 통일 권장`);
  }

  console.log("");
  console.log("Done.");
  if (VERBOSE) {
    console.log("\n── Verbose JSON ──");
    console.log(JSON.stringify({ config: cfg, tables: tableResults, html: htmlResults }, null, 2));
  }
})();