// Connects to MongoDB using the URI from .env; crashes the process on failure so the app never runs without a DB
const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    // Exit with code 1 (error) so the process manager knows the app failed to start
    process.exit(1);
  }
}

module.exports = connectDB;
