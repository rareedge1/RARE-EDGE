// ── NBA GAME CARD ─────────────────────────────────────────────
function NBAGameCard({ game, liveNBA, isPremium, onSelect }) {
  const getLiveTeam = (name) => {
    const shortName = name?.split(" ").pop();
    const liveEntry = liveNBA[shortName] ||
      Object.entries(liveNBA).find(([k]) => name?.includes(k) || k.includes(shortName))?.[1];
    if (liveEntry) {
      // Use L10 to adjust ortg/drtg from static base
      const base = findTeam(name, NBA) || { ortg:113, drtg:113, pace:98 };
      const w = liveEntry.last10?.winsL10 ?? 5;
      const ortgAdj = (w - 5) * 1.2;
      const drtgAdj = (5 - w) * 1.2;
      return {
        ortg: base.ortg + ortgAdj,
        drtg: base.drtg + drtgAdj,
        pace: base.pace,
        last10: liveEntry.last10,
      };
    }
    return findTeam(name, NBA);
  };

  const homeTeam = getLiveTeam(game.home);
  const awayTeam = getLiveTeam(game.away);
  const proj = projectBasketball(homeTeam, awayTeam, game.vegasSpread, game.vegasTotal);
  const hasEdge = proj?.hasEdge;
  const isLive = Object.keys(liveNBA || {}).length > 0;

  // Get last 10 record
  const homeLast10 = Object.entries(liveNBA || {}).find(([k]) => game.home?.includes(k) || k.includes(game.home?.split(" ").pop()))?.[1]?.last10;
  const awayLast10 = Object.entries(liveNBA || {}).find(([k]) => game.away?.includes(k) || k.includes(game.away?.split(" ").pop()))?.[1]?.last10;

  return (
    <div onClick={() => onSelect(game)} style={{
      borderRadius:"12px",
      border: hasEdge && isPremium ? "1px solid rgba(200,245,74,0.28)" : "1px solid rgba(255,255,255,0.07)",
      background: hasEdge && isPremium ? "rgba(200,245,74,0.03)" : "rgba(255,255,255,0.02)",
      overflow:"hidden", cursor:"pointer", marginBottom:"12px"
    }}>
      {hasEdge && isPremium && (
        <div style={{ padding:"5px 14px", background:"rgba(200,245,74,0.10)", borderBottom:"1px solid rgba(200,245,74,0.15)", fontSize:"10px", color:"#c8f54a", letterSpacing:"2px", fontWeight:"700" }}>⚡ EDGE DETECTED</div>
      )}
      {hasEdge && !isPremium && (
        <div style={{ padding:"5px 14px", background:"rgba(200,245,74,0.04)", borderBottom:"1px solid rgba(200,245,74,0.08)", fontSize:"10px", color:"#555", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span>🔒 Edge detected</span>
        </div>
      )}
      <div style={{ padding:"12px 14px" }}>
        <div style={{ fontSize:"9px", color:"#444", marginBottom:"8px" }}>
          NBA · {game.time} {isLive && isPremium && <span style={{ color:"#c8f54a" }}>· Live Stats</span>}
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:"12px", color:"#666", marginBottom:"3px" }}>{game.away}</div>
            <div style={{ fontSize:"14px", color:"#ccc", fontWeight:"600" }}>{game.home}</div>
          </div>
          <div style={{ display:"flex", gap:"6px" }}>
            {game.vegasSpread != null && <StatPill label="SPREAD" val={`${game.vegasSpread > 0 ? "+" : ""}${game.vegasSpread}`} />}
            {game.vegasTotal  != null && <StatPill label="O/U"    val={game.vegasTotal} />}
            {proj && <StatPill label="PROJ" val={proj.projTotal} color={isPremium && Math.abs(proj.vTotal||0) >= EDGE_MIN*1.5 ? "#c8f54a" : "#aaa"} />}
            {proj && <StatPill label="WIN%" val={`${proj.homeWin}%`} />}
            {proj && isPremium && proj.vSpread != null && <StatPill label="EDGE" val={`${proj.vSpread > 0 ? "+" : ""}${proj.vSpread}`} color={Math.abs(proj.vSpread) >= EDGE_MIN ? "#c8f54a" : "#555"} />}
            {proj && !isPremium && <StatPill label="EDGE" val="🔒" />}
          </div>
        </div>
        {/* Last 10 form */}
        {isPremium && (homeLast10 || awayLast10) && (
          <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
            {awayLast10 && (awayLast10.winsL10 + awayLast10.lossesL10 > 0) && (
              <div style={{ fontSize:"9px", color:"#555", background:"rgba(255,255,255,0.03)", padding:"3px 8px", borderRadius:"4px" }}>
                {game.away?.split(" ").pop()} L10: <span style={{ color: awayLast10.winsL10 >= 7 ? "#c8f54a" : awayLast10.winsL10 <= 3 ? "#ef4444" : "#aaa" }}>{awayLast10.winsL10}-{awayLast10.lossesL10}</span>
              </div>
            )}
            {homeLast10 && (homeLast10.winsL10 + homeLast10.lossesL10 > 0) && (
              <div style={{ fontSize:"9px", color:"#555", background:"rgba(255,255,255,0.03)", padding:"3px 8px", borderRadius:"4px" }}>
                {game.home?.split(" ").pop()} L10: <span style={{ color: homeLast10.winsL10 >= 7 ? "#c8f54a" : homeLast10.winsL10 <= 3 ? "#ef4444" : "#aaa" }}>{homeLast10.winsL10}-{homeLast10.lossesL10}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── NBA TAB ──────────────────────────────────────────────────
function NBATab({ isPremium }) {
  const [games, setGames]       = useState([]);
  const [liveNBA, setLiveNBA]   = useState({});
  const [loading, setLoading]   = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);

  // Manual projector
  const [home, setHome]   = useState("");
  const [away, setAway]   = useState("");
  const [spread, setSpread] = useState("");
  const [total, setTotal]   = useState("");
  const [b2bHome, setB2bHome] = useState(false);
  const [b2bAway, setB2bAway] = useState(false);
  const [result, setResult]   = useState(null);
  const teams = Object.keys(NBA).sort();

  useEffect(() => {
    Promise.all([
      fetchOdds("basketball_nba", "spreads,totals,h2h")
        .then(data => (data || []).map(g => parseGame(g, "NBA")))
        .catch(() => []),
      fetchNBALive().catch(() => ({})),
    ]).then(([oddsGames, nbaData]) => {
      setGames(oddsGames);
      setLiveNBA(nbaData || {});
    }).finally(() => setLoading(false));
  }, []);

  const runManual = () => {
    const h = NBA[home], a = NBA[away];
    if (!h || !a) return;
    // Merge live data if available
    const liveHome = liveNBA[home] || liveNBA[home?.split(" ").pop()];
    const liveAway = liveNBA[away] || liveNBA[away?.split(" ").pop()];
    const hData = liveHome ? { ...h, ortg: liveHome.ortg, drtg: liveHome.drtg, pace: liveHome.pace } : h;
    const aData = liveAway ? { ...a, ortg: liveAway.ortg, drtg: liveAway.drtg, pace: liveAway.pace } : a;
    setResult(projectBasketball(hData, aData, spread, total, { b2bHome, b2bAway }));
  };

  const liveActive = Object.keys(liveNBA).length > 0;

  return (
    <div>
      <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"14px" }}>
        🏀 NBA · Today's Games {liveActive && <span style={{ color:"#c8f54a" }}>· Live Stats Active</span>}
      </div>

      {loading && <div style={{ color:"#444", fontSize:"12px", textAlign:"center", padding:"20px" }}>Loading games...</div>}
      {!loading && games.length === 0 && <div style={{ color:"#444", fontSize:"12px", textAlign:"center", padding:"20px" }}>No NBA games scheduled right now.</div>}

      {games.map((g, i) => (
        <NBAGameCard key={g.id || i} game={g} liveNBA={liveNBA} isPremium={isPremium} onSelect={setSelectedGame} />
      ))}

      {/* Manual projector */}
      <div style={S.card}>
        <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", marginBottom:"14px", textTransform:"uppercase" }}>🏀 NBA Manual Projector {liveActive && <span style={{ color:"#c8f54a" }}>· Using Live Ratings</span>}</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"10px" }}>
          <div><label style={S.lbl}>Away Team</label><select style={S.sel} value={away} onChange={e => { setAway(e.target.value); setResult(null); }}><option value="">Select...</option>{teams.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div><label style={S.lbl}>Home Team</label><select style={S.sel} value={home} onChange={e => { setHome(e.target.value); setResult(null); }}><option value="">Select...</option>{teams.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div><label style={S.lbl}>Vegas Spread (home)</label><input style={S.input} type="number" step="0.5" placeholder="-4.5" value={spread} onChange={e => setSpread(e.target.value)} /></div>
          <div><label style={S.lbl}>Vegas Total</label><input style={S.input} type="number" step="0.5" placeholder="224.5" value={total} onChange={e => setTotal(e.target.value)} /></div>
        </div>
        <div style={{ display:"flex", gap:"16px", marginBottom:"12px" }}>
          <label style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"12px", color:"#666", cursor:"pointer" }}><input type="checkbox" checked={b2bAway} onChange={e => setB2bAway(e.target.checked)} /> Away B2B</label>
          <label style={{ display:"flex", alignItems:"center", gap:"6px", fontSize:"12px", color:"#666", cursor:"pointer" }}><input type="checkbox" checked={b2bHome} onChange={e => setB2bHome(e.target.checked)} /> Home B2B</label>
        </div>
        <button style={S.btn} onClick={runManual} disabled={!home || !away}>RUN PROJECTION →</button>
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
  const [home, setHome]     = useState("");
  const [away, setAway]     = useState("");
  const [spread, setSpread] = useState("");
  const [total, setTotal]   = useState("");
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
  const [games, setGames]       = useState([]);
  const [liveWNBA, setLiveWNBA] = useState({});
  const [loading, setLoading]   = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);

  // Manual projector
  const [home, setHome]     = useState("");
  const [away, setAway]     = useState("");
  const [spread, setSpread] = useState("");
  const [total, setTotal]   = useState("");
  const [b2bHome, setB2bHome] = useState(false);
  const [b2bAway, setB2bAway] = useState(false);
  const [result, setResult]   = useState(null);
  const teams = Object.keys(WNBA).sort();

  useEffect(() => {
    Promise.all([
      fetchOdds("basketball_wnba", "spreads,totals,h2h")
        .then(data => (data || []).map(g => parseGame(g, "WNBA")))
        .catch(() => []),
      fetchWNBALive().catch(() => ({})),
    ]).then(([oddsGames, wnbaData]) => {
      setGames(oddsGames);
      setLiveWNBA(wnbaData || {});
    }).finally(() => setLoading(false));
  }, []);

  const getLiveTeam = (name, fallbackDb) => {
    const shortName = name?.split(" ").pop();
    const liveEntry = liveWNBA[shortName] || Object.entries(liveWNBA).find(([k]) => name?.includes(k) || k.includes(shortName))?.[1];
    if (liveEntry) return { ortg: liveEntry.ortg, drtg: liveEntry.drtg, pace: liveEntry.pace };
    return findTeam(name, fallbackDb);
  };

  const runManual = () => {
    const h = getLiveTeam(home, WNBA) || WNBA[home];
    const a = getLiveTeam(away, WNBA) || WNBA[away];
    if (!h || !a) return;
    setResult(projectBasketball(h, a, spread, total, { homeAdv:2.5, b2bHome, b2bAway }));
  };

  const liveActive = Object.keys(liveWNBA).length > 0;

  return (
    <div>
      <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"14px" }}>
        🏀 WNBA · Today's Games {liveActive && <span style={{ color:"#c8f54a" }}>· Live Stats Active</span>}
      </div>

      {loading && <div style={{ color:"#444", fontSize:"12px", textAlign:"center", padding:"20px" }}>Loading games...</div>}
      {!loading && games.length === 0 && <div style={{ color:"#444", fontSize:"12px", textAlign:"center", padding:"20px" }}>No WNBA games scheduled right now.</div>}

      {games.map((g, i) => {
        const homeTeam = getLiveTeam(g.home, WNBA);
        const awayTeam = getLiveTeam(g.away, WNBA);
        const proj = projectBasketball(homeTeam, awayTeam, g.vegasSpread, g.vegasTotal, { homeAdv:2.5 });
        const hasEdge = proj?.hasEdge;
        const shortHome = g.home?.split(" ").pop();
        const shortAway = g.away?.split(" ").pop();
        const homeLive = liveWNBA[shortHome] || Object.entries(liveWNBA).find(([k]) => g.home?.includes(k))?.[1];
        const awayLive = liveWNBA[shortAway] || Object.entries(liveWNBA).find(([k]) => g.away?.includes(k))?.[1];

        return (
          <div key={g.id || i} onClick={() => setSelectedGame(g)} style={{
            borderRadius:"12px",
            border: hasEdge && isPremium ? "1px solid rgba(200,245,74,0.28)" : "1px solid rgba(255,255,255,0.07)",
            background: hasEdge && isPremium ? "rgba(200,245,74,0.03)" : "rgba(255,255,255,0.02)",
            overflow:"hidden", cursor:"pointer", marginBottom:"12px"
          }}>
            {hasEdge && isPremium && <div style={{ padding:"5px 14px", background:"rgba(200,245,74,0.10)", borderBottom:"1px solid rgba(200,245,74,0.15)", fontSize:"10px", color:"#c8f54a", letterSpacing:"2px", fontWeight:"700" }}>⚡ EDGE DETECTED</div>}
            {hasEdge && !isPremium && <div style={{ padding:"5px 14px", background:"rgba(200,245,74,0.04)", borderBottom:"1px solid rgba(200,245,74,0.08)", fontSize:"10px", color:"#555" }}>🔒 Edge detected</div>}
            <div style={{ padding:"12px 14px" }}>
              <div style={{ fontSize:"9px", color:"#444", marginBottom:"8px" }}>WNBA · {g.time}</div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"12px", color:"#666", marginBottom:"3px" }}>{g.away}</div>
                  <div style={{ fontSize:"14px", color:"#ccc", fontWeight:"600" }}>{g.home}</div>
                </div>
                <div style={{ display:"flex", gap:"6px" }}>
                  {g.vegasSpread != null && <StatPill label="SPREAD" val={`${g.vegasSpread > 0 ? "+" : ""}${g.vegasSpread}`} />}
                  {g.vegasTotal  != null && <StatPill label="O/U"    val={g.vegasTotal} />}
                  {proj && <StatPill label="PROJ" val={proj.projTotal} color={isPremium && Math.abs(proj.vTotal||0) >= EDGE_MIN*1.5 ? "#c8f54a" : "#aaa"} />}
                  {proj && <StatPill label="WIN%" val={`${proj.homeWin}%`} />}
                  {proj && isPremium && proj.vSpread != null && <StatPill label="EDGE" val={`${proj.vSpread > 0 ? "+" : ""}${proj.vSpread}`} color={Math.abs(proj.vSpread) >= EDGE_MIN ? "#c8f54a" : "#555"} />}
                  {proj && !isPremium && <StatPill label="EDGE" val="🔒" />}
                </div>
              </div>
              {isPremium && (homeLive || awayLive) && (
                <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                  {awayLive && (awayLive.wins + awayLive.losses > 0) && (
                    <div style={{ fontSize:"9px", color:"#555", background:"rgba(255,255,255,0.03)", padding:"3px 8px", borderRadius:"4px" }}>
                      {shortAway} <span style={{ color: awayLive.winPct >= 0.6 ? "#c8f54a" : awayLive.winPct <= 0.4 ? "#ef4444" : "#aaa" }}>{awayLive.record}</span>
                      {awayLive.streak && <span style={{ color:"#444", marginLeft:"4px" }}>{awayLive.streak}</span>}
                    </div>
                  )}
                  {homeLive && (homeLive.wins + homeLive.losses > 0) && (
                    <div style={{ fontSize:"9px", color:"#555", background:"rgba(255,255,255,0.03)", padding:"3px 8px", borderRadius:"4px" }}>
                      {shortHome} <span style={{ color: homeLive.winPct >= 0.6 ? "#c8f54a" : homeLive.winPct <= 0.4 ? "#ef4444" : "#aaa" }}>{homeLive.record}</span>
                      {homeLive.streak && <span style={{ color:"#444", marginLeft:"4px" }}>{homeLive.streak}</span>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Manual projector */}
      <div style={S.card}>
        <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", marginBottom:"14px", textTransform:"uppercase" }}>🏀 WNBA Manual Projector {liveActive && <span style={{ color:"#c8f54a" }}>· Live Ratings</span>}</div>
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
        <button style={S.btn} onClick={runManual} disabled={!home || !away}>RUN PROJECTION →</button>
      </div>

      {result && (
        <div style={S.card}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"8px" }}>
            <StatPill label="Proj Score" val={`${result.awayScore}-${result.homeScore}`} color="#aaa" />
            <StatPill label="Proj Total" val={result.projTotal} color="#aaa" />
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
      {selectedGame && <GameDetailModal game={selectedGame} sport="wnba" isPremium={isPremium} onClose={() => setSelectedGame(null)} />}
    </div>
  );
}
