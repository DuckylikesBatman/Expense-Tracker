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
    res.render('admin/editUser', { title: 'Edit User', target, user: req.user, error: null });
  } catch (err) {
    res.redirect('/admin/users');
  }
};

// PUT /admin/users/:id
exports.updateUser = async (req, res) => {
  try {
    const { name, role } = req.body;
    await User.findByIdAndUpdate(req.params.id, { name: name.trim(), role }, { runValidators: true });
    res.redirect('/admin/users');
  } catch (err) {
    const target = await User.findById(req.params.id);
    res.render('admin/editUser', { title: 'Edit User', target, user: req.user, error: err.message });
  }
};

// DELETE /admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    // Prevent deleting own account
    if (req.params.id === req.user._id.toString()) {
      return res.redirect('/admin/users');
    }
    await User.findByIdAndDelete(req.params.id);
    res.redirect('/admin/users');
  } catch (err) {
    res.redirect('/admin/users');
  }
};
