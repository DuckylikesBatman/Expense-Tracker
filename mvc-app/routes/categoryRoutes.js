const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.use(protect);

// Static routes first (must come before /:id)
router.get('/', ctrl.index);
router.get('/new', authorize('admin', 'superadmin'), ctrl.newForm);
router.post('/', authorize('admin', 'superadmin'), ctrl.create);

// Dynamic routes after
router.get('/:id', ctrl.show);
router.get('/:id/edit', authorize('admin', 'superadmin'), ctrl.editForm);
router.put('/:id', authorize('admin', 'superadmin'), ctrl.update);
router.delete('/:id', authorize('admin', 'superadmin'), ctrl.destroy);

module.exports = router;
