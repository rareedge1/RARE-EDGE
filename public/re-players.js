// ── RARE EDGE — PLAYER PROPS DATABASE ───────────────────────
// 2026 season — live data pulled from /api/players when available
// MLB stats: per-game averages | hits/tb/hr/rbi/walks for batters | so/outs/era for pitchers

const PLAYERS = {

  // ── NBA 2024-25 ──────────────────────────────────────────
  "Celtics":      [{ n:"J. Tatum",    pts:27,reb:8, ast:5, stl:1.0,blk:0.8,threes:2.8},{ n:"J. Brown",     pts:23,reb:5,ast:3,stl:1.1,blk:0.5,threes:2.1}],
  "Nuggets":      [{ n:"N. Jokic",    pts:26,reb:12,ast:9, stl:1.4,blk:0.7,threes:0.5},{ n:"J. Murray",    pts:21,reb:4,ast:6,stl:0.9,blk:0.3,threes:2.0}],
  "76ers":        [{ n:"J. Embiid",   pts:34,reb:11,ast:5, stl:1.0,blk:1.7,threes:1.0},{ n:"T. Maxey",     pts:26,reb:3,ast:6,stl:1.0,blk:0.3,threes:3.0}],
  "Bucks":        [{ n:"Giannis",     pts:31,reb:12,ast:6, stl:1.2,blk:1.1,threes:0.8},{ n:"D. Lillard",   pts:25,reb:4,ast:7,stl:0.9,blk:0.4,threes:4.0}],
  "Thunder":      [{ n:"S. Gilgeous-Alexander",pts:32,reb:5,ast:6,stl:2.0,blk:0.9,threes:2.0},{ n:"J. Williams",pts:23,reb:4,ast:5,stl:1.0,blk:0.5,threes:2.5}],
  "Cavaliers":    [{ n:"D. Mitchell", pts:28,reb:5, ast:6, stl:1.5,blk:0.3,threes:3.2},{ n:"D. Garland",   pts:20,reb:3,ast:7,stl:1.2,blk:0.2,threes:2.8}],
  "Knicks":       [{ n:"J. Brunson",  pts:28,reb:4, ast:7, stl:0.9,blk:0.2,threes:2.5},{ n:"K. Towns",     pts:24,reb:13,ast:3,stl:0.7,blk:1.2,threes:3.0}],
  "Mavericks":    [{ n:"L. Doncic",   pts:33,reb:9, ast:10,stl:1.4,blk:0.5,threes:3.5},{ n:"K. Irving",    pts:25,reb:5,ast:5,stl:1.3,blk:0.4,threes:3.0}],
  "Suns":         [{ n:"K. Durant",   pts:28,reb:7, ast:5, stl:1.0,blk:1.3,threes:2.0},{ n:"D. Booker",    pts:26,reb:4,ast:6,stl:1.1,blk:0.3,threes:2.5}],
  "Timberwolves": [{ n:"A. Edwards", pts:25,reb:5,  ast:5, stl:1.5,blk:0.6,threes:3.5},{ n:"R. Gobert",    pts:14,reb:12,ast:2,stl:0.8,blk:2.1,threes:0.0}],
  "Heat":         [{ n:"B. Adebayo",  pts:20,reb:10,ast:4, stl:1.2,blk:0.9,threes:0.1},{ n:"T. Herro",     pts:21,reb:4,ast:5,stl:1.0,blk:0.2,threes:3.5}],
  "Pacers":       [{ n:"T. Haliburton",pts:20,reb:4,ast:10,stl:1.8,blk:0.4,threes:3.0},{ n:"P. Siakam",   pts:22,reb:7,ast:4,stl:1.3,blk:0.8,threes:1.5}],
  "Lakers":       [{ n:"LeBron James",pts:25,reb:7, ast:8, stl:1.3,blk:0.6,threes:2.1},{ n:"A. Davis",     pts:26,reb:12,ast:3,stl:1.2,blk:2.3,threes:0.5}],
  "Warriors":     [{ n:"S. Curry",    pts:28,reb:5, ast:6, stl:1.4,blk:0.3,threes:5.2},{ n:"D. Green",     pts:9,reb:7,ast:6,stl:1.4,blk:0.8,threes:1.0}],
  "Kings":        [{ n:"D. Fox",      pts:27,reb:4, ast:7, stl:1.6,blk:0.4,threes:1.5},{ n:"D. Sabonis",   pts:19,reb:13,ast:7,stl:1.0,blk:0.5,threes:0.2}],
  "Grizzlies":    [{ n:"J. Morant",   pts:26,reb:6, ast:9, stl:1.3,blk:0.5,threes:1.5},{ n:"J. Jackson Jr",pts:22,reb:6,ast:2,stl:1.5,blk:2.8,threes:2.5}],
  "Clippers":     [{ n:"K. Leonard",  pts:22,reb:6, ast:4, stl:1.7,blk:0.6,threes:2.0},{ n:"J. Harden",    pts:18,reb:5,ast:8,stl:1.3,blk:0.5,threes:2.8}],
  "Pelicans":     [{ n:"Z. Williamson",pts:23,reb:6,ast:4, stl:1.1,blk:0.6,threes:0.5},{ n:"B. Ingram",    pts:24,reb:5,ast:5,stl:0.9,blk:0.5,threes:2.5}],
  "Magic":        [{ n:"P. Banchero", pts:22,reb:7, ast:5, stl:1.3,blk:0.9,threes:2.0},{ n:"F. Wagner",    pts:19,reb:5,ast:4,stl:1.1,blk:0.5,threes:2.0}],
  "Raptors":      [{ n:"S. Barnes",   pts:20,reb:8, ast:6, stl:1.5,blk:0.8,threes:1.5},{ n:"I. Quickley",  pts:19,reb:4,ast:6,stl:1.2,blk:0.3,threes:3.5}],
  "Bulls":        [{ n:"Z. LaVine",   pts:23,reb:5, ast:4, stl:1.0,blk:0.4,threes:3.5},{ n:"N. Vucevic",   pts:18,reb:10,ast:3,stl:0.8,blk:1.0,threes:1.5}],
  "Hawks":        [{ n:"T. Young",    pts:25,reb:3, ast:11,stl:1.1,blk:0.2,threes:3.0},{ n:"D. Murray",    pts:22,reb:6,ast:6,stl:1.3,blk:0.5,threes:3.0}],
  "Pistons":      [{ n:"C. Cunningham",pts:24,reb:4,ast:8, stl:1.1,blk:0.5,threes:2.5},{ n:"J. Duren",     pts:14,reb:11,ast:2,stl:0.8,blk:1.5,threes:0.0}],
  "Hornets":      [{ n:"L. Ball",     pts:23,reb:6, ast:8, stl:1.8,blk:0.4,threes:3.0},{ n:"B. Miller",    pts:17,reb:4,ast:3,stl:1.0,blk:0.5,threes:2.5}],
  "Rockets":      [{ n:"A. Sengun",   pts:21,reb:9, ast:5, stl:1.1,blk:1.0,threes:0.3},{ n:"J. Green",     pts:22,reb:4,ast:4,stl:1.2,blk:0.6,threes:3.5}],
  "Spurs":        [{ n:"V. Wembanyama",pts:22,reb:10,ast:4,stl:1.5,blk:3.6,threes:2.0},{ n:"D. Vassell",  pts:18,reb:4,ast:3,stl:1.2,blk:0.3,threes:3.0}],
  "Jazz":         [{ n:"L. Markkanen",pts:23,reb:8, ast:2, stl:0.8,blk:0.9,threes:3.0},{ n:"J. Clarkson",  pts:19,reb:3,ast:3,stl:0.8,blk:0.2,threes:3.5}],
  "Trail Blazers":[{ n:"S. Henderson",pts:14,reb:4, ast:6, stl:1.2,blk:0.4,threes:2.0},{ n:"J. Grant",     pts:18,reb:5,ast:3,stl:0.9,blk:0.8,threes:2.5}],
  "Wizards":      [{ n:"K. Kuzma",    pts:21,reb:7, ast:4, stl:0.9,blk:0.5,threes:2.5},{ n:"T. Jones",     pts:13,reb:3,ast:7,stl:1.3,blk:0.3,threes:2.0}],
  "Nets":         [{ n:"C. Thomas",   pts:20,reb:3, ast:3, stl:1.0,blk:0.3,threes:3.0},{ n:"N. Claxton",   pts:12,reb:9,ast:2,stl:0.9,blk:1.8,threes:0.0}],

  // ── WNBA 2026 ────────────────────────────────────────────
  "Fever":     [
    { n:"Caitlin Clark",       pts:19,reb:6, ast:9, stl:1.5,blk:0.3,threes:3.0 },
    { n:"Aliyah Boston",       pts:15,reb:8, ast:3, stl:1.0,blk:0.5,threes:0.1 },
    { n:"Kelsey Mitchell",     pts:16,reb:3, ast:3, stl:1.0,blk:0.2,threes:2.5 },
    { n:"NaLyssa Smith",       pts:12,reb:7, ast:2, stl:0.8,blk:0.4,threes:0.2 },
  ],
  "Aces":      [
    { n:"A'ja Wilson",         pts:23,reb:10,ast:4, stl:1.8,blk:1.5,threes:0.5 },
    { n:"Kelsey Plum",         pts:18,reb:3, ast:5, stl:1.2,blk:0.2,threes:3.5 },
    { n:"Chelsea Gray",        pts:11,reb:3, ast:7, stl:1.1,blk:0.2,threes:1.5 },
    { n:"Jackie Young",        pts:16,reb:4, ast:4, stl:1.3,blk:0.3,threes:2.0 },
  ],
  "Liberty":   [
    { n:"Breanna Stewart",     pts:22,reb:9, ast:4, stl:1.4,blk:1.5,threes:2.0 },
    { n:"Sabrina Ionescu",     pts:19,reb:6, ast:6, stl:1.2,blk:0.3,threes:4.0 },
    { n:"Jonquel Jones",       pts:15,reb:8, ast:3, stl:1.0,blk:0.8,threes:1.0 },
    { n:"Courtney Vandersloot",pts:10,reb:3, ast:7, stl:1.0,blk:0.1,threes:1.5 },
  ],
  "Sun":       [
    { n:"Alyssa Thomas",       pts:20,reb:4, ast:5, stl:1.5,blk:0.5,threes:0.5 },
    { n:"Marina Mabrey",       pts:16,reb:5, ast:3, stl:1.0,blk:0.2,threes:3.0 },
    { n:"DiJonai Carrington",  pts:14,reb:4, ast:2, stl:2.0,blk:0.4,threes:2.0 },
  ],
  "Storm":     [
    { n:"Jewell Loyd",         pts:17,reb:5, ast:5, stl:1.2,blk:0.3,threes:2.5 },
    { n:"Nneka Ogwumike",      pts:16,reb:8, ast:3, stl:1.1,blk:0.6,threes:0.5 },
    { n:"Skylar Diggins-Smith",pts:17,reb:4, ast:6, stl:1.3,blk:0.2,threes:2.5 },
  ],
  "Lynx":      [
    { n:"Napheesa Collier",    pts:17,reb:8, ast:3, stl:1.8,blk:1.5,threes:1.0 },
    { n:"Courtney Williams",   pts:15,reb:4, ast:5, stl:1.5,blk:0.3,threes:2.0 },
    { n:"Kayla McBride",       pts:14,reb:3, ast:3, stl:1.0,blk:0.2,threes:3.0 },
  ],
  "Mercury":   [
    { n:"Brittney Griner",     pts:18,reb:7, ast:2, stl:0.8,blk:1.8,threes:0.3 },
    { n:"Natasha Cloud",       pts:14,reb:3, ast:6, stl:1.4,blk:0.2,threes:2.0 },
    { n:"Sophie Cunningham",   pts:13,reb:4, ast:2, stl:1.0,blk:0.3,threes:2.5 },
  ],
  "Wings":     [
    { n:"Arike Ogunbowale",    pts:19,reb:3, ast:4, stl:1.3,blk:0.2,threes:2.5 },
    { n:"Satou Sabally",       pts:18,reb:8, ast:3, stl:1.0,blk:0.8,threes:2.0 },
    { n:"Alysha Clark",        pts:10,reb:4, ast:2, stl:1.0,blk:0.5,threes:1.5 },
    { n:"Azzi Fudd",           pts:13,reb:3, ast:2, stl:0.8,blk:0.2,threes:2.5 },
    { n:"Aziaha James",        pts:12,reb:3, ast:2, stl:0.9,blk:0.2,threes:2.0 },
    { n:"Awak Kuier",          pts:8, reb:5, ast:1, stl:0.6,blk:0.8,threes:0.3 },
  ],
  "Dream":     [
    { n:"Rhyne Howard",        pts:19,reb:4, ast:4, stl:2.0,blk:0.5,threes:3.0 },
    { n:"Tina Charles",        pts:16,reb:8, ast:2, stl:0.8,blk:0.8,threes:0.3 },
    { n:"Allisha Gray",        pts:14,reb:4, ast:3, stl:1.3,blk:0.3,threes:2.5 },
  ],
  "Sky":       [
    { n:"Angel Reese",         pts:18,reb:11,ast:2, stl:1.0,blk:0.5,threes:0.2 },
    { n:"Kamilla Cardoso",     pts:12,reb:8, ast:2, stl:0.6,blk:0.8,threes:0.1 },
    { n:"Chennedy Carter",     pts:15,reb:3, ast:4, stl:1.5,blk:0.2,threes:1.5 },
  ],
  "Mystics":   [
    { n:"Ariel Atkins",        pts:15,reb:4, ast:3, stl:1.2,blk:0.3,threes:2.5 },
    { n:"Shakira Austin",      pts:14,reb:8, ast:2, stl:0.8,blk:1.0,threes:0.2 },
  ],
  "Sparks":    [
    { n:"Dearica Hamby",       pts:14,reb:8, ast:3, stl:1.2,blk:0.6,threes:1.0 },
    { n:"Rickea Jackson",      pts:15,reb:5, ast:2, stl:0.9,blk:0.4,threes:2.0 },
  ],
  "Valkyries": [
    { n:"Kate Martin",         pts:10,reb:5, ast:3, stl:1.0,blk:0.3,threes:1.5 },
    { n:"Kayla Thornton",      pts:9, reb:5, ast:2, stl:0.8,blk:0.3,threes:1.0 },
  ],
  "Tempo":     [
    { n:"Natasha Mack",        pts:12,reb:8, ast:2, stl:0.8,blk:1.5,threes:0.2 },
  ],
  "Fire":      [
    { n:"Dijonai Carrington",  pts:16,reb:4, ast:3, stl:2.0,blk:0.4,threes:2.0 },
    { n:"Gabrielle Williams",  pts:12,reb:6, ast:2, stl:0.9,blk:0.5,threes:1.5 },
  ],

  // ── MLB 2026 — per game averages ─────────────────────────
  // Batters: hits/tb/hr/rbi/walks per game | Pitchers: so/outs/era per start
  "Yankees":     [
    { n:"Aaron Judge",         hits:1.1,tb:2.2,hr:0.38,rbi:1.0,walks:0.8 },
    { n:"Juan Soto",           hits:1.2,tb:2.0,hr:0.22,rbi:0.9,walks:1.1 },
    { n:"Gerrit Cole",         so:8.2, outs:17,era:3.10 },
    { n:"Jazz Chisholm",       hits:1.0,tb:1.8,hr:0.20,rbi:0.7,walks:0.5 },
  ],
  "Red Sox":     [
    { n:"Rafael Devers",       hits:1.1,tb:2.0,hr:0.28,rbi:0.9,walks:0.6 },
    { n:"Jarren Duran",        hits:1.2,tb:1.9,hr:0.18,rbi:0.7,walks:0.5 },
    { n:"Tanner Houck",        so:7.5, outs:16,era:3.80 },
  ],
  "Blue Jays":   [
    { n:"Vladimir Guerrero Jr",hits:1.2,tb:2.1,hr:0.30,rbi:1.0,walks:0.8 },
    { n:"Bo Bichette",         hits:1.1,tb:1.8,hr:0.18,rbi:0.8,walks:0.4 },
    { n:"Kevin Gausman",       so:8.5, outs:17,era:3.40 },
  ],
  "Orioles":     [
    { n:"Gunnar Henderson",    hits:1.0,tb:1.9,hr:0.28,rbi:0.8,walks:0.7 },
    { n:"Adley Rutschman",     hits:1.0,tb:1.7,hr:0.18,rbi:0.7,walks:0.9 },
    { n:"Corbin Burnes",       so:8.0, outs:17,era:3.20 },
  ],
  "Rays":        [
    { n:"Yandy Diaz",          hits:1.1,tb:1.6,hr:0.12,rbi:0.6,walks:0.9 },
    { n:"Randy Arozarena",     hits:1.0,tb:1.8,hr:0.20,rbi:0.7,walks:0.6 },
    { n:"Zach Eflin",          so:6.5, outs:16,era:4.20 },
  ],
  "Astros":      [
    { n:"Jose Altuve",         hits:1.1,tb:1.8,hr:0.20,rbi:0.7,walks:0.6 },
    { n:"Yordan Alvarez",      hits:1.1,tb:2.1,hr:0.32,rbi:1.0,walks:0.9 },
    { n:"Framber Valdez",      so:7.5, outs:18,era:3.50 },
    { n:"Alex Bregman",        hits:1.0,tb:1.7,hr:0.22,rbi:0.8,walks:0.8 },
  ],
  "Dodgers":     [
    { n:"Shohei Ohtani",       hits:1.1,tb:2.2,hr:0.35,rbi:1.0,walks:0.9 },
    { n:"Freddie Freeman",     hits:1.2,tb:2.0,hr:0.22,rbi:0.9,walks:0.8 },
    { n:"Tyler Glasnow",       so:9.0, outs:16,era:3.60 },
    { n:"Yoshinobu Yamamoto",  so:8.5, outs:17,era:3.20 },
    { n:"Mookie Betts",        hits:1.1,tb:1.9,hr:0.25,rbi:0.8,walks:0.7 },
  ],
  "Braves":      [
    { n:"Ronald Acuna Jr",     hits:1.1,tb:2.0,hr:0.28,rbi:0.9,walks:0.8 },
    { n:"Matt Olson",          hits:1.0,tb:2.0,hr:0.32,rbi:1.0,walks:0.9 },
    { n:"Spencer Strider",     so:10.5,outs:15,era:3.00 },
    { n:"Ozzie Albies",        hits:1.1,tb:1.8,hr:0.22,rbi:0.7,walks:0.5 },
  ],
  "Phillies":    [
    { n:"Bryce Harper",        hits:1.1,tb:2.1,hr:0.30,rbi:1.0,walks:0.9 },
    { n:"Trea Turner",         hits:1.2,tb:2.0,hr:0.22,rbi:0.8,walks:0.5 },
    { n:"Zack Wheeler",        so:9.5, outs:18,era:2.90 },
    { n:"Aaron Nola",          so:8.0, outs:17,era:3.80 },
    { n:"Kyle Schwarber",      hits:0.9,tb:1.8,hr:0.30,rbi:0.9,walks:1.0 },
  ],
  "Mets":        [
    { n:"Francisco Lindor",    hits:1.0,tb:1.8,hr:0.25,rbi:0.8,walks:0.7 },
    { n:"Pete Alonso",         hits:1.0,tb:2.0,hr:0.32,rbi:1.0,walks:0.8 },
    { n:"Kodai Senga",         so:9.0, outs:16,era:3.20 },
    { n:"David Peterson",      so:7.0, outs:16,era:3.90 },
  ],
  "Cubs":        [
    { n:"Cody Bellinger",      hits:1.0,tb:1.8,hr:0.22,rbi:0.8,walks:0.7 },
    { n:"Dansby Swanson",      hits:1.0,tb:1.7,hr:0.18,rbi:0.7,walks:0.6 },
    { n:"Justin Steele",       so:7.5, outs:17,era:3.60 },
  ],
  "Cardinals":   [
    { n:"Paul Goldschmidt",    hits:1.1,tb:1.9,hr:0.25,rbi:0.9,walks:0.8 },
    { n:"Nolan Arenado",       hits:1.0,tb:1.8,hr:0.28,rbi:0.9,walks:0.6 },
    { n:"Miles Mikolas",       so:6.0, outs:17,era:4.20 },
  ],
  "Brewers":     [
    { n:"Christian Yelich",    hits:1.0,tb:1.8,hr:0.22,rbi:0.8,walks:0.8 },
    { n:"Willy Adames",        hits:1.0,tb:1.8,hr:0.25,rbi:0.8,walks:0.7 },
    { n:"Freddy Peralta",      so:8.5, outs:16,era:3.50 },
  ],
  "Pirates":     [
    { n:"Paul Skenes",         so:10.0,outs:17,era:2.80 },
    { n:"Bryan Reynolds",      hits:1.0,tb:1.7,hr:0.18,rbi:0.7,walks:0.7 },
    { n:"Oneil Cruz",          hits:0.9,tb:1.7,hr:0.22,rbi:0.7,walks:0.5 },
  ],
  "Reds":        [
    { n:"Elly De La Cruz",     hits:0.9,tb:1.7,hr:0.20,rbi:0.7,walks:0.5 },
    { n:"Jonathan India",      hits:1.0,tb:1.6,hr:0.15,rbi:0.6,walks:0.8 },
    { n:"Hunter Greene",       so:9.5, outs:15,era:3.80 },
  ],
  "Giants":      [
    { n:"Matt Chapman",        hits:0.9,tb:1.7,hr:0.22,rbi:0.7,walks:0.8 },
    { n:"Logan Webb",          so:7.5, outs:18,era:3.40 },
  ],
  "Padres":      [
    { n:"Fernando Tatis Jr",   hits:1.0,tb:1.9,hr:0.28,rbi:0.8,walks:0.6 },
    { n:"Manny Machado",       hits:1.0,tb:1.8,hr:0.22,rbi:0.8,walks:0.7 },
    { n:"Dylan Cease",         so:9.0, outs:16,era:3.60 },
    { n:"Joe Musgrove",        so:7.5, outs:17,era:3.80 },
  ],
  "Rockies":     [
    { n:"Ryan McMahon",        hits:0.9,tb:1.6,hr:0.20,rbi:0.7,walks:0.6 },
    { n:"C.J. Cron",           hits:0.9,tb:1.7,hr:0.22,rbi:0.7,walks:0.5 },
    { n:"Austin Gomber",       so:5.5, outs:15,era:5.20 },
  ],
  "Diamondbacks":[
    { n:"Ketel Marte",         hits:1.1,tb:1.9,hr:0.22,rbi:0.8,walks:0.7 },
    { n:"Corbin Carroll",      hits:1.0,tb:1.7,hr:0.18,rbi:0.7,walks:0.8 },
    { n:"Zac Gallen",          so:8.0, outs:17,era:3.60 },
    { n:"Merrill Kelly",       so:7.0, outs:17,era:4.00 },
  ],
  "Angels":      [
    { n:"Mike Trout",          hits:1.0,tb:1.9,hr:0.28,rbi:0.8,walks:0.9 },
    { n:"Anthony Rendon",      hits:0.9,tb:1.5,hr:0.15,rbi:0.6,walks:0.7 },
    { n:"Patrick Sandoval",    so:7.0, outs:16,era:4.00 },
  ],
  "Mariners":    [
    { n:"Julio Rodriguez",     hits:1.0,tb:1.8,hr:0.22,rbi:0.8,walks:0.6 },
    { n:"Luis Castillo",       so:8.5, outs:18,era:3.20 },
    { n:"Logan Gilbert",       so:8.0, outs:17,era:3.60 },
    { n:"Cal Raleigh",         hits:0.9,tb:1.7,hr:0.28,rbi:0.8,walks:0.6 },
  ],
  "Rangers":     [
    { n:"Corey Seager",        hits:1.1,tb:2.0,hr:0.28,rbi:0.9,walks:0.7 },
    { n:"Marcus Semien",       hits:1.0,tb:1.8,hr:0.22,rbi:0.8,walks:0.6 },
    { n:"Nathan Eovaldi",      so:7.0, outs:17,era:3.80 },
    { n:"Jordan Montgomery",   so:7.5, outs:17,era:3.60 },
  ],
  "Twins":       [
    { n:"Byron Buxton",        hits:0.9,tb:1.9,hr:0.28,rbi:0.8,walks:0.5 },
    { n:"Carlos Correa",       hits:1.0,tb:1.7,hr:0.18,rbi:0.7,walks:0.7 },
    { n:"Pablo Lopez",         so:8.5, outs:17,era:3.50 },
    { n:"Joe Ryan",            so:7.5, outs:17,era:3.80 },
  ],
  "White Sox":   [
    { n:"Luis Robert Jr",      hits:0.9,tb:1.8,hr:0.22,rbi:0.7,walks:0.5 },
    { n:"Andrew Vaughn",       hits:0.9,tb:1.6,hr:0.18,rbi:0.6,walks:0.5 },
    { n:"Garrett Crochet",     so:10.0,outs:15,era:3.20 },
  ],
  "Guardians":   [
    { n:"Jose Ramirez",        hits:1.1,tb:2.0,hr:0.28,rbi:1.0,walks:0.7 },
    { n:"Shane Bieber",        so:7.5, outs:17,era:3.60 },
    { n:"Triston McKenzie",    so:8.0, outs:16,era:3.80 },
    { n:"Steven Kwan",         hits:1.1,tb:1.7,hr:0.10,rbi:0.6,walks:0.8 },
  ],
  "Tigers":      [
    { n:"Riley Greene",        hits:1.0,tb:1.7,hr:0.18,rbi:0.7,walks:0.7 },
    { n:"Spencer Torkelson",   hits:0.9,tb:1.7,hr:0.22,rbi:0.7,walks:0.7 },
    { n:"Tarik Skubal",        so:10.5,outs:18,era:2.80 },
    { n:"Casey Mize",          so:7.0, outs:16,era:4.00 },
  ],
  "Royals":      [
    { n:"Salvador Perez",      hits:1.0,tb:1.8,hr:0.22,rbi:0.8,walks:0.4 },
    { n:"Bobby Witt Jr",       hits:1.1,tb:2.0,hr:0.25,rbi:0.9,walks:0.5 },
    { n:"Cole Ragans",         so:9.0, outs:16,era:3.40 },
    { n:"Brady Singer",        so:7.0, outs:17,era:4.00 },
  ],
  "Athletics":   [
    { n:"Brent Rooker",        hits:0.9,tb:1.8,hr:0.25,rbi:0.8,walks:0.7 },
    { n:"JJ Bleday",           hits:0.9,tb:1.6,hr:0.18,rbi:0.6,walks:0.8 },
    { n:"Paul Blackburn",      so:6.0, outs:15,era:4.50 },
  ],
  "Nationals":   [
    { n:"CJ Abrams",           hits:1.0,tb:1.7,hr:0.18,rbi:0.7,walks:0.6 },
    { n:"Lane Thomas",         hits:1.0,tb:1.7,hr:0.20,rbi:0.7,walks:0.5 },
    { n:"MacKenzie Gore",      so:8.5, outs:16,era:3.80 },
  ],
  "Marlins":     [
    { n:"Jazz Chisholm Jr",    hits:0.9,tb:1.7,hr:0.20,rbi:0.7,walks:0.5 },
    { n:"Sandy Alcantara",     so:8.5, outs:18,era:3.20 },
    { n:"Eury Perez",          so:8.0, outs:15,era:3.80 },
    { n:"Jorge Soler",         hits:0.9,tb:1.8,hr:0.25,rbi:0.8,walks:0.7 },
  ],

  // ── NFL 2025 ─────────────────────────────────────────────
  "Chiefs":       [{ n:"P. Mahomes",   pyds:310,ptds:2.2,ryds:28,patt:38 },{ n:"T. Kelce",    ryds_r:72,rec:5,rtds:0.6 }],
  "Bills":        [{ n:"J. Allen",     pyds:285,ptds:2.1,ryds:48,patt:36 },{ n:"A. Cooper",   ryds_r:72,rec:5,rtds:0.5 }],
  "Eagles":       [{ n:"J. Hurts",     pyds:265,ptds:2.0,ryds:55,patt:34 },{ n:"D. Smith",    ryds_r:75,rec:5,rtds:0.5 }],
  "49ers":        [{ n:"B. Purdy",     pyds:278,ptds:2.1,ryds:14,patt:35 },{ n:"B. Aiyuk",    ryds_r:78,rec:5,rtds:0.5 }],
  "Cowboys":      [{ n:"D. Prescott",  pyds:272,ptds:2.0,ryds:14,patt:35 },{ n:"C. Lamb",     ryds_r:95,rec:7,rtds:0.6 }],
  "Ravens":       [{ n:"L. Jackson",   pyds:252,ptds:2.0,ryds:65,patt:32 },{ n:"M. Andrews",  ryds_r:65,rec:5,rtds:0.5 }],
  "Bengals":      [{ n:"J. Burrow",    pyds:292,ptds:2.2,ryds:14,patt:37 },{ n:"J. Chase",    ryds_r:90,rec:6,rtds:0.6 }],
  "Lions":        [{ n:"J. Goff",      pyds:265,ptds:1.9,ryds:8, patt:34 },{ n:"A. St. Brown",ryds_r:80,rec:7,rtds:0.5 }],
  "Dolphins":     [{ n:"T. Tagovailoa",pyds:270,ptds:1.9,ryds:12,patt:35 },{ n:"T. Hill",     ryds_r:88,rec:6,rtds:0.5 }],
  "Packers":      [{ n:"J. Love",      pyds:262,ptds:1.9,ryds:18,patt:34 },{ n:"R. Doubs",    ryds_r:65,rec:5,rtds:0.4 }],
  "Vikings":      [{ n:"S. Darnold",   pyds:248,ptds:1.8,ryds:20,patt:33 },{ n:"J. Jefferson",ryds_r:88,rec:6,rtds:0.5 }],
  "Seahawks":     [{ n:"G. Smith",     pyds:250,ptds:1.7,ryds:18,patt:33 },{ n:"D. Metcalf",  ryds_r:78,rec:5,rtds:0.5 }],
  "Rams":         [{ n:"M. Stafford",  pyds:255,ptds:1.8,ryds:8, patt:34 },{ n:"P. Cooper",   ryds_r:72,rec:6,rtds:0.5 }],
  "Buccaneers":   [{ n:"B. Mayfield",  pyds:255,ptds:1.8,ryds:12,patt:34 },{ n:"M. Evans",    ryds_r:72,rec:5,rtds:0.5 }],
  "Browns":       [{ n:"J. Fields",    pyds:240,ptds:1.6,ryds:35,patt:32 },{ n:"J. Njoku",    ryds_r:62,rec:5,rtds:0.4 }],
  "Steelers":     [{ n:"J. Fields",    pyds:235,ptds:1.6,ryds:40,patt:31 },{ n:"G. Pickens",  ryds_r:70,rec:5,rtds:0.5 }],
  "Commanders":   [{ n:"J. Daniels",   pyds:258,ptds:1.8,ryds:42,patt:34 },{ n:"T. McLaurin", ryds_r:72,rec:5,rtds:0.5 }],
  "Falcons":      [{ n:"M. Penix Jr",  pyds:248,ptds:1.7,ryds:18,patt:33 },{ n:"D. London",   ryds_r:75,rec:6,rtds:0.5 }],
  "Bears":        [{ n:"C. Williams",  pyds:238,ptds:1.6,ryds:28,patt:32 },{ n:"D. Moore",    ryds_r:68,rec:5,rtds:0.4 }],
  "Colts":        [{ n:"A. Richardson",pyds:242,ptds:1.7,ryds:45,patt:32 },{ n:"M. Pittman",  ryds_r:68,rec:5,rtds:0.4 }],

  // ── NHL 2024-25 ──────────────────────────────────────────
  "Oilers":        [{ n:"C. McDavid",   g:0.55,a:0.92,sog:4.2,saves:null },{ n:"L. Draisaitl",g:0.58,a:0.80,sog:3.8 }],
  "Avalanche":     [{ n:"N. MacKinnon", g:0.54,a:0.80,sog:4.1 },{ n:"M. Rantanen",  g:0.50,a:0.64,sog:3.8 }],
  "Panthers":      [{ n:"M. Tkachuk",   g:0.44,a:0.60,sog:3.5 },{ n:"S. Reinhart",  g:0.47,a:0.54,sog:3.7 }],
  "Lightning":     [{ n:"N. Kucherov",  g:0.47,a:0.80,sog:3.5 },{ n:"B. Point",     g:0.51,a:0.64,sog:3.8 }],
  "Rangers":       [{ n:"A. Panarin",   g:0.41,a:0.70,sog:3.2 },{ n:"V. Trocheck",  g:0.34,a:0.50,sog:3.0 }],
  "Stars":         [{ n:"J. Robertson", g:0.47,a:0.51,sog:3.8 },{ n:"R. Hintz",     g:0.41,a:0.54,sog:3.2 }],
  "Bruins":        [{ n:"D. Pastrnak",  g:0.54,a:0.68,sog:3.8 },{ n:"B. Marchand",  g:0.39,a:0.60,sog:3.2 }],
  "Wild":          [{ n:"K. Kaprizov",  g:0.51,a:0.60,sog:3.8 },{ n:"M. Rossi",     g:0.31,a:0.47,sog:2.8 }],
  "Golden Knights":[{ n:"M. Stone",     g:0.38,a:0.62,sog:3.0 },{ n:"J. Eichel",    g:0.42,a:0.58,sog:3.4 }],
  "Maple Leafs":   [{ n:"A. Matthews",  g:0.61,a:0.64,sog:4.2 },{ n:"M. Marner",    g:0.34,a:0.78,sog:3.0 }],
  "Devils":        [{ n:"J. Hughes",    g:0.41,a:0.70,sog:3.2 },{ n:"N. Hischier",  g:0.37,a:0.51,sog:3.0 }],
  "Canucks":       [{ n:"E. Pettersson",g:0.41,a:0.68,sog:3.2 },{ n:"B. Boeser",    g:0.44,a:0.48,sog:3.4 }],
  "Capitals":      [{ n:"A. Ovechkin",  g:0.51,a:0.44,sog:4.0 },{ n:"D. Strome",    g:0.28,a:0.48,sog:2.8 }],
  "Penguins":      [{ n:"E. Malkin",    g:0.31,a:0.58,sog:3.0 },{ n:"B. Rust",      g:0.28,a:0.38,sog:2.8 }],
  "Hurricanes":    [{ n:"S. Necas",     g:0.38,a:0.48,sog:3.2 },{ n:"A. Svechnikov",g:0.38,a:0.44,sog:3.2 }],
  "Jets":          [{ n:"K. Connor",    g:0.44,a:0.54,sog:3.4 },{ n:"M. Scheifele", g:0.38,a:0.54,sog:3.2 }],

// ── UFC / MMA fighters ───────────────────────────────────────
// Keyed by fighter last name — matches Odds API description field
// method: KO/TKO%, SUB%, DEC% (approximate career rates)
// str: significant strikes per min | td: takedowns per 15min

  "Topuria":    [{ n:"Ilia Topuria",      method:"KO/TKO", str:5.8, td:1.8 }],
  "Gaethje":    [{ n:"Justin Gaethje",    method:"KO/TKO", str:5.9, td:0.4 }],
  "Pereira":    [{ n:"Alex Pereira",      method:"KO/TKO", str:4.2, td:0.5 }],
  "Gane":       [{ n:"Ciryl Gane",        method:"DEC",    str:5.1, td:0.9 }],
  "Muhammad":   [{ n:"Belal Muhammad",    method:"DEC",    str:4.0, td:3.2 }],
  "Bonfim":     [{ n:"Gabriel Bonfim",    method:"SUB",    str:4.5, td:2.8 }],
  "Kape":       [{ n:"Manel Kape",        method:"KO/TKO", str:5.2, td:1.0 }],
  "Horiguchi":  [{ n:"Kyoji Horiguchi",   method:"KO/TKO", str:5.0, td:1.5 }],
  "Fiziev":     [{ n:"Rafael Fiziev",     method:"KO/TKO", str:6.1, td:0.5 }],
  "Torres":     [{ n:"Joaquin Torres",    method:"KO/TKO", str:4.8, td:1.2 }],
  "Adesanya":   [{ n:"Israel Adesanya",   method:"KO/TKO", str:4.5, td:0.5 }],
  "Poirier":    [{ n:"Dustin Poirier",    method:"KO/TKO", str:5.5, td:1.2 }],
  "Holloway":   [{ n:"Max Holloway",      method:"DEC",    str:7.6, td:0.5 }],
  "Oliveira":   [{ n:"Charles Oliveira",  method:"SUB",    str:4.0, td:2.2 }],
  "Makhachev":  [{ n:"Islam Makhachev",   method:"SUB",    str:4.1, td:3.0 }],
  "Volkanovski":[{ n:"Alexander Volkanovski",method:"DEC", str:6.0, td:1.8 }],
  "O'Malley":   [{ n:"Sean O'Malley",     method:"KO/TKO", str:5.6, td:0.4 }],
  "Pantoja":    [{ n:"Alexandre Pantoja", method:"SUB",    str:3.9, td:3.2 }],
  "Edwards":    [{ n:"Leon Edwards",      method:"DEC",    str:4.1, td:1.8 }],
  "Aspinall":   [{ n:"Tom Aspinall",      method:"KO/TKO", str:4.8, td:1.5 }],

// ── MLS 2026 — top players per team ─────────────────────────
//shots_pg = shots per game | goals_pg = goals per game | ast_pg = assists per game
// Ready for when MLS resumes July 16 after World Cup break

  "Inter Miami":    [
    { n:"Lionel Messi",      goals_pg:0.65,ast_pg:0.55,shots_pg:3.8 },
    { n:"Luis Suarez",       goals_pg:0.45,ast_pg:0.30,shots_pg:2.8 },
    { n:"Jordi Alba",        goals_pg:0.10,ast_pg:0.40,shots_pg:1.2 },
    { n:"Sergio Busquets",   goals_pg:0.05,ast_pg:0.25,shots_pg:0.8 },
  ],
  "LA Galaxy":      [
    { n:"Riqui Puig",        goals_pg:0.30,ast_pg:0.38,shots_pg:2.5 },
    { n:"Gabriel Pec",       goals_pg:0.35,ast_pg:0.25,shots_pg:2.8 },
    { n:"Dejan Joveljic",    goals_pg:0.40,ast_pg:0.20,shots_pg:2.5 },
  ],
  "LAFC":           [
    { n:"Denis Bouanga",     goals_pg:0.45,ast_pg:0.22,shots_pg:3.0 },
    { n:"Olivier Giroud",    goals_pg:0.38,ast_pg:0.18,shots_pg:2.8 },
    { n:"Mateusz Bogusz",    goals_pg:0.25,ast_pg:0.35,shots_pg:2.2 },
  ],
  "Seattle Sounders":[
    { n:"Jordan Morris",     goals_pg:0.30,ast_pg:0.22,shots_pg:2.2 },
    { n:"Albert Rusnak",     goals_pg:0.18,ast_pg:0.35,shots_pg:1.8 },
    { n:"Raul Ruidiaz",      goals_pg:0.38,ast_pg:0.15,shots_pg:2.5 },
  ],
  "Portland Timbers":[
    { n:"Evander",           goals_pg:0.30,ast_pg:0.40,shots_pg:2.5 },
    { n:"Antony",            goals_pg:0.28,ast_pg:0.30,shots_pg:2.8 },
  ],
  "Atlanta United":  [
    { n:"Giorgos Giakoumakis",goals_pg:0.45,ast_pg:0.15,shots_pg:2.8 },
    { n:"Thiago Almada",     goals_pg:0.25,ast_pg:0.38,shots_pg:2.2 },
  ],
  "FC Cincinnati":  [
    { n:"Luciano Acosta",    goals_pg:0.22,ast_pg:0.45,shots_pg:2.0 },
    { n:"Brandon Vazquez",   goals_pg:0.40,ast_pg:0.18,shots_pg:2.5 },
  ],
  "Columbus Crew":  [
    { n:"Cucho Hernandez",   goals_pg:0.42,ast_pg:0.20,shots_pg:3.0 },
    { n:"Yaw Yeboah",        goals_pg:0.22,ast_pg:0.30,shots_pg:2.0 },
  ],
  "New York City FC":[
    { n:"Mitja Ilenic",      goals_pg:0.28,ast_pg:0.22,shots_pg:2.2 },
    { n:"Hannes Wolf",       goals_pg:0.18,ast_pg:0.35,shots_pg:1.8 },
  ],
  "New York Red Bulls":[
    { n:"Dante Vanzeir",     goals_pg:0.35,ast_pg:0.20,shots_pg:2.5 },
    { n:"Cameron Harper",    goals_pg:0.22,ast_pg:0.30,shots_pg:2.0 },
  ],
  "Philadelphia Union":[
    { n:"Julian Carranza",   goals_pg:0.38,ast_pg:0.18,shots_pg:2.5 },
    { n:"Daniel Gazdag",     goals_pg:0.25,ast_pg:0.32,shots_pg:2.2 },
  ],
  "Toronto FC":     [
    { n:"Federico Bernardeschi",goals_pg:0.25,ast_pg:0.35,shots_pg:2.2 },
    { n:"Lorenzo Insigne",   goals_pg:0.22,ast_pg:0.38,shots_pg:2.0 },
  ],
  "CF Montreal":    [
    { n:"Romell Quioto",     goals_pg:0.28,ast_pg:0.25,shots_pg:2.2 },
    { n:"Mathieu Choiniere", goals_pg:0.22,ast_pg:0.28,shots_pg:2.0 },
  ],
  "Vancouver Whitecaps":[
    { n:"Brian White",       goals_pg:0.35,ast_pg:0.15,shots_pg:2.5 },
    { n:"Ryan Gauld",        goals_pg:0.18,ast_pg:0.40,shots_pg:1.8 },
  ],
  "Colorado Rapids": [
    { n:"Rafael Navarro",    goals_pg:0.38,ast_pg:0.15,shots_pg:2.5 },
    { n:"Cole Bassett",      goals_pg:0.18,ast_pg:0.32,shots_pg:1.8 },
  ],
  "Real Salt Lake":  [
    { n:"Chicho Arango",     goals_pg:0.40,ast_pg:0.15,shots_pg:2.8 },
    { n:"Braian Ojeda",      goals_pg:0.15,ast_pg:0.35,shots_pg:1.5 },
  ],
  "Minnesota United":[
    { n:"Teemu Pukki",       goals_pg:0.38,ast_pg:0.18,shots_pg:2.5 },
    { n:"Emanuel Reynoso",   goals_pg:0.20,ast_pg:0.38,shots_pg:1.8 },
  ],
  "FC Dallas":       [
    { n:"Paul Arriola",      goals_pg:0.25,ast_pg:0.28,shots_pg:2.0 },
    { n:"Petar Musa",        goals_pg:0.40,ast_pg:0.12,shots_pg:2.8 },
  ],
  "Houston Dynamo":  [
    { n:"Ezequiel Ponce",    goals_pg:0.35,ast_pg:0.15,shots_pg:2.5 },
    { n:"Hector Herrera",    goals_pg:0.15,ast_pg:0.30,shots_pg:1.5 },
  ],
  "Austin FC":       [
    { n:"Sebastian Driussi",  goals_pg:0.35,ast_pg:0.22,shots_pg:2.5 },
    { n:"Diego Fagundez",    goals_pg:0.20,ast_pg:0.32,shots_pg:1.8 },
  ],
  "San Jose Earthquakes":[
    { n:"Cristian Espinoza", goals_pg:0.22,ast_pg:0.38,shots_pg:2.0 },
    { n:"Cade Cowell",       goals_pg:0.30,ast_pg:0.25,shots_pg:2.5 },
  ],
  "Sporting KC":     [
    { n:"Alan Pulido",       goals_pg:0.35,ast_pg:0.15,shots_pg:2.5 },
    { n:"Daniel Salloi",     goals_pg:0.25,ast_pg:0.28,shots_pg:2.0 },
  ],
  "Chicago Fire":    [
    { n:"Hugo Cuypers",      goals_pg:0.48,ast_pg:0.18,shots_pg:3.0 },
    { n:"Xherdan Shaqiri",   goals_pg:0.22,ast_pg:0.35,shots_pg:2.2 },
  ],
  "DC United":       [
    { n:"Christian Benteke", goals_pg:0.38,ast_pg:0.15,shots_pg:2.8 },
    { n:"Russell Canouse",   goals_pg:0.15,ast_pg:0.28,shots_pg:1.5 },
  ],
  "Nashville SC":    [
    { n:"Hany Mukhtar",      goals_pg:0.35,ast_pg:0.35,shots_pg:2.5 },
    { n:"Sam Surridge",      goals_pg:0.35,ast_pg:0.18,shots_pg:2.5 },
  ],
  "Orlando City":    [
    { n:"Facundo Torres",    goals_pg:0.32,ast_pg:0.25,shots_pg:2.5 },
    { n:"Ivan Angulo",       goals_pg:0.25,ast_pg:0.28,shots_pg:2.0 },
  ],
  "Charlotte FC":    [
    { n:"Enzo Copetti",      goals_pg:0.38,ast_pg:0.18,shots_pg:2.5 },
    { n:"Kerwin Vargas",     goals_pg:0.25,ast_pg:0.25,shots_pg:2.0 },
  ],
  "St. Louis City":  [
    { n:"Cedric Teuchert",   goals_pg:0.30,ast_pg:0.20,shots_pg:2.2 },
    { n:"Indiana Vassilev",  goals_pg:0.20,ast_pg:0.30,shots_pg:1.8 },
  ],
  "San Diego FC":    [
    { n:"Hirving Lozano",    goals_pg:0.32,ast_pg:0.28,shots_pg:2.8 },
    { n:"Gaston Brugman",    goals_pg:0.15,ast_pg:0.30,shots_pg:1.5 },
  ],
};
