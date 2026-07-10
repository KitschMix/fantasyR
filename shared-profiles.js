(function () {
  "use strict";

  const HUMAN_PROFILE_STORAGE_KEY = "fantasyKingdom.humanProfile.v1";
  const NICKNAME_CHANGE_INTERVAL_MS = 24 * 60 * 60 * 1000;
  const MIN_NICKNAME_LENGTH = 2;
  const PROFILE_ASSET_ROOT = "assets/profiles/user";

  function profileImageUrl(fileName) {
    return encodeURI(`${PROFILE_ASSET_ROOT}/${fileName}`);
  }

  const AI_DIFFICULTY_LABELS = {
    easy: "쉬움",
    normal: "보통",
    hard: "어려움",
    expert: "매우어려움",
    boss: "최종보스",
    random: "완전랜덤"
  };
  const AI_PROFILE_DIFFICULTY_KEYS = ["easy", "normal", "hard", "expert", "boss"];
  const HUMAN_PROFILE = {
    name: "나",
    avatarUrl: profileImageUrl("유저.jpg")
  };
  const AI_PROFILE_GROUPS = {
    easy: [
      { name: "초보", avatarUrl: profileImageUrl("보통-건일.jpg") },
      { name: "연습", avatarUrl: profileImageUrl("보통-루나.jpg") },
      { name: "학습", avatarUrl: profileImageUrl("보통-이지.jpg") }
    ],
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
    ],
    boss: [
      { name: "마스터", avatarUrl: profileImageUrl("매우어려움-강범례.jpg") },
      { name: "전설", avatarUrl: profileImageUrl("매우어려움-변판길.jpg") },
      { name: "챔피언", avatarUrl: profileImageUrl("매우어려움-제갈혜정.jpg") }
    ]
  };

  window.FANTASY_SHARED_PROFILES = {
    root: PROFILE_ASSET_ROOT,
    human: HUMAN_PROFILE,
    difficultyLabels: AI_DIFFICULTY_LABELS,
    difficultyKeys: AI_PROFILE_DIFFICULTY_KEYS,
    groups: AI_PROFILE_GROUPS
  };

  window.FANTASY_SHARED_NICKNAME_RULES = {
    storageKey: HUMAN_PROFILE_STORAGE_KEY,
    intervalMs: NICKNAME_CHANGE_INTERVAL_MS,
    minLength: MIN_NICKNAME_LENGTH,
    blockedName: HUMAN_PROFILE.name
  };
})();
