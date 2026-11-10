export default function WeatherCard({ weather }) {
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("uk-UA", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="weather-card">
      <h3>{formatDate(weather.date)}</h3>
      <div className="weather-icon">☀️</div>
      <p className="temp-max">Макс: {weather.maxTemp}°C</p>
      <p className="temp-min">Мін: {weather.minTemp}°C</p>
      <p className="wind">Вітер: {weather.windSpeed} км/год</p>
    </div>
  );
}
