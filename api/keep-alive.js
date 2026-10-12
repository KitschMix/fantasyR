// api/keep-alive.js
// Vercel Serverless Function — Supabase / Vercel 함수 warm-up
// GitHub Actions 에서 6시간마다 호출됨
// (Vercel Hobby Cron = 일 2회 한도 우회)
//
// 응답:
//   200 { ok: true, ts, source }   외부 호출 정상
//   200 { ok: true, warn, ts }     supabase 실패했지만 워밍업은 OK (재시도 부담 ↓)
//   405 method not allowed         GET/HEAD 외 거부
//   500 { ok: false, error }       환경변수 미설정 등 서버 오류

const { createClient } = require("@supabase/supabase-js");

function jsonResponse(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

module.exports = async function handler(req, res) {
  // GitHub Actions cron 은 GET 또는 HEAD 만 보냄
  if (req.method !== "GET" && req.method !== "HEAD") {
    return jsonResponse(res, 405, { ok: false, error: "method_not_allowed" });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;

  if (!url || !key) {
    return jsonResponse(res, 500, {
      ok: false,
      error: "missing_env",
      need: ["SUPABASE_URL", "SUPABASE_KEY"],
    });
  }

  // HEAD 는 body 없이 200 만
  if (req.method === "HEAD") {
    return jsonResponse(res, 200, { ok: true });
  }

  const ts = new Date().toISOString();
  try {
    const supabase = createClient(url, key, {
      auth: { persistSession: false },
    });
    // 가장 가벼운 read 1회 — 캐시 워밍업 + 프로젝트 active 신호
    const { error } = await supabase
      .from("fantasy_player_summary")
      .select("nickname", { count: "exact", head: true })
      .limit(1);
    if (error) {
      // supabase 가 unreachable 이거나 RLS 막힘 — 그래도 워밍업 자체는 200
      return jsonResponse(res, 200, {
        ok: true,
        warn: "supabase_query_failed",
        message: error.message,
        ts,
      });
    }
    return jsonResponse(res, 200, { ok: true, source: "fantasy_player_summary", ts });
  } catch (e) {
    return jsonResponse(res, 200, {
      ok: true,
      warn: "supabase_unreachable",
      message: String(e && e.message || e),
      ts,
    });
  }
};
