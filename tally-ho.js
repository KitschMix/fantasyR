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

  const els = {
    enterButton: document.querySelector("#enterTallyHoButton"),
    panel: document.querySelector("#tallyHoPanel"),
    backButton: document.querySelector("#tallyBackButton"),
    newGameButton: document.querySelector("#tallyNewGameButton"),
    board: document.querySelector("#tallyBoard"),
    blueScore: document.querySelector("#tallyBlueScore"),
    brownScore: document.querySelector("#tallyBrownScore"),
    blueCard: document.querySelector("#tallyBlueCard"),
    brownCard: document.querySelector("#tallyBrownCard"),
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
    aiTimer: 0,
    aiActing: false,
    log: []
  };

  function shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
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

  function resetTallyGame() {
    clearAiTurnTimer();
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
    state.aiActing = false;
    state.log = ["게임 시작. 먼저 공개된 유색 타일로 진영이 정해집니다."];
    renderTally();
    scheduleAiTurn();
  }

  function enterTallyHo() {
    document.body.classList.remove("launcher-active", "clue-active");
    document.body.classList.add("tally-active");
    els.panel?.classList.remove("hidden");
    if (!state.started) resetTallyGame();
    renderTally();
    scheduleAiTurn();
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

  function chooseTopScored(actions, scoreFn) {
    if (!actions.length) return null;
    return [...actions]
      .map((action) => ({ action, score: scoreFn(action) }))
      .sort((left, right) => right.score - left.score)[0].action;
  }

  function chooseAiAction() {
    const aiSide = controlledSide("ai");
    const moves = collectMoveActionsForActor("ai");
    const tacticalMoves = moves.filter((action) => action.target.exit || action.captured);
    const tactical = chooseTopScored(tacticalMoves, (action) => scoreAiMove(action, aiSide));
    if (tactical) return tactical;

    const flips = collectFlipActions();
    if (flips.length && (!state.finalMode || moves.length === 0 || Math.random() < 0.72)) {
      return chooseTopScored(flips, scoreAiFlip);
    }

    return chooseTopScored(moves, (action) => scoreAiMove(action, aiSide))
      || chooseTopScored(flips, scoreAiFlip);
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

  function renderStatus() {
    if (els.blueScore) els.blueScore.textContent = `${state.scores.blue}점`;
    if (els.brownScore) els.brownScore.textContent = `${state.scores.brown}점`;
    const blueLabel = els.blueCard?.querySelector("span");
    const brownLabel = els.brownCard?.querySelector("span");
    const blueSmall = els.blueCard?.querySelector("small");
    const brownSmall = els.brownCard?.querySelector("small");
    if (blueLabel) blueLabel.textContent = `${SIDES.blue.label} · ${sideOwnerLabel("blue")}`;
    if (brownLabel) brownLabel.textContent = `${SIDES.brown.label} · ${sideOwnerLabel("brown")}`;
    if (blueSmall) blueSmall.textContent = SIDES.blue.pieces;
    if (brownSmall) brownSmall.textContent = SIDES.brown.pieces;
    els.blueCaptured.innerHTML = capturedMarkup("blue");
    els.brownCaptured.innerHTML = capturedMarkup("brown");
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
  els.newGameButton?.addEventListener("click", resetTallyGame);
  els.flipButton?.addEventListener("click", handleFlipButton);
  els.exitButton?.addEventListener("click", handleExitButton);

  window.TallyHoGame = {
    enter: enterTallyHo,
    leave: leaveTallyHo,
    reset: resetTallyGame
  };
})();
