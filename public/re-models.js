// ── RARE EDGE — PROJECTION MODELS ───────────────────────────

// Football projection (NFL, NCAA, UFL)
function projectFootball(home, away, vegasSpread, vegasTotal, opts = {}) {
  const { homeAdv = HOME_ADV, restAdj = 0, injAdj = 0 } = opts;
  if (!home || !away) return null;

  const rawSpread = (away.off - home.def) - (home.off - away.def) + homeAdv + restAdj + injAdj;
  const rawTotal  = ((home.off + away.off) + (home.def + away.def)) / 2;

  const projSpread = +rawSpread.toFixed(1);
  const projTotal  = +rawTotal.toFixed(1);

  const vSpread = vegasSpread ? +(projSpread - parseFloat(vegasSpread)).toFixed(1) : null;
  const vTotal  = vegasTotal  ? +(projTotal  - parseFloat(vegasTotal)).toFixed(1)  : null;

  const homeWin = 50 + (projSpread * 2.8);
  return {
    projSpread, projTotal, vSpread, vTotal,
    homeWin: Math.min(85, Math.max(15, Math.round(homeWin))),
    awayWin: Math.min(85, Math.max(15, Math.round(100 - homeWin))),
    hasEdge: (Math.abs(vSpread || 0) >= EDGE_MIN) || (Math.abs(vTotal || 0) >= EDGE_MIN * 1.5),
  };
}

// Basketball projection (NBA, WNBA, NCAAB)
function projectBasketball(home, away, vegasSpread, vegasTotal, opts = {}) {
  const { homeAdv = 3.2, b2bHome = false, b2bAway = false } = opts;
  if (!home || !away) return null;

  const pace = (home.pace + away.pace) / 2;
  const homeOff = (home.ortg / 100) * pace;
  const homeDef = (away.ortg / 100) * pace * (home.drtg / 100);
  const awayOff = (away.ortg / 100) * pace;
  const awayDef = (home.ortg / 100) * pace * (away.drtg / 100);

  let homeScore = homeOff - homeDef/2 + homeAdv;
  let awayScore = awayOff - awayDef/2;
  if (b2bHome) homeScore -= 2.5;
  if (b2bAway) awayScore -= 2.5;

  homeScore = Math.max(80, Math.round(homeScore));
  awayScore = Math.max(80, Math.round(awayScore));
  const projSpread = +(homeScore - awayScore).toFixed(1);
  const projTotal  = +(homeScore + awayScore).toFixed(1);

  const vSpread = vegasSpread ? +(projSpread - parseFloat(vegasSpread)).toFixed(1) : null;
  const vTotal  = vegasTotal  ? +(projTotal  - parseFloat(vegasTotal)).toFixed(1)  : null;

  const homeWin = 50 + (projSpread * 3.1);
  return {
    projSpread, projTotal, homeScore, awayScore, vSpread, vTotal,
    homeWin: Math.min(88, Math.max(12, Math.round(homeWin))),
    awayWin: Math.min(88, Math.max(12, Math.round(100 - homeWin))),
    hasEdge: (Math.abs(vSpread || 0) >= EDGE_MIN) || (Math.abs(vTotal || 0) >= EDGE_MIN * 1.5),
  };
}

// ── MLB PROJECTION — LIVE PITCHER + FORM DATA ────────────────
// liveData: { home: { pitcher, runsLast10, ops, ... }, away: { ... } }
function projectBaseball(home, away, vegasTotal, opts = {}, liveData = null) {
  const { homeAdv = 0.3, parkFactor = 1.0 } = opts;
  if (!home || !away) return null;

  // Use live pitcher ERA if available, fall back to team ERA
  const homePitcherEra = liveData?.home?.pitcher?.era ?? home.era;
  const awayPitcherEra = liveData?.away?.pitcher?.era ?? away.era;
  const homePitcherWhip = liveData?.home?.pitcher?.whip ?? home.whip;
  const awayPitcherWhip = liveData?.away?.pitcher?.whip ?? away.whip;

  // Use last 10 games run average if available (weighted 60/40 with season)
  const homeRuns = liveData?.home?.runsLast10
    ? (liveData.home.runsLast10 * 0.6 + home.runs * 0.4)
    : home.runs;
  const awayRuns = liveData?.away?.runsLast10
    ? (liveData.away.runsLast10 * 0.6 + away.runs * 0.4)
    : away.runs;

  // OPS adjustment factor (league avg ~0.710)
  const homeOpsAdj = liveData?.home?.ops ? (liveData.home.ops / 0.710) : 1.0;
  const awayOpsAdj = liveData?.away?.ops ? (liveData.away.ops / 0.710) : 1.0;

  // WHIP adjustment (higher WHIP = more baserunners = more runs allowed)
  const homeWhipAdj = 1 + (homePitcherWhip - 1.28) * 0.15;
  const awayWhipAdj = 1 + (awayPitcherWhip - 1.28) * 0.15;

  // Core run projection
  const homeRunsProj = (homeRuns * homeOpsAdj * (1 - awayPitcherEra / 9) * parkFactor + homeAdv) * awayWhipAdj;
  const awayRunsProj = (awayRuns * awayOpsAdj * (1 - homePitcherEra / 9) * parkFactor) * homeWhipAdj;

  const hScore = Math.max(1, +homeRunsProj.toFixed(1));
  const aScore = Math.max(1, +awayRunsProj.toFixed(1));
  const projTotal = +(hScore + aScore).toFixed(1);
  const vTotal = vegasTotal ? +(projTotal - parseFloat(vegasTotal)).toFixed(1) : null;

  const homeWin = 50 + ((hScore - aScore) * 8);

  // Pitcher quality score for display
  const homePitcherGrade = homePitcherEra <= 3.0 ? "ELITE" : homePitcherEra <= 3.75 ? "GOOD" : homePitcherEra <= 4.50 ? "AVG" : "WEAK";
  const awayPitcherGrade = awayPitcherEra <= 3.0 ? "ELITE" : awayPitcherEra <= 3.75 ? "GOOD" : awayPitcherEra <= 4.50 ? "AVG" : "WEAK";

  return {
    projTotal, hScore, aScore, vTotal,
    homeWin: Math.min(82, Math.max(18, Math.round(homeWin))),
    awayWin: Math.min(82, Math.max(18, Math.round(100 - homeWin))),
    hasEdge: Math.abs(vTotal || 0) >= 1.0,
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

// Hockey projection (NHL)
function projectHockey(home, away, vegasTotal, opts = {}) {
  const { homeAdv = 0.18 } = opts;
  if (!home || !away) return null;

  const hGoals = (home.gf * 0.55 + (1 - away.ga / 3.5) * 1.5) + homeAdv;
  const aGoals = (away.gf * 0.55 + (1 - home.ga / 3.5) * 1.5);

  const hScore = Math.max(1.0, +hGoals.toFixed(2));
  const aScore = Math.max(1.0, +aGoals.toFixed(2));
  const projTotal = +(hScore + aScore).toFixed(1);
  const vTotal = vegasTotal ? +(projTotal - parseFloat(vegasTotal)).toFixed(1) : null;

  const homeWin = 50 + ((hScore - aScore) * 12);
  return {
    projTotal, hScore, aScore, vTotal,
    homeWin: Math.min(80, Math.max(20, Math.round(homeWin))),
    awayWin: Math.min(80, Math.max(20, Math.round(100 - homeWin))),
    hasEdge: Math.abs(vTotal || 0) >= 0.5,
  };
}

// Soccer projection
function projectSoccer(homeImplied, awayImplied, drawImplied) {
  if (!homeImplied) return null;
  const hEdge = homeImplied - 0.35;
  const aEdge = awayImplied - 0.28;
  return {
    homeWin: Math.round(homeImplied * 100),
    awayWin: Math.round(awayImplied * 100),
    draw:    Math.round(drawImplied * 100),
    hEdge: +hEdge.toFixed(3),
    aEdge: +aEdge.toFixed(3),
    hasEdge: Math.abs(hEdge) >= 0.06 || Math.abs(aEdge) >= 0.06,
  };
}

// Parse moneyline to implied probability
function mlToProb(ml) {
  if (!ml) return 0;
  ml = parseFloat(ml);
  return ml > 0 ? 100 / (ml + 100) : Math.abs(ml) / (Math.abs(ml) + 100);
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
    const h = g.homeName?.toLowerCase() || "";
    const a = g.awayName?.toLowerCase() || "";
    const hn = homeName?.toLowerCase() || "";
    const an = awayName?.toLowerCase() || "";
    return (h.includes(hn.split(" ").pop()) || hn.includes(h.split(" ").pop())) &&
           (a.includes(an.split(" ").pop()) || an.includes(a.split(" ").pop()));
  }) || null;
}
