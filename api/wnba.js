export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const standingsRes = await fetch(
      "https://site.api.espn.com/apis/v2/sports/basketball/wnba/standings?season=2025"
    );
    const standingsData = await standingsRes.json();

    const teams = {};
    const groups = standingsData.children || [];

    for (const conf of groups) {
      for (const entry of conf.standings?.entries || []) {
        const name = entry.team?.shortDisplayName || entry.team?.displayName;
        const stats = entry.stats || [];

        const getStat  = (abbr) => parseFloat(stats.find(s => s.abbreviation === abbr)?.value || 0);
        const getStatStr = (abbr) => stats.find(s => s.abbreviation === abbr)?.displayValue || "";

        const l10 = getStatStr("L10");
        const l10Parts = l10.split("-");
        const winsL10   = parseInt(l10Parts[0] || 0);
        const lossesL10 = parseInt(l10Parts[1] || 0);
        const ppg  = getStat("ppg");
        const oppg = getStat("oppg");

        if (name) {
          const key = entry.team?.shortDisplayName || name.split(" ").pop();
          teams[key] = {
            fullName: name,
            ortg: ppg  > 0 ? +(ppg  * (100/84)).toFixed(1) : 100,
            drtg: oppg > 0 ? +(oppg * (100/84)).toFixed(1) : 103,
            pace: 84,
            last10: { winsL10, lossesL10 },
            ppg:  ppg.toFixed(1),
            oppg: oppg.toFixed(1),
          };
        }
      }
    }

    res.setHeader("Cache-Control", "s-maxage=3600");
    return res.status(200).json(teams);
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
