export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const SUPABASE_URL = "https://avlcbelneozxxgikpoer.supabase.co";
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2bGNiZWxuZW96eHhnaWtwb2VyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA0MjEyNjEsImV4cCI6MjA5NTk5NzI2MX0.Hd-2oX5BB88hDHF0MwEik8ym3CQzJQEV6aua6FhTOPk";
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
