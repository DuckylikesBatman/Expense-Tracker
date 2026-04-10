import "../styles/Home.css"
import "../styles/app.css"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

const CATEGORIES = ["Food", "Transport", "Health", "Fun", "Other"]

function Home() {
    const navigate = useNavigate()
    const [expenses, setExpenses] = useState([])
    const [name, setName] = useState("")
    const [amount, setAmount] = useState("")
    const [category, setCategory] = useState("Food")

    const total = expenses.reduce((sum, e) => sum + e.amount, 0)

    const handleAdd = () => {
        const parsed = parseFloat(amount)
        if (!name.trim() || isNaN(parsed) || parsed <= 0) return
        setExpenses([...expenses, { id: Date.now(), name: name.trim(), amount: parsed, category }])
        setName("")
        setAmount("")
        setCategory("Food")
    }

    const handleDelete = (id) => {
        setExpenses(expenses.filter(e => e.id !== id))
    }

    return (
        <div className="home-page">
            <button className="back-arrow" onClick={() => navigate("/")}>&#8592;</button>

            <nav className="Nav-bar">
                <button className="buttons nav-active">Home</button>
                <button className="buttons">Expenses</button>
                <button className="buttons">About</button>
            </nav>

            {/* Total Summary Card */}
            <div className="summary-card">
                <div>
                    <div className="summary-label">Total Spent</div>
                    <div className="summary-amount">${total.toFixed(2)}</div>
                </div>
                <div className="summary-right">
                    <div className="summary-label">This Month</div>
                    <div className="summary-month">
                        {new Date().toLocaleString("default", { month: "long", year: "numeric" })}
                    </div>
                </div>
            </div>

            {/* Add Expense Form */}
            <div className="form-expense">
                <h1 className="Titles">Add Expense</h1>
                <input
                    type="text"
                    className="input-expenses"
                    placeholder="Expense name (e.g. Coffee)"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />
                <input
                    type="number"
                    className="input-expenses"
                    placeholder="Amount ($)"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                />
                <div className="category-grid">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            className={`buttons expense${category === cat ? " active-cat" : ""}`}
                            onClick={() => setCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                <button className="buttons add-btn" onClick={handleAdd}>+ Add</button>
            </div>

            {/* Expense List */}
            <div className="expense-list">
                <h4 className="list-header">Recent Expenses</h4>
                {expenses.length === 0 && (
                    <p className="empty-msg">No expenses yet. Add one above!</p>
                )}
                {expenses.map(e => (
                    <div key={e.id} className="expense-item">
                        <div className="expense-left">
                            <span className="expense-name">{e.name}</span>
                            <span className="expense-cat">{e.category}</span>
                        </div>
                        <div className="expense-right">
                            <span className="expense-price">-${e.amount.toFixed(2)}</span>
                            <button className="del-btn" onClick={() => handleDelete(e.id)}>✕</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Home
