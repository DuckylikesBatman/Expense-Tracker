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
router.post('/guest', loginAsGuest);

module.exports = router;
