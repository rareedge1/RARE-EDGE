// ── RARE EDGE CONFIG ─────────────────────────────────────────
const SUPABASE_URL  = "https://avlcbelneozxxgikpoer.supabase.co";
const SUPABASE_KEY  = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2bGNiZWxuZW96eHhnaWtwb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MjEyNjEsImV4cCI6MjA5NTk5NzI2MX0.Hd-2oX5BB88hDHF0MwEik8ym3CQzJQEV6aua6FhTOPk";
const STRIPE_PK     = "pk_live_51Tclx5PfkcBlMM6ni7tMIjKWFWF6GmL3AaMReZRWltp11X55XrMArEsebLT8kVYtndPUancnFihXiAYcwEIyD7LH00wlg1VjeN";
const PRICE_MONTHLY = "price_1TcmdNPfkcBlMM6nqB8opXZU";
const PRICE_ANNUAL  = "price_1TdwslPfkcBlMM6nyrtzZEvN";
const API_BASE      = "/api/odds";
const EDGE_MIN      = 2.0;
const HOME_ADV      = 2.5;

// ── SUPABASE HELPERS ─────────────────────────────────────────
async function dbSignup(name, email) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Prefer": "return=representation"
    },
    body: JSON.stringify({ name, email, plan: "free" })
  });
  if (!r.ok) { const e = await r.json(); throw new Error(e.message || "Signup failed"); }
  return r.json();
}

async function dbGetUser(email) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}&select=*`, {
    headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }
  });
  if (!r.ok) return null;
  const data = await r.json();
  return data[0] || null;
}

async function dbSetPremium(email) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Prefer": "return=representation"
    },
    body: JSON.stringify({ plan: "premium" })
  });
  if (!r.ok) return null;
  const data = await r.json();
  return data[0] || null;
}

function getStoredUser() {
  try { const u = localStorage.getItem("re_user"); return u ? JSON.parse(u) : null; }
  catch { return null; }
}

function isPremiumUser() {
  const u = getStoredUser();
  return u?.plan === "premium";
}

// ── STRIPE CHECKOUT ──────────────────────────────────────────
async function startCheckout(plan = "monthly") {
  try {
    const user = getStoredUser();
    const r = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan, email: user?.email || "" })
    });
    const data = await r.json();
    if (data.url) window.location.href = data.url;
    else alert("Checkout error: " + (data.error || "Unknown error"));
  } catch(e) {
    alert("Checkout failed: " + e.message);
  }
}
