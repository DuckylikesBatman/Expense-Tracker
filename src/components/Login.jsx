  import "../styles/login.css";
  import bg from "../assets/images/background.png";
  import { useNavigate } from "react-router-dom";

  

  function Login() {
    const navigate = useNavigate();

    const handleLogin = () => {
      // later: validate with backend
      navigate("/home");
    };
    return (
      <div className="login-page" style={{ backgroundImage: `url(${bg})` }}>
        <h1 className="login-header">Expense Tracker</h1>
        <div className="login-container">
          <input className="login-inputs" placeholder="Username" />
          <input className="login-inputs" placeholder="Password" />
          <button onClick={handleLogin} className="button">Login</button>
        </div>
      </div>
    );
    
  }

  export default Login;
