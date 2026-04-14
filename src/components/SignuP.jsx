import "../styles/app.css"
import "../styles/signup.css"
import "../styles/login.css"


function Signup(){
    return (
    <div>
        <h1> Please sign up to continue</h1>
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
    </div>

    )
}

export default Signup;