// ── LANDING PAGE — shown to logged-out users ─────────────────
function LandingPage({ onSignUp, onSignIn }) {
  const [record, setRecord] = useState(null);

  useEffect(() => {
    fetch("/api/track-record")
      .then(r => r.json())
      .then(calls => {
        if (!Array.isArray(calls)) return;
        const resolved = calls.filter(c => c.result === "win" || c.result === "loss" || c.result === "push");
        const wins   = resolved.filter(c => c.result === "win").length;
        const losses = resolved.filter(c => c.result === "loss").length;
        const hitRate = (wins + losses) > 0 ? Math.round(wins / (wins + losses) * 100) : 0;
        const netUnits = +((wins * 0.909) - (losses * 1.0)).toFixed(2);
        const recent = calls.slice(0, 5);
        setRecord({ wins, losses, hitRate, netUnits, recent });
      }).catch(() => {});
  }, []);

  return (
    <div style={{ minHeight:"100vh", background:"#080810", color:"#fff", fontFamily:"'DM Sans',sans-serif", padding:"0 0 48px" }}>
      {/* Header */}
      <div style={{ textAlign:"center", padding:"40px 20px 24px" }}>
        <div style={{ fontFamily:"'Permanent Marker',cursive", fontSize:"36px", background:"linear-gradient(135deg,#c8f54a,#8fdb00)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:"8px" }}>RARE EDGE</div>
        <div style={{ fontSize:"12px", color:"#444", letterSpacing:"3px", textTransform:"uppercase" }}>Sports Betting Intelligence</div>
      </div>

      <div style={{ maxWidth:"480px", margin:"0 auto", padding:"0 16px" }}>

        {/* Live track record */}
        {record && (
          <div style={{ background:"rgba(200,245,74,0.04)", border:"1px solid rgba(200,245,74,0.15)", borderRadius:"16px", padding:"20px", marginBottom:"20px", textAlign:"center" }}>
            <div style={{ fontSize:"10px", color:"#555", letterSpacing:"3px", textTransform:"uppercase", marginBottom:"16px" }}>⚡ Live Track Record</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"12px", marginBottom:"16px" }}>
              <div><div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"44px", color:"#c8f54a", lineHeight:1 }}>{record.wins}</div><div style={{ fontSize:"10px", color:"#555", letterSpacing:"1px" }}>WINS</div></div>
              <div><div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"44px", color:"#ef4444", lineHeight:1 }}>{record.losses}</div><div style={{ fontSize:"10px", color:"#555", letterSpacing:"1px" }}>LOSSES</div></div>
              <div><div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"44px", color: record.hitRate >= 55 ? "#c8f54a" : "#aaa", lineHeight:1 }}>{record.hitRate}%</div><div style={{ fontSize:"10px", color:"#555", letterSpacing:"1px" }}>HIT RATE</div></div>
            </div>
            <div style={{ fontSize:"12px", color:"#555" }}>
              {record.netUnits >= 0 ? "+" : ""}{record.netUnits}u ROI · 1 unit flat betting @ -110
            </div>
          </div>
        )}

        {/* Recent calls */}
        {record?.recent?.length > 0 && (
          <div style={{ marginBottom:"20px" }}>
            <div style={{ fontSize:"10px", color:"#555", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"10px" }}>Recent Calls</div>
            {record.recent.map((c, i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 12px", marginBottom:"6px", background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"10px" }}>
                <div>
                  <div style={{ fontSize:"9px", color:"#444", letterSpacing:"1px", textTransform:"uppercase", marginBottom:"2px" }}>{c.sport}</div>
                  <div style={{ fontSize:"13px", color:"#ccc" }}>{c.away} @ {c.home}</div>
                </div>
                <div style={{ fontSize:"11px", fontWeight:"700", padding:"3px 10px", borderRadius:"20px", background: c.result === "win" ? "rgba(200,245,74,0.12)" : c.result === "loss" ? "rgba(239,68,68,0.12)" : "rgba(255,255,255,0.06)", color: c.result === "win" ? "#c8f54a" : c.result === "loss" ? "#ef4444" : "#666" }}>
                  {c.result === "win" ? "✓ WIN" : c.result === "loss" ? "✗ LOSS" : c.result === "push" ? "PUSH" : "LIVE"}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Sign up CTA */}
        <div style={{ background:"rgba(200,245,74,0.06)", border:"1px solid rgba(200,245,74,0.15)", borderRadius:"14px", padding:"24px", textAlign:"center", marginBottom:"16px" }}>
          <div style={{ fontFamily:"'Bebas Neue',cursive", fontSize:"28px", color:"#c8f54a", letterSpacing:"2px", marginBottom:"8px" }}>GET THE EDGE</div>
          <div style={{ fontSize:"13px", color:"#666", marginBottom:"20px" }}>Free account. Edge alerts. Real-time analysis across 16 sports.</div>
          <button onClick={onSignUp} style={{ width:"100%", padding:"14px", background:"linear-gradient(135deg,#c8f54a,#8fdb00)", border:"none", borderRadius:"10px", cursor:"pointer", fontFamily:"'Bebas Neue',cursive", fontSize:"20px", letterSpacing:"3px", color:"#000", marginBottom:"12px" }}>
            CREATE FREE ACCOUNT →
          </button>
          <div style={{ fontSize:"13px", color:"#444" }}>
            Already have an account?{" "}
            <span onClick={onSignIn} style={{ color:"#c8f54a", cursor:"pointer", fontWeight:"600" }}>Sign In</span>
          </div>
        </div>

        {/* Features */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
          {[["⚡","Edge Detection","AI-powered edge calls across MLB, NBA, WNBA, NFL & more"],["📊","Live Calibration","Real-time model performance tracking"],["🔔","Push Alerts","Get notified before game time"],["🏆","Line Shopping","Best available lines across all books"]].map(([icon, title, desc]) => (
            <div key={title} style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:"10px", padding:"14px" }}>
              <div style={{ fontSize:"20px", marginBottom:"6px" }}>{icon}</div>
              <div style={{ fontSize:"12px", color:"#ccc", fontWeight:"600", marginBottom:"4px" }}>{title}</div>
              <div style={{ fontSize:"11px", color:"#444", lineHeight:"1.4" }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── SIGNUP MODAL ─────────────────────────────────────────────
function SignupModal({ onComplete, onSwitchToLogin }) {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [done, setDone]       = useState(false);

  const submit = async () => {
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!email.trim() || !email.includes("@")) { setError("Please enter a valid email."); return; }
    setLoading(true); setError("");
    try {
      let user = await dbGetUser(email.trim().toLowerCase());
      if (!user) {
        const res = await dbSignup(name.trim(), email.trim().toLowerCase());
        user = Array.isArray(res) ? res[0] : res;
      }
      localStorage.setItem("re_user", JSON.stringify(user));
      setDone(true);
      setTimeout(() => onComplete(user), 1400);
    } catch(e) {
      setError(e.message || "Something went wrong. Try again.");
    } finally { setLoading(false); }
  };

  if (done) return (
    <div style={{ position:"fixed", inset:0, zIndex:99999, background:"#080810", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"16px" }}>
      <div style={{ fontSize:"56px" }}>⚡</div>
      <div style={{ fontFamily:"'Permanent Marker',cursive", fontSize:"32px", background:"linear-gradient(135deg,#c8f54a,#8fdb00)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>You're In!</div>
      <div style={{ fontSize:"13px", color:"#555" }}>Loading your edge...</div>
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, zIndex:99999, background:"rgba(6,6,13,0.98)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <div style={{ maxWidth:"400px", width:"100%" }}>
        <div style={{ textAlign:"center", marginBottom:"32px" }}>
          <div style={{ fontFamily:"'Permanent Marker',cursive", fontSize:"clamp(28px,8vw,42px)", background:"linear-gradient(135deg,#c8f54a,#8fdb00,#ffdd00)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:"10px" }}>RARE EDGE</div>
          <div style={{ fontSize:"14px", color:"#666" }}>Create your free account. No credit card required.</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:"12px", marginBottom:"14px" }}>
          <div>
            <label style={S.lbl}>Your Name</label>
            <input style={S.input} placeholder="e.g. Randy" value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} />
          </div>
          <div>
            <label style={S.lbl}>Email Address</label>
            <input style={S.input} type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} />
          </div>
        </div>
        {error && <div style={{ background:"rgba(255,77,77,0.08)", border:"1px solid rgba(255,77,77,0.2)", borderRadius:"8px", padding:"10px 14px", fontSize:"13px", color:"#ff6b6b", marginBottom:"12px" }}>{error}</div>}
        <button onClick={submit} disabled={loading} style={{ ...S.btn, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "CREATING ACCOUNT..." : "GET MY EDGE FREE →"}
        </button>
        <div style={{ textAlign:"center", marginTop:"16px", fontSize:"13px", color:"#555" }}>
          Already have an account?{" "}
          <span onClick={onSwitchToLogin} style={{ color:"#c8f54a", cursor:"pointer", fontWeight:"600" }}>Sign In</span>
        </div>
        <div style={{ marginTop:"20px", background:"rgba(200,245,74,0.04)", border:"1px solid rgba(200,245,74,0.10)", borderRadius:"10px", padding:"14px" }}>
          <div style={{ fontSize:"10px", color:"#c8f54a", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"8px" }}>Free includes:</div>
          {["14 sports — view every game","Live odds from 4 sportsbooks","Win probability on every game","Clickable game details"].map((f, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:"8px", padding:"4px 0", fontSize:"12px", color:"#666" }}>
              <span style={{ color:"#c8f54a" }}>✓</span>{f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── SIGN IN MODAL ─────────────────────────────────────────────
function SignInModal({ onComplete, onSwitchToSignup, onClose }) {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [done, setDone]       = useState(false);

  const submit = async () => {
    if (!email.trim() || !email.includes("@")) { setError("Please enter a valid email."); return; }
    setLoading(true); setError("");
    try {
      const user = await dbGetUser(email.trim().toLowerCase());
      if (!user) { setError("No account found with that email. Sign up first."); setLoading(false); return; }
      localStorage.setItem("re_user", JSON.stringify(user));
      setDone(true);
      setTimeout(() => onComplete(user), 1200);
    } catch(e) {
      setError(e.message || "Something went wrong. Try again.");
    } finally { setLoading(false); }
  };

  if (done) return (
    <div style={{ position:"fixed", inset:0, zIndex:99999, background:"#080810", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"16px" }}>
      <div style={{ fontSize:"56px" }}>⚡</div>
      <div style={{ fontFamily:"'Permanent Marker',cursive", fontSize:"32px", background:"linear-gradient(135deg,#c8f54a,#8fdb00)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>Welcome Back!</div>
      <div style={{ fontSize:"13px", color:"#555" }}>Loading your edge...</div>
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, zIndex:99999, background:"rgba(6,6,13,0.98)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px" }}>
      <div style={{ maxWidth:"400px", width:"100%" }}>
        <div style={{ textAlign:"center", marginBottom:"32px" }}>
          <div style={{ fontFamily:"'Permanent Marker',cursive", fontSize:"clamp(28px,8vw,42px)", background:"linear-gradient(135deg,#c8f54a,#8fdb00,#ffdd00)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:"10px" }}>RARE EDGE</div>
          <div style={{ fontSize:"14px", color:"#666" }}>Sign in to your account.</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:"12px", marginBottom:"14px" }}>
          <div>
            <label style={S.lbl}>Email Address</label>
            <input style={S.input} type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} />
          </div>
        </div>
        {error && <div style={{ background:"rgba(255,77,77,0.08)", border:"1px solid rgba(255,77,77,0.2)", borderRadius:"8px", padding:"10px 14px", fontSize:"13px", color:"#ff6b6b", marginBottom:"12px" }}>{error}</div>}
        <button onClick={submit} disabled={loading} style={{ ...S.btn, opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "SIGNING IN..." : "SIGN IN →"}
        </button>
        <div style={{ textAlign:"center", marginTop:"16px", fontSize:"13px", color:"#555" }}>
          Don't have an account?{" "}
          <span onClick={onSwitchToSignup} style={{ color:"#c8f54a", cursor:"pointer", fontWeight:"600" }}>Sign Up Free</span>
        </div>
        {onClose && (
          <div style={{ textAlign:"center", marginTop:"12px" }}>
            <span onClick={onClose} style={{ fontSize:"12px", color:"#444", cursor:"pointer" }}>Cancel</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── ONBOARDING ───────────────────────────────────────────────
const OB_STEPS = [
  { emoji:"⚡", title:"Welcome to\nRARE EDGE", sub:"Sports betting intelligence. Edge detection across 14 sports.", tip:null },
  { emoji:"📊", title:"Dashboard\nFirst", sub:"See today's games across all sports in one view. Tap any game for full projections.", tip:null },
  { emoji:"🔒", title:"Free vs\nPremium", sub:"Free: view all games & odds. Premium: edge detection, projections & picks.", tip:null },
  { emoji:"🚀", title:"You're Ready\nTo Find Edges", sub:"Start with the Dashboard. Tap any game to see details and projections.", tip:null, isLast:true },
];

function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(0);
  const [out, setOut] = useState(false);
  const curr = OB_STEPS[step];

  const next = () => {
    if (curr.isLast) { onComplete(); return; }
    setOut(true);
    setTimeout(() => { setStep(s => s + 1); setOut(false); }, 280);
  };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:9999, background:"rgba(6,6,13,0.96)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"32px" }}>
      <div style={{ maxWidth:"380px", width:"100%", textAlign:"center", animation: out ? "obOut 0.28s ease forwards" : "obIn 0.35s ease" }}>
        <div style={{ fontSize:"72px", marginBottom:"20px" }}>{curr.emoji}</div>
        <div style={{ fontFamily:"'Permanent Marker',cursive", fontSize:"clamp(24px,7vw,36px)", color:"#fff", marginBottom:"14px", lineHeight:"1.3", whiteSpace:"pre-line" }}>{curr.title}</div>
        <div style={{ fontSize:"14px", color:"#666", lineHeight:"1.7", marginBottom:"32px" }}>{curr.sub}</div>
        <div style={{ display:"flex", gap:"6px", justifyContent:"center", marginBottom:"24px" }}>
          {OB_STEPS.map((_, i) => <div key={i} style={{ width: i === step ? "24px" : "6px", height:"6px", borderRadius:"3px", background: i === step ? "#c8f54a" : "#222", transition:"all 0.3s" }} />)}
        </div>
        <button onClick={next} style={S.btn}>{curr.isLast ? "START FINDING EDGES →" : "NEXT →"}</button>
        {!curr.isLast && <button onClick={onComplete} style={{ background:"none", border:"none", color:"#444", cursor:"pointer", fontSize:"12px", marginTop:"14px", fontFamily:"inherit" }}>Skip</button>}
      </div>
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────
function RareEdge() {
  const [activeTab, setActiveTab]           = useState("dashboard");
  const [menuOpen, setMenuOpen]             = useState(false);
  const [showSignup, setShowSignup]         = useState(() => !getStoredUser());
  const [showSignIn, setShowSignIn]         = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [user, setUser]                     = useState(() => getStoredUser());

  // Handle upgrade success — update Supabase + localStorage
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("upgraded") === "true") {
      window.history.replaceState({}, "", "/app");
      const u = getStoredUser();
      if (u?.email) {
        dbSetPremium(u.email).then(updated => {
          const fresh = updated || u;
          fresh.plan = "premium";
          localStorage.setItem("re_user", JSON.stringify(fresh));
          setUser({...fresh});
        }).catch(() => {
          // Fallback: at least update localStorage
          u.plan = "premium";
          localStorage.setItem("re_user", JSON.stringify(u));
          setUser({...u});
        });
      }
    }
  }, []);

  const handleSignupDone = (u) => {
    setUser(u);
    setShowSignup(false);
    setShowSignIn(false);
    const seen = localStorage.getItem("re_onboarding_done");
    if (!seen) setShowOnboarding(true);
  };

  const handleSignInDone = async (u) => {
    // Always pull fresh plan status from Supabase on sign in
    try {
      const fresh = await dbGetUser(u.email);
      if (fresh) {
        localStorage.setItem("re_user", JSON.stringify(fresh));
        setUser(fresh);
      } else {
        setUser(u);
      }
    } catch(err) {
      setUser(u);
    }
    setShowSignIn(false);
    setShowSignup(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("re_user");
    setUser(null);
    setMenuOpen(false);
    setShowSignup(true);
  };

  const handleManageSubscription = async () => {
    if (!user?.email) return;
    try {
      const r = await fetch("/api/portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email })
      });
      const data = await r.json();
      if (data.url) window.location.href = data.url;
      else alert("Could not open portal: " + (data.error || "Unknown error"));
    } catch(e) {
      alert("Error: " + e.message);
    }
  };

  const handleOnboardingDone = () => {
    setShowOnboarding(false);
    try { localStorage.setItem("re_onboarding_done", "true"); } catch {}
  };

  const isPremium = user?.plan === "premium";
  const [pushEnabled, setPushEnabled] = useState(false);

  // Register service worker and check push status
  useEffect(() => {
    if (!isPremium) return;
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.register("/sw.js")
        .then(reg => {
          reg.pushManager.getSubscription().then(sub => {
            setPushEnabled(!!sub);
          });
        })
        .catch(() => {});
    }
  }, [isPremium]);

  const handlePushToggle = async () => {
    if (!isPremium || !user?.email) return;
    try {
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();

      if (existing) {
        // Unsubscribe
        await existing.unsubscribe();
        await fetch("/api/push", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email })
        });
        setPushEnabled(false);
      } else {
        // Subscribe
        const keyRes = await fetch("/api/push");
        const { publicKey } = await keyRes.json();
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: publicKey
        });
        await fetch("/api/push", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "subscribe", email: user.email, subscription: sub.toJSON() })
        });
        setPushEnabled(true);
      }
    } catch(e) {
      alert("Push notifications not supported on this device.");
    }
  };

  const tabs = [
    { id:"dashboard",        label:"Dashboard",       emoji:"📊" },
    { id:"ncaaf",            label:"NCAA Football",   emoji:"🏈" },
    { id:"nfl",              label:"NFL",             emoji:"🏈" },
    { id:"ufl",              label:"UFL",             emoji:"🏈" },
    { id:"nba",              label:"NBA",             emoji:"🏀" },
    { id:"ncaab",            label:"NCAA Hoops",      emoji:"🏀" },
    { id:"wnba",             label:"WNBA",            emoji:"🏀" },
    { id:"mlb",              label:"MLB",             emoji:"⚾" },
    { id:"college_baseball", label:"College Baseball",emoji:"⚾" },
    { id:"college_softball", label:"College Softball",emoji:"🥎" },
    { id:"nhl",              label:"NHL",             emoji:"🏒" },
    { id:"soccer",           label:"Soccer",          emoji:"⚽" },
    { id:"nwsl",             label:"NWSL",            emoji:"⚽" },
    { id:"golf",             label:"Golf",            emoji:"⛳" },
    { id:"tennis",           label:"Tennis",          emoji:"🎾" },
    { id:"mma",              label:"MMA/UFC",         emoji:"🥊" },
    { id:"calibration",       label:"Calibration",      emoji:"📊" },
  ];

  const activeInfo = tabs.find(t => t.id === activeTab);

  return (
    <div style={{ minHeight:"100vh", background:"#080810", color:"#fff", fontFamily:"'DM Sans',sans-serif" }}>
      {/* Landing page for logged-out users */}
      {showSignup && !showSignIn && !user && (
        <LandingPage
          onSignUp={() => { setShowSignup(false); setShowSignIn(false); setShowOnboarding(false); setTimeout(() => { const el = document.getElementById("re-show-signup"); if(el) el.click(); }, 50); }}
          onSignIn={() => { setShowSignup(false); setShowSignIn(true); }}
        />
      )}
      {!showSignup && !showSignIn && !user && (
        <SignupModal onComplete={handleSignupDone} onSwitchToLogin={() => { setShowSignIn(true); }} />
      )}
      {showSignIn && (
        <SignInModal
          onComplete={handleSignInDone}
          onSwitchToSignup={() => { setShowSignIn(false); setShowSignup(true); }}
          onClose={user ? () => setShowSignIn(false) : null}
        />
      )}
      {showOnboarding && <OnboardingFlow onComplete={handleOnboardingDone} />}
      <button id="re-show-signup" style={{ display:"none" }} onClick={() => { setShowSignup(false); }} />

      {/* Header */}
      <div style={{ position:"sticky", top:0, zIndex:100, background:"rgba(8,8,16,0.95)", backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(255,255,255,0.06)", padding:"12px 16px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <button onClick={() => setMenuOpen(m => !m)} style={{ background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", gap:"5px", padding:"4px" }}>
          {[0,1,2].map(i => <div key={i} style={{ width:"22px", height:"2px", background:"#c8f54a", borderRadius:"1px", transition:"all 0.3s" }} />)}
        </button>
        <div style={{ fontFamily:"'Permanent Marker',cursive", fontSize:"22px", background:"linear-gradient(135deg,#c8f54a,#8fdb00)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", letterSpacing:"2px" }}>RARE EDGE</div>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          {!isPremium && <button onClick={() => startCheckout("monthly")} style={{ background:"linear-gradient(135deg,#c8f54a,#8fdb00)", border:"none", borderRadius:"20px", padding:"6px 14px", cursor:"pointer", fontSize:"11px", fontWeight:"700", color:"#000", letterSpacing:"1px" }}>⚡ UPGRADE</button>}
          <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#c8f54a", animation:"pulse 2s infinite" }} />
        </div>
      </div>

      {/* Hamburger Menu */}
      {menuOpen && (
        <div style={{ position:"fixed", inset:0, zIndex:200 }} onClick={() => setMenuOpen(false)}>
          <div style={{ position:"absolute", left:0, top:0, bottom:0, width:"280px", background:"#0a0a14", borderRight:"1px solid rgba(255,255,255,0.08)", overflowY:"auto", animation:"menuSlide 0.25s ease" }} onClick={e => e.stopPropagation()}>
            <div style={{ padding:"20px 20px 10px" }}>
              <div style={{ fontFamily:"'Permanent Marker',cursive", fontSize:"24px", background:"linear-gradient(135deg,#c8f54a,#8fdb00)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", marginBottom:"4px" }}>RARE EDGE</div>
              <div style={{ fontSize:"10px", color:"#444", letterSpacing:"2px" }}>SPORTS INTELLIGENCE</div>
            </div>
            <div style={{ height:"1px", background:"rgba(255,255,255,0.06)", margin:"0 20px 10px" }} />

            {/* Nav items */}
            {tabs.map(t => (
              <div key={t.id} onClick={() => { setActiveTab(t.id); setMenuOpen(false); }}
                style={{ padding:"13px 20px", cursor:"pointer", display:"flex", alignItems:"center", gap:"12px", background: activeTab === t.id ? "rgba(200,245,74,0.08)" : "transparent", borderLeft: activeTab === t.id ? "2px solid #c8f54a" : "2px solid transparent" }}>
                <span style={{ fontSize:"18px" }}>{t.emoji}</span>
                <span style={{ fontSize:"14px", color: activeTab === t.id ? "#c8f54a" : "#888", fontWeight: activeTab === t.id ? "600" : "400" }}>{t.label}</span>
              </div>
            ))}

            {/* Auth section at bottom of menu */}
            <div style={{ height:"1px", background:"rgba(255,255,255,0.06)", margin:"10px 20px" }} />
            {user ? (
              <div style={{ padding:"16px 20px" }}>
                <div style={{ fontSize:"11px", color:"#444" }}>Signed in as</div>
                <div style={{ fontSize:"13px", color:"#777", marginTop:"2px", marginBottom:"4px" }}>{user.email}</div>
                <div style={{ fontSize:"11px", color: isPremium ? "#c8f54a" : "#555", fontWeight:"600", marginBottom:"14px" }}>{isPremium ? "⚡ PREMIUM" : "FREE PLAN"}</div>
                {isPremium && (
                  <button onClick={handleManageSubscription} style={{ width:"100%", padding:"10px", background:"rgba(200,245,74,0.08)", border:"1px solid rgba(200,245,74,0.2)", borderRadius:"8px", color:"#c8f54a", fontSize:"13px", fontWeight:"600", cursor:"pointer", fontFamily:"inherit", marginBottom:"8px" }}>
                    Manage Subscription
                  </button>
                )}
                {isPremium && "serviceWorker" in navigator && (
                  <button onClick={handlePushToggle} style={{ width:"100%", padding:"10px", background: pushEnabled ? "rgba(200,245,74,0.08)" : "rgba(255,255,255,0.04)", border: pushEnabled ? "1px solid rgba(200,245,74,0.2)" : "1px solid rgba(255,255,255,0.08)", borderRadius:"8px", color: pushEnabled ? "#c8f54a" : "#666", fontSize:"13px", fontWeight:"600", cursor:"pointer", fontFamily:"inherit", marginBottom:"8px" }}>
                    {pushEnabled ? "🔔 Notifications On" : "🔕 Enable Notifications"}
                  </button>
                )}
                {!isPremium && (
                  <button onClick={() => { setMenuOpen(false); startCheckout("monthly"); }} style={{ width:"100%", padding:"10px", background:"linear-gradient(135deg,#c8f54a,#8fdb00)", border:"none", borderRadius:"8px", color:"#000", fontSize:"13px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", marginBottom:"8px" }}>
                    ⚡ Upgrade to Premium
                  </button>
                )}
                <button onClick={handleLogout} style={{ width:"100%", padding:"10px", background:"rgba(255,77,77,0.08)", border:"1px solid rgba(255,77,77,0.2)", borderRadius:"8px", color:"#ff6b6b", fontSize:"13px", fontWeight:"600", cursor:"pointer", fontFamily:"inherit" }}>
                  Sign Out
                </button>
              </div>
            ) : (
              <div style={{ padding:"16px 20px", display:"flex", flexDirection:"column", gap:"10px" }}>
                <button onClick={() => { setMenuOpen(false); setShowSignIn(true); }} style={{ width:"100%", padding:"10px", background:"rgba(200,245,74,0.08)", border:"1px solid rgba(200,245,74,0.2)", borderRadius:"8px", color:"#c8f54a", fontSize:"13px", fontWeight:"600", cursor:"pointer", fontFamily:"inherit" }}>
                  Sign In
                </button>
                <button onClick={() => { setMenuOpen(false); setShowSignup(true); }} style={{ width:"100%", padding:"10px", background:"linear-gradient(135deg,#c8f54a,#8fdb00)", border:"none", borderRadius:"8px", color:"#000", fontSize:"13px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit" }}>
                  Sign Up Free
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div style={{ padding:"16px", maxWidth:"720px", margin:"0 auto" }}>
        <div style={{ fontSize:"10px", color:"#444", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"16px" }}>
          {activeInfo?.emoji} {activeInfo?.label}
        </div>
        {activeTab === "dashboard"        && <DashboardTab        isPremium={isPremium} />}
        {activeTab === "ncaaf"            && <NCAAFTab            isPremium={isPremium} />}
        {activeTab === "nfl"              && <NFLTab              isPremium={isPremium} />}
        {activeTab === "ufl"              && <UFLTab              isPremium={isPremium} />}
        {activeTab === "nba"              && <NBATab              isPremium={isPremium} />}
        {activeTab === "ncaab"            && <NCAABTab            isPremium={isPremium} />}
        {activeTab === "wnba"             && <WNBATab             isPremium={isPremium} />}
        {activeTab === "mlb"              && <MLBTab              isPremium={isPremium} />}
        {activeTab === "college_baseball" && <CollegeBaseballTab  isPremium={isPremium} />}
        {activeTab === "college_softball" && <CollegeSoftballTab  isPremium={isPremium} />}
        {activeTab === "nhl"              && <NHLTab              isPremium={isPremium} />}
        {activeTab === "soccer"           && <SoccerTab           isPremium={isPremium} />}
        {activeTab === "nwsl"             && <NWSLTab             isPremium={isPremium} />}
        {activeTab === "golf"             && <GolfTab             isPremium={isPremium} />}
        {activeTab === "tennis"           && <TennisTab           isPremium={isPremium} />}
        {activeTab === "mma"              && <MMATab              isPremium={isPremium} />}
        {activeTab === "calibration"       && <CalibrationDashboard isPremium={isPremium} />}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(RareEdge));
