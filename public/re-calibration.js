// ── CALIBRATION DASHBOARD ────────────────────────────────────
function CalibrationDashboard({ isPremium }) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  useEffect(() => {
    fetch("/api/calibration")
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, []);

  if (!isPremium) return (
    <div style={{ textAlign:"center", padding:"40px 20px" }}>
      <div style={{ fontSize:"32px", marginBottom:"12px" }}>🔒</div>
      <div style={{ fontSize:"14px", color:"#555", marginBottom:"16px" }}>Calibration dashboard is premium only.</div>
      <button onClick={() => startCheckout("monthly")} style={{ background:"linear-gradient(135deg,#c8f54a,#8fdb00)", border:"none", borderRadius:"10px", padding:"12px 24px", fontSize:"13px", fontWeight:"700", cursor:"pointer", color:"#000" }}>UPGRADE TO VIEW →</button>
    </div>
  );

  if (loading) return <div style={{ textAlign:"center", padding:"40px", color:"#444" }}>Loading calibration data...</div>;
  if (error)   return <div style={{ textAlign:"center", padding:"40px", color:"#ef4444" }}>Error: {error}</div>;
  if (!data || !data.total || data.total === 0) return (
    <div style={{ textAlign:"center", padding:"40px 20px" }}>
      <div style={{ fontSize:"32px", marginBottom:"12px" }}>📊</div>
      <div style={{ fontSize:"14px", color:"#555" }}>Not enough resolved edge calls yet.</div>
      <div style={{ fontSize:"12px", color:"#333", marginTop:"8px" }}>Check back after more games go final. Need at least 20 resolved calls for meaningful data.</div>
    </div>
  );

  return (
    <div>
      <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"16px" }}>📊 Model Calibration</div>

      {/* Overall grade */}
      <div style={{ background:"rgba(255,255,255,0.02)", border:`1px solid ${data.gradeColor}44`, borderRadius:"12px", padding:"16px", marginBottom:"16px", textAlign:"center" }}>
        <div style={{ fontSize:"10px", color:"#444", letterSpacing:"2px", marginBottom:"8px" }}>MODEL GRADE</div>
        <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"36px", color: data.gradeColor, letterSpacing:"2px" }}>{data.grade}</div>
        <div style={{ fontSize:"11px", color:"#444", marginTop:"4px" }}>Based on {data.total} resolved edge calls</div>
      </div>

      {/* Overall stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"8px", marginBottom:"16px" }}>
        <div style={{ background:"rgba(200,245,74,0.06)", borderRadius:"10px", padding:"12px", textAlign:"center" }}>
          <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"28px", color:"#c8f54a", lineHeight:1 }}>{data.wins}</div>
          <div style={{ fontSize:"9px", color:"#555", letterSpacing:"1px", marginTop:"2px" }}>WINS</div>
        </div>
        <div style={{ background:"rgba(239,68,68,0.06)", borderRadius:"10px", padding:"12px", textAlign:"center" }}>
          <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"28px", color:"#ef4444", lineHeight:1 }}>{data.losses}</div>
          <div style={{ fontSize:"9px", color:"#555", letterSpacing:"1px", marginTop:"2px" }}>LOSSES</div>
        </div>
        <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:"10px", padding:"12px", textAlign:"center" }}>
          <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"28px", color:"#aaa", lineHeight:1 }}>{data.pushes}</div>
          <div style={{ fontSize:"9px", color:"#555", letterSpacing:"1px", marginTop:"2px" }}>PUSHES</div>
        </div>
        <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:"10px", padding:"12px", textAlign:"center" }}>
          <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"28px", color: data.hitRate >= 55 ? "#c8f54a" : data.hitRate >= 50 ? "#aaa" : "#ef4444", lineHeight:1 }}>{data.hitRate}%</div>
          <div style={{ fontSize:"9px", color:"#555", letterSpacing:"1px", marginTop:"2px" }}>HIT RATE</div>
        </div>
      </div>

      {/* CLV summary */}
      {data.clv?.clvCount > 0 && (
        <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"12px", padding:"14px", marginBottom:"16px" }}>
          <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", marginBottom:"10px" }}>📈 CLOSING LINE VALUE</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px" }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"22px", color: data.clv.avgCLV > 0 ? "#c8f54a" : "#ef4444" }}>{data.clv.avgCLV > 0 ? "+" : ""}{data.clv.avgCLV}</div>
              <div style={{ fontSize:"9px", color:"#555" }}>AVG CLV</div>
            </div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"22px", color: data.clv.clvWinRate >= 55 ? "#c8f54a" : "#aaa" }}>{data.clv.clvWinRate}%</div>
              <div style={{ fontSize:"9px", color:"#555" }}>LINE W/ US</div>
            </div>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"22px", color:"#aaa" }}>{data.clv.clvCount}</div>
              <div style={{ fontSize:"9px", color:"#555" }}>TRACKED</div>
            </div>
          </div>
          <div style={{ marginTop:"10px", fontSize:"10px", color:"#444", lineHeight:"1.6" }}>
            {data.clv.avgCLV > 0 ? "✅ Positive CLV — our projections are predicting line movement direction correctly." : data.clv.avgCLV < 0 ? "⚠️ Negative CLV — lines are moving against our calls. Model may need adjustment." : "Neutral CLV — not enough movement data yet."}
          </div>
        </div>
      )}

      {/* Hit rate by sport */}
      {data.sportStats?.length > 0 && (
        <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"12px", padding:"14px", marginBottom:"16px" }}>
          <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", marginBottom:"10px" }}>⚾🏀 HIT RATE BY SPORT</div>
          {data.sportStats.map((s, i) => (
            <div key={i} style={{ marginBottom:"10px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"4px" }}>
                <span style={{ fontSize:"12px", color:"#aaa" }}>{s.sport}</span>
                <span style={{ fontSize:"12px", fontWeight:"700", color: s.hitRate >= 55 ? "#c8f54a" : s.hitRate >= 50 ? "#aaa" : "#ef4444" }}>
                  {s.hitRate !== null ? `${s.hitRate}%` : "—"} <span style={{ fontSize:"10px", color:"#444", fontWeight:"400" }}>({s.wins}-{s.losses})</span>
                </span>
              </div>
              <div style={{ height:"4px", background:"rgba(255,255,255,0.06)", borderRadius:"2px", overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${Math.min(s.hitRate || 0, 100)}%`, background: s.hitRate >= 55 ? "#c8f54a" : s.hitRate >= 50 ? "#60a5fa" : "#ef4444", borderRadius:"2px", transition:"width 0.6s ease" }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hit rate by edge size */}
      {data.edgeStats?.length > 0 && (
        <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"12px", padding:"14px", marginBottom:"16px" }}>
          <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", marginBottom:"10px" }}>⚡ HIT RATE BY EDGE SIZE</div>
          {data.edgeStats.map((e, i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom: i < data.edgeStats.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
              <div>
                <div style={{ fontSize:"12px", color:"#aaa" }}>Edge {e.bucket}</div>
                <div style={{ fontSize:"10px", color:"#444" }}>{e.total} calls</div>
              </div>
              <div style={{ textAlign:"right" }}>
                <div style={{ fontSize:"14px", fontWeight:"700", color: e.hitRate >= 55 ? "#c8f54a" : e.hitRate >= 50 ? "#aaa" : e.hitRate !== null ? "#ef4444" : "#333" }}>
                  {e.hitRate !== null ? `${e.hitRate}%` : "—"}
                </div>
                <div style={{ fontSize:"10px", color:"#444" }}>{e.wins}W {e.losses}L</div>
              </div>
            </div>
          ))}
          <div style={{ marginTop:"10px", fontSize:"10px", color:"#444", lineHeight:"1.6" }}>
            Ideal: larger edges should hit at higher rates. If they don't, the edge threshold needs adjustment.
          </div>
        </div>
      )}

      {/* Over/under direction */}
      {data.directionStats?.length > 0 && (
        <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"12px", padding:"14px", marginBottom:"16px" }}>
          <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", marginBottom:"10px" }}>📉 OVER vs UNDER HIT RATE</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
            {data.directionStats.map((d, i) => (
              <div key={i} style={{ textAlign:"center", padding:"12px", background:"rgba(255,255,255,0.02)", borderRadius:"8px" }}>
                <div style={{ fontSize:"12px", color:"#555", textTransform:"uppercase", letterSpacing:"1px", marginBottom:"6px" }}>{d.direction}</div>
                <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"28px", color: d.hitRate >= 55 ? "#c8f54a" : d.hitRate >= 50 ? "#aaa" : d.hitRate !== null ? "#ef4444" : "#333" }}>
                  {d.hitRate !== null ? `${d.hitRate}%` : "—"}
                </div>
                <div style={{ fontSize:"10px", color:"#444", marginTop:"2px" }}>{d.wins}W {d.losses}L</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:"10px", fontSize:"10px", color:"#444", lineHeight:"1.6" }}>
            If overs or unders are significantly stronger, adjust the model to favor that direction.
          </div>
        </div>
      )}

      {/* What to do next */}
      <div style={{ background:"rgba(200,245,74,0.03)", border:"1px solid rgba(200,245,74,0.10)", borderRadius:"12px", padding:"14px" }}>
        <div style={{ fontSize:"10px", color:"#c8f54a", letterSpacing:"2px", marginBottom:"8px" }}>🎯 WHAT THIS MEANS</div>
        {data.total < 50 && <div style={{ fontSize:"12px", color:"#555", lineHeight:"1.7" }}>Need {50 - data.total} more resolved calls for statistically meaningful data. Keep the app running daily.</div>}
        {data.total >= 50 && data.hitRate >= 55 && <div style={{ fontSize:"12px", color:"#aaa", lineHeight:"1.7" }}>Model is performing well. Focus on marketing and growing the user base. Consider historical backtesting to validate further.</div>}
        {data.total >= 50 && data.hitRate >= 50 && data.hitRate < 55 && <div style={{ fontSize:"12px", color:"#aaa", lineHeight:"1.7" }}>Model is near breakeven. Check which sports are underperforming and consider raising the edge threshold for those.</div>}
        {data.total >= 50 && data.hitRate < 50 && <div style={{ fontSize:"12px", color:"#ef4444", lineHeight:"1.7" }}>Model is underperforming. Review the sport-by-sport breakdown to identify which projection formula needs the most work.</div>}
      </div>
    </div>
  );
}
