export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { sport } = req.query;
  if (!sport) return res.status(400).json({ error: "Sport required" });

  try {
    const tz = "America/Chicago";
    const today = new Date();
    const todayStr = today.toLocaleDateString("en-US", { timeZone: tz });

    // ESPN sport mapping
    const ESPN_SPORTS = {
      nba:  "basketball/nba",
      wnba: "basketball/wnba",
      nfl:  "football/nfl",
      mlb:  "baseball/mlb",
    };

    const espnSport = ESPN_SPORTS[sport];
    if (!espnSport) return res.status(400).json({ error: "Unsupported sport" });

    // Fetch last 7 days and next 7 days of scores/schedule
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 7);
    const nextWeek  = new Date(today); nextWeek.setDate(nextWeek.getDate() + 7);

    const fmt = d => `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;

    const [pastRes, futureRes] = await Promise.all([
      fetch(`https://site.api.espn.com/apis/site/v2/sports/${espnSport}/scoreboard?limit=100&dates=${fmt(yesterday)}-${fmt(today)}`),
      fetch(`https://site.api.espn.com/apis/site/v2/sports/${espnSport}/scoreboard?limit=100&dates=${fmt(today)}-${fmt(nextWeek)}`),
    ]);

    const [pastData, futureData] = await Promise.all([
      pastRes.json(),
      futureRes.json(),
    ]);

    // Build map of team -> last game date and next game date
    const teamLastGame = {};
    const teamNextGame = {};

    const processEvents = (events, isHistory) => {
      for (const event of events || []) {
        const gameDate = new Date(event.date);
        const gameDateStr = gameDate.toLocaleDateString("en-US", { timeZone: tz });
        if (gameDateStr === todayStr) continue; // skip today's games

        for (const comp of event.competitions || []) {
          for (const team of comp.competitors || []) {
            const name = team.team?.shortDisplayName || team.team?.displayName?.split(" ").pop();
            if (!name) continue;

            if (isHistory) {
              // Track most recent past game
              if (!teamLastGame[name] || gameDate > new Date(teamLastGame[name])) {
                teamLastGame[name] = event.date;
              }
            } else {
              // Track nearest future game
              if (!teamNextGame[name] || gameDate < new Date(teamNextGame[name])) {
                teamNextGame[name] = event.date;
              }
            }
          }
        }
      }
    };

    processEvents(pastData.events, true);
    processEvents(futureData.events, false);

    // Calculate rest days for each team
    const restDays = {};
    const allTeams = new Set([...Object.keys(teamLastGame), ...Object.keys(teamNextGame)]);

    for (const team of allTeams) {
      const lastGame = teamLastGame[team] ? new Date(teamLastGame[team]) : null;
      const daysSinceLastGame = lastGame
        ? Math.round((today - lastGame) / (1000 * 60 * 60 * 24))
        : null;

      restDays[team] = {
        lastGame: teamLastGame[team] || null,
        daysSinceLastGame,
        isB2B: daysSinceLastGame === 1,
        isShortRest: daysSinceLastGame !== null && daysSinceLastGame <= 2,
        nextGame: teamNextGame[team] || null,
      };
    }

    res.setHeader("Cache-Control", "s-maxage=3600");
    return res.status(200).json(restDays);
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
