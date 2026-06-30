(function () {
  "use strict";

  const COLUMNS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const COLUMN_HEIGHTS = {
    2: 3,
    3: 5,
    4: 7,
    5: 9,
    6: 11,
    7: 13,
    8: 11,
    9: 9,
    10: 7,
    11: 5,
    12: 3
  };
  const ACTORS = {
    human: { label: "나", opponent: "ai" },
    ai: { label: "AI", opponent: "human" }
  };
  const AI_THINK_DELAY_MS = 520;
  const AI_STEP_DELAY_MS = 620;
  const SUPABASE_CONFIG = window.FANTASY_SUPABASE_CONFIG || {};
  const SHARED_PROFILES = window.FANTASY_SHARED_PROFILES || {};
  const SHARED_NICKNAME_RULES = window.FANTASY_SHARED_NICKNAME_RULES || {};
  const PROFILE_ASSET_ROOT = SHARED_PROFILES.root || "assets/profiles/user";
  const HUMAN_PROFILE_STORAGE_KEY = SHARED_NICKNAME_RULES.storageKey || "fantasyKingdom.humanProfile.v1";
  const NICKNAME_CHANGE_INTERVAL_MS = SHARED_NICKNAME_RULES.intervalMs || (24 * 60 * 60 * 1000);
  const MIN_NICKNAME_LENGTH = SHARED_NICKNAME_RULES.minLength || 2;
  const CANT_LEADERBOARD_TABLE = "fantasy_cant_stop_leaderboard";
  const CANT_LEADERBOARD_LIMIT = 10;
  const AI_DIFFICULTY_LABELS = SHARED_PROFILES.difficultyLabels || {
    normal: "보통",
    hard: "어려움",
    expert: "매우어려움",
    random: "완전랜덤",
    boss: "최종보스"
  };
  const AI_PROFILE_DIFFICULTY_KEYS = SHARED_PROFILES.difficultyKeys || ["normal", "hard", "expert"];
  const HUMAN_PROFILE = SHARED_PROFILES.human || {
    name: "나",
    avatarUrl: profileImageUrl("유저.jpg")
  };
  const AI_PROFILE_GROUPS = SHARED_PROFILES.groups || {
    normal: [
      { name: "건일", avatarUrl: profileImageUrl("보통-건일.jpg") },
      { name: "루나", avatarUrl: profileImageUrl("보통-루나.jpg") },
      { name: "이지", avatarUrl: profileImageUrl("보통-이지.jpg") },
      { name: "케이", avatarUrl: profileImageUrl("보통-케이.jpg") }
    ],
    hard: [
      { name: "레이븐", avatarUrl: profileImageUrl("어려움-레이븐.jpg") },
      { name: "메이", avatarUrl: profileImageUrl("어려움-메이.jpg") },
      { name: "미미", avatarUrl: profileImageUrl("어려움-미미.jpg") },
      { name: "미카", avatarUrl: profileImageUrl("어려움-미카.jpg") },
      { name: "채호", avatarUrl: profileImageUrl("어려움-채호.jpg") },
      { name: "하준", avatarUrl: profileImageUrl("어려움-하준.jpg") }
    ],
    expert: [
      { name: "강범례", avatarUrl: profileImageUrl("매우어려움-강범례.jpg") },
      { name: "변판길", avatarUrl: profileImageUrl("매우어려움-변판길.jpg") },
      { name: "변판득", avatarUrl: profileImageUrl("매우어려움-변판득.jpg") },
      { name: "서진숙", avatarUrl: profileImageUrl("매우어려움-서진숙.jpg") },
      { name: "유리", avatarUrl: profileImageUrl("매우어려움-유리.jpg") },
      { name: "제갈혜정", avatarUrl: profileImageUrl("매우어려움-제갈혜정.jpg") },
      { name: "채춘미", avatarUrl: profileImageUrl("매우어려움-채춘미.jpg") }
    ]
  };

  const els = {
    enterButton: document.querySelector("#enterCantStopButton"),
    panel: document.querySelector("#cantStopPanel"),
    setupView: document.querySelector("#cantSetupView"),
    gameView: document.querySelector("#cantGameView"),
    backButton: document.querySelector("#cantBackButton"),
    newGameButton: document.querySelector("#cantNewGameButton"),
    rulesButton: document.querySelector("#cantRulesButton"),
    rulesDialog: document.querySelector("#cantRulesDialog"),
    startButton: document.querySelector("#cantStartButton"),
    difficultySelect: document.querySelector("#cantDifficultySelect"),
    nameInput: document.querySelector("#cantNameInput"),
    onlineNameInput: document.querySelector("#cantOnlineNameInput"),
    confirmNicknameButton: document.querySelector("#cantConfirmNicknameButton"),
    nicknameStatus: document.querySelector("#cantNicknameStatus"),
    humanAvatar: document.querySelector("#cantHumanAvatar"),
    humanPreviewName: document.querySelector("#cantHumanPreviewName"),
    leaderboardList: document.querySelector("#cantLeaderboardList"),
    leaderboardStatus: document.querySelector("#cantLeaderboardStatus"),
    refreshLeaderboardButton: document.querySelector("#cantRefreshLeaderboardButton"),
    humanCard: document.querySelector("#cantHumanCard"),
    aiCard: document.querySelector("#cantAiCard"),
    gameHumanAvatar: document.querySelector("#cantGameHumanAvatar"),
    aiAvatar: document.querySelector("#cantAiAvatar"),
    humanNameLabel: document.querySelector("#cantHumanNameLabel"),
    aiNameLabel: document.querySelector("#cantAiNameLabel"),
    aiDifficultyLabel: document.querySelector("#cantAiDifficultyLabel"),
    humanScore: document.querySelector("#cantHumanScore"),
    aiScore: document.querySelector("#cantAiScore"),
    humanProgressSummary: document.querySelector("#cantHumanProgressSummary"),
    aiProgressSummary: document.querySelector("#cantAiProgressSummary"),
    turnLabel: document.querySelector("#cantTurnLabel"),
    phaseLabel: document.querySelector("#cantPhaseLabel"),
    board: document.querySelector("#cantBoard"),
    dice: document.querySelector("#cantDice"),
    options: document.querySelector("#cantOptions"),
    rollButton: document.querySelector("#cantRollButton"),
    stopButton: document.querySelector("#cantStopButton"),
    log: document.querySelector("#cantLog")
  };

  const state = {
    view: "setup",
    started: false,
    finished: false,
    currentActor: "human",
    phase: "idle",
    humanName: "",
    difficultyMode: "normal",
    aiDifficulty: "normal",
    aiProfile: null,
    progress: { human: {}, ai: {} },
    claimed: {},
    tempProgress: {},
    dice: [],
    options: [],
    turnNumber: 1,
    log: [],
    aiTimer: 0,
    leaderboardSubmitted: false
  };
  let cantSupabaseClient = null;
  const nicknameForceChangeState = {
    clicks: 0,
    lastClickAt: 0
  };

  function profileImageUrl(fileName) {
    return encodeURI(`${PROFILE_ASSET_ROOT}/${fileName}`);
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  function aiDifficultyLabel(difficulty) {
    return AI_DIFFICULTY_LABELS[difficulty] || AI_DIFFICULTY_LABELS.normal;
  }

  function isBossProfile(profile) {
    return profile?.name === "강범례";
  }

  function prepareAiProfile(profile, difficulty, labelOverride = null) {
    const boss = isBossProfile(profile);
    return {
      ...profile,
      boss,
      difficulty: boss ? "boss" : difficulty,
      difficultyLabel: boss ? AI_DIFFICULTY_LABELS.boss : (labelOverride || aiDifficultyLabel(difficulty))
    };
  }

  function randomAiDifficultyKey() {
    return AI_PROFILE_DIFFICULTY_KEYS[Math.floor(Math.random() * AI_PROFILE_DIFFICULTY_KEYS.length)] || "normal";
  }

  function selectCantAiProfile(difficulty) {
    const pool = difficulty === "random"
      ? AI_PROFILE_DIFFICULTY_KEYS.flatMap((key) => AI_PROFILE_GROUPS[key] || []).map((profile) => (
        prepareAiProfile(profile, randomAiDifficultyKey(), "랜덤")
      ))
      : (AI_PROFILE_GROUPS[difficulty] || AI_PROFILE_GROUPS.normal || []).map((profile) => (
        prepareAiProfile(profile, AI_PROFILE_GROUPS[difficulty] ? difficulty : "normal")
      ));
    return shuffle(pool)[0] || prepareAiProfile({ name: "AI", avatarUrl: profileImageUrl("보통-건일.jpg") }, "normal");
  }

  function aiProfileDisplayName(profile = state.aiProfile) {
    if (!profile) return "AI";
    if (profile.boss) return "강범례(최종보스)";
    return `${profile.name} (${profile.difficultyLabel || aiDifficultyLabel(profile.difficulty)})`;
  }

  function actorLabel(actor = state.currentActor) {
    if (actor === "human") return state.humanName || currentHumanNickname() || ACTORS.human.label;
    if (actor === "ai") return aiProfileDisplayName(state.aiProfile);
    return ACTORS[actor]?.label || actor;
  }

  function opponentActor(actor = state.currentActor) {
    return ACTORS[actor].opponent;
  }

  function normalizeHumanNickname(value) {
    return String(value || "")
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, 12);
  }

  function nicknameValidationMessage(nickname) {
    const normalized = normalizeHumanNickname(nickname);
    if (normalized.length < MIN_NICKNAME_LENGTH) {
      return `닉네임은 ${MIN_NICKNAME_LENGTH}글자 이상이어야 합니다.`;
    }
    if (normalized === HUMAN_PROFILE.name) {
      return "'나'는 닉네임으로 사용할 수 없습니다.";
    }
    return "";
  }

  function readHumanProfile() {
    try {
      const profile = JSON.parse(window.localStorage?.getItem(HUMAN_PROFILE_STORAGE_KEY) || "null");
      if (profile?.nickname) {
        const nickname = normalizeHumanNickname(profile.nickname);
        if (nicknameValidationMessage(nickname)) {
          return { nickname: "", lastChangedAt: "" };
        }
        return {
          nickname,
          lastChangedAt: profile.lastChangedAt || ""
        };
      }
    } catch {
      // Ignore broken local profile data.
    }
    return { nickname: "", lastChangedAt: "" };
  }

  function saveHumanProfile(profile) {
    window.localStorage?.setItem(HUMAN_PROFILE_STORAGE_KEY, JSON.stringify({
      nickname: normalizeHumanNickname(profile.nickname),
      lastChangedAt: profile.lastChangedAt || ""
    }));
  }

  function currentHumanNickname() {
    return readHumanProfile().nickname;
  }

  function nicknameChangeRemainingText(lastChangedAt) {
    const changedAt = Date.parse(lastChangedAt || "");
    if (!changedAt) return "";
    const remainingMs = Math.max(0, NICKNAME_CHANGE_INTERVAL_MS - (Date.now() - changedAt));
    const hours = Math.floor(remainingMs / (60 * 60 * 1000));
    const minutes = Math.ceil((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
    if (hours <= 0) return `${Math.max(1, minutes)}분 후 변경 가능`;
    return `${hours}시간 ${minutes}분 후 변경 가능`;
  }

  function setCantNicknameStatus(message, error = false) {
    if (!els.nicknameStatus) return;
    els.nicknameStatus.textContent = message;
    els.nicknameStatus.classList.toggle("error", error);
  }

  function syncCantNicknameInputs(force = false) {
    const nickname = currentHumanNickname();
    if (els.nameInput && (force || document.activeElement !== els.nameInput)) {
      els.nameInput.value = nickname;
    }
    if (els.onlineNameInput) {
      els.onlineNameInput.value = nickname;
    }
    const fantasyNameInput = document.querySelector("#humanNameInput");
    const fantasyOnlineInput = document.querySelector("#onlineNameInput");
    const tallyNameInput = document.querySelector("#tallyNameInput");
    const tallyOnlineInput = document.querySelector("#tallyOnlineNameInput");
    if (fantasyNameInput && force) fantasyNameInput.value = nickname;
    if (fantasyOnlineInput && force) fantasyOnlineInput.value = nickname;
    if (tallyNameInput && force) tallyNameInput.value = nickname;
    if (tallyOnlineInput && force) tallyOnlineInput.value = nickname;
  }

  function confirmCantNicknameChange(sourceInput = els.nameInput, options = {}) {
    const force = Boolean(options.force);
    const profile = readHumanProfile();
    const desired = normalizeHumanNickname(sourceInput?.value ?? profile.nickname);
    const validationMessage = nicknameValidationMessage(desired);
    if (validationMessage) {
      window.alert(validationMessage);
      setCantNicknameStatus(validationMessage, true);
      sourceInput?.focus();
      return false;
    }

    if (desired === profile.nickname) {
      syncCantNicknameInputs(true);
      setCantNicknameStatus(`현재 닉네임: ${profile.nickname}`);
      renderCantSetup();
      return true;
    }

    const changedAt = Date.parse(profile.lastChangedAt || "");
    if (!force && changedAt && Date.now() - changedAt < NICKNAME_CHANGE_INTERVAL_MS) {
      const remaining = nicknameChangeRemainingText(profile.lastChangedAt);
      window.alert(`닉네임은 모든 게임을 통틀어 하루에 한 번만 변경할 수 있습니다.\n${remaining}`);
      syncCantNicknameInputs(true);
      setCantNicknameStatus(`닉네임 변경 제한 중 (${remaining})`, true);
      renderCantSetup();
      return false;
    }

    const confirmed = window.confirm(force
      ? `숨겨진 변경키로 '${desired}' 닉네임을 강제 저장할까요?`
      : "닉네임은 모든 게임을 통틀어 하루에 한 번만 변경할 수 있습니다.\n"
        + `확인하면 오늘은 '${desired}' 닉네임으로 고정됩니다.\n`
        + "저장할까요?");
    if (!confirmed) {
      syncCantNicknameInputs(true);
      setCantNicknameStatus(profile.nickname ? `현재 닉네임: ${profile.nickname}` : "닉네임을 설정해야 시작할 수 있습니다.", !profile.nickname);
      renderCantSetup();
      return false;
    }

    saveHumanProfile({ nickname: desired, lastChangedAt: new Date().toISOString() });
    syncCantNicknameInputs(true);
    setCantNicknameStatus(`${force ? "닉네임 강제 변경 완료" : "닉네임 저장 완료"}: ${desired}`);
    renderCantSetup();
    return true;
  }

  function consumeNicknameForceChangeClick(event) {
    if (!event?.shiftKey) {
      nicknameForceChangeState.clicks = 0;
      nicknameForceChangeState.lastClickAt = 0;
      return false;
    }

    const now = Date.now();
    if (now - nicknameForceChangeState.lastClickAt > 5000) {
      nicknameForceChangeState.clicks = 0;
    }
    nicknameForceChangeState.lastClickAt = now;
    nicknameForceChangeState.clicks += 1;

    if (nicknameForceChangeState.clicks < 5) {
      setCantNicknameStatus(`숨겨진 변경키 ${nicknameForceChangeState.clicks}/5`);
      return null;
    }

    nicknameForceChangeState.clicks = 0;
    nicknameForceChangeState.lastClickAt = 0;
    setCantNicknameStatus("숨겨진 변경키 활성화");
    return true;
  }

  function getSupabaseClient() {
    if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.key || !window.supabase?.createClient) return null;
    if (cantSupabaseClient) return cantSupabaseClient;
    cantSupabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key, {
      auth: { persistSession: false }
    });
    return cantSupabaseClient;
  }

  function setCantLeaderboardStatus(message, error = false) {
    if (!els.leaderboardStatus) return;
    els.leaderboardStatus.textContent = message;
    els.leaderboardStatus.classList.toggle("error", error);
  }

  function formatLeaderboardDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" });
  }

  function renderCantLeaderboardList(entries) {
    if (!els.leaderboardList) return;
    els.leaderboardList.innerHTML = "";
    if (!entries?.length) {
      const item = document.createElement("li");
      item.className = "leaderboard-empty";
      item.textContent = "아직 기록 없음";
      els.leaderboardList.append(item);
      return;
    }

    const fragment = document.createDocumentFragment();
    entries.forEach((entry, index) => {
      const item = document.createElement("li");
      item.className = "leaderboard-entry";
      const meta = [
        entry.ai_difficulty ? aiDifficultyLabel(entry.ai_difficulty) : "",
        entry.opponent_name || "",
        entry.won ? "승리" : "도전",
        entry.turns ? `${entry.turns}턴` : "",
        entry.updated_at ? formatLeaderboardDate(entry.updated_at) : ""
      ].filter(Boolean).join(" · ");
      item.innerHTML = `
        <span class="leaderboard-rank">${index + 1}</span>
        <strong>${escapeHtml(entry.nickname || "익명")}</strong>
        <b>${Number(entry.score || 0)}점</b>
        <small class="leaderboard-meta">${escapeHtml(meta)}</small>
      `;
      fragment.append(item);
    });
    els.leaderboardList.append(fragment);
  }

  async function loadCantLeaderboard() {
    if (!els.leaderboardList) return;
    const client = getSupabaseClient();
    if (!client) {
      setCantLeaderboardStatus("Supabase 설정이 필요합니다.", true);
      return;
    }

    setCantLeaderboardStatus("캔트스탑 랭킹을 불러오는 중입니다.");
    const { data, error } = await client
      .from(CANT_LEADERBOARD_TABLE)
      .select("nickname,score,columns_claimed,turns,ai_difficulty,opponent_name,won,updated_at")
      .eq("won", true)
      .order("score", { ascending: false })
      .order("updated_at", { ascending: true })
      .limit(CANT_LEADERBOARD_LIMIT);

    if (error) {
      renderCantLeaderboardList([]);
      setCantLeaderboardStatus("캔트스탑 랭킹 설정이 필요합니다. 최신 supabase-schema.sql을 실행해주세요.", true);
      return;
    }

    renderCantLeaderboardList(data || []);
    setCantLeaderboardStatus("싱글플레이 최고 등반점수만 자동 기록됩니다.");
  }

  function cantLeaderboardSubmitErrorMessage(error) {
    const message = [error?.message, error?.details, error?.hint].filter(Boolean).join(" ");
    if (error?.code === "PGRST202" || message.includes("Could not find the function")) {
      return "캔트스탑 랭킹 등록 실패: 최신 supabase-schema.sql을 실행해주세요.";
    }
    if (error?.code === "22023" || message.includes("invalid nickname")) {
      return "캔트스탑 랭킹 등록 실패: 닉네임은 2글자 이상이어야 하며 '나'는 사용할 수 없습니다.";
    }
    return `캔트스탑 랭킹 등록 실패: ${message || "Supabase 설정을 확인해주세요."}`;
  }

  function progressSum(actor) {
    return COLUMNS.reduce((sum, column) => sum + permanentProgress(actor, column), 0);
  }

  function rankingScore(actor, won) {
    return completedColumns(actor).length * 100 + progressSum(actor) + (won ? 50 : 0);
  }

  async function submitCantLeaderboardScore(winnerActor) {
    if (state.leaderboardSubmitted) return;
    state.leaderboardSubmitted = true;
    const client = getSupabaseClient();
    if (!client) {
      setCantLeaderboardStatus("캔트스탑 랭킹 등록 실패: Supabase 설정 필요", true);
      return;
    }

    const won = winnerActor === "human";
    if (!won) {
      setCantLeaderboardStatus("캔트스탑 랭킹은 승리했을 때만 등록됩니다.");
      return;
    }

    const score = rankingScore("human", won);
    const nickname = normalizeHumanNickname(state.humanName || currentHumanNickname());
    setCantLeaderboardStatus(`캔트스탑 랭킹에 ${score}점을 등록하는 중입니다.`);
    const { data, error } = await client.rpc("fantasy_submit_cant_stop_score", {
      p_nickname: nickname,
      p_score: score,
      p_columns_claimed: completedColumns("human").length,
      p_turns: state.turnNumber,
      p_ai_difficulty: state.difficultyMode || state.aiDifficulty || "normal",
      p_opponent_name: state.aiProfile?.name || "AI",
      p_won: won
    });

    if (error) {
      setCantLeaderboardStatus(cantLeaderboardSubmitErrorMessage(error), true);
      return;
    }

    const result = Array.isArray(data) ? data[0] : data;
    const scoreText = result?.score_updated ? "최고 점수 갱신!" : "기존 최고 점수를 유지했습니다.";
    const nicknameText = result?.nickname_updated === false ? " 서버 기준 닉네임 변경 제한으로 기존 이름을 유지했습니다." : "";
    setCantLeaderboardStatus(`캔트스탑 랭킹: ${scoreText}${nicknameText}`);
    loadCantLeaderboard();
  }

  function currentDifficultyMode() {
    return els.difficultySelect?.value || state.difficultyMode || "normal";
  }

  function renderCantSetup() {
    syncCantNicknameInputs();
    const nickname = currentHumanNickname();
    if (els.humanAvatar) els.humanAvatar.src = HUMAN_PROFILE.avatarUrl;
    if (els.humanPreviewName) els.humanPreviewName.textContent = nickname || "닉네임 필요";
    if (!nickname) {
      setCantNicknameStatus("닉네임을 2글자 이상으로 설정해야 시작할 수 있습니다.", true);
    } else if (!els.nicknameStatus?.classList.contains("error")) {
      setCantNicknameStatus(`현재 닉네임: ${nickname}`);
    }
  }

  function showCantSetup() {
    clearAiTimer();
    state.view = "setup";
    els.panel?.classList.add("setup-mode");
    els.setupView?.classList.remove("hidden");
    els.gameView?.classList.add("hidden");
    renderCantSetup();
    loadCantLeaderboard();
  }

  function showCantGame() {
    state.view = "game";
    els.panel?.classList.remove("setup-mode");
    els.setupView?.classList.add("hidden");
    els.gameView?.classList.remove("hidden");
  }

  function enterCantStop() {
    document.body.classList.remove("launcher-active", "clue-active", "tally-active");
    document.body.classList.add("cant-active");
    els.panel?.classList.remove("hidden");
    showCantSetup();
  }

  function leaveCantStop() {
    clearAiTimer();
    document.body.classList.add("launcher-active");
    document.body.classList.remove("cant-active");
    els.panel?.classList.add("hidden");
  }

  function startCantGame() {
    const desired = normalizeHumanNickname(els.nameInput?.value || "");
    if ((!currentHumanNickname() || (desired && desired !== currentHumanNickname())) && !confirmCantNicknameChange(els.nameInput)) return;
    state.humanName = currentHumanNickname();
    if (!state.humanName) {
      renderCantSetup();
      return;
    }
    state.difficultyMode = currentDifficultyMode();
    state.aiProfile = { ...selectCantAiProfile(state.difficultyMode) };
    state.aiDifficulty = state.aiProfile.difficulty || "normal";
    resetCantGame();
  }

  function resetCantGame() {
    clearAiTimer();
    showCantGame();
    if (!state.humanName) state.humanName = currentHumanNickname() || HUMAN_PROFILE.name;
    if (!state.aiProfile) state.aiProfile = { ...selectCantAiProfile(state.difficultyMode || currentDifficultyMode()) };
    state.aiDifficulty = state.aiProfile.difficulty || "normal";
    state.started = true;
    state.finished = false;
    state.currentActor = "human";
    state.phase = "idle";
    state.progress = { human: {}, ai: {} };
    state.claimed = {};
    state.tempProgress = {};
    state.dice = [];
    state.options = [];
    state.turnNumber = 1;
    state.leaderboardSubmitted = false;
    state.log = ["게임 시작. 주사위를 굴리고, 올라갈지 멈출지 선택하세요."];
    renderCant();
  }

  function clearAiTimer() {
    if (state.aiTimer) {
      window.clearTimeout(state.aiTimer);
      state.aiTimer = 0;
    }
  }

  function log(message) {
    state.log.unshift(message);
    state.log = state.log.slice(0, 14);
  }

  function toast(message, duration = 1400) {
    if (typeof window.showCenterToast === "function") {
      window.showCenterToast(message, duration, { mode: "cant" });
    }
  }

  function rollDie() {
    return Math.floor(Math.random() * 6) + 1;
  }

  function rollDice() {
    return [rollDie(), rollDie(), rollDie(), rollDie()];
  }

  function permanentProgress(actor, column) {
    return Math.min(state.progress[actor]?.[column] || 0, COLUMN_HEIGHTS[column]);
  }

  function visibleProgress(actor, column) {
    if (actor === state.currentActor && Object.prototype.hasOwnProperty.call(state.tempProgress, column)) {
      return state.tempProgress[column];
    }
    return permanentProgress(actor, column);
  }

  function completedColumns(actor) {
    return COLUMNS.filter((column) => state.claimed[column] === actor);
  }

  function activeTempColumns() {
    return Object.keys(state.tempProgress).map(Number);
  }

  function isColumnAvailable(column) {
    return COLUMNS.includes(column) && !state.claimed[column];
  }

  function canAdvanceColumn(column, tempProgress = state.tempProgress) {
    if (!isColumnAvailable(column)) return false;
    const current = tempProgress[column] ?? permanentProgress(state.currentActor, column);
    if (current >= COLUMN_HEIGHTS[column]) return false;
    const active = Object.keys(tempProgress).map(Number);
    return active.includes(column) || active.length < 3;
  }

  function optionSteps(sums) {
    const temp = { ...state.tempProgress };
    const steps = [];
    sums.forEach((sum) => {
      if (!canAdvanceColumn(sum, temp)) return;
      const current = temp[sum] ?? permanentProgress(state.currentActor, sum);
      temp[sum] = Math.min(COLUMN_HEIGHTS[sum], current + 1);
      steps.push(sum);
    });
    return steps;
  }

  function buildRollOptions(dice) {
    const raw = [
      [dice[0] + dice[1], dice[2] + dice[3]],
      [dice[0] + dice[2], dice[1] + dice[3]],
      [dice[0] + dice[3], dice[1] + dice[2]]
    ];
    const seen = new Set();
    return raw.map((sums) => {
      const sortedKey = [...sums].sort((a, b) => a - b).join("-");
      const steps = optionSteps(sums);
      return { sums, steps, key: sortedKey };
    }).filter((option) => {
      if (seen.has(option.key) || option.steps.length === 0) return false;
      seen.add(option.key);
      return true;
    });
  }

  function rollForCurrentActor() {
    if (state.finished || state.phase === "choice") return;
    state.dice = rollDice();
    state.options = buildRollOptions(state.dice);
    if (!state.options.length) {
      bustCurrentTurn();
      return;
    }
    state.phase = "choice";
    log(`${actorLabel()}: ${state.dice.join(", ")} 굴림`);
    renderCant();
    if (state.currentActor === "ai") scheduleAiChoice();
  }

  function applyOption(option) {
    if (!option || state.finished || state.phase !== "choice") return;
    option.steps.forEach((column) => {
      const current = state.tempProgress[column] ?? permanentProgress(state.currentActor, column);
      state.tempProgress[column] = Math.min(COLUMN_HEIGHTS[column], current + 1);
    });
    const climbed = option.steps.join(", ");
    log(`${actorLabel()}: ${climbed}번 기둥 등반`);
    state.phase = "decision";
    state.options = [];
    renderCant();
    if (state.currentActor === "ai") scheduleAiDecision();
  }

  function bustCurrentTurn() {
    const lost = activeTempColumns();
    state.tempProgress = {};
    state.options = [];
    state.phase = "idle";
    log(`${actorLabel()}: 실패!${lost.length ? ` 이번 턴 등반(${lost.join(", ")})이 사라졌습니다.` : ""}`);
    toast(`${actorLabel()} 실패`, 1400);
    endTurn();
  }

  function stopCurrentTurn() {
    if (state.finished || activeTempColumns().length === 0) return;
    const actor = state.currentActor;
    activeTempColumns().forEach((column) => {
      const value = Math.min(state.tempProgress[column], COLUMN_HEIGHTS[column]);
      state.progress[actor][column] = value;
      if (value >= COLUMN_HEIGHTS[column]) {
        state.claimed[column] = actor;
      }
    });
    const completed = completedColumns(actor);
    log(`${actorLabel(actor)}: 멈춤. 현재 완주 ${completed.length}개`);
    state.tempProgress = {};
    state.options = [];
    state.phase = "idle";
    if (completed.length >= 3) {
      finishCantGame(actor);
      return;
    }
    endTurn();
  }

  function endTurn() {
    if (state.finished) return;
    state.currentActor = opponentActor();
    state.turnNumber += 1;
    state.dice = [];
    state.options = [];
    state.phase = "idle";
    renderCant();
    if (state.currentActor === "ai") scheduleAiRoll();
  }

  function finishCantGame(winnerActor) {
    clearAiTimer();
    state.finished = true;
    state.phase = "finished";
    const winner = actorLabel(winnerActor);
    log(`${winner} 승리. 기둥 3개 완주!`);
    toast(`${winner} 승리`, 1800);
    renderCant();
    submitCantLeaderboardScore(winnerActor);
  }

  function chooseTopOption(options, spread = 1) {
    const ranked = [...options].map((option) => {
      const score = option.steps.reduce((sum, column) => {
        const current = state.tempProgress[column] ?? permanentProgress(state.currentActor, column);
        const willComplete = current + 1 >= COLUMN_HEIGHTS[column];
        return sum + columnWeight(column) + (willComplete ? 34 : 0);
      }, 0);
      return { option, score };
    }).sort((left, right) => right.score - left.score);
    const top = ranked.slice(0, Math.max(1, spread));
    return top[Math.floor(Math.random() * top.length)]?.option || options[0];
  }

  function columnWeight(column) {
    return 15 - Math.abs(7 - column);
  }

  function aiDifficultyKey() {
    const difficulty = state.aiDifficulty || state.aiProfile?.difficulty || "normal";
    return AI_DIFFICULTY_LABELS[difficulty] ? difficulty : "normal";
  }

  function chooseAiOption() {
    const difficulty = aiDifficultyKey();
    if (difficulty === "normal" && Math.random() < 0.28) {
      return state.options[Math.floor(Math.random() * state.options.length)];
    }
    return chooseTopOption(state.options, difficulty === "hard" ? 2 : difficulty === "normal" ? 3 : 1);
  }

  function shouldAiStop() {
    const difficulty = aiDifficultyKey();
    const tempColumns = activeTempColumns();
    const tempCompleted = tempColumns.filter((column) => state.tempProgress[column] >= COLUMN_HEIGHTS[column]).length;
    const totalCompleted = completedColumns("ai").length + tempCompleted;
    const gained = tempColumns.reduce((sum, column) => (
      sum + Math.max(0, (state.tempProgress[column] || 0) - permanentProgress("ai", column))
    ), 0);

    if (totalCompleted >= 3) return true;
    if (tempCompleted > 0) {
      const stopChance = difficulty === "expert" || difficulty === "boss" ? 0.68 : difficulty === "hard" ? 0.78 : 0.92;
      return Math.random() < stopChance;
    }
    if (difficulty === "normal") return gained >= 3 || (tempColumns.length >= 2 && Math.random() < 0.58);
    if (difficulty === "hard") return gained >= 5 || (tempColumns.length >= 3 && Math.random() < 0.45);
    return gained >= 7 || (tempColumns.length >= 3 && Math.random() < 0.26);
  }

  function scheduleAiRoll() {
    clearAiTimer();
    if (state.currentActor !== "ai" || state.finished) return;
    state.aiTimer = window.setTimeout(() => {
      state.aiTimer = 0;
      rollForCurrentActor();
    }, AI_THINK_DELAY_MS);
  }

  function scheduleAiChoice() {
    clearAiTimer();
    state.aiTimer = window.setTimeout(() => {
      state.aiTimer = 0;
      if (state.currentActor !== "ai" || state.finished || state.phase !== "choice") return;
      applyOption(chooseAiOption());
    }, AI_STEP_DELAY_MS);
  }

  function scheduleAiDecision() {
    clearAiTimer();
    state.aiTimer = window.setTimeout(() => {
      state.aiTimer = 0;
      if (state.currentActor !== "ai" || state.finished || state.phase !== "decision") return;
      if (shouldAiStop()) {
        stopCurrentTurn();
      } else {
        rollForCurrentActor();
      }
    }, AI_STEP_DELAY_MS);
  }

  function openCantRules() {
    if (typeof els.rulesDialog?.showModal === "function" && !els.rulesDialog.open) {
      els.rulesDialog.showModal();
    }
  }

  function renderBoard() {
    if (!els.board) return;
    els.board.innerHTML = "";
    COLUMNS.forEach((column) => {
      const columnEl = document.createElement("section");
      columnEl.className = "cant-column";
      if (state.claimed[column] === "human") columnEl.classList.add("claimed-human");
      if (state.claimed[column] === "ai") columnEl.classList.add("claimed-ai");
      const track = Array.from({ length: COLUMN_HEIGHTS[column] }, (_, index) => {
        const step = index + 1;
        const humanHere = visibleProgress("human", column) === step;
        const aiHere = visibleProgress("ai", column) === step;
        const runnerHere = state.currentActor === "human"
          ? Object.prototype.hasOwnProperty.call(state.tempProgress, column) && state.tempProgress[column] === step
          : state.currentActor === "ai"
            && Object.prototype.hasOwnProperty.call(state.tempProgress, column)
            && state.tempProgress[column] === step;
        return `<span class="cant-step${humanHere ? " human" : ""}${aiHere ? " ai" : ""}${runnerHere ? " runner" : ""}"></span>`;
      }).join("");
      const claimedText = state.claimed[column] ? `${actorLabel(state.claimed[column])} 완주` : `${COLUMN_HEIGHTS[column]}칸`;
      columnEl.innerHTML = `
        <div class="cant-column-number">${column}</div>
        <div class="cant-track">${track}</div>
        <div class="cant-column-meta">${escapeHtml(claimedText)}</div>
      `;
      els.board.append(columnEl);
    });
  }

  function renderDice() {
    if (!els.dice) return;
    if (!state.dice.length) {
      els.dice.innerHTML = Array.from({ length: 4 }, () => '<span class="cant-die">-</span>').join("");
      return;
    }
    els.dice.innerHTML = state.dice.map((value) => `<span class="cant-die">${value}</span>`).join("");
  }

  function renderOptions() {
    if (!els.options) return;
    els.options.innerHTML = "";
    if (state.phase !== "choice") {
      const empty = document.createElement("div");
      empty.className = "leaderboard-empty";
      empty.textContent = state.phase === "decision" ? "더 굴릴지 멈출지 선택하세요." : "주사위를 굴리면 선택지가 나옵니다.";
      els.options.append(empty);
      return;
    }

    state.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "cant-option-button";
      const sums = option.sums.join(" / ");
      const steps = option.steps.join(", ");
      button.innerHTML = `
        <span>${escapeHtml(sums)}</span>
        <small>${escapeHtml(steps)}번 상승</small>
      `;
      button.addEventListener("click", () => applyOption(state.options[index]));
      els.options.append(button);
    });
  }

  function progressSummary(actor) {
    const completed = completedColumns(actor).length;
    const best = COLUMNS
      .filter((column) => !state.claimed[column])
      .map((column) => ({ column, value: permanentProgress(actor, column), height: COLUMN_HEIGHTS[column] }))
      .filter((entry) => entry.value > 0)
      .sort((left, right) => (right.value / right.height) - (left.value / left.height))
      .slice(0, 3)
      .map((entry) => `${entry.column}:${entry.value}/${entry.height}`)
      .join(" · ");
    return best ? `완주 ${completed}개 · ${best}` : `완주 ${completed}개`;
  }

  function renderStatus() {
    const humanDone = completedColumns("human").length;
    const aiDone = completedColumns("ai").length;
    if (els.gameHumanAvatar) els.gameHumanAvatar.src = HUMAN_PROFILE.avatarUrl;
    if (els.aiAvatar) els.aiAvatar.src = state.aiProfile?.avatarUrl || profileImageUrl("보통-건일.jpg");
    if (els.humanNameLabel) els.humanNameLabel.textContent = state.humanName || currentHumanNickname() || "플레이어";
    if (els.aiNameLabel) els.aiNameLabel.textContent = aiProfileDisplayName(state.aiProfile);
    if (els.aiDifficultyLabel) els.aiDifficultyLabel.textContent = aiDifficultyLabel(state.aiDifficulty);
    if (els.humanScore) els.humanScore.textContent = `${humanDone}개 완주`;
    if (els.aiScore) els.aiScore.textContent = `${aiDone}개 완주`;
    if (els.humanProgressSummary) els.humanProgressSummary.textContent = progressSummary("human");
    if (els.aiProgressSummary) els.aiProgressSummary.textContent = progressSummary("ai");
    els.humanCard?.classList.toggle("active", state.currentActor === "human" && !state.finished);
    els.aiCard?.classList.toggle("active", state.currentActor === "ai" && !state.finished);
    if (els.turnLabel) {
      els.turnLabel.textContent = state.finished
        ? "게임 종료"
        : `${actorLabel()} ${state.currentActor === "ai" ? "생각 중" : "차례"} / ${state.turnNumber}턴`;
    }
    if (els.phaseLabel) {
      const active = activeTempColumns();
      els.phaseLabel.textContent = state.finished
        ? "먼저 기둥 3개를 완주했습니다."
        : active.length
          ? `이번 턴 도전: ${active.join(", ")}`
          : "주사위를 굴리세요.";
    }
  }

  function renderControls() {
    const humanTurn = state.currentActor === "human" && !state.finished;
    if (els.rollButton) {
      els.rollButton.disabled = !humanTurn || (state.phase !== "idle" && state.phase !== "decision");
      els.rollButton.textContent = state.phase === "decision" ? "더 굴리기" : "굴리기";
    }
    if (els.stopButton) {
      els.stopButton.disabled = !humanTurn || state.phase !== "decision" || activeTempColumns().length === 0;
    }
  }

  function renderLog() {
    if (!els.log) return;
    els.log.innerHTML = "";
    state.log.forEach((message) => {
      const item = document.createElement("li");
      item.textContent = message;
      els.log.append(item);
    });
  }

  function renderCant() {
    renderStatus();
    renderBoard();
    renderDice();
    renderOptions();
    renderControls();
    renderLog();
  }

  els.enterButton?.addEventListener("click", enterCantStop);
  els.backButton?.addEventListener("click", leaveCantStop);
  els.newGameButton?.addEventListener("click", startCantGame);
  els.startButton?.addEventListener("click", startCantGame);
  els.confirmNicknameButton?.addEventListener("click", (event) => {
    const force = consumeNicknameForceChangeClick(event);
    if (force === null) return;
    confirmCantNicknameChange(els.nameInput, { force });
  });
  els.nameInput?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    confirmCantNicknameChange(els.nameInput);
  });
  els.difficultySelect?.addEventListener("change", renderCantSetup);
  els.refreshLeaderboardButton?.addEventListener("click", loadCantLeaderboard);
  els.rulesButton?.addEventListener("click", openCantRules);
  els.rulesDialog?.addEventListener("click", (event) => {
    if (event.target === els.rulesDialog) {
      els.rulesDialog.close();
    }
  });
  els.rollButton?.addEventListener("click", rollForCurrentActor);
  els.stopButton?.addEventListener("click", stopCurrentTurn);

  window.CantStopGame = {
    enter: enterCantStop,
    leave: leaveCantStop,
    reset: resetCantGame
  };
})();
