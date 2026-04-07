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
          <h3>Welcome Back</h3>
          <h6>Please enter your credentials to log in</h6>
          <input className="login-inputs" placeholder="Username" />
          <input className="login-inputs" placeholder="Password" />
          <button onClick={handleLogin} className="buttons">Login</button>
          <h4> Don't have an account?<a className="sign-up" href="sign-up.html"> Sign Up</a> </h4>
        </div>
    );
    
  }

  export default Login;
