require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to NgheTinNhanh API' });
});

// API routes
app.get('/api/news', (req, res) => {
  // TODO: Implement news fetching logic
  res.json({ news: [] });
});

// Error handling middleware

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});