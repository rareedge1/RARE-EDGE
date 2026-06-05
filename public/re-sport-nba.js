// ── NBA TAB ──────────────────────────────────────────────────
function NBATab({ isPremium }) {
  const [home, setHome] = useState("");
  const [away, setAway] = useState("");
  const [spread, setSpread] = useState("");
  const [total, setTotal] = useState("");
  const [b2bHome, setB2bHome] = useState(false);
  const [b2bAway, setB2bAway] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const teams = Object.keys(NBA).sort();

  const run = () => {
    const h = NBA[home], a = NBA[away];
    if (!h || !a) return;
    setResult(projectBasketball(h, a, spread, total, { b2bHome, b2bAway }));
  };

  return (
    <div>
      <LiveGamesStrip sportId="basketball_nba" sportLabel="NBA" onGameSelect={setSelectedGame} />
      <div style={S.card}>
        <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", marginBottom:"14px", textTransform:"uppercase" }}>🏀 NBA Matchup Projector</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"10px" }}>
          <div><label style={S.lbl}>Away Team</label><select style={S.sel} value={away} onChange={e => { setAway(e.target.value); setResult(null); }}><option value="">Select...</option>{teams.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div><label style={S.lbl}>Home Team</label><select style={S.sel} value={home} onChange={e => { setHome(e.target.value); setResult(null); }}><option value="">Select...</option>{teams.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div><label style={S.lbl}>Vegas Spread (home)</label><input style={S.input} type="number" step="0.5" placeholder="-4.5" value={spread} onChange={e => setSpread(e.target.value)} /></div>
          <div><label style={S.lbl}>Vegas Total</label><input style={S.input} type="number" step="0.5" placeholder="224.5" value={total} onChange={e => setTotal(e.target.value)} /></div>
        </div>
        <div style={{ display:"flex", gap:"16px", marginBottom:"12px" }}>
          <label style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"12px", color:"#666", cursor:"pointer" }}>
            <input type="checkbox" checked={b2bAway} onChange={e => setB2bAway(e.target.checked)} /> Away B2B
          </label>
          <label style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"12px", color:"#666", cursor:"pointer" }}>
            <input type="checkbox" checked={b2bHome} onChange={e => setB2bHome(e.target.checked)} /> Home B2B
          </label>
        </div>
        <button style={S.btn} onClick={run} disabled={!home || !away}>RUN PROJECTION →</button>
      </div>

      {result && (
        <div style={{ ...S.card, border: result.hasEdge && isPremium ? "1px solid rgba(200,245,74,0.3)" : undefined }}>
          {result.hasEdge && isPremium && <div style={{ background:"rgba(200,245,74,0.1)", borderRadius:"8px", padding:"8px 12px", marginBottom:"12px", fontSize:"11px", color:"#c8f54a", fontWeight:"700", letterSpacing:"1px" }}>⚡ EDGE DETECTED</div>}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"8px", marginBottom:"8px" }}>
            <StatPill label="Proj Score" val={`${result.awayScore}-${result.homeScore}`} color="#aaa" />
            <StatPill label="Proj Total" val={result.projTotal} color={isPremium && Math.abs(result.vTotal||0) >= EDGE_MIN*1.5 ? "#c8f54a" : "#aaa"} />
            <StatPill label={`${away.split(" ").pop() || "Away"} Win%`} val={`${result.awayWin}%`} />
            <StatPill label={`${home.split(" ").pop() || "Home"} Win%`} val={`${result.homeWin}%`} />
          </div>
          {isPremium && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px" }}>
              <StatPill label="Spread Edge" val={result.vSpread != null ? `${result.vSpread > 0 ? "+" : ""}${result.vSpread}` : "—"} color={result.vSpread != null && Math.abs(result.vSpread) >= EDGE_MIN ? "#c8f54a" : "#555"} />
              <StatPill label="Total Edge"  val={result.vTotal  != null ? `${result.vTotal  > 0 ? "+" : ""}${result.vTotal}`  : "—"} color={result.vTotal  != null && Math.abs(result.vTotal)  >= EDGE_MIN*1.5 ? "#c8f54a" : "#555"} />
            </div>
          )}
        </div>
      )}
      {selectedGame && <GameDetailModal game={selectedGame} sport="nba" isPremium={isPremium} onClose={() => setSelectedGame(null)} />}
    </div>
  );
}

// ── NCAA BASKETBALL TAB ──────────────────────────────────────
function NCAABTab({ isPremium }) {
  const [home, setHome] = useState("");
  const [away, setAway] = useState("");
  const [spread, setSpread] = useState("");
  const [total, setTotal] = useState("");
  const [result, setResult] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);

  const run = () => {
    if (!home.trim() || !away.trim()) return;
    const h = { ortg:108.4, drtg:102.8, pace:70.2 };
    const a = { ortg:107.6, drtg:103.4, pace:69.8 };
    setResult(projectBasketball(h, a, spread, total, { homeAdv:4.5 }));
  };

  return (
    <div>
      <LiveGamesStrip sportId="basketball_ncaab" sportLabel="NCAA Hoops" onGameSelect={setSelectedGame} />
      <div style={S.card}>
        <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", marginBottom:"14px", textTransform:"uppercase" }}>🏀 NCAA Basketball Projector</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"10px" }}>
          <div><label style={S.lbl}>Away</label><input style={S.input} placeholder="e.g. Duke" value={away} onChange={e => { setAway(e.target.value); setResult(null); }} /></div>
          <div><label style={S.lbl}>Home</label><input style={S.input} placeholder="e.g. Kansas" value={home} onChange={e => { setHome(e.target.value); setResult(null); }} /></div>
          <div><label style={S.lbl}>Spread (home)</label><input style={S.input} type="number" step="0.5" placeholder="-6.5" value={spread} onChange={e => setSpread(e.target.value)} /></div>
          <div><label style={S.lbl}>Total</label><input style={S.input} type="number" step="0.5" placeholder="145.5" value={total} onChange={e => setTotal(e.target.value)} /></div>
        </div>
        <button style={S.btn} onClick={run} disabled={!home.trim() || !away.trim()}>RUN PROJECTION →</button>
      </div>
      {result && (
        <div style={S.card}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"8px" }}>
            <StatPill label="Proj Score" val={`${result.awayScore}-${result.homeScore}`} color="#aaa" />
            <StatPill label="Proj Total" val={result.projTotal} color="#aaa" />
            <StatPill label={`${away || "Away"} Win%`} val={`${result.awayWin}%`} />
            <StatPill label={`${home || "Home"} Win%`} val={`${result.homeWin}%`} />
          </div>
        </div>
      )}
      {selectedGame && <GameDetailModal game={selectedGame} sport="ncaab" isPremium={isPremium} onClose={() => setSelectedGame(null)} />}
    </div>
  );
}

// ── WNBA TAB ─────────────────────────────────────────────────
function WNBATab({ isPremium }) {
  const [home, setHome] = useState("");
  const [away, setAway] = useState("");
  const [spread, setSpread] = useState("");
  const [total, setTotal] = useState("");
  const [b2bHome, setB2bHome] = useState(false);
  const [b2bAway, setB2bAway] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const teams = Object.keys(WNBA).sort();

  const run = () => {
    const h = WNBA[home], a = WNBA[away];
    if (!h || !a) return;
    setResult(projectBasketball(h, a, spread, total, { homeAdv:2.5, b2bHome, b2bAway }));
  };

  return (
    <div>
      <LiveGamesStrip sportId="basketball_wnba" sportLabel="WNBA" onGameSelect={setSelectedGame} />
      <div style={S.card}>
        <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", marginBottom:"14px", textTransform:"uppercase" }}>🏀 WNBA Projector</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"10px" }}>
          <div><label style={S.lbl}>Away</label><select style={S.sel} value={away} onChange={e => { setAway(e.target.value); setResult(null); }}><option value="">Select...</option>{teams.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div><label style={S.lbl}>Home</label><select style={S.sel} value={home} onChange={e => { setHome(e.target.value); setResult(null); }}><option value="">Select...</option>{teams.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div><label style={S.lbl}>Spread (home)</label><input style={S.input} type="number" step="0.5" value={spread} onChange={e => setSpread(e.target.value)} /></div>
          <div><label style={S.lbl}>Total</label><input style={S.input} type="number" step="0.5" value={total} onChange={e => setTotal(e.target.value)} /></div>
        </div>
        <div style={{ display:"flex", gap:"16px", marginBottom:"12px" }}>
          <label style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"12px", color:"#666", cursor:"pointer" }}><input type="checkbox" checked={b2bAway} onChange={e => setB2bAway(e.target.checked)} /> Away B2B</label>
          <label style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"12px", color:"#666", cursor:"pointer" }}><input type="checkbox" checked={b2bHome} onChange={e => setB2bHome(e.target.checked)} /> Home B2B</label>
        </div>
        <button style={S.btn} onClick={run} disabled={!home || !away}>RUN PROJECTION →</button>
      </div>
      {result && (
        <div style={S.card}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"8px" }}>
            <StatPill label="Proj Score" val={`${result.awayScore}-${result.homeScore}`} color="#aaa" />
            <StatPill label="Proj Total" val={result.projTotal} color="#aaa" />
            <StatPill label={`${away.split(" ").pop() || "Away"} Win%`} val={`${result.awayWin}%`} />
            <StatPill label={`${home.split(" ").pop() || "Home"} Win%`} val={`${result.homeWin}%`} />
          </div>
        </div>
      )}
      {selectedGame && <GameDetailModal game={selectedGame} sport="wnba" isPremium={isPremium} onClose={() => setSelectedGame(null)} />}
    </div>
  );
}
