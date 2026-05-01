const Budget = require('../models/Budget');
const Category = require('../models/Category');
const Expense = require('../models/Expense');

const isAdmin = (user) => ['admin', 'superadmin'].includes(user.role);
const endOfDay = (d) => { const dt = new Date(d); dt.setHours(23, 59, 59, 999); return dt; };

const getSpent = async (userId, categoryId, startDate, endDate) => {
  const expenses = await Expense.find({
    user: userId,
    categories: categoryId,
    date: { $gte: new Date(startDate), $lte: endOfDay(endDate) }
  });
  return expenses.reduce((sum, e) => sum + e.amount, 0);
};

// GET /budgets
exports.index = async (req, res) => {
  try {
    const filter = isAdmin(req.user) ? {} : { user: req.user._id };
    const budgets = await Budget.find(filter)
      .populate('user', 'name email')
      .populate('category', 'name color')
      .sort({ createdAt: -1 });

    const budgetsWithSpending = await Promise.all(
      budgets.map(async (b) => {
        if (!b.category) return { budget: b, spentAmount: 0, percentage: 0, isOverBudget: false, remaining: b.amount };
        const spentAmount = await getSpent(b.user._id, b.category._id, b.startDate, b.endDate);
        const percentage = Math.min(Math.round((spentAmount / b.amount) * 100), 100);
        return { budget: b, spentAmount, percentage, isOverBudget: spentAmount > b.amount, remaining: b.amount - spentAmount };
      })
    );

    res.render('budgets/index', { title: 'Budgets', budgetsWithSpending, user: req.user });
  } catch (err) {
    res.render('budgets/index', { title: 'Budgets', budgetsWithSpending: [], user: req.user, error: err.message });
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
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 1) throw new Error('Amount must be at least 1.');
    if (new Date(endDate) <= new Date(startDate)) throw new Error('End date must be after start date.');
    await Budget.create({
      name: name.trim(),
      amount: parsedAmount,
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
    if (!isAdmin(req.user) && budget.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).render('403', { title: 'Forbidden', user: req.user });
    }
    const spentAmount = budget.category
      ? await getSpent(budget.user._id, budget.category._id, budget.startDate, budget.endDate)
      : 0;
    const remaining = budget.amount - spentAmount;
    const percentage = Math.min(Math.round((spentAmount / budget.amount) * 100), 100);
    const expenseFilter = { user: budget.user._id, date: { $gte: new Date(budget.startDate), $lte: endOfDay(budget.endDate) } };
    if (budget.category) expenseFilter.categories = budget.category._id;
    const relatedExpenses = await Expense.find(expenseFilter).populate('categories', 'name color').sort({ date: -1 });
    res.render('budgets/show', { title: budget.name, budget, spentAmount, remaining, percentage, relatedExpenses, user: req.user });
  } catch (err) {
    res.redirect('/budgets');
  }
};

// GET /budgets/:id/edit
exports.editForm = async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);
    if (!budget) return res.redirect('/budgets');
    if (!isAdmin(req.user) && budget.user.toString() !== req.user._id.toString()) {
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
    if (!isAdmin(req.user) && budget.user.toString() !== req.user._id.toString()) {
      return res.status(403).render('403', { title: 'Forbidden', user: req.user });
    }
    const { name, amount, period, startDate, endDate, category } = req.body;
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 1) throw new Error('Amount must be at least 1.');
    if (new Date(endDate) <= new Date(startDate)) throw new Error('End date must be after start date.');
    budget.name = name.trim();
    budget.amount = parsedAmount;
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
    if (!isAdmin(req.user) && budget.user.toString() !== req.user._id.toString()) {
      return res.status(403).render('403', { title: 'Forbidden', user: req.user });
    }
    await Budget.findByIdAndDelete(req.params.id);
    res.redirect('/budgets');
  } catch (err) {
    res.redirect('/budgets');
  }
};
