// ── NFL GAME CARD ─────────────────────────────────────────────
function NFLGameCard({ game, liveNFL, eloRatings, isPremium, onSelect }) {
  const getTeam = (name) => {
    const shortName = name?.split(" ").pop();
    const liveEntry = liveNFL?.[shortName] ||
      Object.entries(liveNFL || {}).find(([k]) => name?.includes(k) || k.includes(shortName))?.[1];
    const base = findTeam(name, NFL) || { off:23, def:23, pace:65 };
    if (liveEntry?.off && liveEntry?.def) {
      // Blend live ESPN data with static ratings 50/50
      return { ...base, off: (base.off + liveEntry.off) / 2, def: (base.def + liveEntry.def) / 2 };
    }
    // Apply Elo adjustment if available
    const eloEntry = eloRatings?.[name] || eloRatings?.[shortName];
    if (eloEntry && eloEntry.wins + eloEntry.losses >= 5) {
      const eloDiff = (eloEntry.elo - 1500) * 0.02;
      return { ...base, off: base.off + eloDiff, def: base.def - eloDiff };
    }
    return base;
  };

  const homeTeam = getTeam(game.home);
  const awayTeam = getTeam(game.away);
  const proj = projectFootball(homeTeam, awayTeam, game.vegasSpread, game.vegasTotal, {
    homeML: game.homeML, awayML: game.awayML
  });
  const hasEdge = proj?.hasEdge;

  const homeShort = game.home?.split(" ").pop();
  const awayShort = game.away?.split(" ").pop();
  const homeLive = liveNFL?.[homeShort];
  const awayLive = liveNFL?.[awayShort];

  return (
    <div onClick={() => onSelect(game)} style={{
      borderRadius:"12px",
      border: hasEdge && isPremium ? "1px solid rgba(200,245,74,0.28)" : "1px solid rgba(255,255,255,0.07)",
      background: hasEdge && isPremium ? "rgba(200,245,74,0.03)" : "rgba(255,255,255,0.02)",
      overflow:"hidden", cursor:"pointer", marginBottom:"12px"
    }}>
      {hasEdge && isPremium && <div style={{ padding:"5px 14px", background:"rgba(200,245,74,0.10)", borderBottom:"1px solid rgba(200,245,74,0.15)", fontSize:"10px", color:"#c8f54a", letterSpacing:"2px", fontWeight:"700" }}>⚡ EDGE DETECTED</div>}
      {hasEdge && !isPremium && <div style={{ padding:"5px 14px", background:"rgba(200,245,74,0.04)", borderBottom:"1px solid rgba(200,245,74,0.08)", fontSize:"10px", color:"#555", display:"flex", justifyContent:"space-between" }}><span>🔒 Edge detected</span></div>}
      <div style={{ padding:"12px 14px" }}>
        <div style={{ fontSize:"9px", color:"#444", marginBottom:"8px" }}>NFL · {game.time}</div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:"12px", color:"#666", marginBottom:"3px" }}>{game.away}</div>
            <div style={{ fontSize:"14px", color:"#ccc", fontWeight:"600" }}>{game.home}</div>
          </div>
          <div style={{ display:"flex", gap:"6px" }}>
            {game.vegasSpread != null && <StatPill label="SPREAD" val={`${game.vegasSpread > 0 ? "+" : ""}${game.vegasSpread}`} />}
            {game.vegasTotal  != null && <StatPill label="O/U"    val={game.vegasTotal} />}
            {proj && <StatPill label="WIN%" val={`${proj.homeWin}%`} />}
            {proj && isPremium && proj.vSpread != null && <StatPill label="EDGE" val={`${proj.vSpread > 0 ? "+" : ""}${proj.vSpread}`} color={Math.abs(proj.vSpread) >= EDGE_MIN ? "#c8f54a" : "#555"} />}
            {proj && !isPremium && <StatPill label="EDGE" val="🔒" />}
          </div>
        </div>
        {isPremium && (homeLive || awayLive) && (
          <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
            {awayLive?.wins != null && <div style={{ fontSize:"9px", color:"#555", background:"rgba(255,255,255,0.03)", padding:"3px 8px", borderRadius:"4px" }}>{awayShort} {awayLive.wins}-{awayLive.losses}</div>}
            {homeLive?.wins != null && <div style={{ fontSize:"9px", color:"#555", background:"rgba(255,255,255,0.03)", padding:"3px 8px", borderRadius:"4px" }}>{homeShort} {homeLive.wins}-{homeLive.losses}</div>}
            {homeLive?.streak && <div style={{ fontSize:"9px", color:"#c8f54a", background:"rgba(200,245,74,0.06)", padding:"3px 8px", borderRadius:"4px" }}>{homeShort} {homeLive.streak}</div>}
          </div>
        )}
      </div>
    </div>
  );
}

// ── NFL TAB ──────────────────────────────────────────────────
function NFLTab({ isPremium }) {
  const [games, setGames]       = useState([]);
  const [liveNFL, setLiveNFL]   = useState({});
  const [eloRatings, setEloRatings] = useState({});
  const [loading, setLoading]   = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  const [weather, setWeather]   = useState(null);

  // Manual projector state
  const [home, setHome]       = useState("");
  const [away, setAway]       = useState("");
  const [spread, setSpread]   = useState("");
  const [total, setTotal]     = useState("");
  const [restHome, setRestHome] = useState(7);
  const [restAway, setRestAway] = useState(7);
  const [result, setResult]   = useState(null);
  const teams = Object.keys(NFL).sort();

  useEffect(() => {
    Promise.all([
      fetchOdds("americanfootball_nfl", "spreads,totals,h2h")
        .then(data => (data || []).map(g => parseGame(g, "NFL")))
        .catch(() => []),
      fetch("/api/nfl").then(r => r.json()).catch(() => ({})),
      fetch("/api/elo").then(r => r.json()).catch(() => ({})),
    ]).then(([oddsGames, nflData, eloData]) => {
      setGames(oddsGames);
      setLiveNFL(nflData || {});
      setEloRatings(eloData || {});
    }).finally(() => setLoading(false));
  }, []);

  // Fetch weather for selected home team stadium
  const fetchWeatherForTeam = (teamName) => {
    const stadiums = liveNFL?._stadiums || {};
    const shortName = teamName?.split(" ").pop();
    const stadium = stadiums[shortName];
    if (!stadium || stadium.dome) { setWeather(null); return; }
    fetch(`/api/weather?lat=${stadium.lat}&lng=${stadium.lng}`)
      .then(r => r.json())
      .then(w => setWeather(w))
      .catch(() => setWeather(null));
  };

  const run = () => {
    const base = NFL[home];
    const baseA = NFL[away];
    if (!base || !baseA) return;

    // Rest day adjustment: short week = -2.0 pts offense
    const restAdj = ((restHome - 7) - (restAway - 7)) * 0.3;
    // Weather total adjustment
    const weatherAdj = weather?.totalAdj || 0;

    const proj = projectFootball(base, baseA, spread, parseFloat(total) + weatherAdj, {
      homeAdv: HOME_ADV,
      restAdj,
      homeML: null, awayML: null,
    });
    if (proj && weather?.totalAdj) {
      proj.weatherNote = `Weather adj: ${weatherAdj > 0 ? "+" : ""}${weatherAdj} pts (${weather.temp}°F, ${weather.wind}mph wind)`;
    }
    setResult(proj);
  };

  const liveActive = Object.keys(liveNFL).filter(k => k !== "_stadiums").length > 0;

  return (
    <div>
      <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"14px" }}>
        🏈 NFL · Games {liveActive && <span style={{ color:"#c8f54a" }}>· Live Stats Active</span>}
      </div>

      {loading && <div style={{ color:"#444", fontSize:"12px", textAlign:"center", padding:"20px" }}>Loading games...</div>}
      {!loading && games.length === 0 && (
        <div style={{ color:"#444", fontSize:"12px", textAlign:"center", padding:"20px" }}>
          NFL season starts in August. Use the projector below to simulate any matchup.
        </div>
      )}
      {games.map((g, i) => (
        <NFLGameCard key={g.id || i} game={g} liveNFL={liveNFL} eloRatings={eloRatings} isPremium={isPremium} onSelect={setSelectedGame} />
      ))}

      {/* Manual Projector */}
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
            <select style={S.sel} value={home} onChange={e => { setHome(e.target.value); setResult(null); fetchWeatherForTeam(e.target.value); }}>
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

        {/* Rest days */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"10px" }}>
          <div>
            <label style={S.lbl}>Away Rest Days</label>
            <select style={S.sel} value={restAway} onChange={e => setRestAway(parseInt(e.target.value))}>
              <option value={4}>4 (Thu game)</option>
              <option value={7}>7 (Normal)</option>
              <option value={14}>14 (Bye week)</option>
            </select>
          </div>
          <div>
            <label style={S.lbl}>Home Rest Days</label>
            <select style={S.sel} value={restHome} onChange={e => setRestHome(parseInt(e.target.value))}>
              <option value={4}>4 (Thu game)</option>
              <option value={7}>7 (Normal)</option>
              <option value={14}>14 (Bye week)</option>
            </select>
          </div>
        </div>

        {/* Weather display */}
        {weather && (
          <div style={{ marginBottom:"10px", padding:"8px 12px", background:"rgba(255,255,255,0.03)", borderRadius:"8px", fontSize:"11px", color:"#555", display:"flex", gap:"12px", alignItems:"center" }}>
            <span>🌡️ {weather.temp}°F</span>
            <span>💨 {weather.wind}mph</span>
            <span style={{ textTransform:"capitalize" }}>{weather.condition}</span>
            {weather.totalAdj < 0 && <span style={{ color:"#c8f54a" }}>Total adj: {weather.totalAdj} pts</span>}
          </div>
        )}

        <button style={S.btn} onClick={run} disabled={!home || !away}>RUN PROJECTION →</button>
      </div>

      {result && (
        <div style={{ ...S.card, border: result.hasEdge && isPremium ? "1px solid rgba(200,245,74,0.3)" : undefined }}>
          {result.hasEdge && isPremium && (
            <div style={{ background:"rgba(200,245,74,0.1)", borderRadius:"8px", padding:"8px 12px", marginBottom:"12px", fontSize:"11px", color:"#c8f54a", fontWeight:"700", letterSpacing:"1px" }}>⚡ EDGE DETECTED</div>
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
            <StatPill label={`${away || "Away"} Win%`} val={`${result.awayWin}%`} />
            <StatPill label={`${home || "Home"} Win%`} val={`${result.homeWin}%`} />
          </div>
          {isPremium && (
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginTop:"8px" }}>
              <StatPill label="Spread Edge" val={result.vSpread != null ? `${result.vSpread > 0 ? "+" : ""}${result.vSpread}` : "—"} color={result.vSpread != null && Math.abs(result.vSpread) >= EDGE_MIN ? "#c8f54a" : "#555"} />
              <StatPill label="Total Edge"  val={result.vTotal  != null ? `${result.vTotal  > 0 ? "+" : ""}${result.vTotal}`  : "—"} color={result.vTotal  != null && Math.abs(result.vTotal)  >= EDGE_MIN*1.5 ? "#c8f54a" : "#555"} />
            </div>
          )}
          {result.weatherNote && isPremium && (
            <div style={{ marginTop:"8px", padding:"6px 10px", background:"rgba(255,255,255,0.03)", borderRadius:"6px", fontSize:"10px", color:"#555" }}>
              🌤️ {result.weatherNote}
            </div>
          )}
        </div>
      )}

      {selectedGame && <GameDetailModal game={selectedGame} sport="nfl" isPremium={isPremium} onClose={() => setSelectedGame(null)} />}
    </div>
  );
}

// ── NCAA FOOTBALL TAB ────────────────────────────────────────
// Conference base ratings (off/def PPG averages by conference strength)
const CONF_RATINGS = {
  "SEC":      { off:32.4, def:22.1 },
  "Big Ten":  { off:30.8, def:22.8 },
  "Big 12":   { off:34.2, def:26.4 },
  "ACC":      { off:29.6, def:24.2 },
  "Pac-12":   { off:31.4, def:25.6 },
  "AAC":      { off:27.8, def:26.8 },
  "MWC":      { off:26.4, def:27.2 },
  "Sun Belt": { off:25.2, def:28.4 },
  "CUSA":     { off:24.6, def:29.1 },
  "MAC":      { off:23.8, def:28.8 },
  "Ind":      { off:28.4, def:24.6 },
};

function NCAAFTab({ isPremium }) {
  const [home, setHome]         = useState("");
  const [away, setAway]         = useState("");
  const [homeConf, setHomeConf] = useState("SEC");
  const [awayConf, setAwayConf] = useState("SEC");
  const [spread, setSpread]     = useState("");
  const [total, setTotal]       = useState("");
  const [result, setResult]     = useState(null);
  const [selectedGame, setSelectedGame] = useState(null);
  const confs = Object.keys(CONF_RATINGS).sort();

  useEffect(() => {
    fetchOdds("americanfootball_ncaaf", "spreads,totals,h2h")
      .then(data => setGamesNCAAF((data || []).map(g => parseGame(g, "NCAAF"))))
      .catch(() => {});
  }, []);

  const [gamesNCAAF, setGamesNCAAF] = useState([]);

  const run = () => {
    if (!home.trim() || !away.trim()) return;
    const h = CONF_RATINGS[homeConf] || { off:28.5, def:24.2 };
    const a = CONF_RATINGS[awayConf] || { off:27.8, def:25.1 };
    // SOS adjustment from CONF_SOS
    const homeSOS = CONF_SOS[homeConf] || 1.0;
    const awaySOS = CONF_SOS[awayConf] || 1.0;
    const sosAdj  = (homeSOS - awaySOS) * 0.8;
    setResult(projectFootball(
      { off: h.off, def: h.def, pace: 68 },
      { off: a.off, def: a.def, pace: 67 },
      spread, total,
      { homeAdv: 4.2, restAdj: sosAdj }
    ));
  };

  return (
    <div>
      <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"14px" }}>🏈 NCAA Football</div>
      {gamesNCAAF.length === 0 && (
        <div style={{ color:"#444", fontSize:"12px", textAlign:"center", padding:"20px", marginBottom:"16px" }}>
          College football season starts in August. Use the projector below.
        </div>
      )}
      {gamesNCAAF.map((g, i) => (
        <div key={g.id || i} onClick={() => setSelectedGame(g)} style={{ ...S.card, cursor:"pointer" }}>
          <div style={{ fontSize:"10px", color:"#444", marginBottom:"6px" }}>🕐 {g.time}</div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div><div style={{ fontSize:"12px", color:"#666", marginBottom:"3px" }}>{g.away}</div><div style={{ fontSize:"14px", color:"#ccc", fontWeight:"600" }}>{g.home}</div></div>
            <div style={{ display:"flex", gap:"8px" }}>
              {g.vegasSpread != null && <StatPill label="SPREAD" val={`${g.vegasSpread > 0 ? "+" : ""}${g.vegasSpread}`} />}
              {g.vegasTotal  != null && <StatPill label="O/U"    val={g.vegasTotal} />}
            </div>
          </div>
        </div>
      ))}

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
            <label style={S.lbl}>Away Conference</label>
            <select style={S.sel} value={awayConf} onChange={e => setAwayConf(e.target.value)}>
              {confs.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={S.lbl}>Home Conference</label>
            <select style={S.sel} value={homeConf} onChange={e => setHomeConf(e.target.value)}>
              {confs.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
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
        <div style={S.card}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"8px" }}>
            <StatPill label="Proj Spread" val={`${result.projSpread > 0 ? "+" : ""}${result.projSpread}`} color={isPremium && Math.abs(result.vSpread||0) >= EDGE_MIN ? "#c8f54a" : "#aaa"} />
            <StatPill label="Proj Total"  val={result.projTotal} color="#aaa" />
            <StatPill label={`${away || "Away"} Win%`} val={`${result.awayWin}%`} />
            <StatPill label={`${home || "Home"} Win%`} val={`${result.homeWin}%`} />
          </div>
          {isPremium && result.vSpread != null && (
            <div style={{ marginTop:"8px" }}>
              <StatPill label="Spread Edge" val={`${result.vSpread > 0 ? "+" : ""}${result.vSpread}`} color={Math.abs(result.vSpread) >= EDGE_MIN ? "#c8f54a" : "#555"} />
            </div>
          )}
          <div style={{ marginTop:"8px", fontSize:"10px", color:"#444" }}>
            SOS: {awayConf} vs {homeConf} — {CONF_SOS[homeConf] > CONF_SOS[awayConf] ? "Home plays stronger schedule" : homeConf === awayConf ? "Equal strength of schedule" : "Away plays stronger schedule"}
          </div>
        </div>
      )}
      {selectedGame && <GameDetailModal game={selectedGame} sport="ncaaf" isPremium={isPremium} onClose={() => setSelectedGame(null)} />}
    </div>
  );
}

// ── UFL TAB ──────────────────────────────────────────────────
function UFLTab({ isPremium }) {
  const [home, setHome]   = useState("");
  const [away, setAway]   = useState("");
  const [spread, setSpread] = useState("");
  const [total, setTotal]   = useState("");
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
