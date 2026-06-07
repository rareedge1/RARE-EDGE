export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { sport } = req.query;
  if (!sport) return res.status(400).json({ error: "Sport required" });

  const KEY = process.env.ODDS_API_KEY || "99a28e26d9ca8efe2551318548dabc7d";
  const url = `https://api.the-odds-api.com/v4/sports/${sport}/scores?apiKey=${KEY}&daysFrom=1`;

  try {
    const r = await fetch(url);
    if (!r.ok) return res.status(r.status).json({ error: `API error ${r.status}` });
    const data = await r.json();

    // Filter to only games that started today in Central time
    const todayStr = new Date().toLocaleDateString("en-US", { timeZone: "America/Chicago" });
    const todayOnly = data.filter(g => {
      const gStr = new Date(g.commence_time).toLocaleDateString("en-US", { timeZone: "America/Chicago" });
      return gStr === todayStr;
    });

    res.setHeader("Cache-Control", "s-maxage=300");
    return res.status(200).json(todayOnly);
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
