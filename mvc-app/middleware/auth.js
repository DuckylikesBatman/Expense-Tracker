const jwt = require('jsonwebtoken');
const User = require('../models/User');

// protect — guards private routes; redirects to login if no valid JWT is found
async function protect(req, res, next) {
  const token = req.cookies.jwt;
  // No token = not logged in
  if (!token) return res.redirect('/auth/login');

  try {
    // Verify the token signature and decode the payload (contains user id)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Fetch fresh user data from DB; -password ensures the hash is never sent anywhere
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.redirect('/auth/login');
    // Also set on res.locals so EJS templates can access it without controllers passing it
    res.locals.user = req.user;
    next();
  } catch {
    // Token is expired or tampered — clear it and force re-login
    res.clearCookie('jwt');
    res.redirect('/auth/login');
  }
}

// loadUser — runs on every request globally; non-blocking version of protect for public pages
// Allows the navbar to show the user's name even on pages that don't require login
async function loadUser(req, res, next) {
  const token = req.cookies.jwt;
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      res.locals.user = await User.findById(decoded.id).select('-password');
    } catch {
      // Invalid token — treat as logged out, but don't redirect
      res.locals.user = null;
    }
  } else {
    res.locals.user = null;
  }
  next();
}

module.exports = { protect, loadUser };
