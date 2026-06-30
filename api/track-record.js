export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;
  const headers = { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` };

  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/edge_calls?select=sport,home,away,game_date,edge_value,result&order=created_at.desc&limit=100`,
      { headers }
    );
    const calls = await r.json();
    res.setHeader("Cache-Control", "s-maxage=300");
    return res.status(200).json(calls);
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
