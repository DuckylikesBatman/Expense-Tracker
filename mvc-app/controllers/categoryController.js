const Category = require('../models/Category');
const Expense = require('../models/Expense');

// GET /categories
exports.index = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('createdBy', 'name')
      .sort({ name: 1 });
    res.render('categories/index', { title: 'Categories', categories, user: req.user });
  } catch (err) {
    res.render('categories/index', { title: 'Categories', categories: [], user: req.user, error: err.message });
  }
};

// GET /categories/new  (admin only)
exports.newForm = (req, res) => {
  res.render('categories/new', { title: 'New Category', user: req.user, error: null });
};

// POST /categories  (admin only)
exports.create = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    await Category.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      color: color || '#a855f7',
      createdBy: req.user._id
    });
    res.redirect('/categories');
  } catch (err) {
    const msg = err.code === 11000 ? 'A category with that name already exists.' : err.message;
    res.render('categories/new', { title: 'New Category', user: req.user, error: msg });
  }
};

// GET /categories/:id
exports.show = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate('createdBy', 'name');
    if (!category) return res.redirect('/categories');
    // Expenses that include this category
    const expenses = await Expense.find({ categories: category._id })
      .populate('user', 'name')
      .sort({ date: -1 });
    res.render('categories/show', { title: category.name, category, expenses, user: req.user });
  } catch (err) {
    res.redirect('/categories');
  }
};

// GET /categories/:id/edit  (admin only)
exports.editForm = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.redirect('/categories');
    res.render('categories/edit', { title: 'Edit Category', category, user: req.user, error: null });
  } catch (err) {
    res.redirect('/categories');
  }
};

// PUT /categories/:id  (admin only)
exports.update = async (req, res) => {
  try {
    const { name, description, color } = req.body;
    await Category.findByIdAndUpdate(req.params.id, {
      name: name.trim(),
      description: description ? description.trim() : '',
      color: color || '#a855f7'
    }, { runValidators: true });
    res.redirect('/categories');
  } catch (err) {
    const category = await Category.findById(req.params.id);
    const msg = err.code === 11000 ? 'A category with that name already exists.' : err.message;
    res.render('categories/edit', { title: 'Edit Category', category, user: req.user, error: msg });
  }
};

// DELETE /categories/:id  (admin only)
exports.destroy = async (req, res) => {
  try {
    // Remove this category reference from all expenses
    await Expense.updateMany(
      { categories: req.params.id },
      { $pull: { categories: req.params.id } }
    );
    await Category.findByIdAndDelete(req.params.id);
    res.redirect('/categories');
  } catch (err) {
    res.redirect('/categories');
  }
};
