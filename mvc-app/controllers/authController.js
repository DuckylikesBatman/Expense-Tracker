const jwt = require('jsonwebtoken');
const User = require('../models/User');

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}

function sendTokenCookie(res, token) {
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
}

// GET /auth/login
exports.getLogin = (req, res) => {
  if (res.locals.user) return res.redirect('/expenses');
  res.render('auth/login', { title: 'Login', error: null });
};

// POST /auth/login
exports.postLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      return res.render('auth/login', { title: 'Login', error: 'Please fill in all fields.' });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user || !(await user.comparePassword(password))) {
      return res.render('auth/login', { title: 'Login', error: 'Invalid email or password.' });
    }
    const token = signToken(user._id);
    sendTokenCookie(res, token);
    res.redirect('/expenses');
  } catch (err) {
    res.render('auth/login', { title: 'Login', error: 'Something went wrong. Please try again.' });
  }
};

// GET /auth/register
exports.getRegister = (req, res) => {
  if (res.locals.user) return res.redirect('/expenses');
  res.render('auth/register', { title: 'Register', error: null });
};

// POST /auth/register
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
    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password });
    const token = signToken(user._id);
    sendTokenCookie(res, token);
    res.redirect('/expenses');
  } catch (err) {
    const msg = err.code === 11000 ? 'Email is already registered.' : 'Registration failed. Please try again.';
    res.render('auth/register', { title: 'Register', error: msg });
  }
};

// GET /auth/logout
exports.logout = (req, res) => {
  res.clearCookie('jwt');
  res.redirect('/auth/login');
};

// POST /auth/guest
exports.loginAsGuest = async (req, res) => {
  try {
    let guest = await User.findOne({ email: 'guest@expensetracker.com' });
    if (!guest) {
      guest = await User.create({
        name: 'Guest',
        email: 'guest@expensetracker.com',
        password: 'guest1234',
        role: 'user'
      });
    }
    const token = signToken(guest._id);
    sendTokenCookie(res, token);
    res.redirect('/expenses');
  } catch (err) {
    res.render('auth/login', { title: 'Login', error: 'Could not log in as guest.' });
  }
};
