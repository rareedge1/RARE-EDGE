export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    // ESPN NFL team stats + standings
    const [standingsRes, teamsRes] = await Promise.all([
      fetch("https://site.api.espn.com/apis/v2/sports/football/nfl/standings?season=2025"),
      fetch("https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams?limit=32")
    ]);

    const standingsData = await standingsRes.json();
    const teamsData     = await teamsRes.json();

    // Build record map from standings
    const recordMap = {};
    for (const conf of standingsData.children || []) {
      for (const div of conf.children || []) {
        for (const entry of div.standings?.entries || []) {
          const key  = entry.team?.shortDisplayName || entry.team?.displayName?.split(" ").pop();
          const stats = entry.stats || [];
          const getStat    = (abbr) => parseFloat(stats.find(s => s.abbreviation === abbr)?.value || 0);
          const getStatStr = (abbr) => stats.find(s => s.abbreviation === abbr)?.displayValue || "";
          if (key) recordMap[key] = {
            wins:    getStat("wins"),
            losses:  getStat("losses"),
            pf:      getStat("pointsFor"),
            pa:      getStat("pointsAgainst"),
            streak:  getStatStr("streak"),
            abbr:    entry.team?.abbreviation,
          };
        }
      }
    }

    // Build team map
    const teams = {};
    for (const item of teamsData.sports?.[0]?.leagues?.[0]?.teams || []) {
      const t = item.team;
      const key = t?.shortDisplayName || t?.displayName?.split(" ").pop();
      const rec = recordMap[key] || recordMap[t?.abbreviation] || null;

      // Use points for/against to estimate off/def ratings
      const pf = rec?.pf || 0;
      const pa = rec?.pa || 0;
      const gp = (rec?.wins || 0) + (rec?.losses || 0);
      const ppg    = gp > 0 ? +(pf / gp).toFixed(1) : 0;
      const oppg   = gp > 0 ? +(pa / gp).toFixed(1) : 0;

      if (key) {
        teams[key] = {
          fullName: t?.displayName,
          abbr:     t?.abbreviation,
          wins:     rec?.wins   || 0,
          losses:   rec?.losses || 0,
          ppg,
          oppg,
          streak:   rec?.streak || "",
          // off/def for projectFootball compatibility
          off:  ppg  > 0 ? ppg  : null,
          def:  oppg > 0 ? oppg : null,
        };
      }
    }

    // NFL stadium locations for weather (lat/lng)
    const STADIUMS = {
      "Cardinals":{"lat":33.5277,"lng":-112.2626,"dome":true},
      "Falcons":{"lat":33.7554,"lng":-84.4008,"dome":true},
      "Ravens":{"lat":39.2780,"lng":-76.6227,"dome":false},
      "Bills":{"lat":42.7738,"lng":-78.7870,"dome":false},
      "Panthers":{"lat":35.2258,"lng":-80.8528,"dome":false},
      "Bears":{"lat":41.8623,"lng":-87.6167,"dome":false},
      "Bengals":{"lat":39.0955,"lng":-84.5160,"dome":false},
      "Browns":{"lat":41.5061,"lng":-81.6995,"dome":false},
      "Cowboys":{"lat":32.7473,"lng":-97.0945,"dome":true},
      "Broncos":{"lat":39.7439,"lng":-105.0201,"dome":false},
      "Lions":{"lat":42.3400,"lng":-83.0456,"dome":true},
      "Packers":{"lat":44.5013,"lng":-88.0622,"dome":false},
      "Texans":{"lat":29.6847,"lng":-95.4107,"dome":true},
      "Colts":{"lat":39.7601,"lng":-86.1639,"dome":true},
      "Jaguars":{"lat":30.3239,"lng":-81.6373,"dome":false},
      "Chiefs":{"lat":39.0489,"lng":-94.4839,"dome":false},
      "Raiders":{"lat":36.0909,"lng":-115.1833,"dome":true},
      "Chargers":{"lat":33.9535,"lng":-118.3392,"dome":true},
      "Rams":{"lat":33.9535,"lng":-118.3392,"dome":true},
      "Dolphins":{"lat":25.9580,"lng":-80.2389,"dome":false},
      "Vikings":{"lat":44.9737,"lng":-93.2575,"dome":true},
      "Patriots":{"lat":42.0909,"lng":-71.2643,"dome":false},
      "Saints":{"lat":29.9511,"lng":-90.0812,"dome":true},
      "Giants":{"lat":40.8135,"lng":-74.0745,"dome":false},
      "Jets":{"lat":40.8135,"lng":-74.0745,"dome":false},
      "Eagles":{"lat":39.9008,"lng":-75.1675,"dome":false},
      "Steelers":{"lat":40.4468,"lng":-80.0158,"dome":false},
      "49ers":{"lat":37.4032,"lng":-121.9698,"dome":false},
      "Seahawks":{"lat":47.5952,"lng":-122.3316,"dome":false},
      "Buccaneers":{"lat":27.9759,"lng":-82.5033,"dome":false},
      "Titans":{"lat":36.1665,"lng":-86.7713,"dome":false},
      "Commanders":{"lat":38.9076,"lng":-76.8645,"dome":false},
    };

    teams._stadiums = STADIUMS;

    res.setHeader("Cache-Control", "s-maxage=3600");
    return res.status(200).json(teams);
  } catch(e) {
    return res.status(500).json({ error: e.message });
  }
}
