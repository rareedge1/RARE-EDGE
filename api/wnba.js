export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    // Use scoreboard endpoint which has current standings with real records
    const [scoreboardRes, standingsRes] = await Promise.all([
      fetch("https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/scoreboard"),
      fetch("https://site.api.espn.com/apis/v2/sports/basketball/wnba/standings?season=2025&type=2")
    ]);

    const standingsData = await standingsRes.json();

    const teams = {};

    // Parse standings - try multiple stat name formats
    const allEntries = [];
    const groups = standingsData.children || [standingsData];
    for (const group of groups) {
      for (const entry of group.standings?.entries || group.entries || []) {
        allEntries.push(entry);
      }
    }

    for (const entry of allEntries) {
      const t = entry.team;
      const key = t?.shortDisplayName || t?.displayName?.split(" ").pop();
      const stats = entry.stats || [];

      // Try every possible stat name for wins/losses
      const find = (...names) => {
        for (const n of names) {
          const s = stats.find(s =>
            s.name === n || s.abbreviation === n ||
            s.shortDisplayName === n || s.displayName === n
          );
          if (s) return s;
        }
        return null;
      };

      const winsStat   = find("wins","W","Wins","w");
      const lossesStat = find("losses","L","Losses","l");
      const wins   = parseFloat(winsStat?.value   || winsStat?.displayValue   || 0);
      const losses = parseFloat(lossesStat?.value || lossesStat?.displayValue || 0);
      const gp = wins + losses;

      // Points for/against
      const pfStat  = find("pointsFor","PF","ppg","PTS","points");
      const paStat  = find("pointsAgainst","PA","oppg","OPP");
      const pf  = parseFloat(pfStat?.value  || 0);
      const pa  = parseFloat(paStat?.value  || 0);
      const ppg  = gp > 0 && pf  > 0 ? +(pf  / gp).toFixed(1) : 0;
      const oppg = gp > 0 && pa  > 0 ? +(pa  / gp).toFixed(1) : 0;

      // Streak
      const streakStat = find("streak","STK","Streak");
      const streak = streakStat?.displayValue || "";

      // Win pct for ortg/drtg adjustment
      const winPct = gp > 0 ? wins / gp : 0.5;
      const ortgAdj = (winPct - 0.5) * 8;
      const drtgAdj = (0.5 - winPct) * 8;

      if (key) {
        teams[key] = {
          fullName: t?.displayName,
          abbr: t?.abbreviation,
          ortg: +(100 + ortgAdj).toFixed(1),
          drtg: +(103 + drtgAdj).toFixed(1),
          pace: 84,
          wins, losses, gp,
          ppg, oppg,
          winPct: +winPct.toFixed(3),
          record: `${wins}-${losses}`,
          streak,
          last10: null, // ESPN WNBA doesn't expose L10 directly
        };
      }
    }

    // If standings parsing got 0 records, try the scoreboard team records
    const hasRealData = Object.values(teams).some(t => t.wins > 0 || t.losses > 0);
    if (!hasRealData) {
      const scoreboardData = await scoreboardRes.json();
      for (const event of scoreboardData.events || []) {
        for (const comp of event.competitions || []) {
          for (const team of comp.competitors || []) {
            const t = team.team;
            const key = t?.shortDisplayName || t?.displayName?.split(" ").pop();
            const rec = team.records?.[0];
            if (key && rec) {
              const parts = rec.summary?.split("-") || [];
              const wins   = parseInt(parts[0] || 0);
              const losses = parseInt(parts[1] || 0);
              if (!teams[key] || (teams[key].wins === 0 && teams[key].losses === 0)) {
                const winPct = (wins + losses) > 0 ? wins / (wins + losses) : 0.5;
                teams[key] = {
                  ...(teams[key] || {}),
                  fullName: t?.displayName,
                  abbr: t?.abbreviation,
                  wins, losses,
                  record: rec.summary || `${wins}-${losses}`,
                  winPct: +winPct.toFixed(3),
                  ortg: +(100 + (winPct - 0.5) * 8).toFixed(1),
                  drtg: +(103 + (0.5 - winPct) * 8).toFixed(1),
                  pace: 84,
                };
              }
            }
          }
        }
      }
    }

    res.setHeader("Cache-Control", "s-maxage=1800");
    return res.status(200).json(teams);
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
