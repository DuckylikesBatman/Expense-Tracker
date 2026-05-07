const Expense = require('../models/Expense');

// Sets time to 23:59:59.999 so the end date is inclusive (expenses on that day are counted)
const endOfDay = (d) => { const dt = new Date(d); dt.setHours(23, 59, 59, 999); return dt; };

// Calculates the total amount spent by a user in a specific category within a date range
// Used by both budgetController and dashboardController to compute spending vs. budget limit
const getSpent = async (userId, categoryId, startDate, endDate) => {
  const expenses = await Expense.find({
    user: userId,
    categories: categoryId,   // matches expenses that include this category in their array
    date: { $gte: new Date(startDate), $lte: endOfDay(endDate) }
  });
  return expenses.reduce((sum, e) => sum + e.amount, 0);
};

module.exports = { endOfDay, getSpent };
