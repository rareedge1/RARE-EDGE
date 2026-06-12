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

    if (!team) {
      const teamList = teams.map(t => ({
        id: t.team.id,
        name: t.team.displayName,
        shortName: t.team.shortDisplayName,
        abbr: t.team.abbreviation,
      }));
      res.setHeader("Cache-Control", "s-maxage=86400");
      return res.status(200).json(teamList);
    }

    // Find team
    const teamEntry = teams.find(t =>
      t.team?.shortDisplayName?.toLowerCase() === team.toLowerCase() ||
      t.team?.displayName?.toLowerCase().includes(team.toLowerCase()) ||
      t.team?.abbreviation?.toLowerCase() === team.toLowerCase() ||
      team.toLowerCase().includes(t.team?.shortDisplayName?.toLowerCase())
    );
    if (!teamEntry) return res.status(404).json({ error: "Team not found" });

    const teamId = teamEntry.team.id;

    // Try multiple ESPN roster URL formats
    const rosterUrls = [
      `https://site.api.espn.com/apis/site/v2/sports/${espnSport}/teams/${teamId}/roster`,
      `https://sports.core.api.espn.com/v2/sports/${espnSport.split("/")[0]}/leagues/${espnSport.split("/")[1]}/seasons/2025/teams/${teamId}/athletes?limit=40`,
    ];

    let rosterData = null;
    for (const url of rosterUrls) {
      try {
        const r = await fetch(url);
        if (r.ok) {
          rosterData = await r.json();
          if (rosterData.athletes?.length || rosterData.items?.length) break;
        }
      } catch(e) { continue; }
    }

    if (!rosterData) return res.status(500).json({ error: "Could not fetch roster" });

    // Handle both response formats
    const athleteList = rosterData.athletes || [];
    const players = [];

    // Format 1: athletes is array of groups with items
    if (athleteList.length > 0 && athleteList[0]?.items) {
      for (const group of athleteList) {
        for (const athlete of group.items || []) {
          players.push(extractPlayer(athlete, sport));
        }
      }
    }
    // Format 2: athletes is flat array
    else if (athleteList.length > 0) {
      for (const athlete of athleteList) {
        players.push(extractPlayer(athlete, sport));
      }
    }
    // Format 3: items array (core API)
    else if (rosterData.items?.length) {
      // Fetch each athlete individually
      const athleteRefs = rosterData.items.slice(0, 15);
      const athleteData = await Promise.all(
        athleteRefs.map(item =>
          fetch(item.$ref).then(r => r.json()).catch(() => null)
        )
      );
      for (const athlete of athleteData.filter(Boolean)) {
        players.push(extractPlayer(athlete, sport));
      }
    }

    // Filter and sort
    const valid = players
      .filter(p => p && p.name)
      .sort((a, b) => {
        if (a.injured && !b.injured) return 1;
        if (!a.injured && b.injured) return -1;
        return 0;
      })
      .slice(0, 12);

    res.setHeader("Cache-Control", "s-maxage=3600");
    return res.status(200).json({
      team: teamEntry.team.displayName,
      shortName: teamEntry.team.shortDisplayName,
      sport,
      players: valid,
      total: valid.length,
    });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}

function extractPlayer(athlete, sport) {
  if (!athlete) return null;

  const injuryStatus = athlete.injuries?.[0]?.status ||
    athlete.status?.type?.name || "Active";
  const isInjured = ["Out","Doubtful","Questionable","Day-To-Day","Injured Reserve"].includes(injuryStatus);

  // Extract stats from various response formats
  const rawStats = {};
  for (const cat of athlete.statistics?.splits?.categories || []) {
    for (const s of cat.stats || []) {
      rawStats[s.abbreviation || s.name] = s.value ?? s.displayValue;
    }
  }
  // Also check athlete.stats directly
  for (const s of athlete.stats || []) {
    rawStats[s.abbreviation || s.name] = s.value ?? s.displayValue;
  }

  const stats = mapStats(rawStats, sport, athlete.position?.abbreviation);

  return {
    id: athlete.id,
    name: athlete.displayName || athlete.fullName || athlete.shortName,
    position: athlete.position?.abbreviation,
    jersey: athlete.jersey,
    status: injuryStatus,
    injured: isInjured,
    stats,
    hasStats: Object.values(stats).some(v => parseFloat(v) > 0),
  };
}

function mapStats(raw, sport, pos) {
  if (sport === "nba" || sport === "wnba") {
    return {
      pts: parseFloat(raw.PTS || raw.points || 0).toFixed(1),
      reb: parseFloat(raw.REB || raw.rebounds || raw.totalRebounds || 0).toFixed(1),
      ast: parseFloat(raw.AST || raw.assists || 0).toFixed(1),
      stl: parseFloat(raw.STL || raw.steals || 0).toFixed(1),
    };
  }
  if (sport === "nfl") {
    if (pos === "QB") return {
      pyds: parseFloat(raw.YDS || raw.passingYards || 0).toFixed(0),
      ptds: parseFloat(raw.TD  || raw.passingTouchdowns || 0).toFixed(1),
      ryds: parseFloat(raw.RYDS || raw.rushingYards || 0).toFixed(0),
    };
    return {
      rec:    parseFloat(raw.REC || raw.receptions || 0).toFixed(1),
      ryds_r: parseFloat(raw.YDS || raw.receivingYards || 0).toFixed(0),
      tds:    parseFloat(raw.TD  || raw.touchdowns || 0).toFixed(2),
    };
  }
  if (sport === "nhl") return {
    g:   parseFloat(raw.G   || raw.goals || 0).toFixed(2),
    a:   parseFloat(raw.A   || raw.assists || 0).toFixed(2),
    sog: parseFloat(raw.SOG || raw.shotsOnGoal || 0).toFixed(1),
  };
  if (sport === "mlb") {
    if (["SP","RP","P"].includes(pos)) return {
      era:  parseFloat(raw.ERA  || 0).toFixed(2),
      so:   parseFloat(raw.SO   || raw.strikeouts || 0).toFixed(1),
      whip: parseFloat(raw.WHIP || 0).toFixed(2),
    };
    return {
      avg: parseFloat(raw.AVG || raw.battingAverage || 0).toFixed(3),
      hr:  parseFloat(raw.HR  || raw.homeRuns || 0).toFixed(0),
      rbi: parseFloat(raw.RBI || 0).toFixed(0),
    };
  }
  return {};
}
