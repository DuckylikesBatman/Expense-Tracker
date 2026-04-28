import "../styles/app.css"
import "../styles/signup.css"
import "../styles/login.css"
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = () => {
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setError("");
    navigate("/home");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSignup();
  };

  return (
    <div className="login-card">
      <h1 className="login-header">Expense Tracker</h1>
      <h3>Create an Account</h3>
      <h6>Please sign up to continue</h6>
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
      <button onClick={handleSignup} className="login-btn">Sign Up</button>
      <p className="signup-text">
        Already have an account?{" "}
        <span className="sign-up" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
          Log In
        </span>
      </p>
    </div>
  );
}

export default Signup;
