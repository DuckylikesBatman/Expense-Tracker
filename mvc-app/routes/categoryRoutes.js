// Category routes: everyone can view (GET /), but only admins can create/edit/delete
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.use(protect); // all category routes require login

// Static routes must be registered before /:id — otherwise "new" would be treated as an ID
router.get('/', ctrl.index);
router.get('/new', authorize('admin', 'superadmin'), ctrl.newForm);
router.post('/', authorize('admin', 'superadmin'), ctrl.create);

// Dynamic /:id routes — read is public to all users, mutations are admin-only
router.get('/:id', ctrl.show);
router.get('/:id/edit', authorize('admin', 'superadmin'), ctrl.editForm);
router.put('/:id', authorize('admin', 'superadmin'), ctrl.update);
router.delete('/:id', authorize('admin', 'superadmin'), ctrl.destroy);

module.exports = router;
