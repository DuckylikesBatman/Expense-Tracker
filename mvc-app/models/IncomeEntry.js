const mongoose = require('mongoose');

// Tracks individual income events separate from the fixed monthlyIncome on the User model
// Example: a bonus or freelance payment that doesn't happen every month
const incomeEntrySchema = new mongoose.Schema({
  // One-to-many: each entry belongs to one user
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  // Predefined source categories; 'other' is the fallback for anything not in the list
  source: {
    type: String,
    enum: ['salary', 'freelance', 'side-job', 'bonus', 'investment', 'gift', 'winnings', 'other'],
    default: 'other'
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('IncomeEntry', incomeEntrySchema);
