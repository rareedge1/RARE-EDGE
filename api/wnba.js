export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const headers = {
      "User-Agent": "Mozilla/5.0",
      "Accept": "application/json",
      "Referer": "https://www.wnba.com",
      "Origin": "https://www.wnba.com"
    };

    // WNBA team stats - current season
    const [advRes, last10Res] = await Promise.all([
      fetch("https://stats.wnba.com/stats/leaguedashteamstats?Conference=&DateFrom=&DateTo=&Division=&GameScope=&GameSegment=&LastNGames=0&LeagueID=10&Location=&MeasureType=Advanced&Month=0&OpponentTeamID=0&Outcome=&PORound=0&PaceAdjust=N&PerMode=PerGame&Period=0&PlayerExperience=&PlayerPosition=&PlusMinus=N&Rank=N&Season=2025&SeasonSegment=&SeasonType=Regular+Season&ShotClockRange=&StarterBench=&TeamID=0&TwoWay=0&VsConference=&VsDivision=", { headers }),
      fetch("https://stats.wnba.com/stats/leaguedashteamstats?Conference=&DateFrom=&DateTo=&Division=&GameScope=&GameSegment=&LastNGames=10&LeagueID=10&Location=&MeasureType=Base&Month=0&OpponentTeamID=0&Outcome=&PORound=0&PaceAdjust=N&PerMode=PerGame&Period=0&PlayerExperience=&PlayerPosition=&PlusMinus=N&Rank=N&Season=2025&SeasonSegment=&SeasonType=Regular+Season&ShotClockRange=&StarterBench=&TeamID=0&TwoWay=0&VsConference=&VsDivision=", { headers })
    ]);

    const advData = await advRes.json();
    const last10Data = await last10Res.json();

    const advHeaders = advData.resultSets?.[0]?.headers || [];
    const advRows    = advData.resultSets?.[0]?.rowSet  || [];
    const nameIdx = advHeaders.indexOf("TEAM_NAME");
    const ortgIdx = advHeaders.indexOf("OFF_RATING");
    const drtgIdx = advHeaders.indexOf("DEF_RATING");
    const paceIdx = advHeaders.indexOf("PACE");
    const netIdx  = advHeaders.indexOf("NET_RATING");

    const l10Headers = last10Data.resultSets?.[0]?.headers || [];
    const l10Rows    = last10Data.resultSets?.[0]?.rowSet  || [];
    const l10NameIdx = l10Headers.indexOf("TEAM_NAME");
    const l10WinIdx  = l10Headers.indexOf("W");
    const l10LossIdx = l10Headers.indexOf("L");
    const l10PtsIdx  = l10Headers.indexOf("PTS");

    const last10Map = {};
    for (const row of l10Rows) {
      const name = row[l10NameIdx];
      if (name) last10Map[name] = {
        winsL10: row[l10WinIdx],
        lossesL10: row[l10LossIdx],
        ptsL10: parseFloat(row[l10PtsIdx] || 0).toFixed(1),
      };
    }

    const teams = {};
    for (const row of advRows) {
      const name = row[nameIdx];
      if (!name) continue;
      const shortName = name.split(" ").pop();
      teams[shortName] = {
        fullName: name,
        ortg: parseFloat(row[ortgIdx] || 100),
        drtg: parseFloat(row[drtgIdx] || 103),
        pace: parseFloat(row[paceIdx] || 84),
        netRtg: parseFloat(row[netIdx] || 0),
        last10: last10Map[name] || null,
      };
    }

    res.setHeader("Cache-Control", "s-maxage=3600");
    return res.status(200).json(teams);
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
