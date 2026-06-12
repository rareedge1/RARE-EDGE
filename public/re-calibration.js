// ── ROI CALCULATOR ───────────────────────────────────────────
function ROICalculator({ wins, losses, pushes }) {
  const WIN_PAYOUT  = 0.909;
  const netUnits    = +((wins * WIN_PAYOUT) - (losses * 1.0)).toFixed(2);
  const totalBets   = wins + losses + pushes;
  const roi         = totalBets > 0 ? +((netUnits / totalBets) * 100).toFixed(1) : 0;
  const isProfit    = netUnits >= 0;
  const at25        = +(netUnits * 25).toFixed(0);
  const at50        = +(netUnits * 50).toFixed(0);
  const at100       = +(netUnits * 100).toFixed(0);

  if (totalBets === 0) return null;

  return (
    <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"12px", padding:"14px", marginBottom:"16px" }}>
      <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", marginBottom:"12px" }}>💰 ROI · 1 UNIT PER CALL @ -110</div>
      <div style={{ textAlign:"center", marginBottom:"14px" }}>
        <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"48px", color: isProfit ? "#c8f54a" : "#ef4444", lineHeight:1 }}>
          {isProfit ? "+" : ""}{netUnits}u
        </div>
        <div style={{ fontSize:"11px", color:"#444", marginTop:"4px" }}>{roi > 0 ? "+" : ""}{roi}% ROI · {totalBets} calls</div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"6px", marginBottom:"12px" }}>
        {[["$25", at25], ["$50", at50], ["$100", at100]].map(function(item) {
          return (
            <div key={item[0]} style={{ textAlign:"center", background:"rgba(255,255,255,0.02)", borderRadius:"8px", padding:"8px" }}>
              <div style={{ fontSize:"9px", color:"#444", marginBottom:"3px" }}>{item[0]}/unit</div>
              <div style={{ fontSize:"14px", fontWeight:"700", color: item[1] >= 0 ? "#c8f54a" : "#ef4444" }}>
                {item[1] >= 0 ? "+" : "-"}${Math.abs(item[1])}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize:"10px", color:"#333", lineHeight:"1.6" }}>
        Flat betting 1 unit per edge call at -110. Past results do not guarantee future returns.
      </div>
    </div>
  );
}

// ── CALIBRATION DASHBOARD ────────────────────────────────────
function CalibrationDashboard({ isPremium }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(function() {
    fetch("/api/calibration")
      .then(function(r) { return r.json(); })
      .then(function(d) { setData(d); setLoading(false); })
      .catch(function(e) { setError(e.message); setLoading(false); });
  }, []);

  if (!isPremium) return (
    <div style={{ textAlign:"center", padding:"40px 20px" }}>
      <div style={{ fontSize:"32px", marginBottom:"12px" }}>🔒</div>
      <div style={{ fontSize:"14px", color:"#555", marginBottom:"16px" }}>Calibration is premium only.</div>
      <button onClick={function() { startCheckout("monthly"); }} style={{ background:"linear-gradient(135deg,#c8f54a,#8fdb00)", border:"none", borderRadius:"10px", padding:"12px 24px", fontSize:"13px", fontWeight:"700", cursor:"pointer", color:"#000" }}>UPGRADE →</button>
    </div>
  );

  if (loading) return <div style={{ textAlign:"center", padding:"40px", color:"#444" }}>Loading...</div>;
  if (error)   return <div style={{ textAlign:"center", padding:"40px", color:"#ef4444" }}>Error: {error}</div>;
  if (!data || !safeData.total || safeData.total === 0) return (
    <div style={{ textAlign:"center", padding:"40px 20px" }}>
      <div style={{ fontSize:"32px", marginBottom:"12px" }}>📊</div>
      <div style={{ fontSize:"14px", color:"#777" }}>Not enough resolved edge calls yet.</div>
      <div style={{ fontSize:"12px", color:"#444", marginTop:"8px" }}>Need at least 1 resolved call. Check back after games go final.</div>
    </div>
  );

  if (!data || typeof data !== "object") return <div style={{ padding:"40px", textAlign:"center", color:"#444" }}>No data available.</div>;
  const safeData = {
    total: safeData.total || 0,
    wins: safeData.wins || 0,
    losses: safeData.losses || 0,
    pushes: safeData.pushes || 0,
    hitRate: safeData.hitRate || 0,
    sportStats: Array.isArray(safeData.sportStats) ? safeData.sportStats : [],
    edgeStats: Array.isArray(safeData.edgeStats) ? safeData.edgeStats : [],
  };
  const gradeColor = safeData.hitRate >= 58 ? "#c8f54a" : safeData.hitRate >= 54 ? "#60a5fa" : safeData.hitRate >= 50 ? "#aaa" : "#ef4444";
  const gradeLabel = safeData.total < 50 ? "BUILDING" : safeData.hitRate >= 58 ? "SHARP" : safeData.hitRate >= 54 ? "GOOD" : safeData.hitRate >= 50 ? "NEUTRAL" : "NEEDS WORK";

  return (
    <div>
      <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"16px" }}>📊 Model Calibration</div>

      {/* Grade */}
      <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"12px", padding:"16px", marginBottom:"16px", textAlign:"center" }}>
        <div style={{ fontSize:"10px", color:"#444", letterSpacing:"2px", marginBottom:"8px" }}>MODEL GRADE</div>
        <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"36px", color: gradeColor, letterSpacing:"2px" }}>{gradeLabel}</div>
        <div style={{ fontSize:"11px", color:"#555", marginTop:"4px" }}>{safeData.total} resolved calls · {safeData.hitRate}% hit rate</div>
      </div>

      {/* Stats grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"8px", marginBottom:"16px" }}>
        <div style={{ background:"rgba(200,245,74,0.06)", borderRadius:"10px", padding:"12px", textAlign:"center" }}>
          <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"28px", color:"#c8f54a", lineHeight:1 }}>{safeData.wins}</div>
          <div style={{ fontSize:"9px", color:"#555", marginTop:"2px" }}>WINS</div>
        </div>
        <div style={{ background:"rgba(239,68,68,0.06)", borderRadius:"10px", padding:"12px", textAlign:"center" }}>
          <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"28px", color:"#ef4444", lineHeight:1 }}>{safeData.losses}</div>
          <div style={{ fontSize:"9px", color:"#555", marginTop:"2px" }}>LOSSES</div>
        </div>
        <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:"10px", padding:"12px", textAlign:"center" }}>
          <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"28px", color:"#aaa", lineHeight:1 }}>{safeData.pushes}</div>
          <div style={{ fontSize:"9px", color:"#555", marginTop:"2px" }}>PUSHES</div>
        </div>
        <div style={{ background:"rgba(255,255,255,0.03)", borderRadius:"10px", padding:"12px", textAlign:"center" }}>
          <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"28px", color: gradeColor, lineHeight:1 }}>{safeData.hitRate}%</div>
          <div style={{ fontSize:"9px", color:"#555", marginTop:"2px" }}>HIT RATE</div>
        </div>
      </div>

      {/* ROI Calculator */}
      <ROICalculator wins={safeData.wins} losses={safeData.losses} pushes={safeData.pushes} />

      {/* By sport */}
      {safeData.sportStats && safeData.sportStats.length > 0 && (
        <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"12px", padding:"14px", marginBottom:"16px" }}>
          <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", marginBottom:"10px" }}>BY SPORT</div>
          {safeData.sportStats.map(function(s, i) {
            var sportRate = s.hitRate;
            var sportColor = sportRate >= 55 ? "#c8f54a" : sportRate >= 50 ? "#aaa" : "#ef4444";
            return (
              <div key={i} style={{ marginBottom:"10px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px" }}>
                  <span style={{ fontSize:"12px", color:"#aaa" }}>{s.sport}</span>
                  <span style={{ fontSize:"12px", fontWeight:"700", color: sportColor }}>
                    {sportRate !== null ? sportRate + "%" : "—"} <span style={{ fontSize:"10px", color:"#444", fontWeight:"400" }}>({s.wins}-{s.losses})</span>
                  </span>
                </div>
                <div style={{ height:"4px", background:"rgba(255,255,255,0.06)", borderRadius:"2px" }}>
                  <div style={{ height:"100%", width: Math.min(sportRate || 0, 100) + "%", background: sportColor, borderRadius:"2px" }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* By edge size */}
      {safeData.edgeStats && safeData.edgeStats.length > 0 && (
        <div style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"12px", padding:"14px", marginBottom:"16px" }}>
          <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", marginBottom:"10px" }}>BY EDGE SIZE</div>
          {safeData.edgeStats.map(function(e, i) {
            var edgeColor = e.hitRate >= 55 ? "#c8f54a" : e.hitRate >= 50 ? "#aaa" : e.hitRate !== null ? "#ef4444" : "#333";
            return (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom: i < safeData.edgeStats.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none" }}>
                <div>
                  <div style={{ fontSize:"12px", color:"#aaa" }}>Edge {e.bucket}</div>
                  <div style={{ fontSize:"10px", color:"#444" }}>{e.total} calls</div>
                </div>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:"14px", fontWeight:"700", color: edgeColor }}>{e.hitRate !== null ? e.hitRate + "%" : "—"}</div>
                  <div style={{ fontSize:"10px", color:"#444" }}>{e.wins}W {e.losses}L</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* What this means */}
      <div style={{ background:"rgba(200,245,74,0.03)", border:"1px solid rgba(200,245,74,0.10)", borderRadius:"12px", padding:"14px" }}>
        <div style={{ fontSize:"10px", color:"#c8f54a", letterSpacing:"2px", marginBottom:"8px" }}>🎯 WHAT THIS MEANS</div>
        {safeData.total < 50 && <div style={{ fontSize:"12px", color:"#555", lineHeight:"1.7" }}>Need {50 - safeData.total} more resolved calls for full statistical confidence. Model is actively learning.</div>}
        {safeData.total >= 50 && safeData.hitRate >= 55 && <div style={{ fontSize:"12px", color:"#aaa", lineHeight:"1.7" }}>Model is performing well. Focus on marketing and growing the user base.</div>}
        {safeData.total >= 50 && safeData.hitRate >= 50 && safeData.hitRate < 55 && <div style={{ fontSize:"12px", color:"#aaa", lineHeight:"1.7" }}>Near breakeven. Check which sports are underperforming.</div>}
        {safeData.total >= 50 && safeData.hitRate < 50 && <div style={{ fontSize:"12px", color:"#ef4444", lineHeight:"1.7" }}>Model needs calibration. Review sport-by-sport breakdown.</div>}
      </div>
    </div>
  );
}
