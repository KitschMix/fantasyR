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
  const BOARD_SPOTS = {
    2: [[8.79, 77.08], [8.90, 70.97], [8.99, 64.85]],
    3: [[16.85, 77.07], [16.92, 70.97], [16.97, 64.90], [17.06, 58.81], [17.12, 52.81]],
    4: [[24.89, 77.08], [24.93, 70.97], [24.97, 64.90], [25.02, 58.83], [25.05, 52.80], [25.13, 46.82], [25.17, 40.83]],
    5: [[32.93, 77.08], [32.95, 70.98], [32.97, 64.90], [32.99, 58.82], [33.03, 52.81], [33.07, 46.83], [33.08, 40.85], [33.11, 34.88], [33.15, 29.00]],
    6: [[40.96, 77.07], [40.97, 70.98], [40.98, 64.91], [40.97, 58.86], [41.00, 52.81], [41.01, 46.83], [41.02, 40.86], [41.03, 34.89], [41.03, 28.99], [41.06, 23.12], [41.08, 17.30]],
    7: [[48.98, 77.08], [48.98, 70.98], [48.97, 64.93], [48.96, 58.87], [48.95, 52.82], [48.95, 46.84], [48.94, 40.88], [48.94, 34.90], [48.93, 29.01], [48.92, 23.15], [48.93, 17.35], [48.92, 11.58], [48.91, 5.85]],
    8: [[57.02, 77.08], [57.00, 70.99], [56.97, 64.92], [56.93, 58.85], [56.91, 52.80], [56.88, 46.82], [56.86, 40.88], [56.85, 34.89], [56.82, 28.99], [56.78, 23.13], [56.73, 17.34]],
    9: [[65.06, 77.07], [65.01, 70.99], [64.97, 64.91], [64.92, 58.85], [64.90, 52.80], [64.83, 46.83], [64.82, 40.85], [64.76, 34.88], [64.70, 29.04]],
    10: [[73.09, 77.08], [73.03, 70.98], [72.97, 64.91], [72.90, 58.86], [72.85, 52.80], [72.80, 46.83], [72.64, 40.91]],
    11: [[81.17, 77.09], [81.10, 70.98], [81.00, 64.90], [80.90, 58.82], [80.81, 52.85]],
    12: [[89.25, 77.12], [89.13, 70.98], [89.01, 64.87]]
  };
  const DEFAULT_PLAYERS = [
    { id: "human", role: "human", label: "나", className: "human" },
    { id: "ai1", role: "ai", label: "AI 1", className: "ai1" }
  ];
  const PLAYER_TOKEN_OFFSETS = {
    1: [[0, 0]],
    2: [[-18, 0], [18, 0]],
    3: [[0, -18], [-18, 16], [18, 16]],
    4: [[-18, -18], [18, -18], [-18, 18], [18, 18]]
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
    playerCountSelect: document.querySelector("#cantPlayerCountSelect"),
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
    playersList: document.querySelector("#cantPlayersList"),
    turnLabel: document.querySelector("#cantTurnLabel"),
    phaseLabel: document.querySelector("#cantPhaseLabel"),
    board: document.querySelector("#cantBoard"),
    dice: document.querySelector("#cantDice"),
    options: document.querySelector("#cantOptions"),
    rollButton: document.querySelector("#cantRollButton"),
    stopButton: document.querySelector("#cantStopButton"),
    log: document.querySelector("#cantLog")
  };
  const STANDALONE_CANT_PAGE = !els.enterButton;

  const state = {
    view: "setup",
    started: false,
    finished: false,
    currentActor: "human",
    playerCount: 2,
    players: [...DEFAULT_PLAYERS],
    phase: "idle",
    humanName: "",
    difficultyMode: "normal",
    aiDifficulty: "normal",
    aiProfile: null,
    aiProfiles: {},
    progress: { human: {}, ai1: {} },
    claimed: {},
    tempProgress: {},
    dice: [],
    options: [],
    selectedDice: [],
    turnNumber: 1,
    log: [],
    aiTimer: 0,
    leaderboardSubmitted: false,
    diceRolling: false
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

  function selectCantAiProfiles(difficulty, count) {
    const pool = difficulty === "random"
      ? AI_PROFILE_DIFFICULTY_KEYS.flatMap((key) => AI_PROFILE_GROUPS[key] || []).map((profile) => (
        prepareAiProfile(profile, randomAiDifficultyKey(), "랜덤")
      ))
      : (AI_PROFILE_GROUPS[difficulty] || AI_PROFILE_GROUPS.normal || []).map((profile) => (
        prepareAiProfile(profile, AI_PROFILE_GROUPS[difficulty] ? difficulty : "normal")
      ));
    const shuffled = shuffle(pool);
    return Array.from({ length: count }, (_, index) => (
      shuffled[index % Math.max(1, shuffled.length)]
        ? { ...shuffled[index % Math.max(1, shuffled.length)] }
        : prepareAiProfile({ name: `AI ${index + 1}`, avatarUrl: profileImageUrl("보통-건일.jpg") }, "normal")
    ));
  }

  function aiProfileDisplayName(profile = state.aiProfile) {
    if (!profile) return "AI";
    if (profile.boss) return "강범례(최종보스)";
    return `${profile.name} (${profile.difficultyLabel || aiDifficultyLabel(profile.difficulty)})`;
  }

  function actorPlayer(actor = state.currentActor) {
    return (state.players || []).find((player) => player.id === actor)
      || DEFAULT_PLAYERS.find((player) => player.id === actor)
      || { id: actor, label: actor, role: actor === "human" ? "human" : "ai", className: "ai1" };
  }

  function isAiActor(actor = state.currentActor) {
    return actorPlayer(actor).role === "ai";
  }

  function actorLabel(actor = state.currentActor) {
    const player = actorPlayer(actor);
    if (player.role === "human") return state.humanName || currentHumanNickname() || player.label;
    return aiProfileDisplayName(player.profile || state.aiProfiles?.[actor] || state.aiProfile);
  }

  function nextActor(actor = state.currentActor) {
    const players = state.players?.length ? state.players : DEFAULT_PLAYERS;
    const index = Math.max(0, players.findIndex((player) => player.id === actor));
    return players[(index + 1) % players.length]?.id || "human";
  }

  function buildCantPlayers(playerCount, difficulty) {
    const total = Math.min(4, Math.max(2, Number(playerCount) || 2));
    const aiProfiles = selectCantAiProfiles(difficulty, total - 1);
    return [
      {
        id: "human",
        role: "human",
        className: "human",
        label: state.humanName || currentHumanNickname() || "플레이어",
        avatarUrl: HUMAN_PROFILE.avatarUrl,
        difficultyLabel: "나"
      },
      ...aiProfiles.map((profile, index) => ({
        id: `ai${index + 1}`,
        role: "ai",
        className: `ai${index + 1}`,
        label: profile.name || `AI ${index + 1}`,
        avatarUrl: profile.avatarUrl || profileImageUrl("보통-건일.jpg"),
        profile,
        difficultyLabel: profile.difficultyLabel || aiDifficultyLabel(profile.difficulty)
      }))
    ];
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
        <b>${Number(entry.turns || 0)}턴</b>
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
      .gt("turns", 0)
      .order("turns", { ascending: true })
      .order("score", { ascending: false })
      .order("updated_at", { ascending: true })
      .limit(CANT_LEADERBOARD_LIMIT);

    if (error) {
      renderCantLeaderboardList([]);
      setCantLeaderboardStatus("캔트스탑 랭킹 설정이 필요합니다. 최신 supabase-schema.sql을 실행해주세요.", true);
      return;
    }

    renderCantLeaderboardList(data || []);
    setCantLeaderboardStatus("싱글플레이 승리 중 최단 턴 기록만 자동 기록됩니다.");
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
    setCantLeaderboardStatus(`캔트스탑 랭킹에 ${state.turnNumber}턴 승리 기록을 등록하는 중입니다.`);
    const { data, error } = await client.rpc("fantasy_submit_cant_stop_score", {
      p_nickname: nickname,
      p_score: score,
      p_columns_claimed: completedColumns("human").length,
      p_turns: state.turnNumber,
      p_ai_difficulty: state.difficultyMode || state.aiDifficulty || "normal",
      p_opponent_name: state.players.filter((player) => player.role === "ai").map((player) => player.profile?.name || player.label).join(", ") || "AI",
      p_won: won
    });

    if (error) {
      setCantLeaderboardStatus(cantLeaderboardSubmitErrorMessage(error), true);
      return;
    }

    const result = Array.isArray(data) ? data[0] : data;
    const turnsUpdated = result?.turns_updated ?? result?.score_updated;
    const recordText = turnsUpdated ? "최단 턴 갱신!" : "기존 최단 턴 기록을 유지했습니다.";
    const nicknameText = result?.nickname_updated === false ? " 서버 기준 닉네임 변경 제한으로 기존 이름을 유지했습니다." : "";
    setCantLeaderboardStatus(`캔트스탑 랭킹: ${recordText}${nicknameText}`);
    loadCantLeaderboard();
  }

  function currentDifficultyMode() {
    return els.difficultySelect?.value || state.difficultyMode || "normal";
  }

  function currentPlayerCount() {
    return Math.min(4, Math.max(2, Number(els.playerCountSelect?.value || state.playerCount || 2)));
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
    if (STANDALONE_CANT_PAGE) {
      window.location.href = "./";
      return;
    }
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
    state.playerCount = currentPlayerCount();
    state.players = buildCantPlayers(state.playerCount, state.difficultyMode);
    state.aiProfiles = Object.fromEntries(state.players.filter((player) => player.role === "ai").map((player) => [player.id, player.profile]));
    state.aiProfile = state.aiProfiles.ai1 || null;
    state.aiDifficulty = state.aiProfile?.difficulty || "normal";
    resetCantGame();
  }

  function resetCantGame() {
    clearAiTimer();
    showCantGame();
    if (!state.humanName) state.humanName = currentHumanNickname() || HUMAN_PROFILE.name;
    state.playerCount = state.playerCount || currentPlayerCount();
    if (!state.players?.length || state.players.length !== state.playerCount) {
      state.players = buildCantPlayers(state.playerCount, state.difficultyMode || currentDifficultyMode());
    }
    state.aiProfiles = Object.fromEntries(state.players.filter((player) => player.role === "ai").map((player) => [player.id, player.profile]));
    state.aiProfile = state.aiProfiles.ai1 || null;
    state.aiDifficulty = state.aiProfile?.difficulty || "normal";
    state.started = true;
    state.finished = false;
    state.currentActor = "human";
    state.phase = "idle";
    state.progress = Object.fromEntries(state.players.map((player) => [player.id, {}]));
    state.claimed = {};
    state.tempProgress = {};
    state.dice = [];
    state.options = [];
    state.selectedDice = [];
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

  function advanceTempProgress(tempProgress, column) {
    const next = { ...tempProgress };
    const current = next[column] ?? permanentProgress(state.currentActor, column);
    next[column] = Math.min(COLUMN_HEIGHTS[column], current + 1);
    return next;
  }

  function optionSteps(sums) {
    const temp = { ...state.tempProgress };
    const steps = [];
    sums.forEach((sum) => {
      if (!canAdvanceColumn(sum, temp)) return;
      Object.assign(temp, advanceTempProgress(temp, sum));
      steps.push(sum);
    });
    return steps;
  }

  function optionStepVariants(sums) {
    const [first, second] = sums;
    if (first === second) {
      const duplicateSteps = optionSteps(sums);
      return duplicateSteps.length ? [duplicateSteps] : [];
    }

    const variants = [];
    [first, second].forEach((primary, index) => {
      const secondary = index === 0 ? second : first;
      if (!canAdvanceColumn(primary)) return;
      const afterPrimary = advanceTempProgress(state.tempProgress, primary);
      const steps = [primary];
      if (canAdvanceColumn(secondary, afterPrimary)) {
        steps.push(secondary);
      }
      variants.push(steps);
    });

    if (!variants.length) return [];
    const maxMoves = Math.max(...variants.map((steps) => steps.length));
    const seen = new Set();
    return variants
      .filter((steps) => steps.length === maxMoves)
      .filter((steps) => {
        const key = [...steps].sort((a, b) => a - b).join("-");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }

  function buildRollOptions(dice) {
    const raw = [
      [dice[0] + dice[1], dice[2] + dice[3]],
      [dice[0] + dice[2], dice[1] + dice[3]],
      [dice[0] + dice[3], dice[1] + dice[2]]
    ];
    const seen = new Set();
    return raw.flatMap((sums) => {
      const sortedKey = [...sums].sort((a, b) => a - b).join("-");
      return optionStepVariants(sums).map((steps) => ({
        sums,
        steps,
        key: `${sortedKey}:${[...steps].sort((a, b) => a - b).join("-")}:${steps.length}`
      }));
    }).filter((option) => {
      if (seen.has(option.key) || option.steps.length === 0) return false;
      seen.add(option.key);
      return true;
    });
  }

  function isManualDiceChoice() {
    return state.currentActor === "human" && state.phase === "choice";
  }

  function clearManualDiceSelection() {
    state.selectedDice = [];
  }

  function toggleManualDieSelection(index) {
    if (!isManualDiceChoice()) return;
    const selectedIndex = state.selectedDice.indexOf(index);
    if (selectedIndex >= 0) {
      state.selectedDice.splice(selectedIndex, 1);
    } else if (state.selectedDice.length < 4) {
      state.selectedDice.push(index);
    }
    renderCant();
  }

  function selectedDicePairSums() {
    const selected = state.selectedDice;
    const pairs = [];
    for (let index = 0; index < selected.length; index += 2) {
      const diceIndexes = selected.slice(index, index + 2);
      pairs.push({
        diceIndexes,
        values: diceIndexes.map((diceIndex) => state.dice[diceIndex]),
        sum: diceIndexes.length === 2
          ? diceIndexes.reduce((total, diceIndex) => total + state.dice[diceIndex], 0)
          : null
      });
    }
    return pairs;
  }

  function manualDiceOption() {
    if (state.selectedDice.length !== 4) return null;
    const sums = selectedDicePairSums().map((pair) => pair.sum);
    const steps = optionSteps(sums);
    if (!steps.length) return { sums, steps: [], key: `manual:${sums.join("-")}`, invalid: true };
    return { sums, steps, key: `manual:${sums.join("-")}` };
  }

  function confirmManualDiceSelection() {
    if (!isManualDiceChoice()) return;
    const option = manualDiceOption();
    if (!option || option.invalid) {
      toast("올라갈 수 있는 묶음이 아닙니다.", 1400);
      return;
    }
    applyOption(option);
  }

  const DICE_ROLL_DURATION_MS = 650;
  const DICE_ROLL_FRAME_MS = 58;
  let diceRollTimer = 0;

  function clearDiceRollTimer() {
    if (diceRollTimer) {
      window.clearTimeout(diceRollTimer);
      diceRollTimer = 0;
    }
  }

  function animateDiceRoll(finalDice) {
    return new Promise((resolve) => {
      clearDiceRollTimer();
      state.diceRolling = true;
      state.dice = rollDice();
      renderCant();

      const start = Date.now();
      const tick = () => {
        const elapsed = Date.now() - start;
        if (elapsed >= DICE_ROLL_DURATION_MS) {
          state.dice = finalDice;
          state.diceRolling = false;
          clearDiceRollTimer();
          renderCant();
          resolve();
          return;
        }
        state.dice = rollDice();
        renderCant();
        diceRollTimer = window.setTimeout(tick, DICE_ROLL_FRAME_MS);
      };
      diceRollTimer = window.setTimeout(tick, DICE_ROLL_FRAME_MS);
    });
  }

  async function rollForCurrentActor() {
    if (state.finished || state.phase === "choice" || state.diceRolling) return;
    const finalDice = rollDice();
    const options = buildRollOptions(finalDice);
    clearManualDiceSelection();
    
    await animateDiceRoll(finalDice);

    state.options = options;
    if (!state.options.length) {
      bustCurrentTurn();
      return;
    }
    state.phase = "choice";
    log(`${actorLabel()}: ${state.dice.join(", ")} 굴림`);
    renderCant();
    if (isAiActor()) scheduleAiChoice();
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
    clearManualDiceSelection();
    renderCant();
    if (isAiActor()) scheduleAiDecision();
  }

  function bustCurrentTurn() {
    const lost = activeTempColumns();
    state.tempProgress = {};
    state.options = [];
    clearManualDiceSelection();
    state.phase = "idle";
    log(`${actorLabel()}: 실패!${lost.length ? ` 이번 턴 등반(${lost.join(", ")})이 사라졌습니다.` : ""}`);
    toast(`${actorLabel()} 실패`, 1400);
    endTurn();
  }

  function stopCurrentTurn() {
    if (state.finished || activeTempColumns().length === 0) return;
    const actor = state.currentActor;
    if (!state.progress[actor]) state.progress[actor] = {};
    activeTempColumns().forEach((column) => {
      const value = Math.min(state.tempProgress[column], COLUMN_HEIGHTS[column]);
      state.progress[actor][column] = value;
      if (value >= COLUMN_HEIGHTS[column]) {
        state.claimed[column] = actor;
        state.players.forEach((player) => {
          if (player.id !== actor && state.progress[player.id]) delete state.progress[player.id][column];
        });
      }
    });
    const completed = completedColumns(actor);
    log(`${actorLabel(actor)}: 멈춤. 현재 완주 ${completed.length}개`);
    state.tempProgress = {};
    state.options = [];
    clearManualDiceSelection();
    state.phase = "idle";
    if (completed.length >= 3) {
      finishCantGame(actor);
      return;
    }
    endTurn();
  }

  function endTurn() {
    if (state.finished) return;
    state.currentActor = nextActor();
    state.turnNumber += 1;
    state.dice = [];
    state.options = [];
    clearManualDiceSelection();
    state.phase = "idle";
    renderCant();
    if (isAiActor()) scheduleAiRoll();
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

  function aiDifficultyKey(actor = state.currentActor) {
    const player = actorPlayer(actor);
    const profile = state.aiProfiles?.[actor] || player.profile || state.aiProfile;
    const difficulty = profile?.difficulty || state.aiDifficulty || "normal";
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
    const actor = state.currentActor;
    const tempColumns = activeTempColumns();
    const tempCompleted = tempColumns.filter((column) => state.tempProgress[column] >= COLUMN_HEIGHTS[column]).length;
    const totalCompleted = completedColumns(actor).length + tempCompleted;
    const gained = tempColumns.reduce((sum, column) => (
      sum + Math.max(0, (state.tempProgress[column] || 0) - permanentProgress(actor, column))
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
    if (!isAiActor() || state.finished) return;
    state.aiTimer = window.setTimeout(() => {
      state.aiTimer = 0;
      rollForCurrentActor();
    }, AI_THINK_DELAY_MS);
  }

  function scheduleAiChoice() {
    clearAiTimer();
    state.aiTimer = window.setTimeout(() => {
      state.aiTimer = 0;
      if (!isAiActor() || state.finished || state.phase !== "choice") return;
      applyOption(chooseAiOption());
    }, AI_STEP_DELAY_MS);
  }

  function scheduleAiDecision() {
    clearAiTimer();
    state.aiTimer = window.setTimeout(() => {
      state.aiTimer = 0;
      if (!isAiActor() || state.finished || state.phase !== "decision") return;
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

  function collectBoardTokenRects() {
    const rects = new Map();
    if (!els.board) return rects;
    els.board.querySelectorAll(".cant-board-token-anchor[data-token-key]").forEach((token) => {
      rects.set(token.dataset.tokenKey, token.getBoundingClientRect());
    });
    return rects;
  }

  function animateBoardTokenMoves(previousRects) {
    if (!els.board || !previousRects?.size) return;
    els.board.querySelectorAll(".cant-board-token-anchor[data-token-key]").forEach((anchor) => {
      const previous = previousRects.get(anchor.dataset.tokenKey);
      if (!previous) return;
      const current = anchor.getBoundingClientRect();
      const dx = previous.left - current.left;
      const dy = previous.top - current.top;
      if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
      const target = anchor.firstElementChild || anchor;
      if (typeof target.animate !== "function") return;
      target.animate(
        [
          { transform: `translate(${dx}px, ${dy}px)` },
          { transform: "translate(0, 0)" }
        ],
        { duration: 420, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
      );
    });
  }

  function playersAtBoardSpot(column, step) {
    const claimedActor = state.claimed[column];
    return (state.players?.length ? state.players : DEFAULT_PLAYERS)
      .filter((player) => (!claimedActor || claimedActor === player.id) && visibleProgress(player.id, column) === step);
  }

  function renderBoard() {
    if (!els.board) return;
    const previousRects = collectBoardTokenRects();
    els.board.innerHTML = "";
    const fragment = document.createDocumentFragment();
    COLUMNS.forEach((column) => {
      const spots = BOARD_SPOTS[column] || [];
      spots.forEach(([x, y], index) => {
        const step = index + 1;
        const claimedActor = state.claimed[column];
        const runnerActor = Object.prototype.hasOwnProperty.call(state.tempProgress, column)
          && state.tempProgress[column] === step
          ? state.currentActor
          : "";
        const spotPlayers = playersAtBoardSpot(column, step);
        const spotEl = document.createElement("span");
        spotEl.className = "cant-board-spot";
        spotEl.style.left = `${x}%`;
        spotEl.style.top = `${y}%`;
        const playerLabels = spotPlayers.map((player) => actorLabel(player.id)).join(", ");
        spotEl.title = claimedActor
          ? `${column}번 기둥 ${actorLabel(claimedActor)} 완주`
          : `${column}번 기둥 ${step}/${COLUMN_HEIGHTS[column]}${playerLabels ? ` - ${playerLabels}` : ""}`;
        spotEl.setAttribute("aria-label", spotEl.title);

        const offsets = PLAYER_TOKEN_OFFSETS[Math.min(4, Math.max(1, spotPlayers.length))] || PLAYER_TOKEN_OFFSETS[1];
        spotPlayers.forEach((player, playerIndex) => {
          const [offsetX, offsetY] = offsets[playerIndex] || [0, 0];
          const anchor = document.createElement("span");
          anchor.className = "cant-board-token-anchor";
          anchor.dataset.tokenKey = `${player.id}:${column}`;
          anchor.style.setProperty("--token-x", `${offsetX}%`);
          anchor.style.setProperty("--token-y", `${offsetY}%`);
          anchor.title = actorLabel(player.id);

          const token = document.createElement("span");
          token.className = [
            "cant-board-token",
            `player-${player.className || player.id}`,
            runnerActor === player.id ? "runner" : "",
            claimedActor === player.id && step === COLUMN_HEIGHTS[column] ? "claimed" : ""
          ].filter(Boolean).join(" ");
          anchor.append(token);
          spotEl.append(anchor);
        });

        fragment.append(spotEl);
      });
    });
    els.board.append(fragment);
    animateBoardTokenMoves(previousRects);
  }

  function renderDice() {
    if (!els.dice) return;
    if (!state.dice.length) {
      els.dice.innerHTML = Array.from({ length: 4 }, () => '<span class="cant-die">-</span>').join("");
      return;
    }
    els.dice.innerHTML = "";
    els.dice.classList.toggle("rolling", state.diceRolling);
    state.dice.forEach((value, index) => {
      const selectedOrder = state.selectedDice.indexOf(index);
      const die = document.createElement(isManualDiceChoice() ? "button" : "span");
      die.className = `cant-die${selectedOrder >= 0 ? " selected" : ""}`;
      die.textContent = value;
      if (selectedOrder >= 0) {
        die.setAttribute("data-order", String(selectedOrder + 1));
      }
      if (die.tagName === "BUTTON") {
        die.type = "button";
        die.setAttribute("aria-pressed", selectedOrder >= 0 ? "true" : "false");
        die.setAttribute("aria-label", `${index + 1}번째 주사위 ${value}`);
        die.addEventListener("click", () => toggleManualDieSelection(index));
      }
      els.dice.append(die);
    });
  }

  function renderAutomaticOptionButtons() {
    if (!els.options) return;
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

  function renderManualDiceChoice() {
    const pairs = selectedDicePairSums();
    const option = manualDiceOption();
    const complete = state.selectedDice.length === 4;
    const wrapper = document.createElement("div");
    wrapper.className = "cant-manual-choice";
    const pairHtml = [0, 1].map((pairIndex) => {
      const pair = pairs[pairIndex] || { values: [], sum: null };
      const values = pair.values.length ? pair.values.join(" + ") : "-";
      const sum = pair.sum === null ? "?" : pair.sum;
      return `
        <div class="cant-selected-pair${pair.values.length === 2 ? " complete" : ""}">
          <span>${escapeHtml(values)}</span>
          <strong>${escapeHtml(sum)}</strong>
        </div>
      `;
    }).join("");
    const resultText = complete
      ? option?.invalid
        ? "이 묶음으로는 올라갈 수 없습니다."
        : `${option.steps.join(", ")}번 기둥 상승`
      : "주사위를 순서대로 4개 선택하세요.";
    wrapper.innerHTML = `
      <div class="cant-selected-pairs">${pairHtml}</div>
      <small class="${option?.invalid ? "error" : ""}">${escapeHtml(resultText)}</small>
      <div class="cant-manual-actions">
        <button class="secondary-button" type="button">초기화</button>
        <button class="primary-button" type="button"${!complete || option?.invalid ? " disabled" : ""}>확정</button>
      </div>
    `;
    const [resetButton, confirmButton] = wrapper.querySelectorAll("button");
    resetButton?.addEventListener("click", () => {
      clearManualDiceSelection();
      renderCant();
    });
    confirmButton?.addEventListener("click", confirmManualDiceSelection);
    els.options.append(wrapper);
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

    if (state.currentActor === "human") {
      renderManualDiceChoice();
      return;
    }

    const empty = document.createElement("div");
    empty.className = "leaderboard-empty";
    empty.textContent = "AI가 주사위 묶음을 고르는 중입니다.";
    els.options.append(empty);
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
    const players = state.players?.length ? state.players : DEFAULT_PLAYERS;
    if (els.playersList) {
      els.playersList.innerHTML = "";
      const fragment = document.createDocumentFragment();
      players.forEach((player) => {
        const profile = player.role === "human"
          ? HUMAN_PROFILE
          : (player.profile || state.aiProfiles?.[player.id] || {});
        const displayName = player.role === "human"
          ? state.humanName || currentHumanNickname() || player.label
          : profile.name || player.label || "AI";
        const subLabel = player.role === "human"
          ? "플레이어"
          : (profile.boss ? AI_DIFFICULTY_LABELS.boss : (profile.difficultyLabel || aiDifficultyLabel(profile.difficulty)));
        const card = document.createElement("section");
        card.className = [
          "cant-player-card",
          `player-${player.className || player.id}`,
          state.currentActor === player.id && !state.finished ? "active" : ""
        ].filter(Boolean).join(" ");
        card.innerHTML = `
          <div class="cant-player-head">
            <img src="${escapeHtml(profile.avatarUrl || profileImageUrl("보통-건일.jpg"))}" alt="">
            <span>${escapeHtml(displayName)}</span>
            <small>${escapeHtml(subLabel)}</small>
          </div>
          <strong>${completedColumns(player.id).length}개 완주</strong>
          <small>${escapeHtml(progressSummary(player.id))}</small>
        `;
        fragment.append(card);
      });
      els.playersList.append(fragment);
    }
    if (els.turnLabel) {
      els.turnLabel.textContent = state.finished
        ? "게임 종료"
        : `${actorLabel()} ${isAiActor() ? "생각 중" : "차례"} / ${state.turnNumber}턴`;
    }
    if (els.phaseLabel) {
      const active = activeTempColumns();
      els.phaseLabel.textContent = state.finished
        ? "먼저 기둥 3개를 완주했습니다."
        : active.length
          ? `이번 턴 도전: ${active.join(", ")} (임시 마커 ${active.length}/3개 사용)`
          : "주사위를 굴리세요.";
    }
  }

  function renderControls() {
    const humanTurn = state.currentActor === "human" && !state.finished;
    if (els.rollButton) {
      els.rollButton.disabled = !humanTurn || (state.phase !== "idle" && state.phase !== "decision") || state.diceRolling;
      els.rollButton.textContent = state.phase === "decision" ? "더 굴리기" : "굴리기";
    }
    if (els.stopButton) {
      els.stopButton.disabled = !humanTurn || state.phase !== "decision" || activeTempColumns().length === 0 || state.diceRolling;
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
  els.playerCountSelect?.addEventListener("change", renderCantSetup);
  els.refreshLeaderboardButton?.addEventListener("click", loadCantLeaderboard);
  els.rulesButton?.addEventListener("click", openCantRules);
  els.rulesDialog?.addEventListener("click", (event) => {
    if (event.target === els.rulesDialog) {
      els.rulesDialog.close();
    }
  });
  els.rollButton?.addEventListener("click", rollForCurrentActor);
  els.stopButton?.addEventListener("click", stopCurrentTurn);

  if (STANDALONE_CANT_PAGE) {
    enterCantStop();
  }

  window.CantStopGame = {
    enter: enterCantStop,
    leave: leaveCantStop,
    reset: resetCantGame
  };
})();
