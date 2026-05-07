// Admin routes: double-guarded — must be logged in (protect) AND have admin/superadmin role (authorize)
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.use(protect);                          // step 1: must be authenticated
router.use(authorize('admin', 'superadmin')); // step 2: must have elevated role

router.get('/', ctrl.dashboard);
router.get('/users', ctrl.listUsers);
router.get('/users/:id/edit', ctrl.editUserForm);
router.put('/users/:id', ctrl.updateUser);
router.delete('/users/:id', ctrl.deleteUser);

module.exports = router;
