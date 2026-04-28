const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const authorize = require('../middleware/authorize');

router.use(protect);
router.use(authorize('admin'));

router.get('/', ctrl.dashboard);
router.get('/users', ctrl.listUsers);
router.get('/users/:id/edit', ctrl.editUserForm);
router.put('/users/:id', ctrl.updateUser);
router.delete('/users/:id', ctrl.deleteUser);

module.exports = router;
