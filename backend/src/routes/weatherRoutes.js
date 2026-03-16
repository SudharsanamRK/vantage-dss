// backend/src/routes/weatherRoutes.js
// Uses Open-Meteo — completely free, no API key required
// Step 1: Geocode city name → lat/lon using Open-Meteo geocoding API
// Step 2: Fetch weather from Open-Meteo forecast API

const express = require("express");
const router  = express.Router();
const auth    = require("../middleware/authMiddleware");

// WMO Weather Code → description + icon key
function describeWeatherCode(code) {
  if (code === 0)               return { desc: "Clear sky",           icon: "01" };
  if (code <= 2)                return { desc: "Partly cloudy",       icon: "02" };
  if (code === 3)               return { desc: "Overcast",            icon: "04" };
  if (code <= 49)               return { desc: "Foggy",               icon: "50" };
  if (code <= 55)               return { desc: "Drizzle",             icon: "09" };
  if (code <= 65)               return { desc: "Rain",                icon: "10" };
  if (code <= 77)               return { desc: "Snow",                icon: "13" };
  if (code <= 82)               return { desc: "Rain showers",        icon: "09" };
  if (code <= 86)               return { desc: "Snow showers",        icon: "13" };
  if (code <= 99)               return { desc: "Thunderstorm",        icon: "11" };
  return                               { desc: "Unknown",             icon: "02" };
}

// GET /api/weather?location=Coimbatore
router.get("/", auth, async (req, res) => {
  try {
    const { location } = req.query;
    if (!location)
      return res.status(400).json({ success: false, message: "location query param required." });

    // ── Step 1: Geocode city name to lat/lon ─────────────────────────────────
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en&format=json`;
    const geoRes  = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoData.results?.length)
      return res.status(404).json({ success: false, message: `Location "${location}" not found. Try a nearby city name.` });

    const { latitude, longitude, name, country } = geoData.results[0];

    // ── Step 2: Fetch weather data ───────────────────────────────────────────
    const weatherUrl = [
      "https://api.open-meteo.com/v1/forecast",
      `?latitude=${latitude}`,
      `&longitude=${longitude}`,
      "&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,precipitation",
      "&daily=temperature_2m_max,temperature_2m_min",
      "&timezone=auto",
      "&forecast_days=1",
    ].join("");

    const wRes  = await fetch(weatherUrl);
    const wData = await wRes.json();

    if (!wData.current)
      return res.status(502).json({ success: false, message: "Weather data unavailable." });

    const c = wData.current;
    const d = wData.daily;
    const { desc, icon } = describeWeatherCode(c.weather_code);

    res.json({
      success: true,
      weather: {
        temp:      Math.round(c.temperature_2m),
        feels:     Math.round(c.apparent_temperature),
        humidity:  c.relative_humidity_2m,
        windSpeed: Math.round(c.wind_speed_10m),
        desc,
        icon,
        city:      `${name}, ${country}`,
        high:      Math.round(d.temperature_2m_max?.[0] ?? c.temperature_2m),
        low:       Math.round(d.temperature_2m_min?.[0] ?? c.temperature_2m),
        rain:      c.precipitation ?? 0,
      },
    });
  } catch (err) {
    console.error("Weather error:", err);
    res.status(500).json({ success: false, message: "Weather service unavailable." });
  }
});

module.exports = router;