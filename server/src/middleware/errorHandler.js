'use strict';

// Global Express error handler — last middleware in the chain.
// Catches all errors and returns a consistent JSON response.

const errorHandler = (err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = err.message || 'An unexpected error occurred';

  // Log server errors
  if (statusCode === 500) {
    console.error(`[ERROR] ${err.stack || err.message}`);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code
    }
  });
};

module.exports = errorHandler;
