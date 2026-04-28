const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getSettings);
router.post('/', updateSettings);

module.exports = router;
