// ── RARE EDGE — API FUNCTIONS ────────────────────────────────

// Main odds fetch — server proxy with direct fallback
async function fetchOdds(sport, markets = "spreads,totals,h2h") {
  const url = `${API_BASE}?sport=${encodeURIComponent(sport)}&markets=${encodeURIComponent(markets)}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Odds API ${r.status}`);
  const data = await r.json();
  if (data.fallback) throw new Error("Proxy blocked");
  return data;
}

// Parse a raw odds game object into our format
function parseGame(g, sportLabel) {
  const book  = g.bookmakers?.[0];
  const spread = book?.markets?.find(m => m.key === "spreads");
  const total  = book?.markets?.find(m => m.key === "totals");
  const h2h    = book?.markets?.find(m => m.key === "h2h");

  const homeSpread = spread?.outcomes?.find(o => o.name === g.home_team);
  const awaySpread = spread?.outcomes?.find(o => o.name === g.away_team);
  const homeH2H   = h2h?.outcomes?.find(o => o.name === g.home_team);
  const awayH2H   = h2h?.outcomes?.find(o => o.name === g.away_team);
  const totalOut  = total?.outcomes?.[0];

  const d = new Date(g.commence_time);
  const time = d.toLocaleString("en-US", { weekday:"short", month:"short", day:"numeric", hour:"numeric", minute:"2-digit" });

  // Multi-book odds
  const books = (g.bookmakers || []).slice(0, 4).map(b => {
    const sp = b.markets?.find(m => m.key === "spreads");
    const to = b.markets?.find(m => m.key === "totals");
    return {
      book:   b.title,
      spread: sp?.outcomes?.find(o => o.name === g.home_team)?.point,
      total:  to?.outcomes?.[0]?.point,
    };
  }).filter(b => b.spread !== undefined || b.total !== undefined);

  return {
    id:          g.id,
    home:        g.home_team,
    away:        g.away_team,
    time,
    rawStart:    g.commence_time,
    sportLabel,
    vegasSpread: homeSpread?.point,
    vegasTotal:  totalOut?.point,
    homeML:      homeH2H?.price,
    awayML:      awayH2H?.price,
    spreadPrice: homeSpread?.price,
    books,
  };
}

// Fetch player props for a game
async function fetchProps(sport, gameId) {
  const mktMap = {
    "nfl":   "player_pass_tds,player_rush_yds,player_reception_yds,player_anytime_td",
    "nba":   "player_points,player_rebounds,player_assists,player_threes",
    "wnba":  "player_points,player_rebounds,player_assists",
    "nhl":   "player_goals,player_assists,player_shots_on_goal",
    "mlb":   "player_strikeouts,player_hits,player_home_runs",
    "ncaaf": "player_pass_tds,player_rush_yds,player_reception_yds",
  };
  const mkt = mktMap[sport] || "player_points";
  const r = await fetch(`${API_BASE}?sport=${sport}&gameId=${gameId}&type=props&markets=${mkt}`);
  if (!r.ok) return null;
  return r.json();
}

// Soccer odds
async function fetchSoccer(leagueId) {
  return fetchOdds(leagueId, "h2h,spreads,totals");
}

// Golf events
async function fetchGolfEvents() {
  try {
    const r = await fetch(`${API_BASE}?sport=sports-list`);
    const data = await r.json();
    return (Array.isArray(data) ? data : []).filter(s => s.group === "Golf" && s.active);
  } catch { return []; }
}

async function fetchGolfOdds(sportKey) {
  return fetchOdds(sportKey, "outrights");
}

// Tennis events
async function fetchTennisEvents() {
  try {
    const r = await fetch(`${API_BASE}?sport=sports-list`);
    const data = await r.json();
    return (Array.isArray(data) ? data : []).filter(s => s.group === "Tennis" && s.active && !s.has_outrights);
  } catch { return []; }
}

// MMA
async function fetchMMA() {
  return fetchOdds("mma_mixed_martial_arts", "h2h");
}

// Fetch live/final scores for a sport
async function fetchScores(sport) {
  try {
    const r = await fetch(`/api/scores?sport=${sport}`);
    if (!r.ok) return [];
    return r.json();
  } catch { return []; }
}
async function fetchCollegeBaseball() {
  try { return await fetchOdds("baseball_ncaa", "spreads,totals,h2h"); }
  catch { return []; }
}
async function fetchCollegeSoftball() {
  try { return await fetchOdds("softball_ncaa", "spreads,totals,h2h"); }
  catch { return []; }
}

// Fetch live MLB pitcher + team form data
async function fetchMLBLive() {
  try {
    const r = await fetch("/api/mlb");
    if (!r.ok) return [];
    return r.json();
  } catch(err) { return []; }
}

// Fetch live NBA team stats
async function fetchNBALive() {
  try {
    const r = await fetch("/api/nba");
    if (!r.ok) return {};
    return r.json();
  } catch(err) { return {}; }
}

// Fetch live WNBA team stats
async function fetchWNBALive() {
  try {
    const r = await fetch("/api/wnba");
    if (!r.ok) return {};
    return r.json();
  } catch(err) { return {}; }
}
