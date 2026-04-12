import "../styles/login.css";
import "../styles/app.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setError("");
    navigate("/home");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="login-card">
      <h1 className="login-header">Expense Tracker</h1>
      <h3>Welcome Back</h3>
      <h6>Please enter your credentials to log in</h6>

      <input
        type="text"
        className={`login-inputs${error && !username.trim() ? " input-error" : ""}`}
        placeholder="Username"
        value={username}
        onChange={e => { setUsername(e.target.value); setError(""); }}
        onKeyDown={handleKeyDown}
      />
      <input
        type="password"
        className={`login-inputs${error && !password.trim() ? " input-error" : ""}`}
        placeholder="Password"
        value={password}
        onChange={e => { setPassword(e.target.value); setError(""); }}
        onKeyDown={handleKeyDown}
      />

      {error && <p className="error-msg">{error}</p>}

      <button onClick={handleLogin} className="login-btn">Login</button>
      <p className="signup-text">
        Don't have an account? <span className="sign-up" onClick={() => navigate("/signup")} style={{cursor: "pointer"}}>Sign Up</span>
      </p>
    </div>
  );
}

export default Login;
