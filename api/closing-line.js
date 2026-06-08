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

  // GET — fetch CLV analysis for recent edge calls
  if (req.method === "GET") {
    try {
      const today = new Date().toLocaleDateString("en-US", { timeZone: "America/Chicago" });

      // Get all line snapshots for today grouped by game
      const snapshotsRes = await fetch(
        `${SUPABASE_URL}/rest/v1/line_snapshots?game_date=eq.${encodeURIComponent(today)}&select=*&order=created_at.asc`,
        { headers }
      );
      const snapshots = await snapshotsRes.json();

      // Get edge calls for today
      const edgesRes = await fetch(
        `${SUPABASE_URL}/rest/v1/edge_calls?game_date=eq.${encodeURIComponent(today)}&select=*`,
        { headers }
      );
      const edges = await edgesRes.json();

      // Group snapshots by game_id
      const grouped = {};
      for (const snap of snapshots) {
        if (!grouped[snap.game_id]) grouped[snap.game_id] = [];
        grouped[snap.game_id].push(snap);
      }

      // Calculate CLV for each edge call
      const clvAnalysis = [];
      for (const edge of edges) {
        // Find matching snapshots
        const gameSnaps = Object.values(grouped).find(snaps =>
          snaps[0]?.home === edge.home && snaps[0]?.away === edge.away
        );
        if (!gameSnaps || gameSnaps.length < 2) continue;

        const opening = gameSnaps[0];
        const closing = gameSnaps[gameSnaps.length - 1];

        // Our projection direction on total
        const ourCall = edge.proj_total > edge.vegas_total ? "over" : "under";

        // Did the total move in our direction?
        const totalMoved = closing.total - opening.total;
        const lineMovedWithUs = ourCall === "over" ? totalMoved > 0 : totalMoved < 0;
        const lineMovedAgainst = ourCall === "over" ? totalMoved < 0 : totalMoved > 0;

        // CLV = closing line value
        // Positive CLV means we got a better number than the closing line
        const clv = ourCall === "over"
          ? +(edge.vegas_total - closing.total).toFixed(1)   // we bet over at lower number = positive CLV
          : +(closing.total - edge.vegas_total).toFixed(1);  // we bet under at higher number = positive CLV

        clvAnalysis.push({
          game: `${edge.away}@${edge.home}`,
          sport: edge.sport,
          ourCall,
          openingTotal: opening.total,
          closingTotal: closing.total,
          ourTotal: edge.vegas_total,
          clv,
          lineMovedWithUs,
          lineMovedAgainst,
          result: edge.result,
        });
      }

      // Summary stats
      const positiveCLV = clvAnalysis.filter(c => c.clv > 0).length;
      const negativeCLV = clvAnalysis.filter(c => c.clv < 0).length;
      const lineWithUs  = clvAnalysis.filter(c => c.lineMovedWithUs).length;
      const avgCLV = clvAnalysis.length > 0
        ? +(clvAnalysis.reduce((s, c) => s + c.clv, 0) / clvAnalysis.length).toFixed(2)
        : 0;

      res.setHeader("Cache-Control", "s-maxage=300");
      return res.status(200).json({
        calls: clvAnalysis,
        summary: { total: clvAnalysis.length, positiveCLV, negativeCLV, lineWithUs, avgCLV }
      });
    } catch(e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
