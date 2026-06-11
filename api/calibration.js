export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const SUPABASE_URL = "https://avlcbelneozxxgikpoer.supabase.co";
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2bGNiZWxuZW96eHhnaWtwb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MjEyNjEsImV4cCI6MjA5NTk5NzI2MX0.Hd-2oX5BB88hDHF0MwEik8ym3CQzJQEV6aua6FhTOPk";
  const headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`
  };

  try {
    // Fetch all resolved edge calls
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/edge_calls?select=*&order=created_at.desc`,
      { headers }
    );
    const calls = await r.json();

    const resolved = calls.filter(c => c.result === "win" || c.result === "loss" || c.result === "push");
    const total = resolved.length;

    if (total === 0) {
      return res.status(200).json({ total: 0, message: "Not enough data yet — check back after more games resolve." });
    }

    // Overall hit rate
    const wins   = resolved.filter(c => c.result === "win").length;
    const losses = resolved.filter(c => c.result === "loss").length;
    const pushes = resolved.filter(c => c.result === "push").length;
    const hitRate = (wins + losses) > 0 ? +(wins / (wins + losses) * 100).toFixed(1) : 0;

    // Hit rate by sport
    const bySport = {};
    for (const c of resolved) {
      const sp = c.sport || "Unknown";
      if (!bySport[sp]) bySport[sp] = { wins:0, losses:0, pushes:0 };
      if (c.result === "win")   bySport[sp].wins++;
      if (c.result === "loss")  bySport[sp].losses++;
      if (c.result === "push")  bySport[sp].pushes++;
    }
    const sportStats = Object.entries(bySport).map(([sport, s]) => ({
      sport,
      wins: s.wins, losses: s.losses, pushes: s.pushes,
      total: s.wins + s.losses + s.pushes,
      hitRate: (s.wins + s.losses) > 0 ? +(s.wins / (s.wins + s.losses) * 100).toFixed(1) : 0
    })).sort((a, b) => b.total - a.total);

    // Hit rate by edge size bucket
    const edgeBuckets = { "1.0-1.9": {wins:0,losses:0}, "2.0-2.9": {wins:0,losses:0}, "3.0-3.9": {wins:0,losses:0}, "4.0+": {wins:0,losses:0} };
    for (const c of resolved) {
      const ev = Math.abs(parseFloat(c.edge_value || 0));
      const bucket = ev < 2 ? "1.0-1.9" : ev < 3 ? "2.0-2.9" : ev < 4 ? "3.0-3.9" : "4.0+";
      if (c.result === "win")  edgeBuckets[bucket].wins++;
      if (c.result === "loss") edgeBuckets[bucket].losses++;
    }
    const edgeStats = Object.entries(edgeBuckets).map(([bucket, s]) => ({
      bucket,
      wins: s.wins, losses: s.losses,
      total: s.wins + s.losses,
      hitRate: (s.wins + s.losses) > 0 ? +(s.wins / (s.wins + s.losses) * 100).toFixed(1) : null
    }));

    // Hit rate by call direction (over vs under)
    const byDirection = { over: {wins:0,losses:0}, under: {wins:0,losses:0} };
    for (const c of resolved) {
      if (!c.proj_total || !c.vegas_total) continue;
      const dir = parseFloat(c.proj_total) > parseFloat(c.vegas_total) ? "over" : "under";
      if (c.result === "win")  byDirection[dir].wins++;
      if (c.result === "loss") byDirection[dir].losses++;
    }
    const directionStats = Object.entries(byDirection).map(([dir, s]) => ({
      direction: dir,
      wins: s.wins, losses: s.losses,
      total: s.wins + s.losses,
      hitRate: (s.wins + s.losses) > 0 ? +(s.wins / (s.wins + s.losses) * 100).toFixed(1) : null
    }));

    // CLV summary from line snapshots
    const snapRes = await fetch(
      `${SUPABASE_URL}/rest/v1/line_snapshots?select=game_id,total,created_at,home,away&order=created_at.asc`,
      { headers }
    );
    const snapshots = await snapRes.json();

    // Group by game_id, get first and last
    const snapMap = {};
    for (const s of snapshots) {
      if (!snapMap[s.game_id]) snapMap[s.game_id] = { first: s, last: s };
      else snapMap[s.game_id].last = s;
    }

    // Match snapshots to edge calls and calculate CLV
    let positiveCLV = 0, negativeCLV = 0, totalCLV = 0, clvCount = 0;
    for (const c of resolved) {
      if (!c.proj_total || !c.vegas_total) continue;
      const snap = Object.values(snapMap).find(s =>
        s.first.home === c.home && s.first.away === c.away
      );
      if (!snap || snap.first.total === snap.last.total) continue;
      const ourCall = parseFloat(c.proj_total) > parseFloat(c.vegas_total) ? "over" : "under";
      const lineMove = snap.last.total - snap.first.total;
      const clv = ourCall === "over" ? -lineMove : lineMove;
      if (clv > 0) positiveCLV++;
      else if (clv < 0) negativeCLV++;
      totalCLV += clv;
      clvCount++;
    }
    const avgCLV = clvCount > 0 ? +(totalCLV / clvCount).toFixed(2) : 0;
    const clvWinRate = clvCount > 0 ? +(positiveCLV / clvCount * 100).toFixed(1) : null;

    // Calibration grade
    let grade, gradeColor;
    if (total < 50) { grade = "INSUFFICIENT DATA"; gradeColor = "#555"; }
    else if (hitRate >= 58) { grade = "SHARP"; gradeColor = "#c8f54a"; }
    else if (hitRate >= 54) { grade = "GOOD"; gradeColor = "#60a5fa"; }
    else if (hitRate >= 50) { grade = "NEUTRAL"; gradeColor = "#aaa"; }
    else { grade = "NEEDS CALIBRATION"; gradeColor = "#ef4444"; }

    res.setHeader("Cache-Control", "s-maxage=300");
    return res.status(200).json({
      total, wins, losses, pushes, hitRate, grade, gradeColor,
      sportStats, edgeStats, directionStats,
      clv: { positiveCLV, negativeCLV, avgCLV, clvWinRate, clvCount }
    });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
