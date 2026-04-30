const User = require('../models/User');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

const getStats = async (userId) => {
  const expenseCount = await Expense.countDocuments({ user: userId });
  const budgetCount = await Budget.countDocuments({ user: userId });
  const agg = await Expense.aggregate([
    { $match: { user: userId } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  return { expenseCount, budgetCount, totalSpent: agg.length ? agg[0].total : 0 };
};

const render = (res, user, stats, error = null, success = null) => {
  res.render('settings/index', { title: 'Settings', user, stats, error, success });
};

// GET /settings
exports.getSettings = async (req, res) => {
  try {
    const stats = await getStats(req.user._id);
    render(res, req.user, stats);
  } catch (err) {
    render(res, req.user, null);
  }
};

// POST /settings — update monthly income
exports.updateSettings = async (req, res) => {
  try {
    const income = parseFloat(req.body.monthlyIncome) || 0;
    if (income < 0) {
      const stats = await getStats(req.user._id);
      return render(res, req.user, stats, 'Income cannot be negative.');
    }
    const updated = await User.findByIdAndUpdate(req.user._id, { monthlyIncome: income }, { new: true });
    const stats = await getStats(req.user._id);
    render(res, updated, stats, null, 'Monthly income saved!');
  } catch (err) {
    const stats = await getStats(req.user._id);
    render(res, req.user, stats, 'Could not save settings.');
  }
};

// POST /settings/profile — update display name
exports.updateProfile = async (req, res) => {
  try {
    const name = (req.body.name || '').trim();
    if (name.length < 2) {
      const stats = await getStats(req.user._id);
      return render(res, req.user, stats, 'Name must be at least 2 characters.');
    }
    const updated = await User.findByIdAndUpdate(req.user._id, { name }, { new: true, runValidators: true });
    const stats = await getStats(req.user._id);
    render(res, updated, stats, null, 'Display name updated!');
  } catch (err) {
    const stats = await getStats(req.user._id);
    render(res, req.user, stats, 'Could not update name.');
  }
};

// POST /settings/password — change password
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const stats = await getStats(req.user._id).catch(() => null);
  if (!currentPassword || !newPassword || !confirmPassword) {
    return render(res, req.user, stats, 'All password fields are required.');
  }
  if (newPassword.length < 6) {
    return render(res, req.user, stats, 'New password must be at least 6 characters.');
  }
  if (newPassword !== confirmPassword) {
    return render(res, req.user, stats, 'New passwords do not match.');
  }
  try {
    const user = await User.findById(req.user._id);
    const match = await user.comparePassword(currentPassword);
    if (!match) {
      return render(res, req.user, stats, 'Current password is incorrect.');
    }
    user.password = newPassword;
    await user.save();
    render(res, user, stats, null, 'Password changed successfully!');
  } catch (err) {
    render(res, req.user, stats, 'Could not change password.');
  }
};
