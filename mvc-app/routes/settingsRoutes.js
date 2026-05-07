// Settings routes: 3 separate POST actions (income, profile, password) share the same GET page
const express = require('express');
const router = express.Router();
const { getSettings, updateSettings, updateProfile, changePassword } = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getSettings);
router.post('/', updateSettings);          // updates monthlyIncome
router.post('/profile', updateProfile);    // updates display name
router.post('/password', changePassword);  // changes password (requires current password)

module.exports = router;
