// All expense routes require a valid JWT (protect middleware applied to the whole router)
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

router.use(protect); // all routes below this require login

// /export must come before /:id so Express doesn't treat "export" as an ID
router.get('/export', ctrl.exportCSV);
router.get('/', ctrl.index);
router.get('/new', ctrl.newForm);
router.post('/', ctrl.create);
router.get('/:id', ctrl.show);
router.get('/:id/edit', ctrl.editForm);
router.put('/:id', ctrl.update);       // sent as POST with ?_method=PUT via method-override
router.delete('/:id', ctrl.destroy);   // sent as POST with ?_method=DELETE via method-override

module.exports = router;
