const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, updateProfile, changePassword } = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getSettings);
router.post('/', updateSettings);
router.post('/profile', updateProfile);
router.post('/password', changePassword);

module.exports = router;
