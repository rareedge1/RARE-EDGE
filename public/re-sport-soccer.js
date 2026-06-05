// ── SOCCER TAB ───────────────────────────────────────────────
function SoccerTab({ isPremium }) {
  const [league, setLeague] = useState("soccer_epl");
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);

  useEffect(() => {
    setLoading(true);
    setGames([]);
    fetchSoccer(league)
      .then(data => {
        const parsed = (data || []).map(g => {
          const base = parseGame(g, SOCCER_LEAGUES.find(l => l.id === league)?.name || "Soccer");
          const book = g.bookmakers?.[0];
          const h2h  = book?.markets?.find(m => m.key === "h2h");
          const homeML = h2h?.outcomes?.find(o => o.name === g.home_team)?.price;
          const awayML = h2h?.outcomes?.find(o => o.name === g.away_team)?.price;
          const drawML = h2h?.outcomes?.find(o => o.name === "Draw")?.price;
          const hProb  = mlToProb(homeML);
          const aProb  = mlToProb(awayML);
          const dProb  = mlToProb(drawML);
          const proj   = projectSoccer(hProb, aProb, dProb);
          return { ...base, proj };
        });
        setGames(parsed);
      })
      .catch(() => setGames([]))
      .finally(() => setLoading(false));
  }, [league]);

  return (
    <div>
      <div style={{ marginBottom:"16px" }}>
        <label style={S.lbl}>Select League</label>
        <select style={S.sel} value={league} onChange={e => setLeague(e.target.value)}>
          {SOCCER_LEAGUES.map(l => <option key={l.id} value={l.id}>{l.emoji} {l.name}</option>)}
        </select>
      </div>

      {loading && <div style={{ color:"#444", fontSize:"12px", textAlign:"center", padding:"20px" }}>Loading matches...</div>}

      {games.map((g, i) => (
        <div key={g.id || i} onClick={() => setSelectedGame(g)}
          style={{ ...S.card, cursor:"pointer", border: g.proj?.hasEdge && isPremium ? "1px solid rgba(200,245,74,0.25)" : undefined, animation:`fadeIn 0.3s ease ${i*0.04}s both` }}>
          {g.proj?.hasEdge && isPremium && (
            <div style={{ marginBottom:"8px", fontSize:"10px", color:"#c8f54a", fontWeight:"700", letterSpacing:"1px" }}>⚡ EDGE DETECTED</div>
          )}
          <div style={{ fontSize:"10px", color:"#444", marginBottom:"6px" }}>🕐 {g.time}</div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:"13px", color:"#777", marginBottom:"3px" }}>{g.away}</div>
              <div style={{ fontSize:"15px", color:"#ccc", fontWeight:"600" }}>{g.home}</div>
            </div>
            {g.proj && (
              <div style={{ display:"flex", gap:"8px" }}>
                <StatPill label="HOME%" val={`${g.proj.homeWin}%`} color={g.proj.hEdge >= 0.06 && isPremium ? "#c8f54a" : "#aaa"} />
                <StatPill label="DRAW%" val={`${g.proj.draw}%`} />
                <StatPill label="AWAY%" val={`${g.proj.awayWin}%`} color={g.proj.aEdge >= 0.06 && isPremium ? "#c8f54a" : "#aaa"} />
              </div>
            )}
          </div>
        </div>
      ))}
      {!loading && games.length === 0 && <div style={{ color:"#444", fontSize:"12px", textAlign:"center", padding:"20px" }}>No matches found for this league right now.</div>}
      {selectedGame && <GameDetailModal game={selectedGame} sport="soccer" isPremium={isPremium} onClose={() => setSelectedGame(null)} />}
    </div>
  );
}

// ── NWSL TAB ─────────────────────────────────────────────────
function NWSLTab({ isPremium }) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);

  useEffect(() => {
    fetchSoccer("soccer_nwsl")
      .then(data => setGames((data || []).map(g => parseGame(g, "NWSL"))))
      .catch(() => setGames([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"14px" }}>⚽ NWSL</div>
      {loading && <div style={{ color:"#444", fontSize:"12px", textAlign:"center", padding:"20px" }}>Loading...</div>}
      {!loading && games.length === 0 && <div style={{ color:"#444", fontSize:"12px", textAlign:"center", padding:"20px" }}>No NWSL games right now.</div>}
      {games.map((g, i) => (
        <div key={g.id || i} onClick={() => setSelectedGame(g)} style={{ ...S.card, cursor:"pointer" }}>
          <div style={{ fontSize:"10px", color:"#444", marginBottom:"6px" }}>🕐 {g.time}</div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div><div style={{ fontSize:"12px", color:"#666", marginBottom:"3px" }}>{g.away}</div><div style={{ fontSize:"14px", color:"#ccc", fontWeight:"600" }}>{g.home}</div></div>
            <div style={{ display:"flex", gap:"8px" }}>
              {g.homeML != null && <StatPill label="HOME ML" val={`${g.homeML > 0 ? "+" : ""}${g.homeML}`} />}
              {g.awayML != null && <StatPill label="AWAY ML" val={`${g.awayML > 0 ? "+" : ""}${g.awayML}`} />}
            </div>
          </div>
        </div>
      ))}
      {selectedGame && <GameDetailModal game={selectedGame} sport="soccer" isPremium={isPremium} onClose={() => setSelectedGame(null)} />}
    </div>
  );
}
