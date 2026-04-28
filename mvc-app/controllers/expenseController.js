const Expense = require('../models/Expense');
const Category = require('../models/Category');

// GET /expenses
exports.index = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { user: req.user._id };
    const expenses = await Expense.find(filter)
      .populate('user', 'name email')
      .populate('categories', 'name color')
      .sort({ date: -1 });
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const myMonthly = await Expense.find({ user: req.user._id, date: { $gte: startOfMonth } });
    const spentThisMonth = myMonthly.reduce((sum, e) => sum + e.amount, 0);

    res.render('expenses/index', { title: 'Expenses', expenses, total, spentThisMonth, user: req.user });
  } catch (err) {
    res.render('expenses/index', { title: 'Expenses', expenses: [], total: 0, spentThisMonth: 0, user: req.user, error: err.message });
  }
};

// GET /expenses/new
exports.newForm = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.render('expenses/new', { title: 'Add Expense', categories, user: req.user, error: null });
  } catch (err) {
    res.redirect('/expenses');
  }
};

// POST /expenses
exports.create = async (req, res) => {
  try {
    const { title, amount, date, description, categories } = req.body;
    const cats = categories ? (Array.isArray(categories) ? categories : [categories]) : [];
    await Expense.create({
      title: title.trim(),
      amount: parseFloat(amount),
      date: date || Date.now(),
      description: description ? description.trim() : '',
      user: req.user._id,
      categories: cats
    });
    res.redirect('/expenses');
  } catch (err) {
    const categories = await Category.find().sort({ name: 1 });
    res.render('expenses/new', { title: 'Add Expense', categories, user: req.user, error: err.message });
  }
};

// GET /expenses/:id
exports.show = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('user', 'name email')
      .populate('categories', 'name color description');
    if (!expense) return res.redirect('/expenses');
    if (req.user.role !== 'admin' && expense.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).render('403', { title: 'Forbidden', user: req.user });
    }
    res.render('expenses/show', { title: expense.title, expense, user: req.user });
  } catch (err) {
    res.redirect('/expenses');
  }
};

// GET /expenses/:id/edit
exports.editForm = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate('categories');
    if (!expense) return res.redirect('/expenses');
    if (req.user.role !== 'admin' && expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).render('403', { title: 'Forbidden', user: req.user });
    }
    const categories = await Category.find().sort({ name: 1 });
    res.render('expenses/edit', { title: 'Edit Expense', expense, categories, user: req.user, error: null });
  } catch (err) {
    res.redirect('/expenses');
  }
};

// PUT /expenses/:id
exports.update = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.redirect('/expenses');
    if (req.user.role !== 'admin' && expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).render('403', { title: 'Forbidden', user: req.user });
    }
    const { title, amount, date, description, categories } = req.body;
    const cats = categories ? (Array.isArray(categories) ? categories : [categories]) : [];
    expense.title = title.trim();
    expense.amount = parseFloat(amount);
    expense.date = date;
    expense.description = description ? description.trim() : '';
    expense.categories = cats;
    await expense.save();
    res.redirect(`/expenses/${expense._id}`);
  } catch (err) {
    const expense = await Expense.findById(req.params.id).populate('categories');
    const categories = await Category.find().sort({ name: 1 });
    res.render('expenses/edit', { title: 'Edit Expense', expense, categories, user: req.user, error: err.message });
  }
};

// DELETE /expenses/:id
exports.destroy = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.redirect('/expenses');
    if (req.user.role !== 'admin' && expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).render('403', { title: 'Forbidden', user: req.user });
    }
    await Expense.findByIdAndDelete(req.params.id);
    res.redirect('/expenses');
  } catch (err) {
    res.redirect('/expenses');
  }
};
