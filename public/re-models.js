// ── RARE EDGE — PROJECTION MODELS ───────────────────────────

// Convert moneyline to implied probability (removes vig)
function mlToProb(ml) {
  if (!ml) return null;
  ml = parseFloat(ml);
  if (isNaN(ml)) return null;
  return ml > 0 ? 100 / (ml + 100) : Math.abs(ml) / (Math.abs(ml) + 100);
}

// Remove vig from two-sided market to get true implied probabilities
function removeVig(homeML, awayML) {
  const homeRaw = mlToProb(homeML);
  const awayRaw = mlToProb(awayML);
  if (!homeRaw || !awayRaw) return { homeTrue: 0.5, awayTrue: 0.5 };
  const total = homeRaw + awayRaw;
  return {
    homeTrue: homeRaw / total,
    awayTrue: awayRaw / total,
  };
}

// Blend model win% with Vegas implied probability
// Vegas is more accurate so we weight it 65/35
function blendWinProb(modelWin, vegasHomeML, vegasAwayML) {
  const { homeTrue } = removeVig(vegasHomeML, vegasAwayML);
  if (!vegasHomeML || !vegasAwayML) return modelWin;
  const blended = (modelWin * 0.35) + (homeTrue * 100 * 0.65);
  return Math.min(88, Math.max(12, Math.round(blended)));
}

// Spread to win probability (NFL/NBA standard conversion)
function spreadToWinProb(spread) {
  // Each point of spread ~2.8% win probability shift
  return 50 + (spread * -2.8);
}

// ── FOOTBALL PROJECTION ──────────────────────────────────────
function projectFootball(home, away, vegasSpread, vegasTotal, opts = {}) {
  const { homeAdv = HOME_ADV, restAdj = 0, injAdj = 0, homeML, awayML } = opts;
  if (!home || !away) return null;

  const rawSpread = (away.off - home.def) - (home.off - away.def) + homeAdv + restAdj + injAdj;
  const rawTotal  = ((home.off + away.off) + (home.def + away.def)) / 2;

  const projSpread = +rawSpread.toFixed(1);
  const projTotal  = +rawTotal.toFixed(1);

  const vSpread = vegasSpread ? +(projSpread - parseFloat(vegasSpread)).toFixed(1) : null;
  const vTotal  = vegasTotal  ? +(projTotal  - parseFloat(vegasTotal)).toFixed(1)  : null;

  // Model win% from projected spread
  const modelWin = spreadToWinProb(projSpread);
  // Blend with Vegas implied if moneyline available
  const homeWin = blendWinProb(modelWin, homeML, awayML);

  // Edge: our model disagrees with Vegas by meaningful amount
  const vegasHomeWin = homeML ? removeVig(homeML, awayML).homeTrue * 100 : null;
  const winProbEdge = vegasHomeWin ? +(homeWin - vegasHomeWin).toFixed(1) : null;
  const hasEdge = (Math.abs(vSpread || 0) >= EDGE_MIN) || (Math.abs(vTotal || 0) >= EDGE_MIN * 1.5) || (Math.abs(winProbEdge || 0) >= 5);

  return {
    projSpread, projTotal, vSpread, vTotal,
    homeWin, awayWin: 100 - homeWin,
    vegasHomeWin: vegasHomeWin ? Math.round(vegasHomeWin) : null,
    winProbEdge, hasEdge,
  };
}

// ── BASKETBALL PROJECTION ────────────────────────────────────
function projectBasketball(home, away, vegasSpread, vegasTotal, opts = {}) {
  const { homeAdv = 3.2, b2bHome = false, b2bAway = false, homeML, awayML } = opts;
  if (!home || !away) return null;

  const pace = (home.pace + away.pace) / 2;
  const homeOff = (home.ortg / 100) * pace;
  const homeDef = (away.ortg / 100) * pace * (home.drtg / 100);
  const awayOff = (away.ortg / 100) * pace;
  const awayDef = (home.ortg / 100) * pace * (away.drtg / 100);

  let homeScore = homeOff - homeDef / 2 + homeAdv;
  let awayScore = awayOff - awayDef / 2;
  if (b2bHome) homeScore -= 2.5;
  if (b2bAway) awayScore -= 2.5;

  homeScore = Math.max(80, Math.round(homeScore));
  awayScore = Math.max(80, Math.round(awayScore));

  const projSpread = +(homeScore - awayScore).toFixed(1);
  const projTotal  = +(homeScore + awayScore).toFixed(1);

  const vSpread = vegasSpread ? +(projSpread - parseFloat(vegasSpread)).toFixed(1) : null;
  const vTotal  = vegasTotal  ? +(projTotal  - parseFloat(vegasTotal)).toFixed(1)  : null;

  // Model win% from projected spread
  const modelWin = spreadToWinProb(projSpread);
  // Blend with Vegas implied probability
  const homeWin = blendWinProb(modelWin, homeML, awayML);

  const vegasHomeWin = homeML ? Math.round(removeVig(homeML, awayML).homeTrue * 100) : null;
  const winProbEdge = vegasHomeWin ? +(homeWin - vegasHomeWin).toFixed(1) : null;
  const hasEdge = (Math.abs(vSpread || 0) >= EDGE_MIN) || (Math.abs(vTotal || 0) >= EDGE_MIN * 1.5) || (Math.abs(winProbEdge || 0) >= 5);

  return {
    projSpread, projTotal, homeScore, awayScore, vSpread, vTotal,
    homeWin, awayWin: 100 - homeWin,
    vegasHomeWin, winProbEdge, hasEdge,
  };
}

// ── MLB PROJECTION ───────────────────────────────────────────
function projectBaseball(home, away, vegasTotal, opts = {}, liveData = null) {
  const { homeAdv = 0.3, parkFactor = 1.0, homeML, awayML } = opts;
  if (!home || !away) return null;

  const homePitcherEra  = liveData?.home?.pitcher?.era  ?? home.era;
  const awayPitcherEra  = liveData?.away?.pitcher?.era  ?? away.era;
  const homePitcherWhip = liveData?.home?.pitcher?.whip ?? home.whip;
  const awayPitcherWhip = liveData?.away?.pitcher?.whip ?? away.whip;

  const homeRuns = liveData?.home?.runsLast10
    ? (liveData.home.runsLast10 * 0.6 + home.runs * 0.4)
    : home.runs;
  const awayRuns = liveData?.away?.runsLast10
    ? (liveData.away.runsLast10 * 0.6 + away.runs * 0.4)
    : away.runs;

  const homeOpsAdj  = liveData?.home?.ops ? (liveData.home.ops / 0.710) : 1.0;
  const awayOpsAdj  = liveData?.away?.ops ? (liveData.away.ops / 0.710) : 1.0;
  const homeWhipAdj = 1 + (homePitcherWhip - 1.28) * 0.15;
  const awayWhipAdj = 1 + (awayPitcherWhip - 1.28) * 0.15;

  const homeRunsProj = (homeRuns * homeOpsAdj * (1 - awayPitcherEra / 9) * parkFactor + homeAdv) * awayWhipAdj;
  const awayRunsProj = (awayRuns * awayOpsAdj * (1 - homePitcherEra / 9) * parkFactor) * homeWhipAdj;

  const hScore    = Math.max(1, +homeRunsProj.toFixed(1));
  const aScore    = Math.max(1, +awayRunsProj.toFixed(1));
  const projTotal = +(hScore + aScore).toFixed(1);
  const vTotal    = vegasTotal ? +(projTotal - parseFloat(vegasTotal)).toFixed(1) : null;

  // Model win% from run differential
  const modelWin = 50 + ((hScore - aScore) * 8);
  // Blend with Vegas implied probability
  const homeWin = blendWinProb(modelWin, homeML, awayML);

  const vegasHomeWin = homeML ? Math.round(removeVig(homeML, awayML).homeTrue * 100) : null;
  const winProbEdge  = vegasHomeWin ? +(homeWin - vegasHomeWin).toFixed(1) : null;

  const homePitcherGrade = homePitcherEra <= 3.0 ? "ELITE" : homePitcherEra <= 3.75 ? "GOOD" : homePitcherEra <= 4.50 ? "AVG" : "WEAK";
  const awayPitcherGrade = awayPitcherEra <= 3.0 ? "ELITE" : awayPitcherEra <= 3.75 ? "GOOD" : awayPitcherEra <= 4.50 ? "AVG" : "WEAK";

  return {
    projTotal, hScore, aScore, vTotal,
    homeWin, awayWin: 100 - homeWin,
    vegasHomeWin, winProbEdge,
    hasEdge: Math.abs(vTotal || 0) >= 1.0 || Math.abs(winProbEdge || 0) >= 5,
    runLineEdge: hScore - aScore >= 1.5 ? "HOME RL" : aScore - hScore >= 1.5 ? "AWAY RL" : null,
    pitchers: liveData ? {
      home: { name: liveData.home?.pitcher?.name || "TBD", era: homePitcherEra, grade: homePitcherGrade },
      away: { name: liveData.away?.pitcher?.name || "TBD", era: awayPitcherEra, grade: awayPitcherGrade },
    } : null,
    formAdj: liveData ? {
      homeRunsLast10: liveData.home?.runsLast10,
      awayRunsLast10: liveData.away?.runsLast10,
    } : null,
  };
}

// ── HOCKEY PROJECTION ────────────────────────────────────────
function projectHockey(home, away, vegasTotal, opts = {}) {
  const { homeAdv = 0.18, homeML, awayML } = opts;
  if (!home || !away) return null;

  const hGoals = (home.gf * 0.55 + (1 - away.ga / 3.5) * 1.5) + homeAdv;
  const aGoals = (away.gf * 0.55 + (1 - home.ga / 3.5) * 1.5);

  const hScore    = Math.max(1.0, +hGoals.toFixed(2));
  const aScore    = Math.max(1.0, +aGoals.toFixed(2));
  const projTotal = +(hScore + aScore).toFixed(1);
  const vTotal    = vegasTotal ? +(projTotal - parseFloat(vegasTotal)).toFixed(1) : null;

  const modelWin = 50 + ((hScore - aScore) * 12);
  const homeWin  = blendWinProb(modelWin, homeML, awayML);

  const vegasHomeWin = homeML ? Math.round(removeVig(homeML, awayML).homeTrue * 100) : null;
  const winProbEdge  = vegasHomeWin ? +(homeWin - vegasHomeWin).toFixed(1) : null;

  return {
    projTotal, hScore, aScore, vTotal,
    homeWin, awayWin: 100 - homeWin,
    vegasHomeWin, winProbEdge,
    hasEdge: Math.abs(vTotal || 0) >= 0.5 || Math.abs(winProbEdge || 0) >= 5,
  };
}

// ── SOCCER PROJECTION ────────────────────────────────────────
function projectSoccer(homeImplied, awayImplied, drawImplied) {
  if (!homeImplied) return null;
  const total = homeImplied + awayImplied + drawImplied;
  const homeTrue = homeImplied / total;
  const awayTrue = awayImplied / total;
  const drawTrue = drawImplied / total;
  const hEdge = homeTrue - 0.35;
  const aEdge = awayTrue - 0.28;
  return {
    homeWin: Math.round(homeTrue * 100),
    awayWin: Math.round(awayTrue * 100),
    draw:    Math.round(drawTrue * 100),
    hEdge: +hEdge.toFixed(3),
    aEdge: +aEdge.toFixed(3),
    hasEdge: Math.abs(hEdge) >= 0.06 || Math.abs(aEdge) >= 0.06,
  };
}

// Find team data by partial name match
function findTeam(name, db) {
  if (!name || !db) return null;
  const last = name.split(" ").pop();
  return db[name] || Object.entries(db).find(([k]) =>
    k === last || k.includes(last) || name.includes(k)
  )?.[1] || null;
}

// Match live MLB data to a game by team name
function findMLBLiveData(homeName, awayName, mlbLive) {
  if (!mlbLive || !mlbLive.length) return null;
  return mlbLive.find(g => {
    const h  = g.homeName?.toLowerCase() || "";
    const a  = g.awayName?.toLowerCase() || "";
    const hn = homeName?.toLowerCase() || "";
    const an = awayName?.toLowerCase() || "";
    return (h.includes(hn.split(" ").pop()) || hn.includes(h.split(" ").pop())) &&
           (a.includes(an.split(" ").pop()) || an.includes(a.split(" ").pop()));
  }) || null;
}
