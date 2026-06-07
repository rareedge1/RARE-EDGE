export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const SUPABASE_URL = "https://avlcbelneozxxgikpoer.supabase.co";
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2bGNiZWxuZW96eHhnaWtwb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MjEyNjEsImV4cCI6MjA5NTk5NzI2MX0.Hd-2oX5BB88hDHF0MwEik8ym3CQzJQEV6aua6FhTOPk";
  const headers = {
    "Content-Type": "application/json",
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Prefer": "return=representation"
  };

  // GET — fetch recent edge calls for track record display
  if (req.method === "GET") {
    try {
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/edge_calls?select=*&order=created_at.desc&limit=50`,
        { headers }
      );
      const data = await r.json();
      res.setHeader("Cache-Control", "s-maxage=60");
      return res.status(200).json(data);
    } catch(e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // POST — log a new edge call
  if (req.method === "POST") {
    try {
      const { sport, home, away, game_date, proj_total, vegas_total, edge_value, edge_type } = req.body || {};
      if (!home || !away) return res.status(400).json({ error: "Missing required fields" });

      // Check for duplicate (same game today)
      const check = await fetch(
        `${SUPABASE_URL}/rest/v1/edge_calls?home=eq.${encodeURIComponent(home)}&away=eq.${encodeURIComponent(away)}&game_date=eq.${encodeURIComponent(game_date)}&select=id`,
        { headers }
      );
      const existing = await check.json();
      if (existing.length > 0) return res.status(200).json({ skipped: true });

      const r = await fetch(`${SUPABASE_URL}/rest/v1/edge_calls`, {
        method: "POST",
        headers,
        body: JSON.stringify({ sport, home, away, game_date, proj_total, vegas_total, edge_value, edge_type, result: "pending" })
      });
      const data = await r.json();
      return res.status(201).json(data);
    } catch(e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // PATCH — update result (win/loss/push) after game ends
  if (req.method === "PATCH") {
    try {
      const { id, result } = req.body || {};
      if (!id || !result) return res.status(400).json({ error: "Missing id or result" });
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/edge_calls?id=eq.${id}`,
        { method: "PATCH", headers, body: JSON.stringify({ result }) }
      );
      return res.status(200).json({ updated: true });
    } catch(e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
