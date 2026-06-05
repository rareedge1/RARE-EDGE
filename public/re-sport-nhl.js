// ── NHL TAB ──────────────────────────────────────────────────
function NHLTab({ isPremium }) {
  const [home, setHome] = useState("");
  const [away, setAway] = useState("");
  const [total, setTotal] = useState("");
  const [result, setResult] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const teams = Object.keys(NHL).sort();

  const run = () => {
    const h = NHL[home], a = NHL[away];
    if (!h || !a) return;
    setResult(projectHockey(h, a, total));
  };

  return (
    <div>
      <LiveGamesStrip sportId="icehockey_nhl" sportLabel="NHL" onGameSelect={setSelectedGame} />
      <div style={S.card}>
        <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", marginBottom:"14px", textTransform:"uppercase" }}>🏒 NHL Matchup Projector</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"10px" }}>
          <div><label style={S.lbl}>Away Team</label><select style={S.sel} value={away} onChange={e => { setAway(e.target.value); setResult(null); }}><option value="">Select...</option>{teams.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div><label style={S.lbl}>Home Team</label><select style={S.sel} value={home} onChange={e => { setHome(e.target.value); setResult(null); }}><option value="">Select...</option>{teams.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div style={{ gridColumn:"1/-1" }}><label style={S.lbl}>Vegas Total (Puck Line)</label><input style={S.input} type="number" step="0.5" placeholder="5.5" value={total} onChange={e => setTotal(e.target.value)} /></div>
        </div>
        <button style={S.btn} onClick={run} disabled={!home || !away}>RUN PROJECTION →</button>
      </div>

      {result && (
        <div style={S.card}>
          {result.hasEdge && isPremium && <div style={{ background:"rgba(200,245,74,0.1)", borderRadius:"8px", padding:"8px 12px", marginBottom:"12px", fontSize:"11px", color:"#c8f54a", fontWeight:"700" }}>⚡ TOTAL EDGE DETECTED</div>}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"8px" }}>
            <StatPill label="Proj Score" val={`${result.aScore}-${result.hScore}`} color="#aaa" />
            <StatPill label="Proj Total" val={result.projTotal} color={isPremium && Math.abs(result.vTotal||0) >= 0.5 ? "#c8f54a" : "#aaa"} />
            <StatPill label={`${away.split(" ").pop() || "Away"} Win%`} val={`${result.awayWin}%`} />
            <StatPill label={`${home.split(" ").pop() || "Home"} Win%`} val={`${result.homeWin}%`} />
          </div>
          {isPremium && result.vTotal != null && (
            <div style={{ marginTop:"8px" }}>
              <StatPill label="Total Edge" val={`${result.vTotal > 0 ? "+" : ""}${result.vTotal}`} color={Math.abs(result.vTotal) >= 0.5 ? "#c8f54a" : "#555"} />
            </div>
          )}
        </div>
      )}
      {selectedGame && <GameDetailModal game={selectedGame} sport="nhl" isPremium={isPremium} onClose={() => setSelectedGame(null)} />}
    </div>
  );
}
