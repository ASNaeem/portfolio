const express = require('express');
const cors = require('cors');
const path = require('path');
const portfolioRouter = require('./routes/portfolio');

const app = express();

app.use(cors());

// Redirect HTTP to HTTPS in production (Render handles SSL termination)
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(301, `https://${req.hostname}${req.originalUrl}`);
  }
  next();
});

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static assets from public/ folder
app.use(express.static(path.join(__dirname, '../public')));

// Route to serve the raw resume.md file directly
app.get('/resume.md', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/resume.md'));
});

// Mount routes at root level (matching the original MySQL API paths)
app.use('/', portfolioRouter);

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

module.exports = app;
