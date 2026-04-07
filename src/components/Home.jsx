import "../styles/Home.css"
import "../styles/app.css"
import { useNavigate } from "react-router-dom"

function Home() {
    const navigate = useNavigate();

    return (
        <div className="home-page">
            <button className="back-arrow" onClick={() => navigate("/")}>&#8592;</button>
            <nav className="Nav-bar">
                <button className="buttons">Home</button>
                <button className="buttons">Expenses</button>
                <button className="buttons">About</button>
            </nav>
            <div className="Total-Expenses">
                <h1>Total Spent</h1>

            </div>
            <div className="form-expense">
                <h1 className="Titles">Expenses</h1>
                <input type="text" className="input-expenses" placeholder="Add Expense"></input>
                <input type="number" className="input-expenses" placeholder="Add Amount"></input>
                <div className="category-grid">
                    <button className="buttons expense">Food</button>
                    <button className="buttons expense">Travel</button>
                    <button className="buttons expense">Utilities</button>
                    <button className="buttons expense">Shopping</button>
                    <button className="buttons expense">Other</button>
                </div>
            </div>
    </div>
    )
  }
  
  export default Home;