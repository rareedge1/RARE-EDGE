export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { sport, team } = req.query;
  if (!sport) return res.status(400).json({ error: "Sport required" });

  try {
    const ESPN_SPORTS = {
      nba:  "basketball/nba",
      wnba: "basketball/wnba",
      nfl:  "football/nfl",
      nhl:  "hockey/nhl",
      mlb:  "baseball/mlb",
    };

    const espnSport = ESPN_SPORTS[sport];
    if (!espnSport) return res.status(400).json({ error: "Unsupported sport" });

    // Fetch all teams
    const teamsRes = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${espnSport}/teams?limit=40`);
    const teamsData = await teamsRes.json();
    const teams = teamsData.sports?.[0]?.leagues?.[0]?.teams || [];

    // If specific team requested, fetch that team's roster
    if (team) {
      const teamEntry = teams.find(t =>
        t.team?.shortDisplayName?.toLowerCase() === team.toLowerCase() ||
        t.team?.displayName?.toLowerCase().includes(team.toLowerCase()) ||
        t.team?.abbreviation?.toLowerCase() === team.toLowerCase()
      );
      if (!teamEntry) return res.status(404).json({ error: "Team not found" });

      const teamId = teamEntry.team.id;
      const rosterRes = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${espnSport}/teams/${teamId}/roster`);
      const rosterData = await rosterRes.json();

      const players = [];
      for (const group of rosterData.athletes || []) {
        for (const athlete of group.items || []) {
          players.push({
            id: athlete.id,
            name: athlete.displayName || athlete.fullName,
            position: athlete.position?.abbreviation,
            jersey: athlete.jersey,
            status: athlete.injuries?.[0]?.status || "Active",
          });
        }
      }

      res.setHeader("Cache-Control", "s-maxage=86400"); // cache 24h
      return res.status(200).json({ team: teamEntry.team.displayName, players });
    }

    // Return all team names for lookup
    const teamList = teams.map(t => ({
      id: t.team.id,
      name: t.team.displayName,
      shortName: t.team.shortDisplayName,
      abbr: t.team.abbreviation,
    }));

    res.setHeader("Cache-Control", "s-maxage=86400");
    return res.status(200).json(teamList);
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
