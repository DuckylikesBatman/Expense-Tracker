const Expense = require('../models/Expense');

const endOfDay = (d) => { const dt = new Date(d); dt.setHours(23, 59, 59, 999); return dt; };

const getSpent = async (userId, categoryId, startDate, endDate) => {
  const expenses = await Expense.find({
    user: userId,
    categories: categoryId,
    date: { $gte: new Date(startDate), $lte: endOfDay(endDate) }
  });
  return expenses.reduce((sum, e) => sum + e.amount, 0);
};

module.exports = { endOfDay, getSpent };
