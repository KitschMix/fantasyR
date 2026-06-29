(function () {
  "use strict";

  const SIZE = 7;
  const CENTER = 3;
  const SIDES = {
    blue: { label: "파랑", opponent: "brown" },
    brown: { label: "갈색", opponent: "blue" }
  };
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
    currentSide: "blue",
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
    const tiles = createTileBag();
    state.board = Array.from({ length: SIZE }, () => Array.from({ length: SIZE }, () => null));
    for (let row = 0; row < SIZE; row += 1) {
      for (let col = 0; col < SIZE; col += 1) {
        if (row === CENTER && col === CENTER) continue;
        state.board[row][col] = tiles.pop() || null;
      }
    }
    state.currentSide = "blue";
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
    state.log = ["게임 시작. 파랑부터 진행합니다."];
    renderTally();
  }

  function enterTallyHo() {
    document.body.classList.remove("launcher-active", "clue-active");
    document.body.classList.add("tally-active");
    els.panel?.classList.remove("hidden");
    if (!state.started) resetTallyGame();
    renderTally();
  }

  function leaveTallyHo() {
    document.body.classList.add("launcher-active");
    document.body.classList.remove("tally-active");
    els.panel?.classList.add("hidden");
  }

  function isExitCell(row, col) {
    return EXIT_CELLS.has(keyOf(row, col));
  }

  function currentSideLabel() {
    return SIDES[state.currentSide].label;
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
    return Boolean(tile?.lockedFor === state.currentSide && tile.lockedTurn === state.turnSequence);
  }

  function lockNeutralForOpponent(tile) {
    if (!isNeutralMover(tile)) return;
    tile.lockedFor = opponent();
    tile.lockedTurn = state.turnSequence + 1;
  }

  function canSelectMovableTile(tile) {
    if (!tile || !tile.faceUp || state.finished) return false;
    if (tile.type === "tree") return false;
    if (isLockedForCurrentSide(tile)) return false;
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
    return Boolean(tile?.side !== "neutral" && tile.lastFrom && tile.lastFrom.row === row && tile.lastFrom.col === col);
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
    const previousSide = state.currentSide;
    state.currentSide = side;
    const hasAction = canCurrentSideFlip() || state.board.some((row, rowIndex) => (
      row.some((tile, colIndex) => canSelectMovableTile(tile) && legalTargetsFor(rowIndex, colIndex).length > 0)
    ));
    state.currentSide = previousSide;
    return hasAction;
  }

  function maybeStartFinalMode() {
    if (state.finalMode || faceDownCount() > 0) return;
    state.finalMode = true;
    state.finalJustStarted = true;
    state.finalTurns = { blue: 5, brown: 5 };
    log("모든 타일이 공개되었습니다. 각자 5턴씩 남았습니다.");
    toast("마지막 5턴 시작", 1400);
  }

  function finishGame(reason = "") {
    state.finished = true;
    state.selected = null;
    const blue = state.scores.blue;
    const brown = state.scores.brown;
    const winner = blue === brown ? "무승부" : blue > brown ? "파랑 승리" : "갈색 승리";
    log(`${winner}. ${blue}:${brown}${reason ? ` · ${reason}` : ""}`);
    toast(winner, 1800);
    renderTally();
  }

  function checkEndAfterAction() {
    if (state.finished) return true;
    maybeStartFinalMode();

    if (faceDownCount() === 0 && (coloredTilesOnBoard("blue") === 0 || coloredTilesOnBoard("brown") === 0)) {
      finishGame("한쪽 색 타일이 모두 사라졌습니다.");
      return true;
    }

    return false;
  }

  function endTallyTurn() {
    if (state.finished) return;
    if (checkEndAfterAction()) return;

    if (state.finalMode) {
      if (state.finalJustStarted) {
        state.finalJustStarted = false;
      } else {
        state.finalTurns[state.currentSide] = Math.max(0, state.finalTurns[state.currentSide] - 1);
      }
      if (state.finalTurns.blue <= 0 && state.finalTurns.brown <= 0) {
        finishGame("마지막 턴 종료");
        return;
      }
    }

    state.currentSide = opponent();
    state.turnNumber += 1;
    state.turnSequence += 1;
    state.selected = null;

    if (!hasAnyActionFor(state.currentSide)) {
      finishGame(`${currentSideLabel()}이 움직일 수 없습니다.`);
      return;
    }

    renderTally();
  }

  function flipTile(row, col) {
    const tile = state.board[row]?.[col];
    if (!tile || tile.faceUp || state.finished) return;
    tile.faceUp = true;
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
    tile.lastFrom = { row: from.row, col: from.col };
    lockNeutralForOpponent(tile);

    if (captured) {
      captureTile(state.currentSide, captured);
      log(`${currentSideLabel()}: ${tileMeta(tile).label} → ${tileMeta(captured).label} +${captured.value}`);
    } else {
      log(`${currentSideLabel()}: ${tileMeta(tile).label} 이동`);
    }
    endTallyTurn();
  }

  function handleCellClick(row, col) {
    if (state.finished) return;
    const target = selectedTargets().find((entry) => entry.row === row && entry.col === col && !entry.exit);
    if (target) {
      moveSelectedTo(target);
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

    state.selected = { row, col };
    renderTally();
  }

  function handleFlipButton() {
    const selected = state.selected;
    if (!selected) return;
    flipTile(selected.row, selected.col);
  }

  function handleExitButton() {
    const exitTarget = selectedTargets().find((target) => target.exit);
    if (exitTarget) moveSelectedTo(exitTarget);
  }

  function pieceMarkup(tile) {
    if (!tile.faceUp) return "<span>?</span>";
    const meta = tileMeta(tile);
    const dir = tile.type === "hunter" ? DIR_BY_KEY.get(tile.dir) : null;
    return `
      <span class="tally-piece-mark">
        <span class="tally-piece-name">${meta.label}</span>
        ${dir ? `<span class="tally-piece-dir">${dir.mark}</span>` : ""}
        <span class="tally-piece-value">${tile.value}</span>
      </span>
    `;
  }

  function renderBoard() {
    if (!els.board) return;
    const selected = state.selected;
    const targets = selectedTargets();
    const targetMap = new Map(targets.filter((target) => !target.exit).map((target) => [target.key, target]));
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
          const selectable = !state.finished && (!tile.faceUp || canSelectMovableTile(tile));
          const tileEl = document.createElement("span");
          tileEl.className = `tally-tile ${tile.faceUp ? tile.side : "face-down"} ${tile.type}`;
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
      `<span class="tally-captured-chip" title="${tileMeta(tile).label} ${tile.value}점">${tileMeta(tile).label[0]}${tile.value}</span>`
    )).join("");
  }

  function renderStatus() {
    if (els.blueScore) els.blueScore.textContent = `${state.scores.blue}점`;
    if (els.brownScore) els.brownScore.textContent = `${state.scores.brown}점`;
    els.blueCaptured.innerHTML = capturedMarkup("blue");
    els.brownCaptured.innerHTML = capturedMarkup("brown");
    els.blueCard?.classList.toggle("active", state.currentSide === "blue" && !state.finished);
    els.brownCard?.classList.toggle("active", state.currentSide === "brown" && !state.finished);
    if (els.turnLabel) els.turnLabel.textContent = state.finished ? "게임 종료" : `${currentSideLabel()} / ${state.turnNumber}턴`;
    if (els.phaseLabel) {
      els.phaseLabel.textContent = state.finalMode
        ? `마지막 턴 파랑 ${state.finalTurns.blue} · 갈색 ${state.finalTurns.brown}`
        : `뒷면 ${faceDownCount()}장`;
    }
  }

  function renderSelected() {
    const tile = selectedTile();
    if (!els.selectedPanel) return;
    if (!tile) {
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
        <span>${meta.side === "neutral" ? "중립" : SIDES[meta.side].label}</span>
        <strong>${meta.label} ${tile.value}점</strong>
        <small>${targets.length ? `${targets.length}곳 이동 가능` : "이동할 곳 없음"}${tile.type === "hunter" ? ` · ${DIR_BY_KEY.get(tile.dir).label}쪽` : ""}</small>
      `;
    }

    const selected = state.selected;
    const canFlip = Boolean(selected && state.board[selected.row]?.[selected.col] && !state.board[selected.row][selected.col].faceUp && !state.finished);
    const exitTarget = selectedTargets().find((target) => target.exit);
    if (els.flipButton) els.flipButton.disabled = !canFlip;
    if (els.exitButton) els.exitButton.disabled = !exitTarget || state.finished;
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
