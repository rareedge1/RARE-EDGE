// ── DASHBOARD GAME CARD ──────────────────────────────────────
function DashboardCard({ game, isPremium, index, scoreData }) {
  const [open, setOpen] = useState(false);

  // Get live/final score for this game — match by team names
  const score = scoreData?.find(s =>
    (s.home_team === game.home && s.away_team === game.away) ||
    (s.home_team === game.away && s.away_team === game.home) ||
    s.id === game.id
  );
  const isLive = score?.completed === false && score?.scores?.length > 0;
  const isFinal = score?.completed === true;
  const homeScore = score?.scores?.find(s => s.name === game.home)?.score;
  const awayScore = score?.scores?.find(s => s.name === game.away)?.score;

  // Auto-project based on sport
  const proj = useMemo(() => {
    const sp = game.sportLabel?.toLowerCase();
    if (sp === "nfl" || sp === "ncaaf" || sp === "ufl") {
      const db = sp === "ufl" ? UFL : NFL;
      return projectFootball(findTeam(game.home, db), findTeam(game.away, db), game.vegasSpread, game.vegasTotal);
    }
    if (sp === "nba" || sp === "ncaab") return projectBasketball(findTeam(game.home, NBA), findTeam(game.away, NBA), game.vegasSpread, game.vegasTotal);
    if (sp === "wnba") return projectBasketball(findTeam(game.home, WNBA), findTeam(game.away, WNBA), game.vegasSpread, game.vegasTotal, { homeAdv:2.5 });
    if (sp === "mlb") return projectBaseball(findTeam(game.home, MLB), findTeam(game.away, MLB), game.vegasTotal);
    if (sp === "nhl") return projectHockey(findTeam(game.home, NHL), findTeam(game.away, NHL), game.vegasTotal);
    return null;
  }, [game]);

  const hasEdge = proj?.hasEdge;
  const sportKey = game.sportLabel?.toLowerCase().replace("/", "_").replace(" ", "_") || "nfl";

  return (
    <div onClick={() => setOpen(true)} style={{
      borderRadius:"12px",
      border: hasEdge && isPremium ? "1px solid rgba(200,245,74,0.28)" : "1px solid rgba(255,255,255,0.07)",
      background: hasEdge && isPremium ? "rgba(200,245,74,0.03)" : "rgba(255,255,255,0.02)",
      overflow:"hidden", cursor:"pointer",
      animation:`fadeIn 0.3s ease ${index * 0.03}s both`,
      marginBottom:"10px"
    }}>
      {/* Edge banner */}
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
          {isLive && <div style={{ fontSize:"9px", color:"#c8f54a", fontWeight:"700", letterSpacing:"1px", background:"rgba(200,245,74,0.12)", padding:"2px 6px", borderRadius:"4px" }}>● LIVE</div>}
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
      </div>

      {open && ReactDOM.createPortal(
        <GameDetailModal game={game} sport={sportKey} isPremium={isPremium} onClose={() => setOpen(false)} />,
        document.body
      )}
    </div>
  );
}

// ── DASHBOARD TAB ────────────────────────────────────────────
const DASH_SPORTS = [
  { id:"americanfootball_nfl",  label:"NFL",     emoji:"🏈" },
  { id:"basketball_nba",        label:"NBA",     emoji:"🏀" },
  { id:"baseball_mlb",          label:"MLB",     emoji:"⚾" },
  { id:"basketball_wnba",       label:"WNBA",    emoji:"🏀" },
  { id:"icehockey_nhl",         label:"NHL",     emoji:"🏒" },
  { id:"americanfootball_ncaaf",label:"NCAAF",   emoji:"🏈" },
  { id:"basketball_ncaab",      label:"NCAAB",   emoji:"🏀" },
  { id:"soccer_usa_mls",        label:"MLS",     emoji:"⚽" },
  { id:"soccer_epl",            label:"EPL",     emoji:"⚽" },
];

function DashboardTab({ isPremium }) {
  const today = new Date();
  const dates = Array.from({ length:4 }, (_, i) => { const d = new Date(today); d.setDate(d.getDate() + i); return d; });
  const [selectedDate, setSelectedDate] = useState(today);
  const [allGames, setAllGames] = useState([]);
  const [scores, setScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [lastUpdated, setLastUpdated] = useState(null);

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

  useEffect(() => {
    setLoading(true);
    Promise.all(
      DASH_SPORTS.map(s =>
        fetchOdds(s.id, "spreads,totals,h2h")
          .then(data => (data || []).map(g => ({ ...parseGame(g, s.label), sportEmoji: s.emoji })))
          .catch(() => [])
      )
    ).then(results => {
      setAllGames(results.flat());
      setLastUpdated(new Date().toLocaleTimeString());
    }).finally(() => setLoading(false));
  }, []);

  const display = useMemo(() => {
    const sel = selectedDate.toLocaleDateString("en-US", {timeZone:"America/Chicago"});
    return allGames
      .filter(g => new Date(g.rawStart).toLocaleDateString("en-US", {timeZone:"America/Chicago"}) === sel)
      .filter(g => {
        if (filter === "all") return true;
        if (filter === "edges") {
          const sp = g.sportLabel?.toLowerCase();
          let proj = null;
          if (sp === "nfl" || sp === "ncaaf") proj = projectFootball(findTeam(g.home, NFL), findTeam(g.away, NFL), g.vegasSpread, g.vegasTotal);
          else if (sp === "nba" || sp === "ncaab") proj = projectBasketball(findTeam(g.home, NBA), findTeam(g.away, NBA), g.vegasSpread, g.vegasTotal);
          else if (sp === "wnba") proj = projectBasketball(findTeam(g.home, WNBA), findTeam(g.away, WNBA), g.vegasSpread, g.vegasTotal, { homeAdv:2.5 });
          else if (sp === "mlb") proj = projectBaseball(findTeam(g.home, MLB), findTeam(g.away, MLB), g.vegasTotal);
          else if (sp === "nhl") proj = projectHockey(findTeam(g.home, NHL), findTeam(g.away, NHL), g.vegasTotal);
          return proj?.hasEdge;
        }
        return g.sportLabel?.toLowerCase() === filter;
      })
      .sort((a, b) => new Date(a.rawStart) - new Date(b.rawStart));
  }, [allGames, selectedDate, filter]);

  const fmtDate = d => d.toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" });
  const isToday = d => d.toDateString() === today.toDateString();

  return (
    <div>
      {/* Date selector */}
      <div style={{ display:"flex", gap:"8px", marginBottom:"16px", overflowX:"auto", paddingBottom:"4px" }}>
        {dates.map((d, i) => (
          <button key={i} onClick={() => setSelectedDate(d)} style={{ padding:"8px 16px", borderRadius:"20px", border:"none", cursor:"pointer", whiteSpace:"nowrap", fontFamily:"inherit", fontSize:"12px", fontWeight:"600", background: d.toDateString() === selectedDate.toDateString() ? "#c8f54a" : "rgba(255,255,255,0.05)", color: d.toDateString() === selectedDate.toDateString() ? "#000" : "#555" }}>
            {isToday(d) ? "Today" : fmtDate(d)}
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

      {/* Games */}
      {loading && <div style={{ textAlign:"center", padding:"40px", color:"#444" }}>Loading games...</div>}
      {!loading && display.length === 0 && (
        <div style={{ textAlign:"center", padding:"40px", color:"#333", fontSize:"13px" }}>
          {filter === "edges" ? "No edges detected for this date." : "No games found for this date."}
        </div>
      )}
      {display.map((g, i) => {
        const sportScores = scores[DASH_SPORTS.find(s => s.label === g.sportLabel)?.id] || [];
        return <DashboardCard key={g.id || i} game={g} isPremium={isPremium} index={i} scoreData={sportScores} />;
      })}
    </div>
  );
}
