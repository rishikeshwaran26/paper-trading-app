'use strict';

// Wraps async route handlers to catch promise rejections
// and forward them to the Express error handler

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
