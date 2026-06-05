// ── RARE EDGE — PLAYER PROPS DATABASE ───────────────────────

const PLAYERS = {
  // NBA
  "Celtics":      [{ n:"J. Tatum",    pts:27,reb:8,ast:5 },{ n:"J. Brown",     pts:23,reb:5,ast:3 }],
  "Nuggets":      [{ n:"N. Jokic",    pts:26,reb:12,ast:9},{ n:"J. Murray",    pts:21,reb:4,ast:6 }],
  "76ers":        [{ n:"J. Embiid",   pts:34,reb:11,ast:5},{ n:"T. Maxey",     pts:26,reb:3,ast:6 }],
  "Bucks":        [{ n:"Giannis",     pts:31,reb:12,ast:6},{ n:"D. Lillard",   pts:25,reb:4,ast:7 }],
  "Thunder":      [{ n:"S. Gilgeous-Alexander",pts:32,reb:5,ast:6},{ n:"J. Williams",pts:23,reb:4,ast:5}],
  "Cavaliers":    [{ n:"D. Mitchell", pts:28,reb:5,ast:6 },{ n:"D. Garland",   pts:20,reb:3,ast:7 }],
  "Knicks":       [{ n:"J. Brunson",  pts:28,reb:4,ast:7 },{ n:"K. Towns",     pts:24,reb:13,ast:3}],
  "Mavericks":    [{ n:"L. Doncic",   pts:33,reb:9,ast:10},{ n:"K. Irving",    pts:25,reb:5,ast:5 }],
  "Suns":         [{ n:"K. Durant",   pts:28,reb:7,ast:5 },{ n:"D. Booker",    pts:26,reb:4,ast:6 }],
  "Timberwolves": [{ n:"A. Edwards", pts:25,reb:5,ast:5  },{ n:"R. Gobert",    pts:14,reb:12,ast:2}],
  "Heat":         [{ n:"J. Butler",   pts:21,reb:5,ast:5 },{ n:"B. Adebayo",   pts:20,reb:10,ast:4}],
  "Pacers":       [{ n:"T. Haliburton",pts:20,reb:4,ast:10},{ n:"P. Siakam",  pts:22,reb:7,ast:4 }],
  "Lakers":       [{ n:"LeBron James",pts:25,reb:7,ast:8 },{ n:"A. Davis",     pts:26,reb:12,ast:3}],
  "Warriors":     [{ n:"S. Curry",    pts:28,reb:5,ast:6 },{ n:"K. Thompson",  pts:17,reb:4,ast:2 }],
  "Kings":        [{ n:"D. Fox",      pts:27,reb:4,ast:7 },{ n:"D. Sabonis",   pts:19,reb:13,ast:7}],
  "Grizzlies":    [{ n:"J. Morant",   pts:26,reb:6,ast:9 },{ n:"J. Jackson Jr",pts:22,reb:6,ast:2}],
  "Clippers":     [{ n:"K. Leonard",  pts:22,reb:6,ast:4 },{ n:"P. George",    pts:21,reb:5,ast:4 }],
  "Pelicans":     [{ n:"Z. Williamson",pts:23,reb:6,ast:4},{ n:"B. Ingram",    pts:24,reb:5,ast:5 }],
  "Magic":        [{ n:"P. Banchero", pts:22,reb:7,ast:5 },{ n:"F. Wagner",    pts:19,reb:5,ast:4 }],
  "Raptors":      [{ n:"S. Barnes",   pts:20,reb:8,ast:6 },{ n:"R. Barrett",   pts:20,reb:6,ast:3 }],
  "Bulls":        [{ n:"Z. LaVine",   pts:23,reb:5,ast:4 },{ n:"N. Vucevic",   pts:18,reb:10,ast:3}],
  "Hawks":        [{ n:"T. Young",    pts:25,reb:3,ast:11},{ n:"D. Murray",    pts:22,reb:6,ast:6 }],
  "Pistons":      [{ n:"C. Cunningham",pts:24,reb:4,ast:8},{ n:"J. Duren",     pts:14,reb:11,ast:2}],
  "Hornets":      [{ n:"L. Ball",     pts:23,reb:6,ast:8 },{ n:"M. Bridges",   pts:21,reb:7,ast:3 }],
  "Rockets":      [{ n:"A. Sengun",   pts:21,reb:9,ast:5 },{ n:"J. Green",     pts:22,reb:4,ast:4 }],
  "Spurs":        [{ n:"V. Wembanyama",pts:22,reb:10,ast:4},{ n:"D. Vassell",  pts:18,reb:4,ast:3}],
  "Jazz":         [{ n:"L. Markkanen",pts:23,reb:8,ast:2 },{ n:"J. Clarkson",  pts:19,reb:3,ast:3 }],
  "Trail Blazers":[{ n:"S. Henderson",pts:14,reb:4,ast:6 },{ n:"J. Grant",     pts:18,reb:5,ast:3 }],
  "Wizards":      [{ n:"K. Kuzma",    pts:21,reb:7,ast:4 },{ n:"T. Jones",     pts:13,reb:3,ast:7 }],
  "Nets":         [{ n:"M. Bridges",  pts:21,reb:4,ast:3 },{ n:"C. Thomas",    pts:20,reb:3,ast:3 }],

  // NFL QBs
  "Chiefs":       [{ n:"P. Mahomes",  pyds:310,ptds:2.2,ryds:28 },{ n:"T. Kelce",    ryds_r:72,rec:5,tds:0.6}],
  "Bills":        [{ n:"J. Allen",    pyds:285,ptds:2.1,ryds:48 },{ n:"S. Diggs",    ryds_r:78,rec:5,tds:0.5}],
  "Eagles":       [{ n:"J. Hurts",    pyds:265,ptds:2.0,ryds:55 },{ n:"D. Smith",    ryds_r:75,rec:5,tds:0.5}],
  "49ers":        [{ n:"B. Purdy",    pyds:278,ptds:2.1,ryds:14 },{ n:"D. Samuel",   ryds_r:70,rec:5,tds:0.5}],
  "Cowboys":      [{ n:"D. Prescott", pyds:272,ptds:2.0,ryds:14 },{ n:"C. Lamb",     ryds_r:95,rec:7,tds:0.6}],
  "Ravens":       [{ n:"L. Jackson",  pyds:252,ptds:2.0,ryds:65 },{ n:"M. Andrews",  ryds_r:65,rec:5,tds:0.5}],
  "Bengals":      [{ n:"J. Burrow",   pyds:292,ptds:2.2,ryds:14 },{ n:"J. Chase",    ryds_r:90,rec:6,tds:0.6}],
  "Lions":        [{ n:"J. Goff",     pyds:265,ptds:1.9,ryds:8  },{ n:"A. St. Brown",ryds_r:80,rec:7,tds:0.5}],
  "Dolphins":     [{ n:"T. Tagovailoa",pyds:270,ptds:1.9,ryds:12},{ n:"T. Hill",     ryds_r:88,rec:6,tds:0.5}],
  "Packers":      [{ n:"J. Love",     pyds:262,ptds:1.9,ryds:18 },{ n:"C. Watson",   ryds_r:68,rec:5,tds:0.4}],
  "Vikings":      [{ n:"J. Dobbs",    pyds:235,ptds:1.5,ryds:28 },{ n:"J. Jefferson", ryds_r:88,rec:6,tds:0.5}],
  "Seahawks":     [{ n:"G. Smith",    pyds:250,ptds:1.7,ryds:18 },{ n:"D. Metcalf",  ryds_r:78,rec:5,tds:0.5}],
  "Rams":         [{ n:"M. Stafford", pyds:255,ptds:1.8,ryds:8  },{ n:"C. Kupp",     ryds_r:72,rec:6,tds:0.5}],
  "Buccaneers":   [{ n:"B. Mayfield", pyds:255,ptds:1.8,ryds:12 },{ n:"M. Evans",    ryds_r:72,rec:5,tds:0.5}],
  "Browns":       [{ n:"D. Watson",   pyds:238,ptds:1.6,ryds:22 },{ n:"A. Cooper",   ryds_r:68,rec:5,tds:0.4}],
  "Steelers":     [{ n:"K. Pickett",  pyds:228,ptds:1.5,ryds:18 },{ n:"D. Johnson",  ryds_r:62,rec:5,tds:0.4}],

  // WNBA
  "Fever":    [{ n:"C. Clark",  pts:17,reb:6,ast:8 },{ n:"A. Boston",  pts:15,reb:8,ast:3}],
  "Aces":     [{ n:"A. Wilson", pts:23,reb:10,ast:4},{ n:"K. Plum",    pts:18,reb:3,ast:5}],
  "Liberty":  [{ n:"B. Stewart",pts:22,reb:9,ast:4 },{ n:"S. Ionescu", pts:19,reb:6,ast:6}],
  "Sun":      [{ n:"A. Thomas", pts:20,reb:4,ast:5 },{ n:"D. Williams",pts:16,reb:8,ast:3}],
  "Storm":    [{ n:"J. Loyd",   pts:17,reb:5,ast:5 },{ n:"O. Ogwumike",pts:16,reb:8,ast:3}],
  "Lynx":     [{ n:"N. Ogwumike",pts:17,reb:8,ast:3},{ n:"C. Gray",   pts:15,reb:4,ast:5}],
  "Mercury":  [{ n:"B. Griner", pts:18,reb:8,ast:2 },{ n:"D. Diggins-Smith",pts:16,reb:4,ast:7}],
  "Wings":    [{ n:"A. Ogunbowale",pts:19,reb:3,ast:4},{ n:"S. Ogwumike",pts:18,reb:8,ast:3}],
  "Dream":    [{ n:"R. Jackson",pts:19,reb:4,ast:4 },{ n:"T. Howard",  pts:16,reb:6,ast:4}],
  "Sky":      [{ n:"C. Vandersloot",pts:12,reb:4,ast:8},{ n:"K. Mack",pts:18,reb:5,ast:4}],
  "Mystics":  [{ n:"E. Delle Donne",pts:19,reb:7,ast:2},{ n:"A. Holmes",pts:14,reb:9,ast:2}],
  "Sparks":   [{ n:"R. Howard", pts:17,reb:9,ast:2 },{ n:"K. George",  pts:14,reb:5,ast:3}],
  "Valkyries":[{ n:"K. Mitchell",pts:18,reb:5,ast:4},{ n:"L. Aagaard", pts:14,reb:6,ast:3}],

  // NHL
  "Oilers":        [{ n:"C. McDavid",  g:0.55,a:0.92,sog:4.2},{ n:"L. Draisaitl",g:0.58,a:0.80,sog:3.8}],
  "Avalanche":     [{ n:"N. MacKinnon",g:0.54,a:0.80,sog:4.1},{ n:"M. Rantanen", g:0.50,a:0.64,sog:3.8}],
  "Panthers":      [{ n:"M. Tkachuk",  g:0.44,a:0.60,sog:3.5},{ n:"S. Reinhart", g:0.47,a:0.54,sog:3.7}],
  "Lightning":     [{ n:"N. Kucherov", g:0.47,a:0.80,sog:3.5},{ n:"B. Point",    g:0.51,a:0.64,sog:3.8}],
  "Rangers":       [{ n:"A. Panarin",  g:0.41,a:0.70,sog:3.2},{ n:"V. Trocheck", g:0.34,a:0.50,sog:3.0}],
  "Stars":         [{ n:"J. Robertson",g:0.47,a:0.51,sog:3.8},{ n:"R. Hintz",    g:0.41,a:0.54,sog:3.2}],
  "Bruins":        [{ n:"D. Pastrnak", g:0.54,a:0.68,sog:3.8},{ n:"B. Marchand", g:0.39,a:0.60,sog:3.2}],
  "Wild":          [{ n:"K. Kaprizov", g:0.51,a:0.60,sog:3.8},{ n:"M. Rossi",    g:0.31,a:0.47,sog:2.8}],
  "Golden Knights":[{ n:"J. Marchessault",g:0.44,a:0.51,sog:3.5},{ n:"M. Stone",g:0.34,a:0.60,sog:3.0}],
  "Maple Leafs":   [{ n:"A. Matthews", g:0.61,a:0.64,sog:4.2},{ n:"M. Marner",   g:0.34,a:0.78,sog:3.0}],
  "Devils":        [{ n:"J. Hughes",   g:0.41,a:0.70,sog:3.2},{ n:"N. Hischier", g:0.37,a:0.51,sog:3.0}],
  "Hurricanes":    [{ n:"S. Aho",      g:0.44,a:0.54,sog:3.5},{ n:"A. Svechnikov",g:0.39,a:0.49,sog:3.2}],
};

// Get player projections for a team + sport
function getPlayers(teamName, sport) {
  if (!teamName) return [];
  const key = Object.keys(PLAYERS).find(k =>
    teamName.includes(k) || k.includes(teamName.split(" ").pop()) ||
    teamName.toLowerCase().includes(k.toLowerCase())
  );
  if (!key) return [];
  const players = PLAYERS[key];
  const v = (base, range) => +(base + (Math.random() * range * 2 - range)).toFixed(1);

  if (sport === "nba" || sport === "wnba" || sport === "ncaab") {
    return players.map(p => ({
      name: p.n,
      lines: [
        { stat:"PTS", proj: v(p.pts, 2.5), line: +(p.pts - 1.5).toFixed(1) },
        { stat:"REB", proj: v(p.reb, 1.5), line: +(p.reb - 0.5).toFixed(1) },
        { stat:"AST", proj: v(p.ast, 1.2), line: +(p.ast - 0.5).toFixed(1) },
      ],
      rec: p.pts >= 18 ? "OVER PTS" : "OVER REB"
    }));
  }
  if (sport === "nfl" || sport === "ncaaf") {
    return players.map(p => {
      if (p.pyds) return { name: p.n, lines: [
        { stat:"PASS YDS", proj: Math.round(v(p.pyds, 20)), line: Math.round(p.pyds - 12.5) },
        { stat:"PASS TDS", proj: v(p.ptds, 0.3), line: +(p.ptds - 0.5).toFixed(1) },
        { stat:"RUSH YDS", proj: Math.round(v(p.ryds, 8)), line: Math.round(p.ryds - 5) },
      ], rec: "OVER PASS YDS" };
      return { name: p.n, lines: [
        { stat:"REC YDS", proj: Math.round(v(p.ryds_r, 12)), line: Math.round(p.ryds_r - 10) },
        { stat:"REC",     proj: v(p.rec, 0.8), line: +(p.rec - 0.5).toFixed(1) },
        { stat:"TD",      proj: v(p.tds, 0.2), line: 0.5 },
      ], rec: "OVER REC YDS" };
    });
  }
  if (sport === "nhl") {
    return players.map(p => ({ name: p.n, lines: [
      { stat:"GOALS",   proj: +v(p.g, 0.15).toFixed(2), line: 0.5 },
      { stat:"ASSISTS", proj: +v(p.a, 0.15).toFixed(2), line: 0.5 },
      { stat:"SHOTS",   proj: v(p.sog, 0.5), line: +(p.sog - 0.5).toFixed(1) },
    ], rec: p.g >= 0.45 ? "OVER SHOTS" : "OVER ASSISTS" }));
  }
  return [];
}
