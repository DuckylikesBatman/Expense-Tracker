// Entry point: loads env variables, connects to MongoDB, then starts the HTTP server
require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

// Only start listening after DB is connected — avoids requests hitting an unready app
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
