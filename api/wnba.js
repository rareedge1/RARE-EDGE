export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    // Use ESPN scoreboard/teams endpoint which has actual records
    const r = await fetch(
      "https://site.api.espn.com/apis/site/v2/sports/basketball/wnba/teams?limit=20"
    );
    const data = await r.json();

    const teams = {};
    for (const item of data.sports?.[0]?.leagues?.[0]?.teams || []) {
      const t = item.team;
      const shortName = t?.shortDisplayName || t?.displayName?.split(" ").pop();
      const record = t?.record?.items?.[0];
      const stats = record?.stats || [];

      const getStat = (name) => parseFloat(stats.find(s => s.name === name)?.value || 0);
      const wins   = getStat("wins");
      const losses = getStat("losses");
      const streak = stats.find(s => s.name === "streak")?.displayValue || "";

      // Fetch last 10 from team record
      const overallRecord = t?.record?.items?.find(i => i.type === "total");
      const homeRecord    = t?.record?.items?.find(i => i.type === "home");
      const awayRecord    = t?.record?.items?.find(i => i.type === "road");

      // Use wins/losses to estimate L10 (ESPN doesn't expose L10 directly here)
      // but we can get it from the standings endpoint with correct field names
      const winsL10   = parseInt(stats.find(s => s.shortDisplayName === "L10" || s.name === "Last Ten Games")?.value || 0);
      const lossesL10 = 10 - winsL10;

      // Momentum-adjusted ratings
      const baseOrtg = 100;
      const baseDrtg = 103;
      const winPct = (wins + losses) > 0 ? wins / (wins + losses) : 0.5;
      const ortgAdj = (winPct - 0.5) * 8;
      const drtgAdj = (0.5 - winPct) * 8;

      if (shortName) {
        teams[shortName] = {
          fullName: t?.displayName,
          abbr: t?.abbreviation,
          ortg: +(baseOrtg + ortgAdj).toFixed(1),
          drtg: +(baseDrtg + drtgAdj).toFixed(1),
          pace: 84,
          wins, losses,
          winPct: +winPct.toFixed(3),
          last10: winsL10 > 0 ? { winsL10, lossesL10 } : null,
          streak,
          record: overallRecord?.summary || `${wins}-${losses}`,
        };
      }
    }

    res.setHeader("Cache-Control", "s-maxage=1800");
    return res.status(200).json(teams);
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
