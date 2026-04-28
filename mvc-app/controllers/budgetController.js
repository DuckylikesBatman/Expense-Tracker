const Budget = require('../models/Budget');
const Category = require('../models/Category');
const Expense = require('../models/Expense');

// GET /budgets
exports.index = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
    const budgets = await Budget.find(filter)
      .populate('user', 'name email')
      .populate('category', 'name color')
      .sort({ createdAt: -1 });
    res.render('budgets/index', { title: 'Budgets', budgets, user: req.user });
  } catch (err) {
    res.render('budgets/index', { title: 'Budgets', budgets: [], user: req.user, error: err.message });
  }
};

// GET /budgets/new
exports.newForm = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.render('budgets/new', { title: 'New Budget', categories, user: req.user, error: null });
  } catch (err) {
    res.redirect('/budgets');
  }
};

// POST /budgets
exports.create = async (req, res) => {
  try {
    const { name, amount, period, startDate, endDate, category } = req.body;
    await Budget.create({
      name: name.trim(),
      amount: parseFloat(amount),
      period,
      startDate,
      endDate,
      user: req.user._id,
      category
    });
    res.redirect('/budgets');
  } catch (err) {
    const categories = await Category.find().sort({ name: 1 });
    res.render('budgets/new', { title: 'New Budget', categories, user: req.user, error: err.message });
  }
};

// GET /budgets/:id
exports.show = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id)
      .populate('user', 'name email')
      .populate('category', 'name color');
    if (!budget) return res.redirect('/budgets');
    if (req.user.role !== 'admin' && budget.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).render('403', { title: 'Forbidden', user: req.user });
    }
    // Compute total spent for this budget's category within the date range
    const spent = await Expense.aggregate([
      {
        $match: {
          user: budget.user._id,
          categories: budget.category._id,
          date: { $gte: budget.startDate, $lte: budget.endDate }
        }
      },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const spentAmount = spent.length ? spent[0].total : 0;
    const remaining = budget.amount - spentAmount;
    const percentage = Math.min(Math.round((spentAmount / budget.amount) * 100), 100);
    res.render('budgets/show', {
      title: budget.name, budget, spentAmount, remaining, percentage, user: req.user
    });
  } catch (err) {
    res.redirect('/budgets');
  }
};

// GET /budgets/:id/edit
exports.editForm = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) return res.redirect('/budgets');
    if (req.user.role !== 'admin' && budget.user.toString() !== req.user._id.toString()) {
      return res.status(403).render('403', { title: 'Forbidden', user: req.user });
    }
    const categories = await Category.find().sort({ name: 1 });
    res.render('budgets/edit', { title: 'Edit Budget', budget, categories, user: req.user, error: null });
  } catch (err) {
    res.redirect('/budgets');
  }
};

// PUT /budgets/:id
exports.update = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) return res.redirect('/budgets');
    if (req.user.role !== 'admin' && budget.user.toString() !== req.user._id.toString()) {
      return res.status(403).render('403', { title: 'Forbidden', user: req.user });
    }
    const { name, amount, period, startDate, endDate, category } = req.body;
    budget.name = name.trim();
    budget.amount = parseFloat(amount);
    budget.period = period;
    budget.startDate = startDate;
    budget.endDate = endDate;
    budget.category = category;
    await budget.save();
    res.redirect(`/budgets/${budget._id}`);
  } catch (err) {
    const budget = await Budget.findById(req.params.id);
    const categories = await Category.find().sort({ name: 1 });
    res.render('budgets/edit', { title: 'Edit Budget', budget, categories, user: req.user, error: err.message });
  }
};

// DELETE /budgets/:id
exports.destroy = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) return res.redirect('/budgets');
    if (req.user.role !== 'admin' && budget.user.toString() !== req.user._id.toString()) {
      return res.status(403).render('403', { title: 'Forbidden', user: req.user });
    }
    await Budget.findByIdAndDelete(req.params.id);
    res.redirect('/budgets');
  } catch (err) {
    res.redirect('/budgets');
  }
};
