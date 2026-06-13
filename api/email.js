export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const RESEND_KEY   = process.env.RESEND_API_KEY;
  const SUPABASE_URL = "https://avlcbelneozxxgikpoer.supabase.co";
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2bGNiZWxuZW96eHhnaWtwb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MjEyNjEsImV4cCI6MjA5NTk5NzI2MX0.Hd-2oX5BB88hDHF0MwEik8ym3CQzJQEV6aua6FhTOPk";

  if (!RESEND_KEY) return res.status(500).json({ error: "Resend not configured" });

  try {
    const { type, to } = req.body || {};

    // Fetch today's edge calls
    const today = new Date().toLocaleDateString("en-US", { timeZone: "America/Chicago" });
    const edgesRes = await fetch(
      `${SUPABASE_URL}/rest/v1/edge_calls?game_date=eq.${encodeURIComponent(today)}&select=*&order=created_at.desc`,
      { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } }
    );
    const edges = await edgesRes.json();

    // Fetch track record
    const allEdgesRes = await fetch(
      `${SUPABASE_URL}/rest/v1/edge_calls?select=result&order=created_at.desc&limit=50`,
      { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } }
    );
    const allEdges = await allEdgesRes.json();
    const wins   = allEdges.filter(e => e.result === "win").length;
    const losses = allEdges.filter(e => e.result === "loss").length;
    const hitRate = (wins + losses) > 0 ? Math.round(wins / (wins + losses) * 100) : 0;

    // Fetch premium users
    let recipients = [];
    if (to) {
      recipients = [to];
    } else {
      const usersRes = await fetch(
        `${SUPABASE_URL}/rest/v1/users?plan=eq.premium&select=email,name`,
        { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` } }
      );
      const users = await usersRes.json();
      recipients = users.map(u => u.email).filter(Boolean);
    }

    if (!recipients.length) return res.status(200).json({ sent: 0, message: "No recipients" });

    // Build email HTML
    const dateStr = new Date().toLocaleDateString("en-US", {
      timeZone: "America/Chicago",
      weekday: "long", month: "long", day: "numeric"
    });

    const edgeRows = edges.length > 0
      ? edges.map(e => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #1a1a2e;color:#aaa;font-size:13px;">${e.sport}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #1a1a2e;color:#fff;font-size:13px;">${e.away} @ ${e.home}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #1a1a2e;color:#c8f54a;font-size:13px;font-weight:700;">${e.edge_value > 0 ? "+" : ""}${e.edge_value}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #1a1a2e;font-size:13px;">
            <span style="background:${e.result === "win" ? "#c8f54a20" : e.result === "loss" ? "#ef444420" : "#33333360"};color:${e.result === "win" ? "#c8f54a" : e.result === "loss" ? "#ef4444" : "#666"};padding:2px 8px;border-radius:4px;">${e.result === "pending" ? "LIVE" : e.result.toUpperCase()}</span>
          </td>
        </tr>`).join("")
      : `<tr><td colspan="4" style="padding:20px;text-align:center;color:#555;font-size:13px;">No edges detected today yet. Check back later.</td></tr>`;

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#080810;font-family:'DM Sans',Arial,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <div style="font-size:28px;font-weight:900;letter-spacing:3px;background:linear-gradient(135deg,#c8f54a,#8fdb00);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:6px;">RARE EDGE</div>
      <div style="color:#444;font-size:12px;letter-spacing:2px;">DAILY EDGE REPORT · ${dateStr.toUpperCase()}</div>
    </div>

    <!-- Track Record -->
    <div style="background:#0f0f1a;border:1px solid rgba(200,245,74,0.15);border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
      <div style="color:#555;font-size:10px;letter-spacing:2px;margin-bottom:12px;">⚡ TRACK RECORD · LAST 50 CALLS</div>
      <div style="display:flex;justify-content:center;gap:32px;">
        <div><div style="font-size:32px;font-weight:900;color:#c8f54a;">${wins}</div><div style="font-size:10px;color:#555;letter-spacing:1px;">WINS</div></div>
        <div><div style="font-size:32px;font-weight:900;color:#ef4444;">${losses}</div><div style="font-size:10px;color:#555;letter-spacing:1px;">LOSSES</div></div>
        <div><div style="font-size:32px;font-weight:900;color:${hitRate >= 55 ? "#c8f54a" : hitRate >= 50 ? "#aaa" : "#ef4444"};">${hitRate}%</div><div style="font-size:10px;color:#555;letter-spacing:1px;">HIT RATE</div></div>
      </div>
    </div>

    <!-- Today's Edges -->
    <div style="background:#0f0f1a;border:1px solid rgba(255,255,255,0.07);border-radius:12px;overflow:hidden;margin-bottom:24px;">
      <div style="padding:14px 16px;border-bottom:1px solid rgba(255,255,255,0.07);">
        <span style="color:#c8f54a;font-size:10px;letter-spacing:2px;font-weight:700;">⚡ TODAY'S EDGES</span>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:rgba(255,255,255,0.02);">
            <th style="padding:8px 12px;text-align:left;color:#444;font-size:10px;letter-spacing:1px;font-weight:600;">SPORT</th>
            <th style="padding:8px 12px;text-align:left;color:#444;font-size:10px;letter-spacing:1px;font-weight:600;">MATCHUP</th>
            <th style="padding:8px 12px;text-align:left;color:#444;font-size:10px;letter-spacing:1px;font-weight:600;">EDGE</th>
            <th style="padding:8px 12px;text-align:left;color:#444;font-size:10px;letter-spacing:1px;font-weight:600;">RESULT</th>
          </tr>
        </thead>
        <tbody>${edgeRows}</tbody>
      </table>
    </div>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:24px;">
      <a href="https://arareedge.com/app" style="display:inline-block;background:linear-gradient(135deg,#c8f54a,#8fdb00);color:#000;font-weight:700;font-size:14px;padding:14px 32px;border-radius:10px;text-decoration:none;letter-spacing:1px;">VIEW FULL DASHBOARD →</a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;color:#333;font-size:11px;line-height:1.6;">
      <p>You're receiving this because you're a RARE EDGE Premium member.</p>
      <p>RARE EDGE · arareedge.com</p>
    </div>
  </div>
</body>
</html>`;

    // Send to all recipients
    let sent = 0;
    for (const email of recipients) {
      try {
        const r = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: "RARE EDGE <alerts@arareedge.com>",
            to: [email],
            subject: `⚡ RARE EDGE Daily Report — ${edges.length} edge${edges.length !== 1 ? "s" : ""} detected · ${hitRate}% hit rate`,
            html
          })
        });
        if (r.ok) sent++;
      } catch(e) { /* skip failed */ }
    }

    return res.status(200).json({ sent, total: recipients.length });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
