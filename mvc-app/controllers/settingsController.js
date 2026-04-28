const User = require('../models/User');

// GET /settings
exports.getSettings = (req, res) => {
  res.render('settings/index', { title: 'Settings', user: req.user, error: null, success: null });
};

// POST /settings
exports.updateSettings = async (req, res) => {
  try {
    const income = parseFloat(req.body.monthlyIncome) || 0;
    if (income < 0) {
      return res.render('settings/index', { title: 'Settings', user: req.user, error: 'Income cannot be negative.', success: null });
    }
    const updated = await User.findByIdAndUpdate(req.user._id, { monthlyIncome: income }, { new: true });
    res.render('settings/index', { title: 'Settings', user: updated, error: null, success: 'Settings saved!' });
  } catch (err) {
    res.render('settings/index', { title: 'Settings', user: req.user, error: 'Could not save settings.', success: null });
  }
};
