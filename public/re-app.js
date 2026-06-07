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
    } catch {
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

  const handleOnboardingDone = () => {
    setShowOnboarding(false);
    try { localStorage.setItem("re_onboarding_done", "true"); } catch {}
  };

  const isPremium = user?.plan === "premium";

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
  ];

  const activeInfo = tabs.find(t => t.id === activeTab);

  return (
    <div style={{ minHeight:"100vh", background:"#080810", color:"#fff", fontFamily:"'DM Sans',sans-serif" }}>
      {/* Modals */}
      {showSignup && !showSignIn && (
        <SignupModal onComplete={handleSignupDone} onSwitchToLogin={() => { setShowSignup(false); setShowSignIn(true); }} />
      )}
      {showSignIn && (
        <SignInModal
          onComplete={handleSignInDone}
          onSwitchToSignup={() => { setShowSignIn(false); setShowSignup(true); }}
          onClose={user ? () => setShowSignIn(false) : null}
        />
      )}
      {showOnboarding && <OnboardingFlow onComplete={handleOnboardingDone} />}

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
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(React.createElement(RareEdge));
