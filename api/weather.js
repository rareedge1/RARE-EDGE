export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const { lat, lng } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: "lat and lng required" });

  const WEATHER_KEY = process.env.OPENWEATHER_KEY || "";
  if (!WEATHER_KEY) return res.status(200).json({ temp:72, wind:5, dome:false, condition:"clear" });

  try {
    const r = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${WEATHER_KEY}&units=imperial`
    );
    const data = await r.json();
    const temp      = Math.round(data.main?.temp || 72);
    const wind      = Math.round(data.wind?.speed || 5);
    const condition = data.weather?.[0]?.main?.toLowerCase() || "clear";
    const rain      = condition.includes("rain") || condition.includes("drizzle");
    const snow      = condition.includes("snow");

    // Scoring impact factors
    // Cold (<40F): -1.5 pts total per team
    // Wind (>15mph): -1.0 pts total per team  
    // Rain: -0.8 pts total per team
    // Snow: -1.2 pts total per team
    let totalAdj = 0;
    if (temp < 40) totalAdj -= 3.0;
    else if (temp < 50) totalAdj -= 1.5;
    if (wind > 20) totalAdj -= 2.0;
    else if (wind > 15) totalAdj -= 1.0;
    if (rain) totalAdj -= 1.6;
    if (snow) totalAdj -= 2.4;

    res.setHeader("Cache-Control", "s-maxage=1800");
    return res.status(200).json({ temp, wind, condition, rain, snow, totalAdj: +totalAdj.toFixed(1) });
  } catch(e) {
    return res.status(200).json({ temp:72, wind:5, condition:"clear", totalAdj:0 });
  }
}
