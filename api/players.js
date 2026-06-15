export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { sport, team } = req.query;
  if (!sport) return res.status(400).json({ error: "Sport required" });

  try {
    // MLB — use MLB Stats API (already used for pitcher data, returns real per-game stats)
    if (sport === "mlb") {
      return await handleMLB(req, res, team);
    }

    // All other sports — ESPN
    return await handleESPN(req, res, sport, team);
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}

// ── MLB via MLB Stats API ─────────────────────────────────────
async function handleMLB(req, res, teamName) {
  if (!teamName) {
    // Return team list
    const r = await fetch("https://statsapi.mlb.com/api/v1/teams?sportId=1&season=2026");
    const d = await r.json();
    const teams = (d.teams || []).map(t => ({
      id: t.id, name: t.name, shortName: t.teamName, abbr: t.abbreviation
    }));
    res.setHeader("Cache-Control", "s-maxage=86400");
    return res.status(200).json(teams);
  }

  // Find team ID
  const teamsRes = await fetch("https://statsapi.mlb.com/api/v1/teams?sportId=1&season=2026");
  const teamsData = await teamsRes.json();
  const teamEntry = (teamsData.teams || []).find(t =>
    t.teamName?.toLowerCase() === teamName.toLowerCase() ||
    t.name?.toLowerCase().includes(teamName.toLowerCase()) ||
    t.abbreviation?.toLowerCase() === teamName.toLowerCase() ||
    teamName.toLowerCase().includes(t.teamName?.toLowerCase())
  );
  if (!teamEntry) return res.status(404).json({ error: "Team not found" });

  const teamId = teamEntry.id;

  // Fetch roster
  const rosterRes = await fetch(`https://statsapi.mlb.com/api/v1/teams/${teamId}/roster?season=2026&rosterType=active`);
  const rosterData = await rosterRes.json();
  const roster = rosterData.roster || [];

  // Fetch batting + pitching stats for the team
  const [battingRes, pitchingRes] = await Promise.all([
    fetch(`https://statsapi.mlb.com/api/v1/teams/${teamId}/stats?stats=season&group=hitting&season=2026&sportId=1`),
    fetch(`https://statsapi.mlb.com/api/v1/teams/${teamId}/stats?stats=season&group=pitching&season=2026&sportId=1`),
  ]);

  // Get player-level stats via roster + individual stats
  const playerIds = roster.slice(0, 15).map(p => p.person.id);

  const playerStats = await Promise.all(
    playerIds.map(async id => {
      const person = roster.find(p => p.person.id === id);
      const pos = person?.position?.abbreviation || "";
      const isPitcher = ["P","SP","RP"].includes(pos);
      const group = isPitcher ? "pitching" : "hitting";

      try {
        const sr = await fetch(
          `https://statsapi.mlb.com/api/v1/people/${id}/stats?stats=season&group=${group}&season=2026&sportId=1`
        );
        const sd = await sr.json();
        const splits = sd.stats?.[0]?.splits?.[0]?.stat || {};
        const gp = parseFloat(splits.gamesPlayed || splits.gamesPitched || 1) || 1;

        if (isPitcher) {
          const gs = parseFloat(splits.gamesStarted || 1) || 1;
          const ip = parseFloat(splits.inningsPitched || 0);
          return {
            name: person.person.fullName,
            position: pos,
            status: "Active",
            injured: false,
            hasStats: true,
            stats: {
              era:  parseFloat(splits.era  || 0).toFixed(2),
              so:   gs > 0 ? (parseFloat(splits.strikeOuts || 0) / gs).toFixed(1) : "0.0",
              outs: gs > 0 ? ((ip / gs) * 3).toFixed(1) : "0.0",
              whip: parseFloat(splits.whip || 0).toFixed(2),
            }
          };
        } else {
          return {
            name: person.person.fullName,
            position: pos,
            status: "Active",
            injured: false,
            hasStats: true,
            stats: {
              avg:   parseFloat(splits.avg   || 0).toFixed(3),
              hits:  gp > 0 ? (parseFloat(splits.hits        || 0) / gp).toFixed(2) : "0.00",
              tb:    gp > 0 ? (parseFloat(splits.totalBases  || 0) / gp).toFixed(2) : "0.00",
              hr:    gp > 0 ? (parseFloat(splits.homeRuns    || 0) / gp).toFixed(2) : "0.00",
              rbi:   gp > 0 ? (parseFloat(splits.rbi         || 0) / gp).toFixed(2) : "0.00",
              walks: gp > 0 ? (parseFloat(splits.baseOnBalls || 0) / gp).toFixed(2) : "0.00",
            }
          };
        }
      } catch(e) {
        return {
          name: person?.person?.fullName || "Unknown",
          position: pos,
          status: "Active",
          injured: false,
          hasStats: false,
          stats: {}
        };
      }
    })
  );

  const valid = playerStats.filter(p => p && p.name && p.hasStats);
  res.setHeader("Cache-Control", "s-maxage=3600");
  return res.status(200).json({
    team: teamEntry.name,
    shortName: teamEntry.teamName,
    sport: "mlb",
    players: valid,
    total: valid.length,
  });
}

// ── ESPN (NBA, WNBA, NFL, NHL) ────────────────────────────────
async function handleESPN(req, res, sport, team) {
  const ESPN_SPORTS = {
    nba:  "basketball/nba",
    wnba: "basketball/wnba",
    nfl:  "football/nfl",
    nhl:  "hockey/nhl",
  };

  const espnSport = ESPN_SPORTS[sport];
  if (!espnSport) return res.status(400).json({ error: "Unsupported sport" });

  const teamsRes = await fetch(`https://site.api.espn.com/apis/site/v2/sports/${espnSport}/teams?limit=40`);
  const teamsData = await teamsRes.json();
  const teams = teamsData.sports?.[0]?.leagues?.[0]?.teams || [];

  if (!team) {
    const teamList = teams.map(t => ({
      id: t.team.id, name: t.team.displayName,
      shortName: t.team.shortDisplayName, abbr: t.team.abbreviation,
    }));
    res.setHeader("Cache-Control", "s-maxage=86400");
    return res.status(200).json(teamList);
  }

  const teamEntry = teams.find(t =>
    t.team?.shortDisplayName?.toLowerCase() === team.toLowerCase() ||
    t.team?.displayName?.toLowerCase().includes(team.toLowerCase()) ||
    t.team?.abbreviation?.toLowerCase() === team.toLowerCase() ||
    team.toLowerCase().includes(t.team?.shortDisplayName?.toLowerCase())
  );
  if (!teamEntry) return res.status(404).json({ error: "Team not found" });

  const teamId = teamEntry.team.id;

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

  const athleteList = rosterData.athletes || [];
  const players = [];

  if (athleteList.length > 0 && athleteList[0]?.items) {
    for (const group of athleteList) {
      for (const athlete of group.items || []) {
        players.push(extractPlayer(athlete, sport));
      }
    }
  } else if (athleteList.length > 0) {
    for (const athlete of athleteList) {
      players.push(extractPlayer(athlete, sport));
    }
  } else if (rosterData.items?.length) {
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
}

function extractPlayer(athlete, sport) {
  if (!athlete) return null;
  const injuryStatus = athlete.injuries?.[0]?.status ||
    athlete.status?.type?.name || "Active";
  const isInjured = ["Out","Doubtful","Questionable","Day-To-Day","Injured Reserve"].includes(injuryStatus);

  const rawStats = {};
  for (const cat of athlete.statistics?.splits?.categories || []) {
    for (const s of cat.stats || []) {
      rawStats[s.abbreviation || s.name] = s.value ?? s.displayValue;
    }
  }
  for (const s of athlete.stats || []) {
    rawStats[s.abbreviation || s.name] = s.value ?? s.displayValue;
  }

  const stats = mapESPNStats(rawStats, sport, athlete.position?.abbreviation);

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

function mapESPNStats(raw, sport, pos) {
  if (sport === "nba" || sport === "wnba") {
    return {
      pts:    parseFloat(raw.PTS || raw.points || 0).toFixed(1),
      reb:    parseFloat(raw.REB || raw.rebounds || raw.totalRebounds || 0).toFixed(1),
      ast:    parseFloat(raw.AST || raw.assists || 0).toFixed(1),
      stl:    parseFloat(raw.STL || raw.steals || 0).toFixed(1),
      blk:    parseFloat(raw.BLK || raw.blocks || 0).toFixed(1),
      threes: parseFloat(raw["3PM"] || raw.threePointFieldGoalsMade || 0).toFixed(1),
    };
  }
  if (sport === "nfl") {
    if (pos === "QB") return {
      pyds: parseFloat(raw.YDS || raw.passingYards || 0).toFixed(0),
      ptds: parseFloat(raw.TD  || raw.passingTouchdowns || 0).toFixed(1),
      patt: parseFloat(raw.ATT || raw.passingAttempts || 0).toFixed(0),
      ryds: parseFloat(raw.RYDS || raw.rushingYards || 0).toFixed(0),
    };
    return {
      rec:    parseFloat(raw.REC || raw.receptions || 0).toFixed(1),
      ryds_r: parseFloat(raw.YDS || raw.receivingYards || 0).toFixed(0),
      rtds:   parseFloat(raw.TD  || raw.touchdowns || 0).toFixed(2),
    };
  }
  if (sport === "nhl") return {
    g:   parseFloat(raw.G   || raw.goals   || 0).toFixed(2),
    a:   parseFloat(raw.A   || raw.assists || 0).toFixed(2),
    sog: parseFloat(raw.SOG || raw.shotsOnGoal || 0).toFixed(1),
  };
  return {};
}
