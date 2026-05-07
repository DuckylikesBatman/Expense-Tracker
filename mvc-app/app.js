// App configuration: sets up Express, middleware, and all routes (no DB logic here)
const express = require('express');
const cookieParser = require('cookie-parser');
const methodOverride = require('method-override');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const adminRoutes = require('./routes/adminRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const incomeRoutes = require('./routes/incomeRoutes');
const { loadUser } = require('./middleware/auth');

const app = express();

// Use EJS as the templating engine; views are in the /views folder
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Parse form submissions and JSON request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Read cookies (needed to extract the JWT token on every request)
app.use(cookieParser());
// HTML forms only support GET/POST; this lets forms send PUT/DELETE via ?_method=PUT
app.use(methodOverride('_method'));
// Serve static files (CSS, JS) from the /public folder
app.use(express.static(path.join(__dirname, 'public')));
// Decode JWT on every request so res.locals.user is available in all EJS templates
app.use(loadUser);

// Route prefixes — each file handles its own sub-routes
app.use('/auth', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/expenses', expenseRoutes);
app.use('/categories', categoryRoutes);
app.use('/budgets', budgetRoutes);
app.use('/admin', adminRoutes);
app.use('/settings', settingsRoutes);
app.use('/income', incomeRoutes);

// Root redirect: send logged-in users to dashboard, guests to login
app.get('/', (req, res) => res.redirect(res.locals.user ? '/dashboard' : '/auth/login'));

// Catch-all 404 handler — runs when no route above matched
app.use((req, res) => {
  res.status(404).render('404', { title: '404 – Page Not Found' });
});

module.exports = app;
