// Public routes — no protect middleware needed; loadUser just populates res.locals.user if already logged in
const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { getLogin, postLogin, getRegister, postRegister, logout, loginAsGuest } = require('../controllers/authController');
const { loadUser } = require('../middleware/auth');

// Max 10 login attempts per IP per 15 minutes — prevents brute force password guessing
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  handler: (req, res) => {
    res.render('auth/login', {
      title: 'Login',
      error: 'Too many login attempts. Please try again in 15 minutes.'
    });
  }
});

// Max 5 register attempts per IP per hour — prevents flooding the DB with fake accounts
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  handler: (req, res) => {
    res.render('auth/register', {
      title: 'Register',
      error: 'Too many registration attempts. Please try again in 1 hour.'
    });
  }
});

router.use(loadUser);

router.get('/login', getLogin);
router.post('/login', loginLimiter, postLogin);
router.get('/register', getRegister);
router.post('/register', registerLimiter, postRegister);
router.get('/logout', logout);
router.post('/guest', loginAsGuest); // creates guest account if it doesn't exist, then logs in

module.exports = router;
