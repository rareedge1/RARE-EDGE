export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const SUPABASE_URL = "https://avlcbelneozxxgikpoer.supabase.co";
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2bGNiZWxuZW96eHhnaWtwb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MjEyNjEsImV4cCI6MjA5NTk5NzI2MX0.Hd-2oX5BB88hDHF0MwEik8ym3CQzJQEV6aua6FhTOPk";
  const VAPID_PUBLIC  = process.env.VAPID_PUBLIC_KEY;
  const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;

  const headers = {
    "Content-Type": "application/json",
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Prefer": "return=representation"
  };

  // GET — return public VAPID key for client subscription
  if (req.method === "GET") {
    return res.status(200).json({ publicKey: VAPID_PUBLIC });
  }

  // POST — save subscription or send notification
  if (req.method === "POST") {
    const { action, subscription, email, notification } = req.body || {};

    // Save subscription
    if (action === "subscribe") {
      try {
        await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions`, {
          method: "POST",
          headers: { ...headers, "Prefer": "resolution=merge-duplicates,return=representation" },
          body: JSON.stringify({ user_email: email, subscription })
        });
        return res.status(200).json({ success: true });
      } catch(e) {
        return res.status(500).json({ error: e.message });
      }
    }

    // Send notification to all premium subscribers
    if (action === "notify") {
      if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
        return res.status(500).json({ error: "VAPID keys not configured" });
      }

      try {
        // Get all subscriptions
        const subRes = await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?select=*`, { headers });
        const subs = await subRes.json();

        if (!subs.length) return res.status(200).json({ sent: 0 });

        // Build JWT for VAPID auth
        const vapidHeader = btoa(JSON.stringify({ typ: "JWT", alg: "ES256" }))
          .replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"");
        const now = Math.floor(Date.now() / 1000);
        const vapidPayload = btoa(JSON.stringify({
          aud: "https://fcm.googleapis.com",
          exp: now + 3600,
          sub: "mailto:randyranoyr@gmail.com"
        })).replace(/\+/g,"-").replace(/\//g,"_").replace(/=/g,"");

        const payload = JSON.stringify({
          title: notification?.title || "⚡ RARE EDGE",
          body:  notification?.body  || "Edge detected!",
          icon:  "/icon-192.png",
          badge: "/icon-192.png",
          data:  notification?.data  || {},
        });

        let sent = 0;
        for (const sub of subs) {
          try {
            const pushSub = sub.subscription;
            await fetch(pushSub.endpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/octet-stream",
                "TTL": "86400",
              },
              body: payload,
            });
            sent++;
          } catch(e) { /* skip failed subscriptions */ }
        }

        return res.status(200).json({ sent, total: subs.length });
      } catch(e) {
        return res.status(500).json({ error: e.message });
      }
    }
  }

  // DELETE — remove subscription
  if (req.method === "DELETE") {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: "Email required" });
    await fetch(`${SUPABASE_URL}/rest/v1/push_subscriptions?user_email=eq.${encodeURIComponent(email)}`, {
      method: "DELETE", headers
    });
    return res.status(200).json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
