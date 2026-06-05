// ── GOLF TAB ─────────────────────────────────────────────────
function GolfTab({ isPremium }) {
  const [events, setEvents] = useState([]);
  const [selected, setSelected] = useState("");
  const [odds, setOdds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [oddsLoading, setOddsLoading] = useState(false);

  useEffect(() => {
    fetchGolfEvents()
      .then(evts => { setEvents(evts); if (evts.length) setSelected(evts[0].key); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selected) return;
    setOddsLoading(true);
    fetchGolfOdds(selected)
      .then(data => {
        const book = data?.[0]?.bookmakers?.[0];
        const outs = book?.markets?.[0]?.outcomes || [];
        setOdds(outs.sort((a, b) => a.price - b.price).slice(0, 20));
      })
      .catch(() => setOdds([]))
      .finally(() => setOddsLoading(false));
  }, [selected]);

  return (
    <div>
      <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"14px" }}>⛳ Golf Outright Odds</div>
      {loading ? <div style={{ color:"#444", fontSize:"12px", textAlign:"center", padding:"20px" }}>Loading events...</div> : (
        <div>
          {events.length > 0 && (
            <div style={{ marginBottom:"16px" }}>
              <label style={S.lbl}>Select Event</label>
              <select style={S.sel} value={selected} onChange={e => setSelected(e.target.value)}>
                {events.map(e => <option key={e.key} value={e.key}>{e.title}</option>)}
              </select>
            </div>
          )}
          {events.length === 0 && <div style={{ color:"#444", fontSize:"12px", textAlign:"center", padding:"20px" }}>No active golf events right now.</div>}
          {oddsLoading && <div style={{ color:"#444", fontSize:"12px", textAlign:"center", padding:"20px" }}>Loading odds...</div>}
          {odds.map((o, i) => (
            <div key={i} style={{ ...S.card, display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px" }}>
              <span style={{ fontSize:"14px", color:"#ccc" }}>{o.name}</span>
              <span style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"20px", color: o.price > 0 ? "#c8f54a" : "#aaa" }}>{o.price > 0 ? "+" : ""}{o.price}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── TENNIS TAB ───────────────────────────────────────────────
function TennisTab({ isPremium }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);

  useEffect(() => {
    fetchTennisEvents()
      .then(async evts => {
        if (!evts.length) return;
        const data = await fetchOdds(evts[0].key, "h2h");
        setMatches((data || []).map(g => parseGame(g, "Tennis")));
      })
      .catch(() => setMatches([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"14px" }}>🎾 Tennis Matches</div>
      {loading && <div style={{ color:"#444", fontSize:"12px", textAlign:"center", padding:"20px" }}>Loading matches...</div>}
      {!loading && matches.length === 0 && <div style={{ color:"#444", fontSize:"12px", textAlign:"center", padding:"20px" }}>No active tennis matches right now.</div>}
      {matches.map((g, i) => (
        <div key={g.id || i} onClick={() => setSelectedGame(g)} style={{ ...S.card, cursor:"pointer" }}>
          <div style={{ fontSize:"10px", color:"#444", marginBottom:"6px" }}>🕐 {g.time}</div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:"13px", color:"#777", marginBottom:"3px" }}>{g.away}</div>
              <div style={{ fontSize:"15px", color:"#ccc", fontWeight:"600" }}>vs {g.home}</div>
            </div>
            <div style={{ display:"flex", gap:"8px" }}>
              {g.homeML != null && <StatPill label={g.home?.split(" ").pop()} val={`${g.homeML > 0 ? "+" : ""}${g.homeML}`} />}
              {g.awayML != null && <StatPill label={g.away?.split(" ").pop()} val={`${g.awayML > 0 ? "+" : ""}${g.awayML}`} />}
            </div>
          </div>
        </div>
      ))}
      {selectedGame && <GameDetailModal game={selectedGame} sport="tennis" isPremium={isPremium} onClose={() => setSelectedGame(null)} />}
    </div>
  );
}

// ── MMA / UFC TAB ────────────────────────────────────────────
function MMATab({ isPremium }) {
  const [fights, setFights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);

  useEffect(() => {
    fetchMMA()
      .then(data => setFights((data || []).map(g => parseGame(g, "MMA/UFC"))))
      .catch(() => setFights([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"14px" }}>🥊 MMA / UFC</div>
      {loading && <div style={{ color:"#444", fontSize:"12px", textAlign:"center", padding:"20px" }}>Loading fights...</div>}
      {!loading && fights.length === 0 && <div style={{ color:"#444", fontSize:"12px", textAlign:"center", padding:"20px" }}>No upcoming fights right now.</div>}
      {fights.map((g, i) => (
        <div key={g.id || i} onClick={() => setSelectedGame(g)} style={{ ...S.card, cursor:"pointer" }}>
          <div style={{ fontSize:"10px", color:"#444", marginBottom:"6px" }}>🕐 {g.time}</div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:"13px", color:"#777", marginBottom:"3px" }}>{g.away}</div>
              <div style={{ fontSize:"15px", color:"#ccc", fontWeight:"600" }}>vs {g.home}</div>
            </div>
            <div style={{ display:"flex", gap:"8px" }}>
              {g.homeML != null && <StatPill label={g.home?.split(" ").pop()} val={`${g.homeML > 0 ? "+" : ""}${g.homeML}`} color={g.homeML < -150 ? "#c8f54a" : "#aaa"} />}
              {g.awayML != null && <StatPill label={g.away?.split(" ").pop()} val={`${g.awayML > 0 ? "+" : ""}${g.awayML}`} color={g.awayML < -150 ? "#c8f54a" : "#aaa"} />}
            </div>
          </div>
        </div>
      ))}
      {selectedGame && <GameDetailModal game={selectedGame} sport="mma" isPremium={isPremium} onClose={() => setSelectedGame(null)} />}
    </div>
  );
}
