const Expense = require('../models/Expense');
const Category = require('../models/Category');

// Helper: admins see all expenses; regular users only see their own
const isAdmin = (user) => ['admin', 'superadmin'].includes(user.role);

// GET /expenses — list expenses with optional search/category/date filters
exports.index = async (req, res) => {
  try {
    // Admins get an empty filter (all records); users get filtered to their own
    const filter = isAdmin(req.user) ? {} : { user: req.user._id };

    // Build MongoDB query from query string parameters
    const { search, category, dateFrom, dateTo } = req.query;
    if (search) filter.title = { $regex: search.trim(), $options: 'i' }; // case-insensitive search
    if (category) filter.categories = category; // match expenses that include this category ID
    if (dateFrom || dateTo) {
      filter.date = {};
      if (dateFrom) filter.date.$gte = new Date(dateFrom);
      // Set end of day so expenses on dateTo are included
      if (dateTo) filter.date.$lte = new Date(new Date(dateTo).setHours(23, 59, 59, 999));
    }

    const expenses = await Expense.find(filter)
      .populate('user', 'name email')         // replace user ObjectId with name+email
      .populate('categories', 'name color')   // replace category ObjectIds with name+color
      .sort({ date: -1 });                    // newest first
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    // Always show the current user's own monthly spend regardless of admin filter
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const myMonthly = await Expense.find({ user: req.user._id, date: { $gte: startOfMonth } });
    const spentThisMonth = myMonthly.reduce((sum, e) => sum + e.amount, 0);

    const categories = await Category.find().sort({ name: 1 });

    res.render('expenses/index', {
      title: 'Expenses', expenses, total, spentThisMonth, user: req.user, categories,
      filters: { search: search || '', category: category || '', dateFrom: dateFrom || '', dateTo: dateTo || '' },
      error: req.query.error || null
    });
  } catch (err) {
    res.render('expenses/index', { title: 'Expenses', expenses: [], total: 0, spentThisMonth: 0, user: req.user, categories: [], filters: {}, error: err.message });
  }
};

// GET /expenses/export — download all visible expenses as a CSV file
exports.exportCSV = async (req, res) => {
  try {
    const filter = isAdmin(req.user) ? {} : { user: req.user._id };
    const expenses = await Expense.find(filter)
      .populate('categories', 'name')
      .populate('user', 'name')
      .sort({ date: -1 });

    // Wrap each cell in quotes and escape any internal quotes to produce valid CSV
    const escape = (v) => `"${String(v || '').replace(/"/g, '""')}"`;
    const rows = [['Title', 'Amount ($)', 'Date', 'Categories', 'Description', 'Added By']];
    expenses.forEach(e => {
      rows.push([
        escape(e.title),
        escape(e.amount.toFixed(2)),
        escape(new Date(e.date).toLocaleDateString()),
        escape(e.categories.map(c => c.name).join('; ')),
        escape(e.description || ''),
        escape(e.user.name)
      ]);
    });

    const csv = rows.map(r => r.join(',')).join('\n');
    // Tell the browser this is a downloadable file, not a page to render
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="expenses-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (err) {
    res.redirect('/expenses?error=' + encodeURIComponent('Export failed. Please try again.'));
  }
};

// GET /expenses/new — show the create form, pre-loaded with all categories
exports.newForm = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.render('expenses/new', { title: 'Add Expense', categories, user: req.user, error: null });
  } catch (err) {
    res.redirect('/expenses');
  }
};

// POST /expenses — create a new expense and associate it with the logged-in user
exports.create = async (req, res) => {
  try {
    const { title, amount, date, description, categories } = req.body;
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) throw new Error('Amount must be a valid positive number.');
    // categories from a multi-select can be a string (1 selected) or array (multiple) — normalize to array
    const cats = categories ? (Array.isArray(categories) ? categories : [categories]) : [];
    await Expense.create({
      title: title.trim(),
      amount: parsedAmount,
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

// GET /expenses/:id — show a single expense; blocks non-owners (unless admin)
exports.show = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id)
      .populate('user', 'name email')
      .populate('categories', 'name color description');
    if (!expense) return res.redirect('/expenses');
    // Ownership check: compare ObjectIds as strings (MongoDB ObjectId !== plain string)
    if (!isAdmin(req.user) && expense.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).render('403', { title: 'Forbidden', user: req.user });
    }
    res.render('expenses/show', { title: expense.title, expense, user: req.user });
  } catch (err) {
    res.redirect('/expenses');
  }
};

// GET /expenses/:id/edit — show the edit form; only owner or admin can access
exports.editForm = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate('categories');
    if (!expense) return res.redirect('/expenses');
    if (!isAdmin(req.user) && expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).render('403', { title: 'Forbidden', user: req.user });
    }
    const categories = await Category.find().sort({ name: 1 });
    res.render('expenses/edit', { title: 'Edit Expense', expense, categories, user: req.user, error: null });
  } catch (err) {
    res.redirect('/expenses');
  }
};

// PUT /expenses/:id — save updated fields; re-renders form with error on validation failure
exports.update = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.redirect('/expenses');
    if (!isAdmin(req.user) && expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).render('403', { title: 'Forbidden', user: req.user });
    }
    const { title, amount, date, description, categories } = req.body;
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) throw new Error('Amount must be a valid positive number.');
    const cats = categories ? (Array.isArray(categories) ? categories : [categories]) : [];
    expense.title = title.trim();
    expense.amount = parsedAmount;
    expense.date = date;
    expense.description = description ? description.trim() : '';
    expense.categories = cats;
    await expense.save(); // triggers Mongoose validators before writing to DB
    res.redirect(`/expenses/${expense._id}`);
  } catch (err) {
    const expense = await Expense.findById(req.params.id).populate('categories');
    const categories = await Category.find().sort({ name: 1 });
    res.render('expenses/edit', { title: 'Edit Expense', expense, categories, user: req.user, error: err.message });
  }
};

// DELETE /expenses/:id — only owner or admin can delete
exports.destroy = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.redirect('/expenses');
    if (!isAdmin(req.user) && expense.user.toString() !== req.user._id.toString()) {
      return res.status(403).render('403', { title: 'Forbidden', user: req.user });
    }
    await Expense.findByIdAndDelete(req.params.id);
    res.redirect('/expenses');
  } catch (err) {
    res.redirect('/expenses');
  }
};
