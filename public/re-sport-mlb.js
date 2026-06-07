// ── MLB TAB ──────────────────────────────────────────────────
function PitcherBadge({ pitcher, side }) {
  if (!pitcher) return null;
  const gradeColor = pitcher.grade === "ELITE" ? "#c8f54a" : pitcher.grade === "GOOD" ? "#60a5fa" : pitcher.grade === "AVG" ? "#aaa" : "#ef4444";
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"6px", padding:"5px 8px", background:"rgba(255,255,255,0.03)", borderRadius:"6px", marginBottom:"4px" }}>
      <div style={{ fontSize:"9px", color:"#444", minWidth:"30px" }}>{side}</div>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:"11px", color:"#ccc", fontWeight:"600" }}>{pitcher.name}</div>
        <div style={{ fontSize:"9px", color:"#555" }}>ERA {pitcher.era?.toFixed(2)}</div>
      </div>
      <div style={{ fontSize:"9px", fontWeight:"700", color: gradeColor, background:`${gradeColor}18`, padding:"2px 6px", borderRadius:"4px" }}>{pitcher.grade}</div>
    </div>
  );
}

function MLBGameCard({ game, liveMLB, isPremium, onSelect }) {
  const homeTeam = findTeam(game.home, MLB);
  const awayTeam = findTeam(game.away, MLB);
  const liveData = findMLBLiveData(game.home, game.away, liveMLB);
  const proj = projectBaseball(homeTeam, awayTeam, game.vegasTotal, { parkFactor: homeTeam?.park || 1.0 }, liveData);
  const hasEdge = proj?.hasEdge;

  return (
    <div onClick={() => onSelect(game)} style={{
      borderRadius:"12px",
      border: hasEdge && isPremium ? "1px solid rgba(200,245,74,0.28)" : "1px solid rgba(255,255,255,0.07)",
      background: hasEdge && isPremium ? "rgba(200,245,74,0.03)" : "rgba(255,255,255,0.02)",
      overflow:"hidden", cursor:"pointer", marginBottom:"12px"
    }}>
      {hasEdge && isPremium && (
        <div style={{ padding:"5px 14px", background:"rgba(200,245,74,0.10)", borderBottom:"1px solid rgba(200,245,74,0.15)", fontSize:"10px", color:"#c8f54a", letterSpacing:"2px", fontWeight:"700" }}>
          ⚡ EDGE DETECTED
        </div>
      )}
      {hasEdge && !isPremium && (
        <div style={{ padding:"5px 14px", background:"rgba(200,245,74,0.04)", borderBottom:"1px solid rgba(200,245,74,0.08)", fontSize:"10px", color:"#555", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span>🔒 Edge detected</span>
        </div>
      )}
      <div style={{ padding:"12px 14px" }}>
        <div style={{ fontSize:"9px", color:"#444", marginBottom:"8px" }}>MLB · {game.time}</div>

        {/* Teams + scores */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:"12px", color:"#666", marginBottom:"3px" }}>{game.away}</div>
            <div style={{ fontSize:"14px", color:"#ccc", fontWeight:"600" }}>{game.home}</div>
          </div>
          <div style={{ display:"flex", gap:"6px" }}>
            {game.vegasTotal != null && <StatPill label="O/U" val={game.vegasTotal} />}
            {proj && <StatPill label="PROJ" val={proj.projTotal} color={isPremium && Math.abs(proj.vTotal||0) >= 1.0 ? "#c8f54a" : "#aaa"} />}
            {proj && <StatPill label="WIN%" val={`${proj.homeWin}%`} />}
            {proj && isPremium && proj.vTotal != null && (
              <StatPill label="EDGE" val={`${proj.vTotal > 0 ? "+" : ""}${proj.vTotal}`} color={Math.abs(proj.vTotal) >= 1.0 ? "#c8f54a" : "#555"} />
            )}
            {proj && !isPremium && <StatPill label="EDGE" val="🔒" />}
          </div>
        </div>

        {/* Pitchers */}
        {liveData && isPremium && proj?.pitchers && (
          <div style={{ borderTop:"1px solid rgba(255,255,255,0.05)", paddingTop:"8px" }}>
            <div style={{ fontSize:"9px", color:"#444", letterSpacing:"1px", marginBottom:"6px" }}>PROBABLE PITCHERS</div>
            <PitcherBadge pitcher={proj.pitchers.away} side="AWY" />
            <PitcherBadge pitcher={proj.pitchers.home} side="HME" />
          </div>
        )}

        {/* Last 10 form */}
        {liveData && isPremium && proj?.formAdj && (
          <div style={{ display:"flex", gap:"8px", marginTop:"8px" }}>
            {proj.formAdj.awayRunsLast10 && (
              <div style={{ fontSize:"9px", color:"#555", background:"rgba(255,255,255,0.03)", padding:"3px 8px", borderRadius:"4px" }}>
                {game.away.split(" ").pop()} L10: <span style={{ color:"#aaa" }}>{proj.formAdj.awayRunsLast10.toFixed(1)} R/G</span>
              </div>
            )}
            {proj.formAdj.homeRunsLast10 && (
              <div style={{ fontSize:"9px", color:"#555", background:"rgba(255,255,255,0.03)", padding:"3px 8px", borderRadius:"4px" }}>
                {game.home.split(" ").pop()} L10: <span style={{ color:"#aaa" }}>{proj.formAdj.homeRunsLast10.toFixed(1)} R/G</span>
              </div>
            )}
          </div>
        )}

        {/* Run line call */}
        {proj?.runLineEdge && isPremium && (
          <div style={{ marginTop:"8px", padding:"5px 10px", background:"rgba(200,245,74,0.06)", borderRadius:"6px", fontSize:"11px", color:"#c8f54a" }}>
            🏃 Run Line Value: {proj.runLineEdge}
          </div>
        )}
      </div>
    </div>
  );
}

function MLBTab({ isPremium }) {
  const [games, setGames]       = useState([]);
  const [liveMLB, setLiveMLB]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);

  // Manual projector state
  const [home, setHome]   = useState("");
  const [away, setAway]   = useState("");
  const [total, setTotal] = useState("");
  const [result, setResult] = useState(null);
  const teams = Object.keys(MLB).sort();

  useEffect(() => {
    // Fetch odds + live MLB data in parallel
    Promise.all([
      fetchOdds("baseball_mlb", "spreads,totals,h2h")
        .then(data => (data || []).map(g => parseGame(g, "MLB")))
        .catch(() => []),
      fetchMLBLive().catch(() => []),
    ]).then(([oddsGames, mlbData]) => {
      setGames(oddsGames);
      setLiveMLB(mlbData);
    }).finally(() => setLoading(false));
  }, []);

  const runManual = () => {
    const h = MLB[home];
    const a = MLB[away];
    if (!h || !a) return;
    // Try to find live data for manual selection too
    const liveData = findMLBLiveData(home, away, liveMLB);
    setResult(projectBaseball(h, a, total, { parkFactor: h.park }, liveData));
  };

  return (
    <div>
      {/* Live games list */}
      <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"14px" }}>
        ⚾ MLB · Today's Games {liveMLB.length > 0 && <span style={{ color:"#c8f54a" }}>· Live Data Active</span>}
      </div>

      {loading && <div style={{ color:"#444", fontSize:"12px", textAlign:"center", padding:"20px" }}>Loading games...</div>}
      {!loading && games.length === 0 && <div style={{ color:"#444", fontSize:"12px", textAlign:"center", padding:"20px" }}>No MLB games scheduled right now.</div>}

      {games.map((g, i) => (
        <MLBGameCard key={g.id || i} game={g} liveMLB={liveMLB} isPremium={isPremium} onSelect={setSelectedGame} />
      ))}

      {/* Manual projector */}
      <div style={S.card}>
        <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", marginBottom:"14px", textTransform:"uppercase" }}>⚾ Manual Matchup Projector</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"10px" }}>
          <div><label style={S.lbl}>Away Team</label><select style={S.sel} value={away} onChange={e => { setAway(e.target.value); setResult(null); }}><option value="">Select...</option>{teams.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div><label style={S.lbl}>Home Team</label><select style={S.sel} value={home} onChange={e => { setHome(e.target.value); setResult(null); }}><option value="">Select...</option>{teams.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div style={{ gridColumn:"1/-1" }}><label style={S.lbl}>Vegas Total</label><input style={S.input} type="number" step="0.5" placeholder="8.5" value={total} onChange={e => setTotal(e.target.value)} /></div>
        </div>
        <button style={S.btn} onClick={runManual} disabled={!home || !away}>RUN PROJECTION →</button>
      </div>

      {result && (
        <div style={S.card}>
          {result.hasEdge && isPremium && <div style={{ background:"rgba(200,245,74,0.1)", borderRadius:"8px", padding:"8px 12px", marginBottom:"12px", fontSize:"11px", color:"#c8f54a", fontWeight:"700" }}>⚡ TOTAL EDGE DETECTED</div>}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"8px", marginBottom:"8px" }}>
            <StatPill label="Proj Score" val={`${result.aScore}-${result.hScore}`} color="#aaa" />
            <StatPill label="Proj Total" val={result.projTotal} color={isPremium && Math.abs(result.vTotal||0) >= 1.0 ? "#c8f54a" : "#aaa"} />
            <StatPill label={`${away.split(" ").pop() || "Away"} Win%`} val={`${result.awayWin}%`} />
            <StatPill label={`${home.split(" ").pop() || "Home"} Win%`} val={`${result.homeWin}%`} />
          </div>
          {isPremium && result.vTotal != null && (
            <StatPill label="Total Edge" val={`${result.vTotal > 0 ? "+" : ""}${result.vTotal}`} color={Math.abs(result.vTotal) >= 1.0 ? "#c8f54a" : "#555"} />
          )}
          {isPremium && result.runLineEdge && (
            <div style={{ marginTop:"10px", padding:"8px 12px", background:"rgba(200,245,74,0.06)", borderRadius:"8px", fontSize:"12px", color:"#c8f54a" }}>
              🏃 Run Line: {result.runLineEdge} shows value
            </div>
          )}
          {result.pitchers && isPremium && (
            <div style={{ marginTop:"12px", borderTop:"1px solid rgba(255,255,255,0.05)", paddingTop:"10px" }}>
              <div style={{ fontSize:"9px", color:"#444", letterSpacing:"1px", marginBottom:"6px" }}>PROBABLE PITCHERS</div>
              <PitcherBadge pitcher={result.pitchers.away} side="AWY" />
              <PitcherBadge pitcher={result.pitchers.home} side="HME" />
            </div>
          )}
        </div>
      )}

      {selectedGame && <GameDetailModal game={selectedGame} sport="mlb" isPremium={isPremium} onClose={() => setSelectedGame(null)} />}
    </div>
  );
}

// ── COLLEGE BASEBALL TAB ─────────────────────────────────────
function CollegeBaseballTab({ isPremium }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);

  useEffect(() => {
    fetchCollegeBaseball()
      .then(data => setGames((data || []).map(g => parseGame(g, "College Baseball"))))
      .catch(() => setGames([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"14px" }}>⚾ College Baseball</div>
      {loading && <div style={{ color:"#444", fontSize:"12px", textAlign:"center", padding:"20px" }}>Loading games...</div>}
      {!loading && games.length === 0 && <div style={{ color:"#444", fontSize:"12px", textAlign:"center", padding:"20px" }}>No college baseball games scheduled right now.</div>}
      {games.map((g, i) => (
        <div key={g.id || i} onClick={() => setSelectedGame(g)} style={{ ...S.card, cursor:"pointer" }}>
          <div style={{ fontSize:"10px", color:"#444", marginBottom:"6px" }}>🕐 {g.time}</div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div><div style={{ fontSize:"12px", color:"#666", marginBottom:"3px" }}>{g.away}</div><div style={{ fontSize:"14px", color:"#ccc", fontWeight:"600" }}>{g.home}</div></div>
            <div style={{ display:"flex", gap:"8px" }}>
              {g.vegasTotal != null && <StatPill label="O/U" val={g.vegasTotal} />}
              {g.homeML     != null && <StatPill label="ML"  val={`${g.homeML > 0 ? "+" : ""}${g.homeML}`} />}
            </div>
          </div>
        </div>
      ))}
      {selectedGame && <GameDetailModal game={selectedGame} sport="ncaab" isPremium={isPremium} onClose={() => setSelectedGame(null)} />}
    </div>
  );
}

// ── COLLEGE SOFTBALL TAB ─────────────────────────────────────
function CollegeSoftballTab({ isPremium }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);

  useEffect(() => {
    fetchCollegeSoftball()
      .then(data => setGames((data || []).map(g => parseGame(g, "College Softball"))))
      .catch(() => setGames([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"14px" }}>🥎 College Softball</div>
      {loading && <div style={{ color:"#444", fontSize:"12px", textAlign:"center", padding:"20px" }}>Loading games...</div>}
      {!loading && games.length === 0 && <div style={{ color:"#444", fontSize:"12px", textAlign:"center", padding:"20px" }}>No college softball games scheduled right now.</div>}
      {games.map((g, i) => (
        <div key={g.id || i} onClick={() => setSelectedGame(g)} style={{ ...S.card, cursor:"pointer" }}>
          <div style={{ fontSize:"10px", color:"#444", marginBottom:"6px" }}>🕐 {g.time}</div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div><div style={{ fontSize:"12px", color:"#666", marginBottom:"3px" }}>{g.away}</div><div style={{ fontSize:"14px", color:"#ccc", fontWeight:"600" }}>{g.home}</div></div>
            <div style={{ display:"flex", gap:"8px" }}>
              {g.vegasTotal != null && <StatPill label="O/U" val={g.vegasTotal} />}
              {g.homeML     != null && <StatPill label="ML"  val={`${g.homeML > 0 ? "+" : ""}${g.homeML}`} />}
            </div>
          </div>
        </div>
      ))}
      {selectedGame && <GameDetailModal game={selectedGame} sport="softball" isPremium={isPremium} onClose={() => setSelectedGame(null)} />}
    </div>
  );
}
