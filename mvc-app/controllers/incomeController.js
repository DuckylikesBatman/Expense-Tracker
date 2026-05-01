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
      error: null,
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

exports.destroy = async (req, res) => {
  try {
    await IncomeEntry.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  } catch (_) {}
  res.redirect('/income');
};
