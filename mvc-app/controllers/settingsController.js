const User = require('../models/User');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

// Helper: fetch account stats to display on the settings page (expense count, budget count, total spent)
// Uses MongoDB aggregation pipeline to compute the total spent in a single DB query
const getStats = async (userId) => {
  const expenseCount = await Expense.countDocuments({ user: userId });
  const budgetCount = await Budget.countDocuments({ user: userId });
  // $match filters by user; $group with $sum calculates total across all matched documents
  const agg = await Expense.aggregate([
    { $match: { user: userId } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);
  return { expenseCount, budgetCount, totalSpent: agg.length ? agg[0].total : 0 };
};

// Shared render helper to avoid repeating the same res.render call in every action
const render = (res, user, stats, error = null, success = null) => {
  res.render('settings/index', { title: 'Settings', user, stats, error, success });
};

// GET /settings — show settings page with account stats
exports.getSettings = async (req, res) => {
  try {
    const stats = await getStats(req.user._id);
    render(res, req.user, stats);
  } catch (err) {
    render(res, req.user, null);
  }
};

// POST /settings — update the user's fixed monthly income amount
exports.updateSettings = async (req, res) => {
  try {
    const income = parseFloat(req.body.monthlyIncome) || 0;
    if (income < 0) {
      const stats = await getStats(req.user._id);
      return render(res, req.user, stats, 'Income cannot be negative.');
    }
    // { new: true } returns the updated document instead of the old one
    const updated = await User.findByIdAndUpdate(req.user._id, { monthlyIncome: income }, { new: true });
    const stats = await getStats(req.user._id);
    render(res, updated, stats, null, 'Monthly income saved!');
  } catch (err) {
    const stats = await getStats(req.user._id);
    render(res, req.user, stats, 'Could not save settings.');
  }
};

// POST /settings/profile — update the user's display name
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

// POST /settings/password — change password; requires current password to be correct first
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
    // Must fetch the full user document here to access comparePassword — req.user has no password field
    const user = await User.findById(req.user._id);
    const match = await user.comparePassword(currentPassword);
    if (!match) {
      return render(res, req.user, stats, 'Current password is incorrect.');
    }
    // Assigning and calling .save() triggers the pre-save hook to hash the new password
    user.password = newPassword;
    await user.save();
    render(res, user, stats, null, 'Password changed successfully!');
  } catch (err) {
    render(res, req.user, stats, 'Could not change password.');
  }
};
