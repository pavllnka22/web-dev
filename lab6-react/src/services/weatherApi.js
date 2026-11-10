export async function fetchWeather(lat = 50.45, lon = 30.52) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode,windspeed_10m_max&timezone=auto`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("error fetching weather data");
  }
  const data = await response.json();

  return data.daily.time.slice(0, 5).map((date, index) => ({
    date,
    maxTemp: Math.round(data.daily.temperature_2m_max[index]),
    minTemp: Math.round(data.daily.temperature_2m_min[index]),
    windSpeed: Math.round(data.daily.windspeed_10m_max[index]),
    weatherCode: data.daily.weathercode[index],
  }));
}
