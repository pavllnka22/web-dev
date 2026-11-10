import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { fetchWeather } from "../services/weatherApi";
import WeatherCard from "../components/WeatherCard";
import Loader from "../components/Loader";

export default function Dashboard() {
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [city, setCity] = useState("Київ");
  const navigate = useNavigate();
  const username = Cookies.get("auth_user") || "User";

  const loadWeather = async (lat, lon) => {
    try {
      setLoading(true);
      const data = await fetchWeather(lat, lon);
      setWeatherData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCity("Your current city");
          loadWeather(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          loadWeather(50.45, 30.52);
        },
      );
    } else {
      loadWeather(50.45, 30.52);
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("auth_user");
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Weather forecast for the next 5 days — {city}</h1>
        <div className="user-info">
          <span>
            Welcome, <strong>{username}</strong>!
          </span>
          <button onClick={handleLogout} className="btn-logout">
            Вийти
          </button>
        </div>
      </header>

      {loading && <Loader />}

      {error && <p className="error-message">{error}</p>}

      {!loading && !error && (
        <div className="weather-grid">
          {weatherData.map((item) => (
            <WeatherCard key={item.date} weather={item} />
          ))}
        </div>
      )}
    </div>
  );
}
