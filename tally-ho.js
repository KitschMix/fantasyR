(function () {
  "use strict";

  const SIZE = 7;
  const CENTER = 3;
  const SIDES = {
    blue: { label: "동물팀", colorLabel: "파랑", pieces: "곰 · 여우", opponent: "brown" },
    brown: { label: "사냥꾼팀", colorLabel: "갈색", pieces: "사냥꾼 · 나무꾼", opponent: "blue" }
  };
  const ACTORS = {
    human: { label: "나", opponent: "ai" },
    ai: { label: "AI", opponent: "human" }
  };
  const AI_THINK_DELAY_MS = 560;
  const AI_ACTION_DELAY_MS = 460;
  const ZOOM_STORAGE_KEY = "fantasyR.tallyHoZoomPercent";
  const ZOOM_MIN_PERCENT = 70;
  const ZOOM_MAX_PERCENT = 220;
  const ZOOM_STEP_PERCENT = 10;
  const ZOOM_AUTO_MAX_PERCENT = 220;
  const DIRS = [
    { key: "north", label: "북", mark: "▲", dr: -1, dc: 0 },
    { key: "east", label: "동", mark: "▶", dr: 0, dc: 1 },
    { key: "south", label: "남", mark: "▼", dr: 1, dc: 0 },
    { key: "west", label: "서", mark: "◀", dr: 0, dc: -1 }
  ];
  const DIR_BY_KEY = new Map(DIRS.map((dir) => [dir.key, dir]));
  const EXIT_CELLS = new Map([
    ["0,3", "north"],
    ["3,6", "east"],
    ["6,3", "south"],
    ["3,0", "west"]
  ]);
  const PIECE_META = {
    bear: { label: "곰", side: "blue", value: 10, count: 2 },
    fox: { label: "여우", side: "blue", value: 5, count: 6 },
    hunter: { label: "사냥꾼", side: "brown", value: 5, count: 8 },
    lumberjack: { label: "나무꾼", side: "brown", value: 5, count: 2 },
    pheasant: { label: "꿩", side: "neutral", value: 3, count: 8 },
    duck: { label: "오리", side: "neutral", value: 2, count: 7 },
    tree: { label: "나무", side: "neutral", value: 2, count: 15 }
  };
  const LONG_MOVERS = new Set(["fox", "hunter", "pheasant", "duck"]);
  const NEUTRAL_MOVERS = new Set(["pheasant", "duck"]);
  const SUPABASE_CONFIG = window.FANTASY_SUPABASE_CONFIG || {};
  const SHARED_PROFILES = window.FANTASY_SHARED_PROFILES || {};
  const SHARED_NICKNAME_RULES = window.FANTASY_SHARED_NICKNAME_RULES || {};
  const PROFILE_ASSET_ROOT = SHARED_PROFILES.root || "assets/profiles/user";
  const HUMAN_PROFILE_STORAGE_KEY = SHARED_NICKNAME_RULES.storageKey || "fantasyKingdom.humanProfile.v1";
  const NICKNAME_CHANGE_INTERVAL_MS = SHARED_NICKNAME_RULES.intervalMs || (24 * 60 * 60 * 1000);
  const MIN_NICKNAME_LENGTH = SHARED_NICKNAME_RULES.minLength || 2;
  const TALLY_LEADERBOARD_TABLE = "fantasy_tally_ho_leaderboard";
  const TALLY_LEADERBOARD_LIMIT = 10;
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
    enterButton: document.querySelector("#enterTallyHoButton"),
    panel: document.querySelector("#tallyHoPanel"),
    setupView: document.querySelector("#tallySetupView"),
    gameView: document.querySelector("#tallyGameView"),
    backButton: document.querySelector("#tallyBackButton"),
    newGameButton: document.querySelector("#tallyNewGameButton"),
    rulesButton: document.querySelector("#tallyRulesButton"),
    rulesDialog: document.querySelector("#tallyRulesDialog"),
    startButton: document.querySelector("#tallyStartButton"),
    difficultySelect: document.querySelector("#tallyDifficultySelect"),
    nameInput: document.querySelector("#tallyNameInput"),
    onlineNameInput: document.querySelector("#tallyOnlineNameInput"),
    confirmNicknameButton: document.querySelector("#tallyConfirmNicknameButton"),
    nicknameStatus: document.querySelector("#tallyNicknameStatus"),
    humanAvatar: document.querySelector("#tallyHumanAvatar"),
    humanPreviewName: document.querySelector("#tallyHumanPreviewName"),
    animalLeaderboardList: document.querySelector("#tallyAnimalLeaderboardList"),
    hunterLeaderboardList: document.querySelector("#tallyHunterLeaderboardList"),
    leaderboardStatus: document.querySelector("#tallyLeaderboardStatus"),
    refreshLeaderboardButton: document.querySelector("#tallyRefreshLeaderboardButton"),
    zoomOutButton: document.querySelector("#tallyZoomOutButton"),
    zoomInButton: document.querySelector("#tallyZoomInButton"),
    zoomLabel: document.querySelector("#tallyZoomLabel"),
    board: document.querySelector("#tallyBoard"),
    blueScore: document.querySelector("#tallyBlueScore"),
    brownScore: document.querySelector("#tallyBrownScore"),
    blueCard: document.querySelector("#tallyBlueCard"),
    brownCard: document.querySelector("#tallyBrownCard"),
    blueOwnerAvatar: document.querySelector("#tallyBlueOwnerAvatar"),
    brownOwnerAvatar: document.querySelector("#tallyBrownOwnerAvatar"),
    blueOwnerLabel: document.querySelector("#tallyBlueOwnerLabel"),
    brownOwnerLabel: document.querySelector("#tallyBrownOwnerLabel"),
    blueTeamLabel: document.querySelector("#tallyBlueTeamLabel"),
    brownTeamLabel: document.querySelector("#tallyBrownTeamLabel"),
    bluePieces: document.querySelector("#tallyBluePieces"),
    brownPieces: document.querySelector("#tallyBrownPieces"),
    blueCaptured: document.querySelector("#tallyBlueCaptured"),
    brownCaptured: document.querySelector("#tallyBrownCaptured"),
    turnLabel: document.querySelector("#tallyTurnLabel"),
    phaseLabel: document.querySelector("#tallyPhaseLabel"),
    selectedPanel: document.querySelector("#tallySelectedPanel"),
    flipButton: document.querySelector("#tallyFlipButton"),
    exitButton: document.querySelector("#tallyExitButton"),
    log: document.querySelector("#tallyLog")
  };

  const state = {
    board: [],
    currentActor: "human",
    currentSide: "",
    actorSides: { human: "", ai: "" },
    sideActors: { blue: "", brown: "" },
    selected: null,
    scores: { blue: 0, brown: 0 },
    captured: { blue: [], brown: [] },
    turnNumber: 1,
    turnSequence: 0,
    finalMode: false,
    finalJustStarted: false,
    finalTurns: { blue: 5, brown: 5 },
    finished: false,
    started: false,
    view: "setup",
    humanName: "",
    difficultyMode: "normal",
    aiDifficulty: "normal",
    aiProfile: null,
    leaderboardSubmitted: false,
    aiTimer: 0,
    aiActing: false,
    log: []
  };
  let tallyZoomPercent = 100;
  let tallySupabaseClient = null;
  const nicknameForceChangeState = {
    clicks: 0,
    lastClickAt: 0
  };

  function shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

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

  function selectTallyAiProfile(difficulty) {
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

  function setTallyNicknameStatus(message, error = false) {
    if (!els.nicknameStatus) return;
    els.nicknameStatus.textContent = message;
    els.nicknameStatus.classList.toggle("error", error);
  }

  function syncTallyNicknameInputs(force = false) {
    const nickname = currentHumanNickname();
    if (els.nameInput && (force || document.activeElement !== els.nameInput)) {
      els.nameInput.value = nickname;
    }
    if (els.onlineNameInput) {
      els.onlineNameInput.value = nickname;
    }
    const fantasyNameInput = document.querySelector("#humanNameInput");
    const fantasyOnlineInput = document.querySelector("#onlineNameInput");
    if (fantasyNameInput && force) fantasyNameInput.value = nickname;
    if (fantasyOnlineInput && force) fantasyOnlineInput.value = nickname;
  }

  function confirmTallyNicknameChange(sourceInput = els.nameInput, options = {}) {
    const force = Boolean(options.force);
    const profile = readHumanProfile();
    const desired = normalizeHumanNickname(sourceInput?.value ?? profile.nickname);
    const validationMessage = nicknameValidationMessage(desired);
    if (validationMessage) {
      window.alert(validationMessage);
      setTallyNicknameStatus(validationMessage, true);
      sourceInput?.focus();
      return false;
    }

    if (desired === profile.nickname) {
      syncTallyNicknameInputs(true);
      setTallyNicknameStatus(`현재 닉네임: ${profile.nickname}`);
      renderTallySetup();
      return true;
    }

    const changedAt = Date.parse(profile.lastChangedAt || "");
    if (!force && changedAt && Date.now() - changedAt < NICKNAME_CHANGE_INTERVAL_MS) {
      const remaining = nicknameChangeRemainingText(profile.lastChangedAt);
      window.alert(`닉네임은 판타지왕국과 탤리호를 통틀어 하루에 한 번만 변경할 수 있습니다.\n${remaining}`);
      syncTallyNicknameInputs(true);
      setTallyNicknameStatus(`닉네임 변경 제한 중 (${remaining})`, true);
      renderTallySetup();
      return false;
    }

    const confirmed = window.confirm(force
      ? `숨겨진 변경키로 '${desired}' 닉네임을 강제 저장할까요?`
      : "닉네임은 판타지왕국과 탤리호를 통틀어 하루에 한 번만 변경할 수 있습니다.\n"
        + `확인하면 오늘은 '${desired}' 닉네임으로 고정됩니다.\n`
        + "저장할까요?");
    if (!confirmed) {
      syncTallyNicknameInputs(true);
      setTallyNicknameStatus(profile.nickname ? `현재 닉네임: ${profile.nickname}` : "닉네임을 설정해야 시작할 수 있습니다.", !profile.nickname);
      renderTallySetup();
      return false;
    }

    saveHumanProfile({ nickname: desired, lastChangedAt: new Date().toISOString() });
    syncTallyNicknameInputs(true);
    setTallyNicknameStatus(`${force ? "닉네임 강제 변경 완료" : "닉네임 저장 완료"}: ${desired}`);
    renderTallySetup();
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
      setTallyNicknameStatus(`숨겨진 변경키 ${nicknameForceChangeState.clicks}/5`);
      return null;
    }

    nicknameForceChangeState.clicks = 0;
    nicknameForceChangeState.lastClickAt = 0;
    setTallyNicknameStatus("숨겨진 변경키 활성화");
    return true;
  }

  function getSupabaseClient() {
    if (!SUPABASE_CONFIG.url || !SUPABASE_CONFIG.key || !window.supabase?.createClient) return null;
    if (tallySupabaseClient) return tallySupabaseClient;
    tallySupabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key, {
      auth: { persistSession: false }
    });
    return tallySupabaseClient;
  }

  function setTallyLeaderboardStatus(message, error = false) {
    if (!els.leaderboardStatus) return;
    els.leaderboardStatus.textContent = message;
    els.leaderboardStatus.classList.toggle("error", error);
  }

  function formatLeaderboardDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" });
  }

  function tallyTeamKey(side) {
    return side === "blue" ? "animals" : side === "brown" ? "hunters" : "";
  }

  function tallyTeamLabel(teamOrSide) {
    if (teamOrSide === "animals" || teamOrSide === "blue") return "동물 팀";
    if (teamOrSide === "hunters" || teamOrSide === "brown") return "사냥꾼 팀";
    return "미정";
  }

  function renderTallyLeaderboardList(listElement, entries) {
    if (!listElement) return;
    listElement.innerHTML = "";
    if (!entries?.length) {
      const item = document.createElement("li");
      item.className = "leaderboard-empty";
      item.textContent = "아직 기록 없음";
      listElement.append(item);
      return;
    }

    const fragment = document.createDocumentFragment();
    entries.forEach((entry, index) => {
      const item = document.createElement("li");
      item.className = "leaderboard-entry";
      const meta = [
        entry.ai_difficulty ? aiDifficultyLabel(entry.ai_difficulty) : "",
        entry.opponent_name || "",
        entry.won ? "승리" : "완주",
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
    listElement.append(fragment);
  }

  async function fetchTallyLeaderboardEntries(client, team) {
    return client
      .from(TALLY_LEADERBOARD_TABLE)
      .select("nickname,score,team,ai_difficulty,opponent_name,won,updated_at")
      .eq("team", team)
      .order("score", { ascending: false })
      .order("updated_at", { ascending: true })
      .limit(TALLY_LEADERBOARD_LIMIT);
  }

  async function loadTallyLeaderboard() {
    if (!els.animalLeaderboardList && !els.hunterLeaderboardList) return;
    const client = getSupabaseClient();
    if (!client) {
      setTallyLeaderboardStatus("Supabase 설정이 필요합니다.", true);
      return;
    }

    setTallyLeaderboardStatus("탤리 호 랭킹을 불러오는 중입니다.");
    const [animalResult, hunterResult] = await Promise.all([
      fetchTallyLeaderboardEntries(client, "animals"),
      fetchTallyLeaderboardEntries(client, "hunters")
    ]);

    if (animalResult.error || hunterResult.error) {
      renderTallyLeaderboardList(els.animalLeaderboardList, []);
      renderTallyLeaderboardList(els.hunterLeaderboardList, []);
      setTallyLeaderboardStatus("탤리 호 랭킹 설정이 필요합니다. 최신 supabase-schema.sql을 실행해주세요.", true);
      return;
    }

    renderTallyLeaderboardList(els.animalLeaderboardList, animalResult.data || []);
    renderTallyLeaderboardList(els.hunterLeaderboardList, hunterResult.data || []);
    setTallyLeaderboardStatus("싱글플레이 점수는 동물 팀과 사냥꾼 팀으로 나뉘어 최고점만 자동 기록됩니다.");
  }

  function tallyLeaderboardSubmitErrorMessage(error) {
    const message = [error?.message, error?.details, error?.hint].filter(Boolean).join(" ");
    if (error?.code === "PGRST202" || message.includes("Could not find the function")) {
      return "탤리 호 랭킹 등록 실패: 최신 supabase-schema.sql을 실행해주세요.";
    }
    if (error?.code === "22023" || message.includes("invalid nickname")) {
      return "탤리 호 랭킹 등록 실패: 닉네임은 2글자 이상이어야 하며 '나'는 사용할 수 없습니다.";
    }
    return `탤리 호 랭킹 등록 실패: ${message || "Supabase 설정을 확인해주세요."}`;
  }

  async function submitTallyLeaderboardScore(winnerSide) {
    if (state.leaderboardSubmitted) return;
    state.leaderboardSubmitted = true;
    const humanSide = state.actorSides.human;
    const team = tallyTeamKey(humanSide);
    if (!team) {
      setTallyLeaderboardStatus("진영이 정해지지 않은 게임은 랭킹에 등록하지 않습니다.");
      return;
    }

    const client = getSupabaseClient();
    if (!client) {
      setTallyLeaderboardStatus("탤리 호 랭킹 등록 실패: Supabase 설정 필요", true);
      return;
    }

    const nickname = normalizeHumanNickname(state.humanName || currentHumanNickname());
    const score = Number(state.scores[humanSide] || 0);
    const won = Boolean(winnerSide && winnerSide === humanSide);
    setTallyLeaderboardStatus(`${tallyTeamLabel(team)} 랭킹에 ${score}점을 등록하는 중입니다.`);
    const { data, error } = await client.rpc("fantasy_submit_tally_ho_score", {
      p_nickname: nickname,
      p_score: score,
      p_team: team,
      p_ai_difficulty: state.difficultyMode || state.aiDifficulty || "normal",
      p_opponent_name: state.aiProfile?.name || "AI",
      p_won: won
    });

    if (error) {
      setTallyLeaderboardStatus(tallyLeaderboardSubmitErrorMessage(error), true);
      return;
    }

    const result = Array.isArray(data) ? data[0] : data;
    const scoreText = result?.score_updated ? "최고 점수 갱신!" : "기존 최고 점수를 유지했습니다.";
    const nicknameText = result?.nickname_updated === false ? " 서버 기준 닉네임 변경 제한으로 기존 이름을 유지했습니다." : "";
    setTallyLeaderboardStatus(`${tallyTeamLabel(team)} 랭킹: ${scoreText}${nicknameText}`);
    loadTallyLeaderboard();
  }

  function clampNumber(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function currentViewportSize() {
    const viewport = window.visualViewport || {};
    const root = document.documentElement || {};
    return {
      width: Math.max(320, Number(viewport.width || window.innerWidth || root.clientWidth || window.screen?.availWidth || 1366)),
      height: Math.max(320, Number(viewport.height || window.innerHeight || root.clientHeight || window.screen?.availHeight || 768))
    };
  }

  function suggestedInitialTallyZoomPercent() {
    const { width, height } = currentViewportSize();
    const isPhonePortrait = width <= 700 && height > width;
    if (isPhonePortrait) return 90;

    const isCoarsePointer = Boolean(window.matchMedia?.("(pointer: coarse)")?.matches);
    const pixelRatio = isCoarsePointer ? 1 : Math.max(1, Number(window.devicePixelRatio || 1));
    const resolutionRatio = Math.min((width * pixelRatio) / 1920, (height * pixelRatio) / 1080);
    const percent = resolutionRatio <= 1
      ? resolutionRatio * 100
      : 100 + ((Math.min(resolutionRatio, 2) - 1) * 120);
    const stepped = Math.round(percent / ZOOM_STEP_PERCENT) * ZOOM_STEP_PERCENT;
    return clampNumber(stepped, ZOOM_MIN_PERCENT, Math.min(ZOOM_MAX_PERCENT, ZOOM_AUTO_MAX_PERCENT));
  }

  function loadTallyZoomPercent() {
    try {
      const saved = window.localStorage.getItem(ZOOM_STORAGE_KEY);
      const numeric = Number(saved);
      return saved !== null && String(saved).trim() !== "" && Number.isFinite(numeric)
        ? clampNumber(numeric, ZOOM_MIN_PERCENT, ZOOM_MAX_PERCENT)
        : suggestedInitialTallyZoomPercent();
    } catch {
      return suggestedInitialTallyZoomPercent();
    }
  }

  function saveTallyZoomPercent(percent) {
    try {
      window.localStorage.setItem(ZOOM_STORAGE_KEY, String(percent));
    } catch {
      // Storage can be blocked in private browsing; the live setting still works.
    }
  }

  function renderTallyZoomControls() {
    els.panel?.style.setProperty("--tally-ui-zoom", String(tallyZoomPercent / 100));
    if (els.zoomLabel) els.zoomLabel.textContent = `${tallyZoomPercent}%`;
    if (els.zoomOutButton) els.zoomOutButton.disabled = tallyZoomPercent <= ZOOM_MIN_PERCENT;
    if (els.zoomInButton) els.zoomInButton.disabled = tallyZoomPercent >= ZOOM_MAX_PERCENT;
  }

  function setTallyZoomPercent(percent, persist = true) {
    tallyZoomPercent = clampNumber(Math.round(percent / ZOOM_STEP_PERCENT) * ZOOM_STEP_PERCENT, ZOOM_MIN_PERCENT, ZOOM_MAX_PERCENT);
    renderTallyZoomControls();
    if (persist) saveTallyZoomPercent(tallyZoomPercent);
  }

  function adjustTallyZoom(delta) {
    setTallyZoomPercent(tallyZoomPercent + delta);
  }

  function initializeTallyZoomControls() {
    setTallyZoomPercent(loadTallyZoomPercent(), false);
  }

  function keyOf(row, col) {
    return `${row},${col}`;
  }

  function inBounds(row, col) {
    return row >= 0 && row < SIZE && col >= 0 && col < SIZE;
  }

  function opponent(side = state.currentSide) {
    return SIDES[side].opponent;
  }

  function opponentActor(actor = state.currentActor) {
    return ACTORS[actor].opponent;
  }

  function sidesAssigned() {
    return Boolean(state.actorSides.human && state.actorSides.ai);
  }

  function controlledSide(actor = state.currentActor) {
    return state.actorSides[actor] || "";
  }

  function setCurrentActor(actor) {
    state.currentActor = actor;
    state.currentSide = controlledSide(actor);
  }

  function actorLabel(actor = state.currentActor) {
    if (actor === "human") return state.humanName || currentHumanNickname() || ACTORS.human.label;
    if (actor === "ai") return aiProfileDisplayName(state.aiProfile);
    return ACTORS[actor]?.label || actor;
  }

  function sideOwnerLabel(side) {
    const actor = state.sideActors[side];
    return actor ? actorLabel(actor) : "미정";
  }

  function tileMeta(tile) {
    return PIECE_META[tile?.type] || null;
  }

  function makeTile(type, index) {
    const meta = PIECE_META[type];
    return {
      id: `${type}-${index}`,
      type,
      side: meta.side,
      value: meta.value,
      faceUp: false,
      dir: type === "hunter" ? DIRS[index % DIRS.length].key : "",
      lastFrom: null,
      lastFromTurn: -999,
      lockedFor: "",
      lockedTurn: -1
    };
  }

  function createTileBag() {
    const tiles = [];
    Object.entries(PIECE_META).forEach(([type, meta]) => {
      for (let i = 0; i < meta.count; i += 1) {
        tiles.push(makeTile(type, i));
      }
    });
    return shuffle(tiles);
  }

  function currentDifficultyMode() {
    return els.difficultySelect?.value || state.difficultyMode || "normal";
  }

  function renderTallySetup() {
    syncTallyNicknameInputs();
    const nickname = currentHumanNickname();
    if (els.humanAvatar) els.humanAvatar.src = HUMAN_PROFILE.avatarUrl;
    if (els.humanPreviewName) els.humanPreviewName.textContent = nickname || "닉네임 필요";
    if (!nickname) {
      setTallyNicknameStatus("닉네임을 2글자 이상으로 설정해야 시작할 수 있습니다.", true);
    } else if (!els.nicknameStatus?.classList.contains("error")) {
      setTallyNicknameStatus(`현재 닉네임: ${nickname}`);
    }
  }

  function showTallySetup() {
    clearAiTurnTimer();
    state.view = "setup";
    els.panel?.classList.add("setup-mode");
    els.setupView?.classList.remove("hidden");
    els.gameView?.classList.add("hidden");
    renderTallySetup();
    loadTallyLeaderboard();
  }

  function showTallyGame() {
    state.view = "game";
    els.panel?.classList.remove("setup-mode");
    els.setupView?.classList.add("hidden");
    els.gameView?.classList.remove("hidden");
  }

  function startTallyGame() {
    const desired = normalizeHumanNickname(els.nameInput?.value || "");
    if ((!currentHumanNickname() || (desired && desired !== currentHumanNickname())) && !confirmTallyNicknameChange(els.nameInput)) return;
    state.humanName = currentHumanNickname();
    if (!state.humanName) {
      renderTallySetup();
      return;
    }
    state.difficultyMode = currentDifficultyMode();
    state.aiProfile = { ...selectTallyAiProfile(state.difficultyMode) };
    state.aiDifficulty = state.aiProfile.difficulty || "normal";
    resetTallyGame();
  }

  function resetTallyGame() {
    clearAiTurnTimer();
    showTallyGame();
    if (!state.humanName) state.humanName = currentHumanNickname() || HUMAN_PROFILE.name;
    if (!state.aiProfile) state.aiProfile = { ...selectTallyAiProfile(state.difficultyMode || currentDifficultyMode()) };
    state.aiDifficulty = state.aiProfile.difficulty || "normal";
    const tiles = createTileBag();
    state.board = Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => null));
    for (let row = 0; row < SIZE; row += 1) {
      for (let col = 0; col < SIZE; col += 1) {
        if (row === CENTER && col === CENTER) continue;
        state.board[row][col] = tiles.pop() || null;
      }
    }
    state.currentActor = "human";
    state.currentSide = "";
    state.actorSides = { human: "", ai: "" };
    state.sideActors = { blue: "", brown: "" };
    state.selected = null;
    state.scores = { blue: 0, brown: 0 };
    state.captured = { blue: [], brown: [] };
    state.turnNumber = 1;
    state.turnSequence = 0;
    state.finalMode = false;
    state.finalJustStarted = false;
    state.finalTurns = { blue: 5, brown: 5 };
    state.finished = false;
    state.started = true;
    state.leaderboardSubmitted = false;
    state.aiActing = false;
    state.log = ["게임 시작. 먼저 공개된 유색 타일로 진영이 정해집니다."];
    renderTally();
    scheduleAiTurn();
  }

  function enterTallyHo() {
    document.body.classList.remove("launcher-active", "clue-active", "cant-active");
    document.body.classList.add("tally-active");
    els.panel?.classList.remove("hidden");
    showTallySetup();
  }

  function leaveTallyHo() {
    clearAiTurnTimer();
    document.body.classList.add("launcher-active");
    document.body.classList.remove("tally-active");
    els.panel?.classList.add("hidden");
  }

  function isExitCell(row, col) {
    return EXIT_CELLS.has(keyOf(row, col));
  }

  function currentSideLabel() {
    if (!sidesAssigned()) return actorLabel();
    return `${actorLabel()}(${SIDES[state.currentSide].label})`;
  }

  function sideDisplayLabel(side) {
    const meta = SIDES[side];
    if (!meta) return side;
    const owner = sideOwnerLabel(side);
    return owner === "미정" ? meta.label : `${owner} · ${meta.label}`;
  }

  function isAiSide(side = state.currentSide) {
    return state.sideActors[side] === "ai";
  }

  function isAiTurn() {
    return state.started && !state.finished && state.currentActor === "ai";
  }

  function clearAiTurnTimer() {
    if (state.aiTimer) {
      window.clearTimeout(state.aiTimer);
      state.aiTimer = 0;
    }
    state.aiActing = false;
  }

  function log(message) {
    state.log.unshift(message);
    state.log = state.log.slice(0, 12);
  }

  function toast(message, duration = 1200) {
    if (typeof window.showCenterToast === "function") {
      window.showCenterToast(message, duration, { mode: "tally" });
    }
  }

  function isNeutralMover(tile) {
    return NEUTRAL_MOVERS.has(tile?.type);
  }

  function isLockedForCurrentSide(tile) {
    return Boolean(tile?.lockedFor === state.currentActor && tile.lockedTurn === state.turnSequence);
  }

  function lockNeutralForOpponent(tile) {
    if (!isNeutralMover(tile)) return;
    tile.lockedFor = opponentActor();
    tile.lockedTurn = state.turnSequence + 1;
  }

  function canSelectMovableTile(tile) {
    if (!tile || !tile.faceUp || state.finished) return false;
    if (tile.type === "tree") return false;
    if (isLockedForCurrentSide(tile)) return false;
    if (!sidesAssigned()) return false;
    if (tile.side === "neutral") return isNeutralMover(tile);
    return tile.side === state.currentSide;
  }

  function canCurrentSideFlip() {
    return !state.finished && state.board.some((row) => row.some((tile) => tile && !tile.faceUp));
  }

  function directionBetween(fromRow, fromCol, toRow, toCol) {
    const dr = Math.sign(toRow - fromRow);
    const dc = Math.sign(toCol - fromCol);
    if (dr !== 0 && dc !== 0) return null;
    return DIRS.find((dir) => dir.dr === dr && dir.dc === dc) || null;
  }

  function isPreviousSpace(tile, row, col) {
    if (!tile || tile.side === "neutral" || !tile.lastFrom) return false;
    const immediateReturnTurn = tile.lastFromTurn + 2;
    return state.turnSequence <= immediateReturnTurn
      && tile.lastFrom.row === row
      && tile.lastFrom.col === col;
  }

  function canCapture(mover, target, dir) {
    if (!mover || !target || !target.faceUp) return false;
    if (mover.side === "neutral") return false;
    if (mover.type === "bear") return target.type === "hunter" || target.type === "lumberjack";
    if (mover.type === "fox") return target.type === "duck" || target.type === "pheasant";
    if (mover.type === "lumberjack") return target.type === "tree";
    if (mover.type === "hunter") {
      return dir.key === mover.dir && ["bear", "fox", "duck", "pheasant"].includes(target.type);
    }
    return false;
  }

  function canExit(tile, row, col, dir) {
    if (!state.finalMode || !tile || tile.side === "neutral" || tile.side !== state.currentSide) return false;
    const exitDir = EXIT_CELLS.get(keyOf(row, col));
    return exitDir === dir.key;
  }

  function lineDistance(fromRow, fromCol, toRow, toCol) {
    if (fromRow !== toRow && fromCol !== toCol) return Infinity;
    return Math.abs(toRow - fromRow) + Math.abs(toCol - fromCol);
  }

  function explainBlockedTarget(row, col) {
    if (!state.selected) return "";
    const mover = selectedTile();
    const target = state.board[row]?.[col];
    if (!mover || !target || !mover.faceUp || !target.faceUp || mover === target) return "";

    const dir = directionBetween(state.selected.row, state.selected.col, row, col);
    const distance = lineDistance(state.selected.row, state.selected.col, row, col);
    if (mover.type === "bear" && (target.type === "hunter" || target.type === "lumberjack")) {
      if (!dir || distance !== 1) return "곰은 상하좌우 바로 1칸의 사냥꾼/나무꾼만 잡을 수 있습니다.";
      if (isPreviousSpace(mover, row, col)) return "직전에 있던 칸으로는 바로 되돌아갈 수 없습니다.";
    }

    if (dir && isPreviousSpace(mover, row, col) && canCapture(mover, target, dir)) {
      return "직전에 있던 칸으로는 바로 되돌아갈 수 없습니다.";
    }

    return "";
  }

  function legalTargetsFor(row, col) {
    const tile = state.board[row]?.[col];
    if (!canSelectMovableTile(tile)) return [];

    const targets = [];
    const maxSteps = LONG_MOVERS.has(tile.type) ? SIZE : 1;
    DIRS.forEach((dir) => {
      for (let step = 1; step <= maxSteps; step += 1) {
        const nextRow = row + (dir.dr * step);
        const nextCol = col + (dir.dc * step);

        if (!inBounds(nextRow, nextCol)) {
          if (step === 1 && canExit(tile, row, col, dir)) {
            targets.push({ row, col, exit: true, dir: dir.key, key: `exit:${dir.key}` });
          }
          break;
        }

        if (isPreviousSpace(tile, nextRow, nextCol)) break;

        const occupant = state.board[nextRow][nextCol];
        if (!occupant) {
          targets.push({ row: nextRow, col: nextCol, capture: false, key: keyOf(nextRow, nextCol) });
          continue;
        }

        if (canCapture(tile, occupant, dir)) {
          targets.push({ row: nextRow, col: nextCol, capture: true, key: keyOf(nextRow, nextCol) });
        }
        break;
      }
    });
    return targets;
  }

  function selectedTile() {
    if (!state.selected) return null;
    return state.board[state.selected.row]?.[state.selected.col] || null;
  }

  function selectedTargets() {
    if (!state.selected) return [];
    return legalTargetsFor(state.selected.row, state.selected.col);
  }

  function faceDownCount() {
    return state.board.reduce((sum, row) => (
      sum + row.filter((tile) => tile && !tile.faceUp).length
    ), 0);
  }

  function coloredTilesOnBoard(side) {
    return state.board.flat().filter((tile) => tile?.faceUp && tile.side === side).length;
  }

  function hasAnyActionFor(side) {
    return hasAnyActionForActor(state.sideActors[side] || state.currentActor);
  }

  function hasAnyActionForActor(actor) {
    const previousActor = state.currentActor;
    const previousSide = state.currentSide;
    setCurrentActor(actor);
    const hasAction = canCurrentSideFlip() || state.board.some((row, rowIndex) => (
      row.some((tile, colIndex) => canSelectMovableTile(tile) && legalTargetsFor(rowIndex, colIndex).length > 0)
    ));
    state.currentActor = previousActor;
    state.currentSide = previousSide;
    return hasAction;
  }

  function withTemporaryActor(actor, callback) {
    const previousActor = state.currentActor;
    const previousSide = state.currentSide;
    setCurrentActor(actor);
    try {
      return callback();
    } finally {
      state.currentActor = previousActor;
      state.currentSide = previousSide;
    }
  }

  function collectMoveActionsForActor(actor) {
    return withTemporaryActor(actor, () => {
      const actions = [];
      state.board.forEach((row, rowIndex) => {
        row.forEach((tile, colIndex) => {
          if (!canSelectMovableTile(tile)) return;
          legalTargetsFor(rowIndex, colIndex).forEach((target) => {
            actions.push({
              type: "move",
              from: { row: rowIndex, col: colIndex },
              target: { ...target },
              tile,
              captured: target.capture ? state.board[target.row]?.[target.col] : null
            });
          });
        });
      });
      return actions;
    });
  }

  function collectFlipActions() {
    const actions = [];
    state.board.forEach((row, rowIndex) => {
      row.forEach((tile, colIndex) => {
        if (tile && !tile.faceUp) {
          actions.push({ type: "flip", row: rowIndex, col: colIndex });
        }
      });
    });
    return actions;
  }

  function distanceToNearestExit(row, col) {
    return Math.min(
      row + Math.abs(col - CENTER),
      (SIZE - 1 - row) + Math.abs(col - CENTER),
      col + Math.abs(row - CENTER),
      (SIZE - 1 - col) + Math.abs(row - CENTER)
    );
  }

  function emptyNeighborCount(row, col) {
    return DIRS.reduce((sum, dir) => {
      const nextRow = row + dir.dr;
      const nextCol = col + dir.dc;
      return sum + (inBounds(nextRow, nextCol) && !state.board[nextRow][nextCol] ? 1 : 0);
    }, 0);
  }

  function potentialCaptureScoreAt(mover, row, col, side) {
    if (!mover || mover.side === "neutral") return 0;
    const maxSteps = LONG_MOVERS.has(mover.type) ? SIZE : 1;
    return DIRS.reduce((best, dir) => {
      for (let step = 1; step <= maxSteps; step += 1) {
        const nextRow = row + (dir.dr * step);
        const nextCol = col + (dir.dc * step);
        if (!inBounds(nextRow, nextCol)) break;
        const occupant = state.board[nextRow][nextCol];
        if (!occupant || occupant.id === mover.id) continue;
        if (!occupant.faceUp) break;
        if (canCapture(mover, occupant, dir)) {
          const sideBonus = occupant.side === opponent(side) ? 8 : 0;
          return Math.max(best, occupant.value + sideBonus);
        }
        break;
      }
      return best;
    }, 0);
  }

  function scoreAiMove(action, side) {
    const mover = action.tile;
    if (action.target.exit) return 130 + (mover?.value || 0) * 8;

    if (action.captured) {
      let score = 70 + action.captured.value * 10;
      if (action.captured.side === opponent(side)) score += 35;
      if (action.captured.side === "neutral") score += 12;
      if (mover.type === "hunter" && action.captured.type === "bear") score += 25;
      if (mover.type === "hunter" && action.captured.type === "fox") score += 18;
      if (mover.type === "lumberjack" && action.captured.type === "tree") score += 7;
      return score;
    }

    let score = -8 + emptyNeighborCount(action.target.row, action.target.col);
    score += potentialCaptureScoreAt(mover, action.target.row, action.target.col, side) * 4;
    if (state.finalMode && mover.side === side) {
      score += 26 - distanceToNearestExit(action.target.row, action.target.col) * 4;
    }
    if (mover.side === "neutral") score -= 2;
    return score;
  }

  function scoreAiFlip(action) {
    const centerDistance = Math.abs(action.row - CENTER) + Math.abs(action.col - CENTER);
    return emptyNeighborCount(action.row, action.col) * 3 - centerDistance + Math.random();
  }

  function chooseTopScored(actions, scoreFn, topCount = 1) {
    if (!actions.length) return null;
    const ranked = [...actions]
      .map((action) => ({ action, score: scoreFn(action) }))
      .sort((left, right) => right.score - left.score);
    const capped = ranked.slice(0, Math.max(1, topCount));
    return capped[Math.floor(Math.random() * capped.length)].action;
  }

  function chooseRandomAction(actions) {
    if (!actions.length) return null;
    return actions[Math.floor(Math.random() * actions.length)];
  }

  function tallyAiDifficultyKey() {
    const difficulty = state.aiDifficulty || state.aiProfile?.difficulty || "normal";
    return AI_DIFFICULTY_LABELS[difficulty] ? difficulty : "normal";
  }

  function chooseAiAction() {
    const difficulty = tallyAiDifficultyKey();
    const aiSide = controlledSide("ai");
    const moves = collectMoveActionsForActor("ai");
    const flips = collectFlipActions();
    if (difficulty === "normal" && Math.random() < 0.36) {
      return chooseRandomAction([...moves, ...flips]);
    }

    const topSpread = difficulty === "hard" ? 2 : difficulty === "normal" ? 3 : 1;
    const tacticalMoves = moves.filter((action) => action.target.exit || action.captured);
    const tactical = chooseTopScored(tacticalMoves, (action) => scoreAiMove(action, aiSide), topSpread);
    if (tactical) return tactical;

    const flipChance = difficulty === "expert" || difficulty === "boss" ? 0.62 : 0.78;
    if (flips.length && (!state.finalMode || moves.length === 0 || Math.random() < flipChance)) {
      return chooseTopScored(flips, scoreAiFlip, topSpread);
    }

    return chooseTopScored(moves, (action) => scoreAiMove(action, aiSide), topSpread)
      || chooseTopScored(flips, scoreAiFlip, topSpread);
  }

  function runDelayedAiAction(action) {
    state.aiTimer = window.setTimeout(() => {
      state.aiTimer = 0;
      if (!isAiTurn() || state.finished) return;
      state.aiActing = false;
      if (action.type === "flip") {
        flipTile(action.row, action.col);
      } else {
        moveSelectedTo(action.target);
      }
    }, AI_ACTION_DELAY_MS);
  }

  function performAiTurn() {
    state.aiTimer = 0;
    if (!isAiTurn()) return;

    const action = chooseAiAction();
    if (!action) {
      finishGame("AI가 움직일 수 없습니다.");
      return;
    }

    state.aiActing = true;
    if (action.type === "flip") {
      state.selected = { row: action.row, col: action.col };
    } else {
      state.selected = { ...action.from };
    }
    renderTally();
    runDelayedAiAction(action);
  }

  function scheduleAiTurn(delay = AI_THINK_DELAY_MS) {
    clearAiTurnTimer();
    if (!isAiTurn() || !document.body.classList.contains("tally-active")) return;
    state.aiTimer = window.setTimeout(performAiTurn, delay);
  }

  function maybeStartFinalMode() {
    if (state.finalMode || faceDownCount() > 0) return;
    state.finalMode = true;
    state.finalJustStarted = true;
    state.finalTurns = { blue: 5, brown: 5 };
    log("모든 타일이 공개되었습니다. 각자 5턴씩 남았습니다.");
    toast("마지막 5턴 시작", 1400);
  }

  function assignSidesFromRevealedTile(tile) {
    if (sidesAssigned() || !tile || tile.side === "neutral") return;
    const actor = state.currentActor;
    const otherActor = opponentActor(actor);
    state.actorSides[actor] = tile.side;
    state.actorSides[otherActor] = opponent(tile.side);
    state.sideActors[tile.side] = actor;
    state.sideActors[opponent(tile.side)] = otherActor;
    state.currentSide = tile.side;
    log(`${actorLabel(actor)}는 ${SIDES[tile.side].label}, ${actorLabel(otherActor)}는 ${SIDES[opponent(tile.side)].label}입니다.`);
    toast(`${actorLabel(actor)}: ${SIDES[tile.side].label}`, 1500);
  }

  function finishGame(reason = "") {
    clearAiTurnTimer();
    state.finished = true;
    state.selected = null;
    const blue = state.scores.blue;
    const brown = state.scores.brown;
    const winnerSide = blue === brown ? "" : blue > brown ? "blue" : "brown";
    const winner = !winnerSide
      ? "무승부"
      : sidesAssigned()
        ? `${sideOwnerLabel(winnerSide)} 승리`
        : `${SIDES[winnerSide].label} 승리`;
    log(`${winner}. ${blue}:${brown}${reason ? ` · ${reason}` : ""}`);
    toast(winner, 1800);
    renderTally();
    submitTallyLeaderboardScore(winnerSide);
  }

  function checkEndAfterAction() {
    if (state.finished) return true;

    if (faceDownCount() === 0 && (coloredTilesOnBoard("blue") === 0 || coloredTilesOnBoard("brown") === 0)) {
      finishGame("한쪽 색 타일이 모두 사라졌습니다.");
      return true;
    }

    maybeStartFinalMode();

    return false;
  }

  function endTallyTurn() {
    if (state.finished) return;
    if (checkEndAfterAction()) return;

    if (state.finalMode) {
      if (state.finalJustStarted) {
        state.finalJustStarted = false;
      } else if (state.currentSide) {
        state.finalTurns[state.currentSide] = Math.max(0, state.finalTurns[state.currentSide] - 1);
      }
      if (state.finalTurns.blue <= 0 && state.finalTurns.brown <= 0) {
        finishGame("마지막 턴 종료");
        return;
      }
    }

    setCurrentActor(opponentActor());
    state.turnNumber += 1;
    state.turnSequence += 1;
    state.selected = null;

    if (!hasAnyActionForActor(state.currentActor)) {
      finishGame(`${currentSideLabel()}이 움직일 수 없습니다.`);
      return;
    }

    renderTally();
    scheduleAiTurn();
  }

  function flipTile(row, col) {
    const tile = state.board[row]?.[col];
    if (!tile || tile.faceUp || state.finished) return;
    tile.faceUp = true;
    assignSidesFromRevealedTile(tile);
    lockNeutralForOpponent(tile);
    state.selected = { row, col };
    log(`${currentSideLabel()}: ${tileMeta(tile).label} 공개`);
    endTallyTurn();
  }

  function captureTile(side, tile) {
    state.scores[side] += tile.value;
    state.captured[side].push(tile);
  }

  function moveSelectedTo(target) {
    if (!state.selected || state.finished) return;
    const from = state.selected;
    const tile = state.board[from.row][from.col];
    if (!tile) return;

    if (target.exit) {
      state.board[from.row][from.col] = null;
      captureTile(state.currentSide, tile);
      log(`${currentSideLabel()}: ${tileMeta(tile).label} 탈출 +${tile.value}`);
      endTallyTurn();
      return;
    }

    const captured = state.board[target.row][target.col];
    state.board[from.row][from.col] = null;
    state.board[target.row][target.col] = tile;
    if (tile.side !== "neutral") {
      tile.lastFrom = { row: from.row, col: from.col };
      tile.lastFromTurn = state.turnSequence;
    }

    if (captured) {
      captureTile(state.currentSide, captured);
      log(`${currentSideLabel()}: ${tileMeta(tile).label} → ${tileMeta(captured).label} +${captured.value}`);
    } else {
      log(`${currentSideLabel()}: ${tileMeta(tile).label} 이동`);
    }
    endTallyTurn();
  }

  function handleCellClick(row, col) {
    if (state.finished || isAiTurn()) return;
    const target = selectedTargets().find((entry) => entry.row === row && entry.col === col && !entry.exit);
    if (target) {
      moveSelectedTo(target);
      return;
    }

    const blockedReason = explainBlockedTarget(row, col);
    if (blockedReason) {
      toast(blockedReason, 1800);
      return;
    }

    const tile = state.board[row]?.[col];
    if (!tile) {
      state.selected = null;
      renderTally();
      return;
    }

    if (!tile.faceUp) {
      flipTile(row, col);
      return;
    }

    if (!canSelectMovableTile(tile)) {
      toast(tile.side === "neutral" ? "이번 차례에는 이 타일을 움직일 수 없습니다." : "내 차례에는 상대 타일을 움직일 수 없습니다.", 1400);
      return;
    }

    state.selected = { row, col };
    renderTally();
  }

  function handleFlipButton() {
    if (isAiTurn()) return;
    const selected = state.selected;
    if (!selected) return;
    flipTile(selected.row, selected.col);
  }

  function handleExitButton() {
    if (isAiTurn()) return;
    const exitTarget = selectedTargets().find((target) => target.exit);
    if (exitTarget) moveSelectedTo(exitTarget);
  }

  function openTallyRules() {
    if (typeof els.rulesDialog?.showModal === "function" && !els.rulesDialog.open) {
      els.rulesDialog.showModal();
    }
  }

  function pieceMarkup(tile) {
    if (!tile.faceUp) {
      return `
        <span class="tally-piece-mark">
          <span class="tally-piece-art" aria-hidden="true"></span>
          <span class="sr-only">뒷면 타일</span>
        </span>
      `;
    }
    const meta = tileMeta(tile);
    return `
      <span class="tally-piece-mark">
        <span class="tally-piece-art" aria-hidden="true"></span>
        <span class="tally-piece-value">${tile.value}</span>
        <span class="sr-only">${meta.label}</span>
      </span>
    `;
  }

  function renderBoard() {
    if (!els.board) return;
    const selected = state.selected;
    const targets = selectedTargets();
    const targetMap = new Map(targets.filter((target) => !target.exit).map((target) => [target.key, target]));
    const aiTurn = isAiTurn();
    els.board.classList.toggle("ai-thinking", aiTurn);
    els.board.innerHTML = "";

    for (let row = 0; row < SIZE; row += 1) {
      for (let col = 0; col < SIZE; col += 1) {
        const tile = state.board[row][col];
        const cell = document.createElement("button");
        const target = targetMap.get(keyOf(row, col));
        const selectedHere = Boolean(selected && selected.row === row && selected.col === col);
        cell.type = "button";
        cell.className = "tally-cell";
        cell.dataset.row = String(row);
        cell.dataset.col = String(col);
        if (isExitCell(row, col)) cell.classList.add("exit");
        if (!tile) {
          cell.classList.add("empty");
          cell.setAttribute("aria-label", "빈칸");
        } else {
          const selectable = !aiTurn && !state.finished && (!tile.faceUp || canSelectMovableTile(tile));
          const tileEl = document.createElement("span");
          const typeClass = tile.faceUp ? ` ${tile.type}` : "";
          const directionClass = tile.faceUp && tile.type === "hunter" ? ` dir-${tile.dir}` : "";
          tileEl.className = `tally-tile ${tile.faceUp ? tile.side : "face-down"}${typeClass}${directionClass}`;
          tileEl.innerHTML = pieceMarkup(tile);
          cell.append(tileEl);
          if (selectable) cell.classList.add("selectable");
          cell.setAttribute("aria-label", tile.faceUp ? tileMeta(tile).label : "뒷면 타일");
        }
        if (selectedHere) cell.classList.add("selected");
        if (target) cell.classList.add(target.capture ? "capture-target" : "legal-target");
        cell.addEventListener("click", () => handleCellClick(row, col));
        els.board.append(cell);
      }
    }
  }

  function capturedMarkup(side) {
    return state.captured[side].slice(-18).map((tile) => (
      `<span class="tally-captured-chip ${tile.type}" title="${tileMeta(tile).label} ${tile.value}점"><span class="tally-captured-art" aria-hidden="true"></span><span>${tile.value}</span></span>`
    )).join("");
  }

  function sideFallbackAvatar(side) {
    return side === "blue" ? "assets/tally-ho/tiles/bear.webp" : "assets/tally-ho/tiles/hunter.webp";
  }

  function actorAvatar(actor) {
    if (actor === "human") return HUMAN_PROFILE.avatarUrl;
    if (actor === "ai") return state.aiProfile?.avatarUrl || profileImageUrl("보통-건일.jpg");
    return "";
  }

  function updateSideCard(side) {
    const owner = state.sideActors[side] || "";
    const ownerName = owner ? actorLabel(owner) : "미정";
    const avatar = actorAvatar(owner) || sideFallbackAvatar(side);
    const ownerLabel = side === "blue" ? els.blueOwnerLabel : els.brownOwnerLabel;
    const teamLabel = side === "blue" ? els.blueTeamLabel : els.brownTeamLabel;
    const piecesLabel = side === "blue" ? els.bluePieces : els.brownPieces;
    const avatarElement = side === "blue" ? els.blueOwnerAvatar : els.brownOwnerAvatar;
    if (ownerLabel) ownerLabel.textContent = `${SIDES[side].label} · ${ownerName}`;
    if (teamLabel) teamLabel.textContent = SIDES[side].colorLabel;
    if (piecesLabel) piecesLabel.textContent = SIDES[side].pieces;
    if (avatarElement) avatarElement.src = avatar;
  }

  function renderStatus() {
    if (els.blueScore) els.blueScore.textContent = `${state.scores.blue}점`;
    if (els.brownScore) els.brownScore.textContent = `${state.scores.brown}점`;
    updateSideCard("blue");
    updateSideCard("brown");
    if (els.blueCaptured) els.blueCaptured.innerHTML = capturedMarkup("blue");
    if (els.brownCaptured) els.brownCaptured.innerHTML = capturedMarkup("brown");
    els.blueCard?.classList.toggle("active", state.currentSide === "blue" && !state.finished);
    els.brownCard?.classList.toggle("active", state.currentSide === "brown" && !state.finished);
    if (els.turnLabel) {
      els.turnLabel.textContent = state.finished
        ? "게임 종료"
        : `${currentSideLabel()} ${isAiTurn() ? "생각 중" : "차례"} / ${state.turnNumber}턴`;
    }
    if (els.phaseLabel) {
      els.phaseLabel.textContent = state.finalMode
        ? `마지막 턴 파랑 ${state.finalTurns.blue} · 갈색 ${state.finalTurns.brown}`
        : `뒷면 ${faceDownCount()}장`;
    }
  }

  function renderSelected() {
    const tile = selectedTile();
    if (!els.selectedPanel) return;
    if (isAiTurn() && !tile) {
      els.selectedPanel.innerHTML = `
        <span>AI</span>
        <strong>생각 중</strong>
        <small>잠시 후 자동으로 진행합니다.</small>
      `;
    } else if (!tile) {
      els.selectedPanel.innerHTML = `
        <span>선택</span>
        <strong>타일을 선택하세요</strong>
        <small>뒤집거나 이동할 수 있습니다.</small>
      `;
    } else if (!tile.faceUp) {
      els.selectedPanel.innerHTML = `
        <span>선택</span>
        <strong>뒷면 타일</strong>
        <small>뒤집으면 차례가 넘어갑니다.</small>
      `;
    } else {
      const meta = tileMeta(tile);
      const targets = selectedTargets();
      els.selectedPanel.innerHTML = `
        <span>${meta.side === "neutral" ? "중립" : sideDisplayLabel(meta.side)}</span>
        <strong>${meta.label} ${tile.value}점</strong>
        <small>${targets.length ? `${targets.length}곳 이동 가능` : "이동할 곳 없음"}${tile.type === "hunter" ? ` · ${DIR_BY_KEY.get(tile.dir).label}쪽` : ""}</small>
      `;
    }

    const selected = state.selected;
    const canFlip = Boolean(selected && state.board[selected.row]?.[selected.col] && !state.board[selected.row][selected.col].faceUp && !state.finished && !isAiTurn());
    const exitTarget = selectedTargets().find((target) => target.exit);
    if (els.flipButton) els.flipButton.disabled = !canFlip;
    if (els.exitButton) els.exitButton.disabled = !exitTarget || state.finished || isAiTurn();
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

  function renderTally() {
    renderStatus();
    renderBoard();
    renderSelected();
    renderLog();
  }

  els.enterButton?.addEventListener("click", enterTallyHo);
  els.backButton?.addEventListener("click", leaveTallyHo);
  els.newGameButton?.addEventListener("click", startTallyGame);
  els.startButton?.addEventListener("click", startTallyGame);
  els.confirmNicknameButton?.addEventListener("click", (event) => {
    const force = consumeNicknameForceChangeClick(event);
    if (force === null) return;
    confirmTallyNicknameChange(els.nameInput, { force });
  });
  els.difficultySelect?.addEventListener("change", () => {
    renderTallySetup();
  });
  els.refreshLeaderboardButton?.addEventListener("click", loadTallyLeaderboard);
  els.rulesButton?.addEventListener("click", openTallyRules);
  els.zoomOutButton?.addEventListener("click", () => adjustTallyZoom(-ZOOM_STEP_PERCENT));
  els.zoomInButton?.addEventListener("click", () => adjustTallyZoom(ZOOM_STEP_PERCENT));
  els.rulesDialog?.addEventListener("click", (event) => {
    if (event.target === els.rulesDialog) {
      els.rulesDialog.close();
    }
  });
  els.flipButton?.addEventListener("click", handleFlipButton);
  els.exitButton?.addEventListener("click", handleExitButton);
  initializeTallyZoomControls();

  window.TallyHoGame = {
    enter: enterTallyHo,
    leave: leaveTallyHo,
    reset: resetTallyGame
  };
})();
