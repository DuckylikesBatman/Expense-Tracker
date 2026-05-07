const IncomeEntry = require('../models/IncomeEntry');

// Defined here so it's passed to views for rendering the source dropdown
const SOURCES = ['salary', 'freelance', 'side-job', 'bonus', 'investment', 'gift', 'winnings', 'other'];

// GET /income — show all income entries and calculate this month's totals
exports.index = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Run both queries in parallel: all-time list + this month's entries for the summary
    const [allEntries, monthEntries] = await Promise.all([
      IncomeEntry.find({ user: userId }).sort({ date: -1 }),
      IncomeEntry.find({ user: userId, date: { $gte: startOfMonth } })
    ]);

    const extraThisMonth = monthEntries.reduce((s, e) => s + e.amount, 0);
    // Total = fixed monthly income (from User model) + any extra entries logged this month
    const totalThisMonth = (req.user.monthlyIncome || 0) + extraThisMonth;

    res.render('income/index', {
      title: 'Extra Income',
      user: req.user,
      entries: allEntries,
      extraThisMonth,
      totalThisMonth,
      sources: SOURCES,
      error: req.query.error || null,
      success: null
    });
  } catch (err) {
    res.render('income/index', {
      title: 'Extra Income',
      user: req.user,
      entries: [],
      extraThisMonth: 0,
      totalThisMonth: req.user.monthlyIncome || 0,
      sources: SOURCES,
      error: err.message,
      success: null
    });
  }
};

// POST /income — create a new income entry for the logged-in user
exports.create = async (req, res) => {
  try {
    const amount = parseFloat(req.body.amount);
    if (isNaN(amount) || amount <= 0) throw new Error('Amount must be greater than 0');

    await IncomeEntry.create({
      user: req.user._id,
      amount,
      // Whitelist check: reject unknown source values rather than storing arbitrary input
      source: SOURCES.includes(req.body.source) ? req.body.source : 'other',
      description: req.body.description ? req.body.description.trim() : '',
      date: req.body.date ? new Date(req.body.date) : new Date()
    });

    res.redirect('/income');
  } catch (err) {
    res.redirect('/income?error=' + encodeURIComponent(err.message));
  }
};

// GET /income/:id/edit — users can only edit their own entries (findOne with user filter)
exports.editForm = async (req, res) => {
  try {
    // The user: userId condition in the query prevents accessing other users' entries
    const entry = await IncomeEntry.findOne({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.redirect('/income');
    res.render('income/edit', { title: 'Edit Income Entry', user: req.user, entry, sources: SOURCES, error: null });
  } catch (err) {
    res.redirect('/income');
  }
};

// PUT /income/:id — update entry; ownership enforced at query level
exports.update = async (req, res) => {
  try {
    const entry = await IncomeEntry.findOne({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.redirect('/income');
    const amount = parseFloat(req.body.amount);
    if (isNaN(amount) || amount <= 0) throw new Error('Amount must be greater than 0');
    entry.amount = amount;
    entry.source = SOURCES.includes(req.body.source) ? req.body.source : 'other';
    entry.description = req.body.description ? req.body.description.trim() : '';
    entry.date = req.body.date ? new Date(req.body.date) : entry.date;
    await entry.save();
    res.redirect('/income');
  } catch (err) {
    const entry = await IncomeEntry.findOne({ _id: req.params.id, user: req.user._id });
    res.render('income/edit', { title: 'Edit Income Entry', user: req.user, entry, sources: SOURCES, error: err.message });
  }
};

// DELETE /income/:id — findOneAndDelete with user filter ensures you can only delete your own
exports.destroy = async (req, res) => {
  try {
    await IncomeEntry.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.redirect('/income');
  } catch (err) {
    res.redirect('/income?error=' + encodeURIComponent('Could not delete entry.'));
  }
};
