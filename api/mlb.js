export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const today = new Date().toISOString().split("T")[0];

    // Fetch today's schedule with probable pitchers
    const schedRes = await fetch(
      `https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${today}&hydrate=probablePitcher(note),team,linescore`
    );
    const schedData = await schedRes.json();
    const games = schedData.dates?.[0]?.games || [];

    // Fetch team stats (season)
    const teamStatsRes = await fetch(
      `https://statsapi.mlb.com/api/v1/teams/stats?season=2025&sportId=1&stats=season&group=hitting,pitching`
    );
    const teamStatsData = await teamStatsRes.json();

    // Build team stats map
    const teamStats = {};
    for (const record of teamStatsData.stats || []) {
      for (const split of record.splits || []) {
        const id = split.team?.id;
        if (!id) continue;
        if (!teamStats[id]) teamStats[id] = { name: split.team.name };
        if (record.group?.displayName === "hitting") {
          teamStats[id].runsPerGame = parseFloat(split.stat?.runsPerGame || 0);
          teamStats[id].avg = parseFloat(split.stat?.avg || 0);
          teamStats[id].ops = parseFloat(split.stat?.ops || 0);
        }
        if (record.group?.displayName === "pitching") {
          teamStats[id].teamEra = parseFloat(split.stat?.era || 0);
          teamStats[id].teamWhip = parseFloat(split.stat?.whip || 0);
        }
      }
    }

    // Fetch last 10 games for each team
    async function getLast10(teamId) {
      try {
        const r = await fetch(
          `https://statsapi.mlb.com/api/v1/teams/${teamId}/stats?stats=lastXGames&lastXGames=10&season=2025&group=hitting&sportId=1`
        );
        const d = await r.json();
        const split = d.stats?.[0]?.splits?.[0]?.stat;
        return {
          runsLast10: parseFloat(split?.runsPerGame || 0),
          avgLast10: parseFloat(split?.avg || 0),
        };
      } catch { return { runsLast10: 0, avgLast10: 0 }; }
    }

    // Fetch pitcher season stats
    async function getPitcherStats(pitcherId) {
      if (!pitcherId) return null;
      try {
        const r = await fetch(
          `https://statsapi.mlb.com/api/v1/people/${pitcherId}/stats?stats=season&season=2025&group=pitching`
        );
        const d = await r.json();
        const stat = d.stats?.[0]?.splits?.[0]?.stat;
        if (!stat) return null;
        return {
          era: parseFloat(stat.era || 4.50),
          whip: parseFloat(stat.whip || 1.30),
          innings: parseFloat(stat.inningsPitched || 0),
          strikeoutsPer9: parseFloat(stat.strikeoutsPer9Inn || 8.0),
          walksPer9: parseFloat(stat.walksPer9Inn || 3.0),
        };
      } catch { return null; }
    }

    // Build enriched game data
    const enriched = await Promise.all(games.map(async g => {
      const homeId = g.teams?.home?.team?.id;
      const awayId = g.teams?.away?.team?.id;
      const homePitcherId = g.teams?.home?.probablePitcher?.id;
      const awayPitcherId = g.teams?.away?.probablePitcher?.id;

      const [homeLast10, awayLast10, homePitcher, awayPitcher] = await Promise.all([
        getLast10(homeId),
        getLast10(awayId),
        getPitcherStats(homePitcherId),
        getPitcherStats(awayPitcherId),
      ]);

      const homeTeam = teamStats[homeId] || {};
      const awayTeam = teamStats[awayId] || {};

      return {
        gameId: g.gamePk,
        homeName: g.teams?.home?.team?.name,
        awayName: g.teams?.away?.team?.name,
        status: g.status?.abstractGameState,
        home: {
          runsPerGame: homeTeam.runsPerGame || 4.2,
          avg: homeTeam.avg || 0.245,
          ops: homeTeam.ops || 0.710,
          teamEra: homeTeam.teamEra || 4.20,
          teamWhip: homeTeam.teamWhip || 1.28,
          runsLast10: homeLast10.runsLast10 || homeTeam.runsPerGame || 4.2,
          avgLast10: homeLast10.avgLast10 || homeTeam.avg || 0.245,
          pitcher: homePitcher ? {
            name: g.teams?.home?.probablePitcher?.fullName || "TBD",
            era: homePitcher.era,
            whip: homePitcher.whip,
            innings: homePitcher.innings,
            k9: homePitcher.strikeoutsPer9,
            bb9: homePitcher.walksPer9,
          } : { name: g.teams?.home?.probablePitcher?.fullName || "TBD", era: homeTeam.teamEra || 4.20, whip: homeTeam.teamWhip || 1.28 },
        },
        away: {
          runsPerGame: awayTeam.runsPerGame || 4.2,
          avg: awayTeam.avg || 0.245,
          ops: awayTeam.ops || 0.710,
          teamEra: awayTeam.teamEra || 4.20,
          teamWhip: awayTeam.teamWhip || 1.28,
          runsLast10: awayLast10.runsLast10 || awayTeam.runsPerGame || 4.2,
          avgLast10: awayLast10.avgLast10 || awayTeam.avg || 0.245,
          pitcher: awayPitcher ? {
            name: g.teams?.away?.probablePitcher?.fullName || "TBD",
            era: awayPitcher.era,
            whip: awayPitcher.whip,
            innings: awayPitcher.innings,
            k9: awayPitcher.strikeoutsPer9,
            bb9: awayPitcher.walksPer9,
          } : { name: g.teams?.away?.probablePitcher?.fullName || "TBD", era: awayTeam.teamEra || 4.20, whip: awayTeam.teamWhip || 1.28 },
        },
      };
    }));

    res.setHeader("Cache-Control", "s-maxage=1800"); // cache 30 mins
    return res.status(200).json(enriched);
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
