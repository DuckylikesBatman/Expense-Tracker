const mongoose = require('mongoose');

// Categories are shared app-wide (not per-user) and can only be created/edited by admins
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true, // enforced at DB level — duplicate names throw error code 11000
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  // Hex color code used to color-code category badges and charts in the UI
  color: {
    type: String,
    default: '#a855f7'
  },
  // Tracks which admin created this category (one-to-many with User)
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
