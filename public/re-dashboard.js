// ── EDGE TRACK RECORD BANNER ─────────────────────────────────
function EdgeTrackRecord() {
  const [record, setRecord] = useState(null);

  useEffect(() => {
    fetch("/api/edge-log")
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const wins   = data.filter(e => e.result === "win").length;
        const losses = data.filter(e => e.result === "loss").length;
        const pushes = data.filter(e => e.result === "push").length;
        const total  = wins + losses + pushes;
        const hitRate = total > 0 ? Math.round((wins / (wins + losses)) * 100) : null;
        setRecord({ wins, losses, pushes, total, hitRate, recent: data.slice(0, 5) });
      })
      .catch(() => {});
  }, []);

  if (!record || record.total === 0) return null;

  return (
    <div style={{ background:"rgba(200,245,74,0.04)", border:"1px solid rgba(200,245,74,0.12)", borderRadius:"12px", padding:"12px 14px", marginBottom:"16px" }}>
      <div style={{ fontSize:"9px", color:"#c8f54a", letterSpacing:"2px", fontWeight:"700", marginBottom:"8px" }}>⚡ RARE EDGE TRACK RECORD · LAST 50 CALLS</div>
      <div style={{ display:"flex", gap:"10px", marginBottom:"10px" }}>
        <div style={{ textAlign:"center", flex:1 }}>
          <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"28px", color:"#c8f54a", lineHeight:1 }}>{record.wins}</div>
          <div style={{ fontSize:"9px", color:"#555", letterSpacing:"1px" }}>WINS</div>
        </div>
        <div style={{ textAlign:"center", flex:1 }}>
          <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"28px", color:"#ef4444", lineHeight:1 }}>{record.losses}</div>
          <div style={{ fontSize:"9px", color:"#555", letterSpacing:"1px" }}>LOSSES</div>
        </div>
        {record.pushes > 0 && (
          <div style={{ textAlign:"center", flex:1 }}>
            <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"28px", color:"#aaa", lineHeight:1 }}>{record.pushes}</div>
            <div style={{ fontSize:"9px", color:"#555", letterSpacing:"1px" }}>PUSHES</div>
          </div>
        )}
        {record.hitRate !== null && (
          <div style={{ textAlign:"center", flex:1 }}>
            <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"28px", color: record.hitRate >= 55 ? "#c8f54a" : record.hitRate >= 50 ? "#aaa" : "#ef4444", lineHeight:1 }}>{record.hitRate}%</div>
            <div style={{ fontSize:"9px", color:"#555", letterSpacing:"1px" }}>HIT RATE</div>
          </div>
        )}
      </div>
      {/* Recent calls */}
      <div style={{ display:"flex", gap:"4px", flexWrap:"wrap" }}>
        {record.recent.map((e, i) => (
          <div key={i} style={{
            fontSize:"9px", padding:"2px 6px", borderRadius:"4px", fontWeight:"700",
            background: e.result === "win" ? "rgba(200,245,74,0.12)" : e.result === "loss" ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.06)",
            color: e.result === "win" ? "#c8f54a" : e.result === "loss" ? "#ef4444" : "#555"
          }}>
            {e.sport} {e.away?.split(" ").pop()}@{e.home?.split(" ").pop()} {e.result === "win" ? "✓" : e.result === "loss" ? "✗" : "·"}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── DASHBOARD GAME CARD ──────────────────────────────────────
function DashboardCard({ game, isPremium, index, scoreData, mlbLive, movement, eloRatings }) {
  const [open, setOpen] = useState(false);

  const score = scoreData?.find(s => {
    if (s.id === game.id) return true;
    const hMatch = s.home_team === game.home || s.home_team?.includes(game.home?.split(" ").pop()) || game.home?.includes(s.home_team?.split(" ").pop());
    const aMatch = s.away_team === game.away || s.away_team?.includes(game.away?.split(" ").pop()) || game.away?.includes(s.away_team?.split(" ").pop());
    if (!hMatch || !aMatch) return false;
    // Only match if game times are within 8 hours of each other
    const timeDiff = Math.abs(new Date(s.commence_time) - new Date(game.rawStart));
    return timeDiff < 8 * 60 * 60 * 1000;
  });
  const isLive  = score?.completed === false && score?.scores?.length > 0;
  const isFinal = score?.completed === true || game.completed === true;
  const homeScore = score?.scores?.find(s => s.name === game.home || game.home?.includes(s.name?.split(" ").pop()))?.score ?? game.scoreHome;
  const awayScore = score?.scores?.find(s => s.name === game.away || game.away?.includes(s.name?.split(" ").pop()))?.score ?? game.scoreAway;

  const liveData = game.sportLabel?.toLowerCase() === "mlb"
    ? findMLBLiveData(game.home, game.away, mlbLive)
    : null;

  const proj = useMemo(() => {
    const sp = game.sportLabel?.toLowerCase();

    // Elo-enhanced team lookup: blend static ratings with Elo when available
    const getTeamWithElo = (name, staticDb, ratingFields) => {
      const base = findTeam(name, staticDb);
      if (!base) return null;
      const shortName = name?.split(" ").pop();
      const eloEntry = eloRatings?.[name] || eloRatings?.[shortName];
      if (!eloEntry || eloEntry.wins + eloEntry.losses < 5) return base; // need 5+ games
      // Convert Elo to rating adjustment
      const eloDiff = eloEntry.elo - 1500;
      if (ratingFields === "basketball") {
        return { ...base, ortg: base.ortg + eloDiff * 0.02, drtg: base.drtg - eloDiff * 0.02 };
      }
      if (ratingFields === "baseball") {
        return { ...base, runs: base.runs + eloDiff * 0.003, era: base.era - eloDiff * 0.003 };
      }
      if (ratingFields === "football") {
        return { ...base, off: base.off + eloDiff * 0.02, def: base.def - eloDiff * 0.02 };
      }
      return base;
    };

    if (sp === "nfl" || sp === "ncaaf" || sp === "ufl") {
      const db = sp === "ufl" ? UFL : NFL;
      return projectFootball(getTeamWithElo(game.home, db, "football"), getTeamWithElo(game.away, db, "football"), game.vegasSpread, game.vegasTotal, { homeML: game.homeML, awayML: game.awayML });
    }
    if (sp === "nba" || sp === "ncaab") return projectBasketball(getTeamWithElo(game.home, NBA, "basketball"), getTeamWithElo(game.away, NBA, "basketball"), game.vegasSpread, game.vegasTotal, { homeML: game.homeML, awayML: game.awayML });
    if (sp === "wnba") return projectBasketball(getTeamWithElo(game.home, WNBA, "basketball"), getTeamWithElo(game.away, WNBA, "basketball"), game.vegasSpread, game.vegasTotal, { homeAdv:2.5, homeML: game.homeML, awayML: game.awayML });
    if (sp === "mlb") return projectBaseball(getTeamWithElo(game.home, MLB, "baseball"), getTeamWithElo(game.away, MLB, "baseball"), game.vegasTotal, { parkFactor: findTeam(game.home, MLB)?.park || 1.0, homeML: game.homeML, awayML: game.awayML }, liveData);
    if (sp === "nhl") return projectHockey(findTeam(game.home, NHL), findTeam(game.away, NHL), game.vegasTotal, { homeML: game.homeML, awayML: game.awayML });
    return null;
  }, [game, liveData, eloRatings]);

  const hasEdge = proj?.hasEdge;
  const sportKey = game.sportLabel?.toLowerCase().replace("/", "_").replace(" ", "_") || "nfl";

  // Send push notification for UPCOMING edge games
  useEffect(() => {
    if (!hasEdge || !isPremium || isFinal || isLive) return;
    // Only notify for games starting in the next 3 hours
    const gameStart = new Date(game.rawStart).getTime();
    const now = Date.now();
    const hoursUntilGame = (gameStart - now) / (1000 * 60 * 60);
    if (hoursUntilGame < 0 || hoursUntilGame > 3) return;
    // Send push notification
    fetch("/api/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "notify",
        notification: {
          title: `⚡ RARE EDGE — ${game.sportLabel} Edge`,
          body: `${game.away} @ ${game.home} · ${Math.round(hoursUntilGame * 60)}min · ${proj?.vTotal ? `Total edge: ${proj.vTotal > 0 ? "+" : ""}${proj.vTotal}` : `Spread edge: ${proj?.vSpread > 0 ? "+" : ""}${proj?.vSpread}`}`,
          data: { url: "https://arareedge.com/app" }
        }
      })
    }).catch(() => {});
  }, [hasEdge, game.id]);

  // Auto-log edge calls to Supabase — FINAL games only
  useEffect(() => {
    if (!hasEdge || !isPremium || !isFinal || !homeScore || !awayScore) return;
    const tz = "America/Chicago";
    const today = new Date().toLocaleDateString("en-US", { timeZone: tz });
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString("en-US", { timeZone: tz });
    const gameDate = new Date(game.rawStart).toLocaleDateString("en-US", { timeZone: tz });
    if (gameDate !== today && gameDate !== yesterdayStr) return;
    fetch("/api/edge-log", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sport: game.sportLabel,
        home: game.home,
        away: game.away,
        game_date: gameDate,
        proj_total: proj?.projTotal || null,
        vegas_total: game.vegasTotal || null,
        edge_value: proj?.vTotal || proj?.vSpread || null,
        edge_type: proj?.vTotal ? "total" : "spread",
      })
    }).catch(() => {});
  }, [hasEdge, isFinal, homeScore, awayScore]);

  // Update Elo ratings when game goes final
  useEffect(() => {
    if (!isFinal || !homeScore || !awayScore) return;
    const sp = game.sportLabel?.toLowerCase();
    if (!["mlb","nba","wnba","nhl","nfl"].includes(sp)) return;
    fetch("/api/elo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sport: sp,
        homeTeam: game.home,
        awayTeam: game.away,
        homeScore: parseFloat(homeScore),
        awayScore: parseFloat(awayScore),
      })
    }).catch(() => {});
  }, [isFinal, hasEdge, homeScore, awayScore]);

  // Auto-update result when game is final
  useEffect(() => {
    if (!isFinal || !hasEdge || !homeScore || !awayScore) return;
    const tz = "America/Chicago";
    const today2 = new Date().toLocaleDateString("en-US", { timeZone: tz });
    const yest2 = new Date(); yest2.setDate(yest2.getDate() - 1);
    const yesterdayStr2 = yest2.toLocaleDateString("en-US", { timeZone: tz });
    const gameDate2 = new Date(game.rawStart).toLocaleDateString("en-US", { timeZone: tz });
    if (gameDate2 !== today2 && gameDate2 !== yesterdayStr2) return;
    const actualTotal = parseFloat(homeScore) + parseFloat(awayScore);
    const projTotal = proj?.projTotal;
    const vegasTotal = game.vegasTotal;
    if (!projTotal || !vegasTotal) return;

    // Determine win/loss: did our over/under call hit?
    const ourCall = projTotal > vegasTotal ? "over" : "under";
    const actualCall = actualTotal > vegasTotal ? "over" : actualTotal < vegasTotal ? "under" : "push";
    const result = actualCall === "push" ? "push" : ourCall === actualCall ? "win" : "loss";

    // Find the edge call and update it
    fetch(`/api/edge-log?home=eq.${encodeURIComponent(game.home)}&away=eq.${encodeURIComponent(game.away)}&game_date=eq.${encodeURIComponent(gameDate2)}&select=id`)
      .then(r => r.json())
      .then(rows => {
        if (rows[0]?.id) {
          fetch("/api/edge-log", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: rows[0].id, result })
          }).catch(() => {});
        }
      }).catch(() => {});
  }, [isFinal, homeScore, awayScore]);

  return (
    <div onClick={() => setOpen(true)} style={{
      borderRadius:"12px",
      border: hasEdge && isPremium ? "1px solid rgba(200,245,74,0.28)" : "1px solid rgba(255,255,255,0.07)",
      background: hasEdge && isPremium ? "rgba(200,245,74,0.03)" : "rgba(255,255,255,0.02)",
      overflow:"hidden", cursor:"pointer",
      animation:`fadeIn 0.3s ease ${index * 0.03}s both`,
      marginBottom:"10px"
    }}>
      {hasEdge && isPremium && (
        <div style={{ padding:"5px 14px", background:"rgba(200,245,74,0.10)", borderBottom:"1px solid rgba(200,245,74,0.15)", fontSize:"10px", color:"#c8f54a", letterSpacing:"2px", fontWeight:"700" }}>
          ⚡ EDGE DETECTED
        </div>
      )}
      {hasEdge && !isPremium && (
        <div style={{ padding:"5px 14px", background:"rgba(200,245,74,0.04)", borderBottom:"1px solid rgba(200,245,74,0.08)", fontSize:"10px", color:"#555", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span>🔒 Edge detected</span>
          <button onClick={e => { e.stopPropagation(); startCheckout("monthly"); }} style={{ background:"#c8f54a", border:"none", borderRadius:"6px", padding:"2px 8px", fontSize:"9px", fontWeight:"700", cursor:"pointer", color:"#000" }}>UPGRADE</button>
        </div>
      )}

      <div style={{ padding:"12px 14px" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"8px" }}>
          <div style={{ fontSize:"9px", color:"#444" }}>{game.sportLabel} · {game.time}</div>
          {isLive  && <div style={{ fontSize:"9px", color:"#c8f54a", fontWeight:"700", letterSpacing:"1px", background:"rgba(200,245,74,0.12)", padding:"2px 6px", borderRadius:"4px", display:"flex", alignItems:"center", gap:"4px" }}><span style={{ display:"inline-block", width:"6px", height:"6px", borderRadius:"50%", background:"#c8f54a", animation:"pulse 1.2s ease-in-out infinite" }} />LIVE</div>}
          {isFinal && <div style={{ fontSize:"9px", color:"#555", fontWeight:"700", letterSpacing:"1px" }}>FINAL</div>}
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:"12px", color:"#666", marginBottom:"3px" }}>{game.away} {isFinal || isLive ? <span style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"16px", color: isFinal ? "#aaa" : "#c8f54a" }}>{awayScore}</span> : ""}</div>
            <div style={{ fontSize:"14px", color:"#ccc", fontWeight:"600" }}>{game.home} {isFinal || isLive ? <span style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"16px", color: isFinal ? "#aaa" : "#c8f54a" }}>{homeScore}</span> : ""}</div>
          </div>
          <div style={{ display:"flex", gap:"6px" }}>
            {game.vegasSpread != null && <StatPill label="SPREAD" val={`${game.vegasSpread > 0 ? "+" : ""}${game.vegasSpread}`} />}
            {game.vegasTotal  != null && <StatPill label="O/U"    val={game.vegasTotal} />}
            {proj && <StatPill label="WIN%" val={`${proj.homeWin}%`} />}
            {proj && isPremium && proj.vSpread != null && <StatPill label="EDGE" val={`${proj.vSpread > 0 ? "+" : ""}${proj.vSpread}`} color={Math.abs(proj.vSpread) >= EDGE_MIN ? "#c8f54a" : "#555"} />}
            {proj && !isPremium && <StatPill label="EDGE" val="🔒" />}
          </div>
        </div>
        {/* MLB pitcher info on dashboard */}
        {liveData && isPremium && proj?.pitchers && (
          <div style={{ marginTop:"8px", display:"flex", gap:"6px", fontSize:"9px", color:"#555" }}>
            <span>{proj.pitchers.away.name} ({proj.pitchers.away.era?.toFixed(2)})</span>
            <span style={{ color:"#333" }}>vs</span>
            <span>{proj.pitchers.home.name} ({proj.pitchers.home.era?.toFixed(2)})</span>
          </div>
        )}
        {/* Line movement — premium only */}
        {isPremium && movement && !!(movement.spreadMove || movement.totalMove || movement.mlMove) && (
          <div style={{ marginTop:"8px", display:"flex", gap:"6px", flexWrap:"wrap" }}>
            {movement.spreadMove != null && movement.spreadMove !== 0 && (
              <div style={{ fontSize:"9px", padding:"2px 7px", borderRadius:"4px", background: movement.isSharp ? "rgba(200,245,74,0.10)" : "rgba(255,255,255,0.04)", color: movement.isSharp ? "#c8f54a" : "#555" }}>
                {movement.isSharp ? "⚡ " : ""}SPREAD {movement.firstSpread > 0 ? "+" : ""}{movement.firstSpread} → {movement.latestSpread > 0 ? "+" : ""}{movement.latestSpread}
              </div>
            )}
            {movement.totalMove != null && movement.totalMove !== 0 && movement.firstTotal != null && (
              <div style={{ fontSize:"9px", padding:"2px 7px", borderRadius:"4px", background:"rgba(255,255,255,0.04)", color:"#555" }}>
                O/U {movement.firstTotal} → {movement.latestTotal}
              </div>
            )}
            {movement.isSharp && (
              <div style={{ fontSize:"9px", padding:"2px 7px", borderRadius:"4px", background:"rgba(200,245,74,0.10)", color:"#c8f54a", fontWeight:"700" }}>
                SHARP MONEY
              </div>
            )}
          </div>
        )}
      </div>

      {open && ReactDOM.createPortal(
        <GameDetailModal game={game} sport={sportKey} isPremium={isPremium} onClose={() => setOpen(false)} proj={proj} />,
        document.body
      )}
    </div>
  );
}

// ── DASHBOARD TAB ────────────────────────────────────────────
const DASH_SPORTS = [
  { id:"americanfootball_nfl",  label:"NFL",   emoji:"🏈" },
  { id:"basketball_nba",        label:"NBA",   emoji:"🏀" },
  { id:"baseball_mlb",          label:"MLB",   emoji:"⚾" },
  { id:"basketball_wnba",       label:"WNBA",  emoji:"🏀" },
  { id:"icehockey_nhl",         label:"NHL",   emoji:"🏒" },
  { id:"americanfootball_ncaaf",label:"NCAAF", emoji:"🏈" },
  { id:"basketball_ncaab",      label:"NCAAB", emoji:"🏀" },
  { id:"soccer_usa_mls",        label:"MLS",   emoji:"⚽" },
  { id:"soccer_epl",            label:"EPL",   emoji:"⚽" },
];

function DashboardTab({ isPremium }) {
  const today = new Date();
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  // dates: yesterday + today + next 4 days
  const dates = [-1, 0, 1, 2, 3, 4].map(i => { const d = new Date(today); d.setDate(d.getDate() + i); return d; });
  const [selectedDate, setSelectedDate] = useState(today);
  const [allGames, setAllGames]         = useState([]);
  const [scores, setScores]             = useState({});
  const [mlbLive, setMlbLive]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState("all");
  const [lastUpdated, setLastUpdated]   = useState(null);
  const [lineMovement, setLineMovement] = useState({});
  const [eloRatings, setEloRatings]     = useState({});
  const [clvData, setClvData]           = useState(null);
  const [oddsGames, setOddsGames]       = useState([]);

  // Fetch scores every 5 minutes
  useEffect(() => {
    const fetchAllScores = () => {
      DASH_SPORTS.forEach(s => {
        fetchScores(s.id).then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setScores(prev => ({ ...prev, [s.id]: data }));
          }
        }).catch(() => {});
      });
    };
    fetchAllScores();
    const interval = setInterval(fetchAllScores, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Merge odds + scores whenever either changes
  useEffect(() => {
    const tz = "America/Chicago";
    const todayStr     = new Date().toLocaleDateString("en-US", { timeZone: tz });
    const yestDate     = new Date(); yestDate.setDate(yestDate.getDate() - 1);
    const yesterdayStr = yestDate.toLocaleDateString("en-US", { timeZone: tz });
    const allScores = Object.values(scores).flat();
    const scored = allScores
      .filter(s => s.completed)
      .filter(s => {
        // Only merge completed games - date filtering handled by display useMemo
        const gStr = new Date(s.commence_time).toLocaleDateString("en-US", { timeZone: tz });
        return gStr === todayStr || gStr === yesterdayStr;
      })
      .filter(s => !oddsGames.some(g => {
        const homeMatch = g.home === s.home_team || (g.home && s.home_team && g.home.includes(s.home_team.split(" ").pop()));
        const awayMatch = g.away === s.away_team || (g.away && s.away_team && g.away.includes(s.away_team.split(" ").pop()));
        if (!homeMatch || !awayMatch) return false;
        const timeDiff = Math.abs(new Date(g.rawStart) - new Date(s.commence_time));
        return timeDiff < 8 * 60 * 60 * 1000;
      }))
      .map(s => ({
        id: s.id,
        home: s.home_team,
        away: s.away_team,
        rawStart: s.commence_time,
        gameDate: new Date(s.commence_time).toLocaleDateString("en-US", { timeZone: tz }),
        time: new Date(s.commence_time).toLocaleString("en-US", { timeZone: tz }),
        sportLabel: DASH_SPORTS.find(d => (scores[d.id] || []).some(x => x.id === s.id))?.label || "MLB",
        completed: true,
        scoreHome: s.scores?.find(x => x.name === s.home_team)?.score,
        scoreAway: s.scores?.find(x => x.name === s.away_team)?.score,
      }));
    if (oddsGames.length > 0 || scored.length > 0) {
      setAllGames([...oddsGames, ...scored]);
    }
  }, [oddsGames, scores]);

  // Fetch live MLB data — retry up to 3 times
  useEffect(() => {
    let attempts = 0;
    const tryFetch = () => {
      fetchMLBLive()
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setMlbLive(data);
          } else if (attempts < 3) {
            attempts++;
            setTimeout(tryFetch, 3000);
          }
        })
        .catch(() => {
          if (attempts < 3) { attempts++; setTimeout(tryFetch, 3000); }
        });
    };
    tryFetch();
  }, []);

  // Fetch line movement data every 30 mins
  useEffect(() => {
    const fetchMovement = () => {
      fetch("/api/line-movement")
        .then(r => r.json())
        .then(data => { if (data && typeof data === "object") setLineMovement(data); })
        .catch(() => {});
    };
    fetchMovement();
    const interval = setInterval(fetchMovement, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Elo ratings once on mount
  useEffect(() => {
    fetch("/api/elo")
      .then(r => r.json())
      .then(data => { if (data && typeof data === "object") setEloRatings(data); })
      .catch(() => {});
  }, []);

  // Fetch CLV analysis once on mount
  useEffect(() => {
    fetch("/api/closing-line")
      .then(r => r.json())
      .then(data => { if (data?.summary) setClvData(data); })
      .catch(() => {});
  }, []);

  // Fetch odds once on mount, merge completed games from scores
  useEffect(() => {
    setLoading(true);
    Promise.all(
      DASH_SPORTS.map(s =>
        fetchOdds(s.id, "spreads,totals,h2h")
          .then(data => (data || []).map(g => ({ ...parseGame(g, s.label) })))
          .catch(() => [])
      )
    ).then(results => {
      const now = Date.now();
      const games = results.flat().filter(g => {
        // Keep games that started within last 36 hours or are in the future
        const start = new Date(g.rawStart).getTime();
        const gDateStr = new Date(g.rawStart).toLocaleDateString('en-US', { timeZone: 'America/Chicago' }); const todayChicago = new Date().toLocaleDateString('en-US', { timeZone: 'America/Chicago' }); const tomorrowD = new Date(); tomorrowD.setDate(tomorrowD.getDate()+1); const tomorrowChicago = tomorrowD.toLocaleDateString('en-US', { timeZone: 'America/Chicago' }); const dayAfterD = new Date(); dayAfterD.setDate(dayAfterD.getDate()+2); const dayAfterChicago = dayAfterD.toLocaleDateString('en-US', { timeZone: 'America/Chicago' }); const dayAfter2D = new Date(); dayAfter2D.setDate(dayAfter2D.getDate()+3); const dayAfter2Chicago = dayAfter2D.toLocaleDateString('en-US', { timeZone: 'America/Chicago' }); const dayAfter3D = new Date(); dayAfter3D.setDate(dayAfter3D.getDate()+4); const dayAfter3Chicago = dayAfter3D.toLocaleDateString('en-US', { timeZone: 'America/Chicago' }); return [todayChicago, tomorrowChicago, dayAfterChicago, dayAfter2Chicago, dayAfter3Chicago].includes(gDateStr);
      });
      setOddsGames(games);
      // Save line snapshots for movement tracking
      if (games.length > 0) {
        fetch("/api/line-movement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ games })
        }).catch(() => {});
      }
      setLastUpdated(new Date().toLocaleTimeString());
    }).finally(() => setLoading(false));
  }, []);

  const display = useMemo(() => {
    const tz = "America/Chicago";
    const sel = selectedDate.toLocaleDateString("en-US", { timeZone: tz });
    return allGames
      .filter(g => {
        const gDate = g.gameDate || new Date(g.rawStart).toLocaleDateString("en-US", { timeZone: tz });
        if (gDate !== sel) return false;
        // Extra check: if viewing Today, exclude completed games from yesterday
        if (sel === new Date().toLocaleDateString("en-US", { timeZone: tz })) {
          const yest = new Date(); yest.setDate(yest.getDate() - 1);
          const yStr = yest.toLocaleDateString("en-US", { timeZone: tz });
          if (gDate === yStr) return false;
        }
        return true;
      })
      .filter(g => {
        if (filter === "all") return true;
        if (filter === "edges") {
          const sp = g.sportLabel?.toLowerCase();
          let proj = null;
          if (sp === "nfl" || sp === "ncaaf") proj = projectFootball(findTeam(g.home, NFL), findTeam(g.away, NFL), g.vegasSpread, g.vegasTotal, { homeML: g.homeML, awayML: g.awayML });
          else if (sp === "nba" || sp === "ncaab") proj = projectBasketball(findTeam(g.home, NBA), findTeam(g.away, NBA), g.vegasSpread, g.vegasTotal, { homeML: g.homeML, awayML: g.awayML });
          else if (sp === "wnba") proj = projectBasketball(findTeam(g.home, WNBA), findTeam(g.away, WNBA), g.vegasSpread, g.vegasTotal, { homeAdv:2.5, homeML: g.homeML, awayML: g.awayML });
          else if (sp === "mlb") proj = projectBaseball(findTeam(g.home, MLB), findTeam(g.away, MLB), g.vegasTotal, { homeML: g.homeML, awayML: g.awayML }, findMLBLiveData(g.home, g.away, mlbLive));
          else if (sp === "nhl") proj = projectHockey(findTeam(g.home, NHL), findTeam(g.away, NHL), g.vegasTotal, { homeML: g.homeML, awayML: g.awayML });
          return proj?.hasEdge;
        }
        return g.sportLabel?.toLowerCase() === filter;
      })
      .sort((a, b) => new Date(a.rawStart) - new Date(b.rawStart));
  }, [allGames, selectedDate, filter, mlbLive]);

  const fmtDate = d => d.toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" });
  const isToday = d => d.toDateString() === today.toDateString();
  const isYesterday = d => d.toDateString() === yesterday.toDateString();

  return (
    <div>
      {/* Track record banner — premium only */}
      {isPremium && <EdgeTrackRecord />}

      {/* Date selector */}
      <div style={{ display:"flex", gap:"8px", marginBottom:"16px", overflowX:"auto", paddingBottom:"4px" }}>
        {dates.map((d, i) => (
          <button key={i} onClick={() => setSelectedDate(d)} style={{ padding:"8px 16px", borderRadius:"20px", border:"none", cursor:"pointer", whiteSpace:"nowrap", fontFamily:"inherit", fontSize:"12px", fontWeight:"600", background: d.toDateString() === selectedDate.toDateString() ? "#c8f54a" : "rgba(255,255,255,0.05)", color: d.toDateString() === selectedDate.toDateString() ? "#000" : "#555" }}>
            {isToday(d) ? "Today" : d.toDateString() === yesterday.toDateString() ? "Yesterday" : fmtDate(d)}
          </button>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display:"flex", gap:"6px", marginBottom:"16px", overflowX:"auto", paddingBottom:"4px" }}>
        {["all","edges","nfl","nba","mlb","wnba","nhl","ncaaf","ncaab"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding:"5px 12px", borderRadius:"20px", border:"none", cursor:"pointer", fontSize:"11px", fontWeight:"600", fontFamily:"inherit", whiteSpace:"nowrap", background: filter === f ? "rgba(200,245,74,0.15)" : "rgba(255,255,255,0.04)", color: filter === f ? "#c8f54a" : "#444" }}>
            {f === "edges" ? "⚡ Edges" : f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Status bar */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px", fontSize:"11px" }}>
        <span style={{ color:"#444" }}>{loading ? "Loading..." : `${display.length} game${display.length !== 1 ? "s" : ""}`}</span>
        {lastUpdated && <span style={{ color:"#333" }}>Updated {lastUpdated}</span>}
      </div>

      {loading && <div style={{ textAlign:"center", padding:"40px", color:"#444" }}>Loading games...</div>}
      {!loading && display.length === 0 && (
        <div style={{ textAlign:"center", padding:"40px", color:"#333", fontSize:"13px" }}>
          {filter === "edges" ? "No edges detected for this date." : "No games found for this date."}
        </div>
      )}
      {display.map((g, i) => {
        const sportScores = scores[DASH_SPORTS.find(s => s.label === g.sportLabel)?.id] || [];
        return <DashboardCard key={g.id || i} game={g} isPremium={isPremium} index={i} scoreData={sportScores} mlbLive={mlbLive} movement={lineMovement[g.id]} eloRatings={eloRatings} />;
      })}
    </div>
  );
}
