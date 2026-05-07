// Income entry routes — no separate show page; editing happens inline from the list view
const express = require('express');
const router = express.Router();
const { index, create, editForm, update, destroy } = require('../controllers/incomeController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', index);
router.post('/', create);
router.get('/:id/edit', editForm);
router.put('/:id', update);
router.delete('/:id', destroy);

module.exports = router;
