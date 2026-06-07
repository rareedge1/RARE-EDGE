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
    const r = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan })
    });
    const data = await r.json();
    if (data.url) window.location.href = data.url;
    else alert("Checkout error: " + (data.error || "Unknown error"));
  } catch(e) {
    alert("Checkout failed: " + e.message);
  }
}
