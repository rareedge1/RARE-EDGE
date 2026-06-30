export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
  const headers = {
    "Content-Type": "application/json",
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${SUPABASE_KEY}`,
    "Prefer": "return=representation"
  };

  // K-factor by sport (how much each game shifts ratings)
  const K_FACTOR = { mlb: 4, nba: 20, wnba: 20, nfl: 28, nhl: 6 };
  const DEFAULT_ELO = 1500;

  // GET — fetch current Elo ratings for a sport
  if (req.method === "GET") {
    try {
      const { sport } = req.query;
      const url = sport
        ? `${SUPABASE_URL}/rest/v1/elo_ratings?sport=eq.${sport}&select=*`
        : `${SUPABASE_URL}/rest/v1/elo_ratings?select=*`;
      const r = await fetch(url, { headers });
      const data = await r.json();

      // Convert to map: { teamName: { elo, wins, losses, sport } }
      const ratings = {};
      for (const row of data) {
        ratings[row.team] = {
          elo: row.elo,
          wins: row.wins,
          losses: row.losses,
          sport: row.sport,
          lastUpdated: row.updated_at,
        };
      }
      res.setHeader("Cache-Control", "s-maxage=300");
      return res.status(200).json(ratings);
    } catch(e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // POST — update Elo after a game result
  if (req.method === "POST") {
    try {
      const { sport, homeTeam, awayTeam, homeScore, awayScore } = req.body || {};
      if (!sport || !homeTeam || !awayTeam || homeScore == null || awayScore == null) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const k = K_FACTOR[sport.toLowerCase()] || 20;

      // Fetch current ratings for both teams
      const fetchRating = async (team) => {
        const r = await fetch(
          `${SUPABASE_URL}/rest/v1/elo_ratings?team=eq.${encodeURIComponent(team)}&sport=eq.${sport}&select=*`,
          { headers }
        );
        const data = await r.json();
        return data[0] || { team, sport, elo: DEFAULT_ELO, wins: 0, losses: 0 };
      };

      const [homeRating, awayRating] = await Promise.all([
        fetchRating(homeTeam),
        fetchRating(awayTeam),
      ]);

      // Calculate expected outcome
      const homeElo = homeRating.elo;
      const awayElo = awayRating.elo;
      const homeExpected = 1 / (1 + Math.pow(10, (awayElo - homeElo) / 400));
      const awayExpected = 1 - homeExpected;

      // Actual outcome (1 = win, 0 = loss, 0.5 = tie)
      const homeActual = homeScore > awayScore ? 1 : homeScore < awayScore ? 0 : 0.5;
      const awayActual = 1 - homeActual;

      // Margin of victory multiplier (bigger wins shift ratings more)
      const margin = Math.abs(homeScore - awayScore);
      let movMultiplier = 1;
      if (sport === "mlb") movMultiplier = Math.log(margin + 1) * 0.5 + 1;
      if (sport === "nba" || sport === "wnba") movMultiplier = Math.log(margin / 10 + 1) * 0.5 + 1;
      if (sport === "nfl") movMultiplier = Math.log(margin / 7 + 1) * 0.5 + 1;
      movMultiplier = Math.min(movMultiplier, 2.0); // cap at 2x

      // New Elo ratings
      const newHomeElo = Math.round(homeElo + k * movMultiplier * (homeActual - homeExpected));
      const newAwayElo = Math.round(awayElo + k * movMultiplier * (awayActual - awayExpected));

      // Upsert both teams
      const upsert = async (team, newElo, won) => {
        const existing = team === homeTeam ? homeRating : awayRating;
        const wins   = (existing.wins   || 0) + (won ? 1 : 0);
        const losses = (existing.losses || 0) + (won ? 0 : 1);
        await fetch(`${SUPABASE_URL}/rest/v1/elo_ratings`, {
          method: "POST",
          headers: { ...headers, "Prefer": "resolution=merge-duplicates,return=representation" },
          body: JSON.stringify({ team, sport, elo: newElo, wins, losses, updated_at: new Date().toISOString() })
        });
      };

      await Promise.all([
        upsert(homeTeam, newHomeElo, homeActual === 1),
        upsert(awayTeam, newAwayElo, awayActual === 1),
      ]);

      return res.status(200).json({
        home: { team: homeTeam, oldElo: homeElo, newElo: newHomeElo, change: newHomeElo - homeElo },
        away: { team: awayTeam, oldElo: awayElo, newElo: newAwayElo, change: newAwayElo - awayElo },
      });
    } catch(e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
