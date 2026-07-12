// scripts/player-stats.js
// Supabase 기반 플레이어 통계 관리 모듈
// - 게임 결과 저장
// - 닉네임별 집계 조회
// - 홈 화면 위젯 데이터 제공

(function () {
  "use strict";

  const SUPABASE_CONFIG = window.FANTASY_SUPABASE_CONFIG || null;
  const HUMAN_PROFILE_STORAGE_KEY = "fantasyKingdom.humanProfile.v1";
  const STATS_TABLE = "fantasy_player_stats";
  const SUMMARY_VIEW = "fantasy_player_summary";
  const GAME_TYPES = ["fantasy", "splendor", "monopoly", "clue", "cant-stop", "tally-ho", "sushi-go", "dominion"];

  let cachedClient = null;

  /**
   * 현재 사용자의 닉네임을 반환. 없으면 null.
   */
  function currentNickname() {
    try {
      const profile = JSON.parse(window.localStorage?.getItem(HUMAN_PROFILE_STORAGE_KEY) || "null");
      return profile?.nickname || null;
    } catch {
      return null;
    }
  }

  /**
   * Supabase 클라이언트를 lazy 초기화
   */
  async function getClient() {
    if (cachedClient) return cachedClient;
    if (!SUPABASE_CONFIG?.url || !SUPABASE_CONFIG?.key) return null;
    if (!window.supabase) return null;
    cachedClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);
    return cachedClient;
  }

  /**
   * 시간(초)을 "Xh Ym" 형식으로 포맷
   */
  function formatDuration(sec) {
    const total = Math.max(0, Math.floor(sec || 0));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    return `${h}h ${m}m`;
  }

  /**
   * 게임 결과를 Supabase에 저장
   * @param {Object} entry
   * @param {string} entry.nickname - 닉네임 (생략 시 currentNickname)
   * @param {string} entry.gameType - 'fantasy' | 'splendor' | ...
   * @param {'win'|'loss'|'draw'} entry.result
   * @param {number} [entry.score=0]
   * @param {number} [entry.durationSec=0]
   * @param {number} [entry.playerCount=2]
   * @param {Array} [entry.deckList]
   * @returns {Promise<{ok: boolean, error?: string}>}
   */
  async function recordGame(entry) {
    const nickname = entry?.nickname || currentNickname();
    if (!nickname) return { ok: false, error: "닉네임이 설정되지 않았습니다." };
    if (!GAME_TYPES.includes(entry?.gameType)) return { ok: false, error: `잘못된 gameType: ${entry?.gameType}` };
    if (!["win", "loss", "draw"].includes(entry?.result)) return { ok: false, error: `잘못된 result: ${entry?.result}` };

    const client = await getClient();
    if (!client) return { ok: false, error: "Supabase 클라이언트 초기화 실패" };

    const row = {
      nickname,
      game_type: entry.gameType,
      result: entry.result,
      score: Math.max(0, Math.floor(entry.score || 0)),
      duration_sec: Math.max(0, Math.floor(entry.durationSec || 0)),
      player_count: Math.max(2, Math.min(4, Math.floor(entry.playerCount || 2))),
      deck_list: Array.isArray(entry.deckList) ? entry.deckList : null,
    };

    try {
      const { data, error } = await client.from(STATS_TABLE).insert(row).select("id").single();
      if (error) return { ok: false, error: error.message };
      return { ok: true, id: data?.id };
    } catch (err) {
      return { ok: false, error: err?.message || String(err) };
    }
  }

  /**
   * 닉네임별 누적 통계 조회 (요약 뷰 사용)
   * @param {string} [nickname] - 생략 시 currentNickname
   * @returns {Promise<Object|null>}
   */
  async function fetchSummary(nickname) {
    const target = nickname || currentNickname();
    if (!target) return null;

    const client = await getClient();
    if (!client) return null;

    try {
      const { data, error } = await client
        .from(SUMMARY_VIEW)
        .select("*")
        .eq("nickname", target)
        .maybeSingle();
      if (error) return null;
      return data || emptySummary(target);
    } catch {
      return null;
    }
  }

  /**
   * 빈 통계 객체 (데이터 없을 때 기본값)
   */
  function emptySummary(nickname) {
    return {
      nickname,
      total_games: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      win_rate_pct: 0,
      total_score: 0,
      avg_win_score: 0,
      total_duration_sec: 0,
      week_duration_sec: 0,
      last_played_at: null,
    };
  }

  /**
   * 최근 N개 게임 히스토리 조회
   * @param {number} [limit=10]
   * @param {string} [nickname] - 생략 시 currentNickname
   * @returns {Promise<Array>}
   */
  async function fetchRecentGames(limit = 10, nickname) {
    const target = nickname || currentNickname();
    if (!target) return [];

    const client = await getClient();
    if (!client) return [];

    try {
      const { data, error } = await client
        .from(STATS_TABLE)
        .select("id, game_type, result, score, duration_sec, player_count, played_at")
        .eq("nickname", target)
        .order("played_at", { ascending: false })
        .limit(limit);
      if (error) return [];
      return data || [];
    } catch {
      return [];
    }
  }

  /**
   * 홈 화면 위젯용 데이터 한 번에 가져오기
   * @returns {Promise<{summary, recent}>}
   */
  async function fetchHubWidgetData() {
    const nickname = currentNickname();
    if (!nickname) {
      return {
        nickname: null,
        summary: null,
        recent: [],
        hasData: false,
      };
    }
    const [summary, recent] = await Promise.all([
      fetchSummary(nickname),
      fetchRecentGames(5, nickname),
    ]);
    return {
      nickname,
      summary,
      recent,
      hasData: Boolean(summary && summary.total_games > 0),
    };
  }

  /**
   * 홈 화면 위젯 DOM 업데이트
   * @param {HTMLElement} container - 위젯을 채울 컨테이너
   */
  async function renderHubWidget(container) {
    if (!container) return;
    const data = await fetchHubWidgetData();

    if (!data.nickname) {
      container.innerHTML = `
        <div class="bg-surface-container-low border border-outline-variant/30 rounded-xl p-card-padding text-center">
          <div class="text-on-surface-variant text-sm">홈 화면에서 닉네임을 설정하면 전적이 표시됩니다.</div>
        </div>
      `;
      return;
    }

    if (!data.hasData) {
      container.innerHTML = `
        <div class="bg-surface-container-low border border-outline-variant/30 rounded-xl p-card-padding text-center">
          <div class="text-on-surface-variant text-sm">아직 플레이한 게임이 없습니다.</div>
        </div>
      `;
      return;
    }

    const s = data.summary;
    const winRate = `${s.win_rate_pct}%`;
    const totalTime = formatDuration(s.total_duration_sec);
    const weekTime = formatDuration(s.week_duration_sec);

    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
        <div class="bg-surface-container-low border border-outline-variant/30 rounded-xl p-card-padding">
          <div class="flex items-center justify-between mb-3">
            <span class="material-symbols-outlined text-primary">emoji_events</span>
            <span class="text-[10px] text-on-surface-variant uppercase tracking-widest">승률</span>
          </div>
          <div class="font-headline-lg text-headline-lg text-on-surface">${winRate}</div>
          <div class="text-[11px] text-on-surface-variant mt-1">${s.wins}승 ${s.losses}패 ${s.draws}무 · 총 ${s.total_games}게임</div>
        </div>
        <div class="bg-surface-container-low border border-outline-variant/30 rounded-xl p-card-padding">
          <div class="flex items-center justify-between mb-3">
            <span class="material-symbols-outlined text-secondary">timer</span>
            <span class="text-[10px] text-on-surface-variant uppercase tracking-widest">플레이 시간</span>
          </div>
          <div class="font-headline-lg text-headline-lg text-on-surface">${totalTime}</div>
          <div class="text-[11px] text-on-surface-variant mt-1">이번 주 +${weekTime}</div>
        </div>
      </div>
    `;
  }

  // 전역 노출
  window.FANTASY_PLAYER_STATS = {
    recordGame,
    fetchSummary,
    fetchRecentGames,
    fetchHubWidgetData,
    renderHubWidget,
    formatDuration,
    GAME_TYPES,
  };
})();