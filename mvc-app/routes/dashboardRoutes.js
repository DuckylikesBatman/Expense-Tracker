const express = require('express');
const router = express.Router();
const { index } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.get('/', protect, index);

module.exports = router;
