export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { sport, markets = "spreads,totals,h2h", gameId, type } = req.query;
  if (!sport) return res.status(400).json({ error: "Sport required" });

  const KEY = process.env.ODDS_API_KEY || "99a28e26d9ca8efe2551318548dabc7d";
  const BASE = "https://api.the-odds-api.com/v4";

  // Stable midnight UTC boundary 5 days out — consistent within a day so the
  // CDN cache key doesn't change on every request and exhaust API quota.
  const cutoff = new Date();
  cutoff.setUTCDate(cutoff.getUTCDate() + 5);
  cutoff.setUTCHours(0, 0, 0, 0);
  const commenceTimeTo = cutoff.toISOString().replace(".000Z", "Z");

  let url;
  if (type === "props" && gameId) {
    url = `${BASE}/sports/${sport}/events/${gameId}/odds?apiKey=${KEY}&regions=us&markets=${markets}&oddsFormat=american`;
  } else if (sport === "sports-list") {
    url = `${BASE}/sports?apiKey=${KEY}`;
  } else {
    url = `${BASE}/sports/${sport}/odds?apiKey=${KEY}&regions=us&markets=${markets}&oddsFormat=american&bookmakers=draftkings,fanduel,betmgm,caesars&commenceTimeTo=${commenceTimeTo}`;
  }

  try {
    const r = await fetch(url);
    if (!r.ok) return res.status(r.status).json({ error: `API error ${r.status}` });
    const data = await r.json();
    res.setHeader("Cache-Control", "s-maxage=3600");
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
