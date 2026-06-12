function ROICalculator({ wins, losses, pushes }) {
  var WIN_PAYOUT = 0.909;
  var netUnits = +((wins * WIN_PAYOUT) - (losses * 1.0)).toFixed(2);
  var totalBets = wins + losses + pushes;
  var roi = totalBets > 0 ? +((netUnits / totalBets) * 100).toFixed(1) : 0;
  var isProfit = netUnits >= 0;
  var at25 = +(netUnits * 25).toFixed(0);
  var at50 = +(netUnits * 50).toFixed(0);
  var at100 = +(netUnits * 100).toFixed(0);
  if (totalBets === 0) return null;
  return (
    <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:"12px",padding:"14px",marginBottom:"16px"}}>
      <div style={{fontSize:"10px",color:"#555",letterSpacing:"2px",marginBottom:"12px"}}>💰 ROI · 1 UNIT PER CALL AT -110</div>
      <div style={{textAlign:"center",marginBottom:"14px"}}>
        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:"48px",color:isProfit?"#c8f54a":"#ef4444",lineHeight:1}}>
          {isProfit?"+":""}{netUnits}u
        </div>
        <div style={{fontSize:"11px",color:"#444",marginTop:"4px"}}>{roi>0?"+":""}{roi}% ROI · {totalBets} calls</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"6px",marginBottom:"10px"}}>
        <div style={{textAlign:"center",background:"rgba(255,255,255,0.02)",borderRadius:"8px",padding:"8px"}}>
          <div style={{fontSize:"9px",color:"#444",marginBottom:"3px"}}>$25/unit</div>
          <div style={{fontSize:"14px",fontWeight:"700",color:at25>=0?"#c8f54a":"#ef4444"}}>{at25>=0?"+":"-"}${Math.abs(at25)}</div>
        </div>
        <div style={{textAlign:"center",background:"rgba(255,255,255,0.02)",borderRadius:"8px",padding:"8px"}}>
          <div style={{fontSize:"9px",color:"#444",marginBottom:"3px"}}>$50/unit</div>
          <div style={{fontSize:"14px",fontWeight:"700",color:at50>=0?"#c8f54a":"#ef4444"}}>{at50>=0?"+":"-"}${Math.abs(at50)}</div>
        </div>
        <div style={{textAlign:"center",background:"rgba(255,255,255,0.02)",borderRadius:"8px",padding:"8px"}}>
          <div style={{fontSize:"9px",color:"#444",marginBottom:"3px"}}>$100/unit</div>
          <div style={{fontSize:"14px",fontWeight:"700",color:at100>=0?"#c8f54a":"#ef4444"}}>{at100>=0?"+":"-"}${Math.abs(at100)}</div>
        </div>
      </div>
      <div style={{fontSize:"10px",color:"#333"}}>Flat betting 1 unit per edge call at -110.</div>
    </div>
  );
}

function CalibrationDashboard({ isPremium }) {
  var state = useState(null);
  var data = state[0];
  var setData = state[1];
  var loadState = useState(true);
  var loading = loadState[0];
  var setLoading = loadState[1];

  useEffect(function() {
    fetch("/api/calibration")
      .then(function(r) { return r.json(); })
      .then(function(d) { setData(d); setLoading(false); })
      .catch(function() { setLoading(false); });
  }, []);

  if (!isPremium) return (
    <div style={{textAlign:"center",padding:"40px 20px"}}>
      <div style={{fontSize:"32px",marginBottom:"12px"}}>🔒</div>
      <div style={{fontSize:"14px",color:"#555",marginBottom:"16px"}}>Calibration is premium only.</div>
      <button onClick={function(){startCheckout("monthly");}} style={{background:"linear-gradient(135deg,#c8f54a,#8fdb00)",border:"none",borderRadius:"10px",padding:"12px 24px",fontSize:"13px",fontWeight:"700",cursor:"pointer",color:"#000"}}>UPGRADE →</button>
    </div>
  );

  if (loading) return <div style={{textAlign:"center",padding:"40px",color:"#aaa"}}>Loading calibration data...</div>;

  if (!data || !data.total || data.total === 0) return (
    <div style={{textAlign:"center",padding:"40px 20px"}}>
      <div style={{fontSize:"32px",marginBottom:"12px"}}>📊</div>
      <div style={{fontSize:"14px",color:"#777"}}>Not enough resolved calls yet.</div>
    </div>
  );

  var wins = data.wins || 0;
  var losses = data.losses || 0;
  var pushes = data.pushes || 0;
  var hitRate = data.hitRate || 0;
  var total = data.total || 0;
  var gradeColor = hitRate >= 58 ? "#c8f54a" : hitRate >= 54 ? "#60a5fa" : hitRate >= 50 ? "#aaa" : "#ef4444";
  var gradeLabel = total < 50 ? "BUILDING" : hitRate >= 58 ? "SHARP" : hitRate >= 54 ? "GOOD" : hitRate >= 50 ? "NEUTRAL" : "NEEDS WORK";
  var sportStats = Array.isArray(data.sportStats) ? data.sportStats : [];
  var edgeStats = Array.isArray(data.edgeStats) ? data.edgeStats : [];

  return (
    <div>
      <div style={{fontSize:"10px",color:"#555",letterSpacing:"2px",textTransform:"uppercase",marginBottom:"16px"}}>📊 Model Calibration</div>

      <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.10)",borderRadius:"12px",padding:"16px",marginBottom:"16px",textAlign:"center"}}>
        <div style={{fontSize:"10px",color:"#444",letterSpacing:"2px",marginBottom:"8px"}}>MODEL GRADE</div>
        <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:"36px",color:gradeColor,letterSpacing:"2px"}}>{gradeLabel}</div>
        <div style={{fontSize:"11px",color:"#555",marginTop:"4px"}}>{total} resolved calls · {hitRate}% hit rate</div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"8px",marginBottom:"16px"}}>
        <div style={{background:"rgba(200,245,74,0.06)",borderRadius:"10px",padding:"12px",textAlign:"center"}}>
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:"28px",color:"#c8f54a",lineHeight:1}}>{wins}</div>
          <div style={{fontSize:"9px",color:"#555",marginTop:"2px"}}>WINS</div>
        </div>
        <div style={{background:"rgba(239,68,68,0.06)",borderRadius:"10px",padding:"12px",textAlign:"center"}}>
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:"28px",color:"#ef4444",lineHeight:1}}>{losses}</div>
          <div style={{fontSize:"9px",color:"#555",marginTop:"2px"}}>LOSSES</div>
        </div>
        <div style={{background:"rgba(255,255,255,0.03)",borderRadius:"10px",padding:"12px",textAlign:"center"}}>
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:"28px",color:"#aaa",lineHeight:1}}>{pushes}</div>
          <div style={{fontSize:"9px",color:"#555",marginTop:"2px"}}>PUSHES</div>
        </div>
        <div style={{background:"rgba(255,255,255,0.03)",borderRadius:"10px",padding:"12px",textAlign:"center"}}>
          <div style={{fontFamily:"'Bebas Neue',cursive",fontSize:"28px",color:gradeColor,lineHeight:1}}>{hitRate}%</div>
          <div style={{fontSize:"9px",color:"#555",marginTop:"2px"}}>HIT RATE</div>
        </div>
      </div>

      <ROICalculator wins={wins} losses={losses} pushes={pushes} />

      {sportStats.length > 0 && (
        <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"12px",padding:"14px",marginBottom:"16px"}}>
          <div style={{fontSize:"10px",color:"#555",letterSpacing:"2px",marginBottom:"10px"}}>BY SPORT</div>
          {sportStats.map(function(s, i) {
            var sc = s.hitRate >= 55 ? "#c8f54a" : s.hitRate >= 50 ? "#aaa" : "#ef4444";
            return (
              <div key={i} style={{marginBottom:"10px"}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:"4px"}}>
                  <span style={{fontSize:"12px",color:"#aaa"}}>{s.sport}</span>
                  <span style={{fontSize:"12px",fontWeight:"700",color:sc}}>{s.hitRate !== null ? s.hitRate+"%" : "—"} <span style={{fontSize:"10px",color:"#444",fontWeight:"400"}}>({s.wins}-{s.losses})</span></span>
                </div>
                <div style={{height:"4px",background:"rgba(255,255,255,0.06)",borderRadius:"2px"}}>
                  <div style={{height:"100%",width:Math.min(s.hitRate||0,100)+"%",background:sc,borderRadius:"2px"}} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {edgeStats.length > 0 && (
        <div style={{background:"rgba(255,255,255,0.02)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:"12px",padding:"14px",marginBottom:"16px"}}>
          <div style={{fontSize:"10px",color:"#555",letterSpacing:"2px",marginBottom:"10px"}}>BY EDGE SIZE</div>
          {edgeStats.map(function(e, i) {
            var ec = e.hitRate >= 55 ? "#c8f54a" : e.hitRate >= 50 ? "#aaa" : e.hitRate !== null ? "#ef4444" : "#333";
            return (
              <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:i<edgeStats.length-1?"1px solid rgba(255,255,255,0.04)":"none"}}>
                <div>
                  <div style={{fontSize:"12px",color:"#aaa"}}>Edge {e.bucket}</div>
                  <div style={{fontSize:"10px",color:"#444"}}>{e.total} calls</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontSize:"14px",fontWeight:"700",color:ec}}>{e.hitRate !== null ? e.hitRate+"%" : "—"}</div>
                  <div style={{fontSize:"10px",color:"#444"}}>{e.wins}W {e.losses}L</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{background:"rgba(200,245,74,0.03)",border:"1px solid rgba(200,245,74,0.10)",borderRadius:"12px",padding:"14px"}}>
        <div style={{fontSize:"10px",color:"#c8f54a",letterSpacing:"2px",marginBottom:"8px"}}>🎯 WHAT THIS MEANS</div>
        {total < 50 && <div style={{fontSize:"12px",color:"#555",lineHeight:"1.7"}}>Need {50-total} more resolved calls for full confidence. Keep the app running daily.</div>}
        {total >= 50 && hitRate >= 55 && <div style={{fontSize:"12px",color:"#aaa",lineHeight:"1.7"}}>Model is performing well. Focus on marketing.</div>}
        {total >= 50 && hitRate < 50 && <div style={{fontSize:"12px",color:"#ef4444",lineHeight:"1.7"}}>Model needs calibration. Review sport breakdown.</div>}
      </div>
    </div>
  );
}
