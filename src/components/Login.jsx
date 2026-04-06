  import "../styles/login.css";
  import "../styles/app.css";

  import { useNavigate } from "react-router-dom";

  

  function Login() {
    const navigate = useNavigate();

    const handleLogin = () => {
      // later: validate with backend
      navigate("/home");
    };
    return (
        <div className="login-card">
          <h1 className="login-header">Expense Tracker</h1>
          <input className="login-inputs" placeholder="Username" />
          <input className="login-inputs" placeholder="Password" />
          <button onClick={handleLogin} className="button">Login</button>
        </div>
    );
    
  }

  export default Login;
