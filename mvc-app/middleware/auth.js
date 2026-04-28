const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT from cookie and attach user to request
async function protect(req, res, next) {
  const token = req.cookies.jwt;
  if (!token) return res.redirect('/auth/login');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.redirect('/auth/login');
    res.locals.user = req.user;
    next();
  } catch {
    res.clearCookie('jwt');
    res.redirect('/auth/login');
  }
}

// Make user available in templates even on public routes
async function loadUser(req, res, next) {
  const token = req.cookies.jwt;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.locals.user = await User.findById(decoded.id).select('-password');
    } catch {
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }
  next();
}

module.exports = { protect, loadUser };
