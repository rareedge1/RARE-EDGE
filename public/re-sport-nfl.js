// ── NFL TAB ──────────────────────────────────────────────────
function NFLTab({ isPremium }) {
  const [home, setHome] = useState("");
  const [away, setAway] = useState("");
  const [spread, setSpread] = useState("");
  const [total, setTotal] = useState("");
  const [result, setResult] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);

  const teams = Object.keys(NFL).sort();

  const run = () => {
    const h = NFL[home], a = NFL[away];
    if (!h || !a) return;
    setResult(projectFootball(h, a, spread, total));
  };

  return (
    <div>
      <LiveGamesStrip sportId="americanfootball_nfl" sportLabel="NFL" onGameSelect={setSelectedGame} />

      <div style={S.card}>
        <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", marginBottom:"14px", textTransform:"uppercase" }}>🏈 NFL Matchup Projector</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"10px" }}>
          <div>
            <label style={S.lbl}>Away Team</label>
            <select style={S.sel} value={away} onChange={e => { setAway(e.target.value); setResult(null); }}>
              <option value="">Select...</option>
              {teams.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={S.lbl}>Home Team</label>
            <select style={S.sel} value={home} onChange={e => { setHome(e.target.value); setResult(null); }}>
              <option value="">Select...</option>
              {teams.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={S.lbl}>Vegas Spread (home)</label>
            <input style={S.input} type="number" step="0.5" placeholder="-3.5" value={spread} onChange={e => setSpread(e.target.value)} />
          </div>
          <div>
            <label style={S.lbl}>Vegas Total</label>
            <input style={S.input} type="number" step="0.5" placeholder="47.5" value={total} onChange={e => setTotal(e.target.value)} />
          </div>
        </div>
        <button style={S.btn} onClick={run} disabled={!home || !away}>RUN PROJECTION →</button>
      </div>

      {result && (
        <div style={{ ...S.card, border: result.hasEdge && isPremium ? "1px solid rgba(200,245,74,0.3)" : undefined }}>
          {result.hasEdge && isPremium && (
            <div style={{ background:"rgba(200,245,74,0.1)", borderRadius:"8px", padding:"8px 12px", marginBottom:"12px", fontSize:"11px", color:"#c8f54a", fontWeight:"700", letterSpacing:"1px" }}>
              ⚡ EDGE DETECTED
            </div>
          )}
          {!isPremium && result.hasEdge && (
            <div style={{ background:"rgba(200,245,74,0.04)", borderRadius:"8px", padding:"8px 12px", marginBottom:"12px", fontSize:"11px", color:"#555", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span>🔒 Edge detected — upgrade to see</span>
              <button onClick={() => startCheckout("monthly")} style={{ background:"#c8f54a", border:"none", borderRadius:"6px", padding:"4px 10px", fontSize:"10px", fontWeight:"700", cursor:"pointer", color:"#000" }}>UPGRADE</button>
            </div>
          )}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"8px" }}>
            <StatPill label="Proj Spread" val={`${result.projSpread > 0 ? "+" : ""}${result.projSpread}`} color={isPremium && Math.abs(result.vSpread||0) >= EDGE_MIN ? "#c8f54a" : "#aaa"} />
            <StatPill label="Proj Total"  val={result.projTotal} color={isPremium && Math.abs(result.vTotal||0) >= EDGE_MIN*1.5 ? "#c8f54a" : "#aaa"} />
            <StatPill label={`${away.split(" ").pop() || "Away"} Win%`} val={`${result.awayWin}%`} />
            <StatPill label={`${home.split(" ").pop() || "Home"} Win%`} val={`${result.homeWin}%`} />
          </div>
          {isPremium && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginTop:"8px" }}>
              <StatPill label="Spread Edge" val={result.vSpread != null ? `${result.vSpread > 0 ? "+" : ""}${result.vSpread}` : "—"} color={result.vSpread != null && Math.abs(result.vSpread) >= EDGE_MIN ? "#c8f54a" : "#555"} />
              <StatPill label="Total Edge"  val={result.vTotal  != null ? `${result.vTotal  > 0 ? "+" : ""}${result.vTotal}`  : "—"} color={result.vTotal  != null && Math.abs(result.vTotal)  >= EDGE_MIN*1.5 ? "#c8f54a" : "#555"} />
            </div>
          )}
        </div>
      )}

      {selectedGame && (
        <GameDetailModal game={selectedGame} sport="nfl" isPremium={isPremium} onClose={() => setSelectedGame(null)} />
      )}
    </div>
  );
}

// ── NCAA FOOTBALL TAB ────────────────────────────────────────
function NCAAFTab({ isPremium }) {
  const [home, setHome] = useState("");
  const [away, setAway] = useState("");
  const [spread, setSpread] = useState("");
  const [total, setTotal] = useState("");
  const [result, setResult] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);

  const run = () => {
    if (!home.trim() || !away.trim()) return;
    const h = { off:28.5, def:24.2, pace:68 };
    const a = { off:27.8, def:25.1, pace:67 };
    setResult(projectFootball(h, a, spread, total, { homeAdv:4.2 }));
  };

  return (
    <div>
      <LiveGamesStrip sportId="americanfootball_ncaaf" sportLabel="NCAA Football" onGameSelect={setSelectedGame} />
      <div style={S.card}>
        <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", marginBottom:"14px", textTransform:"uppercase" }}>🏈 NCAA Football Projector</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"10px" }}>
          <div>
            <label style={S.lbl}>Away Team</label>
            <input style={S.input} placeholder="e.g. Alabama" value={away} onChange={e => { setAway(e.target.value); setResult(null); }} />
          </div>
          <div>
            <label style={S.lbl}>Home Team</label>
            <input style={S.input} placeholder="e.g. Georgia" value={home} onChange={e => { setHome(e.target.value); setResult(null); }} />
          </div>
          <div>
            <label style={S.lbl}>Vegas Spread (home)</label>
            <input style={S.input} type="number" step="0.5" placeholder="-7.0" value={spread} onChange={e => setSpread(e.target.value)} />
          </div>
          <div>
            <label style={S.lbl}>Vegas Total</label>
            <input style={S.input} type="number" step="0.5" placeholder="52.5" value={total} onChange={e => setTotal(e.target.value)} />
          </div>
        </div>
        <button style={S.btn} onClick={run} disabled={!home.trim() || !away.trim()}>RUN PROJECTION →</button>
      </div>
      {result && (
        <div style={{ ...S.card }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"8px" }}>
            <StatPill label="Proj Spread" val={`${result.projSpread > 0 ? "+" : ""}${result.projSpread}`} color={isPremium && Math.abs(result.vSpread||0) >= EDGE_MIN ? "#c8f54a" : "#aaa"} />
            <StatPill label="Proj Total"  val={result.projTotal} color="#aaa" />
            <StatPill label={`${away || "Away"} Win%`} val={`${result.awayWin}%`} />
            <StatPill label={`${home || "Home"} Win%`} val={`${result.homeWin}%`} />
          </div>
        </div>
      )}
      {selectedGame && <GameDetailModal game={selectedGame} sport="ncaaf" isPremium={isPremium} onClose={() => setSelectedGame(null)} />}
    </div>
  );
}

// ── UFL TAB ──────────────────────────────────────────────────
function UFLTab({ isPremium }) {
  const [home, setHome] = useState("");
  const [away, setAway] = useState("");
  const [spread, setSpread] = useState("");
  const [total, setTotal] = useState("");
  const [result, setResult] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const teams = Object.keys(UFL).sort();

  const run = () => {
    const h = UFL[home], a = UFL[away];
    if (!h || !a) return;
    setResult(projectFootball(h, a, spread, total, { homeAdv:3.0 }));
  };

  return (
    <div>
      <LiveGamesStrip sportId="americanfootball_ufl" sportLabel="UFL" onGameSelect={setSelectedGame} />
      <div style={S.card}>
        <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", marginBottom:"14px", textTransform:"uppercase" }}>🏈 UFL Projector</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"10px" }}>
          <div><label style={S.lbl}>Away</label><select style={S.sel} value={away} onChange={e => { setAway(e.target.value); setResult(null); }}><option value="">Select...</option>{teams.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div><label style={S.lbl}>Home</label><select style={S.sel} value={home} onChange={e => { setHome(e.target.value); setResult(null); }}><option value="">Select...</option>{teams.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div><label style={S.lbl}>Spread (home)</label><input style={S.input} type="number" step="0.5" value={spread} onChange={e => setSpread(e.target.value)} /></div>
          <div><label style={S.lbl}>Total</label><input style={S.input} type="number" step="0.5" value={total} onChange={e => setTotal(e.target.value)} /></div>
        </div>
        <button style={S.btn} onClick={run} disabled={!home || !away}>RUN PROJECTION →</button>
      </div>
      {result && (
        <div style={S.card}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"8px" }}>
            <StatPill label="Proj Spread" val={`${result.projSpread > 0 ? "+" : ""}${result.projSpread}`} color="#aaa" />
            <StatPill label="Proj Total" val={result.projTotal} color="#aaa" />
            <StatPill label={`${away.split(" ").pop()} Win%`} val={`${result.awayWin}%`} />
            <StatPill label={`${home.split(" ").pop()} Win%`} val={`${result.homeWin}%`} />
          </div>
        </div>
      )}
      {selectedGame && <GameDetailModal game={selectedGame} sport="ufl" isPremium={isPremium} onClose={() => setSelectedGame(null)} />}
    </div>
  );
}
