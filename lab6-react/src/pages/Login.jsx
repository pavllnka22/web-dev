import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setError("");

    const validPattern = /^[a-zA-Z]+[1-6]$/;

    if (!validPattern.test(username.trim())) {
      setError(
        "login should be in a format like 'name + course number' (ex: mark5, polina3)",
      );
      return;
    }

    if (password.length < 4) {
      setError("password should have at lest 4 characters");
      return;
    }

    Cookies.set("auth_user", username, { expires: 1 });
    navigate("/dashboard");
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Log to Web App</h2>

        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label>Email / Login:</label>
          <input
            type="text"
            placeholder="e.g. polina3"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="btn-login">
          Login
        </button>
      </form>
    </div>
  );
}
