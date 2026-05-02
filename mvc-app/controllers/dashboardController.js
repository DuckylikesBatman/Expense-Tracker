const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Category = require('../models/Category');
const IncomeEntry = require('../models/IncomeEntry');
const { endOfDay, getSpent } = require('../utils/budgetUtils');

exports.index = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // This month's expenses
    const monthlyExpenses = await Expense.find({ user: userId, date: { $gte: startOfMonth } })
      .populate('categories', 'name color');
    const spentThisMonth = monthlyExpenses.reduce((s, e) => s + e.amount, 0);
    const expenseCountThisMonth = monthlyExpenses.length;

    // Extra income this month
    const extraIncomeEntries = await IncomeEntry.find({ user: userId, date: { $gte: startOfMonth } });
    const extraIncomeThisMonth = extraIncomeEntries.reduce((s, e) => s + e.amount, 0);

    // All-time total
    const allExpenses = await Expense.find({ user: userId });
    const totalAllTime = allExpenses.reduce((s, e) => s + e.amount, 0);

    // Recent 5 expenses
    const recentExpenses = await Expense.find({ user: userId })
      .populate('categories', 'name color')
      .sort({ date: -1 })
      .limit(5);

    // Budgets with spending
    const budgets = await Budget.find({ user: userId })
      .populate('category', 'name color')
      .sort({ createdAt: -1 });

    const budgetsWithSpending = await Promise.all(budgets.map(async (b) => {
      if (!b.category) return { budget: b, spentAmount: 0, percentage: 0, isOverBudget: false };
      const spentAmount = await getSpent(userId, b.category._id, b.startDate, b.endDate);
      const percentage = Math.min(Math.round((spentAmount / b.amount) * 100), 100);
      return { budget: b, spentAmount, percentage, isOverBudget: spentAmount > b.amount };
    }));

    const overBudgetCount = budgetsWithSpending.filter(b => b.isOverBudget).length;

    // Category breakdown this month
    const categoryTotals = {};
    monthlyExpenses.forEach(e => {
      e.categories.forEach(cat => {
        if (!categoryTotals[cat._id]) categoryTotals[cat._id] = { name: cat.name, color: cat.color, total: 0 };
        categoryTotals[cat._id].total += e.amount;
      });
    });
    const topCategories = Object.values(categoryTotals).sort((a, b) => b.total - a.total).slice(0, 5);

    res.render('dashboard/index', {
      title: 'Dashboard',
      user: req.user,
      spentThisMonth,
      expenseCountThisMonth,
      totalAllTime,
      recentExpenses,
      budgetsWithSpending,
      overBudgetCount,
      topCategories,
      startOfMonth,
      extraIncomeThisMonth
    });
  } catch (err) {
    res.render('dashboard/index', {
      title: 'Dashboard',
      user: req.user,
      spentThisMonth: 0,
      expenseCountThisMonth: 0,
      totalAllTime: 0,
      recentExpenses: [],
      budgetsWithSpending: [],
      overBudgetCount: 0,
      topCategories: [],
      startOfMonth: new Date(),
      extraIncomeThisMonth: 0,
      error: 'Could not load dashboard data.'
    });
  }
};
