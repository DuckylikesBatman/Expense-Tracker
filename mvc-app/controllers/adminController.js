const User = require('../models/User');
const Expense = require('../models/Expense');
const Category = require('../models/Category');
const Budget = require('../models/Budget');

// GET /admin/dashboard
exports.dashboard = async (req, res) => {
  try {
    const [userCount, expenseCount, categoryCount, budgetCount] = await Promise.all([
      User.countDocuments(),
      Expense.countDocuments(),
      Category.countDocuments(),
      Budget.countDocuments()
    ]);
    const recentExpenses = await Expense.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .limit(5);
    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      user: req.user,
      userCount, expenseCount, categoryCount, budgetCount,
      recentExpenses
    });
  } catch (err) {
    res.redirect('/expenses');
  }
};

// GET /admin/users
exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.render('admin/users', { title: 'Manage Users', users, user: req.user, error: null, success: null });
  } catch (err) {
    res.render('admin/users', { title: 'Manage Users', users: [], user: req.user, error: err.message, success: null });
  }
};

// GET /admin/users/:id/edit
exports.editUserForm = async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.redirect('/admin/users');

    // Admins cannot edit other admins or superadmins
    if (req.user.role === 'admin' && target.role !== 'user') {
      return res.status(403).render('403', { title: '403 – Forbidden', user: req.user });
    }

    res.render('admin/editUser', { title: 'Edit User', target, user: req.user, error: null });
  } catch (err) {
    res.redirect('/admin/users');
  }
};

// PUT /admin/users/:id
exports.updateUser = async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.redirect('/admin/users');

    // Admins cannot edit admins or superadmins
    if (req.user.role === 'admin' && target.role !== 'user') {
      return res.status(403).render('403', { title: '403 – Forbidden', user: req.user });
    }

    const updates = { name: req.body.name.trim() };

    if (req.user.role === 'superadmin') {
      // Superadmin can change roles, but cannot demote another superadmin
      if (target.role === 'superadmin' && target._id.toString() !== req.user._id.toString()) {
        return res.status(403).render('403', { title: '403 – Forbidden', user: req.user });
      }
      // Superadmin cannot change their own role
      if (target._id.toString() !== req.user._id.toString()) {
        updates.role = req.body.role;
      }
    }

    await User.findByIdAndUpdate(req.params.id, updates, { runValidators: true });
    res.redirect('/admin/users');
  } catch (err) {
    const target = await User.findById(req.params.id);
    res.render('admin/editUser', { title: 'Edit User', target, user: req.user, error: err.message });
  }
};

// DELETE /admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.redirect('/admin/users');
    }

    const target = await User.findById(req.params.id);
    if (!target) return res.redirect('/admin/users');

    // Nobody can delete a superadmin
    if (target.role === 'superadmin') {
      return res.redirect('/admin/users');
    }

    // Admins can only delete regular users
    if (req.user.role === 'admin' && target.role !== 'user') {
      return res.redirect('/admin/users');
    }

    await User.findByIdAndDelete(req.params.id);
    res.redirect('/admin/users');
  } catch (err) {
    res.redirect('/admin/users');
  }
};
