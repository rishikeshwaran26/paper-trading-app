'use strict';

const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Health check ---
app.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// --- API Routes ---
app.use('/api', routes);

// --- 404 Handler ---
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { message: `Route ${req.method} ${req.originalUrl} not found`, code: 'NOT_FOUND' }
  });
});

// --- Error Handler (must be last) ---
app.use(errorHandler);

module.exports = app;
