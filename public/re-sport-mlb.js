// ── MLB STADIUM COORDINATES ──────────────────────────────────
const MLB_STADIUMS = {
  "Orioles":    { lat:39.2839, lng:-76.6218, dome:false, name:"Camden Yards" },
  "Red Sox":    { lat:42.3467, lng:-71.0972, dome:false, name:"Fenway Park" },
  "Yankees":    { lat:40.8296, lng:-73.9262, dome:false, name:"Yankee Stadium" },
  "Rays":       { lat:27.7683, lng:-82.6534, dome:true,  name:"Tropicana Field" },
  "Blue Jays":  { lat:43.6414, lng:-79.3894, dome:true,  name:"Rogers Centre" },
  "White Sox":  { lat:41.8300, lng:-87.6338, dome:false, name:"Guaranteed Rate" },
  "Guardians":  { lat:41.4962, lng:-81.6852, dome:false, name:"Progressive Field" },
  "Tigers":     { lat:42.3390, lng:-83.0485, dome:false, name:"Comerica Park" },
  "Royals":     { lat:39.0517, lng:-94.4803, dome:false, name:"Kauffman Stadium" },
  "Twins":      { lat:44.9817, lng:-93.2778, dome:false, name:"Target Field" },
  "Astros":     { lat:29.7573, lng:-95.3555, dome:true,  name:"Minute Maid Park" },
  "Angels":     { lat:33.8003, lng:-117.8827,dome:false, name:"Angel Stadium" },
  "Athletics":  { lat:37.7516, lng:-122.2005,dome:false, name:"Oakland Coliseum" },
  "Mariners":   { lat:47.5914, lng:-122.3325,dome:false, name:"T-Mobile Park" },
  "Rangers":    { lat:32.7512, lng:-97.0832, dome:true,  name:"Globe Life Field" },
  "Braves":     { lat:33.8908, lng:-84.4678, dome:false, name:"Truist Park" },
  "Marlins":    { lat:25.7781, lng:-80.2197, dome:true,  name:"loanDepot park" },
  "Mets":       { lat:40.7571, lng:-73.8458, dome:false, name:"Citi Field" },
  "Phillies":   { lat:39.9061, lng:-75.1665, dome:false, name:"Citizens Bank Park" },
  "Nationals":  { lat:38.8731, lng:-77.0074, dome:false, name:"Nationals Park" },
  "Cubs":       { lat:41.9484, lng:-87.6553, dome:false, name:"Wrigley Field" },
  "Reds":       { lat:39.0978, lng:-84.5080, dome:false, name:"Great American Ball Park" },
  "Brewers":    { lat:43.0280, lng:-87.9712, dome:false, name:"American Family Field" },
  "Pirates":    { lat:40.4469, lng:-80.0058, dome:false, name:"PNC Park" },
  "Cardinals":  { lat:38.6226, lng:-90.1928, dome:false, name:"Busch Stadium" },
  "Diamondbacks":{ lat:33.4453, lng:-112.0667,dome:true, name:"Chase Field" },
  "Rockies":    { lat:39.7559, lng:-104.9942,dome:false, name:"Coors Field" },
  "Dodgers":    { lat:34.0739, lng:-118.2400,dome:false, name:"Dodger Stadium" },
  "Padres":     { lat:32.7076, lng:-117.1570,dome:false, name:"Petco Park" },
  "Giants":     { lat:37.7786, lng:-122.3893,dome:false, name:"Oracle Park" },
};

// ── PITCHER BADGE ─────────────────────────────────────────────
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

// ── MLB GAME CARD ─────────────────────────────────────────────
function MLBGameCard({ game, liveMLB, weather, isPremium, onSelect }) {
  const homeTeam = findTeam(game.home, MLB);
  const awayTeam = findTeam(game.away, MLB);
  const liveData = findMLBLiveData(game.home, game.away, liveMLB);
  const shortHome = game.home?.split(" ").pop();
  const stadium = MLB_STADIUMS[shortHome];
  const gameWeather = weather?.[shortHome];

  // Apply weather total adjustment
  const vegasTotalAdj = game.vegasTotal != null && gameWeather?.totalAdj
    ? parseFloat(game.vegasTotal) + gameWeather.totalAdj
    : game.vegasTotal;

  const proj = projectBaseball(homeTeam, awayTeam, vegasTotalAdj, {
    parkFactor: homeTeam?.park || 1.0,
    homeML: game.homeML, awayML: game.awayML
  }, liveData);
  const hasEdge = proj?.hasEdge;

  return (
    <div onClick={() => onSelect(game)} style={{
      borderRadius:"12px",
      border: hasEdge && isPremium ? "1px solid rgba(200,245,74,0.28)" : "1px solid rgba(255,255,255,0.07)",
      background: hasEdge && isPremium ? "rgba(200,245,74,0.03)" : "rgba(255,255,255,0.02)",
      overflow:"hidden", cursor:"pointer", marginBottom:"12px"
    }}>
      {hasEdge && isPremium && <div style={{ padding:"5px 14px", background:"rgba(200,245,74,0.10)", borderBottom:"1px solid rgba(200,245,74,0.15)", fontSize:"10px", color:"#c8f54a", letterSpacing:"2px", fontWeight:"700" }}>⚡ EDGE DETECTED</div>}
      {hasEdge && !isPremium && <div style={{ padding:"5px 14px", background:"rgba(200,245,74,0.04)", borderBottom:"1px solid rgba(200,245,74,0.08)", fontSize:"10px", color:"#555", display:"flex", justifyContent:"space-between", alignItems:"center" }}><span>🔒 Edge detected</span></div>}
      <div style={{ padding:"12px 14px" }}>
        <div style={{ fontSize:"9px", color:"#444", marginBottom:"8px" }}>MLB · {game.time}</div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:"12px", color:"#666", marginBottom:"3px" }}>{game.away}</div>
            <div style={{ fontSize:"14px", color:"#ccc", fontWeight:"600" }}>{game.home}</div>
          </div>
          <div style={{ display:"flex", gap:"6px" }}>
            {game.vegasTotal != null && <StatPill label="O/U" val={game.vegasTotal} />}
            {proj && <StatPill label="PROJ" val={proj.projTotal} color={isPremium && Math.abs(proj.vTotal||0) >= 1.0 ? "#c8f54a" : "#aaa"} />}
            {proj && <StatPill label="WIN%" val={`${proj.homeWin}%`} />}
            {proj && isPremium && proj.vTotal != null && <StatPill label="EDGE" val={`${proj.vTotal > 0 ? "+" : ""}${proj.vTotal}`} color={Math.abs(proj.vTotal) >= 1.0 ? "#c8f54a" : "#555"} />}
            {proj && !isPremium && <StatPill label="EDGE" val="🔒" />}
          </div>
        </div>

        {/* Weather — outdoor stadiums only, premium */}
        {isPremium && gameWeather && !stadium?.dome && (
          <div style={{ display:"flex", gap:"6px", marginBottom:"8px", flexWrap:"wrap" }}>
            <div style={{ fontSize:"9px", color:"#555", background:"rgba(255,255,255,0.03)", padding:"3px 8px", borderRadius:"4px" }}>
              🌡️ {gameWeather.temp}°F
            </div>
            <div style={{ fontSize:"9px", color:"#555", background:"rgba(255,255,255,0.03)", padding:"3px 8px", borderRadius:"4px" }}>
              💨 {gameWeather.wind}mph
            </div>
            {gameWeather.totalAdj !== 0 && (
              <div style={{ fontSize:"9px", color: gameWeather.totalAdj < 0 ? "#60a5fa" : "#ef4444", background:"rgba(255,255,255,0.03)", padding:"3px 8px", borderRadius:"4px" }}>
                Total adj: {gameWeather.totalAdj > 0 ? "+" : ""}{gameWeather.totalAdj}
              </div>
            )}
          </div>
        )}

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
            {proj.formAdj.awayRunsLast10 && <div style={{ fontSize:"9px", color:"#555", background:"rgba(255,255,255,0.03)", padding:"3px 8px", borderRadius:"4px" }}>{game.away.split(" ").pop()} L10: <span style={{ color:"#aaa" }}>{proj.formAdj.awayRunsLast10.toFixed(1)} R/G</span></div>}
            {proj.formAdj.homeRunsLast10 && <div style={{ fontSize:"9px", color:"#555", background:"rgba(255,255,255,0.03)", padding:"3px 8px", borderRadius:"4px" }}>{game.home.split(" ").pop()} L10: <span style={{ color:"#aaa" }}>{proj.formAdj.homeRunsLast10.toFixed(1)} R/G</span></div>}
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

// ── MLB TAB ──────────────────────────────────────────────────
function MLBTab({ isPremium }) {
  const [games, setGames]       = useState([]);
  const [liveMLB, setLiveMLB]   = useState([]);
  const [weather, setWeather]   = useState({});
  const [loading, setLoading]   = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);

  // Manual projector state
  const [home, setHome]   = useState("");
  const [away, setAway]   = useState("");
  const [total, setTotal] = useState("");
  const [result, setResult] = useState(null);
  const [manualWeather, setManualWeather] = useState(null);
  const teams = Object.keys(MLB).sort();

  useEffect(() => {
    Promise.all([
      fetchOdds("baseball_mlb", "spreads,totals,h2h")
        .then(data => (data || []).map(g => parseGame(g, "MLB")))
        .catch(() => []),
      fetchMLBLive().catch(() => []),
    ]).then(([oddsGames, mlbData]) => {
      setGames(oddsGames);
      setLiveMLB(mlbData);

      // Fetch weather for all outdoor stadiums
      const outdoorGames = oddsGames.filter(g => {
        const shortHome = g.home?.split(" ").pop();
        const stadium = MLB_STADIUMS[shortHome];
        return stadium && !stadium.dome;
      });

      const weatherPromises = outdoorGames.map(g => {
        const shortHome = g.home?.split(" ").pop();
        const stadium = MLB_STADIUMS[shortHome];
        return fetch(`/api/weather?lat=${stadium.lat}&lng=${stadium.lng}`)
          .then(r => r.json())
          .then(w => ({ key: shortHome, data: w }))
          .catch(() => null);
      });

      Promise.all(weatherPromises).then(results => {
        const weatherMap = {};
        results.filter(Boolean).forEach(r => { weatherMap[r.key] = r.data; });
        setWeather(weatherMap);
      });
    }).finally(() => setLoading(false));
  }, []);

  // Fetch weather when home team changes in manual projector
  const handleHomeChange = (val) => {
    setHome(val);
    setResult(null);
    setManualWeather(null);
    if (!val) return;
    const shortName = val.split(" ").pop();
    const stadium = MLB_STADIUMS[shortName];
    if (stadium && !stadium.dome) {
      fetch(`/api/weather?lat=${stadium.lat}&lng=${stadium.lng}`)
        .then(r => r.json())
        .then(w => setManualWeather(w))
        .catch(() => {});
    }
  };

  const runManual = () => {
    const h = MLB[home];
    const a = MLB[away];
    if (!h || !a) return;
    const liveData = findMLBLiveData(home, away, liveMLB);
    const weatherAdj = manualWeather?.totalAdj || 0;
    const adjTotal = total ? parseFloat(total) + weatherAdj : null;
    const proj = projectBaseball(h, a, adjTotal, { parkFactor: h.park, homeML: null, awayML: null }, liveData);
    if (proj && weatherAdj) proj.weatherNote = `Weather adj: ${weatherAdj > 0 ? "+" : ""}${weatherAdj} pts (${manualWeather.temp}°F, ${manualWeather.wind}mph)`;
    setResult(proj);
  };

  return (
    <div>
      <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"14px" }}>
        ⚾ MLB · Today's Games {liveMLB.length > 0 && <span style={{ color:"#c8f54a" }}>· Live Data Active</span>}
      </div>

      {loading && <div style={{ color:"#444", fontSize:"12px", textAlign:"center", padding:"20px" }}>Loading games...</div>}
      {!loading && games.length === 0 && <div style={{ color:"#444", fontSize:"12px", textAlign:"center", padding:"20px" }}>No MLB games scheduled right now.</div>}

      {games.map((g, i) => (
        <MLBGameCard key={g.id || i} game={g} liveMLB={liveMLB} weather={weather} isPremium={isPremium} onSelect={setSelectedGame} />
      ))}

      {/* Manual projector */}
      <div style={S.card}>
        <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", marginBottom:"14px", textTransform:"uppercase" }}>⚾ Manual Matchup Projector</div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"10px" }}>
          <div><label style={S.lbl}>Away Team</label><select style={S.sel} value={away} onChange={e => { setAway(e.target.value); setResult(null); }}><option value="">Select...</option>{teams.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div><label style={S.lbl}>Home Team</label><select style={S.sel} value={home} onChange={e => handleHomeChange(e.target.value)}><option value="">Select...</option>{teams.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          <div style={{ gridColumn:"1/-1" }}><label style={S.lbl}>Vegas Total</label><input style={S.input} type="number" step="0.5" placeholder="8.5" value={total} onChange={e => setTotal(e.target.value)} /></div>
        </div>

        {/* Weather display for manual projector */}
        {manualWeather && (
          <div style={{ marginBottom:"10px", padding:"8px 12px", background:"rgba(255,255,255,0.03)", borderRadius:"8px", fontSize:"11px", color:"#555", display:"flex", gap:"12px", alignItems:"center" }}>
            <span>🌡️ {manualWeather.temp}°F</span>
            <span>💨 {manualWeather.wind}mph</span>
            <span style={{ textTransform:"capitalize" }}>{manualWeather.condition}</span>
            {manualWeather.totalAdj < 0 && <span style={{ color:"#60a5fa" }}>Total adj: {manualWeather.totalAdj} pts</span>}
            {manualWeather.totalAdj > 0 && <span style={{ color:"#ef4444" }}>Total adj: +{manualWeather.totalAdj} pts</span>}
          </div>
        )}

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
          {result.weatherNote && isPremium && (
            <div style={{ marginTop:"8px", padding:"6px 10px", background:"rgba(255,255,255,0.03)", borderRadius:"6px", fontSize:"10px", color:"#555" }}>
              🌤️ {result.weatherNote}
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
    fetchOdds("baseball_ncaa", "spreads,totals,h2h")
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
    fetchOdds("baseball_ncaa_softball", "spreads,totals,h2h")
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
