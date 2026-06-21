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

// Dynamic blend: model carries more weight when it strongly disagrees with Vegas
// Sport weights — Vegas lines are softer on WNBA/NCAAB so model gets more say
const SPORT_MODEL_WEIGHT = {
  nfl:   0.35,
  nba:   0.38,
  wnba:  0.48, // Vegas WNBA lines are less sharp — model gets nearly equal say
  mlb:   0.38,
  nhl:   0.40,
  ncaaf: 0.42,
  ncaab: 0.45,
  default: 0.38,
};

function blendWinProb(modelWin, vegasHomeML, vegasAwayML, sport) {
  if (!vegasHomeML || !vegasAwayML) {
    const r = Math.round(modelWin);
    return (r >= 48 && r <= 52) ? 50 : Math.min(88, Math.max(12, r));
  }
  const { homeTrue } = removeVig(vegasHomeML, vegasAwayML);
  const vegasWin = homeTrue * 100;

  // Base model weight by sport
  let modelWeight = SPORT_MODEL_WEIGHT[sport] || SPORT_MODEL_WEIGHT.default;

  // Dynamic boost: if model and Vegas diverge by 10+ points, trust model more
  const divergence = Math.abs(modelWin - vegasWin);
  if (divergence >= 15) modelWeight = Math.min(modelWeight + 0.12, 0.60);
  else if (divergence >= 10) modelWeight = Math.min(modelWeight + 0.07, 0.55);

  const blended = (modelWin * modelWeight) + (vegasWin * (1 - modelWeight));

  // Dead zone: if blended lands 48-52%, no conviction — return exactly 50
  // so hasEdge logic can filter it out
  if (blended >= 48 && blended <= 52) return 50;

  return Math.min(88, Math.max(12, Math.round(blended)));
}

// Sport-calibrated spread to win probability
// Football: ~2.8% per point | Basketball: ~3.5% per point | Hockey: ~8% per goal
function spreadToWinProb(spread, sport) {
  const perUnit = {
    nfl:   2.8,
    ncaaf: 2.5,
    nba:   3.5,
    wnba:  3.8, // WNBA spreads are tighter, each point means more
    ncaab: 3.2,
    nhl:   8.0,
    default: 3.0,
  };
  const rate = perUnit[sport] || perUnit.default;
  return Math.min(85, Math.max(15, 50 + (spread * -rate)));
}

// ── FOOTBALL PROJECTION ──────────────────────────────────────
function projectFootball(home, away, vegasSpread, vegasTotal, opts = {}) {
  const { homeAdv = HOME_ADV, restAdj = 0, injAdj = 0, homeML, awayML, sport = "nfl" } = opts;
  if (!home || !away) return null;

  const rawSpread = (away.off - home.def) - (home.off - away.def) + homeAdv + restAdj + injAdj;
  const rawTotal  = ((home.off + away.off) + (home.def + away.def)) / 2;

  const projSpread = +rawSpread.toFixed(1);
  const projTotal  = +rawTotal.toFixed(1);

  const vSpread = vegasSpread ? +(projSpread - parseFloat(vegasSpread)).toFixed(1) : null;
  const vTotal  = vegasTotal  ? +(projTotal  - parseFloat(vegasTotal)).toFixed(1)  : null;

  const modelWin = spreadToWinProb(projSpread, sport);
  const homeWin  = blendWinProb(modelWin, homeML, awayML, sport);

  const vegasHomeWin = homeML ? removeVig(homeML, awayML).homeTrue * 100 : null;
  const winProbEdge  = vegasHomeWin ? +(homeWin - vegasHomeWin).toFixed(1) : null;

  // No edge if model is in dead zone (50% = no conviction)
  const hasEdge = homeWin !== 50 && (
    (Math.abs(vSpread || 0) >= EDGE_MIN) ||
    (Math.abs(vTotal  || 0) >= EDGE_MIN * 1.5) ||
    (Math.abs(winProbEdge || 0) >= 6)
  );

  return {
    projSpread, projTotal, vSpread, vTotal,
    homeWin, awayWin: 100 - homeWin,
    vegasHomeWin: vegasHomeWin ? Math.round(vegasHomeWin) : null,
    winProbEdge, hasEdge,
  };
}

// ── BASKETBALL PROJECTION ────────────────────────────────────
function projectBasketball(home, away, vegasSpread, vegasTotal, opts = {}) {
  const { homeAdv = 3.2, b2bHome = false, b2bAway = false, homeML, awayML, sport = "nba" } = opts;
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

  const modelWin = spreadToWinProb(projSpread, sport);
  const homeWin  = blendWinProb(modelWin, homeML, awayML, sport);

  const vegasHomeWin = homeML ? Math.round(removeVig(homeML, awayML).homeTrue * 100) : null;
  const winProbEdge  = vegasHomeWin ? +(homeWin - vegasHomeWin).toFixed(1) : null;

  const hasEdge = homeWin !== 50 && (
    (Math.abs(vSpread || 0) >= EDGE_MIN) ||
    (Math.abs(vTotal  || 0) >= EDGE_MIN * 1.5) ||
    (Math.abs(winProbEdge || 0) >= 6)
  );

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

  const modelWin = 50 + ((hScore - aScore) * 8);
  const homeWin  = blendWinProb(modelWin, homeML, awayML, "mlb");

  const vegasHomeWin = homeML ? Math.round(removeVig(homeML, awayML).homeTrue * 100) : null;
  const winProbEdge  = vegasHomeWin ? +(homeWin - vegasHomeWin).toFixed(1) : null;

  const homePitcherGrade = homePitcherEra <= 3.0 ? "ELITE" : homePitcherEra <= 3.75 ? "GOOD" : homePitcherEra <= 4.50 ? "AVG" : "WEAK";
  const awayPitcherGrade = awayPitcherEra <= 3.0 ? "ELITE" : awayPitcherEra <= 3.75 ? "GOOD" : awayPitcherEra <= 4.50 ? "AVG" : "WEAK";

  const projSpread = +(hScore - aScore).toFixed(1);
  return {
    projSpread, projTotal, hScore, aScore, vSpread: null, vTotal,
    homeWin, awayWin: 100 - homeWin,
    vegasHomeWin, winProbEdge,
    hasEdge: homeWin !== 50 && (Math.abs(vTotal || 0) >= 2.0) && (
      homePitcherEra < 3.75 || awayPitcherEra < 3.75 ||
      Math.abs(vTotal || 0) >= 3.0
    ),
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
  const homeWin  = blendWinProb(modelWin, homeML, awayML, "nhl");

  const vegasHomeWin = homeML ? Math.round(removeVig(homeML, awayML).homeTrue * 100) : null;
  const winProbEdge  = vegasHomeWin ? +(homeWin - vegasHomeWin).toFixed(1) : null;

  const projSpread = +(hScore - aScore).toFixed(2);
  return {
    projSpread, projTotal, hScore, aScore, vSpread: null, vTotal,
    homeWin, awayWin: 100 - homeWin,
    vegasHomeWin, winProbEdge,
    hasEdge: homeWin !== 50 && (Math.abs(vTotal || 0) >= 0.5 || Math.abs(winProbEdge || 0) >= 6),
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
