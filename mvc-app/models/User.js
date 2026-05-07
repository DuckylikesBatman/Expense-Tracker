const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User is the central entity — Expenses, Budgets, Categories, and IncomeEntries all reference it
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,        // MongoDB creates a unique index on this field
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
    // Stored as a bcrypt hash, never plain text
  },
  role: {
    type: String,
    enum: ['superadmin', 'admin', 'user'],  // only these 3 values are valid
    default: 'user'
  },
  monthlyIncome: {
    type: Number,
    default: 0,
    min: [0, 'Income cannot be negative']
  }
}, { timestamps: true }); // timestamps adds createdAt and updatedAt automatically

// Pre-save hook: runs before every .save() — hashes the password only if it was changed
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next(); // skip hashing if password unchanged
  this.password = await bcrypt.hash(this.password, 12); // 12 = salt rounds (higher = slower = more secure)
  next();
});

// Instance method: compares a plain-text password against the stored hash at login time
userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);
