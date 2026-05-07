const User = require('../models/User');
const Expense = require('../models/Expense');
const Category = require('../models/Category');
const Budget = require('../models/Budget');

// GET /admin/dashboard — site-wide stats visible only to admins and superadmins
exports.dashboard = async (req, res) => {
  try {
    // Run all 4 count queries in parallel to avoid sequential DB round-trips
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

// GET /admin/users — list all users with optional search by name/email and filter by role
exports.listUsers = async (req, res) => {
  try {
    const { search = '', role = '' } = req.query;
    const query = {};

    if (search.trim()) {
      // $or lets us search across both name and email in one query
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: regex }, { email: regex }];
    }

    // Whitelist check prevents injecting arbitrary role values into the DB query
    if (role && ['user', 'admin', 'superadmin'].includes(role)) {
      query.role = role;
    }

    const users = await User.find(query).sort({ createdAt: -1 });
    res.render('admin/users', {
      title: 'Manage Users', users, user: req.user,
      error: null, success: null,
      filters: { search, role }
    });
  } catch (err) {
    res.render('admin/users', {
      title: 'Manage Users', users: [], user: req.user,
      error: err.message, success: null,
      filters: { search: '', role: '' }
    });
  }
};

// GET /admin/users/:id/edit — show edit form; admins cannot edit other admins or superadmins
exports.editUserForm = async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.redirect('/admin/users');

    // Role hierarchy enforcement: regular admins can only manage regular users
    if (req.user.role === 'admin' && target.role !== 'user') {
      return res.status(403).render('403', { title: '403 – Forbidden', user: req.user });
    }

    res.render('admin/editUser', { title: 'Edit User', target, user: req.user, error: null });
  } catch (err) {
    res.redirect('/admin/users');
  }
};

// PUT /admin/users/:id — update name (and optionally role for superadmins)
exports.updateUser = async (req, res) => {
  try {
    const target = await User.findById(req.params.id);
    if (!target) return res.redirect('/admin/users');

    if (req.user.role === 'admin' && target.role !== 'user') {
      return res.status(403).render('403', { title: '403 – Forbidden', user: req.user });
    }

    const updates = { name: req.body.name.trim() };

    if (req.user.role === 'superadmin') {
      // Superadmin cannot demote another superadmin (only one top-level account)
      if (target.role === 'superadmin' && target._id.toString() !== req.user._id.toString()) {
        return res.status(403).render('403', { title: '403 – Forbidden', user: req.user });
      }
      // Superadmin cannot accidentally change their own role through the UI
      if (target._id.toString() !== req.user._id.toString()) {
        const allowedRoles = ['user', 'admin'];
        if (allowedRoles.includes(req.body.role)) {
          updates.role = req.body.role;
        }
      }
    }

    await User.findByIdAndUpdate(req.params.id, updates, { runValidators: true });
    res.redirect('/admin/users');
  } catch (err) {
    const target = await User.findById(req.params.id);
    res.render('admin/editUser', { title: 'Edit User', target, user: req.user, error: err.message });
  }
};

// DELETE /admin/users/:id — enforces role hierarchy: superadmins are undeletable
exports.deleteUser = async (req, res) => {
  try {
    // Prevent self-deletion
    if (req.params.id === req.user._id.toString()) {
      return res.redirect('/admin/users');
    }

    const target = await User.findById(req.params.id);
    if (!target) return res.redirect('/admin/users');

    // Superadmin accounts are protected — no one can delete them through the UI
    if (target.role === 'superadmin') {
      return res.redirect('/admin/users');
    }

    // Regular admins can only delete regular users, not other admins
    if (req.user.role === 'admin' && target.role !== 'user') {
      return res.redirect('/admin/users');
    }

    await User.findByIdAndDelete(req.params.id);
    res.redirect('/admin/users');
  } catch (err) {
    res.redirect('/admin/users');
  }
};
