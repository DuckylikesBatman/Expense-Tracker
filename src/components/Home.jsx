import "../styles/Home.css"
import "../styles/app.css"
import { useNavigate } from "react-router-dom"

function Home() {
    const navigate = useNavigate();

    return (
        <div className="home-page">
            <button className="back-arrow" onClick={() => navigate("/")}>&#8592;</button>
            <nav className="Nav-bar">
                <button className="nav-buttons">Home</button>
                <button className="nav-buttons">Expenses</button>
                <button className="nav-buttons">About</button>
            </nav>
            <div className="form-expense">
                <h1 className="Titles">Expenses</h1>
                <input type="text" className="input-expenses" placeholder="Add Expense"></input>
                <input type="number" className="input-expenses" placeholder="Add Amount"></input>
            </div>
    </div>
    )
  }
  
  export default Home;