(function () {
  "use strict";

  // The input contains only this detective's observations and public facts.
  // It deliberately has no solution or opponents' card identities.
  function analyze(view, difficulty) {
    const { cards, players, observerId, ownCards, knownCards, observations, evidence } = view;
    const envelope = 1 << players.length;
    const allOwners = (envelope << 1) - 1;
    const self = 1 << players.findIndex((p) => p.id === observerId);
    const index = new Map(cards.map((entry, i) => [entry.id, i]));
    const ownerBit = new Map(players.map((p, i) => [p.id, 1 << i]));
    const own = new Set(ownCards);
    const known = new Set(knownCards);
    const domains = cards.map((entry) => own.has(entry.id)
      ? self : (allOwners & ~self & (known.has(entry.id) ? ~envelope : allOwners)));
    for (const [cardId, ownerId] of observations) {
      const i = index.get(cardId);
      if (i !== undefined && ownerBit.has(ownerId)) domains[i] &= ownerBit.get(ownerId);
    }
    const clauses = [];
    for (const record of evidence) {
      const ids = record.cardIds.map((id) => index.get(id));
      for (const playerId of record.passedIds) {
        for (const i of ids) domains[i] &= ~ownerBit.get(playerId);
      }
      if (record.refuterId) clauses.push({ ids, bit: ownerBit.get(record.refuterId) });
    }
    const types = ["suspect", "weapon", "room"];
    const typeIndices = types.map((type) => cards.flatMap((c, i) => c.type === type ? [i] : []));
    const quotas = players.map((p, i) => ({
      ids: cards.map((_, j) => j), bit: 1 << i, count: p.cardCount
    })).concat(typeIndices.map((ids) => ({ ids, bit: envelope, count: 1 })));

    function propagate(values) {
      let changed = true;
      const narrow = (i, mask) => {
        const next = values[i] & mask;
        if (next !== values[i]) { values[i] = next; changed = true; }
      };
      while (changed) {
        changed = false;
        if (values.some((value) => !value)) return false;
        for (const { ids, bit, count } of quotas) {
          const possible = ids.filter((i) => values[i] & bit);
          const fixed = possible.filter((i) => values[i] === bit);
          if (fixed.length > count || possible.length < count) return false;
          if (fixed.length === count) {
            possible.filter((i) => values[i] !== bit).forEach((i) => narrow(i, ~bit));
          } else if (possible.length === count) possible.forEach((i) => narrow(i, bit));
        }
        for (const { ids, bit } of clauses) {
          const possible = ids.filter((i) => values[i] & bit);
          if (!possible.length) return false;
          if (possible.length === 1) narrow(possible[0], bit);
        }
      }
      return !values.some((value) => !value);
    }

    // Boss checks hypothetical ownership assignments more deeply. Exhausting the
    // shared work budget means "unknown", never "impossible" or "proven".
    let budget = 2400;
    function feasible(values) {
      if (--budget < 0) return null;
      if (!propagate(values)) return false;
      let next = -1;
      let size = Infinity;
      values.forEach((value, i) => {
        const count = value.toString(2).replaceAll("0", "").length;
        if (count > 1 && count < size) { next = i; size = count; }
      });
      if (next < 0) return true;
      for (let bit = 1; bit <= envelope; bit <<= 1) {
        if (!(values[next] & bit)) continue;
        const branch = values.slice();
        branch[next] = bit;
        const result = feasible(branch);
        if (result !== false) return result;
      }
      return false;
    }

    if (!propagate(domains)) return { combos: [], domains, inconsistent: true };
    const candidates = typeIndices.map((ids) => ids.filter((i) => domains[i] & envelope));
    const combos = [];
    for (const suspect of candidates[0]) for (const weapon of candidates[1]) for (const room of candidates[2]) {
      const ids = [suspect, weapon, room];
      if (difficulty !== "hard") {
        const hypothetical = domains.slice();
        ids.forEach((i) => { hypothetical[i] = envelope; });
        if (!propagate(hypothetical)) continue;
        if (difficulty === "boss" && feasible(hypothetical) === false) continue;
      }
      combos.push({ suspect: cards[suspect], weapon: cards[weapon], room: cards[room] });
    }
    return { combos, domains, inconsistent: !combos.length };
  }

  function researchPlan(view, combos, rooms, difficulty) {
    if (combos.length <= 1) return { gain: 0, suggestion: null };
    const own = new Set(view.ownCards);
    const types = ["suspect", "weapon", "room"];
    let best = { gain: 0, suggestion: null };
    for (const room of rooms) {
      for (const suspect of view.cards.filter((c) => c.type === "suspect")) {
        for (const weapon of view.cards.filter((c) => c.type === "weapon")) {
          const suggestion = { suspect, weapon, room };
          const partitions = new Map();
          combos.forEach((combo) => {
            const key = types.map((type) => combo[type].id === suggestion[type].id ? "1" : "0").join("");
            partitions.set(key, (partitions.get(key) || 0) + 1);
          });
          // A response does not reveal all three cards. Discount the potential
          // split unless our own cards act as controls for a targeted question.
          const controls = types.filter((type) => own.has(suggestion[type].id)).length;
          const split = 1 - [...partitions.values()].reduce((sum, n) => sum + n * n, 0) / (combos.length ** 2);
          const repetitions = view.evidence.filter((entry) => entry.playerId === view.observerId
            && types.every((type) => entry.cardIds.includes(suggestion[type].id))).length;
          const gain = split * (0.3 + Math.min(2, controls) * 0.35) / (1 + repetitions);
          if (gain > best.gain) best = { gain, suggestion };
        }
      }
    }
    // Hard uses a coarser estimate; expert/boss use the full estimate.
    if (difficulty === "hard") best.gain *= 0.8;
    return best;
  }

  function opponentRisk(view, combos) {
    let survival = 1;
    for (const opponent of view.players) {
      if (opponent.id === view.observerId || opponent.eliminated) continue;
      let risk = opponent.location === "clue" ? 0.5 : 0.05;
      const latest = view.evidence.filter((e) => e.playerId === opponent.id && e.complete).slice(-1)[0];
      if (latest && !latest.refuterId && combos.some((c) =>
        [c.suspect.id, c.weapon.id, c.room.id].every((id) => latest.cardIds.includes(id)))) risk = Math.max(risk, 0.7);
      survival *= 1 - risk;
    }
    return Math.min(0.9, 1 - survival);
  }

  function decide(view, combos, plan) {
    if (!combos.length) return { accuse: false, confidence: 0, risk: 0, waitValue: 0 };
    // Equal weight is a decision heuristic, not a calibrated posterior.
    const confidence = 1 / combos.length;
    const risk = opponentRisk(view, combos);
    const waitValue = (confidence + plan.gain * (1 - confidence)) * (1 - risk);
    return { accuse: combos.length === 1 || (combos.length <= 4 && confidence >= waitValue), confidence, risk, waitValue };
  }

  window.ClueAI = { analyze, researchPlan, opponentRisk, decide };
})();
