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

    // Find team by name or abbreviation
    const teamEntry = teams.find(t =>
      t.team?.shortDisplayName?.toLowerCase() === team.toLowerCase() ||
      t.team?.displayName?.toLowerCase().includes(team.toLowerCase()) ||
      t.team?.abbreviation?.toLowerCase() === team.toLowerCase() ||
      team.toLowerCase().includes(t.team?.shortDisplayName?.toLowerCase())
    );
    if (!teamEntry) return res.status(404).json({ error: "Team not found", available: teams.map(t => t.team.shortDisplayName) });

    const teamId = teamEntry.team.id;

    // Fetch roster with stats enabled
    const [rosterRes, statsRes] = await Promise.all([
      fetch(`https://site.api.espn.com/apis/site/v2/sports/${espnSport}/teams/${teamId}/roster?enable=injuries,stats`),
      fetch(`https://site.api.espn.com/apis/site/v2/sports/${espnSport}/teams/${teamId}/statistics`),
    ]);

    const rosterData = await rosterRes.json();

    // Extract stat labels from team stats for reference
    let statLabels = {};
    try {
      const statsData = await statsRes.json();
      for (const cat of statsData.results?.stats?.categories || []) {
        for (const s of cat.stats || []) {
          statLabels[s.abbreviation] = s.displayValue;
        }
      }
    } catch(e) { /* ignore */ }

    const players = [];
    for (const group of rosterData.athletes || []) {
      for (const athlete of group.items || []) {
        // Extract player stats from their profile
        const stats = {};
        for (const cat of athlete.statistics?.splits?.categories || []) {
          for (const s of cat.stats || []) {
            stats[s.abbreviation || s.name] = s.value ?? s.displayValue;
          }
        }

        // Map stats by sport
        let mappedStats = {};
        if (sport === "nba" || sport === "wnba") {
          mappedStats = {
            pts: parseFloat(stats.PTS || stats.points || 0).toFixed(1),
            reb: parseFloat(stats.REB || stats.rebounds || 0).toFixed(1),
            ast: parseFloat(stats.AST || stats.assists || 0).toFixed(1),
            stl: parseFloat(stats.STL || stats.steals || 0).toFixed(1),
            blk: parseFloat(stats.BLK || stats.blocks || 0).toFixed(1),
          };
        } else if (sport === "nfl") {
          const pos = athlete.position?.abbreviation;
          if (pos === "QB") {
            mappedStats = {
              pyds: parseFloat(stats.YDS || stats.passingYards || 0).toFixed(0),
              ptds: parseFloat(stats.TD  || stats.passingTouchdowns || 0).toFixed(1),
              ryds: parseFloat(stats.RYDS || stats.rushingYards || 0).toFixed(0),
            };
          } else if (["WR","TE","RB"].includes(pos)) {
            mappedStats = {
              rec:    parseFloat(stats.REC || stats.receptions || 0).toFixed(1),
              ryds_r: parseFloat(stats.YDS || stats.receivingYards || 0).toFixed(0),
              tds:    parseFloat(stats.TD  || stats.receivingTouchdowns || 0).toFixed(2),
            };
          }
        } else if (sport === "nhl") {
          mappedStats = {
            g:   parseFloat(stats.G   || stats.goals || 0).toFixed(2),
            a:   parseFloat(stats.A   || stats.assists || 0).toFixed(2),
            pts: parseFloat(stats.PTS || stats.points || 0).toFixed(1),
            sog: parseFloat(stats.SOG || stats.shotsOnGoal || 0).toFixed(1),
          };
        } else if (sport === "mlb") {
          const pos = athlete.position?.abbreviation;
          if (["SP","RP","P"].includes(pos)) {
            mappedStats = {
              era:  parseFloat(stats.ERA  || 0).toFixed(2),
              so:   parseFloat(stats.SO   || stats.strikeouts || 0).toFixed(1),
              whip: parseFloat(stats.WHIP || 0).toFixed(2),
            };
          } else {
            mappedStats = {
              avg: parseFloat(stats.AVG || stats.battingAverage || 0).toFixed(3),
              hr:  parseFloat(stats.HR  || stats.homeRuns || 0).toFixed(0),
              rbi: parseFloat(stats.RBI || 0).toFixed(0),
              ops: parseFloat(stats.OPS || 0).toFixed(3),
            };
          }
        }

        const injuryStatus = athlete.injuries?.[0]?.status || "Active";
        const isInjured = ["Out","Doubtful","Questionable","Day-To-Day"].includes(injuryStatus);

        players.push({
          id:       athlete.id,
          name:     athlete.displayName || athlete.fullName,
          shortName: athlete.shortName || athlete.lastName,
          position: athlete.position?.abbreviation,
          jersey:   athlete.jersey,
          status:   injuryStatus,
          injured:  isInjured,
          stats:    mappedStats,
          hasStats: Object.values(mappedStats).some(v => parseFloat(v) > 0),
        });
      }
    }

    // Sort — starters first, injured last, filter to players with stats or notable positions
    const sorted = players
      .filter(p => p.hasStats || ["QB","SF","PG","SG","C","PF","LW","RW","SP"].includes(p.position))
      .sort((a, b) => {
        if (a.injured && !b.injured) return 1;
        if (!a.injured && b.injured) return -1;
        const apts = parseFloat(a.stats?.pts || a.stats?.g || 0);
        const bpts = parseFloat(b.stats?.pts || b.stats?.g || 0);
        return bpts - apts;
      })
      .slice(0, 12); // top 12 players

    res.setHeader("Cache-Control", "s-maxage=3600"); // cache 1hr
    return res.status(200).json({
      team: teamEntry.team.displayName,
      shortName: teamEntry.team.shortDisplayName,
      sport,
      players: sorted,
      total: players.length,
    });
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
