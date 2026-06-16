// ── SHARED UI COMPONENTS ─────────────────────────────────────

const S = {
  card:  { background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"14px", padding:"18px", marginBottom:"14px" },
  lbl:   { fontSize:"10px", color:"#555", textTransform:"uppercase", letterSpacing:"1.5px", marginBottom:"6px", display:"block" },
  input: { width:"100%", padding:"11px 14px", borderRadius:"8px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.10)", color:"#fff", fontSize:"14px", fontFamily:"inherit", outline:"none", boxSizing:"border-box" },
  sel:   { width:"100%", padding:"11px 14px", borderRadius:"8px", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.10)", color:"#fff", fontSize:"14px", fontFamily:"inherit", outline:"none", cursor:"pointer", boxSizing:"border-box", appearance:"none" },
  btn:   { width:"100%", padding:"13px", background:"linear-gradient(135deg,#c8f54a,#8fdb00)", border:"none", borderRadius:"10px", cursor:"pointer", fontFamily:"'Bebas Neue',cursive", fontSize:"20px", letterSpacing:"3px", color:"#000" },
  lime:  { color:"#c8f54a" },
};

function StatPill({ label, val, color }) {
  return (
    <div style={{ flex:1, textAlign:"center", background:"rgba(255,255,255,0.03)", borderRadius:"8px", padding:"8px 4px" }}>
      <div style={{ fontSize:"9px", color:"#444", letterSpacing:"1px", marginBottom:"3px", textTransform:"uppercase" }}>{label}</div>
      <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"18px", color: color || "#aaa", letterSpacing:"1px" }}>{val ?? "—"}</div>
    </div>
  );
}

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
        <div key={g.id || i} onClick={() => onGameSelect?.(g)} style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"10px", padding:"12px 14px", marginBottom:"8px", cursor:"pointer" }}>
          <div style={{ fontSize:"10px", color:"#444", marginBottom:"6px" }}>🕐 {g.time}</div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:"12px", color:"#666", marginBottom:"3px" }}>{g.away}</div>
              <div style={{ fontSize:"14px", color:"#ccc", fontWeight:"600" }}>{g.home}</div>
            </div>
            <div style={{ display:"flex", gap:"10px", alignItems:"center" }}>
              {g.vegasSpread != null && <StatPill label="SPREAD" val={`${g.vegasSpread > 0 ? "+" : ""}${g.vegasSpread}`} color="#c8f54a" />}
              {g.vegasTotal  != null && <StatPill label="O/U" val={g.vegasTotal} />}
              <span style={{ color:"#444", fontSize:"18px" }}>›</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function getPlayers(teamName, sport) {
  if (!teamName || !PLAYERS) return [];
  if (PLAYERS[teamName]) return PLAYERS[teamName];
  const short = teamName.split(" ").pop();
  if (PLAYERS[short]) return PLAYERS[short];
  const match = Object.entries(PLAYERS).find(([k]) =>
    k.toLowerCase().includes(short.toLowerCase()) ||
    short.toLowerCase().includes(k.toLowerCase()) ||
    teamName.toLowerCase().includes(k.toLowerCase())
  );
  return match ? match[1] : [];
}

function formatPlayerLines(player, sport) {
  const lines = [];
  const s = player;
  if (sport === "nba" || sport === "wnba" || sport === "ncaab") {
    if (s.pts != null && parseFloat(s.pts) > 0) lines.push({ stat:"PTS", proj: s.pts });
    if (s.reb != null && parseFloat(s.reb) > 0) lines.push({ stat:"REB", proj: s.reb });
    if (s.ast != null && parseFloat(s.ast) > 0) lines.push({ stat:"AST", proj: s.ast });
  } else if (sport === "nfl" || sport === "ncaaf") {
    if (s.pyds   != null && parseFloat(s.pyds)   > 0) lines.push({ stat:"PASS YDS", proj: s.pyds });
    if (s.ptds   != null && parseFloat(s.ptds)   > 0) lines.push({ stat:"PASS TDS", proj: s.ptds });
    if (s.ryds   != null && parseFloat(s.ryds)   > 0) lines.push({ stat:"RUSH YDS", proj: s.ryds });
    if (s.ryds_r != null && parseFloat(s.ryds_r) > 0) lines.push({ stat:"REC YDS",  proj: s.ryds_r });
    if (s.rec    != null && parseFloat(s.rec)    > 0) lines.push({ stat:"REC",       proj: s.rec });
  } else if (sport === "mlb") {
    // Pitchers
    if (s.era  != null && parseFloat(s.era)  > 0) lines.push({ stat:"ERA",         proj: s.era  });
    if (s.so   != null && parseFloat(s.so)   > 0) lines.push({ stat:"K's",         proj: s.so   });
    if (s.outs != null && parseFloat(s.outs) > 0) lines.push({ stat:"OUTS",        proj: s.outs });
    // Batters
    if (s.hits  != null && parseFloat(s.hits)  > 0) lines.push({ stat:"HITS",        proj: s.hits  });
    if (s.tb    != null && parseFloat(s.tb)    > 0) lines.push({ stat:"TOTAL BASES", proj: s.tb    });
    if (s.hr    != null && parseFloat(s.hr)    > 0) lines.push({ stat:"HR",          proj: s.hr    });
    if (s.rbi   != null && parseFloat(s.rbi)   > 0) lines.push({ stat:"RBI",         proj: s.rbi   });
    if (s.walks != null && parseFloat(s.walks) > 0) lines.push({ stat:"WALKS",       proj: s.walks });
    if (s.avg   != null && parseFloat(s.avg)   > 0) lines.push({ stat:"AVG",         proj: s.avg   });
  } else if (sport === "nhl") {
    if (s.g   != null && parseFloat(s.g)   > 0) lines.push({ stat:"GOALS", proj: s.g   });
    if (s.a   != null && parseFloat(s.a)   > 0) lines.push({ stat:"ASST",  proj: s.a   });
    if (s.sog != null && parseFloat(s.sog) > 0) lines.push({ stat:"SOG",   proj: s.sog });
  }
  return lines;
}

// Prop stat key -> our stat label mapping
const PROP_STAT_MAP = {
  "player_points":       "PTS",
  "player_rebounds":     "REB",
  "player_assists":      "AST",
  "player_pass_yds":     "PASS YDS",
  "player_rush_yds":     "RUSH YDS",
  "player_reception_yds":"REC YDS",
  "player_strikeouts":   "K's",
  "player_home_runs":    "HR",
  "player_goals":        "GOALS",
  "player_shots_on_goal":"SOG",
};

// ── GAME DETAIL MODAL ────────────────────────────────────────
function GameDetailModal({ game, sport, isPremium, onClose }) {
  const [tab, setTab]           = useState("overview");
  const [players, setPlayers]   = useState([]);
  const [propLines, setPropLines] = useState({});
  const [movement, setMovement]  = useState(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Load players
  useEffect(() => {
    const staticHome = getPlayers(game.home, sport);
    const staticAway = getPlayers(game.away, sport);
    const fmt = (list, team) => list.map(p => ({
      name: p.n || p.name, team, rec:"PROJ", injured:false,
      lines: formatPlayerLines(p, sport),
    }));
    const staticPlayers = [...fmt(staticAway, game.away), ...fmt(staticHome, game.home)];

    const liveSupported = ["nba","wnba","nfl","nhl","mlb"].includes(sport);
    if (!liveSupported) { setPlayers(staticPlayers); return; }

    const homeShort = (game.home || "").split(" ").pop();
    const awayShort = (game.away || "").split(" ").pop();
    Promise.all([
      fetch("/api/players?sport=" + sport + "&team=" + encodeURIComponent(homeShort)).then(r => r.json()).catch(() => null),
      fetch("/api/players?sport=" + sport + "&team=" + encodeURIComponent(awayShort)).then(r => r.json()).catch(() => null),
    ]).then(function(results) {
      var homeData = results[0];
      var awayData = results[1];
      var merge = function(liveData, staticList, team) {
        if (!liveData || !liveData.players || !liveData.players.length) return fmt(staticList, team);
        return liveData.players.slice(0, 5).map(function(liveP) {
          // Match by last name against static list
          var liveLast = (liveP.name || "").split(" ").pop().toLowerCase();
          var staticMatch = null;
          for (var si = 0; si < staticList.length; si++) {
            var sName = staticList[si].n || staticList[si].name || "";
            var sLast = sName.split(" ").pop().toLowerCase();
            var sLastFull = sName.split(" ").filter(function(p) { return p.length > 2; }).pop()?.toLowerCase() || sLast;
            if (sLast === liveLast || sLastFull === liveLast) { staticMatch = staticList[si]; break; }
          }
          // Build stat lines: prefer live stats spread onto player object, fall back to static
          var linesSource = staticMatch || {};
          if (liveP.hasStats && liveP.stats) {
            linesSource = Object.assign({}, linesSource, liveP.stats);
          }
          return {
            name: liveP.name, team: team,
            rec: liveP.injured ? "⚠️ " + liveP.status : "PROJ",
            injured: liveP.injured || false,
            lines: formatPlayerLines(linesSource, sport),
          };
        });
      };
      var merged = merge(awayData, staticAway, game.away).concat(merge(homeData, staticHome, game.home));
      setPlayers(merged.length > 0 ? merged : staticPlayers);
    }).catch(function() { setPlayers(staticPlayers); });
  }, [game.id, sport]);

  // Load prop lines
  useEffect(() => {
    if (!isPremium || !game.id) return;
    var sportKeyMap = { nfl:"americanfootball_nfl", nba:"basketball_nba", wnba:"basketball_wnba", mlb:"baseball_mlb", nhl:"hockey_nhl", ncaaf:"americanfootball_ncaaf" };
    var sportKey = sportKeyMap[sport] || sport;
    var mktMap = {
      "americanfootball_nfl": "player_pass_tds,player_rush_yds,player_reception_yds",
      "basketball_nba":       "player_points,player_rebounds,player_assists",
      "basketball_wnba":      "player_points,player_rebounds,player_assists",
      "hockey_nhl":           "player_goals,player_shots_on_goal",
      "baseball_mlb":         "player_strikeouts,player_home_runs",
    };
    var mkt = mktMap[sportKey] || "player_points";
    fetch("/api/odds?sport=" + sportKey + "&gameId=" + encodeURIComponent(game.id) + "&type=props&markets=" + encodeURIComponent(mkt))
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (!data || !data.bookmakers) return;
        var lines = {};
        for (var bi = 0; bi < data.bookmakers.length; bi++) {
          var bk = data.bookmakers[bi];
          for (var mi = 0; mi < (bk.markets || []).length; mi++) {
            var mkt2 = bk.markets[mi];
            for (var oi = 0; oi < (mkt2.outcomes || []).length; oi++) {
              var out = mkt2.outcomes[oi];
              if (out.name !== "Over" || out.point == null || !out.description) continue;
              var pn = out.description.toLowerCase().trim();
              if (!lines[pn]) lines[pn] = {};
              if (!lines[pn][mkt2.key]) {
                lines[pn][mkt2.key] = { point: out.point, price: out.price, book: bk.title };
              }
            }
          }
        }
        setPropLines(lines);
      }).catch(function() {});
  }, [game.id, isPremium, sport]);

  // Fetch line movement for this game
  useEffect(function() {
    if (!isPremium || !game.id) return;
    fetch("/api/line-movement")
      .then(function(r) { return r.json(); })
      .then(function(data) {
        if (data && data[game.id]) setMovement(data[game.id]);
      }).catch(function() {});
  }, [game.id, isPremium]);

  const proj = (function() {
    if (sport === "nfl" || sport === "ncaaf" || sport === "ufl") {
      var h = findTeam(game.home, NFL) || findTeam(game.home, UFL);
      var a = findTeam(game.away, NFL) || findTeam(game.away, UFL);
      return projectFootball(h, a, game.vegasSpread, game.vegasTotal);
    }
    if (sport === "nba" || sport === "ncaab") {
      return projectBasketball(findTeam(game.home, NBA), findTeam(game.away, NBA), game.vegasSpread, game.vegasTotal);
    }
    if (sport === "wnba") {
      return projectBasketball(findTeam(game.home, WNBA), findTeam(game.away, WNBA), game.vegasSpread, game.vegasTotal, { homeAdv:2.5 });
    }
    if (sport === "mlb") {
      var hm = findTeam(game.home, MLB); var aw = findTeam(game.away, MLB);
      return projectBaseball(hm, aw, game.vegasTotal, { parkFactor: hm?.park || 1.0 });
    }
    if (sport === "nhl") {
      return projectHockey(findTeam(game.home, NHL), findTeam(game.away, NHL), game.vegasTotal);
    }
    return null;
  })();

  return ReactDOM.createPortal(
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", zIndex:99999, display:"flex", alignItems:"flex-end", justifyContent:"center" }} onClick={onClose}>
      <div style={{ background:"#0c0c18", border:"1px solid rgba(255,255,255,0.12)", borderRadius:"20px 20px 0 0", width:"100%", maxWidth:"680px", maxHeight:"92vh", overflow:"hidden", display:"flex", flexDirection:"column" }} onClick={function(e) { e.stopPropagation(); }}>

        <div style={{ display:"flex", justifyContent:"center", padding:"12px 0 8px" }}>
          <div style={{ width:"36px", height:"4px", borderRadius:"2px", background:"rgba(255,255,255,0.15)" }} />
        </div>

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
            {game.vegasSpread != null && <StatPill label="SPREAD" val={(game.vegasSpread > 0 ? "+" : "") + game.vegasSpread} />}
            {game.vegasTotal  != null && <StatPill label="O/U"    val={game.vegasTotal} />}
            {game.homeML      != null && <StatPill label="HOME ML" val={(game.homeML > 0 ? "+" : "") + game.homeML} />}
          </div>
        </div>

        <div style={{ display:"flex", gap:"8px", padding:"10px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
          {["overview","picks","players"].map(function(t) {
            return (
              <button key={t} onClick={function() { setTab(t); }} style={{ padding:"6px 16px", borderRadius:"20px", border:"none", cursor:"pointer", fontSize:"12px", fontWeight:"600", fontFamily:"inherit", background: tab === t ? "#c8f54a" : "rgba(255,255,255,0.05)", color: tab === t ? "#000" : "#555", textTransform:"capitalize" }}>
                {t === "picks" ? "⚡ Picks" : t === "players" ? "👤 Players" : "📊 Overview"}
              </button>
            );
          })}
        </div>

        <div style={{ overflowY:"auto", flex:1, padding:"16px 20px" }}>

          {tab === "overview" && (
            <div>
              {proj && isPremium && (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"16px" }}>
                  <StatPill label="Proj Spread" val={(proj.projSpread > 0 ? "+" : "") + proj.projSpread} color={Math.abs(proj.vSpread || 0) >= EDGE_MIN ? "#c8f54a" : "#aaa"} />
                  <StatPill label="Proj Total"  val={proj.projTotal} color={Math.abs(proj.vTotal || 0) >= EDGE_MIN * 1.5 ? "#c8f54a" : "#aaa"} />
                  <StatPill label={(game.away || "").split(" ").pop() + " Win%"} val={proj.awayWin + "%"} />
                  <StatPill label={(game.home || "").split(" ").pop() + " Win%"} val={proj.homeWin + "%"} />
                </div>
              )}
              {!isPremium && (
                <div style={{ background:"rgba(200,245,74,0.04)", border:"1px solid rgba(200,245,74,0.12)", borderRadius:"12px", padding:"20px", textAlign:"center", marginBottom:"16px" }}>
                  <div style={{ fontSize:"28px", marginBottom:"8px" }}>🔒</div>
                  <div style={{ fontSize:"14px", color:"#777", marginBottom:"14px" }}>Upgrade for projections & edge detection</div>
                  <button onClick={function() { startCheckout("monthly"); }} style={{ ...S.btn, width:"auto", padding:"10px 24px", fontSize:"16px" }}>⚡ UPGRADE →</button>
                </div>
              )}

              {isPremium && movement && movement.snapCount >= 2 && (
                <div style={{ background: movement.isSharp ? "rgba(200,245,74,0.04)" : "rgba(255,255,255,0.02)", border: movement.isSharp ? "1px solid rgba(200,245,74,0.15)" : "1px solid rgba(255,255,255,0.07)", borderRadius:"12px", padding:"14px", marginBottom:"16px" }}>
                  <div style={{ fontSize:"10px", color: movement.isSharp ? "#c8f54a" : "#555", letterSpacing:"2px", marginBottom:"10px" }}>
                    {movement.isSharp ? "⚡ SHARP MONEY DETECTED" : "📊 LINE MOVEMENT"}
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px", marginBottom:"10px" }}>
                    <div style={{ textAlign:"center", background:"rgba(255,255,255,0.03)", borderRadius:"8px", padding:"8px" }}>
                      <div style={{ fontSize:"9px", color:"#444", marginBottom:"3px" }}>SPREAD MOVE</div>
                      <div style={{ fontSize:"16px", fontWeight:"700", color: movement.spreadMove === null ? "#333" : movement.spreadMove > 0 ? "#c8f54a" : movement.spreadMove < 0 ? "#ef4444" : "#555" }}>
                        {movement.spreadMove === null ? "—" : (movement.spreadMove > 0 ? "+" : "") + movement.spreadMove}
                      </div>
                      <div style={{ fontSize:"9px", color:"#333", marginTop:"2px" }}>{movement.firstSpread != null ? movement.firstSpread : "—"} → {movement.latestSpread != null ? movement.latestSpread : "—"}</div>
                    </div>
                    <div style={{ textAlign:"center", background:"rgba(255,255,255,0.03)", borderRadius:"8px", padding:"8px" }}>
                      <div style={{ fontSize:"9px", color:"#444", marginBottom:"3px" }}>TOTAL MOVE</div>
                      <div style={{ fontSize:"16px", fontWeight:"700", color: movement.totalMove === null ? "#333" : movement.totalMove > 0 ? "#ef4444" : movement.totalMove < 0 ? "#60a5fa" : "#555" }}>
                        {movement.totalMove === null ? "—" : (movement.totalMove > 0 ? "+" : "") + movement.totalMove}
                      </div>
                      <div style={{ fontSize:"9px", color:"#333", marginTop:"2px" }}>{movement.firstTotal != null ? movement.firstTotal : "—"} → {movement.latestTotal != null ? movement.latestTotal : "—"}</div>
                    </div>
                    <div style={{ textAlign:"center", background:"rgba(255,255,255,0.03)", borderRadius:"8px", padding:"8px" }}>
                      <div style={{ fontSize:"9px", color:"#444", marginBottom:"3px" }}>ML MOVE</div>
                      <div style={{ fontSize:"16px", fontWeight:"700", color: movement.mlMove === null ? "#333" : Math.abs(movement.mlMove) >= 15 ? "#c8f54a" : "#555" }}>
                        {movement.mlMove === null ? "—" : (movement.mlMove > 0 ? "+" : "") + movement.mlMove}
                      </div>
                      <div style={{ fontSize:"9px", color:"#333", marginTop:"2px" }}>{movement.snapCount} snapshots</div>
                    </div>
                  </div>
                  {movement.isSharp && (
                    <div style={{ fontSize:"11px", color:"#aaa", lineHeight:"1.6", padding:"8px 10px", background:"rgba(200,245,74,0.04)", borderRadius:"8px" }}>
                      {movement.spreadMove !== null && Math.abs(movement.spreadMove) >= 1.0 && (
                        <div>📈 Spread moved {movement.spreadMove > 0 ? "toward " + game.away : "toward " + game.home} — sharp money on {movement.spreadMove > 0 ? game.away?.split(" ").pop() : game.home?.split(" ").pop()}</div>
                      )}
                      {movement.totalMove !== null && Math.abs(movement.totalMove) >= 0.5 && (
                        <div>📉 Total moved {movement.totalMove > 0 ? "UP" : "DOWN"} — sharp money on the {movement.totalMove > 0 ? "OVER" : "UNDER"}</div>
                      )}
                    </div>
                  )}
                  {!movement.isSharp && (
                    <div style={{ fontSize:"11px", color:"#444", lineHeight:"1.6" }}>Lines stable — no significant sharp action detected yet.</div>
                  )}
                </div>
              )}
              {game.books && game.books.length > 0 && (
                <div>
                  {game.bestLines && isPremium && (
                    <div style={{ background:"rgba(200,245,74,0.04)", border:"1px solid rgba(200,245,74,0.12)", borderRadius:"12px", padding:"12px 14px", marginBottom:"14px" }}>
                      <div style={{ fontSize:"10px", color:"#c8f54a", letterSpacing:"2px", marginBottom:"10px" }}>🏆 BEST AVAILABLE LINES</div>
                      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
                        {game.bestLines.homeSpread && <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:"8px", padding:"8px 10px" }}><div style={{ fontSize:"9px", color:"#444", marginBottom:"3px" }}>BEST SPREAD ({(game.home || "").split(" ").pop()})</div><div style={{ fontSize:"14px", color:"#c8f54a", fontWeight:"700" }}>{(game.bestLines.homeSpread.val > 0 ? "+" : "") + game.bestLines.homeSpread.val}</div><div style={{ fontSize:"9px", color:"#555" }}>{game.bestLines.homeSpread.book}</div></div>}
                        {game.bestLines.homeML    && <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:"8px", padding:"8px 10px" }}><div style={{ fontSize:"9px", color:"#444", marginBottom:"3px" }}>BEST ML ({(game.home || "").split(" ").pop()})</div><div style={{ fontSize:"14px", color:"#c8f54a", fontWeight:"700" }}>{(game.bestLines.homeML.val > 0 ? "+" : "") + game.bestLines.homeML.val}</div><div style={{ fontSize:"9px", color:"#555" }}>{game.bestLines.homeML.book}</div></div>}
                        {game.bestLines.over      && <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:"8px", padding:"8px 10px" }}><div style={{ fontSize:"9px", color:"#444", marginBottom:"3px" }}>BEST OVER</div><div style={{ fontSize:"14px", color:"#c8f54a", fontWeight:"700" }}>{(game.bestLines.over.overPrice > 0 ? "+" : "") + game.bestLines.over.overPrice}</div><div style={{ fontSize:"9px", color:"#555" }}>{game.bestLines.over.book}</div></div>}
                        {game.bestLines.under     && <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:"8px", padding:"8px 10px" }}><div style={{ fontSize:"9px", color:"#444", marginBottom:"3px" }}>BEST UNDER</div><div style={{ fontSize:"14px", color:"#c8f54a", fontWeight:"700" }}>{(game.bestLines.under.underPrice > 0 ? "+" : "") + game.bestLines.under.underPrice}</div><div style={{ fontSize:"9px", color:"#555" }}>{game.bestLines.under.book}</div></div>}
                      </div>
                    </div>
                  )}
                  <div style={{ fontSize:"10px", color:"#444", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"10px" }}>ALL BOOKS</div>
                  {game.books.map(function(b, i) {
                    var isBest = game.bestLines && isPremium && (game.bestLines.homeSpread?.book === b.book || game.bestLines.homeML?.book === b.book || game.bestLines.over?.book === b.book || game.bestLines.under?.book === b.book);
                    return (
                      <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 10px", marginBottom:"4px", borderRadius:"8px", background: isBest ? "rgba(200,245,74,0.04)" : "rgba(255,255,255,0.02)", border: isBest ? "1px solid rgba(200,245,74,0.12)" : "1px solid transparent" }}>
                        <span style={{ fontSize:"12px", color: isBest ? "#c8f54a" : "#555", fontWeight: isBest ? "600" : "400" }}>{b.book}{isBest ? " ⭐" : ""}</span>
                        <div style={{ display:"flex", gap:"10px", fontSize:"11px" }}>
                          {b.spread != null && <span style={{ color: isBest ? "#c8f54a" : "#888" }}>{b.spread > 0 ? "+" : ""}{b.spread}</span>}
                          {b.total  != null && <span style={{ color:"#777" }}>O/U {b.total}</span>}
                          {b.homeML != null && <span style={{ color: isBest ? "#c8f54a" : "#666" }}>ML {b.homeML > 0 ? "+" : ""}{b.homeML}</span>}
                        </div>
                      </div>
                    );
                  })}
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
                  <button onClick={function() { startCheckout("monthly"); }} style={{ ...S.btn, width:"auto", padding:"10px 24px", fontSize:"16px" }}>⚡ UPGRADE →</button>
                </div>
              ) : proj && proj.hasEdge ? (
                <div>
                  {Math.abs(proj.vSpread || 0) >= EDGE_MIN && (
                    <div style={{ background:"rgba(200,245,74,0.06)", border:"1px solid rgba(200,245,74,0.2)", borderRadius:"12px", padding:"16px", marginBottom:"12px" }}>
                      <div style={{ fontSize:"10px", color:"#c8f54a", letterSpacing:"2px", marginBottom:"6px" }}>⚡ SPREAD EDGE</div>
                      <div style={{ fontSize:"16px", color:"#fff", fontWeight:"700" }}>Bet {proj.vSpread > 0 ? game.home : game.away} to cover</div>
                      <div style={{ fontSize:"12px", color:"#666", marginTop:"4px" }}>Model edge: {proj.vSpread > 0 ? "+" : ""}{proj.vSpread} pts</div>
                    </div>
                  )}
                  {Math.abs(proj.vTotal || 0) >= EDGE_MIN * 1.5 && (
                    <div style={{ background:"rgba(200,245,74,0.06)", border:"1px solid rgba(200,245,74,0.2)", borderRadius:"12px", padding:"16px", marginBottom:"12px" }}>
                      <div style={{ fontSize:"10px", color:"#c8f54a", letterSpacing:"2px", marginBottom:"6px" }}>⚡ TOTAL EDGE</div>
                      <div style={{ fontSize:"16px", color:"#fff", fontWeight:"700" }}>Bet the {proj.vTotal > 0 ? "OVER" : "UNDER"}</div>
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
              {!isPremium && (
                <div style={{ textAlign:"center", padding:"30px" }}>
                  <div style={{ fontSize:"32px", marginBottom:"12px" }}>🔒</div>
                  <div style={{ fontSize:"14px", color:"#666", marginBottom:"16px" }}>Player prop edges require Premium</div>
                  <button onClick={function() { startCheckout("monthly"); }} style={{ ...S.btn, width:"auto", padding:"10px 24px" }}>⚡ UPGRADE →</button>
                </div>
              )}
              {isPremium && players.length === 0 && (
                <div style={{ textAlign:"center", padding:"30px", color:"#444", fontSize:"13px" }}>No player data for this matchup.</div>
              )}
              {isPremium && players.map(function(p, pi) {
                if (!p || !p.name) return null;
                // Match player to prop lines by last name
                var pLower = p.name.toLowerCase().trim();
                var pLast  = pLower.split(" ").pop();
                var propKey = null;
                var propKeys = Object.keys(propLines);
                for (var ki = 0; ki < propKeys.length; ki++) {
                  var k = propKeys[ki];
                  if (k === pLower || (pLast.length > 3 && k.indexOf(pLast) !== -1)) { propKey = k; break; }
                }
                var pProps = propKey ? propLines[propKey] : null;

                // Build edges
                var edges = [];
                if (pProps) {
                  var pStatKeys = Object.keys(pProps);
                  for (var si = 0; si < pStatKeys.length; si++) {
                    var sk = pStatKeys[si];
                    var pd = pProps[sk];
                    if (!pd || pd.point == null) continue;
                    var label = PROP_STAT_MAP[sk];
                    if (!label) continue;
                    var projLine = null;
                    for (var li = 0; li < p.lines.length; li++) {
                      if (p.lines[li].stat === label) { projLine = p.lines[li]; break; }
                    }
                    if (!projLine) continue;
                    var pv = parseFloat(projLine.proj);
                    if (!pv) continue;
                    var edge = +(pv - pd.point).toFixed(1);
                    edges.push({ label: label, point: pd.point, book: pd.book, pv: pv, edge: edge, hasEdge: Math.abs(edge) >= 1.5 });
                  }
                }
                var anyEdge = edges.some(function(e) { return e.hasEdge; });

                return (
                  <div key={pi} style={{ background: anyEdge ? "rgba(200,245,74,0.03)" : "rgba(255,255,255,0.02)", border: anyEdge ? "1px solid rgba(200,245,74,0.2)" : "1px solid rgba(255,255,255,0.07)", borderRadius:"10px", padding:"12px", marginBottom:"10px" }}>
                    {anyEdge && <div style={{ fontSize:"9px", color:"#c8f54a", letterSpacing:"2px", fontWeight:"700", marginBottom:"8px" }}>⚡ PROP EDGE</div>}
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
                      <div>
                        <div style={{ fontSize:"13px", color:"#ccc", fontWeight:"600" }}>{p.name}</div>
                        <div style={{ fontSize:"10px", color:"#444" }}>{p.team}</div>
                      </div>
                      <div style={{ background: p.injured ? "rgba(239,68,68,0.1)" : "rgba(200,245,74,0.1)", borderRadius:"10px", padding:"2px 10px", fontSize:"10px", color: p.injured ? "#ef4444" : "#c8f54a", fontWeight:"700" }}>{p.rec || "PROJ"}</div>
                    </div>
                    <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                      {p.lines.map(function(l, li) {
                        var edgeMatch = null;
                        for (var ei = 0; ei < edges.length; ei++) { if (edges[ei].label === l.stat) { edgeMatch = edges[ei]; break; } }
                        var hasE = edgeMatch && edgeMatch.hasEdge;
                        return (
                          <div key={li} style={{ background: hasE ? "rgba(200,245,74,0.08)" : "rgba(255,255,255,0.04)", borderRadius:"8px", padding:"6px 10px", textAlign:"center", minWidth:"68px", border: hasE ? "1px solid rgba(200,245,74,0.2)" : "none" }}>
                            <div style={{ fontSize:"9px", color: hasE ? "#c8f54a" : "#444", letterSpacing:"1px", marginBottom:"2px" }}>{l.stat}</div>
                            <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"18px", color: hasE ? "#c8f54a" : "#aaa" }}>{l.proj}</div>
                            {edgeMatch && (
                              <div style={{ fontSize:"9px", color:"#555", marginTop:"2px" }}>
                                {edgeMatch.point} line
                                {hasE && <span style={{ color:"#c8f54a", marginLeft:"3px" }}>{edgeMatch.edge > 0 ? "+" : ""}{edgeMatch.edge}</span>}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {edges.filter(function(e) { return e.hasEdge; }).map(function(e, ei) {
                      return (
                        <div key={ei} style={{ marginTop:"8px", padding:"6px 10px", background:"rgba(200,245,74,0.06)", borderRadius:"6px", fontSize:"11px", color:"#c8f54a" }}>
                          🎯 {e.pv} proj vs {e.point} line — {e.edge > 0 ? "OVER" : "UNDER"} · {e.book}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </div>,
    document.body
  );
}
