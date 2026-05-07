const mongoose = require('mongoose');

// A budget sets a spending limit for a specific category within a date range
const budgetSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Budget name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Budget amount is required'],
    min: [1, 'Amount must be at least 1']
  },
  period: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly'], // descriptive label only; date range enforces the real window
    default: 'monthly'
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  // One-to-many: each budget belongs to one user
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // One-to-one: each budget tracks one category's spending
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  }
}, { timestamps: true });

// Virtual property — computed at runtime, not stored in DB
// Returns true if the budget's end date has already passed
budgetSchema.virtual('isExpired').get(function () {
  return this.endDate < new Date();
});

module.exports = mongoose.model('Budget', budgetSchema);
