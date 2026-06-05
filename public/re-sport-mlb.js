// ── MLB TAB ──────────────────────────────────────────────────
function MLBTab({ isPremium }) {
  const [home, setHome] = useState("");
  const [away, setAway] = useState("");
  const [total, setTotal] = useState("");
  const [hERA, setHERA] = useState("");
  const [aERA, setAERA] = useState("");
  const [result, setResult] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const teams = Object.keys(MLB).sort();

  const run = () => {
    let h = MLB[home], a = MLB[away];
    if (!h || !a) return;
    if (hERA) h = { ...h, era: parseFloat(hERA) };
    if (aERA) a = { ...a, era: parseFloat(aERA) };
    setResult(projectBaseball(h, a, total, { parkFactor: h.park }));
  };

  return (
    <div>
      <LiveGamesStrip sportId="baseball_mlb" sportLabel="MLB" onGameSelect={setSelectedGame} />
      <div style={S.card}>
        <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", marginBottom:"14px", textTransform:"uppercase" }}>⚾ MLB Matchup Projector</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"10px" }}>
          <div><label style={S.lbl}>Away Team</label><select style={S.sel} value={away} onChange={e => { setAway(e.target.value); setResult(null); }}><option value="">Select...</option>{teams.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div><label style={S.lbl}>Home Team</label><select style={S.sel} value={home} onChange={e => { setHome(e.target.value); setResult(null); }}><option value="">Select...</option>{teams.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div><label style={S.lbl}>Away SP ERA (optional)</label><input style={S.input} type="number" step="0.01" placeholder="3.45" value={aERA} onChange={e => setAERA(e.target.value)} /></div>
          <div><label style={S.lbl}>Home SP ERA (optional)</label><input style={S.input} type="number" step="0.01" placeholder="2.98" value={hERA} onChange={e => setHERA(e.target.value)} /></div>
          <div style={{ gridColumn:"1/-1" }}><label style={S.lbl}>Vegas Total</label><input style={S.input} type="number" step="0.5" placeholder="8.5" value={total} onChange={e => setTotal(e.target.value)} /></div>
        </div>
        <button style={S.btn} onClick={run} disabled={!home || !away}>RUN PROJECTION →</button>
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
        <div key={g.id || i} onClick={() => setSelectedGame(g)}
          style={{ ...S.card, cursor:"pointer" }}>
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
        <div key={g.id || i} onClick={() => setSelectedGame(g)}
          style={{ ...S.card, cursor:"pointer" }}>
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
