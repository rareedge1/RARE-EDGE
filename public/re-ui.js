// ── SHARED UI COMPONENTS ─────────────────────────────────────

// Shared style tokens
const S = {
  card:  { background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"14px", padding:"18px", marginBottom:"14px" },
  lbl:   { fontSize:"10px", color:"#555", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:"6px", display:"block" },
  input: { width:"100%", padding:"11px 14px", borderRadius:"8px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.10)", color:"#fff", fontSize:"14px", fontFamily:"inherit", outline:"none", boxSizing:"border-box" },
  sel:   { width:"100%", padding:"11px 14px", borderRadius:"8px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.10)", color:"#fff", fontSize:"14px", fontFamily:"inherit", outline:"none", cursor:"pointer", boxSizing:"border-box", appearance:"none" },
  btn:   { width:"100%", padding:"13px", background:"linear-gradient(135deg,#c8f54a,#8fdb00)", border:"none", borderRadius:"10px", cursor:"pointer", fontFamily:"'Bebas Neue',cursive", fontSize:"20px", letterSpacing:"3px", color:"#000" },
  lime:  { color:"#c8f54a" },
};

// Stat pill display
function StatPill({ label, val, color }) {
  return (
    <div style={{ flex:1, textAlign:"center", background:"rgba(255,255,255,0.03)", borderRadius:"8px", padding:"8px 4px" }}>
      <div style={{ fontSize:"9px", color:"#444", letterSpacing:"1px", marginBottom:"3px", textTransform:"uppercase" }}>{label}</div>
      <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"18px", color: color || "#aaa", letterSpacing:"1px" }}>{val ?? "—"}</div>
    </div>
  );
}

// Live games strip — shown at top of each sport tab
function LiveGamesStrip({ sportId, sportLabel, onGameSelect }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOdds(sportId, "spreads,totals,h2h")
      .then(data => setGames((data || []).slice(0, 15).map(g => parseGame(g, sportLabel))))
      .catch(() => setGames([]))
      .finally(() => setLoading(false));
  }, [sportId]);

  if (loading) return <div style={{ padding:"16px 0", color:"#444", fontSize:"12px", textAlign:"center" }}>Loading {sportLabel} games...</div>;
  if (!games.length) return <div style={{ padding:"12px", background:"rgba(255,255,255,0.02)", borderRadius:"10px", marginBottom:"20px", fontSize:"12px", color:"#444", textAlign:"center" }}>No upcoming {sportLabel} games right now.</div>;

  return (
    <div style={{ marginBottom:"24px" }}>
      <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"10px" }}>📅 {sportLabel} — Tap any game</div>
      {games.map((g, i) => (
        <div key={g.id || i} onClick={() => onGameSelect?.(g)}
          style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"10px", padding:"12px 14px", marginBottom:"8px", cursor:"pointer", animation:`fadeIn 0.3s ease ${i*0.04}s both` }}>
          <div style={{ fontSize:"10px", color:"#444", marginBottom:"6px" }}>🕐 {g.time}</div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:"12px", color:"#666", marginBottom:"3px" }}>{g.away}</div>
              <div style={{ fontSize:"14px", color:"#ccc", fontWeight:"600" }}>{g.home}</div>
            </div>
            <div style={{ display:"flex", gap:"10px", alignItems:"center" }}>
              {g.vegasSpread != null && <StatPill label="SPREAD" val={`${g.vegasSpread > 0 ? "+" : ""}${g.vegasSpread}`} color="#c8f54a" />}
              {g.vegasTotal  != null && <StatPill label="O/U"    val={g.vegasTotal} />}
              <span style={{ color:"#444", fontSize:"18px" }}>›</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Get players for a team from PLAYERS database with flexible name matching
function getPlayers(teamName, sport) {
  if (!teamName || !PLAYERS) return [];
  // Try exact match first
  if (PLAYERS[teamName]) return PLAYERS[teamName];
  // Try short name (last word)
  const short = teamName.split(" ").pop();
  if (PLAYERS[short]) return PLAYERS[short];
  // Try partial match
  const match = Object.entries(PLAYERS).find(([k]) =>
    k.toLowerCase().includes(short.toLowerCase()) ||
    short.toLowerCase().includes(k.toLowerCase()) ||
    teamName.toLowerCase().includes(k.toLowerCase())
  );
  return match ? match[1] : [];
}

// Format player props lines by sport
// isLive=true means stats is a live object from API, false means static player object
function formatPlayerLines(player, sport, isLive = false) {
  const lines = [];
  const s = isLive ? player : player; // same object either way
  if (sport === "nba" || sport === "wnba" || sport === "ncaab") {
    if (s.pts != null && parseFloat(s.pts) > 0) lines.push({ stat:"PTS", proj: s.pts });
    if (s.reb != null && parseFloat(s.reb) > 0) lines.push({ stat:"REB", proj: s.reb });
    if (s.ast != null && parseFloat(s.ast) > 0) lines.push({ stat:"AST", proj: s.ast });
    if (s.stl != null && parseFloat(s.stl) > 0) lines.push({ stat:"STL", proj: s.stl });
  } else if (sport === "nfl" || sport === "ncaaf") {
    if (s.pyds != null && parseFloat(s.pyds) > 0)   lines.push({ stat:"PASS YDS", proj: s.pyds });
    if (s.ptds != null && parseFloat(s.ptds) > 0)   lines.push({ stat:"PASS TDS", proj: s.ptds });
    if (s.ryds != null && parseFloat(s.ryds) > 0)   lines.push({ stat:"RUSH YDS", proj: s.ryds });
    if (s.ryds_r != null && parseFloat(s.ryds_r) > 0) lines.push({ stat:"REC YDS", proj: s.ryds_r });
    if (s.rec != null && parseFloat(s.rec) > 0)     lines.push({ stat:"REC", proj: s.rec });
    if (s.tds != null && parseFloat(s.tds) > 0)     lines.push({ stat:"TDS", proj: s.tds });
  } else if (sport === "mlb") {
    if (s.avg != null && parseFloat(s.avg) > 0) lines.push({ stat:"AVG",  proj: s.avg });
    if (s.hr  != null && parseFloat(s.hr)  > 0) lines.push({ stat:"HR",   proj: s.hr  });
    if (s.rbi != null && parseFloat(s.rbi) > 0) lines.push({ stat:"RBI",  proj: s.rbi });
    if (s.ops != null && parseFloat(s.ops) > 0) lines.push({ stat:"OPS",  proj: s.ops });
    if (s.era != null && parseFloat(s.era) > 0) lines.push({ stat:"ERA",  proj: s.era });
    if (s.so  != null && parseFloat(s.so)  > 0) lines.push({ stat:"K's",  proj: s.so  });
  } else if (sport === "nhl") {
    if (s.g   != null && parseFloat(s.g)   > 0) lines.push({ stat:"GOALS", proj: s.g   });
    if (s.a   != null && parseFloat(s.a)   > 0) lines.push({ stat:"ASST",  proj: s.a   });
    if (s.pts != null && parseFloat(s.pts) > 0) lines.push({ stat:"PTS",   proj: s.pts });
    if (s.sog != null && parseFloat(s.sog) > 0) lines.push({ stat:"SOG",   proj: s.sog });
  }
  return lines;
}

// Game Detail Modal — slides up from bottom
function GameDetailModal({ game, sport, isPremium, onClose }) {
  const [tab, setTab] = useState("overview");
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    // Try live API first, fall back to static database
    const liveSupported = ["nba","wnba","nfl","nhl","mlb"].includes(sport);
    if (liveSupported) {
      const homeShort = game.home?.split(" ").pop();
      const awayShort = game.away?.split(" ").pop();
      Promise.all([
        fetch(`/api/players?sport=${sport}&team=${encodeURIComponent(homeShort)}`).then(r => r.json()).catch(() => null),
        fetch(`/api/players?sport=${sport}&team=${encodeURIComponent(awayShort)}`).then(r => r.json()).catch(() => null),
      ]).then(([homeData, awayData]) => {
        const formatLive = (data, teamName) => {
          if (!data?.players?.length) return [];
          return data.players.slice(0, 5).map(p => ({
            name: p.name,
            team: teamName,
            rec: p.injured ? "⚠️ " + p.status : "LIVE",
            injured: p.injured,
            lines: formatPlayerLines(p.stats || {}, sport, true),
          }));
        };
        const livePlayers = [
          ...formatLive(awayData, game.away),
          ...formatLive(homeData, game.home),
        ];
        if (livePlayers.length > 0) {
          setPlayers(livePlayers);
        } else {
          // Fall back to static
          const hp = getPlayers(game.home, sport);
          const ap = getPlayers(game.away, sport);
          const format = (players, teamName) => players.map(p => ({
            name: p.n || p.name, team: teamName, rec: "PROJ",
            lines: formatPlayerLines(p, sport, false),
          }));
          setPlayers([...format(ap, game.away), ...format(hp, game.home)]);
        }
      });
    } else {
      const hp = getPlayers(game.home, sport);
      const ap = getPlayers(game.away, sport);
      const format = (players, teamName) => players.map(p => ({
        name: p.n || p.name, team: teamName, rec: "PROJ",
        lines: formatPlayerLines(p, sport, false),
      }));
      setPlayers([...format(ap, game.away), ...format(hp, game.home)]);
    }
  }, [game, sport]);

  // Project based on sport
  const proj = (() => {
    if (sport === "nfl" || sport === "ncaaf" || sport === "ufl") {
      const h = findTeam(game.home, NFL) || findTeam(game.home, UFL);
      const a = findTeam(game.away, NFL) || findTeam(game.away, UFL);
      return projectFootball(h, a, game.vegasSpread, game.vegasTotal);
    }
    if (sport === "nba" || sport === "ncaab") {
      const h = findTeam(game.home, NBA);
      const a = findTeam(game.away, NBA);
      return projectBasketball(h, a, game.vegasSpread, game.vegasTotal);
    }
    if (sport === "wnba") {
      const h = findTeam(game.home, WNBA);
      const a = findTeam(game.away, WNBA);
      return projectBasketball(h, a, game.vegasSpread, game.vegasTotal, { homeAdv:2.5 });
    }
    if (sport === "mlb") {
      const h = findTeam(game.home, MLB);
      const a = findTeam(game.away, MLB);
      return projectBaseball(h, a, game.vegasTotal, { parkFactor: h?.park || 1.0 });
    }
    if (sport === "nhl") {
      const h = findTeam(game.home, NHL);
      const a = findTeam(game.away, NHL);
      return projectHockey(h, a, game.vegasTotal);
    }
    return null;
  })();

  return ReactDOM.createPortal(
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:99999, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={onClose}>
      <div style={{ background:"#0c0c18", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"20px 20px 0 0", width:"100%", maxWidth:"680px", maxHeight:"92vh", overflow:"hidden", display:"flex", flexDirection:"column" }} onClick={e => e.stopPropagation()}>

        {/* Handle */}
        <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 8px" }}>
          <div style={{ width:"36px", height:"4px", borderRadius:"2px", background:"rgba(255,255,255,0.15)" }} />
        </div>

        {/* Header */}
        <div style={{ padding:"0 20px 14px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontSize:"10px", color:"#555", letterSpacing:"1px", marginBottom:"5px" }}>{game.time} · {game.sportLabel}</div>
              <div style={{ fontSize:"12px", color:"#777", marginBottom:"3px" }}>{game.away}</div>
              <div style={{ fontSize:"18px", color:"#fff", fontWeight:"700" }}>{game.home}</div>
            </div>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,0.08)", border:"none", borderRadius:"50%", width:"32px", height:"32px", color:"#aaa", fontSize:"16px", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
          </div>
          <div style={{ display:"flex", gap:"8px", marginTop:"12px" }}>
            {game.vegasSpread != null && <StatPill label="SPREAD" val={`${game.vegasSpread > 0 ? "+" : ""}${game.vegasSpread}`} />}
            {game.vegasTotal  != null && <StatPill label="O/U"    val={game.vegasTotal} />}
            {game.homeML      != null && <StatPill label="HOME ML" val={`${game.homeML > 0 ? "+" : ""}${game.homeML}`} />}
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:"8px", padding:"10px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          {["overview", "picks", "players"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding:"6px 16px", borderRadius:"20px", border:"none", cursor:"pointer", fontSize:"12px", fontWeight:"600", fontFamily:"inherit", background: tab === t ? "#c8f54a" : "rgba(255,255,255,0.05)", color: tab === t ? "#000" : "#555", textTransform:"capitalize" }}>
              {t === "picks" ? "⚡ Picks" : t === "players" ? "👤 Players" : "📊 Overview"}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ overflowY:"auto", flex:1, padding:"16px 20px" }}>

          {tab === "overview" && (
            <div>
              {proj && isPremium && (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"16px" }}>
                  <StatPill label="Proj Spread" val={`${proj.projSpread > 0 ? "+" : ""}${proj.projSpread}`} color={Math.abs(proj.vSpread || 0) >= EDGE_MIN ? "#c8f54a" : "#aaa"} />
                  <StatPill label="Proj Total"  val={proj.projTotal} color={Math.abs(proj.vTotal || 0) >= EDGE_MIN * 1.5 ? "#c8f54a" : "#aaa"} />
                  <StatPill label={`${game.away?.split(" ").pop()} Win%`} val={`${proj.awayWin}%`} />
                  <StatPill label={`${game.home?.split(" ").pop()} Win%`} val={`${proj.homeWin}%`} />
                </div>
              )}
              {!isPremium && (
                <div style={{ background:"rgba(200,245,74,0.04)", border:"1px solid rgba(200,245,74,0.12)", borderRadius:"12px", padding:"20px", textAlign:"center", marginBottom:"16px" }}>
                  <div style={{ fontSize:"28px", marginBottom:"8px" }}>🔒</div>
                  <div style={{ fontSize:"14px", color:"#777", marginBottom:"14px" }}>Upgrade for projections & edge detection</div>
                  <button onClick={() => startCheckout("monthly")} style={{ ...S.btn, width:"auto", padding:"10px 24px", fontSize:"16px" }}>⚡ UPGRADE →</button>
                </div>
              )}
              {game.books?.length > 0 && (
                <div>
                  <div style={{ fontSize:"10px", color:"#444", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"10px" }}>Live Odds</div>
                  {game.books.map((b, i) => (
                    <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.04)", fontSize:"12px" }}>
                      <span style={{ color:"#555" }}>{b.book}</span>
                      <span style={{ color:"#888" }}>{b.spread != null ? `${b.spread > 0 ? "+" : ""}${b.spread}` : "—"} · O/U {b.total ?? "—"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "picks" && (
            <div>
              {!isPremium ? (
                <div style={{ textAlign:"center", padding:"30px" }}>
                  <div style={{ fontSize:"32px", marginBottom:"12px" }}>🔒</div>
                  <div style={{ fontSize:"14px", color:"#666", marginBottom:"16px" }}>Premium picks require an upgrade</div>
                  <button onClick={() => startCheckout("monthly")} style={{ ...S.btn, width:"auto", padding:"10px 24px", fontSize:"16px" }}>⚡ UPGRADE →</button>
                </div>
              ) : proj?.hasEdge ? (
                <div>
                  {Math.abs(proj.vSpread || 0) >= EDGE_MIN && (
                    <div style={{ background:"rgba(200,245,74,0.06)", border:"1px solid rgba(200,245,74,0.2)", borderRadius:"12px", padding:"16px", marginBottom:"12px" }}>
                      <div style={{ fontSize:"10px", color:"#c8f54a", letterSpacing:"2px", marginBottom:"6px" }}>⚡ SPREAD EDGE</div>
                      <div style={{ fontSize:"16px", color:"#fff", fontWeight:"700" }}>
                        Bet {proj.vSpread > 0 ? game.home : game.away} to cover
                      </div>
                      <div style={{ fontSize:"12px", color:"#666", marginTop:"4px" }}>Model edge: {proj.vSpread > 0 ? "+" : ""}{proj.vSpread} pts</div>
                    </div>
                  )}
                  {Math.abs(proj.vTotal || 0) >= EDGE_MIN * 1.5 && (
                    <div style={{ background:"rgba(200,245,74,0.06)", border:"1px solid rgba(200,245,74,0.2)", borderRadius:"12px", padding:"16px", marginBottom:"12px" }}>
                      <div style={{ fontSize:"10px", color:"#c8f54a", letterSpacing:"2px", marginBottom:"6px" }}>⚡ TOTAL EDGE</div>
                      <div style={{ fontSize:"16px", color:"#fff", fontWeight:"700" }}>
                        Bet the {proj.vTotal > 0 ? "OVER" : "UNDER"}
                      </div>
                      <div style={{ fontSize:"12px", color:"#666", marginTop:"4px" }}>Model projects {proj.projTotal} vs Vegas {game.vegasTotal}</div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign:"center", padding:"30px", color:"#444", fontSize:"13px" }}>No strong edge detected for this game.</div>
              )}
            </div>
          )}

          {tab === "players" && (
            <div>
              {players.length === 0 ? (
                <div style={{ textAlign:"center", padding:"30px", color:"#444", fontSize:"13px" }}>No player projections for this matchup.</div>
              ) : players.map((p, pi) => (
                <div key={pi} style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"10px", padding:"12px", marginBottom:"10px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
                    <div>
                      <div style={{ fontSize:"13px", color:"#ccc", fontWeight:"600" }}>{p.name}</div>
                      <div style={{ fontSize:"10px", color:"#444" }}>{p.team}</div>
                    </div>
                    <div style={{ background: p.injured ? "rgba(239,68,68,0.1)" : "rgba(200,245,74,0.1)", borderRadius:"10px", padding:"2px 10px", fontSize:"10px", color: p.injured ? "#ef4444" : "#c8f54a", fontWeight:"700" }}>{p.rec}</div>
                  </div>
                  <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                    {p.lines.map((l, li) => (
                      <div key={li} style={{ background:"rgba(255,255,255,0.04)", borderRadius:"8px", padding:"6px 10px", textAlign:"center", minWidth:"68px" }}>
                        <div style={{ fontSize:"9px", color:"#444", letterSpacing:"1px", marginBottom:"2px" }}>{l.stat}</div>
                        <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"18px", color:"#c8f54a" }}>{l.proj}</div>
                        {l.line != null && <div style={{ fontSize:"9px", color:"#333", marginTop:"2px" }}>Line: {l.line}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Close */}
        <div style={{ padding:"12px 20px", borderTop:"1px solid rgba(255,255,255,0.06)" }}>
          <button onClick={onClose} style={{ width:"100%", padding:"10px", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"10px", color:"#666", fontSize:"13px", cursor:"pointer", fontFamily:"inherit" }}>← Back</button>
        </div>
      </div>
    </div>,
    document.body
  );
}
