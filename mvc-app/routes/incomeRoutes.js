const express = require('express');
const router = express.Router();
const { index, create, destroy } = require('../controllers/incomeController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', index);
router.post('/', create);
router.delete('/:id', destroy);

module.exports = router;
