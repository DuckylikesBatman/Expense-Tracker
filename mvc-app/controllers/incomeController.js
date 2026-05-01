const IncomeEntry = require('../models/IncomeEntry');

const SOURCES = ['salary', 'freelance', 'side-job', 'bonus', 'investment', 'gift', 'winnings', 'other'];

exports.index = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [allEntries, monthEntries] = await Promise.all([
      IncomeEntry.find({ user: userId }).sort({ date: -1 }),
      IncomeEntry.find({ user: userId, date: { $gte: startOfMonth } })
    ]);

    const extraThisMonth = monthEntries.reduce((s, e) => s + e.amount, 0);
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

exports.create = async (req, res) => {
  try {
    const amount = parseFloat(req.body.amount);
    if (!amount || amount <= 0) throw new Error('Amount must be greater than 0');

    await IncomeEntry.create({
      user: req.user._id,
      amount,
      source: SOURCES.includes(req.body.source) ? req.body.source : 'other',
      description: req.body.description ? req.body.description.trim() : '',
      date: req.body.date ? new Date(req.body.date) : new Date()
    });

    res.redirect('/income');
  } catch (err) {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [allEntries, monthEntries] = await Promise.all([
      IncomeEntry.find({ user: userId }).sort({ date: -1 }),
      IncomeEntry.find({ user: userId, date: { $gte: startOfMonth } })
    ]);
    const extraThisMonth = monthEntries.reduce((s, e) => s + e.amount, 0);

    res.render('income/index', {
      title: 'Extra Income',
      user: req.user,
      entries: allEntries,
      extraThisMonth,
      totalThisMonth: (req.user.monthlyIncome || 0) + extraThisMonth,
      sources: SOURCES,
      error: err.message,
      success: null
    });
  }
};

exports.editForm = async (req, res) => {
  try {
    const entry = await IncomeEntry.findOne({ _id: req.params.id, user: req.user._id });
    if (!entry) return res.redirect('/income');
    res.render('income/edit', { title: 'Edit Income Entry', user: req.user, entry, sources: SOURCES, error: null });
  } catch (err) {
    res.redirect('/income');
  }
};

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

exports.destroy = async (req, res) => {
  try {
    await IncomeEntry.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  } catch (err) {
    return res.redirect('/income?error=' + encodeURIComponent('Could not delete entry.'));
  }
  res.redirect('/income');
};
