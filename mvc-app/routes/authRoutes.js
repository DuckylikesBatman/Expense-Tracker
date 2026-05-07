// Public routes — no protect middleware needed; loadUser just populates res.locals.user if already logged in
const express = require('express');
const router = express.Router();
const { getLogin, postLogin, getRegister, postRegister, logout, loginAsGuest } = require('../controllers/authController');
const { loadUser } = require('../middleware/auth');

router.use(loadUser);

router.get('/login', getLogin);
router.post('/login', postLogin);
router.get('/register', getRegister);
router.post('/register', postRegister);
router.get('/logout', logout);
router.post('/guest', loginAsGuest); // creates guest account if it doesn't exist, then logs in

module.exports = router;
