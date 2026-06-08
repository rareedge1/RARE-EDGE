export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
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

  // POST — save a snapshot of current lines
  if (req.method === "POST") {
    try {
      const games = req.body?.games || [];
      if (!games.length) return res.status(400).json({ error: "No games provided" });

      const today = new Date().toLocaleDateString("en-US", { timeZone: "America/Chicago" });

      // For each game, check if we already have a snapshot in last 30 mins
      const inserts = [];
      for (const g of games) {
        const checkRes = await fetch(
          `${SUPABASE_URL}/rest/v1/line_snapshots?game_id=eq.${encodeURIComponent(g.id)}&game_date=eq.${encodeURIComponent(today)}&select=id,created_at&order=created_at.desc&limit=1`,
          { headers }
        );
        const existing = await checkRes.json();
        const lastSnap = existing[0];
        const minsAgo = lastSnap
          ? (Date.now() - new Date(lastSnap.created_at).getTime()) / 60000
          : 999;

        // Only snapshot if no snapshot in last 30 minutes
        if (minsAgo >= 30) {
          inserts.push({
            game_id:  g.id,
            sport:    g.sportLabel,
            home:     g.home,
            away:     g.away,
            game_date: today,
            spread:   g.vegasSpread,
            total:    g.vegasTotal,
            home_ml:  g.homeML,
            away_ml:  g.awayML,
          });
        }
      }

      if (inserts.length > 0) {
        await fetch(`${SUPABASE_URL}/rest/v1/line_snapshots`, {
          method: "POST",
          headers,
          body: JSON.stringify(inserts)
        });
      }

      return res.status(200).json({ saved: inserts.length });
    } catch(e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // GET — return line movement for today's games
  if (req.method === "GET") {
    try {
      const today = new Date().toLocaleDateString("en-US", { timeZone: "America/Chicago" });
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/line_snapshots?game_date=eq.${encodeURIComponent(today)}&select=*&order=created_at.asc`,
        { headers }
      );
      const snapshots = await r.json();

      // Group by game_id and calculate movement from first to latest snapshot
      const grouped = {};
      for (const snap of snapshots) {
        if (!grouped[snap.game_id]) grouped[snap.game_id] = [];
        grouped[snap.game_id].push(snap);
      }

      const movements = {};
      for (const [gameId, snaps] of Object.entries(grouped)) {
        if (snaps.length < 2) continue;
        const first  = snaps[0];
        const latest = snaps[snaps.length - 1];

        const spreadMove = (first.spread != null && latest.spread != null)
          ? +(latest.spread - first.spread).toFixed(1) : null;
        const totalMove = (first.total != null && latest.total != null)
          ? +(latest.total - first.total).toFixed(1) : null;
        const mlMove = (first.home_ml != null && latest.home_ml != null)
          ? Math.round(latest.home_ml - first.home_ml) : null;

        // Sharp money signal: spread moves 1+ points OR ML moves 15+ points
        const isSharp = Math.abs(spreadMove || 0) >= 1.0 || Math.abs(mlMove || 0) >= 15;

        movements[gameId] = {
          spreadMove, totalMove, mlMove,
          isSharp,
          firstSpread: first.spread,
          latestSpread: latest.spread,
          firstTotal: first.total,
          latestTotal: latest.total,
          firstML: first.home_ml,
          latestML: latest.home_ml,
          snapCount: snaps.length,
        };
      }

      res.setHeader("Cache-Control", "s-maxage=60");
      return res.status(200).json(movements);
    } catch(e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
