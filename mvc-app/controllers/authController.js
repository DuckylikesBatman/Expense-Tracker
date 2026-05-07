const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Creates a signed JWT containing the user's ID; expires in 1 day by default
function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
}

// Attaches the JWT as an httpOnly cookie (JS cannot read it = XSS protection)
// secure: true in production means HTTPS only; sameSite: strict prevents CSRF attacks
function sendTokenCookie(res, token) {
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 1 * 60 * 60 * 1000 // 1 hour in milliseconds
  });
}

// GET /auth/login — show login page (redirect to dashboard if already logged in)
exports.getLogin = (req, res) => {
  if (res.locals.user) return res.redirect('/dashboard');
  res.render('auth/login', { title: 'Login', error: null });
};

// POST /auth/login — verify credentials, issue token, redirect to dashboard
exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.render('auth/login', { title: 'Login', error: 'Please fill in all fields.' });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    // comparePassword uses bcrypt.compare internally — same error message for both cases to prevent user enumeration
    if (!user || !(await user.comparePassword(password))) {
      return res.render('auth/login', { title: 'Login', error: 'Invalid email or password.' });
    }
    const token = signToken(user._id);
    sendTokenCookie(res, token);
    res.redirect('/dashboard');
  } catch (err) {
    res.render('auth/login', { title: 'Login', error: 'Something went wrong. Please try again.' });
  }
};

// GET /auth/register — show registration form
exports.getRegister = (req, res) => {
  if (res.locals.user) return res.redirect('/dashboard');
  res.render('auth/register', { title: 'Register', error: null });
};

// POST /auth/register — validate input, create user, auto-login with token
exports.postRegister = async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;
  try {
    if (!name || !email || !password || !confirmPassword) {
      return res.render('auth/register', { title: 'Register', error: 'Please fill in all fields.' });
    }
    if (password !== confirmPassword) {
      return res.render('auth/register', { title: 'Register', error: 'Passwords do not match.' });
    }
    if (password.length < 6) {
      return res.render('auth/register', { title: 'Register', error: 'Password must be at least 6 characters.' });
    }
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.render('auth/register', { title: 'Register', error: 'Email is already registered.' });
    }
    // User.create() triggers the pre-save hook which hashes the password before storing
    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password });
    const token = signToken(user._id);
    sendTokenCookie(res, token);
    res.redirect('/expenses');
  } catch (err) {
    // err.code 11000 = MongoDB duplicate key error (email unique constraint violated)
    const msg = err.code === 11000 ? 'Email is already registered.' : 'Registration failed. Please try again.';
    res.render('auth/register', { title: 'Register', error: msg });
  }
};

// GET /auth/logout — clear the cookie to end the session
exports.logout = (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/auth/login');
};

// POST /auth/guest — log in as a shared guest account for demos
// Creates the guest account if it doesn't exist yet
exports.loginAsGuest = async (req, res) => {
  try {
    let guest = await User.findOne({ email: 'guest@expensetracker.com' });
    if (!guest) {
      guest = await User.create({
        name: 'Guest',
        email: 'guest@expensetracker.com',
        password: process.env.GUEST_PASSWORD || 'guest1234',
        role: 'user'
      });
    }
    const token = signToken(guest._id);
    sendTokenCookie(res, token);
    res.redirect('/dashboard');
  } catch (err) {
    res.render('auth/login', { title: 'Login', error: 'Could not log in as guest.' });
  }
};
