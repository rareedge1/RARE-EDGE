export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    // NBA team IDs (ESPN)
    const NBA_TEAMS = [
      {id:1,  name:"Hawks"},    {id:2,  name:"Celtics"},  {id:3,  name:"Nets"},
      {id:4,  name:"Hornets"},  {id:5,  name:"Bulls"},    {id:6,  name:"Cavaliers"},
      {id:7,  name:"Mavericks"},{id:8,  name:"Nuggets"},  {id:9,  name:"Pistons"},
      {id:10, name:"Warriors"}, {id:11, name:"Rockets"},  {id:12, name:"Pacers"},
      {id:13, name:"Knicks"},   {id:14, name:"Lakers"},   {id:15, name:"Grizzlies"},
      {id:16, name:"Heat"},     {id:17, name:"Bucks"},    {id:18, name:"Timberwolves"},
      {id:19, name:"Pelicans"}, {id:20, name:"Thunder"},  {id:21, name:"Magic"},
      {id:22, name:"76ers"},    {id:23, name:"Suns"},     {id:24, name:"Trail Blazers"},
      {id:25, name:"Kings"},    {id:26, name:"Spurs"},    {id:27, name:"Raptors"},
      {id:28, name:"Jazz"},     {id:29, name:"Wizards"},  {id:30, name:"Clippers"},
    ];

    // Fetch standings for L10
    const standingsRes = await fetch(
      "https://site.api.espn.com/apis/v2/sports/basketball/nba/standings?season=2025"
    );
    const standingsData = await standingsRes.json();
    const last10Map = {};
    for (const conf of standingsData.children || []) {
      for (const entry of conf.standings?.entries || []) {
        const key = entry.team?.shortDisplayName || entry.team?.displayName?.split(" ").pop();
        const stats = entry.stats || [];
        const getStatStr = (abbr) => stats.find(s => s.abbreviation === abbr)?.displayValue || "";
        const l10 = getStatStr("L10");
        const parts = l10.split("-");
        const streak = getStatStr("streak");
        if (key) last10Map[key] = {
          winsL10: parseInt(parts[0] || 0),
          lossesL10: parseInt(parts[1] || 0),
          streak,
          abbr: entry.team?.abbreviation,
        };
      }
    }

    // Fetch stats for all teams in parallel (batches of 10 to avoid rate limits)
    const fetchTeamStats = async (teamId) => {
      const r = await fetch(`https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${teamId}/statistics`);
      if (!r.ok) return null;
      return r.json();
    };

    const batch1 = await Promise.all(NBA_TEAMS.slice(0, 15).map(t => fetchTeamStats(t.id)));
    const batch2 = await Promise.all(NBA_TEAMS.slice(15).map(t => fetchTeamStats(t.id)));
    const allStats = [...batch1, ...batch2];

    const teams = {};
    NBA_TEAMS.forEach((team, i) => {
      const data = allStats[i];
      if (!data) return;

      const getStat = (abbr) => {
        for (const cat of data.results?.stats?.categories || []) {
          const s = cat.stats?.find(s => s.abbreviation === abbr);
          if (s) return parseFloat(s.value || 0);
        }
        return 0;
      };

      const ppg  = getStat("PTS") || getStat("points") || 0;
      const oppg = getStat("DRPG") || 0; // fallback
      const pace = 98; // NBA average pace

      // Convert PPG to ortg (per 100 possessions)
      const ortg = ppg  > 0 ? +(ppg  * (100 / pace)).toFixed(1) : 113;
      const drtg = oppg > 0 ? +(oppg * (100 / pace)).toFixed(1) : 113;

      const l10 = last10Map[team.name] || null;

      teams[team.name] = {
        fullName: team.name,
        ortg,
        drtg,
        pace,
        ppg: ppg.toFixed(1),
        last10: l10 ? { winsL10: l10.winsL10, lossesL10: l10.lossesL10 } : null,
        streak: l10?.streak || null,
        abbr: l10?.abbr || "",
      };
    });

    res.setHeader("Cache-Control", "s-maxage=3600");
    return res.status(200).json(teams);
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
